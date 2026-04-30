import apiClient from "@/lib/api-client";
import type { PayrollRequest, PayrollWithEmployeeDto, Payroll } from "@/types/payroll";

export const payrollService = {
    getEmployeeSalary: async (request: PayrollRequest): Promise<{ data: PayrollWithEmployeeDto[]; totalData: number }> => {
        const { data } = await apiClient.post<{ data: PayrollWithEmployeeDto[]; totalData: number }>("payroll/GetPayrollsByYear", request);
        return data;
    },

    getPayrollsById: async (payrollId: number): Promise<Payroll> => {
        const { data } = await apiClient.post<Payroll>("payroll/GetPayrollsById", { payrollId });
        return data;
    },

    getLastPayrollId: async (employeeId: number): Promise<unknown> => {
        const { data } = await apiClient.get(`payroll/payslip/${employeeId}`);
        return data;
    },
};
