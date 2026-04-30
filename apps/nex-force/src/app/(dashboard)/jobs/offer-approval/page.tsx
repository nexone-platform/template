"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import apiClient from "@/lib/api-client";
import {
    PageHeader, TableHeaderBar, SortableTh, EmptyState, LoadingSpinner,
    PaginationBar, StatusBadge, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

export default function OfferApprovalPage() {
    const { t } = usePageTranslation();
    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortKey, setSortKey] = useState("");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const { data: offers, isLoading } = useQuery({
        queryKey: ["offerApprovals"],
        queryFn: async () => { const { data } = await apiClient.get<any>("manageJobs/getOfferApprovals"); return data?.data || []; },
    });

    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
    };

    const filtered = useMemo(() =>
        (offers || []).filter((o: any) => !search || o.candidateName?.toLowerCase().includes(search.toLowerCase())),
        [offers, search]
    );

    const sorted = useMemo(() => {
        const data = [...filtered];
        if (!sortKey) return data;
        return data.sort((a: any, b: any) => {
            const av = a[sortKey] ?? ""; const bv = b[sortKey] ?? "";
            return (av < bv ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
        });
    }, [filtered, sortKey, sortDir]);

    const totalData = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalData / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedData = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

    const columns = [
        { key: "#", label: "#", sortable: false, width: "w-14" },
        { key: "candidateName", label: t('Candidate', 'Candidate'), sortable: true },
        { key: "jobTitle", label: t('Job Title', 'Job Title'), sortable: true },
        { key: "status", label: t('Status', 'Status'), sortable: true, align: "center" as const },
        { key: "actions", label: t('Actions', 'Actions'), sortable: false, align: "right" as const },
    ];

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Offer Approvals', 'Offer Approvals')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Jobs', 'Jobs'), href: "/jobs" },
                    { label: t('Offer Approvals', 'Offer Approvals') },
                ]}
            />

            <div className={ui.tableWrapper}>
                <TableHeaderBar
                    pageSize={pageSize}
                    onPageSizeChange={(v) => { setPageSize(v); setCurrentPage(1); }}
                    searchText={search}
                    onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
                    searchPlaceholder={t('Search candidates...', 'Search candidates...')}
                />

                <div className="overflow-x-auto">
                    <table className={ui.table}>
                        <thead className={ui.thead}>
                            <tr>
                                {columns.map(col => (
                                    <SortableTh
                                        key={col.key}
                                        column={col}
                                        sortKey={sortKey}
                                        sortDir={sortDir}
                                        onSort={handleSort}
                                    />
                                ))}
                            </tr>
                        </thead>
                        <tbody className={ui.tbody}>
                            {isLoading ? (
                                <LoadingSpinner colSpan={5} />
                            ) : paginatedData.length === 0 ? (
                                <EmptyState colSpan={5} />
                            ) : (
                                paginatedData.map((o: any, idx: number) => (
                                    <tr key={o.id || idx} className={ui.tr}>
                                        <td className={ui.tdIndex}>{(safePage - 1) * pageSize + idx + 1}</td>
                                        <td className={ui.tdBold}>{o.candidateName}</td>
                                        <td className={ui.td}>{o.jobTitle}</td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusBadge status={o.status || "Pending"} />
                                        </td>
                                        <td className={ui.tdActions}>
                                            <div className="flex items-center justify-end gap-1">
                                                <button className="p-1.5 text-gray-400 hover:text-nv-violet hover:bg-nv-violet-light rounded-md transition-colors" title={t('Approve', 'Approve')}>
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title={t('Reject', 'Reject')}>
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <PaginationBar
                    currentPage={safePage}
                    totalPages={totalPages}
                    totalData={totalData}
                    pageSize={pageSize}
                    onGoToPage={setCurrentPage}
                />
            </div>
        </div>
    );
}
