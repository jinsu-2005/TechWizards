"""Read-only check of the server's ADC and Firebase Authentication access.

Run with the backend virtualenv. Never prints tokens, credential contents or user records.
"""

import argparse
import sys

import firebase_admin
from firebase_admin import auth
from google.auth.exceptions import DefaultCredentialsError


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", default="attacktrace-private-20261016")
    args = parser.parse_args()
    app = None
    try:
        app = firebase_admin.initialize_app(options={"projectId": args.project, "httpTimeout": 10})
        # Force a real read: discovering a credential alone does not verify IAM permissions.
        auth.list_users(max_results=1, app=app)
    except DefaultCredentialsError:
        print("ADC is unavailable. Attach a workload identity or configure ADC on this server.")
        return 2
    except Exception as exc:
        # Exception messages can contain request/identity details; report only the error type.
        print(
            f"Firebase Authentication access failed ({type(exc).__name__}). "
            "Check ADC and project IAM."
        )
        return 1
    finally:
        if app is not None:
            firebase_admin.delete_app(app)
    print(f"ADC can read Firebase Authentication in {args.project}.")
    print("This does not replace browser sign-in, session-cookie and revocation checks.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
