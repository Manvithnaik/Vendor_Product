import React, { useState } from "react";
import CatalogPage from "./modules/productCatalog/pages/CatalogPage";
import VendorPage from "./modules/productCatalog/pages/VendorPage";
import AnalyticsPage from "./modules/productCatalog/pages/AnalyticsPage";

type Route = "catalog" | "vendor" | "analytics";

const navItems: { id: Route; label: string; icon: string }[] = [
    { id: "catalog", label: "Catalog", icon: "📦" },
    { id: "vendor", label: "My Products", icon: "🏭" },
    { id: "analytics", label: "Analytics", icon: "📊" },
];

const App: React.FC = () => {
    const [route, setRoute] = useState<Route>("catalog");

    return (
        <div style={{ display: "flex", height: "100vh", background: "#0d1117", fontFamily: "'Inter', 'Segoe UI', sans-serif", overflow: "hidden" }}>

            {/* Sidebar Nav */}
            <nav style={{
                width: "200px", minWidth: "200px",
                background: "#0a0f1a",
                borderRight: "1px solid #1e293b",
                display: "flex", flexDirection: "column",
                padding: "0",
            }}>
                {/* Logo */}
                <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #1e293b" }}>
                    <p style={{ margin: 0, fontSize: "10px", color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        B2B Portal
                    </p>
                    <h2 style={{ margin: "4px 0 0", fontSize: "16px", color: "#f1f5f9", fontWeight: 800, letterSpacing: "-0.02em" }}>
                        Product Catalog
                    </h2>
                </div>

                {/* Nav Links */}
                <div style={{ padding: "12px 8px", flex: 1 }}>
                    {navItems.map((item) => {
                        const active = route === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setRoute(item.id)}
                                style={{
                                    width: "100%",
                                    display: "flex", alignItems: "center", gap: "10px",
                                    padding: "10px 12px",
                                    background: active ? "#1e293b" : "transparent",
                                    border: "none",
                                    borderRadius: "8px",
                                    color: active ? "#f1f5f9" : "#64748b",
                                    fontSize: "13px",
                                    fontWeight: active ? 700 : 500,
                                    cursor: "pointer",
                                    marginBottom: "2px",
                                    textAlign: "left",
                                    transition: "all 0.15s",
                                    borderLeft: active ? "3px solid #3b82f6" : "3px solid transparent",
                                }}
                            >
                                <span style={{ fontSize: "15px" }}>{item.icon}</span>
                                {item.label}
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div style={{ padding: "12px 16px", borderTop: "1px solid #1e293b" }}>
                    <p style={{ margin: 0, fontSize: "11px", color: "#334155" }}>Product Catalog v1.0</p>
                </div>
            </nav>

            {/* Page Content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {route === "catalog" && <CatalogPage />}
                {route === "vendor" && <VendorPage />}
                {route === "analytics" && <AnalyticsPage />}
            </div>
        </div>
    );
};

export default App;
