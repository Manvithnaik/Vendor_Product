from typing import List, Dict, Any
from app.models.product_model import Product
from app.models.vendor_model import Vendor
from app.models.comparison_model import ComparisonTemplate

class ScoringEngine:
    @staticmethod
    def compute_comparison_scores(products: List[Product], template: ComparisonTemplate) -> List[Dict[str, Any]]:
        """
        Deterministic scoring based on weights.
        Returns a list of scored products with breakdown.
        """
        if not products:
            return []

        # Find extremes for normalization
        max_price = max(p.selling_price for p in products) if products else 1
        min_price = min(p.selling_price for p in products) if products else 1
        max_stock = max(p.available_stock_quantity for p in products) if products else 1

        results = []
        for p in products:
            # Price Score: lower price = higher score
            price_score = float(min_price / p.selling_price) * template.price_weight if p.selling_price else 0

            # Stock Score: higher stock = higher score
            stock_score = (p.available_stock_quantity / max_stock) * template.stock_weight if max_stock > 0 else 0

            # Reliability Score
            vendor_rating = p.vendor.vendor_rating if p.vendor else 0.0
            reliability_score = (vendor_rating / 5.0) * template.reliability_weight

            total_score = price_score + stock_score + reliability_score

            # Risk Level calculation (strict rule based)
            risk_level = "LOW"
            if stock_score < (0.2 * template.stock_weight) or vendor_rating < 2.5:
                risk_level = "HIGH"
            elif stock_score < (0.5 * template.stock_weight) or vendor_rating < 4.0:
                risk_level = "MEDIUM"

            results.append({
                "product_id": p.product_id,
                "vendor_id": p.vendor_id,
                "price_score": round(price_score, 2),
                "stock_score": round(stock_score, 2),
                "reliability_score": round(reliability_score, 2),
                "total_score": round(total_score, 2),
                "risk_level": risk_level
            })

        # Rank them
        results.sort(key=lambda x: x["total_score"], reverse=True)
        for idx, res in enumerate(results):
            res["rank"] = idx + 1

        return results
