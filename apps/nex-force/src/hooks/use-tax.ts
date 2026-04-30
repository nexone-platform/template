import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

export interface TaxDeductionType {
    taxDeductionTypeId: number;
    taxDeductionTypeNameTh: string;
    taxDeductionTypeNameEn: string;
    taxDeductionTypeCode: string;
    maxAmount: number;
    isActive: boolean;
    createDate: string;
    createBy: string;
    updateDate: string;
    updateBy: string;
    effectiveDateStart: string;
    effectiveDateEnd: string;
    id: number;
}

export interface TaxDeduction {
    taxDeductionId: number;
    employeeId: number;
    employeeName: string;
    taxDeductionTypeId: number;
    taxDeductionTypeName: string;
    deductionAmount: number;
    deductionDate: string;
    effectiveDateStart: string;
    effectiveDateEnd: string;
    createDate: string;
    createBy: string;
    updateDate: string;
    updateBy: string;
    id: number;
    imgPath?: string;
    reason: string;
}

interface ApiResponse<T = unknown> {
    data: T;
    message: string;
    success: boolean;
}

export function useTaxDeductions() {
    return useQuery({
        queryKey: ["tax-deductions"],
        queryFn: async () => {
            const { data } = await apiClient.get<ApiResponse<TaxDeduction[]>>("/tax");
            return data.data;
        }
    });
}

export function useTaxTypes() {
    return useQuery({
        queryKey: ["tax-types"],
        queryFn: async () => {
            const { data } = await apiClient.get<ApiResponse<TaxDeductionType[]>>("/tax/getType");
            return data.data;
        }
    });
}

export function useSaveTaxDeduction() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse, Error, Partial<TaxDeduction>>({
        mutationFn: async (data: Partial<TaxDeduction>) => {
            const username = localStorage.getItem("username");
            const payload = {
                ...data,
                username
            };
            const response = await apiClient.post<ApiResponse>(`/tax/update`, payload);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["tax-deductions"] });
            toast.success(data.message || "Tax deduction saved successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to save tax deduction"));
        }
    });
}

export function useDeleteTaxDeduction() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse, Error, number>({
        mutationFn: async (id: number) => {
            const response = await apiClient.delete<ApiResponse>(`/tax/delete?id=${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["tax-deductions"] });
            toast.success(data.message || "Tax deduction deleted successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to delete tax deduction"));
        }
    });
}

export function useSaveTaxType() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse, Error, Partial<TaxDeductionType>>({
        mutationFn: async (data: Partial<TaxDeductionType>) => {
            const username = localStorage.getItem("username");
            const payload = {
                ...data,
                username
            };
            const response = await apiClient.post<ApiResponse>(`/tax/taxType/save`, payload);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["tax-types"] });
            toast.success(data.message || "Tax type saved successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to save tax type"));
        }
    });
}

export function useDeleteTaxType() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse, Error, number>({
        mutationFn: async (id: number) => {
            const response = await apiClient.delete<ApiResponse>(`/tax/deleteType?id=${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["tax-types"] });
            toast.success(data.message || "Tax type deleted successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to delete tax type"));
        }
    });
}

export interface IncomeTaxBracket {
    incomeTaxBracketId: number;
    minIncome: number;
    maxIncome?: number;
    taxRate: number;
    effectiveDateStart: string;
    effectiveDateEnd?: string;
    reason: string;
    createDate?: string;
    createBy?: string;
    updateDate?: string;
    updateBy?: string;
    isActive?: boolean;
    id?: number;
}

export function useTaxIncome() {
    return useQuery({
        queryKey: ["tax-income"],
        queryFn: async () => {
            const { data } = await apiClient.get<ApiResponse<IncomeTaxBracket[]>>("/tax/getIncomeTaxBracket");
            return data.data;
        }
    });
}

export function useSaveTaxIncome() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse, Error, Partial<IncomeTaxBracket>>({
        mutationFn: async (data: Partial<IncomeTaxBracket>) => {
            const username = localStorage.getItem("username");
            const payload = {
                ...data,
                username
            };
            const response = await apiClient.post<ApiResponse>(`/tax/incomeTaxBracket/save`, payload);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["tax-income"] });
            toast.success(data.message || "Tax bracket saved successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to save tax bracket"));
        }
    });
}

export function useDeleteTaxIncome() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse, Error, number>({
        mutationFn: async (id: number) => {
            const response = await apiClient.delete<ApiResponse>(`/tax/deleteIncome?id=${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["tax-income"] });
            toast.success(data.message || "Tax bracket deleted successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to delete tax bracket"));
        }
    });
}
