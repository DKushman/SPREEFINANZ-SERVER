from pydantic import BaseModel
from typing import Optional, Any


class TrackingEventCreate(BaseModel):
    event_type: str
    session_id: Optional[str] = None
    page: Optional[str] = None
    payload: Optional[dict[str, Any]] = None
