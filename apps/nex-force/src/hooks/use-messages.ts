"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { useLanguage } from "@/lib/language";
import { useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Response Messages Hook
//
// Fetches response/error messages from DB, caches them, and provides
// helper functions: msg(), showSuccess(), showError(), showConfirm()
// ---------------------------------------------------------------------------

export interface ResponseMessage {
    messageId: number;
    languageCode: string;
    messageKey: string;
    category: string; // success | error | warning | confirm | info
    title: string;
    message: string;
    isActive: boolean;
    createDate?: string;
    createBy?: string;
    updateDate?: string;
    updateBy?: string;
}

// ── Fetch messages for a language ──
async function fetchMessages(languageCode: string): Promise<ResponseMessage[]> {
    const { data } = await apiClient.post("responseMessages/list", {
        LanguageCode: languageCode,
    });
    return data?.data || [];
}

// ── Main hook: provides msg() and Swal helpers ──
export function useMessages() {
    const { currentLang } = useLanguage();

    const { data: messages = [], isLoading } = useQuery({
        queryKey: ["responseMessages", currentLang],
        queryFn: () => fetchMessages(currentLang),
        staleTime: 30 * 60 * 1000, // 30 min cache
        gcTime: 60 * 60 * 1000,
    });

    // Build a lookup map: messageKey → ResponseMessage
    const messageMap = useMemo(() => {
        const map: Record<string, ResponseMessage> = {};
        for (const m of messages) {
            map[m.messageKey] = m;
        }
        return map;
    }, [messages]);

    // Get a message by key — returns the message text or fallback
    const msg = useCallback(
        (key: string, fallback?: string): string => {
            return messageMap[key]?.message || fallback || key;
        },
        [messageMap]
    );

    // Get a title by key
    const msgTitle = useCallback(
        (key: string, fallback?: string): string => {
            return messageMap[key]?.title || fallback || key;
        },
        [messageMap]
    );

    // ── Swal Helpers ──

    const showSuccess = useCallback(
        (key: string, fallbackTitle?: string, fallbackMsg?: string) => {
            const entry = messageMap[key];
            return Swal.fire({
                title: entry?.title || fallbackTitle || "Success",
                text: entry?.message || fallbackMsg || key,
                icon: "success",
            });
        },
        [messageMap]
    );

    const showError = useCallback(
        (key: string, fallbackTitle?: string, fallbackMsg?: string) => {
            const entry = messageMap[key];
            return Swal.fire({
                title: entry?.title || fallbackTitle || "Error",
                text: entry?.message || fallbackMsg || key,
                icon: "error",
            });
        },
        [messageMap]
    );

    const showWarning = useCallback(
        (key: string, fallbackTitle?: string, fallbackMsg?: string) => {
            const entry = messageMap[key];
            return Swal.fire({
                title: entry?.title || fallbackTitle || "Warning",
                text: entry?.message || fallbackMsg || key,
                icon: "warning",
            });
        },
        [messageMap]
    );

    const showConfirm = useCallback(
        (
            key: string,
            onConfirm: () => void,
            options?: {
                fallbackTitle?: string;
                fallbackMsg?: string;
                confirmText?: string;
                cancelText?: string;
            }
        ) => {
            const entry = messageMap[key];
            const confirmBtnKey = messageMap["BTN_CONFIRM"];
            const cancelBtnKey = messageMap["BTN_CANCEL"];

            return Swal.fire({
                title: entry?.title || options?.fallbackTitle || "Confirm",
                text: entry?.message || options?.fallbackMsg || key,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText:
                    options?.confirmText || confirmBtnKey?.message || "Confirm",
                cancelButtonText:
                    options?.cancelText || cancelBtnKey?.message || "Cancel",
            }).then((result) => {
                if (result.isConfirmed) {
                    onConfirm();
                }
            });
        },
        [messageMap]
    );

    const showToastError = useCallback(
        (key: string, fallback?: string) => {
            const entry = messageMap[key];
            toast.error(entry?.message || fallback || key);
        },
        [messageMap]
    );

    const showToastSuccess = useCallback(
        (key: string, fallback?: string) => {
            const entry = messageMap[key];
            toast.success(entry?.message || fallback || key);
        },
        [messageMap]
    );

    return {
        messages,
        messageMap,
        isLoading,
        msg,
        msgTitle,
        showSuccess,
        showError,
        showWarning,
        showConfirm,
        showToastError,
        showToastSuccess,
    };
}

// ── Admin hook: CRUD for response messages ──
export function useResponseMessagesAdmin() {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: ["responseMessages", "admin"],
        queryFn: async () => {
            const { data } = await apiClient.post("responseMessages/adminList", {});
            return (data?.data || []) as ResponseMessage[];
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (dto: Partial<ResponseMessage> & { username?: string }) => {
            const { data } = await apiClient.post("responseMessages/update", {
                MessageId: dto.messageId || 0,
                LanguageCode: dto.languageCode,
                MessageKey: dto.messageKey,
                Category: dto.category,
                Title: dto.title,
                Message: dto.message,
                IsActive: dto.isActive ?? true,
                Username: dto.username,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["responseMessages"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete("responseMessages/delete", {
                params: { id },
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["responseMessages"] });
        },
    });

    return {
        messages: listQuery.data || [],
        isLoading: listQuery.isLoading,
        refetch: listQuery.refetch,
        updateMutation,
        deleteMutation,
    };
}
