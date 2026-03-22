import React from "react";
import type { ProductListItem } from "../types/product";
import StockBadge from "./StockBadge";
import SkeletonRow from "./SkeletonRow";

interface Props {
    products: ProductListItem[];
    loading: boolean;
    onRowClick: (product: ProductListItem) => void;
    sortBy?: string;
    sortDir?: string;
    onSort: (col: string) => void;
    showVendorControls?: boolean;
    onQuickStockUpdate?: (productId: number, qtyDiff: number, currentQty: number) => void;
    onDelete?: (product: ProductListItem) => void;
    showVendorBadge?: boolean;
}

const th: React.CSSProperties = {
    padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700,
    color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em",
    borderBottom: "1px solid #1e293b", whiteSpace: "nowrap", cursor: "pointer", userSelect: "none",
};

const td: React.CSSProperties = {
    padding: "16px 16px", fontSize: "13px", color: "#e2e8f0",
    borderBottom: "1px solid #1e293b", verticalAlign: "middle", whiteSpace: "nowrap",
};

const sortArrow = (col: string, sortBy?: string, sortDir?: string) => {
    if (sortBy !== col) return "";
    return sortDir === "desc" ? " ↓" : " ↑";
};

const ProductTable: React.FC<Props> = ({
    products, loading, onRowClick, sortBy, sortDir, onSort,
    showVendorControls = false, onQuickStockUpdate, onDelete, showVendorBadge = false
}) => {
    const colCount = showVendorControls ? 10 : 8;

    return (
        <div style={{ overflowX: "auto", width: "100%" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#0b1120" }}>
                    <tr>
                        <th style={th} onClick={() => onSort("product_name")}>
                            Product{sortArrow("product_name", sortBy, sortDir)}
                        </th>
                        <th style={th}>Category</th>
                        <th style={th}>Brand</th>
                        <th style={th}>SKU</th>
                        <th style={{ ...th, textAlign: "right" }} onClick={() => onSort("selling_price")}>
                            Price (₹){sortArrow("selling_price", sortBy, sortDir)}
                        </th>
                        <th style={{ ...th, textAlign: "center" }} onClick={() => onSort("available_stock_quantity")}>
                            Stock{sortArrow("available_stock_quantity", sortBy, sortDir)}
                        </th>
                        {showVendorControls && (
                            <th style={{ ...th, textAlign: "center" }}>
                                Reserved
                            </th>
                        )}
                        <th style={th}>Status</th>
                        {showVendorControls && <th style={{ ...th, textAlign: "right" }}>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <SkeletonRow cols={colCount} rows={8} />
                    ) : products.length === 0 ? (
                        <tr>
                            <td colSpan={colCount} style={{ ...td, textAlign: "center", padding: "60px", color: "#64748b" }}>
                                No products found.
                            </td>
                        </tr>
                    ) : (
                        products.map((p) => (
                            <tr
                                key={p.product_id}
                                onClick={() => onRowClick(p)}
                                style={{ cursor: "pointer", transition: "background 0.2s" }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "#1e293b80")}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                            >
                                <td style={{ ...td, color: "#f8fafc", fontWeight: 600 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        {p.product_name}
                                        {showVendorBadge && (
                                            <span style={{ padding: "2px 6px", background: "#f59e0b22", color: "#fbbf24", fontSize: "10px", borderRadius: "4px", fontWeight: 700 }}>
                                                V#{p.vendor_id}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ ...td, color: "#cbd5e1" }}>{p.category_name ?? "—"}</td>
                                <td style={{ ...td, color: "#cbd5e1" }}>{p.brand_name ?? "—"}</td>
                                <td style={{ ...td, fontFamily: "monospace", fontSize: "12px", color: "#64748b" }}>
                                    {p.stock_keeping_unit}
                                </td>
                                <td style={{ ...td, textAlign: "right", color: "#22c55e", fontWeight: 600 }}>
                                    ₹{Number(p.effective_price).toLocaleString("en-IN")}
                                </td>
                                
                                {/* Stock Cell */}
                                <td style={{ ...td, textAlign: "center" }}>
                                    {showVendorControls ? (
                                        <div style={{ display: "inline-flex", alignItems: "center", background: "#0f172a", borderRadius: "6px", border: "1px solid #1e293b" }} onClick={e => e.stopPropagation()}>
                                            <button 
                                                onClick={() => onQuickStockUpdate?.(p.product_id, -1, p.available_stock_quantity)}
                                                style={{ padding: "4px 8px", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>-</button>
                                            <span style={{ width: "32px", textAlign: "center", fontSize: "13px", color: "#f1f5f9", fontWeight: 600 }}>
                                                {p.available_stock_quantity}
                                            </span>
                                            <button 
                                                onClick={() => onQuickStockUpdate?.(p.product_id, 1, p.available_stock_quantity)}
                                                style={{ padding: "4px 8px", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>+</button>
                                        </div>
                                    ) : (
                                        <span style={{ fontWeight: 600 }}>{p.available_stock_quantity.toLocaleString()}</span>
                                    )}
                                </td>
                                
                                {showVendorControls && (
                                    <td style={{ ...td, textAlign: "center", color: "#fca5a5", fontWeight: 600 }}>
                                        {p.reserved_stock_quantity || 0}
                                    </td>
                                )}

                                <td style={td}>
                                    <StockBadge status={p.stock_status} />
                                </td>
                                {showVendorControls && (
                                    <td style={{ ...td, textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => onDelete?.(p)}
                                            style={{
                                                padding: "6px 12px", fontSize: "12px", fontWeight: 600,
                                                background: "rgba(220, 38, 38, 0.1)", color: "#ef4444",
                                                border: "1px solid rgba(220, 38, 38, 0.2)", borderRadius: "6px", cursor: "pointer",
                                                transition: "all 0.2s"
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = "rgba(220, 38, 38, 0.2)"}
                                            onMouseLeave={e => e.currentTarget.style.background = "rgba(220, 38, 38, 0.1)"}
                                        >
                                            Disable
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ProductTable;
