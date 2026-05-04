"use client";

import { useEffect,  useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Eye } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useMessages } from "@/hooks/use-messages";
import {
    PageHeader, TableHeaderBar, SortableTh, EmptyState, LoadingSpinner,
    PaginationBar, ModalWrapper, FormField, StatusBadge, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";
import { useSystemConfig } from '@nexone/ui';

/* ── Helpers ── */
const fmtDate = (d: string | Date | null | undefined) => {
    if (!d) return ""; const dt = new Date(d as string);
    if (isNaN(dt.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
};

const statusLabel = (s: string | undefined | null) => {
    if (s === "CANCEL") return "Candidate Cancel";
    if (s === "REJECT") return "HR Reject";
    if (s === "PASS") return "Interview Passed";
    return "-";
};

const statusVariant = (s: string | undefined | null): "success" | "danger" | "warning" | "default" => {
    if (s === "PASS") return "success";
    if (s === "REJECT") return "danger";
    if (s === "CANCEL") return "warning";
    return "default";
};



/* ── Page ── */
export default function AptitudeResultPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError } = useMessages();
    const queryClient = useQueryClient();

    const columns = [
        { key: "#", label: "#", width: "w-14" },
        { key: "firstName", label: t('Name', 'Name'), sortable: true },
        { key: "jobTitleName", label: t('Job Title', 'Job Title'), sortable: true },
        { key: "departmentName", label: t('Department', 'Department'), sortable: true },
        { key: "startDate", label: t('Date Interview', 'Date Interview'), sortable: true },
        { key: "statusInternal", label: t('Internal Interview', 'Internal Interview'), sortable: true },
        { key: "clientName", label: t('Client Name', 'Client Name'), sortable: true },
        { key: "expiredDate", label: t('Ext. Interview Date', 'Ext. Interview Date'), sortable: true },
        { key: "statusExternal", label: t('External Interview', 'External Interview'), sortable: true },
        { key: "action", label: t('Actions', 'Actions'), align: "center" as const },
    ];

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
    const [sortKey, setSortKey] = useState("");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [modalOpen, setModalOpen] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [selectedStep, setSelectedStep] = useState<"EXTERNAL" | "SIGN" | "">("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [comment, setComment] = useState("");

    const { data: tableData, isLoading } = useQuery({
        queryKey: ["interviewResults"],
        queryFn: async () => { const { data } = await apiClient.get<any>("interviewResult/getAllInterview"); return data; },
    });

    const updateMutation = useMutation({
        mutationFn: async (payload: any) => { const { data } = await apiClient.post<any>("interviewResult/update", payload); return data; },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["interviewResults"] }); setModalOpen(false); showSuccess('SAVE_SUCCESS', 'Success!', 'Updated successfully.'); },
        onError: () => { showError('SAVE_ERROR', 'Error!', 'Update failed.'); },
    });

    const rows = useMemo(() => { const raw = tableData?.data ?? []; return Array.isArray(raw) ? raw : []; }, [tableData]);

    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
    };
    const sorted = useMemo(() => {
        const d = [...rows]; if (!sortKey) return d;
        return d.sort((a: any, b: any) => ((a[sortKey] ?? "") < (b[sortKey] ?? "") ? -1 : 1) * (sortDir === "asc" ? 1 : -1));
    }, [rows, sortKey, sortDir]);

    const totalData = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalData / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const startIdx = (safePage - 1) * pageSize;
    const paginatedData = sorted.slice(startIdx, startIdx + pageSize);

    const openModal = (row: any, viewOnly: boolean) => {
        setIsViewMode(viewOnly); setSelectedRow(row); setComment(row.comment || "");
        let step: "EXTERNAL" | "SIGN" | "" = "";
        let status = "";
        if (row.step === "EXTERNAL" || row.step === "SIGN") step = row.step;
        if (row.step === "EXTERNAL") status = row.statusExternal || "";
        if (row.step === "SIGN") status = row.statusInternal || "";
        setSelectedStep(step); setSelectedStatus(status); setModalOpen(true);
    };

    const onStepSelect = (step: "EXTERNAL" | "SIGN", checked: boolean) => {
        if (!checked) { setSelectedStep(""); return; }
        setSelectedStep(step); setSelectedStatus("");
    };

    const handleSave = () => {
        const payload: any = { ...selectedRow, step: selectedStep || undefined, comment };
        if (selectedStep === "EXTERNAL") payload.statusExternal = selectedStatus;
        if (selectedStep === "SIGN") payload.statusInternal = selectedStatus;
        updateMutation.mutate(payload);
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Interview Result', 'Interview Result')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" }, { label: t('Jobs', 'Jobs') }, { label: t('Interview Result', 'Interview Result') }]}
            />

            <div className={ui.tableWrapper}>
                <TableHeaderBar pageSize={pageSize} onPageSizeChange={(v) => { setPageSize(v); setCurrentPage(1); }} />
                {isLoading ? <LoadingSpinner /> : (
                    <div className="overflow-x-auto">
                        <table className={`${ui.table} min-w-[1300px]`}>
                            <thead className={ui.thead}>
                                <tr>{columns.map(col => <SortableTh key={col.key} column={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />)}</tr>
                            </thead>
                            <tbody className={ui.tbody}>
                                {paginatedData.length === 0 ? <EmptyState colSpan={10} /> : paginatedData.map((item: any, idx: number) => (
                                    <tr key={item.interviewResultId || idx} className={ui.tr}>
                                        <td className={ui.tdIndex}>{startIdx + idx + 1}</td>
                                        <td className={ui.tdBold}>{item.firstName} {item.lastName}</td>
                                        <td className={ui.td}>{item.jobTitleName}</td>
                                        <td className={ui.td}>{item.departmentName}</td>
                                        <td className={ui.td}>{fmtDate(item.startDate)}</td>
                                        <td className="px-4 py-3 text-sm text-center">
                                            <StatusBadge status={statusLabel(item.statusInternal)} variant={statusVariant(item.statusInternal)} />
                                        </td>
                                        <td className={ui.td}>{item.clientName}</td>
                                        <td className={ui.td}>{fmtDate(item.expiredDate)}</td>
                                        <td className="px-4 py-3 text-sm text-center">
                                            <StatusBadge status={statusLabel(item.statusExternal)} variant={statusVariant(item.statusExternal)} />
                                        </td>
                                        <td className={ui.tdActions}>
                                            <div className="flex justify-center gap-1">
                                                <button onClick={() => openModal(item, false)} className="p-1.5 text-gray-400 hover:text-nv-violet hover:bg-nv-violet-light rounded-lg transition" title={t('Edit', 'Edit')}>
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => openModal(item, true)} className="p-1.5 text-gray-400 hover:text-nv-violet hover:bg-nv-violet-light rounded-lg transition" title={t('View', 'View')}>
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <PaginationBar currentPage={safePage} totalPages={totalPages} totalData={totalData} pageSize={pageSize} onGoToPage={setCurrentPage} />
            </div>

            {/* Edit/View Modal */}
            <ModalWrapper
                open={modalOpen && !!selectedRow}
                onClose={() => setModalOpen(false)}
                title={isViewMode ? t('View Interview Result', 'View Interview Result') : t('Edit Interview Result', 'Edit Interview Result')}
                maxWidth="max-w-2xl"
                footer={
                    <>
                        <button onClick={() => setModalOpen(false)} className={ui.btnSecondary}>{t('Cancel', 'Cancel')}</button>
                        {!isViewMode && (
                            <button onClick={handleSave} disabled={updateMutation.isPending} className={ui.btnPrimary}>
                                {updateMutation.isPending ? t('Saving...', 'Saving...') : t('Save', 'Save')}
                            </button>
                        )}
                    </>
                }
            >
                {selectedRow && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                            <div><span className="font-semibold text-gray-700">Name:</span> <span className="text-gray-600">{selectedRow.firstName} {selectedRow.lastName}</span></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><span className="font-semibold text-gray-700">Resume:</span> {selectedRow.resumeUrl ? <a href={selectedRow.resumeUrl} target="_blank" rel="noopener" className="text-nv-violet hover:underline ml-1">Open Resume</a> : <span className="text-gray-400 ml-1">-</span>}</div>
                                <div><span className="font-semibold text-gray-700">CV:</span> {selectedRow.cvUrl ? <a href={selectedRow.cvUrl} target="_blank" rel="noopener" className="text-nv-violet hover:underline ml-1">Open CV</a> : <span className="text-gray-400 ml-1">-</span>}</div>
                            </div>
                            <div><span className="font-semibold text-gray-700">Position:</span> <span className="text-gray-600">{selectedRow.positionName ?? "-"}</span></div>
                            <div><span className="font-semibold text-gray-700">Department:</span> <span className="text-gray-600">{selectedRow.departmentName ?? "-"}</span></div>
                        </div>

                        <FormField label={t('Interview Status', 'Interview Status')}>
                            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} disabled={isViewMode} className={ui.select}>
                                <option value="">-- Select Status --</option>
                                <option value="CANCEL">{t('Candidate Cancel', 'Candidate Cancel')}</option>
                                <option value="REJECT">{t('HR Reject', 'HR Reject')}</option>
                                <option value="PASS">{t('Interview Passed', 'Interview Passed')}</option>
                            </select>
                        </FormField>

                        <FormField label={t('Comment', 'Comment')}>
                            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} disabled={isViewMode} className={ui.textarea} />
                        </FormField>

                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">Next Step</label>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={selectedStep === "EXTERNAL"} onChange={e => onStepSelect("EXTERNAL", e.target.checked)} disabled={isViewMode} className="w-4 h-4 rounded border-gray-300 text-nv-violet" />
                                    <span className="text-sm text-gray-700">External Interview</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={selectedStep === "SIGN"} onChange={e => onStepSelect("SIGN", e.target.checked)} disabled={isViewMode} className="w-4 h-4 rounded border-gray-300 text-nv-violet" />
                                    <span className="text-sm text-gray-700">Sign Contract</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </ModalWrapper>
        </div>
    );
}
