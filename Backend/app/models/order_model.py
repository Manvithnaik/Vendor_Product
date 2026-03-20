from sqlalchemy import (
    Column,
    BigInteger,
    Integer,
    Numeric,
    TIMESTAMP,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Order(Base):
    __tablename__ = "orders"

    order_id = Column(BigInteger, primary_key=True, index=True)
    vendor_id = Column(BigInteger, ForeignKey("vendors.vendor_id"), nullable=False, index=True)

    total_amount = Column(Numeric(14, 2), nullable=False, default=0)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now())

    # Relationships
    order_items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    order_item_id = Column(BigInteger, primary_key=True, index=True)
    order_id = Column(BigInteger, ForeignKey("orders.order_id"), nullable=False, index=True)
    product_id = Column(BigInteger, ForeignKey("products.product_id"), nullable=False, index=True)

    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(12, 2), nullable=False)
    line_total = Column(Numeric(14, 2), nullable=False)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    # Relationship to Order only — Product relationship intentionally omitted (decoupled module)
    order = relationship("Order", back_populates="order_items")
