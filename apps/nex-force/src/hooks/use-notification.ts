import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

export interface NotiChanel {
    ChanelId: number;
    ChanelKey: string;
    ChanelName: string;
    isActive: boolean;
}

export interface NotiModule {
    moduleId: number;
    moduleCode: string;
    module: string;
    description: string;
    SeqShow: number;
    isActive: boolean;
}

export interface NotiSetting {
    SettingId: number;
    ModuleId: number;
    ChanelId: number;
    isActive: boolean;
}

export function useNotiModules() {
    return useQuery({
        queryKey: ["notiModules"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("Notification/getAllNotiModule");
            return data?.data || [];
        },
    });
}

export function useNotiChanels() {
    return useQuery({
        queryKey: ["notiChanels"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("Notification/getAllNotiChanel");
            return data?.data || [];
        },
    });
}

export function useNotiSettings() {
    return useQuery({
        queryKey: ["notiSettings"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("Notification/getAllNotiSetting");
            return data?.data || [];
        },
    });
}

export function useAddNotiModule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await apiClient.post<any>("Notification/addModule", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notiModules"] });
            toast.success("Module added successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to add module"));
        }
    });
}

export function useDeleteNotiModule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete<any>(`Notification/delete?id=${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notiModules"] });
            toast.success("Module deleted successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to delete module"));
        }
    });
}
