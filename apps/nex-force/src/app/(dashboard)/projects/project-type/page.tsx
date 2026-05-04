"use client";

import { useEffect,  useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { getUserProfile } from "@/lib/auth";
import { useMessages } from "@/hooks/use-messages";
import { ROUTES } from "@/lib/routes";
import ExportButtons from "@/components/ExportButtons";
import ImportExcelButton from "@/components/ImportExcelButton";
import type { ExportColumn } from "@/lib/table-export";
import {
    PageHeader, TableHeaderBar, SortableTh, ActionButtons,
    EmptyState, LoadingSpinner, PaginationBar, ModalWrapper, FormField, ui, SelectAllCheckbox, RowCheckbox,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";
import { useRowSelection } from "@/hooks/use-row-selection";
import { useSystemConfig } from '@nexone/ui';

interface ProjectType {
    projectTypeId: number;
    projectTypeCode: string;
    projectTypeNameTh: string;
    projectTypeNameEn: string;
}

export default function ProjectTypePage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showWarning } = useMessages();
    const queryClient = useQueryClient();

    const exportColumns: ExportColumn[] = useMemo(() => [
        { header: "#", key: "_index" },
        { header: t('Project Type Code', 'Project Type Code'), key: "projectTypeCode" },
        { header: t('Project Type Name (TH)', 'Project Type Name (TH)'), key: "projectTypeNameTh" },
        { header: t('Project Type Name (EN)', 'Project Type Name (EN)'), key: "projectTypeNameEn" },
    ], [t]);

    const tableColumns = useMemo(() => [
        { key: "#", label: "#", width: "w-14" },
        { key: "projectTypeCode", label: t('Project Type Code', 'Project Type Code'), sortable: true },
        { key: "projectTypeNameTh", label: t('Project Type Name (TH)', 'Project Type Name (TH)'), sortable: true },
        { key: "projectTypeNameEn", label: t('Project Type Name (EN)', 'Project Type Name (EN)'), sortable: true },
        { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ], [t]);
    const userProfile = getUserProfile();

    const { data: projectTypes, isLoading } = useQuery({
        queryKey: ["projectTypes"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("projects/getProjectType");
            const result = data?.data;
            return Array.isArray(result) ? (result as ProjectType[]) : [];
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await apiClient.post<any>("projects/projectType/update", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projectTypes"] });
            showSuccess('SAVE_SUCCESS', 'Success!', 'Project type saved successfully.');
            setModalOpen(false);
            resetForm();
        },
        onError: () => { showError('SAVE_ERROR', 'Error!', 'Error saving Project.'); },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete<any>(`projects/projectType/delete?id=${id}`);
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["projectTypes"] });
            showSuccess('SAVE_SUCCESS', 'Success!', res?.message || "Deleted successfully.");
        },
        onError: () => { showError('SAVE_ERROR', 'Error!', 'Error deleting project type'); },
    });

    const [modalOpen, setModalOpen] = useState(false);
    const [mode, setMode] = useState<"add" | "edit">("add");
    const [touched, setTouched] = useState(false);
    const [formData, setFormData] = useState({
        projectTypeId: null as number | null,
        projectTypeCode: "",
        projectTypeNameTh: "",
        projectTypeNameEn: "",
    });

    const [searchText, setSearchText] = useState("");
    const { configs, loading: configLoading } = useSystemConfig();
    const [hasSetDefaultPageSize, setHasSetDefaultPageSize] = useState(false);

    useEffect(() => {
        if (!configLoading && configs?.pageRecordDefault && !hasSetDefaultPageSize) {
            setPageSize(configs.pageRecordDefault);
            setHasSetDefaultPageSize(true);
        }
    }, [configLoading, configs?.pageRecordDefault, hasSetDefaultPageSize]);
    const [pageSize, setPageSize] = useState(configs?.pageRecordDefault || 10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const resetForm = () => {
        setFormData({ projectTypeId: null, projectTypeCode: "", projectTypeNameTh: "", projectTypeNameEn: "" });
        setTouched(false);
    };

    const openAdd = () => { setMode("add"); resetForm(); setModalOpen(true); };

    const openEdit = (item: ProjectType) => {
        setMode("edit");
        setFormData({
            projectTypeId: item.projectTypeId,
            projectTypeCode: item.projectTypeCode,
            projectTypeNameTh: item.projectTypeNameTh,
            projectTypeNameEn: item.projectTypeNameEn,
        });
        setTouched(false);
        setModalOpen(true);
    };

    const handleSubmitForm = () => {
        setTouched(true);
        if (!formData.projectTypeCode || !formData.projectTypeNameTh || !formData.projectTypeNameEn) return;
        updateMutation.mutate({ ...formData, username: userProfile });
    };

    const handleDelete = (id: number) => {
        showWarning('REQUIRED_FIELDS', 'Delete Project Type', 'Are you sure want to delete?').then((result) => { if (result.isConfirmed) deleteMutation.mutate(id); });
    };

    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
    };

    const filtered = useMemo(() => {
        const allItems: ProjectType[] = projectTypes || [];
        if (!searchText) return allItems;
        const term = searchText.toLowerCase();
        return allItems.filter((item) =>
            item.projectTypeCode?.toLowerCase().includes(term) ||
            item.projectTypeNameTh?.toLowerCase().includes(term) ||
            item.projectTypeNameEn?.toLowerCase().includes(term)
        );
    }, [projectTypes, searchText]);

    const sorted = useMemo(() => {
        if (!sortKey) return filtered;
        return [...filtered].sort((a: any, b: any) => {
            const aVal = a[sortKey] ?? "";
            const bVal = b[sortKey] ?? "";
            return (aVal < bVal ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
        });
    }, [filtered, sortKey, sortDir]);

    const totalData = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalData / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const sortedArray = Array.isArray(sorted) ? sorted : [];
    const paginatedData = sortedArray.slice(startIndex, startIndex + pageSize);

    const selection = useRowSelection(paginatedData, (row) => row.projectTypeId);

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Project Type', 'Project Type')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard }, { label: t('Project Type', 'Project Type') }]}
                actionLabel={t('Add', 'Add')}
                onAction={openAdd}
            />

            <div className="flex flex-wrap items-center gap-3">
                <ExportButtons
                    data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))}
                    columns={exportColumns}
                    filenamePrefix="project_types"
                    pdfTitle={t('Project Types', 'Project Types')}
                    totalCount={sorted.length}
                />
                <ImportExcelButton
                    columns={[
                        { header: "Project Type Code", key: "projectTypeCode", required: true },
                        { header: "Project Type Name (TH)", key: "projectTypeNameTh", required: true },
                        { header: "Project Type Name (EN)", key: "projectTypeNameEn", required: true },
                    ]}
                    filenamePrefix="project_types"
                    onImport={async (rows) => {
                        let success = 0, failed = 0;
                        for (const row of rows) {
                            try {
                                await apiClient.post("projects/projectType/update", {
                                    projectTypeId: 0,
                                    projectTypeCode: row.projectTypeCode ?? "",
                                    projectTypeNameTh: row.projectTypeNameTh ?? "",
                                    projectTypeNameEn: row.projectTypeNameEn ?? "",
                                    username: userProfile,
                                });
                                success++;
                            } catch { failed++; }
                        }
                        return { success, failed };
                    }}
                    onImportComplete={() => queryClient.invalidateQueries({ queryKey: ["projectTypes"] })}
                />
            </div>

            <div className={ui.tableWrapper}>
                <TableHeaderBar
                    pageSize={pageSize}
                    onPageSizeChange={(v) => { setPageSize(v); setCurrentPage(1); }}
                    searchText={searchText}
                    onSearchChange={(v) => { setSearchText(v); setCurrentPage(1); }}
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
                                    paginatedData.map((item, idx) => (
                                        <tr key={item.projectTypeId} className={selection.isSelected(item.projectTypeId) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(item.projectTypeId)} onChange={() => selection.toggle(item.projectTypeId)} />
                                            <td className={ui.tdIndex}>{startIndex + idx + 1}</td>
                                            <td className={ui.tdBold}>{item.projectTypeCode}</td>
                                            <td className={ui.td}>{item.projectTypeNameTh}</td>
                                            <td className={ui.td}>{item.projectTypeNameEn}</td>
                                            <td className={ui.tdActions}>
                                                <ActionButtons onEdit={() => openEdit(item)} onDelete={() => handleDelete(item.projectTypeId)} />
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
                    currentPage={safePage} totalPages={totalPages} totalData={totalData}
                    pageSize={pageSize} onGoToPage={setCurrentPage}
                />
            </div>

            <ModalWrapper
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={t('Project Type', 'Project Type')}
                maxWidth="max-w-md"
                footer={
                    <>
                        <button onClick={() => setModalOpen(false)} className={ui.btnSecondary}>{t('Cancel', 'Cancel')}</button>
                        <button onClick={handleSubmitForm} disabled={updateMutation.isPending} className={ui.btnPrimary}>
                            {updateMutation.isPending ? "Saving..." : "Submit"}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <FormField label={t('Project Type Code', 'Project Type Code')} required error={touched && !formData.projectTypeCode ? "* Required" : undefined}>
                        <input type="text" value={formData.projectTypeCode} onChange={(e) => setFormData({ ...formData, projectTypeCode: e.target.value })}
                            className={`${ui.input} ${touched && !formData.projectTypeCode ? "border-red-400" : ""}`} disabled={mode === "edit"} />
                    </FormField>
                    <FormField label={t('Project Type Name (TH)', 'Project Type Name (TH)')} required error={touched && !formData.projectTypeNameTh ? "* Required" : undefined}>
                        <input type="text" value={formData.projectTypeNameTh} onChange={(e) => setFormData({ ...formData, projectTypeNameTh: e.target.value })}
                            className={`${ui.input} ${touched && !formData.projectTypeNameTh ? "border-red-400" : ""}`} />
                    </FormField>
                    <FormField label={t('Project Type Name (EN)', 'Project Type Name (EN)')} required error={touched && !formData.projectTypeNameEn ? "* Required" : undefined}>
                        <input type="text" value={formData.projectTypeNameEn} onChange={(e) => setFormData({ ...formData, projectTypeNameEn: e.target.value })}
                            className={`${ui.input} ${touched && !formData.projectTypeNameEn ? "border-red-400" : ""}`} />
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
