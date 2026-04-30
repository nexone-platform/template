"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Clock, Pencil, Trash2, X, LayoutGrid, AlertCircle, Calendar, Timer, Play, Pause, Layers, User, FolderOpen, Lock, Search, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ROUTES } from "@/lib/routes";
import apiClient from "@/lib/api-client";
import { getUserProfile, getUserId, isSuperAdmin } from "@/lib/auth";
import { PageHeader, ui } from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

/* ╔══════════════════════════════════════════════════════╗
   ║  Types                                              ║
   ╚══════════════════════════════════════════════════════╝ */
interface TaskBoardItem {
    taskBoardId: number;
    projectId: number;
    taskId?: number;
    taskCode?: string;
    taskName?: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    assigneeId?: number;
    assigneeName?: string;
    assigneeImg?: string;
    dueDate?: string;
    startDate?: string;
    manDay?: number;
    sprintName?: string;
    sprintIsActive?: boolean;
    sortOrder: number;
    projectName?: string;
}

interface TaskForm {
    taskBoardId: number;
    projectId: number;
    taskId: string;
    title: string;
    description: string;
    priority: string;
    assigneeId: string;
    dueDate: string;
    startDate: string;
    manDay: string;
    sprintName: string;
    status: string;
}

interface MasterTask {
    taskId: number;
    taskCode: string;
    taskNameTh: string;
    taskNameEn?: string | null;
    isActive: boolean;
}

interface ProjectOption { projectId: number; projectName: string; }
interface EmployeeOption { id: number; firstNameEn: string; lastNameEn: string; imgPath?: string | null; }

/* ╔══════════════════════════════════════════════════════╗
   ║  Column Config                                      ║
   ╚══════════════════════════════════════════════════════╝ */
const COLUMNS = [
    { key: "pending", label: "Pending", dotColor: "bg-amber-400", borderColor: "border-t-amber-400" },
    { key: "progress", label: "In Progress", dotColor: "bg-blue-400", borderColor: "border-t-blue-400" },
    { key: "review", label: "Review", dotColor: "bg-purple-400", borderColor: "border-t-purple-400" },
    { key: "completed", label: "Completed", dotColor: "bg-emerald-400", borderColor: "border-t-emerald-400" },
    { key: "hold", label: "On Hold", dotColor: "bg-gray-400", borderColor: "border-t-gray-400" },
];

const PRIORITIES = [
    { value: "High", label: "High", color: "bg-red-100 text-red-700 border-red-200" },
    { value: "Medium", label: "Medium", color: "bg-amber-100 text-amber-700 border-amber-200" },
    { value: "Low", label: "Low", color: "bg-green-100 text-green-700 border-green-200" },
];

const priorityIcon: Record<string, string> = { High: "🔴", Medium: "🟡", Low: "🟢" };

const PROJECT_COLORS = [
    "bg-blue-50 text-blue-600 border-blue-200",
    "bg-violet-50 text-violet-600 border-violet-200",
    "bg-teal-50 text-teal-600 border-teal-200",
    "bg-rose-50 text-rose-600 border-rose-200",
    "bg-amber-50 text-amber-600 border-amber-200",
    "bg-cyan-50 text-cyan-600 border-cyan-200",
    "bg-lime-50 text-lime-600 border-lime-200",
    "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200",
    "bg-orange-50 text-orange-600 border-orange-200",
    "bg-indigo-50 text-indigo-600 border-indigo-200",
];

/* ╔══════════════════════════════════════════════════════╗
   ║  Main Page Component                                ║
   ╚══════════════════════════════════════════════════════╝ */
export default function TaskBoardPage() {
    const { t } = usePageTranslation();
    const qc = useQueryClient();

    // ── State ──
    const [editTask, setEditTask] = useState<TaskBoardItem | null>(null);
    const [viewTask, setViewTask] = useState<TaskBoardItem | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<TaskBoardItem | null>(null);
    const [dragItem, setDragItem] = useState<TaskBoardItem | null>(null);
    const [dragOverCol, setDragOverCol] = useState<string | null>(null);
    const [showSprintPanel, setShowSprintPanel] = useState(true);
    const [sprintTab, setSprintTab] = useState<'active' | 'closed' | 'all'>('active');
    const [sprintSearch, setSprintSearch] = useState('');
    const [sprintDisplayLimit, setSprintDisplayLimit] = useState(6);
    const [showCreateSprint, setShowCreateSprint] = useState(false);
    const [newSprintName, setNewSprintName] = useState('');

    // ── Filters ──
    const [filterSprint, setFilterSprint] = useState<string>("__pending__");
    const [filterProject, setFilterProject] = useState<string>("all");
    const [filterAssignee, setFilterAssignee] = useState<string>("all");
    const sprintAutoSet = useRef(false);

    // ── Form State ──
    const emptyForm: TaskForm = { taskBoardId: 0, projectId: 0, taskId: "", title: "", description: "", priority: "Medium", assigneeId: "", dueDate: "", startDate: "", manDay: "", sprintName: "", status: "pending" };
    const [formData, setFormData] = useState<TaskForm>(emptyForm);

    // ── Auth ──
    const employeeId = getUserId();
    const isAdmin = isSuperAdmin();

    // ── Fetch ALL Tasks ──
    const { data: allTasks = [], isLoading } = useQuery<TaskBoardItem[]>({
        queryKey: ["taskboard-all"],
        queryFn: async () => {
            const { data } = await apiClient.get("taskBoard");
            return Array.isArray(data) ? data : [];
        },
    });

    // ── Fetch ALL Projects (for filter dropdown — show every project) ──
    const { data: allProjectsRaw } = useQuery({
        queryKey: ["all-projects-list"],
        queryFn: async () => {
            const { data } = await apiClient.get("projects/getAllProject");
            return data;
        },
    });
    const allProjectsList: ProjectOption[] = useMemo(() => {
        if (!allProjectsRaw) return [];
        const list = Array.isArray(allProjectsRaw) ? allProjectsRaw : allProjectsRaw?.data || [];
        return list.map((p: Record<string, unknown>) => ({
            projectId: (p.projectId ?? p.id) as number,
            projectName: (p.project ?? p.projectName ?? "Unnamed") as string,
        }));
    }, [allProjectsRaw]);

    // ── Fetch MY Projects (projects user can add tasks to) ──
    const { data: myProjectsRaw } = useQuery({
        queryKey: ["my-projects", employeeId, isAdmin],
        queryFn: async () => {
            if (isAdmin) {
                const { data } = await apiClient.get("projects/getAllProject");
                return data;
            } else {
                const { data } = await apiClient.get(`taskBoard/myProjects/${employeeId}`);
                return data;
            }
        },
        enabled: !!employeeId || isAdmin,
    });
    const myProjects: ProjectOption[] = useMemo(() => {
        if (!myProjectsRaw) return [];
        const list = Array.isArray(myProjectsRaw) ? myProjectsRaw : myProjectsRaw?.data || [];
        return list.map((p: Record<string, unknown>) => ({
            projectId: (p.projectId ?? p.id) as number,
            projectName: (p.project ?? p.projectName ?? "Unnamed") as string,
        }));
    }, [myProjectsRaw]);
    const myProjectIds = useMemo(() => new Set(myProjects.map(p => p.projectId)), [myProjects]);

    // ── All projects for filter (merge ALL projects + task data for names) ──
    const allProjectsOnBoard: ProjectOption[] = useMemo(() => {
        const map: Record<number, string> = {};
        // First: all projects from the API
        allProjectsList.forEach(p => { map[p.projectId] = p.projectName; });
        // Also include any project from tasks (in case API didn't return it)
        allTasks.forEach(t => { if (!map[t.projectId]) map[t.projectId] = t.projectName || `Project #${t.projectId}`; });
        return Object.entries(map)
            .map(([id, name]) => ({ projectId: Number(id), projectName: name }))
            .sort((a, b) => a.projectName.localeCompare(b.projectName));
    }, [allProjectsList, allTasks]);

    // ── Fetch Employees ──
    const { data: employeesRaw } = useQuery({
        queryKey: ["employees-select"],
        queryFn: async () => { const { data } = await apiClient.get("employees/getEmployeeForSelect"); return data; },
    });
    const employees: EmployeeOption[] = useMemo(() => {
        const list = Array.isArray(employeesRaw) ? employeesRaw : employeesRaw?.data || [];
        return list.map((e: Record<string, unknown>) => ({ id: e.id as number, firstNameEn: e.firstNameEn as string, lastNameEn: e.lastNameEn as string, imgPath: (e.imgPath as string) || null }));
    }, [employeesRaw]);

    // ── Fetch Master Tasks (task types) ──
    const { data: masterTasksRaw } = useQuery<MasterTask[]>({
        queryKey: ["master-tasks"],
        queryFn: async () => {
            const { data } = await apiClient.get("tasks");
            const list = Array.isArray(data) ? data : data?.data || [];
            return list;
        },
    });
    const masterTasks = useMemo(() => (masterTasksRaw || []).filter(t => t.isActive), [masterTasksRaw]);

    // ── All employees for assignee filter (grouped: on-board vs all) ──
    const assigneeIdsOnBoard = useMemo(() => {
        const set = new Set<number>();
        allTasks.forEach(t => { if (t.assigneeId) set.add(t.assigneeId); });
        return set;
    }, [allTasks]);

    const taskCountByAssignee = useMemo(() => {
        const map: Record<number, number> = {};
        allTasks.forEach(t => { if (t.assigneeId) map[t.assigneeId] = (map[t.assigneeId] || 0) + 1; });
        return map;
    }, [allTasks]);

    const allEmployeesForFilter = useMemo(() => {
        return employees
            .map(e => ({
                id: e.id,
                name: `${e.firstNameEn} ${e.lastNameEn}`.trim(),
                imgPath: e.imgPath,
                taskCount: taskCountByAssignee[e.id] || 0,
                isOnBoard: assigneeIdsOnBoard.has(e.id),
            }))
            .sort((a, b) => {
                if (a.isOnBoard !== b.isOnBoard) return a.isOnBoard ? -1 : 1;
                return a.name.localeCompare(b.name);
            });
    }, [employees, assigneeIdsOnBoard, taskCountByAssignee]);

    // ── Project color map ──
    const projectColorMap = useMemo(() => {
        const map: Record<number, string> = {};
        const uniqueIds = [...new Set(allTasks.map(t => t.projectId))].sort();
        uniqueIds.forEach((pid, i) => { map[pid] = PROJECT_COLORS[i % PROJECT_COLORS.length]; });
        return map;
    }, [allTasks]);

    // ── Get unique sprints (with progress tracking) ──
    const sprints = useMemo(() => {
        const sprintMap: Record<string, { name: string; isActive: boolean; count: number; completed: number; inProgress: number; remaining: number }> = {};
        allTasks.forEach(t => {
            if (t.sprintName) {
                if (!sprintMap[t.sprintName]) {
                    sprintMap[t.sprintName] = { name: t.sprintName, isActive: t.sprintIsActive !== false, count: 0, completed: 0, inProgress: 0, remaining: 0 };
                }
                sprintMap[t.sprintName].count++;
                if (t.status === 'completed') sprintMap[t.sprintName].completed++;
                else if (t.status === 'progress' || t.status === 'review') sprintMap[t.sprintName].inProgress++;
                else sprintMap[t.sprintName].remaining++;
            }
        });
        return Object.values(sprintMap).sort((a, b) => a.name.localeCompare(b.name));
    }, [allTasks]);

    // ── Filtered & paginated sprints for panel ──
    const filteredSprints = useMemo(() => {
        let result = sprints;
        if (sprintTab === 'active') result = result.filter(s => s.isActive);
        else if (sprintTab === 'closed') result = result.filter(s => !s.isActive);
        if (sprintSearch.trim()) {
            const q = sprintSearch.trim().toLowerCase();
            result = result.filter(s => s.name.toLowerCase().includes(q));
        }
        return result;
    }, [sprints, sprintTab, sprintSearch]);
    const displayedSprints = filteredSprints.slice(0, sprintDisplayLimit);
    const hasMoreSprints = filteredSprints.length > sprintDisplayLimit;

    // ── Auto-select current (latest active) sprint on first load ──
    useEffect(() => {
        if (sprintAutoSet.current || sprints.length === 0) return;
        const activeSprints = sprints.filter(s => s.isActive);
        if (activeSprints.length > 0) {
            // Pick the latest active sprint (last alphabetically = highest number)
            const latest = activeSprints[activeSprints.length - 1];
            setFilterSprint(latest.name);
        } else {
            setFilterSprint("all");
        }
        sprintAutoSet.current = true;
    }, [sprints]);

    // ── Apply ALL filters ──
    const filteredTasks = useMemo(() => {
        let result = allTasks;

        // Sprint filter
        if (filterSprint !== "all" && filterSprint !== "__pending__") {
            if (filterSprint === "active") result = result.filter(t => t.sprintIsActive !== false);
            else if (filterSprint === "closed") result = result.filter(t => t.sprintIsActive === false);
            else result = result.filter(t => t.sprintName === filterSprint);
        }

        // Project filter
        if (filterProject !== "all") {
            result = result.filter(t => t.projectId === Number(filterProject));
        }

        // Assignee filter
        if (filterAssignee !== "all") {
            if (filterAssignee === "unassigned") {
                result = result.filter(t => !t.assigneeId);
            } else {
                result = result.filter(t => t.assigneeId === Number(filterAssignee));
            }
        }

        return result;
    }, [allTasks, filterSprint, filterProject, filterAssignee]);

    // ── Group filtered tasks by status column ──
    const tasksByColumn = useMemo(() => {
        const map: Record<string, TaskBoardItem[]> = {};
        COLUMNS.forEach(c => { map[c.key] = []; });
        filteredTasks.forEach(t => {
            const col = t.status || "pending";
            if (!map[col]) map[col] = [];
            map[col].push(t);
        });
        Object.values(map).forEach(arr => arr.sort((a, b) => a.sortOrder - b.sortOrder));
        return map;
    }, [filteredTasks]);

    // ── Can user add tasks? (must be member of at least 1 project, or admin) ──
    const canAddTask = isAdmin || myProjectIds.size > 0;

    // ── Mutations ──
    const saveMutation = useMutation({
        mutationFn: async (payload: Record<string, unknown>) => {
            const { data } = await apiClient.post("taskBoard/update", payload);
            return data;
        },
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["taskboard-all"] }); toast.success(t("Task saved", "Task saved")); },
        onError: () => toast.error(t("Failed to save", "Failed to save")),
    });

    const updateStatusMutation = useMutation({
        mutationFn: async (payload: { taskBoardId: number; status: string; sortOrder: number }) => {
            const { data } = await apiClient.put("taskBoard/updateStatus", { ...payload, username: getUserProfile() });
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["taskboard-all"] }),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete(`taskBoard/delete?id=${id}`);
            return data;
        },
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["taskboard-all"] }); toast.success(t("Task deleted", "Task deleted")); setDeleteTarget(null); },
        onError: () => toast.error(t("Failed to delete", "Failed to delete")),
    });

    const toggleSprintMutation = useMutation({
        mutationFn: async (payload: { sprintName: string; isActive: boolean }) => {
            const { data } = await apiClient.put("taskBoard/toggleSprint", { ...payload, username: getUserProfile() });
            return data;
        },
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["taskboard-all"] }); toast.success(t("Sprint updated", "Sprint updated")); },
        onError: () => toast.error(t("Failed to update sprint", "Failed to update sprint")),
    });

    // ── Handlers ──
    const handleSave = () => {
        if (!formData.title.trim()) { toast.error(t("Title is required", "Title is required")); return; }
        if (!formData.projectId) { toast.error(t("Project is required", "Project is required")); return; }
        // Verify user is a member of this project
        if (!isAdmin && !myProjectIds.has(formData.projectId)) {
            toast.error(t("You are not a member of this project", "You are not a member of this project"));
            return;
        }
        saveMutation.mutate({
            taskBoardId: formData.taskBoardId,
            projectId: formData.projectId,
            taskId: formData.taskId ? Number(formData.taskId) : null,
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            assigneeId: formData.assigneeId ? Number(formData.assigneeId) : null,
            dueDate: formData.dueDate || null,
            startDate: formData.startDate || null,
            manDay: formData.manDay ? Number(formData.manDay) : null,
            sprintName: formData.sprintName || null,
            status: formData.status,
            sortOrder: 0,
            username: getUserProfile(),
        });
        setShowAddModal(false);
        setEditTask(null);
        setFormData(emptyForm);
    };

    const openAdd = (colKey: string) => {
        if (!canAddTask) {
            toast.error(t("You are not assigned to any project", "You are not assigned to any project"));
            return;
        }
        setFormData({ ...emptyForm, status: colKey });
        setShowAddModal(true);
    };

    const openAddWithSprint = (sprintName: string) => {
        if (!canAddTask) {
            toast.error(t("You are not assigned to any project", "You are not assigned to any project"));
            return;
        }
        setFormData({ ...emptyForm, status: "pending", sprintName });
        setShowAddModal(true);
        setShowCreateSprint(false);
        setNewSprintName('');
    };

    const openEdit = (task: TaskBoardItem) => {
        // Only allow edit if admin or member of that project
        if (!isAdmin && !myProjectIds.has(task.projectId)) {
            toast.error(t("You can only edit tasks in your projects", "You can only edit tasks in your projects"));
            return;
        }
        setFormData({
            taskBoardId: task.taskBoardId,
            projectId: task.projectId,
            taskId: task.taskId ? String(task.taskId) : "",
            title: task.title,
            description: task.description || "",
            priority: task.priority,
            assigneeId: task.assigneeId ? String(task.assigneeId) : "",
            dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
            startDate: task.startDate ? task.startDate.split("T")[0] : "",
            manDay: task.manDay ? String(task.manDay) : "",
            sprintName: task.sprintName || "",
            status: task.status,
        });
        setEditTask(task);
    };

    const openView = (task: TaskBoardItem) => {
        setViewTask(task);
    };

    // ── Drag & Drop ──
    const handleDragStart = (e: React.DragEvent, task: TaskBoardItem) => {
        setDragItem(task);
        e.dataTransfer.effectAllowed = "move";
        const target = e.currentTarget as HTMLElement;
        setTimeout(() => { target.style.opacity = "0.4"; }, 0);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        (e.currentTarget as HTMLElement).style.opacity = "1";
        setDragItem(null);
        setDragOverCol(null);
    };

    const handleDrop = (e: React.DragEvent, colKey: string) => {
        e.preventDefault();
        setDragOverCol(null);
        if (!dragItem) return;
        if (dragItem.status === colKey) return;
        const colTasks = tasksByColumn[colKey] || [];
        const newOrder = (colTasks.length || 0) + 1;
        updateStatusMutation.mutate({ taskBoardId: dragItem.taskBoardId, status: colKey, sortOrder: newOrder });
    };

    const formatDate = (d?: string) => { if (!d) return null; try { return format(new Date(d), "dd/MM/yyyy"); } catch { return d; } };
    const isOverdue = (d?: string) => { if (!d) return false; return new Date(d) < new Date() };

    const clearFilters = () => { setFilterSprint("all"); setFilterProject("all"); setFilterAssignee("all"); };
    const hasActiveFilters = (filterSprint !== "all" && filterSprint !== "__pending__") || filterProject !== "all" || filterAssignee !== "all";

    // ── Progress ──
    const totalTasks = filteredTasks.length;
    const completedCount = tasksByColumn["completed"]?.length || 0;
    const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
    const uniqueProjectCount = new Set(filteredTasks.map(t => t.projectId)).size;

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Task Board', 'Task Board')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard }, { label: t('Task Board', 'Task Board') }]}
            />

            {/* ── Filter Bar ── */}
            <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4 mb-4 sm:mb-5">
                <div className="flex flex-col gap-2.5">
                    {/* Row 1: Filters — responsive wrap */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:items-center gap-2 sm:gap-3">
                        {/* Project Filter */}
                        <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                            <FolderOpen className="w-4 h-4 text-gray-400 hidden sm:block" />
                            <select
                                value={filterProject}
                                onChange={e => setFilterProject(e.target.value)}
                                className="w-full lg:w-auto border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-nv-violet/30 focus:border-nv-violet outline-none lg:min-w-[180px]"
                            >
                                <option value="all">📁 {t("All Projects", "All Projects")}</option>
                                {allProjectsOnBoard.map(p => (
                                    <option key={p.projectId} value={p.projectId}>
                                        {p.projectName} {myProjectIds.has(p.projectId) ? "" : "👁"}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sprint Filter */}
                        <div className="flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-gray-400 hidden sm:block" />
                            <select
                                value={filterSprint}
                                onChange={e => setFilterSprint(e.target.value)}
                                className="w-full lg:w-auto border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-nv-violet/30 focus:border-nv-violet outline-none lg:min-w-[160px]"
                            >
                                <option value="all">🏃 {t("All Sprints", "All Sprints")}</option>
                                <option value="active">✅ {t("Active Sprints", "Active Sprints")}</option>
                                <option value="closed">⏸ {t("Closed Sprints", "Closed Sprints")}</option>
                                {sprints.map(s => (
                                    <option key={s.name} value={s.name}>
                                        {s.isActive ? "🟢" : "⏸"} {s.name} ({s.count})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Assignee Filter */}
                        <div className="flex items-center gap-1.5">
                            <User className="w-4 h-4 text-gray-400 hidden sm:block" />
                            <select
                                value={filterAssignee}
                                onChange={e => setFilterAssignee(e.target.value)}
                                className="w-full lg:w-auto border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-nv-violet/30 focus:border-nv-violet outline-none lg:min-w-[200px]"
                            >
                                <option value="all">👥 {t("All Assignees", "All Assignees")} ({allEmployeesForFilter.length})</option>
                                <option value="unassigned">❓ {t("Unassigned", "Unassigned")}</option>
                                {allEmployeesForFilter.some(a => a.isOnBoard) && (
                                    <optgroup label={`── ${t("On Board", "On Board")} ──`}>
                                        {allEmployeesForFilter.filter(a => a.isOnBoard).map(a => (
                                            <option key={a.id} value={a.id}>
                                                {a.name} ({a.taskCount} {t("tasks", "tasks")})
                                            </option>
                                        ))}
                                    </optgroup>
                                )}
                                {allEmployeesForFilter.some(a => !a.isOnBoard) && (
                                    <optgroup label={`── ${t("All Employees", "All Employees")} ──`}>
                                        {allEmployeesForFilter.filter(a => !a.isOnBoard).map(a => (
                                            <option key={a.id} value={a.id}>
                                                {a.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                )}
                            </select>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 col-span-2 sm:col-span-3 lg:col-span-1">
                            {hasActiveFilters && (
                                <button onClick={clearFilters}
                                    className="flex items-center gap-1 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <X className="w-3.5 h-3.5" /> {t("Clear", "Clear")}
                                </button>
                            )}
                            <button
                                onClick={() => setShowSprintPanel(!showSprintPanel)}
                                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors border ${showSprintPanel ? "bg-indigo-100 text-indigo-700 border-indigo-300" : "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100"}`}
                            >
                                <Layers className="w-4 h-4" />
                                <span className="hidden sm:inline">{t("Sprints", "Sprints")}</span>
                            </button>
                        </div>
                    </div>

                    {/* Row 2: Summary + Progress */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <LayoutGrid className="w-4 h-4 text-nv-violet" />
                            <span className="text-xs sm:text-sm text-gray-600">
                                {uniqueProjectCount} {t("Projects", "Projects")} · {totalTasks} {t("tasks", "tasks")} · {completedCount} {t("completed", "completed")}
                            </span>
                            {hasActiveFilters && (
                                <span className="text-xs bg-nv-violet/10 text-nv-violet px-2 py-0.5 rounded-full font-medium">
                                    {t("Filtered", "Filtered")}
                                </span>
                            )}
                        </div>
                        {totalTasks > 0 && (
                            <div className="flex items-center gap-3 w-full sm:w-auto sm:min-w-[200px]">
                                <span className="text-xs text-gray-500 whitespace-nowrap">{t("Progress", "Progress")}</span>
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                                </div>
                                <span className="text-xs font-semibold text-emerald-600">{progressPct}%</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Sprint Management Panel ── */}
            {showSprintPanel && (
                <div className="bg-white rounded-xl shadow-sm border mb-4 sm:mb-5 animate-in slide-in-from-top duration-200 overflow-hidden">
                    {/* Header */}
                    <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-3 border-b bg-gradient-to-r from-indigo-50/60 to-violet-50/30">
                        <div className="flex items-center justify-between mb-2.5">
                            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-indigo-500" />
                                {t("Sprint Management", "Sprint Management")}
                                <span className="text-xs font-normal text-gray-400">({sprints.length})</span>
                            </h3>
                            <div className="flex items-center gap-1.5">
                                {canAddTask && (
                                    <button
                                        onClick={() => setShowCreateSprint(!showCreateSprint)}
                                        className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all border ${showCreateSprint ? "bg-indigo-100 text-indigo-700 border-indigo-300" : "bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50"}`}
                                    >
                                        <Plus className="w-3.5 h-3.5" /> {t("New Sprint", "New Sprint")}
                                    </button>
                                )}
                                <button onClick={() => setShowSprintPanel(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Create Sprint Inline Form */}
                        {showCreateSprint && (
                            <div className="flex items-center gap-2 mb-2.5 p-2.5 bg-white rounded-lg border border-indigo-200 animate-in slide-in-from-top duration-150">
                                <input
                                    type="text"
                                    value={newSprintName}
                                    onChange={e => setNewSprintName(e.target.value)}
                                    placeholder={t("e.g. Sprint 5", "e.g. Sprint 5")}
                                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                                    autoFocus
                                    onKeyDown={e => { if (e.key === 'Enter' && newSprintName.trim()) openAddWithSprint(newSprintName.trim()); }}
                                />
                                <button
                                    onClick={() => { if (newSprintName.trim()) openAddWithSprint(newSprintName.trim()); }}
                                    disabled={!newSprintName.trim()}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors disabled:opacity-40 whitespace-nowrap"
                                >
                                    <Plus className="w-3.5 h-3.5" /> {t("Create & Add Task", "Create & Add Task")}
                                </button>
                                <button onClick={() => { setShowCreateSprint(false); setNewSprintName(''); }} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}

                        {/* Tabs + Search Row */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <div className="flex items-center bg-white/80 rounded-lg p-0.5 text-xs border border-gray-200/80 shadow-sm">
                                {([
                                    { key: 'active' as const, label: t('Active', 'Active'), icon: '🟢', count: sprints.filter(s => s.isActive).length },
                                    { key: 'closed' as const, label: t('Closed', 'Closed'), icon: '⏸', count: sprints.filter(s => !s.isActive).length },
                                    { key: 'all' as const, label: t('All', 'All'), icon: '📋', count: sprints.length },
                                ]).map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => { setSprintTab(tab.key); setSprintDisplayLimit(6); }}
                                        className={`px-2.5 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${sprintTab === tab.key ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {tab.icon} {tab.label} <span className="opacity-70">({tab.count})</span>
                                    </button>
                                ))}
                            </div>
                            {sprints.length > 4 && (
                                <div className="relative flex-1 sm:max-w-[200px]">
                                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={sprintSearch}
                                        onChange={e => setSprintSearch(e.target.value)}
                                        placeholder={t("Search sprints...", "Search sprints...")}
                                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sprint Cards Grid */}
                    <div className="p-3 sm:p-4">
                        {filteredSprints.length === 0 ? (
                            <p className="text-sm text-gray-400 py-6 text-center">
                                {sprints.length === 0
                                    ? t("No sprints yet. Click \"New Sprint\" to create one.", "No sprints yet. Click \"New Sprint\" to create one.")
                                    : t("No sprints match your filter.", "No sprints match your filter.")}
                            </p>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                                    {displayedSprints.map(sprint => {
                                        const pct = sprint.count > 0 ? Math.round((sprint.completed / sprint.count) * 100) : 0;
                                        return (
                                            <div key={sprint.name} className={`group p-3 rounded-xl border transition-all hover:shadow-md ${sprint.isActive ? "bg-white border-gray-200 hover:border-indigo-200" : "bg-gray-50/80 border-gray-100 hover:border-gray-200"}`}>
                                                {/* Sprint Name + Toggle */}
                                                <div className="flex items-start justify-between gap-2 mb-2.5">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sprint.isActive ? "bg-emerald-400 shadow-sm shadow-emerald-200" : "bg-gray-300"}`} />
                                                            <button
                                                                onClick={() => { setFilterSprint(sprint.name); setShowSprintPanel(false); }}
                                                                className="text-sm font-semibold text-gray-700 truncate hover:text-indigo-600 transition-colors text-left"
                                                                title={t("Filter by this sprint", "Filter by this sprint")}
                                                            >
                                                                {sprint.name}
                                                            </button>
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 ml-3.5">{sprint.count} {t("tasks", "tasks")}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleSprintMutation.mutate({ sprintName: sprint.name, isActive: !sprint.isActive })}
                                                        disabled={toggleSprintMutation.isPending}
                                                        className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-lg transition-all flex-shrink-0 ${sprint.isActive
                                                            ? "bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200"
                                                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200"
                                                        }`}
                                                    >
                                                        {sprint.isActive ? <><Pause className="w-3 h-3" /> {t("Close", "Close")}</> : <><Play className="w-3 h-3" /> {t("Open", "Open")}</>}
                                                    </button>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? "bg-emerald-400" : pct > 0 ? "bg-indigo-400" : "bg-gray-200"}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-[10px] font-bold tabular-nums min-w-[28px] text-right ${pct === 100 ? "text-emerald-500" : "text-gray-400"}`}>{pct}%</span>
                                                </div>

                                                {/* Task Stats */}
                                                <div className="flex items-center gap-1.5 text-[10px]">
                                                    <span className="flex items-center gap-0.5 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100" title={t("Completed", "Completed")}>✓ {sprint.completed}</span>
                                                    <span className="flex items-center gap-0.5 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100" title={t("In Progress / Review", "In Progress / Review")}>● {sprint.inProgress}</span>
                                                    <span className="flex items-center gap-0.5 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100" title={t("Pending / Hold", "Pending / Hold")}>○ {sprint.remaining}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Show More / Show Less */}
                                {(hasMoreSprints || sprintDisplayLimit > 6) && (
                                    <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                        {hasMoreSprints && (
                                            <button
                                                onClick={() => setSprintDisplayLimit(prev => prev + 6)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                                            >
                                                <ChevronDown className="w-3.5 h-3.5" /> {t("Show More", "Show More")} ({filteredSprints.length - sprintDisplayLimit})
                                            </button>
                                        )}
                                        {sprintDisplayLimit > 6 && (
                                            <button
                                                onClick={() => setSprintDisplayLimit(6)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                                            >
                                                <ChevronUp className="w-3.5 h-3.5" /> {t("Show Less", "Show Less")}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── Flat Kanban Board — Trello Style ── */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nv-violet" /></div>
            ) : totalTasks === 0 && !hasActiveFilters ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <LayoutGrid className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-lg">{t("No tasks found", "No tasks found")}</p>
                    {canAddTask && (
                        <button onClick={() => openAdd("pending")} className="mt-4 flex items-center gap-2 px-4 py-2 bg-nv-violet text-white rounded-lg text-sm hover:bg-nv-violet/90 transition-colors">
                            <Plus className="w-4 h-4" /> {t("Add Task", "Add Task")}
                        </button>
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto pb-2 scrollbar-thin rounded-xl" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <div className="flex gap-4 pb-2" style={{ minHeight: "calc(100vh - 380px)", minWidth: `${COLUMNS.length * 270}px` }}>
                    {COLUMNS.map(col => {
                        const colTasks = tasksByColumn[col.key] || [];
                        const isDragOver = dragOverCol === col.key && dragItem?.status !== col.key;
                        return (
                            <div
                                key={col.key}
                                className={`flex flex-col flex-1 rounded-xl border-t-4 ${col.borderColor} bg-gray-50/70 transition-all duration-200 ${isDragOver ? "ring-2 ring-nv-violet/40 bg-nv-violet-light/30 scale-[1.01]" : ""}`}
                                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverCol(col.key); }}
                                onDragLeave={() => setDragOverCol(null)}
                                onDrop={e => handleDrop(e, col.key)}
                            >
                                {/* Column Header */}
                                <div className="p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                                        <h3 className="font-semibold text-sm text-gray-700">{t(col.label, col.label)}</h3>
                                        <span className="text-xs bg-white text-gray-500 px-1.5 py-0.5 rounded-full border">{colTasks.length}</span>
                                    </div>
                                    {canAddTask && (
                                        <button
                                            onClick={() => openAdd(col.key)}
                                            className="p-1 text-gray-400 hover:text-nv-violet hover:bg-white rounded-md transition-colors"
                                            title={t("Add task", "Add task")}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Task Cards */}
                                <div
                                    className="flex-1 px-2.5 sm:px-3 pb-3 space-y-2.5 overflow-y-auto"
                                    style={{ maxHeight: "calc(100vh - 420px)" }}
                                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = "move"; setDragOverCol(col.key); }}
                                    onDrop={e => { e.stopPropagation(); handleDrop(e, col.key); }}
                                >
                                    {colTasks.map(task => {
                                        const isMember = isAdmin || myProjectIds.has(task.projectId);
                                        return (
                                            <TaskCard
                                                key={task.taskBoardId}
                                                task={task}
                                                projectColor={projectColorMap[task.projectId] || PROJECT_COLORS[0]}
                                                isMember={isMember}
                                                onEdit={() => openEdit(task)}
                                                onView={() => openView(task)}
                                                onDelete={() => {
                                                    if (!isMember) { toast.error(t("You can only delete tasks in your projects", "You can only delete tasks in your projects")); return; }
                                                    setDeleteTarget(task);
                                                }}
                                                onDragStart={e => handleDragStart(e, task)}
                                                onDragEnd={handleDragEnd}
                                                formatDate={formatDate}
                                                isOverdue={isOverdue}
                                                t={t}
                                            />
                                        );
                                    })}
                                    {colTasks.length === 0 && (
                                        <div
                                            className={`border-2 border-dashed rounded-lg text-center transition-colors flex-1 flex items-center justify-center min-h-[120px] ${isDragOver ? "border-nv-violet bg-nv-violet-light/20" : "border-gray-200"}`}
                                            onDragOver={e => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = "move"; setDragOverCol(col.key); }}
                                            onDrop={e => { e.stopPropagation(); handleDrop(e, col.key); }}
                                        >
                                            <p className="text-xs text-gray-400">{isDragOver ? t("Drop here", "Drop here") : t("No tasks", "No tasks")}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Add task shortcut */}
                                {canAddTask && (
                                    <button
                                        onClick={() => openAdd(col.key)}
                                        className="mx-3 mb-3 flex items-center justify-center gap-1.5 py-2 text-xs text-gray-400 hover:text-nv-violet hover:bg-white rounded-lg border border-dashed border-gray-200 hover:border-nv-violet/30 transition-all"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> {t("Add Task", "Add Task")}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    </div>
                </div>
            )}

            {/* ── Add/Edit Task Modal ── */}
            {(showAddModal || editTask) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowAddModal(false); setEditTask(null); setFormData(emptyForm); }} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-nv-violet/10 to-purple-50 p-5 border-b flex items-center justify-between flex-shrink-0">
                            <h2 className="text-lg font-bold text-gray-800">
                                {editTask ? t("Edit Task", "Edit Task") : t("Add Task", "Add Task")}
                            </h2>
                            <button onClick={() => { setShowAddModal(false); setEditTask(null); setFormData(emptyForm); }} className="p-1.5 hover:bg-gray-200/60 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4 overflow-y-auto flex-1">
                            {/* Project — only shows MY projects */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("Project", "Project")} <span className="text-red-500">*</span></label>
                                <select value={formData.projectId} onChange={e => setFormData(f => ({ ...f, projectId: Number(e.target.value) }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-nv-violet/30 focus:border-nv-violet outline-none bg-white">
                                    <option value={0}>{t("Select Project", "Select Project")}</option>
                                    {myProjects.map(p => <option key={p.projectId} value={p.projectId}>{p.projectName}</option>)}
                                </select>
                            </div>
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("Title", "Title")} <span className="text-red-500">*</span></label>
                                <input
                                    type="text" value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                                    placeholder={t("Enter task title...", "Enter task title...")}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-nv-violet/30 focus:border-nv-violet outline-none"
                                    autoFocus
                                />
                            </div>
                            {/* Task Type (from master data) */}
                            {masterTasks.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("Task Type", "Task Type")}</label>
                                    <select value={formData.taskId} onChange={e => setFormData(f => ({ ...f, taskId: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-nv-violet/30 focus:border-nv-violet outline-none bg-white">
                                        <option value="">{t("No task type", "No task type")}</option>
                                        {masterTasks.map(mt => <option key={mt.taskId} value={mt.taskId}>{mt.taskCode} — {mt.taskNameTh}{mt.taskNameEn ? ` (${mt.taskNameEn})` : ""}</option>)}
                                    </select>
                                </div>
                            )}
                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("Description", "Description")}</label>
                                <textarea
                                    value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                                    rows={2} placeholder={t("Add description...", "Add description...")}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-nv-violet/30 focus:border-nv-violet outline-none resize-none"
                                />
                            </div>
                            {/* Row: Priority + Status */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("Priority", "Priority")}</label>
                                    <select value={formData.priority} onChange={e => setFormData(f => ({ ...f, priority: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-nv-violet/30 focus:border-nv-violet outline-none bg-white">
                                        {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("Status", "Status")}</label>
                                    <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-nv-violet/30 focus:border-nv-violet outline-none bg-white">
                                        {COLUMNS.map(c => <option key={c.key} value={c.key}>{t(c.label, c.label)}</option>)}
                                    </select>
                                </div>
                            </div>
                            {/* Row: Start Date + Due Date */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("Start Date", "Start Date")}</label>
                                    <input type="date" value={formData.startDate} onChange={e => setFormData(f => ({ ...f, startDate: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-nv-violet/30 focus:border-nv-violet outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("Due Date", "Due Date")}</label>
                                    <input type="date" value={formData.dueDate} onChange={e => setFormData(f => ({ ...f, dueDate: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-nv-violet/30 focus:border-nv-violet outline-none" />
                                </div>
                            </div>
                            {/* Row: ManDay + Assignee */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("Man Day", "Man Day")}</label>
                                    <input type="number" step="0.5" min="0" value={formData.manDay} onChange={e => setFormData(f => ({ ...f, manDay: e.target.value }))}
                                        placeholder="0.0"
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-nv-violet/30 focus:border-nv-violet outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("Assignee", "Assignee")}</label>
                                    <select value={formData.assigneeId} onChange={e => setFormData(f => ({ ...f, assigneeId: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-nv-violet/30 focus:border-nv-violet outline-none bg-white">
                                        <option value="">{t("Unassigned", "Unassigned")}</option>
                                        {employees.map(e => <option key={e.id} value={e.id}>{e.firstNameEn} {e.lastNameEn}</option>)}
                                    </select>
                                </div>
                            </div>
                            {/* Sprint Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("Sprint", "Sprint")}</label>
                                <input
                                    type="text" value={formData.sprintName} onChange={e => setFormData(f => ({ ...f, sprintName: e.target.value }))}
                                    placeholder={t("e.g. Sprint 1, Sprint 2...", "e.g. Sprint 1, Sprint 2...")}
                                    list="sprint-suggestions"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-nv-violet/30 focus:border-nv-violet outline-none"
                                />
                                <datalist id="sprint-suggestions">
                                    {sprints.map(s => <option key={s.name} value={s.name} />)}
                                </datalist>
                            </div>
                        </div>
                        {/* Modal Footer */}
                        <div className="p-5 border-t bg-gray-50/50 flex justify-end gap-3 flex-shrink-0">
                            <button onClick={() => { setShowAddModal(false); setEditTask(null); setFormData(emptyForm); }}
                                className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                {t("Cancel", "Cancel")}
                            </button>
                            <button onClick={handleSave} disabled={saveMutation.isPending}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-nv-violet rounded-lg hover:bg-nv-violet/90 transition-colors disabled:opacity-50 shadow-sm">
                                {saveMutation.isPending ? "..." : editTask ? t("Update", "Update") : t("Create", "Create")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Modal ── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{t("Delete Task", "Delete Task")}?</h3>
                        <p className="text-sm text-gray-500 mb-5">&ldquo;{deleteTarget.title}&rdquo;</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">{t("Cancel", "Cancel")}</button>
                            <button onClick={() => deleteMutation.mutate(deleteTarget.taskBoardId)} disabled={deleteMutation.isPending}
                                className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50">
                                {deleteMutation.isPending ? "..." : t("Delete", "Delete")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── View Detail Modal (Read Only) ── */}
            {viewTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewTask(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-5 border-b flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-gray-400" />
                                <h2 className="text-lg font-bold text-gray-800">{t("Task Details", "Task Details")}</h2>
                            </div>
                            <button onClick={() => setViewTask(null)} className="p-1.5 hover:bg-gray-200/60 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        {/* Body */}
                        <div className="p-5 space-y-4 overflow-y-auto flex-1">
                            {/* Project */}
                            <div className="flex items-center gap-2">
                                <FolderOpen className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-600">{t("Project", "Project")}:</span>
                                <span className="text-sm text-gray-800">{viewTask.projectName || "-"}</span>
                            </div>
                            {/* Title */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{viewTask.title}</h3>
                                {viewTask.description && <p className="text-sm text-gray-500 mt-1">{viewTask.description}</p>}
                            </div>
                            {/* Task Type */}
                            {viewTask.taskName && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-600">📋 {t("Task Type", "Task Type")}:</span>
                                    <span className="text-sm text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">{viewTask.taskCode} — {viewTask.taskName}</span>
                                </div>
                            )}
                            {/* Status + Priority */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-gray-400 block mb-1">{t("Status", "Status")}</span>
                                    <span className="text-sm font-medium text-gray-700 capitalize">{COLUMNS.find(c => c.key === viewTask.status)?.label || viewTask.status}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 block mb-1">{t("Priority", "Priority")}</span>
                                    <span className={`text-sm px-2 py-0.5 rounded-full border font-medium ${PRIORITIES.find(p => p.value === viewTask.priority)?.color || ""}`}>
                                        {priorityIcon[viewTask.priority]} {viewTask.priority}
                                    </span>
                                </div>
                            </div>
                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-gray-400 block mb-1">{t("Start Date", "Start Date")}</span>
                                    <span className="text-sm text-gray-700">{formatDate(viewTask.startDate) || "-"}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 block mb-1">{t("Due Date", "Due Date")}</span>
                                    <span className={`text-sm ${isOverdue(viewTask.dueDate) && viewTask.status !== "completed" ? "text-red-500 font-medium" : "text-gray-700"}`}>
                                        {formatDate(viewTask.dueDate) || "-"}
                                    </span>
                                </div>
                            </div>
                            {/* ManDay + Sprint + Assignee */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-gray-400 block mb-1">{t("Man Day", "Man Day")}</span>
                                    <span className="text-sm text-gray-700">{viewTask.manDay ?? "-"}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 block mb-1">{t("Sprint", "Sprint")}</span>
                                    <span className="text-sm text-gray-700">{viewTask.sprintName || "-"}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block mb-1">{t("Assignee", "Assignee")}</span>
                                <span className="text-sm text-gray-700">{viewTask.assigneeName || t("Unassigned", "Unassigned")}</span>
                            </div>
                        </div>
                        {/* Footer */}
                        <div className="p-4 border-t bg-gray-50/50 flex justify-between items-center flex-shrink-0">
                            <span className="text-xs text-gray-400 flex items-center gap-1"><Lock className="w-3 h-3" /> {t("You are not a member of this project", "You are not a member of this project")}</span>
                            <button onClick={() => setViewTask(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                {t("Close", "Close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}  
        </div>
    );
}

/* ╔══════════════════════════════════════════════════════╗
   ║  TaskCard Component                                 ║
   ╚══════════════════════════════════════════════════════╝ */
function TaskCard({
    task, projectColor, isMember, onEdit, onView, onDelete, onDragStart, onDragEnd, formatDate, isOverdue, t
}: {
    task: TaskBoardItem;
    projectColor: string;
    isMember: boolean;
    onEdit: () => void;
    onView: () => void;
    onDelete: () => void;
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
    formatDate: (d?: string) => string | null;
    isOverdue: (d?: string) => boolean;
    t: (key: string, fallback: string) => string;
}) {
    const priority = PRIORITIES.find(p => p.value === task.priority);
    const overdue = task.status !== "completed" && isOverdue(task.dueDate);
    const initials = task.assigneeName
        ? task.assigneeName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
        : null;

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't trigger card click if user clicked on a button
        if ((e.target as HTMLElement).closest("button")) return;
        if (isMember) onEdit();
        else onView();
    };

    return (
        <div
            draggable={isMember}
            onDragStart={isMember ? onDragStart : undefined}
            onDragEnd={isMember ? onDragEnd : undefined}
            onClick={handleCardClick}
            className={`group bg-white rounded-xl p-3 sm:p-3.5 shadow-sm transition-all duration-150 cursor-pointer ${isMember ? "border border-gray-100 hover:shadow-md hover:border-gray-200 active:cursor-grabbing" : "border border-dashed border-gray-200 opacity-75 hover:opacity-100 hover:shadow-sm"}`}
            title={!isMember ? t("Click to view details", "Click to view details") : t("Click to edit", "Click to edit")}
        >
            {/* Project Badge + Lock icon */}
            <div className="flex items-center gap-1.5 mb-2">
                {task.projectName && (
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${projectColor}`}>
                        {task.projectName}
                    </span>
                )}
                {!isMember && (
                    <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                )}
            </div>

            {/* Title + Actions */}
            <div className="flex items-start justify-between gap-2">
                <h4 className={`text-sm font-medium flex-1 leading-snug ${isMember ? "text-gray-800" : "text-gray-500"}`}>{task.title}</h4>
                {isMember && (
                    <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={onEdit} className="p-1.5 sm:p-1 text-gray-400 hover:text-nv-violet rounded" title={t("Edit", "Edit")}><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={onDelete} className="p-1.5 sm:p-1 text-gray-400 hover:text-red-500 rounded" title={t("Delete", "Delete")}><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                )}
            </div>

            {/* Description */}
            {task.description && (
                <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{task.description}</p>
            )}

            {/* Task Type badge (from master data) */}
            {task.taskName && (
                <div className="mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-sky-50 text-sky-600 border border-sky-200">
                        📋 {task.taskName}
                    </span>
                </div>
            )}

            {/* Sprint badge */}
            {task.sprintName && (
                <div className="mt-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${task.sprintIsActive !== false ? "bg-indigo-50 text-indigo-600 border border-indigo-200" : "bg-gray-100 text-gray-400 border border-gray-200"}`}>
                        {task.sprintIsActive !== false ? "🏃" : "⏸"} {task.sprintName}
                    </span>
                </div>
            )}

            {/* Dates + ManDay */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
                {task.startDate && (
                    <span className="flex items-center gap-1 text-[10px] text-blue-400">
                        <Calendar className="w-3 h-3" /> {formatDate(task.startDate)}
                    </span>
                )}
                {task.startDate && task.dueDate && <span className="text-[10px] text-gray-300">→</span>}
                {task.dueDate && (
                    <span className={`flex items-center gap-1 text-[10px] ${overdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
                        <Clock className="w-3 h-3" /> {formatDate(task.dueDate)}
                    </span>
                )}
                {task.manDay != null && task.manDay > 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-teal-500 bg-teal-50 px-1.5 py-0.5 rounded-full border border-teal-100">
                        <Timer className="w-3 h-3" /> {task.manDay}d
                    </span>
                )}
            </div>

            {/* Priority + Assignee */}
            <div className="flex items-center justify-between mt-2 pt-2.5 border-t border-gray-50">
                <div className="flex items-center gap-2">
                    {priority && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${priority.color}`}>
                            {priorityIcon[task.priority]} {task.priority}
                        </span>
                    )}
                </div>
                {initials && (
                    <div className="w-6 h-6 rounded-full bg-nv-violet/10 text-nv-violet flex items-center justify-center text-[10px] font-bold" title={task.assigneeName}>
                        {initials}
                    </div>
                )}
            </div>
        </div>
    );
}
