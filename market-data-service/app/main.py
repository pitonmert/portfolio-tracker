from fastapi import FastAPI

from app.api.routes import router
from app.core.settings import get_settings

settings = get_settings()

app = FastAPI(title=settings.service_name)
app.include_router(router)

