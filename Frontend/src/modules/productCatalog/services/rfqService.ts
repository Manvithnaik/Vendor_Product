import axiosClient from "../../../shared/axiosClient";
import type { ApiResponse } from "../types/product";
import type { RFQCreatePayload, RFQRespondPayload, RFQRequestDTO, RFQResponseDTO } from "../types/rfq";

export const rfqApi = {
    getManufacturerRfqs: async (manufacturerId: number): Promise<ApiResponse<RFQRequestDTO[]>> => {
        const res = await axiosClient.get(`/rfq/manufacturer/${manufacturerId}`);
        return res.data;
    },
    placeOrder: async (rfqId: number): Promise<ApiResponse<null>> => {
        const res = await axiosClient.post(`/rfq/${rfqId}/order`);
        return res.data;
    },
    getVendorRfqs: async (vendorId: number): Promise<ApiResponse<RFQRequestDTO[]>> => {
        const res = await axiosClient.get(`/rfq/vendor/${vendorId}`);
        return res.data;
    },
    createRfq: async (payload: RFQCreatePayload): Promise<ApiResponse<RFQRequestDTO>> => {
        const res = await axiosClient.post("/rfq/request", payload);
        return res.data;
    },
    respondToRfq: async (rfqId: number, vendorId: number, payload: RFQRespondPayload): Promise<ApiResponse<RFQResponseDTO>> => {
        const res = await axiosClient.post(`/rfq/${rfqId}/respond`, payload, {
            params: { vendor_id: vendorId }
        });
        return res.data;
    },
    expireRfq: async (rfqId: number): Promise<ApiResponse<null>> => {
        const res = await axiosClient.post(`/rfq/${rfqId}/expire`);
        return res.data;
    }
};
