import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export function useOvertimeEvents(filtered: any) {
    return useQuery({
        queryKey: ["overtime", filtered],
        queryFn: async () => {
            const { data } = await apiClient.post<any>("overtime/getAllOvertime", filtered);
            return data?.data || [];
        },
        enabled: !!filtered,
    });
}

export function useOvertimeByFilter(filtered: any) {
    return useQuery({
        queryKey: ["overtimeFilter", filtered],
        queryFn: async () => {
            const { data } = await apiClient.post<any>("overtime/getOvertimeByFilter", filtered);
            return data;
        },
        enabled: !!filtered,
    });
}

export function useOvertimeStatistics(filter: any) {
    return useQuery({
        queryKey: ["overtimeStatistics", filter],
        queryFn: async () => {
            const { data } = await apiClient.post<any>("overtime/statistics", filter);
            return data?.data || [];
        },
        enabled: !!filter,
    });
}

export function useOvertimeStatisticsById(id: string | number | null, filter: any) {
    return useQuery({
        queryKey: ["overtimeStatisticsById", id, filter],
        queryFn: async () => {
            if (!id) return [];
            const { data } = await apiClient.post<any>(`overtime/statistics/${id}`, filter);
            return data;
        },
        enabled: !!id,
    });
}

export function useOvertimeTypes() {
    return useQuery({
        queryKey: ["overtimeTypes"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("overtime/getOtType");
            return data?.data || [];
        },
    });
}

export function useAllOvertimeById(id: string | number | null, filter: any) {
    return useQuery({
        queryKey: ["overtimeById", id, filter],
        queryFn: async () => {
            if (!id) return { data: [], totalData: 0 };
            const { data } = await apiClient.post<any>(`overtime/getAllOvertimeById/${id}`, filter);
            return data;
        },
        enabled: !!id,
    });
}

export function useAllOvertimeByRequestor(id: string | number | null, filter: any) {
    return useQuery({
        queryKey: ["overtimeByRequestor", id, filter],
        queryFn: async () => {
            if (!id) return { data: [], totalData: 0 };
            const { data } = await apiClient.post<any>(`overtime/getAllOvertimeByRequestor/${id}`, filter);
            return data;
        },
        enabled: !!id,
    });
}

// Mutations
export function useUpdateOvertime() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await apiClient.post<any>("overtime/update", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["overtimeByRequestor"] });
            queryClient.invalidateQueries({ queryKey: ["overtime"] });
        },
    });
}

export function useUpdateOvertimeType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await apiClient.post<any>("overtime/updateOtType", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["overtimeTypes"] });
        },
    });
}

export function useApproveOvertime() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: number, payload: any }) => {
            const { data } = await apiClient.post<any>(`overtime/approve/${id}`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["overtime"] });
            queryClient.invalidateQueries({ queryKey: ["overtimeByRequestor"] });
        },
    });
}
