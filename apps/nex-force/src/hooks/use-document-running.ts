import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

export interface DocumentRunning {
    documentId: number;
    documentType: string;
    description?: string;
    prefix?: string;
    formatDate?: string;
    suffix?: string;
    digitNumber?: number;
    running?: number;
    isActive: boolean;
    createBy?: string;
    createDate?: string;
    updateBy?: string;
    updateDate?: string;
}

export function useDocumentRunning() {
    return useQuery({
        queryKey: ["documentRunning"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("DocumentRunning/getAllDocument");
            return data?.data || [];
        },
    });
}

export function useUpdateDocumentRunning() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await apiClient.post<any>("DocumentRunning/update", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["documentRunning"] });
            toast.success("Document running saved successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to save document running"));
        }
    });
}

export function useDeleteDocumentRunning() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete<any>(`DocumentRunning/delete?id=${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["documentRunning"] });
            toast.success("Document running deleted successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to delete document running"));
        }
    });
}
