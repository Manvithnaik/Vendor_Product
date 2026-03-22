from sqlalchemy.orm import Session
from decimal import Decimal

from app.repository.product_repository import ProductRepository
from app.schemas.product_schema import (
    ProductCreate,
    ProductUpdate,
    StockUpdateRequest,
    ProductFilterQuery,
    ProductListItem,
    ProductDetailResponse,
    PaginatedApiResponse,
    ApiResponse,
    Pagination,
)
from app.exceptions.product_exceptions import (
    ProductNotFoundException,
    DuplicateSKUException,
)
from app.exceptions.domain_exceptions import InvalidProductStatusTransitionException
from app.models.product_model import ProductStatus
from app.services.search.sql_provider import SQLSearchProvider

class ProductService:

    # ── Mapping Helpers ───────────────────────────────────────────────

    @staticmethod
    def _to_list_item(product) -> ProductListItem:
        return ProductListItem(
            product_id=product.product_id,
            vendor_id=product.vendor_id,
            product_name=product.product_name,
            category_name=product.category_name,
            sub_category_name=product.sub_category_name,
            brand_name=product.brand_name,
            stock_keeping_unit=product.stock_keeping_unit,
            selling_price=product.selling_price,
            available_stock_quantity=product.available_stock_quantity,
            effective_price=Decimal(str(product.get_effective_price())),
            stock_status=product.get_stock_status(),
            vendor_reliability_score=product.vendor.vendor_rating if product.vendor else None,
            demand_trend_indicator=None,
        )

    @staticmethod
    def _to_detail(product) -> ProductDetailResponse:
        return ProductDetailResponse(
            product_id=product.product_id,
            vendor_id=product.vendor_id,
            status=product.status,
            product_name=product.product_name,
            category_name=product.category_name,
            sub_category_name=product.sub_category_name,
            brand_name=product.brand_name,
            stock_keeping_unit=product.stock_keeping_unit,
            barcode_number=product.barcode_number,
            selling_price=product.selling_price,
            cost_price=product.cost_price,
            discount_percentage=product.discount_percentage,
            tax_percentage=product.tax_percentage,
            minimum_order_quantity=product.minimum_order_quantity,
            available_stock_quantity=product.available_stock_quantity,
            reserved_stock_quantity=product.reserved_stock_quantity,
            reorder_alert_level=product.reorder_alert_level,
            unit_of_measure=product.unit_of_measure,
            weight_in_kg=product.weight_in_kg,
            dimensions_in_cm=product.dimensions_in_cm,
            product_description=product.product_description,
            product_image_url=product.product_image_url,
            effective_price=Decimal(str(product.get_effective_price())),
            stock_status=product.get_stock_status(),
            vendor_reliability_score=product.vendor.vendor_rating if product.vendor else None,
            demand_trend_indicator=None,
            created_at=product.created_at,
            updated_at=product.updated_at,
        )

    @staticmethod
    def _pagination(page: int, limit: int, total: int) -> Pagination:
        import math
        return Pagination(
            page=page,
            limit=limit,
            total_records=total,
            total_pages=math.ceil(total / limit) if limit > 0 else 0,
        )

    # ── Manufacturer Catalog ──────────────────────────────────────────

    @staticmethod
    async def get_catalog(
        db: Session,
        filters: ProductFilterQuery,
        page: int,
        limit: int,
    ) -> PaginatedApiResponse:
        
        # USE SEARCH PROVIDER ABSTRACTION
        provider = SQLSearchProvider()
        products, total = provider.search_catalog(db, filters, page, limit)
        
        return PaginatedApiResponse(
            status="success",
            message=f"{total} product(s) found.",
            data=[ProductService._to_list_item(p) for p in products],
            pagination=ProductService._pagination(page, limit, total),
        )

    @staticmethod
    async def get_product_detail(db: Session, product_id: int) -> ApiResponse:
        product = ProductRepository.get_by_id(db, product_id)
        if not product:
            raise ProductNotFoundException(product_id)
        return ApiResponse(
            status="success",
            message="Product retrieved.",
            data=ProductService._to_detail(product),
        )

    # ── Vendor Management ─────────────────────────────────────────────

    @staticmethod
    async def get_vendor_products(
        db: Session, vendor_id: int, page: int, limit: int
    ) -> PaginatedApiResponse:
        products, total = ProductRepository.get_by_vendor(db, vendor_id, page, limit)
        return PaginatedApiResponse(
            status="success",
            message=f"{total} product(s) for vendor {vendor_id}.",
            data=[ProductService._to_list_item(p) for p in products],
            pagination=ProductService._pagination(page, limit, total),
        )

    @staticmethod
    async def create_product(db: Session, payload: ProductCreate) -> ApiResponse:
        if ProductRepository.get_by_sku(db, payload.stock_keeping_unit):
            raise DuplicateSKUException(payload.stock_keeping_unit)
        # created product naturally defaults to ProductStatus.DRAFT per the model
        product = ProductRepository.create(db, payload)
        return ApiResponse(
            status="success",
            message="Product created successfully as DRAFT.",
            data=ProductService._to_detail(product),
        )

    @staticmethod
    async def update_product(
        db: Session, product_id: int, payload: ProductUpdate
    ) -> ApiResponse:
        product = ProductRepository.get_by_id(db, product_id)
        if not product:
            raise ProductNotFoundException(product_id)
            
        # State machine transition guard
        if payload.status:
            if payload.status == ProductStatus.PUBLISHED and product.status != ProductStatus.PENDING_REVIEW:
                raise InvalidProductStatusTransitionException("Only PENDING_REVIEW products can be PUBLISHED")
            if payload.status == ProductStatus.PENDING_REVIEW and product.status != ProductStatus.DRAFT:
                raise InvalidProductStatusTransitionException("Only DRAFT products can be submitted for review")
                
        product = ProductRepository.update(db, product, payload)
        return ApiResponse(
            status="success",
            message="Product updated successfully.",
            data=ProductService._to_detail(product),
        )

    @staticmethod
    async def update_stock(
        db: Session, product_id: int, payload: StockUpdateRequest
    ) -> ApiResponse:
        product = ProductRepository.get_by_id(db, product_id)
        if not product:
            raise ProductNotFoundException(product_id)
        product = ProductRepository.update_stock(db, product, payload.available_stock_quantity)
        return ApiResponse(
            status="success",
            message=f"Stock updated to {payload.available_stock_quantity} units.",
            data=ProductService._to_detail(product),
        )

    @staticmethod
    async def soft_delete_product(db: Session, product_id: int) -> ApiResponse:
        product = ProductRepository.get_by_id(db, product_id)
        if not product:
            raise ProductNotFoundException(product_id)
            
        # Instead of is_active=False, we move it to ARCHIVED
        product.status = ProductStatus.ARCHIVED
        db.commit()
        db.refresh(product)
        
        return ApiResponse(
            status="success",
            message=f"Product {product_id} deactivated (soft deleted).",
            data=None,
        )
