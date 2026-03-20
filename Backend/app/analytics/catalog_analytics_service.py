from sqlalchemy.orm import Session

from app.repository.product_repository import ProductRepository
from app.schemas.analytics_schema import (
    CatalogSummary,
    LowStockItem,
    CategoryDistribution,
)
from app.schemas.product_schema import ApiResponse


class CatalogAnalyticsService:

    @staticmethod
    async def get_catalog_summary(db: Session) -> ApiResponse:
        total_active = ProductRepository.get_active_count(db)
        low_stock_products = ProductRepository.get_low_stock_products(db)
        out_of_stock = ProductRepository.get_out_of_stock_count(db)
        category_rows = ProductRepository.get_category_distribution(db)

        summary = CatalogSummary(
            total_active_products=total_active,
            low_stock_count=len(low_stock_products),
            out_of_stock_count=out_of_stock,
            category_distribution=[
                CategoryDistribution(
                    category_name=row.category_name,
                    product_count=row.product_count,
                )
                for row in category_rows
            ],
        )

        return ApiResponse(
            status="success",
            message="Catalog summary retrieved.",
            data=summary,
        )

    @staticmethod
    async def get_low_stock_list(db: Session) -> ApiResponse:
        products = ProductRepository.get_low_stock_products(db)
        items = [
            LowStockItem(
                product_id=p.product_id,
                product_name=p.product_name,
                stock_keeping_unit=p.stock_keeping_unit,
                available_stock_quantity=p.available_stock_quantity,
                reorder_alert_level=p.reorder_alert_level,
                vendor_id=p.vendor_id,
            )
            for p in products
        ]
        return ApiResponse(
            status="success",
            message=f"{len(items)} low-stock product(s) found.",
            data=items,
        )

    @staticmethod
    async def get_category_distribution(db: Session) -> ApiResponse:
        rows = ProductRepository.get_category_distribution(db)
        distribution = [
            CategoryDistribution(
                category_name=row.category_name,
                product_count=row.product_count,
            )
            for row in rows
        ]
        return ApiResponse(
            status="success",
            message=f"{len(distribution)} categories found.",
            data=distribution,
        )
