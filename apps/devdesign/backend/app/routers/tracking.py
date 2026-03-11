from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.tracking_event import TrackingEvent
from app.schemas.tracking import TrackingEventCreate

router = APIRouter(prefix="/tracking", tags=["tracking"])


@router.post("")
def track_event(event: TrackingEventCreate, db: Session = Depends(get_db)):
    db_event = TrackingEvent(
        event_type=event.event_type,
        session_id=event.session_id,
        page=event.page,
        payload=event.payload,
    )
    db.add(db_event)
    db.commit()
    return {"ok": True}
