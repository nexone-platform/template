"use client";

import { useEffect,  useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMessages } from "@/hooks/use-messages";
import { ROUTES } from "@/lib/routes";
import { departmentService } from "@/services/organization.service";
import { usePagination } from "@/hooks/use-pagination";
import type { Department } from "@/types/employee";
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
import { useSystemConfig } from '@nexone/ui';


export default function DepartmentsPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showWarning } = useMessages();

    const tableColumns = useMemo(() => [
        { key: "#", label: "#", width: "w-14" },
        { key: "departmentCode", label: t('Department Code', 'Department Code'), sortable: true },
        { key: "departmentNameTh", label: t('Department Name (TH)', 'Department Name (TH)'), sortable: true },
        { key: "departmentNameEn", label: t('Department Name (EN)', 'Department Name (EN)'), sortable: true },
        { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ], [t]);

    type AnyRow = Record<string, any>;

    const exportColumns: ExportColumn[] = useMemo(() => [
    { header: "#", key: "_index" },
    { header: t('Department Code', 'Department Code'), key: "departmentCode" },
    { header: t('Department Name (TH)', 'Department Name (TH)'), key: "departmentNameTh" },
    { header: t('Department Name (EN)', 'Department Name (EN)'), key: "departmentNameEn" },
    ], [t]);
    const queryClient = useQueryClient();

    const { data: deptResult, isLoading } = useQuery({
        queryKey: ["departments"],
        queryFn: departmentService.getAll,
    });
    const departments: Department[] = useMemo(() => deptResult?.data ?? [], [deptResult]);

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
    const [mode, setMode] = useState<"add" | "edit">("add");
    const [formTouched, setFormTouched] = useState(false);
    const [formData, setFormData] = useState({
        departmentId: 0,
        departmentCode: "",
        departmentNameTh: "",
        departmentNameEn: "",
    });

    const filtered = useMemo(() => {
        if (!searchText) return departments;
        const q = searchText.toLowerCase();
        return departments.filter(
            (d) =>
                d.departmentCode?.toLowerCase().includes(q) ||
                d.departmentNameTh?.toLowerCase().includes(q) ||
                d.departmentNameEn?.toLowerCase().includes(q)
        );
    }, [departments, searchText]);

    const sorted = useMemo(() => {
        if (!sortKey) return filtered;
        return [...filtered].sort((a, b) => {
            const aVal = (a as AnyRow)[sortKey] ?? "";
            const bVal = (b as AnyRow)[sortKey] ?? "";
            return (aVal < bVal ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
        });
    }, [filtered, sortKey, sortDir]);

    const {
        paginatedData,
        currentPage,
        totalPages,
        goToPage,
        changePageSize: changePgSize,
    } = usePagination(sorted, { pageSize });


    // โ”€โ”€ Row Selection โ”€โ”€
    const getRowId = useCallback((d: any) => d.departmentId, []);
    const selection = useRowSelection(paginatedData, getRowId);
    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    const updateMutation = useMutation({
        mutationFn: departmentService.update,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            showSuccess('SAVE_SUCCESS', 'Success!', 'Department saved successfully.');
            setModalOpen(false);
        },
        onError: (error: any) => {
            const msg = error?.error?.message || error?.message || "Something went wrong.";
            showError('SAVE_ERROR', 'Error!', msg);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: departmentService.delete,
        onSuccess: (res: any) => {
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            showSuccess('SAVE_SUCCESS', 'Success!', res?.message || "Deleted successfully.");
        },
        onError: () => {
            showError('SAVE_ERROR', 'Error!', 'Error deleting department');
        },
    });

    const openAdd = () => {
        setMode("add");
        setFormData({ departmentId: 0, departmentCode: "", departmentNameTh: "", departmentNameEn: "" });
        setFormTouched(false);
        setModalOpen(true);
    };

    const openEdit = (d: Department) => {
        setMode("edit");
        setFormData({
            departmentId: d.departmentId,
            departmentCode: d.departmentCode ?? "",
            departmentNameTh: d.departmentNameTh ?? "",
            departmentNameEn: d.departmentNameEn ?? "",
        });
        setFormTouched(false);
        setModalOpen(true);
    };

    const handleSubmitForm = () => {
        setFormTouched(true);
        if (!formData.departmentCode || !formData.departmentNameTh || !formData.departmentNameEn) return;
        const payload: Department = { ...formData, department: formData.departmentNameEn, isActive: true };
        updateMutation.mutate(payload);
    };

    const handleDelete = (id: number) => {
        showWarning('REQUIRED_FIELDS', 'Delete Department', 'Are you sure you want to delete?').then((result) => {
            if (result.isConfirmed) deleteMutation.mutate(id);
        });
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Department', 'Department')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard },
                    { label: t('Department', 'Department') },
                ]}
                actionLabel={t('Add', 'Add')}
                onAction={openAdd}
            />

            <div className="flex flex-wrap items-center gap-3">
                <ExportButtons
                    data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))}
                    columns={exportColumns}
                    filenamePrefix="departments"
                    pdfTitle={t('Departments', 'Departments')}
                    totalCount={sorted.length}
                    selectedData={selection.getSelectedRows(sorted)}
                    selectedCount={selection.selectedCount}
                    onClearSelection={selection.clearSelection}
                />
                <ImportExcelButton
                    columns={[
                        { header: "Department Code", key: "departmentCode", required: true },
                        { header: "Department Name (TH)", key: "departmentNameTh", required: true },
                        { header: "Department Name (EN)", key: "departmentNameEn", required: true },
                    ]}
                    filenamePrefix="departments"
                    onImport={(rows) => departmentService.bulkImport(rows)}
                    onImportComplete={() => queryClient.invalidateQueries({ queryKey: ["departments"] })}
                />
            </div>

            <div className={ui.tableWrapper}>
                <TableHeaderBar
                    pageSize={pageSize}
                    onPageSizeChange={(v) => { setPageSize(v); changePgSize(v); }}
                    searchText={searchText}
                    onSearchChange={setSearchText}
                    showLabel={t('Show', 'Show')}
                    entriesLabel={t('entries', 'entries')}
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
                                    paginatedData.map((d: Department, idx: number) => (
                                        <tr key={d.departmentId} className={selection.isSelected(d.departmentId) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(d.departmentId)} onChange={() => selection.toggle(d.departmentId)} />
                                            <td className={ui.tdIndex}>{(currentPage - 1) * pageSize + idx + 1}</td>
                                            <td className={ui.td}>{d.departmentCode}</td>
                                            <td className={ui.td}>{d.departmentNameTh}</td>
                                            <td className={ui.td}>{d.departmentNameEn}</td>
                                            <td className={ui.tdActions}>
                                                <ActionButtons
                                                    onEdit={() => openEdit(d)}
                                                    onDelete={() => handleDelete(d.departmentId)}
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
                    showingLabel={t('Showing', 'Showing')}
                    toLabel={t('to', 'to')}
                    ofLabel={t('of', 'of')}
                    entriesLabel={t('entries', 'entries')}
                    prevLabel={t('Prev', 'Prev')}
                    nextLabel={t('Next', 'Next')}
                />
            </div>

            <ModalWrapper
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={t('Department Detail', 'Department Detail')}
                maxWidth="max-w-md"
                footer={
                    <button onClick={handleSubmitForm} disabled={updateMutation.isPending} className={ui.btnPrimary}>
                        {updateMutation.isPending ? "Saving..." : "Submit"}
                    </button>
                }
            >
                <div className="space-y-4">
                    <FormField label={t('Department Code', 'Department Code')} required error={formTouched && !formData.departmentCode ? "* Department Code Required" : undefined}>
                        <input
                            type="text"
                            value={formData.departmentCode}
                            onChange={(e) => setFormData((p) => ({ ...p, departmentCode: e.target.value }))}
                            className={`${ui.input} ${formTouched && !formData.departmentCode ? "border-red-400" : ""}`}
                        />
                    </FormField>
                    <FormField label={t('Department Name (TH)', 'Department Name (TH)')} required error={formTouched && !formData.departmentNameTh ? "* Department Name (TH) Required" : undefined}>
                        <input
                            type="text"
                            value={formData.departmentNameTh}
                            onChange={(e) => setFormData((p) => ({ ...p, departmentNameTh: e.target.value }))}
                            className={`${ui.input} ${formTouched && !formData.departmentNameTh ? "border-red-400" : ""}`}
                        />
                    </FormField>
                    <FormField label={t('Department Name (EN)', 'Department Name (EN)')} required error={formTouched && !formData.departmentNameEn ? "* Department Name (EN) Required" : undefined}>
                        <input
                            type="text"
                            value={formData.departmentNameEn}
                            onChange={(e) => setFormData((p) => ({ ...p, departmentNameEn: e.target.value }))}
                            className={`${ui.input} ${formTouched && !formData.departmentNameEn ? "border-red-400" : ""}`}
                        />
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
