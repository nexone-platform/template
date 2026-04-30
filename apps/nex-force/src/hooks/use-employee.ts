import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface EmployeeSelect {
    id: number;
    employeeId: string;
    firstNameEn: string;
    lastNameEn: string;
    firstNameTh: string;
    lastNameTh: string;
    email?: string;
}

export function useEmployees() {
    return useQuery({
        queryKey: ["employees"],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data: any[] }>("employees/getAllEmployee");
            return data?.data || [];
        },
    });
}

export function useEmployeeSelect() {
    return useQuery({
        queryKey: ["employeeSelect"],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data: EmployeeSelect[] }>("employees/getEmployeeForSelect");
            return (data?.data || []);
        },
    });
}

export function useBankData() {
    return useQuery({
        queryKey: ["bankData"],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data: any[] }>("employees/getBankData");
            return data?.data || [];
        },
    });
}
