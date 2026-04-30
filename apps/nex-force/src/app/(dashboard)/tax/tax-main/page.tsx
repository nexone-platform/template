"use client";

import { useState, useMemo, useCallback } from "react";
import apiClient from "@/lib/api-client";
import { useRouter } from "next/navigation";
import {
    useTaxDeductions,
    useTaxTypes,
    useSaveTaxDeduction,
    useDeleteTaxDeduction,
    TaxDeduction,
} from "@/hooks/use-tax";
import { useEmployeeSelect, type EmployeeSelect } from "@/hooks/use-employee";
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

export default function TaxMainPage() {
    const { t } = usePageTranslation();
    const { showWarning } = useMessages();

    const exportColumns: ExportColumn[] = [
        { header: "#", key: "_index" },
        { header: t('Employee', 'Employee'), key: "employeeName" },
        { header: t('Deduction Type', 'Deduction Type'), key: "taxDeductionTypeName" },
        { header: t('Deduction Date', 'Deduction Date'), key: "deductionDate",
            format: (v) => { if (!v) return "-"; try { return format(new Date(v), "dd/MM/yyyy"); } catch { return "-"; } } },
        { header: t('Amount', 'Amount'), key: "deductionAmount" },
        { header: t('Effective Start', 'Effective Start'), key: "effectiveDateStart",
            format: (v) => { if (!v) return "-"; try { return format(new Date(v), "dd/MM/yyyy"); } catch { return "-"; } } },
        { header: t('Effective End', 'Effective End'), key: "effectiveDateEnd",
            format: (v) => { if (!v) return "-"; try { return format(new Date(v), "dd/MM/yyyy"); } catch { return "-"; } } },
        { header: t('Reason', 'Reason'), key: "reason" },
    ];

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "employeeName", label: t('Employee', 'Employee'), sortable: true },
    { key: "taxDeductionTypeName", label: t('Deduction Type', 'Deduction Type'), sortable: true },
    { key: "deductionDate", label: t('Deduction Date', 'Deduction Date'), sortable: true },
    { key: "deductionAmount", label: t('Amount', 'Amount'), sortable: true, align: "right" as const },
    { key: "effectiveDateStart", label: t('Eff. Start', 'Eff. Start') },
    { key: "effectiveDateEnd", label: t('Eff. End', 'Eff. End') },
    { key: "reason", label: t('Reason', 'Reason') },
    { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ];

    const router = useRouter();

    /* โ”€โ”€ Data hooks โ”€โ”€ */
    const { data: deductions, isLoading } = useTaxDeductions();
    const { data: taxTypes } = useTaxTypes();
    const { data: employees } = useEmployeeSelect();
    const saveMutation = useSaveTaxDeduction();
    const deleteMutation = useDeleteTaxDeduction();

    /* โ”€โ”€ Search / Filter โ”€โ”€ */
    const [searchText, setSearchText] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    /* โ”€โ”€ Modal state โ”€โ”€ */
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDeduction, setSelectedDeduction] = useState<TaxDeduction | null>(null);

    /* โ”€โ”€ Form state โ”€โ”€ */
    const [formData, setFormData] = useState<Partial<TaxDeduction>>({
        employeeName: "", employeeId: 0, taxDeductionTypeId: 0,
        deductionAmount: 0, deductionDate: new Date().toISOString().split("T")[0],
        effectiveDateStart: new Date().toISOString().split("T")[0], effectiveDateEnd: "", reason: "",
    });

    /* โ”€โ”€ Format date helper โ”€โ”€ */
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        try { return format(new Date(dateStr), "dd/MM/yyyy"); } catch { return dateStr; }
    };

    /* โ”€โ”€ Filtered + sorted data โ”€โ”€ */
    const filteredData = useMemo(() => {
        if (!deductions) return [];
        if (!searchText) return deductions;
        const lower = searchText.toLowerCase();
        return deductions.filter(
            (item) =>
                item.employeeName?.toLowerCase().includes(lower) ||
                item.taxDeductionTypeName?.toLowerCase().includes(lower) ||
                item.reason?.toLowerCase().includes(lower) ||
                String(item.deductionAmount ?? "").includes(lower)
        );
    }, [deductions, searchText]);

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
    const getRowId = useCallback((item: any) => item.taxDeductionId, []);
    const selection = useRowSelection(paginatedData, getRowId);
    const handleSort = (key: string) => {
        if (sortKey === key) { setSortDir(sortDir === "asc" ? "desc" : "asc"); }
        else { setSortKey(key); setSortDir("asc"); }
    };

    /* โ”€โ”€ Navigate to employee profile โ”€โ”€ */
    const navigateProfile = (id?: number) => {
        if (id) router.push(`/employees/profile/${id}`);
    };

    /* โ”€โ”€ Modal open/close โ”€โ”€ */
    const openModal = (deduction?: TaxDeduction) => {
        if (deduction) {
            setSelectedDeduction(deduction);
            setFormData({
                ...deduction,
                deductionDate: deduction.deductionDate ? deduction.deductionDate.split("T")[0] : "",
                effectiveDateStart: deduction.effectiveDateStart ? deduction.effectiveDateStart.split("T")[0] : "",
                effectiveDateEnd: deduction.effectiveDateEnd ? deduction.effectiveDateEnd.split("T")[0] : "",
            });
        } else {
            setSelectedDeduction(null);
            setFormData({
                employeeName: "", employeeId: 0, taxDeductionTypeId: 0,
                deductionAmount: 0, deductionDate: new Date().toISOString().split("T")[0],
                effectiveDateStart: new Date().toISOString().split("T")[0], effectiveDateEnd: "", reason: "",
            });
        }
        setIsModalOpen(true);
    };

    const handleEmployeeChange = (employeeId: number) => {
        const emp = employees?.find((e: EmployeeSelect) => e.id === employeeId);
        if (emp) {
            setFormData({ ...formData, employeeId: emp.id, employeeName: emp.firstNameEn + " " + emp.lastNameEn });
        }
    };

    /* โ”€โ”€ Submit โ”€โ”€ */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate(formData, { onSuccess: () => setIsModalOpen(false) });
    };

    /* โ”€โ”€ Delete โ”€โ”€ */
    const handleDelete = (id: number) => {
        showWarning('REQUIRED_FIELDS', 'Delete Tax Deduction', 'Are you sure you want to delete this record?').then((result) => {
            if (result.isConfirmed) deleteMutation.mutate(id);
        });
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Tax Deductions', 'Tax Deductions')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Tax Deductions', 'Tax Deductions') },
                ]}
                actionLabel={t('Add Tax Deduction', 'Add Tax Deduction')}
                onAction={() => openModal()}
            />

            <div className="flex flex-wrap items-center gap-3">
                <ExportButtons
                    data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))}
                    columns={exportColumns}
                    filenamePrefix="tax_deductions"
                    pdfTitle={t('Tax Deductions', 'Tax Deductions')}
                    totalCount={sorted.length}
                    selectedData={selection.getSelectedRows(sorted)}
                    selectedCount={selection.selectedCount}
                    onClearSelection={selection.clearSelection}
                />
                <ImportExcelButton
                    columns={[
                        { header: "Employee ID", key: "employeeId", required: true },
                        { header: "Tax Deduction Type ID", key: "taxDeductionTypeId", required: true },
                        { header: "Deduction Amount", key: "deductionAmount", required: true },
                        { header: "Deduction Date", key: "deductionDate", required: true },
                        { header: "Effective Date Start", key: "effectiveDateStart", required: true },
                        { header: "Effective Date End", key: "effectiveDateEnd", required: true },
                        { header: "Reason", key: "reason" },
                    
                        { header: "Employee", key: "employeeName" },
                        { header: "Deduction Type", key: "taxDeductionTypeName" },]}
                    filenamePrefix="tax_deductions"
                    onImport={async (rows) => {
                        let success = 0, failed = 0;
                        const username = localStorage.getItem("username");
                        for (const row of rows) {
                            try {
                                await apiClient.post("/tax/update", {
                                    taxDeductionId: 0,
                                    employeeId: Number(row.employeeId) || 0,
                                    taxDeductionTypeId: Number(row.taxDeductionTypeId) || 0,
                                    deductionAmount: Number(row.deductionAmount) || 0,
                                    deductionDate: row.deductionDate || "",
                                    effectiveDateStart: row.effectiveDateStart || "",
                                    effectiveDateEnd: row.effectiveDateEnd || "",
                                    reason: row.reason ?? "",
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
                                    paginatedData.map((item: TaxDeduction, idx: number) => {
                                        const rowNum = (currentPage - 1) * pageSize + idx + 1;
                                        return (
                                            <tr key={item.taxDeductionId || idx} className={selection.isSelected(item.taxDeductionId) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(item.taxDeductionId)} onChange={() => selection.toggle(item.taxDeductionId)} />
                                                <td className={ui.tdIndex}>{rowNum}</td>
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
                                                        <button
                                                            onClick={() => navigateProfile(item.employeeId)}
                                                            className="text-sm font-medium text-nv-violet hover:text-nv-violet-dark hover:underline transition-colors"
                                                        >
                                                            {item.employeeName || "-"}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className={ui.td}>
                                                    <span className="inline-block px-2.5 py-1 bg-nv-violet-light text-nv-violet-dark text-xs font-semibold rounded-md border border-blue-100">
                                                        {item.taxDeductionTypeName || "-"}
                                                    </span>
                                                </td>
                                                <td className={ui.td}>{formatDate(item.deductionDate)}</td>
                                                <td className={`${ui.td} text-right font-medium text-gray-900`}>
                                                    {(item.deductionAmount ?? 0).toLocaleString()}
                                                </td>
                                                <td className={ui.td}>{formatDate(item.effectiveDateStart)}</td>
                                                <td className={ui.td}>{formatDate(item.effectiveDateEnd)}</td>
                                                <td className={`${ui.td} max-w-[200px] truncate`}>{item.reason || "-"}</td>
                                                <td className={ui.tdActions}>
                                                    <ActionButtons
                                                        onEdit={() => openModal(item)}
                                                        onDelete={() => handleDelete(item.taxDeductionId)}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })
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

            {/* Add/Edit Modal */}
            <ModalWrapper
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedDeduction ? t('Edit Tax Deduction', 'Edit Tax Deduction') : t('Add Tax Deduction', 'Add Tax Deduction')}
                maxWidth="max-w-2xl"
                footer={
                    <button onClick={handleSubmit} disabled={saveMutation.isPending} className={ui.btnPrimary}>
                        {saveMutation.isPending ? t('Saving...', 'Saving...') : t('Submit', 'Submit')}
                    </button>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label={t('Employee', 'Employee')} required>
                        <select className={ui.select} value={formData.employeeId}
                            onChange={(e) => handleEmployeeChange(Number(e.target.value))} required>
                            <option value={0}>{t('Select Employee', 'Select Employee')}</option>
                            {employees?.map((emp: EmployeeSelect) => (
                                <option key={emp.employeeId} value={emp.employeeId}>
                                    {emp.firstNameEn} {emp.lastNameEn}
                                </option>
                            ))}
                        </select>
                    </FormField>

                    <FormField label={t('Tax Deduction Type', 'Tax Deduction Type')} required>
                        <select className={ui.select} value={formData.taxDeductionTypeId}
                            onChange={(e) => setFormData({ ...formData, taxDeductionTypeId: Number(e.target.value) })} required>
                            <option value={0}>{t('Select Type', 'Select Type')}</option>
                            {taxTypes?.map((type) => (
                                <option key={type.taxDeductionTypeId} value={type.taxDeductionTypeId}>
                                    {type.taxDeductionTypeNameEn}
                                </option>
                            ))}
                        </select>
                    </FormField>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label={t('Deduction Date', 'Deduction Date')} required>
                            <input type="date" className={ui.input} value={formData.deductionDate}
                                onChange={(e) => setFormData({ ...formData, deductionDate: e.target.value })} required />
                        </FormField>
                        <FormField label={t('Deduction Amount', 'Deduction Amount')} required>
                            <input type="number" step="0.01" placeholder="0.00" className={ui.input}
                                value={formData.deductionAmount}
                                onChange={(e) => setFormData({ ...formData, deductionAmount: Number(e.target.value) })} required />
                        </FormField>
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
