import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

export function useInitializeData() {
    return useMutation({
        mutationFn: async (username: string) => {
            const { data } = await apiClient.post<any>("dataSettings", {
                username: username
            });
            return data;
        },
        onSuccess: (data) => {
            toast.success(data?.message || "Data initialized successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to initialize data"));
        }
    });
}
