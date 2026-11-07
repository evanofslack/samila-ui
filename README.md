# [samila](https://samila.evanslack.dev)

Web app and public HTTP API for [Samila](https://github.com/sepandhaghighi/samila), a Python generative art library.

- `web/`: Next.js + Mantine frontend, built as a static export
- `api/`: FastAPI backend that renders images with Samila and serves the frontend

Both ship as one Docker image, [`evanofslack/samila`](https://hub.docker.com/r/evanofslack/samila).

## API

`GET /api/image` returns a PNG. Every parameter is optional, and the seed used is returned in the `X-Seed` header, so any image can be reproduced.

```sh
curl -o art.png "https://samila.evanslack.dev/api/image?eq=7&seed=4242&proj=polar&color=ffffff&bg=000000"
```

Parameters, limits and errors are documented at [`/api/docs`](https://samila.evanslack.dev/api/docs) and in [`api/README.md`](api/README.md).

## Develop

Needs [uv](https://docs.astral.sh/uv/), Node 24 and [just](https://github.com/casey/just).

```sh
just start   # api on :8080, next dev on :3000 proxying /api
just serve   # production-like: static export served by the api on :8080
just check   # same checks as ci
```

## Configuration

| variable | default | |
|---|---|---|
| `PORT` | `8080` | listen port for `python -m app.main` (the docker image always listens on 8080) |
| `STATIC_DIR` | unset (`/app/static` in docker) | serve the web export at `/` |
| `RENDER_WORKERS` | `2` | render processes |
| `RENDER_QUEUE` | `4` | renders allowed to wait for a worker before returning 503 |
| `RENDER_TIMEOUT_SECONDS` | `30` | returns 504 after this |
| `RATE_LIMIT_PER_MINUTE` | `10` | image requests per client ip |
| `GLOBAL_RATE_LIMIT_PER_MINUTE` | `60` | image requests across all clients |
| `TRUST_PROXY` | `false` | take the client ip from `CLIENT_IP_HEADER`. only enable behind a reverse proxy |
| `CLIENT_IP_HEADER` | `X-Forwarded-For` | rightmost entry for `X-Forwarded-For`, else the header's value (e.g. `CF-Connecting-IP`) |
| `DOCS_ENABLED` | `true` | serve `/api/docs` and `/api/openapi.json` |
| `LOG_LEVEL` | `info` | |

## Deploy

1. Copy [`docker-compose.yaml`](docker-compose.yaml) to the host and run `docker compose up -d`. The port is bound to localhost, so it's reachable only through the proxy.
2. Caddy:

   ```
   samila.evanslack.dev {
       encode zstd gzip
       reverse_proxy 127.0.0.1:8080
   }
   ```

3. Cloudflare: a proxied DNS record for `samila`, with SSL/TLS mode **Full (strict)**.

Behind Cloudflare, the rightmost `X-Forwarded-For` entry Caddy passes on is a Cloudflare edge address, so rate limits would apply per edge server rather than per visitor. That's why the compose file sets `CLIENT_IP_HEADER=CF-Connecting-IP`. If the origin is also reachable without Cloudflare, clients could forge that header; the global limit and the render queue still cap the total load either way.

Pushes to `main` publish `evanofslack/samila:latest` via GitHub Actions. The repo needs the `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` secrets.
