from pydantic import BaseModel, EmailStr
from typing import Optional


class LeadCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    phone: Optional[str] = None
    source: Optional[str] = None
    message: Optional[str] = None


class LeadResponse(BaseModel):
    id: int
    email: str
    name: Optional[str] = None

    class Config:
        from_attributes = True
