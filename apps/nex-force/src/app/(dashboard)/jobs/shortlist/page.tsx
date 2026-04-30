"use client";

import { useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useMessages } from "@/hooks/use-messages";
import { getApiErrorMessage } from "@/lib/api-error";
import {
    PageHeader, TableHeaderBar, SortableTh, EmptyState, LoadingSpinner,
    PaginationBar, ModalWrapper, FormField, StatusBadge, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

/* ── Helpers ── */
const fmtDate = (d: string | null | undefined) => {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "";
    return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
};

function safeParseIds(input: any): number[] {
    try {
        const arr = typeof input === "string" ? JSON.parse(input) : input;
        return Array.isArray(arr) ? arr.map(Number).filter(n => !Number.isNaN(n)) : [];
    } catch { return []; }
}

/* ── Page ── */
export default function ShortlistPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError } = useMessages();
    const queryClient = useQueryClient();

    // ── Search state ──
    const [searchName, setSearchName] = useState("");
    const [searchPosition, setSearchPosition] = useState("");
    const [searchStatus, setSearchStatus] = useState("");

    // ── Table state ──
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortKey, setSortKey] = useState("");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    // ── Modal state ──
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<any>(null);

    // ── Master data: positions ──
    const { data: positionJobOptions } = useQuery({
        queryKey: ["shortlistPositions"],
        queryFn: async () => { const { data } = await apiClient.get<any>("manageJobs/getAllDesignation"); return data || []; },
    });

    // ── Master data: categories ──
    const { data: categoryOptions } = useQuery({
        queryKey: ["shortlistCategories"],
        queryFn: async () => { const { data } = await apiClient.get<any>("interviewQuestions/getAllCategory"); return data || []; },
    });

    // ── Table data ──
    const { data: tableData, isLoading } = useQuery({
        queryKey: ["shortlistData"],
        queryFn: async () => { const { data } = await apiClient.get<any>("manageApplicantTesting/getAllManageResume"); return data; },
    });

    // ── Search API ──
    const { data: searchResults, refetch: doSearch } = useQuery({
        queryKey: ["shortlistSearch", searchName, searchPosition, searchStatus],
        queryFn: async () => {
            const { data } = await apiClient.post<any>("scheduleTiming/searchScheduleTime", {
                firstName: searchName || null, position: searchPosition || null, status: searchStatus || null,
            });
            return data;
        },
        enabled: false,
    });

    // ── Category Testing Form ──
    const categoryForm = useForm<{ status: string; categories: { categoryId: string }[] }>({
        defaultValues: { status: "PENDING", categories: [{ categoryId: "" }] },
    });
    const { fields: catFields, append: appendCat, remove: removeCat } = useFieldArray({
        control: categoryForm.control, name: "categories",
    });

    // ── Save mutation ──
    const saveMutation = useMutation({
        mutationFn: async (payload: any) => { const { data } = await apiClient.post<any>("manageApplicantTesting/update", payload); return data; },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shortlistData"] });
            queryClient.removeQueries({ queryKey: ["shortlistSearch"] });
            setEditModalOpen(false);
            showSuccess('SAVE_SUCCESS', 'Success!', 'Updated category testing successfully.');
        },
        onError: (err) => {
            showError('SAVE_ERROR', 'Error!', getApiErrorMessage(err, "Save failed"));
        },
    });

    // ── Data processing ──
    const rows = useMemo(() => {
        const rawData = searchResults?.data ?? tableData?.data ?? [];
        return Array.isArray(rawData) ? rawData : [];
    }, [searchResults?.data, tableData?.data]);

    // ── Search / Clear ──
    const handleSearch = () => { setCurrentPage(1); doSearch(); };
    const handleClear = () => {
        setSearchName(""); setSearchPosition(""); setSearchStatus("");
        setCurrentPage(1);
        queryClient.removeQueries({ queryKey: ["shortlistSearch"] });
    };

    // ── Sort ──
    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
    };

    const sorted = useMemo(() => {
        const data = [...rows];
        if (!sortKey) return data;
        return data.sort((a: any, b: any) => {
            const aVal = a[sortKey] ?? ""; const bVal = b[sortKey] ?? "";
            return (aVal < bVal ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
        });
    }, [rows, sortKey, sortDir]);

    // ── Pagination ──
    const totalData = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalData / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedData = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

    // ── Open Edit Modal ──
    const openEditModal = (row: any) => {
        setEditingRow(row);
        const ids = safeParseIds(row.categoriesJson ?? row.categoryIdsJson ?? []);
        let catRows: { categoryId: string }[];
        if (ids.length > 0) catRows = ids.map(id => ({ categoryId: String(id) }));
        else if (row.categoryId) catRows = [{ categoryId: String(row.categoryId) }];
        else catRows = [{ categoryId: "" }];
        categoryForm.reset({ status: row.status || "PENDING", categories: catRows });
        setEditModalOpen(true);
    };

    // ── Save category testing ──
    const handleSaveCategoryTesting = () => {
        const values = categoryForm.getValues();
        const categoryIds = values.categories.map(c => Number(c.categoryId)).filter(n => !Number.isNaN(n) && n > 0);
        const uniqueIds = [...new Set(categoryIds)];
        if (uniqueIds.length === 0) {
            showError('SAVE_ERROR', 'Error!', 'Please select at least one category.');
            return;
        }
        saveMutation.mutate({
            manageApplicantTestingId: editingRow?.manageApplicantTestingId ?? 0,
            manageResumeId: editingRow?.manageResumeId ?? 0,
            status: values.status,
            categoriesJson: JSON.stringify(uniqueIds),
        });
    };

    const columns = [
        { key: "manageResumeId", label: "#", sortable: true, width: "w-16" },
        { key: "firstName", label: t('Name', 'Name'), sortable: true },
        { key: "position", label: t('Position', 'Position'), sortable: true },
        { key: "email", label: t('Email', 'Email'), sortable: true },
        { key: "startCreateResume", label: t('Resume Date', 'Resume Date'), sortable: true },
        { key: "categoryName", label: t('Category', 'Category'), sortable: true },
        { key: "status", label: t('Status', 'Status'), sortable: true },
        { key: "testing", label: t('Testing', 'Testing'), sortable: false, align: "center" as const },
    ];

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Manage Applicant Testing', 'Manage Applicant Testing')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Jobs', 'Jobs') },
                    { label: t('Manage Applicant Testing', 'Manage Applicant Testing') },
                ]}
            />

            {/* Search Filter */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormField label={t('Name', 'Name')}>
                        <input type="text" value={searchName} onChange={e => setSearchName(e.target.value)} className={ui.input} placeholder="Name" />
                    </FormField>
                    <FormField label={t('Position', 'Position')}>
                        <select value={searchPosition} onChange={e => setSearchPosition(e.target.value)} className={ui.select}>
                            <option value="">{t('Select', 'Select')}</option>
                            {(positionJobOptions || []).map((d: any) => (
                                <option key={d.designation_id} value={d.designation_id}>{d.designation_code || d.designation_name_en}</option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label={t('Status', 'Status')}>
                        <select value={searchStatus} onChange={e => setSearchStatus(e.target.value)} className={ui.select}>
                            <option value="">{t('Select', 'Select')}</option>
                            <option value="ACTIVE">Active</option>
                            <option value="PENDING">Pending</option>
                            <option value="SUCCESS">Success</option>
                            <option value="CANCEL">Cancel</option>
                        </select>
                    </FormField>
                </div>
                <div className="flex justify-center gap-3">
                    <button onClick={handleSearch} className={`${ui.btnPrimary} bg-emerald-600 hover:bg-nv-violet-dark active:bg-emerald-800 w-[250px] justify-center flex items-center gap-2`}>{t('Search', 'Search')}</button>
                    <button onClick={handleClear} className={`${ui.btnSecondary} w-[250px] justify-center`}>{t('Clear', 'Clear')}</button>
                </div>
            </div>

            {/* Table */}
            <div className={ui.tableWrapper}>
                <TableHeaderBar pageSize={pageSize} onPageSizeChange={(v) => { setPageSize(v); setCurrentPage(1); }} />
                <div className="overflow-x-auto">
                    <table className={`${ui.table} min-w-[900px]`}>
                        <thead className={ui.thead}>
                            <tr>
                                {columns.map(col => (
                                    <SortableTh key={col.key} column={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                ))}
                            </tr>
                        </thead>
                        <tbody className={ui.tbody}>
                            {isLoading ? (
                                <LoadingSpinner colSpan={8} />
                            ) : paginatedData.length === 0 ? (
                                <EmptyState colSpan={8} />
                            ) : (
                                paginatedData.map((row: any, idx: number) => (
                                    <tr key={row.manageResumeId || idx} className={ui.tr}>
                                        <td className={ui.tdIndex}>{row.manageResumeId}</td>
                                        <td className={ui.tdBold}>{row.firstName} {row.lastName}</td>
                                        <td className={ui.td}>{row.position}</td>
                                        <td className={ui.td}>{row.email}</td>
                                        <td className={ui.td}>{fmtDate(row.startCreateResume)}</td>
                                        <td className={ui.td}>{row.categoryName}</td>
                                        <td className="px-4 py-3">
                                            {row.status && <StatusBadge status={row.status} />}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => openEditModal(row)}
                                                disabled={row.status === "SUCCESS"}
                                                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${row.status === "SUCCESS"
                                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                    : `${ui.btnPrimary} px-3 py-1.5 text-xs`}`}
                                            >
                                                Add Category Testing
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <PaginationBar currentPage={safePage} totalPages={totalPages} totalData={totalData} pageSize={pageSize} onGoToPage={setCurrentPage} />
            </div>

            {/* Add Category Testing Modal */}
            <ModalWrapper open={editModalOpen} onClose={() => setEditModalOpen(false)} title={t('Add Category Testing', 'Add Category Testing')} maxWidth="max-w-2xl"
                footer={
                    <button onClick={handleSaveCategoryTesting} disabled={saveMutation.isPending} className={ui.btnPrimary}>
                        {saveMutation.isPending ? "Saving..." : "Save"}
                    </button>
                }>
                <div className="space-y-4">
                    {catFields.map((field, index) => (
                        <div key={field.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-end gap-4">
                                <div className="flex-1">
                                    <FormField label={t('Category', 'Category')} required>
                                        <select {...categoryForm.register(`categories.${index}.categoryId`, { required: true })} className={ui.select}>
                                            <option value="">{t('Select', 'Select')}</option>
                                            {(categoryOptions || []).map((c: any) => (
                                                <option key={c.categoryId} value={c.categoryId}>{c.categoryDescription}</option>
                                            ))}
                                        </select>
                                    </FormField>
                                </div>
                                <button type="button" onClick={() => removeCat(index)} disabled={catFields.length === 1}
                                    className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition mb-0.5">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    <button onClick={() => appendCat({ categoryId: "" })} className="text-nv-violet hover:text-blue-800 text-sm flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add More
                    </button>

                    <FormField label={t('Status', 'Status')}>
                        <select {...categoryForm.register("status", { required: true })} className={`${ui.select} max-w-xs`}>
                            <option value="ACTIVE">Active</option>
                            <option value="PENDING">Pending</option>
                            <option value="SUCCESS">Success</option>
                            <option value="CANCEL">Cancel</option>
                        </select>
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
