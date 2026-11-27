"""
DEVNEXUS TECH — Enterprise Backend Application.
Flask REST API supporting PostgreSQL / SQLite, Appwrite JWT verification,
Email/WhatsApp/AI/Payment/n8n integrations, CRM, and SPA frontend serving.
"""

import os
from pathlib import Path
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from server.config import Config
from server.models import db, init_db
from server.security import apply_security_headers
from server.routes.public import public_bp
from server.routes.auth import auth_bp
from server.routes.client_portal import client_bp
from server.routes.ai import ai_bp
from server.routes.payments import payments_bp
from server.routes.webhooks import webhooks_bp
from server.routes.admin import admin_bp

BASE_DIR = Path(__file__).resolve().parent
DIST_DIR = BASE_DIR.parent / "client" / "dist"


def create_app() -> Flask:
    flask_app = Flask(
        __name__,
        static_folder=str(DIST_DIR) if DIST_DIR.exists() else None,
        static_url_path="/",
    )

    flask_app.config["SECRET_KEY"] = Config.SECRET_KEY
    flask_app.config["SQLALCHEMY_DATABASE_URI"] = Config.get_database_uri()
    flask_app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    flask_app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10 MB request cap

    origins = Config.ALLOWED_ORIGINS if Config.FLASK_ENV == "production" and Config.ALLOWED_ORIGINS else "*"
    CORS(
        flask_app,
        resources={
            r"/api/*": {
                "origins": origins,
                "allow_headers": ["Content-Type", "Authorization", "X-Appwrite-JWT", "X-Admin-Key"],
                "methods": ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
            }
        },
    )

    db.init_app(flask_app)
    init_db(flask_app)

    flask_app.after_request(apply_security_headers)

    flask_app.register_blueprint(public_bp)
    flask_app.register_blueprint(auth_bp)
    flask_app.register_blueprint(client_bp)
    flask_app.register_blueprint(ai_bp)
    flask_app.register_blueprint(payments_bp)
    flask_app.register_blueprint(webhooks_bp)
    flask_app.register_blueprint(admin_bp)

    @flask_app.route("/", defaults={"path": ""})
    @flask_app.route("/<path:path>")
    def serve_frontend(path: str):
        if path.startswith("api/"):
            return jsonify({"success": False, "error": "API endpoint not found."}), 404
        if DIST_DIR.exists():
            target = DIST_DIR / path
            if path != "" and target.exists() and target.is_file():
                return send_from_directory(str(DIST_DIR), path)
            return send_from_directory(str(DIST_DIR), "index.html")
        return jsonify({
            "service": "DEVNEXUS TECH Backend API",
            "status": "running",
            "endpoints": ["/api/health", "/api/public/bootstrap", "/api/contact", "/api/auth/session", "/api/admin/analytics"],
        }), 200

    return flask_app


app = create_app()

if __name__ == "__main__":
    debug = Config.FLASK_ENV == "development"
    print(f"[*] Starting DEVNEXUS TECH Backend on port {Config.PORT} (debug={debug})...")
    app.run(host="0.0.0.0", port=Config.PORT, debug=debug)
