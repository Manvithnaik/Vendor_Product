from sqlalchemy.orm import configure_mappers
from app.models.vendor_model import Vendor
from app.models.product_model import Product
from app.models.order_model import Order, OrderItem

# Explicitly load all models so SQLAlchemy relationships referring to strings ("Vendor", "Product") resolve correctly
configure_mappers()
