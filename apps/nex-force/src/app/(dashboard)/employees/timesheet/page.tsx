"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useMessages } from "@/hooks/use-messages";
import { Trash2, Edit, X, Search, FileSpreadsheet, FileText } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useTimesheet, useUpdateTimesheet, useDeleteTimesheet } from "@/hooks/use-timesheet";
import { getUserId, getUserProfile } from "@/lib/auth";
import { usePagination } from "@/hooks/use-pagination";
import type { TimesheetRespond, TimesheetDetailDto } from "@/types/timesheet";
import { useRowSelection } from "@/hooks/use-row-selection";
import { useQueryClient } from "@tanstack/react-query";
import ExportButtons from "@/components/ExportButtons";
import ImportExcelButton from "@/components/ImportExcelButton";
import type { ExportColumn } from "@/lib/table-export";
import {
    PageHeader, FormField, SortableTh, EmptyState, LoadingSpinner, PaginationBar, ui, SelectAllCheckbox, RowCheckbox,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";
import { exportTimesheetExcel, exportTimesheetPDF } from "@/lib/timesheet-export";
import type { CalendarData } from "@/lib/timesheet-export";


function calculateHours(start: string, end: string): number {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    const startTime = (startHour * 60) + startMinute;
    const endTime = (endHour * 60) + endMinute;
    const diffMinutes = endTime - startTime;
    return diffMinutes > 0 ? Number((diffMinutes / 60).toFixed(2)) : 0;
}


const tableSortCols = [
    { key: "employeeName", label: "Employee", sortable: true },
    { key: "clientName", label: "Client", sortable: true },
    { key: "organizationName", label: "Organization", sortable: true },
    { key: "workDate", label: "Work Date", sortable: true },
    { key: "projectName", label: "Project", sortable: true },
    { key: "jobType", label: "Job Type", sortable: true },
    { key: "totalWorkHours", label: "Work Hours", sortable: true },
    { key: "totalOtHours", label: "OT Hours", sortable: true },
];

export default function TimesheetPage() {
    const { t } = usePageTranslation();
    const queryClient = useQueryClient();
    const { showSuccess, showError, showConfirm, showWarning } = useMessages();
 
    const exportColumns: ExportColumn[] = useMemo(() => [
    { header: t('Employee', 'Employee'), key: "employeeName" },
    { header: t('Client', 'Client'), key: "clientName" },
    { header: t('Organization', 'Organization'), key: "organizationName" },
    { header: t('Work Date', 'Work Date'), key: "workDate", format: (v: any) => { if (!v) return ""; try { return format(new Date(v), "dd/MM/yyyy"); } catch { return ""; } } },
    { header: t('Project Code', 'Project Code'), key: "projectCode" },
    { header: t('Project', 'Project'), key: "projectName" },
    { header: t('Job Type', 'Job Type'), key: "jobType" },
    { header: t('Work Hours', 'Work Hours'), key: "totalWorkHours" },
    { header: t('OT Hours', 'OT Hours'), key: "totalOtHours" },
    ], [t]);

    const empId = getUserId();
    const userId = Number(empId) || 1;
    const username = getUserProfile() || "user";

    const { data: timesheetData, isLoading: timesheetLoading } = useTimesheet(empId);
    const updateMutation = useUpdateTimesheet();
    const deleteMutation = useDeleteTimesheet();

    const [modalOpen, setModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Queries for dropdowns
    const { data: orgData } = useQuery({
        queryKey: ["masterOrganization"],
        queryFn: async () => { const { data } = await apiClient.get<any>("organizations/getMasterOrganization"); return data; },
    });
    const { data: projectData } = useQuery({
        queryKey: ["projects"],
        queryFn: async () => { const { data } = await apiClient.get<any>("projects/getProject"); return data?.data || []; },
    });
    const { data: jobTypeData } = useQuery({
        queryKey: ["jobTypes"],
        queryFn: async () => { const { data } = await apiClient.get<any>("timesheet/getJobTypes"); return data; },
    });
    const jobTypeLst = jobTypeData || [];

    const { data: myTaskBoardData } = useQuery({
        queryKey: ["myTaskBoard", userId],
        queryFn: async () => { 
            if (!userId) return [];
            const { data } = await apiClient.get<any>(`taskBoard/myTasks/${userId}?includeCompleted=true`); 
            return data || []; 
        },
        enabled: !!userId,
    });

    // Master Tasks (task types)
    const { data: masterTasksRaw } = useQuery({
        queryKey: ["master-tasks"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("tasks");
            const list = Array.isArray(data) ? data : data?.data || [];
            return list;
        },
    });
    const masterTasks = (masterTasksRaw || []).filter((t: any) => t.isActive);

    // Form setup
    const { register, handleSubmit, reset, watch, setValue } = useForm<any>();
    const [detailList, setDetailList] = useState<TimesheetDetailDto[]>([]);
    const { register: registerDetail, handleSubmit: handleSubmitDetail, reset: resetDetail, watch: watchDetail, setValue: setDetailValue } = useForm<TimesheetDetailDto>({
        defaultValues: { isOt: false, actualHours: 0, otHours: 0 }
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const watchProjectId = watch("projectId");
    const watchWorkDate = watch("workDate");
    const watchIsOt = watchDetail("isOt");
    const watchStartTime = watchDetail("startTime");
    const watchEndTime = watchDetail("endTime");
    const watchTaskBoardId = watchDetail("taskBoardId");



    // Dynamic OT list
    const { data: otData } = useQuery({
        queryKey: ["otList", watchProjectId, watchWorkDate],
        queryFn: async () => {
            if (!userId || !watchProjectId || !watchWorkDate) return [];
            const filter = {
                employeeId: userId, projectId: watchProjectId,
                requestDate: new Date(new Date(watchWorkDate).getTime() + 86400000).toISOString(),
            };
            const { data } = await apiClient.post<any>("overtime/getOvertimeByFilter", filter);
            return data?.data || [];
        },
        enabled: !!(userId && watchProjectId && watchWorkDate),
    });

    // Auto-populate workName from taskBoard selection
    useEffect(() => {
        if (watchTaskBoardId && myTaskBoardData) {
            const task = myTaskBoardData.find((t: any) => t.taskBoardId === Number(watchTaskBoardId));
            if (task) {
                setDetailValue("workName", task.title || "");
                setDetailValue("workDescription", task.description || "");
            }
        }
    }, [watchTaskBoardId, myTaskBoardData, setDetailValue]);

    useEffect(() => {
        if (watchProjectId && projectData) {
            const proj = projectData.find((p: any) => p.projectId === Number(watchProjectId));
            setValue("projectDeadline", proj?.endDate ?? null);
        }
    }, [watchProjectId, projectData, setValue]);

    useEffect(() => {
        if (watchStartTime && watchEndTime) {
            const hours = calculateHours(watchStartTime, watchEndTime);
            if (watchIsOt) { setDetailValue("otHours", hours); setDetailValue("actualHours", 0); }
            else { setDetailValue("actualHours", hours); setDetailValue("otHours", 0); }
        }
    }, [watchStartTime, watchEndTime, watchIsOt, setDetailValue]);

    const updateTotalHours = (details: TimesheetDetailDto[]) => {
        let actual = 0, ot = 0;
        details.forEach(item => { actual += item.actualHours || 0; ot += item.otHours || 0; });
        setValue("totalWorkHours", actual); setValue("totalOtHours", ot);
    };

    const handleAddDetail = (data: TimesheetDetailDto) => {
        if (data.isOt) {
            if ((!!data.otId && !!selectedFile) || (!data.otId && !selectedFile)) {
                showWarning('REQUIRED_FIELDS', 'Warning', 'Please select either OT or attach a file—only one option is allowed.');
                return;
            }
        }
        // Ensure numbers are handled correctly
        const cleanData = {
            ...data,
            taskId: data.taskId ? Number(data.taskId) : null,
            taskBoardId: data.taskBoardId ? Number(data.taskBoardId) : null,
            actualHours: Number(data.actualHours),
            otHours: Number(data.otHours),
        };
        const newDetails = [...detailList, { ...cleanData, attFile: selectedFile || null }];
        setDetailList(newDetails); updateTotalHours(newDetails);
        setSelectedFile(null); resetDetail({ isOt: false });
    };

    const removeDetail = (index: number) => {
        const newDetails = detailList.filter((_, i) => i !== index);
        setDetailList(newDetails); updateTotalHours(newDetails);
    };

    const openModal = (item?: TimesheetRespond) => {
        if (item) {
            reset({
                timesheetHeaderId: item.timesheetHeaderId, organizationCode: item.organizationCode,
                projectId: item.projectId, projectDeadline: item.projectDeadline ? new Date(item.projectDeadline).toISOString().split('T')[0] : "",
                workDate: item.workDate ? new Date(item.workDate).toISOString().split('T')[0] : "",
                jobType: item.jobType, totalWorkHours: item.totalWorkHours, totalOtHours: item.totalOtHours,
            });
            setDetailList(item.details || []);
        } else {
            reset({ totalWorkHours: 0, totalOtHours: 0 }); setDetailList([]);
        }
        resetDetail(); setSelectedFile(null); setModalOpen(true);
    };

    const onSubmit = (data: any) => {
        if (detailList.length === 0) { showWarning('REQUIRED_FIELDS', 'Validation Error', 'Please add at least one detail item.'); return; }
        const formData = new FormData();
        const headerFields = {
            timesheetHeaderId: data.timesheetHeaderId || "", employeeId: empId,
            projectId: data.projectId, workDate: data.workDate ? new Date(data.workDate).toISOString() : "",
            projectDeadline: data.projectDeadline ? new Date(data.projectDeadline).toISOString() : "",
            jobType: data.jobType || "", organizationCode: data.organizationCode || "",
            username: username, totalWorkHours: data.totalWorkHours || 0, totalOtHours: data.totalOtHours || 0,
        };
        Object.entries(headerFields).forEach(([k, v]) => formData.append(k, `${v}`));
        detailList.forEach((d, i) => {
            const detailFields = {
                timesheetId: d.timesheetId || 0, workName: d.workName || "",
                startTime: (d.startTime?.length === 5 ? `${d.startTime}:00` : d.startTime) || "",
                endTime: (d.endTime?.length === 5 ? `${d.endTime}:00` : d.endTime) || "",
                actualHours: d.isOt ? "" : (d.actualHours || ""), otHours: d.isOt ? (d.otHours || "") : "",
                workPercentage: d.workPercentage || "", taskId: d.taskId || "",
                taskBoardId: d.taskBoardId || "",
                isOt: d.isOt, workDescription: d.workDescription || "",
                problemDescription: d.problemDescription || "", problemResolve: d.problemResolve || "", otId: d.otId || "",
            };
            Object.entries(detailFields).forEach(([key, value]) => formData.append(`Details[${i}].${key}`, `${value}`));
            if (d.attFile instanceof File) formData.append(`Details[${i}].AttFile`, d.attFile);
        });
        updateMutation.mutate(formData, {
            onSuccess: () => { showSuccess('SAVE_SUCCESS', 'Success!', 'Timesheet saved successfully.'); setModalOpen(false); reset(); setDetailList([]); },
            onError: () => showError('SAVE_ERROR', 'Error!', 'Failed to save timesheet.'),
        });
    };

    const handleDelete = (id: number) => {
        showConfirm('DELETE_CONFIRM', () => {deleteMutation.mutate(id, {
                    onSuccess: (res: any) => { showSuccess('SAVE_SUCCESS', 'Success!', res?.message || "Deleted successfully."); },
                    onError: () => showError('SAVE_ERROR', 'Error!', 'Error deleting Timesheet'),
                });}, { fallbackTitle: 'Delete Timesheet', fallbackMsg: 'Are you sure you want to delete this timesheet?' });
    };

    // โ”€โ”€ Table state โ”€โ”€
    const [searchText, setSearchText] = useState("");
    const [filterEmployee, setFilterEmployee] = useState("");
    const [filterOrg, setFilterOrg] = useState("");
    const [filterProject, setFilterProject] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [sortKey, setSortKey] = useState<string | null>("workDate");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [pageSize, setPageSize] = useState(10);
    const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
    const [exportYear, setExportYear] = useState(new Date().getFullYear());

    const timesheetsList = useMemo(() => timesheetData?.data || [], [timesheetData]);

    const filteredList = useMemo(() => {
        let result = timesheetsList;
        if (filterEmployee) { const q = filterEmployee.toLowerCase(); result = result.filter((r: any) => r.employeeName?.toLowerCase().includes(q)); }
        if (filterOrg) { result = result.filter((r: any) => r.organizationName?.toLowerCase().includes(filterOrg.toLowerCase())); }
        if (filterProject) { result = result.filter((r: any) => r.projectName?.toLowerCase().includes(filterProject.toLowerCase()) || r.projectCode?.toLowerCase().includes(filterProject.toLowerCase())); }
        if (filterDate) { result = result.filter((r: any) => { if (!r.workDate) return false; try { return format(new Date(r.workDate), "yyyy-MM-dd") === filterDate; } catch { return false; } }); }
        if (searchText) { const q = searchText.toLowerCase(); result = result.filter((row: any) => [row.employeeName, row.organizationName, row.projectName, row.clientName, row.jobType].filter(Boolean).some((v: string) => v.toLowerCase().includes(q))); }
        return result;
    }, [timesheetsList, filterEmployee, filterOrg, filterProject, filterDate, searchText]);

    const sortedList = useMemo(() => {
        if (!sortKey) return filteredList;
        return [...filteredList].sort((a: any, b: any) => {
            const aVal = a[sortKey] ?? ""; const bVal = b[sortKey] ?? "";
            return (aVal < bVal ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
        });
    }, [filteredList, sortKey, sortDir]);

    const { paginatedData: paginatedTimesheets, currentPage, totalPages, goToPage, changePageSize: changePgSize } =
        usePagination(sortedList, { pageSize });


    // โ”€โ”€ Row Selection โ”€โ”€
    const getRowId = useCallback((item: any) => item.timesheetHeaderId, []);
    const selection = useRowSelection(paginatedTimesheets, getRowId);
    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    if (!mounted) return null;

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Timesheet', 'Timesheet')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard') }, { label: t('Timesheet', 'Timesheet') }]}
                actionLabel={t('Add timesheet', 'Add timesheet')}
                onAction={() => openModal()}
            />

            {/* โ”€โ”€ Search Filter โ”€โ”€ */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <FormField label={t('Employee', 'Employee')}>
                        <input type="text" value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)} className={ui.input} placeholder="e.g. John" />
                    </FormField>
                    <FormField label={t('Organization', 'Organization')}>
                        <input type="text" value={filterOrg} onChange={(e) => setFilterOrg(e.target.value)} className={ui.input} placeholder="e.g. HQ" />
                    </FormField>
                    <FormField label={t('Project', 'Project')}>
                        <input type="text" value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className={ui.input} placeholder="e.g. HRMS" />
                    </FormField>
                    <FormField label={t('Work Date', 'Work Date')}>
                        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className={ui.input} />
                    </FormField>
                    <div className="flex items-end gap-3">
                        <button type="button" onClick={() => queryClient.invalidateQueries({ queryKey: ["timesheet"] })} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-nv-violet text-white rounded-lg hover:bg-nv-violet-dark transition-all shadow-sm">
                            <Search className="w-4 h-4" /> {t('Search', 'Search')}
                        </button>
                        <button type="button" onClick={() => { setFilterEmployee(""); setFilterOrg(""); setFilterProject(""); setFilterDate(""); setExportMonth(new Date().getMonth() + 1); setExportYear(new Date().getFullYear()); }}
                            className={`flex-1 flex items-center justify-center gap-2 ${ui.btnSecondary}`}>
                            <X className="w-4 h-4" /> {t('Clear', 'Clear')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <ExportButtons data={sortedList} columns={exportColumns} filenamePrefix="timesheet" pdfTitle={t('Timesheet', 'Timesheet')} totalCount={sortedList.length}
                    selectedData={selection.getSelectedRows(sortedList)}
                    selectedCount={selection.selectedCount}
                    onClearSelection={selection.clearSelection}
                />
                <ImportExcelButton
                    columns={[
                        { header: "รหัสหน่วยงาน (Organization Code)", key: "OrganizationCode", required: true },
                        { header: "รหัสโครงการ (Project Code/Name)", key: "ProjectCode", required: true },
                        { header: "วันที่ทำงาน (DD/MM/YYYY)", key: "WorkDate", required: true, type: "date" },
                        { header: `ประเภทงาน (${jobTypeLst.map((j: any) => j.jobType).join('/')})`, key: "JobType", required: true },
                        { header: "หัวข้องาน/ชื่อกิจกรรม (Title)", key: "WorkName", required: true },
                        { header: "เวลาเริ่ม (Start Time HH:mm)", key: "StartTime", required: true },
                        { header: "เวลาสิ้นสุด (End Time HH:mm)", key: "EndTime", required: true },
                        { header: "OT? (Y/N)", key: "IsOt" },
                        { header: "ความคืบหน้า % (Progress %)", key: "WorkPercentage", type: "number" },
                        { header: "รายละเอียดงาน (Description)", key: "WorkDescription" },
                        { header: "ปัญหาที่พบ (Problem)", key: "ProblemDescription" },
                        { header: "แนวทางแก้ไข (Resolution)", key: "ProblemResolve" },
                    ]}
                    filenamePrefix="timesheet"
                    sampleData={(() => {
                        const org = orgData?.[0];
                        const orgCode = org?.organizationCode || "ORG";
                        const proj = projectData?.[0];
                        const projCode = proj?.projectCode || proj?.projectName || "PROJ";
                        const jt = (i: number) => jobTypeLst[i % jobTypeLst.length]?.jobType || "WFH";
                        return [
                        {
                            OrganizationCode: orgCode,
                            ProjectCode: projCode,
                            WorkDate: "01/04/2026",
                            JobType: jt(0),
                            WorkName: "System Analysis",
                            StartTime: "09:00",
                            EndTime: "18:00",
                            IsOt: "N",
                            WorkPercentage: 100,
                            WorkDescription: "Analyze system requirements and design database schema",
                            ProblemDescription: "",
                            ProblemResolve: ""
                        },
                        {
                            OrganizationCode: orgCode,
                            ProjectCode: projCode,
                            WorkDate: "02/04/2026",
                            JobType: jt(1),
                            WorkName: "Client Meeting",
                            StartTime: "13:00",
                            EndTime: "17:00",
                            IsOt: "N",
                            WorkPercentage: 50,
                            WorkDescription: "Meet with clients to discuss project progress",
                            ProblemDescription: "Traffic jam on the way to client site",
                            ProblemResolve: "Used BTS instead of driving"
                        },
                        {
                            OrganizationCode: orgCode,
                            ProjectCode: projCode,
                            WorkDate: "03/04/2026",
                            JobType: jt(0),
                            WorkName: "Bug Fixing & OT",
                            StartTime: "18:00",
                            EndTime: "20:00",
                            IsOt: "Y",
                            WorkPercentage: 80,
                            WorkDescription: "Fix critical bugs in the production environment",
                            ProblemDescription: "Complex logic in the legacy code",
                            ProblemResolve: "Consulted with the technical lead"
                        },
                        {
                            OrganizationCode: orgCode,
                            ProjectCode: projCode,
                            WorkDate: "04/04/2026",
                            JobType: jt(2),
                            WorkName: "Documentation",
                            StartTime: "09:00",
                            EndTime: "18:00",
                            IsOt: "N",
                            WorkPercentage: 100,
                            WorkDescription: "Prepare technical documentation and user manual",
                            ProblemDescription: "",
                            ProblemResolve: ""
                        }
                    ];
                    })()}
                    masterData={(() => {
                        const tables = [];
                        // Organization master
                        const orgs = orgData || [];
                        if (orgs.length > 0) {
                            tables.push({
                                title: "รหัสหน่วยงาน (Organization Code)",
                                headers: ["รหัส (Code)", "ชื่อหน่วยงาน (Name)"],
                                rows: orgs.map((o: any) => [
                                    o.organizationCode || "",
                                    o.organizationName || "",
                                ]),
                            });
                        }
                        // Project master
                        const projs = projectData || [];
                        if (projs.length > 0) {
                            tables.push({
                                title: "โครงการ (Project)",
                                headers: ["รหัส (Code)", "ชื่อโครงการ (Name)"],
                                rows: projs.map((p: any) => [
                                    p.projectCode || p.projectName || "",
                                    p.projectName || "",
                                ]),
                            });
                        }
                        // Job Type master
                        if (jobTypeLst.length > 0) {
                            tables.push({
                                title: "ประเภทงาน (Job Type)",
                                headers: ["รหัส (Code)", "ชื่อ (Name)"],
                                rows: jobTypeLst.map((j: any) => [
                                    j.jobType || "",
                                    j.jobName || j.jobType || "",
                                ]),
                            });
                        }
                        // Task Type master
                        if (masterTasks.length > 0) {
                            tables.push({
                                title: "ประเภทกิจกรรม (Task Type)",
                                headers: ["รหัส (Code)", "ชื่อ TH", "ชื่อ EN"],
                                rows: masterTasks.map((mt: any) => [
                                    mt.taskCode || "",
                                    mt.taskNameTh || "",
                                    mt.taskNameEn || "",
                                ]),
                            });
                        }
                        return tables;
                    })()}
                    onImport={async (rows) => {
                        const payload = rows.map(r => {
                            const start = String(r.StartTime || "00:00");
                            const end = String(r.EndTime || "00:00");
                            const hours = calculateHours(start, end);
                            const isOt = String(r.IsOt || "N").toUpperCase() === "Y";
                            return {
                                ...r,
                                EmployeeId: userId,
                                Username: username,
                                WorkHours: isOt ? 0 : hours,
                                OtHours: isOt ? hours : 0,
                                WorkPercentage: Number(r.WorkPercentage || 0),
                            };
                        });
                        const { data } = await apiClient.post("timesheet/import", payload);
                        return data;
                    }}
                    onImportComplete={() => {
                        queryClient.invalidateQueries({ queryKey: ["timesheet"] });
                        queryClient.invalidateQueries({ queryKey: ["timesheet-events"] });
                        showSuccess('SAVE_SUCCESS', 'Import Complete', 'Timesheet data imported successfully.');
                    }}
                />

                <div className="flex items-center gap-2 ml-auto bg-white border rounded-lg px-3 py-1.5 shadow-sm">
                    <select value={exportMonth} onChange={e => setExportMonth(Number(e.target.value))} className="text-sm border-r pr-2 mr-1 outline-none bg-transparent cursor-pointer">
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                            <option key={m} value={m}>{format(new Date(2024, m-1, 1), 'MMMM')}</option>
                        ))}
                    </select>
                    <select value={exportYear} onChange={e => setExportYear(Number(e.target.value))} className="text-sm border-r pr-2 mr-1 outline-none bg-transparent cursor-pointer">
                        {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <button
                        onClick={async () => {
                            try {
                                const { data: cal } = await apiClient.get<CalendarData>(`timesheet/workingCalendar?month=${exportMonth}&year=${exportYear}&empId=${empId}`);
                                await exportTimesheetExcel(timesheetsList, exportYear, exportMonth, undefined, cal);
                            } catch {
                                await exportTimesheetExcel(timesheetsList, exportYear, exportMonth);
                            }
                        }}
                        className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100 transition font-medium cursor-pointer"
                    >
                        <FileSpreadsheet className="w-4 h-4" /> Excel
                    </button>
                    <button
                        onClick={async () => {
                            try {
                                const { data: cal } = await apiClient.get<CalendarData>(`timesheet/workingCalendar?month=${exportMonth}&year=${exportYear}&empId=${empId}`);
                                await exportTimesheetPDF(timesheetsList, exportYear, exportMonth, undefined, cal);
                            } catch {
                                await exportTimesheetPDF(timesheetsList, exportYear, exportMonth);
                            }
                        }}
                        className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition font-medium cursor-pointer"
                    >
                        <FileText className="w-4 h-4" /> PDF
                    </button>
                </div>
            </div>

            <div className={ui.tableWrapper}>
                <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        Show
                        <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); changePgSize(Number(e.target.value)); }} className="px-2 py-1 border border-gray-200 rounded-md bg-white text-sm">
                            <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option>
                        </select>
                        {t('entries', 'entries')}
                    </div>
                    <input type="text" placeholder={t('Search...', 'Search...')} value={searchText} onChange={(e) => setSearchText(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 w-52" />
                </div>

                <div className="overflow-x-auto">
                    <table className={ui.table}>
                        <thead className={ui.thead}>
                            <tr>
                                    <SelectAllCheckbox checked={selection.allSelected} indeterminate={selection.indeterminate} onChange={selection.toggleAll} />
                                {tableSortCols.map((col) => (
                                    <SortableTh key={col.key} column={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                ))}
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('Actions', 'Actions')}</th>
                            </tr>
                        </thead>
                        <tbody className={ui.tbody}>
                            {timesheetLoading ? (
                                <tr><td colSpan={10}><LoadingSpinner /></td></tr>
                            ) : paginatedTimesheets.length === 0 ? (
                                <tr><td colSpan={10}><EmptyState message={t('No data found', 'No data found')} /></td></tr>
                            ) : (
                            paginatedTimesheets.map((item: any) => (
                                <tr key={item.timesheetHeaderId} className={selection.isSelected(item.timesheetHeaderId) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(item.timesheetHeaderId)} onChange={() => selection.toggle(item.timesheetHeaderId)} />
                                    <td className="px-4 py-3 font-medium text-gray-900">{item.employeeName}</td>
                                    <td className={ui.td}>{item.clientName || "—"}</td>
                                    <td className={ui.td}>{item.organizationName}</td>
                                    <td className={ui.td}>{item.workDate ? format(new Date(item.workDate), "dd/MM/yyyy") : ""}</td>
                                    <td className="px-4 py-3 font-medium text-gray-800">{item.projectName}</td>
                                    <td className="px-4 py-3 text-center">
                                        {item.jobType ? (
                                            <span className="bg-nv-violet-light text-nv-violet-dark px-2.5 py-1 rounded text-xs font-medium">{item.jobType}</span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">{item.totalWorkHours}</td>
                                    <td className="px-4 py-3">{item.totalOtHours}</td>
                                    <td className={ui.tdActions}>
                                        <button onClick={() => openModal(item)} className="p-1.5 text-gray-400 hover:text-nv-violet hover:bg-nv-violet-light rounded-md transition">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(item.timesheetHeaderId)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                            )}
                        </tbody>
                    </table>
                </div>

                <PaginationBar currentPage={currentPage} totalPages={totalPages} totalData={sortedList.length} pageSize={pageSize} onGoToPage={goToPage} />
            </div>

            {/* โ”€โ”€ Modal for Add / Edit โ”€โ”€ */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-bold text-gray-800">{t('Timesheet Details', 'Timesheet Details')}</h3>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                            {/* HEADER SECTION */}
                            <form className="bg-white p-5 rounded-lg border border-gray-200 mb-6 shadow-sm">
                                <h4 className="font-semibold text-gray-800 mb-4 pb-2 border-b">{t('General Information', 'General Information')}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <FormField label={t('Organization', 'Organization')} required>
                                        <select {...register("organizationCode", { required: true })} className={ui.select}>
                                            <option value="">{t('Select Organization', 'Select Organization')}</option>
                                            {orgData?.map((o: any, idx: number) => (
                                                <option key={o.organizationId || o.organizationCode || idx} value={o.organizationCode}>
                                                    {o.organizationCode ? `${o.organizationCode}: ` : ""}{o.organizationName}
                                                </option>
                                            ))}
                                        </select>
                                    </FormField>
                                    <FormField label={t('Project', 'Project')} required>
                                        <select {...register("projectId", { required: true })} className={ui.select}>
                                            <option value="">{t('Select Project', 'Select Project')}</option>
                                            {projectData?.map((p: any) => <option key={p.projectId} value={p.projectId}>{p.projectCode ? `${p.projectCode}: ` : ""}{p.projectName}</option>)}
                                        </select>
                                    </FormField>
                                    <FormField label={t('Project Deadline', 'Project Deadline')}>
                                        <input className={ui.inputDisabled} type="date" {...register("projectDeadline")} disabled />
                                    </FormField>
                                    <FormField label={t('Work Date', 'Work Date')} required>
                                        <input className={ui.input} type="date" {...register("workDate", { required: true })} />
                                    </FormField>
                                    <FormField label={t('Job Type', 'Job Type')}>
                                        <select {...register("jobType")} className={ui.select}>
                                            <option value="">{t('Select Job Type', 'Select Job Type')}</option>
                                            {jobTypeLst.map((j: any) => <option key={j.jobType} value={j.jobType}>{j.jobType}: {j.jobName}</option>)}
                                        </select>
                                    </FormField>
                                    <FormField label={t('Total Work Hours', 'Total Work Hours')}>
                                        <input className={ui.inputDisabled} type="number" {...register("totalWorkHours")} readOnly />
                                    </FormField>
                                    <FormField label={t('Total OT Hours', 'Total OT Hours')}>
                                        <input className={ui.inputDisabled} type="number" {...register("totalOtHours")} readOnly />
                                    </FormField>
                                </div>
                            </form>

                            {/* DETAILS INPUT SECTION */}
                            <form onSubmit={handleSubmitDetail(handleAddDetail)} className="bg-white p-5 rounded-lg border border-gray-200 mb-6 shadow-sm">
                                <h4 className="font-semibold text-gray-800 mb-4 pb-2 border-b">{t('Add Task Detail', 'Add Task Detail')}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <FormField label={t('Task (from Board)', 'Task (from Board)')}>
                                        <select {...registerDetail("taskBoardId")} className={`${ui.select} border-nv-violet/30 bg-nv-violet/5`}>
                                            <option value="">{t('-- Select Task from Board --', '-- Select Task from Board --')}</option>
                                            {(() => {
                                                const tasks = (myTaskBoardData || []).filter((tb: any) => !watchProjectId || tb.projectId === Number(watchProjectId));
                                                const grouped: Record<string, any[]> = {};
                                                tasks.forEach((tb: any) => {
                                                    const sprint = tb.sprintName || 'No Sprint';
                                                    if (!grouped[sprint]) grouped[sprint] = [];
                                                    grouped[sprint].push(tb);
                                                });
                                                const priorityIcon: Record<string, string> = { High: '🔴', Medium: '🟡', Low: '🟢' };
                                                const statusIcon: Record<string, string> = { pending: '⏳', progress: '🔵', review: '🟣', hold: '⏸️', completed: '✅' };
                                                return Object.entries(grouped).map(([sprint, items]) => (
                                                    <optgroup key={sprint} label={`🏃 ${sprint} (${items.length})`}>
                                                        {items.map((tb: any) => (
                                                            <option key={tb.taskBoardId} value={tb.taskBoardId}>
                                                                {statusIcon[tb.status] || '⚪'} {priorityIcon[tb.priority] || '⚪'} {tb.projectName}: {tb.title}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                ));
                                            })()}
                                        </select>
                                    </FormField>
                                    <FormField label={t('Task Type', 'Task Type')}>
                                        <select {...registerDetail("taskId")} className={ui.select}>
                                            <option value="">{t('-- No task type --', '-- No task type --')}</option>
                                            {masterTasks.map((mt: any) => (
                                                <option key={mt.taskId} value={mt.taskId}>
                                                    {mt.taskCode} — {mt.taskNameTh}{mt.taskNameEn ? ` (${mt.taskNameEn})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </FormField>
                                    <div className="md:col-span-2">
                                        <FormField label={t('Work Name', 'Work Name')} required>
                                            <div className="relative">
                                                <input className={ui.input} {...registerDetail("workName", { required: true })} />
                                                {watchTaskBoardId && <span className="absolute right-3 top-2.5 text-[10px] bg-nv-violet/10 text-nv-violet px-1.5 py-0.5 rounded font-bold uppercase">Auto-filled</span>}
                                            </div>
                                        </FormField>
                                    </div>
                                    <FormField label={t('Start Time', 'Start Time')} required>
                                        <input className={ui.input} type="time" {...registerDetail("startTime", { required: true })} />
                                    </FormField>
                                    <FormField label={t('End Time', 'End Time')} required>
                                        <input className={ui.input} type="time" {...registerDetail("endTime", { required: true })} />
                                    </FormField>
                                    <FormField label={t('Work Percentage', 'Work Percentage')}>
                                        <input className={ui.input} type="number" {...registerDetail("workPercentage")} min={0} max={100} />
                                    </FormField>
                                    <div className="flex items-center mt-6 gap-3">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" id="isOtCheck" {...registerDetail("isOt")} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nv-danger"></div>
                                        </label>
                                        <label htmlFor="isOtCheck" className="text-sm font-medium text-gray-700">{t('Request Overtime?', 'Request Overtime?')}</label>
                                    </div>
                                    <FormField label={t('Actual Hours', 'Actual Hours')}>
                                        <input className={ui.inputDisabled} type="number" {...registerDetail("actualHours")} disabled />
                                    </FormField>
                                    <FormField label={t('Overtime Hours', 'Overtime Hours')}>
                                        <input className={ui.inputDisabled} type="number" {...registerDetail("otHours")} disabled />
                                    </FormField>
                                </div>

                                {watchIsOt && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-orange-50 p-4 rounded-lg border border-orange-100">
                                        <FormField label={t('Overtime ID', 'Overtime ID')}>
                                            <select {...registerDetail("otId")} className={ui.select}>
                                                <option value="">{t('Select Overtime Request', 'Select Overtime Request')}</option>
                                                {otData?.map((ot: any) => <option key={ot.overtimeId} value={ot.overtimeId}>{ot.project}: {ot.comments}</option>)}
                                            </select>
                                        </FormField>
                                        <FormField label={t('Attachment File', 'Attachment File')}>
                                            <input className={ui.input} type="file" onChange={(e: any) => { if (e.target.files && e.target.files.length > 0) setSelectedFile(e.target.files[0]); }} />
                                        </FormField>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="md:col-span-2">
                                        <FormField label={t('Work Description', 'Work Description')} required>
                                            <textarea {...registerDetail("workDescription", { required: true })} rows={2} className={ui.textarea}></textarea>
                                        </FormField>
                                    </div>
                                    <FormField label={t('Problem Description', 'Problem Description')}>
                                        <textarea {...registerDetail("problemDescription")} rows={2} className={ui.textarea}></textarea>
                                    </FormField>
                                    <FormField label={t('Problem Resolve', 'Problem Resolve')}>
                                        <textarea {...registerDetail("problemResolve")} rows={2} className={ui.textarea}></textarea>
                                    </FormField>
                                </div>

                                <div className="flex justify-end">
                                    <button className="px-5 py-2.5 rounded-lg bg-nv-violet text-white hover:bg-nv-violet-dark text-sm font-medium transition-all shadow-sm hover:shadow-md" type="submit">+ {t('Add Task Detail', 'Add Task Detail')}</button>
                                </div>
                            </form>

                            {/* DETAILS TABLE */}
                            <div className={ui.tableWrapper}>
                                <table className="w-full text-sm">
                                    <thead className={ui.thead}>
                                        <tr>
                                            {["#", "Work Name", "Time", "Actual", "OT", "Desc", "Attachment", "Action"].map(h => (
                                                <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className={ui.tbody}>
                                        {detailList.map((dt, i) => {
                                            const linkedTask = dt.taskBoardId ? (myTaskBoardData || []).find((tb: any) => tb.taskBoardId === Number(dt.taskBoardId)) : null;
                                            return (
                                            <tr key={i} className={ui.tr}>
                                                <td className="px-4 py-2">{i + 1}</td>
                                                <td className="px-4 py-2">
                                                    <div className="font-medium">{dt.workName}</div>
                                                    {linkedTask && (
                                                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                            <span className="inline-flex items-center gap-1 text-[10px] text-nv-violet font-semibold bg-nv-violet/10 px-1.5 py-0.5 rounded">
                                                                <Edit className="w-3 h-3" /> Board
                                                            </span>
                                                            {linkedTask.sprintName && (
                                                                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                                                                    🏃 {linkedTask.sprintName}
                                                                </span>
                                                            )}
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                                                linkedTask.priority === 'High' ? 'bg-red-100 text-red-700' :
                                                                linkedTask.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-green-100 text-green-700'
                                                            }`}>
                                                                {linkedTask.priority === 'High' ? '🔴' : linkedTask.priority === 'Medium' ? '🟡' : '🟢'} {linkedTask.priority}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {!linkedTask && dt.taskBoardId && (
                                                        <div className="text-[10px] text-nv-violet font-semibold flex items-center gap-1 mt-0.5">
                                                            <Edit className="w-3 h-3" /> Linked to Task Board
                                                        </div>
                                                    )}
                                                    {dt.taskId && (
                                                        <div className="text-[10px] text-sky-600 font-medium mt-0.5">
                                                            📋 {masterTasks.find((mt: any) => mt.taskId === Number(dt.taskId))?.taskCode || `Task #${dt.taskId}`}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">{dt.startTime} - {dt.endTime}</td>
                                                <td className="px-4 py-2 font-semibold text-gray-700">{dt.actualHours}</td>
                                                <td className="px-4 py-2 font-semibold text-nv-danger">{(dt.otHours || 0) > 0 ? dt.otHours : "-"}</td>
                                                <td className="px-4 py-2 text-gray-500 truncate max-w-[150px]">{dt.workDescription}</td>
                                                <td className="px-4 py-2 text-nv-violet">
                                                    {dt.attFile ? (dt.attFile instanceof File ? dt.attFile.name : 'Attached file') : "-"}
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <button type="button" onClick={() => removeDetail(i)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );})}
                                        {detailList.length === 0 && (
                                            <tr><td colSpan={8}><EmptyState message={t('No details added yet', 'No details added yet')} /></td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button className={ui.btnSecondary} onClick={() => setModalOpen(false)}>{t('Cancel', 'Cancel')}</button>
                            <button className={ui.btnPrimary} onClick={handleSubmit(onSubmit)} disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? t('Saving...', 'Saving...') : t('Submit', 'Submit')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
