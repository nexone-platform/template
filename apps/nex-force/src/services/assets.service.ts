/**
 * Assets API service — replaces Angular's AssetsService.
 *
 * Conversion:
 *   Angular Injectable class + RxJS Observable → plain async functions + Axios
 *   BaseApiService.get/post/delete → apiClient.get/post/delete
 */
import apiClient from "@/lib/api-client";
import type { Asset, AssetResponse } from "@/types/asset";

const BASE = "asset";

export const assetsService = {
    /** GET /asset/getAssets — list all assets */
    getAll: async (): Promise<AssetResponse> => {
        const { data } = await apiClient.get<AssetResponse>(`${BASE}/getAssets`);
        return data;
    },

    /** GET /asset/getAssets/:empId — get assets by employee */
    getByEmployee: async (empId: number): Promise<AssetResponse> => {
        const { data } = await apiClient.get<AssetResponse>(
            `${BASE}/getAssets/${empId}`
        );
        return data;
    },

    /** GET /asset/:id — get single asset */
    getById: async (id: number): Promise<Asset> => {
        const { data } = await apiClient.get<Asset>(`${BASE}/${id}`);
        return data;
    },

    /** POST /asset/update — create or update asset (FormData) */
    update: async (formData: FormData): Promise<{ message: string }> => {
        const { data } = await apiClient.post<{ message: string }>(
            `${BASE}/update`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return data;
    },

    /** DELETE /asset/delete?id=:id */
    delete: async (id: number): Promise<{ message: string }> => {
        const { data } = await apiClient.delete<{ message: string }>(
            `${BASE}/delete?id=${id}`
        );
        return data;
    },
};
