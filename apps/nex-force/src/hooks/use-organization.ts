import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

export interface Company {
    organizationId: number;
    organizationNameTh: string;
    organizationNameEn?: string;
    isActive: boolean;
    organizationCode?: string;
    address?: string;
    country?: string;
    city?: string;
    contactPerson?: string;
    state?: string;
    postalCode?: string;
    email?: string;
    phone?: string;
    fax?: string;
    url?: string;
    logo?: string;
    favicon?: string;
    taxNo?: string;
}

export function useCompany() {
    return useQuery({
        queryKey: ["company"],
        queryFn: async () => {
            const { data } = await apiClient.get<Company>("organizations");
            return data;
        },
    });
}

export function useUpdateCompany() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            const { data } = await apiClient.post<any>("organizations/update", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["company"] });
            toast.success("Company settings updated successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to update company settings"));
        }
    });
}

export function useCompanyList() {
    return useQuery({
        queryKey: ["companyList"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("branch/company");
            return data?.data || [];
        },
    });
}

export function useOrganizationData() {
    return useQuery({
        queryKey: ["organizationData"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("organizations/getMasterOrganization");
            return data || [];
        },
    });
}

export function useBranchList() {
    return useQuery({
        queryKey: ["branchList"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("branch");
            return data?.data || [];
        },
    });
}

export function useUpdateBranch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            const { data } = await apiClient.post<any>("branch/update", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["branchList"] });
            toast.success("Branch saved successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to save branch"));
        }
    });
}

export function useDeleteBranch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete<any>(`branch/delete?id=${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["branchList"] });
            toast.success("Branch deleted successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to delete branch"));
        }
    });
}

export interface Department {
    departmentId: number;
    departmentNameTh: string;
    departmentNameEn: string;
    departmentCode?: string;
    organizationId?: number;
    isActive: boolean;
}

export interface Designation {
    designationId: number;
    designationNameTh?: string;
    designationNameEn?: string;
    designationCode?: string;
    departmentId?: number;
    isActive: boolean;
    departmentNameTh?: string;
    departmentNameEn?: string;
}

export function useDepartments() {
    return useQuery({
        queryKey: ["departments"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("departments/getAllDepartment");
            const raw = data?.data;
            return Array.isArray(raw) ? (raw as Department[]) : [];
        },
    });
}

export function useDesignations() {
    return useQuery({
        queryKey: ["designations"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("designations/getAllDesignation");
            const raw = data?.data;
            return Array.isArray(raw) ? (raw as Designation[]) : [];
        },
    });
}
