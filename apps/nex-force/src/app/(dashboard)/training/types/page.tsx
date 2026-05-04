"use client";

import { useEffect,  useState, useMemo, useCallback } from "react";
import {
    useTrainingTypes,
    TrainingTypeDto
} from "@/hooks/use-training";
import { toast } from "sonner";
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

export default function TrainingTypesPage() {
    const { t } = usePageTranslation();

    const exportColumns: ExportColumn[] = useMemo(() => [
        { header: "#", key: "_index" },
        { header: t('Type', 'Type'), key: "type" },
        { header: t('Description', 'Description'), key: "description" },
        { header: t('Status', 'Status'), key: "status" },
    ], [t]);

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "type", label: t('Type', 'Type'), sortable: true },
    { key: "description", label: t('Description', 'Description'), sortable: true },
    { key: "status", label: t('Status', 'Status') },
    { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ];

    const { data: trainingTypes, isLoading } = useTrainingTypes();

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
    const [selectedType, setSelectedType] = useState<TrainingTypeDto | null>(null);
    const [formData, setFormData] = useState<Partial<TrainingTypeDto>>({
        type: "",
        description: "",
        status: "Active",
    });

    const list: TrainingTypeDto[] = useMemo(() => trainingTypes ?? [], [trainingTypes]);

    const filtered = useMemo(() => {
        if (!searchText) return list;
        const q = searchText.toLowerCase();
        return list.filter(
            (d) =>
                d.type?.toLowerCase().includes(q) ||
                d.description?.toLowerCase().includes(q) ||
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
        setSelectedType(null);
        setFormData({ type: "", description: "", status: "Active" });
        setModalOpen(true);
    };

    const openEdit = (item: TrainingTypeDto) => {
        setSelectedType(item);
        setFormData({
            type: item.type,
            description: item.description,
            status: item.status,
        });
        setModalOpen(true);
    };

    const handleSubmitForm = () => {
        toast.info("Save function simulation (Mock)");
        setModalOpen(false);
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Training Type', 'Training Type')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard },
                    { label: t('Training Type', 'Training Type') },
                ]}
                actionLabel={t('Add', 'Add')}
                onAction={openAdd}
            />

            <ExportButtons
                data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))}
                columns={exportColumns}
                filenamePrefix="training_types"
                pdfTitle={t('Training Types', 'Training Types')}
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
                                    paginatedData.map((d: TrainingTypeDto, idx: number) => (
                                        <tr key={d.id} className={selection.isSelected(d.id) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(d.id)} onChange={() => selection.toggle(d.id)} />
                                            <td className={ui.tdIndex}>{(currentPage - 1) * pageSize + idx + 1}</td>
                                            <td className={ui.tdBold}>{d.type}</td>
                                            <td className={ui.td}>{d.description}</td>
                                            <td className={ui.td}>
                                                <StatusBadge status={d.status} variant={d.status === "Active" ? "success" : "danger"} />
                                            </td>
                                            <td className={ui.tdActions}>
                                                <ActionButtons
                                                    onEdit={() => openEdit(d)}
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
                title={selectedType ? "Edit Training Type" : "Add Training Type"}
                maxWidth="max-w-md"
                footer={
                    <button onClick={handleSubmitForm} className={ui.btnPrimary}>
                        Submit
                    </button>
                }
            >
                <div className="space-y-4">
                    <FormField label={t('Type Name', 'Type Name')} required>
                        <input type="text" value={formData.type} onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))} className={ui.input} placeholder="e.g. Technical Training" />
                    </FormField>
                    <FormField label={t('Status', 'Status')}>
                        <select value={formData.status} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))} className={ui.select}>
                            <option value="Active">{t('Active', 'Active')}</option>
                            <option value="Inactive">{t('Inactive', 'Inactive')}</option>
                        </select>
                    </FormField>
                    <FormField label={t('Description', 'Description')} required>
                        <textarea value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} className={ui.textarea} placeholder="Enter description" rows={3} />
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
