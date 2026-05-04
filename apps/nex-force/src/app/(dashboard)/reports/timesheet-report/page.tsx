"use client";

import { useEffect,  useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    useTimesheetReport,
    useProjects,
    TimesheetReportDto,
} from "@/hooks/use-report";
import { usePagination } from "@/hooks/use-pagination";
import ExportButtons from "@/components/ExportButtons";
import type { ExportColumn } from "@/lib/table-export";
import { Briefcase } from "lucide-react";
import {
    PageHeader,
    TableHeaderBar,
    SortableTh,
    EmptyState,
    LoadingSpinner,
    PaginationBar,
    ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";
import { useSystemConfig } from '@nexone/ui';

/* ── Month names ── */
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export default function TimesheetReportPage() {
    const { t } = usePageTranslation();

    const exportColumns: ExportColumn[] = [
        { header: "#", key: "_index" },
        { header: t('Employee ID', 'Employee ID'), key: "employeeId" },
        { header: t('Employee Name', 'Employee Name'), key: "employeeName" },
        { header: t('Project Name', 'Project Name'), key: "projectName" },
        { header: t('Month/Year', 'Month/Year'), key: "_monthYear",
            format: (_, row) => `${row.month}/${row.year}` },
        { header: t('Work Hours', 'Work Hours'), key: "totalWorkHours" },
        { header: t('OT Hours', 'OT Hours'), key: "totalOTHours" },
        { header: t('Task Count', 'Task Count'), key: "taskCount" },
    ];

    const tableColumns = [
    { key: "#", label: "#", width: "w-10" },
    { key: "employeeName", label: t('Employee', 'Employee'), sortable: true },
    { key: "projectName", label: t('Project', 'Project'), sortable: true },
    { key: "month", label: t('Month/Year', 'Month/Year'), align: "center" as const },
    { key: "totalWorkHours", label: t('Work Hours', 'Work Hours'), sortable: true, align: "right" as const },
    { key: "totalOTHours", label: t('OT Hours', 'OT Hours'), sortable: true, align: "right" as const },
    { key: "taskCount", label: t('Task Count', 'Task Count'), align: "center" as const },
    ];

    const router = useRouter();

    /* ── Angular: all null by default ── */
    const [projectId, setProjectId] = useState<number | undefined>(undefined);
    const [month, setMonth] = useState<number | undefined>(undefined);
    const [year, setYear] = useState<number | undefined>(undefined);

    const [tempFilters, setTempFilters] = useState({
        projectId: undefined as number | undefined,
        month: undefined as number | undefined,
        year: undefined as number | undefined,
    });

    /* ── Pagination / sorting ── */
    const { configs, loading: configLoading } = useSystemConfig();
    const [hasSetDefaultPageSize, setHasSetDefaultPageSize] = useState(false);

    useEffect(() => {
        if (!configLoading && configs?.pageRecordDefault && !hasSetDefaultPageSize) {
            setPageSize(configs.pageRecordDefault);
            setHasSetDefaultPageSize(true);
        }
    }, [configLoading, configs?.pageRecordDefault, hasSetDefaultPageSize]);
    const [pageSize, setPageSize] = useState(configs?.pageRecordDefault || 10);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    /* ── Data fetching ── */
    const { data: projects } = useProjects();
    const { data: reportData, isLoading } = useTimesheetReport(projectId, month, year);

    const currentYear = new Date().getFullYear();
    const availableYears = useMemo(
        () => Array.from({ length: 5 }, (_, i) => currentYear - 2 + i),
        [currentYear]
    );

    const allData = useMemo<TimesheetReportDto[]>(() => reportData?.data || [], [reportData?.data]);

    /* ── Sorting ── */
    const sorted = useMemo(() => {
        if (!sortKey) return allData;
        return [...allData].sort((a: any, b: any) => {
            const va = a[sortKey] ?? "";
            const vb = b[sortKey] ?? "";
            if (typeof va === "number" && typeof vb === "number") {
                return sortDir === "asc" ? va - vb : vb - va;
            }
            return sortDir === "asc"
                ? String(va).localeCompare(String(vb))
                : String(vb).localeCompare(String(va));
        });
    }, [allData, sortKey, sortDir]);

    const { currentPage, totalPages, paginatedData, goToPage, changePageSize: changePgSize } =
        usePagination(sorted, { pageSize });

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const handleSearch = () => {
        setProjectId(tempFilters.projectId);
        setMonth(tempFilters.month);
        setYear(tempFilters.year);
    };

    const handleClear = () => {
        const reset = { projectId: undefined as number | undefined, month: undefined as number | undefined, year: undefined as number | undefined };
        setTempFilters(reset);
        setProjectId(undefined);
        setMonth(undefined);
        setYear(undefined);
    };

    const navigateProfile = (id: number) => {
        router.push(`/employees/profile/${id}`);
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Timesheet Summary Report', 'Timesheet Summary Report')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Reports', 'Reports') },
                    { label: t('Timesheet Report', 'Timesheet Report') },
                ]}
            />

            <ExportButtons
                data={sorted.map((d, i) => ({ ...d, _index: i + 1, _monthYear: `${d.month}/${d.year}` }))}
                columns={exportColumns}
                filenamePrefix="timesheet_report"
                pdfTitle={t('Timesheet Summary Report', 'Timesheet Summary Report')}
                totalCount={sorted.length}
            />

            {/* Search Filters */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('Project', 'Project')}</label>
                        <select className={ui.select} value={tempFilters.projectId ?? ""}
                            onChange={(e) => setTempFilters({ ...tempFilters, projectId: e.target.value ? Number(e.target.value) : undefined })}>
                            <option value="">{t('All Projects', 'All Projects')}</option>
                            {projects?.map((p) => (
                                <option key={p.projectId} value={p.projectId}>{p.projectName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('Month', 'Month')}</label>
                        <select className={ui.select} value={tempFilters.month ?? ""}
                            onChange={(e) => setTempFilters({ ...tempFilters, month: e.target.value ? Number(e.target.value) : undefined })}>
                            <option value="">{t('All Months', 'All Months')}</option>
                            {MONTH_NAMES.map((name, i) => (
                                <option key={i + 1} value={i + 1}>{name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('Year', 'Year')}</label>
                        <select className={ui.select} value={tempFilters.year ?? ""}
                            onChange={(e) => setTempFilters({ ...tempFilters, year: e.target.value ? Number(e.target.value) : undefined })}>
                            <option value="">{t('All Years', 'All Years')}</option>
                            {availableYears.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-4">
                    <button onClick={handleClear} className={ui.btnSecondary}>{t('Clear', 'Clear')}</button>
                    <button onClick={handleSearch} className={ui.btnPrimary}>{t('Search', 'Search')}</button>
                </div>
            </div>

            {/* Table Section */}
            <div className={ui.tableWrapper}>
                <TableHeaderBar
                    pageSize={pageSize}
                    onPageSizeChange={(v) => { setPageSize(v); changePgSize(v); }}
                />

                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="overflow-x-auto">
                        <table className={ui.table}>
                            <thead className={ui.thead}>
                                <tr>
                                    {tableColumns.map((col) => (
                                        <SortableTh key={col.key} column={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                    ))}
                                </tr>
                            </thead>
                            <tbody className={ui.tbody}>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item: any, idx: number) => {
                                        const rowNum = (currentPage - 1) * pageSize + idx + 1;
                                        return (
                                            <tr key={`${item.employeeId}-${item.projectId}-${item.month}-${item.year}`} className={ui.tr}>
                                                <td className={ui.tdIndex}>{rowNum}</td>
                                                <td className={ui.td}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 bg-nv-violet-light rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                                            {item.imgPath ? (
                                                                <img src={item.imgPath} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-xs font-bold text-nv-violet">
                                                                    {(item.employeeName || "?").charAt(0).toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => navigateProfile(item.employeeId)}
                                                            className="text-sm font-medium text-nv-violet hover:text-nv-violet-dark hover:underline transition-colors"
                                                        >
                                                            {item.employeeName}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className={ui.td}>
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase className="w-3.5 h-3.5 text-gray-300" />
                                                        <span className="font-medium text-gray-700">{item.projectName}</span>
                                                    </div>
                                                </td>
                                                <td className={`${ui.td} text-center`}>{item.month}/{item.year}</td>
                                                <td className={`${ui.td} text-right font-medium text-gray-900`}>
                                                    {item.totalWorkHours != null ? item.totalWorkHours.toFixed(1) : "-"}
                                                </td>
                                                <td className={`${ui.td} text-right font-medium text-nv-danger`}>
                                                    {item.totalOTHours != null ? item.totalOTHours.toFixed(1) : "-"}
                                                </td>
                                                <td className={`${ui.td} text-center font-bold text-nv-violet`}>
                                                    {item.taskCount ?? "-"}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <EmptyState colSpan={7} />
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
        </div>
    );
}
