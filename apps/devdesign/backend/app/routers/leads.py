from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.lead import Lead
from app.schemas.leads import LeadCreate, LeadResponse

router = APIRouter(prefix="/leads", tags=["leads"])


@router.post("", response_model=LeadResponse)
def create_lead(lead: LeadCreate, db: Session = Depends(get_db)):
    db_lead = Lead(
        email=lead.email,
        name=lead.name,
        phone=lead.phone,
        source=lead.source,
        message=lead.message,
    )
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead
