import React, { useEffect, useState } from "react";
import type { CatalogSummary, LowStockItem, CategoryDistribution } from "../types/product";
import { analyticsApi } from "../services/productService";

// ── Tiny responsive bar chart ─────────────────────────────────────────
const BarChart: React.FC<{ data: CategoryDistribution[] }> = ({ data }) => {
    const max = Math.max(...data.map((d) => d.product_count), 1);
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {data.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ color: "#94a3b8", fontSize: "12px", minWidth: "100px", textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {d.category_name ?? "Uncategorized"}
                    </span>
                    <div style={{ flex: 1, background: "#1e293b", borderRadius: "4px", height: "18px", overflow: "hidden" }}>
                        <div style={{
                            width: `${(d.product_count / max) * 100}%`,
                            height: "100%",
                            background: `hsl(${200 + i * 28}, 70%, 55%)`,
                            borderRadius: "4px",
                            transition: "width 0.6s ease",
                            display: "flex", alignItems: "center", paddingLeft: "6px",
                        }}>
                            <span style={{ color: "#fff", fontSize: "10px", fontWeight: 700 }}>{d.product_count}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const statCard = (value: string | number, label: string, color: string) => (
    <div style={{
        background: "#0f172a", border: `1px solid ${color}22`,
        borderTop: `3px solid ${color}`,
        borderRadius: "10px", padding: "20px 24px", flex: 1, minWidth: "160px",
    }}>
        <p style={{ margin: 0, fontSize: "30px", fontWeight: 800, color }}>{value}</p>
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
    </div>
);

const AnalyticsPage: React.FC = () => {
    const [summary, setSummary] = useState<CatalogSummary | null>(null);
    const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([analyticsApi.getSummary(), analyticsApi.getLowStock()])
            .then(([s, l]) => { setSummary(s.data); setLowStock(l.data); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const td: React.CSSProperties = { padding: "10px 12px", fontSize: "13px", color: "#cbd5e1", borderBottom: "1px solid #1e293b" };

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#475569", fontSize: "14px" }}>
                Loading analytics...
            </div>
        );
    }

    return (
        <div style={{ padding: "24px", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
            <h1 style={{ margin: "0 0 24px", fontSize: "20px", color: "#f1f5f9", fontWeight: 700 }}>
                📊 Catalog Analytics
            </h1>

            {/* KPI Cards */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "32px" }}>
                {statCard(summary?.total_active_products ?? 0, "Active Products", "#38bdf8")}
                {statCard(summary?.low_stock_count ?? 0, "Low Stock Alerts", "#fbbf24")}
                {statCard(summary?.out_of_stock_count ?? 0, "Out of Stock", "#f87171")}
                {statCard(summary?.category_distribution.length ?? 0, "Categories", "#a78bfa")}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Category Distribution Chart */}
                <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "10px", padding: "20px 24px" }}>
                    <h2 style={{ margin: "0 0 18px", fontSize: "14px", color: "#f1f5f9", fontWeight: 700 }}>
                        Category Distribution
                    </h2>
                    {(summary?.category_distribution.length ?? 0) > 0 ? (
                        <BarChart data={summary!.category_distribution} />
                    ) : (
                        <p style={{ color: "#475569", fontSize: "13px" }}>No category data available.</p>
                    )}
                </div>

                {/* Low Stock Table */}
                <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "10px", padding: "20px 24px" }}>
                    <h2 style={{ margin: "0 0 14px", fontSize: "14px", color: "#f1f5f9", fontWeight: 700 }}>
                        ⚠️ Low Stock Alerts
                    </h2>
                    {lowStock.length === 0 ? (
                        <p style={{ color: "#475569", fontSize: "13px" }}>All products are adequately stocked.</p>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        {["Product", "SKU", "In Stock", "Alert Level"].map((h) => (
                                            <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", borderBottom: "1px solid #1e293b" }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {lowStock.map((item) => (
                                        <tr key={item.product_id}>
                                            <td style={{ ...td, color: "#f1f5f9", fontWeight: 600, maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {item.product_name}
                                            </td>
                                            <td style={{ ...td, fontFamily: "monospace", fontSize: "11px", color: "#94a3b8" }}>
                                                {item.stock_keeping_unit}
                                            </td>
                                            <td style={{ ...td, color: "#fbbf24", fontWeight: 700 }}>
                                                {item.available_stock_quantity}
                                            </td>
                                            <td style={td}>{item.reorder_alert_level}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
