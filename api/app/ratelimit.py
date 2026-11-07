"""Simple in-memory fixed-window (per minute) rate limiter."""

import math
import time

from fastapi import HTTPException, Request

from app.config import get_settings

WINDOW_SECONDS = 60


class RateLimiter:
    def __init__(self, per_ip: int, global_limit: int) -> None:
        self.per_ip = per_ip
        self.global_limit = global_limit
        self._window = -1
        self._global = 0
        self._ips: dict[str, int] = {}

    def hit(self, ip: str, now: float | None = None) -> int | None:
        """Count a request. Returns None if allowed, else Retry-After seconds."""
        now = time.time() if now is None else now
        window = int(now // WINDOW_SECONDS)
        if window != self._window:
            # New window: drop all old counters so memory stays bounded.
            self._window, self._global, self._ips = window, 0, {}
        if self._global >= self.global_limit or self._ips.get(ip, 0) >= self.per_ip:
            return max(1, math.ceil((window + 1) * WINDOW_SECONDS - now))
        self._global += 1
        self._ips[ip] = self._ips.get(ip, 0) + 1
        return None


def client_ip(request: Request) -> str:
    settings = get_settings()
    fallback = request.client.host if request.client else "unknown"
    if not settings.trust_proxy:
        return fallback
    value = request.headers.get(settings.client_ip_header)
    if not value:
        return fallback
    if settings.client_ip_header.lower() == "x-forwarded-for":
        # The rightmost entry is the one added by our own proxy; the rest is client-controlled.
        value = value.split(",")[-1]
    return value.strip() or fallback


async def rate_limit(request: Request) -> None:
    """FastAPI dependency enforcing the per-IP and global limits."""
    retry_after = request.app.state.limiter.hit(client_ip(request))
    if retry_after is not None:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded",
            headers={"Retry-After": str(retry_after)},
        )
