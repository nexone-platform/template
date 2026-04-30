"use client";

import { useState, useCallback, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/lib/routes";
import apiClient from "@/lib/api-client";
import { getUserProfile } from "@/lib/auth";
import { useMessages } from "@/hooks/use-messages";
import { Users } from "lucide-react";
import {
    PageHeader, TableHeaderBar, SortableTh, ActionButtons,
    EmptyState, LoadingSpinner, PaginationBar, ModalWrapper, FormField, ui,
} from "@/components/shared/ui-components";
import ImportExcelButton from "@/components/ImportExcelButton";
import { usePageTranslation } from "@/lib/language";

/* โ”€โ”€ Types โ”€โ”€ */
interface CostDetail {
    costDetailId: number;
    employeeId: number;
    employeeCode?: string;
    employeeName?: string;
    designationCode?: string;
    costPerDay: number;
    mdProject: number;
    totalCost: number;
    mdUsed: number;
    remainMd: number;
    extraCost: number;
}

interface ProjectCostForm {
    costId: number;
    projectId: number | null;
    budgetProject: number;
    totalCost: number;
    mdPerMonth: number;
    clientId: number;
    startDate: string;
    endDate: string;
    costDetail: CostDetail[];
}

interface ProjectCostRow {
    id?: number;
    costId: number;
    projectId: number;
    projectName?: string;
    clientName?: string;
    startDate?: string;
    endDate?: string;
    budgetProject: number;
    totalCost: number;
    mdPerMonth: number;
    teamCount?: number;
}

/* โ”€โ”€ Helpers โ”€โ”€ */
const fmtDate = (d: string | null | undefined) => {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "";
    return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
};

const fmtNumber = (n: number | null | undefined) => {
    if (n == null) return "0";
    return Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
};

/* โ”€โ”€ Page Component โ”€โ”€ */
export default function ProjectCostPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showWarning } = useMessages();

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "projectName", label: t('Project', 'Project'), sortable: true },
    { key: "clientName", label: t('Client Name', 'Client Name'), sortable: true },
    { key: "startDate", label: t('Start Date', 'Start Date'), sortable: true },
    { key: "endDate", label: t('End Date', 'End Date'), sortable: true },
    { key: "budgetProject", label: t('Budget', 'Budget'), sortable: true },
    { key: "totalCost", label: t('Total Cost', 'Total Cost'), sortable: true },
    { key: "mdPerMonth", label: t('MD/Month', 'MD/Month'), sortable: true },
    { key: "teamCount", label: t('Team', 'Team'), sortable: true },
    { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ];

    const queryClient = useQueryClient();
    const userProfile = getUserProfile();

    // โ”€โ”€ Search form state โ”€โ”€
    const [searchProject, setSearchProject] = useState<number | null>(null);
    const [searchClient, setSearchClient] = useState<number | null>(null);
    const [searchStartDate, setSearchStartDate] = useState("");
    const [searchEndDate, setSearchEndDate] = useState("");

    // โ”€โ”€ Table state โ”€โ”€
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [modalOpen, setModalOpen] = useState(false);

    // โ”€โ”€ Data fetching โ”€โ”€
    const { data: costData, isLoading, refetch } = useQuery({
        queryKey: ["projectCost", searchProject, searchClient, searchStartDate, searchEndDate],
        queryFn: async () => {
            const { data } = await apiClient.post<{ data: ProjectCostRow[]; totalData: number }>(
                "projectCost/get-all",
                {
                    projectId: searchProject,
                    clientId: searchClient,
                    startDate: searchStartDate || null,
                    endDate: searchEndDate || null,
                }
            );
            return data;
        },
    });

    const { data: allProjects } = useQuery({
        queryKey: ["allProjects"],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data: any[] }>("projects/getAllProject");
            return (data?.data || []) as any[];
        },
    });

    const { data: clientLst } = useQuery({
        queryKey: ["allClients"],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data: any[] }>("client/getAllClient");
            return (data?.data || []) as any[];
        },
    });

    // โ”€โ”€ Delete mutation โ”€โ”€
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete<{ message: string }>(`projectCost/delete?id=${id}`);
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["projectCost"] });
            showSuccess('SAVE_SUCCESS', 'Success!', res?.message || "Deleted");
        },
        onError: () => {
            showError('SAVE_ERROR', 'Error!', 'Error deleting project cost');
        },
    });

    // โ”€โ”€ Save mutation โ”€โ”€
    const saveMutation = useMutation({
        mutationFn: async (payload: unknown) => {
            const { data } = await apiClient.post<{ message: string }>("projectCost/update", payload);
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["projectCost"] });
            showSuccess('SAVE_SUCCESS', 'Success!', res?.message || "Saved");
            setModalOpen(false);
            resetFormState();
        },
        onError: () => {
            showError('SAVE_ERROR', 'Error!', 'Error saving Project.');
        },
    });

    // โ”€โ”€ react-hook-form โ”€โ”€
    const { register, handleSubmit, reset, setValue, control, getValues, watch } = useForm<ProjectCostForm>({
        defaultValues: {
            costId: 0, projectId: null, budgetProject: 0,
            totalCost: 0, mdPerMonth: 0, clientId: 0,
            startDate: "", endDate: "", costDetail: [],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "costDetail" });

    // โ”€โ”€ Reset form โ”€โ”€
    const resetFormState = useCallback(() => {
        reset({
            costId: 0, projectId: null, budgetProject: 0,
            totalCost: 0, mdPerMonth: 0, clientId: 0,
            startDate: "", endDate: "", costDetail: [],
        });
    }, [reset]);

    // โ”€โ”€ Calc header totals โ”€โ”€
    const calcHeaderTotal = useCallback(() => {
        const details = getValues("costDetail");
        let totalCost = 0;
        let totalMDProject = 0;

        details.forEach((r) => {
            totalCost += (Number(r.totalCost) || 0) + (Number(r.extraCost) || 0);
            totalMDProject += Number(r.mdProject) || 0;
        });

        setValue("totalCost", totalCost);
        setValue("mdPerMonth", totalMDProject);
    }, [getValues, setValue]);

    // โ”€โ”€ Calc row โ”€โ”€
    const calcRow = useCallback((index: number) => {
        const detail = getValues(`costDetail.${index}`);
        const costPerDay = Number(detail.costPerDay) || 0;
        const mdProject = Number(detail.mdProject) || 0;
        const mdUsed = Number(detail.mdUsed) || 0;

        const totalCost = costPerDay * mdProject;
        const remainMd = mdProject - mdUsed;
        const extraCost = mdUsed > mdProject ? costPerDay * (mdUsed - mdProject) : 0;

        setValue(`costDetail.${index}.totalCost`, totalCost);
        setValue(`costDetail.${index}.remainMd`, remainMd);
        setValue(`costDetail.${index}.extraCost`, extraCost);

        calcHeaderTotal();
    }, [getValues, setValue, calcHeaderTotal]);

    // โ”€โ”€ onProjectChange โ”€โ”€
    const onProjectChange = useCallback((projectId: number) => {
        if (!projectId || !allProjects) return;
        const project = allProjects.find((p: any) => Number(p.projectId) === projectId);
        if (!project) return;

        setValue("clientId", Number(project.client) || 0);
        setValue("startDate", project.startDate ? new Date(project.startDate).toISOString() : "");
        setValue("endDate", project.deadline ? new Date(project.deadline).toISOString() : "");

        // Clear existing detail rows
        const currentDetails = getValues("costDetail");
        for (let i = currentDetails.length - 1; i >= 0; i--) {
            remove(i);
        }

        // Add team lead
        if (project.teamLead) {
            append({
                costDetailId: 0,
                employeeId: Number(project.teamLead.id) || 0,
                employeeCode: project.teamLead.employeeId || "",
                employeeName: `${project.teamLead.firstNameEn || ""} ${project.teamLead.lastNameEn || ""}`.trim(),
                designationCode: project.designationCode || "",
                costPerDay: 0, mdProject: 0, totalCost: 0,
                mdUsed: 0, remainMd: 0, extraCost: 0,
            });
        }

        // Add team members
        (project.team || []).forEach((m: any) => {
            append({
                costDetailId: 0,
                employeeId: Number(m.id) || 0,
                employeeCode: m.employeeId || "",
                employeeName: `${m.firstNameEn || ""} ${m.lastNameEn || ""}`.trim(),
                designationCode: m.designationCode || "",
                costPerDay: 0, mdProject: 0, totalCost: 0,
                mdUsed: 0, remainMd: 0, extraCost: 0,
            });
        });
    }, [allProjects, setValue, getValues, remove, append]);

    // โ”€โ”€ Open Add โ”€โ”€
    const openAdd = () => {
        resetFormState();
        setModalOpen(true);
    };

    // โ”€โ”€ Open Edit โ”€โ”€
    const openEdit = async (costId: number) => {
        if (!costId || costId <= 0) return;
        try {
            const { data: res } = await apiClient.get<{ success: boolean; data: ProjectCostForm }>(`projectCost/getCost/${costId}`);
            if (!res?.success || !res.data) return;
            const d = res.data;
            reset({
                costId: d.costId,
                projectId: d.projectId,
                budgetProject: d.budgetProject,
                totalCost: d.totalCost,
                mdPerMonth: d.mdPerMonth,
                clientId: d.clientId,
                startDate: d.startDate || "",
                endDate: d.endDate || "",
                costDetail: d.costDetail || [],
            });
            calcHeaderTotal();
            setModalOpen(true);
        } catch {
            showError('SAVE_ERROR', 'Error!', 'Error loading cost data');
        }
    };

    // โ”€โ”€ Submit โ”€โ”€
    const onSubmit = (formData: ProjectCostForm) => {
        saveMutation.mutate({ ...formData, username: userProfile });
    };

    // โ”€โ”€ Confirm Delete โ”€โ”€
    const confirmDelete = (id: number) => {
        showWarning('REQUIRED_FIELDS', 'Delete Project Cost', 'Are you sure want to delete?').then((result) => {
            if (result.isConfirmed) deleteMutation.mutate(id);
        });
    };

    // โ”€โ”€ Search / Clear โ”€โ”€
    const handleSearch = () => {
        setCurrentPage(1);
        refetch();
    };

    const clearSearch = () => {
        setSearchProject(null);
        setSearchClient(null);
        setSearchStartDate("");
        setSearchEndDate("");
        setCurrentPage(1);
    };

    // โ”€โ”€ Sort โ”€โ”€
    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
    };

    // โ”€โ”€ Filtered / Sorted / Paginated โ”€โ”€
    const { paginatedData, totalData, totalPages, safePage } = useMemo(() => {
        const allItems: ProjectCostRow[] = costData?.data || [];
        const source = Array.isArray(allItems) ? allItems : [];
        const sortedData = [...source].sort((a: any, b: any) => {
            if (!sortKey) return 0;
            const aVal = a[sortKey] ?? "";
            const bVal = b[sortKey] ?? "";
            return (aVal < bVal ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
        });

        const total = sortedData.length;
        const pages = Math.max(1, Math.ceil(total / pageSize));
        const safe = Math.min(currentPage, pages);
        const start = (safe - 1) * pageSize;
        const paginated = sortedData.slice(start, start + pageSize);

        return { paginatedData: paginated, totalData: total, totalPages: pages, safePage: safe };
    }, [costData, sortKey, sortDir, pageSize, currentPage]);

    const watchClientId = watch("clientId");
    const watchStartDate = watch("startDate");
    const watchEndDate = watch("endDate");

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Project Cost', 'Project Cost')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard }, { label: t('Project Cost', 'Project Cost') }]}
                actionLabel={t('Add', 'Add')}
                onAction={openAdd}
            />

            {/* Search Filter */}
            <div className={ui.tableWrapper + " mb-6 !overflow-visible"}>
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <FormField label={t('Project Name', 'Project Name')}>
                            <select value={searchProject || ""} onChange={(e) => setSearchProject(e.target.value ? Number(e.target.value) : null)}
                                className={ui.select}>
                                <option value="">{t('Select Project', 'Select Project')}</option>
                                {allProjects?.map((p: any) => (
                                    <option key={p.projectId} value={p.projectId}>
                                        {p.projectCode}: {p.project || p.projectName}
                                    </option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label={t('Client', 'Client')}>
                            <select value={searchClient || ""} onChange={(e) => setSearchClient(e.target.value ? Number(e.target.value) : null)}
                                className={ui.select}>
                                <option value="">{t('Select Client', 'Select Client')}</option>
                                {clientLst?.map((c: any) => (
                                    <option key={c.clientId} value={c.clientId}>
                                        {c.clientCode}: {c.company || c.companyNameEn}
                                    </option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label={t('Start Date', 'Start Date')}>
                            <input type="date" value={searchStartDate} onChange={(e) => setSearchStartDate(e.target.value)} className={ui.input} />
                        </FormField>
                        <FormField label={t('End Date', 'End Date')}>
                            <input type="date" value={searchEndDate} onChange={(e) => setSearchEndDate(e.target.value)} className={ui.input} />
                        </FormField>
                    </div>
                    <div className="flex gap-3 justify-end">
                        <button onClick={handleSearch} className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-nv-violet-dark transition">
                            Search
                        </button>
                        <button onClick={clearSearch} className={ui.btnSecondary}>
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
                <ImportExcelButton
                    columns={[
                        { header: "Project ID", key: "projectId", required: true },
                        { header: "Budget Project", key: "budgetProject", required: true },
                        { header: "MD Per Month", key: "mdPerMonth" },
                    ]}
                    filenamePrefix="project_cost"
                    onImport={async (rows) => {
                        let success = 0, failed = 0;
                        for (const row of rows) {
                            try {
                                await apiClient.post("projectCost/update", {
                                    costId: 0,
                                    projectId: Number(row.projectId) || 0,
                                    budgetProject: Number(row.budgetProject) || 0,
                                    totalCost: 0,
                                    mdPerMonth: Number(row.mdPerMonth) || 0,
                                    clientId: 0,
                                    startDate: "",
                                    endDate: "",
                                    costDetail: [],
                                    username: userProfile,
                                });
                                success++;
                            } catch { failed++; }
                        }
                        return { success, failed };
                    }}
                    onImportComplete={() => queryClient.invalidateQueries({ queryKey: ["projectCost"] })}
                />
            </div>
            <div className={ui.tableWrapper}>
                <TableHeaderBar
                    pageSize={pageSize}
                    onPageSizeChange={(v) => { setPageSize(v); setCurrentPage(1); }}
                />

                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="overflow-x-auto">
                        <table className={ui.table + " min-w-[1000px]"}>
                            <thead className={ui.thead}>
                                <tr>
                                    {tableColumns.map((col) => (
                                        <SortableTh key={col.key} column={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                    ))}
                                </tr>
                            </thead>
                            <tbody className={ui.tbody}>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item) => (
                                        <tr key={item.costId} className={ui.tr}>
                                            <td className={ui.tdIndex}>{item.costId}</td>
                                            <td className={ui.td}>{item.projectName}</td>
                                            <td className={ui.td}>{item.clientName}</td>
                                            <td className={ui.td}>{fmtDate(item.startDate)}</td>
                                            <td className={ui.td}>{fmtDate(item.endDate)}</td>
                                            <td className={ui.td}>{fmtNumber(item.budgetProject)} ฿</td>
                                            <td className={ui.td}>{fmtNumber(item.totalCost)} ฿</td>
                                            <td className={ui.td}>{item.mdPerMonth} MD</td>
                                            <td className={ui.td}>
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                                                    <Users className="w-3.5 h-3.5" /> {item.teamCount ?? 0}
                                                </span>
                                            </td>
                                            <td className={ui.tdActions}>
                                                <ActionButtons onEdit={() => openEdit(item.costId)} onDelete={() => confirmDelete(item.costId)} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <EmptyState colSpan={10} />
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

            {/* โ”€โ”€ Add/Edit Modal โ”€โ”€ */}
            <ModalWrapper
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={t('Project Cost', 'Project Cost')}
                maxWidth="max-w-5xl"
                footer={
                    <>
                        <button type="button" onClick={() => setModalOpen(false)} className={ui.btnSecondary}>{t('Cancel', 'Cancel')}</button>
                        <button type="button" onClick={handleSubmit(onSubmit)} disabled={saveMutation.isPending} className={ui.btnPrimary}>
                            {saveMutation.isPending ? "Saving..." : "Submit"}
                        </button>
                    </>
                }
            >
                <form className="space-y-5">
                    <input type="hidden" {...register("costId")} />

                    {/* Row 1: Project + Client */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={t('Project Name', 'Project Name')} required>
                                <select
                                    value={watch("projectId") ?? ""}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setValue("projectId", val || null);
                                        if (val) onProjectChange(val);
                                    }}
                                    className={ui.select}
                                >
                                    <option value="">{t('Select Project', 'Select Project')}</option>
                                    {allProjects?.map((p: any) => (
                                        <option key={p.projectId} value={p.projectId}>
                                            {p.projectCode}: {p.project || p.projectName}
                                        </option>
                                    ))}
                                </select>
                            </FormField>
                            <FormField label={t('Client Name', 'Client Name')}>
                                <select value={watchClientId || ""} disabled className={ui.inputDisabled}>
                                    <option value="">{t('Select Client', 'Select Client')}</option>
                                    {clientLst?.map((c: any) => (
                                        <option key={c.clientId} value={c.clientId}>
                                            {c.clientCode}: {c.company || c.companyNameEn}
                                        </option>
                                    ))}
                                </select>
                                <input type="hidden" {...register("clientId")} />
                            </FormField>
                        </div>

                        {/* Row 2: Budget + Total Cost + MD/Month */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <FormField label={t('Budget Project', 'Budget Project')}>
                                <input type="number" {...register("budgetProject", { valueAsNumber: true })} className={ui.input} />
                            </FormField>
                            <FormField label={t('Total Cost', 'Total Cost')}>
                                <input type="number" {...register("totalCost")} disabled className={ui.inputDisabled + " font-semibold"} />
                            </FormField>
                            <FormField label={t('MD/Month', 'MD/Month')}>
                                <input type="number" {...register("mdPerMonth")} disabled className={ui.inputDisabled} />
                            </FormField>
                        </div>

                        {/* Row 3: Start Date + End Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <FormField label={t('Start Date', 'Start Date')}>
                                <input type="text" value={fmtDate(watchStartDate)} disabled className={ui.inputDisabled} />
                                <input type="hidden" {...register("startDate")} />
                            </FormField>
                            <FormField label={t('End Date', 'End Date')}>
                                <input type="text" value={fmtDate(watchEndDate)} disabled className={ui.inputDisabled} />
                                <input type="hidden" {...register("endDate")} />
                            </FormField>
                        </div>
                    </div>

                    {/* Cost Detail Table */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b">Project Cost Detail</h4>
                        <div className="overflow-x-auto border rounded-lg">
                            <table className={ui.table + " min-w-[900px]"}>
                                <thead className={ui.thead}>
                                    <tr className="text-left text-xs font-semibold text-gray-600 uppercase">
                                        <th className="px-3 py-2.5 w-10">#</th>
                                        <th className="px-3 py-2.5">{t('Employee', 'Employee')}</th>
                                        <th className="px-3 py-2.5">{t('Role', 'Role')}</th>
                                        <th className="px-3 py-2.5">{t('Cost/Day', 'Cost/Day')}</th>
                                        <th className="px-3 py-2.5">{t('MD Project', 'MD Project')}</th>
                                        <th className="px-3 py-2.5">{t('Total Cost', 'Total Cost')}</th>
                                        <th className="px-3 py-2.5">{t('MD Used', 'MD Used')}</th>
                                        <th className="px-3 py-2.5">{t('Remain MD', 'Remain MD')}</th>
                                        <th className="px-3 py-2.5">{t('Extra Cost', 'Extra Cost')}</th>
                                    </tr>
                                </thead>
                                <tbody className={ui.tbody}>
                                    {fields.map((field, index) => (
                                        <tr key={field.id} className={ui.tr}>
                                            <td className="px-3 py-2 text-center text-gray-500">{index + 1}</td>
                                            <td className="px-3 py-2 text-gray-800">
                                                {field.employeeName}
                                                <input type="hidden" {...register(`costDetail.${index}.employeeName`)} />
                                                <input type="hidden" {...register(`costDetail.${index}.employeeId`, { valueAsNumber: true })} />
                                                <input type="hidden" {...register(`costDetail.${index}.employeeCode`)} />
                                                <input type="hidden" {...register(`costDetail.${index}.costDetailId`, { valueAsNumber: true })} />
                                            </td>
                                            <td className="px-3 py-2 text-gray-600">
                                                {field.designationCode}
                                                <input type="hidden" {...register(`costDetail.${index}.designationCode`)} />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input type="number" {...register(`costDetail.${index}.costPerDay`, { valueAsNumber: true })}
                                                    onInput={() => calcRow(index)} className="w-24 px-2 py-1.5 border rounded text-sm text-right" />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input type="number" {...register(`costDetail.${index}.mdProject`, { valueAsNumber: true })}
                                                    onInput={() => calcRow(index)} className="w-20 px-2 py-1.5 border rounded text-sm text-right" />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input type="number" {...register(`costDetail.${index}.totalCost`)}
                                                    readOnly className="w-24 px-2 py-1.5 border rounded text-sm text-right bg-gray-50" />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input type="number" {...register(`costDetail.${index}.mdUsed`, { valueAsNumber: true })}
                                                    onInput={() => calcRow(index)} className="w-20 px-2 py-1.5 border rounded text-sm text-right" />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input type="number" {...register(`costDetail.${index}.remainMd`)}
                                                    readOnly className="w-20 px-2 py-1.5 border rounded text-sm text-right bg-gray-50" />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input type="number" {...register(`costDetail.${index}.extraCost`)}
                                                    className="w-24 px-2 py-1.5 border rounded text-sm text-right" />
                                            </td>
                                        </tr>
                                    ))}
                                    {fields.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-6 text-center text-gray-400">
                                                Select project to generate team cost
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </form>
            </ModalWrapper>
        </div>
    );
}
