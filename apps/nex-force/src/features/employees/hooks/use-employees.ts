import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeService } from "@/services/employee.service";
import { departmentService, designationService, holidayService } from "@/services/organization.service";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

// ============ Employees ============
export function useEmployees() {
    return useQuery({ queryKey: ["employees"], queryFn: employeeService.getAll });
}

export function useEmployeeById(id: number) {
    return useQuery({ queryKey: ["employees", id], queryFn: () => employeeService.getById(id), enabled: id > 0 });
}

export function useUpdateEmployee() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: employeeService.update,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); toast.success("Employee saved."); },
        onError: (error) => { toast.error(getApiErrorMessage(error, "Error saving employee.")); },
    });
}

export function useDeleteEmployee() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: employeeService.delete,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); toast.success("Employee deleted."); },
        onError: (error) => { toast.error(getApiErrorMessage(error, "Error deleting employee.")); },
    });
}

export function useBankData() {
    return useQuery({ queryKey: ["banks"], queryFn: employeeService.getBankData });
}

// ============ Departments ============
export function useDepartments() {
    return useQuery({ queryKey: ["departments"], queryFn: departmentService.getAll });
}

export function useUpdateDepartment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: departmentService.update,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["departments"] }); toast.success("Department saved."); },
        onError: (error) => { toast.error(getApiErrorMessage(error, "Error saving department.")); },
    });
}

export function useDeleteDepartment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: departmentService.delete,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["departments"] }); toast.success("Department deleted."); },
        onError: (error) => { toast.error(getApiErrorMessage(error, "Error deleting department.")); },
    });
}

// ============ Designations ============
export function useDesignations() {
    return useQuery({ queryKey: ["designations"], queryFn: designationService.getAll });
}

export function useUpdateDesignation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: designationService.update,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["designations"] }); toast.success("Designation saved."); },
        onError: (error) => { toast.error(getApiErrorMessage(error, "Error saving designation.")); },
    });
}

export function useDeleteDesignation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: designationService.delete,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["designations"] }); toast.success("Designation deleted."); },
        onError: (error) => { toast.error(getApiErrorMessage(error, "Error deleting designation.")); },
    });
}

// ============ Holidays ============
export function useHolidays() {
    return useQuery({ queryKey: ["holidays"], queryFn: holidayService.getAll });
}

export function useSearchHolidays() {
    return useMutation({
        mutationFn: holidayService.search,
    });
}

export function useUpdateHoliday() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: holidayService.update,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["holidays"] }); toast.success("Holiday saved."); },
        onError: (error) => { toast.error(getApiErrorMessage(error, "Error saving holiday.")); },
    });
}

export function useDeleteHoliday() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: holidayService.delete,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["holidays"] }); toast.success("Holiday deleted."); },
        onError: (error) => { toast.error(getApiErrorMessage(error, "Error deleting holiday.")); },
    });
}

export function useCopyHoliday() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ holidays, destinationYear }: { holidays: any[], destinationYear: number }) => holidayService.copy(holidays, destinationYear),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["holidays"] }); toast.success("Holidays copied."); },
        onError: (error) => { toast.error(getApiErrorMessage(error, "Error copying holidays.")); },
    });
}
