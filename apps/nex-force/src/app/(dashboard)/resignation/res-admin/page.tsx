"use client";

import { useState, useMemo, useCallback } from "react";
import apiClient from "@/lib/api-client";
import {
    useAllResignations,
    useUpdateResignation,
    useApproveResignation,
    ResignationDto
} from "@/hooks/use-resignation";
import { useEmployeeBrief } from "@/hooks/use-termination";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { useMessages } from "@/hooks/use-messages";
import { getApiErrorMessage } from "@/lib/api-error";
import { ROUTES } from "@/lib/routes";
import { usePagination } from "@/hooks/use-pagination";
import { useRowSelection } from "@/hooks/use-row-selection";
import ExportButtons from "@/components/ExportButtons";
import ImportExcelButton from "@/components/ImportExcelButton";
import type { ExportColumn } from "@/lib/table-export";
import {
    PageHeader,
    TableHeaderBar,
    SortableTh,
    ActionButtons,
    EmptyState,
    LoadingSpinner,
    PaginationBar,
    ModalWrapper,
    FormField,
    StatusBadge,
    ui, SelectAllCheckbox, RowCheckbox,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

type AnyRow = Record<string, any>;

const statusVariant = (status?: string) => {
    if (status === "Approved") return "success";
    if (status === "Pending") return "warning";
    return "danger";
};

export default function ResignationAdminPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError } = useMessages();

    const exportColumns: ExportColumn[] = [
        { header: "#", key: "_index" },
        { header: t('Employee', 'Employee'), key: "employeeName" },
        { header: t('Notice Date', 'Notice Date'), key: "noticeDate", format: (v: any) => v ? new Date(v).toLocaleDateString("en-GB") : "" },
        { header: t('Resignation Date', 'Resignation Date'), key: "resignationDate", format: (v: any) => v ? new Date(v).toLocaleDateString("en-GB") : "" },
        { header: t('Reason', 'Reason'), key: "reason" },
        { header: t('Status', 'Status'), key: "status" },
        { header: t('Comment', 'Comment'), key: "comments" },
    ];

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "employeeName", label: t('Employee', 'Employee'), sortable: true },
    { key: "noticeDate", label: t('Notice Date', 'Notice Date'), sortable: true },
    { key: "resignationDate", label: t('Resignation Date', 'Resignation Date'), sortable: true },
    { key: "reason", label: t('Reason', 'Reason'), sortable: true },
    { key: "status", label: t('Status', 'Status') },
    { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ];

    const { data: resignations, isLoading } = useAllResignations();
    const { data: employees } = useEmployeeBrief();

    const updateMutation = useUpdateResignation();
    const approveMutation = useApproveResignation();

    const [searchText, setSearchText] = useState("");
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [pageSize, setPageSize] = useState(10);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [selectedResignation, setSelectedResignation] = useState<ResignationDto | null>(null);
    const [approveType, setApproveType] = useState<"approve" | "decline" | null>(null);

    const adminForm = useForm();
    const approveForm = useForm();

    const list = useMemo(() => resignations ?? [], [resignations]);

    const filtered = useMemo(() => {
        if (!searchText) return list;
        const q = searchText.toLowerCase();
        return list.filter(
            (d) =>
                d.employeeName?.toLowerCase().includes(q) ||
                d.reason?.toLowerCase().includes(q) ||
                d.status?.toLowerCase().includes(q) ||
                (d.noticeDate && format(new Date(d.noticeDate), "dd MMM yyyy").toLowerCase().includes(q)) ||
                (d.resignationDate && format(new Date(d.resignationDate), "dd MMM yyyy").toLowerCase().includes(q))
        );
    }, [list, searchText]);

    const sorted = useMemo(() => {
        if (!sortKey) return filtered;
        return [...filtered].sort((a, b) => {
            const aVal = (a as AnyRow)[sortKey] ?? "";
            const bVal = (b as AnyRow)[sortKey] ?? "";
            return (aVal < bVal ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
        });
    }, [filtered, sortKey, sortDir]);

    const {
        paginatedData, currentPage, totalPages, goToPage, changePageSize: changePgSize,
    } = usePagination(sorted, { pageSize });


    // โ”€โ”€ Row Selection โ”€โ”€
    const getRowId = useCallback((d: any) => d.resignationId, []);
    const selection = useRowSelection(paginatedData, getRowId);
    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    const openModal = (resignation?: ResignationDto) => {
        if (resignation) {
            setSelectedResignation(resignation);
            adminForm.reset({
                resignationId: resignation.resignationId,
                employeeId: resignation.employeeId,
                noticeDate: resignation.noticeDate ? format(new Date(resignation.noticeDate), "yyyy-MM-dd") : "",
                resignationDate: resignation.resignationDate ? format(new Date(resignation.resignationDate), "yyyy-MM-dd") : "",
                reason: resignation.reason,
            });
        } else {
            setSelectedResignation(null);
            adminForm.reset({
                resignationId: 0, employeeId: "",
                noticeDate: "", resignationDate: "", reason: "",
            });
        }
        setIsModalOpen(true);
    };

    const openApproveModal = (resignation: ResignationDto, type: "approve" | "decline") => {
        setSelectedResignation(resignation);
        setApproveType(type);
        approveForm.reset({ comments: "" });
        setIsApproveModalOpen(true);
    };

    const onAdminSubmit = (data: Partial<ResignationDto>) => {
        const username = localStorage.getItem("username") || "system";
        updateMutation.mutate({ ...data, username }, {
            onSuccess: () => {
                showSuccess('SAVE_SUCCESS', 'Success!', 'Resignation record saved.');
                setIsModalOpen(false);
            },
            onError: () => showError('SAVE_ERROR', 'Error!', 'Failed to save resignation.'),
        });
    };

    const onApproveSubmit = (data: { comments: string }) => {
        if (!selectedResignation) return;
        const empId = localStorage.getItem("employeeId");
        const username = localStorage.getItem("username") || "system";
        const status = approveType === "approve" ? 1 : 2;

        approveMutation.mutate({
            id: selectedResignation.resignationId,
            data: {
                approverId: empId ? parseInt(empId) : 0,
                username, status, comments: data.comments,
            },
        }, {
            onSuccess: () => {
                showSuccess('SAVE_SUCCESS', 'Success!', `Resignation has been ${approveType}d.`);
                setIsApproveModalOpen(false);
            },
            onError: (error: unknown) => {
                const apiError = error as { response?: { data?: { message?: string } } };
                showError('SAVE_ERROR', 'Error!', getApiErrorMessage(apiError, `Failed to ${approveType} resignation.`));
            },
        });
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        try { return format(new Date(dateStr), "dd MMM yyyy"); }
        catch { return dateStr; }
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Resignation Admin', 'Resignation Admin')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard },
                    { label: t('Resignation Admin', 'Resignation Admin') },
                ]}
                actionLabel={t('Add', 'Add')}
                onAction={() => openModal()}
            />

            <div className="flex flex-wrap items-center gap-3">
                <ExportButtons
                    data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))}
                    columns={exportColumns}
                    filenamePrefix="resignations_admin"
                    pdfTitle={t('Resignation Admin', 'Resignation Admin')}
                    totalCount={sorted.length}
                    selectedData={selection.getSelectedRows(sorted)}
                    selectedCount={selection.selectedCount}
                    onClearSelection={selection.clearSelection}
                />
                <ImportExcelButton
                    columns={[
                        { header: "Employee ID", key: "employeeId", required: true },
                        { header: "Notice Date", key: "noticeDate", required: true },
                        { header: "Resignation Date", key: "resignationDate", required: true },
                        { header: "Reason", key: "reason", required: true },
                    
                        { header: "Employee", key: "employeeName" },
                        { header: "Comment", key: "comments" },]}
                    filenamePrefix="resignations_admin"
                    onImport={async (rows) => {
                        let success = 0, failed = 0;
                        const username = localStorage.getItem("username");
                        for (const row of rows) {
                            try {
                                await apiClient.post("/resignations/update", {
                                    resignationId: 0,
                                    employeeId: Number(row.employeeId) || 0,
                                    noticeDate: row.noticeDate || "",
                                    resignationDate: row.resignationDate || "",
                                    reason: row.reason ?? "",
                                    username,
                                });
                                success++;
                            } catch { failed++; }
                        }
                        return { success, failed };
                    }}
                />
            </div>

            <div className={ui.tableWrapper}>
                <TableHeaderBar
                    pageSize={pageSize}
                    onPageSizeChange={(v) => { setPageSize(v); changePgSize(v); }}
                    searchText={searchText}
                    onSearchChange={setSearchText}
                />

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
                                </tr>
                            </thead>
                            <tbody className={ui.tbody}>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((d: AnyRow, idx: number) => (
                                        <tr key={d.resignationId} className={selection.isSelected(d.resignationId) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(d.resignationId)} onChange={() => selection.toggle(d.resignationId)} />
                                            <td className={ui.tdIndex}>{(currentPage - 1) * pageSize + idx + 1}</td>
                                            <td className={ui.tdBold}>{d.employeeName}</td>
                                            <td className={ui.td}>{formatDate(d.noticeDate)}</td>
                                            <td className={ui.td}>{formatDate(d.resignationDate)}</td>
                                            <td className={ui.td}>
                                                <span className="truncate max-w-[200px] block">{d.reason}</span>
                                            </td>
                                            <td className={ui.td}>
                                                <StatusBadge status={d.status} variant={statusVariant(d.status)} />
                                            </td>
                                            <td className={ui.tdActions}>
                                                <div className="flex items-center justify-end gap-1">
                                                    {d.status === "Pending" && (
                                                        <>
                                                            <button onClick={() => openApproveModal(d as ResignationDto, "approve")} className="p-1.5 text-nv-violet hover:bg-nv-violet-light rounded-lg transition-colors" title={t('Approve', 'Approve')}>
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => openApproveModal(d as ResignationDto, "decline")} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title={t('Decline', 'Decline')}>
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <ActionButtons onEdit={() => openModal(d as ResignationDto)} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <EmptyState colSpan={8} />
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <PaginationBar
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalData={sorted.length}
                    pageSize={pageSize}
                    onGoToPage={goToPage}
                />
            </div>

            {/* Add/Edit Modal */}
            <ModalWrapper
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedResignation ? t('Edit Resignation', 'Edit Resignation') : t('Add Resignation', 'Add Resignation')}
                maxWidth="max-w-lg"
                footer={
                    <button onClick={adminForm.handleSubmit(onAdminSubmit)} disabled={updateMutation.isPending} className={ui.btnPrimary}>
                        {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
                        {t('Submit', 'Submit')}
                    </button>
                }
            >
                <div className="space-y-4">
                    <FormField label={t('Employee', 'Employee')} required>
                        <select disabled={!!selectedResignation} {...adminForm.register("employeeId", { required: true })} className={`${ui.select} disabled:opacity-50`}>
                            <option value="">{t('Select Employee', 'Select Employee')}</option>
                            {employees?.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.firstNameEn} {emp.lastNameEn} ({emp.employeeId})</option>
                            ))}
                        </select>
                    </FormField>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Notice Date', 'Notice Date')} required>
                            <input type="date" {...adminForm.register("noticeDate", { required: true })} className={ui.input} />
                        </FormField>
                        <FormField label={t('Resignation Date', 'Resignation Date')} required>
                            <input type="date" {...adminForm.register("resignationDate", { required: true })} className={ui.input} />
                        </FormField>
                    </div>
                    <FormField label={t('Reason', 'Reason')} required>
                        <textarea {...adminForm.register("reason", { required: true })} className={ui.textarea} placeholder="Enter reason for resignation..." rows={4} />
                    </FormField>
                </div>
            </ModalWrapper>

            {/* Approve/Decline Modal */}
            <ModalWrapper
                open={isApproveModalOpen}
                onClose={() => setIsApproveModalOpen(false)}
                title={approveType === "approve" ? t('Approve Resignation', 'Approve Resignation') : t('Decline Resignation', 'Decline Resignation')}
                maxWidth="max-w-md"
                footer={
                    <button
                        onClick={approveForm.handleSubmit((data) => onApproveSubmit(data as { comments: string }))}
                        disabled={approveMutation.isPending}
                        className={approveType === "approve" ? "px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50" : "px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"}
                    >
                        {approveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
                        {t('Confirm', 'Confirm')}
                    </button>
                }
            >
                <FormField label={t('Official Comment', 'Official Comment')} required>
                    <textarea {...approveForm.register("comments", { required: true })} className={ui.textarea} placeholder="Enter your justification or official notes..." rows={4} />
                </FormField>
            </ModalWrapper>
        </div>
    );
}
