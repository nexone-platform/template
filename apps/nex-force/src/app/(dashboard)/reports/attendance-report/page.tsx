"use client";

import { useEffect,  useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
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
    ui, SelectAllCheckbox, RowCheckbox,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";
import { useSystemConfig } from '@nexone/ui';

/* ── Interface matching Angular attendanceReports ── */
interface AttendanceReportItem {
    id: number;
    sNo: string;
    date: string;
    clockIn: string;
    clockOut: string;
    workStatus: string;
}

/* ── Month names ── */
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
const AVAILABLE_YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

export default function AttendanceReportPage() {
    const { t } = usePageTranslation();

    const exportColumns: ExportColumn[] = [
        { header: "#", key: "sNo" },
        { header: t('Date', 'Date'), key: "date" },
        { header: t('Clock In', 'Clock In'), key: "clockIn" },
        { header: t('Clock Out', 'Clock Out'), key: "clockOut" },
        { header: t('Work Status', 'Work Status'), key: "workStatus" },
    ];

    const tableColumns = [
    { key: "sNo", label: "#", width: "w-14" },
    { key: "date", label: t('Date', 'Date'), sortable: true },
    { key: "clockIn", label: t('Clock In', 'Clock In'), sortable: true },
    { key: "clockOut", label: t('Clock Out', 'Clock Out'), sortable: true },
    { key: "workStatus", label: t('Work Status', 'Work Status'), sortable: true },
    ];

    /* ── Angular: filter fields — Employee Name, Month, Year ── */
    const [employeeName, setEmployeeName] = useState("");
    const [monthFilter, setMonthFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");

    /* ── Applied search params (commit on Search click) ── */
    const [appliedFilters, setAppliedFilters] = useState({
        employeeName: "",
        month: "",
        year: "",
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

    /* ── Data fetching (Angular: DataService.getAttendanceReport()) ── */
    const { data: rawData, isLoading } = useQuery({
        queryKey: ["attendance-report", appliedFilters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (appliedFilters.employeeName) params.append("employeeName", appliedFilters.employeeName);
            if (appliedFilters.month) params.append("month", appliedFilters.month);
            if (appliedFilters.year) params.append("year", appliedFilters.year);

            const qs = params.toString();
            const { data } = await apiClient.get<{
                data: AttendanceReportItem[];
                totalData: number;
            }>(`attendanceReport${qs ? `?${qs}` : ""}`);
            return data;
        },
    });

    const allData = useMemo<AttendanceReportItem[]>(() => rawData?.data || [], [rawData?.data]);

    /* ── Sorting ── */
    const sorted = useMemo(() => {
        if (!sortKey) return allData;
        return [...allData].sort((a: any, b: any) => {
            const va = a[sortKey] ?? "";
            const vb = b[sortKey] ?? "";
            return sortDir === "asc"
                ? String(va).localeCompare(String(vb))
                : String(vb).localeCompare(String(va));
        });
    }, [allData, sortKey, sortDir]);

    const { currentPage, totalPages, paginatedData, goToPage, changePageSize: changePgSize } =
        usePagination(sorted, { pageSize });


    // ── Row Selection ──
    const getRowId = useCallback((item: any) => item.id, []);
    const selection = useRowSelection(paginatedData, getRowId);
    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    /* ── Search button ── */
    const handleSearch = () => {
        setAppliedFilters({ employeeName, month: monthFilter, year: yearFilter });
    };

    /* ── Clear filters ── */
    const handleClear = () => {
        setEmployeeName("");
        setMonthFilter("");
        setYearFilter("");
        setAppliedFilters({ employeeName: "", month: "", year: "" });
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Attendance Reports', 'Attendance Reports')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Reports', 'Reports') },
                    { label: t('Attendance Reports', 'Attendance Reports') },
                ]}
            />

            <ExportButtons
                data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))}
                columns={exportColumns}
                filenamePrefix="attendance_report"
                pdfTitle={t('Attendance Report', 'Attendance Report')}
                totalCount={sorted.length}
                selectedData={selection.getSelectedRows(sorted)}
                selectedCount={selection.selectedCount}
                onClearSelection={selection.clearSelection}
            />

            {/* Search Filters */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('Employee Name', 'Employee Name')}</label>
                        <input
                            type="text"
                            placeholder={t('Enter Employee Name', 'Enter Employee Name')}
                            className={ui.input}
                            value={employeeName}
                            onChange={(e) => setEmployeeName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('Month', 'Month')}</label>
                        <select className={ui.select} value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
                            <option value="">{t('--Select--', '--Select--')}</option>
                            {MONTH_NAMES.map((name, i) => (
                                <option key={i + 1} value={String(i + 1)}>{name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('Year', 'Year')}</label>
                        <select className={ui.select} value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                            <option value="">{t('--Select--', '--Select--')}</option>
                            {AVAILABLE_YEARS.map((y) => (
                                <option key={y} value={String(y)}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end gap-2">
                        <button onClick={handleSearch} className={ui.btnPrimary}>{t('Search', 'Search')}</button>
                        <button onClick={handleClear} className={ui.btnSecondary}>{t('Clear', 'Clear')}</button>
                    </div>
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
                                    <SelectAllCheckbox checked={selection.allSelected} indeterminate={selection.indeterminate} onChange={selection.toggleAll} />
                                    {tableColumns.map((col) => (
                                        <SortableTh key={col.key} column={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                    ))}
                                </tr>
                            </thead>
                            <tbody className={ui.tbody}>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item: AttendanceReportItem, idx: number) => {
                                        const isWeekOff = item.clockOut === "Week Off";
                                        return (
                                            <tr key={item.id || idx} className={selection.isSelected(item.id) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(item.id)} onChange={() => selection.toggle(item.id)} />
                                                <td className={ui.tdIndex}>{item.sNo || (currentPage - 1) * pageSize + idx + 1}</td>
                                                <td className={`${ui.td} font-medium text-gray-900`}>{item.date || "-"}</td>
                                                <td className={`${ui.td} text-emerald-600 font-medium`}>{item.clockIn || "-"}</td>
                                                <td className={`${ui.td} ${isWeekOff ? "text-red-500" : ""} font-medium`}>{item.clockOut || "-"}</td>
                                                <td className={ui.td}>{item.workStatus || "-"}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <EmptyState colSpan={6} />
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
