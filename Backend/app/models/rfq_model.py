import enum
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class RFQRequestStatus(str, enum.Enum):
    PENDING = "PENDING"
    RESPONDED = "RESPONDED"
    CLOSED = "CLOSED"
    EXPIRED = "EXPIRED"

class RFQResponseStatus(str, enum.Enum):
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    COUNTERED = "COUNTERED"

class RFQRequest(Base):
    __tablename__ = "rfq_requests"

    rfq_id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False, index=True)
    manufacturer_id = Column(Integer, nullable=False, index=True) # Assuming manufacturer IDs exist loosely
    
    requested_quantity = Column(Integer, nullable=False)
    message = Column(Text)
    
    status = Column(Enum(RFQRequestStatus), default=RFQRequestStatus.PENDING, nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    product = relationship("Product")
    responses = relationship("RFQResponse", back_populates="rfq_request")

class RFQResponse(Base):
    __tablename__ = "rfq_responses"

    response_id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfq_requests.rfq_id"), nullable=False, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"), nullable=False, index=True)
    
    quoted_price = Column(Float, nullable=False)
    available_quantity = Column(Integer, nullable=False)
    
    status = Column(Enum(RFQResponseStatus), nullable=True, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    rfq_request = relationship("RFQRequest", back_populates="responses")
    vendor = relationship("Vendor")
