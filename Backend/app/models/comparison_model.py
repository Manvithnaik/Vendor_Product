from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class ComparisonTemplate(Base):
    __tablename__ = "comparison_templates"

    template_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    
    price_weight = Column(Float, nullable=False, default=1.0)
    stock_weight = Column(Float, nullable=False, default=1.0)
    reliability_weight = Column(Float, nullable=False, default=1.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
