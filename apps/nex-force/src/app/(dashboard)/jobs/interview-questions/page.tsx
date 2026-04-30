"use client";

import { useState, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import apiClient from "@/lib/api-client";
import { getUserProfile } from "@/lib/auth";
import { useMessages } from "@/hooks/use-messages";
import {
    PageHeader, TableHeaderBar, SortableTh, ActionButtons, EmptyState,
    LoadingSpinner, PaginationBar, ModalWrapper, FormField, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

/* ── Types ── */
interface QuestionRow {
    questionsId?: number; categoryId?: number; categoryDescription?: string;
    positionId?: number; question: string; optionA: string; optionB: string;
    optionC: string; optionD: string; correctAns: string;
    codeSnippets?: string; ansExplanation?: string; videoLink?: string; imgPath?: string;
}

interface QuestionForm {
    questionsId?: number; categoryId: string; positionId: string; question: string;
    optionA: string; optionB: string; optionC: string; optionD: string; correctAns: string;
    codeSnippets: string; ansExplanation: string; videoLink: string;
}



const defaultFormValues: QuestionForm = {
    questionsId: 0, categoryId: "", positionId: "", question: "", optionA: "", optionB: "",
    optionC: "", optionD: "", correctAns: "", codeSnippets: "", ansExplanation: "", videoLink: "",
};

/* ── Page ── */
export default function InterviewQuestionsPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showWarning } = useMessages();
    const queryClient = useQueryClient();
    const userProfile = getUserProfile();

    const columns = [
        { key: "#", label: "#", width: "w-14" },
        { key: "categoryDescription", label: t('Category', 'Category'), sortable: true },
        { key: "question", label: t('Questions', 'Questions'), sortable: true },
        { key: "optionA", label: t('Option A', 'Option A') },
        { key: "optionB", label: t('Option B', 'Option B') },
        { key: "optionC", label: t('Option C', 'Option C') },
        { key: "optionD", label: t('Option D', 'Option D') },
        { key: "correctAns", label: t('Answer', 'Answer'), sortable: true, align: "center" as const },
        { key: "action", label: t('Actions', 'Actions'), align: "center" as const },
    ];

    /* State */
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [searchCategory, setSearchCategory] = useState("");
    const [searchPosition, setSearchPosition] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortKey, setSortKey] = useState("");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [editPreviewImage, setEditPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);
    const [categoryDesc, setCategoryDesc] = useState("");

    /* Master data */
    const { data: positionJobOptions } = useQuery({
        queryKey: ["iqPositions"],
        queryFn: async () => { const { data } = await apiClient.get<any>("manageJobs/getAllDesignation"); return data || []; },
    });
    const { data: categoryOptions, refetch: refetchCategories } = useQuery({
        queryKey: ["iqCategories"],
        queryFn: async () => { const { data } = await apiClient.get<any>("interviewQuestions/getAllCategory"); return data || []; },
    });

    /* Table data */
    const { data: tableData, isLoading } = useQuery({
        queryKey: ["interviewQuestions"],
        queryFn: async () => { const { data } = await apiClient.get<any>("interviewQuestions/getAllQuestion"); return data; },
    });

    /* Search */
    const [searchResults, setSearchResults] = useState<any>(null);
    const handleSearch = async () => {
        try {
            const { data } = await apiClient.post<any>("interviewQuestions/searchQuestion", {
                question: null, position: searchPosition || null, categoryId: searchCategory || null,
            });
            let rows: any[] = [];
            if (Array.isArray(data)) rows = data;
            else if (Array.isArray(data?.data)) rows = data.data;
            else if (data) rows = [data];
            setSearchResults(rows); setCurrentPage(1);
        } catch { showError('SAVE_ERROR', 'Error!', 'Search failed.'); }
    };
    const handleClear = () => { setSearchCategory(""); setSearchPosition(""); setSearchResults(null); setCurrentPage(1); };

    /* Forms */
    const addForm = useForm<QuestionForm>({ defaultValues: { ...defaultFormValues } });
    const editForm = useForm<QuestionForm>({ defaultValues: { ...defaultFormValues } });

    /* Mutations */
    const saveMutation = useMutation({
        mutationFn: async (fd: FormData) => { const { data } = await apiClient.post("interviewQuestions/updateQuestion", fd); return data; },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["interviewQuestions"] }); showSuccess('SAVE_SUCCESS', 'Success!', 'Question saved successfully.'); },
        onError: () => { showError('SAVE_ERROR', 'Error!', 'Error saving Question.'); },
    });
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => { const { data } = await apiClient.delete(`interviewQuestions/delete?id=${id}`); return data; },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["interviewQuestions"] }); showSuccess('SAVE_SUCCESS', 'Success!', 'Question deleted.'); },
        onError: () => { showError('SAVE_ERROR', 'Error!', 'Failed to delete question.'); },
    });
    const categorySaveMutation = useMutation({
        mutationFn: async (payload: any) => { const { data } = await apiClient.post("interviewQuestions/updateCategory", payload); return data; },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["interviewQuestions"] }); refetchCategories();
            setCategoryModalOpen(false); setCategoryDesc("");
            showSuccess('SAVE_SUCCESS', 'Success!', 'Category saved.');
        },
        onError: () => { showError('SAVE_ERROR', 'Error!', 'Error saving category.'); },
    });

    /* Data processing */
    const rows = useMemo(() => {
        if (searchResults) return searchResults;
        const raw = tableData?.data ?? [];
        return Array.isArray(raw) ? raw : [];
    }, [searchResults, tableData]);

    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
    };
    const sorted = useMemo(() => {
        const d = [...rows]; if (!sortKey) return d;
        return d.sort((a: any, b: any) => ((a[sortKey] ?? "") < (b[sortKey] ?? "") ? -1 : 1) * (sortDir === "asc" ? 1 : -1));
    }, [rows, sortKey, sortDir]);

    const totalData = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalData / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const startIdx = (safePage - 1) * pageSize;
    const paginatedData = sorted.slice(startIdx, startIdx + pageSize);

    /* File handler */
    const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        setSelectedFile(file);
        const reader = new FileReader(); reader.readAsDataURL(file);
        reader.onload = () => setEditPreviewImage(reader.result as string);
    };

    /* Open modals */
    const openAddModal = () => { addForm.reset({ ...defaultFormValues }); setSelectedFile(null); setEditPreviewImage(null); setAddModalOpen(true); };
    const openEditModal = (row: QuestionRow) => {
        editForm.reset({
            questionsId: row.questionsId ?? 0, categoryId: String(row.categoryId ?? ""),
            positionId: String(row.positionId ?? ""), question: row.question ?? "",
            optionA: row.optionA ?? "", optionB: row.optionB ?? "",
            optionC: row.optionC ?? "", optionD: row.optionD ?? "",
            correctAns: row.correctAns ?? "", codeSnippets: row.codeSnippets ?? "",
            ansExplanation: row.ansExplanation ?? "", videoLink: row.videoLink ?? "",
        });
        setSelectedFile(null); setEditPreviewImage(null); setEditModalOpen(true);
    };

    /* Save handlers */
    const onSaveAdd = (formValue: QuestionForm) => {
        const fd = new FormData();
        Object.entries(formValue).forEach(([k, v]) => { if (v != null) fd.append(k, String(v)); });
        fd.append("username", userProfile || "");
        if (selectedFile) fd.append("imgFile", selectedFile);
        saveMutation.mutate(fd, { onSuccess: () => { setAddModalOpen(false); addForm.reset(); } });
    };
    const onSaveEdit = (formValue: QuestionForm) => {
        const fd = new FormData();
        fd.append("questionsId", String(formValue.questionsId));
        fd.append("categoryId", String(formValue.categoryId)); fd.append("positionId", String(formValue.positionId));
        fd.append("question", formValue.question);
        fd.append("optionA", formValue.optionA); fd.append("optionB", formValue.optionB);
        fd.append("optionC", formValue.optionC); fd.append("optionD", formValue.optionD);
        fd.append("correctAns", formValue.correctAns); fd.append("codeSnippets", formValue.codeSnippets || "");
        fd.append("ansExplanation", formValue.ansExplanation || ""); fd.append("videoIink", formValue.videoLink || "");
        fd.append("updateBy", userProfile || "");
        if (selectedFile) fd.append("imgFile", selectedFile);
        saveMutation.mutate(fd, { onSuccess: () => { setEditModalOpen(false); editForm.reset(); } });
    };

    /* Delete */
    const handleDelete = (row: QuestionRow) => {
        showWarning('REQUIRED_FIELDS', 'Delete', 'Are you sure want to delete?')
            .then(r => { if (r.isConfirmed && row.questionsId) deleteMutation.mutate(row.questionsId); });
    };

    /* Save Category */
    const handleSaveCategory = () => {
        if (!categoryDesc.trim()) return;
        categorySaveMutation.mutate({ categoryId: 0, categoryDescription: categoryDesc });
    };

    /* Shared question form */
    const renderQuestionForm = (form: ReturnType<typeof useForm<QuestionForm>>, onSubmit: (v: QuestionForm) => void, isEdit: boolean) => (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {isEdit && <input type="hidden" {...form.register("questionsId")} />}
            <div className="grid grid-cols-2 gap-4">
                <FormField label={t('Category', 'Category')} required>
                    <select {...form.register("categoryId", { required: true })} className={`${ui.select} ${form.formState.errors.categoryId ? "border-red-500" : ""}`}>
                        <option value="">{t('Select', 'Select')}</option>
                        {(categoryOptions || []).map((c: any) => <option key={c.categoryId} value={c.categoryId}>{c.categoryDescription}</option>)}
                    </select>
                </FormField>
                <FormField label={t('Position', 'Position')} required>
                    <select {...form.register("positionId", { required: true })} className={`${ui.select} ${form.formState.errors.positionId ? "border-red-500" : ""}`}>
                        <option value="">{t('Select', 'Select')}</option>
                        {(positionJobOptions || []).map((p: any) => <option key={p.designation_id} value={p.designation_id}>{p.designation_code || p.designation_name_en}</option>)}
                    </select>
                </FormField>
            </div>
            <FormField label={t('Question', 'Question')} required>
                <textarea {...form.register("question", { required: true })} rows={2} className={`${ui.textarea} ${form.formState.errors.question ? "border-red-500" : ""}`} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
                {(["optionA", "optionB", "optionC", "optionD"] as const).map(opt => (
                    <FormField key={opt} label={opt.replace("option", "Option ")} required>
                        <input {...form.register(opt, { required: true })} className={`${ui.input} ${form.formState.errors[opt] ? "border-red-500" : ""}`} />
                    </FormField>
                ))}
            </div>
            <FormField label={t('Correct Answer', 'Correct Answer')} required>
                <select {...form.register("correctAns", { required: true })} className={`${ui.select} ${form.formState.errors.correctAns ? "border-red-500" : ""}`}>
                    <option value="">-</option>
                    <option value="A">{t('Option A', 'Option A')}</option><option value="B">Option B</option>
                    <option value="C">{t('Option C', 'Option C')}</option><option value="D">Option D</option>
                </select>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
                <FormField label={t('Code Snippets', 'Code Snippets')}><textarea {...form.register("codeSnippets")} rows={2} className={ui.textarea} /></FormField>
                <FormField label={t('Answer Explanation', 'Answer Explanation')}><textarea {...form.register("ansExplanation")} rows={2} className={ui.textarea} /></FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField label={t('Video Link', 'Video Link')}><input {...form.register("videoLink")} className={ui.input} /></FormField>
                <FormField label={t('Image', 'Image')}>
                    <input type="file" accept="image/*" onChange={onFileSelected} ref={isEdit ? editFileInputRef : fileInputRef} className={ui.input} />
                    {editPreviewImage && <img src={editPreviewImage} alt="preview" className="mt-2 max-h-24 rounded border" />}
                </FormField>
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => isEdit ? setEditModalOpen(false) : setAddModalOpen(false)} className={ui.btnSecondary}>{t('Cancel', 'Cancel')}</button>
                <button type="submit" disabled={saveMutation.isPending} className={ui.btnPrimary}>
                    {saveMutation.isPending ? "Saving..." : "Save"}
                </button>
            </div>
        </form>
    );

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Interview Questions', 'Interview Questions')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" }, { label: t('Jobs', 'Jobs') }, { label: t('Interview Questions', 'Interview Questions') }]}
                actionLabel={t('Add Question', 'Add Question')}
                onAction={openAddModal}
                actionIcon={<Plus className="w-4 h-4" />}
                extra={
                    <button onClick={() => setCategoryModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-nv-warn text-white rounded-lg hover:bg-nv-warn/90 transition font-medium text-sm">
                        <Plus className="w-4 h-4" /> Add Category
                    </button>
                }
            />

            {/* Search Filter */}
            <div className={ui.tableWrapper + " mb-6 !overflow-visible"}>
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <FormField label={t('Category', 'Category')}>
                            <select value={searchCategory} onChange={e => setSearchCategory(e.target.value)} className={ui.select}>
                                <option value="">{t('Select', 'Select')}</option>
                                {(categoryOptions || []).map((c: any) => <option key={c.categoryId} value={c.categoryId}>{c.categoryDescription}</option>)}
                            </select>
                        </FormField>
                        <FormField label={t('Position', 'Position')}>
                            <select value={searchPosition} onChange={e => setSearchPosition(e.target.value)} className={ui.select}>
                                <option value="">{t('Select', 'Select')}</option>
                                {(positionJobOptions || []).map((p: any) => <option key={p.designation_id} value={p.designation_id}>{p.designation_code || p.designation_name_en}</option>)}
                            </select>
                        </FormField>
                        <button onClick={handleSearch} className={ui.btnPrimary + " h-[42px]"}>{t('Search', 'Search')}</button>
                        <button onClick={handleClear} className={ui.btnSecondary + " h-[42px]"}>{t('Clear', 'Clear')}</button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className={ui.tableWrapper}>
                <TableHeaderBar pageSize={pageSize} onPageSizeChange={(v) => { setPageSize(v); setCurrentPage(1); }} />
                {isLoading ? <LoadingSpinner /> : (
                    <div className="overflow-x-auto">
                        <table className={`${ui.table} min-w-[1100px]`}>
                            <thead className={ui.thead}>
                                <tr>{columns.map(col => <SortableTh key={col.key} column={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />)}</tr>
                            </thead>
                            <tbody className={ui.tbody}>
                                {paginatedData.length === 0 ? <EmptyState colSpan={9} /> : paginatedData.map((row: any, idx: number) => (
                                    <tr key={row.questionsId || idx} className={ui.tr}>
                                        <td className={ui.tdIndex}>{startIdx + idx + 1}</td>
                                        <td className={ui.td}>{row.categoryDescription}</td>
                                        <td className={ui.td + " max-w-[200px] truncate"} title={row.question}>{row.question}</td>
                                        <td className={ui.td + " max-w-[100px] truncate"}>{row.optionA}</td>
                                        <td className={ui.td + " max-w-[100px] truncate"}>{row.optionB}</td>
                                        <td className={ui.td + " max-w-[100px] truncate"}>{row.optionC}</td>
                                        <td className={ui.td + " max-w-[100px] truncate"}>{row.optionD}</td>
                                        <td className="px-4 py-3 text-sm text-center font-semibold text-nv-violet">{row.correctAns}</td>
                                        <td className={ui.tdActions}>
                                            <ActionButtons onEdit={() => openEditModal(row)} onDelete={() => handleDelete(row)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <PaginationBar currentPage={safePage} totalPages={totalPages} totalData={totalData} pageSize={pageSize} onGoToPage={setCurrentPage} />
            </div>

            {/* Add Question Modal */}
            <ModalWrapper open={addModalOpen} onClose={() => setAddModalOpen(false)} title={t('Add Question', 'Add Question')} maxWidth="max-w-3xl">
                {renderQuestionForm(addForm, onSaveAdd, false)}
            </ModalWrapper>

            {/* Edit Question Modal */}
            <ModalWrapper open={editModalOpen} onClose={() => setEditModalOpen(false)} title={t('Edit Question', 'Edit Question')} maxWidth="max-w-3xl">
                {renderQuestionForm(editForm, onSaveEdit, true)}
            </ModalWrapper>

            {/* Add Category Modal */}
            <ModalWrapper
                open={categoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
                title={t('Add Category', 'Add Category')}
                maxWidth="max-w-md"
                footer={
                    <>
                        <button onClick={() => setCategoryModalOpen(false)} className={ui.btnSecondary}>{t('Cancel', 'Cancel')}</button>
                        <button onClick={handleSaveCategory} disabled={categorySaveMutation.isPending} className={ui.btnPrimary}>
                            {categorySaveMutation.isPending ? "Saving..." : "Save"}
                        </button>
                    </>
                }
            >
                <FormField label={t('Category Name', 'Category Name')} required>
                    <input value={categoryDesc} onChange={e => setCategoryDesc(e.target.value)} className={ui.input} placeholder="Category description" />
                </FormField>
            </ModalWrapper>
        </div>
    );
}
