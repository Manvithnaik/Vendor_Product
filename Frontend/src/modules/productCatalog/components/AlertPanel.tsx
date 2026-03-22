import React, { useEffect, useState } from "react";
import axiosClient from "../../../shared/axiosClient";

interface Props {
    productId: number;
}

const AlertPanel: React.FC<Props> = ({ productId }) => {
    const [alerts, setAlerts] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!productId) return;
        const fetchAlerts = async () => {
            setLoading(true);
            try {
                const res = await axiosClient.get(`/analytics/alerts/${productId}`);
                if (res.data?.data) {
                    setAlerts(res.data.data);
                }
            } catch (err) {
                console.error("Failed to load alerts", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAlerts();
    }, [productId]);

    if (loading) {
        return <div style={{ color: "#94a3b8", fontSize: "13px" }}>Analyzing intelligence...</div>;
    }

    if (alerts.length === 0) return null;

    return (
        <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px"
        }}>
            <h4 style={{ margin: "0 0 10px 0", color: "#f87171", fontSize: "14px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>⚠️</span> SYSTEM INTELLIGENCE WARNINGS
            </h4>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "#fca5a5", fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {alerts.map((alert, idx) => (
                    <li key={idx} style={{ lineHeight: 1.4 }}>{alert}</li>
                ))}
            </ul>
        </div>
    );
};

export default AlertPanel;
