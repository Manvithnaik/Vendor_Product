from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.product_model import Product, ProductStatus

class DemandAnalyzer:
    @staticmethod
    def get_recent_demand(db: Session, product_id: int) -> int:
        """
        Analyzes recent demand volume.
        (Placeholder for timeseries DB query or Order query)
        """
        return 0

    @staticmethod
    def get_category_average_price(db: Session, category_name: str) -> float:
        """
        Computes the current category average selling price.
        """
        result = db.query(func.avg(Product.selling_price)).filter(
            Product.category_name == category_name,
            Product.status == ProductStatus.PUBLISHED
        ).scalar()
        
        return float(result) if result else 0.0
