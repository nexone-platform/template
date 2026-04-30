import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollService } from "@/services/payroll.service";
import { salaryService } from "@/services/salary.service";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import type { PayrollRequest, StatusRequest } from "@/types/payroll";

// ============ Payroll ============
export function usePayrollByYear(request: PayrollRequest) {
    return useQuery({
        queryKey: ["payroll", request],
        queryFn: () => payrollService.getEmployeeSalary(request),
        enabled: request.employeeId > 0,
    });
}

export function usePayrollById(payrollId: number) {
    return useQuery({
        queryKey: ["payroll", "detail", payrollId],
        queryFn: () => payrollService.getPayrollsById(payrollId),
        enabled: payrollId > 0,
    });
}

// ============ Salary / Periods ============
export function useSalaryPeriods() {
    return useQuery({ queryKey: ["salary", "periods"], queryFn: salaryService.getAllPeriods });
}

export function useSearchPeriods(request: StatusRequest) {
    return useQuery({
        queryKey: ["salary", "periods", "search", request],
        queryFn: () => salaryService.searchAllPeriods(request),
    });
}

export function useSSO() {
    return useQuery({ queryKey: ["salary", "sso"], queryFn: salaryService.getSSO });
}

export function usePayrollByPeriodId(periodId: number) {
    return useQuery({
        queryKey: ["salary", "payroll", periodId],
        queryFn: () => salaryService.getPayrollByPeriodsId(periodId),
        enabled: periodId > 0,
    });
}

export function useCreatePayroll() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: salaryService.createPayroll,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["salary"] }); toast.success("Payroll created."); },
        onError: (error) => { toast.error(getApiErrorMessage(error, "Error creating payroll.")); },
    });
}

export function useUpdatePeriodStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ periodId, status, reason }: { periodId: number; status: number; reason: string }) =>
            salaryService.updateStatus(periodId, status, reason),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["salary"] }); toast.success("Status updated."); },
        onError: (error) => { toast.error(getApiErrorMessage(error, "Error updating status.")); },
    });
}
