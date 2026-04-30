"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useEmailTemplates, useUpdateEmailTemplate, useDeleteEmailTemplate } from "@/hooks/use-email";
import { getUserProfile } from "@/lib/auth";
import { Edit, Trash2, Search, Mail, Eye } from "lucide-react";
import { useMessages } from "@/hooks/use-messages";
import { getApiErrorMessage } from "@/lib/api-error";
import {
    PageHeader,
    ModalWrapper,
    FormField,
    StatusBadge,
    PaginationBar,
    LoadingSpinner,
    EmptyState,
    ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

export default function EmailTemplateSettingsPage() {
    const { t } = usePageTranslation();
    const { msg, showSuccess, showError, showConfirm } = useMessages();
    const { data: templates, isLoading } = useEmailTemplates();
    const updateMutation = useUpdateEmailTemplate();
    const deleteMutation = useDeleteEmailTemplate();

    const [modalOpen, setModalOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewContent, setPreviewContent] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<any>();

    const [page, setPage] = useState(1);
    const pageSize = 12;

    // --- Search / filter ---
    const filteredList = useMemo(() => {
        const list = templates || [];
        if (!searchTerm.trim()) return list;
        const q = searchTerm.toLowerCase();
        return list.filter((t: any) =>
            (t.templateCode || "").toLowerCase().includes(q) ||
            (t.title || "").toLowerCase().includes(q)
        );
    }, [templates, searchTerm]);

    const totalPages = Math.ceil(filteredList.length / pageSize);
    const paginatedList = filteredList.slice((page - 1) * pageSize, page * pageSize);

    // Reset page when search changes
    const handleSearch = (val: string) => {
        setSearchTerm(val);
        setPage(1);
    };

    // --- Modal open/close (Angular: addForm / patchForm) ---
    const openModal = (item?: any) => {
        if (item) {
            // patchForm — existing template (Angular disables templateCode for existing)
            reset({
                templateId: item.templateId,
                templateCode: item.templateCode,
                title: item.title,
                languageCode: item.languageCode || "en",
                emailContent: item.emailContent,
                isActive: item.isActive,
            });
        } else {
            // addForm — new template
            reset({
                templateId: 0,
                templateCode: "",
                title: "",
                languageCode: "en",
                emailContent: "",
                isActive: true,
            });
        }
        setModalOpen(true);
    };

    // --- Preview ---
    const openPreview = (item: any) => {
        setPreviewTitle(`${item.templateCode}: ${item.title}`);
        setPreviewContent(item.emailContent || "");
        setPreviewOpen(true);
    };

    // --- Submit (Angular: onSubmit) ---
    const onSubmit = (data: any) => {
        data.username = getUserProfile() || "System";
        updateMutation.mutate(data, {
            onSuccess: () => {
                showSuccess('SAVE_SUCCESS', 'Success!', 'Email template saved successfully.');
                setModalOpen(false);
            },
            onError: (error) => {
                showError('SAVE_ERROR', 'Error!', getApiErrorMessage(error, 'Failed to save email template.'));
            },
        });
    };

    // --- Delete (Angular: deleteData) ---
    const confirmDelete = (id: number) => {
        showConfirm('DELETE_CONFIRM', () => {
            deleteMutation.mutate(id, {
                onSuccess: () => showSuccess('DELETE_SUCCESS', 'Deleted!', 'Email template deleted successfully.'),
                onError: () => showError('DELETE_ERROR', 'Error!', 'Failed to delete email template.'),
            });
        }, { fallbackTitle: 'Delete Template', fallbackMsg: 'Are you sure you want to delete this template?' });
    };

    const isEditing = watch("templateId") && watch("templateId") > 0;

    return (
        <div className={ui.pageContainer}>
            {/* Page Header */}
            <PageHeader
                title={t('Email Templates', 'Email Templates')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Settings', 'Settings'), href: "/settings/company-settings" },
                    { label: t('Email Templates', 'Email Templates') },
                ]}
                actionLabel={t('Add Template', 'Add Template')}
                onAction={() => openModal()}
            />

            {/* Search & Stats Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('Search templates...', 'Search templates...')}
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className={`${ui.input} pl-9`}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail className="w-4 h-4" />
                        <span>{filteredList.length} template{filteredList.length !== 1 ? "s" : ""}</span>
                    </div>
                </div>
            </div>

            {/* Template Cards Grid */}
            {isLoading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <LoadingSpinner message="Loading templates..." />
                </div>
            ) : filteredList.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <EmptyState message={searchTerm ? "No templates match your search" : "No email templates found"} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paginatedList.map((item: any) => (
                        <div
                            key={item.templateId || item.id}
                            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg hover:border-nv-violet/20 transition-all duration-200 flex flex-col gap-3 group"
                        >
                            {/* Template Header */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-semibold text-nv-violet uppercase tracking-wide mb-1">
                                        {item.templateCode}
                                    </div>
                                    <div className="font-semibold text-gray-800 truncate" title={item.title}>
                                        {item.title || "Untitled Template"}
                                    </div>
                                </div>
                                <StatusBadge
                                    label={item.isActive ? "Active" : "Inactive"}
                                    variant={item.isActive ? "success" : "danger"}
                                    dot
                                />
                            </div>

                            {/* Language badge */}
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                    {item.languageCode?.toUpperCase() === "TH" ? "🇹🇭 Thai" : "🇬🇧 English"}
                                </span>
                            </div>

                            {/* Content preview */}
                            <div className="text-xs text-gray-400 line-clamp-2 min-h-[2rem]">
                                {item.emailContent
                                    ? item.emailContent.replace(/<[^>]*>/g, "").substring(0, 100) + (item.emailContent.length > 100 ? "..." : "")
                                    : "No content"}
                            </div>

                            {/* Actions */}
                            <div className="mt-auto pt-3 border-t border-gray-100 flex justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openPreview(item)}
                                    title={t('Preview', 'Preview')}
                                    className="p-2 text-gray-400 hover:text-nv-violet hover:bg-nv-violet-light rounded-lg transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => openModal(item)}
                                    title={t('Edit', 'Edit')}
                                    className="p-2 text-gray-400 hover:text-nv-violet hover:bg-nv-violet-light rounded-lg transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => confirmDelete(item.templateId)}
                                    title={t('Delete', 'Delete')}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {filteredList.length > pageSize && (
                <PaginationBar
                    currentPage={page}
                    totalPages={totalPages}
                    totalData={filteredList.length}
                    pageSize={pageSize}
                    onGoToPage={setPage}
                />
            )}

            {/* ─── Edit / Add Modal ─── */}
            <ModalWrapper
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={isEditing ? "Edit Email Template" : "Add Email Template"}
                maxWidth="max-w-2xl"
                footer={
                    <>
                        <button onClick={() => setModalOpen(false)} className={ui.btnSecondary}>{t('Cancel', 'Cancel')}</button>
                        <button
                            onClick={handleSubmit(onSubmit)}
                            disabled={updateMutation.isPending}
                            className={ui.btnPrimary}
                        >
                            {updateMutation.isPending ? "Saving..." : "Submit"}
                        </button>
                    </>
                }
            >
                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Template Code', 'Template Code')} required error={errors.templateCode ? msg('VAL_TEMPLATE_CODE_REQUIRED', 'Template Code is required') : undefined}>
                            <input
                                type="text"
                                {...register("templateCode", { required: true })}
                                disabled={isEditing}
                                className={isEditing ? ui.inputDisabled : `${ui.input} ${errors.templateCode ? "border-red-400" : ""}`}
                            />
                        </FormField>
                        <FormField label={t('Language', 'Language')}>
                            <select {...register("languageCode")} className={ui.select}>
                                <option value="en">🇬🇧 English</option>
                                <option value="th">🇹🇭 Thai</option>
                            </select>
                        </FormField>
                    </div>

                    <FormField label={t('Title', 'Title')} required error={errors.title ? msg('VAL_TITLE_REQUIRED', 'Title is required') : undefined}>
                        <input
                            type="text"
                            {...register("title", { required: true })}
                            className={`${ui.input} ${errors.title ? "border-red-400" : ""}`}
                        />
                    </FormField>

                    <FormField label={t('Email Content (HTML)', 'Email Content (HTML)')} required error={errors.emailContent ? msg('VAL_EMAIL_CONTENT_REQUIRED', 'Email content is required') : undefined}>
                        <textarea
                            {...register("emailContent", { required: true })}
                            rows={10}
                            className={`${ui.textarea} font-mono text-xs ${errors.emailContent ? "border-red-400" : ""}`}
                            style={{ minHeight: 180 }}
                        />
                        <p className="text-xs text-gray-400 mt-1.5">Supports HTML formatting tags. Use variables like {"{{name}}"} for dynamic content.</p>
                    </FormField>

                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700">Active</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" {...register("isActive")} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nv-violet"></div>
                        </label>
                        <span className="text-sm text-gray-500">{watch("isActive") ? "Active" : "Inactive"}</span>
                    </div>
                </div>
            </ModalWrapper>

            {/* ─── Preview Modal ─── */}
            <ModalWrapper
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                title={`Preview: ${previewTitle}`}
                maxWidth="max-w-3xl"
                footer={
                    <button onClick={() => setPreviewOpen(false)} className={ui.btnSecondary}>{t('Close', 'Close')}</button>
                }
            >
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 min-h-[200px]">
                    <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: previewContent || "<p class='text-gray-400'>No content to preview</p>" }}
                    />
                </div>
            </ModalWrapper>
        </div>
    );
}
