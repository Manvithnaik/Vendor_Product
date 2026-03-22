import React, { useCallback, useEffect, useState } from "react";
import type { ProductListItem, ProductCreatePayload } from "../types/product";
import { vendorApi } from "../services/productService";
import type { Pagination } from "../types/product";
import ProductTable from "../components/ProductTable";
import ProductForm from "../components/ProductForm";
import VendorRfqPanel from "../components/VendorRfqPanel";

const VENDOR_ID = 1;

const VendorPage: React.FC = () => {
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total_records: 0, total_pages: 0 });
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    
    // Add product state
    const [isAdding, setIsAdding] = useState(false);
    
    // Tabs state
    const [activeTab, setActiveTab] = useState<'catalog' | 'rfq'>('catalog');

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await vendorApi.getVendorProducts(VENDOR_ID, page, 20);
            setProducts(res.data);
            setPagination(res.pagination);
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetch(); }, [fetch]);

    const handleDelete = async (product: ProductListItem) => {
        if (!confirm(`Deactivate "${product.product_name}"?`)) return;
        await vendorApi.softDeleteProduct(product.product_id);
        fetch();
    };

    const handleCreate = async (payload: ProductCreatePayload) => {
        try {
            await vendorApi.createProduct(payload);
            setIsAdding(false);
            fetch();
        } catch (e: any) {
            console.error("Failed to create product", e);
            alert(e.response?.data?.message || e.message || "Failed to create product");
        }
    };

    // Quick inline stock update function (called from the table component directly contextually)
    const handleQuickStockUpdate = async (productId: number, qtyDiff: number, currentQty: number) => {
        const newStock = Math.max(0, currentQty + qtyDiff);
        if (newStock === currentQty) return;
        
        // Optimistic UI update
        setProducts(prev => prev.map(p => p.product_id === productId ? { ...p, available_stock_quantity: newStock } : p));
        
        try {
            await vendorApi.updateStock(productId, { available_stock_quantity: newStock });
        } catch {
            // Revert on failure
            fetch(); 
        }
    };

    return (
        <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
            <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
                {/* Header */}
                <div style={{ padding: "20px 28px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "22px", color: "#f1f5f9", fontWeight: 800 }}>
                            🏭 My Products
                        </h1>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94a3b8" }}>
                            Manage your catalog listings & inventory levels
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsAdding(true)}
                        style={{
                            padding: "10px 18px", background: "#3b82f6", color: "#fff",
                            border: "none", borderRadius: "8px", fontWeight: 700,
                            fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
                            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                            transition: "all 0.2s"
                        }}
                    >
                        <span>＋</span> Add Product
                    </button>
                </div>

                {/* Tab Navigation */}
                <div style={{ display: "flex", borderBottom: "1px solid #1e293b", background: "#0f172a", padding: "0 28px" }}>
                    <button 
                        onClick={() => setActiveTab('catalog')}
                        style={{
                            padding: "16px 20px", background: "transparent", color: activeTab === 'catalog' ? "#3b82f6" : "#94a3b8",
                            border: "none", borderBottom: `2px solid ${activeTab === 'catalog' ? "#3b82f6" : "transparent"}`,
                            fontWeight: 600, fontSize: "14px", cursor: "pointer", transition: "all 0.2s"
                        }}
                    >
                        My Catalog
                    </button>
                    <button 
                        onClick={() => setActiveTab('rfq')}
                        style={{
                            padding: "16px 20px", background: "transparent", color: activeTab === 'rfq' ? "#3b82f6" : "#94a3b8",
                            border: "none", borderBottom: `2px solid ${activeTab === 'rfq' ? "#3b82f6" : "transparent"}`,
                            fontWeight: 600, fontSize: "14px", cursor: "pointer", transition: "all 0.2s"
                        }}
                    >
                        Incoming Quotes (RFQs)
                    </button>
                </div>

                {/* Main Content Area */}
                <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
                    {activeTab === 'catalog' ? (
                        <div style={{ background: "#0f172a", borderRadius: "12px", border: "1px solid #1e293b", overflow: "hidden" }}>
                            <ProductTable
                                products={products}
                            loading={loading}
                            onRowClick={() => {}}
                            sortBy=""
                            sortDir="asc"
                            onSort={() => {}}
                            showVendorControls
                            onDelete={handleDelete}
                            onQuickStockUpdate={handleQuickStockUpdate}
                        />

                        {/* Pagination */}
                        <div style={{ padding: "14px 20px", borderTop: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0b1120" }}>
                            <span style={{ color: "#64748b", fontSize: "13px" }}>
                                Showing {products.length} of {pagination.total_records}
                            </span>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                                    style={{ padding: "6px 14px", background: "#1e293b", border: "1px solid #334155", borderRadius: "6px", color: page <= 1 ? "#475569" : "#e2e8f0", cursor: page <= 1 ? "not-allowed" : "pointer", fontSize: "13px" }}>
                                    Prev
                                </button>
                                <button disabled={page >= pagination.total_pages} onClick={() => setPage(page + 1)}
                                    style={{ padding: "6px 14px", background: "#1e293b", border: "1px solid #334155", borderRadius: "6px", color: page >= pagination.total_pages ? "#475569" : "#e2e8f0", cursor: page >= pagination.total_pages ? "not-allowed" : "pointer", fontSize: "13px" }}>
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                    ) : (
                        <VendorRfqPanel vendorId={VENDOR_ID} />
                    )}
                </div>

                {/* Add Product Overlap Drawer */}
                {isAdding && (
                    <div style={{
                        position: "absolute", top: 0, right: 0, bottom: 0, width: "400px",
                        background: "#0f172a", borderLeft: "1px solid #1e293b",
                        boxShadow: "-10px 0 40px rgba(0,0,0,0.5)",
                        display: "flex", flexDirection: "column", zIndex: 50,
                        animation: "slideIn 0.3s ease-out"
                    }}>
                        <div style={{ padding: "20px", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2 style={{ margin: 0, fontSize: "18px", color: "#f1f5f9" }}>Add New Product</h2>
                            <button onClick={() => setIsAdding(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "20px", cursor: "pointer" }}>×</button>
                        </div>
                        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
                            <ProductForm vendorId={VENDOR_ID} onSubmit={handleCreate} onCancel={() => setIsAdding(false)} />
                        </div>
                    </div>
                )}
                
                <style>{`
                    @keyframes slideIn {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }
                `}</style>
            </main>
        </div>
    );
};

export default VendorPage;
