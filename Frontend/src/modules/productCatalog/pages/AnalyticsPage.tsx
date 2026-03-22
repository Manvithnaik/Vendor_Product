import React, { useEffect, useState } from "react";
import type { CatalogSummary, LowStockItem, CategoryDistribution } from "../types/product";
import { analyticsApi, vendorApi } from "../services/productService";

// ── Animated SVG Donut Chart ──────────────────────────────────────
const DonutChart: React.FC<{ data: CategoryDistribution[] }> = ({ data }) => {
    const total = data.reduce((sum, d) => sum + d.product_count, 0);
    if (total === 0) return <p style={{ color: "#475569", fontSize: "13px" }}>No category data.</p>;

    let cumulativePercent = 0;
    const slices = data.map((d, i) => {
        const percent = d.product_count / total;
        const dashArray = `${percent * 100} ${100 - (percent * 100)}`;
        const dashOffset = -cumulativePercent * 100;
        cumulativePercent += percent;
        
        return {
            ...d,
            color: `hsl(${200 + i * 45}, 70%, 55%)`,
            dashArray,
            dashOffset
        };
    });

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <svg width="140" height="140" viewBox="0 0 42 42" style={{ overflow: "visible" }}>
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                {slices.map((slice, i) => (
                    <circle
                        key={i}
                        cx="21" cy="21" r="15.91549430918954"
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth="8"
                        strokeDasharray={slice.dashArray}
                        strokeDashoffset={slice.dashOffset}
                        strokeLinecap="round"
                        style={{
                            transition: "stroke-dasharray 1s ease-out, stroke-dashoffset 1s ease-out",
                            transformOrigin: "center", transform: "rotate(-90deg)",
                            animation: "dashBounce 1s ease-out forwards"
                        }}
                    />
                ))}
            </svg>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                {slices.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: s.color }} />
                            <span style={{ color: "#cbd5e1", fontSize: "13px", fontWeight: 500 }}>{s.category_name || "Uncategorized"}</span>
                        </div>
                        <span style={{ color: "#f1f5f9", fontSize: "13px", fontWeight: 700 }}>{s.product_count}</span>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes dashBounce {
                    0% { stroke-dasharray: 0 100; opacity: 0; }
                }
            `}</style>
        </div>
    );
};

// ── Animated Count Up ─────────────────────────────────────────────
const CountUp: React.FC<{ end: number; duration?: number }> = ({ end, duration = 1000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (time: number) => {
            if (!startTime) startTime = time;
            const progress = (time - startTime) / duration;
            if (progress < 1) {
                setCount(Math.floor(end * (1 - Math.pow(1 - progress, 3)))); // cubic ease out
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    return <span>{count}</span>;
};

const statCard = (value: number, label: string, color: string) => (
    <div style={{
        background: "#0f172a", border: `1px solid ${color}22`,
        borderTop: `3px solid ${color}`,
        borderRadius: "12px", padding: "24px", flex: 1, minWidth: "180px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        position: "relative", overflow: "hidden"
    }}>
        <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", background: `radial-gradient(circle, ${color}22 0%, transparent 70%)` }} />
        <p style={{ margin: 0, fontSize: "40px", fontWeight: 900, color, letterSpacing: "-0.02em" }}>
            <CountUp end={value} />
        </p>
        <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
    </div>
);

const AnalyticsPage: React.FC = () => {
    const [summary, setSummary] = useState<CatalogSummary | null>(null);
    const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = () => {
        Promise.all([analyticsApi.getSummary(), analyticsApi.getLowStock()])
            .then(([s, l]) => { setSummary(s.data); setLowStock(l.data); })
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRestock = async (item: LowStockItem) => {
        // Quick +50 restock logic for the demo 
        const newStock = item.available_stock_quantity + 50;
        await vendorApi.updateStock(item.product_id, { available_stock_quantity: newStock });
        fetchData(); // refresh the dash
    };

    const td: React.CSSProperties = { padding: "14px 16px", fontSize: "13px", borderBottom: "1px solid #1e293b", verticalAlign: "middle" };

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#475569", fontSize: "15px", fontWeight: 600 }}>
                Aggregating Catalog Intelligence...
            </div>
        );
    }

    return (
        <div style={{ padding: "32px", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ margin: "0 0 6px", fontSize: "24px", color: "#f8fafc", fontWeight: 800 }}>
                    📊 Catalog Intelligence
                </h1>
                <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
                    Real-time monitoring of all global active vendors and stock alerts.
                </p>
            </div>

            {/* KPI Cards */}
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "32px" }}>
                {statCard(summary?.total_active_products ?? 0, "Active Products", "#38bdf8")}
                {statCard(summary?.low_stock_count ?? 0, "Low Stock Alerts", "#fbbf24")}
                {statCard(summary?.out_of_stock_count ?? 0, "Out of Stock", "#ef4444")}
                {statCard(summary?.category_distribution.length ?? 0, "Categories", "#a855f7")}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Category Distribution Chart */}
                <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "16px", padding: "28px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                        <h2 style={{ margin: 0, fontSize: "16px", color: "#f8fafc", fontWeight: 700 }}>Category Distribution</h2>
                    </div>
                    {(summary?.category_distribution.length ?? 0) > 0 ? (
                        <DonutChart data={summary!.category_distribution} />
                    ) : (
                        <p style={{ color: "#475569", fontSize: "13px" }}>No category data available.</p>
                    )}
                </div>

                {/* Low Stock Table */}
                <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "16px", overflow: "hidden" }}>
                    <div style={{ padding: "24px 28px", borderBottom: "1px solid #1e293b", background: "rgba(239, 68, 68, 0.05)" }}>
                        <h2 style={{ margin: 0, fontSize: "16px", color: "#fca5a5", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 10px #ef4444" }} />
                            Urgent Reorder Alerts
                        </h2>
                    </div>
                    {lowStock.length === 0 ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#64748b", fontSize: "14px" }}>
                            System optimal. No products are currently running low.
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead style={{ background: "#0b1120" }}>
                                    <tr>
                                        {["Product", "Vendor", "Stock", "Action"].map((h) => (
                                            <th key={h} style={{ padding: "12px 16px", textAlign: h === "Action" || h === "Stock" ? "right" : "left", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", borderBottom: "1px solid #1e293b" }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {lowStock.map((item) => {
                                        const isCritical = item.available_stock_quantity === 0;
                                        return (
                                            <tr key={item.product_id} style={{ background: isCritical ? "rgba(239, 68, 68, 0.05)" : "transparent" }}>
                                                <td style={{ ...td, color: "#f8fafc", fontWeight: 600 }}>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                                        <span>{item.product_name}</span>
                                                        <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#64748b" }}>{item.stock_keeping_unit}</span>
                                                    </div>
                                                </td>
                                                <td style={{ ...td }}>
                                                    <span style={{ padding: "2px 6px", background: "#f59e0b22", color: "#fbbf24", fontSize: "10px", borderRadius: "4px", fontWeight: 700 }}>
                                                        V#{item.vendor_id}
                                                    </span>
                                                </td>
                                                <td style={{ ...td, textAlign: "right" }}>
                                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                                                        <span style={{ color: isCritical ? "#ef4444" : "#fbbf24", fontWeight: 800, fontSize: "16px" }}>
                                                            {item.available_stock_quantity}
                                                        </span>
                                                        <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                                                            Alert: {item.reorder_alert_level}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ ...td, textAlign: "right" }}>
                                                    <button 
                                                        onClick={() => handleRestock(item)}
                                                        style={{ 
                                                            padding: "6px 14px", background: "#3b82f6", color: "#fff", 
                                                            border: "none", borderRadius: "6px", fontWeight: 700, 
                                                            fontSize: "11px", cursor: "pointer", 
                                                            boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)" 
                                                        }}
                                                    >
                                                        +50 Stock
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
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
