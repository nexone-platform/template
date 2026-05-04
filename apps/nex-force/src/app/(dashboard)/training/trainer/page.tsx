"use client";

import { useEffect,  useState, useMemo, useCallback } from "react";
import {
    useTrainers,
    TrainerDto
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

export default function TrainersPage() {
    const { t } = usePageTranslation();

    const exportColumns: ExportColumn[] = useMemo(() => [
        { header: "#", key: "_index" },
        { header: t('Name', 'Name'), key: "name" },
        { header: t('Email', 'Email'), key: "mail" },
        { header: t('Contact Number', 'Contact Number'), key: "contactNumber" },
        { header: t('Role', 'Role'), key: "role" },
        { header: t('Description', 'Description'), key: "description" },
        { header: t('Status', 'Status'), key: "status" },
    ], [t]);

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "name", label: t('Name', 'Name'), sortable: true },
    { key: "mail", label: t('Email', 'Email'), sortable: true },
    { key: "contactNumber", label: t('Contact', 'Contact'), sortable: true },
    { key: "role", label: t('Role', 'Role'), sortable: true },
    { key: "status", label: t('Status', 'Status') },
    { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ];

    const { data: trainers, isLoading } = useTrainers();

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
    const [selectedTrainer, setSelectedTrainer] = useState<TrainerDto | null>(null);
    const [formData, setFormData] = useState<Partial<TrainerDto>>({
        name: "",
        mail: "",
        contactNumber: "",
        role: "",
        description: "",
        status: "Active",
    });

    const list: TrainerDto[] = useMemo(() => trainers ?? [], [trainers]);

    const filtered = useMemo(() => {
        if (!searchText) return list;
        const q = searchText.toLowerCase();
        return list.filter(
            (d) =>
                d.name?.toLowerCase().includes(q) ||
                d.role?.toLowerCase().includes(q) ||
                d.mail?.toLowerCase().includes(q) ||
                d.contactNumber?.toLowerCase().includes(q) ||
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
        setSelectedTrainer(null);
        setFormData({ name: "", mail: "", contactNumber: "", role: "", description: "", status: "Active" });
        setModalOpen(true);
    };

    const openEdit = (item: TrainerDto) => {
        setSelectedTrainer(item);
        setFormData({
            name: item.name,
            mail: item.mail,
            contactNumber: item.contactNumber,
            role: item.role,
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
                title={t('Trainers', 'Trainers')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard },
                    { label: t('Trainers', 'Trainers') },
                ]}
                actionLabel={t('Add', 'Add')}
                onAction={openAdd}
            />

            <ExportButtons
                data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))}
                columns={exportColumns}
                filenamePrefix="trainers"
                pdfTitle={t('Trainers', 'Trainers')}
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
                                    paginatedData.map((d: TrainerDto, idx: number) => (
                                        <tr key={d.id} className={selection.isSelected(d.id) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(d.id)} onChange={() => selection.toggle(d.id)} />
                                            <td className={ui.tdIndex}>{(currentPage - 1) * pageSize + idx + 1}</td>
                                            <td className={ui.tdBold}>{d.name}</td>
                                            <td className={ui.td}>{d.mail}</td>
                                            <td className={ui.td}>{d.contactNumber}</td>
                                            <td className={ui.td}>{d.role}</td>
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
                title={selectedTrainer ? "Edit Trainer" : "Add Trainer"}
                maxWidth="max-w-lg"
                footer={
                    <button onClick={handleSubmitForm} className={ui.btnPrimary}>
                        Submit
                    </button>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Full Name', 'Full Name')} required>
                            <input type="text" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} className={ui.input} placeholder="Enter name" />
                        </FormField>
                        <FormField label={t('Role', 'Role')} required>
                            <input type="text" value={formData.role} onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))} className={ui.input} placeholder="Enter role" />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Email', 'Email')} required>
                            <input type="email" value={formData.mail} onChange={(e) => setFormData((p) => ({ ...p, mail: e.target.value }))} className={ui.input} placeholder="Enter email" />
                        </FormField>
                        <FormField label={t('Contact Number', 'Contact Number')}>
                            <input type="text" value={formData.contactNumber} onChange={(e) => setFormData((p) => ({ ...p, contactNumber: e.target.value }))} className={ui.input} placeholder="Enter phone" />
                        </FormField>
                    </div>
                    <FormField label={t('Description', 'Description')} required>
                        <textarea value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} className={ui.textarea} placeholder="Enter description" rows={3} />
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
