import axiosClient from "../../../shared/axiosClient";
import type { ApiResponse } from "../types/product";

export const integrationApi = {
    logProcurementEvent: async (eventType: string, payload: Record<string, any>): Promise<ApiResponse<null>> => {
        const res = await axiosClient.post("/integration/procurement-event", {
            event_type: eventType,
            payload: payload
        });
        return res.data;
    }
};
