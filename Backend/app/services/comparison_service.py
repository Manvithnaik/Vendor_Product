from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.product_model import Product
from app.models.comparison_model import ComparisonTemplate
from app.analytics.scoring_engine import ScoringEngine
from app.exceptions.domain_exceptions import ComparisonTemplateNotFoundException

class ComparisonService:
    @staticmethod
    def compare_products(
        db: Session, 
        product_ids: List[int], 
        template_id: Optional[int] = None
    ) -> List[dict]:
        if not product_ids:
            return []

        # Fetch products (ignoring status here since manufacturer explicitly selected them,
        # but theoretically should check for PUBLISHED if required)
        products = db.query(Product).filter(Product.product_id.in_(product_ids)).all()
        
        # Load or use default template
        if template_id:
            template = db.query(ComparisonTemplate).filter(ComparisonTemplate.template_id == template_id).first()
            if not template:
                raise ComparisonTemplateNotFoundException()
        else:
            # Default equal weights
            template = ComparisonTemplate(
                price_weight=1.0,
                stock_weight=1.0,
                reliability_weight=1.0
            )

        # Let the scoring engine handle the calculation
        return ScoringEngine.compute_comparison_scores(products, template)
