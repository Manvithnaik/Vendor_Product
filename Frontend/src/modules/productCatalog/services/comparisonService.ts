import axiosClient from "../../../shared/axiosClient";
import type { ApiResponse } from "../types/product";
import type { ComparisonPayload, ScoredProductDTO } from "../types/comparison";

export const comparisonApi = {
    compareProducts: async (payload: ComparisonPayload): Promise<ApiResponse<ScoredProductDTO[]>> => {
        const res = await axiosClient.post("/comparison/compare", payload);
        return res.data;
    }
};
