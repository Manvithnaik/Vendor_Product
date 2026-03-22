from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
from app.services.integration_service import IntegrationService
from app.schemas.product_schema import ApiResponse

router = APIRouter(prefix="/integration", tags=["📡 Integration Events"])

class IntegrationEventPayload(BaseModel):
    event_type: str
    payload: Dict[str, Any]

@router.post("/procurement-event", summary="Log Procurement Event")
def log_procurement_event(payload: IntegrationEventPayload):
    IntegrationService.emit_procurement_event(payload.event_type, payload.payload)
    return ApiResponse(status="success", message="Event Logged", data=None)
