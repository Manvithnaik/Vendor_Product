from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Text,
    TIMESTAMP,
    Float
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Vendor(Base):
    __tablename__ = "vendors"

    vendor_id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    company_name = Column(String(255), nullable=False, index=True)
    contact_name = Column(String(150))
    contact_email = Column(String(255), unique=True, index=True)
    contact_phone = Column(String(50))

    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100), default="India")
    pincode = Column(String(20))

    gst_number = Column(String(50), unique=True)
    pan_number = Column(String(30))

    is_active = Column(Boolean, default=True, index=True)

    # Reliability Metrics
    vendor_rating = Column(Float, default=0.0)
    fulfillment_rate = Column(Float, default=0.0)
    late_delivery_percentage = Column(Float, default=0.0)
    avg_response_time = Column(Float, default=0.0)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now())

    # Back-reference to products
    products = relationship(lambda: __import__('app.models.product_model', fromlist=['Product']).Product, back_populates="vendor")
