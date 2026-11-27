#!/usr/bin/env python3
"""
DEVNEXUS TECH — Local Full-Stack Launcher
Runs the Flask API server and serves compiled frontend assets if present.
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from server.app import app

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV", "development") == "development"
    print("=" * 68)
    print("  DEVNEXUS TECH — Engineering Digital Excellence")
    print(f"  Backend API & Built App : http://127.0.0.1:{port}")
    print("  Vite React Dev Server   : http://localhost:3000")
    print("=" * 68)
    app.run(host="0.0.0.0", port=port, debug=debug)
