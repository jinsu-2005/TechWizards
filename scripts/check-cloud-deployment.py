"""Read-only anonymous checks of a deployed gateway and origin; run with backend Python.

Does not sign in, send tokens, publish resources or modify server data.
"""

import argparse
import asyncio
import json
import sys
from urllib.error import HTTPError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def origin(value: str) -> str:
    parsed = urlsplit(value)
    if (
        parsed.scheme != "https"
        or not parsed.hostname
        or parsed.path
        or parsed.query
        or parsed.fragment
        or parsed.username
        or parsed.password
    ):
        raise argparse.ArgumentTypeError("Provide an HTTPS origin without a path or trailing slash")
    return value


def read(url: str):
    request = Request(url, headers={"User-Agent": "AttackTrace-deployment-check/1"})
    try:
        response = build_opener(NoRedirect()).open(request, timeout=20)
    except HTTPError as exc:
        response = exc
    with response:
        return response.code, response.headers, response.read(1024 * 1024)


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


async def anonymous_stream_denied(public: str) -> None:
    from websockets.asyncio.client import connect
    from websockets.exceptions import InvalidStatus

    url = "wss://" + urlsplit(public).netloc + "/ws/live"
    try:
        async with connect(url, origin=public, open_timeout=20):
            raise AssertionError("Anonymous telemetry connection was accepted")
    except InvalidStatus as exc:
        if exc.response.status_code != 403:
            raise AssertionError("Stream did not return the expected anonymous denial") from None


async def public_streams_available(public: str) -> None:
    from websockets.asyncio.client import connect

    base = "wss://" + urlsplit(public).netloc
    for path in ("/ws/live", "/ws/voice"):
        async with connect(base + path, origin=public, open_timeout=20):
            pass


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--public-origin", required=True, type=origin)
    parser.add_argument("--backend-origin", required=True, type=origin)
    parser.add_argument("--project", default="attacktrace-private-20261016")
    parser.add_argument(
        "--public-demo", action="store_true",
        help="Check the intentionally unauthenticated public demo instead of private access",
    )
    args = parser.parse_args()
    try:
        status, headers, body = read(args.public_origin + "/")
        require(status == 200 and b"<html" in body.lower(), "Frontend failed")
        require(
            "frame-ancestors 'none'" in headers.get("Content-Security-Policy", ""), "Missing CSP"
        )
        status, _, body = read(args.public_origin + "/api/auth/config")
        config = json.loads(body)
        require(status == 200, "Authentication configuration unavailable")
        if args.public_demo:
            require(config.get("enabled") is False, "Public demo authentication state changed")
            status, _, _ = read(args.public_origin + "/api/status")
            require(status == 200, "Public process status unavailable")
        else:
            require(config.get("enabled") is True, "Private authentication is disabled")
            require(config.get("project_id") == args.project, "Wrong Firebase project")
            for path in ("/api/status", "/api/evidence"):
                status, headers, _ = read(args.public_origin + path)
                require(status == 401, "Anonymous API access was not denied")
                require(headers.get("Cache-Control") == "no-store", "API errors may be cached")
            status, _, _ = read(args.backend_origin + "/api/auth/config")
            require(status == 403, "Direct backend bypass was not denied")
        status, _, body = read(args.backend_origin + "/api/health")
        require(status == 200 and json.loads(body).get("status") == "ok", "Health check failed")
        asyncio.run(
            public_streams_available(args.public_origin)
            if args.public_demo else anonymous_stream_denied(args.public_origin)
        )
    except Exception as exc:
        # Do not dump remote response bodies, cookies or tokens into CI logs.
        print(
            f"Cloud smoke checks failed ({type(exc).__name__}). Review routing/auth configuration."
        )
        return 1
    if args.public_demo:
        print("Public frontend, status, health and both WebSocket upgrades passed.")
        print("AI voice model startup and audio still need an end-to-end test.")
    else:
        print("Frontend, auth config, anonymous API/stream denial and origin lock passed.")
        print("OAuth/roles, persistence/restore and load still need authenticated staging tests.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
