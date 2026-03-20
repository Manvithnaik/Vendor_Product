import React, { useCallback, useEffect, useState } from "react";
import type { ProductListItem } from "../types/product";
import { vendorApi } from "../services/productService";
import type { Pagination } from "../types/product";
import ProductTable from "../components/ProductTable";
import ProductDrawer from "../components/ProductDrawer";

// Hardcoded vendor for this module — real auth would inject this
const VENDOR_ID = 1;

const VendorPage: React.FC = () => {
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total_records: 0, total_pages: 0 });
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<ProductListItem | null>(null);

    // Stock edit state
    const [stockTarget, setStockTarget] = useState<ProductListItem | null>(null);
    const [newStock, setNewStock] = useState("");
    const [stockLoading, setStockLoading] = useState(false);

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await vendorApi.getVendorProducts(VENDOR_ID, page, 20);
            setProducts(res.data);
            setPagination(res.pagination);
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetch(); }, [fetch]);

    const handleDelete = async (product: ProductListItem) => {
        if (!confirm(`Deactivate "${product.product_name}"? It won't appear in the catalog.`)) return;
        await vendorApi.softDeleteProduct(product.product_id);
        fetch();
    };

    const handleStockSave = async () => {
        if (!stockTarget || isNaN(Number(newStock))) return;
        setStockLoading(true);
        try {
            await vendorApi.updateStock(stockTarget.product_id, { available_stock_quantity: Number(newStock) });
            setStockTarget(null);
            setNewStock("");
            fetch();
        } finally {
            setStockLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        padding: "8px 12px", background: "#0f172a", border: "1px solid #334155",
        borderRadius: "6px", color: "#f1f5f9", fontSize: "14px", width: "100%", boxSizing: "border-box",
    };

    return (
        <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
            <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "20px", color: "#f1f5f9", fontWeight: 700 }}>
                            🏭 My Products
                        </h1>
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                            Vendor #{VENDOR_ID} · {loading ? "Loading..." : `${pagination.total_records} products`}
                        </p>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: "auto" }}>
                    <ProductTable
                        products={products}
                        loading={loading}
                        onRowClick={setSelected}
                        sortBy=""
                        sortDir="asc"
                        onSort={() => { }}
                        showVendorControls
                        onEditStock={(p) => { setStockTarget(p); setNewStock(String(p.available_stock_quantity)); }}
                        onDelete={handleDelete}
                    />
                </div>

                {/* Pagination */}
                <div style={{ padding: "12px 24px", borderTop: "1px solid #1e293b", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                        style={{ padding: "6px 14px", background: "#1e293b", border: "1px solid #334155", borderRadius: "6px", color: page <= 1 ? "#475569" : "#e2e8f0", cursor: page <= 1 ? "not-allowed" : "pointer", fontSize: "13px" }}>
                        ← Prev
                    </button>
                    <span style={{ color: "#64748b", fontSize: "13px" }}>Page {pagination.page} of {pagination.total_pages || 1}</span>
                    <button disabled={page >= pagination.total_pages} onClick={() => setPage((p) => p + 1)}
                        style={{ padding: "6px 14px", background: "#1e293b", border: "1px solid #334155", borderRadius: "6px", color: page >= pagination.total_pages ? "#475569" : "#e2e8f0", cursor: page >= pagination.total_pages ? "not-allowed" : "pointer", fontSize: "13px" }}>
                        Next →
                    </button>
                </div>
            </main>

            <ProductDrawer product={selected} onClose={() => setSelected(null)} />

            {/* Stock update modal */}
            {stockTarget && (
                <>
                    <div onClick={() => setStockTarget(null)}
                        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)", zIndex: 60 }} />
                    <div style={{
                        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                        background: "#0f172a", border: "1px solid #334155", borderRadius: "12px",
                        padding: "28px 32px", zIndex: 70, width: "340px",
                    }}>
                        <h3 style={{ margin: "0 0 8px", color: "#f1f5f9", fontSize: "16px" }}>Update Stock</h3>
                        <p style={{ margin: "0 0 18px", color: "#64748b", fontSize: "13px" }}>
                            {stockTarget.product_name}
                        </p>
                        <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>
                            New Quantity
                        </label>
                        <input
                            style={inputStyle}
                            type="number"
                            min="0"
                            value={newStock}
                            onChange={(e) => setNewStock(e.target.value)}
                            autoFocus
                        />
                        <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
                            <button onClick={handleStockSave} disabled={stockLoading}
                                style={{ flex: 1, padding: "10px", background: "#1d4ed8", border: "none", borderRadius: "6px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}>
                                {stockLoading ? "Saving..." : "Save"}
                            </button>
                            <button onClick={() => setStockTarget(null)}
                                style={{ flex: 1, padding: "10px", background: "#1e293b", border: "1px solid #334155", borderRadius: "6px", color: "#94a3b8", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default VendorPage;
