"use client";

import { useEffect,  useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMessages } from "@/hooks/use-messages";
import apiClient from "@/lib/api-client";
import { ROUTES } from "@/lib/routes";
import {
    PageHeader, TableHeaderBar, SortableTh, ActionButtons,
    EmptyState, LoadingSpinner, PaginationBar, ModalWrapper, FormField, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";
import { useSystemConfig } from '@nexone/ui';

interface Task {
    taskId: number;
    taskCode: string;
    taskNameTh: string;
    taskNameEn: string | null;
    isActive: boolean;
    createDate?: string | null;
    createBy?: string | null;
    updateDate?: string | null;
    updateBy?: string | null;
}

export default function TasksPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showWarning } = useMessages();

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "taskCode", label: t('Task Code', 'Task Code'), sortable: true },
    { key: "taskNameTh", label: t('Task Name (TH)', 'Task Name (TH)'), sortable: true },
    { key: "taskNameEn", label: t('Task Name (EN)', 'Task Name (EN)'), sortable: true },
    { key: "action", label: t('Actions', 'Actions'), align: "right" as const },
    ];

    const queryClient = useQueryClient();

    // ---------- Data Fetch ----------
    const { data: taskResult, isLoading } = useQuery({
        queryKey: ["tasks"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("tasks");
            return data;
        },
    });

    // ---------- Update ----------
    const updateMutation = useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await apiClient.post<any>("tasks/update", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            showSuccess('SAVE_SUCCESS', 'Success!', 'Tasks saved successfully.');
            setModalOpen(false);
            resetForm();
        },
        onError: () => showError('SAVE_ERROR', 'Error!', 'Error saving Tasks.'),
    });

    // ---------- Delete ----------
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete<any>(`tasks/delete?id=${id}`);
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            showSuccess('SAVE_SUCCESS', 'Success!', res?.message || "Deleted successfully.");
        },
        onError: () => showError('SAVE_ERROR', 'Error!', 'Error deleting Tasks.'),
    });

    // ---------- State ----------
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        taskId: 0,
        taskCode: "",
        taskNameTh: "",
        taskNameEn: "",
    });
    const [touched, setTouched] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
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

    // ---------- Data normalize ----------
    const allTasks: Task[] = useMemo(() => {
        const raw = taskResult?.data;
        return Array.isArray(raw) ? (raw as Task[]) : [];
    }, [taskResult]);

    // ---------- Client-side search ----------
    const filteredTasks = useMemo(() => {
        if (!searchText.trim()) return allTasks;
        const f = searchText.trim().toLowerCase();
        return allTasks.filter(
            (t) =>
                (t.taskCode || "").toLowerCase().includes(f) ||
                (t.taskNameTh || "").toLowerCase().includes(f) ||
                (t.taskNameEn || "").toLowerCase().includes(f)
        );
    }, [allTasks, searchText]);

    // ---------- Sorting ----------
    const sortedTasks = useMemo(() => {
        const source = Array.isArray(filteredTasks) ? filteredTasks : [];
        if (!sortKey) return source;
        return [...source].sort((a: any, b: any) => {
            const aVal = a[sortKey] ?? "";
            const bVal = b[sortKey] ?? "";
            return (aVal < bVal ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
        });
    }, [filteredTasks, sortKey, sortDir]);

    const totalData = Array.isArray(sortedTasks) ? sortedTasks.length : 0;
    const totalPages = Math.max(1, Math.ceil(totalData / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const paginatedData = Array.isArray(sortedTasks) ? sortedTasks.slice(startIndex, startIndex + pageSize) : [];

    // ---------- Form helpers ----------
    const resetForm = () => {
        setFormData({ taskId: 0, taskCode: "", taskNameTh: "", taskNameEn: "" });
        setTouched(false);
    };

    const openAdd = () => {
        resetForm();
        setModalOpen(true);
    };

    const openEdit = (item: Task) => {
        setFormData({
            taskId: item.taskId,
            taskCode: item.taskCode,
            taskNameTh: item.taskNameTh,
            taskNameEn: item.taskNameEn || "",
        });
        setTouched(false);
        setModalOpen(true);
    };

    const handleSubmitForm = () => {
        setTouched(true);
        if (!formData.taskCode || !formData.taskNameTh || !formData.taskNameEn) return;
        const userProfile = typeof window !== "undefined" ? localStorage.getItem("userProfile") || "" : "";
        updateMutation.mutate({ ...formData, username: userProfile });
    };

    const handleDelete = (id: number) => {
        showWarning('REQUIRED_FIELDS', 'Delete Task', 'Are you sure want to delete?').then((result) => { if (result.isConfirmed) deleteMutation.mutate(id); });
    };

    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Tasks', 'Tasks')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard }, { label: t('Tasks', 'Tasks') }]}
                actionLabel={t('Add', 'Add')}
                onAction={openAdd}
            />

            <div className={ui.tableWrapper}>
                <TableHeaderBar
                    pageSize={pageSize}
                    onPageSizeChange={(v) => { setPageSize(v); setCurrentPage(1); }}
                    searchText={searchText}
                    onSearchChange={(v) => { setSearchText(v); setCurrentPage(1); }}
                />

                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="overflow-x-auto">
                        <table className={ui.table}>
                            <thead className={ui.thead}>
                                <tr>
                                    {tableColumns.map((col) => (
                                        <SortableTh key={col.key} column={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                    ))}
                                </tr>
                            </thead>
                            <tbody className={ui.tbody}>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item: any, idx: number) => (
                                        <tr key={item.taskId || idx} className={ui.tr}>
                                            <td className={ui.tdIndex}>{startIndex + idx + 1}</td>
                                            <td className={ui.tdBold}>{item.taskCode}</td>
                                            <td className={ui.td}>{item.taskNameTh}</td>
                                            <td className={ui.td}>{item.taskNameEn}</td>
                                            <td className={ui.tdActions}>
                                                <ActionButtons onEdit={() => openEdit(item)} onDelete={() => handleDelete(item.taskId)} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <EmptyState colSpan={5} />
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

            <ModalWrapper
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={formData.taskId ? "Edit Task" : "Add Task"}
                maxWidth="max-w-md"
                footer={
                    <>
                        <button onClick={() => setModalOpen(false)} className={ui.btnSecondary}>{t('Cancel', 'Cancel')}</button>
                        <button onClick={handleSubmitForm} disabled={updateMutation.isPending} className={ui.btnPrimary}>
                            {updateMutation.isPending ? "Saving..." : "Submit"}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <FormField label={t('Task Code', 'Task Code')} required error={touched && !formData.taskCode ? "* Required" : undefined}>
                        <input type="text" value={formData.taskCode} onChange={(e) => setFormData({ ...formData, taskCode: e.target.value })}
                            className={`${ui.input} ${touched && !formData.taskCode ? "border-red-400" : ""}`} disabled={!!formData.taskId} />
                    </FormField>
                    <FormField label={t('Task Name (TH)', 'Task Name (TH)')} required error={touched && !formData.taskNameTh ? "* Required" : undefined}>
                        <input type="text" value={formData.taskNameTh} onChange={(e) => setFormData({ ...formData, taskNameTh: e.target.value })}
                            className={`${ui.input} ${touched && !formData.taskNameTh ? "border-red-400" : ""}`} />
                    </FormField>
                    <FormField label={t('Task Name (EN)', 'Task Name (EN)')} required error={touched && !formData.taskNameEn ? "* Required" : undefined}>
                        <input type="text" value={formData.taskNameEn} onChange={(e) => setFormData({ ...formData, taskNameEn: e.target.value })}
                            className={`${ui.input} ${touched && !formData.taskNameEn ? "border-red-400" : ""}`} />
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
