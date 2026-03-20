from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ── Import ALL models so SQLAlchemy registers them before create_all ──
from app.models import product_model   # noqa: F401
from app.models import vendor_model    # noqa: F401
from app.models import order_model     # noqa: F401

from app.core.database import engine, Base
from app.routers.product_router import router as product_router
from app.dummy_data import seed_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ───────────────────────────────────────────────────────
    Base.metadata.create_all(bind=engine)
    seed_data()
    yield
    # ── Shutdown (nothing needed) ─────────────────────────────────────


app = FastAPI(
    title="Vendor Product Catalog API",
    description=(
        "**Enterprise B2B Product Catalog Module**\n\n"
        "- 📦 **Manufacturer Catalog** — browse, filter, sort, search active products\n"
        "- 🏭 **Vendor Management** — create, update, manage stock, soft-delete\n"
        "- 📊 **Analytics** — low-stock alerts, category distribution, catalog KPIs\n\n"
        "All responses follow the unified envelope: `{ status, message, data, pagination? }`"
    ),
    version="1.0.0",
    contact={"name": "Product Catalog Module"},
    license_info={"name": "Proprietary"},
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────
app.include_router(product_router)


@app.get("/", tags=["Health"], summary="Health Check")
async def root():
    return {"status": "ok", "message": "Product Catalog Module Running"}


@app.post("/seed", tags=["Dev"], summary="Re-seed dummy data (dev only)")
async def reseed():
    """Drop all rows and re-insert seed data. Dev convenience endpoint."""
    from app.core.database import SessionLocal
    from app.models.product_model import Product
    from app.models.vendor_model import Vendor
    db = SessionLocal()
    try:
        db.query(Product).delete()
        db.query(Vendor).delete()
        db.commit()
    finally:
        db.close()
    seed_data()
    return {"status": "ok", "message": "Database re-seeded."}