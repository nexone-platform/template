"use client";

import { useState, useEffect, useCallback } from "react";
import { useRoles, usePermissions, useUpdateRolePermissions, useUpdateRole, useDeleteRole } from "@/hooks/use-role";
import { useDepartments } from "@/hooks/use-organization";
import { getUserProfile } from "@/lib/auth";
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, Minus, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { ROUTES } from "@/lib/routes";
import { useMessages } from "@/hooks/use-messages";
import {
    PageHeader, ModalWrapper, FormField, EmptyState, LoadingSpinner, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

// ---- types ----
interface PermItem {
    permissionsId: number | null;
    menusId: number;
    title: string;
    parentId: number | null;
    isActive: boolean;
    canView: boolean;
    canEdit: boolean;
    canAdd: boolean;
    canDelete: boolean;
    canImport: boolean;
    canExport: boolean;
    subMenus?: PermItem[];
    subSubMenus?: PermItem[];
}

const PERM_KEYS = ["canView", "canEdit", "canAdd", "canDelete", "canImport", "canExport"] as const;
type PermKey = typeof PERM_KEYS[number];

// Deep-clone helper that initialises permission state from API data
// The API may return nested `subMenus` at all levels (Angular then renames L3 to `subSubMenus`)
// OR the API may already return `subSubMenus` directly — handle both.
function buildPermState(items: any[], depth: number = 0): PermItem[] {
    return (items || []).map((m: any) => {
        const base = {
            permissionsId: m.permissionsId ?? null,
            menusId: m.menusId ?? 0,
            title: m.title ?? m.menuTitle ?? "",
            parentId: m.parentId ?? null,
            isActive: m.isActive ?? false,
            canView: m.canView ?? false,
            canEdit: m.canEdit ?? false,
            canAdd: m.canAdd ?? false,
            canDelete: m.canDelete ?? false,
            canImport: m.canImport ?? false,
            canExport: m.canExport ?? false,
            subMenus: [] as PermItem[],
            subSubMenus: [] as PermItem[],
        };
        if (depth === 0) {
            // Parent level → children go into subMenus
            base.subMenus = buildPermState(m.subMenus || [], 1);
        } else if (depth === 1) {
            // SubMenu level → children go into subSubMenus
            // Check both possible sources: m.subMenus (recursive) or m.subSubMenus (pre-named)
            const level3Items = m.subSubMenus?.length ? m.subSubMenus : (m.subMenus || []);
            base.subSubMenus = buildPermState(level3Items, 2);
        }
        // depth 2 = leaf — no children
        return base;
    });
}

// Flatten 3-level tree → flat array for API submission (same as Angular flattenPermissions)
function flattenPermissions(data: PermItem[]): any[] {
    return data.flatMap((item) => {
        const current = {
            permissionsId: item.permissionsId ?? null,
            menusId: item.menusId ?? 0,
            canView: item.canView,
            canEdit: item.canEdit,
            canAdd: item.canAdd,
            canDelete: item.canDelete,
            canImport: item.canImport,
            canExport: item.canExport,
            isActive: item.isActive,
        };
        return [current, ...flattenPermissions(item.subMenus || []), ...flattenPermissions(item.subSubMenus || [])];
    });
}

// ---- Toggle helpers (replicate Angular onParentToggle / onSubMenuToggle / onSubSubMenuToggle) ----

function setAllPerms(item: PermItem, value: boolean) {
    item.canView = value;
    item.canEdit = value;
    item.canAdd = value;
    item.canDelete = value;
    item.canImport = value;
    item.canExport = value;
}

function toggleParent(items: PermItem[], parentIdx: number): PermItem[] {
    const next = [...items];
    const p = { ...next[parentIdx] };
    const active = p.isActive;
    if (!active) {
        // turn off parent + all children
        setAllPerms(p, false);
        p.subMenus = (p.subMenus || []).map((sm) => {
            const ns = { ...sm, isActive: false };
            setAllPerms(ns, false);
            ns.subSubMenus = (ns.subSubMenus || []).map((ssm) => {
                const nss = { ...ssm, isActive: false };
                setAllPerms(nss, false);
                return nss;
            });
            return ns;
        });
    } else {
        // turn on parent only
        setAllPerms(p, true);
    }
    next[parentIdx] = p;
    return next;
}

function toggleSubMenu(items: PermItem[], parentIdx: number, subIdx: number): PermItem[] {
    const next = [...items];
    const p = { ...next[parentIdx], subMenus: [...(next[parentIdx].subMenus || [])] };
    const sm = { ...p.subMenus[subIdx] };
    if (!sm.isActive) {
        setAllPerms(sm, false);
        sm.subSubMenus = (sm.subSubMenus || []).map((ssm) => {
            const nss = { ...ssm, isActive: false };
            setAllPerms(nss, false);
            return nss;
        });
    } else {
        setAllPerms(sm, true);
    }
    p.subMenus[subIdx] = sm;
    next[parentIdx] = p;
    return next;
}

function toggleSubSubMenu(items: PermItem[], parentIdx: number, subIdx: number, subSubIdx: number): PermItem[] {
    const next = [...items];
    const p = { ...next[parentIdx], subMenus: [...(next[parentIdx].subMenus || [])] };
    const sm = { ...p.subMenus[subIdx], subSubMenus: [...(p.subMenus[subIdx].subSubMenus || [])] };
    const ssm = { ...sm.subSubMenus[subSubIdx] };
    if (!ssm.isActive) {
        setAllPerms(ssm, false);
    } else {
        setAllPerms(ssm, true);
    }
    sm.subSubMenus[subSubIdx] = ssm;
    p.subMenus[subIdx] = sm;
    next[parentIdx] = p;
    return next;
}

// When a permission checkbox changes, auto-set isActive = true if any permission is true
function autoActivate(item: PermItem): PermItem {
    const hasAny = PERM_KEYS.some((k) => item[k]);
    return { ...item, isActive: hasAny };
}

// ---- Component ----

export default function RolesPermissionsPage() {
    const { t } = usePageTranslation();
    const { msg, showSuccess, showError, showConfirm } = useMessages();
    const { data: roles, isLoading: rolesLoading } = useRoles();
    const { data: departments } = useDepartments();
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [selectRoleName, setSelectRoleName] = useState("");

    // Auto-select first role on load (matches Angular ngOnInit logic)
    useEffect(() => {
        if (roles?.length > 0 && selectedRoleId === null) {
            setSelectedRoleId(roles[0].roleId);
            setSelectRoleName(roles[0].roleName ?? "");
            setActiveIndex(0);
        }
    }, [roles, selectedRoleId]);

    const { data: permissionsRaw, isLoading: permissionsLoading } = usePermissions(selectedRoleId!);
    const updatePermissionsMutation = useUpdateRolePermissions();
    const updateRoleMutation = useUpdateRole();
    const deleteRoleMutation = useDeleteRole();

    // ---- Managed permissions state (replaces Angular FormArray) ----
    const [permState, setPermState] = useState<PermItem[]>([]);

    useEffect(() => {
        if (permissionsRaw) {
            setPermState(buildPermState(permissionsRaw));
        }
    }, [permissionsRaw]);

    // ---- Role selection (Angular setActive) ----
    const handleSelectRole = useCallback((index: number) => {
        if (!roles || roles.length === 0) return;
        setActiveIndex(index);
        setSelectedRoleId(roles[index].roleId);
        setSelectRoleName(roles[index].roleName ?? "");
    }, [roles]);

    // ---- Role Modal ----
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<any>();

    const openRoleModal = (role?: any) => {
        if (role) {
            reset({ roleId: role.roleId, roleName: role.roleName, departmentId: role.departmentId || "" });
        } else {
            reset({ roleId: 0, roleName: "", departmentId: "" });
        }
        setRoleModalOpen(true);
    };

    // Angular: onSubmit()
    const onSubmitRole = (data: any) => {
        if (!data.roleId) data.roleId = 0;
        updateRoleMutation.mutate({ ...data, username: getUserProfile() || "System" }, {
            onSuccess: () => {
                showSuccess('ROLE_SAVE_SUCCESS', 'Success!', 'Role saved successfully.');
                setRoleModalOpen(false);
            },
            onError: () => showError('SAVE_ERROR', 'Error!', 'Error saving Role.'),
        });
    };

    // Angular: deleteData()
    const handleDeleteRole = (roleId: number) => {
        showConfirm('ROLE_DELETE_CONFIRM', () => {
            deleteRoleMutation.mutate(roleId, {
                onSuccess: (res: any) => showSuccess('DELETE_SUCCESS', 'Success!', res?.message || 'Role deleted.'),
                onError: () => showError('DELETE_ERROR', 'Error!', 'Error deleting role.'),
            });
        }, { fallbackTitle: 'Delete Role', fallbackMsg: 'Are you sure you want to delete this role?' });
    };

    // ---- Permission toggles ----
    const handleParentToggle = (idx: number) => {
        setPermState((prev) => toggleParent(prev, idx));
    };
    const handleSubMenuToggle = (pIdx: number, sIdx: number) => {
        setPermState((prev) => toggleSubMenu(prev, pIdx, sIdx));
    };
    const handleSubSubMenuToggle = (pIdx: number, sIdx: number, ssIdx: number) => {
        setPermState((prev) => toggleSubSubMenu(prev, pIdx, sIdx, ssIdx));
    };

    // ---- Individual permission change (auto-activate) ----
    const handlePermChange = (path: { pIdx: number; sIdx?: number; ssIdx?: number }, key: PermKey, checked: boolean) => {
        setPermState((prev) => {
            const next = [...prev];
            if (path.sIdx === undefined) {
                // parent level
                const p = { ...next[path.pIdx], [key]: checked };
                next[path.pIdx] = autoActivate(p);
            } else if (path.ssIdx === undefined) {
                // submenu level
                const p = { ...next[path.pIdx], subMenus: [...(next[path.pIdx].subMenus || [])] };
                const sm = { ...p.subMenus[path.sIdx], [key]: checked };
                p.subMenus[path.sIdx] = autoActivate(sm);
                next[path.pIdx] = p;
            } else {
                // sub-submenu level
                const p = { ...next[path.pIdx], subMenus: [...(next[path.pIdx].subMenus || [])] };
                const sm = { ...p.subMenus[path.sIdx!], subSubMenus: [...(p.subMenus[path.sIdx!].subSubMenus || [])] };
                const ssm = { ...sm.subSubMenus[path.ssIdx], [key]: checked };
                sm.subSubMenus[path.ssIdx] = autoActivate(ssm);
                p.subMenus[path.sIdx!] = sm;
                next[path.pIdx] = p;
            }
            return next;
        });
    };

    // Angular: onSubmitPermission()
    const savePermissions = () => {
        if (!selectedRoleId) return;
        const flattened = flattenPermissions(permState);
        updatePermissionsMutation.mutate({
            roleId: selectedRoleId,
            permissions: flattened,
            username: getUserProfile() || "System",
        }, {
            onSuccess: () => showSuccess('ROLE_SAVE_SUCCESS', 'Success!', 'Role saved successfully.'),
            onError: () => showError('SAVE_ERROR', 'Error!', 'Error saving Role.'),
        });
    };

    // ---- Toggle Switch Component ----
    const ToggleSwitch = ({ checked, onChange, id }: { checked: boolean; onChange: () => void; id: string }) => (
        <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id={id} className="sr-only peer" checked={checked} onChange={onChange} />
            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-nv-violet peer-focus:ring-2 peer-focus:ring-blue-300 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
        </label>
    );

    // ---- Permission Checkbox ----
    const PermCheck = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded text-nv-violet w-4 h-4 cursor-pointer border-gray-300 focus:ring-blue-500"
        />
    );

    // ---- Permission Row (reusable for all 3 levels) ----
    const thStyle = "px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider";
    const tdCenter = "px-4 py-3 text-center";

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Roles & Permissions', 'Roles & Permissions')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard }, { label: t('Roles & Permissions', 'Roles & Permissions') }]}
            />

            <div className="flex flex-1 gap-6 overflow-hidden" style={{ minHeight: "calc(100vh - 220px)" }}>
                {/* Left: Role List */}
                <div className="w-80 flex flex-col bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden shrink-0">
                    <div className="p-3">
                        <button
                            onClick={() => openRoleModal()}
                            className="w-full py-2.5 bg-nv-violet text-white rounded-lg hover:bg-nv-violet-dark transition-colors font-medium text-sm flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Add Role
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
                        {rolesLoading ? (
                            <LoadingSpinner />
                        ) : !roles || roles.length === 0 ? (
                            <EmptyState message={t('No roles found', 'No roles found')} />
                        ) : (
                            roles.map((role: any, index: number) => (
                                <div
                                    key={role.roleId}
                                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${index === activeIndex ? "bg-nv-violet-light text-nv-violet-dark border border-nv-violet/20" : "hover:bg-gray-50 text-gray-700 border border-transparent"}`}
                                    onClick={() => handleSelectRole(index)}
                                >
                                    <span className="font-medium text-sm truncate">{role.roleName}</span>
                                    <div className="flex items-center gap-0.5 shrink-0">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openRoleModal(role); }}
                                            className="p-1.5 text-gray-400 hover:text-nv-violet rounded-lg hover:bg-nv-violet-light transition-colors"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteRole(role.roleId); }}
                                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Permissions Grid */}
                <div className="flex-1 flex flex-col bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-700">
                            <strong>{selectRoleName || "—"}</strong> <span className="font-normal text-gray-500 ml-1">Module Access</span>
                        </h2>
                        <button
                            onClick={savePermissions}
                            disabled={updatePermissionsMutation.isPending || !selectedRoleId}
                            className={ui.btnPrimary}
                        >
                            <Save className="w-4 h-4 inline mr-1.5" />
                            {updatePermissionsMutation.isPending ? "Saving..." : "Save"}
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto p-0">
                        {!selectedRoleId ? (
                            <div className="flex items-center justify-center h-full text-gray-400">Select a role to view permissions</div>
                        ) : permissionsLoading ? (
                            <LoadingSpinner />
                        ) : permState.length === 0 ? (
                            <div className="p-8"><EmptyState message="No permissions available for this role." /></div>
                        ) : (
                            <table className={ui.table}>
                                <thead className={`${ui.thead} sticky top-0 z-10`}>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[250px]">{t('Module Permission', 'Module Permission')}</th>
                                        <th className={thStyle}>{t('Active', 'Active')}</th>
                                        <th className={thStyle}>{t('View', 'View')}</th>
                                        <th className={thStyle}>{t('Add', 'Add')}</th>
                                        <th className={thStyle}>{t('Edit', 'Edit')}</th>
                                        <th className={thStyle}>{t('Delete', 'Delete')}</th>
                                        <th className={thStyle}>{t('Import', 'Import')}</th>
                                        <th className={thStyle}>{t('Export', 'Export')}</th>
                                    </tr>
                                </thead>
                                <tbody className={ui.tbody}>
                                    {permState.map((perm, pIdx) => (
                                        <PermissionBlock
                                            key={perm.menusId || pIdx}
                                            perm={perm}
                                            pIdx={pIdx}
                                            onParentToggle={handleParentToggle}
                                            onSubMenuToggle={handleSubMenuToggle}
                                            onSubSubMenuToggle={handleSubSubMenuToggle}
                                            onPermChange={handlePermChange}
                                            ToggleSwitch={ToggleSwitch}
                                            PermCheck={PermCheck}
                                            tdCenter={tdCenter}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Role Modal */}
            <ModalWrapper
                open={roleModalOpen}
                onClose={() => { setRoleModalOpen(false); reset(); }}
                title={t('Role Details', 'Role Details')}
                maxWidth="max-w-md"
                footer={
                    <>
                        <button onClick={() => { setRoleModalOpen(false); reset(); }} className={ui.btnSecondary}>{t('Cancel', 'Cancel')}</button>
                        <button onClick={handleSubmit(onSubmitRole)} disabled={updateRoleMutation.isPending} className={ui.btnPrimary}>
                            {updateRoleMutation.isPending ? "Saving..." : "Submit"}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <FormField label={t('Role Name', 'Role Name')} required>
                        <input type="text" {...register("roleName", { required: msg('VAL_ROLE_NAME_REQUIRED', 'Role Name is required') })} className={`${ui.input} ${errors.roleName ? "border-red-400" : ""}`} />
                        {errors.roleName && <p className="text-xs text-red-500 mt-1">{errors.roleName.message as string}</p>}
                    </FormField>
                    <FormField label={t('Department', 'Department')} required>
                        <select {...register("departmentId", { required: msg('VAL_DEPARTMENT_REQUIRED', 'Department is required') })} className={`${ui.select} ${errors.departmentId ? "border-red-400" : ""}`}>
                            <option value="">{t('Select Department', 'Select Department')}</option>
                            {departments?.map((d: any) => (
                                <option key={d.departmentId} value={d.departmentId}>
                                    {d.departmentCode ? `${d.departmentCode}: ` : ""}{d.departmentNameTh || d.departmentNameEn}
                                </option>
                            ))}
                        </select>
                        {errors.departmentId && <p className="text-xs text-red-500 mt-1">{errors.departmentId.message as string}</p>}
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}

// ---- PermissionBlock: renders parent + subMenus + subSubMenus rows ----

function PermissionBlock({ perm, pIdx, onParentToggle, onSubMenuToggle, onSubSubMenuToggle, onPermChange, ToggleSwitch, PermCheck, tdCenter }: any) {
    const hasParentId = !!perm.parentId; // Angular: *ngIf="permission.value.parentId"
    const hasChildren = (perm.subMenus || []).length > 0;
    const [expanded, setExpanded] = useState(true);

    return (
        <>
            {/* Parent row */}
            <tr className="bg-gray-50/70 border-b border-gray-100">
                <td className="px-6 py-3 font-semibold text-gray-800 text-sm">
                    <div className="flex items-center gap-1.5">
                        {hasChildren && (
                            <button
                                type="button"
                                onClick={() => setExpanded(!expanded)}
                                className="p-0.5 rounded hover:bg-gray-200 transition-colors"
                            >
                                {expanded
                                    ? <ChevronDown className="w-4 h-4 text-gray-500" />
                                    : <ChevronRight className="w-4 h-4 text-gray-500" />
                                }
                            </button>
                        )}
                        <span
                            className={hasChildren ? "cursor-pointer select-none" : ""}
                            onClick={() => hasChildren && setExpanded(!expanded)}
                        >
                            {perm.title}
                        </span>
                    </div>
                </td>
                <td className={tdCenter}>
                    <ToggleSwitch checked={perm.isActive} onChange={() => onParentToggle(pIdx)} id={`isActive-${pIdx}`} />
                </td>
                {/* Angular hides checkboxes for items without parentId */}
                {hasParentId ? (
                    <>
                        <td className={tdCenter}><PermCheck checked={perm.canView} onChange={(v: boolean) => onPermChange({ pIdx }, "canView", v)} /></td>
                        <td className={tdCenter}><PermCheck checked={perm.canAdd} onChange={(v: boolean) => onPermChange({ pIdx }, "canAdd", v)} /></td>
                        <td className={tdCenter}><PermCheck checked={perm.canEdit} onChange={(v: boolean) => onPermChange({ pIdx }, "canEdit", v)} /></td>
                        <td className={tdCenter}><PermCheck checked={perm.canDelete} onChange={(v: boolean) => onPermChange({ pIdx }, "canDelete", v)} /></td>
                        <td className={tdCenter}><PermCheck checked={perm.canImport} onChange={(v: boolean) => onPermChange({ pIdx }, "canImport", v)} /></td>
                        <td className={tdCenter}><PermCheck checked={perm.canExport} onChange={(v: boolean) => onPermChange({ pIdx }, "canExport", v)} /></td>
                    </>
                ) : (
                    <>{Array(6).fill(null).map((_, i) => <td key={i} className={tdCenter}></td>)}</>
                )}
            </tr>

            {/* SubMenus — only render when expanded */}
            {expanded && (perm.subMenus || []).map((sm: PermItem, sIdx: number) => (
                <SubMenuBlock
                    key={sm.menusId || sIdx}
                    sm={sm}
                    pIdx={pIdx}
                    sIdx={sIdx}
                    onSubMenuToggle={onSubMenuToggle}
                    onSubSubMenuToggle={onSubSubMenuToggle}
                    onPermChange={onPermChange}
                    ToggleSwitch={ToggleSwitch}
                    PermCheck={PermCheck}
                    tdCenter={tdCenter}
                />
            ))}
        </>
    );
}

function SubMenuBlock({ sm, pIdx, sIdx, onSubMenuToggle, onSubSubMenuToggle, onPermChange, ToggleSwitch, PermCheck, tdCenter }: any) {
    const hasChildren = (sm.subSubMenus || []).length > 0;
    const [expanded, setExpanded] = useState(true);

    return (
        <>
            <tr className="border-b border-gray-50">
                <td className="py-3 text-sm text-gray-700" style={{ paddingLeft: 40 }}>
                    <div className="flex items-center gap-1">
                        {hasChildren ? (
                            <button
                                type="button"
                                onClick={() => setExpanded(!expanded)}
                                className="p-0.5 rounded hover:bg-gray-200 transition-colors"
                            >
                                {expanded
                                    ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                    : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                                }
                            </button>
                        ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        )}
                        <span
                            className={hasChildren ? "cursor-pointer select-none" : ""}
                            onClick={() => hasChildren && setExpanded(!expanded)}
                        >
                            {sm.title}
                        </span>
                    </div>
                </td>
                <td className={tdCenter}>
                    <ToggleSwitch checked={sm.isActive} onChange={() => onSubMenuToggle(pIdx, sIdx)} id={`isActiveSub-${pIdx}-${sIdx}`} />
                </td>
                <td className={tdCenter}><PermCheck checked={sm.canView} onChange={(v: boolean) => onPermChange({ pIdx, sIdx }, "canView", v)} /></td>
                <td className={tdCenter}><PermCheck checked={sm.canAdd} onChange={(v: boolean) => onPermChange({ pIdx, sIdx }, "canAdd", v)} /></td>
                <td className={tdCenter}><PermCheck checked={sm.canEdit} onChange={(v: boolean) => onPermChange({ pIdx, sIdx }, "canEdit", v)} /></td>
                <td className={tdCenter}><PermCheck checked={sm.canDelete} onChange={(v: boolean) => onPermChange({ pIdx, sIdx }, "canDelete", v)} /></td>
                <td className={tdCenter}><PermCheck checked={sm.canImport} onChange={(v: boolean) => onPermChange({ pIdx, sIdx }, "canImport", v)} /></td>
                <td className={tdCenter}><PermCheck checked={sm.canExport} onChange={(v: boolean) => onPermChange({ pIdx, sIdx }, "canExport", v)} /></td>
            </tr>

            {/* SubSubMenus — only render when expanded */}
            {expanded && (sm.subSubMenus || []).map((ssm: PermItem, ssIdx: number) => (
                <tr key={ssm.menusId || ssIdx} className="border-b border-gray-50">
                    <td className="py-3 text-sm text-gray-600" style={{ paddingLeft: 70 }}>
                        <Minus className="w-3.5 h-3.5 inline mr-1 text-gray-300" />
                        {ssm.title}
                    </td>
                    <td className={tdCenter}>
                        <ToggleSwitch checked={ssm.isActive} onChange={() => onSubSubMenuToggle(pIdx, sIdx, ssIdx)} id={`isActiveSub-${pIdx}-${sIdx}-${ssIdx}`} />
                    </td>
                    <td className={tdCenter}><PermCheck checked={ssm.canView} onChange={(v: boolean) => onPermChange({ pIdx, sIdx, ssIdx }, "canView", v)} /></td>
                    <td className={tdCenter}><PermCheck checked={ssm.canAdd} onChange={(v: boolean) => onPermChange({ pIdx, sIdx, ssIdx }, "canAdd", v)} /></td>
                    <td className={tdCenter}><PermCheck checked={ssm.canEdit} onChange={(v: boolean) => onPermChange({ pIdx, sIdx, ssIdx }, "canEdit", v)} /></td>
                    <td className={tdCenter}><PermCheck checked={ssm.canDelete} onChange={(v: boolean) => onPermChange({ pIdx, sIdx, ssIdx }, "canDelete", v)} /></td>
                    <td className={tdCenter}><PermCheck checked={ssm.canImport} onChange={(v: boolean) => onPermChange({ pIdx, sIdx, ssIdx }, "canImport", v)} /></td>
                    <td className={tdCenter}><PermCheck checked={ssm.canExport} onChange={(v: boolean) => onPermChange({ pIdx, sIdx, ssIdx }, "canExport", v)} /></td>
                </tr>
            ))}
        </>
    );
}
