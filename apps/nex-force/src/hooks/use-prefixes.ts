import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

export interface Prefixes {
    prefixId: number;
    prefixKey: string;
    prefixLabel: string;
    prefixValue: string;
    seqShow: number;
    isActive: boolean;
    createBy?: string;
    createDate?: string;
    updateBy?: string;
    updateDate?: string;
}

export function usePrefixes() {
    return useQuery({
        queryKey: ["prefixes"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("PreFixes/getAllPrefixes");
            return data?.data || [];
        },
    });
}

export function useUpdatePrefix() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await apiClient.post<any>("PreFixes/update", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["prefixes"] });
            toast.success("Prefix saved successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to save prefix"));
        }
    });
}
