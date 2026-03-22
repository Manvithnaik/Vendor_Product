from sqlalchemy import (
    Column,
    BigInteger,
    Integer,
    String,
    Numeric,
    Boolean,
    Text,
    TIMESTAMP,
    ForeignKey,
    Index,
    Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from app.models.vendor_model import Vendor
import enum

class ProductStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PENDING_REVIEW = "PENDING_REVIEW"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"

class Product(Base):
    __tablename__ = "products"

    product_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"), nullable=False, index=True)

    product_name = Column(String(255), nullable=False, index=True)
    category_name = Column(String(100), index=True)
    sub_category_name = Column(String(100))
    brand_name = Column(String(150))

    stock_keeping_unit = Column(String(100), unique=True, nullable=False)
    barcode_number = Column(String(100))

    selling_price = Column(Numeric(12, 2), nullable=False)
    cost_price = Column(Numeric(12, 2))
    discount_percentage = Column(Numeric(5, 2), default=0)
    tax_percentage = Column(Numeric(5, 2), default=0)

    minimum_order_quantity = Column(Integer, nullable=False)
    available_stock_quantity = Column(Integer, nullable=False, default=0)
    reserved_stock_quantity = Column(Integer, nullable=False, default=0)
    reorder_alert_level = Column(Integer, default=0)

    unit_of_measure = Column(String(50))
    weight_in_kg = Column(Numeric(8, 3))
    dimensions_in_cm = Column(String(100))

    product_description = Column(Text)
    product_image_url = Column(String(255))

    status = Column(Enum(ProductStatus), default=ProductStatus.DRAFT, nullable=False, index=True)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now())

    # Relationship to Vendor (within module scope)
    vendor = relationship(lambda: __import__('app.models.vendor_model', fromlist=['Vendor']).Vendor, back_populates="products")
    # NOTE: OrderItem relationship intentionally omitted — order module is decoupled.

    # Composite Indexes for heavy filtering
    __table_args__ = (
        Index("idx_product_category_price", "category_name", "selling_price"),
        Index("idx_product_stock_alert", "available_stock_quantity", "reorder_alert_level"),
    )

    # -------- Helper Methods (Domain Logic) -------- #

    def get_effective_price(self):
        """
        Final price after discount + tax
        """
        discount_amount = (self.discount_percentage / 100) * self.selling_price
        price_after_discount = self.selling_price - discount_amount
        tax_amount = (self.tax_percentage / 100) * price_after_discount
        return round(price_after_discount + tax_amount, 2)

    def get_stock_status(self):
        """
        Stock health indicator
        """
        if self.available_stock_quantity <= 0:
            return "OUT_OF_STOCK"
        elif self.available_stock_quantity <= self.reorder_alert_level:
            return "LOW_STOCK"
        else:
            return "IN_STOCK"