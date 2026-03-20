import React, { useState } from "react";

type Role = "vendor" | "manufacturer";

interface Props {
    onSelect: (role: Role) => void;
}

const RoleLandingPage: React.FC<Props> = ({ onSelect }) => {
    const [hovered, setHovered] = useState<Role | null>(null);

    const cards: { role: Role; icon: string; title: string; subtitle: string; accent: string; desc: string[] }[] = [
        {
            role: "vendor",
            icon: "🏭",
            title: "Vendor Portal",
            subtitle: "Supply & manage your products",
            accent: "#3b82f6",
            desc: [
                "Upload & update your products",
                "Manage stock levels in real-time",
                "Track your listings",
            ],
        },
        {
            role: "manufacturer",
            icon: "📦",
            title: "Manufacturer Portal",
            subtitle: "Full catalog intelligence & control",
            accent: "#a855f7",
            desc: [
                "Browse all vendor catalogs",
                "Analytics & stock intelligence",
                "Low-stock alerts & restock actions",
            ],
        },
    ];

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #070c16 0%, #0d1b2e 50%, #0f172a 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                padding: "24px",
            }}
        >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "64px" }}>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: "10px",
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "100px", padding: "8px 20px", marginBottom: "24px",
                }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
                    <span style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 600, letterSpacing: "0.05em" }}>
                        B2B VENDOR PORTAL · LIVE
                    </span>
                </div>
                <h1 style={{
                    margin: "0 0 12px",
                    fontSize: "clamp(32px, 5vw, 52px)",
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.1,
                }}>
                    Product Catalog
                </h1>
                <p style={{ color: "#475569", fontSize: "16px", margin: 0, fontWeight: 400 }}>
                    Choose your access level to continue
                </p>
            </div>

            {/* Role Cards */}
            <div style={{ display: "flex", gap: "28px", flexWrap: "wrap", justifyContent: "center", maxWidth: "820px", width: "100%" }}>
                {cards.map(({ role, icon, title, subtitle, accent, desc }) => {
                    const isHovered = hovered === role;
                    return (
                        <div
                            key={role}
                            onClick={() => onSelect(role)}
                            onMouseEnter={() => setHovered(role)}
                            onMouseLeave={() => setHovered(null)}
                            style={{
                                flex: "1 1 340px",
                                maxWidth: "380px",
                                background: isHovered
                                    ? `linear-gradient(145deg, ${accent}18, ${accent}08)`
                                    : "rgba(15, 23, 42, 0.8)",
                                border: `1px solid ${isHovered ? accent + "66" : "rgba(255,255,255,0.06)"}`,
                                borderRadius: "20px",
                                padding: "40px 36px",
                                cursor: "pointer",
                                transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                                transform: isHovered ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)",
                                boxShadow: isHovered
                                    ? `0 24px 60px ${accent}20, 0 0 0 1px ${accent}33`
                                    : "0 4px 24px rgba(0,0,0,0.4)",
                                backdropFilter: "blur(12px)",
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            {/* Glow accent top bar */}
                            <div style={{
                                position: "absolute",
                                top: 0, left: 0, right: 0,
                                height: "3px",
                                background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                                opacity: isHovered ? 1 : 0,
                                transition: "opacity 0.25s",
                            }} />

                            {/* Icon */}
                            <div style={{
                                width: "64px", height: "64px",
                                background: `${accent}18`,
                                border: `1px solid ${accent}33`,
                                borderRadius: "16px",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "30px",
                                marginBottom: "24px",
                                transition: "all 0.25s",
                                transform: isHovered ? "scale(1.08)" : "scale(1)",
                            }}>
                                {icon}
                            </div>

                            <h2 style={{
                                margin: "0 0 6px",
                                fontSize: "22px",
                                fontWeight: 800,
                                color: "#f1f5f9",
                                letterSpacing: "-0.02em",
                            }}>
                                {title}
                            </h2>
                            <p style={{
                                margin: "0 0 24px",
                                fontSize: "14px",
                                color: "#64748b",
                                fontWeight: 400,
                            }}>
                                {subtitle}
                            </p>

                            {/* Features */}
                            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                                {desc.map((item, i) => (
                                    <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div style={{
                                            width: "18px", height: "18px",
                                            borderRadius: "50%",
                                            background: `${accent}22`,
                                            border: `1px solid ${accent}44`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            flexShrink: 0,
                                        }}>
                                            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                                <path d="M1 3.5L3.5 6L8 1" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <span style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 500 }}>{item}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <div style={{
                                marginTop: "32px",
                                padding: "12px 20px",
                                background: isHovered ? accent : "transparent",
                                border: `1px solid ${isHovered ? accent : "#1e293b"}`,
                                borderRadius: "10px",
                                textAlign: "center",
                                color: isHovered ? "#fff" : "#475569",
                                fontSize: "14px",
                                fontWeight: 700,
                                transition: "all 0.25s",
                                letterSpacing: "0.01em",
                            }}>
                                {isHovered ? `Enter as ${title.split(" ")[0]} →` : "Select Role"}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <p style={{ marginTop: "60px", color: "#1e293b", fontSize: "12px" }}>
                Product Catalog Module v1.0 · Enterprise B2B
            </p>
        </div>
    );
};

export default RoleLandingPage;
