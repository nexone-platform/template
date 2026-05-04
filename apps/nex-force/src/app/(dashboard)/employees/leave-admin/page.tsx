"use client";

import { useEffect,  useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { differenceInDays, isSameDay as dateFnsSameDay, format } from "date-fns";
import { ROUTES } from "@/lib/routes";
import { useMessages } from "@/hooks/use-messages";
import { getUserProfile, getUserId } from "@/lib/auth";
import { leaveService } from "@/services/leave.service";
import { employeeService } from "@/services/employee.service";
import { usePagination } from "@/hooks/use-pagination";
import { useRowSelection } from "@/hooks/use-row-selection";
import ExportButtons from "@/components/ExportButtons";
import type { ExportColumn } from "@/lib/table-export";
import {
    PageHeader, ModalWrapper, FormField, StatusBadge, TableHeaderBar,
    LoadingSpinner, EmptyState, PaginationBar, SortableTh, SelectAllCheckbox, RowCheckbox, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";
import { useSystemConfig } from '@nexone/ui';

const STATUS_COLORS: Record<string, string> = {
    New: "text-nv-violet-dark bg-nv-violet-light border-nv-violet/20",
    WaitForApprove: "text-amber-700 bg-amber-50 border-amber-200",
    Approved: "text-emerald-700 bg-nv-violet-light border-emerald-200",
    Declined: "text-red-700 bg-red-50 border-red-200",
    Cancelled: "text-gray-700 bg-gray-50 border-gray-200",
};

const APPROVE_STATUS: Record<number, string> = {
    3: "Approved",
    4: "Declined",
    5: "Cancelled",
};


export default function LeaveAdminPage() {
    const { t } = usePageTranslation();
    const { msg, showSuccess, showError, showWarning } = useMessages();

    const tableColumns = useMemo(() => [
        { key: "employeeName", label: t('Employee Name', 'Employee Name'), sortable: true },
        { key: "leaveTypeName", label: t('Leave Type', 'Leave Type'), sortable: true },
        { key: "startDate", label: t('From', 'From'), sortable: true },
        { key: "endDate", label: t('To', 'To'), sortable: true },
        { key: "totalDays", label: t('No of Days', 'No of Days'), sortable: true },
        { key: "reason", label: t('Reason', 'Reason'), sortable: true },
    ], [t]);

    type AnyRow = Record<string, any>;

    const exportColumns: ExportColumn[] = useMemo(() => [
    { header: t('Employee Name', 'Employee Name'), key: "employeeName" },
    { header: t('Leave Type', 'Leave Type'), key: "leaveTypeName" },
    { header: t('From', 'From'), key: "startDate", format: (v: any) => v ? new Date(v).toLocaleDateString("en-GB") : "" },
    { header: t('To', 'To'), key: "endDate", format: (v: any) => v ? new Date(v).toLocaleDateString("en-GB") : "" },
    { header: t('No of Days', 'No of Days'), key: "totalDays" },
    { header: t('Reason', 'Reason'), key: "reason" },
    { header: t('Status', 'Status'), key: "status" },
    { header: t('Approved By', 'Approved By'), key: "approverName" },
    { header: t('Approved Date', 'Approved Date'), key: "approvedDate", format: (v: any) => v ? new Date(v).toLocaleDateString("en-GB") : "" },
    { header: t('Comment', 'Comment'), key: "comments" },
    ], [t]);
    const queryClient = useQueryClient();
    const router = useRouter();
    const username = getUserProfile() ?? "";
    const employeeId = getUserId();
    const currentYear = new Date().getFullYear();

    // โ”€โ”€ Data queries โ”€โ”€
    const { data: allRequestResult, isLoading } = useQuery({
        queryKey: ["leaveRequests"],
        queryFn: leaveService.getAllRequest,
    });

    const { data: summaryResult } = useQuery({
        queryKey: ["leaveSummary"],
        queryFn: () => leaveService.getLeaveSummary("en"),
    });

    const { data: leaveTypesResult } = useQuery({
        queryKey: ["leaveTypes"],
        queryFn: leaveService.getMasterLeaveType,
    });

    const { data: employeesResult } = useQuery({
        queryKey: ["employees", "autocomplete"],
        queryFn: employeeService.getForAutocomplete,
    });

    // โ”€โ”€ Mutations โ”€โ”€
    const approveMutation = useMutation({
        mutationFn: ({ id, body }: { id: number; body: unknown }) =>
            leaveService.approveLeaveRequest(id, body),
        onSuccess: (_, vars) => {
            const statusText = APPROVE_STATUS[
                (vars.body as { status: number }).status
            ]?.toLowerCase();
            showSuccess('SAVE_SUCCESS', 'Success!', `Leave has been ${statusText} successfully.`);
            queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
            queryClient.invalidateQueries({ queryKey: ["leaveSummary"] });
            setApproveModal(null);
            setApproveComment("");
        },
        onError: (err: unknown) => {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message ?? "Error processing request";
            showError('SAVE_ERROR', 'Error!', msg);
        },
    });

    const updateRequestMutation = useMutation({
        mutationFn: leaveService.updateLeaveRequest,
        onSuccess: () => {
            showSuccess('SAVE_SUCCESS', 'Success!', "Leave has been requested successfully.");
            queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
            queryClient.invalidateQueries({ queryKey: ["leaveSummary"] });
            resetForm();
            setEditModal(false);
        },
        onError: (err: unknown) => {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message ?? "เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”";
            showError('SAVE_ERROR', 'Error!', msg);
        },
    });

    // โ”€โ”€ State โ”€โ”€
    const allData: AnyRow[] = useMemo(() => (Array.isArray(allRequestResult?.data) ? allRequestResult.data : []), [allRequestResult]);
    const leaveTypes = useMemo(() => leaveTypesResult?.data ?? [], [leaveTypesResult]);
    const employees: AnyRow[] = useMemo(() => (Array.isArray(employeesResult?.data) ? employeesResult.data : []), [employeesResult]);
    const summaryItems = useMemo(() => summaryResult?.summaryItems ?? [], [summaryResult]);

    // Search / filter
    const [searchName, setSearchName] = useState("");
    const [searchLeaveType, setSearchLeaveType] = useState<number | "">("");
    const [searchStatus, setSearchStatus] = useState("");
    const [searchFrom, setSearchFrom] = useState("");
    const [searchTo, setSearchTo] = useState("");

    // Sort / pagination
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const { configs, loading: configLoading } = useSystemConfig();
    const [hasSetDefaultPageSize, setHasSetDefaultPageSize] = useState(false);

    useEffect(() => {
        if (!configLoading && configs?.pageRecordDefault && !hasSetDefaultPageSize) {
            setPageSize(configs.pageRecordDefault);
            setHasSetDefaultPageSize(true);
        }
    }, [configLoading, configs?.pageRecordDefault, hasSetDefaultPageSize]);
    const [pageSize, setPageSize] = useState(configs?.pageRecordDefault || 10);

    // Approve / Decline / Cancel modal
    const [approveModal, setApproveModal] = useState<{
        leaveRequestId: number;
        status: number;
    } | null>(null);
    const [approveComment, setApproveComment] = useState("");

    // Add / Edit modal
    const [editModal, setEditModal] = useState(false);
    const [editMode, setEditMode] = useState<"add" | "edit">("add");
    const [leaveQuotas, setLeaveQuotas] = useState<AnyRow[]>([]);
    const [isSameDay, setIsSameDay] = useState(false);
    const [formData, setFormData] = useState({
        leaveRequestId: 0,
        employeeId: "" as string | number,
        leaveTypeId: "" as string | number,
        startDate: "",
        endDate: "",
        totalDays: "" as string | number,
        remaining: "" as string | number,
        reason: "",
        dayType: "",
    });
    const [formTouched, setFormTouched] = useState(false);

    // Status dropdown open
    const [openStatusDropdown, setOpenStatusDropdown] = useState<number | null>(null);
    const [openActionDropdown, setOpenActionDropdown] = useState<number | null>(null);

    // โ”€โ”€ Filter โ”€โ”€
    const filteredData = useMemo(() => {
        return allData.filter((row) => {
            if (searchName && !(row.employeeName || "").toLowerCase().includes(searchName.toLowerCase().trim()))
                return false;
            if (searchLeaveType && row.leaveTypeId !== searchLeaveType) return false;
            if (searchStatus && row.status !== searchStatus) return false;
            if (searchFrom && new Date(row.startDate) < new Date(searchFrom)) return false;
            if (searchTo && new Date(row.endDate) > new Date(searchTo)) return false;
            return true;
        });
    }, [allData, searchName, searchLeaveType, searchStatus, searchFrom, searchTo]);

    // โ”€โ”€ Sort โ”€โ”€
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
    const getRowId = useCallback((row: AnyRow) => row.leaveRequestId as number, []);
    const selection = useRowSelection(paginatedData, getRowId);

    // โ”€โ”€ Handlers โ”€โ”€
    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    const onClear = () => {
        setSearchName(""); setSearchLeaveType(""); setSearchStatus("");
        setSearchFrom(""); setSearchTo("");
    };

    const openApproveModal = (leaveRequestId: number, status: number) => {
        setApproveModal({ leaveRequestId, status });
        setApproveComment("");
    };

    const submitApproval = () => {
        if (!approveComment.trim()) {
            showWarning('REQUIRED_FIELDS', 'Validation Error', "Please fill in the comment.");
            return;
        }
        if (!approveModal) return;
        approveMutation.mutate({
            id: approveModal.leaveRequestId,
            body: {
                approverId: employeeId ? parseInt(employeeId) : 0,
                username,
                status: approveModal.status,
                comments: approveComment,
            },
        });
    };

    // โ”€โ”€ Add / Edit leave form โ”€โ”€
    const resetForm = () => {
        setFormData({
            leaveRequestId: 0, employeeId: "", leaveTypeId: "",
            startDate: "", endDate: "", totalDays: "", remaining: "",
            reason: "", dayType: "",
        });
        setFormTouched(false);
        setLeaveQuotas([]);
        setIsSameDay(false);
    };

    const openAdd = () => { resetForm(); setEditMode("add"); setEditModal(true); };

    const openEdit = (row: AnyRow) => {
        setEditMode("edit");
        setFormData({
            leaveRequestId: row.leaveRequestId,
            employeeId: row.employeeId,
            leaveTypeId: row.leaveTypeId,
            startDate: row.startDate ? format(new Date(row.startDate), "yyyy-MM-dd") : "",
            endDate: row.endDate ? format(new Date(row.endDate), "yyyy-MM-dd") : "",
            totalDays: row.totalDays ?? "",
            remaining: "",
            reason: row.reason ?? "",
            dayType: row.dayType ?? "",
        });
        leaveService
            .getLeaveAvailable(row.employeeId, currentYear, "en")
            .then((res) => {
                const quotas = res as AnyRow[];
                setLeaveQuotas(quotas);
                const selected = quotas.find((q) => q.leaveTypeId === row.leaveTypeId);
                if (selected) {
                    setFormData((prev) => ({ ...prev, remaining: selected.availableQuota }));
                }
            })
            .catch(() => { });
        setFormTouched(false);
        setEditModal(true);
    };

    const updateDayType = () => {
        setFormData((prev) => {
            const { startDate, endDate, dayType } = prev;
            if (!startDate || !endDate) return { ...prev, totalDays: "" };
            const same = dateFnsSameDay(new Date(startDate), new Date(endDate));
            setIsSameDay(same);
            if (same) {
                return { ...prev, totalDays: dayType === "full" ? 1 : 0.5 };
            } else {
                const diff = differenceInDays(new Date(endDate), new Date(startDate)) + 1;
                return { ...prev, totalDays: diff >= 0 ? diff : 0 };
            }
        });
    };

    const handleFormSubmit = () => {
        setFormTouched(true);
        if (!formData.employeeId || !formData.leaveTypeId || !formData.startDate || !formData.endDate || !formData.reason) {
            showWarning('REQUIRED_FIELDS', 'Missing Information', "Some required fields are missing. Please check and try again.");
            return;
        }
        updateRequestMutation.mutate({ ...formData, username });
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
                title={t('Leave (Admin)', 'Leave (Admin)')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard') }, { label: t('Leave (Admin)', 'Leave (Admin)') }]}
                actionLabel={t('Add', 'Add')}
                onAction={openAdd}
            />

            {/* โ”€โ”€ Leave Summary Cards โ”€โ”€ */}
            {summaryItems.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {summaryItems.map((item: AnyRow, idx: number) => (
                        <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <p className="text-sm text-gray-500">{item.name}</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                {item.count}
                                {item.name?.includes("Leaves") && (
                                    <span className="text-sm font-normal text-gray-400 ml-1">{t('Today', 'Today')}</span>
                                )}
                            </h3>
                        </div>
                    ))}
                </div>
            )}

            {/* โ”€โ”€ Search Filter โ”€โ”€ */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
                    <FormField label={t('Employee Name', 'Employee Name')}>
                        <input type="text" value={searchName} onChange={(e) => setSearchName(e.target.value)} className={ui.input} placeholder={t('Employee Name', 'Employee Name')} />
                    </FormField>
                    <FormField label={t('Leave Type', 'Leave Type')}>
                        <select value={searchLeaveType} onChange={(e) => setSearchLeaveType(e.target.value ? Number(e.target.value) : "")} className={ui.select}>
                            <option value="">{t('-- Select --', '-- Select --')}</option>
                            {leaveTypes.map((lt: AnyRow) => (
                                <option key={lt.leaveTypeId} value={lt.leaveTypeId}>{lt.leaveTypeNameEn}</option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label={t('Status', 'Status')}>
                        <select value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)} className={ui.select}>
                            <option value="">{t('-- Select --', '-- Select --')}</option>
                            <option value="New">{t('New', 'New')}</option>
                            <option value="WaitForApprove">{t('Wait For Approve', 'Wait For Approve')}</option>
                            <option value="Approved">{t('Approved', 'Approved')}</option>
                            <option value="Declined">{t('Declined', 'Declined')}</option>
                            <option value="Cancelled">{t('Cancelled', 'Cancelled')}</option>
                        </select>
                    </FormField>
                    <FormField label={t('From', 'From')}>
                        <input type="date" value={searchFrom} onChange={(e) => setSearchFrom(e.target.value)} className={ui.input} />
                    </FormField>
                    <FormField label={t('To', 'To')}>
                        <input type="date" value={searchTo} onChange={(e) => setSearchTo(e.target.value)} className={ui.input} />
                    </FormField>
                    <div className="flex gap-2">
                        <button type="button" className={`flex-1 px-3 py-2.5 bg-nv-violet text-white text-sm font-medium rounded-lg hover:bg-nv-violet-dark transition-all shadow-sm`}>
                            {t('Search', 'Search')}
                        </button>
                        <button onClick={onClear} className={`flex-1 ${ui.btnSecondary}`}>{t('Clear', 'Clear')}</button>
                    </div>
                </div>
            </div>

            {/* โ”€โ”€ Export Buttons โ”€โ”€ */}
            <ExportButtons
                data={filteredData}
                columns={exportColumns}
                filenamePrefix="leave_admin"
                pdfTitle={t('Leave Admin', 'Leave Admin')}
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
                                    {tableColumns.map((col) => (
                                        <SortableTh key={col.key} column={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                    ))}
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('Status', 'Status')}</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('Approved By', 'Approved By')}</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('Approved Date', 'Approved Date')}</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('Comment', 'Comment')}</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('Actions', 'Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className={ui.tbody}>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((row: AnyRow, idx: number) => (
                                        <tr key={`leave-${idx}-${row.leaveRequestId}`} className={selection.isSelected(row.leaveRequestId) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(row.leaveRequestId)} onChange={() => selection.toggle(row.leaveRequestId)} />
                                            {/* Employee Name */}
                                            <td className="px-4 py-3">
                                                <button onClick={() => row.employeeId && navigateProfile(row.employeeId)} className="flex items-center gap-2 hover:text-nv-violet">
                                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                                                        {(row.employeeName || "?").charAt(0)}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-medium text-gray-900">{row.employeeName}</p>
                                                        {row.designation && <p className="text-xs text-gray-400">{row.designation}</p>}
                                                    </div>
                                                </button>
                                            </td>
                                            <td className={ui.td}>{row.leaveTypeName}</td>
                                            <td className={ui.td}>{formatDate(row.startDate)}</td>
                                            <td className={ui.td}>{formatDate(row.endDate)}</td>
                                            <td className={ui.td}>{row.totalDays}</td>
                                            <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">{row.reason}</td>
                                            {/* Status Dropdown */}
                                            <td className="px-4 py-3 text-center relative">
                                                {row.status !== "Declined" && row.status !== "Cancelled" ? (
                                                    <div className="relative inline-block">
                                                        <button
                                                            onClick={() => setOpenStatusDropdown(openStatusDropdown === row.leaveRequestId ? null : row.leaveRequestId)}
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${STATUS_COLORS[row.status] ?? "text-gray-600 bg-gray-50"}`}
                                                        >
                                                            <span className="w-2 h-2 rounded-full bg-current" />
                                                            {row.status === "WaitForApprove" ? t('Wait For Approve', 'Wait For Approve') : row.status === "New" ? t('New', 'New') : row.status === "Approved" ? t('Approved', 'Approved') : row.status}
                                                        </button>
                                                        {openStatusDropdown === row.leaveRequestId && (
                                                            <div className="absolute z-20 right-0 mt-1 w-40 bg-white border rounded-lg shadow-lg py-1">
                                                                {(row.status === "New" || row.status === "WaitForApprove") && (
                                                                    <>
                                                                        <button onClick={() => { openApproveModal(row.leaveRequestId, 3); setOpenStatusDropdown(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                                                            <span className="w-2 h-2 rounded-full bg-nv-violet" /> {t('Approved', 'Approved')}
                                                                        </button>
                                                                        <button onClick={() => { openApproveModal(row.leaveRequestId, 4); setOpenStatusDropdown(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                                                            <span className="w-2 h-2 rounded-full bg-red-500" /> {t('Declined', 'Declined')}
                                                                        </button>
                                                                    </>
                                                                )}
                                                                {row.status === "Approved" && (
                                                                    <button onClick={() => { openApproveModal(row.leaveRequestId, 6); setOpenStatusDropdown(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                                                        <span className="w-2 h-2 rounded-full bg-red-500" /> {t('Cancel', 'Cancel')}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <StatusBadge status={row.status} />
                                                )}
                                            </td>
                                            {/* Approved By */}
                                            <td className="px-4 py-3">
                                                {row.approvalId && (
                                                    <button onClick={() => navigateProfile(row.approvalId)} className="flex items-center gap-2 hover:text-nv-violet">
                                                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600">
                                                            {(row.approverName || "?").charAt(0)}
                                                        </div>
                                                        <span className="text-sm text-gray-900">{row.approverName}</span>
                                                    </button>
                                                )}
                                            </td>
                                            <td className={ui.td}>{formatDate(row.approvedDate)}</td>
                                            <td className="px-4 py-3 text-gray-600 max-w-[120px] truncate">{row.comments}</td>
                                            {/* Actions */}
                                            <td className={ui.tdActions}>
                                                {row.status === "New" && (
                                                    <div className="relative inline-block">
                                                        <button
                                                            onClick={() => setOpenActionDropdown(openActionDropdown === row.leaveRequestId ? null : row.leaveRequestId)}
                                                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                        {openActionDropdown === row.leaveRequestId && (
                                                            <div className="absolute z-20 right-0 mt-1 w-32 bg-white border rounded-lg shadow-lg py-1">
                                                                <button onClick={() => { openEdit(row); setOpenActionDropdown(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                                                    <Pencil className="w-3.5 h-3.5" /> {t('Edit', 'Edit')}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={12}><EmptyState message={t('No Data Found', 'No Data Found')} /></td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <PaginationBar currentPage={currentPage} totalPages={totalPages} totalData={sortedData.length} pageSize={pageSize} onGoToPage={goToPage} />
            </div>

            {/* โ”€โ”€ Approve / Decline / Cancel Modal โ”€โ”€ */}
            <ModalWrapper
                open={!!approveModal}
                onClose={() => setApproveModal(null)}
                title={
                    approveModal?.status === 3 ? t('Approve Leave', 'Approve Leave') :
                    approveModal?.status === 4 ? t('Decline Leave', 'Decline Leave') : t('Cancel Leave', 'Cancel Leave')
                }
                maxWidth="max-w-md"
                footer={
                    <>
                        <button onClick={submitApproval} disabled={approveMutation.isPending} className={`flex-1 ${ui.btnPrimary}`}>
                            {approveMutation.isPending ? t('Processing...', 'Processing...') :
                                approveModal?.status === 3 ? t('Approve', 'Approve') :
                                approveModal?.status === 4 ? t('Decline', 'Decline') : t('Cancel Leave', 'Cancel Leave')}
                        </button>
                        <button onClick={() => setApproveModal(null)} className={`flex-1 ${ui.btnSecondary}`}>{t('Close', 'Close')}</button>
                    </>
                }
            >
                <p className="text-sm text-gray-500 mb-4">
                    {approveModal?.status === 3 && t('Are you sure you want to approve this leave?', 'Are you sure you want to approve this leave?')}
                    {approveModal?.status === 4 && t('Are you sure you want to decline this leave?', 'Are you sure you want to decline this leave?')}
                    {approveModal?.status === 6 && t('Are you sure you want to cancel this leave?', 'Are you sure you want to cancel this leave?')}
                </p>
                <FormField label={t('Comment', 'Comment')} required>
                    <textarea
                        value={approveComment}
                        onChange={(e) => setApproveComment(e.target.value)}
                        placeholder={t('Enter your comment here', 'Enter your comment here')}
                        rows={3}
                        className={ui.textarea}
                    />
                </FormField>
            </ModalWrapper>

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
                    {/* Employee */}
                    <FormField label={t('Employee Name', 'Employee Name')} required error={formTouched && !formData.employeeId ? msg('VAL_EMPLOYEE_NAME_REQUIRED', '* Employee Name is required') : undefined}>
                        <select
                            value={formData.employeeId}
                            onChange={(e) => {
                                const empId = Number(e.target.value);
                                setFormData((p) => ({ ...p, employeeId: empId }));
                                leaveService
                                    .getLeaveAvailable(empId, currentYear, "en")
                                    .then((res) => setLeaveQuotas(res as AnyRow[]))
                                    .catch(() => { });
                            }}
                            className={`${ui.select} ${formTouched && !formData.employeeId ? "border-red-500" : ""}`}
                        >
                            <option value="">{t('Select Employee', 'Select Employee')}</option>
                            {employees.map((e: AnyRow) => (
                                <option key={e.id} value={e.id}>
                                    {e.firstNameEn} {e.lastNameEn}
                                </option>
                            ))}
                        </select>
                    </FormField>

                    {/* Leave Type */}
                    <FormField label={t('Leave Type', 'Leave Type')} required error={formTouched && !formData.leaveTypeId ? msg('VAL_LEAVE_TYPE_REQUIRED', '* Leave Type is required') : undefined}>
                        <select
                            value={formData.leaveTypeId}
                            onChange={(e) => {
                                const ltId = Number(e.target.value);
                                setFormData((p) => ({ ...p, leaveTypeId: ltId }));
                                const sel = leaveQuotas.find((q) => q.leaveTypeId === ltId);
                                if (sel) {
                                    setFormData((p) => ({ ...p, leaveTypeId: ltId, remaining: sel.availableQuota }));
                                }
                            }}
                            className={`${ui.select} ${formTouched && !formData.leaveTypeId ? "border-red-500" : ""}`}
                        >
                            <option value="">{t('Select Leave Type', 'Select Leave Type')}</option>
                            {leaveQuotas.map((q: AnyRow) => (
                                <option key={q.leaveTypeId} value={q.leaveTypeId}>
                                    {q.leaveTypeName}
                                </option>
                            ))}
                        </select>
                    </FormField>

                    {/* Date range */}
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label={t('From', 'From')} required>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => {
                                    setFormData((p) => ({ ...p, startDate: e.target.value }));
                                    setTimeout(updateDayType, 0);
                                }}
                                className={`${ui.input} ${formTouched && !formData.startDate ? "border-red-500" : ""}`}
                            />
                        </FormField>
                        <FormField label={t('To', 'To')} required>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => {
                                    setFormData((p) => ({ ...p, endDate: e.target.value }));
                                    setTimeout(updateDayType, 0);
                                }}
                                className={`${ui.input} ${formTouched && !formData.endDate ? "border-red-500" : ""}`}
                            />
                        </FormField>
                    </div>

                    {/* Day Type (only when same day) */}
                    {isSameDay && (
                        <FormField label={t('Select Time Period', 'Select Time Period')} required>
                            <select
                                value={formData.dayType}
                                onChange={(e) => {
                                    setFormData((p) => ({ ...p, dayType: e.target.value }));
                                    setTimeout(updateDayType, 0);
                                }}
                                className={ui.select}
                            >
                                <option value="">{t('-- Select --', '-- Select --')}</option>
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
                        <textarea
                            value={formData.reason}
                            onChange={(e) => setFormData((p) => ({ ...p, reason: e.target.value }))}
                            rows={3}
                            className={`${ui.textarea} ${formTouched && !formData.reason ? "border-red-500" : ""}`}
                        />
                    </FormField>
                </div>
            </ModalWrapper>

            {/* Click-away handler for dropdowns */}
            {(openStatusDropdown !== null || openActionDropdown !== null) && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => { setOpenStatusDropdown(null); setOpenActionDropdown(null); }}
                />
            )}
        </div>
    );
}
