import apiClient from "@/lib/api-client";
import type { Overtime, OvertimeFilter, OTType } from "@/types/leave";

export const overtimeService = {
    getAll: async (filter: unknown): Promise<{ data: Overtime[]; totalData: number }> => {
        const { data } = await apiClient.post<{ data: Overtime[]; totalData: number }>("overtime/getAllOvertime", filter);
        return data;
    },

    getByFilter: async (filter: OvertimeFilter): Promise<{ data: Overtime[]; totalData: number }> => {
        const { data } = await apiClient.post<{ data: Overtime[]; totalData: number }>("overtime/getOvertimeByFilter", filter);
        return data;
    },

    getStatistics: async (filter: unknown): Promise<unknown> => {
        const { data } = await apiClient.post("overtime/statistics", filter);
        return data;
    },

    getStatisticsById: async (id: number, filter: unknown): Promise<unknown> => {
        const { data } = await apiClient.post(`overtime/statistics/${id}`, filter);
        return data;
    },

    getTypes: async (): Promise<OTType[]> => {
        const { data } = await apiClient.get<OTType[]>("overtime/getOtType");
        return data;
    },

    getById: async (id: number): Promise<Overtime> => {
        const { data } = await apiClient.get<Overtime>(`overtime/${id}`);
        return data;
    },

    getAllById: async (id: number, filter: unknown): Promise<{ data: Overtime[]; totalData: number }> => {
        const { data } = await apiClient.post<{ data: Overtime[]; totalData: number }>(`overtime/getAllOvertimeById/${id}`, filter);
        return data;
    },

    getAllByRequestor: async (id: number, filter: unknown): Promise<{ data: Overtime[]; totalData: number }> => {
        const { data } = await apiClient.post<{ data: Overtime[]; totalData: number }>(`overtime/getAllOvertimeByRequestor/${id}`, filter);
        return data;
    },

    update: async (otData: unknown): Promise<{ message: string }> => {
        const { data } = await apiClient.post<{ message: string }>("overtime/update", otData);
        return data;
    },

    updateOtType: async (otType: unknown): Promise<{ message: string }> => {
        const { data } = await apiClient.post<{ message: string }>("overtime/updateOtType", otType);
        return data;
    },

    approve: async (id: number, requestBody: unknown): Promise<{ message: string }> => {
        const { data } = await apiClient.post<{ message: string }>(`overtime/approve/${id}`, requestBody);
        return data;
    },
};
