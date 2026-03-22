from pydantic import BaseModel
from typing import List, Optional

class ComparisonRequest(BaseModel):
    product_ids: List[int]
    comparison_template_id: Optional[int] = None

class ScoredProductResponse(BaseModel):
    product_id: int
    vendor_id: int
    price_score: float
    stock_score: float
    reliability_score: float
    total_score: float
    rank: int
    risk_level: str
