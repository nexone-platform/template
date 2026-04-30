"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
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

/* ── Interface matching Angular getPayslipReport ── */
interface PayslipReportItem {
    id: number;
    name1: string;
    name2: string;
    paidamount: string;
    paymentmonth: string;
    paymentyear: string;
    actions: string;
    img: string;
    employeeId?: number;
    employeeName?: string;
    departmentName?: string;
    basicSalary?: number;
    deductions?: number;
    netPay?: number;
}

/* ── Month names for dropdown ── */
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
const AVAILABLE_YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

export default function PayslipReportPage() {
    const { t } = usePageTranslation();

    const exportColumns: ExportColumn[] = [
        { header: "#", key: "_index" },
        { header: t('Employee Name', 'Employee Name'), key: "name1",
            format: (v: any, row: any) => v || row.employeeName || "-" },
        { header: t('Paid Amount', 'Paid Amount'), key: "paidamount",
            format: (v: any, row: any) => v || (row.netPay != null ? row.netPay.toLocaleString() : "-") },
        { header: t('Payment Month', 'Payment Month'), key: "paymentmonth" },
        { header: t('Payment Year', 'Payment Year'), key: "paymentyear" },
    ];

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "name1", label: t('Employee Name', 'Employee Name'), sortable: true },
    { key: "paidamount", label: t('Paid Amount', 'Paid Amount'), sortable: true, align: "right" as const },
    { key: "paymentmonth", label: t('Payment Month', 'Payment Month'), sortable: true, align: "center" as const },
    { key: "paymentyear", label: t('Payment Year', 'Payment Year'), sortable: true, align: "center" as const },
    { key: "actions", label: t('Actions', 'Actions'), align: "center" as const },
    ];

    const router = useRouter();

    /* ── Angular: filter fields ── */
    const [employeeIdFilter, setEmployeeIdFilter] = useState("");
    const [monthFilter, setMonthFilter] = useState<string>("");
    const [yearFilter, setYearFilter] = useState<string>("");

    const [appliedFilters, setAppliedFilters] = useState({
        employeeId: "",
        month: "",
        year: "",
    });

    /* ── Pagination / sorting ── */
    const [pageSize, setPageSize] = useState(10);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    /* ── Data fetching ── */
    const { data: rawData, isLoading } = useQuery({
        queryKey: ["payslip-report", appliedFilters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (appliedFilters.employeeId) params.append("employeeId", appliedFilters.employeeId);
            if (appliedFilters.month) params.append("month", appliedFilters.month);
            if (appliedFilters.year) params.append("year", appliedFilters.year);

            const qs = params.toString();
            const { data } = await apiClient.get<{
                data: PayslipReportItem[];
                totalData: number;
            }>(`payslipReport${qs ? `?${qs}` : ""}`);
            return data;
        },
    });

    const allData = useMemo<PayslipReportItem[]>(() => rawData?.data || [], [rawData?.data]);

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

    const handleSearch = () => {
        setAppliedFilters({ employeeId: employeeIdFilter, month: monthFilter, year: yearFilter });
    };

    const handleClear = () => {
        setEmployeeIdFilter("");
        setMonthFilter("");
        setYearFilter("");
        setAppliedFilters({ employeeId: "", month: "", year: "" });
    };

    const navigateProfile = (id?: number) => {
        if (id) router.push(`/employees/profile/${id}`);
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Payslip Reports', 'Payslip Reports')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Reports', 'Reports') },
                    { label: t('Payslip Reports', 'Payslip Reports') },
                ]}
            />

            <ExportButtons
                data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))}
                columns={exportColumns}
                filenamePrefix="payslip_report"
                pdfTitle={t('Payslip Report', 'Payslip Report')}
                totalCount={sorted.length}
                selectedData={selection.getSelectedRows(sorted)}
                selectedCount={selection.selectedCount}
                onClearSelection={selection.clearSelection}
            />

            {/* Search Filters */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('Employee ID', 'Employee ID')}</label>
                        <input type="text" placeholder={t('Enter Employee ID', 'Enter Employee ID')} className={ui.input}
                            value={employeeIdFilter} onChange={(e) => setEmployeeIdFilter(e.target.value)} />
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
                                    paginatedData.map((item: PayslipReportItem, idx: number) => {
                                        const rowNum = (currentPage - 1) * pageSize + idx + 1;
                                        const displayName = item.name1 || item.employeeName || "-";
                                        const subName = item.name2 || item.departmentName || "";
                                        return (
                                            <tr key={item.id || idx} className={selection.isSelected(item.id) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(item.id)} onChange={() => selection.toggle(item.id)} />
                                                <td className={ui.tdIndex}>{rowNum}</td>
                                                <td className={ui.td}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 bg-nv-violet-light rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                                            {item.img ? (
                                                                <img src={item.img} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-xs font-bold text-nv-violet">
                                                                    {displayName.charAt(0).toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <button
                                                                onClick={() => navigateProfile(item.employeeId || item.id)}
                                                                className="text-sm font-medium text-nv-violet hover:text-nv-violet-dark hover:underline transition-colors text-left"
                                                            >
                                                                {displayName}
                                                            </button>
                                                            {subName && <span className="text-xs text-gray-400">{subName}</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={`${ui.td} text-right font-medium text-gray-900`}>
                                                    {item.paidamount || (item.netPay != null ? item.netPay.toLocaleString() : "-")}
                                                </td>
                                                <td className={`${ui.td} text-center`}>{item.paymentmonth || "-"}</td>
                                                <td className={`${ui.td} text-center`}>{item.paymentyear || "-"}</td>
                                                <td className={`${ui.td} text-center`}>
                                                    <button className="px-3 py-1.5 bg-nv-violet hover:bg-nv-violet-dark text-white text-xs font-medium rounded-md transition-colors">
                                                        {item.actions || "PDF"}
                                                    </button>
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
