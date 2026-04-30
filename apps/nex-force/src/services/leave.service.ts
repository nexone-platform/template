import apiClient from "@/lib/api-client";
import type { LeaveTypeData, LeaveRequest } from "@/types/leave";
import type { ApiResult } from "@/types/api";

export const leaveService = {
    getMasterLeaveType: async (): Promise<ApiResult<LeaveTypeData[]>> => {
        const { data } = await apiClient.get<ApiResult<LeaveTypeData[]>>("leaves/getMasterLeaveType");
        return data;
    },

    updateLeaveType: async (leaveType: Partial<LeaveTypeData>): Promise<{ message: string }> => {
        const { data } = await apiClient.post<{ message: string }>("leaves/leaveType/update", leaveType);
        return data;
    },

    deleteLeaveType: async (id: number): Promise<{ message: string }> => {
        const { data } = await apiClient.delete<{ message: string }>(`leaves/leaveType/delete?id=${id}`);
        return data;
    },

    getLeaveQuota: async (): Promise<ApiResult> => {
        const { data } = await apiClient.get<ApiResult>("leaveQuota/getLeaves");
        return data;
    },

    updateLeaveQuota: async (leaveQuota: unknown): Promise<{ message: string }> => {
        const { data } = await apiClient.post<{ message: string }>("leaveQuota/update", leaveQuota);
        return data;
    },

    deleteLeaveQuota: async (id: number): Promise<{ message: string }> => {
        const { data } = await apiClient.delete<{ message: string }>(`leaveQuota/delete?id=${id}`);
        return data;
    },

    getById: async (leaveId: number): Promise<LeaveRequest> => {
        const { data } = await apiClient.get<LeaveRequest>(`leaves/${leaveId}`);
        return data;
    },

    // ── LeaveRequest endpoints (Angular: LeaveRequestService) ──

    /** GET leaveRequest/employee/:employeeId — used by leave-employee table */
    getLeaveByEmployee: async (employeeId: number): Promise<ApiResult> => {
        const { data } = await apiClient.get<ApiResult>(`leaveRequest/employee/${employeeId}`);
        return data;
    },

    /** GET leaveRequest/getAllRequest — used by leave-admin table */
    getAllRequest: async (): Promise<ApiResult> => {
        const { data } = await apiClient.get<ApiResult>("leaveRequest/getAllRequest");
        return data;
    },

    /** GET leaveRequest/available-quota?employeeId=&year=&lang= */
    getLeaveAvailable: async (employeeId: number, year: number, lang: string = "en"): Promise<unknown[]> => {
        const { data } = await apiClient.get<unknown[]>(
            `leaveRequest/available-quota?employeeId=${employeeId}&year=${year}&lang=${lang}`
        );
        return data;
    },

    /** GET leaveRequest/leaveSummary?lang= — summary cards */
    getLeaveSummary: async (lang: string = "en"): Promise<{ summaryItems: { name: string; count: number }[] }> => {
        const { data } = await apiClient.get<{ summaryItems: { name: string; count: number }[] }>(
            `leaveRequest/leaveSummary?lang=${lang}`
        );
        return data;
    },

    /** POST leaveRequest/update — create / update leave request */
    updateLeaveRequest: async (payload: unknown): Promise<{ message: string }> => {
        const { data } = await apiClient.post<{ message: string }>("leaveRequest/update", payload);
        return data;
    },

    /** POST LeaveRequest/requestStatus/:id — approve / decline / cancel */
    approveLeaveRequest: async (leaveRequestId: number, body: unknown): Promise<{ message: string }> => {
        const { data } = await apiClient.post<{ message: string }>(
            `leaveRequest/requestStatus/${leaveRequestId}`, body
        );
        return data;
    },

    /** DELETE leaveRequest/delete?id= */
    deleteLeaveRequest: async (id: number): Promise<{ message: string }> => {
        const { data } = await apiClient.delete<{ message: string }>(`leaveRequest/delete?id=${id}`);
        return data;
    },
};

