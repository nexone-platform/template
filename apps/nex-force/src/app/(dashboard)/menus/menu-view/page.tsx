"use client";

import { useState, useMemo, useCallback } from "react";
import apiClient from "@/lib/api-client";
import {
    useMenusList,
    useUpdateMenu,
    useDeleteMenu,
    MenuDto
} from "@/hooks/use-menu-admin";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMessages } from "@/hooks/use-messages";
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
    ui, RowCheckbox,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

type AnyRow = Record<string, any>;

export default function MenuViewPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showWarning } = useMessages();

    const exportColumns: ExportColumn[] = [
        { header: "#", key: "_index" },
        { header: t('Title', 'Title'), key: "title" },
        { header: t('Menu Value', 'Menu Value'), key: "menuValue" },
        { header: t('Route', 'Route'), key: "route" },
        { header: t('Menu Code', 'Menu Code'), key: "menuCode" },
        { header: t('Status', 'Status'), key: "isActive", format: (v: any) => v ? "Active" : "Inactive" },
    ];

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "title", label: t('Title', 'Title'), sortable: true },
    { key: "menuValue", label: t('Menu Value', 'Menu Value'), sortable: true },
    { key: "route", label: t('Route', 'Route'), sortable: true },
    { key: "menuCode", label: t('Code', 'Code'), sortable: true },
    { key: "isActive", label: t('Status', 'Status') },
    { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ];

    const { data: menus, isLoading } = useMenusList();
    const updateMutation = useUpdateMenu();
    const deleteMutation = useDeleteMenu();

    const [searchText, setSearchText] = useState("");
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [pageSize, setPageSize] = useState(10);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<MenuDto | null>(null);

    const { register, handleSubmit, reset } = useForm();

    const list: MenuDto[] = useMemo(() => menus ?? [], [menus]);

    const filtered = useMemo(() => {
        if (!searchText) return list;
        const q = searchText.toLowerCase();
        return list.filter(
            (d: MenuDto) =>
                d.title?.toLowerCase().includes(q) ||
                d.menuValue?.toLowerCase().includes(q) ||
                d.route?.toLowerCase().includes(q)
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
    const getRowId = useCallback((d: any) => d.menusId, []);
    const selection = useRowSelection(paginatedData, getRowId);
    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    const openModal = (menu?: MenuDto) => {
        if (menu) {
            setSelectedMenu(menu);
            reset({ menusId: menu.menusId, title: menu.title, menuValue: menu.menuValue, route: menu.route, icon: menu.icon, menuCode: menu.menuCode, parentId: menu.parentId, isActive: menu.isActive });
        } else {
            setSelectedMenu(null);
            reset({ menusId: 0, title: "", menuValue: "", route: "", icon: "la la-circle", menuCode: "", isActive: true });
        }
        setModalOpen(true);
    };

    const onSubmit = (data: Partial<MenuDto>) => {
        updateMutation.mutate(data as MenuDto, {
            onSuccess: () => { showSuccess('SAVE_SUCCESS', 'Success!', 'Menu saved.'); setModalOpen(false); },
            onError: () => showError('SAVE_ERROR', 'Error!', 'Failed to save menu.'),
        });
    };

    const handleDelete = (id: number) => {
        showWarning('REQUIRED_FIELDS', 'Delete Menu', 'Are you sure?')
            .then((r) => { if (r.isConfirmed) deleteMutation.mutate(id); });
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader title={t('Menus', 'Menus')} breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard }, { label: t('Menus', 'Menus') }]} actionLabel={t('Add', 'Add')} onAction={() => openModal()} />

            <div className="flex flex-wrap items-center gap-3">
                <ExportButtons data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))} columns={exportColumns} filenamePrefix="menus" pdfTitle={t('Menus', 'Menus')} totalCount={sorted.length}
                    selectedData={selection.getSelectedRows(sorted)}
                    selectedCount={selection.selectedCount}
                    onClearSelection={selection.clearSelection}
                />
                <ImportExcelButton
                    columns={[
                        { header: "Title", key: "title", required: true },
                        { header: "Menu Value", key: "menuValue", required: true },
                        { header: "Route", key: "route", required: true },
                        { header: "Menu Code", key: "menuCode", required: true },
                        { header: "Icon", key: "icon" },
                    
                        { header: "Status", key: "isActive" },]}
                    filenamePrefix="menus"
                    onImport={async (rows) => {
                        let success = 0, failed = 0;
                        const username = localStorage.getItem("username");
                        for (const row of rows) {
                            try {
                                await apiClient.post("menu/update", {
                                    menusId: 0,
                                    title: row.title ?? "",
                                    menuValue: row.menuValue ?? "",
                                    route: row.route ?? "",
                                    menuCode: row.menuCode ?? "",
                                    icon: row.icon ?? "la la-circle",
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
                <TableHeaderBar pageSize={pageSize} onPageSizeChange={(v) => { setPageSize(v); changePgSize(v); }} searchText={searchText} onSearchChange={setSearchText} />

                {isLoading ? <LoadingSpinner /> : (
                    <div className="overflow-x-auto">
                        <table className={ui.table}>
                            <thead className={ui.thead}><tr>{tableColumns.map((col) => (<SortableTh key={col.key} column={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />))}</tr></thead>
                            <tbody className={ui.tbody}>
                                {paginatedData.length > 0 ? paginatedData.map((d: AnyRow, idx: number) => (
                                    <tr key={d.menusId} className={selection.isSelected(d.menusId) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(d.menusId)} onChange={() => selection.toggle(d.menusId)} />
                                        <td className={ui.tdIndex}>{(currentPage - 1) * pageSize + idx + 1}</td>
                                        <td className={ui.tdBold}>{d.title}</td>
                                        <td className={ui.td}>{d.menuValue}</td>
                                        <td className={ui.td}><span className="font-mono text-xs text-gray-500">{d.route || "/"}</span></td>
                                        <td className={ui.td}><span className="px-2 py-0.5 text-xs font-medium rounded bg-nv-violet-light text-nv-violet border border-nv-violet/20">{d.menuCode || "-"}</span></td>
                                        <td className={ui.td}><StatusBadge status={d.isActive ? "Active" : "Inactive"} variant={d.isActive ? "success" : "danger"} /></td>
                                        <td className={ui.tdActions}><ActionButtons onEdit={() => openModal(d as MenuDto)} onDelete={() => handleDelete(d.menusId)} /></td>
                                    </tr>
                                )) : <EmptyState colSpan={8} />}
                            </tbody>
                        </table>
                    </div>
                )}

                <PaginationBar currentPage={currentPage} totalPages={totalPages} totalData={sorted.length} pageSize={pageSize} onGoToPage={goToPage} />
            </div>

            <ModalWrapper open={modalOpen} onClose={() => setModalOpen(false)} title={selectedMenu ? t('Edit Menu', 'Edit Menu') : t('Add Menu', 'Add Menu')} maxWidth="max-w-lg"
                footer={<button onClick={handleSubmit(onSubmit)} disabled={updateMutation.isPending} className={ui.btnPrimary}>{updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}{t('Submit', 'Submit')}</button>}>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Title', 'Title')} required><input {...register("title", { required: true })} className={ui.input} placeholder="e.g. Dashboard" /></FormField>
                        <FormField label={t('Menu Value', 'Menu Value')} required><input {...register("menuValue", { required: true })} className={ui.input} placeholder="e.g. dashboard_main" /></FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Route', 'Route')} required><input {...register("route", { required: true })} className={ui.input} placeholder="/dashboard" /></FormField>
                        <FormField label={t('Menu Code', 'Menu Code')} required><input {...register("menuCode", { required: true })} className={ui.input} placeholder="CORE_DASHBOARD" /></FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Icon', 'Icon')}><input {...register("icon")} className={ui.input} placeholder="la la-server" /></FormField>
                        <FormField label={t('Active', 'Active')}>
                            <label className="relative inline-flex items-center cursor-pointer mt-2">
                                <input type="checkbox" {...register("isActive")} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nv-violet"></div>
                                <span className="ml-3 text-sm text-gray-600">{t('Enabled', 'Enabled')}</span>
                            </label>
                        </FormField>
                    </div>
                </div>
            </ModalWrapper>
        </div>
    );
}
