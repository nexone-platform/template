import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

// --- Email Templates ---
export interface EmailTemplate {
    templateId: number;
    templateCode: string;
    title: string;
    languageCode: string;
    emailContent: string;
    isActive: boolean;
}

export function useEmailTemplates() {
    return useQuery({
        queryKey: ["emailTemplates"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("emailTemplate");
            return data?.data || [];
        },
    });
}

export function useUpdateEmailTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await apiClient.post<any>("emailTemplate/update", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["emailTemplates"] });
            toast.success("Email template saved successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to save email template"));
        }
    });
}

export function useDeleteEmailTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete<any>(`emailTemplate/delete?id=${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["emailTemplates"] });
            toast.success("Email template deleted successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to delete email template"));
        }
    });
}

// --- Email Settings ---
export interface EmailSetting {
    emailId: number;
    isEnabled: boolean;
    method: string;
    smtpServer: string;
    smtpLogin: string;
    smtpPassword?: string;
    fromName: string;
    fromEmail: string;
    toName: string;
    toEmail: string;
    isActive: boolean;
    smtpPort: string;
}

export function useEmailSettings() {
    return useQuery({
        queryKey: ["emailSettings"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("emailSetting");
            return data?.data || [];
        },
    });
}

export function useUpdateEmailSetting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await apiClient.post<any>("emailSetting/update", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["emailSettings"] });
            toast.success("Email setting saved successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to save email setting"));
        }
    });
}

export function useDeleteEmailSetting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete<any>(`emailSetting/delete?id=${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["emailSettings"] });
            toast.success("Email setting deleted successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to delete email setting"));
        }
    });
}
