import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.ratelimit import RateLimiter
from app.render import Renderer
from app.routers import health, image

settings = get_settings()

logging.basicConfig(
    level=settings.log_level.upper(),
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
log = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.renderer = Renderer(
        workers=settings.render_workers,
        queue=settings.render_queue,
        timeout=settings.render_timeout_seconds,
    )
    app.state.limiter = RateLimiter(
        per_ip=settings.rate_limit_per_minute,
        global_limit=settings.global_rate_limit_per_minute,
    )
    log.info(
        "renderer started: workers=%d queue=%d timeout=%.1fs",
        settings.render_workers,
        settings.render_queue,
        settings.render_timeout_seconds,
    )
    try:
        yield
    finally:
        app.state.renderer.shutdown()


app = FastAPI(
    title="samila",
    lifespan=lifespan,
    docs_url="/api/docs" if settings.docs_enabled else None,
    openapi_url="/api/openapi.json" if settings.docs_enabled else None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_credentials=False,
    expose_headers=["X-Seed", "X-Eq", "X-F1", "X-F2"],
)

app.include_router(health.router, prefix="/api")
app.include_router(image.router, prefix="/api")

# Mounted last so it never shadows the API routes.
if settings.static_dir:
    app.mount("/", StaticFiles(directory=settings.static_dir, html=True), name="static")


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port)
