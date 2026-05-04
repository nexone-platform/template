"use client";

import { useEffect,  useState, useMemo, useCallback } from "react";
import apiClient from "@/lib/api-client";
import { useAllPromotions } from "@/hooks/use-promotion";
import { ROUTES } from "@/lib/routes";
import { usePagination } from "@/hooks/use-pagination";
import { format } from "date-fns";
import { useRowSelection } from "@/hooks/use-row-selection";
import ExportButtons from "@/components/ExportButtons";
import ImportExcelButton from "@/components/ImportExcelButton";
import type { ExportColumn } from "@/lib/table-export";
import {
    PageHeader,
    TableHeaderBar,
    SortableTh,
    EmptyState,
    LoadingSpinner,
    PaginationBar,
    StatusBadge,
    ui, SelectAllCheckbox, RowCheckbox,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";
import { useSystemConfig } from '@nexone/ui';

type AnyRow = Record<string, any>;

const statusVariant = (status?: string) => {
    if (status === "Approved") return "success";
    if (status === "WaitForApprove") return "warning";
    if (status === "Declined") return "danger";
    return "info";
};

export default function PromotionViewsPage() {
    const { t } = usePageTranslation();

    const exportColumns: ExportColumn[] = [
        { header: "#", key: "_index" },
        { header: t('Employee', 'Employee'), key: "employeeName" },
        { header: t('From', 'From'), key: "designationFrom" },
        { header: t('To', 'To'), key: "designationTo" },
        { header: t('Promotion Date', 'Promotion Date'), key: "promotionDate", format: (v: any) => v ? new Date(v).toLocaleDateString("en-GB") : "" },
        { header: t('Old Salary', 'Old Salary'), key: "oldSalary" },
        { header: t('New Salary', 'New Salary'), key: "newSalary" },
        { header: t('Status', 'Status'), key: "status" },
    ];

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "employeeName", label: t('Employee', 'Employee'), sortable: true },
    { key: "designationFrom", label: t('From', 'From'), sortable: true },
    { key: "designationTo", label: t('To', 'To'), sortable: true },
    { key: "promotionDate", label: t('Date', 'Date'), sortable: true },
    { key: "oldSalary", label: t('Old Salary', 'Old Salary'), sortable: true },
    { key: "newSalary", label: t('New Salary', 'New Salary'), sortable: true },
    { key: "status", label: t('Status', 'Status') },
    ];

    const { data: promotions, isLoading } = useAllPromotions();
    const [searchText, setSearchText] = useState("");
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const { configs, loading: configLoading } = useSystemConfig();
    const [hasSetDefaultPageSize, setHasSetDefaultPageSize] = useState(false);

    useEffect(() => {
        if (!configLoading && configs?.pageRecordDefault && !hasSetDefaultPageSize) {
            setPageSize(configs.pageRecordDefault);
            setHasSetDefaultPageSize(true);
        }
    }, [configLoading, configs?.pageRecordDefault, hasSetDefaultPageSize]);
    const [pageSize, setPageSize] = useState(configs?.pageRecordDefault || 10);

    const list = useMemo(() => promotions ?? [], [promotions]);

    const filtered = useMemo(() => {
        if (!searchText) return list;
        const q = searchText.toLowerCase();
        return list.filter(
            (d) =>
                d.employeeName?.toLowerCase().includes(q) ||
                d.status?.toLowerCase().includes(q) ||
                d.designationTo?.toLowerCase().includes(q)
        );
    }, [list, searchText]);

    const sorted = useMemo(() => {
        if (!sortKey) return filtered;
        return [...filtered].sort((a, b) => {
            const aVal = (a as AnyRow)[sortKey] ?? "";
            const bVal = (b as AnyRow)[sortKey] ?? "";
            return (aVal < bVal ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
        });
    }, [filtered, sortKey, sortDir]);

    const {
        paginatedData,
        currentPage,
        totalPages,
        goToPage,
        changePageSize: changePgSize,
    } = usePagination(sorted, { pageSize });


    // ── Row Selection ──
    const getRowId = useCallback((d: any) => d.promotionId, []);
    const selection = useRowSelection(paginatedData, getRowId);
    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        try { return format(new Date(dateStr), "dd MMM yyyy"); }
        catch { return dateStr; }
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Promotion', 'Promotion')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard },
                    { label: t('Promotion', 'Promotion') },
                ]}
            />

            <div className="flex flex-wrap items-center gap-3">
                <ExportButtons
                    data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))}
                    columns={exportColumns}
                    filenamePrefix="promotions"
                    pdfTitle={t('Promotions', 'Promotions')}
                    totalCount={sorted.length}
                    selectedData={selection.getSelectedRows(sorted)}
                    selectedCount={selection.selectedCount}
                    onClearSelection={selection.clearSelection}
                />
                <ImportExcelButton
                    columns={[
                        { header: "Employee ID", key: "employeeId", required: true },
                        { header: "Designation To ID", key: "designationToId", required: true },
                        { header: "Department To ID", key: "departmentToId", required: true },
                        { header: "Promotion Date", key: "promotionDate", required: true },
                        { header: "New Salary", key: "newSalary", required: true },
                    
                        { header: "Employee", key: "employeeName" },
                        { header: "From", key: "designationFrom" },
                        { header: "To", key: "designationTo" },
                        { header: "Old Salary", key: "oldSalary" },]}
                    filenamePrefix="promotions"
                    onImport={async (rows) => {
                        let success = 0, failed = 0;
                        const username = localStorage.getItem("username");
                        for (const row of rows) {
                            try {
                                await apiClient.post("/promotion/update", {
                                    promotionId: 0,
                                    employeeId: Number(row.employeeId) || 0,
                                    designationToId: Number(row.designationToId) || 0,
                                    departmentToId: Number(row.departmentToId) || 0,
                                    promotionDate: row.promotionDate || "",
                                    newSalary: Number(row.newSalary) || 0,
                                    username,
                                });
                                success++;
                            } catch { failed++; }
                        }
                        return { success, failed };
                    }}
                />
            </div>

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
                                    paginatedData.map((d: AnyRow, idx: number) => (
                                        <tr key={d.promotionId} className={selection.isSelected(d.promotionId) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(d.promotionId)} onChange={() => selection.toggle(d.promotionId)} />
                                            <td className={ui.tdIndex}>{(currentPage - 1) * pageSize + idx + 1}</td>
                                            <td className={ui.tdBold}>{d.employeeName}</td>
                                            <td className={ui.td}>{d.designationFrom}</td>
                                            <td className={ui.td}>{d.designationTo}</td>
                                            <td className={ui.td}>{formatDate(d.promotionDate)}</td>
                                            <td className={ui.td}>{d.oldSalary?.toLocaleString()}</td>
                                            <td className={ui.td}>{d.newSalary?.toLocaleString()}</td>
                                            <td className={ui.td}>
                                                <StatusBadge
                                                    status={d.status === "WaitForApprove" ? "Pending" : d.status}
                                                    variant={statusVariant(d.status)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <EmptyState colSpan={9} />
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
