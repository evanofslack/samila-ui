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
    cd web && npm run type-check
    cd web && npm run build

# build the docker image
docker:
    docker build -t evanofslack/samila:latest .

# run the docker image on :8080
docker-run: docker
    docker run --rm -p 8080:8080 evanofslack/samila:latest
