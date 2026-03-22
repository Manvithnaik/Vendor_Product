import React, { useState } from "react";
import CatalogPage from "./modules/productCatalog/pages/CatalogPage";
import VendorPage from "./modules/productCatalog/pages/VendorPage";
import AnalyticsPage from "./modules/productCatalog/pages/AnalyticsPage";
import RoleLandingPage from "./modules/productCatalog/pages/RoleLandingPage";
import ComparisonPage from "./modules/productCatalog/pages/ComparisonPage";

type Route = "catalog" | "vendor" | "analytics" | "comparison";
type Role = "vendor" | "manufacturer" | null;

const App: React.FC = () => {
    const [role, setRole] = useState<Role>(null);
    const [route, setRoute] = useState<Route>("catalog");

    // When role changes, set default route
    const handleRoleSelect = (r: Role) => {
        setRole(r);
        setRoute(r === "vendor" ? "vendor" : "catalog");
    };

    if (!role) {
        return <RoleLandingPage onSelect={handleRoleSelect} />;
    }

    const isVendor = role === "vendor";

    const navItems = isVendor ? [
        { id: "vendor", label: "My Products", icon: "🏭" },
    ] : [
        { id: "catalog", label: "Catalog", icon: "📦" },
        { id: "comparison", label: "Compare", icon: "⚖️" },
        { id: "analytics", label: "Analytics", icon: "📊" },
    ];

    return (
        <div style={{ display: "flex", height: "100vh", background: "#0d1117", fontFamily: "'Inter', 'Segoe UI', sans-serif", overflow: "hidden" }}>

            {/* Sidebar Nav */}
            <nav style={{
                width: "220px", minWidth: "220px",
                background: "#0f172a",
                borderRight: "1px solid #1e293b",
                display: "flex", flexDirection: "column",
                padding: "0",
            }}>
                {/* Logo */}
                <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #1e293b" }}>
                    <p style={{ margin: 0, fontSize: "10px", color: isVendor ? "#3b82f6" : "#a855f7", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>
                        B2B Portal
                    </p>
                    <h2 style={{ margin: "6px 0 0", fontSize: "18px", color: "#f8fafc", fontWeight: 800, letterSpacing: "-0.02em" }}>
                        {isVendor ? "Vendor Hub" : "Manufacturer"}
                    </h2>
                </div>

                {/* Nav Links */}
                <div style={{ padding: "16px 12px", flex: 1 }}>
                    {navItems.map((item) => {
                        const active = route === item.id;
                        return (
                            <div key={item.id}>
                                <button
                                    onClick={() => setRoute(item.id as Route)}
                                    style={{
                                        width: "100%",
                                        display: "flex", alignItems: "center", gap: "12px",
                                        padding: "12px 14px",
                                        background: active ? (isVendor ? "rgba(59, 130, 246, 0.1)" : "rgba(168, 85, 247, 0.1)") : "transparent",
                                        border: "none",
                                        borderRadius: "8px",
                                        color: active ? (isVendor ? "#60a5fa" : "#c084fc") : "#64748b",
                                        fontSize: "14px",
                                        fontWeight: active ? 700 : 500,
                                        cursor: "pointer",
                                        marginBottom: "4px",
                                        textAlign: "left",
                                        transition: "all 0.15s",
                                    }}
                                >
                                    <span style={{ fontSize: "18px" }}>{item.icon}</span>
                                    {item.label}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div style={{ padding: "16px", borderTop: "1px solid #1e293b" }}>
                    <button
                        onClick={() => setRole(null)}
                        style={{
                            width: "100%", padding: "10px",
                            background: "transparent", border: "1px solid #334155",
                            borderRadius: "6px", color: "#94a3b8",
                            fontSize: "13px", fontWeight: 600, cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.color = "#f1f5f9"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
                    >
                        Switch Role
                    </button>
                    <p style={{ margin: "12px 0 0", fontSize: "11px", color: "#475569", textAlign: "center" }}>Product Catalog v1.0</p>
                </div>
            </nav>

            {/* Page Content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#060b13" }}>
                {route === "catalog" && !isVendor && <CatalogPage />}
                {route === "comparison" && !isVendor && <ComparisonPage />}
                {route === "vendor" && isVendor && <VendorPage />}
                {route === "analytics" && !isVendor && <AnalyticsPage />}
            </div>
        </div>
    );
};

export default App;
