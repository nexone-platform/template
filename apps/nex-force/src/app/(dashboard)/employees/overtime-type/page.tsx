"use client";

import { useEffect,  useState, useMemo, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMessages } from "@/hooks/use-messages";
import { ROUTES } from "@/lib/routes";
import { useOvertimeTypes, useUpdateOvertimeType } from "@/hooks/use-overtime";
import { usePagination } from "@/hooks/use-pagination";
import { useRowSelection } from "@/hooks/use-row-selection";
import apiClient from "@/lib/api-client";
import ExportButtons from "@/components/ExportButtons";
import ImportExcelButton from "@/components/ImportExcelButton";
import type { ExportColumn } from "@/lib/table-export";
import {
    PageHeader, TableHeaderBar, SortableTh, ActionButtons,
    EmptyState, LoadingSpinner, PaginationBar, ModalWrapper, FormField, ui, SelectAllCheckbox, RowCheckbox,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";
import { useSystemConfig } from '@nexone/ui';



export default function OvertimeTypePage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showConfirm } = useMessages();

    const tableColumns = useMemo(() => [
        { key: "#", label: "#", width: "w-14" },
        { key: "otTypeCode", label: t('OT Type Code', 'OT Type Code'), sortable: true },
        { key: "otTypeNameTh", label: t('OT Type Name (TH)', 'OT Type Name (TH)'), sortable: true },
        { key: "otTypeNameEn", label: t('OT Type Name (EN)', 'OT Type Name (EN)'), sortable: true },
        { key: "value", label: t('Value', 'Value'), sortable: true, align: "center" as const },
        { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ], [t]);

    type AnyRow = Record<string, any>;

    const exportColumns: ExportColumn[] = useMemo(() => [
    { header: "#", key: "_index" },
    { header: t('OT Type Code', 'OT Type Code'), key: "otTypeCode" },
    { header: t('OT Type Name (TH)', 'OT Type Name (TH)'), key: "otTypeNameTh" },
    { header: t('OT Type Name (EN)', 'OT Type Name (EN)'), key: "otTypeNameEn" },
    { header: t('Value', 'Value'), key: "value" },
    ], [t]);
    const queryClient = useQueryClient();

    const { data: otTypes = [], isLoading } = useOvertimeTypes();

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
    const [formTouched, setFormTouched] = useState(false);
    const [formData, setFormData] = useState({
        otTypeId: 0, otTypeCode: "", otTypeNameTh: "", otTypeNameEn: "", value: 0,
    });

    const filtered = useMemo(() => {
        if (!searchText) return otTypes;
        const q = searchText.toLowerCase();
        return otTypes.filter(
            (d: AnyRow) =>
                d.otTypeCode?.toLowerCase().includes(q) ||
                d.otTypeNameTh?.toLowerCase().includes(q) ||
                d.otTypeNameEn?.toLowerCase().includes(q)
        );
    }, [otTypes, searchText]);

    const sorted = useMemo(() => {
        if (!sortKey) return filtered;
        return [...filtered].sort((a: AnyRow, b: AnyRow) => {
            const aVal = a[sortKey] ?? "";
            const bVal = b[sortKey] ?? "";
            return (aVal < bVal ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
        });
    }, [filtered, sortKey, sortDir]);

    const {
        paginatedData, currentPage, totalPages, goToPage, changePageSize: changePgSize,
    } = usePagination<AnyRow>(sorted, { pageSize });

    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    // ── Row Selection ──
    type AnyRowTyped = Record<string, any>;
    const getRowId = useCallback((row: AnyRowTyped) => row.otTypeId, []);
    const selection = useRowSelection(paginatedData, getRowId);

    const updateMutation = useUpdateOvertimeType();

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete<any>(`overtime/deleteOtType?id=${id}`);
            return data;
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["overtimeTypes"] }); },
    });

    const openAdd = () => {
        setFormData({ otTypeId: 0, otTypeCode: "", otTypeNameTh: "", otTypeNameEn: "", value: 0 });
        setFormTouched(false);
        setModalOpen(true);
    };

    const openEdit = (item: AnyRow) => {
        setFormData({
            otTypeId: item.otTypeId,
            otTypeCode: item.otTypeCode ?? "",
            otTypeNameTh: item.otTypeNameTh ?? "",
            otTypeNameEn: item.otTypeNameEn ?? "",
            value: item.value ?? 0,
        });
        setFormTouched(false);
        setModalOpen(true);
    };

    const handleSubmitForm = () => {
        setFormTouched(true);
        if (!formData.otTypeCode || !formData.otTypeNameTh || !formData.otTypeNameEn || formData.value === undefined || formData.value === null) return;
        updateMutation.mutate(formData, {
            onSuccess: () => { showSuccess('SAVE_SUCCESS', 'Success!', 'Overtime Type saved successfully.'); setModalOpen(false); },
            onError: () => { showError('SAVE_ERROR', 'Error!', 'Error saving Overtime Type.'); },
        });
    };

    const handleDelete = (id: number) => {
        showConfirm('DELETE_CONFIRM', () => {deleteMutation.mutate(id, {
                    onSuccess: (res: any) => { showSuccess('SAVE_SUCCESS', 'Success!', res?.message || "Deleted successfully."); },
                    onError: () => { showError('SAVE_ERROR', 'Error!', 'Error deleting Overtime Type'); },
                });}, { fallbackTitle: 'Delete Overtime Type', fallbackMsg: 'Are you sure you want to delete?' });
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Overtime Type', 'Overtime Type')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard }, { label: t('Overtime Type', 'Overtime Type') }]}
                actionLabel={t('Add', 'Add')}
                onAction={openAdd}
            />

            <div className="flex flex-wrap items-center gap-3">
                <ExportButtons
                    data={sorted.map((d: AnyRow, i: number) => ({ ...d, _index: i + 1 }))}
                    columns={exportColumns}
                    filenamePrefix="overtime_types"
                    pdfTitle={t('Overtime Types', 'Overtime Types')}
                    totalCount={sorted.length}
                />
                <ImportExcelButton
                    columns={[
                        { header: "OT Type Code", key: "otTypeCode", required: true },
                        { header: "OT Type Name (TH)", key: "otTypeNameTh", required: true },
                        { header: "OT Type Name (EN)", key: "otTypeNameEn", required: true },
                        { header: "Value", key: "value", required: true },
                    ]}
                    filenamePrefix="overtime_types"
                    onImport={async (rows) => {
                        let success = 0, failed = 0;
                        for (const row of rows) {
                            try {
                                await apiClient.post("overtime/updateOtType", {
                                    otTypeId: 0,
                                    otTypeCode: row.otTypeCode ?? "",
                                    otTypeNameTh: row.otTypeNameTh ?? "",
                                    otTypeNameEn: row.otTypeNameEn ?? "",
                                    value: Number(row.value) || 0,
                                    isActive: true,
                                });
                                success++;
                            } catch { failed++; }
                        }
                        return { success, failed };
                    }}
                    onImportComplete={() => queryClient.invalidateQueries({ queryKey: ["overtimeTypes"] })}
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
                                        <tr key={d.otTypeId} className={selection.isSelected(d.otTypeId) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(d.otTypeId)} onChange={() => selection.toggle(d.otTypeId)} />
                                            <td className={ui.tdIndex}>{(currentPage - 1) * pageSize + idx + 1}</td>
                                            <td className={ui.td}>{d.otTypeCode}</td>
                                            <td className={ui.td}>{d.otTypeNameTh}</td>
                                            <td className={ui.td}>{d.otTypeNameEn}</td>
                                            <td className="px-4 py-3 text-center text-gray-600">{d.value}</td>
                                            <td className={ui.tdActions}>
                                                <ActionButtons onEdit={() => openEdit(d)} onDelete={() => handleDelete(d.otTypeId)} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <EmptyState colSpan={7} />
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <PaginationBar currentPage={currentPage} totalPages={totalPages} totalData={sorted.length} pageSize={pageSize} onGoToPage={goToPage} />
            </div>

            <ModalWrapper
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={t('Overtime Type Detail', 'Overtime Type Detail')}
                maxWidth="max-w-md"
                footer={
                    <button onClick={handleSubmitForm} disabled={updateMutation.isPending} className={ui.btnPrimary}>
                        {updateMutation.isPending ? "Saving..." : "Submit"}
                    </button>
                }
            >
                <div className="space-y-4">
                    <FormField label={t('OT Type Code', 'OT Type Code')} required error={formTouched && !formData.otTypeCode ? "* Required" : undefined}>
                        <input type="text" value={formData.otTypeCode} onChange={(e) => setFormData((p) => ({ ...p, otTypeCode: e.target.value }))}
                            className={`${ui.input} ${formTouched && !formData.otTypeCode ? "border-red-400" : ""}`} />
                    </FormField>
                    <FormField label={t('OT Type Name (TH)', 'OT Type Name (TH)')} required error={formTouched && !formData.otTypeNameTh ? "* Required" : undefined}>
                        <input type="text" value={formData.otTypeNameTh} onChange={(e) => setFormData((p) => ({ ...p, otTypeNameTh: e.target.value }))}
                            className={`${ui.input} ${formTouched && !formData.otTypeNameTh ? "border-red-400" : ""}`} />
                    </FormField>
                    <FormField label={t('OT Type Name (EN)', 'OT Type Name (EN)')} required error={formTouched && !formData.otTypeNameEn ? "* Required" : undefined}>
                        <input type="text" value={formData.otTypeNameEn} onChange={(e) => setFormData((p) => ({ ...p, otTypeNameEn: e.target.value }))}
                            className={`${ui.input} ${formTouched && !formData.otTypeNameEn ? "border-red-400" : ""}`} />
                    </FormField>
                    <FormField label={t('Value', 'Value')} required>
                        <input type="number" value={formData.value} onChange={(e) => setFormData((p) => ({ ...p, value: Number(e.target.value) }))}
                            className={ui.input} />
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
