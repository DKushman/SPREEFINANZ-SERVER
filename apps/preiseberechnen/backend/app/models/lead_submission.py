from sqlalchemy import Column, Integer, TIMESTAMP, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB

from app.core.database import Base


class LeadSubmission(Base):
    __tablename__ = "lead_submissions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    calculator_id = Column(Integer, ForeignKey("calculators.id", ondelete="SET NULL"))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    contact = Column(JSONB)
    inputs = Column(JSONB)
    results = Column(JSONB)
    utm = Column(JSONB)
    referrer = Column(Text)
