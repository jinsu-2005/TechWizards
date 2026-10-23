"""HAI ICS dataset loader (HAI 20.07 layout: `;`-separated CSV, 1 Hz, `attack*` label columns).

Files are read from `AT_HAI_DIR`: `train*.csv[.gz]` are clean, `test*.csv[.gz]` carry labels.
Nothing here assumes more than that layout; a missing folder simply means "no HAI".
"""

import re
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from numpy.typing import NDArray

F64 = NDArray[np.float64]

LABELS = ("attack", "attack_P1", "attack_P2", "attack_P3")
PROCESSES = ("P1", "P2", "P3", "P4")
SAMPLE_HZ = 1.0
RECOVERY_S = 60  # post-attack samples excluded from scoring, as for SIM


def hai_paths(hai_dir: Path) -> list[Path]:
    """CSV files the user placed in the data folder (none = HAI mode unavailable)."""
    if not hai_dir.is_dir():
        return []
    return sorted([*hai_dir.glob("*.csv"), *hai_dir.glob("*.csv.gz")])


@dataclass(frozen=True)
class HaiFile:
    name: str
    x: F64  # (T, N) raw values, columns follow HaiData.features
    attack: NDArray[np.int8]  # (T,) any attack active
    by_process: NDArray[np.int8]  # (T, 3) attack flags for P1..P3 (zeros in clean files)

    def labels(self) -> NDArray[np.int8]:
        """1 = attack active, 0 = normal, -1 = ignored (recovery after an attack)."""
        y = self.attack.astype(np.int8).copy()
        ends = np.flatnonzero((self.attack[:-1] == 1) & (self.attack[1:] == 0)) + 1
        for e in ends:
            seg = y[e : e + RECOVERY_S]
            seg[seg == 0] = -1
        return y

    def windows(self) -> list[tuple[int, int]]:
        """(start, end) sample ranges of each attack."""
        edge = np.flatnonzero(np.diff(np.r_[0, self.attack, 0]))
        return [(int(s), int(e)) for s, e in zip(edge[::2], edge[1::2], strict=True)]


@dataclass(frozen=True)
class HaiData:
    features: list[str]
    train: list[HaiFile]
    tests: list[HaiFile]

    @property
    def train_x(self) -> F64:
        return np.vstack([f.x for f in self.train])


READ_ATTEMPTS = 4


import gc


def _read_csv(path: Path, features: list[str] | None = None) -> pd.DataFrame:
    """read_csv with retries: a 35 MB gzip read through a Docker Desktop bind mount once failed
    with OSError 14 (Bad address) and succeeded on the next attempt."""
    selected = set(features) | set(LABELS) if features is not None else None
    dtypes: dict[str, Any] | None = None
    if features is not None:
        dtypes = {col: np.float32 for col in features}
        for lbl in LABELS:
            dtypes[lbl] = np.int8
    for attempt in range(1, READ_ATTEMPTS + 1):
        try:
            if features is not None:
                # Chunked reading to avoid memory spike on 512MB RAM environments
                chunks = []
                for chunk in pd.read_csv(
                    path,
                    sep=";",
                    usecols=selected.__contains__ if selected else None,
                    dtype=dtypes,
                    chunksize=50_000,
                ):
                    chunks.append(chunk)
                return pd.concat(chunks, ignore_index=True)
            return pd.read_csv(
                path, sep=";", usecols=selected.__contains__ if selected else None
            )
        except OSError:
            if attempt == READ_ATTEMPTS:
                raise
            time.sleep(attempt)  # 1 s, 2 s, 3 s
    raise AssertionError("unreachable")


def _read(path: Path, features: list[str] | None) -> tuple[list[str], HaiFile]:
    df = _read_csv(path, features)
    cols = features or [c for c in df.columns if c != "time" and c not in LABELS]
    attack = df["attack"].to_numpy(np.int8) if "attack" in df else np.zeros(len(df), np.int8)
    flags = [df[c].to_numpy(np.int8) if c in df else np.zeros(len(df), np.int8) for c in LABELS[1:]]
    name = path.name.removesuffix(".gz").removesuffix(".csv")
    x = df[cols].to_numpy(np.float64)
    del df
    gc.collect()
    return cols, HaiFile(name, x, attack, np.stack(flags, axis=1))


def load_hai_replay(hai_dir: Path, file_name: str, features: tuple[str, ...]) -> HaiFile:
    """Load only the requested recording when a compatible trained model already exists.

    Hosted replay needs no training recordings in memory. Model feature order is preserved.
    """
    recording = next(
        (p for p in hai_paths(hai_dir) if p.name in {f"{file_name}.csv", f"{file_name}.csv.gz"}),
        None,
    )
    if recording is None:
        raise FileNotFoundError(f"HAI recording {file_name} is missing from {hai_dir}")
    _, replay = _read(recording, list(features))
    return replay


def load_hai(hai_dir: Path) -> HaiData:
    """Load every train*/test* file; drops columns that are constant in training (they carry no
    signal and cannot be normalized)."""
    paths = hai_paths(hai_dir)
    train_paths = [p for p in paths if p.name.startswith("train")]
    test_paths = [p for p in paths if p.name.startswith("test")]
    if not train_paths:
        raise FileNotFoundError(f"no train*.csv[.gz] in {hai_dir}")
    cols, first = _read(train_paths[0], None)
    train = [first, *(_read(p, cols)[1] for p in train_paths[1:])]
    keep = np.vstack([f.x for f in train]).std(axis=0) > 0
    features = [c for c, k in zip(cols, keep, strict=True) if k]
    train = [HaiFile(f.name, f.x[:, keep], f.attack, f.by_process) for f in train]
    tests = []
    for p in test_paths:
        _, f = _read(p, cols)
        tests.append(HaiFile(f.name, f.x[:, keep], f.attack, f.by_process))
    return HaiData(features, train, tests)


def process_of(column: str) -> str:
    """P1..P4 from the column prefix."""
    m = re.match(r"(P\d)_", column)
    return m.group(1) if m else "P1"


_CONTROLLER = re.compile(r"^P\d_B\d{4}")  # *_Bxxxx: controller set-points
_ACTUATOR = re.compile(r"(FCV|LCV|PCV|LCP|TripEx|Emgy|Auto|On|SD01)", re.I)


def node_kind(column: str) -> str:
    """Heuristic node type from HAI's tag naming: B-tags are controller set-points, valves and
    pumps (FCV/LCV/PCV/LCP) actuators, everything else a sensor/transmitter."""
    if _CONTROLLER.match(column):
        return "controller"
    return "actuator" if _ACTUATOR.search(column) else "sensor"
