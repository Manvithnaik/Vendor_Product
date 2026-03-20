import axiosClient from "@/shared/axiosClient";
import type {
    ApiResponse,
    PaginatedApiResponse,
    ProductListItem,
    ProductDetail,
    ProductCreatePayload,
    ProductUpdatePayload,
    StockUpdatePayload,
    ProductFilters,
    CatalogSummary,
    LowStockItem,
    CategoryDistribution,
} from "../types/product";

// ──────────────────────────────────────────
// MANUFACTURER CATALOG API
// ──────────────────────────────────────────

export const catalogApi = {
    getProducts: async (
        filters: ProductFilters = {},
        page = 1,
        limit = 20
    ): Promise<PaginatedApiResponse<ProductListItem>> => {
        const params = { ...filters, page, limit };
        const res = await axiosClient.get("/catalog/", { params });
        return res.data;
    },

    getProductDetail: async (
        productId: number
    ): Promise<ApiResponse<ProductDetail>> => {
        const res = await axiosClient.get(`/catalog/${productId}`);
        return res.data;
    },
};

// ──────────────────────────────────────────
// VENDOR MANAGEMENT API
// ──────────────────────────────────────────

export const vendorApi = {
    getVendorProducts: async (
        vendorId: number,
        page = 1,
        limit = 20
    ): Promise<PaginatedApiResponse<ProductListItem>> => {
        const res = await axiosClient.get(`/vendor/${vendorId}/products`, {
            params: { page, limit },
        });
        return res.data;
    },

    createProduct: async (
        payload: ProductCreatePayload
    ): Promise<ApiResponse<ProductDetail>> => {
        const res = await axiosClient.post("/vendor/products", payload);
        return res.data;
    },

    updateProduct: async (
        productId: number,
        payload: ProductUpdatePayload
    ): Promise<ApiResponse<ProductDetail>> => {
        const res = await axiosClient.patch(`/vendor/products/${productId}`, payload);
        return res.data;
    },

    updateStock: async (
        productId: number,
        payload: StockUpdatePayload
    ): Promise<ApiResponse<ProductDetail>> => {
        const res = await axiosClient.patch(
            `/vendor/products/${productId}/stock`,
            payload
        );
        return res.data;
    },

    softDeleteProduct: async (
        productId: number
    ): Promise<ApiResponse<null>> => {
        const res = await axiosClient.delete(`/vendor/products/${productId}`);
        return res.data;
    },
};

// ──────────────────────────────────────────
// ANALYTICS API
// ──────────────────────────────────────────

export const analyticsApi = {
    getSummary: async (): Promise<ApiResponse<CatalogSummary>> => {
        const res = await axiosClient.get("/analytics/summary");
        return res.data;
    },

    getLowStock: async (): Promise<ApiResponse<LowStockItem[]>> => {
        const res = await axiosClient.get("/analytics/low-stock");
        return res.data;
    },

    getCategoryDistribution: async (): Promise<
        ApiResponse<CategoryDistribution[]>
    > => {
        const res = await axiosClient.get("/analytics/categories");
        return res.data;
    },
};
