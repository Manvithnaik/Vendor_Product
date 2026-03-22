import React, { useCallback, useEffect, useState } from "react";
import type { ProductListItem, ProductFilters } from "../types/product";
import { catalogApi } from "../services/productService";
import type { Pagination } from "../types/product";
import FilterSidebar from "../components/FilterSidebar";
import ProductTable from "../components/ProductTable";
import ProductDrawer from "../components/ProductDrawer";
import ManufacturerRfqPanel from "../components/ManufacturerRfqPanel";

const EMPTY_FILTERS: ProductFilters = {};
const MANUFACTURER_ID = 1; // Handled as mock ID 1 to match ProductDrawer

const CatalogPage: React.FC = () => {
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total_records: 0, total_pages: 0 });
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<ProductFilters>(EMPTY_FILTERS);
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<ProductListItem | null>(null);
    const [activeTab, setActiveTab] = useState<'catalog' | 'rfq'>('catalog');

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await catalogApi.getProducts(filters, page, 20);
            setProducts(res.data);
            setPagination(res.pagination);
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    useEffect(() => { fetch(); }, [fetch]);
    useEffect(() => { setPage(1); }, [filters]);

    const handleSort = (col: string) => {
        setFilters((f) => ({
            ...f,
            sort_by: col,
            sort_dir: f.sort_by === col && f.sort_dir === "asc" ? "desc" : "asc",
        }));
    };

    return (
        <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
            {activeTab === 'catalog' && (
                <FilterSidebar
                    filters={filters}
                    onChange={setFilters}
                    onReset={() => setFilters(EMPTY_FILTERS)}
                />
            )}

            <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
                {/* Header */}
                <div style={{ padding: "20px 28px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "22px", color: "#f1f5f9", fontWeight: 800 }}>
                            📦 Manufacturer Catalog
                        </h1>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94a3b8" }}>
                            Browse, filter, and monitor products from all active vendors
                        </p>
                    </div>
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
                        Browse Catalog
                    </button>
                    <button 
                        onClick={() => setActiveTab('rfq')}
                        style={{
                            padding: "16px 20px", background: "transparent", color: activeTab === 'rfq' ? "#3b82f6" : "#94a3b8",
                            border: "none", borderBottom: `2px solid ${activeTab === 'rfq' ? "#3b82f6" : "transparent"}`,
                            fontWeight: 600, fontSize: "14px", cursor: "pointer", transition: "all 0.2s"
                        }}
                    >
                        My Quotes & Orders
                    </button>
                </div>

                {/* Main Content Area */}
                <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
                    {activeTab === 'catalog' ? (
                        <div style={{ background: "#0f172a", borderRadius: "12px", border: "1px solid #1e293b", overflow: "hidden" }}>
                            <ProductTable
                            products={products}
                            loading={loading}
                            onRowClick={setSelected}
                            sortBy={filters.sort_by}
                            sortDir={filters.sort_dir}
                            onSort={handleSort}
                            showVendorBadge={true} // specific for manufacturer view
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
                        <ManufacturerRfqPanel manufacturerId={MANUFACTURER_ID} />
                    )}
                </div>
            </main>

            <ProductDrawer product={selected} onClose={() => setSelected(null)} />
        </div>
    );
};

export default CatalogPage;
