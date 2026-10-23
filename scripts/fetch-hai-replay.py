"""Fetch the pinned official HAI 20.07 test1 recording for a hosted replay image.

The compressed recording stays in the image; it is not committed to this repository.
"""

import hashlib
import sys
from pathlib import Path
from urllib.request import Request, urlopen

URL = (
    "https://raw.githubusercontent.com/icsdataset/hai/"
    "2a814cebc9a66b06c9e5cd545e2d72e65d383737/hai-20.07/test1.csv.gz"
)
SHA256 = "68cc18af44efcd756e9eaaa81790855836e8aee3f2ce9c4d9dd95a0ada36c2e4"
SIZE = 32_813_703


def fetch(destination: Path) -> Path:
    destination.mkdir(parents=True, exist_ok=True)
    target = destination / "test1.csv.gz"
    if (
        target.is_file()
        and target.stat().st_size == SIZE
        and hashlib.sha256(target.read_bytes()).hexdigest() == SHA256
    ):
        return target
    partial = destination / "test1.csv.gz.part"
    digest = hashlib.sha256()
    size = 0
    with (
        urlopen(Request(URL, headers={"User-Agent": "AttackTrace-replay-image"}), timeout=180) as response,
        partial.open("wb") as output,
    ):
        while block := response.read(1024 * 1024):
            output.write(block)
            digest.update(block)
            size += len(block)
    if size != SIZE or digest.hexdigest() != SHA256:
        partial.unlink(missing_ok=True)
        raise ValueError("Official HAI recording failed size or SHA-256 verification")
    partial.replace(target)
    return target


if __name__ == "__main__":
    print(f"Verified HAI replay: {fetch(Path(sys.argv[1]))}", flush=True)
