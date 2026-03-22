import React, { useEffect, useState } from "react";
import { rfqApi } from "../services/rfqService";
import type { RFQRequestDTO, RFQRespondPayload } from "../types/rfq";

interface VendorRfqPanelProps {
    vendorId: number;
}

const VendorRfqPanel: React.FC<VendorRfqPanelProps> = ({ vendorId }) => {
    const [rfqs, setRfqs] = useState<RFQRequestDTO[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Respond states
    const [respondingTo, setRespondingTo] = useState<RFQRequestDTO | null>(null);
    const [quotePrice, setQuotePrice] = useState<number>(0);
    const [availableQty, setAvailableQty] = useState<number>(0);
    const [submitting, setSubmitting] = useState(false);

    const fetchRfqs = async () => {
        setLoading(true);
        try {
            const res = await rfqApi.getVendorRfqs(vendorId);
            setRfqs(res.data);
        } catch (e) {
            console.error("Failed to load RFQs", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRfqs();
    }, [vendorId]);

    const handleRespond = async () => {
        if (!respondingTo || quotePrice <= 0 || availableQty <= 0) {
            alert("Please enter valid price and quantity.");
            return;
        }
        
        setSubmitting(true);
        try {
            const payload: RFQRespondPayload = {
                quoted_price: quotePrice,
                available_quantity: availableQty
            };
            await rfqApi.respondToRfq(respondingTo.rfq_id, vendorId, payload);
            setRespondingTo(null);
            setQuotePrice(0);
            setAvailableQty(0);
            fetchRfqs(); // refresh list
        } catch (e: any) {
            console.error("Failed to respond", e);
            alert(e.response?.data?.message || "Failed to respond");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && rfqs.length === 0) return <div style={{ color: "#94a3b8" }}>Loading RFQs...</div>;

    return (
        <div style={{ padding: "0" }}>
            {rfqs.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                    No incoming Request For Quotes (RFQs) at the moment.
                </div>
            ) : (
                <div style={{ display: "grid", gap: "16px" }}>
                    {rfqs.map(rfq => (
                        <div key={rfq.rfq_id} style={{
                            background: "#0f172a", border: "1px solid #1e293b",
                            borderRadius: "12px", padding: "20px",
                            display: "flex", justifyContent: "space-between", alignItems: "center"
                        }}>
                            <div>
                                <h3 style={{ margin: "0 0 8px 0", color: "#f1f5f9", fontSize: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                                    RFQ #{rfq.rfq_id} - Product #{rfq.product_id}
                                    <span style={{ 
                                        fontSize: "11px", padding: "4px 8px", borderRadius: "12px",
                                        background: rfq.status === 'PENDING' ? "#f59e0b20" : "#10b98120",
                                        color: rfq.status === 'PENDING' ? "#fbbf24" : "#34d399",
                                        fontWeight: 600
                                    }}>
                                        {rfq.status}
                                    </span>
                                </h3>
                                <div style={{ color: "#94a3b8", fontSize: "14px", display: "flex", gap: "20px", marginBottom: "8px" }}>
                                    <span><strong>Requested:</strong> {rfq.requested_quantity} units</span>
                                    <span><strong>Date:</strong> {rfq.created_at ? new Date(rfq.created_at).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div style={{ color: "#cbd5e1", fontSize: "13px", padding: "10px", background: "#1e293b", borderRadius: "6px" }}>
                                    <strong style={{color:"#94a3b8"}}>Message: </strong> 
                                    {rfq.message || "No message provided."}
                                </div>
                            </div>
                            
                            <div>
                                {rfq.status === 'PENDING' ? (
                                    <button 
                                        onClick={() => { setRespondingTo(rfq); setAvailableQty(rfq.requested_quantity); }}
                                        style={{
                                            padding: "8px 16px", background: "#10b981", color: "#fff",
                                            border: "none", borderRadius: "6px", fontWeight: 600,
                                            cursor: "pointer", fontSize: "13px"
                                        }}
                                    >
                                        Respond with Quote
                                    </button>
                                ) : (
                                    <div style={{ color: "#64748b", fontSize: "13px", fontWeight: 500 }}>
                                        {rfq.responses && rfq.responses.length > 0 
                                            ? `Responded: ₹${rfq.responses[0].quoted_price}` 
                                            : "Already Processed"}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Response Modal */}
            {respondingTo && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.6)", zIndex: 1000,
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <div style={{
                        background: "#0f172a", padding: "24px", borderRadius: "12px", width: "400px",
                        border: "1px solid #1e293b", boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
                    }}>
                        <h2 style={{ margin: "0 0 16px 0", color: "#fff", fontSize: "18px" }}>Respond to RFQ #{respondingTo.rfq_id}</h2>
                        
                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ display: "block", color: "#94a3b8", fontSize: "13px", marginBottom: "6px" }}>Unit Price (₹) *</label>
                            <input 
                                type="number" step="0.01" value={quotePrice} onChange={e => setQuotePrice(Number(e.target.value))}
                                style={{ width: "100%", padding: "10px", background: "#1e293b", border: "1px solid #334155", color: "#fff", borderRadius: "6px", boxSizing: "border-box" }}
                            />
                        </div>
                        
                        <div style={{ marginBottom: "24px" }}>
                            <label style={{ display: "block", color: "#94a3b8", fontSize: "13px", marginBottom: "6px" }}>Available Quantity *</label>
                            <input 
                                type="number" value={availableQty} onChange={e => setAvailableQty(Number(e.target.value))}
                                style={{ width: "100%", padding: "10px", background: "#1e293b", border: "1px solid #334155", color: "#fff", borderRadius: "6px", boxSizing: "border-box" }}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button onClick={() => setRespondingTo(null)} disabled={submitting} style={{ padding: "8px 16px", background: "transparent", color: "#94a3b8", border: "none", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                            <button onClick={handleRespond} disabled={submitting} style={{ padding: "8px 16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}>
                                {submitting ? "Sending..." : "Send Quote"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorRfqPanel;
