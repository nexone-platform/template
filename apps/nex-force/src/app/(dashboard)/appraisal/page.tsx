"use client";

import { useEffect,  useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import {
    usePerformanceAppraisals,
    useCreateAppraisal,
    useUpdateAppraisal,
    useDeleteAppraisal,
    PerformanceAppraisalDto
} from "@/hooks/use-performance";
import { useMessages } from "@/hooks/use-messages";
import { ROUTES } from "@/lib/routes";
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

export default function AppraisalPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showWarning } = useMessages();

    const exportColumns: ExportColumn[] = useMemo(() => [
        { header: "#", key: "_index" },
        { header: t('Employee', 'Employee'), key: "employee" },
        { header: t('Department', 'Department'), key: "department" },
        { header: t('Designation', 'Designation'), key: "designation" },
        { header: t('Appraisal Date', 'Appraisal Date'), key: "appraisalDate" },
        { header: t('Status', 'Status'), key: "status" },
    ], [t]);

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "employee", label: t('Employee', 'Employee'), sortable: true },
    { key: "department", label: t('Department', 'Department'), sortable: true },
    { key: "designation", label: t('Designation', 'Designation'), sortable: true },
    { key: "appraisalDate", label: t('Appraisal Date', 'Appraisal Date'), sortable: true },
    { key: "status", label: t('Status', 'Status') },
    { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ];

    const { data: appraisals, isLoading } = usePerformanceAppraisals();
    const createMutation = useCreateAppraisal();
    const updateMutation = useUpdateAppraisal();
    const deleteMutation = useDeleteAppraisal();

    // ── Master data from DB ──
    const { data: employeeOptions } = useQuery({
        queryKey: ["apEmployees"],
        queryFn: async () => { const { data } = await apiClient.get<any>("employees/getEmployeeForSelect"); return data?.data || []; },
    });
    const { data: designationOptions } = useQuery({
        queryKey: ["apDesignations"],
        queryFn: async () => { const { data } = await apiClient.get<any>("designations/getAllDesignation"); return data?.data || []; },
    });
    const { data: departmentOptions } = useQuery({
        queryKey: ["apDepartments"],
        queryFn: async () => { const { data } = await apiClient.get<any>("departments/getAllDepartment"); return data?.data || []; },
    });

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
    const [selectedAppraisal, setSelectedAppraisal] = useState<PerformanceAppraisalDto | null>(null);
    const [formData, setFormData] = useState<Partial<PerformanceAppraisalDto>>({
        employee: "",
        department: "",
        designation: "",
        appraisalDate: "",
        status: "Active",
    });

    const list: PerformanceAppraisalDto[] = useMemo(() => appraisals ?? [], [appraisals]);

    const filtered = useMemo(() => {
        if (!searchText) return list;
        const q = searchText.toLowerCase();
        return list.filter(
            (d) =>
                d.employee?.toLowerCase().includes(q) ||
                d.department?.toLowerCase().includes(q) ||
                d.designation?.toLowerCase().includes(q)
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
        setSelectedAppraisal(null);
        setFormData({ employee: "", department: "", designation: "", appraisalDate: "", status: "Active" });
        setModalOpen(true);
    };

    const openEdit = (item: PerformanceAppraisalDto) => {
        setSelectedAppraisal(item);
        setFormData({
            employee: item.employee,
            department: item.department,
            designation: item.designation,
            appraisalDate: item.appraisalDate,
            status: item.status,
        });
        setModalOpen(true);
    };

    const handleSubmitForm = () => {
        if (selectedAppraisal) {
            updateMutation.mutate({ ...selectedAppraisal, ...formData } as PerformanceAppraisalDto, {
                onSuccess: () => {
                    showSuccess('SAVE_SUCCESS', 'Success!', 'Appraisal updated successfully.');
                    setModalOpen(false);
                },
                onError: () => showError('SAVE_ERROR', 'Error!', 'Failed to update appraisal.'),
            });
        } else {
            createMutation.mutate(formData, {
                onSuccess: () => {
                    showSuccess('SAVE_SUCCESS', 'Success!', 'Appraisal created successfully.');
                    setModalOpen(false);
                },
                onError: () => showError('SAVE_ERROR', 'Error!', 'Failed to create appraisal.'),
            });
        }
    };

    const handleDelete = (id: number) => {
        showWarning('REQUIRED_FIELDS', 'Delete Appraisal', 'Are you sure you want to delete?').then((result) => {
            if (result.isConfirmed) deleteMutation.mutate(id);
        });
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Appraisal', 'Appraisal')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard },
                    { label: t('Appraisal', 'Appraisal') },
                ]}
                actionLabel={t('Add', 'Add')}
                onAction={openAdd}
            />

            <ExportButtons
                data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))}
                columns={exportColumns}
                filenamePrefix="appraisals"
                pdfTitle={t('Appraisals', 'Appraisals')}
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
                                    paginatedData.map((d: PerformanceAppraisalDto, idx: number) => (
                                        <tr key={d.id} className={selection.isSelected(d.id) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(d.id)} onChange={() => selection.toggle(d.id)} />
                                            <td className={ui.tdIndex}>{(currentPage - 1) * pageSize + idx + 1}</td>
                                            <td className={ui.tdBold}>{d.employee}</td>
                                            <td className={ui.td}>{d.department}</td>
                                            <td className={ui.td}>{d.designation}</td>
                                            <td className={ui.td}>{d.appraisalDate}</td>
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
                title={selectedAppraisal ? "Edit Appraisal" : "Add Appraisal"}
                maxWidth="max-w-lg"
                footer={
                    <button onClick={handleSubmitForm} disabled={updateMutation.isPending || createMutation.isPending} className={ui.btnPrimary}>
                        {updateMutation.isPending || createMutation.isPending ? "Saving..." : "Submit"}
                    </button>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Employee', 'Employee')} required>
                            <select value={formData.employee} onChange={(e) => setFormData((p) => ({ ...p, employee: e.target.value }))} className={ui.select}>
                                <option value="">{t('Select Employee', 'Select Employee')}</option>
                                {(employeeOptions || []).map((e: any) => (
                                    <option key={e.id} value={`${e.firstNameEn} ${e.lastNameEn}`}>{e.firstNameEn} {e.lastNameEn}</option>
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
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Designation', 'Designation')}>
                            <select value={formData.designation} onChange={(e) => setFormData((p) => ({ ...p, designation: e.target.value }))} className={ui.select}>
                                <option value="">{t('Select Designation', 'Select Designation')}</option>
                                {(designationOptions || []).map((d: any) => (
                                    <option key={d.designationId} value={d.designationNameEn}>{d.designationNameEn}</option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label={t('Appraisal Date', 'Appraisal Date')} required>
                            <input type="date" value={formData.appraisalDate} onChange={(e) => setFormData((p) => ({ ...p, appraisalDate: e.target.value }))} className={ui.input} />
                        </FormField>
                    </div>
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
