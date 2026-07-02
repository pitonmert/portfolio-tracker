from dataclasses import dataclass
from functools import lru_cache
import os


@dataclass(frozen=True)
class Settings:
    service_name: str = "Market Data Service"
    source_name: str = "borsapy"


@lru_cache
def get_settings() -> Settings:
    return Settings(
        service_name=os.getenv("SERVICE_NAME", "Market Data Service"),
        source_name=os.getenv("SOURCE_NAME", "borsapy"),
    )

