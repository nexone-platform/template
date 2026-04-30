import apiClient from "@/lib/api-client";
import type { Department, DepartmentData, Designation, DesignationData, Holiday, HolidayData } from "@/types/employee";

// ============ Department Service ============
export const departmentService = {
    getAll: async (): Promise<DepartmentData> => {
        const { data } = await apiClient.get<DepartmentData>("departments/getAllDepartment");
        return data;
    },
    update: async (department: Department): Promise<Department> => {
        const { data } = await apiClient.post<Department>("departments/update", department);
        return data;
    },
    delete: async (id: number): Promise<{ message: string }> => {
        const { data } = await apiClient.delete<{ message: string }>(`departments/delete?id=${id}`);
        return data;
    },
    bulkImport: async (rows: Record<string, any>[]): Promise<{ success: number; failed: number }> => {
        let success = 0;
        let failed = 0;
        for (const row of rows) {
            try {
                await apiClient.post("departments/update", {
                    departmentId: 0,
                    departmentCode: row.departmentCode ?? "",
                    departmentNameTh: row.departmentNameTh ?? "",
                    departmentNameEn: row.departmentNameEn ?? "",
                    department: row.departmentNameEn ?? "",
                    isActive: true,
                });
                success++;
            } catch {
                failed++;
            }
        }
        return { success, failed };
    },
};

// ============ Designation Service ============
export const designationService = {
    getAll: async (): Promise<DesignationData> => {
        const { data } = await apiClient.get<DesignationData>("designations/getAllDesignation");
        return data;
    },
    update: async (designation: Designation): Promise<Designation> => {
        const { data } = await apiClient.post<Designation>("designations/update", designation);
        return data;
    },
    delete: async (id: number): Promise<{ message: string }> => {
        const { data } = await apiClient.delete<{ message: string }>(`designations/delete?id=${id}`);
        return data;
    },
    bulkImport: async (rows: Record<string, any>[]): Promise<{ success: number; failed: number }> => {
        let success = 0;
        let failed = 0;
        for (const row of rows) {
            try {
                await apiClient.post("designations/update", {
                    designationId: 0,
                    designationCode: row.designationCode ?? "",
                    designationNameTh: row.designationNameTh ?? "",
                    designationNameEn: row.designationNameEn ?? "",
                    departmentId: Number(row.departmentId) || 0,
                    departmentNameTh: "",
                    departmentNameEn: "",
                    isActive: true,
                });
                success++;
            } catch {
                failed++;
            }
        }
        return { success, failed };
    },
};

// ============ Holiday Service ============
export const holidayService = {
    getAll: async (): Promise<HolidayData> => {
        const { data } = await apiClient.get<HolidayData>("holidays/getAllHoliday");
        return data;
    },
    update: async (holiday: Holiday): Promise<Holiday> => {
        const { data } = await apiClient.post<Holiday>("holidays/update", holiday);
        return data;
    },
    delete: async (id: number): Promise<{ message: string }> => {
        const { data } = await apiClient.delete<{ message: string }>(`holidays/delete?id=${id}`);
        return data;
    },
    search: async (criteria: { year?: string; title?: string; organizationCode?: string; isAnnual?: boolean }): Promise<HolidayData> => {
        const { data } = await apiClient.post<HolidayData>("holidays/search", criteria);
        return data;
    },
    copy: async (holidays: Holiday[], destinationYear: number): Promise<HolidayData> => {
        const { data } = await apiClient.post<HolidayData>("holidays/copy", { holidays, destinationYear });
        return data;
    },
    bulkImport: async (rows: Record<string, any>[]): Promise<{ success: number; failed: number }> => {
        let success = 0;
        let failed = 0;
        for (const row of rows) {
            try {
                await apiClient.post("holidays/update", {
                    holidayId: 0,
                    title: row.title ?? "",
                    holidayDate: row.holidayDate ?? "",
                    day: row.day ?? "",
                    organizationCode: row.organizationCode ?? "",
                    isAnnual: row.isAnnual === true || row.isAnnual === "true" || row.isAnnual === "1" || row.isAnnual === 1,
                    isActive: true,
                });
                success++;
            } catch {
                failed++;
            }
        }
        return { success, failed };
    },
};
