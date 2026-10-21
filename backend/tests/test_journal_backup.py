import runpy
import sqlite3
from contextlib import closing
from pathlib import Path

import pytest

backup = runpy.run_path(str(Path(__file__).resolve().parents[2] / "scripts/backup-journal.py"))[
    "backup"
]


def test_backup_includes_committed_wal_and_closes_output(tmp_path):
    source, target = tmp_path / "live.sqlite", tmp_path / "backup.sqlite"
    with closing(sqlite3.connect(source)) as writer:
        writer.execute("PRAGMA journal_mode=WAL")
        for table in ("soc_incidents", "evidence", "incident_captures"):
            writer.execute(f"CREATE TABLE {table}(id INTEGER)")
            writer.execute(f"INSERT INTO {table} VALUES(1)")
        writer.commit()
        assert Path(str(source) + "-wal").exists()
        assert backup(source, target) == {"soc_incidents": 1, "evidence": 1, "incident_captures": 1}
        writer.execute("INSERT INTO evidence VALUES(2)")
        writer.commit()
        with closing(sqlite3.connect(target)) as restored:
            assert restored.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
            assert restored.execute("SELECT count(*) FROM evidence").fetchone()[0] == 1
        # Windows refuses this if the backup function leaves its connection open.
        target.rename(tmp_path / "closed-backup.sqlite")


def test_backup_refuses_to_replace_existing_data(tmp_path):
    source, target = tmp_path / "live.sqlite", tmp_path / "existing.sqlite"
    source.touch()
    target.write_bytes(b"preserve-existing-backup")
    with pytest.raises(FileExistsError):
        backup(source, target)
    assert target.read_bytes() == b"preserve-existing-backup"
    with pytest.raises(ValueError, match="separate"):
        backup(source, source)
