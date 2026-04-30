import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { TimesheetRespond } from "@/types/timesheet";

export function useTimesheet(empId: string | null) {
    return useQuery({
        queryKey: ["timesheet", empId],
        queryFn: async () => {
            if (!empId) return { data: [], totalData: 0 };
            const { data } = await apiClient.get<any>(`timesheet?empId=${empId}`);
            return data;
        },
        enabled: !!empId,
    });
}

export function useTimesheetEvents(month: number, year: number, empId: number | null, lang: string = "en") {
    return useQuery({
        queryKey: ["timesheet-events", month, year, empId, lang],
        queryFn: async () => {
            if (!empId) return [];
            const { data } = await apiClient.get<any[]>(`timesheet/events?month=${month}&year=${year}&empId=${empId}&lang=${lang}`);
            return data;
        },
        enabled: !!empId,
    });
}

export function useTimesheetById(timesheetId: number | null) {
    return useQuery({
        queryKey: ["timesheet-detail", timesheetId],
        queryFn: async () => {
            if (!timesheetId) return null;
            const { data } = await apiClient.get<TimesheetRespond>(`timesheet/${timesheetId}`);
            return data;
        },
        enabled: !!timesheetId,
    });
}

export function useUpdateTimesheet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const { data } = await apiClient.post<any>(`timesheet/update`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["timesheet"] });
            queryClient.invalidateQueries({ queryKey: ["timesheet-events"] });
        },
    });
}

export function useDeleteTimesheet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete<any>(`timesheet/delete?id=${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["timesheet"] });
            queryClient.invalidateQueries({ queryKey: ["timesheet-events"] });
        },
    });
}
