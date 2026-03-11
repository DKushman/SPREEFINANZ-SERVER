from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/status")
def admin_status():
    """Placeholder for admin status. Auth not enforced yet."""
    return {"status": "ok", "message": "Admin API (auth not implemented)"}
