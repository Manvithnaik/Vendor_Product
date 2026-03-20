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
    onEditStock?: (product: ProductListItem) => void;
    onDelete?: (product: ProductListItem) => void;
}

const th: React.CSSProperties = {
    padding: "10px 12px",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    borderBottom: "1px solid #1e293b",
    whiteSpace: "nowrap",
    cursor: "pointer",
    userSelect: "none",
};

const td: React.CSSProperties = {
    padding: "12px 12px",
    fontSize: "13px",
    color: "#cbd5e1",
    borderBottom: "1px solid #1e293b",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
};

const sortArrow = (col: string, sortBy?: string, sortDir?: string) => {
    if (sortBy !== col) return " ↕";
    return sortDir === "desc" ? " ↓" : " ↑";
};

const ProductTable: React.FC<Props> = ({
    products,
    loading,
    onRowClick,
    sortBy,
    sortDir,
    onSort,
    showVendorControls = false,
    onEditStock,
    onDelete,
}) => {
    const colCount = showVendorControls ? 9 : 8;

    return (
        <div style={{ overflowX: "auto", width: "100%" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#0f172a", position: "sticky", top: 0, zIndex: 1 }}>
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
                        <th style={{ ...th, textAlign: "right" }} onClick={() => onSort("selling_price")}>
                            Eff. Price (₹){sortArrow("selling_price", sortBy, sortDir)}
                        </th>
                        <th
                            style={{ ...th, textAlign: "right" }}
                            onClick={() => onSort("available_stock_quantity")}
                        >
                            Stock{sortArrow("available_stock_quantity", sortBy, sortDir)}
                        </th>
                        <th style={th}>Status</th>
                        {showVendorControls && <th style={th}>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <SkeletonRow cols={colCount} rows={8} />
                    ) : products.length === 0 ? (
                        <tr>
                            <td
                                colSpan={colCount}
                                style={{ ...td, textAlign: "center", padding: "40px", color: "#475569" }}
                            >
                                No products found.
                            </td>
                        </tr>
                    ) : (
                        products.map((p) => (
                            <tr
                                key={p.product_id}
                                onClick={() => onRowClick(p)}
                                style={{ cursor: "pointer", transition: "background 0.15s" }}
                                onMouseEnter={(e) =>
                                    ((e.currentTarget as HTMLTableRowElement).style.background = "#1e293b")
                                }
                                onMouseLeave={(e) =>
                                    ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")
                                }
                            >
                                <td style={{ ...td, color: "#f1f5f9", fontWeight: 600 }}>{p.product_name}</td>
                                <td style={td}>{p.category_name ?? "—"}</td>
                                <td style={td}>{p.brand_name ?? "—"}</td>
                                <td style={{ ...td, fontFamily: "monospace", fontSize: "12px", color: "#94a3b8" }}>
                                    {p.stock_keeping_unit}
                                </td>
                                <td style={{ ...td, textAlign: "right" }}>
                                    ₹{Number(p.selling_price).toLocaleString("en-IN")}
                                </td>
                                <td style={{ ...td, textAlign: "right", color: "#34d399" }}>
                                    ₹{Number(p.effective_price).toLocaleString("en-IN")}
                                </td>
                                <td style={{ ...td, textAlign: "right" }}>
                                    {p.available_stock_quantity.toLocaleString()}
                                </td>
                                <td style={td}>
                                    <StockBadge status={p.stock_status} />
                                </td>
                                {showVendorControls && (
                                    <td
                                        style={td}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            <button
                                                onClick={() => onEditStock?.(p)}
                                                style={{
                                                    padding: "4px 10px",
                                                    fontSize: "11px",
                                                    background: "#1d4ed8",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Stock
                                            </button>
                                            <button
                                                onClick={() => onDelete?.(p)}
                                                style={{
                                                    padding: "4px 10px",
                                                    fontSize: "11px",
                                                    background: "#7f1d1d",
                                                    color: "#fca5a5",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Disable
                                            </button>
                                        </div>
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
