from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import health, tracking
from app.routers.public import placeholder as public_router
from app.routers.admin import placeholder as admin_router

app = FastAPI(title="preiseberechnen API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://preiseberechnen.de",
        "https://admin.preiseberechnen.de",
        "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(tracking.router)
app.include_router(public_router.router)
app.include_router(admin_router.router)
