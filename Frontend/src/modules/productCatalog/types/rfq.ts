export type RFQRequestStatus = "PENDING" | "RESPONDED" | "CLOSED" | "EXPIRED";
export type RFQResponseStatus = "ACCEPTED" | "REJECTED" | "COUNTERED";

export interface RFQResponseDTO {
    response_id: number;
    rfq_id: number;
    vendor_id: number;
    quoted_price: number;
    available_quantity: number;
    status: RFQResponseStatus;
    created_at: string;
    updated_at: string;
}

export interface RFQRequestDTO {
    rfq_id: number;
    product_id: number;
    manufacturer_id: number;
    requested_quantity: number;
    message: string;
    status: RFQRequestStatus;
    created_at: string;
    updated_at: string;
    responses: RFQResponseDTO[];
}

export interface RFQCreatePayload {
    product_id: number;
    manufacturer_id: number;
    requested_quantity: number;
    message: string;
}

export interface RFQRespondPayload {
    quoted_price: number;
    available_quantity: number;
}
