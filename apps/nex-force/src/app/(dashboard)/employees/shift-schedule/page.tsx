"use client";

import { useState , useMemo} from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Calendar } from "lucide-react";
import apiClient from "@/lib/api-client";
import ExportButtons from "@/components/ExportButtons";
import type { ExportColumn } from "@/lib/table-export";
import {
    PageHeader, FormField, EmptyState, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";


export default function ShiftSchedulePage() {
    const { t } = usePageTranslation();

    const exportColumns: ExportColumn[] = useMemo(() => [
    { header: t('ชื่อ Shift', 'ชื่อ Shift'), key: "name1" },
    { header: t('รายละเอียด', 'รายละเอียด'), key: "name2" },
    ], [t]);
    const [searchName, setSearchName] = useState("");
    const [department, setDepartment] = useState("");

    const { data: scheduleData, isLoading } = useQuery({
        queryKey: ["shiftSchedule"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("shift/getShiftSchedule");
            return data?.data || [];
        },
    });

    const { data: departments } = useQuery({
        queryKey: ["departments"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("department/getAllDepartment");
            return data?.data || [];
        },
    });

    const schedules: any[] = scheduleData || [];

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    const days = ["Fri 21", "Sat 22", "Sun 23", "Mon 24", "Tue 25", "Wed 26", "Thu 27", "Fri 28", "Sat 29"];

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Shift & Schedule', 'Shift & Schedule')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard') }, { label: t('Employees', 'Employees') }, { label: t('Shift Scheduling', 'Shift Scheduling') }]}
                actions={
                    <div className="flex gap-2">
                        <button className={`flex items-center gap-2 ${ui.btnPrimary}`}><Calendar className="w-4 h-4" /> Shifts</button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-nv-violet text-white text-sm font-medium rounded-lg hover:bg-nv-violet-dark transition-all shadow-sm"><Plus className="w-4 h-4" /> Assign Shifts</button>
                    </div>
                }
            />

            {/* Search */}
            <div className={ui.filterCard}>
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <FormField label={t('Employee Name', 'Employee Name')}>
                            <input type="text" value={searchName} onChange={e => setSearchName(e.target.value)} placeholder={t('Search...', 'Search...')} className={ui.input} />
                        </FormField>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <FormField label={t('Department', 'Department')}>
                            <select value={department} onChange={e => setDepartment(e.target.value)} className={ui.select}>
                                <option value="">{t('All Departments', 'All Departments')}</option>
                                {departments?.map((d: any) => <option key={d.departmentId} value={d.departmentId}>{d.departmentNameEn}</option>)}
                            </select>
                        </FormField>
                    </div>
                    <div className="flex-1 min-w-[140px]">
                        <FormField label={t('From', 'From')}>
                            <input type="date" className={ui.input} />
                        </FormField>
                    </div>
                    <div className="flex-1 min-w-[140px]">
                        <FormField label={t('To', 'To')}>
                            <input type="date" className={ui.input} />
                        </FormField>
                    </div>
                    <button className="px-4 py-2.5 bg-nv-violet text-white rounded-lg text-sm font-medium hover:bg-nv-violet-dark transition-all shadow-sm">{t('Search', 'Search')}</button>
                </div>
            </div>

            <ExportButtons data={schedules} columns={exportColumns} filenamePrefix="shift_schedule" pdfTitle={t('Shift Schedule', 'Shift Schedule')} totalCount={schedules.length} />

            {/* Table */}
            <div className={ui.tableWrapper}>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1200px] text-sm">
                        <thead className={ui.thead}>
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Scheduled Shift', 'Scheduled Shift')}</th>
                                {days.map(d => <th key={d} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{d}</th>)}
                            </tr>
                        </thead>
                        <tbody className={ui.tbody}>
                            {schedules.length > 0 ? schedules.map((item: any, idx: number) => (
                                <tr key={idx} className={ui.tr}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-nv-violet-light rounded-full flex items-center justify-center text-nv-violet font-semibold text-sm">{item.name1?.[0] || "?"}</div>
                                            <div><div className="text-sm font-medium">{item.name1}</div><div className="text-xs text-gray-400">{item.name2}</div></div>
                                        </div>
                                    </td>
                                    {days.map((_, di) => (
                                        <td key={di} className="px-4 py-3">
                                            <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-2 text-center hover:border-green-400 transition-colors">
                                                <Plus className="w-4 h-4 mx-auto text-gray-400" />
                                            </button>
                                        </td>
                                    ))}
                                </tr>
                            )) : (
                                <tr><td colSpan={10}><EmptyState message={t('No data found', 'No data found')} /></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
