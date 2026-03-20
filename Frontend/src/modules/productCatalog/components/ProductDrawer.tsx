import React, { useEffect, useState } from "react";
import type { ProductListItem, ProductDetail } from "../types/product";
import { catalogApi } from "../services/productService";
import StockBadge from "./StockBadge";

interface Props {
    product: ProductListItem | null;
    onClose: () => void;
}

const row = (label: string, value: React.ReactNode) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e293b" }}>
        <span style={{ color: "#64748b", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {label}
        </span>
        <span style={{ color: "#e2e8f0", fontSize: "13px", maxWidth: "55%", textAlign: "right" }}>
            {value ?? "—"}
        </span>
    </div>
);

const ProductDrawer: React.FC<Props> = ({ product, onClose }) => {
    const [detail, setDetail] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!product) { setDetail(null); return; }
        setLoading(true);
        catalogApi.getProductDetail(product.product_id)
            .then((res) => setDetail(res.data))
            .catch(() => setDetail(null))
            .finally(() => setLoading(false));
    }, [product?.product_id]);

    if (!product) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0,
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(2px)",
                    zIndex: 40,
                }}
            />
            {/* Drawer */}
            <aside
                style={{
                    position: "fixed", top: 0, right: 0, bottom: 0,
                    width: "420px",
                    background: "#0f172a",
                    borderLeft: "1px solid #1e293b",
                    zIndex: 50,
                    overflowY: "auto",
                    display: "flex", flexDirection: "column",
                    animation: "slideIn 0.22s ease",
                }}
            >
                <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

                {/* Header */}
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                        <p style={{ margin: 0, fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Product Detail
                        </p>
                        <h2 style={{ margin: "4px 0 0", fontSize: "18px", color: "#f1f5f9", fontWeight: 700, lineHeight: 1.3 }}>
                            {product.product_name}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: "none", border: "none", color: "#64748b", fontSize: "22px", cursor: "pointer", padding: "0 0 0 12px", lineHeight: 1 }}
                    >
                        ×
                    </button>
                </div>

                <div style={{ padding: "20px 24px", flex: 1 }}>
                    {/* Quick pills */}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
                        <StockBadge status={product.stock_status} />
                        {product.category_name && (
                            <span style={{ padding: "2px 10px", background: "#1e293b", borderRadius: "999px", color: "#94a3b8", fontSize: "11px", fontWeight: 600, border: "1px solid #334155" }}>
                                {product.category_name}
                            </span>
                        )}
                        {product.brand_name && (
                            <span style={{ padding: "2px 10px", background: "#1e293b", borderRadius: "999px", color: "#94a3b8", fontSize: "11px", fontWeight: 600, border: "1px solid #334155" }}>
                                {product.brand_name}
                            </span>
                        )}
                    </div>

                    {/* Pricing highlight */}
                    <div style={{ background: "#1e293b", borderRadius: "10px", padding: "16px", marginBottom: "20px", display: "flex", justifyContent: "space-between" }}>
                        <div>
                            <p style={{ margin: 0, fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Selling Price</p>
                            <p style={{ margin: "4px 0 0", fontSize: "22px", color: "#f1f5f9", fontWeight: 800 }}>
                                ₹{Number(product.selling_price).toLocaleString("en-IN")}
                            </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <p style={{ margin: 0, fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Effective Price</p>
                            <p style={{ margin: "4px 0 0", fontSize: "22px", color: "#34d399", fontWeight: 800 }}>
                                ₹{Number(product.effective_price).toLocaleString("en-IN")}
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <p style={{ color: "#64748b", fontSize: "13px" }}>Loading full details...</p>
                    ) : detail ? (
                        <>
                            {row("SKU", <code style={{ fontSize: "12px" }}>{detail.stock_keeping_unit}</code>)}
                            {row("Vendor ID", detail.vendor_id)}
                            {row("Stock", `${detail.available_stock_quantity} ${detail.unit_of_measure ?? "units"}`)}
                            {row("Reorder Level", detail.reorder_alert_level)}
                            {row("Min. Order Qty", detail.minimum_order_quantity)}
                            {row("Discount", detail.discount_percentage ? `${detail.discount_percentage}%` : "—")}
                            {row("Tax", detail.tax_percentage ? `${detail.tax_percentage}%` : "—")}
                            {row("Cost Price", detail.cost_price ? `₹${Number(detail.cost_price).toLocaleString("en-IN")}` : "—")}
                            {row("Weight", detail.weight_in_kg ? `${detail.weight_in_kg} kg` : "—")}
                            {row("Dimensions", detail.dimensions_in_cm)}
                            {row("Barcode", detail.barcode_number)}
                            {row("Active", detail.is_active ? "✅ Yes" : "❌ No")}
                            {row("Created", detail.created_at ? new Date(detail.created_at).toLocaleDateString("en-IN") : "—")}

                            {detail.product_description && (
                                <div style={{ marginTop: "16px" }}>
                                    <p style={{ margin: "0 0 6px", fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</p>
                                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px", lineHeight: 1.6 }}>
                                        {detail.product_description}
                                    </p>
                                </div>
                            )}

                            {/* AI hooks placeholder */}
                            <div style={{ marginTop: "20px", background: "#0a192f", borderRadius: "8px", padding: "12px", border: "1px dashed #1e4080" }}>
                                <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#3b82f6", fontWeight: 700 }}>🤖 AI Intelligence (Coming Soon)</p>
                                <p style={{ margin: 0, color: "#475569", fontSize: "12px" }}>
                                    Vendor Reliability Score · Demand Trend Indicator · Smart Ranking
                                </p>
                            </div>
                        </>
                    ) : (
                        <p style={{ color: "#64748b", fontSize: "13px" }}>Could not load full details.</p>
                    )}
                </div>
            </aside>
        </>
    );
};

export default ProductDrawer;
