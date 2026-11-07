import logging
import os
from functools import lru_cache

import matplotlib.font_manager
from pydantic import BaseSettings

log = logging.getLogger("uvicorn")


class Settings(BaseSettings):
    environment: str = os.getenv("ENVIRONMENT")
    testing: bool = os.getenv("TESTING")
    home_url: str = os.getenv("HOME_URL")


@lru_cache()
def get_settings() -> BaseSettings:
    return Settings()


def get_fonts():
    try:
        font_dir = ["/Users/evan/Downloads/Montserrat"]
        for font in matplotlib.font_manager.findSystemFonts(font_dir):
            matplotlib.font_manager.fontManager.addfont(font)
    except Exception as e:
        print(f"Error loading custom fonts from {font_dir[0]}")
        print(e)
