import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface SearchCriteria {
    year?: number;
    isActive?: boolean;
    departmentId?: number;
    genderId?: number;
}

export interface EmployeeReportResponse {
    employeeId: string;
    fullName: string;
    citizenId?: string;
    gender?: string;
    nationality?: string;
    birthDate?: string;
    age?: number;
    department?: string;
    designation?: string;
    address?: string;
    salary?: number;
    joinDate?: string;
    probationEndDate?: string;
    resignationDate?: string;
    workAgeInYears?: number;
    travelAllowance?: number;
    shiftAllowance?: number;
    attendanceBonus?: number;
    status: string;
    remark?: string;
    id?: number;
    runningId?: number;
}

export interface Gender {
    genderId: number;
    genderNameTh: string;
    genderNameEn: string;
}

interface ApiResponse<T = unknown> {
    data: T;
    message: string;
    success: boolean;
    totalData: number;
}

export function useWorkingYears() {
    return useQuery({
        queryKey: ["working-years"],
        queryFn: async () => {
            const { data } = await apiClient.get<number[]>("registration/getAllWorkingYears");
            return data || [];
        }
    });
}

export function useGenderMaster() {
    return useQuery({
        queryKey: ["gender-master"],
        queryFn: async () => {
            const { data } = await apiClient.get<Gender[]>("gender/getAllGender");
            return data || [];
        }
    });
}

export function useRegistrationReport(criteria: SearchCriteria) {
    return useQuery({
        queryKey: ["registration-report", criteria],
        queryFn: async () => {
            const { data } = await apiClient.post<ApiResponse<EmployeeReportResponse[]>>("registration/search", criteria);
            return data;
        }
    });
}

export interface LeaveSearchCriteria {
    year: number;
    lang: string;
    employeeId?: number;
    departmentId?: number;
    leaveTypeId?: number;
}

export interface LeaveDetailResponseDto {
    employeeId: number;
    employeeName: string;
    departmentName: string;
    leaveTypeName: string;
    date?: string;
    noOfDays: number;
    remainingLeave: number;
    totalLeaves: number;
    totalLeaveTaken: number;
    leaveCarryForward: number;
    id?: number;
    imgPath?: string;
    year?: number;
    employeeCode: string;
}

export function useLeaveReport(criteria: LeaveSearchCriteria) {
    return useQuery({
        queryKey: ["leave-report", criteria],
        queryFn: async () => {
            const { data } = await apiClient.post<ApiResponse<LeaveDetailResponseDto[]>>("leaveReports/search-available", criteria);
            return data;
        }
    });
}

export function useInitializeData() {
    // ...
}

export interface LeaveType {
    leaveTypeId: number;
    leaveTypeNameTh: string;
    leaveTypeNameEn: string;
}

export function useLeaveTypes() {
    return useQuery({
        queryKey: ["leave-types-master"],
        queryFn: async () => {
            const { data } = await apiClient.get<ApiResponse<LeaveType[]>>("leaves/getMasterLeaveType");
            return data?.data || [];
        }
    });
}

export interface TimesheetReportDto {
    employeeId: number;
    employeeName: string;
    projectId: number;
    projectName: string;
    imgPath: string;
    totalWorkHours: number;
    totalOTHours: number;
    taskCount: number;
    month: number;
    year: number;
    id: number;
}

export function useTimesheetReport(projectId?: number, month?: number, year?: number) {
    return useQuery({
        queryKey: ["timesheet-report", projectId, month, year],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (projectId) params.append("projectId", projectId.toString());
            if (month) params.append("month", month.toString());
            if (year) params.append("year", year.toString());

            const { data } = await apiClient.get<ApiResponse<TimesheetReportDto[]>>(`reportTimesheet/monthly-summary?${params.toString()}`);
            return data;
        }
    });
}

export interface ProjectSummary {
    projectId: number;
    projectName: string;
    projectCode?: string;
}

export function useProjects() {
    return useQuery({
        queryKey: ["projects-list"],
        queryFn: async () => {
            const { data } = await apiClient.get<ApiResponse<ProjectSummary[]>>("projects");
            return data?.data || [];
        }
    });
}
