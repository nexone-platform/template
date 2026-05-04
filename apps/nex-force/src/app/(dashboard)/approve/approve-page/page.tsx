"use client";

import { useEffect,  useState, useMemo, useCallback } from "react";
import {
    usePendingApprovals,
    useApprovalAction,
    useCancelReasons
} from "@/hooks/use-approval";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { getUserId, getUserProfile } from "@/lib/auth";
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
    EmptyState,
    LoadingSpinner,
    PaginationBar,
    ModalWrapper,
    FormField,
    StatusBadge,
    ui, RowCheckbox,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";
import { useSystemConfig } from '@nexone/ui';

type AnyRow = Record<string, any>;

const typeVariant = (type?: string) => {
    if (type?.toLowerCase() === "leave") return "warning";
    if (type?.toLowerCase() === "expense") return "success";
    if (type?.toLowerCase() === "resignation") return "danger";
    return "info";
};

export default function ApprovalsPage() {
    const { t } = usePageTranslation();

    const exportColumns: ExportColumn[] = useMemo(() => [
        { header: "#", key: "_index" },
        { header: t('Employee', 'Employee'), key: "employeeName" },
        { header: t('Type', 'Type'), key: "refType" },
        { header: t('Description', 'Description'), key: "description" },
        { header: t('Date', 'Date'), key: "requestDate", format: (v: any) => v ? new Date(v).toLocaleDateString("en-GB") : "" },
        { header: t('Rule', 'Rule'), key: "ruleName" },
        { header: t('Level', 'Level'), key: "currentApprovalLevel" },
    ], [t]);

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "employeeName", label: t('Employee', 'Employee'), sortable: true },
    { key: "refType", label: t('Type', 'Type'), sortable: true },
    { key: "description", label: t('Description', 'Description'), sortable: true },
    { key: "requestDate", label: t('Date', 'Date'), sortable: true },
    { key: "ruleName", label: t('Rule / Level', 'Rule / Level') },
    { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ];

    const userId = parseInt(getUserId() || "0");
    const username = getUserProfile() || "System";

    const { data: approvals, isLoading } = usePendingApprovals(userId);
    const { data: cancelReasons } = useCancelReasons();
    const actionMutation = useApprovalAction();

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

    const [actionModal, setActionModal] = useState<{ type: "approve" | "reject"; item: any } | null>(null);
    const [actionComment, setActionComment] = useState("");
    const [cancelReasonId, setCancelReasonId] = useState("");

    const list: any[] = useMemo(() => approvals ?? [], [approvals]);

    const filtered = useMemo(() => {
        if (!searchText) return list;
        const q = searchText.toLowerCase();
        return list.filter(
            (d) =>
                d.employeeName?.toLowerCase().includes(q) ||
                d.description?.toLowerCase().includes(q) ||
                d.ruleName?.toLowerCase().includes(q) ||
                d.refType?.toLowerCase().includes(q) ||
                String(d.currentApprovalLevel ?? "").includes(q) ||
                (d.requestDate && format(new Date(d.requestDate), "dd MMM yyyy").toLowerCase().includes(q))
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
        paginatedData, currentPage, totalPages, goToPage, changePageSize: changePgSize,
    } = usePagination(sorted, { pageSize });


    // ── Row Selection ──
    const getRowId = useCallback((d: any) => d.instanceId, []);
    const selection = useRowSelection(paginatedData, getRowId);
    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    const handleAction = () => {
        if (!actionModal) return;
        const payload = {
            instanceId: actionModal.item.instanceId,
            stepId: actionModal.item.stepId,
            approverId: userId,
            action: actionModal.type === "approve" ? "APPROVE" : "REJECT",
            comment: actionComment,
            reasonId: cancelReasonId ? parseInt(cancelReasonId) : undefined,
            username,
        };
        actionMutation.mutate(payload, {
            onSuccess: () => {
                setActionModal(null);
                setActionComment("");
                setCancelReasonId("");
                toast.success(`Request ${actionModal.type === "approve" ? "approved" : "rejected"} successfully`);
            },
        });
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        try { return format(new Date(dateStr), "dd MMM yyyy"); }
        catch { return dateStr; }
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader title={t('Approve Page', 'Approve Page')} breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard }, { label: t('Approve Page', 'Approve Page') }]} />

            <ExportButtons data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))} columns={exportColumns} filenamePrefix="approvals" pdfTitle={t('Pending Approvals', 'Pending Approvals')} totalCount={sorted.length}
                selectedData={selection.getSelectedRows(sorted)}
                selectedCount={selection.selectedCount}
                onClearSelection={selection.clearSelection}
            />

            <div className={ui.tableWrapper}>
                <TableHeaderBar pageSize={pageSize} onPageSizeChange={(v) => { setPageSize(v); changePgSize(v); }} searchText={searchText} onSearchChange={setSearchText} />

                {isLoading ? <LoadingSpinner /> : (
                    <div className="overflow-x-auto">
                        <table className={ui.table}>
                            <thead className={ui.thead}><tr>{tableColumns.map((col) => (<SortableTh key={col.key} column={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />))}</tr></thead>
                            <tbody className={ui.tbody}>
                                {paginatedData.length > 0 ? paginatedData.map((d: AnyRow, idx: number) => (
                                    <tr key={d.instanceId || idx} className={selection.isSelected(d.instanceId) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(d.instanceId)} onChange={() => selection.toggle(d.instanceId)} />
                                        <td className={ui.tdIndex}>{(currentPage - 1) * pageSize + idx + 1}</td>
                                        <td className={ui.tdBold}>{d.employeeName}</td>
                                        <td className={ui.td}><StatusBadge status={d.refType || "General"} variant={typeVariant(d.refType)} /></td>
                                        <td className={ui.td}><span className="truncate max-w-[250px] block">{d.description || "-"}</span></td>
                                        <td className={ui.td}>{formatDate(d.requestDate)}</td>
                                        <td className={ui.td}><span className="text-xs">{d.ruleName} (Lv.{d.currentApprovalLevel})</span></td>
                                        <td className={ui.tdActions}>
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => setActionModal({ type: "approve", item: d })} className="p-1.5 text-nv-violet hover:bg-nv-violet-light rounded-lg transition-colors" title={t('Approve', 'Approve')}>
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setActionModal({ type: "reject", item: d })} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title={t('Reject', 'Reject')}>
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : <EmptyState colSpan={8} />}
                            </tbody>
                        </table>
                    </div>
                )}

                <PaginationBar currentPage={currentPage} totalPages={totalPages} totalData={sorted.length} pageSize={pageSize} onGoToPage={goToPage} />
            </div>

            <ModalWrapper
                open={!!actionModal}
                onClose={() => setActionModal(null)}
                title={actionModal?.type === "approve" ? "Approve Request" : "Reject Request"}
                maxWidth="max-w-md"
                footer={
                    <button
                        onClick={handleAction}
                        disabled={actionMutation.isPending}
                        className={actionModal?.type === "approve" ? "px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50" : "px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"}
                    >
                        {actionMutation.isPending && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
                        Confirm
                    </button>
                }
            >
                <div className="space-y-4">
                    {actionModal && (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-sm text-gray-600">Reviewing request from <span className="font-bold text-gray-800">{actionModal.item.employeeName}</span></p>
                            <p className="text-xs text-gray-400 mt-1">{actionModal.item.description}</p>
                        </div>
                    )}
                    {actionModal?.type === "reject" && (
                        <FormField label={t('Rejection Reason', 'Rejection Reason')}>
                            <select className={ui.select} value={cancelReasonId} onChange={(e) => setCancelReasonId(e.target.value)}>
                                <option value="">Select a reason (optional)</option>
                                {cancelReasons?.map((r: any) => (<option key={r.reasonId} value={r.reasonId}>{r.reasonDetail}</option>))}
                            </select>
                        </FormField>
                    )}
                    <FormField label={t('Comments', 'Comments')} required>
                        <textarea className={ui.textarea} placeholder="Enter your decision notes..." rows={4} value={actionComment} onChange={(e) => setActionComment(e.target.value)} />
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
