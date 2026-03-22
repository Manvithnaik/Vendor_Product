import React, { useState } from "react";
import { rfqApi } from "../services/rfqService";
import type { ProductDetail } from "../types/product";

interface Props {
    manufacturerId: number;
    product: ProductDetail;
    onClose: () => void;
    onSuccess: () => void;
}

const RFQModal: React.FC<Props> = ({ manufacturerId, product, onClose, onSuccess }) => {
    const [quantity, setQuantity] = useState<number>(product.minimum_order_quantity || 1);
    const [message, setMessage] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await rfqApi.createRfq({
                product_id: product.product_id,
                manufacturer_id: manufacturerId,
                requested_quantity: quantity,
                message: message
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to submit RFQ.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000
        }}>
            <div style={{
                background: "#0f172a", border: "1px solid #1e293b",
                borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "500px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <h2 style={{ margin: 0, fontSize: "20px", color: "#f8fafc", fontWeight: 700 }}>Request For Quote (RFQ)</h2>
                    <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "20px", cursor: "pointer" }}>×</button>
                </div>
                
                <div style={{ marginBottom: "20px", padding: "12px", background: "rgba(59, 130, 246, 0.1)", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                    <p style={{ margin: "0 0 4px", color: "#94a3b8", fontSize: "12px" }}>Product</p>
                    <p style={{ margin: 0, color: "#f1f5f9", fontSize: "14px", fontWeight: 600 }}>{product.product_name} ({product.stock_keeping_unit})</p>
                </div>

                {error && <div style={{ color: "#ef4444", fontSize: "13px", marginBottom: "16px", padding: "10px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "6px" }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "16px" }}>
                        <label style={{ display: "block", color: "#94a3b8", fontSize: "13px", marginBottom: "8px", fontWeight: 500 }}>Requested Quantity *</label>
                        <input 
                            type="number" 
                            min={product.minimum_order_quantity || 1}
                            required
                            value={quantity}
                            onChange={e => setQuantity(Number(e.target.value))}
                            style={{
                                width: "100%", boxSizing: "border-box", padding: "10px",
                                background: "#060b13", border: "1px solid #1e293b", borderRadius: "6px",
                                color: "#f1f5f9", fontSize: "14px", outline: "none"
                            }}
                        />
                        <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#64748b" }}>MOQ is {product.minimum_order_quantity}</p>
                    </div>

                    <div style={{ marginBottom: "24px" }}>
                        <label style={{ display: "block", color: "#94a3b8", fontSize: "13px", marginBottom: "8px", fontWeight: 500 }}>Message to Vendor</label>
                        <textarea 
                            rows={4}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Add terms, shipping requirements, or negotiation notes..."
                            style={{
                                width: "100%", boxSizing: "border-box", padding: "10px",
                                background: "#060b13", border: "1px solid #1e293b", borderRadius: "6px",
                                color: "#f1f5f9", fontSize: "14px", outline: "none", resize: "none"
                            }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                        <button type="button" onClick={onClose} disabled={loading} style={{
                            padding: "10px 16px", background: "transparent", border: "1px solid #334155",
                            borderRadius: "6px", color: "#cbd5e1", fontSize: "14px", cursor: "pointer", fontWeight: 500
                        }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} style={{
                            padding: "10px 20px", background: "#3b82f6", border: "1px solid #2563eb",
                            borderRadius: "6px", color: "#fff", fontSize: "14px", cursor: "pointer", fontWeight: 600,
                            opacity: loading ? 0.7 : 1
                        }}>
                            {loading ? "Sending..." : "Send RFQ Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RFQModal;
