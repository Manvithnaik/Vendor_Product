from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from typing import Tuple, List

from app.models.product_model import Product, ProductStatus
from app.schemas.product_schema import ProductFilterQuery
from app.services.search.base_provider import SearchProvider

SORTABLE_COLUMNS = {
    "product_name": Product.product_name,
    "selling_price": Product.selling_price,
    "available_stock_quantity": Product.available_stock_quantity,
    "created_at": Product.created_at,
    "category_name": Product.category_name,
    "brand_name": Product.brand_name,
}

class SQLSearchProvider(SearchProvider):
    def search_catalog(self, db: Session, filters: ProductFilterQuery, page: int, limit: int) -> Tuple[List[Product], int]:
        # Always enforce PUBLISHED status for the public catalog
        query = db.query(Product).filter(Product.status == ProductStatus.PUBLISHED)

        if filters.search:
            query = query.filter(Product.product_name.ilike(f"%{filters.search}%"))
        if filters.category_name:
            query = query.filter(Product.category_name == filters.category_name)
        if filters.brand_name:
            query = query.filter(Product.brand_name == filters.brand_name)
        if filters.min_price is not None:
            query = query.filter(Product.selling_price >= filters.min_price)
        if filters.max_price is not None:
            query = query.filter(Product.selling_price <= filters.max_price)
        if filters.min_stock is not None:
            query = query.filter(Product.available_stock_quantity >= filters.min_stock)
            
        # Optional dynamic status filter (if admins use this, but usually catalog is strictly PUBLISHED)
        if filters.status and filters.status != ProductStatus.PUBLISHED:
            # Override if explicitly requested and permitted (but standard catalog calls won't pass this)
            query = db.query(Product).filter(Product.status == filters.status)

        # Sorting
        sort_col = SORTABLE_COLUMNS.get(filters.sort_by or "", Product.created_at)
        sort_fn = desc if (filters.sort_dir or "asc").lower() == "desc" else asc
        query = query.order_by(sort_fn(sort_col))

        total = query.count()
        items = query.offset((page - 1) * limit).limit(limit).all()
        return items, total
