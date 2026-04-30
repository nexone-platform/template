"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { differenceInDays, isSameDay as dateFnsSameDay, format } from "date-fns";
import { ROUTES } from "@/lib/routes";
import { useMessages } from "@/hooks/use-messages";
import { getUserProfile, getUserId } from "@/lib/auth";
import { leaveService } from "@/services/leave.service";
import { usePagination } from "@/hooks/use-pagination";
import { useRowSelection } from "@/hooks/use-row-selection";
import ExportButtons from "@/components/ExportButtons";
import type { ExportColumn } from "@/lib/table-export";
import {
    PageHeader, ModalWrapper, FormField, StatusBadge, TableHeaderBar,
    LoadingSpinner, EmptyState, PaginationBar, SortableTh, ui, SelectAllCheckbox,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";


const sortableColumns = [
    { key: "leaveTypeName", label: "Leave Type", sortable: true },
    { key: "startDate", label: "From", sortable: true },
    { key: "endDate", label: "To", sortable: true },
    { key: "totalDays", label: "Total Days", sortable: true },
    { key: "reason", label: "Reason", sortable: true },
];

/* โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€
 * Leave Employee โ€” converted from Angular LeaveEmployeeComponent
 * โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€ */

type AnyRow = Record<string, any>;

export default function LeaveEmployeePage() {
    const { t } = usePageTranslation();
    const { msg, showSuccess, showError, showWarning } = useMessages();

    const exportColumns: ExportColumn[] = useMemo(() => [
    { header: t('Leave Type', 'Leave Type'), key: "leaveTypeName" },
    { header: t('From', 'From'), key: "startDate", format: (v: any) => v ? new Date(v).toLocaleDateString("en-GB") : "" },
    { header: t('To', 'To'), key: "endDate", format: (v: any) => v ? new Date(v).toLocaleDateString("en-GB") : "" },
    { header: t('Total Days', 'Total Days'), key: "totalDays" },
    { header: t('Reason', 'Reason'), key: "reason" },
    { header: t('Status', 'Status'), key: "status" },
    { header: t('Approved By', 'Approved By'), key: "approverName" },
    { header: t('Approved Date', 'Approved Date'), key: "approvedDate", format: (v: any) => v ? new Date(v).toLocaleDateString("en-GB") : "" },
    { header: t('Comment', 'Comment'), key: "comments" },
    ], [t]);
    const queryClient = useQueryClient();
    const router = useRouter();
    const userProfile = getUserProfile() ?? "";
    const employeeId = getUserId();
    const empIdNum = employeeId ? parseInt(employeeId) : 0;
    const currentYear = new Date().getFullYear();

    // โ”€โ”€ Data queries โ”€โ”€
    const { data: leaveResult, isLoading } = useQuery({
        queryKey: ["leaveRequests", "employee", empIdNum],
        queryFn: () => leaveService.getLeaveByEmployee(empIdNum),
        enabled: empIdNum > 0,
    });

    const { data: leaveTypesResult } = useQuery({
        queryKey: ["leaveTypes"],
        queryFn: leaveService.getMasterLeaveType,
    });

    const { data: quotaResult } = useQuery({
        queryKey: ["leaveQuotas", empIdNum, currentYear],
        queryFn: () => leaveService.getLeaveAvailable(empIdNum, currentYear, "en"),
        enabled: empIdNum > 0,
    });

    // โ”€โ”€ Mutations โ”€โ”€
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
                "เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”";
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

    // โ”€โ”€ Derived data โ”€โ”€
    const allData: AnyRow[] = useMemo(() => (Array.isArray(leaveResult?.data) ? leaveResult.data : []), [leaveResult]);
    const leaveTypes = useMemo(() => leaveTypesResult?.data ?? [], [leaveTypesResult]);
    const leaveQuotas: AnyRow[] = useMemo(() => (Array.isArray(quotaResult) ? (quotaResult as AnyRow[]) : []), [quotaResult]);

    // โ”€โ”€ Search / filter state โ”€โ”€
    const [searchLeaveType, setSearchLeaveType] = useState<number | "">("");
    const [searchStatus, setSearchStatus] = useState("");
    const [searchFrom, setSearchFrom] = useState("");
    const [searchTo, setSearchTo] = useState("");

    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [pageSize, setPageSize] = useState(10);

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

    const [openActionId, setOpenActionId] = useState<number | null>(null);

    // โ”€โ”€ Filter โ”€โ”€
    const filteredData = useMemo(() => {
        return allData.filter((row) => {
            if (searchLeaveType && row.leaveTypeId !== searchLeaveType) return false;
            if (searchStatus && row.status !== searchStatus) return false;
            if (searchFrom && new Date(row.startDate) < new Date(searchFrom)) return false;
            if (searchTo && new Date(row.endDate) > new Date(searchTo)) return false;
            return true;
        });
    }, [allData, searchLeaveType, searchStatus, searchFrom, searchTo]);

    const sortedData = useMemo(() => {
        if (!sortKey) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aVal = a[sortKey] ?? "";
            const bVal = b[sortKey] ?? "";
            return (aVal < bVal ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
        });
    }, [filteredData, sortKey, sortDir]);

    const { paginatedData, currentPage, totalPages, goToPage, changePageSize: changePgSize } =
        usePagination(sortedData, { pageSize });


    // โ”€โ”€ Row Selection โ”€โ”€
    const getRowId = useCallback((row: any) => row.leaveRequestId, []);
    const selection = useRowSelection(paginatedData, getRowId);
    // โ”€โ”€ Handlers โ”€โ”€
    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    const onClear = () => {
        setSearchLeaveType(""); setSearchStatus(""); setSearchFrom(""); setSearchTo("");
    };

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

    const navigateProfile = (id: number | string) => { router.push(ROUTES.employeeProfile(id)); };

    const formatDate = (d: string | null | undefined) => {
        if (!d) return "";
        try { return format(new Date(d), "dd/MM/yyyy"); } catch { return d; }
    };

    // โ”€โ”€ Render โ”€โ”€
    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Leave (Employee)', 'Leave (Employee)')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard') }, { label: t('Leave (Employee)', 'Leave (Employee)') }]}
                actionLabel={t('Add', 'Add')}
                onAction={openAdd}
            />

            {/* โ”€โ”€ Leave Quota Cards โ”€โ”€ */}
            {leaveQuotas.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {leaveQuotas.map((quota: AnyRow, idx: number) => (
                        <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm text-center hover:shadow-md transition-shadow">
                            <p className="text-sm font-medium text-gray-600">{quota.leaveTypeName}</p>
                            <div className="mt-2">
                                <span className="text-xs text-gray-400">{t('Remaining', 'Remaining')}: </span>
                                <span className="text-2xl font-bold text-gray-900">{quota.availableQuota}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{t('Used', 'Used')}: {quota.usedLeaveDays}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* โ”€โ”€ Search Filter โ”€โ”€ */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                    <FormField label={t('Leave Type', 'Leave Type')}>
                        <select value={searchLeaveType} onChange={(e) => setSearchLeaveType(e.target.value ? Number(e.target.value) : "")} className={ui.select}>
                            <option value="">-- {t('Select', 'Select')} --</option>
                            {leaveTypes.map((lt: AnyRow) => (
                                <option key={lt.leaveTypeId} value={lt.leaveTypeId}>{lt.leaveTypeNameEn}</option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label={t('Status', 'Status')}>
                        <select value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)} className={ui.select}>
                            <option value="">-- {t('Select', 'Select')} --</option>
                            <option value="New">{t('New', 'New')}</option>
                            <option value="Approved">{t('Approved', 'Approved')}</option>
                            <option value="Declined">{t('Declined', 'Declined')}</option>
                        </select>
                    </FormField>
                    <FormField label={t('From', 'From')}>
                        <input type="date" value={searchFrom} onChange={(e) => setSearchFrom(e.target.value)} className={ui.input} />
                    </FormField>
                    <FormField label={t('To', 'To')}>
                        <input type="date" value={searchTo} onChange={(e) => setSearchTo(e.target.value)} className={ui.input} />
                    </FormField>
                    <div className="flex gap-2">
                        <button type="button" className={`flex-1 px-3 py-2.5 bg-nv-violet text-white text-sm font-medium rounded-lg hover:bg-nv-violet-dark transition-all shadow-sm`}>{t('Search', 'Search')}</button>
                        <button onClick={onClear} className={`flex-1 ${ui.btnSecondary}`}>{t('Clear', 'Clear')}</button>
                    </div>
                </div>
            </div>

            {/* โ”€โ”€ Export Buttons โ”€โ”€ */}
            <ExportButtons
                data={filteredData}
                columns={exportColumns}
                filenamePrefix="leave_employee"
                pdfTitle={t('Leave (Employee)', 'Leave (Employee)')}
                totalCount={filteredData.length}
                selectedData={selection.getSelectedRows(filteredData)}
                selectedCount={selection.selectedCount}
                onClearSelection={selection.clearSelection}
            />

            {/* โ”€โ”€ Table โ”€โ”€ */}
            <div className={ui.tableWrapper}>
                <TableHeaderBar pageSize={pageSize} onPageSizeChange={(v) => { setPageSize(v); changePgSize(v); }} />

                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="overflow-x-auto">
                        <table className={ui.table}>
                            <thead className={ui.thead}>
                                <tr>
                                    <SelectAllCheckbox checked={selection.allSelected} indeterminate={selection.indeterminate} onChange={selection.toggleAll} />
                                    {sortableColumns.map((col) => (
                                        <SortableTh key={col.key} column={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                    ))}
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('Status', 'Status')}</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('Approved By', 'Approved By')}</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('Approved Date', 'Approved Date')}</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('Comment', 'Comment')}</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('Action', 'Action')}</th>
                                </tr>
                            </thead>
                            <tbody className={ui.tbody}>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((row: AnyRow, idx: number) => (
                                        <tr key={`leave-${idx}-${row.leaveRequestId}`} className={ui.tr}>
                                            <td className={ui.td}>{row.leaveTypeName}</td>
                                            <td className={ui.td}>{formatDate(row.startDate)}</td>
                                            <td className={ui.td}>{formatDate(row.endDate)}</td>
                                            <td className={ui.td}>{row.totalDays}</td>
                                            <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">{row.reason}</td>
                                            <td className="px-4 py-3 text-center">
                                                <StatusBadge status={row.status === "WaitForApprove" ? "Wait For Approve" : row.status} />
                                            </td>
                                            <td className="px-4 py-3">
                                                {row.approverId && (
                                                    <button onClick={() => navigateProfile(row.approverId)} className="flex items-center gap-2 hover:text-nv-violet">
                                                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600">
                                                            {(row.approverName || "?").charAt(0)}
                                                        </div>
                                                        <span className="text-sm text-gray-900">{row.approverName}</span>
                                                    </button>
                                                )}
                                            </td>
                                            <td className={ui.td}>{formatDate(row.approvedDate)}</td>
                                            <td className="px-4 py-3 text-gray-600 max-w-[120px] truncate">{row.comments}</td>
                                            <td className={ui.tdActions}>
                                                {row.status === "New" && (
                                                    <div className="relative inline-block">
                                                        <button
                                                            onClick={() => setOpenActionId(openActionId === row.leaveRequestId ? null : row.leaveRequestId)}
                                                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                        {openActionId === row.leaveRequestId && (
                                                            <div className="absolute z-20 right-0 mt-1 w-32 bg-white border rounded-lg shadow-lg py-1">
                                                                <button onClick={() => { openEdit(row); setOpenActionId(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                                                    <Pencil className="w-3.5 h-3.5" /> {t('Edit', 'Edit')}
                                                                </button>
                                                                <button onClick={() => { setDeleteModal(row.leaveRequestId); setOpenActionId(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600">
                                                                    <Trash2 className="w-3.5 h-3.5" /> {t('Delete', 'Delete')}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={11}><EmptyState message={t('No Data Found', 'No Data Found')} /></td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <PaginationBar currentPage={currentPage} totalPages={totalPages} totalData={sortedData.length} pageSize={pageSize} onGoToPage={goToPage} />
            </div>

            {/* โ”€โ”€ Add / Edit Leave Modal โ”€โ”€ */}
            <ModalWrapper
                open={editModal}
                onClose={() => { setEditModal(false); resetForm(); }}
                title={`${editMode === "add" ? t('Add', 'Add') : t('Edit', 'Edit')} ${t('Leave', 'Leave')}`}
                maxWidth="max-w-lg"
                footer={
                    <button onClick={handleFormSubmit} disabled={updateRequestMutation.isPending} className={`w-full ${ui.btnPrimary}`}>
                        {updateRequestMutation.isPending ? t('Submitting...', 'Submitting...') : t('Submit', 'Submit')}
                    </button>
                }
            >
                <div className="space-y-4">
                    {/* Leave Type */}
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

                    {/* Date range */}
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label={t('From', 'From')} required>
                            <input type="date" value={formData.startDate} onChange={(e) => { setFormData((p) => ({ ...p, startDate: e.target.value })); setTimeout(updateDayType, 0); }}
                                className={`${ui.input} ${formTouched && !formData.startDate ? "border-red-500" : ""}`} />
                        </FormField>
                        <FormField label={t('To', 'To')} required>
                            <input type="date" value={formData.endDate} onChange={(e) => { setFormData((p) => ({ ...p, endDate: e.target.value })); setTimeout(updateDayType, 0); }}
                                className={`${ui.input} ${formTouched && !formData.endDate ? "border-red-500" : ""}`} />
                        </FormField>
                    </div>

                    {/* Day Type (only same day) */}
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

                    {/* Total Days (readonly) */}
                    <FormField label={t('Number of Days', 'Number of Days')}>
                        <input type="text" readOnly value={formData.totalDays} className={`${ui.input} ${ui.inputDisabled}`} />
                    </FormField>

                    {/* Remaining (readonly) */}
                    <FormField label={t('Remaining Leaves', 'Remaining Leaves')}>
                        <input type="text" readOnly value={formData.remaining} className={`${ui.input} ${ui.inputDisabled}`} />
                    </FormField>

                    {/* Reason */}
                    <FormField label={t('Leave Reason', 'Leave Reason')} required error={formTouched && !formData.reason ? msg('VAL_LEAVE_REASON_REQUIRED', '* Leave Reason is required') : undefined}>
                        <textarea value={formData.reason} onChange={(e) => setFormData((p) => ({ ...p, reason: e.target.value }))} rows={4}
                            className={`${ui.textarea} ${formTouched && !formData.reason ? "border-red-500" : ""}`} />
                    </FormField>
                </div>
            </ModalWrapper>

            {/* โ”€โ”€ Delete Modal โ”€โ”€ */}
            <ModalWrapper
                open={deleteModal !== null}
                onClose={() => setDeleteModal(null)}
                title={t('Delete Leave Request', 'Delete Leave Request')}
                maxWidth="max-w-sm"
                footer={
                    <>
                        <button onClick={() => deleteModal && deleteMutation.mutate(deleteModal)} disabled={deleteMutation.isPending} className={`flex-1 ${ui.btnDanger}`}>
                            {deleteMutation.isPending ? t('Deleting...', 'Deleting...') : t('Delete', 'Delete')}
                        </button>
                        <button onClick={() => setDeleteModal(null)} className={`flex-1 ${ui.btnSecondary}`}>{t('Cancel', 'Cancel')}</button>
                    </>
                }
            >
                <p className="text-sm text-gray-500 text-center">{t('Confirm delete leave request?', 'Are you sure you want to delete this leave request?')}</p>
            </ModalWrapper>

            {/* Click-away handler for dropdowns */}
            {openActionId !== null && (
                <div className="fixed inset-0 z-10" onClick={() => setOpenActionId(null)} />
            )}
        </div>
    );
}
