from pydantic import BaseModel
from typing import List, Optional


class LowStockItem(BaseModel):
    product_id: int
    product_name: str
    stock_keeping_unit: str
    available_stock_quantity: int
    reorder_alert_level: int
    vendor_id: int


class CategoryDistribution(BaseModel):
    category_name: Optional[str]
    product_count: int


class CatalogSummary(BaseModel):
    total_active_products: int
    low_stock_count: int
    out_of_stock_count: int
    category_distribution: List[CategoryDistribution]
