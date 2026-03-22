from typing import List, Dict, Any
from app.models.product_model import Product

class AlertEngine:
    @staticmethod
    def generate_stock_alerts(product: Product, incoming_request_qty: int = 0) -> List[str]:
        alerts = []
        name = product.product_name

        if product.available_stock_quantity <= product.reorder_alert_level * 0.5:
            alerts.append(f"Available stock for Product {name} is in the critical range and may not fulfill upcoming demand.")
        elif product.available_stock_quantity <= product.reorder_alert_level:
            alerts.append(f"Available stock for Product {name} has reached the reorder threshold.")

        if (product.reserved_stock_quantity + incoming_request_qty) > product.available_stock_quantity:
            alerts.append(f"Current stock reservations for Product {name} may exceed available inventory.")

        return alerts

    @staticmethod
    def generate_demand_alerts(product: Product, requested_qty_last_24h: int) -> List[str]:
        alerts = []
        if requested_qty_last_24h > product.available_stock_quantity:
            alerts.append(f"Recent demand for Product {product.product_name} exceeds current available inventory.")
        return alerts

    @staticmethod
    def generate_price_alerts(vendor_name: str, vendor_price: float, category_avg_price: float) -> List[str]:
        alerts = []
        if vendor_price < category_avg_price * 0.9:
            alerts.append(f"The quoted price from Vendor {vendor_name} is below the category average.")
        return alerts

    @staticmethod
    def generate_best_vendor_alert(vendor_name: str) -> str:
        return f"Vendor {vendor_name} is currently the most suitable option based on price competitiveness and stock availability."
