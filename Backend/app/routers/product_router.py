from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from decimal import Decimal

from app.core.database import get_db
from app.schemas.product_schema import (
    ProductCreate,
    ProductUpdate,
    StockUpdateRequest,
    ProductFilterQuery,
)
from app.services.product_service import ProductService
from app.analytics.catalog_analytics_service import CatalogAnalyticsService

router = APIRouter()


# ══════════════════════════════════════════════════════════════════════
# MANUFACTURER CATALOG — Read-only, active products only
# ══════════════════════════════════════════════════════════════════════

catalog_router = APIRouter(prefix="/catalog", tags=["📦 Manufacturer Catalog"])


@catalog_router.get(
    "/",
    summary="Browse Product Catalog",
    description="Paginated, filterable, sortable list of active products. Returns projection DTO with computed fields.",
)
async def get_catalog(
    search: Optional[str] = Query(None, description="Search by product name"),
    category_name: Optional[str] = Query(None),
    brand_name: Optional[str] = Query(None),
    min_price: Optional[Decimal] = Query(None),
    max_price: Optional[Decimal] = Query(None),
    min_stock: Optional[int] = Query(None),
    sort_by: Optional[str] = Query(None, description="selling_price | product_name | available_stock_quantity | created_at"),
    sort_dir: Optional[str] = Query("asc", description="asc | desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    filters = ProductFilterQuery(
        search=search,
        category_name=category_name,
        brand_name=brand_name,
        min_price=min_price,
        max_price=max_price,
        min_stock=min_stock,
        is_active=True,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    return await ProductService.get_catalog(db, filters, page, limit)


@catalog_router.get(
    "/{product_id}",
    summary="Get Product Detail",
    description="Full product detail including all fields, computed effective_price and stock_status.",
)
async def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    return await ProductService.get_product_detail(db, product_id)


# ══════════════════════════════════════════════════════════════════════
# VENDOR MANAGEMENT — Vendor's own product operations
# ══════════════════════════════════════════════════════════════════════

vendor_router = APIRouter(prefix="/vendor", tags=["🏭 Vendor Management"])


@vendor_router.get(
    "/{vendor_id}/products",
    summary="List Vendor's Products",
    description="Returns all products (active and inactive) for a given vendor, paginated.",
)
async def get_vendor_products(
    vendor_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return await ProductService.get_vendor_products(db, vendor_id, page, limit)


@vendor_router.post(
    "/products",
    summary="Create Product",
    description="Vendor creates a new product. SKU must be globally unique.",
    status_code=201,
)
async def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    return await ProductService.create_product(db, payload)


@vendor_router.patch(
    "/products/{product_id}",
    summary="Update Product",
    description="Partial update of product fields. Send only the fields you want to change.",
)
async def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
):
    return await ProductService.update_product(db, product_id, payload)


@vendor_router.patch(
    "/products/{product_id}/stock",
    summary="Update Stock Quantity",
    description="Sets the stock quantity to the provided absolute value. Use this for inventory adjustments.",
)
async def update_stock(
    product_id: int,
    payload: StockUpdateRequest,
    db: Session = Depends(get_db),
):
    return await ProductService.update_stock(db, product_id, payload)


@vendor_router.delete(
    "/products/{product_id}",
    summary="Soft Delete Product",
    description="Deactivates a product (is_active=False). Row is never removed from DB.",
)
async def soft_delete_product(product_id: int, db: Session = Depends(get_db)):
    return await ProductService.soft_delete_product(db, product_id)


# ══════════════════════════════════════════════════════════════════════
# ANALYTICS — Catalog intelligence endpoints
# ══════════════════════════════════════════════════════════════════════

analytics_router = APIRouter(prefix="/analytics", tags=["📊 Catalog Analytics"])


@analytics_router.get(
    "/summary",
    summary="Catalog Summary",
    description="Total active products, low-stock count, out-of-stock count, and category distribution.",
)
async def get_catalog_summary(db: Session = Depends(get_db)):
    return await CatalogAnalyticsService.get_catalog_summary(db)


@analytics_router.get(
    "/low-stock",
    summary="Low Stock Products",
    description="Products where available quantity is at or below the reorder alert level.",
)
async def get_low_stock(db: Session = Depends(get_db)):
    return await CatalogAnalyticsService.get_low_stock_list(db)


@analytics_router.get(
    "/categories",
    summary="Category Distribution",
    description="Number of active products per category. Useful for pie/bar charts.",
)
async def get_category_distribution(db: Session = Depends(get_db)):
    return await CatalogAnalyticsService.get_category_distribution(db)


# ── Export composite router ───────────────────────────────────────────
router = APIRouter()
router.include_router(catalog_router)
router.include_router(vendor_router)
router.include_router(analytics_router)
