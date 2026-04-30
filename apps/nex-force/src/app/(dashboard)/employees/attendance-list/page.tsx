"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, X, MapPin, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useMessages } from "@/hooks/use-messages";
import apiClient from "@/lib/api-client";
import { usePagination } from "@/hooks/use-pagination";
import { useRowSelection } from "@/hooks/use-row-selection";
import ExportButtons from "@/components/ExportButtons";
import type { ExportColumn } from "@/lib/table-export";
import {
    PageHeader, FormField, LoadingSpinner, EmptyState, PaginationBar, ui, SelectAllCheckbox, RowCheckbox,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

const fmtDate = (v: any) => { if (!v) return ""; try { return format(new Date(v), "dd/MM/yyyy"); } catch { return ""; } };
const fmtTime = (v: any) => { if (!v) return "--:--"; try { return format(new Date(v), "h:mm a"); } catch { return "--:--"; } };


const MONTHS = [
    { id: 0, name: "All" }, { id: 1, name: "Jan" }, { id: 2, name: "Feb" }, { id: 3, name: "Mar" },
    { id: 4, name: "Apr" }, { id: 5, name: "May" }, { id: 6, name: "Jun" }, { id: 7, name: "Jul" },
    { id: 8, name: "Aug" }, { id: 9, name: "Sep" }, { id: 10, name: "Oct" }, { id: 11, name: "Nov" },
    { id: 12, name: "Dec" },
];

function isNullDate(d: string | null | undefined): boolean {
    if (!d) return true;
    const str = String(d);
    if (str.startsWith("0001-01-01")) return true;
    const parsed = new Date(str);
    if (isNaN(parsed.getTime())) return true;
    if (parsed.getFullYear() <= 1) return true;
    return false;
}

function formatTime(d: string | null | undefined): string {
    if (isNullDate(d)) return "--:--";
    try { return format(new Date(d!), "h:mm a"); } catch { return String(d); }
}

function formatDateShort(d: string | null | undefined): string {
    if (isNullDate(d)) return "";
    try { return format(new Date(d!), "dd/MM/yyyy"); } catch { return String(d); }
}

type AnyRow = Record<string, any>;

/* ── Mobile Card for a single attendance row ── */
function AttendanceCard({ row, idx, globalIdx, selection, getGoogleMapUrl, t }: {
    row: AnyRow; idx: number; globalIdx: number;
    selection: any; getGoogleMapUrl: (lat: number | null, lng: number | null) => string;
    t: (key: string, fallback: string) => string;
}) {
    const checkIn = !row.leaveReason && !isNullDate(row.checkInTime) ? formatTime(row.checkInTime) : "--:--";
    const checkOut = !row.leaveReason && !isNullDate(row.checkOutTime) ? formatTime(row.checkOutTime) : "--:--";
    const hours = row.productionHours != null ? `${Number(row.productionHours).toFixed(2)} hrs` : "--";
    const isSelected = selection.isSelected(row.checkInId);

    return (
        <div className={`p-3.5 sm:p-4 border-b border-nv-border-lt last:border-b-0 transition-colors ${isSelected ? 'bg-nv-violet/5' : 'hover:bg-gray-50/50'}`}>
            {/* Top row: checkbox + employee info + date */}
            <div className="flex items-start gap-2.5">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => selection.toggle (row.checkInId)}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-nv-violet focus:ring-nv-violet/30 cursor-pointer accent-[#6366F1] flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            <span className="text-xs text-nv-text-dim font-medium">#{globalIdx}</span>
                            <span className="mx-1.5 text-gray-300">·</span>
                            <span className="text-xs font-semibold text-nv-violet">{row.employeeCode}</span>
                        </div>
                        <span className="text-xs font-medium text-gray-500 whitespace-nowrap bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                            {formatDateShort(row.workDate) || "--"}
                        </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{row.employeeName}</p>
                    <p className="text-xs text-gray-500 truncate">{row.departmentName}</p>
                </div>
            </div>

            {/* Check-in / Check-out row */}
            <div className="mt-3 ml-6.5 grid grid-cols-2 gap-3">
                <div className="bg-emerald-50/60 rounded-lg px-3 py-2">
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">Check In</p>
                    <p className="text-sm font-bold text-emerald-700">{checkIn}</p>
                    {row.checkInLat && row.checkInLong ? (
                        <a href={getGoogleMapUrl(row.checkInLat, row.checkInLong)} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-nv-violet hover:underline mt-1">
                            <MapPin className="w-3 h-3" /> Map
                        </a>
                    ) : null}
                </div>
                <div className="bg-orange-50/60 rounded-lg px-3 py-2">
                    <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-wider mb-0.5">Check Out</p>
                    <p className="text-sm font-bold text-orange-700">{checkOut}</p>
                    {row.checkOutLat && row.checkOutLong ? (
                        <a href={getGoogleMapUrl(row.checkOutLat, row.checkOutLong)} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-nv-violet hover:underline mt-1">
                            <MapPin className="w-3 h-3" /> Map
                        </a>
                    ) : null}
                </div>
            </div>

            {/* Hours + Remark */}
            <div className="mt-2 ml-6.5 flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 text-gray-600">
                    <span className="font-medium text-gray-400">Total:</span>
                    <span className="font-bold text-gray-700">{hours}</span>
                </span>
                <span className="text-gray-300">|</span>
                <span className="inline-flex items-center gap-1 text-gray-600">
                    <span className="font-medium text-gray-400">OT:</span>
                    <span className="font-bold text-gray-700">0.00 hrs</span>
                </span>
                {row.leaveReason && (
                    <>
                        <span className="text-gray-300">|</span>
                        <span className="text-amber-600 font-medium truncate max-w-[120px]" title={row.leaveReason}>{row.leaveReason}</span>
                    </>
                )}
            </div>
        </div>
    );
}

export default function AttendanceListPage() {
    const { t } = usePageTranslation();
    const { showError } = useMessages();

    const exportColumns: ExportColumn[] = useMemo(() => [
        { header: t('รหัสพนักงาน', 'รหัสพนักงาน'), key: "employeeCode" },
        { header: t('ชื่อพนักงาน', 'ชื่อพนักงาน'), key: "employeeName" },
        { header: t('แผนก', 'แผนก'), key: "departmentName" },
        { header: t('วันที่', 'วันที่'), key: "workDate", format: fmtDate },
        { header: t('Check In', 'Check In'), key: "checkInTime", format: (v: any, row: any) => row.leaveReason ? "--" : fmtTime(v) },
        { header: t('Check Out', 'Check Out'), key: "checkOutTime", format: (v: any, row: any) => row.leaveReason ? "--" : fmtTime(v) },
        { header: t('Total Hour', 'Total Hour'), key: "productionHours", format: (v: any) => v != null ? `${Number(v).toFixed(2)} hrs` : "--" },
        { header: t('Overtime', 'Overtime'), key: "overtime", format: () => "0.00 hrs" },
        { header: t('Remark', 'Remark'), key: "leaveReason" },
    ], [t]);
    const currentYear = new Date().getFullYear();
    const years = [
        { id: currentYear, value: currentYear },
        { id: currentYear - 1, value: currentYear - 1 },
    ];

    // ── State ──
    const [employeeCode, setEmployeeCode] = useState("");
    const [employeeName, setEmployeeName] = useState("");
    const [departmentId, setDepartmentId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [pageSize, setPageSize] = useState(10);

    // ── Departments ──
    const { data: deptResult } = useQuery({
        queryKey: ["departments"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("departments/getAllDepartment");
            return data?.data ?? [];
        },
    });
    const departmentOptions: AnyRow[] = useMemo(() => (Array.isArray(deptResult) ? deptResult : []), [deptResult]);

    // ── Search mutation ──
    const searchMutation = useMutation({
        mutationFn: async (searchCriteria: Record<string, unknown>) => {
            const { data } = await apiClient.post<AnyRow[]>("attendanceList/search", searchCriteria);
            return data || [];
        },
        onError: () => { showError('SAVE_ERROR', 'Error!', 'Failed to load attendance records'); },
    });

    const attendanceData: AnyRow[] = useMemo(() => {
        const raw = Array.isArray(searchMutation.data) ? searchMutation.data : [];
        // Sort by workDate descending (newest first)
        return [...raw].sort((a, b) => {
            const dateA = a.workDate ? new Date(a.workDate).getTime() : 0;
            const dateB = b.workDate ? new Date(b.workDate).getTime() : 0;
            return dateB - dateA;
        });
    }, [searchMutation.data]);

    const { paginatedData, currentPage, totalPages, goToPage, changePageSize: changePgSize } =
        usePagination(attendanceData, { pageSize });


    // ── Row Selection ──
    const getRowId = useCallback((row: any) => row.checkInId, []);
    const selection = useRowSelection(paginatedData, getRowId);
    // ── Search handler ──
    const searchCheckIns = () => {
        const criteria: Record<string, unknown> = {
            selectedDate: selectedDate ? new Date(selectedDate) : null,
            selectedYear,
            employeeCode: employeeCode || null,
            employeeName: employeeName || null,
            departmentId: departmentId || null,
        };
        if (selectedMonth && selectedMonth > 0) criteria.selectedMonth = selectedMonth;
        searchMutation.mutate(criteria);
    };

    // Initial search on mount
    const [hasInitialized, setHasInitialized] = useState(false);
    if (!hasInitialized) {
        setHasInitialized(true);
        setTimeout(() => searchCheckIns(), 0);
    }

    const clear = () => {
        setEmployeeCode(""); setEmployeeName(""); setDepartmentId(null);
        setSelectedDate(""); setSelectedMonth(null); setSelectedYear(currentYear);
        searchMutation.mutate({
            selectedDate: null, selectedYear: currentYear,
            employeeCode: null, employeeName: null, departmentId: null,
        });
    };

    const getGoogleMapUrl = (lat: number | null, long: number | null): string => {
        if (!lat || !long) return "";
        return `https://www.google.com/maps?q=${lat},${long}`;
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Attendance List', 'Attendance List')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard') }, { label: t('Attendance List', 'Attendance List') }]}
            />

            {/* ── Search Filter ── */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField label={t('Employee Id', 'Employee Id')}>
                        <input type="text" value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} className={ui.input} placeholder="e.g. EMP-001" />
                    </FormField>
                    <FormField label={t('Name', 'Name')}>
                        <input type="text" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} className={ui.input} placeholder="e.g. John Doe" />
                    </FormField>
                    <FormField label={t('Department', 'Department')}>
                        <select value={departmentId ?? ""} onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : null)} className={ui.select}>
                            <option value="">select</option>
                            {departmentOptions.map((d) => (
                                <option key={d.departmentId} value={d.departmentId}>
                                    {d.departmentNameTh || d.departmentNameEn || d.departmentCode}
                                </option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label={t('Date', 'Date')}>
                        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={ui.input} />
                    </FormField>
                    <FormField label={t('Select Month', 'Select Month')}>
                        <select value={selectedMonth ?? 0} onChange={(e) => setSelectedMonth(Number(e.target.value) > 0 ? Number(e.target.value) : null)} className={ui.select}>
                            {MONTHS.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
                        </select>
                    </FormField>
                    <FormField label={t('Select Year', 'Select Year')}>
                        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className={ui.select}>
                            {years.map((y) => (<option key={y.id} value={y.id}>{y.value}</option>))}
                        </select>
                    </FormField>
                    <div className="flex items-end gap-3 lg:col-span-2">
                        <button type="button" onClick={searchCheckIns} disabled={searchMutation.isPending}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-nv-violet text-white rounded-lg hover:bg-nv-violet-dark transition-colors disabled:opacity-70">
                            {searchMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Search
                        </button>
                        <button type="button" onClick={clear} className={`flex-1 flex items-center justify-center gap-2 ${ui.btnSecondary}`}>
                            <X className="w-4 h-4" /> Clear
                        </button>
                    </div>
                </div>
            </div>

            <ExportButtons data={attendanceData} columns={exportColumns} filenamePrefix="attendance_list" pdfTitle={t('Attendance List', 'Attendance List')} totalCount={attendanceData.length}
                selectedData={selection.getSelectedRows(attendanceData)}
                selectedCount={selection.selectedCount}
                onClearSelection={selection.clearSelection}
            />

            {/* ── Data Display ── */}
            <div className={ui.tableWrapper}>
                <div className="flex items-center gap-2 px-4 py-3 border-b text-sm text-gray-600">
                    Show
                    <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); changePgSize(Number(e.target.value)); }} className="px-2 py-1 border border-gray-200 rounded-md bg-white text-sm">
                        <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option>
                    </select>
                    entries
                </div>

                {/* ── Desktop Table (hidden on mobile) ── */}
                <div className="hidden md:block overflow-x-auto">
                    <table className={ui.table}>
                        <thead className={ui.thead}>
                            <tr>
                                    <SelectAllCheckbox checked={selection.allSelected} indeterminate={selection.indeterminate} onChange={selection.toggleAll} />
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-12">#</th>
                                {["Employee ID", "Name", "Department", "Date", "Check In", "Location In", "Check Out", "Location Out", "Total Hour", "Overtime", "Remark"].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className={ui.tbody}>
                            {searchMutation.isPending && attendanceData.length === 0 ? (
                                <tr><td colSpan={13}><LoadingSpinner /></td></tr>
                            ) : paginatedData.length === 0 ? (
                                <tr><td colSpan={13}><EmptyState message={t('No Data Found', 'No Data Found')} /></td></tr>
                            ) : (
                                paginatedData.map((row: AnyRow, idx: number) => (
                                    <tr key={`checkin-${idx}-${row.checkInId}`} className={selection.isSelected(row.checkInId) ? ui.trSelected : ui.tr}>
                                        <RowCheckbox checked={selection.isSelected(row.checkInId)} onChange={() => selection.toggle (row.checkInId)} />
                                        <td className="px-4 py-3 text-gray-500">{(currentPage - 1) * pageSize + idx + 1}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{row.employeeCode}</td>
                                        <td className="px-4 py-3 font-medium">{row.employeeName}</td>
                                        <td className={ui.td}>{row.departmentName}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{formatDateShort(row.workDate) || "--"}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{!row.leaveReason && !isNullDate(row.checkInTime) ? formatTime(row.checkInTime) : <span className="text-gray-300">--:--</span>}</td>
                                        <td className="px-4 py-3">
                                            {row.checkInLat && row.checkInLong ? (
                                                <a href={getGoogleMapUrl(row.checkInLat, row.checkInLong)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-nv-violet hover:underline" title={t('Open in Google Maps', 'Open in Google Maps')}>
                                                    <MapPin className="w-3.5 h-3.5" /> View Map
                                                </a>
                                            ) : (<span className="text-gray-300">--</span>)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">{!row.leaveReason && !isNullDate(row.checkOutTime) ? formatTime(row.checkOutTime) : <span className="text-gray-300">--:--</span>}</td>
                                        <td className="px-4 py-3">
                                            {row.checkOutLat && row.checkOutLong ? (
                                                <a href={getGoogleMapUrl(row.checkOutLat, row.checkOutLong)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-nv-violet hover:underline" title={t('Open in Google Maps', 'Open in Google Maps')}>
                                                    <MapPin className="w-3.5 h-3.5" /> View Map
                                                </a>
                                            ) : (<span className="text-gray-300">--</span>)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">{row.productionHours != null ? `${Number(row.productionHours).toFixed(2)} hrs` : <span className="text-gray-300">--</span>}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">0.00 hrs</td>
                                        <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate">{row.leaveReason || ""}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Mobile Cards (hidden on desktop) ── */}
                <div className="md:hidden">
                    {/* Select all bar for mobile */}
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-nv-border-lt bg-nv-bg">
                        <input
                            type="checkbox"
                            checked={selection.allSelected}
                            ref={(el) => { if (el) el.indeterminate = selection.indeterminate; }}
                            onChange={selection.toggleAll}
                            className="w-4 h-4 rounded border-gray-300 text-nv-violet focus:ring-nv-violet/30 cursor-pointer accent-[#6366F1]"
                        />
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Select All</span>
                        {selection.selectedCount > 0 && (
                            <span className="text-[10px] font-bold text-nv-violet bg-nv-violet/10 px-2 py-0.5 rounded-full">
                                {selection.selectedCount} selected
                            </span>
                        )}
                    </div>

                    {searchMutation.isPending && attendanceData.length === 0 ? (
                        <LoadingSpinner />
                    ) : paginatedData.length === 0 ? (
                        <EmptyState message={t('No Data Found', 'No Data Found')} />
                    ) : (
                        paginatedData.map((row: AnyRow, idx: number) => (
                            <AttendanceCard
                                key={`card-${idx}-${row.checkInId}`}
                                row={row}
                                idx={idx}
                                globalIdx={(currentPage - 1) * pageSize + idx + 1}
                                selection={selection}
                                getGoogleMapUrl={getGoogleMapUrl}
                                t={t}
                            />
                        ))
                    )}
                </div>

                <PaginationBar currentPage={currentPage} totalPages={totalPages} totalData={attendanceData.length} pageSize={pageSize} onGoToPage={goToPage} />
            </div>
        </div>
    );
}
