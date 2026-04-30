import apiClient from "@/lib/api-client";

export interface DashboardProfile {
    id: number;
    firstNameEn: string;
    lastNameEn: string;
    firstNameTh?: string;
    lastNameTh?: string;
    email: string;
    employeeId: string;
    joinDate?: string;
    imgPath?: string;
    department?: string;
    designation?: string;
    organizationCode?: string;
    organizationName?: string;
}

export interface DashboardHoliday {
    holidayId: number;
    title: string;
    holidayDate: string;
    day: string;
}

export interface DashboardLeaveRequests {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

export interface DashboardLeaveBalance {
    leaveTypeName: string;
    totalQuota: number;
    used: number;
    available: number;
}

export interface EmployeeDashboardData {
    profile: DashboardProfile;
    holidays: DashboardHoliday[];
    leaveRequests: DashboardLeaveRequests;
    leaveBalance: DashboardLeaveBalance[];
}

export const dashboardService = {
    /** GET /employeeDashboard/{employeeId}?lang= — aggregated dashboard data */
    getEmployeeDashboard: async (employeeId: number, lang: string = "en"): Promise<EmployeeDashboardData> => {
        const { data } = await apiClient.get<EmployeeDashboardData>(
            `employeeDashboard/${employeeId}?lang=${lang}`
        );
        return data;
    },
};
