"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { useMessages } from "@/hooks/use-messages";
import { getApiErrorMessage } from "@/lib/api-error";
import {
    PageHeader, TableHeaderBar, SortableTh, EmptyState, LoadingSpinner,
    PaginationBar, ModalWrapper, FormField, StatusBadge, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

/* ── Helpers ── */
const fmtDateTime = (d: string | null | undefined) => {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const toDateInput = (d: string | null | undefined) => {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};

const pad2 = (n: number) => String(n).padStart(2, "0");
const HOURS = Array.from({ length: 24 }, (_, i) => pad2(i));
const MINUTES = ["00", "15", "30", "45"];

/* ── Page ── */
export default function ScheduleTimingPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError } = useMessages();
    const queryClient = useQueryClient();

    // ── Search state ──
    const [searchName, setSearchName] = useState("");
    const [searchPosition, setSearchPosition] = useState("");
    const [searchStatus, setSearchStatus] = useState("");

    // ── Table state ──
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortKey, setSortKey] = useState("");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    // ── Edit Schedule Modal ──
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editSchedule, setEditSchedule] = useState({
        scheduleId: 0, manageResumeId: 0, jobTitleId: "" as string,
        date: "", endDate: "", hour: "09", minute: "00", endHour: "10", endMinute: "00", status: "",
    });

    // ── Testing Modal ──
    const [testingModalOpen, setTestingModalOpen] = useState(false);
    const [testingName, setTestingName] = useState("");
    const [testingRows, setTestingRows] = useState<any[]>([]);
    const [testingLoading, setTestingLoading] = useState(false);
    const [testingError, setTestingError] = useState<string | null>(null);

    // ── Master: positions ──
    const { data: positionJobOptions } = useQuery({
        queryKey: ["stPositions"],
        queryFn: async () => { const { data } = await apiClient.get<any>("manageJobs/getAllDesignation"); return data || []; },
    });

    // ── Master: job titles ──
    const { data: jobTitleList } = useQuery({
        queryKey: ["stJobTitles"],
        queryFn: async () => { const { data } = await apiClient.get<any>("manageJobs/getAllManageJobs"); return data?.data || []; },
    });

    // ── Table data ──
    const { data: tableData, isLoading } = useQuery({
        queryKey: ["scheduleTimingData"],
        queryFn: async () => { const { data } = await apiClient.get<any>("scheduleTiming/getAllManageResume"); return data; },
    });

    // ── Search API ──
    const [searchResults, setSearchResults] = useState<any[] | null>(null);

    const handleSearch = async () => {
        try {
            const { data } = await apiClient.post<any>("scheduleTiming/searchScheduleTime", {
                firstName: searchName || null, position: searchPosition || null, status: searchStatus || null,
            });
            let rows: any[] = [];
            if (Array.isArray(data?.data)) rows = data.data;
            else if (Array.isArray(data)) rows = data;
            setSearchResults(rows); setCurrentPage(1);
        } catch (err) {
            showError('SAVE_ERROR', 'Error!', getApiErrorMessage(err, "ค้นหาข้อมูลไม่สำเร็จ"));
        }
    };

    const handleClear = () => {
        setSearchName(""); setSearchPosition(""); setSearchStatus("");
        setSearchResults(null); setCurrentPage(1);
    };

    // ── Save schedule mutation ──
    const saveMutation = useMutation({
        mutationFn: async (payload: any) => { const { data } = await apiClient.post<any>("scheduleTiming/update", payload); return data; },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["scheduleTimingData"] });
            setEditModalOpen(false);
            showSuccess('SAVE_SUCCESS', 'Success!', 'Schedule Timing has requested successfully.');
        },
        onError: (err) => {
            showError('SAVE_ERROR', 'Error!', getApiErrorMessage(err, "Save failed"));
        },
    });

    // ── Data processing ──
    const rows = useMemo(() => {
        if (searchResults) return searchResults;
        const raw = tableData?.data ?? [];
        return Array.isArray(raw) ? raw : [];
    }, [searchResults, tableData]);

    // ── Sort ──
    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
    };

    const sorted = useMemo(() => {
        const data = [...rows];
        if (!sortKey) return data;
        return data.sort((a: any, b: any) => {
            const aVal = a[sortKey] ?? ""; const bVal = b[sortKey] ?? "";
            return (aVal < bVal ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
        });
    }, [rows, sortKey, sortDir]);

    // ── Pagination ──
    const totalData = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalData / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedData = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

    // ── Open Edit Modal ──
    const openEditModal = (row: any) => {
        let hour = "09", minute = "00", endHour = "10", endMinute = "00";
        let dateStr = "", endDateStr = "";
        if (row.startDate) {
            const d = new Date(row.startDate); dateStr = toDateInput(row.startDate);
            hour = pad2(d.getHours()); minute = pad2(d.getMinutes());
        }
        if (row.expiredDate) {
            const d = new Date(row.expiredDate); endDateStr = toDateInput(row.expiredDate);
            endHour = pad2(d.getHours()); endMinute = pad2(d.getMinutes());
        }
        setEditSchedule({
            scheduleId: row.scheduleId ?? 0, manageResumeId: row.manageResumeId,
            jobTitleId: String(row.jobTitleId ?? row.jobTitle ?? ""),
            date: dateStr, endDate: endDateStr, hour, minute, endHour, endMinute,
            status: row.status || "",
        });
        setEditModalOpen(true);
    };

    // ── Save Schedule ──
    const handleSaveSchedule = () => {
        const combineDateTime = (dateStr: string, h: string, m: string) => !dateStr ? "" : `${dateStr}T${h}:${m}`;
        const startDate = combineDateTime(editSchedule.date, editSchedule.hour, editSchedule.minute);
        const expiredDate = combineDateTime(editSchedule.endDate, editSchedule.endHour, editSchedule.endMinute);
        saveMutation.mutate({
            scheduleId: editSchedule.scheduleId, manageResumeId: editSchedule.manageResumeId,
            jobTitleId: editSchedule.jobTitleId ? Number(editSchedule.jobTitleId) : undefined,
            startDate, expiredDate, status: editSchedule.status || "CLOSE",
        });
    };

    // ── Open Testing Modal ──
    const openTestingModal = async (row: any) => {
        const id = Number(row.manageResumeId);
        if (!id) return;
        setTestingName(`${row.firstName ?? ""} ${row.lastName ?? ""}`.trim());
        setTestingLoading(true); setTestingError(null); setTestingRows([]);
        setTestingModalOpen(true);
        try {
            const { data } = await apiClient.get<any>(`testing/getAssignedCategories/${id}`);
            setTestingRows(data?.data ?? []);
        } catch (err) {
            setTestingError(getApiErrorMessage(err, "โหลดผลการทดสอบไม่สำเร็จ"));
        }
        setTestingLoading(false);
    };

    const columns = [
        { key: "manageResumeId", label: "#", sortable: true, width: "w-14" },
        { key: "firstName", label: t('Name', 'Name'), sortable: true },
        { key: "position", label: t('Position', 'Position'), sortable: true },
        { key: "email", label: t('Email', 'Email'), sortable: true },
        { key: "startDate", label: t('Interview Schedule', 'Interview Schedule'), sortable: true },
        { key: "status", label: t('Status', 'Status'), sortable: true },
        { key: "testing", label: t('Testing', 'Testing'), sortable: false, align: "center" as const },
        { key: "scheduleTiming", label: t('Schedule Timing', 'Schedule Timing'), sortable: false, align: "center" as const },
    ];

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Schedule Timing', 'Schedule Timing')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Jobs', 'Jobs') },
                    { label: t('Schedule Timing', 'Schedule Timing') },
                ]}
            />

            {/* Search Filter */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormField label={t('Name', 'Name')}>
                        <input type="text" value={searchName} onChange={e => setSearchName(e.target.value)} className={ui.input} placeholder="Name" />
                    </FormField>
                    <FormField label={t('Position', 'Position')}>
                        <select value={searchPosition} onChange={e => setSearchPosition(e.target.value)} className={ui.select}>
                            <option value="">{t('Select', 'Select')}</option>
                            {(positionJobOptions || []).map((d: any) => (
                                <option key={d.designation_id} value={d.designation_id}>{d.designation_code || d.designation_name_en}</option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label={t('Status', 'Status')}>
                        <select value={searchStatus} onChange={e => setSearchStatus(e.target.value)} className={ui.select}>
                            <option value="">{t('Select', 'Select')}</option>
                            <option value="ACTIVE">Active</option>
                            <option value="PENDING">Pending</option>
                            <option value="SUCCESS">Success</option>
                            <option value="CANCEL">Cancel</option>
                        </select>
                    </FormField>
                </div>
                <div className="flex justify-center gap-3">
                    <button onClick={handleSearch} className={`${ui.btnPrimary} bg-emerald-600 hover:bg-nv-violet-dark active:bg-emerald-800 w-[250px] justify-center flex items-center gap-2`}>{t('Search', 'Search')}</button>
                    <button onClick={handleClear} className={`${ui.btnSecondary} w-[250px] justify-center`}>{t('Clear', 'Clear')}</button>
                </div>
            </div>

            {/* Table */}
            <div className={ui.tableWrapper}>
                <TableHeaderBar pageSize={pageSize} onPageSizeChange={(v) => { setPageSize(v); setCurrentPage(1); }} />
                <div className="overflow-x-auto">
                    <table className={`${ui.table} min-w-[1100px]`}>
                        <thead className={ui.thead}>
                            <tr>
                                {columns.map(col => (
                                    <SortableTh key={col.key} column={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                ))}
                            </tr>
                        </thead>
                        <tbody className={ui.tbody}>
                            {isLoading ? (
                                <LoadingSpinner colSpan={8} />
                            ) : paginatedData.length === 0 ? (
                                <EmptyState colSpan={8} />
                            ) : paginatedData.map((row: any, idx: number) => (
                                <tr key={row.manageResumeId || idx} className={ui.tr}>
                                    <td className={ui.tdIndex}>{row.manageResumeId}</td>
                                    <td className={ui.tdBold}>{row.firstName} {row.lastName}</td>
                                    <td className={ui.td}>{row.position}</td>
                                    <td className={ui.td}>{row.email}</td>
                                    <td className={ui.td}>
                                        {row.startDate
                                            ? <>{fmtDateTime(row.startDate)} - {fmtDateTime(row.expiredDate)}</>
                                            : <span className="text-gray-400">Not scheduled</span>
                                        }
                                    </td>
                                    <td className="px-4 py-3">
                                        {row.status && <StatusBadge status={row.status} />}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => openTestingModal(row)}
                                            className={`${ui.btnPrimary} px-3 py-1.5 text-xs`}>
                                            Testing
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => openEditModal(row)}
                                            disabled={row.status === "SUCCESS"}
                                            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${row.status === "SUCCESS" ? "bg-gray-200 text-gray-500 cursor-not-allowed" : `${ui.btnPrimary} px-3 py-1.5 text-xs`}`}>
                                            {t('Schedule Time', 'Schedule Time')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <PaginationBar currentPage={safePage} totalPages={totalPages} totalData={totalData} pageSize={pageSize} onGoToPage={setCurrentPage} />
            </div>

            {/* Edit Schedule Modal */}
            <ModalWrapper open={editModalOpen} onClose={() => setEditModalOpen(false)} title={t('Edit Schedule', 'Edit Schedule')} maxWidth="max-w-2xl"
                footer={
                    <button onClick={handleSaveSchedule} disabled={saveMutation.isPending} className={ui.btnPrimary}>
                        {saveMutation.isPending ? t('Saving...', 'Saving...') : t('Save', 'Save')}
                    </button>
                }>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <FormField label={t('Start Date', 'Start Date')}>
                                <input type="date" value={editSchedule.date} onChange={e => setEditSchedule({ ...editSchedule, date: e.target.value })} className={ui.input} />
                            </FormField>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <FormField label={t('Hour', 'Hour')}>
                                    <select value={editSchedule.hour} onChange={e => setEditSchedule({ ...editSchedule, hour: e.target.value })} className={ui.select}>
                                        {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </FormField>
                                <FormField label={t('Minute', 'Minute')}>
                                    <select value={editSchedule.minute} onChange={e => setEditSchedule({ ...editSchedule, minute: e.target.value })} className={ui.select}>
                                        {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </FormField>
                            </div>
                        </div>
                        <div>
                            <FormField label={t('End Date', 'End Date')}>
                                <input type="date" value={editSchedule.endDate} onChange={e => setEditSchedule({ ...editSchedule, endDate: e.target.value })} className={ui.input} />
                            </FormField>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <FormField label={t('Hour', 'Hour')}>
                                    <select value={editSchedule.endHour} onChange={e => setEditSchedule({ ...editSchedule, endHour: e.target.value })} className={ui.select}>
                                        {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </FormField>
                                <FormField label={t('Minute', 'Minute')}>
                                    <select value={editSchedule.endMinute} onChange={e => setEditSchedule({ ...editSchedule, endMinute: e.target.value })} className={ui.select}>
                                        {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </FormField>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <FormField label={t('Job Title', 'Job Title')}>
                            <select value={editSchedule.jobTitleId} onChange={e => setEditSchedule({ ...editSchedule, jobTitleId: e.target.value })} className={ui.select}>
                                <option value="">{t('Select Job Title', 'Select Job Title')}</option>
                                {(jobTitleList || []).map((j: any) => (
                                    <option key={j.manageJobId} value={j.manageJobId}>{j.jobTitle}</option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label={t('Status', 'Status')}>
                            <select value={editSchedule.status} onChange={e => setEditSchedule({ ...editSchedule, status: e.target.value })} className={ui.select}>
                                <option value="ACTIVE">Active</option>
                                <option value="PENDING">Pending</option>
                                <option value="SUCCESS">Success</option>
                                <option value="CANCEL">Cancel</option>
                            </select>
                        </FormField>
                    </div>
                </div>
            </ModalWrapper>

            {/* Testing Result Modal */}
            <ModalWrapper open={testingModalOpen} onClose={() => setTestingModalOpen(false)} title={`Testing Result${testingName ? ` - ${testingName}` : ""}`} maxWidth="max-w-2xl">
                {testingLoading ? (
                    <LoadingSpinner />
                ) : testingError ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{testingError}</div>
                ) : testingRows.length === 0 ? (
                    <EmptyState message={t('No testing data', 'No testing data')} />
                ) : (
                    <table className={ui.table}>
                        <thead className={ui.thead}>
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Category', 'Category')}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('Score (%)', 'Score (%)')}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('Spent Time', 'Spent Time')}</th>
                            </tr>
                        </thead>
                        <tbody className={ui.tbody}>
                            {testingRows.map((r: any, i: number) => (
                                <tr key={i} className={ui.tr}>
                                    <td className={ui.td}>{i + 1}</td>
                                    <td className={ui.td}>{r.categoryName || r.title || r.name || "-"}</td>
                                    <td className="px-4 py-3 text-center text-gray-600">{r.score != null ? `${r.score}%` : "-"}</td>
                                    <td className="px-4 py-3 text-center text-gray-600">{r.spentMinutes != null ? `${r.spentMinutes} นาที` : "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </ModalWrapper>
        </div>
    );
}
