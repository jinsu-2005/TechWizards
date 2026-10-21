"""Install official HAI 20.07 files, verifying Git blob identity and gzip/CSV structure.

Run with any Python 3.11+ interpreter. Training remains a separate backend task.
"""

import gzip
import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen

API = "https://api.github.com/repos/icsdataset/hai"
DEST = Path(__file__).resolve().parents[1] / "data" / "hai"
FILES = {"train1.csv.gz", "train2.csv.gz", "test1.csv.gz", "test2.csv.gz"}


def get_json(url: str):
    with urlopen(Request(url, headers={"User-Agent": "AttackTrace-HAI-installer"}), timeout=60) as r:
        return json.load(r)


def main() -> None:
    commit = get_json(f"{API}/commits/master")["sha"]
    listing = get_json(f"{API}/contents/hai-20.07?ref={commit}")
    files = [entry for entry in listing if entry["name"] in FILES]
    if {entry["name"] for entry in files} != FILES:
        raise ValueError("Official HAI 20.07 listing is incomplete")
    DEST.mkdir(parents=True, exist_ok=True)
    manifest = []
    for entry in files:
        path = DEST / entry["name"]
        url = f"https://raw.githubusercontent.com/icsdataset/hai/{commit}/hai-20.07/{path.name}"
        if not path.exists() or path.stat().st_size != entry["size"]:
            print(f"Downloading {path.name}", flush=True)
            part = path.with_suffix(path.suffix + ".part")
            with urlopen(url, timeout=120) as response, part.open("wb") as target:
                while block := response.read(1024 * 1024):
                    target.write(block)
            candidate = part
        else:
            candidate = path
        raw = candidate.read_bytes()
        blob = hashlib.sha1(f"blob {len(raw)}\0".encode() + raw).hexdigest()
        if len(raw) != entry["size"] or blob != entry["sha"]:
            raise ValueError(f"Official Git blob verification failed: {path.name}")
        with gzip.open(candidate, "rt", encoding="utf-8") as stream:
            header = stream.readline().strip().split(";")
            if "attack" not in header or "time" not in header:
                raise ValueError(f"Unexpected HAI CSV header: {path.name}")
            rows = sum(1 for _ in stream)  # reads gzip to its end, validating CRC too
        if candidate != path:
            candidate.replace(path)
        manifest.append({"file": path.name, "bytes": len(raw), "rows": rows,
                         "sha256": hashlib.sha256(raw).hexdigest(), "git_blob": blob, "url": url})
        print(f"Verified {path.name}: {rows:,} rows", flush=True)
    part = DEST / "manifest.json.part"
    part.write_text(json.dumps({"dataset": "HAI 20.07", "commit": commit,
                               "source": "https://github.com/icsdataset/hai", "files": manifest},
                              indent=2), encoding="utf-8")
    part.replace(DEST / "manifest.json")
    print("HAI installed. Restart the backend after training to enable replay.")


if __name__ == "__main__":
    main()
