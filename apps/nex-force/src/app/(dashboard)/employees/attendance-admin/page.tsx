"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, X, Calendar, Bed } from "lucide-react";
import { attendanceService } from "@/services/attendance.service";
import { employeeService } from "@/services/employee.service";

import ExportButtons from "@/components/ExportButtons";
import type { ExportColumn } from "@/lib/table-export";
import {
    PageHeader, FormField, LoadingSpinner, EmptyState, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";


const MONTHS = [
    { id: 0, name: "-" }, { id: 1, name: "Jan" }, { id: 2, name: "Feb" }, { id: 3, name: "Mar" },
    { id: 4, name: "Apr" }, { id: 5, name: "May" }, { id: 6, name: "Jun" }, { id: 7, name: "Jul" },
    { id: 8, name: "Aug" }, { id: 9, name: "Sep" }, { id: 10, name: "Oct" }, { id: 11, name: "Nov" },
    { id: 12, name: "Dec" },
];

const YEARS = [
    { id: 0, value: "-" }, { id: 2026, value: 2026 }, { id: 2025, value: 2025 },
    { id: 2024, value: 2024 }, { id: 2023, value: 2023 },
];

type AnyRow = Record<string, any>;

function getAttendanceCellStyle(color: string) {
    switch (color) {
        case "#008000": return { icon: "check", bg: "bg-green-600", text: "text-white" };
        case "#66D373": return { icon: "check", bg: "bg-green-400", text: "text-white" };
        case "#FFC95D": return { icon: "check", bg: "bg-yellow-400", text: "text-white" };
        case "#D3D3D3": return { icon: "close", bg: "bg-gray-300", text: "text-white" };
        case "#696969": return { icon: "calendar", bg: "bg-gray-500", text: "text-white" };
        case "#FFAF69": return { icon: "cogs", bg: "bg-orange-400", text: "text-white" };
        case "#4D5154": return { icon: "bed", bg: "bg-gray-600", text: "text-white" };
        case "#F74262": return { icon: "close", bg: "bg-red-500", text: "text-white" };
        default: return { icon: "check", bg: "bg-green-400", text: "text-white" };
    }
}

function CellIcon({ type }: { type: string }) {
    switch (type) {
        case "check": return <Check className="w-3 h-3" />;
        case "close": return <X className="w-3 h-3" />;
        case "calendar": return <Calendar className="w-3 h-3" />;
        case "bed": return <Bed className="w-3 h-3" />;
        case "cogs": return <span className="text-[9px]">⚙</span>;
        default: return <Check className="w-3 h-3" />;
    }
}

export default function AttendanceAdminPage() {
    const { t } = usePageTranslation();

    const exportColumns: ExportColumn[] = useMemo(() => [
    { header: t('พนักงาน', 'พนักงาน'), key: "name" },
    { header: t('วันทำงาน', 'วันทำงาน'), key: "presentDays" },
    { header: t('วันขาด', 'วันขาด'), key: "absentDays" },
    { header: t('ลา', 'ลา'), key: "leaveDays" },
    { header: t('วันหยุด', 'วันหยุด'), key: "holidayDays" },
    ], [t]);
    const today = new Date();
    const [selectedEmployee, setSelectedEmployee] = useState<number | "">("");
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());

    const [searchCriteria, setSearchCriteria] = useState({
        month: today.getMonth() + 1,
        year: today.getFullYear(),
        employeeId: undefined as number | undefined,
    });

    const { data: employeesResult } = useQuery({
        queryKey: ["employees", "autocomplete"],
        queryFn: employeeService.getForAutocomplete,
    });

    const { data: attendanceData, isLoading } = useQuery({
        queryKey: ["attendance", "admin", searchCriteria],
        queryFn: () => attendanceService.getAttendanceData(searchCriteria),
        enabled: !!(searchCriteria.year && searchCriteria.month),
    });

    const employees: AnyRow[] = useMemo(() => (Array.isArray(employeesResult?.data) ? employeesResult.data : []), [employeesResult]);
    const checkInallData: AnyRow[] = useMemo(() => (Array.isArray(attendanceData) ? attendanceData : []), [attendanceData]);

    const daysInMonth = useMemo(() => {
        if (!searchCriteria.month || !searchCriteria.year) return [];
        const count = new Date(searchCriteria.year, searchCriteria.month, 0).getDate();
        return Array.from({ length: count }, (_, i) => i + 1);
    }, [searchCriteria.month, searchCriteria.year]);

    const handleSearch = () => {
        setSearchCriteria({
            month: selectedMonth,
            year: selectedYear,
            employeeId: selectedEmployee ? Number(selectedEmployee) : undefined,
        });
    };

    const handleClear = () => {
        const now = new Date();
        setSelectedMonth(now.getMonth() + 1);
        setSelectedYear(now.getFullYear());
        setSelectedEmployee("");
        setSearchCriteria({ month: now.getMonth() + 1, year: now.getFullYear(), employeeId: undefined });
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Attendance', 'Attendance')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard') }, { label: t('Attendance', 'Attendance') }]}
            />

            {/* ── Search Filter ── */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                    <FormField label={t('Employee Name', 'Employee Name')}>
                        <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value ? Number(e.target.value) : "")} className={ui.select}>
                            <option value="">{t('Select Employee', 'Select Employee')}</option>
                            {employees.map((emp: AnyRow) => (
                                <option key={emp.id} value={emp.id}>{emp.firstNameEn} {emp.lastNameEn}</option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label={t('Select Month', 'Select Month')} required>
                        <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className={ui.select}>
                            {MONTHS.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
                        </select>
                    </FormField>
                    <FormField label={t('Select Year', 'Select Year')} required>
                        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className={ui.select}>
                            {YEARS.map((y) => (<option key={y.id} value={y.id}>{String(y.value)}</option>))}
                        </select>
                    </FormField>
                    <button onClick={handleSearch} className="px-4 py-2.5 bg-nv-violet text-white rounded-lg text-sm font-medium hover:bg-nv-violet-dark transition-all shadow-sm">{t('Search', 'Search')}</button>
                    <button onClick={handleClear} className={ui.btnSecondary}>{t('Clear', 'Clear')}</button>
                </div>
            </div>

            {/* ── Export Buttons ── */}
            {(() => {
                const exportData = checkInallData.map((emp: AnyRow) => {
                    const att = emp.attendance || [];
                    let present = 0, absent = 0, leave = 0, holiday = 0;
                    att.forEach((dayArr: AnyRow[]) => {
                        if (!dayArr || dayArr.length === 0) return;
                        dayArr.forEach((d: AnyRow) => {
                            switch (d.color) {
                                case "#008000": case "#66D373": case "#FFC95D": present++; break;
                                case "#D3D3D3": case "#F74262": absent++; break;
                                case "#4D5154": leave++; break;
                                case "#696969": holiday++; break;
                                default: present++;
                            }
                        });
                    });
                    return { name: emp.name, presentDays: present, absentDays: absent, leaveDays: leave, holidayDays: holiday };
                });
                return (
                    <ExportButtons data={exportData} columns={exportColumns} filenamePrefix="attendance_admin" pdfTitle={t('Attendance Admin Summary', 'Attendance Admin Summary')} totalCount={exportData.length}
            />
                );
            })()}

            {/* ── Attendance Table ── */}
            <div className={ui.tableWrapper}>
                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap sticky left-0 bg-gray-50 z-10 min-w-[180px]">
                                        Employee
                                    </th>
                                    {daysInMonth.map((day) => (
                                        <th key={day} className="px-1 py-3 text-center text-xs font-semibold text-gray-500 min-w-[48px]">{day}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className={ui.tbody}>
                                {checkInallData.length > 0 ? (
                                    checkInallData.map((employee: AnyRow, idx: number) => (
                                        <tr key={`emp-${idx}-${employee.employeeId}`} className={ui.tr}>
                                            <td className="px-4 py-2 whitespace-nowrap sticky left-0 bg-white z-10 border-r">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                                                        {(employee.name || "?").charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-gray-900 text-sm">{employee.name}</span>
                                                </div>
                                            </td>
                                            {(employee.attendance || []).map((dayArray: AnyRow[], dayIdx: number) => {
                                                if (!dayArray || dayArray.length === 0) {
                                                    return (<td key={dayIdx} className="px-1 py-2 text-center"><div className="w-full min-h-[28px]" /></td>);
                                                }
                                                return (
                                                    <td key={dayIdx} className="px-0.5 py-1 text-center">
                                                        <div className="flex flex-col gap-0.5" style={{ display: "grid", gridTemplateRows: `repeat(${dayArray.length}, minmax(10px, 1fr))` }}>
                                                            {dayArray.map((day: AnyRow, evIdx: number) => {
                                                                const style = getAttendanceCellStyle(day.color);
                                                                return (
                                                                    <div key={evIdx} className={`${style.bg} ${style.text} rounded px-0.5 py-0.5 flex flex-col items-center justify-center text-[8px] leading-tight min-h-[24px]`} title={day.time || ""}>
                                                                        {day.time !== "N/A" ? (<><CellIcon type={style.icon} /><span className="mt-0.5 whitespace-nowrap">{day.time}</span></>) : (<span>{day.time}</span>)}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={daysInMonth.length + 1}><EmptyState message="No data found. Select a month/year and click Search." /></td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
