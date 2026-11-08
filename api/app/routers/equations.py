from typing import Annotated

from fastapi import APIRouter, Path, Response
from pydantic import BaseModel

from app.equations import EQUATIONS, PAIRS, pretty, random_equations
from app.render import MAX_SEED
from app.routers.image import ALL_CMAPS, CMAPS

router = APIRouter(tags=["equations"])


class EquationInfo(BaseModel):
    id: int
    display: str


class EquationList(BaseModel):
    functions: list[EquationInfo]
    # variation n is the pair of function ids pairs[n]
    pairs: list[tuple[int, int]]


EQUATION_LIST = EquationList(
    functions=[EquationInfo(id=i, display=e.display) for i, e in enumerate(EQUATIONS)],
    pairs=PAIRS,
)


@router.get("/equations")
async def equations(response: Response) -> EquationList:
    """The equations samila plots, and the pair that makes each variation."""
    response.headers["Cache-Control"] = "public, max-age=3600"
    return EQUATION_LIST


class RandomEquation(BaseModel):
    # the Python expression samila evaluates, and the same formula for people
    expr: str
    display: str


class RandomEquations(BaseModel):
    fseed: int
    f1: RandomEquation
    f2: RandomEquation


@router.get("/equations/random/{fseed}")
async def random_pair(
    fseed: Annotated[int, Path(ge=0, le=MAX_SEED)], response: Response
) -> RandomEquations:
    """The two equations samila writes for a function seed, as used by /api/image?fseed=."""
    expr1, expr2 = random_equations(fseed)
    response.headers["Cache-Control"] = "public, max-age=86400"
    return RandomEquations(
        fseed=fseed,
        f1=RandomEquation(expr=expr1, display=pretty(expr1)),
        f2=RandomEquation(expr=expr2, display=pretty(expr2)),
    )


class ColormapList(BaseModel):
    # a short list that works well, then every colormap matplotlib knows
    curated: list[str]
    all: list[str]


COLORMAP_LIST = ColormapList(curated=list(CMAPS), all=sorted(ALL_CMAPS, key=str.lower))


@router.get("/colormaps", tags=["image"])
async def colormaps(response: Response) -> ColormapList:
    """Colormap names accepted by /api/image?cmap=."""
    response.headers["Cache-Control"] = "public, max-age=3600"
    return COLORMAP_LIST
