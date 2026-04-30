"use client";

import { useState, useMemo } from "react";
import { useEmployeeSalary, PayrollRequest } from "@/hooks/use-payroll";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    PageHeader, TableHeaderBar, SortableTh, ActionButtons, EmptyState, LoadingSpinner,
    PaginationBar, FormField, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

/* ── helpers ── */
const fmtDate = (d: string | Date | null | undefined, fmt: "dd/MM/yyyy" | "MM/yyyy" = "dd/MM/yyyy") => {
    if (!d) return "";
    const dt = new Date(d as string);
    if (isNaN(dt.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    if (fmt === "MM/yyyy") return `${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
    return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
};

export default function EmployeeSalaryPage() {
    const { t } = usePageTranslation();
    const router = useRouter();

    const [criteria, setCriteria] = useState<PayrollRequest>(() => {
        if (typeof window !== "undefined") {
            const profileStr = localStorage.getItem("userProfile");
            const profile = profileStr ? JSON.parse(profileStr) : null;
            return { employeeId: profile?.employeeId ? Number(profile.employeeId) : 0 };
        }
        return { employeeId: 0 };
    });

    const [tempYear, setTempYear] = useState("");
    const { data: salaryList, isLoading } = useEmployeeSalary(criteria);

    const handleSearch = () => {
        if (tempYear) {
            const year = new Date(tempYear).getFullYear();
            setCriteria(prev => ({ ...prev, year }));
        } else {
            setCriteria(prev => { const { year: _, ...rest } = prev as any; void _; return rest; });
        }
    };

    const handleClear = () => {
        setTempYear("");
        const id = localStorage.getItem("employeeId");
        setCriteria({ employeeId: id ? Number(id) : 0 });
    };

    const navigateSlip = (payrollId: number) => { router.push(`/payroll/salary-view/${payrollId}`); };

    // ── Table state ──
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortKey, setSortKey] = useState("");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const rows = useMemo(() => Array.isArray(salaryList) ? salaryList : [], [salaryList]);

    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
    };

    const sorted = useMemo(() => {
        const data = [...rows];
        if (!sortKey) return data;
        return data.sort((a: any, b: any) => {
            const aVal = sortKey.includes(".") ? sortKey.split(".").reduce((o: any, k: string) => o?.[k], a) : a[sortKey];
            const bVal = sortKey.includes(".") ? sortKey.split(".").reduce((o: any, k: string) => o?.[k], b) : b[sortKey];
            const av = aVal ?? ""; const bv = bVal ?? "";
            return (av < bv ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
        });
    }, [rows, sortKey, sortDir]);

    const totalData = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalData / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedData = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

    const columns = [
        { key: "employee.firstNameEn", label: t('Employee', 'Employee'), sortable: true },
        { key: "employee.employeeCode", label: t('Employee ID', 'Employee ID'), sortable: true },
        { key: "employee.email", label: t('Email', 'Email'), sortable: true },
        { key: "employee.joinDate", label: t('Join Date', 'Join Date'), sortable: true },
        { key: "netSalary", label: t('Net Salary', 'Net Salary'), sortable: true },
        { key: "monthYear", label: t('Month/Year', 'Month/Year'), sortable: true },
        { key: "payslip", label: t('Action', 'Action'), sortable: false, align: "right" as const },
    ];

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Employee Salary', 'Employee Salary')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Employee Salary', 'Employee Salary') },
                ]}
            />

            {/* Search Filter */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <FormField label={t('Year', 'Year')}>
                        <input type="number" value={tempYear} onChange={e => setTempYear(e.target.value)}
                            placeholder="e.g. 2025" min="2000" max="2100" className={ui.input} />
                    </FormField>
                    <div className="flex gap-3">
                        <button onClick={handleSearch} className={`${ui.btnPrimary} bg-emerald-600 hover:bg-nv-violet-dark active:bg-emerald-800 flex items-center gap-2`}>{t('Search', 'Search')}</button>
                        <button onClick={handleClear} className={ui.btnSecondary}>{t('Clear', 'Clear')}</button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className={ui.tableWrapper}>
                <TableHeaderBar pageSize={pageSize} onPageSizeChange={(v) => { setPageSize(v); setCurrentPage(1); }} />
                <div className="overflow-x-auto">
                    <table className={`${ui.table} min-w-[900px]`}>
                        <thead className={ui.thead}>
                            <tr>
                                {columns.map(col => (
                                    <SortableTh key={col.key} column={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                ))}
                            </tr>
                        </thead>
                        <tbody className={ui.tbody}>
                            {isLoading ? (
                                <LoadingSpinner colSpan={7} />
                            ) : paginatedData.length === 0 ? (
                                <EmptyState colSpan={7} />
                            ) : paginatedData.map((salary: any, idx: number) => (
                                <tr key={salary.payrollId || idx} className={ui.tr}>
                                    <td className={ui.td}>
                                        <div className="flex items-center gap-3">
                                            <img src={salary.employee?.imgPath || "/images/profile/profile.jpg"} alt=""
                                                className="w-8 h-8 rounded-full object-cover bg-gray-200"
                                                onError={(e) => { (e.target as HTMLImageElement).src = "/images/profile/profile.jpg"; }} />
                                            <Link href="/employees/profile" className="text-nv-violet hover:underline font-medium">
                                                {salary.employee?.firstNameEn} {salary.employee?.lastNameEn}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className={ui.td}>{salary.employee?.employeeCode}</td>
                                    <td className={ui.td}>{salary.employee?.email}</td>
                                    <td className={ui.td}>{fmtDate(salary.employee?.joinDate)}</td>
                                    <td className={ui.td}>${salary.netSalary}</td>
                                    <td className={ui.td}>{fmtDate(salary.monthYear, "MM/yyyy")}</td>
                                    <td className={ui.tdActions}>
                                        <ActionButtons onView={() => navigateSlip(salary.payrollId)} viewTitle="View Payslip" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <PaginationBar currentPage={safePage} totalPages={totalPages} totalData={totalData} pageSize={pageSize} onGoToPage={setCurrentPage} />
            </div>
        </div>
    );
}
