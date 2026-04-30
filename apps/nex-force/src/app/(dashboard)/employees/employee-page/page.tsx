"use client";

import { useDeleteEmployee } from "@/features/employees/hooks/use-employees";
import { usePagination } from "@/hooks/use-pagination";
import { useState, useMemo, useCallback } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMessages } from "@/hooks/use-messages";
import { ROUTES } from "@/lib/routes";
import { useRowSelection } from "@/hooks/use-row-selection";
import ExportButtons from "@/components/ExportButtons";
import ImportExcelButton from "@/components/ImportExcelButton";
import type { ExportColumn } from "@/lib/table-export";
import apiClient from "@/lib/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeService } from "@/services/employee.service";
import {
    PageHeader, TableHeaderBar, EmptyState, TableSkeleton, PaginationBar, ui, SelectAllCheckbox, RowCheckbox,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

// ── Angular: designationService.getAllDesignation() ──
function useDesignations() {
    return useQuery({
        queryKey: ["designations"],
        queryFn: async () => {
            try {
                const { data } = await apiClient.get<any>("designations/getAllDesignation");
                const result = data?.data || data;
                return Array.isArray(result) ? result : [];
            } catch {
                return [];
            }
        },
    });
}

export default function EmployeePage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showConfirm } = useMessages();
    const queryClient = useQueryClient();

    const exportColumns: ExportColumn[] = [
        { header: t('ชื่อ-นามสกุล', 'ชื่อ-นามสกุล'), key: "fullName", format: (_v: any, row: any) => `${row.firstNameEn || ""} ${row.lastNameEn || ""}`.trim() },
        { header: t('รหัสพนักงาน', 'รหัสพนักงาน'), key: "employeeCode" },
        { header: t('อีเมล', 'อีเมล'), key: "email" },
        { header: t('แผนก', 'แผนก'), key: "department" },
        { header: t('ตำแหน่ง', 'ตำแหน่ง'), key: "designation" },
    ];

    // ── Data Fetching (Angular: loadEmployees) ──
    const { data, isLoading } = useQuery({
        queryKey: ["employees-list"],
        queryFn: () => employeeService.getAll(),
    });
    const deleteMutation = useDeleteEmployee();
    const allEmployees = useMemo(() => {
        const raw = (data as any)?.data ?? data;
        return Array.isArray(raw) ? raw : [];
    }, [data]);

    // ── Designations for search form (Angular: getDesignationList) ──
    const { data: designations } = useDesignations();

    // ── Search Form State (Angular: searchForm with EmployeeID, EmployeeName, DesignationId) ──
    const [searchEmpId, setSearchEmpId] = useState("");
    const [searchName, setSearchName] = useState("");
    const [searchDesigId, setSearchDesigId] = useState("");
    const [isSearchActive, setIsSearchActive] = useState(false);

    // ── Server-side Search (Angular: onSearch → employeeService.search) ──
    const searchMutation = useMutation({
        mutationFn: async (criteria: { EmployeeID?: string; EmployeeName?: string; DesignationId?: number | null }) => {
            return employeeService.search(criteria as any);
        },
        onSuccess: (result) => {
            queryClient.setQueryData(["employees-list"], result);
            setIsSearchActive(true);
        },
    });

    const handleSearch = () => {
        const criteria: any = {};
        if (searchEmpId) criteria.EmployeeID = searchEmpId;
        if (searchName) criteria.EmployeeName = searchName;
        if (searchDesigId) criteria.DesignationId = Number(searchDesigId);
        searchMutation.mutate(criteria);
    };

    // ── Clear (Angular: clear → searchForm.reset + onSearch) ──
    const handleClear = () => {
        setSearchEmpId("");
        setSearchName("");
        setSearchDesigId("");
        setIsSearchActive(false);
        queryClient.invalidateQueries({ queryKey: ["employees-list"] });
    };

    // ── Quick Filter in Table (Angular: searchData via MatTableDataSource.filter) ──
    const [quickSearch, setQuickSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);

    const filtered = useMemo(() => {
        if (!quickSearch) return allEmployees;
        const q = quickSearch.toLowerCase();
        return allEmployees.filter((e: any) => {
            const name = `${e.firstNameEn || ''} ${e.lastNameEn || ''}`.toLowerCase();
            const empId = (e.employeeId || '').toLowerCase();
            const email = (e.email || '').toLowerCase();
            const dept = (e.department || '').toLowerCase();
            const desig = (e.designation || '').toLowerCase();
            return name.includes(q) || empId.includes(q) || email.includes(q) || dept.includes(q) || desig.includes(q);
        });
    }, [allEmployees, quickSearch]);

    const { paginatedData, currentPage, totalPages, goToPage, changePageSize: changePgSize } =
        usePagination(filtered, { pageSize });

    // ── Row Selection ──
    const getRowId = useCallback((e: any) => e.id, []);
    const selection = useRowSelection(paginatedData, getRowId);
    const handleDelete = (id: number) => {
        showConfirm('DELETE_CONFIRM', () => {
            deleteMutation.mutate(id, {
                onSuccess: () => { showSuccess('SAVE_SUCCESS', 'Deleted!', t('Employee deleted successfully.', 'Employee deleted successfully.')); },
                onError: () => { showError('SAVE_ERROR', 'Error!', t('Error deleting employee.', 'Error deleting employee.')); },
            });
        }, { fallbackTitle: 'Delete Employee', fallbackMsg: 'Are you sure you want to delete this employee?' });
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Employees', 'Employees')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard }, { label: t('Employees', 'Employees') }]}
                actions={
                    <Link href={ROUTES.employeeProfile(0)} className={`flex items-center gap-2 ${ui.btnPrimary}`}>
                        {t('Add Employee', 'Add Employee')}
                    </Link>
                }
            />

            <div className="flex flex-wrap items-center gap-3">
                <ExportButtons
                    data={filtered}
                    columns={exportColumns}
                    filenamePrefix="employees"
                    pdfTitle={t('Employee List', 'Employee List')}
                    totalLabel={`${t('Total', 'Total')} ${filtered.length}`}
                />
                <ImportExcelButton
                    columns={[
                        { header: "Employee Code", key: "employeeCode", required: true },
                        { header: "First Name (TH)", key: "firstNameTh" },
                        { header: "Last Name (TH)", key: "lastNameTh" },
                        { header: "First Name (EN)", key: "firstNameEn", required: true },
                        { header: "Last Name (EN)", key: "lastNameEn", required: true },
                        { header: "Email", key: "email", required: true },
                        { header: "Department Code", key: "departmentCode" },
                        { header: "Designation Code", key: "designationCode" },
                        { header: "ชื่อ-นามสกุล", key: "fullName" },
                        { header: "แผนก", key: "department" },
                        { header: "ตำแหน่ง", key: "designation" },
                    ]}
                    filenamePrefix="employees"
                    onImport={async (rows) => {
                        let success = 0, failed = 0;
                        for (const row of rows) {
                            try {
                                const fd = new FormData();
                                fd.append("id", "0");
                                fd.append("employeeCode", row.employeeCode ?? "");
                                fd.append("firstNameTh", row.firstNameTh ?? "");
                                fd.append("lastNameTh", row.lastNameTh ?? "");
                                fd.append("firstNameEn", row.firstNameEn ?? "");
                                fd.append("lastNameEn", row.lastNameEn ?? "");
                                fd.append("email", row.email ?? "");
                                fd.append("departmentCode", row.departmentCode ?? "");
                                fd.append("designationCode", row.designationCode ?? "");
                                await apiClient.post("employees/update", fd, { headers: { "Content-Type": "multipart/form-data" } });
                                success++;
                            } catch { failed++; }
                        }
                        return { success, failed };
                    }}
                />
            </div>

            {/* ── Search Filter (Angular: searchForm) ── */}
            <div className={ui.tableWrapper + " mb-4 !overflow-visible"}>
                <div className="flex flex-wrap gap-4 items-end p-4">
                    <div className="flex-1 min-w-[140px]">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t('Employee ID', 'Employee ID')}</label>
                        <input
                            type="text"
                            className={ui.input}
                            placeholder={t('Employee ID', 'Employee ID')}
                            value={searchEmpId}
                            onChange={(e) => setSearchEmpId(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t('Employee Name', 'Employee Name')}</label>
                        <input
                            type="text"
                            className={ui.input}
                            placeholder={t('Employee Name', 'Employee Name')}
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t('Designation', 'Designation')}</label>
                        <select
                            className={ui.select}
                            value={searchDesigId}
                            onChange={(e) => setSearchDesigId(e.target.value)}
                        >
                            <option value="">{t('Select Designation', 'Select Designation')}</option>
                            {(designations || []).map((d: any) => (
                                <option key={d.designationId} value={d.designationId}>
                                    {d.designationCode}: {d.designationNameEn}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={searchMutation.isPending}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition h-10 font-medium"
                    >
                        {searchMutation.isPending ? t('Searching...', 'Searching...') : t('Search', 'Search')}
                    </button>
                    <button
                        onClick={handleClear}
                        className="px-6 py-2 bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition h-10 font-medium"
                    >
                        {t('Clear', 'Clear')}
                    </button>
                </div>
            </div>

            {/* ── Data Table (Angular: employee-list with MatTableDataSource) ── */}
            <div className={ui.tableWrapper}>
                <TableHeaderBar
                    pageSize={pageSize}
                    onPageSizeChange={(v) => { setPageSize(v); changePgSize(v); }}
                    searchText={quickSearch}
                    onSearchChange={setQuickSearch}
                    searchPlaceholder={t('Search employees...', 'Search employees...')}
                />

                {isLoading ? (
                    <TableSkeleton rows={pageSize > 5 ? 8 : 5} columns={5} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className={ui.table}>
                            <thead className={ui.thead}>
                                <tr>
                                    <SelectAllCheckbox checked={selection.allSelected} indeterminate={selection.indeterminate} onChange={selection.toggleAll} />
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Name', 'Name')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Employee ID', 'Employee ID')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Email', 'Email')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Department', 'Department')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Designation', 'Designation')}</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('Actions', 'Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className={ui.tbody}>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((e: any) => (
                                        <tr key={e.id} className={selection.isSelected(e.id) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(e.id)} onChange={() => selection.toggle(e.id)} />
                                            <td className="px-4 py-3 font-medium text-gray-900">{e.firstNameEn} {e.lastNameEn}</td>
                                            <td className={ui.td}>{e.employeeId}</td>
                                            <td className={ui.td}>{e.email}</td>
                                            <td className={ui.td}>{e.department}</td>
                                            <td className={ui.td}>{e.designation}</td>
                                            <td className={ui.tdActions}>
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={ROUTES.employeeProfile(e.id)} className="p-1.5 text-gray-400 hover:text-nv-violet hover:bg-nv-violet-light rounded-md transition">
                                                        <Pencil className="w-4 h-4" />
                                                    </Link>
                                                    <button onClick={() => handleDelete(e.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <EmptyState colSpan={7} message={t('No employees found', 'No employees found')} />
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <PaginationBar currentPage={currentPage} totalPages={totalPages} totalData={filtered.length} pageSize={pageSize} onGoToPage={goToPage} />
            </div>
        </div>
    );
}
