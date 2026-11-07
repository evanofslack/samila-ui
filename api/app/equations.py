"""The functions samila plots, and the pairs of them that make each variation.

Every function scales one term by r = random.uniform(-1, 1), drawn per point from the
seeded generator, which is what turns a smooth surface into a cloud of points.
"""

import math
import random
from collections.abc import Callable
from dataclasses import dataclass
from itertools import combinations


def f1(x, y):
    result = random.uniform(-1, 1) * x**2 - math.sin(y**2) + abs(y - x) - math.cos(y)
    return result


def f2(x, y):
    result = random.uniform(-1, 1) * y**3 - math.cos(x**2) * x - math.atan(y + x)
    return result


def f3(x, y):
    return random.uniform(-1, 1) * x**4 + math.sin(y) + math.cos(x) - y**2


def f4(x, y):
    return random.uniform(-1, 1) * math.atan(x) - math.atan(y) * math.cos(y**3)


def f5(x, y):
    return random.uniform(-1, 1) * math.sin(x) * math.sin(y) + math.cos(x * y)


def f6(x, y):
    return random.uniform(-1, 1) * x**3 + x**2 + y**2 + math.cos(y + x**2) - abs(x**2 - y**2)


def f7(x, y):
    return random.uniform(-1, 1) * (x * math.sin(y - x)) * abs(y) + math.cos(y * x)


def f8(x, y):
    return random.uniform(-1, 1) * x * y * math.atan(abs(x - y)) * math.cos(x / y)


def f9(x, y):
    return random.uniform(-1, 1) * math.cos(x - y) * math.sin(x + y) + x * y


def f10(x, y):
    return random.uniform(-1, 1) * x / y * math.cos(x / y) + math.sin(x / y)


def f11(x, y):
    return random.uniform(-1, 1) * math.sin(y) * x**3 + x - y**2 + math.sin(x + x**2) * abs(x - y)


@dataclass(frozen=True)
class Equation:
    fn: Callable[[float, float], float]
    # the formula for people, with the random coefficient written as r
    display: str


EQUATIONS: list[Equation] = [
    Equation(f1, "r·x² − sin(y²) + |y − x| − cos(y)"),
    Equation(f2, "r·y³ − x·cos(x²) − atan(x + y)"),
    Equation(f3, "r·x⁴ + sin(y) + cos(x) − y²"),
    Equation(f4, "r·atan(x) − atan(y)·cos(y³)"),
    Equation(f5, "r·sin(x)·sin(y) + cos(x·y)"),
    Equation(f6, "r·x³ + x² + y² + cos(x² + y) − |x² − y²|"),
    Equation(f7, "r·x·sin(y − x)·|y| + cos(x·y)"),
    Equation(f8, "r·x·y·atan(|x − y|)·cos(x / y)"),
    Equation(f9, "r·cos(x − y)·sin(x + y) + x·y"),
    Equation(f10, "r·(x / y)·cos(x / y) + sin(x / y)"),
    Equation(f11, "r·x³·sin(y) + x − y² + sin(x + x²)·|x − y|"),
]

# each variation is a pair of equation indices. the first 55 are every pair of the
# original 11 and must never change, since shared links name them by position
PAIRS: list[tuple[int, int]] = list(combinations(range(11), 2))

# later equations add their pairs at the end, so earlier variations keep their numbers
for _j in range(11, len(EQUATIONS)):
    PAIRS.extend((_i, _j) for _i in range(_j))


def pair_index(f1: int, f2: int) -> int | None:
    """The variation number of an equation pair, if it is one."""
    try:
        return PAIRS.index((f1, f2))
    except ValueError:
        return None
