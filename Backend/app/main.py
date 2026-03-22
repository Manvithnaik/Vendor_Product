from contextlib import asynccontextmanager
# trigger reload
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ── Import ALL models so SQLAlchemy registers them before create_all ──
from app.models import vendor_model    # noqa: F401
from app.models import product_model   # noqa: F401
from app.models import order_model     # noqa: F401
from app.models import rfq_model       # noqa: F401
from app.models import comparison_model # noqa: F401

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
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from app.exceptions.domain_exceptions import BaseDomainException

# ── Global Exception Handlers ────────────────────────────────────────
@app.exception_handler(BaseDomainException)
async def domain_exception_handler(request: Request, exc: BaseDomainException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": "error", "message": exc.message, "data": None}
    )

# @app.exception_handler(SQLAlchemyError)
# async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
#     # Log the raw exception internally here in a real app
#     return JSONResponse(
#         status_code=500,
#         content={"status": "error", "message": "A database error occurred.", "data": None}
#     )


# ── Routes ────────────────────────────────────────────────────────────
from app.routers.rfq_router import router as rfq_router
from app.routers.comparison_router import router as comparison_router
from app.routers.integration_router import router as integration_router

app.include_router(product_router)
app.include_router(rfq_router)
app.include_router(comparison_router)
app.include_router(integration_router)

@app.get("/", tags=["Health"], summary="Health Check")
async def root():
    return {"status": "ok", "message": "Procurement Decision Platform Running"}


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