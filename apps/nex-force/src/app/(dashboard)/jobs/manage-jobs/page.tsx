"use client";

import { useEffect,  useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import Link from "next/link";
import { useMessages } from "@/hooks/use-messages";
import { getApiErrorMessage } from "@/lib/api-error";
import { ROUTES } from "@/lib/routes";
import {
    PageHeader, TableHeaderBar, SortableTh, ActionButtons,
    EmptyState, LoadingSpinner, PaginationBar, ModalWrapper, FormField, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";
import { useSystemConfig } from '@nexone/ui';

/* ── Helpers ── */
const fmtDate = (d: string | Date | null | undefined) => {
    if (!d) return "";
    const dt = new Date(d as string);
    if (isNaN(dt.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(dt.getMonth() + 1)}/${pad(dt.getDate())}/${dt.getFullYear()}`;
};

const toDateInput = (d: string | Date | null | undefined): string => {
    if (!d) return "";
    const dt = new Date(d as string);
    if (isNaN(dt.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};

/* ── Default form state ── */
const emptyForm = {
    manageJobId: 0, jobTitle: "", department: "", jobLocation: "", position: "",
    employmentType: "", experience: "", age: "", qualification: "",
    salaryFrom: "", salaryTo: "", status: "Open", startDate: "", expiredDate: "", description: "",
};

/* ── Page ── */
export default function ManageJobsPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showWarning } = useMessages();

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "jobTitle", label: t('Job Title', 'Job Title'), sortable: true },
    { key: "jobLocation", label: t('Location', 'Location'), sortable: true },
    { key: "department", label: t('Department', 'Department'), sortable: true },
    { key: "startDate", label: t('Start Date', 'Start Date'), sortable: true },
    { key: "expiredDate", label: t('Expire Date', 'Expire Date'), sortable: true },
    { key: "employmentType", label: t('Job Type', 'Job Type'), sortable: true, align: "center" as const },
    { key: "status", label: t('Status', 'Status'), align: "center" as const },
    { key: "action", label: t('Actions', 'Actions'), align: "right" as const },
    ];

    const queryClient = useQueryClient();

    // ── Search state ──
    const [searchJobTitle, setSearchJobTitle] = useState("");
    const [searchJobLocation, setSearchJobLocation] = useState("");
    const [searchDepartment, setSearchDepartment] = useState("");
    const [searchEmploymentType, setSearchEmploymentType] = useState("");
    const [searchStatus, setSearchStatus] = useState("");

    const [quickSearch, setQuickSearch] = useState("");
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
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    // ── Modal state ──
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [form, setForm] = useState({ ...emptyForm });

    // ── Master data ──
    const { data: departmentOptions } = useQuery({
        queryKey: ["mjDepartments"],
        queryFn: async () => { const { data } = await apiClient.get<any>("departments/getAllDepartment"); return data?.data ?? []; },
    });
    const { data: jobTypeOptions } = useQuery({
        queryKey: ["mjJobTypes"],
        queryFn: async () => { const { data } = await apiClient.get<any>("manageJobs/getAllEmployeeType"); return data ?? []; },
    });
    const { data: locationJobOptions } = useQuery({
        queryKey: ["mjLocations"],
        queryFn: async () => { const { data } = await apiClient.get<any>("manageJobs/getAllLocationJob"); return data ?? []; },
    });
    const { data: positionJobOptions } = useQuery({
        queryKey: ["mjPositions"],
        queryFn: async () => { const { data } = await apiClient.get<any>("manageJobs/getAllDesignation"); return data ?? []; },
    });

    // ── Table data ──
    const { data: tableData, isLoading } = useQuery({
        queryKey: ["manageJobsData"],
        queryFn: async () => { const { data } = await apiClient.get<any>("manageJobs/getAllManageJobs"); return data; },
    });

    // ── Search API ──
    const [searchResults, setSearchResults] = useState<any[] | null>(null);

    const handleSearch = async () => {
        try {
            const { data } = await apiClient.post<any>("manageJobs/searchManageJob", {
                jobTitle: searchJobTitle || null,
                jobLocation: searchJobLocation || null,
                department: searchDepartment || null,
                employmentType: searchEmploymentType || null,
                status: searchStatus || null,
            });
            let rows: any[] = [];
            if (Array.isArray(data?.data)) rows = data.data;
            else if (Array.isArray(data)) rows = data;
            else if (data) rows = [data];
            setSearchResults(rows);
            setCurrentPage(1);
        } catch {
            showError('SAVE_ERROR', 'Error!', 'ค้นหาข้อมูลไม่สำเร็จ');
        }
    };

    const handleClear = () => {
        setSearchJobTitle(""); setSearchJobLocation(""); setSearchDepartment(""); setSearchEmploymentType(""); setSearchStatus("");
        setSearchResults(null); setCurrentPage(1);
    };

    // ── Update mutation ──
    const updateMutation = useMutation({
        mutationFn: async (payload: any) => { const { data } = await apiClient.post<any>("manageJobs/update", payload); return data; },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["manageJobsData"] });
            setModalOpen(false);
            showSuccess('SAVE_SUCCESS', 'Success!', 'Job has requested successfully.');
        },
        onError: (err) => {
            showError('SAVE_ERROR', 'Error!', getApiErrorMessage(err, "Save failed"));
        },
    });

    // ── Delete mutation ──
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => { const { data } = await apiClient.delete<any>(`manageJobs/delete?id=${id}`); return data; },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["manageJobsData"] });
            showSuccess('SAVE_SUCCESS', 'Success!', 'Job has delete successfully.');
        },
        onError: () => {
            showError('SAVE_ERROR', 'Error!', 'Failed to delete job');
        },
    });

    // ── Data processing ──
    const rows = useMemo(() => {
        const raw = searchResults ?? tableData?.data ?? [];
        const base = Array.isArray(raw) ? raw : [];
        if (!quickSearch) return base;
        const q = quickSearch.toLowerCase();
        return base.filter((r: any) =>
            r.jobTitle?.toLowerCase().includes(q) ||
            r.jobLocation?.toLowerCase().includes(q) ||
            r.department?.toLowerCase().includes(q) ||
            r.status?.toLowerCase().includes(q) ||
            r.employmentType?.toLowerCase().includes(q)
        );
    }, [searchResults, tableData, quickSearch]);

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
    const startIdx = (safePage - 1) * pageSize;
    const paginatedData = sorted.slice(startIdx, startIdx + pageSize);

    // ── Open Add Modal ──
    const openAddModal = () => {
        setIsEditMode(false);
        setForm({ ...emptyForm });
        setModalOpen(true);
    };

    // ── Open Edit Modal ──
    const openEditModal = (row: any) => {
        setIsEditMode(true);
        setForm({
            manageJobId: row.manageJobId ?? 0,
            jobTitle: row.jobTitle ?? "",
            department: row.departmentId ?? row.department ?? "",
            jobLocation: row.jobLocationId ?? row.jobLocation ?? "",
            position: row.positionId ?? row.position ?? "",
            employmentType: row.employeeTypeId ?? row.employmentType ?? "",
            experience: row.experience ?? "",
            age: row.age ?? "",
            qualification: row.qualification ?? "",
            salaryFrom: row.salaryFrom ?? "",
            salaryTo: row.salaryTo ?? "",
            status: row.status ?? "Open",
            startDate: toDateInput(row.startDate),
            expiredDate: toDateInput(row.expiredDate),
            description: row.description ?? "",
        });
        setModalOpen(true);
    };

    // ── Save ──
    const handleSave = () => {
        if (!form.jobTitle.trim()) {
            showWarning('REQUIRED_FIELDS', 'Warning!', 'Job Title is required');
            return;
        }
        const payload: any = {
            ...(isEditMode ? { manageJobId: form.manageJobId } : {}),
            jobTitle: form.jobTitle, department: form.department, jobLocation: form.jobLocation,
            position: form.position, employmentType: form.employmentType, experience: form.experience,
            age: form.age, qualification: form.qualification, salaryFrom: form.salaryFrom,
            salaryTo: form.salaryTo, status: form.status || "Open",
            startDate: form.startDate || "", expiredDate: form.expiredDate || "",
            description: form.description,
        };
        updateMutation.mutate(payload);
    };

    // ── Delete ──
    const handleDelete = (row: any) => {
        showWarning('REQUIRED_FIELDS', 'Delete', 'Are you sure want to delete?').then(result => {
            if (result.isConfirmed && row.manageJobId) deleteMutation.mutate(row.manageJobId);
        });
    };

    // ── Helper: set form field ──
    const setField = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Jobs', 'Jobs')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard }, { label: t('Jobs', 'Jobs') }]}
                actionLabel={t('Add Job', 'Add Job')}
                onAction={openAddModal}
            />

            {/* Search Filter */}
            <div className={ui.tableWrapper + " mb-6 !overflow-visible"}>
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <FormField label={t('Job Title', 'Job Title')}>
                            <input type="text" value={searchJobTitle} onChange={e => setSearchJobTitle(e.target.value)} className={ui.input} placeholder="Job Title" />
                        </FormField>
                        <FormField label={t('Location', 'Location')}>
                            <select value={searchJobLocation} onChange={e => setSearchJobLocation(e.target.value)} className={ui.select}>
                                <option value="">{t('Select', 'Select')}</option>
                                {(locationJobOptions || []).map((d: any) => <option key={d.client_id} value={d.client_id}>{d.client_code || d.client_name_en}</option>)}
                            </select>
                        </FormField>
                        <FormField label={t('Department', 'Department')}>
                            <select value={searchDepartment} onChange={e => setSearchDepartment(e.target.value)} className={ui.select}>
                                <option value="">{t('Select', 'Select')}</option>
                                {(departmentOptions || []).map((d: any) => <option key={d.departmentId} value={d.departmentId}>{d.departmentNameTh || d.departmentNameEn || d.departmentCode}</option>)}
                            </select>
                        </FormField>
                        <FormField label={t('Job Type', 'Job Type')}>
                            <select value={searchEmploymentType} onChange={e => setSearchEmploymentType(e.target.value)} className={ui.select}>
                                <option value="">{t('Select', 'Select')}</option>
                                {(jobTypeOptions || []).map((d: any) => <option key={d.employee_type_id} value={d.employee_type_id}>{d.employee_type_name_en}</option>)}
                            </select>
                        </FormField>
                        <FormField label={t('Status', 'Status')}>
                            <select value={searchStatus} onChange={e => setSearchStatus(e.target.value)} className={ui.select}>
                                <option value="">{t('Select', 'Select')}</option>
                                <option value="Open">{t('Open', 'Open')}</option>
                                <option value="Closed">{t('Closed', 'Closed')}</option>
                                <option value="Cancelled">{t('Cancelled', 'Cancelled')}</option>
                            </select>
                        </FormField>
                    </div>
                    <div className="flex justify-center gap-3">
                        <button onClick={handleSearch} className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-nv-violet-dark transition" style={{ width: 250 }}>
                            {t('Search', 'Search')}
                        </button>
                        <button onClick={handleClear} className={ui.btnSecondary} style={{ width: 250 }}>
                            {t('Clear', 'Clear')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className={ui.tableWrapper}>
                <TableHeaderBar
                    pageSize={pageSize}
                    onPageSizeChange={(v) => { setPageSize(v); setCurrentPage(1); }}
                    searchText={quickSearch}
                    onSearchChange={(v) => { setQuickSearch(v); setCurrentPage(1); }}
                />

                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="overflow-x-auto">
                        <table className={ui.table + " min-w-[1100px]"}>
                            <thead className={ui.thead}>
                                <tr>
                                    {tableColumns.map((col) => (
                                        <SortableTh key={col.key} column={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                    ))}
                                </tr>
                            </thead>
                            <tbody className={ui.tbody}>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((row: any, idx: number) => (
                                        <tr key={row.manageJobId || idx} className={ui.tr}>
                                            <td className={ui.tdIndex}>{startIdx + idx + 1}</td>
                                            <td className={ui.td}>
                                                <Link href="/jobs/job-details" className="text-nv-violet hover:underline font-medium">{row.jobTitle}</Link>
                                            </td>
                                            <td className={ui.td}>{row.jobLocation}</td>
                                            <td className={ui.td}>{row.department}</td>
                                            <td className={ui.td}>{fmtDate(row.startDate)}</td>
                                            <td className={ui.td}>{fmtDate(row.expiredDate)}</td>
                                            <td className="px-4 py-3 text-sm text-center text-gray-600">{row.employmentType}</td>
                                            <td className="px-4 py-3 text-sm text-center text-gray-600">{row.status || "Open"}</td>
                                            <td className={ui.tdActions}>
                                                <ActionButtons onEdit={() => openEditModal(row)} onDelete={() => handleDelete(row)} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <EmptyState colSpan={9} />
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <PaginationBar
                    currentPage={safePage} totalPages={totalPages} totalData={totalData}
                    pageSize={pageSize} onGoToPage={setCurrentPage}
                />
            </div>

            {/* Add/Edit Job Modal */}
            <ModalWrapper
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={`${isEditMode ? "Edit" : "Add"} Job`}
                maxWidth="max-w-3xl"
                footer={
                    <>
                        <button onClick={() => setModalOpen(false)} className={ui.btnSecondary}>{t('Cancel', 'Cancel')}</button>
                        <button onClick={handleSave} disabled={updateMutation.isPending} className={ui.btnPrimary}>
                            {updateMutation.isPending ? "Saving..." : "Submit"}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label={t('Job Title', 'Job Title')} required>
                            <input value={form.jobTitle} onChange={e => setField("jobTitle", e.target.value)} className={ui.input} />
                        </FormField>
                        <FormField label={t('Department', 'Department')} required>
                            <select value={form.department} onChange={e => setField("department", e.target.value)} className={ui.select}>
                                <option value="">{t('Select', 'Select')}</option>
                                {(departmentOptions || []).map((d: any) => <option key={d.departmentId} value={d.departmentId}>{d.departmentNameTh || d.departmentNameEn || d.departmentCode}</option>)}
                            </select>
                        </FormField>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label={t('Location', 'Location')} required>
                            <select value={form.jobLocation} onChange={e => setField("jobLocation", e.target.value)} className={ui.select}>
                                <option value="">{t('Select', 'Select')}</option>
                                {(locationJobOptions || []).map((d: any) => <option key={d.client_id} value={d.client_id}>{d.client_code || d.client_name_en}</option>)}
                            </select>
                        </FormField>
                        <FormField label={t('Position', 'Position')} required>
                            <select value={form.position} onChange={e => setField("position", e.target.value)} className={ui.select}>
                                <option value="">{t('Select', 'Select')}</option>
                                {(positionJobOptions || []).map((d: any) => <option key={d.designation_id} value={d.designation_id}>{d.designation_code || d.designation_name_en}</option>)}
                            </select>
                        </FormField>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label={t('Experience', 'Experience')} required>
                            <input value={form.experience} onChange={e => setField("experience", e.target.value)} className={ui.input} />
                        </FormField>
                        <FormField label={t('Age', 'Age')} required>
                            <input value={form.age} onChange={e => setField("age", e.target.value)} className={ui.input} />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label={t('Salary From', 'Salary From')} required>
                            <input value={form.salaryFrom} onChange={e => setField("salaryFrom", e.target.value)} className={ui.input} />
                        </FormField>
                        <FormField label={t('Salary To', 'Salary To')} required>
                            <input value={form.salaryTo} onChange={e => setField("salaryTo", e.target.value)} className={ui.input} />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label={t('Job Type', 'Job Type')} required>
                            <select value={form.employmentType} onChange={e => setField("employmentType", e.target.value)} className={ui.select}>
                                <option value="">{t('Select', 'Select')}</option>
                                {(jobTypeOptions || []).map((d: any) => <option key={d.employee_type_id} value={d.employee_type_id}>{d.employee_type_name_en}</option>)}
                            </select>
                        </FormField>
                        <FormField label={t('Status', 'Status')}>
                            <select value={form.status} onChange={e => setField("status", e.target.value)} className={ui.select}>
                                <option value="Open">{t('Open', 'Open')}</option>
                                <option value="Closed">{t('Closed', 'Closed')}</option>
                                <option value="Cancelled">{t('Cancelled', 'Cancelled')}</option>
                            </select>
                        </FormField>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label={t('Start Date', 'Start Date')} required>
                            <input type="date" value={form.startDate} onChange={e => setField("startDate", e.target.value)} className={ui.input} />
                        </FormField>
                        <FormField label={t('Expired Date', 'Expired Date')} required>
                            <input type="date" value={form.expiredDate} onChange={e => setField("expiredDate", e.target.value)} className={ui.input} />
                        </FormField>
                    </div>
                    <FormField label={t('Qualification', 'Qualification')} required>
                        <textarea value={form.qualification} onChange={e => setField("qualification", e.target.value)} rows={4} className={ui.textarea} />
                    </FormField>
                    <FormField label={t('Description', 'Description')}>
                        <textarea value={form.description} onChange={e => setField("description", e.target.value)} rows={4} className={ui.textarea} />
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
