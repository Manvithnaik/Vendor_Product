from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.rfq_schema import RFQCreateRequest, RFQVendorRespondRequest, RFQRequestDTO, RFQResponseDTO
from app.schemas.product_schema import ApiResponse
from app.services.rfq_service import RFQService
from app.services.integration_service import IntegrationService

router = APIRouter(prefix="/rfq", tags=["🤝 RFQ Engine"])

@router.get("/vendor/{vendor_id}", summary="Get Vendor RFQs")
def get_vendor_rfqs(vendor_id: int, db: Session = Depends(get_db)):
    rfqs = RFQService.get_vendor_rfqs(db, vendor_id)
    return ApiResponse(
        status="success",
        message=f"Fetched {len(rfqs)} RFQs for vendor {vendor_id}",
        data=[RFQRequestDTO.model_validate(r) for r in rfqs]
    )

@router.get("/manufacturer/{manufacturer_id}", summary="Get Manufacturer RFQs")
def get_manufacturer_rfqs(manufacturer_id: int, db: Session = Depends(get_db)):
    rfqs = RFQService.get_manufacturer_rfqs(db, manufacturer_id)
    return ApiResponse(
        status="success",
        message=f"Fetched {len(rfqs)} RFQs for manufacturer {manufacturer_id}",
        data=[RFQRequestDTO.model_validate(r) for r in rfqs]
    )

@router.post("/{rfq_id}/order", summary="Manufacturer Orders the RFQ")
def place_order(rfq_id: int, db: Session = Depends(get_db)):
    RFQService.process_order(db, rfq_id)
    IntegrationService.emit_procurement_event("ORDER_PLACED", {"rfq_id": rfq_id})
    return ApiResponse(status="success", message="Order placed successfully", data=None)

@router.post("/request", summary="Create an RFQ")
def create_rfq(payload: RFQCreateRequest, db: Session = Depends(get_db)):
    rfq = RFQService.create_rfq(
        db, payload.product_id, payload.manufacturer_id, payload.requested_quantity, payload.message
    )
    # Event Integration
    IntegrationService.emit_procurement_event("RFQ_CREATED", {"rfq_id": rfq.rfq_id, "product_id": rfq.product_id})
    return ApiResponse(status="success", message="RFQ Created", data=RFQRequestDTO.model_validate(rfq))

@router.post("/{rfq_id}/respond", summary="Vendor Responds to RFQ")
def respond_to_rfq(rfq_id: int, vendor_id: int, payload: RFQVendorRespondRequest, db: Session = Depends(get_db)):
    # vendor_id should come from auth token but we mock it in query for now
    response = RFQService.respond_to_rfq(
        db, rfq_id, vendor_id, payload.quoted_price, payload.available_quantity
    )
    IntegrationService.emit_procurement_event("RFQ_RESPONDED", {"rfq_id": rfq_id, "vendor_id": vendor_id})
    return ApiResponse(status="success", message="RFQ Responded and Stock Reserved", data=RFQResponseDTO.model_validate(response))

@router.post("/{rfq_id}/expire", summary="Expire RFQ (Releases Stock)")
def expire_rfq(rfq_id: int, db: Session = Depends(get_db)):
    RFQService.expire_rfq(db, rfq_id)
    IntegrationService.emit_procurement_event("RFQ_EXPIRED", {"rfq_id": rfq_id})
    return ApiResponse(status="success", message="RFQ Expired", data=None)
