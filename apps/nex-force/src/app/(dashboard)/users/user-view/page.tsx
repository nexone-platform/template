"use client";

import { useState, useMemo, useCallback } from "react";
import apiClient from "@/lib/api-client";
import { useRouter } from "next/navigation";
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
import { useMessages } from "@/hooks/use-messages";
import { getApiErrorMessage } from "@/lib/api-error";
import { format } from "date-fns";
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
    ui, SelectAllCheckbox, RowCheckbox,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

/* โ”€โ”€โ”€ Export columns โ€” defined inside component (needs t() from hook) โ”€โ”€โ”€ */

/* โ”€โ”€โ”€ Table columns (matches Angular: Name / Email / CreatedDate / Role / Action) โ”€โ”€โ”€ */


type AnyRow = Record<string, any>;

export default function UsersViewPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showWarning } = useMessages();

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "employeeName", label: t('Name', 'Name'), sortable: true },
    { key: "email", label: t('Email', 'Email'), sortable: true },
    { key: "createDate", label: t('Created Date', 'Created Date'), sortable: true },
    { key: "roleName", label: t('Role', 'Role'), sortable: true },
    { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ];


    const exportColumns: ExportColumn[] = useMemo(() => [
        { header: "#", key: "_index" },
        { header: t('Employee', 'Employee'), key: "employeeName" },
        { header: t('Email', 'Email'), key: "email" },
        { header: t('Created Date', 'Created Date'), key: "createDate", format: (v: any) => v ? new Date(v).toLocaleDateString("en-GB") : "" },
        { header: t('Role', 'Role'), key: "roleName" },
        { header: t('Status', 'Status'), key: "isActive", format: (v: any) => v ? "Active" : "Inactive" },
    ], [t]);
    const router = useRouter();
    const { data: users, isLoading } = useUsers();
    const { data: roles } = useRoles();
    const { data: allEmployees } = useEmployeeSelect();

    const deleteMutation = useDeleteUser();
    const updateMutation = useUpdateUser();

    const [searchText, setSearchText] = useState("");
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [pageSize, setPageSize] = useState(10);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
    const password = watch("password");

    const list: UserDto[] = useMemo(() => users ?? [], [users]);

    /*
     * Angular logic: When ADDING, employee dropdown only shows employees NOT already in the users list.
     * When EDITING (userId > 0), employee dropdown shows ALL employees.
     * Angular compares: user.employeeId === emp.employeeId
     */
    const filteredEmployeesForAdd = useMemo(() => {
        if (!allEmployees) return [];
        if (!list || list.length === 0) return allEmployees;
        return allEmployees.filter(
            (emp: any) => !list.some((user) => String(user.employeeId) === String(emp.employeeId))
        );
    }, [allEmployees, list]);

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


    // โ”€โ”€ Row Selection โ”€โ”€
    const getRowId = useCallback((d: any) => d.userId, []);
    const selection = useRowSelection(paginatedData, getRowId);
    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    /*
     * Angular: edit() patches employeeId, email, roleId, userId, isActive
     * Then finds the employee in allEmployees to fill firstName/lastName
     * Then clears password validators if userId > 0
     */
    const openModal = (user?: UserDto) => {
        setShowPassword(false);
        setShowConfirmPassword(false);
        if (user) {
            setSelectedUser(user);
            const emp = allEmployees?.find((e: any) => e.id === user.empId);
            reset({
                userId: user.userId,
                employeeId: user.empId,
                email: emp?.email ?? user.email,
                roleId: user.roleId,
                isActive: user.isActive,
                firstName: emp?.firstNameEn ?? "",
                lastName: emp?.lastNameEn ?? "",
                password: "",
                confirmPassword: "",
            });
        } else {
            setSelectedUser(null);
            reset({
                userId: 0,
                employeeId: "",
                email: "",
                roleId: "",
                isActive: true,
                firstName: "",
                lastName: "",
                password: "",
                confirmPassword: "",
            });
        }
        setModalOpen(true);
    };

    /*
     * Angular: empChange() โ€” when employee selection changes, auto-fill email/firstName/lastName
     */
    const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const empId = e.target.value;
        const employee = allEmployees?.find((emp: any) => emp.id === parseInt(empId));
        if (employee) {
            setValue("email", employee.email);
            setValue("firstName", employee.firstNameEn);
            setValue("lastName", employee.lastNameEn);
        }
    };

    /*
     * Angular: onSubmit() โ€” gets raw value (includes disabled fields), adds username
     * If userId > 0 (edit), password fields are optional
     */
    const onSubmit = (data: any) => {
        const isEdit = !!selectedUser;

        // Validation: for new user, password is required
        if (!isEdit && (!data.password || !data.confirmPassword)) {
            showError('SAVE_ERROR', 'Error!', 'Password and Confirm Password are required.');
            return;
        }
        if (!isEdit && data.password !== data.confirmPassword) {
            showError('SAVE_ERROR', 'Error!', 'Passwords do not match.');
            return;
        }

        const payload: any = {
            userId: data.userId || 0,
            employeeId: data.employeeId,
            email: data.email,
            roleId: data.roleId,
            isActive: data.isActive,
            firstName: data.firstName,
            lastName: data.lastName,
            username: localStorage.getItem("username"),
        };

        // Only include password for new users (Angular clears validators for edit)
        if (!isEdit) {
            payload.password = data.password;
            payload.confirmPassword = data.confirmPassword;
        }

        updateMutation.mutate(payload, {
            onSuccess: () => {
                showSuccess('SAVE_SUCCESS', 'Success!', 'User has been saved successfully.');
                setModalOpen(false);
                closeModal();
            },
            onError: (error) => {
                showError('SAVE_ERROR', 'Error!', getApiErrorMessage(error, "Failed to save user."));
            },
        });
    };

    const closeModal = () => {
        setSelectedUser(null);
        setShowPassword(false);
        setShowConfirmPassword(false);
        reset({
            userId: 0,
            employeeId: "",
            email: "",
            roleId: "",
            isActive: true,
            firstName: "",
            lastName: "",
            password: "",
            confirmPassword: "",
        });
    };

    const handleDelete = (id: number) => {
        showWarning('REQUIRED_FIELDS', 'Delete User', 'Are you sure you want to delete?').then((r) => {
            if (r.isConfirmed) deleteMutation.mutate(id);
        });
    };

    /* Angular: navigateProfile(empId) */
    const navigateProfile = (empId: number) => {
        router.push(ROUTES.employeeProfile(empId));
    };

    /* Format date */
    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return "-";
        try { return format(new Date(dateStr), "dd/MM/yyyy"); }
        catch { return dateStr; }
    };

    /* Employee dropdown: for add โ’ filtered (exclude existing), for edit โ’ allEmployees */
    const employeeDropdownList = selectedUser ? allEmployees : filteredEmployeesForAdd;

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Users', 'Users')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard }, { label: t('Users', 'Users') }]}
                actionLabel={t('Add', 'Add')}
                onAction={() => openModal()}
            />

            <div className="flex flex-wrap items-center gap-3">
                <ExportButtons
                    data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))}
                    columns={exportColumns}
                    filenamePrefix="users"
                    pdfTitle={t('Users', 'Users')}
                    totalCount={sorted.length}
                    selectedData={selection.getSelectedRows(sorted)}
                    selectedCount={selection.selectedCount}
                    onClearSelection={selection.clearSelection}
                />
                <ImportExcelButton
                    columns={[
                        { header: "Employee ID", key: "employeeId", required: true },
                        { header: "Email", key: "email", required: true },
                        { header: "Role ID", key: "roleId", required: true },
                        { header: "Password", key: "password", required: true },
                    
                        { header: "Employee", key: "employeeName" },
                        { header: "Created Date", key: "createDate" },
                        { header: "Role", key: "roleName" },
                        { header: "Status", key: "isActive" },]}
                    filenamePrefix="users"
                    onImport={async (rows) => {
                        let success = 0, failed = 0;
                        const username = localStorage.getItem("username");
                        for (const row of rows) {
                            try {
                                await apiClient.post("user/update", {
                                    userId: 0,
                                    employeeId: row.employeeId ?? "",
                                    email: row.email ?? "",
                                    roleId: Number(row.roleId) || 0,
                                    password: row.password ?? "",
                                    confirmPassword: row.password ?? "",
                                    isActive: true,
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

                {isLoading ? <LoadingSpinner /> : (
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
                                {paginatedData.length > 0 ? paginatedData.map((d: AnyRow, idx: number) => (
                                    <tr key={d.userId} className={selection.isSelected(d.userId) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(d.userId)} onChange={() => selection.toggle(d.userId)} />
                                        <td className={ui.tdIndex}>{(currentPage - 1) * pageSize + idx + 1}</td>
                                        <td className={ui.tdBold}>
                                            <div className="flex items-center gap-2.5">
                                                {d.imgPath && d.imgPath.startsWith("http") ? (
                                                    <img
                                                        src={d.imgPath}
                                                        alt=""
                                                        className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0"
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nv-violet-light to-nv-violet-light flex items-center justify-center text-nv-violet font-bold text-xs border border-gray-200 flex-shrink-0">
                                                        {d.employeeName?.charAt(0)?.toUpperCase() || "?"}
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => navigateProfile(d.empId)}
                                                    className="text-nv-violet hover:text-nv-violet-dark hover:underline font-medium text-left"
                                                >
                                                    {d.employeeName}
                                                </button>
                                            </div>
                                        </td>
                                        <td className={ui.td}>{d.email}</td>
                                        <td className={ui.td}>{formatDate(d.createDate)}</td>
                                        <td className={ui.td}>
                                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-nv-violet-light text-nv-violet border border-purple-100">
                                                {d.roleName}
                                            </span>
                                        </td>
                                        <td className={ui.tdActions}>
                                            <ActionButtons
                                                onEdit={() => openModal(d as UserDto)}
                                                onDelete={() => handleDelete(d.userId)}
                                            />
                                        </td>
                                    </tr>
                                )) : <EmptyState colSpan={7} />}
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

            {/* Add / Edit User Modal */}
            <ModalWrapper
                open={modalOpen}
                onClose={() => { setModalOpen(false); closeModal(); }}
                title={selectedUser ? "Edit User" : "Add User"}
                maxWidth="max-w-lg"
                footer={
                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={updateMutation.isPending}
                        className={ui.btnPrimary}
                    >
                        {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
                        Submit
                    </button>
                }
            >
                <div className="space-y-4">
                    {/* Employee ID โ€” Angular: always shown, uses allEmployees for edit, filtered for add */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Employee', 'Employee')} required>
                            <select
                                {...register("employeeId", { required: "Employee is required" })}
                                onChange={(e) => {
                                    register("employeeId").onChange(e);
                                    handleEmployeeChange(e);
                                }}
                                className={ui.select}
                            >
                                <option value="">{t('Select Employee', 'Select Employee')}</option>
                                {employeeDropdownList?.map((emp: any) => (
                                    <option key={emp.employeeId || emp.id} value={emp.id}>
                                        {emp.employeeId} : {emp.firstNameEn} {emp.lastNameEn}
                                    </option>
                                ))}
                            </select>
                            {errors.employeeId && <p className="text-xs text-red-500 mt-1">{errors.employeeId.message as string}</p>}
                        </FormField>

                        {/* Email โ€” Angular: disabled (auto-filled from employee) */}
                        <FormField label={t('Email', 'Email')}>
                            <input {...register("email")} disabled className={ui.inputDisabled} />
                        </FormField>
                    </div>

                    {/* FirstName / LastName โ€” Angular: disabled, auto-filled */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('First Name', 'First Name')}>
                            <input {...register("firstName")} disabled className={ui.inputDisabled} />
                        </FormField>
                        <FormField label={t('Last Name', 'Last Name')}>
                            <input {...register("lastName")} disabled className={ui.inputDisabled} />
                        </FormField>
                    </div>

                    {/* Password / Confirm Password โ€” Angular: shown for add & edit, but validators cleared for edit */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Password', 'Password')} required={!selectedUser}>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register("password", selectedUser ? {} : { required: "Password is required" })}
                                    className={ui.input}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message as string}</p>}
                        </FormField>

                        <FormField label={t('Confirm Password', 'Confirm Password')} required={!selectedUser}>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    {...register("confirmPassword", {
                                        ...(selectedUser ? {} : { required: "Confirm password is required" }),
                                        validate: (val: string) => {
                                            if (!selectedUser && !val) return "Confirm password is required";
                                            if (val && val !== password) return "Passwords do not match";
                                            return true;
                                        },
                                    })}
                                    className={ui.input}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message as string}</p>}
                        </FormField>
                    </div>

                    {/* Role โ€” Angular: always shown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Role', 'Role')} required>
                            <select {...register("roleId", { required: "Role is required" })} className={ui.select}>
                                <option value="">{t('Select Role', 'Select Role')}</option>
                                {roles?.map((role: any) => (
                                    <option key={role.roleId} value={role.roleId}>
                                        {role.roleName}
                                    </option>
                                ))}
                            </select>
                            {errors.roleId && <p className="text-xs text-red-500 mt-1">{errors.roleId.message as string}</p>}
                        </FormField>

                        {/* Active โ€” Angular: toggle checkbox */}
                        <FormField label={t('Active', 'Active')}>
                            <label className="relative inline-flex items-center cursor-pointer mt-2">
                                <input type="checkbox" {...register("isActive")} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nv-violet"></div>
                                <span className="ml-3 text-sm text-gray-600">{watch("isActive") ? "Active" : "Inactive"}</span>
                            </label>
                        </FormField>
                    </div>
                </div>
            </ModalWrapper>
        </div>
    );
}
