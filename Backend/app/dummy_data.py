from sqlalchemy.orm import Session
from app.core.database import SessionLocal
import app.models
from app.models.product_model import ProductStatus  # This initializes all models & configures mappers

Vendor = app.models.Vendor
Product = app.models.Product

def seed_data():
    db = SessionLocal()
    try:
        # Check if already fully seeded
        if db.query(Vendor).count() >= 3 and db.query(Product).count() >= 6:
            print("[SUCCESS] Seed data already fully populated - skipping.")
            return

        print("[WARNING] Incomplete or legacy dummy data detected. Resetting catalog for dummy data...")
        
        # Clear out tables to ensure a clean state, avoiding unique constraint conflicts
        db.query(Product).delete()
        db.query(Vendor).delete()
        db.commit()

        # ── 1. Seed Vendors ───────────────────────────────────────────
        vendors = [
            Vendor(
                vendor_id=1,
                company_name="TATA Steel Supplies",
                contact_name="Rajesh Kumar",
                contact_email="rajesh@tatasupplies.com",
                contact_phone="+91-9800000001",
                city="Mumbai",
                state="Maharashtra",
                country="India",
                gst_number="27AABCT1234A1Z5",
                is_active=True,
            ),
            Vendor(
                vendor_id=2,
                company_name="Finolex Industries",
                contact_name="Priya Sharma",
                contact_email="priya@finolex.in",
                contact_phone="+91-9800000002",
                city="Pune",
                state="Maharashtra",
                country="India",
                gst_number="27AACFI5678B2Z9",
                is_active=True,
            ),
            Vendor(
                vendor_id=3,
                company_name="Hindalco Metal Works",
                contact_name="Amit Singh",
                contact_email="amit@hindalco.com",
                contact_phone="+91-9800000003",
                city="Bengaluru",
                state="Karnataka",
                country="India",
                gst_number="29AABCH9012C3Z1",
                is_active=True,
            ),
        ]
        db.add_all(vendors)
        db.flush()  # assign IDs before inserting products

        # ── 2. Seed Products ────────────────────────────────────────────
        products = [
            Product(
                product_id=1,
                vendor_id=1,
                product_name="Industrial Steel Rod",
                category_name="Steel",
                sub_category_name="Structural",
                brand_name="TATA",
                stock_keeping_unit="STL-001",
                selling_price=500,
                cost_price=380,
                discount_percentage=5,
                tax_percentage=18,
                minimum_order_quantity=10,
                available_stock_quantity=120,
                reorder_alert_level=30,
                unit_of_measure="kg",
                product_description="High-tensile industrial steel rod for structural applications.",
                status=ProductStatus.PUBLISHED,
            ),
            Product(
                product_id=2,
                vendor_id=2,
                product_name="Copper Wire Roll",
                category_name="Electrical",
                sub_category_name="Wiring",
                brand_name="Finolex",
                stock_keeping_unit="CPR-002",
                selling_price=1200,
                cost_price=950,
                discount_percentage=3,
                tax_percentage=18,
                minimum_order_quantity=5,
                available_stock_quantity=40,
                reorder_alert_level=20,
                unit_of_measure="roll",
                product_description="Premium copper wire roll for electrical installations.",
                status=ProductStatus.PUBLISHED,
            ),
            Product(
                product_id=3,
                vendor_id=3,
                product_name="Aluminium Sheet 3mm",
                category_name="Metal",
                sub_category_name="Sheet Metal",
                brand_name="Hindalco",
                stock_keeping_unit="AL-003",
                selling_price=900,
                cost_price=710,
                discount_percentage=2,
                tax_percentage=18,
                minimum_order_quantity=8,
                available_stock_quantity=10,
                reorder_alert_level=15,
                unit_of_measure="sheet",
                product_description="3mm aluminium sheet, ideal for fabrication and cladding.",
                status=ProductStatus.PUBLISHED,
            ),
            Product(
                product_id=4,
                vendor_id=1,
                product_name="MS Angle Iron 50x50mm",
                category_name="Steel",
                sub_category_name="Angles",
                brand_name="TATA",
                stock_keeping_unit="STL-004",
                selling_price=320,
                cost_price=240,
                discount_percentage=4,
                tax_percentage=18,
                minimum_order_quantity=20,
                available_stock_quantity=250,
                reorder_alert_level=50,
                unit_of_measure="meter",
                product_description="Mild steel angle iron for construction and framing.",
                status=ProductStatus.PUBLISHED,
            ),
            Product(
                product_id=5,
                vendor_id=2,
                product_name="PVC Conduit Pipe 25mm",
                category_name="Electrical",
                sub_category_name="Conduits",
                brand_name="Finolex",
                stock_keeping_unit="PVC-005",
                selling_price=180,
                cost_price=130,
                discount_percentage=0,
                tax_percentage=12,
                minimum_order_quantity=50,
                available_stock_quantity=5,
                reorder_alert_level=30,
                unit_of_measure="piece",
                product_description="Rigid PVC conduit for electrical cabling protection.",
                status=ProductStatus.PUBLISHED,
            ),
            Product(
                product_id=6,
                vendor_id=3,
                product_name="Stainless Steel Plate 6mm",
                category_name="Metal",
                sub_category_name="Plates",
                brand_name="Hindalco",
                stock_keeping_unit="SS-006",
                selling_price=2400,
                cost_price=1900,
                discount_percentage=3,
                tax_percentage=18,
                minimum_order_quantity=3,
                available_stock_quantity=60,
                reorder_alert_level=10,
                unit_of_measure="sheet",
                product_description="Grade 304 stainless steel plate for industrial use.",
                status=ProductStatus.PUBLISHED,
            ),
        ]
        db.add_all(products)
        db.commit()
        print("[SUCCESS] Seed data inserted: 3 vendors, 6 products.")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()