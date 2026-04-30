import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export function useShiftSchedule() {
    return useQuery({
        queryKey: ["shiftSchedule"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("shift/schedule");
            return data?.data || [];
        },
    });
}

export function useShiftList() {
    return useQuery({
        queryKey: ["shiftList"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("shift/list");
            return data?.data || [];
        },
    });
}

// Additional hooks can be added here for shift mutations (add, edit, delete, assign)
