import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Special, SpecialData } from "@/types/working-days";

export function useSpecialWorkingDays() {
    return useQuery<SpecialData>({
        queryKey: ["specialWorkingDays"],
        queryFn: async () => {
            const { data } = await apiClient.get<SpecialData>("specialWorkingDays/getAllSpecialDay");
            return data;
        },
    });
}

export function useUpdateWorkingDay() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (holiday: Special) => {
            const { data } = await apiClient.post<Special>("specialWorkingDays/update", holiday);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["specialWorkingDays"] });
        },
    });
}

export function useDeleteWorkingDay() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete<any>(`specialWorkingDays/delete?id=${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["specialWorkingDays"] });
        },
    });
}

export function useCopyWorkingDays() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ specials, destinationYear }: { specials: Special[]; destinationYear: number }) => {
            const { data } = await apiClient.post<SpecialData>("specialWorkingDays/copy", {
                special: specials,
                destinationYear,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["specialWorkingDays"] });
        },
    });
}
