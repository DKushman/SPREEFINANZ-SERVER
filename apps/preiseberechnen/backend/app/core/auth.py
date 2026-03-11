"""Auth placeholder: no real implementation yet. Use for admin routes later."""
from fastapi import HTTPException, status

# Placeholder dependency – always raises 401 until auth is implemented
def get_current_user():
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated (auth not implemented)",
    )
