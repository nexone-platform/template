"use client";

import { useState, useMemo, useCallback } from "react";
import {
    useTrainingLists,
    useTrainingTypes,
    useTrainers,
    useCreateTrainingList,
    useUpdateTrainingList,
    useDeleteTrainingList,
    TrainingListDto
} from "@/hooks/use-training";
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

type AnyRow = Record<string, any>;

export default function TrainingListsPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showWarning } = useMessages();

    const exportColumns: ExportColumn[] = useMemo(() => [
        { header: "#", key: "_index" },
        { header: t('Training Type', 'Training Type'), key: "trainingType" },
        { header: t('Trainer', 'Trainer'), key: "trainer" },
        { header: t('Employee', 'Employee'), key: "employee" },
        { header: t('Cost', 'Cost'), key: "cost" },
        { header: t('Start Date', 'Start Date'), key: "startDate", format: (v: any) => v ? new Date(v).toLocaleDateString("en-GB") : "" },
        { header: t('End Date', 'End Date'), key: "endDate", format: (v: any) => v ? new Date(v).toLocaleDateString("en-GB") : "" },
        { header: t('Description', 'Description'), key: "description" },
        { header: t('Status', 'Status'), key: "status" },
    ], [t]);

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "trainingType", label: t('Training Type', 'Training Type'), sortable: true },
    { key: "trainer", label: t('Trainer', 'Trainer'), sortable: true },
    { key: "employee", label: t('Employee', 'Employee'), sortable: true },
    { key: "cost", label: t('Cost', 'Cost'), sortable: true },
    { key: "startDate", label: t('Start Date', 'Start Date'), sortable: true },
    { key: "endDate", label: t('End Date', 'End Date'), sortable: true },
    { key: "status", label: t('Status', 'Status') },
    { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ];

    const { data: trainingLists, isLoading } = useTrainingLists();
    const { data: trainingTypes } = useTrainingTypes();
    const { data: trainers } = useTrainers();

    const createMutation = useCreateTrainingList();
    const updateMutation = useUpdateTrainingList();
    const deleteMutation = useDeleteTrainingList();

    const [searchText, setSearchText] = useState("");
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [pageSize, setPageSize] = useState(10);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState<TrainingListDto | null>(null);
    const [formData, setFormData] = useState<Partial<TrainingListDto>>({
        trainingType: "",
        trainer: "",
        employee: "",
        cost: "",
        startDate: "",
        endDate: "",
        description: "",
        status: "Active",
    });

    const list: TrainingListDto[] = useMemo(() => trainingLists ?? [], [trainingLists]);

    const filtered = useMemo(() => {
        if (!searchText) return list;
        const q = searchText.toLowerCase();
        return list.filter(
            (d) =>
                d.trainingType?.toLowerCase().includes(q) ||
                d.trainer?.toLowerCase().includes(q) ||
                d.employee?.toLowerCase().includes(q) ||
                d.description?.toLowerCase().includes(q) ||
                d.status?.toLowerCase().includes(q) ||
                String(d.cost ?? "").toLowerCase().includes(q)
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
        setSelectedTraining(null);
        setFormData({ trainingType: "", trainer: "", employee: "", cost: "", startDate: "", endDate: "", description: "", status: "Active" });
        setModalOpen(true);
    };

    const openEdit = (item: TrainingListDto) => {
        setSelectedTraining(item);
        setFormData({
            trainingType: item.trainingType,
            trainer: item.trainer,
            employee: item.employee,
            cost: item.cost,
            startDate: item.startDate,
            endDate: item.endDate,
            description: item.description,
            status: item.status,
        });
        setModalOpen(true);
    };

    const handleSubmitForm = () => {
        if (selectedTraining) {
            updateMutation.mutate({ ...selectedTraining, ...formData }, {
                onSuccess: () => {
                    showSuccess('SAVE_SUCCESS', 'Success!', 'Training saved successfully.');
                    setModalOpen(false);
                },
                onError: () => showError('SAVE_ERROR', 'Error!', 'Failed to save training.'),
            });
        } else {
            createMutation.mutate(formData, {
                onSuccess: () => {
                    showSuccess('SAVE_SUCCESS', 'Success!', 'Training created successfully.');
                    setModalOpen(false);
                },
                onError: () => showError('SAVE_ERROR', 'Error!', 'Failed to create training.'),
            });
        }
    };

    const handleDelete = (id: number) => {
        showWarning('REQUIRED_FIELDS', 'Delete Training', 'Are you sure you want to delete this training record?').then((result) => {
            if (result.isConfirmed) deleteMutation.mutate(id);
        });
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        try { return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
        catch { return dateStr; }
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Training List', 'Training List')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard },
                    { label: t('Training List', 'Training List') },
                ]}
                actionLabel={t('Add', 'Add')}
                onAction={openAdd}
            />

            <ExportButtons
                data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))}
                columns={exportColumns}
                filenamePrefix="training_lists"
                pdfTitle={t('Training Lists', 'Training Lists')}
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
                                    paginatedData.map((d: TrainingListDto, idx: number) => (
                                        <tr key={d.id} className={selection.isSelected(d.id) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(d.id)} onChange={() => selection.toggle(d.id)} />
                                            <td className={ui.tdIndex}>{(currentPage - 1) * pageSize + idx + 1}</td>
                                            <td className={ui.tdBold}>{d.trainingType}</td>
                                            <td className={ui.td}>{d.trainer}</td>
                                            <td className={ui.td}>{d.employee}</td>
                                            <td className={ui.td}>{d.cost}</td>
                                            <td className={ui.td}>{formatDate(d.startDate)}</td>
                                            <td className={ui.td}>{formatDate(d.endDate)}</td>
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
                                    <EmptyState colSpan={10} />
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
                title={selectedTraining ? "Edit Training" : "Add Training"}
                maxWidth="max-w-lg"
                footer={
                    <button onClick={handleSubmitForm} disabled={updateMutation.isPending || createMutation.isPending} className={ui.btnPrimary}>
                        {updateMutation.isPending || createMutation.isPending ? "Saving..." : "Submit"}
                    </button>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Training Type', 'Training Type')} required>
                            <select value={formData.trainingType} onChange={(e) => setFormData((p) => ({ ...p, trainingType: e.target.value }))} className={ui.select}>
                                <option value="">{t('Select Type', 'Select Type')}</option>
                                {trainingTypes?.map((item) => (
                                    <option key={item.id} value={item.type}>{item.type}</option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label={t('Trainer', 'Trainer')} required>
                            <select value={formData.trainer} onChange={(e) => setFormData((p) => ({ ...p, trainer: e.target.value }))} className={ui.select}>
                                <option value="">{t('Select Trainer', 'Select Trainer')}</option>
                                {trainers?.map((item) => (
                                    <option key={item.id} value={item.name}>{item.name}</option>
                                ))}
                            </select>
                        </FormField>
                    </div>
                    <FormField label={t('Employee', 'Employee')} required>
                        <input type="text" value={formData.employee} onChange={(e) => setFormData((p) => ({ ...p, employee: e.target.value }))} className={ui.input} placeholder="Enter employee name" />
                    </FormField>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Cost', 'Cost')}>
                            <input type="number" value={formData.cost} onChange={(e) => setFormData((p) => ({ ...p, cost: e.target.value }))} className={ui.input} placeholder="0" />
                        </FormField>
                        <FormField label={t('Status', 'Status')}>
                            <select value={formData.status} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))} className={ui.select}>
                                <option value="Active">{t('Active', 'Active')}</option>
                                <option value="Inactive">{t('Inactive', 'Inactive')}</option>
                            </select>
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Start Date', 'Start Date')} required>
                            <input type="date" value={formData.startDate} onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))} className={ui.input} />
                        </FormField>
                        <FormField label={t('End Date', 'End Date')} required>
                            <input type="date" value={formData.endDate} onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))} className={ui.input} />
                        </FormField>
                    </div>
                    <FormField label={t('Description', 'Description')}>
                        <textarea value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} className={ui.textarea} placeholder="Enter description" rows={3} />
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
