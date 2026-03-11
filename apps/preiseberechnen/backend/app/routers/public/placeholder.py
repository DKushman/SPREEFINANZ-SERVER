from fastapi import APIRouter

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/info")
def public_info():
    """Placeholder for public calculator metadata or info."""
    return {"service": "preiseberechnen", "version": "0.1.0"}
