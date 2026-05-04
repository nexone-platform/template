"use client";

import { useEffect,  useState, useMemo, useCallback } from "react";
import {
    useUsers,
    useDeleteUser,
    useUpdateUser,
    UserDto
} from "@/hooks/use-user";
import { useRoles } from "@/hooks/use-role";
import { useEmployeeSelect } from "@/hooks/use-employee";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { ROUTES } from "@/lib/routes";
import { useMessages } from "@/hooks/use-messages";
import { usePagination } from "@/hooks/use-pagination";
import { useRowSelection } from "@/hooks/use-row-selection";
import ExportButtons from "@/components/ExportButtons";
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
    ui, RowCheckbox,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";
import { useSystemConfig } from '@nexone/ui';

type AnyRow = Record<string, any>;

export default function UsersPage() {
    const { t } = usePageTranslation();
    const { msg, showSuccess, showError, showConfirm } = useMessages();

    const exportColumns: ExportColumn[] = [
        { header: "#", key: "_index" },
        { header: t('Employee', 'Employee'), key: "employeeName" },
        { header: t('Email', 'Email'), key: "email" },
        { header: t('Role', 'Role'), key: "roleName" },
        { header: t('Status', 'Status'), key: "isActive", format: (v: any) => v ? "Active" : "Inactive" },
    ];

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "employeeName", label: t('Employee', 'Employee'), sortable: true },
    { key: "email", label: t('Email', 'Email'), sortable: true },
    { key: "roleName", label: t('Role', 'Role'), sortable: true },
    { key: "isActive", label: t('Status', 'Status') },
    { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ];

    const { data: users, isLoading } = useUsers();
    const { data: roles } = useRoles();
    const { data: employees } = useEmployeeSelect();

    const deleteMutation = useDeleteUser();
    const updateMutation = useUpdateUser();

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

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
    const password = watch("password");

    const list: UserDto[] = useMemo(() => users ?? [], [users]);

    const filtered = useMemo(() => {
        if (!searchText) return list;
        const q = searchText.toLowerCase();
        return list.filter(
            (d: UserDto) =>
                d.employeeName?.toLowerCase().includes(q) ||
                d.email?.toLowerCase().includes(q) ||
                d.roleName?.toLowerCase().includes(q)
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


    // ── Row Selection ──
    const getRowId = useCallback((d: any) => d.userId, []);
    const selection = useRowSelection(paginatedData, getRowId);
    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    const openModal = (user?: UserDto) => {
        if (user) {
            setSelectedUser(user);
            reset({ userId: user.userId, employeeId: user.empId, roleId: user.roleId, isActive: user.isActive, email: user.email });
        } else {
            setSelectedUser(null);
            reset({ userId: 0, employeeId: "", roleId: "", isActive: true, password: "", confirmPassword: "" });
        }
        setModalOpen(true);
    };

    const onSubmit = (data: any) => {
        const payload = { ...data, username: localStorage.getItem("username") };
        updateMutation.mutate(payload, {
            onSuccess: () => { showSuccess('SAVE_SUCCESS', 'Success!', 'User saved.'); setModalOpen(false); },
            onError: () => showError('SAVE_ERROR', 'Error!', 'Failed to save user.'),
        });
    };

    const handleDelete = (id: number) => {
        showConfirm('DELETE_CONFIRM', () => { deleteMutation.mutate(id); }, { fallbackTitle: 'Delete User', fallbackMsg: 'Are you sure?' });
    };

    const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const empId = e.target.value;
        const employee = employees?.find((emp: any) => emp.id === parseInt(empId));
        if (employee) { setValue("email", employee.email); setValue("firstName", employee.firstNameEn); setValue("lastName", employee.lastNameEn); }
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader title={t('Users', 'Users')} breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard }, { label: t('Users', 'Users') }]} actionLabel={t('Add', 'Add')} onAction={() => openModal()} />

            <ExportButtons data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))} columns={exportColumns} filenamePrefix="users" pdfTitle={t('Users', 'Users')} totalCount={sorted.length}
                selectedData={selection.getSelectedRows(sorted)}
                selectedCount={selection.selectedCount}
                onClearSelection={selection.clearSelection}
            />

            <div className={ui.tableWrapper}>
                <TableHeaderBar pageSize={pageSize} onPageSizeChange={(v) => { setPageSize(v); changePgSize(v); }} searchText={searchText} onSearchChange={setSearchText} />

                {isLoading ? <LoadingSpinner /> : (
                    <div className="overflow-x-auto">
                        <table className={ui.table}>
                            <thead className={ui.thead}><tr>{tableColumns.map((col) => (<SortableTh key={col.key} column={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />))}</tr></thead>
                            <tbody className={ui.tbody}>
                                {paginatedData.length > 0 ? paginatedData.map((d: AnyRow, idx: number) => (
                                    <tr key={d.userId} className={selection.isSelected(d.userId) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(d.userId)} onChange={() => selection.toggle(d.userId)} />
                                        <td className={ui.tdIndex}>{(currentPage - 1) * pageSize + idx + 1}</td>
                                        <td className={ui.tdBold}>{d.employeeName}</td>
                                        <td className={ui.td}>{d.email}</td>
                                        <td className={ui.td}><span className="px-2 py-0.5 text-xs font-medium rounded bg-nv-violet-light text-nv-violet border border-purple-100">{d.roleName}</span></td>
                                        <td className={ui.td}><StatusBadge status={d.isActive ? "Active" : "Inactive"} variant={d.isActive ? "success" : "danger"} /></td>
                                        <td className={ui.tdActions}><ActionButtons onEdit={() => openModal(d as UserDto)} onDelete={() => handleDelete(d.userId)} /></td>
                                    </tr>
                                )) : <EmptyState colSpan={7} />}
                            </tbody>
                        </table>
                    </div>
                )}

                <PaginationBar currentPage={currentPage} totalPages={totalPages} totalData={sorted.length} pageSize={pageSize} onGoToPage={goToPage} />
            </div>

            <ModalWrapper open={modalOpen} onClose={() => setModalOpen(false)} title={selectedUser ? t('Edit User', 'Edit User') : t('Add User', 'Add User')} maxWidth="max-w-md"
                footer={<button onClick={handleSubmit(onSubmit)} disabled={updateMutation.isPending} className={ui.btnPrimary}>{updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}{t('Submit', 'Submit')}</button>}>
                <div className="space-y-4">
                    {!selectedUser && (
                        <FormField label={t('Employee', 'Employee')} required>
                            <select {...register("employeeId", { required: msg('VAL_EMPLOYEE_REQUIRED', 'Employee is required') })} onChange={handleEmployeeChange} className={ui.select}>
                                <option value="">{t('Select Employee', 'Select Employee')}</option>
                                {employees?.map((emp: any) => (<option key={emp.employeeId} value={emp.id}>{emp.firstNameEn} {emp.lastNameEn}</option>))}
                            </select>
                            {errors.employeeId && <p className="text-xs text-red-500 mt-1">{errors.employeeId.message as string}</p>}
                        </FormField>
                    )}
                    <FormField label={t('Email', 'Email')}>
                        <input {...register("email")} disabled className={`${ui.input} disabled:opacity-50`} />
                    </FormField>
                    <FormField label={t('Role', 'Role')} required>
                        <select {...register("roleId", { required: msg('VAL_ROLE_REQUIRED', 'Role is required') })} className={ui.select}>
                            <option value="">{t('Select Role', 'Select Role')}</option>
                            {roles?.map((role: any) => (<option key={role.roleId} value={role.roleId}>{role.roleName}</option>))}
                        </select>
                        {errors.roleId && <p className="text-xs text-red-500 mt-1">{errors.roleId.message as string}</p>}
                    </FormField>
                    {!selectedUser && (
                        <>
                            <FormField label={t('Password', 'Password')} required>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} {...register("password", { required: msg('VAL_PASSWORD_REQUIRED', 'Password is required') })} className={ui.input} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message as string}</p>}
                            </FormField>
                            <FormField label={t('Confirm Password', 'Confirm Password')} required>
                                <input type="password" {...register("confirmPassword", { required: msg('VAL_CONFIRM_PASSWORD_REQUIRED', 'Confirm password is required'), validate: (val: string) => val === password || msg('VAL_PASSWORD_NOT_MATCH', 'Passwords do not match') })} className={ui.input} />
                                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message as string}</p>}
                            </FormField>
                        </>
                    )}
                    <FormField label={t('Account Active', 'Account Active')}>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" {...register("isActive")} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nv-violet"></div>
                            <span className="ml-3 text-sm text-gray-600">{watch("isActive") ? t('Active', 'Active') : t('Inactive', 'Inactive')}</span>
                        </label>
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
