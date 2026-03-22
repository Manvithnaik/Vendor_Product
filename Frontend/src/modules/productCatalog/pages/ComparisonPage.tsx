import React, { useState, useEffect } from "react";
import { comparisonApi } from "../services/comparisonService";
import type { ScoredProductDTO } from "../types/comparison";
import { catalogApi } from "../services/productService";
import type { ProductListItem } from "../types/product";

const ComparisonPage: React.FC = () => {
    const [templateId, setTemplateId] = useState<number | null>(null);
    const [results, setResults] = useState<ScoredProductDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [availableProducts, setAvailableProducts] = useState<ProductListItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        // Fetch a list of products to simulate selecting for comparison
        catalogApi.getProducts({}, 1, 50).then(res => setAvailableProducts(res.data));
    }, []);

    const handleCompare = async () => {
        if (selectedIds.length < 2) {
            alert("Please select at least 2 products to compare.");
            return;
        }
        setLoading(true);
        try {
            const res = await comparisonApi.compareProducts({
                product_ids: selectedIds,
                comparison_template_id: templateId
            });
            setResults(res.data);
        } catch (e) {
            console.error(e);
            alert("Comparison failed");
        } finally {
            setLoading(false);
        }
    };

    const toggleProduct = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(pid => pid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "20px 28px", overflow: "auto", color: "#f8fafc" }}>
            <h1 style={{ margin: "0 0 10px 0", fontSize: "22px", fontWeight: 800 }}>⚖️ Decision Engine: Comparison</h1>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "24px" }}>Select products and run a deterministic scoring analysis based on templates.</p>

            <div style={{ display: "flex", gap: "24px" }}>
                {/* Product Selection */}
                <div style={{ flex: 1, background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", padding: "20px" }}>
                    <h2 style={{ fontSize: "16px", marginTop: 0, marginBottom: "16px" }}>Select Candidates</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "400px", overflowY: "auto" }}>
                        {availableProducts.map(p => (
                            <label key={p.product_id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", background: "#1e293b", borderRadius: "8px", cursor: "pointer" }}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedIds.includes(p.product_id)} 
                                    onChange={() => toggleProduct(p.product_id)}
                                />
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: "14px" }}>{p.product_name}</div>
                                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>₹{p.selling_price} | Vendor {p.vendor_id} | Stock: {p.available_stock_quantity}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                    
                    <button 
                        onClick={handleCompare} 
                        disabled={loading}
                        style={{
                            marginTop: "20px", width: "100%", padding: "12px", background: "#2563eb", color: "#fff",
                            border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer",
                            opacity: loading ? 0.7 : 1
                        }}>
                        {loading ? "Running Engine..." : "Run Analysis"}
                    </button>
                </div>

                {/* Score Breakdown Area */}
                <div style={{ flex: 2, background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", padding: "20px" }}>
                    <h2 style={{ fontSize: "16px", marginTop: 0, marginBottom: "16px" }}>Analysis Results</h2>
                    
                    {results.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {results.map((res, index) => {
                                const prod = availableProducts.find(p => p.product_id === res.product_id);
                                return (
                                    <div key={res.product_id} style={{
                                        background: index === 0 ? "rgba(34, 197, 94, 0.1)" : "#1e293b",
                                        border: `1px solid ${index === 0 ? "rgba(34, 197, 94, 0.3)" : "#334155"}`,
                                        borderRadius: "8px", padding: "16px", display: "flex", gap: "20px"
                                    }}>
                                        <div style={{ flexShrink: 0, textAlign: "center", width: "60px" }}>
                                            <div style={{ fontSize: "24px", fontWeight: 800, color: index === 0 ? "#4ade80" : "#94a3b8" }}>#{res.rank}</div>
                                            <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Rank</div>
                                        </div>
                                        
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "4px" }}>{prod?.product_name || `Product ${res.product_id}`}</div>
                                            <div style={{ fontSize: "13px", color: "#94a3b8", display: "flex", gap: "16px" }}>
                                                <span>Vendor ID: {res.vendor_id}</span>
                                                <span style={{ 
                                                    color: res.risk_level === 'LOW' ? '#4ade80' : res.risk_level === 'MEDIUM' ? '#fbbf24' : '#ef4444' 
                                                }}>
                                                    Risk: {res.risk_level}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: "flex", gap: "20px", textAlign: "right" }}>
                                            <div>
                                                <div style={{ fontSize: "12px", color: "#64748b" }}>Price Score</div>
                                                <div style={{ fontSize: "14px", fontWeight: 600 }}>{res.price_score.toFixed(2)}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: "12px", color: "#64748b" }}>Stock Score</div>
                                                <div style={{ fontSize: "14px", fontWeight: 600 }}>{res.stock_score.toFixed(2)}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: "12px", color: "#64748b" }}>Reliability</div>
                                                <div style={{ fontSize: "14px", fontWeight: 600 }}>{res.reliability_score.toFixed(2)}</div>
                                            </div>
                                            <div style={{ paddingLeft: "20px", borderLeft: "1px solid #334155" }}>
                                                <div style={{ fontSize: "12px", color: "#4ade80", fontWeight: 600 }}>Total Score</div>
                                                <div style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>{res.total_score.toFixed(2)}</div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "14px" }}>
                            Select products and run analysis to view scores.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComparisonPage;
