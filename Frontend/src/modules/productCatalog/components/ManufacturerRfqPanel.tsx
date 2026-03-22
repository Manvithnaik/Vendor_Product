import React, { useEffect, useState } from "react";
import { rfqApi } from "../services/rfqService";
import type { RFQRequestDTO } from "../types/rfq";

interface ManufacturerRfqPanelProps {
    manufacturerId: number;
}

const ManufacturerRfqPanel: React.FC<ManufacturerRfqPanelProps> = ({ manufacturerId }) => {
    const [rfqs, setRfqs] = useState<RFQRequestDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState<number | null>(null);

    const fetchRfqs = async () => {
        setLoading(true);
        try {
            const res = await rfqApi.getManufacturerRfqs(manufacturerId);
            setRfqs(res.data);
        } catch (e) {
            console.error("Failed to load RFQs", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRfqs();
    }, [manufacturerId]);

    const handleAcceptQuote = async (rfqId: number) => {
        if (!confirm("Are you sure you want to finalize this order?")) return;
        
        setProcessing(rfqId);
        try {
            await rfqApi.placeOrder(rfqId);
            alert("Order placed successfully!");
            fetchRfqs();
        } catch (e: any) {
            console.error("Failed to place order", e);
            alert(e.response?.data?.message || "Failed to place order");
        } finally {
            setProcessing(null);
        }
    };

    if (loading && rfqs.length === 0) return <div style={{ color: "#94a3b8" }}>Loading RFQs...</div>;

    return (
        <div style={{ padding: "0" }}>
            {rfqs.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                    You haven't requested any quotes yet.
                </div>
            ) : (
                <div style={{ display: "grid", gap: "16px" }}>
                    {rfqs.map(rfq => (
                        <div key={rfq.rfq_id} style={{
                            background: "#0f172a", border: "1px solid #1e293b",
                            borderRadius: "12px", padding: "20px"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <div>
                                    <h3 style={{ margin: "0 0 8px 0", color: "#f1f5f9", fontSize: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                                        RFQ #{rfq.rfq_id} - Product #{rfq.product_id}
                                        <span style={{ 
                                            fontSize: "11px", padding: "4px 8px", borderRadius: "12px",
                                            background: rfq.status === 'CLOSED' ? "#10b98120" : "#f59e0b20",
                                            color: rfq.status === 'CLOSED' ? "#34d399" : "#fbbf24",
                                            fontWeight: 600
                                        }}>
                                            {rfq.status}
                                        </span>
                                    </h3>
                                    <div style={{ color: "#94a3b8", fontSize: "14px", display: "flex", gap: "20px" }}>
                                        <span><strong>Requested:</strong> {rfq.requested_quantity} units</span>
                                        <span><strong>Date requested:</strong> {rfq.created_at ? new Date(rfq.created_at).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>
                                {rfq.status !== 'CLOSED' && (
                                    <button 
                                        disabled={processing === rfq.rfq_id}
                                        onClick={() => handleAcceptQuote(rfq.rfq_id)}
                                        style={{
                                            padding: "8px 16px", background: "#3b82f6", color: "#fff",
                                            border: "none", borderRadius: "6px", fontWeight: 600,
                                            cursor: processing === rfq.rfq_id ? "not-allowed" : "pointer", fontSize: "13px"
                                        }}
                                    >
                                        Place Order
                                    </button>
                                )}
                            </div>

                            <div style={{ background: "#1e293b", borderRadius: "8px", padding: "12px" }}>
                                <h4 style={{ margin: "0 0 10px 0", color: "#cbd5e1", fontSize: "13px" }}>Vendor Responses</h4>
                                {rfq.responses && rfq.responses.length > 0 ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                        {rfq.responses.map(resp => (
                                            <div key={resp.response_id} style={{ display: "flex", justifyContent: "space-between", background: "#0b1120", padding: "10px", borderRadius: "6px" }}>
                                                <div>
                                                    <span style={{ color: "#94a3b8", fontSize: "13px" }}>Vendor #{resp.vendor_id} quoted: </span>
                                                    <span style={{ color: "#34d399", fontWeight: 600 }}>₹{resp.quoted_price}</span>
                                                    <span style={{ color: "#64748b", fontSize: "13px", marginLeft: "10px" }}>({resp.available_quantity} available)</span>
                                                </div>
                                                <div>
                                                    <span style={{ color: "#fbbf24", fontSize: "12px", fontWeight: 600 }}>{resp.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ color: "#64748b", fontSize: "13px" }}>Waiting for vendor quotes...</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManufacturerRfqPanel;
