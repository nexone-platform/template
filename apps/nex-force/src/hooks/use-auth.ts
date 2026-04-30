import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

export function useChangePassword() {
    return useMutation({
        mutationFn: async (data: any) => {
            const { data: response } = await apiClient.post("auth/change-password", data);
            return response;
        },
        onSuccess: (data) => {
            toast.success(data?.message || "Password updated successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to update password"));
        }
    });
}
