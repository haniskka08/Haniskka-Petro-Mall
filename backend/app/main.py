"""Petromall FastAPI application entry point."""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.middleware.cors import setup_cors


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle hooks."""
    settings = get_settings()
    upload_path = Path(settings.upload_dir)
    upload_path.mkdir(parents=True, exist_ok=True)
    yield


def create_app() -> FastAPI:
    """Application factory for testability and deployment."""
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        description="Controlled B2B commercial space matchmaking platform — Dealer Module",
        version="0.1.0",
        docs_url="/docs" if settings.is_development else None,
        redoc_url="/redoc" if settings.is_development else None,
        lifespan=lifespan,
    )

    setup_cors(app, settings)

    app.include_router(api_router, prefix=settings.api_v1_prefix)

    @app.get("/", tags=["Root"])
    def root():
        return {
            "message": f"Welcome to {settings.app_name} API",
            "docs": "/docs",
            "health": f"{settings.api_v1_prefix}/health",
        }

    return app


app = create_app()
