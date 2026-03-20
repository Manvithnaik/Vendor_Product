from sqlalchemy.orm import Session
from sqlalchemy import func, asc, desc

from app.models.product_model import Product
from app.schemas.product_schema import ProductCreate, ProductUpdate, ProductFilterQuery


# ──────────────────────────────────────────
# ALLOWED SORT COLUMNS (whitelist for safety)
# ──────────────────────────────────────────
SORTABLE_COLUMNS = {
    "product_name": Product.product_name,
    "selling_price": Product.selling_price,
    "available_stock_quantity": Product.available_stock_quantity,
    "created_at": Product.created_at,
    "category_name": Product.category_name,
    "brand_name": Product.brand_name,
}


class ProductRepository:

    # ── Single-Record Lookups ─────────────────────────────────────────

    @staticmethod
    def get_by_id(db: Session, product_id: int) -> Product | None:
        return db.query(Product).filter(Product.product_id == product_id).first()

    @staticmethod
    def get_by_sku(db: Session, sku: str) -> Product | None:
        return db.query(Product).filter(Product.stock_keeping_unit == sku).first()

    # ── Manufacturer Catalog (filtered + sorted + paginated) ──────────

    @staticmethod
    def get_catalog(
        db: Session,
        filters: ProductFilterQuery,
        page: int,
        limit: int,
    ) -> tuple[list[Product], int]:
        query = db.query(Product).filter(Product.is_active == True)

        if filters.search:
            query = query.filter(
                Product.product_name.ilike(f"%{filters.search}%")
            )
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

        # Sorting
        sort_col = SORTABLE_COLUMNS.get(filters.sort_by or "", Product.created_at)
        sort_fn = desc if (filters.sort_dir or "asc").lower() == "desc" else asc
        query = query.order_by(sort_fn(sort_col))

        total = query.count()
        items = query.offset((page - 1) * limit).limit(limit).all()
        return items, total

    # ── Vendor-Scoped product list ────────────────────────────────────

    @staticmethod
    def get_by_vendor(
        db: Session,
        vendor_id: int,
        page: int,
        limit: int,
    ) -> tuple[list[Product], int]:
        query = (
            db.query(Product)
            .filter(Product.vendor_id == vendor_id)
            .order_by(desc(Product.created_at))
        )
        total = query.count()
        items = query.offset((page - 1) * limit).limit(limit).all()
        return items, total

    # ── CRUD ──────────────────────────────────────────────────────────

    @staticmethod
    def create(db: Session, payload: ProductCreate) -> Product:
        product = Product(**payload.model_dump())
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def update(db: Session, product: Product, payload: ProductUpdate) -> Product:
        update_data = payload.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(product, field, value)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def update_stock(db: Session, product: Product, qty: int) -> Product:
        product.available_stock_quantity = qty
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def soft_delete(db: Session, product: Product) -> None:
        """Soft delete: sets is_active=False. Row is never removed."""
        product.is_active = False
        db.commit()

    # ── Analytics Queries ─────────────────────────────────────────────

    @staticmethod
    def get_active_count(db: Session) -> int:
        return db.query(Product).filter(Product.is_active == True).count()

    @staticmethod
    def get_low_stock_products(db: Session) -> list[Product]:
        return (
            db.query(Product)
            .filter(
                Product.is_active == True,
                Product.available_stock_quantity > 0,
                Product.available_stock_quantity <= Product.reorder_alert_level,
            )
            .order_by(asc(Product.available_stock_quantity))
            .all()
        )

    @staticmethod
    def get_out_of_stock_count(db: Session) -> int:
        return (
            db.query(Product)
            .filter(Product.is_active == True, Product.available_stock_quantity <= 0)
            .count()
        )

    @staticmethod
    def get_category_distribution(db: Session) -> list[tuple]:
        return (
            db.query(Product.category_name, func.count(Product.product_id).label("product_count"))
            .filter(Product.is_active == True)
            .group_by(Product.category_name)
            .order_by(desc("product_count"))
            .all()
        )
