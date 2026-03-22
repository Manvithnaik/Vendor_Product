export interface ComparisonPayload {
    product_ids: number[];
    comparison_template_id?: number | null;
}

export interface ScoredProductDTO {
    product_id: number;
    vendor_id: number;
    price_score: number;
    stock_score: number;
    reliability_score: number;
    total_score: number;
    rank: number;
    risk_level: "LOW" | "MEDIUM" | "HIGH";
}
