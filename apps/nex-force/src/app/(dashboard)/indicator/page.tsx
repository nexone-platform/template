"use client";

import { useEffect,  useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import {
    usePerformanceIndicators,
    useCreateIndicator,
    useUpdateIndicator,
    useDeleteIndicator,
    PerformanceIndicatorDto
} from "@/hooks/use-performance";
import { useMessages } from "@/hooks/use-messages";
import { ROUTES } from "@/lib/routes";
import { getUserProfile } from "@/lib/auth";
import { usePagination } from "@/hooks/use-pagination";
import { useRowSelection } from "@/hooks/use-row-selection";
import ExportButtons from "@/components/ExportButtons";
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
import { useSystemConfig } from '@nexone/ui';

type AnyRow = Record<string, any>;

export default function PerformanceIndicatorPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showWarning } = useMessages();

    const exportColumns: ExportColumn[] = useMemo(() => [
        { header: "#", key: "_index" },
        { header: t('Designation', 'Designation'), key: "designation" },
        { header: t('Department', 'Department'), key: "department" },
        { header: t('Experience', 'Experience'), key: "experience" },
        { header: t('Added By', 'Added By'), key: "addedBy" },
        { header: t('Created', 'Created'), key: "createdBy" },
        { header: t('Status', 'Status'), key: "status" },
    ], [t]);

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "designation", label: t('Designation', 'Designation'), sortable: true },
    { key: "department", label: t('Department', 'Department'), sortable: true },
    { key: "experience", label: t('Experience', 'Experience'), sortable: true },
    { key: "addedBy", label: t('Added By', 'Added By'), sortable: true },
    { key: "createdBy", label: t('Created', 'Created'), sortable: true },
    { key: "status", label: t('Status', 'Status') },
    { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ];

    const userProfile = getUserProfile();

    // ── Master data from DB ──
    const { data: designationOptions } = useQuery({
        queryKey: ["piDesignations"],
        queryFn: async () => { const { data } = await apiClient.get<any>("designations/getAllDesignation"); return data?.data || []; },
    });
    const { data: departmentOptions } = useQuery({
        queryKey: ["piDepartments"],
        queryFn: async () => { const { data } = await apiClient.get<any>("departments/getAllDepartment"); return data?.data || []; },
    });

    const { data: indicators, isLoading } = usePerformanceIndicators();
    const createMutation = useCreateIndicator();
    const updateMutation = useUpdateIndicator();
    const deleteMutation = useDeleteIndicator();

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
    const [selectedIndicator, setSelectedIndicator] = useState<PerformanceIndicatorDto | null>(null);
    const [formData, setFormData] = useState<Partial<PerformanceIndicatorDto>>({
        designation: "",
        department: "",
        status: "Active",
        experience: "Beginner",
    });

    const list: PerformanceIndicatorDto[] = useMemo(() => indicators ?? [], [indicators]);

    const filtered = useMemo(() => {
        if (!searchText) return list;
        const q = searchText.toLowerCase();
        return list.filter(
            (d) =>
                d.designation?.toLowerCase().includes(q) ||
                d.department?.toLowerCase().includes(q) ||
                d.experience?.toLowerCase().includes(q) ||
                d.addedBy?.toLowerCase().includes(q) ||
                d.createdBy?.toLowerCase().includes(q) ||
                d.status?.toLowerCase().includes(q)
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
        paginatedData,
        currentPage,
        totalPages,
        goToPage,
        changePageSize: changePgSize,
    } = usePagination(sorted, { pageSize });


    // ── Row Selection ──
    const getRowId = useCallback((d: any) => d.id, []);
    const selection = useRowSelection(paginatedData, getRowId);
    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    const openAdd = () => {
        setSelectedIndicator(null);
        setFormData({ designation: "", department: "", status: "Active", experience: "Beginner" });
        setModalOpen(true);
    };

    const openEdit = (item: PerformanceIndicatorDto) => {
        setSelectedIndicator(item);
        setFormData({
            designation: item.designation,
            department: item.department,
            status: item.status,
            experience: item.experience,
        });
        setModalOpen(true);
    };

    const handleSubmitForm = () => {
        if (selectedIndicator) {
            updateMutation.mutate({ ...selectedIndicator, ...formData }, {
                onSuccess: () => {
                    showSuccess('SAVE_SUCCESS', 'Success!', 'Indicator saved successfully.');
                    setModalOpen(false);
                },
                onError: () => showError('SAVE_ERROR', 'Error!', 'Failed to save indicator.'),
            });
        } else {
            const addedBy = userProfile || "Admin";
            const createdBy = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
            createMutation.mutate({ ...formData, addedBy, createdBy }, {
                onSuccess: () => {
                    showSuccess('SAVE_SUCCESS', 'Success!', 'Indicator created successfully.');
                    setModalOpen(false);
                },
                onError: () => showError('SAVE_ERROR', 'Error!', 'Failed to create indicator.'),
            });
        }
    };

    const handleDelete = (id: number) => {
        showWarning('REQUIRED_FIELDS', 'Delete Indicator', 'Are you sure you want to delete?').then((result) => {
            if (result.isConfirmed) deleteMutation.mutate(id);
        });
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Performance Indicator', 'Performance Indicator')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard },
                    { label: t('Performance Indicator', 'Performance Indicator') },
                ]}
                actionLabel={t('Add', 'Add')}
                onAction={openAdd}
            />

            <ExportButtons
                data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))}
                columns={exportColumns}
                filenamePrefix="performance_indicators"
                pdfTitle={t('Performance Indicators', 'Performance Indicators')}
                totalCount={sorted.length}
                selectedData={selection.getSelectedRows(sorted)}
                selectedCount={selection.selectedCount}
                onClearSelection={selection.clearSelection}
            />

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
                                    paginatedData.map((d: PerformanceIndicatorDto, idx: number) => (
                                        <tr key={d.id} className={selection.isSelected(d.id) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(d.id)} onChange={() => selection.toggle(d.id)} />
                                            <td className={ui.tdIndex}>{(currentPage - 1) * pageSize + idx + 1}</td>
                                            <td className={ui.tdBold}>{d.designation}</td>
                                            <td className={ui.td}>{d.department}</td>
                                            <td className={ui.td}>{d.experience}</td>
                                            <td className={ui.td}>{d.addedBy}</td>
                                            <td className={ui.td}>{d.createdBy}</td>
                                            <td className={ui.td}>
                                                <StatusBadge status={d.status} variant={d.status === "Active" ? "success" : "danger"} />
                                            </td>
                                            <td className={ui.tdActions}>
                                                <ActionButtons
                                                    onEdit={() => openEdit(d)}
                                                    onDelete={() => handleDelete(d.id)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <EmptyState colSpan={9} />
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
                title={selectedIndicator ? "Edit Indicator" : "Add Indicator"}
                maxWidth="max-w-md"
                footer={
                    <button onClick={handleSubmitForm} disabled={updateMutation.isPending || createMutation.isPending} className={ui.btnPrimary}>
                        {updateMutation.isPending || createMutation.isPending ? "Saving..." : "Submit"}
                    </button>
                }
            >
                <div className="space-y-4">
                    <FormField label={t('Designation', 'Designation')} required>
                        <select value={formData.designation} onChange={(e) => setFormData((p) => ({ ...p, designation: e.target.value }))} className={ui.select}>
                            <option value="">{t('Select Designation', 'Select Designation')}</option>
                            {(designationOptions || []).map((d: any) => (
                                <option key={d.designationId} value={d.designationNameEn}>{d.designationNameEn}</option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label={t('Department', 'Department')} required>
                        <select value={formData.department} onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))} className={ui.select}>
                            <option value="">{t('Select Department', 'Select Department')}</option>
                            {(departmentOptions || []).map((d: any) => (
                                <option key={d.departmentId} value={d.departmentNameEn}>{d.departmentNameEn}</option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label={t('Experience Level', 'Experience Level')}>
                        <select value={formData.experience} onChange={(e) => setFormData((p) => ({ ...p, experience: e.target.value }))} className={ui.select}>
                            <option value="Beginner">{t('Beginner', 'Beginner')}</option>
                            <option value="Intermediate">{t('Intermediate', 'Intermediate')}</option>
                            <option value="Advanced">{t('Advanced', 'Advanced')}</option>
                            <option value="Expert">Expert / Leader</option>
                        </select>
                    </FormField>
                    <FormField label={t('Status', 'Status')}>
                        <select value={formData.status} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))} className={ui.select}>
                            <option value="Active">{t('Active', 'Active')}</option>
                            <option value="Inactive">{t('Inactive', 'Inactive')}</option>
                        </select>
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
