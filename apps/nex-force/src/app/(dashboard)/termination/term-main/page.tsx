"use client";

import { useState, useMemo, useCallback } from "react";
import apiClient from "@/lib/api-client";
import {
    useTerminationList,
    useTerminationTypes,
    useEmployeeBrief,
    useUpdateTermination,
    useDeleteTermination,
    Termination
} from "@/hooks/use-termination";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { useMessages } from "@/hooks/use-messages";
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
    ui, SelectAllCheckbox, RowCheckbox,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

type AnyRow = Record<string, any>;

export default function TerminationMainPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showConfirm } = useMessages();

    const exportColumns: ExportColumn[] = [
        { header: "#", key: "_index" },
        { header: t('Employee', 'Employee'), key: "employeeName" },
        { header: t('Type', 'Type'), key: "terminateTypeName" },
        { header: t('Notice Date', 'Notice Date'), key: "noticeDate", format: (v: any) => v ? new Date(v).toLocaleDateString("en-GB") : "" },
        { header: t('Exit Date', 'Exit Date'), key: "terminateDate", format: (v: any) => v ? new Date(v).toLocaleDateString("en-GB") : "" },
        { header: t('Reason', 'Reason'), key: "reason" },
    ];

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "employeeName", label: t('Employee', 'Employee'), sortable: true },
    { key: "terminateTypeName", label: t('Type', 'Type'), sortable: true },
    { key: "noticeDate", label: t('Notice Date', 'Notice Date'), sortable: true },
    { key: "terminateDate", label: t('Exit Date', 'Exit Date'), sortable: true },
    { key: "reason", label: t('Reason', 'Reason'), sortable: true },
    { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ];

    const { data: terminations, isLoading } = useTerminationList();
    const { data: types } = useTerminationTypes();
    const { data: employees } = useEmployeeBrief();

    const updateMutation = useUpdateTermination();
    const deleteMutation = useDeleteTermination();

    const [searchText, setSearchText] = useState("");
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [pageSize, setPageSize] = useState(10);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTermination, setSelectedTermination] = useState<Termination | null>(null);

    const { register, handleSubmit, reset } = useForm();

    const list = useMemo(() => terminations ?? [], [terminations]);

    const filtered = useMemo(() => {
        if (!searchText) return list;
        const q = searchText.toLowerCase();
        return list.filter(
            (d) =>
                d.employeeName?.toLowerCase().includes(q) ||
                d.terminateTypeName?.toLowerCase().includes(q) ||
                d.reason?.toLowerCase().includes(q)
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
    const getRowId = useCallback((d: any) => d.terminateId, []);
    const selection = useRowSelection(paginatedData, getRowId);
    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    const openModal = (termination?: Termination) => {
        if (termination) {
            setSelectedTermination(termination);
            reset({
                terminateId: termination.terminateId,
                employeeId: termination.employeeId,
                terminateTypeId: termination.terminateTypeId,
                noticeDate: termination.noticeDate ? format(new Date(termination.noticeDate), "yyyy-MM-dd") : "",
                terminateDate: termination.terminateDate ? format(new Date(termination.terminateDate), "yyyy-MM-dd") : "",
                reason: termination.reason,
            });
        } else {
            setSelectedTermination(null);
            reset({
                terminateId: 0, employeeId: "", terminateTypeId: "",
                noticeDate: "", terminateDate: "", reason: "",
            });
        }
        setModalOpen(true);
    };

    const onSubmit = (data: Partial<Termination>) => {
        const username = localStorage.getItem("username") || "system";
        updateMutation.mutate({ ...data, username }, {
            onSuccess: () => {
                showSuccess('SAVE_SUCCESS', 'Success!', 'Termination record saved.');
                setModalOpen(false);
            },
            onError: () => showError('SAVE_ERROR', 'Error!', 'Failed to save termination.'),
        });
    };

    const handleDelete = (id: number) => {
        showConfirm('DELETE_CONFIRM', () => {deleteMutation.mutate(id, {
                    onSuccess: () => toast.success("Termination record deleted"),
                    onError: () => toast.error("Failed to delete record"),
                });}, { fallbackTitle: 'Delete Record', fallbackMsg: 'Are you sure you want to delete this termination record?' });
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        try { return format(new Date(dateStr), "dd MMM yyyy"); }
        catch { return dateStr; }
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Termination', 'Termination')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard },
                    { label: t('Termination', 'Termination') },
                ]}
                actionLabel={t('Add', 'Add')}
                onAction={() => openModal()}
            />

            <div className="flex flex-wrap items-center gap-3">
                <ExportButtons
                    data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))}
                    columns={exportColumns}
                    filenamePrefix="terminations"
                    pdfTitle={t('Terminations', 'Terminations')}
                    totalCount={sorted.length}
                    selectedData={selection.getSelectedRows(sorted)}
                    selectedCount={selection.selectedCount}
                    onClearSelection={selection.clearSelection}
                />
                <ImportExcelButton
                    columns={[
                        { header: "Employee ID", key: "employeeId", required: true },
                        { header: "Termination Type ID", key: "terminateTypeId", required: true },
                        { header: "Notice Date", key: "noticeDate", required: true },
                        { header: "Exit Date", key: "terminateDate", required: true },
                        { header: "Reason", key: "reason", required: true },
                    
                        { header: "Employee", key: "employeeName" },
                        { header: "Type", key: "terminateTypeName" },]}
                    filenamePrefix="terminations"
                    onImport={async (rows) => {
                        let success = 0, failed = 0;
                        const username = localStorage.getItem("username");
                        for (const row of rows) {
                            try {
                                await apiClient.post("/terminate/update", {
                                    terminateId: 0,
                                    employeeId: Number(row.employeeId) || 0,
                                    terminateTypeId: Number(row.terminateTypeId) || 0,
                                    noticeDate: row.noticeDate || "",
                                    terminateDate: row.terminateDate || "",
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
                                        <tr key={d.terminateId} className={selection.isSelected(d.terminateId) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(d.terminateId)} onChange={() => selection.toggle(d.terminateId)} />
                                            <td className={ui.tdIndex}>{(currentPage - 1) * pageSize + idx + 1}</td>
                                            <td className={ui.tdBold}>{d.employeeName}</td>
                                            <td className={ui.td}>
                                                <span className="px-2 py-0.5 text-xs font-medium rounded bg-rose-50 text-rose-600 border border-rose-100">{d.terminateTypeName}</span>
                                            </td>
                                            <td className={ui.td}>{formatDate(d.noticeDate)}</td>
                                            <td className={ui.td}>{formatDate(d.terminateDate)}</td>
                                            <td className={ui.td}>
                                                <span className="truncate max-w-[200px] block">{d.reason}</span>
                                            </td>
                                            <td className={ui.tdActions}>
                                                <ActionButtons
                                                    onEdit={() => openModal(d as Termination)}
                                                    onDelete={() => handleDelete(d.terminateId)}
                                                />
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

            <ModalWrapper
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedTermination ? t('Edit Termination', 'Edit Termination') : t('Add Termination', 'Add Termination')}
                maxWidth="max-w-lg"
                footer={
                    <button onClick={handleSubmit(onSubmit)} disabled={updateMutation.isPending} className={ui.btnPrimary}>
                        {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
                        {t('Submit', 'Submit')}
                    </button>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Employee', 'Employee')} required>
                            <select {...register("employeeId", { required: true })} className={ui.select}>
                                <option value="">{t('Select Employee', 'Select Employee')}</option>
                                {employees?.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.firstNameEn} {emp.lastNameEn} ({emp.employeeId})</option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label={t('Termination Type', 'Termination Type')} required>
                            <select {...register("terminateTypeId", { required: true })} className={ui.select}>
                                <option value="">{t('Select Type', 'Select Type')}</option>
                                {types?.map(t => (
                                    <option key={t.terminateTypeId} value={t.terminateTypeId}>{t.terminateTypeNameEn}</option>
                                ))}
                            </select>
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Notice Date', 'Notice Date')} required>
                            <input type="date" {...register("noticeDate", { required: true })} className={ui.input} />
                        </FormField>
                        <FormField label={t('Exit Date', 'Exit Date')} required>
                            <input type="date" {...register("terminateDate", { required: true })} className={ui.input} />
                        </FormField>
                    </div>
                    <FormField label={t('Reason', 'Reason')} required>
                        <textarea {...register("reason", { required: true })} className={ui.textarea} placeholder="Enter reason for termination..." rows={4} />
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
