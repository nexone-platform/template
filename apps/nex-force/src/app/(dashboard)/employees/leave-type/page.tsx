"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMessages } from "@/hooks/use-messages";
import { ROUTES } from "@/lib/routes";
import { getUserProfile } from "@/lib/auth";
import { leaveService } from "@/services/leave.service";
import { usePagination } from "@/hooks/use-pagination";
import { useRowSelection } from "@/hooks/use-row-selection";
import ExportButtons from "@/components/ExportButtons";
import type { ExportColumn } from "@/lib/table-export";
import {
    PageHeader, TableHeaderBar, SortableTh, ActionButtons,
    EmptyState, LoadingSpinner, PaginationBar, ModalWrapper, FormField, ui, SelectAllCheckbox, RowCheckbox,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";



export default function LeaveTypePage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showWarning } = useMessages();

    const tableColumns = useMemo(() => [
        { key: "#", label: "#", width: "w-14" },
        { key: "leaveTypeCode", label: t('Leave Type Code', 'Leave Type Code'), sortable: true },
        { key: "leaveTypeNameTh", label: t('Leave Type Name (TH)', 'Leave Type Name (TH)'), sortable: true },
        { key: "leaveTypeNameEn", label: t('Leave Type Name (EN)', 'Leave Type Name (EN)'), sortable: true },
        { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ], [t]);

    type AnyRow = Record<string, any>;

    const exportColumns: ExportColumn[] = useMemo(() => [
    { header: "#", key: "_index" },
    { header: t('Leave Type Code', 'Leave Type Code'), key: "leaveTypeCode" },
    { header: t('Leave Type Name (TH)', 'Leave Type Name (TH)'), key: "leaveTypeNameTh" },
    { header: t('Leave Type Name (EN)', 'Leave Type Name (EN)'), key: "leaveTypeNameEn" },
    ], [t]);
    const queryClient = useQueryClient();
    const userProfile = getUserProfile() ?? "";

    const { data: leaveTypesResult, isLoading } = useQuery({
        queryKey: ["leaveTypes"],
        queryFn: leaveService.getMasterLeaveType,
    });

    const updateMutation = useMutation({
        mutationFn: leaveService.updateLeaveType,
        onSuccess: () => {
            showSuccess('SAVE_SUCCESS', 'Success!', 'Leave saved successfully.');
            queryClient.invalidateQueries({ queryKey: ["leaveTypes"] });
            resetForm();
            setModalOpen(false);
        },
        onError: () => { showError('SAVE_ERROR', 'Error!', 'Error saving Leave Type.'); },
    });

    const deleteMutation = useMutation({
        mutationFn: leaveService.deleteLeaveType,
        onSuccess: (res) => {
            showSuccess('SAVE_SUCCESS', 'Success!', res?.message || "Deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ["leaveTypes"] });
        },
        onError: (error: unknown) => {
            const err = error as { error?: { message?: string }; message?: string };
            showError('SAVE_ERROR', 'Error!', err?.error?.message ?? err?.message ?? "Something went wrong.");
        },
    });

    const leaveTypes: AnyRow[] = useMemo(
        () => (Array.isArray(leaveTypesResult?.data) ? leaveTypesResult.data : []),
        [leaveTypesResult]
    );

    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [pageSize, setPageSize] = useState(10);

    const [modalOpen, setModalOpen] = useState(false);
    const [mode, setMode] = useState<"add" | "edit">("add");
    const [formTouched, setFormTouched] = useState(false);
    const [formData, setFormData] = useState({
        leaveTypeId: 0, leaveTypeCode: "", leaveTypeNameTh: "", leaveTypeNameEn: "",
    });

    const sortedData = useMemo(() => {
        if (!sortKey) return leaveTypes;
        return [...leaveTypes].sort((a, b) => {
            const aVal = a[sortKey] ?? "";
            const bVal = b[sortKey] ?? "";
            return (aVal < bVal ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
        });
    }, [leaveTypes, sortKey, sortDir]);

    const {
        paginatedData, currentPage, totalPages, goToPage, changePageSize: changePgSize,
    } = usePagination(sortedData, { pageSize });


    // ── Row Selection ──
    const getRowId = useCallback((d: any) => d.leaveTypeId, []);
    const selection = useRowSelection(paginatedData, getRowId);
    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    const resetForm = () => {
        setFormData({ leaveTypeId: 0, leaveTypeCode: "", leaveTypeNameTh: "", leaveTypeNameEn: "" });
        setFormTouched(false);
    };

    const openAdd = () => { resetForm(); setMode("add"); setModalOpen(true); };

    const openEdit = (item: AnyRow) => {
        setMode("edit");
        setFormData({
            leaveTypeId: item.leaveTypeId,
            leaveTypeCode: item.leaveTypeCode ?? "",
            leaveTypeNameTh: item.leaveTypeNameTh ?? "",
            leaveTypeNameEn: item.leaveTypeNameEn ?? "",
        });
        setFormTouched(false);
        setModalOpen(true);
    };

    const handleSubmitForm = () => {
        setFormTouched(true);
        if (!formData.leaveTypeCode || !formData.leaveTypeNameTh || !formData.leaveTypeNameEn) return;
        updateMutation.mutate({ ...formData, username: userProfile } as Record<string, unknown>);
    };

    const handleDelete = (id: number) => {
        showWarning('REQUIRED_FIELDS', 'Delete Leave Type', 'Are you sure you want to delete?').then((result) => { if (result.isConfirmed) deleteMutation.mutate(id); });
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Leave Type', 'Leave Type')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard }, { label: t('Leave Type', 'Leave Type') }]}
                actionLabel={t('Add', 'Add')}
                onAction={openAdd}
            />

            <ExportButtons
                data={sortedData.map((d: any, i: number) => ({ ...d, _index: i + 1 }))}
                columns={exportColumns}
                filenamePrefix="leave_types"
                pdfTitle={t('Leave Types', 'Leave Types')}
                totalCount={sortedData.length}
                selectedData={selection.getSelectedRows(sortedData)}
                selectedCount={selection.selectedCount}
                onClearSelection={selection.clearSelection}
            />

            <div className={ui.tableWrapper}>
                <TableHeaderBar pageSize={pageSize} onPageSizeChange={(v) => { setPageSize(v); changePgSize(v); }} />

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
                                        <tr key={d.leaveTypeId} className={selection.isSelected(d.leaveTypeId) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(d.leaveTypeId)} onChange={() => selection.toggle(d.leaveTypeId)} />
                                            <td className={ui.tdIndex}>{(currentPage - 1) * pageSize + idx + 1}</td>
                                            <td className={ui.td}>{d.leaveTypeCode}</td>
                                            <td className={ui.td}>{d.leaveTypeNameTh}</td>
                                            <td className={ui.td}>{d.leaveTypeNameEn}</td>
                                            <td className={ui.tdActions}>
                                                <ActionButtons onEdit={() => openEdit(d)} onDelete={() => handleDelete(d.leaveTypeId)} />
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

                <PaginationBar currentPage={currentPage} totalPages={totalPages} totalData={sortedData.length} pageSize={pageSize} onGoToPage={goToPage} />
            </div>

            <ModalWrapper
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={mode === "add" ? "Add Leave Type" : "Edit Leave Type"}
                maxWidth="max-w-md"
                footer={
                    <button onClick={handleSubmitForm} disabled={updateMutation.isPending} className={ui.btnPrimary}>
                        {updateMutation.isPending ? "Saving..." : "Submit"}
                    </button>
                }
            >
                <div className="space-y-4">
                    <FormField label={t('Leave Type Code', 'Leave Type Code')} required error={formTouched && !formData.leaveTypeCode ? "* Required" : undefined}>
                        <input type="text" value={formData.leaveTypeCode} onChange={(e) => setFormData((p) => ({ ...p, leaveTypeCode: e.target.value }))}
                            className={`${ui.input} ${formTouched && !formData.leaveTypeCode ? "border-red-400" : ""}`}
                            disabled={mode === "edit"} />
                    </FormField>
                    <FormField label={t('Leave Type Name (TH)', 'Leave Type Name (TH)')} required error={formTouched && !formData.leaveTypeNameTh ? "* Required" : undefined}>
                        <input type="text" value={formData.leaveTypeNameTh} onChange={(e) => setFormData((p) => ({ ...p, leaveTypeNameTh: e.target.value }))}
                            className={`${ui.input} ${formTouched && !formData.leaveTypeNameTh ? "border-red-400" : ""}`} />
                    </FormField>
                    <FormField label={t('Leave Type Name (EN)', 'Leave Type Name (EN)')} required error={formTouched && !formData.leaveTypeNameEn ? "* Required" : undefined}>
                        <input type="text" value={formData.leaveTypeNameEn} onChange={(e) => setFormData((p) => ({ ...p, leaveTypeNameEn: e.target.value }))}
                            className={`${ui.input} ${formTouched && !formData.leaveTypeNameEn ? "border-red-400" : ""}`} />
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
