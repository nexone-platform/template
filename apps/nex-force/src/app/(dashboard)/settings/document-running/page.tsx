"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDocumentRunning, useUpdateDocumentRunning, useDeleteDocumentRunning } from "@/hooks/use-document-running";
import { getUserProfile } from "@/lib/auth";
import { Edit, Trash2 } from "lucide-react";
import { useMessages } from "@/hooks/use-messages";
import { getApiErrorMessage } from "@/lib/api-error";
import {
    PageHeader, ModalWrapper, FormField, LoadingSpinner, EmptyState, PaginationBar, StatusBadge, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

export default function DocumentRunningPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showConfirm } = useMessages();
    const { data: documents, isLoading } = useDocumentRunning();
    const updateMutation = useUpdateDocumentRunning();
    const deleteMutation = useDeleteDocumentRunning();

    const [modalOpen, setModalOpen] = useState(false);
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<any>();

    const [page, setPage] = useState(1);
    const pageSize = 10;

    const openModal = (item?: any) => {
        if (item) {
            reset({
                documentId: item.documentId, documentType: item.documentType, description: item.description,
                prefix: item.prefix, formatDate: item.formatDate, suffix: item.suffix,
                digitNumber: item.digitNumber, running: item.running, isActive: item.isActive,
            });
        } else {
            reset({
                documentId: 0, documentType: "", description: "", prefix: "", formatDate: "",
                suffix: "", digitNumber: 4, running: 1, isActive: true,
            });
        }
        setModalOpen(true);
    };

    const onSubmit = (data: any) => {
        const username = getUserProfile() || "System";
        const now = new Date().toISOString();
        if (data.documentId === 0) { data.createDate = now; data.createBy = username; data.updateDate = null; }
        else { data.updateDate = now; data.updateBy = username; }

        updateMutation.mutate(data, {
            onSuccess: () => {
                showSuccess('SAVE_SUCCESS', 'Success!', 'Configuration saved successfully.');
                setModalOpen(false);
            },
            onError: (err) => {
                showError('SAVE_ERROR', 'Error!', getApiErrorMessage(err, "Failed to save."));
            },
        });
    };

    const confirmDelete = (id: number) => {
        showConfirm('DELETE_CONFIRM', () => {deleteMutation.mutate(id, {
                    onSuccess: () => showSuccess('DELETE_SUCCESS', 'Deleted!', 'Configuration deleted.'),
                    onError: () => showError('SAVE_ERROR', 'Error!', 'Failed to delete.'),
                });}, { fallbackTitle: 'Delete Configuration', fallbackMsg: 'Are you sure you want to delete?' });
    };

    const list = documents || [];
    const totalPages = Math.ceil(list.length / pageSize);
    const paginatedList = list.slice((page - 1) * pageSize, page * pageSize);

    const isEditing = watch("documentId") && watch("documentId") > 0;

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Document Running', 'Document Running')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" }, { label: t('Settings', 'Settings'), href: "/settings/company-settings" }, { label: t('Document Running', 'Document Running') }]}
                actionLabel={t('Add Configuration', 'Add Configuration')}
                onAction={() => openModal()}
            />

            <div className={ui.tableWrapper}>
                <div className="overflow-x-auto">
                    <table className={ui.table}>
                        <thead className={`${ui.thead} sticky top-0 z-10`}>
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-16">#</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Document Key', 'Document Key')}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Description', 'Description')}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Prefix', 'Prefix')}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Format Date', 'Format Date')}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Suffix', 'Suffix')}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('Digits', 'Digits')}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('Running', 'Running')}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('Status', 'Status')}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('Action', 'Action')}</th>
                            </tr>
                        </thead>
                        <tbody className={ui.tbody}>
                            {isLoading ? (
                                <LoadingSpinner colSpan={10} />
                            ) : paginatedList.length === 0 ? (
                                <EmptyState colSpan={10} />
                            ) : (
                                paginatedList.map((item: any, index: number) => (
                                    <tr key={item.documentId} className={ui.tr}>
                                        <td className={ui.tdIndex}>{(page - 1) * pageSize + index + 1}</td>
                                        <td className={ui.tdBold}>{item.documentType}</td>
                                        <td className={ui.td}>{item.description}</td>
                                        <td className={ui.td}>{item.prefix}</td>
                                        <td className={ui.td}>{item.formatDate}</td>
                                        <td className={ui.td}>{item.suffix}</td>
                                        <td className="px-4 py-3 text-center text-gray-600">{item.digitNumber}</td>
                                        <td className="px-4 py-3 text-center font-mono text-nv-violet font-medium">{item.running}</td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusBadge label={item.isActive ? "Active" : "Inactive"} variant={item.isActive ? "success" : "danger"} />
                                        </td>
                                        <td className={ui.tdActions}>
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openModal(item)} className="p-1.5 text-gray-400 hover:text-nv-violet hover:bg-nv-violet-light rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => confirmDelete(item.documentId)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {list.length > pageSize && (
                    <PaginationBar currentPage={page} totalPages={totalPages} totalData={list.length} pageSize={pageSize} onGoToPage={setPage} />
                )}
            </div>

            <ModalWrapper open={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? "Edit Configuration" : "Add Configuration"} maxWidth="max-w-2xl"
                footer={<>
                    <button onClick={() => setModalOpen(false)} className={ui.btnSecondary}>{t('Cancel', 'Cancel')}</button>
                    <button onClick={handleSubmit(onSubmit)} disabled={updateMutation.isPending} className={ui.btnPrimary}>
                        {updateMutation.isPending ? "Saving..." : "Submit"}
                    </button>
                </>}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Document Key', 'Document Key')} required error={errors.documentType ? "Required" : undefined}>
                            <input type="text" {...register("documentType", { required: true })} className={`${ui.input} ${errors.documentType ? "border-red-400" : ""}`} placeholder="e.g. INV, PO" />
                        </FormField>
                        <FormField label={t('Prefix', 'Prefix')}>
                            <input type="text" {...register("prefix")} className={ui.input} placeholder="e.g. INV-" />
                        </FormField>
                        <FormField label={t('Format Date', 'Format Date')}>
                            <input type="text" {...register("formatDate")} className={ui.input} placeholder="e.g. yyyyMM" />
                        </FormField>
                        <FormField label={t('Suffix', 'Suffix')}>
                            <input type="text" {...register("suffix")} className={ui.input} />
                        </FormField>
                        <FormField label={t('Digit Length', 'Digit Length')}>
                            <input type="number" {...register("digitNumber")} className={ui.input} placeholder="e.g. 4" />
                        </FormField>
                        <FormField label={t('Current Running', 'Current Running')}>
                            <input type="number" {...register("running")} className={ui.input} placeholder="e.g. 1" />
                        </FormField>
                    </div>
                    <FormField label={t('Description', 'Description')}>
                        <textarea {...register("description")} rows={2} className={ui.textarea} />
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
