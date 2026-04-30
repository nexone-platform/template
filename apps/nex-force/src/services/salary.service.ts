import apiClient from "@/lib/api-client";
import type { StatusRequest, PeriodRequest, Period } from "@/types/payroll";
import type { ApiResult } from "@/types/api";

export const salaryService = {
    getEmpByPayment: async (paymentTypeId: number): Promise<unknown> => {
        const { data } = await apiClient.get(`salary/byPaymentType?paymentTypeId=${paymentTypeId}`);
        return data;
    },

    getAllEmployee: async (): Promise<unknown> => {
        const { data } = await apiClient.get("salary/allEmployee");
        return data;
    },

    getAllPeriods: async (): Promise<ApiResult<Period[]>> => {
        const { data } = await apiClient.get<ApiResult<Period[]>>("salary/periods");
        return data;
    },

    searchAllPeriods: async (request: StatusRequest): Promise<ApiResult<Period[]>> => {
        const { data } = await apiClient.post<ApiResult<Period[]>>("salary/search-periods", request);
        return data;
    },

    getPeriodsByStatus: async (request: StatusRequest): Promise<unknown> => {
        const { data } = await apiClient.post("salary/periods/by-status", request);
        return data;
    },

    getSSO: async (): Promise<ApiResult> => {
        const { data } = await apiClient.get<ApiResult>("salary/SSO");
        return data;
    },

    getPayrollByPeriodsId: async (periodId: number): Promise<ApiResult> => {
        const { data } = await apiClient.get<ApiResult>(`salary/payroll/${periodId}`);
        return data;
    },

    createPayroll: async (payrollData: unknown): Promise<{ message: string }> => {
        const { data } = await apiClient.post<{ message: string }>("salary/createPayroll", payrollData);
        return data;
    },

    getPayrollByPeriod: async (request: PeriodRequest): Promise<unknown> => {
        const { data } = await apiClient.post("salary/getPayrollByPeriod", request);
        return data;
    },

    updateStatus: async (periodId: number, status: number, reason: string): Promise<{ message: string }> => {
        const { data } = await apiClient.post<{ message: string }>("salary/update-period-status", { periodId, status, reason });
        return data;
    },

    getEstimatedById: async (employeeId: number): Promise<unknown> => {
        const { data } = await apiClient.get(`salary/estimated-tax/${employeeId}`);
        return data;
    },
};
