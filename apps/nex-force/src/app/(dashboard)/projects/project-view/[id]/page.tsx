"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    FileText, ExternalLink,
    Pencil, Download, Trash2, MoreHorizontal, Image as ImageIcon,
    DollarSign, BarChart3, CalendarDays, Users,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { PageHeader, LoadingSpinner, ui } from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

interface TeamMember {
    id: number;
    employeeId?: string;
    firstNameEn?: string;
    lastNameEn?: string;
    imgPath?: string;
}

interface ProjectFile {
    fileId: number;
    fileCategory?: string;
    originalName: string;
    storedName?: string;
    filePath?: string;
}

interface ProjectCostCard {
    cost: number;
    totalHours: number;
    startDate: string;
    endDate: string;
    priority: string;
}

export default function ProjectViewPage() {
    const { t } = usePageTranslation();
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const id = Number(params.id);

    const [openFileMenuId, setOpenFileMenuId] = useState<number | null>(null);

    // Fetch project data - uses projects/getProjectById/${id}
    const { data: project, isLoading } = useQuery({
        queryKey: ["project-view", id],
        queryFn: async () => {
            const { data } = await apiClient.get<any>(`projects/getProjectById/${id}`);
            return data;
        },
        enabled: id > 0,
    });

    // Fetch project cost - uses projectCost/${projectId}
    const { data: projectCost } = useQuery({
        queryKey: ["project-cost", id],
        queryFn: async () => {
            const { data } = await apiClient.get<ProjectCostCard>(`projectCost/${id}`);
            return data;
        },
        enabled: id > 0,
    });

    // Delete file mutation
    const deleteFileMutation = useMutation({
        mutationFn: async (fileId: number) => {
            const { data } = await apiClient.delete<any>(`projects/deleteFile?id=${fileId}`);
            return data;
        },
        onSuccess: () => {
            toast.success("File deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["project-view", id] });
        },
        onError: () => {
            toast.error("Failed to delete file");
        },
    });

    const handleDeleteFile = (fileId: number) => {
        if (confirm("Are you sure you want to delete this file?")) {
            deleteFileMutation.mutate(fileId);
            setOpenFileMenuId(null);
        }
    };

    const getFileIcon = (name: string) => {
        if (!name) return "file";
        const ext = name.split(".").pop()?.toLowerCase();
        if (ext === "pdf") return "pdf";
        if (ext === "xls" || ext === "xlsx") return "excel";
        if (ext === "doc" || ext === "docx") return "word";
        if (ext === "png" || ext === "jpg" || ext === "jpeg") return "image";
        return "file";
    };

    const getFileIconColor = (type: string) => {
        switch (type) {
            case "pdf": return "text-red-500";
            case "excel": return "text-green-500";
            case "word": return "text-nv-violet";
            case "image": return "text-nv-violet";
            default: return "text-gray-400";
        }
    };

    if (isLoading) {
        return <div className={ui.pageContainer}><LoadingSpinner /></div>;
    }

    if (!project) {
        return <div className={ui.pageContainer}><p className="text-gray-400">Project not found</p></div>;
    }

    const priorityColor =
        project.priority === "high" || project.priority === "High"
            ? "bg-red-100 text-red-700"
            : project.priority === "medium" || project.priority === "Medium"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700";

    const imageFiles: ProjectFile[] = project.imageFiles || [];
    const docFiles: ProjectFile[] = project.files || [];

    return (
        <div className={ui.pageContainer}>
            {/* Header */}
            <PageHeader
                title={project.projectName}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard }, { label: t('Projects', 'Projects'), href: ROUTES.projectPage }, { label: project.projectName }]}
                actions={
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push(`/projects/project-page?edit=${project.projectId}`)}
                            className={ui.btnPrimary}
                        >
                            <Pencil className="w-4 h-4" /> Edit Project
                        </button>
                        <Link href="/projects/task-board" className={ui.btnSecondary}>
                            <BarChart3 className="w-4 h-4" /> Task Board
                        </Link>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="bg-white rounded-xl border p-6">
                        <h2 className="text-lg font-semibold mb-3">{project.projectName}</h2>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {project.description || "No description provided."}
                        </p>
                    </div>

                    {/* Uploaded Image Files */}
                    <div className="bg-white rounded-xl border p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" /> Uploaded Image Files
                        </h2>
                        {imageFiles.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {imageFiles.map((img) => (
                                    <div key={img.fileId} className="group">
                                        <div className="aspect-square rounded-lg overflow-hidden border bg-gray-50">
                                            <img
                                                src={img.filePath || ""}
                                                alt={img.originalName}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 truncate">{img.originalName}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">No uploaded images</p>
                        )}
                    </div>

                    {/* Uploaded Document Files */}
                    <div className="bg-white rounded-xl border p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5" /> Uploaded Files
                        </h2>
                        {docFiles.length > 0 ? (
                            <div className="space-y-3">
                                {docFiles.map((file) => {
                                    const fileType = getFileIcon(file.originalName);
                                    return (
                                        <div key={file.fileId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <FileText className={`w-5 h-5 flex-shrink-0 ${getFileIconColor(fileType)}`} />
                                                <div className="min-w-0">
                                                    <a
                                                        href={file.filePath || "#"}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm font-medium text-nv-violet hover:underline truncate block"
                                                    >
                                                        {file.originalName}
                                                    </a>
                                                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                                                        <span>{project.inchargeName || "—"}</span>
                                                        <span>{project.updateDate ? format(new Date(project.updateDate), "MMM dd, yyyy h:mm a") : ""}</span>
                                                    </div>
                                                    {file.storedName && (
                                                        <p className="text-xs text-gray-400">{file.storedName}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions dropdown */}
                                            <div className="relative flex-shrink-0 ml-2">
                                                <button
                                                    onClick={() => setOpenFileMenuId(openFileMenuId === file.fileId ? null : file.fileId)}
                                                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                                {openFileMenuId === file.fileId && (
                                                    <div className="absolute right-0 mt-1 w-36 bg-white border rounded-lg shadow-lg z-10">
                                                        {file.filePath && (
                                                            <>
                                                                <a
                                                                    href={file.filePath}
                                                                    download
                                                                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full"
                                                                    onClick={() => setOpenFileMenuId(null)}
                                                                >
                                                                    <Download className="w-3.5 h-3.5" /> Download
                                                                </a>
                                                                <a
                                                                    href={file.filePath}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full"
                                                                    onClick={() => setOpenFileMenuId(null)}
                                                                >
                                                                    <ExternalLink className="w-3.5 h-3.5" /> Preview
                                                                </a>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteFile(file.fileId)}
                                                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">No files uploaded</p>
                        )}
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Project Schedule Card — TOP */}
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-nv-violet" /> {t('Project Schedule', 'Project Schedule')}
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">{t('Start Date', 'Start Date')}</span>
                                <span className="text-sm font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg">
                                    {project.startDate ? format(new Date(project.startDate), "dd/MM/yyyy") : "—"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">{t('End Date', 'End Date')}</span>
                                <span className="text-sm font-medium bg-red-50 text-red-600 px-2.5 py-1 rounded-lg">
                                    {project.endDate ? format(new Date(project.endDate), "dd/MM/yyyy") : "—"}
                                </span>
                            </div>
                            {project.startDate && project.endDate && (
                                <div className="pt-2 border-t border-gray-100">
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span>{t('Duration', 'Duration')}</span>
                                        <span className="font-medium text-gray-600">
                                            {Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} {t('days', 'days')}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Project Cost Card */}
                    {projectCost ? (
                        <div className="bg-white rounded-xl border p-6">
                            <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
                                <DollarSign className="w-4 h-4" /> Project Details
                            </h3>
                            <table className="w-full text-sm">
                                <tbody className="divide-y">
                                    <tr>
                                        <td className="py-2.5 text-gray-500">Cost:</td>
                                        <td className="py-2.5 text-right font-medium">{projectCost.cost}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 text-gray-500">Total Hours:</td>
                                        <td className="py-2.5 text-right font-medium">{projectCost.totalHours} Hours</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 text-gray-500">Start Date:</td>
                                        <td className="py-2.5 text-right font-medium">
                                            {projectCost.startDate ? format(new Date(projectCost.startDate), "dd/MM/yyyy") : "—"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 text-gray-500">End Date:</td>
                                        <td className="py-2.5 text-right font-medium">
                                            {projectCost.endDate ? format(new Date(projectCost.endDate), "dd/MM/yyyy") : "—"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 text-gray-500">Priority:</td>
                                        <td className="py-2.5 text-right">
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${priorityColor}`}>
                                                {projectCost.priority}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="mt-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-500">Progress</span>
                                    <span className="text-green-600 font-medium">40%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "40%" }} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border p-6 text-center text-gray-400 text-sm">
                            No project cost data
                        </div>
                    )}

                    {/* Project Leader */}
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-md font-semibold mb-4">Project Leader</h3>
                        {project.teamLead ? (
                            <Link
                                href={`/employees/employee-profile/${project.teamLead.id}`}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                    <div className="w-full h-full bg-gradient-to-br from-nv-violet/80 to-zinc-900 flex items-center justify-center text-white text-sm font-semibold">
                                        {project.teamLead.firstNameEn?.charAt(0) || '?'}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium text-sm">
                                        {project.teamLead.firstNameEn} {project.teamLead.lastNameEn}
                                    </p>
                                    <p className="text-xs text-gray-400">Team Leader</p>
                                </div>
                            </Link>
                        ) : (
                            <p className="text-sm text-gray-400">No project leader assigned</p>
                        )}
                    </div>

                    {/* Assigned Users */}
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-md font-semibold mb-4">Assigned Users</h3>
                        {project.team && project.team.length > 0 ? (
                            <div className="space-y-1">
                                {project.team.map((member: TeamMember) => (
                                    <Link
                                        key={member.id}
                                        href={`/employees/employee-profile/${member.id}`}
                                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-nv-violet/80 to-zinc-900 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                            {member.firstNameEn?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{member.firstNameEn} {member.lastNameEn}</p>
                                            <p className="text-xs text-gray-400">{member.employeeId}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">No project users assigned</p>
                        )}
                    </div>

                    {/* Responsible Persons Card — BOTTOM */}
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4 text-nv-violet" /> {t('Responsible Persons', 'Responsible Persons')}
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">{t('In-charge Name', 'In-charge Name')}</span>
                                <span className="text-sm font-medium text-gray-800">{project.inchargeName || "—"}</span>
                            </div>
                            <div className="border-t border-gray-100" />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">{t('Auditor', 'Auditor')}</span>
                                <span className="text-sm font-medium text-gray-800">{project.auditor || "—"}</span>
                            </div>
                            <div className="border-t border-gray-100" />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">{t('Approver', 'Approver')}</span>
                                <span className="text-sm font-medium text-gray-800">{project.approver || "—"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
