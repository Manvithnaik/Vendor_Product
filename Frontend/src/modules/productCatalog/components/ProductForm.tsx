import React, { useState } from "react";
import type { ProductCreatePayload } from "../types/product";

interface Props {
    vendorId: number;
    onSubmit: (payload: ProductCreatePayload) => void;
    onCancel: () => void;
}

const ProductForm: React.FC<Props> = ({ vendorId, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<Partial<ProductCreatePayload>>({
        vendor_id: vendorId,
        product_name: "",
        category_name: "",
        brand_name: "",
        stock_keeping_unit: "",
        selling_price: 0,
        minimum_order_quantity: 1,
        available_stock_quantity: 0,
        reorder_alert_level: 0,
        unit_of_measure: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData as ProductCreatePayload);
    };

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "10px", background: "#0f172a", border: "1px solid #1e293b",
        borderRadius: "6px", color: "#f1f5f9", fontSize: "14px", boxSizing: "border-box",
        marginBottom: "16px"
    };
    const labelStyle: React.CSSProperties = {
        display: "block", marginBottom: "6px", fontSize: "12px", color: "#94a3b8", fontWeight: 600
    };

    return (
        <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Product Name *</label>
            <input style={inputStyle} required name="product_name" value={formData.product_name} onChange={handleChange} placeholder="e.g. Steel Pipe 50mm" />

            <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Category</label>
                    <input style={inputStyle} name="category_name" value={formData.category_name} onChange={handleChange} placeholder="e.g. Steel" />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Brand</label>
                    <input style={inputStyle} name="brand_name" value={formData.brand_name} onChange={handleChange} placeholder="e.g. TATA" />
                </div>
            </div>

            <label style={labelStyle}>SKU (Stock Keeping Unit) *</label>
            <input style={inputStyle} required name="stock_keeping_unit" value={formData.stock_keeping_unit} onChange={handleChange} placeholder="e.g. STL-001" />

            <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Selling Price (₹) *</label>
                    <input style={inputStyle} required type="number" min="0" step="0.01" name="selling_price" value={formData.selling_price} onChange={handleChange} />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Unit of Measure</label>
                    <input style={inputStyle} name="unit_of_measure" value={formData.unit_of_measure} onChange={handleChange} placeholder="e.g. piece, kg, box" />
                </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Min. Order Qty *</label>
                    <input style={inputStyle} required type="number" min="1" name="minimum_order_quantity" value={formData.minimum_order_quantity} onChange={handleChange} />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Initial Stock Qty</label>
                    <input style={inputStyle} type="number" min="0" name="available_stock_quantity" value={formData.available_stock_quantity} onChange={handleChange} />
                </div>
            </div>
            
            <label style={labelStyle}>Reorder Alert Level</label>
            <input style={inputStyle} type="number" min="0" name="reorder_alert_level" value={formData.reorder_alert_level} onChange={handleChange} placeholder="Alert when stock drops below this" />

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" onClick={onCancel} style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid #334155", borderRadius: "8px", color: "#94a3b8", fontWeight: 600, cursor: "pointer" }}>
                    Cancel
                </button>
                <button type="submit" style={{ flex: 1.5, padding: "12px", background: "#3b82f6", border: "none", borderRadius: "8px", color: "#fff", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)" }}>
                    Create Product
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
