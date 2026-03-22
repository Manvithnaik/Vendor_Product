from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from app.models.rfq_model import RFQRequestStatus, RFQResponseStatus

# Requests
class RFQCreateRequest(BaseModel):
    product_id: int
    manufacturer_id: int
    requested_quantity: int
    message: str

class RFQVendorRespondRequest(BaseModel):
    quoted_price: float
    available_quantity: int

# Responses
class RFQResponseDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    response_id: int
    rfq_id: int
    vendor_id: int
    quoted_price: float
    available_quantity: int
    status: RFQResponseStatus
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class RFQRequestDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    rfq_id: int
    product_id: int
    manufacturer_id: int
    requested_quantity: int
    message: str
    status: RFQRequestStatus
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    responses: list[RFQResponseDTO] = []
