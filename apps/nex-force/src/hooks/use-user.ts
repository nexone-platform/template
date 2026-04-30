import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

export interface UserDto {
    userId: number;
    employeeId: string | null;
    employeeName: string | null;
    email: string | null;
    roleId: number | null;
    roleName: string | null;
    isActive: boolean;
    empId: number;
    id?: number;
    createDate?: string | null;
    createBy?: string | null;
    imgPath?: string | null;
}

export function useUsers() {
    return useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("user");
            return data?.data || [];
        },
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await apiClient.post<any>("user/update", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("User saved successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to save user"));
        }
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete<any>(`user/delete?id=${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("User deleted successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to delete user"));
        }
    });
}
