"use client";

import { useState, useMemo, useCallback } from "react";
import apiClient from "@/lib/api-client";
import {
    useTerminationTypes,
    useUpdateTerminationType,
    useDeleteTerminationType,
    TerminateType
} from "@/hooks/use-termination";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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

export default function TerminationTypePage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showConfirm } = useMessages();

    const exportColumns: ExportColumn[] = [
        { header: "#", key: "_index" },
        { header: t('Code', 'Code'), key: "terminateTypeCode" },
        { header: t('Name (EN)', 'Name (EN)'), key: "terminateTypeNameEn" },
        { header: t('Name (TH)', 'Name (TH)'), key: "terminateTypeNameTh" },
    ];

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "terminateTypeCode", label: t('Code', 'Code'), sortable: true },
    { key: "terminateTypeNameEn", label: t('Name (EN)', 'Name (EN)'), sortable: true },
    { key: "terminateTypeNameTh", label: t('Name (TH)', 'Name (TH)'), sortable: true },
    { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ];

    const { data: types, isLoading } = useTerminationTypes();

    const updateMutation = useUpdateTerminationType();
    const deleteMutation = useDeleteTerminationType();

    const [searchText, setSearchText] = useState("");
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [pageSize, setPageSize] = useState(10);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<TerminateType | null>(null);

    const { register, handleSubmit, reset } = useForm();

    const list = useMemo(() => types ?? [], [types]);

    const filtered = useMemo(() => {
        if (!searchText) return list;
        const q = searchText.toLowerCase();
        return list.filter(
            (d) =>
                d.terminateTypeNameEn?.toLowerCase().includes(q) ||
                d.terminateTypeNameTh?.toLowerCase().includes(q) ||
                d.terminateTypeCode?.toLowerCase().includes(q)
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
    const getRowId = useCallback((d: any) => d.terminateTypeId, []);
    const selection = useRowSelection(paginatedData, getRowId);
    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    const openModal = (type?: TerminateType) => {
        if (type) {
            setSelectedType(type);
            reset({
                terminateId: type.terminateTypeId,
                terminateTypeId: type.terminateTypeId,
                terminateTypeNameEn: type.terminateTypeNameEn,
                terminateTypeNameTh: type.terminateTypeNameTh,
                terminateTypeCode: type.terminateTypeCode,
            });
        } else {
            setSelectedType(null);
            reset({
                terminateId: 0, terminateTypeId: 0,
                terminateTypeNameEn: "", terminateTypeNameTh: "", terminateTypeCode: "",
            });
        }
        setModalOpen(true);
    };

    const onSubmit = (data: Partial<TerminateType>) => {
        const username = localStorage.getItem("username") || "system";
        updateMutation.mutate({ ...data, username }, {
            onSuccess: () => {
                showSuccess('SAVE_SUCCESS', 'Success!', 'Termination type saved.');
                setModalOpen(false);
            },
            onError: () => showError('SAVE_ERROR', 'Error!', 'Failed to save termination type.'),
        });
    };

    const handleDelete = (id: number) => {
        showConfirm('DELETE_CONFIRM', () => {deleteMutation.mutate(id, {
                    onSuccess: () => toast.success("Termination type deleted"),
                    onError: () => toast.error("Failed to delete type"),
                });}, { fallbackTitle: 'Delete Type', fallbackMsg: 'Are you sure you want to delete this termination type?' });
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Termination Type', 'Termination Type')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard },
                    { label: t('Termination Type', 'Termination Type') },
                ]}
                actionLabel={t('Add', 'Add')}
                onAction={() => openModal()}
            />

            <div className="flex flex-wrap items-center gap-3">
                <ExportButtons
                    data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))}
                    columns={exportColumns}
                    filenamePrefix="termination_types"
                    pdfTitle={t('Termination Types', 'Termination Types')}
                    totalCount={sorted.length}
                    selectedData={selection.getSelectedRows(sorted)}
                    selectedCount={selection.selectedCount}
                    onClearSelection={selection.clearSelection}
                />
                <ImportExcelButton
                    columns={[
                        { header: "Type Code", key: "terminateTypeCode", required: true },
                        { header: "Name (EN)", key: "terminateTypeNameEn", required: true },
                        { header: "Name (TH)", key: "terminateTypeNameTh", required: true },
                    ]}
                    filenamePrefix="termination_types"
                    onImport={async (rows) => {
                        let success = 0, failed = 0;
                        const username = localStorage.getItem("username");
                        for (const row of rows) {
                            try {
                                await apiClient.post("/terminate/terminateType/save", {
                                    terminateTypeId: 0,
                                    terminateTypeCode: row.terminateTypeCode ?? "",
                                    terminateTypeNameEn: row.terminateTypeNameEn ?? "",
                                    terminateTypeNameTh: row.terminateTypeNameTh ?? "",
                                    isActive: true,
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
                                        <tr key={d.terminateTypeId} className={selection.isSelected(d.terminateTypeId) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(d.terminateTypeId)} onChange={() => selection.toggle(d.terminateTypeId)} />
                                            <td className={ui.tdIndex}>{(currentPage - 1) * pageSize + idx + 1}</td>
                                            <td className={ui.td}>
                                                <span className="px-2 py-0.5 text-xs font-medium rounded bg-nv-violet-light text-nv-violet border border-nv-violet/20">{d.terminateTypeCode}</span>
                                            </td>
                                            <td className={ui.tdBold}>{d.terminateTypeNameEn}</td>
                                            <td className={ui.td}>{d.terminateTypeNameTh}</td>
                                            <td className={ui.tdActions}>
                                                <ActionButtons
                                                    onEdit={() => openModal(d as TerminateType)}
                                                    onDelete={() => handleDelete(d.terminateTypeId)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <EmptyState colSpan={6} />
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
                title={selectedType ? t('Edit Termination Type', 'Edit Termination Type') : t('Add Termination Type', 'Add Termination Type')}
                maxWidth="max-w-md"
                footer={
                    <button onClick={handleSubmit(onSubmit)} disabled={updateMutation.isPending} className={ui.btnPrimary}>
                        {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
                        {t('Submit', 'Submit')}
                    </button>
                }
            >
                <div className="space-y-4">
                    <FormField label={t('Type Code', 'Type Code')} required>
                        <input type="text" disabled={!!selectedType} {...register("terminateTypeCode", { required: true })} className={`${ui.input} disabled:opacity-50`} placeholder="e.g. RESGN, TERM" />
                    </FormField>
                    <FormField label={t('Name (English)', 'Name (English)')} required>
                        <input type="text" {...register("terminateTypeNameEn", { required: true })} className={ui.input} placeholder="e.g. Voluntary Resignation" />
                    </FormField>
                    <FormField label={t('Name (Thai)', 'Name (Thai)')} required>
                        <input type="text" {...register("terminateTypeNameTh", { required: true })} className={ui.input} placeholder="e.g. เธฅเธฒเธญเธญเธเนเธ”เธขเธชเธกเธฑเธเธฃเนเธ" />
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
