import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface ApiResponse<T = unknown> {
    data: T;
    message: string;
    success: boolean;
}

// --- Interfaces from PayrollService ---

export interface EmployeeInfo {
    id: number;
    firstNameTh: string;
    lastNameTh: string;
    firstNameEn: string;
    lastNameEn: string;
    email: string;
    employeeCode: string;
    joinDate: string;
    imgPath: string;
    bankAccountNo: string;
}

export interface PayrollWithEmployeeDto {
    payrollId: number;
    employeeId: number;
    monthYear: string;
    grossSalary: number;
    totalAdditions: number;
    totalDeductions: number;
    netSalary: number;
    employee: EmployeeInfo;
    id: number;
}

export interface PayrollRequest {
    employeeId: number;
    year?: number;
}

// --- Interfaces from PayrollItemService ---

export interface Addition {
    additionsId: number;
    additionsName: string;
    additionsCode: string;
    additionsCategory: string;
    isActive: boolean;
    unitAmount: number;
    percentAmount: number;
    additionType: number;
}

export interface Deduction {
    deductionId: number;
    deductionName?: string;
    deductionCode?: string;
    deductionCategory?: string;
    isActive?: boolean;
    unitAmount?: number;
    percentAmount?: number;
    deductionType?: number;
}

// --- Interfaces from SalaryService ---

export interface Period {
    periodId: number;
    periodStartDate: string;
    periodEndDate: string;
    monthYear: string;
    createDate: string;
    totalCost: number;
    totalPayment: number;
    status: string;
    paymentDate: string;
    paymentChannel: number;
    paymentTypeId: number;
    reason?: string;
}

export interface StatusRequest {
    status?: number | null;
    month?: string | null;
}

export interface EmployeePaymentDto {
    id: number;
    firstNameEn: string;
    lastNameEn: string;
    email: string;
    isActive: boolean;
    salary: number;
    effectiveDate: string;
    paymentTypeId: number;
    bankAccountNo: string;
    totalDeductions: number;
    totalAdditions: number;
    totalPayment: number;
    departmentName: string;
    designationName: string;
    status: number;
    additions?: AdditionData[];
    deductions?: DeductionData[];
    socialSecurity?: number;
    tax401?: number;
    tax402?: number;
    paymentTypeName?: string;
    employeeType?: number;
    employeeTypeName?: string;
}

export interface Payroll {
    payrollId: number;
    employeeId: number;
    monthYear: string;
    salary: number;
    totalAdditions: number;
    totalDeductions: number;
    netSalary: number;
    createDate: string;
    createBy: string;
    employee: Employee;
    netSalaryInWords: string;
    payrollCode: string;
    payDate: string;
    payrollPeriod: string;
    bankAccount: string;
    ytdEarnings: number;
    ytdWithholdingTax: number;
    accumulatedSsf: number;
    remarks: string;
    deductions: DeductionData[];
    socialSecurityFund: number;
    wht: number;
    slf: number;
    penaltyAmount: number;
    otherDeductions: number;
    additions: AdditionData[];
    overtime: number;
    commission: number;
    bonus: number;
    otherAdditions: number;
}

export interface Employee {
    id: number;
    firstNameTh: string;
    lastNameTh: string;
    firstNameEn: string;
    lastNameEn: string;
    email: string;
    employeeCode: string;
    joinDate: string;
    imgPath: string;
    companyAddress: string;
    designationName: string;
    company: string;
    logo: string;
}

export interface DeductionData {
    deductionId: number;
    amount: number;
    isPersonal: boolean;
    deductionName: string;
    type: number;
}

export interface AdditionData {
    additionId: number;
    amount: number;
    isPersonal: boolean;
    additionName: string;
    type: number;
}

// --- Hooks ---

export function usePayrollById(payrollId: number) {
    return useQuery({
        queryKey: ["payroll-by-id", payrollId],
        queryFn: async () => {
            const { data } = await apiClient.post<Payroll>("payroll/GetPayrollsById", { payrollId });
            return data;
        },
        enabled: !!payrollId
    });
}

export function useLastPayrollId(employeeId: number) {
    return useQuery({
        queryKey: ["last-payroll-id", employeeId],
        queryFn: async () => {
            const { data } = await apiClient.get<number>(`payroll/payslip/${employeeId}`);
            return data;
        },
        enabled: !!employeeId
    });
}

// Payroll Service Hooks
export function useEmployeeSalary(request: PayrollRequest) {
    return useQuery({
        queryKey: ["employee-salary", request],
        queryFn: async () => {
            const { data } = await apiClient.post<ApiResponse<PayrollWithEmployeeDto[]>>("payroll/GetPayrollsByYear", request);
            return data.data || [];
        },
        enabled: !!request.employeeId
    });
}

// Payroll Item Service Hooks
export function useAdditions() {
    return useQuery({
        queryKey: ["payroll-additions"],
        queryFn: async () => {
            const { data } = await apiClient.get<ApiResponse<Addition[]>>("payrolItem/getAdditions");
            return data.data || [];
        }
    });
}

export function useDeductions() {
    return useQuery({
        queryKey: ["payroll-deductions"],
        queryFn: async () => {
            const { data } = await apiClient.get<ApiResponse<Deduction[]>>("payrolItem/getDeductions");
            return data.data || [];
        }
    });
}

export function useSaveAddition() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (addition: Partial<Addition>) => {
            const { data } = await apiClient.post<ApiResponse<Addition>>("payrolItem/updateAddition", addition);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payroll-additions"] });
        }
    });
}

export function useDeleteAddition() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete<ApiResponse<void>>(`payrolItem/deleteAddition?id=${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payroll-additions"] });
        }
    });
}

export function useSaveDeduction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (deduction: Partial<Deduction>) => {
            const { data } = await apiClient.post<ApiResponse<Deduction>>("payrolItem/updateDeduction", deduction);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payroll-deductions"] });
        }
    });
}

export function useDeleteDeduction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete<ApiResponse<void>>(`payrolItem/deleteDeduction?id=${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payroll-deductions"] });
        }
    });
}

export interface Summary {
    totalEmployee: number;
    sumSalary: number;
    totalAddiction: number;
    totalDeduction: number;
    netPayment: number;
    bankPayment: number;
    cashPayment: number;
    totalCost: number;
}

export interface PayrollPeriodDetail {
    employeeData: EmployeePaymentDto[];
    summary: Summary;
    transactionData: Period;
}

export interface SocialSecurityRate {
    socialSecurityId: number;
    percentage: number;
    maxDeduction: number;
    maxSalary: number;
    description?: string;
}

export interface EstimatedTax {
    monthlyTax: number;
    yearlyTax: number;
}

// Salary Service Hooks
export function usePeriods(request: StatusRequest) {
    return useQuery({
        queryKey: ["salary-periods", request],
        queryFn: async () => {
            const { data } = await apiClient.post<ApiResponse<Period[]>>("salary/search-periods", request);
            return data.data || [];
        }
    });
}

export function usePeriodsByStatus(request: StatusRequest) {
    return useQuery({
        queryKey: ["periods-by-status", request],
        queryFn: async () => {
            const { data } = await apiClient.post<ApiResponse<Period[]>>("salary/periods/by-status", request);
            return data.data || [];
        }
    });
}

export function usePayrollByPeriod(periodId: number, paymentTypeId: number, paymentChannel: number) {
    return useQuery({
        queryKey: ["payroll-by-period", periodId, paymentTypeId, paymentChannel],
        queryFn: async () => {
            const { data } = await apiClient.post<PayrollPeriodDetail>("salary/getPayrollByPeriod", { periodId, paymentTypeId, paymentChannel });
            return data;
        },
        enabled: !!periodId
    });
}

export function useEmpByPayment(paymentTypeId: number) {
    return useQuery({
        queryKey: ["employees-by-payment", paymentTypeId],
        queryFn: async () => {
            const { data } = await apiClient.get<ApiResponse<EmployeePaymentDto[]>>(`salary/byPaymentType?paymentTypeId=${paymentTypeId}`);
            return data.data || [];
        },
        enabled: !!paymentTypeId
    });
}

export function useAllEmployees() {
    return useQuery({
        queryKey: ["all-employees-salary"],
        queryFn: async () => {
            const { data } = await apiClient.get<ApiResponse<EmployeeDto[]>>("salary/allEmployee");
            return data.data || [];
        }
    });
}

export interface EmployeeDto {
    id: number;
    firstNameEn: string;
    lastNameEn: string;
    salary: number;
    email: string;
}

export function useSSORates() {
    return useQuery({
        queryKey: ["sso-rates"],
        queryFn: async () => {
            const { data } = await apiClient.get<ApiResponse<SocialSecurityRate[]>>("salary/SSO");
            return data.data || [];
        }
    });
}

export function useEstimatedTax(employeeId: number) {
    return useQuery({
        queryKey: ["estimated-tax", employeeId],
        queryFn: async () => {
            const { data } = await apiClient.get<EstimatedTax>(`salary/estimated-tax/${employeeId}`);
            return data;
        },
        enabled: !!employeeId
    });
}

export function useCreatePayroll() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { employeeData: EmployeePaymentDto[]; transactionData: any }) => {
            const { data } = await apiClient.post<ApiResponse<any>>("salary/createPayroll", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["salary-periods"] });
        }
    });
}

export function useUpdatePeriodStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ periodId, status, reason }: { periodId: number; status: number; reason: string }) => {
            const { data } = await apiClient.post<ApiResponse<{ message: string; periodId: number }>>("salary/update-period-status", { periodId, status, reason });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["salary-periods"] });
            queryClient.invalidateQueries({ queryKey: ["periods-by-status"] });
        }
    });
}

