# samila-api

REST API wrapper of [Samila](https://github.com/sepandhaghighi/samila), built with
[FastAPI](https://github.com/fastapi/fastapi). Renders run in a process pool, so the event loop
never blocks.

## Running

Requires [uv](https://docs.astral.sh/uv/) and Python 3.14.

```sh
uv sync
uv run uvicorn app.main:app --reload --port 8080
```

Interactive docs: <http://localhost:8080/api/docs>. Lint with
`uv run ruff check . && uv run ruff format --check .`.

## Endpoints

| method | path | description |
|---|---|---|
| GET | `/api/image` | Render a PNG |
| GET | `/api/equations` | The equations and the pair that makes each variation |
| GET | `/api/equations/random/{fseed}` | The two equations samila writes for a function seed |
| GET | `/api/colormaps` | Colormap names for `cmap` |
| GET | `/api/config` | The samila config for an image, for `GenerativeImage(config=...)` |
| GET | `/api/health` | `{"status": "ok"}` |
| GET | `/api/docs`, `/api/openapi.json` | Swagger UI and schema (when `DOCS_ENABLED`) |

### `GET /api/image` query parameters

| param | allowed | default |
|---|---|---|
| `eq` | variation (equation pair) index, 0–170 | random |
| `f1`, `f2` | equation indices, 0–18, given together instead of `eq`; any order, and may be equal | none |
| `fseed` | 0–1048576; samila writes two random equations from it, instead of `eq` or `f1`/`f2` | none |
| `seed` | 0–1048576 | random |
| `start`, `stop` | the grid of starting points, −12 to 12, `start` < `stop` | −π, π |
| `step` | grid spacing, 0.002–1; at most 1,600,000 points | 0.01 |
| `proj` | `rectilinear`, `polar`, `aitoff`, `hammer`, `lambert`, `mollweide` | `rectilinear` |
| `mode` | `f1_vs_f2`, `f2_vs_f1`, `f1_vs_index`, `f2_vs_index`, `index_vs_f1`, `index_vs_f2`, `f1_vs_x1`, `f2_vs_x1`, `f1_vs_x2`, `f2_vs_x2`, `x1_vs_f1`, `x1_vs_f2`, `x2_vs_f1`, `x2_vs_f2`, `f1f2_vs_f1`, `f1f2_vs_f2`, `f1_vs_f1f2`, `f2_vs_f1f2` | `f1_vs_f2` |
| `color` | 6-digit hex, no `#`, or `complement` of `bg` | `000000` |
| `bg` | 6-digit hex, no `#`, `transparent`, or `complement` of `color` | `ffffff` |
| `cmap` | any matplotlib colormap (see `/api/colormaps`); a gradient that overrides `color` | none |
| `colors` | 2–6 comma-separated hex colors for a custom gradient, instead of `cmap` | none |
| `marker` | `point`, `pixel`, `circle`, `triangle_down`, `triangle_up`, `triangle_left`, `triangle_right`, `tri_down`, `tri_up`, `tri_left`, `tri_right`, `octagon`, `square`, `pentagon`, `plus`, `plus_filled`, `star`, `hexagon_vertical`, `hexagon_horizontal`, `x`, `x_filled`, `diamond`, `diamon_thin`, `vline`, `hline` | `point` |
| `spot` | 0.01–10 | 0.5 |
| `alpha` | 0.01–1 | 0.1 |
| `linewidth` | marker outline width, 0–5 | 1.5 |
| `rotation` | 0–360 | 0 |
| `size` | width and height of a square image in pixels, 500–4000 | 1000 |
| `width`, `height` | given together instead of `size`, for other shapes, 500–4000 each | none |

The response is `image/png` with headers:

- `X-Seed`, `X-F1`, `X-F2`: the seed and equations used (also when chosen at random).
- `X-Eq`: the variation, when the equations are one of the numbered pairs.
- `X-Fseed`: instead of `X-F1` and `X-F2`, when samila wrote the equations.
- `Cache-Control: public, max-age=31536000, immutable` when `seed` and either `eq`, `f1` and
  `f2`, or `fseed` were given, otherwise `no-store`.

Conflicting parameters return 422 with a `detail` message.

Variations 0–54 are the original pairs and keep their numbers; new equations only add
variations at the end. `GET /api/equations` returns each equation's formula, with the random
coefficient written as `r`, and `pairs[n]`, the two equations of variation `n`.

### `GET /api/config`

Takes the same parameters as `/api/image` (`seed` is required) and returns the image as a
[samila config](https://github.com/sepandhaghighi/samila#config), with a `usage` list of the
Python lines that render it:

```python
from samila import GenerativeImage

g = GenerativeImage(config=open("config.json"))
g.generate()
g.plot()  # color=g.data1 for gradients, size=(w, h) for other shapes
g.save_image("samila.png")
```

### Errors

All errors are JSON `{"detail": ...}`.

| status | meaning |
|---|---|
| 422 | Invalid or out-of-range parameter |
| 429 | Rate limit exceeded; see `Retry-After` (seconds) |
| 503 | All render workers and queue slots are busy |
| 504 | Render timed out |

## Configuration

Environment variables:

| variable | default | description |
|---|---|---|
| `PORT` | 8080 | Port when run with `python -m app.main` |
| `STATIC_DIR` | unset | If set, serve this directory at `/` (e.g. the built frontend) |
| `RENDER_WORKERS` | 2 | Render worker processes |
| `RENDER_QUEUE` | 4 | Extra renders allowed to wait; beyond workers + queue returns 503 |
| `RENDER_TIMEOUT_SECONDS` | 30.0 | Per-request render timeout (504) |
| `RATE_LIMIT_PER_MINUTE` | 10 | `/api/image` requests per client IP per minute |
| `GLOBAL_RATE_LIMIT_PER_MINUTE` | 60 | `/api/image` requests per minute across all clients |
| `TRUST_PROXY` | false | Take the client IP from `CLIENT_IP_HEADER` |
| `CLIENT_IP_HEADER` | `X-Forwarded-For` | For `X-Forwarded-For` the rightmost entry is used; other headers (e.g. `CF-Connecting-IP`) are used as is |
| `DOCS_ENABLED` | true | Serve `/api/docs` and `/api/openapi.json` |
| `LOG_LEVEL` | info | Python logging level |

Rate limits are in memory and per process; run a single server process.
