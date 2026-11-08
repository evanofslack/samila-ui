# ignore any UV_ENV_FILE from the shell; config comes from real env vars
export UV_NO_ENV_FILE := "1"

default:
    @just --list

# install web deps if missing
install:
    cd web && [ -d node_modules ] || npm ci

# api on :8080 with reload
api:
    cd api && uv run uvicorn app.main:app --reload --port 8080

# next dev server on :3000, proxying /api to :8080
web: install
    cd web && npm run dev

# api and web together; ctrl-c stops both
start:
    #!/usr/bin/env bash
    trap 'kill 0' EXIT
    just api & just web & wait

# production-like: static export served by the api on :8080
serve: install
    cd web && npm run build
    cd api && STATIC_DIR=../web/out uv run uvicorn app.main:app --port 8080

# format python and web code
fmt: install
    cd api && uv run ruff format . && uv run ruff check --fix .
    cd web && npm run format

# same checks as ci
check: install
    cd api && uv run ruff format --check .
    cd api && uv run ruff check .
    cd api && uv run python -c "import app.main"
    cd api && uv run python scripts/prerender.py --check
    cd web && npm run type-check
    cd web && npm run build

# write web/lib/equations.json, the default image and any missing variation thumbnails
prerender *args:
    cd api && uv run python scripts/prerender.py {{args}}

# readme screenshots of the editor in light and dark, from the app on :8080 (just serve)
screenshots url="http://localhost:8080": install
    cd web && node scripts/screenshots.mjs {{url}}
    cd api && uv run python -c "from pathlib import Path; from PIL import Image; [(Image.open(p).save(p.with_suffix('.webp'), quality=88, method=6), p.unlink()) for p in Path('../docs').glob('screenshot-*.png')]"

# build the docker image
docker:
    docker build -t evanofslack/samila:latest .

# run the docker image on :8080
docker-run: docker
    docker run --rm -p 8080:8080 evanofslack/samila:latest
