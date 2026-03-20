// ──────────────────────────────────────────
// GENERIC API ENVELOPE
// ──────────────────────────────────────────

export interface ApiResponse<T> {
    status: "success" | "error";
    message: string;
    data: T;
}

export interface Pagination {
    page: number;
    limit: number;
    total_records: number;
    total_pages: number;
}

export interface PaginatedApiResponse<T> {
    status: "success" | "error";
    message: string;
    data: T[];
    pagination: Pagination;
}

// ──────────────────────────────────────────
// PRODUCT DTOs
// ──────────────────────────────────────────

/** Projection DTO returned by catalog list and vendor list */
export interface ProductListItem {
    product_id: number;
    vendor_id: number;
    product_name: string;
    category_name: string | null;
    sub_category_name: string | null;
    brand_name: string | null;
    stock_keeping_unit: string;
    selling_price: number;
    available_stock_quantity: number;
    // Computed
    effective_price: number;
    stock_status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
    // AI-ready hooks (placeholders)
    vendor_reliability_score: number | null;
    demand_trend_indicator: string | null;
}

/** Full detail DTO */
export interface ProductDetail {
    product_id: number;
    vendor_id: number;
    product_name: string;
    category_name: string | null;
    sub_category_name: string | null;
    brand_name: string | null;
    stock_keeping_unit: string;
    barcode_number: string | null;
    selling_price: number;
    cost_price: number | null;
    discount_percentage: number;
    tax_percentage: number;
    minimum_order_quantity: number;
    available_stock_quantity: number;
    reorder_alert_level: number;
    unit_of_measure: string | null;
    weight_in_kg: number | null;
    dimensions_in_cm: string | null;
    product_description: string | null;
    product_image_url: string | null;
    is_active: boolean;
    effective_price: number;
    stock_status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
    vendor_reliability_score: number | null;
    demand_trend_indicator: string | null;
    created_at: string | null;
    updated_at: string | null;
}

// ──────────────────────────────────────────
// FORM / REQUEST PAYLOADS
// ──────────────────────────────────────────

export interface ProductCreatePayload {
    vendor_id: number;
    product_name: string;
    category_name?: string;
    sub_category_name?: string;
    brand_name?: string;
    stock_keeping_unit: string;
    barcode_number?: string;
    selling_price: number;
    cost_price?: number;
    discount_percentage?: number;
    tax_percentage?: number;
    minimum_order_quantity: number;
    available_stock_quantity?: number;
    reorder_alert_level?: number;
    unit_of_measure?: string;
    weight_in_kg?: number;
    dimensions_in_cm?: string;
    product_description?: string;
    product_image_url?: string;
}

export interface ProductUpdatePayload {
    product_name?: string;
    category_name?: string;
    selling_price?: number;
    discount_percentage?: number;
    tax_percentage?: number;
    reorder_alert_level?: number;
    product_description?: string;
    is_active?: boolean;
    minimum_order_quantity?: number;
}

export interface StockUpdatePayload {
    available_stock_quantity: number;
}

// ──────────────────────────────────────────
// CATALOG FILTER PARAMS
// ──────────────────────────────────────────

export interface ProductFilters {
    search?: string;
    category_name?: string;
    brand_name?: string;
    min_price?: number;
    max_price?: number;
    min_stock?: number;
    sort_by?: string;
    sort_dir?: "asc" | "desc";
}

// ──────────────────────────────────────────
// ANALYTICS DTOs
// ──────────────────────────────────────────

export interface LowStockItem {
    product_id: number;
    product_name: string;
    stock_keeping_unit: string;
    available_stock_quantity: number;
    reorder_alert_level: number;
    vendor_id: number;
}

export interface CategoryDistribution {
    category_name: string | null;
    product_count: number;
}

export interface CatalogSummary {
    total_active_products: number;
    low_stock_count: number;
    out_of_stock_count: number;
    category_distribution: CategoryDistribution[];
}
