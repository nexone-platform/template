"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getUserId } from "@/lib/auth";
import { attendanceService } from "@/services/attendance.service";
import { LoadingSpinner, EmptyState } from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";
import { Clock } from "lucide-react";

type AnyRow = Record<string, any>;

function formatTime(d: string | null | undefined): string {
    if (!d || d.startsWith("0001-01-01")) return "--:--";
    try { return format(new Date(d), "h:mm a"); } catch { return String(d); }
}

function formatDateShort(d: string | null | undefined): string {
    if (!d || d.startsWith("0001-01-01")) return "";
    try { return format(new Date(d), "dd/MM/yyyy"); } catch { return String(d); }
}

export default function MobileAttendanceEmployeePage() {
    const { t } = usePageTranslation();
    const [isMounted, setIsMounted] = useState(false);
    const [employeeId, setEmployeeId] = useState<string | null>(null);

    useEffect(() => {
        setIsMounted(true);
        setEmployeeId(getUserId());
    }, []);

    const empIdNum = employeeId ? parseInt(employeeId) : 0;
    const today = new Date();

    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());

    const searchCriteria = useMemo(() => ({
        selectedDate: null,
        selectedMonth,
        selectedYear,
        employeeId: empIdNum,
    }), [selectedMonth, selectedYear, empIdNum]);

    // Queries
    const { data: statistics } = useQuery({
        queryKey: ["statistics", empIdNum],
        queryFn: () => attendanceService.getStatistics(empIdNum),
        enabled: empIdNum > 0,
    });

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

    // Display values
    const todayHours = statistics?.today ?? 0;
    const weekHours = statistics?.thisWeek ?? 0;
    const monthHours = statistics?.thisMonth ?? 0;
    const overtimeHours = monthHours > 160 ? monthHours - 160 : 0;

    if (!isMounted) return null;

    return (
        <div className="flex flex-col pt-6 px-4 pb-4">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{t('Attendance', 'Attendance')}</h2>
                <p className="text-gray-500 text-sm">Your time statistics and history</p>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-nv-cyan/5 rounded-bl-[100px] -z-0"></div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 z-10 relative">{t('Statistics', 'Statistics')}</h3>
                <div className="space-y-4 z-10 relative">
                    {[
                        { label: t('Today', 'Today'), value: todayHours, max: 8, unit: "/ 8 hrs", color: "bg-nv-violet" },
                        { label: t('This Week', 'This Week'), value: weekHours, max: 40, unit: "/ 40 hrs", color: "bg-amber-500" },
                        { label: t('This Month', 'This Month'), value: monthHours, max: 160, unit: "/ 160 hrs", color: "bg-nv-cyan" },
                        { label: t('Overtime', 'Overtime'), value: overtimeHours, max: 100, unit: "hrs", color: "bg-orange-500" },
                    ].map((stat) => (
                        <div key={stat.label}>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-gray-600 font-medium">{stat.label}</span>
                                <span className="font-semibold text-gray-800">
                                    {stat.value.toFixed(2)} <span className="text-gray-400 font-normal">{stat.unit}</span>
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div className={`${stat.color} h-1.5 rounded-full`} style={{ width: `${Math.min(((stat.value ?? 0) / stat.max) * 100, 100)}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-white border border-gray-100 rounded-xl px-3 py-2 flex items-center shadow-sm">
                    <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(Number(e.target.value))} 
                        className="w-full bg-transparent text-sm text-gray-700 font-medium outline-none"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'short' })}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1 bg-white border border-gray-100 rounded-xl px-3 py-2 flex items-center shadow-sm">
                    <select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(Number(e.target.value))} 
                        className="w-full bg-transparent text-sm text-gray-700 font-medium outline-none"
                    >
                        {[today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* History List */}
            <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('History', 'History')}</h3>

            <div className="space-y-3">
                {tableLoading ? (
                    <LoadingSpinner />
                ) : allTableData.length > 0 ? (
                    allTableData.map((row: AnyRow, idx: number) => (
                        <div key={idx} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-nv-violet/10 flex flex-col items-center justify-center text-nv-violet">
                                    <span className="text-[10px] font-medium uppercase leading-none mb-1">
                                        {formatDateShort(row.checkInTime).split('/')[1] ? new Date(0, parseInt(formatDateShort(row.checkInTime).split('/')[1]) - 1).toLocaleString('default', { month: 'short' }) : ''}
                                    </span>
                                    <span className="text-lg font-bold leading-none">
                                        {formatDateShort(row.checkInTime).split('/')[0]}
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-800 mb-0.5">
                                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                        {formatTime(row.checkInTime)} 
                                        <span className="text-gray-400 mx-1">-</span>
                                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                                        {formatTime(row.checkOutTime)}
                                    </div>
                                    <div className="text-xs text-gray-500 flex gap-3">
                                        <span>Prod: <span className="font-medium text-gray-700">{row.productionHours != null ? Number(row.productionHours).toFixed(2) : '--'}h</span></span>
                                        {Number(row.overtime) > 0 && <span className="text-orange-500">OT: {Number(row.overtime).toFixed(1)}h</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-6"><EmptyState message={t('No Data Found', 'No Data Found')} /></div>
                )}
            </div>
        </div>
    );
}
