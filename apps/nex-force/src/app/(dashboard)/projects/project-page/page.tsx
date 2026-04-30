"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Eye, Pencil, Trash2, Upload, Image as ImageIcon, FileText, Search, X, ChevronDown, Check } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import apiClient from "@/lib/api-client";
import { getUserProfile } from "@/lib/auth";
import { useMessages } from "@/hooks/use-messages";
import {
    useProjects,
    useProjectTypes,
    useUpdateProject,
    useDeleteProject,
} from "@/features/projects/hooks/use-projects";
import { usePagination } from "@/hooks/use-pagination";
import { toast } from "sonner";
import {
    PageHeader, ModalWrapper, FormField, LoadingSpinner, EmptyState, PaginationBar, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

interface ProjectForm {
    projectId: number;
    projectName: string;
    description: string;
    startDate: string;
    endDate: string;
    priority: string;
    projectLeader: string;
    team: string;
    client: string;
    rate: number;
    rateType: string;
    projectTypeId: string;
    projectCode: string;
    approver: string;
    auditor: string;
    inchargeName: string;
    ivDate: string;
    ivNo: string;
    timesheetDateStart: number;
    poNo: string;
}

/* ── Multi-select dropdown component ── */
function MultiSelectDropdown({
    options,
    selected,
    onChange,
    placeholder,
    excludeIds = [],
}: {
    options: any[];
    selected: any[];
    onChange: (items: any[]) => void;
    placeholder: string;
    excludeIds?: number[];
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filteredOptions = options.filter((o: any) => !excludeIds.includes(o.id));
    const selectedIds = selected.map((s: any) => s.id);

    const toggle = (emp: any) => {
        if (selectedIds.includes(emp.id)) {
            onChange(selected.filter((s: any) => s.id !== emp.id));
        } else {
            onChange([...selected, emp]);
        }
    };

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`${ui.select} flex items-center justify-between text-left`}
            >
                <span className={selected.length > 0 ? "text-gray-900" : "text-gray-400"}>
                    {selected.length > 0 ? `${selected.length} selected` : placeholder}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {open && (
                <div className="absolute z-30 mt-1 w-full max-h-48 overflow-auto bg-white border rounded-lg shadow-lg">
                    {filteredOptions.map((emp: any) => (
                        <button
                            key={emp.id}
                            type="button"
                            onClick={() => toggle(emp)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                            <span className={`w-4 h-4 rounded border flex items-center justify-center ${selectedIds.includes(emp.id) ? "bg-nv-violet border-nv-violet text-white" : "border-gray-300"}`}>
                                {selectedIds.includes(emp.id) && <Check className="w-3 h-3" />}
                            </span>
                            <span>{emp.firstNameEn} {emp.lastNameEn}</span>
                        </button>
                    ))}
                    {filteredOptions.length === 0 && (
                        <p className="text-xs text-gray-400 px-3 py-2">No options available</p>
                    )}
                </div>
            )}
        </div>
    );
}

/* ── Avatar helper ── */
function AvatarCircle({ name, imgPath, size = "w-7 h-7" }: { name?: string; imgPath?: string; size?: string }) {
    if (imgPath) {
        return <img src={imgPath} alt={name || ""} title={name} className={`${size} rounded-full object-cover border border-gray-200`} />;
    }
    return (
        <div title={name} className={`${size} rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 border border-gray-200`}>
            {(name || "?").charAt(0).toUpperCase()}
        </div>
    );
}

export default function ProjectPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showConfirm } = useMessages();
    const username = getUserProfile();

    const [modalOpen, setModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    // File upload state
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [docFiles, setDocFiles] = useState<File[]>([]);
    const [imagePreviewList, setImagePreviewList] = useState<{ fileId?: number; name: string; url: string }[]>([]);
    const [docPreviewList, setDocPreviewList] = useState<{ fileId?: number; name: string; url: string }[]>([]);
    const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
    const [deletedDocumentIds, setDeletedDocumentIds] = useState<number[]>([]);

    // Team selection state
    const [selectedLeader, setSelectedLeader] = useState<any>(null);
    const [selectedTeamMembers, setSelectedTeamMembers] = useState<any[]>([]);

    // Search state
    const [searchProjectName, setSearchProjectName] = useState("");
    const [searchEmployeeName, setSearchEmployeeName] = useState("");
    const [searchDesignation, setSearchDesignation] = useState("");

    // Data
    const { data, isLoading } = useProjects();
    const { data: projectTypes } = useProjectTypes();
    const updateMutation = useUpdateProject();
    const deleteMutation = useDeleteProject();
    const projects = (data?.data as any[]) ?? [];

    // Employees for leader/team
    const { data: employeeList } = useQuery({
        queryKey: ["employeesAutoComplete"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("employees/getEmployeeForSelect");
            return data?.data || [];
        },
    });

    // Clients
    const { data: clientList } = useQuery({
        queryKey: ["clients"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("client/getAllClient");
            return data?.data || [];
        },
    });

    // Designations for search filter
    const { data: designationList } = useQuery({
        queryKey: ["designations"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("designations/getAllDesignation");
            return data?.data || [];
        },
    });

    // ── Search / Filter ──
    const filteredProjects = useMemo(() => {
        let result = projects;
        if (searchProjectName.trim()) {
            const q = searchProjectName.trim().toLowerCase();
            result = result.filter((p: any) =>
                (p.projectName || p.project || "").toLowerCase().includes(q)
            );
        }
        if (searchEmployeeName.trim()) {
            const q = searchEmployeeName.trim().toLowerCase();
            result = result.filter((p: any) => {
                const leaderName = p.teamLead ? `${p.teamLead.firstNameEn || ""} ${p.teamLead.lastNameEn || ""}`.toLowerCase() : "";
                const teamNames = (p.team || []).map((m: any) => `${m.firstNameEn || ""} ${m.lastNameEn || ""}`.toLowerCase()).join(" ");
                return leaderName.includes(q) || teamNames.includes(q);
            });
        }
        return result;
    }, [projects, searchProjectName, searchEmployeeName]);

    const { paginatedData, currentPage, totalPages, goToPage } = usePagination(filteredProjects);

    const onClearSearch = () => {
        setSearchProjectName("");
        setSearchEmployeeName("");
        setSearchDesignation("");
    };

    const today = new Date().toISOString().split("T")[0];

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectForm>({
        defaultValues: {
            projectId: 0, projectName: "", description: "",
            startDate: today, endDate: today, priority: "",
            projectLeader: "", team: "", client: "",
            rate: 0, rateType: "", projectTypeId: "",
            projectCode: "", approver: "", auditor: "",
            inchargeName: "", ivDate: today, ivNo: "",
            timesheetDateStart: 1, poNo: "",
        },
    });

    const resetFileState = () => {
        setImageFiles([]); setDocFiles([]);
        setImagePreviewList([]); setDocPreviewList([]);
        setDeletedImageIds([]); setDeletedDocumentIds([]);
    };

    const openCreateModal = () => {
        setIsEditMode(false);
        reset({
            projectId: 0, projectName: "", description: "",
            startDate: today, endDate: today, priority: "",
            projectLeader: "", team: "", client: "",
            rate: 0, rateType: "", projectTypeId: "",
            projectCode: "", approver: "", auditor: "",
            inchargeName: "", ivDate: today, ivNo: "",
            timesheetDateStart: 1, poNo: "",
        });
        resetFileState();
        setSelectedLeader(null);
        setSelectedTeamMembers([]);
        setModalOpen(true);
    };

    const openEditModal = async (projectId: number) => {
        setIsEditMode(true);
        try {
            const { data: project } = await apiClient.get<any>(`projects/${projectId}`);
            reset({
                projectId: project.projectId,
                projectName: project.projectName || "",
                description: project.description || "",
                startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : today,
                endDate: project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : today,
                priority: project.priority || "",
                projectLeader: project.projectLeader ? String(project.projectLeader) : "",
                team: project.team || "",
                client: project.client ? String(project.client) : "",
                rate: project.rate || 0,
                rateType: project.rateType || "",
                projectTypeId: project.projectTypeId ? String(project.projectTypeId) : "",
                projectCode: project.projectCode || "",
                approver: project.approver || "",
                auditor: project.auditor || "",
                inchargeName: project.inchargeName || "",
                ivDate: project.ivDate ? new Date(project.ivDate).toISOString().split("T")[0] : "",
                ivNo: project.ivNo || "",
                timesheetDateStart: project.timesheetDateStart || 1,
                poNo: project.poNo || "",
            });

            // Resolve leader
            let leader: any = null;
            if (project.teamLead && employeeList) {
                leader = employeeList.find((e: any) => e.id === project.teamLead.id) || null;
            }
            setSelectedLeader(leader);

            // Resolve team members
            let teamMembers: any[] = [];
            if (project.teamMembers && project.teamMembers.length > 0 && employeeList) {
                const teamIds = project.teamMembers.map((x: any) => x.id);
                teamMembers = employeeList.filter((emp: any) => teamIds.includes(emp.id));
            }
            setSelectedTeamMembers(teamMembers);

            // Load existing files
            resetFileState();
            if (project.files && project.files.length > 0) {
                const imgs: typeof imagePreviewList = [];
                const docs: typeof docPreviewList = [];
                project.files.forEach((f: any) => {
                    const fileObj = {
                        fileId: f.fileId,
                        name: f.originalName,
                        url: (typeof window !== 'undefined' ? window.location.origin : '') + f.filePath,
                    };
                    if (f.fileCategory === 'IMAGE') {
                        imgs.push(fileObj);
                    } else {
                        docs.push(fileObj);
                    }
                });
                setImagePreviewList(imgs);
                setDocPreviewList(docs);
            }

            setModalOpen(true);
        } catch {
            toast.error("Failed to load project data");
        }
    };

    const onSubmit = (formValues: ProjectForm) => {
        const formData = new FormData();

        // Build assignments from selected leader/team
        const assignments: { employeeId: number; roleType: string }[] = [];
        if (selectedLeader?.id) {
            assignments.push({ employeeId: selectedLeader.id, roleType: "LEADER" });
        }
        if (selectedTeamMembers.length > 0) {
            selectedTeamMembers.forEach((m: any) => {
                assignments.push({ employeeId: m.id, roleType: "MEMBER" });
            });
        }

        // team string (backward compat)
        const teamIds = selectedTeamMembers.map((m: any) => m.id).join(",");

        const payload: Record<string, any> = {
            ...formValues,
            projectLeader: selectedLeader?.id || null,
            team: teamIds,
            username: username,
            startDate: formValues.startDate ? new Date(formValues.startDate).toISOString() : null,
            endDate: formValues.endDate ? new Date(formValues.endDate).toISOString() : null,
            ivDate: formValues.ivDate ? new Date(formValues.ivDate).toISOString() : null,
        };

        Object.keys(payload).forEach((key) => {
            const val = payload[key];
            if (val !== null && val !== undefined) {
                formData.append(key, String(val));
            }
        });

        formData.append("assignmentsJson", JSON.stringify(assignments));
        imageFiles.forEach((file) => { formData.append("images", file); });
        docFiles.forEach((file) => { formData.append("documents", file); });
        formData.append("deletedImageIds", JSON.stringify(deletedImageIds));
        formData.append("deletedDocumentIds", JSON.stringify(deletedDocumentIds));

        updateMutation.mutate(formData as any, {
            onSuccess: async () => {
                await showSuccess("SAVE_SUCCESS", "Success", "Project data has been saved successfully.");
                setModalOpen(false);
                reset();
                resetFileState();
                setSelectedLeader(null);
                setSelectedTeamMembers([]);
            },
        });
    };

    const handleDelete = (id: number) => {
        showConfirm('DELETE_CONFIRM', () => {deleteMutation.mutate(id);}, { fallbackTitle: 'Delete Project', fallbackMsg: 'Are you sure you want to delete this project?' });
    };

    const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

    // Image upload handler
    const onImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
        const newFiles: File[] = [];
        const newPreviews: typeof imagePreviewList = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!ALLOWED_TYPES.includes(file.type)) {
                toast.error(`${file.name} must be JPG or PNG.`);
                continue;
            }
            newFiles.push(file);
            newPreviews.push({ name: file.name, url: URL.createObjectURL(file) });
        }

        setImageFiles((prev) => [...prev, ...newFiles]);
        setImagePreviewList((prev) => [...prev, ...newPreviews]);
        e.target.value = '';
    };

    // Document upload handler
    const onDocumentSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const newFiles: File[] = [];
        const newPreviews: typeof docPreviewList = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!ALLOWED_TYPES.includes(file.type)) {
                toast.error(`${file.name} is not allowed. Use PDF or DOC/DOCX.`);
                continue;
            }
            newFiles.push(file);
            newPreviews.push({ name: file.name, url: URL.createObjectURL(file) });
        }

        setDocFiles((prev) => [...prev, ...newFiles]);
        setDocPreviewList((prev) => [...prev, ...newPreviews]);
        e.target.value = '';
    };

    // Remove image
    const removeImage = (index: number) => {
        const removed = imagePreviewList[index];
        if (removed?.fileId) {
            setDeletedImageIds((prev) => [...prev, removed.fileId!]);
        } else {
            const dbCount = imagePreviewList.filter((p) => p.fileId).length;
            const fileIndex = index - dbCount;
            if (fileIndex >= 0) {
                setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
            }
        }
        setImagePreviewList((prev) => prev.filter((_, i) => i !== index));
    };

    // Remove document
    const removeDoc = (index: number) => {
        const removed = docPreviewList[index];
        if (removed?.fileId) {
            setDeletedDocumentIds((prev) => [...prev, removed.fileId!]);
        } else {
            const dbCount = docPreviewList.filter((p) => p.fileId).length;
            const fileIndex = index - dbCount;
            if (fileIndex >= 0) {
                setDocFiles((prev) => prev.filter((_, i) => i !== fileIndex));
            }
        }
        setDocPreviewList((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Projects', 'Projects')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard }, { label: t('Projects', 'Projects') }]}
                actionLabel={t('Create Project', 'Create Project')}
                onAction={openCreateModal}
            />

            {/* ── Search Filter ── */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                    <FormField label={t('Project Name', 'Project Name')}>
                        <input
                            type="text"
                            value={searchProjectName}
                            onChange={(e) => setSearchProjectName(e.target.value)}
                            placeholder={t('Search project name...', 'Search project name...')}
                            className={ui.input}
                        />
                    </FormField>
                    <FormField label={t('Employee Name', 'Employee Name')}>
                        <input
                            type="text"
                            value={searchEmployeeName}
                            onChange={(e) => setSearchEmployeeName(e.target.value)}
                            placeholder={t('Search employee name...', 'Search employee name...')}
                            className={ui.input}
                        />
                    </FormField>
                    <FormField label={t('Designation', 'Designation')}>
                        <select
                            value={searchDesignation}
                            onChange={(e) => setSearchDesignation(e.target.value)}
                            className={ui.select}
                        >
                            <option value="">{t('Select Designation', 'Select Designation')}</option>
                            {Array.isArray(designationList) && designationList.map((d: any) => (
                                <option key={d.designationId} value={d.designationId}>{d.designationNameTh || d.designationNameEn}</option>
                            ))}
                        </select>
                    </FormField>
                    <div className="flex gap-2">
                        <button type="button" className={`flex-1 px-3 py-2.5 bg-nv-violet text-white text-sm font-medium rounded-lg hover:bg-nv-violet-dark transition-all shadow-sm flex items-center justify-center gap-1.5`}>
                            <Search className="w-4 h-4" />
                            {t('Search', 'Search')}
                        </button>
                        <button onClick={onClearSearch} className={`flex-1 ${ui.btnSecondary}`}>{t('Clear', 'Clear')}</button>
                    </div>
                </div>
            </div>

            {/* Project Grid */}
            {isLoading ? (
                <LoadingSpinner />
            ) : paginatedData.length === 0 ? (
                <EmptyState message={t('No projects found', 'No projects found')} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {paginatedData.map((p: any) => {
                        const priorityConfig = (p.priority === "high" || p.priority === "High")
                            ? { bg: "bg-red-50", text: "text-red-600", border: "border-l-red-400", dot: "bg-red-400" }
                            : (p.priority === "medium" || p.priority === "Medium")
                                ? { bg: "bg-amber-50", text: "text-amber-600", border: "border-l-amber-400", dot: "bg-amber-400" }
                                : { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-l-emerald-400", dot: "bg-emerald-400" };

                        return (
                            <div
                                key={p.projectId || p.id}
                                className={`[background-color:var(--nv-card,#fff)] rounded-xl border border-nv-border ${priorityConfig.border} border-l-[3px] flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}
                            >
                                {/* Header */}
                                <div className="px-5 pt-5 pb-3 flex-1">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <h3 className="font-semibold text-base text-nv-text leading-snug line-clamp-1 flex-1">
                                            {p.projectCode ? `${p.projectCode}: ` : ""}{p.projectName || p.project}
                                        </h3>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full ${priorityConfig.bg} ${priorityConfig.text}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`} />
                                            {p.priority}
                                        </span>
                                    </div>
                                    <p className="text-sm text-nv-text-sec line-clamp-2 leading-relaxed">
                                        {p.description || t('No description', 'No description')}
                                    </p>

                                    {/* Deadline */}
                                    <div className="mt-3 text-xs text-nv-text-dim">
                                        {t('Deadline', 'Deadline')}: {p.deadline ? format(new Date(p.deadline), "dd/MM/yyyy") : (p.endDate ? format(new Date(p.endDate), "dd/MM/yyyy") : "--")}
                                    </div>

                                    {/* Project Leader */}
                                    {p.teamLead && (
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className="text-xs text-gray-500">{t('Leader', 'Leader')}:</span>
                                            <AvatarCircle
                                                name={`${p.teamLead.firstNameEn || ""} ${p.teamLead.lastNameEn || ""}`}
                                                imgPath={p.teamLead.imgPath}
                                            />
                                            <span className="text-xs text-gray-700">{p.teamLead.firstNameEn} {p.teamLead.lastNameEn}</span>
                                        </div>
                                    )}

                                    {/* Team Members */}
                                    {p.team && p.team.length > 0 && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-xs text-gray-500">{t('Team', 'Team')}:</span>
                                            <div className="flex -space-x-1.5">
                                                {p.team.slice(0, 4).map((member: any, idx: number) => (
                                                    <AvatarCircle
                                                        key={member.id || idx}
                                                        name={`${member.firstNameEn || ""} ${member.lastNameEn || ""}`}
                                                        imgPath={member.imgPath}
                                                        size="w-6 h-6"
                                                    />
                                                ))}
                                                {p.team.length > 4 && (
                                                    <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[9px] font-semibold text-gray-600">
                                                        +{p.team.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="px-5 pb-4 pt-2 border-t border-nv-border-lt flex items-center justify-end">
                                    <div className="flex items-center gap-0.5">
                                        <Link
                                            href={ROUTES.projectView(p.projectId || p.id)}
                                            className="p-1.5 hover:bg-nv-violet-light text-gray-400 hover:text-nv-violet rounded-md transition-colors"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </Link>
                                        <button
                                            onClick={() => openEditModal(p.projectId || p.id)}
                                            className="p-1.5 hover:bg-amber-50 text-gray-400 hover:text-amber-600 rounded-md transition-colors"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p.projectId || p.id)}
                                            className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-md transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6">
                    <PaginationBar
                        currentPage={currentPage} totalPages={totalPages}
                        totalData={filteredProjects.length} pageSize={10}
                        onGoToPage={goToPage}
                    />
                </div>
            )}

            {/* Create/Edit Modal */}
            <ModalWrapper
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={isEditMode ? t('Edit Project', 'Edit Project') : t('Create Project', 'Create Project')}
                maxWidth="max-w-6xl"
                footer={
                    <>
                        <button onClick={() => setModalOpen(false)} className={ui.btnSecondary}>{t('Cancel', 'Cancel')}</button>
                        <button
                            onClick={handleSubmit(onSubmit)}
                            disabled={updateMutation.isPending}
                            className={ui.btnPrimary}
                        >
                            {updateMutation.isPending ? t('Saving...', 'Saving...') : t('Submit', 'Submit')}
                        </button>
                    </>
                }
            >
                <form className="space-y-5">
                    {/* Row 1: Project Type (3) | Project Code (3) | Project Name (6) */}
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-3">
                            <FormField label={t('Project Type', 'Project Type')} required>
                                <select {...register("projectTypeId", { required: true })}
                                    className={`${ui.select} ${errors.projectTypeId ? "border-red-500" : ""}`}>
                                    <option value="">{t('Select Type', 'Select Type')}</option>
                                    {Array.isArray((projectTypes as any)?.data) && (projectTypes as any).data.map((t: any) => (
                                        <option key={t.projectTypeId} value={t.projectTypeId}>{t.projectTypeNameEn}</option>
                                    ))}
                                </select>
                            </FormField>
                        </div>
                        <div className="col-span-3">
                            <FormField label={t('Project Code', 'Project Code')} required>
                                <input {...register("projectCode", { required: true })}
                                    disabled={isEditMode}
                                    className={`${ui.input} ${isEditMode ? ui.inputDisabled : ""} ${errors.projectCode ? "border-red-500" : ""}`} />
                            </FormField>
                        </div>
                        <div className="col-span-6">
                            <FormField label={t('Project Name', 'Project Name')} required>
                                <input {...register("projectName", { required: true })}
                                    className={`${ui.input} ${errors.projectName ? "border-red-500" : ""}`} />
                            </FormField>
                        </div>
                    </div>

                    {/* Row 2: Client (6) | Start Date (3) | End Date (3) */}
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-6">
                            <FormField label={t('Client', 'Client')} required>
                                <select {...register("client", { required: true })}
                                    className={`${ui.select} ${errors.client ? "border-red-500" : ""}`}>
                                    <option value="">{t('Select Client', 'Select Client')}</option>
                                    {Array.isArray(clientList) && clientList.map((c: any) => (
                                        <option key={c.clientId} value={c.clientId}>{c.company}</option>
                                    ))}
                                </select>
                            </FormField>
                        </div>
                        <div className="col-span-3">
                            <FormField label={t('Start Date', 'Start Date')} required>
                                <input type="date" {...register("startDate", { required: true })} className={ui.input} />
                            </FormField>
                        </div>
                        <div className="col-span-3">
                            <FormField label={t('End Date', 'End Date')} required>
                                <input type="date" {...register("endDate", { required: true })} className={ui.input} />
                            </FormField>
                        </div>
                    </div>

                    {/* Row 3: Priority (3) | Timesheet Start Day (3) | Rate (3) | Rate Type (3) */}
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-3">
                            <FormField label={t('Priority', 'Priority')} required>
                                <select {...register("priority", { required: true })}
                                    className={`${ui.select} ${errors.priority ? "border-red-500" : ""}`}>
                                    <option value="">{t('Select Priority', 'Select Priority')}</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </FormField>
                        </div>
                        <div className="col-span-3">
                            <FormField label={t('Timesheet Start Day', 'Timesheet Start Day')} required>
                                <select {...register("timesheetDateStart", { required: true })} className={ui.select}>
                                    {daysInMonth.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </FormField>
                        </div>
                    </div>

                    {/* Row 4: Add Project Leader (6) | Project Leader preview (6) */}
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-6">
                            <FormField label={t('Add Project Leader', 'Add Project Leader')} required>
                                <select
                                    value={selectedLeader?.id || ""}
                                    onChange={(e) => {
                                        const id = Number(e.target.value);
                                        const emp = employeeList?.find((emp: any) => emp.id === id) || null;
                                        setSelectedLeader(emp);
                                    }}
                                    className={`${ui.select} ${!selectedLeader && errors.projectLeader ? "border-red-500" : ""}`}
                                >
                                    <option value="">{t('Select Leader', 'Select Leader')}</option>
                                    {employeeList?.filter((e: any) => !selectedTeamMembers.some((m: any) => m.id === e.id)).map((e: any) => (
                                        <option key={e.id} value={e.id}>{e.firstNameEn} {e.lastNameEn}</option>
                                    ))}
                                </select>
                            </FormField>
                        </div>
                        <div className="col-span-6">
                            <FormField label={t('Project Leader', 'Project Leader')}>
                                {selectedLeader ? (
                                    <div className="flex items-center gap-2 pt-1">
                                        <AvatarCircle name={`${selectedLeader.firstNameEn} ${selectedLeader.lastNameEn}`} imgPath={selectedLeader.imgPath} size="w-8 h-8" />
                                        <span className="text-sm text-gray-700">{selectedLeader.firstNameEn} {selectedLeader.lastNameEn}</span>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 pt-2">{t('No leader selected', 'No leader selected')}</p>
                                )}
                            </FormField>
                        </div>
                    </div>

                    {/* Row 5: Add Team (6) | Team Members preview (6) */}
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-6">
                            <FormField label={t('Add Team', 'Add Team')} required>
                                <MultiSelectDropdown
                                    options={employeeList || []}
                                    selected={selectedTeamMembers}
                                    onChange={setSelectedTeamMembers}
                                    placeholder={t('Select Team Members', 'Select Team Members')}
                                    excludeIds={selectedLeader ? [selectedLeader.id] : []}
                                />
                            </FormField>
                        </div>
                        <div className="col-span-6">
                            <FormField label={t('Team Members', 'Team Members')}>
                                {selectedTeamMembers.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {selectedTeamMembers.map((m: any) => (
                                            <div key={m.id} className="flex items-center gap-1 bg-gray-100 rounded-full pl-1 pr-2 py-0.5">
                                                <AvatarCircle name={`${m.firstNameEn} ${m.lastNameEn}`} imgPath={m.imgPath} size="w-6 h-6" />
                                                <span className="text-xs text-gray-700">{m.firstNameEn}</span>
                                                <button type="button" onClick={() => setSelectedTeamMembers(prev => prev.filter(t => t.id !== m.id))}
                                                    className="ml-0.5 text-gray-400 hover:text-red-500">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 pt-2">{t('No team members selected', 'No team members selected')}</p>
                                )}
                            </FormField>
                        </div>
                    </div>

                    {/* Row 6: Incharge Name (3) | Auditor (3) | Approver (3) */}
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-3">
                            <FormField label={t('In-charge Name', 'In-charge Name')}>
                                <input {...register("inchargeName")} className={ui.input} />
                            </FormField>
                        </div>
                        <div className="col-span-3">
                            <FormField label={t('Auditor', 'Auditor')}>
                                <input {...register("auditor")} className={ui.input} />
                            </FormField>
                        </div>
                        <div className="col-span-3">
                            <FormField label={t('Approver', 'Approver')}>
                                <input {...register("approver")} className={ui.input} />
                            </FormField>
                        </div>
                    </div>

                    {/* Row 7: PO No (3) | IV No (3) | IV Date (3) */}
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-3">
                            <FormField label={t('PO No', 'PO No')}>
                                <input {...register("poNo")} className={ui.input} />
                            </FormField>
                        </div>
                        <div className="col-span-3">
                            <FormField label={t('IV No', 'IV No')}>
                                <input {...register("ivNo")} className={ui.input} />
                            </FormField>
                        </div>
                        <div className="col-span-3">
                            <FormField label={t('IV Date', 'IV Date')}>
                                <input type="date" {...register("ivDate")} className={ui.input} />
                            </FormField>
                        </div>
                    </div>

                    {/* Row 8: Description (full width) */}
                    <FormField label={t('Description', 'Description')}>
                        <textarea rows={4} {...register("description")} className={ui.textarea} />
                    </FormField>

                    {/* Image Upload */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" /> {t('Images', 'Images')}
                            </h4>
                            <label className="cursor-pointer px-3 py-1.5 bg-nv-violet text-white text-xs rounded-lg hover:bg-nv-violet-dark flex items-center gap-1">
                                <Upload className="w-3 h-3" /> {t('Upload', 'Upload')}
                                <input type="file" accept="image/jpeg,image/png" multiple onChange={onImageSelected} className="hidden" />
                            </label>
                        </div>
                        {imagePreviewList.length > 0 ? (
                            <div className="grid grid-cols-4 gap-2">
                                {imagePreviewList.map((img, idx) => (
                                    <div key={idx} className="relative group">
                                        <img src={img.url} alt={img.name} className="w-full h-20 object-cover rounded-lg border" />
                                        <button type="button" onClick={() => removeImage(idx)}
                                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                            ×
                                        </button>
                                        <p className="text-[10px] text-gray-500 mt-1 truncate">{img.name}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400">{t('No images uploaded (JPG, PNG)', 'No images uploaded (JPG, PNG)')}</p>
                        )}
                    </div>

                    {/* Document Upload */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> {t('Documents', 'Documents')}
                            </h4>
                            <label className="cursor-pointer px-3 py-1.5 bg-nv-violet text-white text-xs rounded-lg hover:bg-nv-violet-dark flex items-center gap-1">
                                <Upload className="w-3 h-3" /> {t('Upload', 'Upload')}
                                <input type="file" accept=".pdf,.doc,.docx" multiple onChange={onDocumentSelected} className="hidden" />
                            </label>
                        </div>
                        {docPreviewList.length > 0 ? (
                            <div className="space-y-2">
                                {docPreviewList.map((doc, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white border rounded-lg px-3 py-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            <button type="button" onClick={() => window.open(doc.url, '_blank')}
                                                className="text-sm text-nv-violet hover:underline truncate">
                                                {doc.name}
                                            </button>
                                        </div>
                                        <button type="button" onClick={() => removeDoc(idx)}
                                            className="text-red-500 hover:text-red-700 flex-shrink-0 ml-2">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400">{t('No documents uploaded (PDF, DOC, DOCX)', 'No documents uploaded (PDF, DOC, DOCX)')}</p>
                        )}
                    </div>
                </form>
            </ModalWrapper>
        </div>
    );
}
