"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    useLeaveReport,
    useWorkingYears,
    useLeaveTypes,
    LeaveSearchCriteria,
} from "@/hooks/use-report";
import { useDepartments } from "@/hooks/use-organization";
import { useEmployeeSelect } from "@/hooks/use-employee";
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

export default function LeaveReportPage() {
    const { t } = usePageTranslation();

    const exportColumns: ExportColumn[] = [
        { header: t('Employee', 'Employee'), key: "employeeName" },
        { header: t('Year', 'Year'), key: "year" },
        { header: t('Department', 'Department'), key: "departmentName" },
        { header: t('Leave Type', 'Leave Type'), key: "leaveTypeName" },
        { header: t('No of Days', 'No of Days'), key: "noOfDays" },
        { header: t('Remaining Leave', 'Remaining Leave'), key: "remainingLeave" },
        { header: t('Total Leaves', 'Total Leaves'), key: "totalLeaves" },
        { header: t('Total Leave Taken', 'Total Leave Taken'), key: "totalLeaveTaken" },
        { header: t('Leave Carry Forward', 'Leave Carry Forward'), key: "leaveCarryForward" },
    ];

    const tableColumns = [
    { key: "employeeName", label: t('Employee', 'Employee'), sortable: true },
    { key: "year", label: t('Year', 'Year'), sortable: true, align: "center" as const },
    { key: "departmentName", label: t('Department', 'Department'), sortable: true },
    { key: "leaveTypeName", label: t('Leave Type', 'Leave Type'), align: "center" as const },
    { key: "noOfDays", label: t('No of Days', 'No of Days'), align: "center" as const },
    { key: "remainingLeave", label: t('Remaining Leave', 'Remaining Leave'), align: "center" as const },
    { key: "totalLeaves", label: t('Total Leaves', 'Total Leaves'), align: "center" as const },
    { key: "totalLeaveTaken", label: t('Total Leave Taken', 'Total Leave Taken'), align: "center" as const },
    { key: "leaveCarryForward", label: t('Leave Carry Forward', 'Leave Carry Forward'), align: "center" as const },
    ];

    const router = useRouter();

    /* ── Angular: searchForm fields ── */
    const [criteria, setCriteria] = useState<LeaveSearchCriteria>({
        year: new Date().getFullYear(),
        lang: "en",
        employeeId: undefined,
        departmentId: undefined,
        leaveTypeId: undefined,
    });
    const [tempCriteria, setTempCriteria] = useState<LeaveSearchCriteria>({ ...criteria });

    /* ── Pagination / sorting ── */
    const [pageSize, setPageSize] = useState(10);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    /* ── Data sources ── */
    const { data: years } = useWorkingYears();
    const { data: departments } = useDepartments();
    const { data: employees } = useEmployeeSelect();
    const { data: leaveTypes } = useLeaveTypes();
    const { data: reportData, isLoading } = useLeaveReport(criteria);

    const allData = useMemo(() => reportData?.data || [], [reportData?.data]);

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
    const getRowId = useCallback((item: any) => item.employeeId, []);
    const selection = useRowSelection(paginatedData, getRowId);
    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    /* ── Angular: Search button → getTableData() ── */
    const handleSearch = () => {
        setCriteria({ ...tempCriteria });
    };

    /* ── Angular: clear() ── */
    const handleClear = () => {
        const reset: LeaveSearchCriteria = {
            year: new Date().getFullYear(),
            lang: "en",
            employeeId: undefined,
            departmentId: undefined,
            leaveTypeId: undefined,
        };
        setTempCriteria(reset);
        setCriteria(reset);
    };

    /* ── Angular: navigateProfile(id) ── */
    const navigateProfile = (id?: number) => {
        if (id) router.push(`/employees/profile/${id}`);
    };

    /* ── Leave type badge class ── */
    const getLeaveTypeBadge = (typeName: string) => {
        const lower = (typeName || "").toLowerCase();
        if (lower.includes("sick"))
            return "bg-sky-50 text-sky-700 border-sky-200";
        if (lower.includes("parenting") || lower.includes("maternity") || lower.includes("paternity"))
            return "bg-amber-50 text-amber-700 border-amber-200";
        if (lower.includes("emergency"))
            return "bg-rose-50 text-rose-700 border-rose-200";
        if (lower.includes("annual") || lower.includes("vacation"))
            return "bg-nv-violet-light text-emerald-700 border-emerald-200";
        return "bg-nv-violet-light text-nv-violet-dark border-blue-100";
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Leave Report', 'Leave Report')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Reports', 'Reports') },
                    { label: t('Leave Report', 'Leave Report') },
                ]}
            />

            <ExportButtons
                data={sorted.map((d: any, i: number) => ({ ...d, _index: i + 1 }))}
                columns={exportColumns}
                filenamePrefix="leave_report"
                pdfTitle={t('Leave Report', 'Leave Report')}
                totalCount={sorted.length}
                selectedData={selection.getSelectedRows(sorted)}
                selectedCount={selection.selectedCount}
                onClearSelection={selection.clearSelection}
            />

            {/* Search Filters */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('Year', 'Year')}</label>
                        <select className={ui.select} value={tempCriteria.year}
                            onChange={(e) => setTempCriteria({ ...tempCriteria, year: Number(e.target.value) })}>
                            {years?.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('Employee', 'Employee')}</label>
                        <select className={ui.select} value={tempCriteria.employeeId || ""}
                            onChange={(e) => setTempCriteria({ ...tempCriteria, employeeId: e.target.value ? Number(e.target.value) : undefined })}>
                            <option value="">{t('Select Employee', 'Select Employee')}</option>
                            {employees?.map((emp) => (
                                <option key={emp.employeeId} value={emp.employeeId}>
                                    {emp.firstNameEn} {emp.lastNameEn}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('Department', 'Department')}</label>
                        <select className={ui.select} value={tempCriteria.departmentId || ""}
                            onChange={(e) => setTempCriteria({ ...tempCriteria, departmentId: e.target.value ? Number(e.target.value) : undefined })}>
                            <option value="">{t('Select Department', 'Select Department')}</option>
                            {departments?.map((d) => (
                                <option key={d.departmentId} value={d.departmentId}>{d.departmentNameTh}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('Leave Type', 'Leave Type')}</label>
                        <select className={ui.select} value={tempCriteria.leaveTypeId || ""}
                            onChange={(e) => setTempCriteria({ ...tempCriteria, leaveTypeId: e.target.value ? Number(e.target.value) : undefined })}>
                            <option value="">{t('Select Leave Type', 'Select Leave Type')}</option>
                            {leaveTypes?.map((l) => (
                                <option key={l.leaveTypeId} value={l.leaveTypeId}>{l.leaveTypeNameEn}</option>
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
                                    <SelectAllCheckbox checked={selection.allSelected} indeterminate={selection.indeterminate} onChange={selection.toggleAll} />
                                    {tableColumns.map((col) => (
                                        <SortableTh key={col.key} column={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                    ))}
                                </tr>
                            </thead>
                            <tbody className={ui.tbody}>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item: any, idx: number) => (
                                        <tr key={idx} className={selection.isSelected(item.employeeId) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(item.employeeId)} onChange={() => selection.toggle(item.employeeId)} />
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
                                                    <div className="flex flex-col">
                                                        <button
                                                            onClick={() => navigateProfile(item.employeeId)}
                                                            className="text-sm font-medium text-nv-violet hover:text-nv-violet-dark hover:underline transition-colors text-left"
                                                        >
                                                            {item.employeeName || "-"}
                                                        </button>
                                                        {item.employeeCode && (
                                                            <span className="text-xs text-gray-400">#{item.employeeCode}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`${ui.td} text-center`}>{item.year || "-"}</td>
                                            <td className={ui.td}>{item.departmentName || "-"}</td>
                                            <td className={`${ui.td} text-center`}>
                                                <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md border ${getLeaveTypeBadge(item.leaveTypeName)}`}>
                                                    {item.leaveTypeName || "-"}
                                                </span>
                                            </td>
                                            <td className={`${ui.td} text-center`}>
                                                <span className="inline-block px-2.5 py-1 bg-rose-500 text-white text-xs font-semibold rounded-md min-w-[32px]">
                                                    {item.noOfDays ?? 0}
                                                </span>
                                            </td>
                                            <td className={`${ui.td} text-center`}>
                                                <span className="inline-block px-2.5 py-1 bg-amber-400 text-white text-xs font-semibold rounded-md min-w-[32px]">
                                                    {item.remainingLeave ?? 0}
                                                </span>
                                            </td>
                                            <td className={`${ui.td} text-center`}>
                                                <span className="inline-block px-2.5 py-1 bg-nv-violet text-white text-xs font-semibold rounded-md min-w-[32px]">
                                                    {item.totalLeaves ?? 0}
                                                </span>
                                            </td>
                                            <td className={`${ui.td} text-center font-medium`}>{item.totalLeaveTaken ?? 0}</td>
                                            <td className={`${ui.td} text-center font-medium`}>{item.leaveCarryForward ?? 0}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <EmptyState colSpan={10} />
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
