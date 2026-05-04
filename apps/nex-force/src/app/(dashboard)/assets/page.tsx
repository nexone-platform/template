"use client";

import { useEffect,  useState, useMemo, useCallback } from "react";
import apiClient from "@/lib/api-client";
import {
    useAssets,
    useDeleteAsset,
    useUpdateAsset,
    AssetData
} from "@/hooks/use-asset";
import { useEmployeeSelect } from "@/hooks/use-employee";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
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
import { useSystemConfig } from '@nexone/ui';

type AnyRow = Record<string, any>;

const statusVariant = (status?: string) => {
    if (status === "Available") return "success";
    if (status === "Assigned") return "info";
    return "danger";
};

export default function AssetsPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showWarning } = useMessages();

    const exportColumns: ExportColumn[] = [
        { header: "#", key: "_index" },
        { header: t('Asset Name', 'Asset Name'), key: "assetName" },
        { header: t('Asset Code', 'Asset Code'), key: "assetCode" },
        { header: t('Category', 'Category'), key: "category" },
        { header: t('Serial Number', 'Serial Number'), key: "serialNumber" },
        { header: t('Assigned To', 'Assigned To'), key: "assetUser" },
        { header: t('Cost', 'Cost'), key: "cost" },
        { header: t('Status', 'Status'), key: "status" },
    ];

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "assetName", label: t('Asset Name', 'Asset Name'), sortable: true },
    { key: "assetCode", label: t('Code', 'Code'), sortable: true },
    { key: "category", label: t('Category', 'Category'), sortable: true },
    { key: "serialNumber", label: t('Serial No.', 'Serial No.'), sortable: true },
    { key: "assetUser", label: t('Assigned To', 'Assigned To'), sortable: true },
    { key: "cost", label: t('Cost', 'Cost'), sortable: true },
    { key: "status", label: t('Status', 'Status') },
    { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ];

    const { data: assets, isLoading } = useAssets();
    useEmployeeSelect();

    const deleteMutation = useDeleteAsset();
    const updateMutation = useUpdateAsset();

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
    const [selectedAsset, setSelectedAsset] = useState<AssetData | null>(null);

    const { register, handleSubmit, reset } = useForm();

    const list: AssetData[] = useMemo(() => assets ?? [], [assets]);

    const filtered = useMemo(() => {
        if (!searchText) return list;
        const q = searchText.toLowerCase();
        return list.filter(
            (d: AssetData) =>
                d.assetName?.toLowerCase().includes(q) ||
                d.assetCode?.toLowerCase().includes(q) ||
                d.serialNumber?.toLowerCase().includes(q) ||
                d.assetUser?.toLowerCase().includes(q)
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
    const getRowId = useCallback((d: any) => d.assetId, []);
    const selection = useRowSelection(paginatedData, getRowId);
    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    const openModal = (asset?: AssetData) => {
        if (asset) {
            setSelectedAsset(asset);
            reset({
                assetId: asset.assetId, assetName: asset.assetName,
                assignedDate: asset.assignedDate ? format(new Date(asset.assignedDate), "yyyy-MM-dd") : "",
                assetCode: asset.assetCode, category: asset.category, type: asset.type,
                serialNumber: asset.serialNumber, brand: asset.brand, cost: asset.cost,
                location: asset.location,
                warrantyStart: asset.warrantyStart ? format(new Date(asset.warrantyStart), "yyyy-MM-dd") : "",
                warrantyEnd: asset.warrantyEnd ? format(new Date(asset.warrantyEnd), "yyyy-MM-dd") : "",
                vendor: asset.vendor, assetModel: asset.assetModel, productNo: asset.productNo,
                status: asset.status,
            });
        } else {
            setSelectedAsset(null);
            reset({ assetId: 0, assetName: "", assetCode: "", status: "Available" });
        }
        setModalOpen(true);
    };

    const onSubmit = (data: any) => {
        updateMutation.mutate(data, {
            onSuccess: () => {
                showSuccess('SAVE_SUCCESS', 'Success!', 'Asset saved.');
                setModalOpen(false);
            },
            onError: () => showError('SAVE_ERROR', 'Error!', 'Failed to save asset.'),
        });
    };

    const handleDelete = (id: number) => {
        showWarning('REQUIRED_FIELDS', 'Delete Asset', 'Are you sure?').then((r) => { if (r.isConfirmed) deleteMutation.mutate(id); });
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Assets', 'Assets')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard }, { label: t('Assets', 'Assets') }]}
                actionLabel={t('Add', 'Add')}
                onAction={() => openModal()}
            />

            <div className="flex flex-wrap items-center gap-3">
                <ExportButtons data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))} columns={exportColumns} filenamePrefix="assets" pdfTitle={t('Assets', 'Assets')} totalCount={sorted.length}
                    selectedData={selection.getSelectedRows(sorted)}
                    selectedCount={selection.selectedCount}
                    onClearSelection={selection.clearSelection}
                />
                <ImportExcelButton
                    columns={[
                        { header: "Asset Name", key: "assetName", required: true },
                        { header: "Asset Code", key: "assetCode", required: true },
                        { header: "Category", key: "category" },
                        { header: "Serial Number", key: "serialNumber" },
                        { header: "Brand", key: "brand" },
                        { header: "Cost", key: "cost" },
                        { header: "Status", key: "status" },
                    
                        { header: "Assigned To", key: "assetUser" },]}
                    filenamePrefix="assets"
                    onImport={async (rows) => {
                        let success = 0, failed = 0;
                        const username = localStorage.getItem("username");
                        for (const row of rows) {
                            try {
                                await apiClient.post("asset/update", {
                                    assetId: 0,
                                    assetName: row.assetName ?? "",
                                    assetCode: row.assetCode ?? "",
                                    category: row.category ?? "Laptop",
                                    serialNumber: row.serialNumber ?? "",
                                    brand: row.brand ?? "",
                                    cost: Number(row.cost) || 0,
                                    status: row.status ?? "Available",
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
                                    <tr key={d.assetId} className={selection.isSelected(d.assetId) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(d.assetId)} onChange={() => selection.toggle(d.assetId)} />
                                        <td className={ui.tdIndex}>{(currentPage - 1) * pageSize + idx + 1}</td>
                                        <td className={ui.tdBold}>{d.assetName}</td>
                                        <td className={ui.td}><span className="px-2 py-0.5 text-xs font-medium rounded bg-nv-violet-light text-nv-violet border border-nv-violet/20 font-mono">{d.assetCode}</span></td>
                                        <td className={ui.td}>{d.category}</td>
                                        <td className={ui.td}><span className="font-mono text-xs">{d.serialNumber || "-"}</span></td>
                                        <td className={ui.td}>{d.assetUser || <span className="text-gray-300 italic">{t('Unassigned', 'Unassigned')}</span>}</td>
                                        <td className={ui.td}>{d.cost?.toLocaleString() || "0"}</td>
                                        <td className={ui.td}><StatusBadge status={d.status || "Unknown"} variant={statusVariant(d.status)} /></td>
                                        <td className={ui.tdActions}><ActionButtons onEdit={() => openModal(d as AssetData)} onDelete={() => handleDelete(d.assetId)} /></td>
                                    </tr>
                                )) : <EmptyState colSpan={10} />}
                            </tbody>
                        </table>
                    </div>
                )}

                <PaginationBar currentPage={currentPage} totalPages={totalPages} totalData={sorted.length} pageSize={pageSize} onGoToPage={goToPage} />
            </div>

            <ModalWrapper open={modalOpen} onClose={() => setModalOpen(false)} title={selectedAsset ? t('Edit Asset', 'Edit Asset') : t('Add Asset', 'Add Asset')} maxWidth="max-w-2xl"
                footer={<button onClick={handleSubmit(onSubmit)} disabled={updateMutation.isPending} className={ui.btnPrimary}>{updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}{t('Submit', 'Submit')}</button>}>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Asset Name', 'Asset Name')} required><input {...register("assetName", { required: true })} className={ui.input} placeholder="e.g. MacBook Pro M2" /></FormField>
                        <FormField label={t('Asset Code', 'Asset Code')} required><input {...register("assetCode", { required: true })} className={ui.input} placeholder="e.g. AST-001" /></FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Category', 'Category')}><select {...register("category")} className={ui.select}><option value="Laptop">{t('Laptop', 'Laptop')}</option><option value="Monitor">{t('Monitor', 'Monitor')}</option><option value="Software">{t('Software', 'Software')}</option><option value="Office Equipment">{t('Office Equipment', 'Office Equipment')}</option></select></FormField>
                        <FormField label={t('Brand', 'Brand')}><input {...register("brand")} className={ui.input} /></FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Model', 'Model')}><input {...register("assetModel")} className={ui.input} /></FormField>
                        <FormField label={t('Serial Number', 'Serial Number')}><input {...register("serialNumber")} className={ui.input} /></FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Cost', 'Cost')}><input type="number" {...register("cost")} className={ui.input} /></FormField>
                        <FormField label={t('Status', 'Status')}><select {...register("status")} className={ui.select}><option value="Available">{t('Available', 'Available')}</option><option value="Assigned">{t('Assigned', 'Assigned')}</option><option value="Damaged">{t('Maintenance', 'Maintenance')}</option></select></FormField>
                    </div>
                </div>
            </ModalWrapper>
        </div>
    );
}
