"use client";

import { useEffect,  useState, useMemo, useCallback } from "react";
import apiClient from "@/lib/api-client";
import {
    useTaxIncome,
    useSaveTaxIncome,
    useDeleteTaxIncome,
    IncomeTaxBracket,
} from "@/hooks/use-tax";
import { format } from "date-fns";
import { useMessages } from "@/hooks/use-messages";
import { usePagination } from "@/hooks/use-pagination";
import { useRowSelection } from "@/hooks/use-row-selection";
import ExportButtons from "@/components/ExportButtons";
import ImportExcelButton from "@/components/ImportExcelButton";
import type { ExportColumn } from "@/lib/table-export";
import {
    PageHeader,
    TableHeaderBar,
    SortableTh,
    ActionButtons,
    EmptyState,
    LoadingSpinner,
    PaginationBar,
    ModalWrapper,
    FormField,
    ui, SelectAllCheckbox, RowCheckbox,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";
import { useSystemConfig } from '@nexone/ui';

export default function TaxIncomePage() {
    const { t } = usePageTranslation();
    const { showWarning } = useMessages();

    const exportColumns: ExportColumn[] = [
        { header: "#", key: "_index" },
        { header: t('Min Income', 'Min Income'), key: "minIncome" },
        { header: t('Max Income', 'Max Income'), key: "maxIncome" },
        { header: t('Tax Rate (%)', 'Tax Rate (%)'), key: "taxRate" },
        { header: t('Effective Start', 'Effective Start'), key: "effectiveDateStart",
            format: (v) => { if (!v) return "-"; try { return format(new Date(v), "dd/MM/yyyy"); } catch { return "-"; } } },
        { header: t('Effective End', 'Effective End'), key: "effectiveDateEnd",
            format: (v) => { if (!v) return "-"; try { return format(new Date(v), "dd/MM/yyyy"); } catch { return "-"; } } },
        { header: t('Reason', 'Reason'), key: "reason" },
    ];

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "minIncome", label: t('Min Income', 'Min Income'), sortable: true, align: "right" as const },
    { key: "maxIncome", label: t('Max Income', 'Max Income'), sortable: true, align: "right" as const },
    { key: "taxRate", label: t('Tax Rate', 'Tax Rate'), sortable: true, align: "center" as const },
    { key: "effectiveDateStart", label: t('Eff. Start', 'Eff. Start') },
    { key: "effectiveDateEnd", label: t('Eff. End', 'Eff. End') },
    { key: "reason", label: t('Reason', 'Reason') },
    { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ];

    /* โ”€โ”€ Data hooks โ”€โ”€ */
    const { data: brackets, isLoading } = useTaxIncome();
    const saveMutation = useSaveTaxIncome();
    const deleteMutation = useDeleteTaxIncome();

    /* โ”€โ”€ Search / Pagination / Sort โ”€โ”€ */
    const [searchText, setSearchText] = useState("");
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

    /* โ”€โ”€ Modal state โ”€โ”€ */
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBracket, setSelectedBracket] = useState<IncomeTaxBracket | null>(null);

    /* โ”€โ”€ Form state โ”€โ”€ */
    const [formData, setFormData] = useState<Partial<IncomeTaxBracket>>({
        minIncome: 0, maxIncome: 0, taxRate: 0,
        effectiveDateStart: new Date().toISOString().split("T")[0], effectiveDateEnd: "", reason: "",
    });

    /* โ”€โ”€ Format date helper โ”€โ”€ */
    const fmtDate = (dateStr?: string | null) => {
        if (!dateStr) return "-";
        try { return format(new Date(dateStr), "dd/MM/yyyy"); } catch { return dateStr; }
    };

    /* โ”€โ”€ Filtered + sorted data โ”€โ”€ */
    const filteredData = useMemo(() => {
        if (!brackets) return [];
        if (!searchText) return brackets;
        const lower = searchText.toLowerCase();
        return brackets.filter(
            (item) =>
                item.reason?.toLowerCase().includes(lower) ||
                item.taxRate?.toString().includes(searchText) ||
                item.minIncome?.toString().includes(searchText) ||
                item.maxIncome?.toString().includes(searchText)
        );
    }, [brackets, searchText]);

    const sorted = useMemo(() => {
        if (!sortKey) return filteredData;
        return [...filteredData].sort((a: any, b: any) => {
            const va = a[sortKey] ?? "";
            const vb = b[sortKey] ?? "";
            if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va;
            return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
        });
    }, [filteredData, sortKey, sortDir]);

    const { currentPage, totalPages, paginatedData, goToPage, changePageSize: changePgSize } =
        usePagination(sorted, { pageSize });


    // โ”€โ”€ Row Selection โ”€โ”€
    const getRowId = useCallback((item: any) => item.incomeTaxBracketId, []);
    const selection = useRowSelection(paginatedData, getRowId);
    const handleSort = (key: string) => {
        if (sortKey === key) { setSortDir(sortDir === "asc" ? "desc" : "asc"); }
        else { setSortKey(key); setSortDir("asc"); }
    };

    /* โ”€โ”€ Modal open/close โ”€โ”€ */
    const openModal = (bracket?: IncomeTaxBracket) => {
        if (bracket) {
            setSelectedBracket(bracket);
            setFormData({
                ...bracket,
                effectiveDateStart: bracket.effectiveDateStart ? bracket.effectiveDateStart.split("T")[0] : "",
                effectiveDateEnd: bracket.effectiveDateEnd ? bracket.effectiveDateEnd.split("T")[0] : "",
            });
        } else {
            setSelectedBracket(null);
            setFormData({
                minIncome: 0, maxIncome: 0, taxRate: 0,
                effectiveDateStart: new Date().toISOString().split("T")[0], effectiveDateEnd: "", reason: "",
            });
        }
        setIsModalOpen(true);
    };

    /* โ”€โ”€ Submit โ”€โ”€ */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate(formData, { onSuccess: () => setIsModalOpen(false) });
    };

    /* โ”€โ”€ Delete โ”€โ”€ */
    const handleDelete = (id: number) => {
        showWarning('REQUIRED_FIELDS', 'Delete Income Tax Bracket', 'Are you sure you want to delete this tax bracket?').then((result) => {
            if (result.isConfirmed) deleteMutation.mutate(id);
        });
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Income Tax Bracket', 'Income Tax Bracket')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Income Tax Bracket', 'Income Tax Bracket') },
                ]}
                actionLabel={t('Add Income Tax Bracket', 'Add Income Tax Bracket')}
                onAction={() => openModal()}
            />

            <div className="flex flex-wrap items-center gap-3">
                <ExportButtons
                    data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))}
                    columns={exportColumns}
                    filenamePrefix="income_tax_brackets"
                    pdfTitle={t('Income Tax Brackets', 'Income Tax Brackets')}
                    totalCount={sorted.length}
                    selectedData={selection.getSelectedRows(sorted)}
                    selectedCount={selection.selectedCount}
                    onClearSelection={selection.clearSelection}
                />
                <ImportExcelButton
                    columns={[
                        { header: "Min Income", key: "minIncome", required: true },
                        { header: "Max Income", key: "maxIncome", required: true },
                        { header: "Tax Rate (%)", key: "taxRate", required: true },
                        { header: "Effective Date Start", key: "effectiveDateStart", required: true },
                        { header: "Effective Date End", key: "effectiveDateEnd", required: true },
                        { header: "Reason", key: "reason" },
                    ]}
                    filenamePrefix="income_tax_brackets"
                    onImport={async (rows) => {
                        let success = 0, failed = 0;
                        const username = localStorage.getItem("username");
                        for (const row of rows) {
                            try {
                                await apiClient.post("/tax/incomeTaxBracket/save", {
                                    incomeTaxBracketId: 0,
                                    minIncome: Number(row.minIncome) || 0,
                                    maxIncome: Number(row.maxIncome) || 0,
                                    taxRate: Number(row.taxRate) || 0,
                                    effectiveDateStart: row.effectiveDateStart || "",
                                    effectiveDateEnd: row.effectiveDateEnd || "",
                                    reason: row.reason ?? "",
                                    isActive: true,
                                    username,
                                });
                                success++;
                            } catch { failed++; }
                        }
                        return { success, failed };
                    }}
                    onImportComplete={() => saveMutation.reset()}
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
                                    paginatedData.map((item: IncomeTaxBracket, idx: number) => {
                                        const rowNum = (currentPage - 1) * pageSize + idx + 1;
                                        return (
                                            <tr key={item.incomeTaxBracketId || idx} className={selection.isSelected(item.incomeTaxBracketId) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(item.incomeTaxBracketId)} onChange={() => selection.toggle(item.incomeTaxBracketId)} />
                                                <td className={ui.tdIndex}>{rowNum}</td>
                                                <td className={`${ui.td} text-right font-medium text-gray-900`}>
                                                    {(item.minIncome ?? 0).toLocaleString()}
                                                </td>
                                                <td className={`${ui.td} text-right font-medium text-gray-900`}>
                                                    {item.maxIncome != null ? item.maxIncome.toLocaleString() : "-"}
                                                </td>
                                                <td className={`${ui.td} text-center`}>
                                                    <span className="inline-block px-3 py-1 bg-nv-violet-light text-nv-violet-dark text-xs font-bold rounded-md border border-blue-100">
                                                        {item.taxRate}%
                                                    </span>
                                                </td>
                                                <td className={ui.td}>{fmtDate(item.effectiveDateStart)}</td>
                                                <td className={ui.td}>{fmtDate(item.effectiveDateEnd)}</td>
                                                <td className={`${ui.td} max-w-[200px] truncate`}>{item.reason || "-"}</td>
                                                <td className={ui.tdActions}>
                                                    <ActionButtons
                                                        onEdit={() => openModal(item)}
                                                        onDelete={() => handleDelete(item.incomeTaxBracketId)}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })
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

            {/* Add/Edit Modal */}
            <ModalWrapper
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedBracket ? t('Edit Income Tax Bracket', 'Edit Income Tax Bracket') : t('Add Income Tax Bracket', 'Add Income Tax Bracket')}
                maxWidth="max-w-2xl"
                footer={
                    <button onClick={handleSubmit} disabled={saveMutation.isPending} className={ui.btnPrimary}>
                        {saveMutation.isPending ? t('Saving...', 'Saving...') : t('Submit', 'Submit')}
                    </button>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label={t('Min Income', 'Min Income')} required>
                            <input type="number" step="0.01" placeholder="0.00" className={ui.input}
                                value={formData.minIncome}
                                onChange={(e) => setFormData({ ...formData, minIncome: Number(e.target.value) })} required />
                        </FormField>
                        <FormField label={t('Max Income', 'Max Income')} required>
                            <input type="number" step="0.01" placeholder="0.00" className={ui.input}
                                value={formData.maxIncome ?? ""}
                                onChange={(e) => setFormData({ ...formData, maxIncome: e.target.value ? Number(e.target.value) : undefined })} required />
                        </FormField>
                    </div>

                    <FormField label={t('Tax Rate (%)', 'Tax Rate (%)')} required>
                        <input type="number" step="0.01" placeholder="0" className={ui.input}
                            value={formData.taxRate}
                            onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })} required />
                    </FormField>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label={t('Effective Date Start', 'Effective Date Start')} required>
                            <input type="date" className={ui.input} value={formData.effectiveDateStart}
                                onChange={(e) => setFormData({ ...formData, effectiveDateStart: e.target.value })} required />
                        </FormField>
                        <FormField label={t('Effective Date End', 'Effective Date End')} required>
                            <input type="date" className={ui.input} value={formData.effectiveDateEnd}
                                onChange={(e) => setFormData({ ...formData, effectiveDateEnd: e.target.value })} required />
                        </FormField>
                    </div>

                    <FormField label={t('Reason', 'Reason')}>
                        <textarea className={ui.textarea} placeholder="Enter reason..." rows={3}
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })} />
                    </FormField>
                </form>
            </ModalWrapper>
        </div>
    );
}
