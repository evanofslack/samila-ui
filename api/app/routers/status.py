from fastapi import APIRouter

router = APIRouter(
    tags=["status"],
)


@router.get("/")
async def main():
    """
    Return app settings
    """
    return {
        "message": "Welcome to Samila API",
    }


@router.get("/ping")
async def pong():
    """
    Return app settings
    """
    return {
        "message": "pong",
    }
