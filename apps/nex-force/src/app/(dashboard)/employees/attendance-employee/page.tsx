"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { useMessages } from "@/hooks/use-messages";
import { getUserId, getUserProfile } from "@/lib/auth";
import { attendanceService } from "@/services/attendance.service";
import { usePagination } from "@/hooks/use-pagination";
import ExportButtons from "@/components/ExportButtons";
import type { ExportColumn } from "@/lib/table-export";
import {
    PageHeader, FormField, SortableTh, TableHeaderBar, LoadingSpinner, EmptyState, PaginationBar, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";
import { useSystemConfig } from '@nexone/ui';


const MONTHS = [
    { id: 0, name: "All" }, { id: 1, name: "Jan" }, { id: 2, name: "Feb" }, { id: 3, name: "Mar" },
    { id: 4, name: "Apr" }, { id: 5, name: "May" }, { id: 6, name: "Jun" }, { id: 7, name: "Jul" },
    { id: 8, name: "Aug" }, { id: 9, name: "Sep" }, { id: 10, name: "Oct" }, { id: 11, name: "Nov" },
    { id: 12, name: "Dec" },
];

const PUNCH_STATUS = {
    PUNCH_IN: "punch-in", PUNCH_OUT: "punch-out", START_BREAK: "start-break",
    END_BREAK: "end-break", COMPLETED: "completed", REVERT: "revert-punch-out",
} as const;

const tableCols = [
    { key: "checkInTime", label: "Date", sortable: true },
    { key: "checkInTime", label: "Punch In", sortable: true },
    { key: "checkOutTime", label: "Punch Out", sortable: true },
    { key: "productionHours", label: "Production", sortable: true },
    { key: "overtime", label: "Overtime", sortable: true },
];

type AnyRow = Record<string, any>;

function formatDurationHuman(ms: number): string {
    const totalMinutes = Math.floor(Math.abs(ms) / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
}

function isNullDate(d: string | null | undefined): boolean {
    if (!d) return true;
    const str = typeof d === "string" ? d : String(d);
    if (str.startsWith("0001-01-01")) return true;
    const parsed = new Date(str);
    if (isNaN(parsed.getTime())) return true;
    if (parsed.getFullYear() <= 1) return true;
    return false;
}

function formatDateTime(d: string | null | undefined): string {
    if (isNullDate(d)) return "--";
    try { return format(new Date(d!), "dd/MM/yyyy hh:mm a"); } catch { return String(d); }
}

function formatTime(d: string | null | undefined): string {
    if (isNullDate(d)) return "--:--";
    try { return format(new Date(d!), "h:mm a"); } catch { return String(d); }
}

function formatDateShort(d: string | null | undefined): string {
    if (isNullDate(d)) return "";
    try { return format(new Date(d!), "dd/MM/yyyy"); } catch { return String(d); }
}

export default function AttendanceEmployeePage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showWarning } = useMessages();

    const exportColumns: ExportColumn[] = useMemo(() => [
    { header: t('เธงเธฑเธเธ—เธตเน', 'เธงเธฑเธเธ—เธตเน'), key: "checkInTime", format: (v: any) => { if (!v) return ""; try { return format(new Date(v), "dd/MM/yyyy"); } catch { return ""; } } },
    { header: t('Punch In', 'Punch In'), key: "checkInTime", format: (v: any) => { if (!v) return "--:--"; try { return format(new Date(v), "h:mm a"); } catch { return "--:--"; } } },
    { header: t('Punch Out', 'Punch Out'), key: "checkOutTime", format: (v: any) => { if (!v) return "--:--"; try { return format(new Date(v), "h:mm a"); } catch { return "--:--"; } } },
    { header: t('Production (hrs)', 'Production (hrs)'), key: "productionHours", format: (v: any) => v != null ? Number(v).toFixed(2) : "--" },
    { header: t('Overtime', 'Overtime'), key: "overtime", format: (v: any) => v != null ? Number(v).toFixed(2) : "0.00" },
    ], [t]);
    const queryClient = useQueryClient();
    const employeeId = getUserId();
    const empIdNum = employeeId ? parseInt(employeeId) : 0;
    const userProfile = getUserProfile() ?? "";
    const today = new Date();

    // โ”€โ”€ Timer state โ”€โ”€
    const [displayTime, setDisplayTime] = useState("00:00:00");
    const [liveHoursOffset, setLiveHoursOffset] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // โ”€โ”€ Search state โ”€โ”€
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [searchCriteria, setSearchCriteria] = useState({
        selectedDate: null as string | null,
        selectedMonth: today.getMonth() + 1,
        selectedYear: today.getFullYear(),
        employeeId: empIdNum,
    });
    const { configs, loading: configLoading } = useSystemConfig();
    const [hasSetDefaultPageSize, setHasSetDefaultPageSize] = useState(false);

    useEffect(() => {
        if (!configLoading && configs?.pageRecordDefault && !hasSetDefaultPageSize) {
            setPageSize(configs.pageRecordDefault);
            setHasSetDefaultPageSize(true);
        }
    }, [configLoading, configs?.pageRecordDefault, hasSetDefaultPageSize]);
    const [pageSize, setPageSize] = useState(configs?.pageRecordDefault || 10);
    const [sortKey, setSortKey] = useState<string | null>("checkInTime");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

    // โ”€โ”€ Queries โ”€โ”€
    const { data: statusData } = useQuery({
        queryKey: ["checkStatus", empIdNum],
        queryFn: () => attendanceService.checkStatus(empIdNum),
        enabled: empIdNum > 0,
    });
    const buttonStatus = (statusData as AnyRow)?.status ?? "";

    const { data: checkinData } = useQuery({
        queryKey: ["checkinData", empIdNum],
        queryFn: () => attendanceService.getCheckinData(empIdNum),
        enabled: empIdNum > 0,
    });

    const { data: activityResult } = useQuery({
        queryKey: ["activity", empIdNum],
        queryFn: () => attendanceService.getActivity(empIdNum),
        enabled: empIdNum > 0,
    });
    const todayActivity: AnyRow[] = Array.isArray(activityResult) ? activityResult : [];

    const { data: statistics } = useQuery({
        queryKey: ["statistics", empIdNum],
        queryFn: () => attendanceService.getStatistics(empIdNum),
        enabled: empIdNum > 0,
    });

    const { data: yearsData } = useQuery({
        queryKey: ["attendanceYears"],
        queryFn: attendanceService.getYears,
    });
    const years: number[] = useMemo(() => yearsData ?? [2024, 2025, 2026], [yearsData]);

    const { data: searchResult, isLoading: tableLoading } = useQuery({
        queryKey: ["checkInSearch", searchCriteria],
        queryFn: () => attendanceService.search(searchCriteria),
        enabled: empIdNum > 0,
    });

    const allTableData: AnyRow[] = useMemo(() => {
        const raw = searchResult as AnyRow;
        if (Array.isArray(raw?.data)) return raw.data;
        if (Array.isArray(raw)) return raw;
        return [];
    }, [searchResult]);

    // โ”€โ”€ Timer โ”€โ”€
    const latestCheckin: AnyRow | null = useMemo(() => {
        if (Array.isArray(checkinData) && checkinData.length > 0) return checkinData[0] as AnyRow;
        if (checkinData && typeof checkinData === "object" && !Array.isArray(checkinData)) return checkinData as AnyRow;
        return null;
    }, [checkinData]);

    // Compute completed checkin display (no effect needed)
    const completedDisplay = useMemo(() => {
        if (!latestCheckin?.checkInTime || isNullDate(latestCheckin.checkInTime)) return null;
        if (!isNullDate(latestCheckin.checkOutTime)) {
            const diff = new Date(latestCheckin.checkOutTime).getTime() - new Date(latestCheckin.checkInTime).getTime();
            return { time: formatDurationHuman(diff), offset: 0 };
        }
        return null;
    }, [latestCheckin]);

    // Apply completed values outside effect
    const effectiveDisplayTime = completedDisplay ? completedDisplay.time : displayTime;
    const effectiveLiveOffset = completedDisplay ? completedDisplay.offset : liveHoursOffset;

    const todayHours = (statistics?.today ?? 0) + effectiveLiveOffset;
    const weekHours = (statistics?.thisWeek ?? 0) + effectiveLiveOffset;
    const monthHours = (statistics?.thisMonth ?? 0) + effectiveLiveOffset;
    const remaining = (statistics?.remaining ?? 0) - effectiveLiveOffset;
    const overtimeHours = monthHours > 160 ? monthHours - 160 : 0;

    useEffect(() => {
        if (!latestCheckin?.checkInTime || isNullDate(latestCheckin.checkInTime)) return;
        if (!isNullDate(latestCheckin.checkOutTime)) return; // handled by completedDisplay
        const checkInMs = new Date(latestCheckin.checkInTime).getTime();
        const tick = () => {
            const now = Date.now();
            const diffMs = now - checkInMs;
            setDisplayTime(formatDurationHuman(diffMs));
            setLiveHoursOffset(diffMs / (1000 * 60 * 60));
        };
        tick();
        timerRef.current = setInterval(tick, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [latestCheckin]);

    // โ”€โ”€ Handlers โ”€โ”€
    const handleCheckin = (status: string) => {
        if (!navigator.geolocation) {
            showError('SAVE_ERROR', 'Error', 'Geolocation is not supported by your browser.');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const res = await attendanceService.checkIn(empIdNum, position.coords.latitude, position.coords.longitude, userProfile, status);
                    const msg = (res as AnyRow)?.message || "Success";
                    showSuccess('SAVE_SUCCESS', 'Success!', msg);
                    queryClient.invalidateQueries({ queryKey: ["checkStatus"] });
                    queryClient.invalidateQueries({ queryKey: ["checkinData"] });
                    queryClient.invalidateQueries({ queryKey: ["activity"] });
                    queryClient.invalidateQueries({ queryKey: ["statistics"] });
                    queryClient.invalidateQueries({ queryKey: ["checkInSearch"] });
                } catch (err: unknown) {
                    const msg = (err as AnyRow)?.error?.message ?? "เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”";
                    showError('SAVE_ERROR', 'Error!', msg);
                }
            },
            () => { showError('SAVE_ERROR', 'Error', 'Unable to get your location.'); }
        );
    };

    const confirmRevert = () => {
        showWarning('REQUIRED_FIELDS', 'Revert Check Out?', 'Are you sure you want to revert Check Out?').then((result) => { if (result.isConfirmed) handleCheckin(PUNCH_STATUS.REVERT); });
    };

    const handleSearch = () => {
        setSearchCriteria({ selectedDate: selectedDate || null, selectedMonth, selectedYear, employeeId: empIdNum });
    };
    const handleClear = () => {
        const now = new Date();
        setSelectedDate(""); setSelectedMonth(now.getMonth() + 1); setSelectedYear(now.getFullYear());
        setSearchCriteria({ selectedDate: null, selectedMonth: now.getMonth() + 1, selectedYear: now.getFullYear(), employeeId: empIdNum });
    };

    const sortedData = useMemo(() => {
        if (!sortKey) return allTableData;
        return [...allTableData].sort((a, b) => {
            const aVal = a[sortKey] ?? "";
            const bVal = b[sortKey] ?? "";
            return (aVal < bVal ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
        });
    }, [allTableData, sortKey, sortDir]);

    const { paginatedData, currentPage, totalPages, goToPage, changePageSize: changePgSize } =
        usePagination<AnyRow>(sortedData, { pageSize });

    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    const formattedDate = format(today, "dd MMM, yyyy");

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Attendance', 'Attendance')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard') }, { label: t('Attendance', 'Attendance') }]}
            />

            {/* โ”€โ”€ Top 3-column layout โ”€โ”€ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Timesheet / Punch Card */}
                <div className="[background-color:var(--nv-card,#fff)] rounded-xl border border-nv-border shadow-sm">
                    <div className="p-5">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Timesheet <span className="text-gray-400 text-sm font-normal">{formattedDate}</span>
                        </h3>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase">{t('Punch In At', 'Punch In At')}</p>
                                <p className="text-sm font-medium text-gray-700 mt-1">{formatDateTime(latestCheckin?.checkInTime)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase">{t('Punch Out At', 'Punch Out At')}</p>
                                <p className="text-sm font-medium text-gray-700 mt-1">{formatDateTime(latestCheckin?.checkOutTime)}</p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-center">
                            <div className="bg-nv-violet-light rounded-full w-28 h-28 flex items-center justify-center">
                                <span className="text-xl font-bold text-nv-violet">{effectiveDisplayTime}</span>
                            </div>
                        </div>
                        <div className="mt-6 space-y-2">
                            {buttonStatus === PUNCH_STATUS.PUNCH_IN && (
                                <button onClick={() => handleCheckin(PUNCH_STATUS.PUNCH_IN)} className={`w-full ${ui.btnPrimary}`}>{t('Punch In', 'Punch In')}</button>
                            )}
                            {buttonStatus === PUNCH_STATUS.PUNCH_OUT && (
                                <button onClick={() => handleCheckin(PUNCH_STATUS.PUNCH_OUT)} className={`w-full ${ui.btnPrimary}`}>{t('Punch Out', 'Punch Out')}</button>
                            )}
                            {buttonStatus === PUNCH_STATUS.COMPLETED && (
                                <div className="space-y-2">
                                    <button disabled className="w-full px-4 py-2.5 bg-nv-violet text-white rounded-lg opacity-80 font-medium">{t('Punch Completed', 'Punch Completed')}</button>
                                    <button onClick={confirmRevert} className={`w-full ${ui.btnPrimary}`}>{t('Revert Punch Out', 'Revert Punch Out')}</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Column 2: Statistics */}
                <div className="[background-color:var(--nv-card,#fff)] rounded-xl border border-nv-border shadow-sm">
                    <div className="p-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Statistics', 'Statistics')}</h3>
                        <div className="space-y-4">
                            {[
                                { label: t('Today', 'Today'), value: todayHours, max: 8, unit: "/ 8 hrs", color: "bg-nv-violet" },
                                { label: t('This Week', 'This Week'), value: weekHours, max: 40, unit: "/ 40 hrs", color: "bg-nv-warn" },
                                { label: t('This Month', 'This Month'), value: monthHours, max: 160, unit: "/ 160 hrs", color: "bg-nv-violet" },
                                { label: t('Remaining', 'Remaining'), value: remaining, max: 160, unit: "/ 160 hrs", color: "bg-red-500" },
                                { label: t('Overtime', 'Overtime'), value: overtimeHours, max: 100, unit: "", color: "bg-sky-500" },
                            ].map((stat) => (
                                <div key={stat.label}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">{stat.label}</span>
                                        <span className="font-semibold text-gray-800">
                                            {stat.value.toFixed(2)} <span className="text-xs text-gray-400">{stat.unit}</span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className={`${stat.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${Math.min(((stat.value ?? 0) / stat.max) * 100, 100)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Column 3: Today's Activity */}
                <div className="[background-color:var(--nv-card,#fff)] rounded-xl border border-nv-border shadow-sm">
                    <div className="p-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Today Activity', 'Today Activity')}</h3>
                        {todayActivity.length > 0 ? (
                            <ul className="space-y-3">
                                {todayActivity.map((activity: AnyRow, idx: number) => (
                                    <li key={idx} className="space-y-1.5 border-l-2 border-nv-violet/20 pl-3">
                                        <div>
                                            <p className="text-xs text-gray-500">{t('Punch In At', 'Punch In At')}</p>
                                            <p className="text-sm text-gray-700 flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-gray-400" /> {formatDateTime(activity.punchIn)}
                                            </p>
                                        </div>
                                        {activity.breakStart && (
                                            <div>
                                                <p className="text-xs text-gray-500">{t('Break Start At', 'Break Start At')}</p>
                                                <p className="text-sm text-gray-700 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400" /> {formatDateTime(activity.breakStart)}
                                                </p>
                                            </div>
                                        )}
                                        {activity.breakEnd && (
                                            <div>
                                                <p className="text-xs text-gray-500">{t('Break End At', 'Break End At')}</p>
                                                <p className="text-sm text-gray-700 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400" /> {formatDateTime(activity.breakEnd)}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs text-gray-500">{t('Punch Out At', 'Punch Out At')}</p>
                                            <p className="text-sm text-gray-700 flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-gray-400" /> {formatDateTime(activity.punchOut)}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-400">{t('No activity found today.', 'No activity found today.')}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* โ”€โ”€ Search Filter โ”€โ”€ */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                    <FormField label={t('Date', 'Date')}>
                        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={ui.input} />
                    </FormField>
                    <FormField label={t('Select Month', 'Select Month')}>
                        <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className={ui.select}>
                            {MONTHS.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
                        </select>
                    </FormField>
                    <FormField label={t('Select Year', 'Select Year')}>
                        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className={ui.select}>
                            {years.map((y) => (<option key={y} value={y}>{y}</option>))}
                        </select>
                    </FormField>
                    <button onClick={handleSearch} className="px-4 py-2.5 bg-nv-violet text-white rounded-lg text-sm font-medium hover:bg-nv-violet-dark transition-all shadow-sm">{t('Search', 'Search')}</button>
                    <button onClick={handleClear} className={ui.btnSecondary}>{t('Clear', 'Clear')}</button>
                </div>
            </div>

            <ExportButtons data={sortedData} columns={exportColumns} filenamePrefix="attendance_employee" pdfTitle={t('Attendance Employee', 'Attendance Employee')} totalCount={sortedData.length}
            />

            {/* โ”€โ”€ Check-in History Table โ”€โ”€ */}
            <div className={ui.tableWrapper}>
                <TableHeaderBar pageSize={pageSize} onPageSizeChange={(v) => { setPageSize(v); changePgSize(v); }} />

                {tableLoading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="overflow-x-auto">
                        <table className={ui.table}>
                            <thead className={ui.thead}>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-12">#</th>
                                    {tableCols.map((col, ci) => (
                                        <SortableTh key={ci} column={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                    ))}
                                </tr>
                            </thead>
                            <tbody className={ui.tbody}>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((row: AnyRow, idx: number) => (
                                        <tr key={`checkin-${idx}-${row.checkInId}`} className={ui.tr}>
                                            <td className="px-4 py-3 text-gray-400">{(currentPage - 1) * pageSize + idx + 1}</td>
                                            <td className="px-4 py-3 font-medium text-gray-700">{formatDateShort(row.checkInTime)}</td>
                                            <td className="px-4 py-3 text-nv-violet">{formatTime(row.checkInTime)}</td>
                                            <td className={ui.td}>{row.checkOutTime ? formatTime(row.checkOutTime) : <span className="text-gray-300">--:--</span>}</td>
                                            <td className={ui.td}>{row.productionHours != null ? `${Number(row.productionHours).toFixed(2)} hrs` : <span className="text-gray-300">--</span>}</td>
                                            <td className="px-4 py-3 text-amber-600 font-medium">{row.overtime != null ? Number(row.overtime).toFixed(2) : "0.00"}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={7}><EmptyState message={t('No Data Found', 'No Data Found')} /></td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <PaginationBar currentPage={currentPage} totalPages={totalPages} totalData={sortedData.length} pageSize={pageSize} onGoToPage={goToPage} />
            </div>
        </div>
    );
}
