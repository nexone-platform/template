"use client";

import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { toast } from "sonner";
import { Trash2, Edit } from "lucide-react";
import apiClient from "@/lib/api-client";
import { ROUTES } from "@/lib/routes";
import {
    PageHeader, ModalWrapper, FormField, EmptyState, ui,
} from "@/components/shared/ui-components";
import {
    useTimesheetEvents,
    useUpdateTimesheet,
} from "@/hooks/use-timesheet";
import { getUserId, getUserProfile } from "@/lib/auth";
import type { TimesheetRespond, TimesheetDetailDto } from "@/types/timesheet";
import { usePageTranslation } from "@/lib/language";

// ─── Helpers ────────────────────────────────────────────────────
function calculateHours(start: string, end: string): number {
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
    const diffMinutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);
    return diffMinutes > 0 ? Number((diffMinutes / 60).toFixed(2)) : 0;
}

function appendSeconds(time: string | null): string {
    if (!time) return "";
    return time.length === 5 ? `${time}:00` : time;
}

// ─── Component ──────────────────────────────────────────────────
export default function CalendarPage() {
    const { t, currentLang } = usePageTranslation();
    const calendarRef = useRef<FullCalendar>(null);
    const empId = getUserId();
    const username = getUserProfile();

    // Track current month/year for event fetching
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    // Fetch calendar events — same API as Angular's loadEvents()
    const { data: events } = useTimesheetEvents(currentMonth, currentYear, Number(empId), currentLang);

    // Mutation for saving timesheets
    const updateMutation = useUpdateTimesheet();

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);

    // ── Angular parity: datesSet handler ──
    // Angular: onDatesChanged uses eventInfo.start.getMonth() + 2 with year adjustment
    const handleDatesSet = (dateInfo: any) => {
        const currentStart = dateInfo.view.currentStart;
        const month = currentStart.getMonth() + 1;
        const year = currentStart.getFullYear();
        
        setCurrentMonth(month);
        setCurrentYear(year);
    };

    // ── Dropdown queries (same as Angular's innitialData) ──
    const { data: orgData } = useQuery({
        queryKey: ["masterOrganization"],
        queryFn: async () => {
            const { data } = await apiClient.get<unknown[]>("organizations/getMasterOrganization");
            return data || [];
        },
    });
    const { data: projectData } = useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data: unknown[] }>("projects/getProject");
            return (data as { data: unknown[] })?.data || [];
        },
    });

    const { data: jobTypeData } = useQuery({
        queryKey: ["jobTypes"],
        queryFn: async () => { const { data } = await apiClient.get<any>("timesheet/getJobTypes"); return data; },
    });
    const jobTypeLst = jobTypeData || [];

    const { data: myTaskBoardData } = useQuery({
        queryKey: ["myTaskBoard", empId],
        queryFn: async () => { 
            if (!empId) return [];
            const { data } = await apiClient.get<any>(`taskBoard/myTasks/${empId}?includeCompleted=true`); 
            return data || []; 
        },
        enabled: !!empId,
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

    // ── Header form (timesheetForm in Angular) ──
    const { register, handleSubmit, reset, watch, setValue } = useForm<Record<string, unknown>>({
        defaultValues: { totalWorkHours: 0, totalOtHours: 0 },
    });
    const [detailList, setDetailList] = useState<TimesheetDetailDto[]>([]);

    // ── Detail form (timesheetDetailForm in Angular) ──
    const {
        register: registerDetail,
        handleSubmit: handleSubmitDetail,
        reset: resetDetail,
        watch: watchDetail,
        setValue: setDetailValue,
    } = useForm<TimesheetDetailDto>({
        defaultValues: { isOt: false, actualHours: 0, otHours: 0 },
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isOt, setIsOt] = useState(false);

    const watchProjectId = watch("projectId");
    const watchWorkDate = watch("workDate");
    const watchIsOt = watchDetail("isOt");
    const watchStartTime = watchDetail("startTime");
    const watchEndTime = watchDetail("endTime");
    const watchTaskBoardId = watchDetail("taskBoardId");

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // Auto-populate workName from taskBoard selection
    useEffect(() => {
        if (watchTaskBoardId && myTaskBoardData) {
            const task = (myTaskBoardData as any[]).find((t: any) => t.taskBoardId === Number(watchTaskBoardId));
            if (task) {
                setDetailValue("workName", task.title || "");
                setDetailValue("workDescription", task.description || "");
            }
        }
    }, [watchTaskBoardId, myTaskBoardData, setDetailValue]);

    // ── OT list based on project + date (Angular: loadOtList) ──
    const { data: otData } = useQuery({
        queryKey: ["otList", watchProjectId, watchWorkDate],
        queryFn: async () => {
            if (!empId || !watchProjectId || !watchWorkDate) return [];
            const filter = {
                employeeId: empId,
                projectId: watchProjectId,
                requestDate: new Date(
                    new Date(watchWorkDate as string).getTime() + 86400000
                ).toISOString(),
            };
            const { data } = await apiClient.post<{ data: unknown[] }>(
                "overtime/getOvertimeByFilter",
                filter
            );
            return (data as { data: unknown[] })?.data || [];
        },
        enabled: !!(empId && watchProjectId && watchWorkDate),
    });

    // ── Project deadline auto-fill (Angular: onProjectIdChange) ──
    useEffect(() => {
        if (watchProjectId && projectData) {
            const proj = (projectData as Record<string, unknown>[]).find(
                (p) => p.projectId === Number(watchProjectId)
            );
            if (proj) {
                setValue("projectDeadline", proj.endDate);
            } else {
                setValue("projectDeadline", null);
            }
        }
    }, [watchProjectId, projectData, setValue]);

    // ── Auto-calc hours when times change (Angular: onTimeChange) ──
    useEffect(() => {
        if (watchStartTime && watchEndTime) {
            const hours = calculateHours(watchStartTime, watchEndTime);
            if (watchIsOt) {
                setDetailValue("otHours", hours);
                setDetailValue("actualHours", 0);
            } else {
                setDetailValue("actualHours", hours);
                setDetailValue("otHours", 0);
            }
        }
    }, [watchStartTime, watchEndTime, watchIsOt, setDetailValue]);

    // ── Sync isOt toggle state ──
    useEffect(() => {
        setIsOt(!!watchIsOt);
    }, [watchIsOt]);

    // ── Update total hours on header form (Angular: updateTotalHours) ──
    const updateTotalHours = (details: TimesheetDetailDto[]) => {
        let actual = 0,
            ot = 0;
        details.forEach((item) => {
            actual += item.actualHours || 0;
            ot += item.otHours || 0;
        });
        setValue("totalWorkHours", actual);
        setValue("totalOtHours", ot);
    };

    // ── Add Detail (Angular: addDetail) ──
    const handleAddDetail = (data: TimesheetDetailDto) => {
        if (data.isOt) {
            const hasOtId = !!data.otId;
            const hasAttFile = !!selectedFile;
            if ((hasOtId && hasAttFile) || (!hasOtId && !hasAttFile)) {
                toast.warning(
                    t('Please select either OT or attach a file', 'Please select either OT or attach a file—only one option is allowed.')
                );
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
        setDetailList(newDetails);
        updateTotalHours(newDetails);
        setSelectedFile(null);
        resetDetail({ isOt: false, actualHours: 0, otHours: 0 });
        setIsOt(false);
    };

    // ── Remove Detail (Angular: removeDetail) ──
    const removeDetail = (index: number) => {
        const newDetails = detailList.filter((_, i) => i !== index);
        setDetailList(newDetails);
        updateTotalHours(newDetails);
    };

    // ── Open the modal (Angular: handleDateSelect + handleEventClick) ──
    const openModal = (item?: TimesheetRespond, selectedDateStr?: string) => {
        if (item) {
            // Angular: patchValue
            reset({
                timesheetHeaderId: item.timesheetHeaderId,
                organizationCode: item.organizationCode,
                projectId: item.projectId,
                projectDeadline: item.projectDeadline
                    ? new Date(item.projectDeadline).toISOString().split("T")[0]
                    : "",
                workDate: item.workDate
                    ? new Date(item.workDate).toISOString().split("T")[0]
                    : "",
                jobType: item.jobType,
                totalWorkHours: item.totalWorkHours,
                totalOtHours: item.totalOtHours,
            });
            setDetailList(item.details || []);
        } else {
            reset({ totalWorkHours: 0, totalOtHours: 0, workDate: selectedDateStr || "" });
            setDetailList([]);
        }
        resetDetail({ isOt: false, actualHours: 0, otHours: 0 });
        setSelectedFile(null);
        setIsOt(false);
        setModalOpen(true);
    };

    // ── Handle event click (Angular: handleEventClick) ──
    const handleEventClick = (clickInfo: { event: { title: string; start: Date | null; extendedProps: Record<string, unknown> } }) => {
        const { event } = clickInfo;
        const headerId = event.extendedProps.timesheetHeaderId as number | undefined;

        if (headerId) {
            // Fetch the full timesheet record and open edit modal
            apiClient
                .get<TimesheetRespond>(`timesheet/${headerId}`)
                .then(({ data }) => {
                    openModal(data);
                })
                .catch(() => {
                    toast.error(t('Error loading timesheet details', 'Error loading timesheet details'));
                });
        } else {
            toast.info(`Event: ${event.title}`, {
                description: `Starts on ${event.start?.toLocaleDateString()}`,
            });
        }
    };

    // ── Handle date select — open blank form (Angular: handleDateSelect) ──
    const handleDateSelect = (info: any) => {
        openModal(undefined, info.startStr);
    };

    // ── Submit form (Angular: onSubmit) ──
    const onSubmit = (data: Record<string, unknown>) => {
        if (detailList.length === 0) {
            toast.warning(t('Please add at least one detail item.', 'Please add at least one detail item.'));
            return;
        }

        const formData = new FormData();
        const headerFields: Record<string, string | number | null | undefined> = {
            timesheetHeaderId: (data.timesheetHeaderId as string) || "",
            employeeId: empId,
            projectId: data.projectId as string,
            workDate: data.workDate
                ? new Date(data.workDate as string).toISOString()
                : "",
            projectDeadline: data.projectDeadline
                ? new Date(data.projectDeadline as string).toISOString()
                : "",
            jobType: (data.jobType as string) || "",
            organizationCode: (data.organizationCode as string) || "",
            username: username,
            totalWorkHours: (data.totalWorkHours as number) || 0,
            totalOtHours: (data.totalOtHours as number) || 0,
        };

        Object.entries(headerFields).forEach(([k, v]) =>
            formData.append(k, `${v ?? ""}`)
        );

        detailList.forEach((d, i) => {
            const detailFields: Record<string, string | number | boolean | undefined> = {
                timesheetId: d.timesheetId || 0,
                workName: d.workName || "",
                startTime: appendSeconds(d.startTime || ""),
                endTime: appendSeconds(d.endTime || ""),
                actualHours: d.isOt ? "" : (d.actualHours || ""),
                otHours: d.isOt ? (d.otHours || "") : "",
                workPercentage: d.workPercentage || "",
                taskId: d.taskId || "",
                taskBoardId: d.taskBoardId || "",
                isOt: d.isOt,
                workDescription: d.workDescription || "",
                problemDescription: d.problemDescription || "",
                problemResolve: d.problemResolve || "",
                otId: d.otId || "",
            };

            Object.entries(detailFields).forEach(([key, value]) => {
                formData.append(`Details[${i}].${key}`, `${value ?? ""}`);
            });

            if (d.attFile instanceof File) {
                formData.append(`Details[${i}].AttFile`, d.attFile);
            }
        });

        updateMutation.mutate(formData, {
            onSuccess: () => {
                toast.success(t('Timesheet saved successfully', 'Timesheet saved successfully'));
                setModalOpen(false);
                reset();
                setDetailList([]);
            },
            onError: () => toast.error(t('Failed to save timesheet', 'Failed to save timesheet')),
        });
    };

    // ── Close modal (Angular: close) ──
    const closeModal = () => {
        setModalOpen(false);
        setDetailList([]);
        reset();
    };

    // ── Map events to FullCalendar format (Angular: loadEvents → formattedEvents) ──
    const formattedEvents = (events || []).map((e: any) => {
        const idStr = e.id?.toString() || "";
        const isAllDay = idStr.startsWith('H-') || idStr.startsWith('S-') || idStr.startsWith('L-');
        
        return {
            id: idStr || Math.random().toString(),
            title: e.title,
            start: e.start,
            end: e.end,
            allDay: isAllDay,
            backgroundColor: e.color || "#3b82f6",
            textColor: e.textColor || "#ffffff",
            extendedProps: {
                timesheetHeaderId: e.timesheetHeaderId || e.TimesheetHeaderId,
                color: e.color,
                textColor: e.textColor,
            },
        };
    });

    // ── File helpers (Angular: getFileUrl, getFileName) ──
    const getFileName = (file: File | string | null | undefined): string => {
        if (!file) return "unknown";
        if (file instanceof File) return file.name;
        return file.split("/").pop() ?? "unknown";
    };

    if (!mounted) return null;

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Events', 'Events')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard }, { label: t('Events', 'Events') }]}
                actionLabel={t('Add', 'Add')}
                onAction={() => openModal()}
            />

            <div className={`${ui.tableWrapper} p-6 min-h-[70vh]`}>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth",
                    }}
                    initialView="dayGridMonth"
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={true}
                    events={formattedEvents}
                    datesSet={handleDatesSet}
                    eventClick={handleEventClick}
                    select={handleDateSelect}
                    eventTimeFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }}
                    displayEventTime={true}
                    height="auto"
                    eventDidMount={(info) => {
                        const bgColor =
                            (info.event.extendedProps.color as string) ||
                            info.event.backgroundColor;
                        const txtColor =
                            (info.event.extendedProps.textColor as string) || "#ffffff";
                        info.el.style.backgroundColor = bgColor;
                        info.el.style.color = txtColor;
                    }}
                />
            </div>

            {/* ── ADD / EDIT TIMESHEET MODAL ── */}
            <ModalWrapper
                open={modalOpen}
                onClose={closeModal}
                title={t('Timesheet Details', 'Timesheet Details')}
                maxWidth="max-w-5xl"
                footer={
                    <>
                        <button className={ui.btnSecondary} onClick={closeModal}>{t('Cancel', 'Cancel')}</button>
                        <button className={ui.btnPrimary} onClick={handleSubmit(onSubmit)} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? t('Saving...', 'Saving...') : t('Save Timesheet', 'Save Timesheet')}
                        </button>
                    </>
                }
            >

                        <div className="space-y-6">
                            {/* ── HEADER FORM (Angular: timesheetForm) ── */}
                            <form className={`${ui.filterCard} space-y-4`}>
                                <h4 className="font-semibold text-gray-800 pb-2 border-b border-gray-100">
                                    {t('General Information', 'General Information')}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <FormField label={t('Organization', 'Organization')} required>
                                        <select {...register("organizationCode", { required: true })} className={ui.select}>
                                            <option value="">{t('Select Organization', 'Select Organization')}</option>
                                            {(orgData as Record<string, unknown>[] | undefined)?.map((o, idx) => (
                                                <option key={`org-${o.organizationCode as string}-${idx}`} value={o.organizationCode as string}>
                                                    {o.organizationCode as string}: {o.organizationName as string}
                                                </option>
                                            ))}
                                        </select>
                                    </FormField>
                                    <FormField label={t('Project', 'Project')} required>
                                        <select {...register("projectId", { required: true })} className={ui.select}>
                                            <option value="">{t('Select Project', 'Select Project')}</option>
                                            {(projectData as Record<string, unknown>[] | undefined)?.map((p, idx) => (
                                                <option key={`proj-${p.projectId as number}-${idx}`} value={p.projectId as number}>
                                                    {p.projectCode ? `${p.projectCode as string}: ` : ""}{p.projectName as string}
                                                </option>
                                            ))}
                                        </select>
                                    </FormField>
                                    <FormField label={t('Project Deadline', 'Project Deadline')}>
                                        <input className={`${ui.input} ${ui.inputDisabled}`} type="date" {...register("projectDeadline")} disabled />
                                    </FormField>
                                    <FormField label={t('Work Date', 'Work Date')} required>
                                        <input className={ui.input} type="date" {...register("workDate", { required: true })} />
                                    </FormField>
                                    <FormField label={t('Job Type', 'Job Type')}>
                                        <select {...register("jobType")} className={ui.select}>
                                            <option value="">{t('Select Job Type', 'Select Job Type')}</option>
                                            {jobTypeLst.map((j: any) => (
                                                <option key={j.jobType} value={j.jobType}>{j.jobType}: {j.jobName}</option>
                                            ))}
                                        </select>
                                    </FormField>
                                    <FormField label={t('Total Work Hours', 'Total Work Hours')}>
                                        <input className={`${ui.input} ${ui.inputDisabled}`} type="number" {...register("totalWorkHours")} readOnly />
                                    </FormField>
                                    <FormField label={t('Total OT Hours', 'Total OT Hours')}>
                                        <input className={`${ui.input} ${ui.inputDisabled}`} type="number" {...register("totalOtHours")} readOnly />
                                    </FormField>
                                </div>
                            </form>

                            {/* ── DETAIL INPUT FORM (Angular: timesheetDetailForm) ── */}
                            <form
                                onSubmit={handleSubmitDetail(handleAddDetail)}
                                className={ui.filterCard}
                            >
                                <h4 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                                    {t('Add Task Detail', 'Add Task Detail')}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    <FormField label={t('Task (from Board)', 'Task (from Board)')}>
                                        <select {...registerDetail("taskBoardId")} className={`${ui.select} border-nv-violet/30 bg-nv-violet/5`}>
                                            <option value="">{t('-- Select Task from Board --', '-- Select Task from Board --')}</option>
                                            {(() => {
                                                const tasks = ((myTaskBoardData as any[]) || []).filter((tb: any) => !watchProjectId || tb.projectId === Number(watchProjectId));
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
                                                            <option key={`task-board-${tb.taskBoardId}`} value={tb.taskBoardId}>
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
                                            <input
                                                type="checkbox"
                                                id="isOtCheck"
                                                {...registerDetail("isOt")}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nv-danger"></div>
                                        </label>
                                        <label
                                            htmlFor="isOtCheck"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            {t('Request Overtime?', 'Request Overtime?')}
                                        </label>
                                    </div>
                                    <FormField label={t('Actual Hours', 'Actual Hours')}>
                                        <input className={`${ui.input} ${ui.inputDisabled}`} type="number" {...registerDetail("actualHours")} disabled />
                                    </FormField>
                                    <FormField label={t('Overtime Hours', 'Overtime Hours')}>
                                        <input className={`${ui.input} ${ui.inputDisabled}`} type="number" {...registerDetail("otHours")} disabled />
                                    </FormField>
                                </div>

                                {/* OT section — only visible when isOt is toggled */}
                                {isOt && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-orange-50 p-4 rounded-lg border border-orange-100">
                                        <FormField label={t('Overtime ID', 'Overtime ID')}>
                                            <select {...registerDetail("otId")} className={ui.select}>
                                                <option value="">{t('Select Overtime Request', 'Select Overtime Request')}</option>
                                                {(otData as Record<string, unknown>[] | undefined)?.map((ot, idx) => (
                                                    <option key={`ot-${ot.overtimeId as number || idx}-${idx}`} value={ot.overtimeId as number}>
                                                        {ot.project as string}: {ot.comments as string}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormField>
                                        <FormField label={t('Attachment File', 'Attachment File')}>
                                            <input className={ui.input} type="file" onChange={(e) => {
                                                if (e.target.files && e.target.files.length > 0) {
                                                    const originalFile = e.target.files[0];
                                                    const extension = originalFile.name.split(".").pop();
                                                    const dateNow = new Date().toISOString().slice(0, 10).replace(/-/g, "");
                                                    const newFileName = `emp-${empId}-${dateNow}.${extension}`;
                                                    setSelectedFile(new File([originalFile], newFileName, { type: originalFile.type }));
                                                }
                                            }} />
                                        </FormField>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="md:col-span-2">
                                        <FormField label={t('Work Description', 'Work Description')} required>
                                            <textarea {...registerDetail("workDescription", { required: true })} rows={2} className={ui.textarea} />
                                        </FormField>
                                    </div>
                                    <FormField label={t('Problem Description', 'Problem Description')}>
                                        <textarea {...registerDetail("problemDescription")} rows={2} className={ui.textarea} />
                                    </FormField>
                                    <FormField label={t('Problem Resolve', 'Problem Resolve')}>
                                        <textarea {...registerDetail("problemResolve")} rows={2} className={ui.textarea} />
                                    </FormField>
                                </div>

                                <div className="flex justify-end">
                                    <button className="px-5 py-2.5 rounded-lg bg-nv-violet text-white hover:bg-nv-violet-dark text-sm font-medium transition-all shadow-sm hover:shadow-md" type="submit">
                                        + {t('Add Task Detail', 'Add Task Detail')}
                                    </button>
                                </div>
                            </form>

                            {/* ── DETAIL TABLE ── */}
                            <div className={ui.tableWrapper}>
                                <table className="w-full text-sm">
                                    <thead className={ui.thead}>
                                        <tr>
                                            {["#", "Work Name", "Time", "Actual", "OT", "Desc", "Attachment", "Action"].map(h => (
                                                <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{t(h, h)}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className={ui.tbody}>
                                        {detailList.map((dt, i) => {
                                            const linkedTask = dt.taskBoardId ? ((myTaskBoardData as any[]) || []).find((tb: any) => tb.taskBoardId === Number(dt.taskBoardId)) : null;
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
                                                    {dt.otId && (
                                                        <span>{dt.project}: {dt.comments}</span>
                                                    )}
                                                    {dt.attFile && !dt.otId && (
                                                        <span>{dt.attFile instanceof File ? dt.attFile.name : 'Attached file'}</span>
                                                    )}
                                                    {!dt.otId && !dt.attFile && "-"}
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
            </ModalWrapper>
        </div>
    );
}
