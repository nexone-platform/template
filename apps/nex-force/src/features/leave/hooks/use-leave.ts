import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveService } from "@/services/leave.service";
import { overtimeService } from "@/services/overtime.service";
import { attendanceService } from "@/services/attendance.service";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import type { OvertimeFilter } from "@/types/leave";

// ============ Leave Types ============
export function useLeaveTypes() {
    return useQuery({ queryKey: ["leaveTypes"], queryFn: leaveService.getMasterLeaveType });
}

export function useUpdateLeaveType() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: leaveService.updateLeaveType,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["leaveTypes"] }); toast.success("Leave type saved."); },
        onError: (error) => { toast.error(getApiErrorMessage(error, "Error saving leave type.")); },
    });
}

export function useDeleteLeaveType() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: leaveService.deleteLeaveType,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["leaveTypes"] }); toast.success("Leave type deleted."); },
        onError: (error) => { toast.error(getApiErrorMessage(error, "Error deleting leave type.")); },
    });
}

export function useLeaveQuota() {
    return useQuery({ queryKey: ["leaveQuota"], queryFn: leaveService.getLeaveQuota });
}

// ============ Overtime ============
export function useOvertime(filter: unknown) {
    return useQuery({ queryKey: ["overtime", filter], queryFn: () => overtimeService.getAll(filter) });
}

export function useOvertimeByFilter(filter: OvertimeFilter) {
    return useQuery({
        queryKey: ["overtime", "filter", filter],
        queryFn: () => overtimeService.getByFilter(filter),
        enabled: filter.employeeId > 0,
    });
}

export function useOvertimeTypes() {
    return useQuery({ queryKey: ["overtimeTypes"], queryFn: overtimeService.getTypes });
}

export function useUpdateOvertime() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: overtimeService.update,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["overtime"] }); toast.success("Overtime saved."); },
        onError: (error) => { toast.error(getApiErrorMessage(error, "Error saving overtime.")); },
    });
}

export function useApproveOvertime() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: unknown }) => overtimeService.approve(id, body),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["overtime"] }); toast.success("Overtime approved."); },
        onError: (error) => { toast.error(getApiErrorMessage(error, "Error approving overtime.")); },
    });
}

// ============ Attendance ============
export function useAttendanceStatistics(employeeId: number) {
    return useQuery({
        queryKey: ["attendance", "stats", employeeId],
        queryFn: () => attendanceService.getStatistics(employeeId),
        enabled: employeeId > 0,
    });
}

export function useCheckinData(employeeId: number) {
    return useQuery({
        queryKey: ["attendance", "checkins", employeeId],
        queryFn: () => attendanceService.getCheckinData(employeeId),
        enabled: employeeId > 0,
    });
}

export function useAttendanceData(criteria: { month?: number; year?: number; employeeId?: number }) {
    return useQuery({
        queryKey: ["attendance", "data", criteria],
        queryFn: () => attendanceService.getAttendanceData(criteria),
        enabled: !!(criteria.year && criteria.month),
    });
}

export function useAttendanceYears() {
    return useQuery({ queryKey: ["attendance", "years"], queryFn: attendanceService.getYears });
}
