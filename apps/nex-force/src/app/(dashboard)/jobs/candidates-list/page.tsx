"use client";

import { useEffect,  useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, Download } from "lucide-react";
import apiClient from "@/lib/api-client";
import {
    PageHeader, TableHeaderBar, SortableTh, EmptyState, LoadingSpinner,
    PaginationBar, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";
import { useSystemConfig } from '@nexone/ui';



export default function CandidatesListPage() {
    const { t } = usePageTranslation();

    const columns = [
        { key: "#", label: "#", width: "w-14" },
        { key: "candidateName", label: t('Name', 'Name'), sortable: true },
        { key: "email", label: t('Email', 'Email'), sortable: true },
        { key: "phone", label: t('Phone', 'Phone'), sortable: true },
        { key: "appliedDate", label: t('Applied Date', 'Applied Date'), sortable: true },
        { key: "action", label: t('Actions', 'Actions'), align: "right" as const },
    ];

    const [search, setSearch] = useState("");
    const { configs, loading: configLoading } = useSystemConfig();
    const [hasSetDefaultPageSize, setHasSetDefaultPageSize] = useState(false);

    useEffect(() => {
        if (!configLoading && configs?.pageRecordDefault && !hasSetDefaultPageSize) {
            setPageSize(configs.pageRecordDefault);
            setHasSetDefaultPageSize(true);
        }
    }, [configLoading, configs?.pageRecordDefault, hasSetDefaultPageSize]);
    const [pageSize, setPageSize] = useState(configs?.pageRecordDefault || 10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortKey, setSortKey] = useState("");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const { data: candidates, isLoading } = useQuery({
        queryKey: ["candidatesList"],
        queryFn: async () => { const { data } = await apiClient.get<any>("manageJobs/getCandidatesList"); return data?.data || []; },
    });

    const filtered = useMemo(() =>
        (candidates || []).filter((c: any) => {
            if (!search) return true;
            const q = search.toLowerCase();
            return (
                c.candidateName?.toLowerCase().includes(q) ||
                c.email?.toLowerCase().includes(q) ||
                c.phone?.toLowerCase().includes(q) ||
                c.appliedDate?.toLowerCase().includes(q)
            );
        }),
        [candidates, search]
    );

    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
    };

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

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Candidates List', 'Candidates List')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Jobs', 'Jobs') },
                    { label: t('Candidates List', 'Candidates List') },
                ]}
            />

            <div className={ui.tableWrapper}>
                <TableHeaderBar
                    pageSize={pageSize}
                    onPageSizeChange={(v) => { setPageSize(v); setCurrentPage(1); }}
                    searchText={search}
                    onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
                />
                <div className="overflow-x-auto">
                    <table className={`${ui.table} min-w-[800px]`}>
                        <thead className={ui.thead}>
                            <tr>
                                {columns.map(col => (
                                    <SortableTh key={col.key} column={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                ))}
                            </tr>
                        </thead>
                        <tbody className={ui.tbody}>
                            {isLoading ? (
                                <LoadingSpinner colSpan={6} />
                            ) : paginatedData.length === 0 ? (
                                <EmptyState colSpan={6} />
                            ) : paginatedData.map((c: any, idx: number) => (
                                <tr key={c.id || idx} className={ui.tr}>
                                    <td className={ui.tdIndex}>{(safePage - 1) * pageSize + idx + 1}</td>
                                    <td className={ui.tdBold}>{c.candidateName}</td>
                                    <td className={ui.td}>{c.email}</td>
                                    <td className={ui.td}>{c.phone}</td>
                                    <td className={ui.td}>{c.appliedDate}</td>
                                    <td className={ui.tdActions}>
                                        <div className="flex items-center justify-end gap-1">
                                            <button className="p-1.5 text-gray-400 hover:text-nv-violet hover:bg-nv-violet-light rounded-lg transition">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-nv-violet hover:bg-nv-violet-light rounded-lg transition">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <PaginationBar currentPage={safePage} totalPages={totalPages} totalData={totalData} pageSize={pageSize} onGoToPage={setCurrentPage} />
            </div>
        </div>
    );
}
