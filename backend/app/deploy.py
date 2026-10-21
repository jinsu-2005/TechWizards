"""Fail-closed Render entrypoint. Uses one ingestion worker and an attached persistent disk."""

import os
import shutil
import sys
import tempfile
from pathlib import Path
from urllib.parse import urlsplit

from app.config import Settings, get_settings


class DeploymentError(ValueError):
    """Operator-safe configuration messages; never populated from provider exceptions."""


def validate(settings: Settings, root: Path) -> None:
    if not settings.auth_enabled or not settings.auth_cookie_secure or settings.demo_mode:
        raise DeploymentError(
            "Cloud deployment requires authentication, Secure cookies and demo mode off"
        )
    if not settings.firebase_project_id or os.environ.get("FIREBASE_AUTH_EMULATOR_HOST"):
        raise DeploymentError("Configure a real Firebase project without the Auth emulator")
    if len(settings.gateway_secret.get_secret_value()) < 32:
        raise DeploymentError("AT_GATEWAY_SECRET must contain at least 32 random characters")
    if not settings.auth_members or "admin" not in settings.auth_members.values():
        raise DeploymentError("Configure approved workspace members including an administrator")
    if any(role not in {"admin", "analyst", "viewer"} for role in settings.auth_members.values()):
        raise DeploymentError("Invalid workspace membership role")
    if len(settings.cors_origins) != 1:
        raise DeploymentError("Configure exactly one public application origin")
    origin = settings.cors_origins[0]
    url = urlsplit(origin)
    if (
        url.scheme != "https"
        or not url.hostname
        or url.username
        or url.password
        or url.path
        or url.query
        or url.fragment
        or url.hostname in {"localhost", "127.0.0.1", "::1"}
        or url.hostname.endswith((".example.com", ".invalid"))
    ):
        raise DeploymentError(
            "AT_CORS_ORIGINS requires the final HTTPS origin, without a trailing slash"
        )
    root = root.resolve()
    for target in (
        settings.soc_db,
        settings.live_db,
        settings.models_dir,
        settings.reports_dir,
        settings.hai_dir,
    ):
        resolved = target.resolve()
        if resolved == root or not resolved.is_relative_to(root):
            raise DeploymentError(
                "Journal, LIVE data, models, HAI and reports must be inside the data disk"
            )


def prepare_storage(settings: Settings, root: Path, seed_models: Path) -> None:
    """Never overwrite retained models or an existing journal during redeployment."""
    root = root.resolve()
    if not root.is_dir() or not os.path.ismount(root):
        raise DeploymentError("AT_DEPLOY_DATA_ROOT must be an attached persistent disk mount")
    with tempfile.TemporaryFile(dir=root):
        pass  # Confirms the runtime user can write to the volume.
    for path in (
        settings.soc_db.parent,
        settings.live_db.parent,
        settings.models_dir,
        settings.reports_dir,
        settings.hai_dir,
        root / "backups",
    ):
        path.mkdir(parents=True, exist_ok=True)
    if not any(settings.models_dir.iterdir()) and seed_models.is_dir():
        shutil.copytree(seed_models, settings.models_dir, dirs_exist_ok=True)


def check_identity(project: str) -> None:
    import firebase_admin
    from firebase_admin import auth

    app = firebase_admin.initialize_app(options={"projectId": project, "httpTimeout": 10})
    try:
        auth.list_users(max_results=1, app=app)  # Forces a read; prints no user data or tokens.
    finally:
        firebase_admin.delete_app(app)


def main() -> int:
    try:
        settings = get_settings()
        root = Path(os.environ.get("AT_DEPLOY_DATA_ROOT", "/var/data"))
        validate(settings, root)
        port = int(os.environ.get("PORT", "10000"))
        if not 1 <= port <= 65535:
            raise DeploymentError("PORT is invalid")
        check_identity(settings.firebase_project_id)
        prepare_storage(settings, root, Path("/app/models"))
    except DeploymentError as exc:
        print(f"Deployment preflight failed: {exc}", file=sys.stderr)
        return 2
    except Exception as exc:
        print(
            f"Deployment preflight failed ({type(exc).__name__}). "
            "Check workload identity/IAM and disk permissions; no credentials were logged.",
            file=sys.stderr,
        )
        return 2
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=port, workers=1, proxy_headers=False)
    return 0


if __name__ == "__main__":
    sys.exit(main())
