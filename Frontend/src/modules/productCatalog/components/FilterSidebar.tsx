import React from "react";
import type { ProductFilters } from "../types/product";

interface Props {
    filters: ProductFilters;
    onChange: (f: ProductFilters) => void;
    onReset: () => void;
}

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "6px",
    color: "#e2e8f0",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    color: "#94a3b8",
    marginBottom: "4px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
};

const FilterSidebar: React.FC<Props> = ({ filters, onChange, onReset }) => {
    const set = (key: keyof ProductFilters, val: string | number | undefined) =>
        onChange({ ...filters, [key]: val || undefined });

    return (
        <aside
            style={{
                width: "220px",
                minWidth: "220px",
                background: "#0f172a",
                borderRight: "1px solid #1e293b",
                padding: "20px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
            }}
        >
            <h3 style={{ margin: 0, color: "#f1f5f9", fontSize: "14px", fontWeight: 700 }}>
                🔍 Filters
            </h3>

            <div>
                <label style={labelStyle}>Search</label>
                <input
                    style={inputStyle}
                    placeholder="Product name..."
                    value={filters.search ?? ""}
                    onChange={(e) => set("search", e.target.value)}
                />
            </div>

            <div>
                <label style={labelStyle}>Category</label>
                <input
                    style={inputStyle}
                    placeholder="e.g. Steel, Electrical"
                    value={filters.category_name ?? ""}
                    onChange={(e) => set("category_name", e.target.value)}
                />
            </div>

            <div>
                <label style={labelStyle}>Brand</label>
                <input
                    style={inputStyle}
                    placeholder="e.g. TATA, Finolex"
                    value={filters.brand_name ?? ""}
                    onChange={(e) => set("brand_name", e.target.value)}
                />
            </div>

            <div>
                <label style={labelStyle}>Min Price (₹)</label>
                <input
                    style={inputStyle}
                    type="number"
                    placeholder="0"
                    value={filters.min_price ?? ""}
                    onChange={(e) => set("min_price", e.target.value ? Number(e.target.value) : undefined)}
                />
            </div>

            <div>
                <label style={labelStyle}>Max Price (₹)</label>
                <input
                    style={inputStyle}
                    type="number"
                    placeholder="999999"
                    value={filters.max_price ?? ""}
                    onChange={(e) => set("max_price", e.target.value ? Number(e.target.value) : undefined)}
                />
            </div>

            <div>
                <label style={labelStyle}>Min Stock</label>
                <input
                    style={inputStyle}
                    type="number"
                    placeholder="0"
                    value={filters.min_stock ?? ""}
                    onChange={(e) => set("min_stock", e.target.value ? Number(e.target.value) : undefined)}
                />
            </div>

            <div>
                <label style={labelStyle}>Sort By</label>
                <select
                    style={{ ...inputStyle, cursor: "pointer" }}
                    value={filters.sort_by ?? ""}
                    onChange={(e) => set("sort_by", e.target.value)}
                >
                    <option value="">Default</option>
                    <option value="selling_price">Price</option>
                    <option value="product_name">Name</option>
                    <option value="available_stock_quantity">Stock</option>
                    <option value="created_at">Date Added</option>
                </select>
            </div>

            <div>
                <label style={labelStyle}>Direction</label>
                <select
                    style={{ ...inputStyle, cursor: "pointer" }}
                    value={filters.sort_dir ?? "asc"}
                    onChange={(e) => set("sort_dir", e.target.value as "asc" | "desc")}
                >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </div>

            <button
                onClick={onReset}
                style={{
                    marginTop: "auto",
                    padding: "9px",
                    background: "#334155",
                    color: "#94a3b8",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 600,
                }}
            >
                Reset Filters
            </button>
        </aside>
    );
};

export default FilterSidebar;
