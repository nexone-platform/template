import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

export interface IRole {
    roleId: number;
    roleName: string;
    departmentId?: number;
    department?: any;
}

export interface PermissionDTO {
    permissionsId: number | null;
    menusId: number;
    canView: boolean;
    canEdit: boolean;
    canAdd: boolean;
    canDelete: boolean;
    canImport: boolean;
    canExport: boolean;
    isActive: boolean;
}

export interface RolePermissionDTO {
    roleId: number;
    permissions: PermissionDTO[];
    username: string;
}

export function useRoles() {
    return useQuery({
        queryKey: ["roles"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("role");
            if (Array.isArray(data)) return data;
            if (data?.data && Array.isArray(data.data)) return data.data;
            if (data?.Data && Array.isArray(data.Data)) return data.Data;
            return [];
        },
    });
}

export function usePermissions(roleId: number) {
    return useQuery({
        queryKey: ["permissions", roleId],
        queryFn: async () => {
            if (!roleId) return [];
            const { data } = await apiClient.get<any>(`role/role?roleId=${roleId}`);
            return data || [];
        },
        enabled: !!roleId,
    });
}

export function useUpdateRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await apiClient.post<any>("role/update", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            toast.success("Role saved successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to save role"));
        }
    });
}

export function useDeleteRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete<any>(`role/delete?id=${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            toast.success("Role deleted successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to delete role"));
        }
    });
}

export function useUpdateRolePermissions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: RolePermissionDTO) => {
            const { data } = await apiClient.post<any>("role/create-or-update", payload);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["permissions", variables.roleId] });
            toast.success("Permissions saved successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to save permissions"));
        }
    });
}
