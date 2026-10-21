from pathlib import Path

import pytest

from app.config import Settings
from app.deploy import prepare_storage, validate


def configured(root: Path, **changes):
    return Settings(
        **{
            "auth_enabled": True,
            "auth_cookie_secure": True,
            "demo_mode": False,
            "firebase_project_id": "test-project",
            "gateway_secret": "a" * 40,
            "auth_members": {"admin@test.invalid": "admin"},
            "cors_origins": ["https://attacktrace-console.myaccount.workers.dev"],
            "soc_db": root / "journal/journal.sqlite",
            "live_db": root / "live/live.sqlite",
            "models_dir": root / "models",
            "reports_dir": root / "reports",
            "hai_dir": root / "hai",
            **changes,
        }
    )


@pytest.mark.parametrize(
    "changes",
    [
        {"auth_enabled": False},
        {"auth_cookie_secure": False},
        {"demo_mode": True},
        {"gateway_secret": "short"},
        {"auth_members": {}},
        {"auth_members": {"x@test.invalid": "owner"}},
        {"cors_origins": ["http://localhost:5173"]},
        {"cors_origins": ["https://attacktrace.example.com"]},
        {"cors_origins": ["https://app.workers.dev/"]},
        {"cors_origins": ["https://app.workers.dev", "https://other.workers.dev"]},
        {"soc_db": Path("/outside/journal.sqlite")},
    ],
)
def test_unsafe_deployment_configuration_rejected(tmp_path, changes):
    with pytest.raises(ValueError):
        validate(configured(tmp_path, **changes), tmp_path)


def test_storage_requires_mount_and_preserves_journal_and_models(tmp_path, monkeypatch):
    root = tmp_path / "disk"
    root.mkdir()
    seed = tmp_path / "seed"
    seed.mkdir()
    (seed / "detector.json").write_text("seed-model")
    settings = configured(root)
    validate(settings, root)
    monkeypatch.setattr("app.deploy.os.path.ismount", lambda _: False)
    with pytest.raises(ValueError, match="persistent disk"):
        prepare_storage(settings, root, seed)
    monkeypatch.setattr("app.deploy.os.path.ismount", lambda _: True)
    prepare_storage(settings, root, seed)
    assert (settings.models_dir / "detector.json").read_text() == "seed-model"
    (settings.models_dir / "detector.json").write_text("calibrated-model")
    settings.soc_db.write_bytes(b"retained-journal")
    prepare_storage(settings, root, seed)
    assert (settings.models_dir / "detector.json").read_text() == "calibrated-model"
    assert settings.soc_db.read_bytes() == b"retained-journal"
    assert (root / "backups").is_dir()


def test_private_entrypoint_rejects_unsigned_emulator(tmp_path, monkeypatch):
    monkeypatch.setenv("FIREBASE_AUTH_EMULATOR_HOST", "127.0.0.1:9099")
    with pytest.raises(ValueError, match="real Firebase"):
        validate(configured(tmp_path), tmp_path)
