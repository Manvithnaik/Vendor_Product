from pydantic import BaseModel, Field, HttpUrl, ConfigDict
from typing import Optional, List, Any
from decimal import Decimal
from datetime import datetime


# ──────────────────────────────────────────
# GENERIC API ENVELOPE
# ──────────────────────────────────────────

class ApiResponse(BaseModel):
    status: str
    message: str
    data: Any = None


class Pagination(BaseModel):
    page: int
    limit: int
    total_records: int
    total_pages: int


class PaginatedApiResponse(BaseModel):
    status: str
    message: str
    data: Any
    pagination: Pagination


# ──────────────────────────────────────────
# BASE SCHEMA
# ──────────────────────────────────────────

class ProductBase(BaseModel):
    product_name: str = Field(..., max_length=255)
    category_name: Optional[str] = Field(None, max_length=100)
    sub_category_name: Optional[str] = Field(None, max_length=100)
    brand_name: Optional[str] = Field(None, max_length=150)

    stock_keeping_unit: str = Field(..., max_length=100)
    barcode_number: Optional[str] = Field(None, max_length=100)

    selling_price: Decimal = Field(..., gt=0)
    cost_price: Optional[Decimal] = Field(None, gt=0)
    discount_percentage: Optional[Decimal] = Field(Decimal("0"), ge=0, le=100)
    tax_percentage: Optional[Decimal] = Field(Decimal("0"), ge=0, le=100)

    minimum_order_quantity: int = Field(..., gt=0)
    available_stock_quantity: int = Field(0, ge=0)
    reorder_alert_level: Optional[int] = Field(0, ge=0)

    unit_of_measure: Optional[str] = Field(None, max_length=50)
    weight_in_kg: Optional[Decimal] = Field(None, ge=0)
    dimensions_in_cm: Optional[str] = Field(None, max_length=100)

    product_description: Optional[str] = None
    product_image_url: Optional[str] = None


# ──────────────────────────────────────────
# CREATE / UPDATE SCHEMAS
# ──────────────────────────────────────────

class ProductCreate(ProductBase):
    vendor_id: int


class ProductUpdate(BaseModel):
    product_name: Optional[str] = None
    category_name: Optional[str] = None
    sub_category_name: Optional[str] = None
    brand_name: Optional[str] = None
    selling_price: Optional[Decimal] = None
    cost_price: Optional[Decimal] = None
    discount_percentage: Optional[Decimal] = None
    tax_percentage: Optional[Decimal] = None
    reorder_alert_level: Optional[int] = None
    unit_of_measure: Optional[str] = None
    weight_in_kg: Optional[Decimal] = None
    dimensions_in_cm: Optional[str] = None
    product_description: Optional[str] = None
    product_image_url: Optional[str] = None
    minimum_order_quantity: Optional[int] = None
    is_active: Optional[bool] = None


class StockUpdateRequest(BaseModel):
    available_stock_quantity: int = Field(..., ge=0, description="New absolute stock quantity")


# ──────────────────────────────────────────
# FILTER / SORT QUERY
# ──────────────────────────────────────────

class ProductFilterQuery(BaseModel):
    search: Optional[str] = None          # full-text on product_name
    category_name: Optional[str] = None
    brand_name: Optional[str] = None
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None
    min_stock: Optional[int] = None
    is_active: Optional[bool] = True
    sort_by: Optional[str] = Field(None, description="Column to sort by e.g. selling_price, product_name")
    sort_dir: Optional[str] = Field("asc", description="asc | desc")


# ──────────────────────────────────────────
# PROJECTION DTO — MANUFACTURER CATALOG LIST
# ──────────────────────────────────────────

class ProductListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product_id: int
    vendor_id: int
    product_name: str
    category_name: Optional[str] = None
    sub_category_name: Optional[str] = None
    brand_name: Optional[str] = None
    stock_keeping_unit: str

    selling_price: Decimal
    available_stock_quantity: int

    # Computed fields
    effective_price: Decimal
    stock_status: str

    # AI-ready hook placeholders (no ML yet)
    vendor_reliability_score: Optional[float] = None
    demand_trend_indicator: Optional[str] = None


# ──────────────────────────────────────────
# FULL DETAIL DTO
# ──────────────────────────────────────────

class ProductDetailResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    product_id: int
    vendor_id: int
    is_active: bool

    effective_price: Decimal
    stock_status: str

    # AI-ready hook placeholders
    vendor_reliability_score: Optional[float] = None
    demand_trend_indicator: Optional[str] = None

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None