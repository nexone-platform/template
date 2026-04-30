import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

export interface AssetData {
    id: number;
    assetId: number;
    assetName: string;
    assignedDate: string;
    assetCode: string;
    category: string;
    type: string;
    serialNumber: string;
    brand: string;
    cost: number;
    location: string;
    warrantyStart: string;
    warrantyEnd: string;
    vendor: string;
    assetModel: string;
    productNo: string;
    assetUser: string;
    status: string;
}

export function useAssets() {
    return useQuery({
        queryKey: ["assets"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("asset/getAssets");
            return data?.data || [];
        },
    });
}

export function useUpdateAsset() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await apiClient.post<any>("asset/update", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assets"] });
            toast.success("Asset saved successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to save asset"));
        }
    });
}

export function useDeleteAsset() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete<any>(`asset/delete?id=${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assets"] });
            toast.success("Asset deleted successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to delete asset"));
        }
    });
}
