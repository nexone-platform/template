"use client";

import { useSalaryPeriods } from "@/features/payroll/hooks/use-payroll";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import {
    PageHeader, TableHeaderBar, SortableTh, EmptyState, LoadingSpinner,
    PaginationBar, StatusBadge, ui,
} from "@/components/shared/ui-components";
import { useState, useMemo } from "react";
import { usePageTranslation } from "@/lib/language";

export default function PayrollPage() {
    const { t } = usePageTranslation();
    const { data, isLoading } = useSalaryPeriods();
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortKey, setSortKey] = useState("");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
    };

    const sorted = useMemo(() => {
        const periods = (data?.data as any[]) ?? [];
        const source = Array.isArray(periods) ? periods : [];
        if (!sortKey) return source;
        return [...source].sort((a: any, b: any) => {
            const av = a[sortKey] ?? ""; const bv = b[sortKey] ?? "";
            return (av < bv ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
        });
    }, [data, sortKey, sortDir]);

    const totalData = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalData / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedData = Array.isArray(sorted) ? sorted.slice((safePage - 1) * pageSize, safePage * pageSize) : [];

    const columns = [
        { key: "#", label: "#", sortable: false, width: "w-14" },
        { key: "periodStartDate", label: t('Period', 'Period'), sortable: true },
        { key: "monthYear", label: t('Month/Year', 'Month/Year'), sortable: true },
        { key: "paymentDate", label: t('Payment Date', 'Payment Date'), sortable: true },
        { key: "totalCost", label: t('Total Cost', 'Total Cost'), sortable: true, align: "right" as const },
        { key: "totalPayment", label: t('Total Payment', 'Total Payment'), sortable: true, align: "right" as const },
        { key: "status", label: t('Status', 'Status'), sortable: true, align: "center" as const },
    ];

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Payroll', 'Payroll')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Payroll', 'Payroll') },
                ]}
                actionLabel={t('Create Payroll', 'Create Payroll')}
                onAction={() => {}}
                actionIcon={<Plus className="w-4 h-4" />}
            />

            <div className={ui.tableWrapper}>
                <TableHeaderBar
                    pageSize={pageSize}
                    onPageSizeChange={(v) => { setPageSize(v); setCurrentPage(1); }}
                />

                <div className="overflow-x-auto">
                    <table className={ui.table}>
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
                            ) : (
                                paginatedData.map((p: any, i: number) => (
                                    <tr key={p.periodId} className={ui.tr}>
                                        <td className={ui.tdIndex}>{(safePage - 1) * pageSize + i + 1}</td>
                                        <td className={ui.td}>{formatDate(p.periodStartDate)} - {formatDate(p.periodEndDate)}</td>
                                        <td className={ui.td}>{formatDate(p.monthYear)}</td>
                                        <td className={ui.td}>{formatDate(p.paymentDate)}</td>
                                        <td className="px-4 py-3 text-right font-mono text-gray-600">{p.totalCost?.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right font-mono text-gray-600">{p.totalPayment?.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusBadge status={p.status} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <PaginationBar
                    currentPage={safePage}
                    totalPages={totalPages}
                    totalData={totalData}
                    pageSize={pageSize}
                    onGoToPage={setCurrentPage}
                />
            </div>
        </div>
    );
}
