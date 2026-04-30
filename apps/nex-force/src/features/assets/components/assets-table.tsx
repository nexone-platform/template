"use client";

/**
 * Assets Table — replaces Angular's `assets-main.component.html` table section.
 *
 * Conversion:
 *   matSort (matSortChange) → useState + useMemo sorting
 *   *ngFor → .map()
 *   *ngIf → conditional rendering
 *   (click) → onClick
 *   {{ | date }} pipe → formatDate() utility
 *   MatTableDataSource → plain array + client-side sorting
 *   Copy-pasted pagination HTML → <Pagination> component
 */
import { useState, useMemo } from "react";
import { cn, formatDate } from "@/lib/utils";
import { usePagination } from "@/hooks/use-pagination";
import type { AssetData } from "@/types/asset";
import type { RolePermission } from "@/types/api";
import {
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Pencil,
    Trash2,
    Eye,
} from "lucide-react";

interface AssetsTableProps {
    assets: AssetData[];
    permissions: RolePermission | null;
    onEdit: (asset: AssetData) => void;
    onDelete: (id: number) => void;
}

type SortConfig = {
    key: keyof AssetData | null;
    direction: "asc" | "desc";
};

export function AssetsTable({
    assets,
    permissions,
    onEdit,
    onDelete,
}: AssetsTableProps) {
    const [sort, setSort] = useState<SortConfig>({ key: null, direction: "asc" });
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);

    // Sorting — replaces matSort + sortData()
    const sortedData = useMemo(() => {
        if (!sort.key) return assets;
        return [...assets].sort((a, b) => {
            const aVal = (a as unknown as Record<string, unknown>)[sort.key!];
            const bVal = (b as unknown as Record<string, unknown>)[sort.key!];
            if (aVal == null || bVal == null) return 0;
            const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return sort.direction === "asc" ? cmp : -cmp;
        });
    }, [assets, sort]);

    // Pagination — replaces the duplicated pagination code
    const {
        paginatedData,
        currentPage,
        pageSize,
        totalData,
        pageNumbers,
        goToPage,
        nextPage,
        prevPage,
        changePageSize,
        isFirstPage,
        isLastPage,
    } = usePagination(sortedData);

    function handleSort(key: keyof AssetData) {
        setSort((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    }

    const statusColor: Record<string, string> = {
        Pending: "text-red-500",
        Approved: "text-green-500",
        Returned: "text-nv-violet",
        Deployed: "text-nv-violet",
    };

    return (
        <div>
            {/* Page size selector */}
            <div className="flex items-center gap-2 mb-4">
                <label className="text-sm text-gray-600">Show</label>
                <select
                    value={pageSize}
                    onChange={(e) => changePageSize(Number(e.target.value))}
                    className="border rounded px-2 py-1 text-sm"
                >
                    {[10, 25, 50, 100].map((size) => (
                        <option key={size} value={size}>
                            {size}
                        </option>
                    ))}
                </select>
                <span className="text-sm text-gray-600">entries</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                        <tr>
                            {[
                                { key: "assetUser" as const, label: "Asset User" },
                                { key: "assetName" as const, label: "Asset Name" },
                                { key: "assetCode" as const, label: "Asset ID" },
                                { key: "warrantyStart" as const, label: "Warranty Start" },
                                { key: "warranty" as const, label: "Warranty" },
                                { key: "warrantyEnd" as const, label: "Warranty End" },
                                { key: "cost" as const, label: "Amount" },
                            ].map(({ key, label }) => (
                                <th
                                    key={key}
                                    onClick={() => handleSort(key)}
                                    className="px-4 py-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                                >
                                    {label}
                                    {sort.key === key && (
                                        <span className="ml-1">
                                            {sort.direction === "asc" ? "↑" : "↓"}
                                        </span>
                                    )}
                                </th>
                            ))}
                            <th className="px-4 py-3 font-medium text-gray-700 text-center">
                                Status
                            </th>
                            <th className="px-4 py-3 font-medium text-gray-700 text-right">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="text-center py-8 text-gray-400">
                                    No data found
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((asset) => (
                                <tr
                                    key={asset.assetId}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-4 py-3">{asset.assetUser}</td>
                                    <td className="px-4 py-3 font-semibold">
                                        {asset.assetName}
                                    </td>
                                    <td className="px-4 py-3">{asset.assetCode}</td>
                                    <td className="px-4 py-3">
                                        {formatDate(asset.warrantyStart)}
                                    </td>
                                    <td className="px-4 py-3">{asset.warranty}</td>
                                    <td className="px-4 py-3">
                                        {formatDate(asset.warrantyEnd)}
                                    </td>
                                    <td className="px-4 py-3">{asset.cost}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className={cn(
                                                "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                                                statusColor[asset.status] || "text-gray-500"
                                            )}
                                        >
                                            <span className="w-2 h-2 rounded-full bg-current" />
                                            {asset.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right relative">
                                        <button
                                            onClick={() =>
                                                setOpenDropdown(
                                                    openDropdown === asset.assetId ? null : asset.assetId
                                                )
                                            }
                                            className="p-1 rounded hover:bg-gray-100"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                        {openDropdown === asset.assetId && (
                                            <div className="absolute right-4 top-full z-10 bg-white border rounded-lg shadow-lg py-1 min-w-[120px]">
                                                {permissions?.canView && (
                                                    <button
                                                        onClick={() => {
                                                            onEdit(asset);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                                                    >
                                                        {permissions?.canEdit ? (
                                                            <>
                                                                <Pencil className="w-3.5 h-3.5" /> Edit
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye className="w-3.5 h-3.5" /> View
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                                {permissions?.canDelete && (
                                                    <button
                                                        onClick={() => {
                                                            onDelete(asset.assetId);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination — replaces the massive pagination HTML block */}
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <div>
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, totalData)} of {totalData} entries
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={prevPage}
                        disabled={isFirstPage}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    {pageNumbers.map((page) => (
                        <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={cn(
                                "px-3 py-1 rounded text-sm",
                                page === currentPage
                                    ? "bg-nv-violet text-white"
                                    : "hover:bg-gray-100"
                            )}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={nextPage}
                        disabled={isLastPage}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
