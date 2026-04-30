"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus } from "lucide-react";
import { differenceInDays, isSameDay as dateFnsSameDay, format } from "date-fns";
import { useMessages } from "@/hooks/use-messages";
import { getUserProfile, getUserId } from "@/lib/auth";
import { leaveService } from "@/services/leave.service";
import { usePagination } from "@/hooks/use-pagination";
import {
    ModalWrapper, FormField, StatusBadge,
    LoadingSpinner, EmptyState, ui
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

type AnyRow = Record<string, any>;

export default function MobileLeaveEmployeePage() {
    const { t } = usePageTranslation();
    const { msg, showSuccess, showError, showWarning } = useMessages();
    const queryClient = useQueryClient();
    const [isMounted, setIsMounted] = useState(false);
    const [userProfile, setUserProfile] = useState("");
    const [employeeId, setEmployeeId] = useState<string | null>(null);

    useEffect(() => {
        setIsMounted(true);
        setUserProfile(getUserProfile() ?? "");
        setEmployeeId(getUserId());
    }, []);

    const empIdNum = employeeId ? parseInt(employeeId) : 0;
    const currentYear = new Date().getFullYear();

    // Data queries
    const { data: leaveResult, isLoading } = useQuery({
        queryKey: ["leaveRequests", "employee", empIdNum],
        queryFn: () => leaveService.getLeaveByEmployee(empIdNum),
        enabled: empIdNum > 0,
    });


    const { data: quotaResult } = useQuery({
        queryKey: ["leaveQuotas", empIdNum, currentYear],
        queryFn: () => leaveService.getLeaveAvailable(empIdNum, currentYear, "en"),
        enabled: empIdNum > 0,
    });

    // Mutations
    const updateRequestMutation = useMutation({
        mutationFn: leaveService.updateLeaveRequest,
        onSuccess: () => {
            showSuccess('SAVE_SUCCESS', 'Success!', "Leave has been requested successfully.");
            queryClient.invalidateQueries({ queryKey: ["leaveRequests", "employee"] });
            queryClient.invalidateQueries({ queryKey: ["leaveQuotas"] });
            resetForm();
            setEditModal(false);
        },
        onError: (err: unknown) => {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message ??
                (err as { error?: string })?.error ??
                "เกิดข้อผิดพลาด";
            showError('SAVE_ERROR', 'Error!', msg);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: leaveService.deleteLeaveRequest,
        onSuccess: (res) => {
            showSuccess('SAVE_SUCCESS', 'Success!', res.message || "Leave request deleted.");
            queryClient.invalidateQueries({ queryKey: ["leaveRequests", "employee"] });
            queryClient.invalidateQueries({ queryKey: ["leaveQuotas"] });
            setDeleteModal(null);
        },
        onError: () => {
            showError('SAVE_ERROR', 'Error!', "Error deleting request");
        },
    });

    // Derived data
    const allData: AnyRow[] = useMemo(() => (Array.isArray(leaveResult?.data) ? leaveResult.data : []), [leaveResult]);
    const leaveQuotas: AnyRow[] = useMemo(() => (Array.isArray(quotaResult) ? (quotaResult as AnyRow[]) : []), [quotaResult]);

    // Modals
    const [editModal, setEditModal] = useState(false);
    const [editMode, setEditMode] = useState<"add" | "edit">("add");
    const [deleteModal, setDeleteModal] = useState<number | null>(null);
    const [formTouched, setFormTouched] = useState(false);
    const [isSameDay, setIsSameDay] = useState(false);
    const [formData, setFormData] = useState({
        leaveRequestId: 0,
        leaveTypeId: "" as string | number,
        startDate: "",
        endDate: "",
        totalDays: "" as string | number,
        remaining: "" as string | number,
        reason: "",
        dayType: "",
    });

    const { paginatedData } = usePagination(allData, { pageSize: 100 }); // Show more on mobile scroll

    const resetForm = () => {
        setFormData({
            leaveRequestId: 0, leaveTypeId: "", startDate: "", endDate: "",
            totalDays: "", remaining: "", reason: "", dayType: "",
        });
        setFormTouched(false);
        setIsSameDay(false);
    };

    const openAdd = () => { resetForm(); setEditMode("add"); setEditModal(true); };

    const openEdit = (row: AnyRow) => {
        setEditMode("edit");
        setFormData({
            leaveRequestId: row.leaveRequestId,
            leaveTypeId: row.leaveTypeId,
            startDate: row.startDate ? format(new Date(row.startDate), "yyyy-MM-dd") : "",
            endDate: row.endDate ? format(new Date(row.endDate), "yyyy-MM-dd") : "",
            totalDays: row.totalDays ?? "",
            remaining: "",
            reason: row.reason ?? "",
            dayType: row.dayType ?? "",
        });
        const sel = leaveQuotas.find((q) => q.leaveTypeId === row.leaveTypeId);
        if (sel) setFormData((p) => ({ ...p, remaining: sel.availableQuota }));
        setFormTouched(false);
        setEditModal(true);
    };

    const updateDayType = () => {
        setFormData((prev) => {
            const { startDate, endDate, dayType } = prev;
            if (!startDate || !endDate) return { ...prev, totalDays: "" };
            const same = dateFnsSameDay(new Date(startDate), new Date(endDate));
            setIsSameDay(same);
            if (same) return { ...prev, totalDays: dayType === "full" ? 1 : 0.5 };
            else {
                const diff = differenceInDays(new Date(endDate), new Date(startDate)) + 1;
                return { ...prev, totalDays: diff >= 0 ? diff : 0 };
            }
        });
    };

    const handleFormSubmit = () => {
        setFormTouched(true);
        if (!formData.leaveTypeId || !formData.startDate || !formData.endDate || !formData.reason) {
            showWarning('REQUIRED_FIELDS', 'Missing Information', "Some required fields are missing.");
            return;
        }
        const payload = {
            ...formData,
            employeeId: empIdNum,
            username: userProfile,
            startDate: formData.startDate
                ? new Date(Date.UTC(new Date(formData.startDate).getFullYear(), new Date(formData.startDate).getMonth(), new Date(formData.startDate).getDate())).toISOString()
                : "",
            endDate: formData.endDate
                ? new Date(Date.UTC(new Date(formData.endDate).getFullYear(), new Date(formData.endDate).getMonth(), new Date(formData.endDate).getDate())).toISOString()
                : "",
        };
        updateRequestMutation.mutate(payload);
    };

    const formatDate = (d: string | null | undefined) => {
        if (!d) return "";
        try { return format(new Date(d), "dd/MM/yyyy"); } catch { return d; }
    };

    if (!isMounted) return null;

    return (
        <div className="flex flex-col pt-6 px-4 pb-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{t('Leave', 'Leave')}</h2>
                    <p className="text-gray-500 text-sm">Manage your leave requests</p>
                </div>
                <button
                    onClick={openAdd}
                    className="p-2 bg-nv-violet text-white rounded-full shadow-md active:scale-95 transition-transform"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {/* Leave Quotas List */}
            {leaveQuotas.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {leaveQuotas.map((quota: AnyRow, idx: number) => (
                        <div key={idx} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-12 h-12 bg-nv-violet/5 rounded-bl-3xl -z-0"></div>
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1 z-10 relative">{quota.leaveTypeName}</p>
                            <div className="flex items-end gap-2 z-10 relative">
                                <span className="text-2xl font-bold text-nv-violet leading-none">{quota.availableQuota}</span>
                                <span className="text-xs text-gray-400 mb-0.5">{t('left', 'left')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Leave History List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">{t('History', 'History')}</h3>

                {isLoading ? (
                    <LoadingSpinner />
                ) : paginatedData.length > 0 ? (
                    <div className="space-y-3">
                        {paginatedData.map((row: AnyRow, idx: number) => (
                            <div key={`leave-${idx}-${row.leaveRequestId}`} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{row.leaveTypeName}</h4>
                                        <p className="text-xs text-gray-500">
                                            {formatDate(row.startDate)} - {formatDate(row.endDate)}
                                        </p>
                                    </div>
                                    <StatusBadge status={row.status === "WaitForApprove" ? "Wait For Approve" : row.status} />
                                </div>
                                <div className="flex justify-between items-end mt-3">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">{t('Total Days', 'Total Days')}: <span className="text-gray-800">{row.totalDays}</span></p>
                                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-[200px]">{row.reason}</p>
                                    </div>
                                    {row.status === "New" && (
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(row)} className="p-1.5 text-blue-500 bg-blue-50 rounded-lg">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setDeleteModal(row.leaveRequestId)} className="p-1.5 text-red-500 bg-red-50 rounded-lg">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState message={t('No Data Found', 'No Data Found')} />
                )}
            </div>

            {/* Add / Edit Leave Modal */}
            <ModalWrapper
                open={editModal}
                onClose={() => { setEditModal(false); resetForm(); }}
                title={`${editMode === "add" ? t('Add', 'Add') : t('Edit', 'Edit')} ${t('Leave', 'Leave')}`}
                maxWidth="w-[95vw] max-w-lg"
                footer={
                    <button onClick={handleFormSubmit} disabled={updateRequestMutation.isPending} className={`w-full ${ui.btnPrimary}`}>
                        {updateRequestMutation.isPending ? t('Submitting...', 'Submitting...') : t('Submit', 'Submit')}
                    </button>
                }
            >
                <div className="space-y-4 pt-2">
                    <FormField label={t('Leave Type', 'Leave Type')} required error={formTouched && !formData.leaveTypeId ? msg('VAL_LEAVE_TYPE_REQUIRED', '* Leave Type is required') : undefined}>
                        <select
                            value={formData.leaveTypeId}
                            onChange={(e) => {
                                const ltId = Number(e.target.value);
                                const sel = leaveQuotas.find((q) => q.leaveTypeId === ltId);
                                setFormData((p) => ({ ...p, leaveTypeId: ltId, remaining: sel ? sel.availableQuota : "" }));
                            }}
                            className={`${ui.select} ${formTouched && !formData.leaveTypeId ? "border-red-500" : ""}`}
                        >
                            <option value="">{t('Select Leave Type', 'Select Leave Type')}</option>
                            {leaveQuotas.map((q: AnyRow) => (
                                <option key={q.leaveTypeId} value={q.leaveTypeId}>{q.leaveTypeName}</option>
                            ))}
                        </select>
                    </FormField>

                    <div className="grid grid-cols-2 gap-3">
                        <FormField label={t('From', 'From')} required>
                            <input type="date" value={formData.startDate} onChange={(e) => { setFormData((p) => ({ ...p, startDate: e.target.value })); setTimeout(updateDayType, 0); }}
                                className={`${ui.input} ${formTouched && !formData.startDate ? "border-red-500" : ""}`} />
                        </FormField>
                        <FormField label={t('To', 'To')} required>
                            <input type="date" value={formData.endDate} onChange={(e) => { setFormData((p) => ({ ...p, endDate: e.target.value })); setTimeout(updateDayType, 0); }}
                                className={`${ui.input} ${formTouched && !formData.endDate ? "border-red-500" : ""}`} />
                        </FormField>
                    </div>

                    {isSameDay && (
                        <FormField label={t('Select Time Period', 'Select Time Period')} required>
                            <select value={formData.dayType} onChange={(e) => { setFormData((p) => ({ ...p, dayType: e.target.value })); setTimeout(updateDayType, 0); }} className={ui.select}>
                                <option value="">-- {t('Select', 'Select')} --</option>
                                <option value="full">{t('Full', 'Full')}</option>
                                <option value="morning">{t('Morning', 'Morning')}</option>
                                <option value="afternoon">{t('Afternoon', 'Afternoon')}</option>
                            </select>
                        </FormField>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <FormField label={t('Number of Days', 'Number of Days')}>
                            <input type="text" readOnly value={formData.totalDays} className={`${ui.input} ${ui.inputDisabled}`} />
                        </FormField>
                        <FormField label={t('Remaining Leaves', 'Remaining Leaves')}>
                            <input type="text" readOnly value={formData.remaining} className={`${ui.input} ${ui.inputDisabled}`} />
                        </FormField>
                    </div>

                    <FormField label={t('Leave Reason', 'Leave Reason')} required error={formTouched && !formData.reason ? msg('VAL_LEAVE_REASON_REQUIRED', '* Leave Reason is required') : undefined}>
                        <textarea value={formData.reason} onChange={(e) => setFormData((p) => ({ ...p, reason: e.target.value }))} rows={3}
                            className={`${ui.textarea} ${formTouched && !formData.reason ? "border-red-500" : ""}`} />
                    </FormField>
                </div>
            </ModalWrapper>

            {/* Delete Modal */}
            <ModalWrapper
                open={deleteModal !== null}
                onClose={() => setDeleteModal(null)}
                title={t('Delete Leave Request', 'Delete Leave Request')}
                maxWidth="w-[90vw] max-w-sm"
                footer={
                    <div className="flex gap-2 w-full">
                        <button onClick={() => deleteModal && deleteMutation.mutate(deleteModal)} disabled={deleteMutation.isPending} className={`flex-1 ${ui.btnDanger}`}>
                            {deleteMutation.isPending ? t('Deleting...', 'Deleting...') : t('Delete', 'Delete')}
                        </button>
                        <button onClick={() => setDeleteModal(null)} className={`flex-1 ${ui.btnSecondary}`}>{t('Cancel', 'Cancel')}</button>
                    </div>
                }
            >
                <p className="text-sm text-gray-500 text-center py-2">{t('Confirm delete leave request?', 'Are you sure you want to delete this leave request?')}</p>
            </ModalWrapper>
        </div>
    );
}
