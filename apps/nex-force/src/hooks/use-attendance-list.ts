import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface CheckInResponseAtList {
    checkInId: number;
    employeeId: number;
    employeeCode: string;
    employeeName: string;
    departmentId: number;
    departmentName: string;
    leaveReason: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    workDate: string | null;
    checkInLat: number | null;
    checkInLong: number | null;
    checkOutLat: number | null;
    checkOutLong: number | null;
    productionHours: number;
    breakHours: number;
    overtime: number;
}

export function useAttendanceSearch() {
    return useMutation({
        mutationFn: async (searchCriteria: any) => {
            const { data } = await apiClient.post<CheckInResponseAtList[]>('attendanceList/search', searchCriteria);
            return data || [];
        }
    });
}
