"use client";

import { useEffect,  useState, useMemo, useCallback } from "react";
import apiClient from "@/lib/api-client";
import {
    useUserResignations,
    useUpdateResignation,
    ResignationDto
} from "@/hooks/use-resignation";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
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
    EmptyState,
    LoadingSpinner,
    PaginationBar,
    ModalWrapper,
    FormField,
    StatusBadge,
    ui, SelectAllCheckbox, RowCheckbox,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";
import { useSystemConfig } from '@nexone/ui';

type AnyRow = Record<string, any>;

const statusVariant = (status?: string) => {
    if (status === "Approved") return "success";
    if (status === "Pending") return "warning";
    return "info";
};

export default function ResignationMainPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError } = useMessages();

    const exportColumns: ExportColumn[] = [
        { header: "#", key: "_index" },
        { header: t('Notice Date', 'Notice Date'), key: "noticeDate", format: (v: any) => v ? new Date(v).toLocaleDateString("en-GB") : "" },
        { header: t('Resignation Date', 'Resignation Date'), key: "resignationDate", format: (v: any) => v ? new Date(v).toLocaleDateString("en-GB") : "" },
        { header: t('Reason', 'Reason'), key: "reason" },
        { header: t('Status', 'Status'), key: "status" },
    ];

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "requestDate", label: t('Request Date', 'Request Date'), sortable: true },
    { key: "noticeDate", label: t('Notice Date', 'Notice Date'), sortable: true },
    { key: "resignationDate", label: t('Resignation Date', 'Resignation Date'), sortable: true },
    { key: "reason", label: t('Reason', 'Reason'), sortable: true },
    { key: "status", label: t('Status', 'Status') },
    { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ];

    const { data: resignations, isLoading } = useUserResignations();
    const updateMutation = useUpdateResignation();

    const [searchText, setSearchText] = useState("");
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

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedResignation, setSelectedResignation] = useState<ResignationDto | null>(null);

    const { register, handleSubmit, reset } = useForm();

    const list = useMemo(() => resignations ?? [], [resignations]);

    const filtered = useMemo(() => {
        if (!searchText) return list;
        const q = searchText.toLowerCase();
        return list.filter(
            (d) =>
                d.reason?.toLowerCase().includes(q) ||
                d.status?.toLowerCase().includes(q) ||
                (d.requestDate && format(new Date(d.requestDate), "dd MMM yyyy").toLowerCase().includes(q)) ||
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
        const empId = localStorage.getItem("employeeId");
        if (resignation) {
            setSelectedResignation(resignation);
            reset({
                resignationId: resignation.resignationId,
                employeeId: resignation.employeeId,
                noticeDate: resignation.noticeDate ? format(new Date(resignation.noticeDate), "yyyy-MM-dd") : "",
                resignationDate: resignation.resignationDate ? format(new Date(resignation.resignationDate), "yyyy-MM-dd") : "",
                reason: resignation.reason,
            });
        } else {
            setSelectedResignation(null);
            reset({
                resignationId: 0, employeeId: empId,
                noticeDate: "", resignationDate: "", reason: "",
            });
        }
        setModalOpen(true);
    };

    const onSubmit = (data: Partial<ResignationDto>) => {
        const username = localStorage.getItem("username") || "system";
        updateMutation.mutate({ ...data, username }, {
            onSuccess: () => {
                showSuccess('SAVE_SUCCESS', 'Success!', 'Resignation request submitted.');
                setModalOpen(false);
            },
            onError: () => showError('SAVE_ERROR', 'Error!', 'Failed to submit resignation.'),
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
                title={t('My Resignation', 'My Resignation')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard },
                    { label: t('My Resignation', 'My Resignation') },
                ]}
                actionLabel={t('Add', 'Add')}
                onAction={() => openModal()}
            />

            <div className="flex flex-wrap items-center gap-3">
                <ExportButtons
                    data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))}
                    columns={exportColumns}
                    filenamePrefix="resignations"
                    pdfTitle={t('My Resignations', 'My Resignations')}
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
                    ]}
                    filenamePrefix="resignations"
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
                                            <td className={ui.td}>{formatDate(d.requestDate)}</td>
                                            <td className={ui.td}>{formatDate(d.noticeDate)}</td>
                                            <td className={ui.td}>{formatDate(d.resignationDate)}</td>
                                            <td className={ui.td}>
                                                <span className="truncate max-w-[200px] block">{d.reason}</span>
                                            </td>
                                            <td className={ui.td}>
                                                <StatusBadge status={d.status} variant={statusVariant(d.status)} />
                                            </td>
                                            <td className={ui.tdActions}>
                                                <button onClick={() => openModal(d as ResignationDto)} className="p-1.5 text-gray-500 hover:text-nv-violet hover:bg-nv-violet-light rounded-lg transition-colors" title={t('View / Edit', 'View / Edit')}>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
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
                title={selectedResignation ? t('Resignation Details', 'Resignation Details') : t('Submit Resignation', 'Submit Resignation')}
                maxWidth="max-w-lg"
                footer={
                    !selectedResignation || selectedResignation.status === "Pending" ? (
                        <button onClick={handleSubmit(onSubmit)} disabled={updateMutation.isPending} className={ui.btnPrimary}>
                            {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
                            {t('Submit', 'Submit')}
                        </button>
                    ) : null
                }
            >
                <div className="space-y-4">
                    {selectedResignation?.status === "Approved" && (
                        <div className="p-3 bg-nv-violet-light border border-emerald-200 rounded-lg text-center">
                            <p className="text-sm font-medium text-emerald-700">{t('This request has been approved and is locked.', 'This request has been approved and is locked.')}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Notice Date', 'Notice Date')} required>
                            <input type="date" disabled={selectedResignation?.status === "Approved"} {...register("noticeDate", { required: true })} className={`${ui.input} disabled:opacity-50`} />
                        </FormField>
                        <FormField label={t('Resignation Date', 'Resignation Date')} required>
                            <input type="date" disabled={selectedResignation?.status === "Approved"} {...register("resignationDate", { required: true })} className={`${ui.input} disabled:opacity-50`} />
                        </FormField>
                    </div>
                    <FormField label={t('Reason', 'Reason')} required>
                        <textarea disabled={selectedResignation?.status === "Approved"} {...register("reason", { required: true })} className={`${ui.textarea} disabled:opacity-50`} placeholder="Provide reason for resignation..." rows={4} />
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
