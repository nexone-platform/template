"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { useMessages } from "@/hooks/use-messages";
import { ROUTES } from "@/lib/routes";
import { designationService, departmentService } from "@/services/organization.service";
import { usePagination } from "@/hooks/use-pagination";
import type { Designation, Department } from "@/types/employee";
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



export default function DesignationsPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showWarning } = useMessages();

    const tableColumns = useMemo(() => [
        { key: "#", label: "#", width: "w-14" },
        { key: "designationCode", label: t('Designation Code', 'Designation Code'), sortable: true },
        { key: "departmentNameTh", label: t('Department Name (TH)', 'Department Name (TH)'), sortable: true },
        { key: "departmentNameEn", label: t('Department Name (EN)', 'Department Name (EN)'), sortable: true },
        { key: "designationNameTh", label: t('Designation Name (TH)', 'Designation Name (TH)'), sortable: true },
        { key: "designationNameEn", label: t('Designation Name (EN)', 'Designation Name (EN)'), sortable: true },
        { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ], [t]);

    type AnyRow = Record<string, any>;

    const exportColumns: ExportColumn[] = useMemo(() => [
    { header: "#", key: "_index" },
    { header: t('Designation Code', 'Designation Code'), key: "designationCode" },
    { header: t('Department Name (TH)', 'Department Name (TH)'), key: "departmentNameTh" },
    { header: t('Department Name (EN)', 'Department Name (EN)'), key: "departmentNameEn" },
    { header: t('Designation Name (TH)', 'Designation Name (TH)'), key: "designationNameTh" },
    { header: t('Designation Name (EN)', 'Designation Name (EN)'), key: "designationNameEn" },
    ], [t]);
    const queryClient = useQueryClient();

    const { data: desigResult, isLoading } = useQuery({
        queryKey: ["designations"],
        queryFn: designationService.getAll,
    });
    const designations: Designation[] = useMemo(() => desigResult?.data ?? [], [desigResult]);

    const { data: deptResult } = useQuery({
        queryKey: ["departments"],
        queryFn: departmentService.getAll,
    });
    const departments: Department[] = useMemo(() => deptResult?.data ?? [], [deptResult]);

    const [searchText, setSearchText] = useState("");
    const [filterCode, setFilterCode] = useState("");
    const [filterName, setFilterName] = useState("");
    const [filterDeptId, setFilterDeptId] = useState<number | null>(null);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [pageSize, setPageSize] = useState(10);

    const [modalOpen, setModalOpen] = useState(false);
    const [formTouched, setFormTouched] = useState(false);
    const [formData, setFormData] = useState({
        designationId: 0,
        designationCode: "",
        designationNameTh: "",
        designationNameEn: "",
        departmentId: "",
    });

    const filtered = useMemo(() => {
        let result = designations;
        if (filterCode) {
            const q = filterCode.toLowerCase();
            result = result.filter((d) => d.designationCode?.toLowerCase().includes(q));
        }
        if (filterName) {
            const q = filterName.toLowerCase();
            result = result.filter(
                (d) => d.designationNameTh?.toLowerCase().includes(q) || d.designationNameEn?.toLowerCase().includes(q)
            );
        }
        if (filterDeptId) {
            result = result.filter((d) => d.departmentId === filterDeptId);
        }
        if (searchText) {
            const q = searchText.toLowerCase();
            result = result.filter(
                (d) =>
                    d.designationCode?.toLowerCase().includes(q) ||
                    d.designationNameTh?.toLowerCase().includes(q) ||
                    d.designationNameEn?.toLowerCase().includes(q) ||
                    d.departmentNameTh?.toLowerCase().includes(q) ||
                    d.departmentNameEn?.toLowerCase().includes(q)
            );
        }
        return result;
    }, [designations, filterCode, filterName, filterDeptId, searchText]);

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
    const getRowId = useCallback((d: any) => d.designationId, []);
    const selection = useRowSelection(paginatedData, getRowId);
    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    const updateMutation = useMutation({
        mutationFn: designationService.update,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["designations"] });
            showSuccess('SAVE_SUCCESS', 'Success!', 'Designation saved successfully.');
            setModalOpen(false);
        },
        onError: (error: any) => {
            const msg = error?.error?.message || error?.message || "Something went wrong.";
            showError('SAVE_ERROR', 'Error!', msg);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: designationService.delete,
        onSuccess: (res: any) => {
            queryClient.invalidateQueries({ queryKey: ["designations"] });
            showSuccess('SAVE_SUCCESS', 'Success!', res?.message || "Deleted successfully.");
        },
        onError: () => { showError('SAVE_ERROR', 'Error!', 'Error deleting designation'); },
    });

    const openAdd = () => {
        setFormData({ designationId: 0, designationCode: "", designationNameTh: "", designationNameEn: "", departmentId: "" });
        setFormTouched(false);
        setModalOpen(true);
    };

    const openEdit = (d: Designation) => {
        setFormData({
            designationId: d.designationId,
            designationCode: d.designationCode ?? "",
            designationNameTh: d.designationNameTh ?? "",
            designationNameEn: d.designationNameEn ?? "",
            departmentId: d.departmentId ? String(d.departmentId) : "",
        });
        setFormTouched(false);
        setModalOpen(true);
    };

    const handleSubmitForm = () => {
        setFormTouched(true);
        if (!formData.designationCode || !formData.designationNameTh || !formData.designationNameEn || !formData.departmentId) return;
        const payload: Designation = {
            designationId: formData.designationId,
            designationCode: formData.designationCode,
            designationNameTh: formData.designationNameTh,
            designationNameEn: formData.designationNameEn,
            departmentId: Number(formData.departmentId),
            isActive: true,
            departmentNameTh: "",
            departmentNameEn: "",
        };
        updateMutation.mutate(payload);
    };

    const handleDelete = (id: number) => {
        showWarning('REQUIRED_FIELDS', 'Delete Designation', 'Are you sure you want to delete?').then((result) => { if (result.isConfirmed) deleteMutation.mutate(id); });
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Designations', 'Designations')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard },
                    { label: t('Designations', 'Designations') },
                ]}
                actionLabel={t('Add', 'Add')}
                onAction={openAdd}
            />

            {/* Search Filter Form */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField label={t('Designation Code', 'Designation Code')}>
                        <input type="text" value={filterCode} onChange={(e) => setFilterCode(e.target.value)} className={ui.input} placeholder="e.g. DEV" />
                    </FormField>
                    <FormField label={t('Designation Name', 'Designation Name')}>
                        <input type="text" value={filterName} onChange={(e) => setFilterName(e.target.value)} className={ui.input} placeholder="e.g. Developer" />
                    </FormField>
                    <FormField label={t('Department', 'Department')}>
                        <select value={filterDeptId ?? ""} onChange={(e) => setFilterDeptId(e.target.value ? Number(e.target.value) : null)} className={ui.select}>
                            <option value="">{t('All Departments', 'All Departments')}</option>
                            {departments.map((d) => (
                                <option key={d.departmentId} value={d.departmentId}>{d.departmentCode}: {d.departmentNameTh}</option>
                            ))}
                        </select>
                    </FormField>
                    <div className="flex items-end gap-3">
                        <button type="button" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-nv-violet text-white text-sm font-medium rounded-lg hover:bg-nv-violet-dark transition-colors">
                            <Search className="w-4 h-4" /> Search
                        </button>
                        <button type="button" onClick={() => { setFilterCode(""); setFilterName(""); setFilterDeptId(null); }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                            <X className="w-4 h-4" /> Clear
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <ExportButtons
                    data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))}
                    columns={exportColumns}
                    filenamePrefix="designations"
                    pdfTitle={t('Designations', 'Designations')}
                    totalCount={sorted.length}
                    selectedData={selection.getSelectedRows(sorted)}
                    selectedCount={selection.selectedCount}
                    onClearSelection={selection.clearSelection}
                />
                <ImportExcelButton
                    columns={[
                        { header: "Designation Code", key: "designationCode", required: true },
                        { header: "Designation Name (TH)", key: "designationNameTh", required: true },
                        { header: "Designation Name (EN)", key: "designationNameEn", required: true },
                        { header: "Department ID", key: "departmentId", required: true },
                    
                        { header: "Department Name (TH)", key: "departmentNameTh" },
                        { header: "Department Name (EN)", key: "departmentNameEn" },]}
                    filenamePrefix="designations"
                    onImport={(rows) => designationService.bulkImport(rows)}
                    onImportComplete={() => queryClient.invalidateQueries({ queryKey: ["designations"] })}
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
                                    paginatedData.map((d: Designation, idx: number) => (
                                        <tr key={d.designationId} className={selection.isSelected(d.designationId) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(d.designationId)} onChange={() => selection.toggle(d.designationId)} />
                                            <td className={ui.tdIndex}>{(currentPage - 1) * pageSize + idx + 1}</td>
                                            <td className={ui.td}>{d.designationCode}</td>
                                            <td className={ui.td}>{d.departmentNameTh}</td>
                                            <td className={ui.td}>{d.departmentNameEn}</td>
                                            <td className={ui.td}>{d.designationNameTh}</td>
                                            <td className={ui.td}>{d.designationNameEn}</td>
                                            <td className={ui.tdActions}>
                                                <ActionButtons onEdit={() => openEdit(d)} onDelete={() => handleDelete(d.designationId)} />
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
                    currentPage={currentPage} totalPages={totalPages} totalData={sorted.length}
                    pageSize={pageSize} onGoToPage={goToPage}
                />
            </div>

            <ModalWrapper
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={t('Designation Detail', 'Designation Detail')}
                maxWidth="max-w-md"
                footer={
                    <button onClick={handleSubmitForm} disabled={updateMutation.isPending} className={ui.btnPrimary}>
                        {updateMutation.isPending ? "Saving..." : "Submit"}
                    </button>
                }
            >
                <div className="space-y-4">
                    <FormField label={t('Designation Code', 'Designation Code')} required error={formTouched && !formData.designationCode ? "* Required" : undefined}>
                        <input type="text" value={formData.designationCode} onChange={(e) => setFormData((p) => ({ ...p, designationCode: e.target.value }))}
                            className={`${ui.input} ${formTouched && !formData.designationCode ? "border-red-400" : ""}`} />
                    </FormField>
                    <FormField label={t('Designation Name (TH)', 'Designation Name (TH)')} required error={formTouched && !formData.designationNameTh ? "* Required" : undefined}>
                        <input type="text" value={formData.designationNameTh} onChange={(e) => setFormData((p) => ({ ...p, designationNameTh: e.target.value }))}
                            className={`${ui.input} ${formTouched && !formData.designationNameTh ? "border-red-400" : ""}`} />
                    </FormField>
                    <FormField label={t('Designation Name (EN)', 'Designation Name (EN)')} required error={formTouched && !formData.designationNameEn ? "* Required" : undefined}>
                        <input type="text" value={formData.designationNameEn} onChange={(e) => setFormData((p) => ({ ...p, designationNameEn: e.target.value }))}
                            className={`${ui.input} ${formTouched && !formData.designationNameEn ? "border-red-400" : ""}`} />
                    </FormField>
                    <FormField label={t('Department', 'Department')} required error={formTouched && !formData.departmentId ? "* Required" : undefined}>
                        <select value={formData.departmentId} onChange={(e) => setFormData((p) => ({ ...p, departmentId: e.target.value }))}
                            className={`${ui.select} ${formTouched && !formData.departmentId ? "border-red-400" : ""}`}>
                            <option value="">{t('Select Department', 'Select Department')}</option>
                            {departments.map((d) => (
                                <option key={d.departmentId} value={d.departmentId}>{d.departmentCode}: {d.departmentNameTh}</option>
                            ))}
                        </select>
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
