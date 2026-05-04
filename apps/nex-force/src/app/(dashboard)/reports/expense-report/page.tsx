"use client";

import { useEffect,  useState, useMemo, useCallback } from "react";
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
import { useSystemConfig } from '@nexone/ui';

/* ── Interface matching Angular getExpenseReport ── */
interface ExpenseReportItem {
    id: number;
    item: string;
    purchaseFrom: string;
    purchaseDate: string;
    purchasedBy: string;
    amount: string;
    paidBy: string;
    img?: string;
    status: string;
    employeeId?: number;
    employeeName?: string;
    departmentName?: string;
    category?: string;
}

export default function ExpenseReportPage() {
    const { t } = usePageTranslation();

    const exportColumns: ExportColumn[] = [
        { header: "#", key: "_index" },
        { header: t('Item', 'Item'), key: "item" },
        { header: t('Purchase From', 'Purchase From'), key: "purchaseFrom" },
        { header: t('Purchase Date', 'Purchase Date'), key: "purchaseDate" },
        { header: t('Purchased By', 'Purchased By'), key: "purchasedBy" },
        { header: t('Amount', 'Amount'), key: "amount" },
        { header: t('Paid By', 'Paid By'), key: "paidBy" },
        { header: t('Status', 'Status'), key: "status" },
    ];

    const tableColumns = [
    { key: "item", label: t('Item', 'Item'), sortable: true },
    { key: "purchaseFrom", label: t('Purchase From', 'Purchase From'), sortable: true },
    { key: "purchaseDate", label: t('Purchase Date', 'Purchase Date'), sortable: true },
    { key: "purchasedBy", label: t('Purchased By', 'Purchased By'), sortable: true },
    { key: "amount", label: t('Amount', 'Amount'), sortable: true, align: "right" as const },
    { key: "paidBy", label: t('Paid By', 'Paid By'), sortable: true },
    { key: "status", label: t('Status', 'Status'), align: "center" as const },
    ];

    const router = useRouter();

    /* ── Angular's filter fields: buyer, fromDate, toDate ── */
    const [selectedBuyer, setSelectedBuyer] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [searchText, setSearchText] = useState("");

    /* ── Pagination ── */
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

    /* ── Data fetching (Angular: DataService.getExpenseReport()) ── */
    const { data: rawData, isLoading } = useQuery({
        queryKey: ["expense-report"],
        queryFn: async () => {
            const { data } = await apiClient.get<{
                data: ExpenseReportItem[];
                totalData: number;
            }>("expenseReport");
            return data;
        },
    });

    /* ── All data ── */
    const allData = useMemo<ExpenseReportItem[]>(() => rawData?.data || [], [rawData?.data]);

    /* ── Angular: text search (dataSource.filter) ── */
    const filteredData = useMemo(() => {
        let items = [...allData];

        if (searchText.trim()) {
            const q = searchText.trim().toLowerCase();
            items = items.filter(
                (r) =>
                    r.item?.toLowerCase().includes(q) ||
                    r.purchaseFrom?.toLowerCase().includes(q) ||
                    r.purchasedBy?.toLowerCase().includes(q) ||
                    r.paidBy?.toLowerCase().includes(q) ||
                    r.status?.toLowerCase().includes(q) ||
                    r.amount?.toLowerCase().includes(q)
            );
        }

        if (selectedBuyer) {
            items = items.filter((r) => r.purchasedBy === selectedBuyer);
        }
        if (fromDate) {
            items = items.filter((r) => r.purchaseDate >= fromDate);
        }
        if (toDate) {
            items = items.filter((r) => r.purchaseDate <= toDate);
        }

        return items;
    }, [allData, searchText, selectedBuyer, fromDate, toDate]);

    /* ── Sorting ── */
    const sorted = useMemo(() => {
        if (!sortKey) return filteredData;
        return [...filteredData].sort((a: any, b: any) => {
            const va = a[sortKey] ?? "";
            const vb = b[sortKey] ?? "";
            return sortDir === "asc"
                ? String(va).localeCompare(String(vb))
                : String(vb).localeCompare(String(va));
        });
    }, [filteredData, sortKey, sortDir]);

    /* ── Unique buyers list for dropdown ── */
    const uniqueBuyers = useMemo(() => {
        const buyers = new Set(allData.map((r) => r.purchasedBy).filter(Boolean));
        return Array.from(buyers).sort();
    }, [allData]);

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

    /* ── Angular: Clear filters ── */
    const handleClear = () => {
        setSelectedBuyer("");
        setFromDate("");
        setToDate("");
        setSearchText("");
    };

    /* ── Status badge helper ── */
    const StatusBadge = ({ status }: { status: string }) => {
        const isApproved = status?.toLowerCase() === "approved";
        const isPending = status?.toLowerCase() === "pending";
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                isApproved
                    ? "bg-nv-violet-light text-emerald-700"
                    : isPending
                    ? "bg-amber-50 text-amber-700"
                    : "bg-gray-100 text-gray-600"
            }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                    isApproved ? "bg-nv-violet" : isPending ? "bg-nv-warn" : "bg-gray-400"
                }`} />
                {status || "-"}
            </span>
        );
    };

    /* ── Navigate to employee profile ── */
    const navigateProfile = (id?: number) => {
        if (id) router.push(`/employees/profile/${id}`);
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Expense Report', 'Expense Report')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Reports', 'Reports') },
                    { label: t('Expense Report', 'Expense Report') },
                ]}
            />

            <ExportButtons
                data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))}
                columns={exportColumns}
                filenamePrefix="expense_report"
                pdfTitle={t('Expense Report', 'Expense Report')}
                totalCount={sorted.length}
                selectedData={selection.getSelectedRows(sorted)}
                selectedCount={selection.selectedCount}
                onClearSelection={selection.clearSelection}
            />

            {/* Search Filters */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('Purchased By', 'Purchased By')}</label>
                        <select
                            className={ui.select}
                            value={selectedBuyer}
                            onChange={(e) => setSelectedBuyer(e.target.value)}
                        >
                            <option value="">{t('Select buyer', 'Select buyer')}</option>
                            {uniqueBuyers.map((buyer) => (
                                <option key={buyer} value={buyer}>{buyer}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('From', 'From')}</label>
                        <input
                            type="date"
                            className={ui.input}
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('To', 'To')}</label>
                        <input
                            type="date"
                            className={ui.input}
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                    <div className="flex items-end gap-2">
                        <button onClick={handleClear} className={ui.btnSecondary}>{t('Clear', 'Clear')}</button>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className={ui.tableWrapper}>
                <TableHeaderBar
                    pageSize={pageSize}
                    onPageSizeChange={(v) => { setPageSize(v); changePgSize(v); }}
                    searchText={searchText}
                    onSearchChange={setSearchText}
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
                                    paginatedData.map((item: ExpenseReportItem, idx: number) => (
                                        <tr key={item.id || idx} className={selection.isSelected(item.id) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(item.id)} onChange={() => selection.toggle(item.id)} />
                                            <td className={ui.td}>
                                                <span className="font-medium text-gray-900">{item.item || "-"}</span>
                                            </td>
                                            <td className={ui.td}>{item.purchaseFrom || "-"}</td>
                                            <td className={ui.td}>{item.purchaseDate || "-"}</td>
                                            <td className={ui.td}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 bg-nv-violet-light rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {item.img ? (
                                                            <img src={item.img} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs font-bold text-nv-violet">
                                                                {(item.purchasedBy || "?").charAt(0).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => navigateProfile(item.employeeId)}
                                                        className="text-sm font-medium text-nv-violet hover:text-nv-violet-dark hover:underline transition-colors"
                                                    >
                                                        {item.purchasedBy || "-"}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className={`${ui.td} text-right font-medium text-gray-900`}>{item.amount || "-"}</td>
                                            <td className={ui.td}>{item.paidBy || "-"}</td>
                                            <td className={`${ui.td} text-center`}>
                                                <StatusBadge status={item.status} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <EmptyState colSpan={8} />
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
