"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useBranchList, useCompanyList, useDeleteBranch, useUpdateBranch } from "@/hooks/use-organization";
import { getUserProfile } from "@/lib/auth";
import { Edit, Trash2 } from "lucide-react";
import { useMessages } from "@/hooks/use-messages";
import { getApiErrorMessage } from "@/lib/api-error";
import {
    PageHeader, ModalWrapper, FormField, LoadingSpinner, EmptyState, PaginationBar, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

export default function BranchSettingsPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showConfirm } = useMessages();
    const { data: branches, isLoading } = useBranchList();
    const { data: companies } = useCompanyList();
    const updateMutation = useUpdateBranch();
    const deleteMutation = useDeleteBranch();

    const [modalOpen, setModalOpen] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<any>();

    const [page, setPage] = useState(1);
    const pageSize = 10;

    const openModal = (item?: any) => {
        if (item) {
            reset({
                branchId: item.branchId, organizationId: item.organizationId,
                branchCode: item.branchCode, branchNameTh: item.branchNameTh, branchNameEn: item.branchNameEn,
                contactPerson: item.contactPerson, taxNo: item.taxNo, address: item.address,
                country: item.country, city: item.city, state: item.state, postalCode: item.postalCode,
                email: item.email, phone: item.phone, fax: item.fax, url: item.url,
            });
            setLogoPreview(item.logo || null);
            setLogoFile(null);
        } else {
            reset({
                branchId: "", organizationId: companies?.length === 1 ? companies[0].organizationId : "",
                branchCode: "", branchNameTh: "", branchNameEn: "", contactPerson: "", taxNo: "",
                address: "", country: "", city: "", state: "", postalCode: "",
                email: "", phone: "", fax: "", url: "",
            });
            setLogoPreview(null);
            setLogoFile(null);
        }
        setModalOpen(true);
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            const reader = new FileReader();
            reader.onload = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = (data: any) => {
        const formData = new FormData();
        const username = getUserProfile() || "";
        data.createBy = username;
        data.updateBy = username;
        data.isActive = true;
        for (const key in data) formData.append(key, data[key]);
        if (logoFile) formData.append("logoFile", logoFile, logoFile.name);

        updateMutation.mutate(formData, {
            onSuccess: () => {
                showSuccess('SAVE_SUCCESS', 'Success!', 'Branch saved successfully.');
                setModalOpen(false);
            },
            onError: (err) => {
                showError('SAVE_ERROR', 'Error!', getApiErrorMessage(err, "Failed to save branch."));
            },
        });
    };

    const confirmDelete = (id: number) => {
        showConfirm('DELETE_CONFIRM', () => {deleteMutation.mutate(id, {
                    onSuccess: () => showSuccess('DELETE_SUCCESS', 'Deleted!', 'Branch deleted.'),
                    onError: () => showError('SAVE_ERROR', 'Error!', 'Failed to delete.'),
                });}, { fallbackTitle: 'Delete Branch', fallbackMsg: 'Are you sure you want to delete this branch?' });
    };

    const list = branches || [];
    const totalPages = Math.ceil(list.length / pageSize);
    const paginatedList = list.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Branch Settings', 'Branch Settings')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" }, { label: t('Settings', 'Settings'), href: "/settings/company-settings" }, { label: t('Branch Settings', 'Branch Settings') }]}
                actionLabel={t('Add Branch', 'Add Branch')}
                onAction={() => openModal()}
            />

            <div className={ui.tableWrapper}>
                <div className="overflow-x-auto">
                    <table className={ui.table}>
                        <thead className={`${ui.thead} sticky top-0 z-10`}>
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-16">#</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Organization', 'Organization')}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Branch Code', 'Branch Code')}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Branch Name (TH)</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Branch Name (EN)</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Contact Person', 'Contact Person')}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('Action', 'Action')}</th>
                            </tr>
                        </thead>
                        <tbody className={ui.tbody}>
                            {isLoading ? (
                                <LoadingSpinner colSpan={7} />
                            ) : paginatedList.length === 0 ? (
                                <EmptyState colSpan={7} />
                            ) : (
                                paginatedList.map((item: any, index: number) => (
                                    <tr key={item.branchId} className={ui.tr}>
                                        <td className={ui.tdIndex}>{(page - 1) * pageSize + index + 1}</td>
                                        <td className={ui.td}>{item.organization?.organizationCode}: {item.organization?.organizationNameEn}</td>
                                        <td className={ui.tdBold}>{item.branchCode}</td>
                                        <td className={ui.td}>{item.branchNameTh}</td>
                                        <td className={ui.td}>{item.branchNameEn}</td>
                                        <td className={ui.td}>{item.contactPerson}</td>
                                        <td className={ui.tdActions}>
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openModal(item)} className="p-1.5 text-gray-400 hover:text-nv-violet hover:bg-nv-violet-light rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => confirmDelete(item.branchId)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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

            {/* Modal */}
            <ModalWrapper open={modalOpen} onClose={() => setModalOpen(false)} title={t('Branch Details', 'Branch Details')} maxWidth="max-w-4xl"
                footer={<>
                    <button onClick={() => setModalOpen(false)} className={ui.btnSecondary}>{t('Cancel', 'Cancel')}</button>
                    <button onClick={handleSubmit(onSubmit)} disabled={updateMutation.isPending} className={ui.btnPrimary}>
                        {updateMutation.isPending ? "Saving..." : "Submit"}
                    </button>
                </>}
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Organization', 'Organization')} required error={errors.organizationId ? "Required" : undefined}>
                            <select {...register("organizationId", { required: true })} className={`${ui.select} ${errors.organizationId ? "border-red-400" : ""}`}>
                                <option value="">{t('Select Company', 'Select Company')}</option>
                                {companies?.map((c: any) => (<option key={c.organizationId} value={c.organizationId}>{c.organizationCode}: {c.organizationNameEn}</option>))}
                            </select>
                        </FormField>
                        <FormField label={t('Branch Code', 'Branch Code')} required error={errors.branchCode ? "Required" : undefined}>
                            <input type="text" {...register("branchCode", { required: true })} className={`${ui.input} ${errors.branchCode ? "border-red-400" : ""}`} />
                        </FormField>
                        <FormField label={t('Branch Name (TH)', 'Branch Name (TH)')} required error={errors.branchNameTh ? "Required" : undefined}>
                            <input type="text" {...register("branchNameTh", { required: true })} className={`${ui.input} ${errors.branchNameTh ? "border-red-400" : ""}`} />
                        </FormField>
                        <FormField label={t('Branch Name (EN)', 'Branch Name (EN)')} required error={errors.branchNameEn ? "Required" : undefined}>
                            <input type="text" {...register("branchNameEn", { required: true })} className={`${ui.input} ${errors.branchNameEn ? "border-red-400" : ""}`} />
                        </FormField>
                        <FormField label={t('Contact Person', 'Contact Person')} required error={errors.contactPerson ? "Required" : undefined}>
                            <input type="text" {...register("contactPerson", { required: true })} className={`${ui.input} ${errors.contactPerson ? "border-red-400" : ""}`} />
                        </FormField>
                        <FormField label={t('Tax Number', 'Tax Number')} required error={errors.taxNo ? "Required" : undefined}>
                            <input type="text" {...register("taxNo", { required: true })} className={`${ui.input} ${errors.taxNo ? "border-red-400" : ""}`} />
                        </FormField>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                        <FormField label={t('Address', 'Address')}><input type="text" {...register("address")} className={ui.input} /></FormField>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                            <FormField label={t('Country', 'Country')}><input type="text" {...register("country")} className={ui.input} /></FormField>
                            <FormField label={t('City', 'City')}><input type="text" {...register("city")} className={ui.input} /></FormField>
                            <FormField label={t('State/Province', 'State/Province')}><input type="text" {...register("state")} className={ui.input} /></FormField>
                            <FormField label={t('Postal Code', 'Postal Code')}><input type="text" {...register("postalCode")} className={ui.input} /></FormField>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Email', 'Email')}><input type="email" {...register("email")} className={ui.input} /></FormField>
                        <FormField label={t('Phone', 'Phone')}><input type="text" {...register("phone")} className={ui.input} /></FormField>
                        <FormField label={t('Fax', 'Fax')}><input type="text" {...register("fax")} className={ui.input} /></FormField>
                        <FormField label={t('Website URL', 'Website URL')}><input type="text" {...register("url")} className={ui.input} /></FormField>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex gap-6 items-center">
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700 block mb-2">Light Logo</label>
                                <input type="file" accept="image/png, image/jpeg" onChange={handleLogoChange}
                                    className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-nv-violet-light file:text-nv-violet-dark hover:file:bg-nv-violet-light" />
                                <span className="text-gray-400 text-xs block mt-1">Recommended size 40x40px</span>
                            </div>
                            {logoPreview && <img src={logoPreview} alt="Logo" className="w-20 h-20 object-contain border rounded-lg bg-gray-50 p-1" />}
                        </div>
                    </div>
                </div>
            </ModalWrapper>
        </div>
    );
}
