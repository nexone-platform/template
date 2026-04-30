import apiClient from "@/lib/api-client";
import type { Statistics, CheckInResponse, AttendanceResponse } from "@/types/leave";

export const attendanceService = {
    checkIn: async (employeeId: number, lat: number, lon: number, username: string, status: string): Promise<unknown> => {
        const { data } = await apiClient.post("checkIn/log-check-in-out", {
            employeeId, currentLat: lat, currentLon: lon, username, status,
        });
        return data;
    },

    checkStatus: async (empId: number): Promise<unknown> => {
        const { data } = await apiClient.get(`checkIn/check-status/${empId}`);
        return data;
    },

    // Angular: checkinData(employeeId) → used by attendance-employee
    getCheckinData: async (employeeId: number): Promise<CheckInResponse[]> => {
        const { data } = await apiClient.get<CheckInResponse[]>(`checkIn/${employeeId}`);
        return data;
    },

    // Angular: getcheckinAllData(employeeId) → used by attendance-admin
    getCheckinAllData: async (employeeId: number): Promise<CheckInResponse[]> => {
        const { data } = await apiClient.get<CheckInResponse[]>(`checkIn/check-ins-data/${employeeId}`);
        return data;
    },

    search: async (criteria: unknown): Promise<unknown> => {
        const { data } = await apiClient.post("checkIn/search", criteria);
        return data;
    },

    getActivity: async (employeeId: number): Promise<unknown> => {
        const { data } = await apiClient.get(`checkIn/activities/${employeeId}`);
        return data;
    },

    getStatistics: async (employeeId: number): Promise<Statistics> => {
        const { data } = await apiClient.get<Statistics>(`checkIn/work-stats/${employeeId}`);
        return data;
    },

    getAttendanceData: async (criteria: { month?: number; year?: number; employeeId?: number }): Promise<AttendanceResponse[]> => {
        let url = "attendance";
        if (criteria.year && criteria.month) url += `/${criteria.year}/${criteria.month}`;
        if (criteria.employeeId) url += `?employeeId=${criteria.employeeId}`;
        const { data } = await apiClient.get<AttendanceResponse[]>(url);
        return data;
    },

    getYears: async (): Promise<number[]> => {
        const { data } = await apiClient.get<number[]>("checkIn/year");
        return data;
    },
};
