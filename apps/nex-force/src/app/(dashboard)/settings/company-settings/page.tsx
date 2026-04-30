"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useCompany, useUpdateCompany } from "@/hooks/use-organization";
import { getUserProfile } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";
import { useMessages } from "@/hooks/use-messages";
import { getApiErrorMessage } from "@/lib/api-error";
import {
    PageHeader, LoadingSpinner, FormField, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

export default function CompanySettingsPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError } = useMessages();
    const { data: company, isLoading } = useCompany();
    const updateMutation = useUpdateCompany();

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<any>();

    useEffect(() => {
        if (company) {
            reset({
                organizationId: company.organizationId || "",
                organizationCode: company.organizationCode || "",
                taxNo: company.taxNo || "",
                organizationNameTh: company.organizationNameTh || "",
                organizationNameEn: company.organizationNameEn || "",
                contactPerson: company.contactPerson || "",
                address: company.address || "",
                country: company.country || "",
                city: company.city || "",
                state: company.state || "",
                postalCode: company.postalCode || "",
                email: company.email || "",
                phone: company.phone || "",
                fax: company.fax || "",
                url: company.url || "",
            });
            if (company.logo) setLogoPreview(company.logo);
            if (company.favicon) setFaviconPreview(company.favicon);
        }
    }, [company, reset]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            const reader = new FileReader();
            reader.onload = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFaviconFile(file);
            const reader = new FileReader();
            reader.onload = () => setFaviconPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = (data: any) => {
        const formData = new FormData();
        const username = getUserProfile() || "";

        data.createBy = username;
        data.updateBy = username;
        data.isActive = company?.isActive ?? true;

        for (const key in data) {
            formData.append(key, data[key]);
        }

        if (logoFile) formData.append("logoFile", logoFile, logoFile.name);
        if (faviconFile) formData.append("faviconFile", faviconFile, faviconFile.name);

        updateMutation.mutate(formData, {
            onSuccess: () => showSuccess('SAVE_SUCCESS', 'Success!', 'Company settings saved.'),
            onError: (err) => showError('SAVE_ERROR', 'Error!', getApiErrorMessage(err, "Failed to save.")),
        });
    };

    if (isLoading) return <div className={ui.pageContainer}><LoadingSpinner /></div>;

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Company Settings', 'Company Settings')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard }, { label: t('Company Settings', 'Company Settings') }]}
            />

            <div className={ui.tableWrapper}>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Company Information */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Company Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={t('Company Code', 'Company Code')} required>
                                <input {...register("organizationCode", { required: true })} className={`${ui.input} ${errors.organizationCode ? "border-red-400" : ""}`} />
                                {errors.organizationCode && <p className="text-xs text-red-500 mt-1">* Required</p>}
                            </FormField>
                            <FormField label={t('Tax Number', 'Tax Number')} required>
                                <input {...register("taxNo", { required: true })} className={`${ui.input} ${errors.taxNo ? "border-red-400" : ""}`} />
                                {errors.taxNo && <p className="text-xs text-red-500 mt-1">* Required</p>}
                            </FormField>
                            <FormField label={t('Company Name (TH)', 'Company Name (TH)')} required>
                                <input {...register("organizationNameTh", { required: true })} className={`${ui.input} ${errors.organizationNameTh ? "border-red-400" : ""}`} />
                                {errors.organizationNameTh && <p className="text-xs text-red-500 mt-1">* Required</p>}
                            </FormField>
                            <FormField label={t('Company Name (EN)', 'Company Name (EN)')} required>
                                <input {...register("organizationNameEn", { required: true })} className={`${ui.input} ${errors.organizationNameEn ? "border-red-400" : ""}`} />
                                {errors.organizationNameEn && <p className="text-xs text-red-500 mt-1">* Required</p>}
                            </FormField>
                            <FormField label={t('Contact Person', 'Contact Person')} required>
                                <input {...register("contactPerson", { required: true })} className={`${ui.input} ${errors.contactPerson ? "border-red-400" : ""}`} />
                                {errors.contactPerson && <p className="text-xs text-red-500 mt-1">* Required</p>}
                            </FormField>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Address</h3>
                        <div className="space-y-4">
                            <FormField label={t('Address', 'Address')}>
                                <input {...register("address")} className={ui.input} />
                            </FormField>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <FormField label={t('Country', 'Country')}>
                                    <input {...register("country")} className={ui.input} />
                                </FormField>
                                <FormField label={t('City', 'City')}>
                                    <input {...register("city")} className={ui.input} />
                                </FormField>
                                <FormField label={t('State/Province', 'State/Province')}>
                                    <input {...register("state")} className={ui.input} />
                                </FormField>
                                <FormField label={t('Postal Code', 'Postal Code')}>
                                    <input {...register("postalCode")} className={ui.input} />
                                </FormField>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={t('Email', 'Email')}>
                                <input type="email" {...register("email")} className={ui.input} />
                            </FormField>
                            <FormField label={t('Phone Number', 'Phone Number')}>
                                <input {...register("phone")} className={ui.input} />
                            </FormField>
                            <FormField label={t('Fax', 'Fax')}>
                                <input {...register("fax")} className={ui.input} />
                            </FormField>
                            <FormField label={t('Website URL', 'Website URL')}>
                                <input {...register("url")} className={ui.input} />
                            </FormField>
                        </div>
                    </div>

                    {/* Logo & Favicon */}
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Branding</h3>
                        <div className="space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="flex-1">
                                    <FormField label={t('Light Logo', 'Light Logo')}>
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/svg+xml"
                                            onChange={handleLogoChange}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-nv-violet-light file:text-nv-violet-dark hover:file:bg-nv-violet-light"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Recommended: 40px × 40px</p>
                                    </FormField>
                                </div>
                                {logoPreview && (
                                    <div className="w-20 h-20 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center p-2 overflow-hidden shadow-sm">
                                        <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex-1">
                                    <FormField label={t('Favicon', 'Favicon')}>
                                        <input
                                            type="file"
                                            accept="image/png, image/x-icon"
                                            onChange={handleFaviconChange}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-nv-violet-light file:text-nv-violet-dark hover:file:bg-nv-violet-light"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Recommended: 16px × 16px</p>
                                    </FormField>
                                </div>
                                {faviconPreview && (
                                    <div className="w-16 h-16 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center p-2 overflow-hidden shadow-sm">
                                        <img src={faviconPreview} alt="Favicon preview" className="max-w-full max-h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                        <button type="submit" disabled={updateMutation.isPending} className={ui.btnPrimary}>
                            {updateMutation.isPending ? "Saving..." : "Save Configuration"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
