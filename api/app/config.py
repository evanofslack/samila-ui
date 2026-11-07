from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """App settings. Each field reads the upper-case env var of the same name."""

    port: int = 8080
    static_dir: str | None = None
    render_workers: int = 2
    render_queue: int = 4
    render_timeout_seconds: float = 30.0
    rate_limit_per_minute: int = 10
    global_rate_limit_per_minute: int = 60
    trust_proxy: bool = False
    client_ip_header: str = "X-Forwarded-For"
    docs_enabled: bool = True
    log_level: str = "info"


@lru_cache
def get_settings() -> Settings:
    return Settings()
