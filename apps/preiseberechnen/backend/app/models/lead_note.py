from sqlalchemy import Column, Integer, TIMESTAMP, ForeignKey, Text
from sqlalchemy.sql import func

from app.core.database import Base


class LeadNote(Base):
    __tablename__ = "lead_notes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    lead_submission_id = Column(Integer, ForeignKey("lead_submissions.id", ondelete="CASCADE"), nullable=False)
    admin_user_id = Column(Integer, ForeignKey("admin_users.id", ondelete="SET NULL"))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    note = Column(Text, nullable=False)
