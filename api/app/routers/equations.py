from fastapi import APIRouter, Response
from pydantic import BaseModel

from app.equations import EQUATIONS, PAIRS

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
