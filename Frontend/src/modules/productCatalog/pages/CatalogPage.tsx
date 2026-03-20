import React, { useCallback, useEffect, useState } from "react";
import type { ProductListItem, ProductFilters } from "../types/product";
import { catalogApi } from "../services/productService";
import type { Pagination } from "../types/product";
import FilterSidebar from "../components/FilterSidebar";
import ProductTable from "../components/ProductTable";
import ProductDrawer from "../components/ProductDrawer";

const EMPTY_FILTERS: ProductFilters = {};

const CatalogPage: React.FC = () => {
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total_records: 0, total_pages: 0 });
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<ProductFilters>(EMPTY_FILTERS);
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<ProductListItem | null>(null);

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
            <FilterSidebar
                filters={filters}
                onChange={setFilters}
                onReset={() => setFilters(EMPTY_FILTERS)}
            />

            <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Header */}
                <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "20px", color: "#f1f5f9", fontWeight: 700 }}>
                            📦 Product Catalog
                        </h1>
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                            {loading ? "Loading..." : `${pagination.total_records} products`}
                        </p>
                    </div>
                </div>

                {/* Table */}
                <div style={{ flex: 1, overflowY: "auto" }}>
                    <ProductTable
                        products={products}
                        loading={loading}
                        onRowClick={setSelected}
                        sortBy={filters.sort_by}
                        sortDir={filters.sort_dir}
                        onSort={handleSort}
                    />
                </div>

                {/* Pagination */}
                <div style={{ padding: "12px 24px", borderTop: "1px solid #1e293b", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        style={{ padding: "6px 14px", background: "#1e293b", border: "1px solid #334155", borderRadius: "6px", color: page <= 1 ? "#475569" : "#e2e8f0", cursor: page <= 1 ? "not-allowed" : "pointer", fontSize: "13px" }}
                    >
                        ← Prev
                    </button>
                    <span style={{ color: "#64748b", fontSize: "13px" }}>
                        Page {pagination.page} of {pagination.total_pages || 1}
                    </span>
                    <button
                        disabled={page >= pagination.total_pages}
                        onClick={() => setPage((p) => p + 1)}
                        style={{ padding: "6px 14px", background: "#1e293b", border: "1px solid #334155", borderRadius: "6px", color: page >= pagination.total_pages ? "#475569" : "#e2e8f0", cursor: page >= pagination.total_pages ? "not-allowed" : "pointer", fontSize: "13px" }}
                    >
                        Next →
                    </button>
                </div>
            </main>

            <ProductDrawer product={selected} onClose={() => setSelected(null)} />
        </div>
    );
};

export default CatalogPage;
