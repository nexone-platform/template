import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

export interface MenuDto {
    menusId: number;
    title: string;
    icon?: string;
    menuValue: string;
    route: string;
    parentId?: number;
    isActive: boolean;
    menuCode: string;
}

export interface TranslationDto {
    translationsId: number;
    languageCode: string;
    pageKey: string;
    labelKey: string;
    labelValue: string;
}

export function useMenusList() {
    return useQuery({
        queryKey: ["menus", "list"],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data: MenuDto[] }>("menu/menulist");
            return data?.data || [];
        },
    });
}

export function useUpdateMenu() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: Partial<MenuDto>) => {
            const { data } = await apiClient.post<{ message: string }>("menu/update", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["menus"] });
            toast.success("Menu updated successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to update menu"));
        }
    });
}

export function useDeleteMenu() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete<{ message: string }>(`menu/delete?id=${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["menus"] });
            toast.success("Menu deleted successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to delete menu"));
        }
    });
}

export function useLabelList(search: { pageKey?: string; languageCode?: string; labelKey?: string; labelValue?: string }) {
    return useQuery({
        queryKey: ["translations", "labels", search],
        queryFn: async () => {
            const { data } = await apiClient.post<{ data: TranslationDto[] }>("translations/labelList", search);
            return data?.data || [];
        },
    });
}

export function useUpdateLabel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: Partial<TranslationDto>) => {
            const { data } = await apiClient.post<{ message: string }>("translations/update", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["translations"] });
            toast.success("Label updated successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to update label"));
        }
    });
}

export function usePageKeys() {
    return useQuery({
        queryKey: ["translations", "pageKeys"],
        queryFn: async () => {
            const { data } = await apiClient.post<{ data: any[] }>("translations/getPageKey", {});
            // API returns objects, we need unique pageKey strings
            const rawItems = data?.data || [];
            const keys = rawItems.map((item: any) => typeof item === "string" ? item : item.pageKey).filter(Boolean);
            return Array.from(new Set(keys)) as string[];
        },
    });
}
