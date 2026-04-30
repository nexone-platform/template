"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import apiClient from "@/lib/api-client";
import {
    useAllPromotions,
    useUpdatePromotion,
    useApprovePromotion,
    PromotionDto
} from "@/hooks/use-promotion";
import { useEmployeeBrief } from "@/hooks/use-termination";
import { useDepartments, useDesignations } from "@/hooks/use-organization";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { format } from "date-fns";
import { useMessages } from "@/hooks/use-messages";
import { getApiErrorMessage } from "@/lib/api-error";
import { ROUTES } from "@/lib/routes";
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
    StatusBadge,
    ui, SelectAllCheckbox, RowCheckbox,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

type AnyRow = Record<string, any>;

const statusVariant = (status?: string) => {
    if (status === "Approved") return "success";
    if (status === "WaitForApprove") return "warning";
    if (status === "Declined") return "danger";
    return "info";
};

export default function PromotionAdminPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError } = useMessages();

    const exportColumns: ExportColumn[] = [
        { header: "#", key: "_index" },
        { header: t('Employee', 'Employee'), key: "employeeName" },
        { header: t('From', 'From'), key: "designationFrom" },
        { header: t('To', 'To'), key: "designationTo" },
        { header: t('Date', 'Date'), key: "promotionDate", format: (v: any) => v ? new Date(v).toLocaleDateString("en-GB") : "" },
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
    { key: "newSalary", label: t('Salary Change', 'Salary Change'), sortable: true },
    { key: "status", label: t('Status', 'Status') },
    { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ];

    const { data: promotions, isLoading: isPromotionsLoading } = useAllPromotions();
    const { data: employees } = useEmployeeBrief();
    const { data: departments } = useDepartments();
    const { data: designations } = useDesignations();

    const [searchText, setSearchText] = useState("");
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [pageSize, setPageSize] = useState(10);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState<PromotionDto | null>(null);
    const [approveType, setApproveType] = useState<"approve" | "decline" | null>(null);

    const updateMutation = useUpdatePromotion();
    const approveMutation = useApprovePromotion();

    const adminForm = useForm<Partial<PromotionDto>>();
    const approveForm = useForm<{ comments: string }>();

    const selectedEmployeeId = useWatch({ control: adminForm.control, name: "employeeId" });
    const selectedDepartmentTo = useWatch({ control: adminForm.control, name: "departmentToId" });

    useEffect(() => {
        if (selectedEmployeeId && employees) {
            const employee = employees.find(e => e.id === Number(selectedEmployeeId));
            if (employee) {
                const dept = departments?.find(d => d.departmentId === employee.departmentId);
                const desig = Array.isArray(designations) ? designations.find(d => d.designationId === employee.designationId) : undefined;
                adminForm.setValue("departmentFromId", employee.departmentId);
                adminForm.setValue("departmentFrom", dept?.departmentNameEn);
                adminForm.setValue("designationFromId", employee.designationId);
                adminForm.setValue("designationFrom", desig?.designationNameEn);
                adminForm.setValue("oldSalary", employee.salary || 0);
            }
        }
    }, [selectedEmployeeId, employees, departments, designations, adminForm]);

    const list = useMemo(() => promotions ?? [], [promotions]);

    const filtered = useMemo(() => {
        if (!searchText) return list;
        const q = searchText.toLowerCase();
        return list.filter(
            (d) =>
                d.employeeName?.toLowerCase().includes(q) ||
                d.designationFrom?.toLowerCase().includes(q) ||
                d.designationTo?.toLowerCase().includes(q) ||
                d.status?.toLowerCase().includes(q) ||
                String(d.oldSalary ?? "").includes(q) ||
                String(d.newSalary ?? "").includes(q) ||
                (d.promotionDate && format(new Date(d.promotionDate), "dd MMM yyyy").toLowerCase().includes(q))
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
        paginatedData, currentPage, totalPages, goToPage, changePageSize: changePgSize,
    } = usePagination(sorted, { pageSize });


    // โ”€โ”€ Row Selection โ”€โ”€
    const getRowId = useCallback((d: any) => d.promotionId, []);
    const selection = useRowSelection(paginatedData, getRowId);
    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    const filteredDesignationsTo = Array.isArray(designations) ? designations.filter(d =>
        !selectedDepartmentTo || d.departmentId === Number(selectedDepartmentTo)
    ) : [];

    const openModal = (promotion?: PromotionDto) => {
        if (promotion) {
            setSelectedPromotion(promotion);
            adminForm.reset({
                promotionId: promotion.promotionId,
                employeeId: promotion.employeeId,
                departmentFromId: promotion.departmentFromId,
                departmentFrom: promotion.departmentFrom,
                designationFromId: promotion.designationFromId,
                designationFrom: promotion.designationFrom,
                departmentToId: promotion.departmentToId,
                designationToId: promotion.designationToId,
                promotionDate: promotion.promotionDate ? format(new Date(promotion.promotionDate), "yyyy-MM-dd") : "",
                oldSalary: promotion.oldSalary,
                newSalary: promotion.newSalary,
            });
        } else {
            setSelectedPromotion(null);
            adminForm.reset({
                promotionId: 0, employeeId: undefined, departmentToId: undefined,
                designationToId: undefined, promotionDate: "", oldSalary: 0, newSalary: undefined,
            });
        }
        setIsModalOpen(true);
    };

    const openApproveModal = (promotion: PromotionDto, type: "approve" | "decline") => {
        setSelectedPromotion(promotion);
        setApproveType(type);
        approveForm.reset({ comments: "" });
        setIsApproveModalOpen(true);
    };

    const onAdminSubmit = (data: Partial<PromotionDto>) => {
        const username = localStorage.getItem("username") || "system";
        updateMutation.mutate({ ...data, username }, {
            onSuccess: () => {
                showSuccess('SAVE_SUCCESS', 'Success!', 'Promotion record saved successfully.');
                setIsModalOpen(false);
            },
            onError: () => showError('SAVE_ERROR', 'Error!', 'Failed to save promotion record.'),
        });
    };

    const onApproveSubmit = (data: { comments: string }) => {
        if (!selectedPromotion) return;
        const empId = localStorage.getItem("employeeId");
        const username = localStorage.getItem("username") || "system";
        const status = approveType === "approve" ? 1 : 2;

        approveMutation.mutate({
            id: selectedPromotion.promotionId,
            data: {
                approverId: empId ? parseInt(empId) : 0,
                username, status, comments: data.comments,
            },
        }, {
            onSuccess: () => {
                showSuccess('SAVE_SUCCESS', 'Success!', `Promotion has been ${approveType}d successfully.`);
                setIsApproveModalOpen(false);
            },
            onError: (error: unknown) => {
                const apiError = error as { response?: { data?: { message?: string } } };
                showError('SAVE_ERROR', 'Error!', getApiErrorMessage(apiError, `Failed to ${approveType} promotion.`));
            },
        });
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        try { return format(new Date(dateStr), "dd MMM yyyy"); }
        catch { return dateStr; }
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Promotion Admin', 'Promotion Admin')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard },
                    { label: t('Promotion Admin', 'Promotion Admin') },
                ]}
                actionLabel={t('Add', 'Add')}
                onAction={() => openModal()}
            />

            <div className="flex flex-wrap items-center gap-3">
                <ExportButtons
                    data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))}
                    columns={exportColumns}
                    filenamePrefix="promotions_admin"
                    pdfTitle={t('Promotion Admin', 'Promotion Admin')}
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
                    filenamePrefix="promotions_admin"
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

                {isPromotionsLoading ? (
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
                                            <td className={ui.td}>
                                                <span className="text-gray-500">{d.oldSalary?.toLocaleString()}</span>
                                                <span className="mx-1">โ’</span>
                                                <span className="font-semibold text-nv-violet">{d.newSalary?.toLocaleString()}</span>
                                            </td>
                                            <td className={ui.td}>
                                                <StatusBadge
                                                    status={d.status === "WaitForApprove" ? "Pending" : d.status}
                                                    variant={statusVariant(d.status)}
                                                />
                                            </td>
                                            <td className={ui.tdActions}>
                                                <div className="flex items-center justify-end gap-1">
                                                    {(d.status === "New" || d.status === "WaitForApprove") && (
                                                        <>
                                                            <button onClick={() => openApproveModal(d as PromotionDto, "approve")} className="p-1.5 text-nv-violet hover:bg-nv-violet-light rounded-lg transition-colors" title={t('Approve', 'Approve')}>
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => openApproveModal(d as PromotionDto, "decline")} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title={t('Decline', 'Decline')}>
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <ActionButtons onEdit={() => openModal(d as PromotionDto)} />
                                                </div>
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

            {/* Add/Edit Modal */}
            <ModalWrapper
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedPromotion ? t('Edit Promotion', 'Edit Promotion') : t('Add Promotion', 'Add Promotion')}
                maxWidth="max-w-2xl"
                footer={
                    <button onClick={adminForm.handleSubmit(onAdminSubmit)} disabled={updateMutation.isPending} className={ui.btnPrimary}>
                        {updateMutation.isPending ? t('Saving...', 'Saving...') : t('Submit', 'Submit')}
                    </button>
                }
            >
                <div className="space-y-4">
                    <FormField label={t('Employee', 'Employee')} required>
                        <select disabled={!!selectedPromotion} {...adminForm.register("employeeId", { required: true })} className={`${ui.select} disabled:opacity-50`}>
                            <option value="">{t('Select Employee', 'Select Employee')}</option>
                            {employees?.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.firstNameEn} {emp.lastNameEn} ({emp.employeeId})</option>
                            ))}
                        </select>
                    </FormField>

                    <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                            <span className="text-xs text-gray-500 font-medium">{t('Current Department', 'Current Department')}</span>
                            <p className="text-sm font-semibold text-gray-800">{adminForm.getValues("departmentFrom") || "-"}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-medium">{t('Current Designation', 'Current Designation')}</span>
                            <p className="text-sm font-semibold text-gray-800">{adminForm.getValues("designationFrom") || "-"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Target Department', 'Target Department')} required>
                            <select {...adminForm.register("departmentToId", { required: true })} className={ui.select}>
                                <option value="">{t('Select Department', 'Select Department')}</option>
                                {departments?.map(d => (
                                    <option key={d.departmentId} value={d.departmentId}>{d.departmentNameEn}</option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label={t('Target Designation', 'Target Designation')} required>
                            <select {...adminForm.register("designationToId", { required: true })} className={ui.select}>
                                <option value="">{t('Select Designation', 'Select Designation')}</option>
                                {filteredDesignationsTo?.map(d => (
                                    <option key={d.designationId} value={d.designationId}>{d.designationNameEn}</option>
                                ))}
                            </select>
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label={t('Effective Date', 'Effective Date')} required>
                            <input type="date" {...adminForm.register("promotionDate", { required: true })} className={ui.input} />
                        </FormField>
                        <FormField label={t('Old Salary', 'Old Salary')}>
                            <input type="number" readOnly {...adminForm.register("oldSalary")} className={`${ui.input} bg-gray-100 text-gray-500`} />
                        </FormField>
                        <FormField label={t('New Salary', 'New Salary')} required>
                            <input type="number" {...adminForm.register("newSalary", { required: true })} className={ui.input} />
                        </FormField>
                    </div>
                </div>
            </ModalWrapper>

            {/* Approve/Decline Modal */}
            <ModalWrapper
                open={isApproveModalOpen}
                onClose={() => setIsApproveModalOpen(false)}
                title={approveType === "approve" ? t('Approve Promotion', 'Approve Promotion') : t('Decline Promotion', 'Decline Promotion')}
                maxWidth="max-w-md"
                footer={
                    <button
                        onClick={approveForm.handleSubmit(onApproveSubmit)}
                        disabled={approveMutation.isPending}
                        className={approveType === "approve" ? "px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50" : "px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"}
                    >
                        {approveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
                        {t('Confirm', 'Confirm')}
                    </button>
                }
            >
                <FormField label={t('Comments', 'Comments')} required>
                    <textarea {...approveForm.register("comments", { required: true })} className={ui.textarea} placeholder="Provide context for this decision..." rows={4} />
                </FormField>
            </ModalWrapper>
        </div>
    );
}
