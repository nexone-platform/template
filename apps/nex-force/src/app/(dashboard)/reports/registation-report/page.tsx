"use client";

/**
 * Registration Report — Next.js port of Angular registration-report component.
 */

import { useEffect,  useState, useMemo } from "react";
import {
    useRegistrationReport,
    useWorkingYears,
    useGenderMaster,
    SearchCriteria,
    EmployeeReportResponse,
} from "@/hooks/use-report";
import { useDepartments } from "@/hooks/use-organization";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { usePagination } from "@/hooks/use-pagination";
import ExportButtons from "@/components/ExportButtons";
import type { ExportColumn } from "@/lib/table-export";
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



/* ── Date formatter ── */
const fmtDate = (val?: string | Date | null) => {
    if (!val) return "-";
    try { return format(new Date(val), "dd/MM/yyyy"); } catch { return "-"; }
};

/* ── Currency formatter ── */
const fmtCurrency = (val?: number | null) =>
    val != null ? `฿${val.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : "-";

export default function RegistrationReportPage() {
    const { t } = usePageTranslation();

    const statusData = [
        { value: "true", label: t('Working', 'Working') },
        { value: "false", label: t('Resigned', 'Resigned') },
    ];

    const exportColumns: ExportColumn[] = [
        { header: "#", key: "_index" },
        { header: t('Employee Code', 'Employee Code'), key: "employeeId" },
        { header: t('Employee Name', 'Employee Name'), key: "fullName" },
        { header: t('Citizen ID', 'Citizen ID'), key: "citizenId" },
        { header: t('Gender', 'Gender'), key: "gender" },
        { header: t('Nationality', 'Nationality'), key: "nationality" },
        { header: t('Birth Date', 'Birth Date'), key: "birthDate", format: (v) => fmtDate(v) },
        { header: t('Age', 'Age'), key: "age" },
        { header: t('Department', 'Department'), key: "department" },
        { header: t('Designation', 'Designation'), key: "designation" },
        { header: t('Address', 'Address'), key: "address" },
        { header: t('Salary', 'Salary'), key: "salary" },
        { header: t('Join Date', 'Join Date'), key: "joinDate", format: (v) => fmtDate(v) },
        { header: t('Probation End', 'Probation End'), key: "probationEndDate", format: (v) => fmtDate(v) },
        { header: t('Resignation Date', 'Resignation Date'), key: "resignationDate", format: (v) => fmtDate(v) },
        { header: t('Service Yrs', 'Service Yrs'), key: "workAgeInYears" },
        { header: t('Travel Allow.', 'Travel Allow.'), key: "travelAllowance" },
        { header: t('Shift Allow.', 'Shift Allow.'), key: "shiftAllowance" },
        { header: t('Attend. Bonus', 'Attend. Bonus'), key: "attendanceBonus" },
        { header: t('Status', 'Status'), key: "status" },
        { header: t('Remark', 'Remark'), key: "remark" },
    ];

    const tableColumns = [
    { key: "#", label: "#", width: "w-10" },
    { key: "employeeId", label: t('Emp Code', 'Emp Code'), sortable: true },
    { key: "fullName", label: t('Name', 'Name'), sortable: true },
    { key: "citizenId", label: t('Citizen ID', 'Citizen ID') },
    { key: "gender", label: t('Gender', 'Gender') },
    { key: "department", label: t('Department', 'Department'), sortable: true },
    { key: "designation", label: t('Designation', 'Designation') },
    { key: "salary", label: t('Salary', 'Salary'), align: "right" as const },
    { key: "joinDate", label: t('Join Date', 'Join Date') },
    { key: "workAgeInYears", label: t('Svc Yrs', 'Svc Yrs'), align: "center" as const },
    { key: "status", label: t('Status', 'Status'), align: "center" as const },
    ];

    const router = useRouter();

    const [criteria, setCriteria] = useState<SearchCriteria>({
        year: undefined,
        departmentId: undefined,
        isActive: undefined,
        genderId: undefined,
    });
    const [tempCriteria, setTempCriteria] = useState<SearchCriteria>({ ...criteria });

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
    const { data: years } = useWorkingYears();
    const { data: genders } = useGenderMaster();
    const { data: departments } = useDepartments();
    const { data: reportData, isLoading } = useRegistrationReport(criteria);

    const allData = useMemo<EmployeeReportResponse[]>(() => reportData?.data || [], [reportData?.data]);

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

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const handleSearch = () => {
        setCriteria({ ...tempCriteria });
    };

    const handleClear = () => {
        const reset: SearchCriteria = { year: undefined, departmentId: undefined, isActive: undefined, genderId: undefined };
        setTempCriteria(reset);
        setCriteria(reset);
    };

    const navigateProfile = (id: number) => {
        router.push(`/employees/profile/${id}`);
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Employee Registration Report', 'Employee Registration Report')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Reports', 'Reports') },
                    { label: t('Registration Report', 'Registration Report') },
                ]}
            />

            <ExportButtons
                data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))}
                columns={exportColumns}
                filenamePrefix="registration_report"
                pdfTitle={t('Employee Registration Report', 'Employee Registration Report')}
                totalCount={sorted.length}
            />

            {/* Search Filter */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('Working Year', 'Working Year')}</label>
                        <select className={ui.select} value={tempCriteria.year ?? ""}
                            onChange={(e) => setTempCriteria({ ...tempCriteria, year: e.target.value ? Number(e.target.value) : undefined })}>
                            <option value="">{t('All Years', 'All Years')}</option>
                            {years?.map((y: number) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('Department', 'Department')}</label>
                        <select className={ui.select} value={tempCriteria.departmentId ?? ""}
                            onChange={(e) => setTempCriteria({ ...tempCriteria, departmentId: e.target.value ? Number(e.target.value) : undefined })}>
                            <option value="">{t('All Departments', 'All Departments')}</option>
                            {departments?.map((d: any) => (
                                <option key={d.departmentId} value={d.departmentId}>{d.departmentNameTh}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('Status', 'Status')}</label>
                        <select className={ui.select}
                            value={tempCriteria.isActive === undefined ? "" : String(tempCriteria.isActive)}
                            onChange={(e) => setTempCriteria({ ...tempCriteria, isActive: e.target.value === "" ? undefined : e.target.value === "true" })}>
                            <option value="">{t('All Statuses', 'All Statuses')}</option>
                            {statusData.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('Gender', 'Gender')}</label>
                        <select className={ui.select} value={tempCriteria.genderId ?? ""}
                            onChange={(e) => setTempCriteria({ ...tempCriteria, genderId: e.target.value ? Number(e.target.value) : undefined })}>
                            <option value="">{t('All Genders', 'All Genders')}</option>
                            {genders?.map((g: any) => (
                                <option key={g.genderId} value={g.genderId}>{g.genderNameTh || g.genderName}</option>
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
                                            <tr key={`${item.employeeId}-${rowNum}`} className={ui.tr}>
                                                <td className={ui.tdIndex}>{rowNum}</td>
                                                <td className={ui.td}>
                                                    {item.id ? (
                                                        <button onClick={() => navigateProfile(item.id!)}
                                                            className="text-sm font-medium text-nv-violet hover:text-nv-violet-dark hover:underline transition-colors">
                                                            {item.employeeId}
                                                        </button>
                                                    ) : (
                                                        <span className="text-sm text-gray-600">{item.employeeId}</span>
                                                    )}
                                                </td>
                                                <td className={ui.tdBold}>
                                                    {item.id ? (
                                                        <button onClick={() => navigateProfile(item.id!)}
                                                            className="font-medium text-gray-900 hover:text-nv-violet hover:underline transition-colors">
                                                            {item.fullName}
                                                        </button>
                                                    ) : (
                                                        <span>{item.fullName}</span>
                                                    )}
                                                </td>
                                                <td className={ui.td}>{item.citizenId || "-"}</td>
                                                <td className={ui.td}>{item.gender || "-"}</td>
                                                <td className={ui.td}>{item.department || "-"}</td>
                                                <td className={ui.td}>{item.designation || "-"}</td>
                                                <td className={`${ui.td} text-right font-medium text-gray-900`}>{fmtCurrency(item.salary)}</td>
                                                <td className={ui.td}>{fmtDate(item.joinDate)}</td>
                                                <td className={`${ui.td} text-center font-medium text-nv-violet`}>{item.workAgeInYears ?? "-"}</td>
                                                <td className={`${ui.td} text-center`}>
                                                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${item.status === "working"
                                                        ? "bg-nv-violet-light text-emerald-700 border-emerald-100"
                                                        : "bg-rose-50 text-rose-700 border-rose-100"
                                                    }`}>
                                                        {item.status || "-"}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <EmptyState colSpan={11} />
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
