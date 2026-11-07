import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import image, status

load_dotenv()

app = FastAPI()
app.include_router(status.router)
app.include_router(image.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        port=8000,
        host="0.0.0.0",
        reload=True,
    )
