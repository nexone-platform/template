"use client";

import { useEffect,  useState, useMemo, useCallback } from "react";
import apiClient from "@/lib/api-client";
import {
    useTaxTypes,
    useSaveTaxType,
    useDeleteTaxType,
    TaxDeductionType,
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

export default function TaxTypePage() {
    const { t } = usePageTranslation();
    const { showWarning } = useMessages();

    const exportColumns: ExportColumn[] = [
        { header: "#", key: "_index" },
        { header: t('Code', 'Code'), key: "taxDeductionTypeCode" },
        { header: t('Name (TH)', 'Name (TH)'), key: "taxDeductionTypeNameTh" },
        { header: t('Name (EN)', 'Name (EN)'), key: "taxDeductionTypeNameEn" },
        { header: t('Max Amount', 'Max Amount'), key: "maxAmount" },
        { header: t('Effective Start', 'Effective Start'), key: "effectiveDateStart",
            format: (v) => { if (!v) return "-"; try { return format(new Date(v), "dd/MM/yyyy"); } catch { return "-"; } } },
        { header: t('Effective End', 'Effective End'), key: "effectiveDateEnd",
            format: (v) => { if (!v) return "-"; try { return format(new Date(v), "dd/MM/yyyy"); } catch { return "-"; } } },
    ];

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "taxDeductionTypeCode", label: t('Code', 'Code'), sortable: true },
    { key: "taxDeductionTypeNameTh", label: t('Name (TH)', 'Name (TH)'), sortable: true },
    { key: "taxDeductionTypeNameEn", label: t('Name (EN)', 'Name (EN)'), sortable: true },
    { key: "maxAmount", label: t('Max Amount', 'Max Amount'), sortable: true, align: "right" as const },
    { key: "effectiveDateStart", label: t('Eff. Start', 'Eff. Start') },
    { key: "effectiveDateEnd", label: t('Eff. End', 'Eff. End') },
    { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ];

    /* โ”€โ”€ Data hooks โ”€โ”€ */
    const { data: taxTypes, isLoading } = useTaxTypes();
    const saveMutation = useSaveTaxType();
    const deleteMutation = useDeleteTaxType();

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
    const [selectedType, setSelectedType] = useState<TaxDeductionType | null>(null);

    /* โ”€โ”€ Form state โ”€โ”€ */
    const [formData, setFormData] = useState<Partial<TaxDeductionType>>({
        taxDeductionTypeCode: "", taxDeductionTypeNameTh: "", taxDeductionTypeNameEn: "",
        maxAmount: 0, effectiveDateStart: new Date().toISOString().split("T")[0], effectiveDateEnd: "",
    });

    /* โ”€โ”€ Format date helper โ”€โ”€ */
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        try { return format(new Date(dateStr), "dd/MM/yyyy"); } catch { return dateStr; }
    };

    /* โ”€โ”€ Filtered + sorted data โ”€โ”€ */
    const filteredData = useMemo(() => {
        if (!taxTypes) return [];
        if (!searchText) return taxTypes;
        const lower = searchText.toLowerCase();
        return taxTypes.filter(
            (item) =>
                item.taxDeductionTypeNameEn?.toLowerCase().includes(lower) ||
                item.taxDeductionTypeNameTh?.toLowerCase().includes(lower) ||
                item.taxDeductionTypeCode?.toLowerCase().includes(lower)
        );
    }, [taxTypes, searchText]);

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
    const getRowId = useCallback((item: any) => item.taxDeductionTypeId, []);
    const selection = useRowSelection(paginatedData, getRowId);
    const handleSort = (key: string) => {
        if (sortKey === key) { setSortDir(sortDir === "asc" ? "desc" : "asc"); }
        else { setSortKey(key); setSortDir("asc"); }
    };

    /* โ”€โ”€ Modal open/close โ”€โ”€ */
    const openModal = (type?: TaxDeductionType) => {
        if (type) {
            setSelectedType(type);
            setFormData({
                ...type,
                effectiveDateStart: type.effectiveDateStart ? type.effectiveDateStart.split("T")[0] : "",
                effectiveDateEnd: type.effectiveDateEnd ? type.effectiveDateEnd.split("T")[0] : "",
            });
        } else {
            setSelectedType(null);
            setFormData({
                taxDeductionTypeCode: "", taxDeductionTypeNameTh: "", taxDeductionTypeNameEn: "",
                maxAmount: 0, effectiveDateStart: new Date().toISOString().split("T")[0], effectiveDateEnd: "",
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
        showWarning('REQUIRED_FIELDS', 'Delete Tax Deduction Type', 'Are you sure you want to delete this tax type?').then((result) => {
            if (result.isConfirmed) deleteMutation.mutate(id);
        });
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Tax Deduction Type', 'Tax Deduction Type')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Tax Deduction Type', 'Tax Deduction Type') },
                ]}
                actionLabel={t('Add Tax Deduction Type', 'Add Tax Deduction Type')}
                onAction={() => openModal()}
            />

            <div className="flex flex-wrap items-center gap-3">
                <ExportButtons
                    data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))}
                    columns={exportColumns}
                    filenamePrefix="tax_deduction_types"
                    pdfTitle={t('Tax Deduction Types', 'Tax Deduction Types')}
                    totalCount={sorted.length}
                    selectedData={selection.getSelectedRows(sorted)}
                    selectedCount={selection.selectedCount}
                    onClearSelection={selection.clearSelection}
                />
                <ImportExcelButton
                    columns={[
                        { header: "Tax Deduction Type Code", key: "taxDeductionTypeCode", required: true },
                        { header: "Name (TH)", key: "taxDeductionTypeNameTh", required: true },
                        { header: "Name (EN)", key: "taxDeductionTypeNameEn", required: true },
                        { header: "Max Amount", key: "maxAmount", required: true },
                        { header: "Effective Date Start", key: "effectiveDateStart", required: true },
                        { header: "Effective Date End", key: "effectiveDateEnd", required: true },
                    ]}
                    filenamePrefix="tax_deduction_types"
                    onImport={async (rows) => {
                        let success = 0, failed = 0;
                        const username = localStorage.getItem("username");
                        for (const row of rows) {
                            try {
                                await apiClient.post("/tax/taxType/save", {
                                    taxDeductionTypeId: 0,
                                    taxDeductionTypeCode: row.taxDeductionTypeCode ?? "",
                                    taxDeductionTypeNameTh: row.taxDeductionTypeNameTh ?? "",
                                    taxDeductionTypeNameEn: row.taxDeductionTypeNameEn ?? "",
                                    maxAmount: Number(row.maxAmount) || 0,
                                    effectiveDateStart: row.effectiveDateStart || "",
                                    effectiveDateEnd: row.effectiveDateEnd || "",
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
                                    paginatedData.map((item: TaxDeductionType, idx: number) => {
                                        const rowNum = (currentPage - 1) * pageSize + idx + 1;
                                        return (
                                            <tr key={item.taxDeductionTypeId || idx} className={selection.isSelected(item.taxDeductionTypeId) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(item.taxDeductionTypeId)} onChange={() => selection.toggle(item.taxDeductionTypeId)} />
                                                <td className={ui.tdIndex}>{rowNum}</td>
                                                <td className={ui.td}>
                                                    <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-md uppercase tracking-wider">
                                                        {item.taxDeductionTypeCode || "-"}
                                                    </span>
                                                </td>
                                                <td className={ui.tdBold}>{item.taxDeductionTypeNameTh || "-"}</td>
                                                <td className={ui.td}>{item.taxDeductionTypeNameEn || "-"}</td>
                                                <td className={`${ui.td} text-right font-medium text-gray-900`}>
                                                    {(item.maxAmount ?? 0).toLocaleString()}
                                                </td>
                                                <td className={ui.td}>{formatDate(item.effectiveDateStart)}</td>
                                                <td className={ui.td}>{formatDate(item.effectiveDateEnd)}</td>
                                                <td className={ui.tdActions}>
                                                    <ActionButtons
                                                        onEdit={() => openModal(item)}
                                                        onDelete={() => handleDelete(item.taxDeductionTypeId)}
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
                title={selectedType ? t('Edit Tax Deduction Type', 'Edit Tax Deduction Type') : t('Add Tax Deduction Type', 'Add Tax Deduction Type')}
                maxWidth="max-w-2xl"
                footer={
                    <button onClick={handleSubmit} disabled={saveMutation.isPending} className={ui.btnPrimary}>
                        {saveMutation.isPending ? t('Saving...', 'Saving...') : t('Submit', 'Submit')}
                    </button>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label={t('Tax Deduction Type Code', 'Tax Deduction Type Code')} required>
                        <input className={selectedType ? ui.inputDisabled : ui.input}
                            placeholder={t('EX: T001', 'EX: T001')} value={formData.taxDeductionTypeCode}
                            onChange={(e) => setFormData({ ...formData, taxDeductionTypeCode: e.target.value })}
                            disabled={!!selectedType} required />
                    </FormField>

                    <FormField label={t('Name (TH)', 'Name (TH)')} required>
                        <input className={ui.input} placeholder="เธ เธฒเธฉเธฒเนเธ—เธข..."
                            value={formData.taxDeductionTypeNameTh}
                            onChange={(e) => setFormData({ ...formData, taxDeductionTypeNameTh: e.target.value })} required />
                    </FormField>

                    <FormField label={t('Name (EN)', 'Name (EN)')} required>
                        <input className={ui.input} placeholder="English name..."
                            value={formData.taxDeductionTypeNameEn}
                            onChange={(e) => setFormData({ ...formData, taxDeductionTypeNameEn: e.target.value })} required />
                    </FormField>

                    <FormField label={t('Max Amount', 'Max Amount')} required>
                        <input type="number" step="0.01" placeholder="0.00" className={ui.input}
                            value={formData.maxAmount}
                            onChange={(e) => setFormData({ ...formData, maxAmount: Number(e.target.value) })} required />
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
                </form>
            </ModalWrapper>
        </div>
    );
}
