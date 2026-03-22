from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.services.comparison_service import ComparisonService
from app.schemas.comparison_schema import ComparisonRequest, ScoredProductResponse
from app.schemas.product_schema import ApiResponse
from app.services.integration_service import IntegrationService

router = APIRouter(prefix="/comparison", tags=["⚖️ Comparison Engine"])

@router.post("/compare", summary="Compare Products")
def compare_products(payload: ComparisonRequest, db: Session = Depends(get_db)):
    results = ComparisonService.compare_products(db, payload.product_ids, payload.comparison_template_id)
    
    IntegrationService.emit_procurement_event("CATALOG_COMPARISON", {"product_count": len(payload.product_ids)})
    
    return ApiResponse(
        status="success",
        message="Comparison generated successfully.",
        data=results
    )
