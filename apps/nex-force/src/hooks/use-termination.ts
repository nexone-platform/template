import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface TerminateType {
    terminateTypeId: number;
    terminateTypeNameTh: string;
    terminateTypeNameEn: string;
    terminateTypeCode: string;
    isActive: boolean;
    id: number;
}

export interface Termination {
    terminateId: number;
    terminateTypeId: number;
    terminateTypeName: string;
    employeeId: number;
    employeeName: string;
    designationId: number;
    designationName: string;
    noticeDate: string;
    terminateDate: string;
    reason: string;
    id: number;
    imgPath: string | null;
}

export interface EmployeeBrief {
    id: number;
    employeeId: string;
    firstNameEn: string;
    lastNameEn: string;
    firstNameTh: string | null;
    lastNameTh: string | null;
    email: string;
    imgPath: string | null;
    salary?: number;
    departmentId?: number;
    designationId?: number;
}

export function useTerminationList() {
    return useQuery({
        queryKey: ["terminations"],
        queryFn: async () => {
            const { data } = await apiClient.get("/terminate");
            return data.data as Termination[];
        }
    });
}

export function useTerminationTypes() {
    return useQuery({
        queryKey: ["terminationTypes"],
        queryFn: async () => {
            const { data } = await apiClient.get("/terminate/getType");
            return data.data as TerminateType[];
        }
    });
}

export function useEmployeeBrief() {
    return useQuery({
        queryKey: ["employeesBrief"],
        queryFn: async () => {
            const { data } = await apiClient.get("/employees/getEmployeeForSelect");
            return data.data as EmployeeBrief[];
        }
    });
}

export function useUpdateTermination() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Partial<Termination> & { username?: string }) => {
            const response = await apiClient.post("/terminate/update", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["terminations"] });
        }
    });
}

export function useDeleteTermination() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const response = await apiClient.delete(`/terminate/delete?id=${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["terminations"] });
        }
    });
}

export function useUpdateTerminationType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Partial<TerminateType> & { username?: string }) => {
            const response = await apiClient.post("/terminate/terminateType/save", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["terminationTypes"] });
        }
    });
}

export function useDeleteTerminationType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const response = await apiClient.delete(`/terminate/deleteType?id=${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["terminationTypes"] });
        }
    });
}
