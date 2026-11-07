FROM node:24-alpine AS web
WORKDIR /web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ ./
RUN npm run build


FROM python:3.14-slim AS api
COPY --from=ghcr.io/astral-sh/uv:0.13.6 /uv /usr/local/bin/uv
WORKDIR /app
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_NO_CACHE=1 UV_PYTHON_DOWNLOADS=never
COPY api/pyproject.toml api/uv.lock api/.python-version ./
RUN uv sync --frozen --no-dev --no-install-project


# same base as the builder, so the venv's interpreter paths stay valid
FROM python:3.14-slim
WORKDIR /app
COPY --from=api /app/.venv ./.venv
COPY api/app ./app
COPY --from=web /web/out ./static

RUN useradd --system --uid 10001 --no-create-home app
USER app

ENV PATH=/app/.venv/bin:$PATH \
    MPLBACKEND=Agg \
    MPLCONFIGDIR=/tmp/matplotlib \
    STATIC_DIR=/app/static
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/api/health')"
# client ips come from the app's TRUST_PROXY setting, not uvicorn's proxy headers
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--no-proxy-headers", "--no-server-header"]
