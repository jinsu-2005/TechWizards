"""Consistent SQLite journal backup, including committed WAL records; never overwrite."""

import argparse
import json
import sqlite3
from contextlib import closing
from pathlib import Path


def backup(source: Path, output: Path) -> dict[str, int]:
    source, output = source.resolve(strict=True), output.resolve()
    if source == output:
        raise ValueError("Backup must be a separate file")
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("xb"):
        pass
    output.chmod(0o600)
    with (
        closing(sqlite3.connect(source.as_uri() + "?mode=ro", uri=True)) as src,
        closing(sqlite3.connect(output)) as dst,
    ):
        src.backup(dst)
        if dst.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
            raise ValueError("Backup integrity check failed")
        return {
            table: dst.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
            for table in ("soc_incidents", "evidence", "incident_captures")
        }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    print(json.dumps(backup(args.source, args.output), indent=2))
