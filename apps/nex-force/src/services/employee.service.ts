import apiClient from "@/lib/api-client";
import type { Employee, EmployeeResponse, SearchCriteria, Bank } from "@/types/employee";
import type { ApiResult } from "@/types/api";

export const employeeService = {
    getAll: async (): Promise<EmployeeResponse> => {
        const { data } = await apiClient.get<EmployeeResponse>("employees/getAllEmployee");
        return data;
    },

    getForAutocomplete: async (): Promise<ApiResult> => {
        const { data } = await apiClient.get<ApiResult>("employees/getEmployeeForSelect");
        return data;
    },

    getByProjectId: async (projectId: number): Promise<ApiResult> => {
        const { data } = await apiClient.get<ApiResult>(`employees/getEmployeeByprojectId/${projectId}`);
        return data;
    },

    getById: async (id: number): Promise<Employee> => {
        const { data } = await apiClient.get<Employee>(`employees/${id}`);
        return data;
    },

    update: async (employee: FormData): Promise<{ message: string }> => {
        const { data } = await apiClient.post<{ message: string }>("employees/update", employee, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
    },

    search: async (criteria?: SearchCriteria): Promise<EmployeeResponse> => {
        const { data } = await apiClient.post<EmployeeResponse>("employees/search", criteria);
        return data;
    },

    delete: async (empId: number): Promise<{ message: string }> => {
        const { data } = await apiClient.delete<{ message: string }>(`employees/delete?id=${empId}`);
        return data;
    },

    reactivate: async (employeeId: number, username: string): Promise<{ message: string }> => {
        const { data } = await apiClient.post<{ message: string }>(`employees/reactivate/${employeeId}`, { username });
        return data;
    },

    getBankData: async (): Promise<Bank[]> => {
        const { data } = await apiClient.get<Bank[]>("employees/getBankData");
        return data;
    },
};
