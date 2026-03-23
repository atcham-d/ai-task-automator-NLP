"""FastAPI application entry point.

Sets up CORS, registers all routers, and starts the scheduler on startup.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import auth, workflows, parse, logs, integrations, profile, webhooks
from app.scheduler import scheduler as workflow_scheduler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — start scheduler on startup, stop on shutdown."""
    logger.info("Starting workflow scheduler...")
    workflow_scheduler.start()
    yield
    logger.info("Stopping workflow scheduler...")
    workflow_scheduler.stop()


app = FastAPI(
    title="Workflow Automation API",
    description="AI-powered workflow automation backend — parse natural language into executable workflows.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──
logger.info(f"Allowed CORS origins: {settings.cors_origins}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register Routers ──
app.include_router(auth.router)
app.include_router(workflows.router)
app.include_router(parse.router)
app.include_router(logs.router)
app.include_router(integrations.router)
app.include_router(profile.router)
app.include_router(webhooks.router)

@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": "1.0.0"}
