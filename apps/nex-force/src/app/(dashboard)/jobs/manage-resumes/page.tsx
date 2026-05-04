"use client";

import { useEffect,  useState, useMemo, useCallback } from "react";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useMessages } from "@/hooks/use-messages";
import {
    PageHeader, TableHeaderBar, SortableTh, ActionButtons, EmptyState,
    LoadingSpinner, PaginationBar, FormField, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";
import { useSystemConfig } from '@nexone/ui';

/* ── Normalize resume data (matching Angular normalizeResume) ── */
function normalizeResume(x: any) {
    let skillsText = "";
    const skillsRaw = x.skills ?? x.Skills ?? null;
    if (skillsRaw) {
        try {
            const arr = typeof skillsRaw === "string" ? JSON.parse(skillsRaw) : skillsRaw;
            if (Array.isArray(arr)) {
                const allSkills: string[] = [];
                arr.forEach((s: any) => {
                    if (s.hardSkill) allSkills.push(s.hardSkill);
                    if (s.softSkill) allSkills.push(s.softSkill);
                });
                skillsText = allSkills.join(", ");
            } else {
                skillsText = String(skillsRaw);
            }
        } catch {
            skillsText = String(skillsRaw);
        }
    }

    return {
        manageResumeId: x.manageResumeId ?? x.ManageResumeId ?? x.manage_resume_id ?? x.id,
        firstName: x.firstName ?? x.FirstName ?? x.first_name ?? "",
        lastName: x.lastName ?? x.LastName ?? x.last_name ?? "",
        email: x.email ?? x.Email ?? "",
        phone: x.phone ?? x.Phone ?? "",
        gender: x.gender ?? x.Gender ?? null,
        position: x.positionName ?? x.position ?? null,
        location: x.locationName ?? x.location ?? null,
        skills: skillsText,
        createDate: x.createDate ?? x.CreateDate ?? null,
    };
}

/* ── Phone format (Angular: phoneFormat pipe) ── */
function formatPhone(phone: string | null | undefined): string {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
}

/* ── Page Component ── */
export default function ManageResumesPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showWarning } = useMessages();
    const queryClient = useQueryClient();
    const router = useRouter();

    // ── Search form state ──
    const [searchName, setSearchName] = useState("");
    const [searchPosition, setSearchPosition] = useState<string>("");
    const [searchLocation, setSearchLocation] = useState<string>("");
    const [searchSkill, setSearchSkill] = useState("");
    const [searchPhone, setSearchPhone] = useState("");

    // ── Table state ──
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

    // ── Master data: positions & locations ──
    const { data: positionJobOptions } = useQuery({
        queryKey: ["jobPositions"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("manageJobs/getAllDesignation");
            return data || [];
        },
    });

    const { data: locationJobOptions } = useQuery({
        queryKey: ["jobLocations"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("manageJobs/getAllLocationJob");
            return data || [];
        },
    });

    // ── Resume data ──
    const { data: resumeData, isLoading } = useQuery({
        queryKey: ["resumes"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("manageResume/getAllManageResume");
            return data;
        },
    });

    // ── Search via API ──
    const { data: searchResults, refetch: doSearch } = useQuery({
        queryKey: ["resumeSearch", searchName, searchPosition, searchLocation, searchSkill, searchPhone],
        queryFn: async () => {
            const { data } = await apiClient.post<any>("manageResume/searchResume", {
                firstName: searchName || null,
                position: searchPosition || null,
                location: searchLocation || null,
                skills: searchSkill || null,
                phone: searchPhone || null,
            });
            return data;
        },
        enabled: false,
    });

    // ── Delete mutation ──
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete<any>(`manageResume/delete?id=${id}`);
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["resumes"] });
            queryClient.removeQueries({ queryKey: ["resumeSearch"] });
            showSuccess('SAVE_SUCCESS', 'Success!', res?.message || "Deleted successfully.");
        },
        onError: () => {
            showError('SAVE_ERROR', 'Error!', 'Error deleting resume.');
        },
    });

    // ── Determine which data to show ──
    const resumes = useMemo(() => {
        const rawData = searchResults?.data ?? resumeData?.data ?? [];
        return (Array.isArray(rawData) ? rawData : []).map(normalizeResume);
    }, [searchResults?.data, resumeData?.data]);

    // ── Search / Clear ──
    const handleSearch = () => { setCurrentPage(1); doSearch(); };
    const handleClear = useCallback(() => {
        setSearchName(""); setSearchPosition(""); setSearchLocation("");
        setSearchSkill(""); setSearchPhone(""); setCurrentPage(1);
        queryClient.removeQueries({ queryKey: ["resumeSearch"] });
    }, [queryClient]);

    // ── Sort ──
    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
    };

    // ── Navigate to profile ──
    const navigateProfile = (id: number) => { router.push(`/jobs/manage-resumes/${id}`); };

    // ── Confirm Delete ──
    const confirmDelete = (id: number) => {
        showWarning('REQUIRED_FIELDS', 'Delete Resume', 'Are you sure want to delete?').then((result) => { if (result.isConfirmed) deleteMutation.mutate(id); });
    };

    // ── Sorted data ──
    const sorted = useMemo(() => {
        const source = Array.isArray(resumes) ? resumes : [];
        if (!sortKey) return source;
        return [...source].sort((a: any, b: any) => {
            const aVal = a[sortKey] ?? ""; const bVal = b[sortKey] ?? "";
            return (aVal < bVal ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
        });
    }, [resumes, sortKey, sortDir]);

    // ── Pagination ──
    const totalData = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalData / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedData = Array.isArray(sorted) ? sorted.slice((safePage - 1) * pageSize, safePage * pageSize) : [];

    const columns = [
        { key: "firstName", label: t('Name', 'Name'), sortable: true },
        { key: "position", label: t('Position', 'Position'), sortable: true },
        { key: "location", label: t('Location', 'Location'), sortable: true },
        { key: "skills", label: t('Skill', 'Skill'), sortable: true },
        { key: "phone", label: t('Phone', 'Phone'), sortable: true },
        { key: "actions", label: t('Action', 'Action'), sortable: false, align: "right" as const },
    ];

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Resume', 'Resume')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Resume', 'Resume') },
                ]}
                actionLabel={t('Add Resume', 'Add Resume')}
                onAction={() => navigateProfile(0)}
                actionIcon={<Plus className="w-4 h-4" />}
            />

            {/* Search Filter */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <FormField label={t('Name', 'Name')}>
                        <input type="text" value={searchName} onChange={e => setSearchName(e.target.value)} className={ui.input} placeholder="Name" />
                    </FormField>
                    <FormField label={t('Position', 'Position')}>
                        <select value={searchPosition} onChange={e => setSearchPosition(e.target.value)} className={ui.select}>
                            <option value="">{t('Select', 'Select')}</option>
                            {(positionJobOptions || []).map((d: any) => (
                                <option key={d.designation_id || d.designationId} value={d.designation_id || d.designationId}>
                                    {d.designation_code || d.designation_name_en || d.designationNameEn}
                                </option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label={t('Location', 'Location')}>
                        <select value={searchLocation} onChange={e => setSearchLocation(e.target.value)} className={ui.select}>
                            <option value="">{t('Select', 'Select')}</option>
                            {(locationJobOptions || []).map((d: any) => (
                                <option key={d.client_id || d.clientId} value={d.client_id || d.clientId}>
                                    {d.client_code || d.client_name_en || d.clientNameEn}
                                </option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label={t('Skill', 'Skill')}>
                        <input type="text" value={searchSkill} onChange={e => setSearchSkill(e.target.value)} className={ui.input} placeholder="Skill" />
                    </FormField>
                    <FormField label={t('Phone', 'Phone')}>
                        <input type="text" value={searchPhone} onChange={e => setSearchPhone(e.target.value)} className={ui.input} placeholder="Phone" />
                    </FormField>
                </div>
                <div className="flex justify-center gap-3">
                    <button onClick={handleSearch} className={`${ui.btnPrimary} bg-emerald-600 hover:bg-nv-violet-dark active:bg-emerald-800 w-[250px] justify-center flex items-center gap-2`}>
                        Search
                    </button>
                    <button onClick={handleClear} className={`${ui.btnSecondary} w-[250px] justify-center`}>
                        Clear
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className={ui.tableWrapper}>
                <TableHeaderBar
                    pageSize={pageSize}
                    onPageSizeChange={(v) => { setPageSize(v); setCurrentPage(1); }}
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
                            ) : (
                                paginatedData.map((row: any, idx: number) => (
                                    <tr key={row.manageResumeId || idx} className={ui.tr}>
                                        <td className={ui.td}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-nv-violet-light text-nv-violet flex items-center justify-center font-semibold text-sm flex-shrink-0">
                                                    {(row.firstName || "?")[0]?.toUpperCase()}
                                                </div>
                                                <button
                                                    onClick={() => navigateProfile(row.manageResumeId)}
                                                    className="text-sm font-medium text-nv-violet hover:underline text-left"
                                                >
                                                    {row.firstName} {row.lastName}
                                                </button>
                                            </div>
                                        </td>
                                        <td className={ui.td}>{row.position}</td>
                                        <td className={ui.td}>{row.location}</td>
                                        <td className={ui.td}>{row.skills || "-"}</td>
                                        <td className={ui.td}>{formatPhone(row.phone)}</td>
                                        <td className={ui.tdActions}>
                                            <ActionButtons
                                                onEdit={() => navigateProfile(row.manageResumeId)}
                                                onDelete={() => confirmDelete(row.manageResumeId)}
                                            />
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
