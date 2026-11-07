import math
import random
from itertools import combinations
from typing import List, Tuple


def f1(x, y):
    result = (
        random.uniform(-1, 1) * x**2 - math.sin(y**2) + abs(y - x) - math.cos(y)
    )
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
    return (
        random.uniform(-1, 1) * x**3
        + x**2
        + y**2
        + math.cos(y + x**2)
        - abs(x**2 - y**2)
    )


def f7(x, y):
    return random.uniform(-1, 1) * (x * math.sin(y - x)) * abs(y) + math.cos(y * x)


def f8(x, y):
    return random.uniform(-1, 1) * x * y * math.atan(abs(x - y)) * math.cos(x / y)


def f9(x, y):
    return random.uniform(-1, 1) * math.cos(x - y) * math.sin(x + y) + x * y


def f10(x, y):
    return random.uniform(-1, 1) * x / y * math.cos(x / y) + math.sin(x / y)


def f11(x, y):
    return (
        random.uniform(-1, 1) * math.sin(y) * x**3
        + x
        - y**2
        + math.sin(x + x**2) * abs(x - y)
    )


equations: List[callable] = [f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11]
combos: List[Tuple[callable]] = list(combinations(equations, 2))

if __name__ == "__main__":
    print(combos[42])
