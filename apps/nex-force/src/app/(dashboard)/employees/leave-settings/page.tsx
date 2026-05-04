"use client";

import { useEffect,  useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { getUserProfile } from "@/lib/auth";
import { useMessages } from "@/hooks/use-messages";
import { leaveService } from "@/services/leave.service";
import { employeeService } from "@/services/employee.service";
import { usePagination } from "@/hooks/use-pagination";
import ExportButtons from "@/components/ExportButtons";
import type { ExportColumn } from "@/lib/table-export";
import {
    PageHeader, ModalWrapper, FormField, LoadingSpinner, TableHeaderBar,
    EmptyState, PaginationBar, SortableTh, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";
import { useSystemConfig } from '@nexone/ui';



export default function LeaveSettingsPage() {
    const { t } = usePageTranslation();
    const { msg, showSuccess, showError, showWarning } = useMessages();

    const tableColumns = useMemo(() => [
        { key: "employeeName", label: t('Employee Name', 'Employee Name'), sortable: true },
        { key: "sumQuotaDays", label: t('Sum Quota Days', 'Sum Quota Days'), sortable: true },
        { key: "year", label: t('Year', 'Year'), sortable: true },
    ], [t]);

    type AnyRow = Record<string, any>;

    const exportColumns: ExportColumn[] = useMemo(() => [
    { header: t('Employee Name', 'Employee Name'), key: "employeeName" },
    { header: t('Sum Quota Days', 'Sum Quota Days'), key: "sumQuotaDays" },
    { header: t('Year', 'Year'), key: "year" },
    ], [t]);
    const queryClient = useQueryClient();
    const userProfile = getUserProfile() ?? "";

    // ── Data queries (matching Angular: getTableData + getData) ──
    const { data: quotaData, isLoading } = useQuery({
        queryKey: ["leaveQuota"],
        queryFn: leaveService.getLeaveQuota,
    });

    const { data: leaveTypesResult } = useQuery({
        queryKey: ["masterLeaveType"],
        queryFn: leaveService.getMasterLeaveType,
    });

    const { data: employeesResult } = useQuery({
        queryKey: ["employees", "autocomplete"],
        queryFn: employeeService.getForAutocomplete,
    });

    // ── Mutations ──
    const updateMutation = useMutation({
        mutationFn: leaveService.updateLeaveQuota,
        onSuccess: () => {
            showSuccess('SAVE_SUCCESS', 'Success!', 'Leave quota saved successfully.');
            queryClient.invalidateQueries({ queryKey: ["leaveQuota"] });
            setModalOpen(false);
        },
        onError: (err: unknown) => {
            const errMsg =
                (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message ??
                (err as { error?: string })?.error ??
                "Error saving leave quota";
            showError('SAVE_ERROR', 'Error!', errMsg);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: leaveService.deleteLeaveQuota,
        onSuccess: (res) => {
            showSuccess('DELETE_SUCCESS', 'Success!', res?.message || 'Deleted successfully.');
            queryClient.invalidateQueries({ queryKey: ["leaveQuota"] });
            setDeleteModalOpen(false);
        },
        onError: () => {
            showError('DELETE_ERROR', 'Error!', 'Error deleting leave quota');
        },
    });

    // ── Derived data ──
    const allQuotas: AnyRow[] = useMemo(() => Array.isArray(quotaData?.data) ? quotaData.data : [], [quotaData]);
    const leaveTypes = useMemo(() => leaveTypesResult?.data ?? [], [leaveTypesResult]);
    const employees: AnyRow[] = useMemo(
        () => (Array.isArray(employeesResult?.data) ? employeesResult.data : []),
        [employeesResult]
    );

    // ── Search / filter state ──
    const [searchYear, setSearchYear] = useState("");
    const [searchName, setSearchName] = useState("");

    // Sort
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

    // Modals
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<AnyRow | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [formTouched, setFormTouched] = useState(false);
    const [formData, setFormData] = useState<AnyRow>({
        employeeId: "",
        year: "",
        leaveQuotas: [{ leaveTypeId: 0, quotaId: 0, quotaDays: "", extraDay: null }],
    });

    // ── Filter (Angular: filterRequests) — client-side ──
    const filteredData = useMemo(() => {
        return allQuotas.filter((row) => {
            const matchName =
                !searchName || (row.employeeName || "").includes(searchName);
            const matchYear =
                !searchYear || (row.year?.toString() || "").includes(searchYear);
            return matchName && matchYear;
        });
    }, [allQuotas, searchName, searchYear]);

    // Sort
    const sortedData = useMemo(() => {
        if (!sortKey) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aVal = a[sortKey] ?? "";
            const bVal = b[sortKey] ?? "";
            return (aVal < bVal ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
        });
    }, [filteredData, sortKey, sortDir]);

    const {
        paginatedData,
        currentPage,
        totalPages,
        goToPage,
        changePageSize: changePgSize,
    } = usePagination<AnyRow>(sortedData, { pageSize });

    // ── Handlers ──
    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const onClear = () => {
        setSearchYear("");
        setSearchName("");
    };

    const openAdd = () => {
        setSelectedItem(null);
        setFormData({
            employeeId: "",
            year: "",
            leaveQuotas: [{ leaveTypeId: 0, quotaId: 0, quotaDays: "", extraDay: null }],
        });
        setFormTouched(false);
        setModalOpen(true);
    };

    const openEdit = (item: AnyRow) => {
        setSelectedItem(item);
        setFormData({
            employeeId: item.employeeId,
            year: item.year,
            leaveQuotas: item.leaveQuotas || [
                { leaveTypeId: 0, quotaId: 0, quotaDays: "", extraDay: null },
            ],
        });
        setFormTouched(false);
        setModalOpen(true);
    };

    const addQuotaRow = () => {
        setFormData((prev: AnyRow) => ({
            ...prev,
            leaveQuotas: [
                ...prev.leaveQuotas,
                { leaveTypeId: 0, quotaId: 0, quotaDays: "", extraDay: null },
            ],
        }));
    };

    const removeQuotaRow = (index: number) => {
        setFormData((prev: AnyRow) => ({
            ...prev,
            leaveQuotas: prev.leaveQuotas.filter((_: unknown, i: number) => i !== index),
        }));
    };

    // Angular: onSubmit sends { employeeId, year, leaveQuotas, username }
    const handleSubmit = () => {
        setFormTouched(true);
        if (!formData.employeeId || !formData.year) {
            showWarning('REQUIRED_FIELDS', 'Validation Error', 'Please fill in all required fields.');
            return;
        }
        updateMutation.mutate({
            employeeId: formData.employeeId,
            year: formData.year,
            leaveQuotas: formData.leaveQuotas,
            username: userProfile,
        });
    };

    // ── Render ──
    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Leave Settings', 'Leave Settings')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard') }, { label: t('Leave Settings', 'Leave Settings') }]}
                actionLabel={t('Add', 'Add')}
                onAction={openAdd}
            />

            {/* ── Search Filter ── */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                    <FormField label={t('Year', 'Year')}>
                        <input
                            type="text"
                            value={searchYear}
                            onChange={(e) => setSearchYear(e.target.value)}
                            className={ui.input}
                            placeholder={t('Year', 'Year')}
                        />
                    </FormField>
                    <FormField label={t('Employee Name', 'Employee Name')}>
                        <input
                            type="text"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            className={ui.input}
                            placeholder={t('Employee Name', 'Employee Name')}
                        />
                    </FormField>
                    <button
                        type="button"
                        className="px-5 py-2.5 bg-nv-violet text-white text-sm font-medium rounded-lg hover:bg-nv-violet-dark transition-all shadow-sm"
                    >
                        Search
                    </button>
                    <button
                        onClick={onClear}
                        className={ui.btnSecondary}
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* ── Export Buttons ── */}
            <ExportButtons
                data={sortedData}
                columns={exportColumns}
                filenamePrefix="leave_settings"
                pdfTitle={t('Leave Settings', 'Leave Settings')}
                totalCount={sortedData.length}
            />

            {/* ── Table ── */}
            <div className={ui.tableWrapper}>
                <TableHeaderBar pageSize={pageSize} onPageSizeChange={(v) => { setPageSize(v); changePgSize(v); }} />

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
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={ui.tbody}>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((row: AnyRow, idx: number) => (
                                        <tr
                                            key={idx}
                                            className={ui.tr}
                                        >
                                            <td className={ui.td}>
                                                {row.employeeName}
                                            </td>
                                            <td className={ui.td}>
                                                {row.sumQuotaDays}
                                            </td>
                                            <td className={ui.td}>
                                                {row.year}
                                            </td>
                                            <td className={ui.tdActions}>
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEdit(row)}
                                                        className="p-1.5 text-gray-400 hover:text-nv-violet hover:bg-nv-violet-light rounded-md transition-colors"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setDeleteId(row.leaveTypeId);
                                                            setDeleteModalOpen(true);
                                                        }}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4}>
                                            <EmptyState message={t('No Data Found', 'No Data Found')} />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <PaginationBar
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalData={sortedData.length}
                    pageSize={pageSize}
                    onGoToPage={goToPage}
                />
            </div>

            {/* ──────── Add / Edit Modal ──────── */}
            <ModalWrapper
                open={modalOpen}
                onClose={() => { setModalOpen(false); setFormTouched(false); }}
                title={`${selectedItem ? "Edit" : "Add"} Leave Quota`}
                footer={
                    <button
                        onClick={handleSubmit}
                        disabled={updateMutation.isPending}
                        className={`w-full ${ui.btnPrimary}`}
                    >
                        {updateMutation.isPending ? "Saving..." : "Submit"}
                    </button>
                }
            >
                <div className="space-y-4">
                    {/* Employee + Year */}
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label={t('Employee Name', 'Employee Name')} required error={formTouched && !formData.employeeId ? msg('VAL_EMPLOYEE_NAME_REQUIRED', '* Employee Name is required') : undefined}>
                            <select
                                value={formData.employeeId}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        employeeId: e.target.value,
                                    })
                                }
                                className={`${ui.select} ${formTouched && !formData.employeeId ? "border-red-500" : ""}`}
                            >
                                <option value="">{t('Select Employee', 'Select Employee')}</option>
                                {employees.map((emp: AnyRow) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.firstNameEn} {emp.lastNameEn}
                                    </option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label={t('Year', 'Year')} required error={formTouched && !formData.year ? msg('VAL_YEAR_REQUIRED', '* Year is required') : undefined}>
                            <input
                                type="number"
                                value={formData.year}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        year: e.target.value,
                                    })
                                }
                                placeholder={t('Enter Year', 'Enter Year')}
                                className={`${ui.input} ${formTouched && !formData.year ? "border-red-500" : ""}`}
                            />
                        </FormField>
                    </div>

                    {/* Leave Quotas (Angular: FormArray) */}
                    {formData.leaveQuotas.map((q: AnyRow, i: number) => (
                        <div
                            key={i}
                            className="border border-gray-200 p-4 rounded-lg"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-semibold text-gray-700">
                                    Leave Quota {i + 1}
                                </span>
                                <button
                                    onClick={() => removeQuotaRow(i)}
                                    className="text-red-500 text-sm hover:underline"
                                >
                                    Remove
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <FormField label={t('Leave Type', 'Leave Type')} required>
                                    <select
                                        value={q.leaveTypeId}
                                        onChange={(e) => {
                                            const updated = [
                                                ...formData.leaveQuotas,
                                            ];
                                            updated[i] = {
                                                ...updated[i],
                                                leaveTypeId: Number(
                                                    e.target.value
                                                ),
                                            };
                                            setFormData({
                                                ...formData,
                                                leaveQuotas: updated,
                                            });
                                        }}
                                        className={ui.select}
                                    >
                                        <option value={0}>Select</option>
                                        {leaveTypes.map((lt: AnyRow) => (
                                            <option
                                                key={lt.leaveTypeId}
                                                value={lt.leaveTypeId}
                                            >
                                                {lt.leaveTypeCode}:{" "}
                                                {lt.leaveTypeNameEn}
                                            </option>
                                        ))}
                                    </select>
                                </FormField>
                                <FormField label={t('Quota Days', 'Quota Days')} required>
                                    <input
                                        type="number"
                                        value={q.quotaDays}
                                        onChange={(e) => {
                                            const updated = [
                                                ...formData.leaveQuotas,
                                            ];
                                            updated[i] = {
                                                ...updated[i],
                                                quotaDays: e.target.value,
                                            };
                                            setFormData({
                                                ...formData,
                                                leaveQuotas: updated,
                                            });
                                        }}
                                        placeholder={t('Enter Quota Days', 'Enter Quota Days')}
                                        className={ui.input}
                                    />
                                </FormField>
                                <FormField label={t('Extra Day', 'Extra Day')}>
                                    <input
                                        type="number"
                                        value={q.extraDay || ""}
                                        onChange={(e) => {
                                            const updated = [
                                                ...formData.leaveQuotas,
                                            ];
                                            updated[i] = {
                                                ...updated[i],
                                                extraDay: e.target.value || null,
                                            };
                                            setFormData({
                                                ...formData,
                                                leaveQuotas: updated,
                                            });
                                        }}
                                        placeholder={t('Enter Extra Days', 'Enter Extra Days')}
                                        className={ui.input}
                                    />
                                </FormField>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addQuotaRow}
                        className="text-nv-violet text-sm hover:underline font-medium"
                    >
                        + Add More
                    </button>
                </div>
            </ModalWrapper>

            {/* ──────── Delete Modal ──────── */}
            <ModalWrapper
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title={t('Delete Data', 'Delete Data')}
                maxWidth="max-w-sm"
                footer={
                    <>
                        <button
                            onClick={() =>
                                deleteId && deleteMutation.mutate(deleteId)
                            }
                            disabled={deleteMutation.isPending}
                            className={`flex-1 ${ui.btnDanger}`}
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </button>
                        <button
                            onClick={() => setDeleteModalOpen(false)}
                            className={`flex-1 ${ui.btnSecondary}`}
                        >
                            Cancel
                        </button>
                    </>
                }
            >
                <p className="text-sm text-gray-500 text-center">
                    Are you sure you want to delete?
                </p>
            </ModalWrapper>
        </div>
    );
}
