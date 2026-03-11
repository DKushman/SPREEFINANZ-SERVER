from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import health, leads, tracking

app = FastAPI(title="DEVDESIGN API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://devdesign.de", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(leads.router)
app.include_router(tracking.router)
