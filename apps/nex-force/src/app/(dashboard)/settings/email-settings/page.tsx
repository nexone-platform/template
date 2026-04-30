"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useEmailSettings, useUpdateEmailSetting } from "@/hooks/use-email";
import { getUserProfile } from "@/lib/auth";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/lib/routes";
import {
    PageHeader, LoadingSpinner, ModalWrapper, FormField, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

export default function EmailSettingsPage() {
    const { t } = usePageTranslation();
    const { data: settings, isLoading } = useEmailSettings();
    const updateMutation = useUpdateEmailSetting();

    const [modalOpen, setModalOpen] = useState(false);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<any>();

    const openModal = (item: any) => {
        reset({
            emailId: item.emailId,
            isEnabled: item.isEnabled,
            method: item.method,
            smtpServer: item.smtpServer,
            smtpLogin: item.smtpLogin,
            smtpPassword: item.smtpPassword,
            fromName: item.fromName || "",
            fromEmail: item.fromEmail,
            toName: item.toName || "",
            toEmail: item.toEmail,
            isActive: item.isActive,
            smtpPort: item.smtpPort || "",
        });
        setModalOpen(true);
    };

    const onSubmit = (data: any) => {
        data.username = getUserProfile() || "System";
        updateMutation.mutate(data, {
            onSuccess: () => {
                setModalOpen(false);
            }
        });
    };

    const onToggleEnabled = (item: any) => {
        const payload = {
            ...item,
            isEnabled: !item.isEnabled,
            username: getUserProfile() || "System"
        };
        updateMutation.mutate(payload, {
            onSuccess: () => {
                toast.success(`Email setting has been ${payload.isEnabled ? 'enabled' : 'disabled'} successfully.`);
            }
        });
    };

    const emailMethods = ['SMTP'];

    // In a real app we might have a list. Here we just take the first matching method.
    const getEmailData = (method: string) => {
        return settings?.find((x: any) => x.method === method) || {
            emailId: 0,
            method,
            isEnabled: false,
            fromEmail: "Not Configured",
            smtpServer: "",
            smtpLogin: "",
            smtpPassword: "",
            toEmail: "",
            isActive: true,
            smtpPort: "",
        };
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Email Settings', 'Email Settings')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard }, { label: t('Email Settings', 'Email Settings') }]}
            />

            <p className="text-sm text-gray-500 mb-4">Configure your email gateways to securely send notifications.</p>

            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {emailMethods.map((method) => {
                        const data = getEmailData(method);
                        return (
                            <div key={method} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
                                <div className="flex justify-between items-center">
                                    <div className="font-semibold text-gray-800" title={method}>
                                        {method}: <span className="text-gray-500 font-normal">{data.fromEmail}</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={data.isEnabled}
                                            onChange={() => onToggleEnabled(data)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-nv-violet peer-focus:ring-4 peer-focus:ring-blue-300 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <span className="text-gray-500 mr-2">Status:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${data.isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {data.isEnabled ? "Connected" : "Disconnected"}
                                    </span>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-50 flex justify-end gap-2">
                                    <button onClick={() => openModal(data)} className="px-3 py-1.5 text-nv-violet hover:bg-nv-violet-light rounded flex items-center gap-1 text-sm font-medium transition-colors">
                                        <Edit className="w-3.5 h-3.5" /> Edit Configuration
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <ModalWrapper
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={t('Edit Settings', 'Edit Settings')}
                maxWidth="max-w-3xl"
                footer={
                    <>
                        <button onClick={() => setModalOpen(false)} className={ui.btnSecondary}>{t('Cancel', 'Cancel')}</button>
                        <button onClick={handleSubmit(onSubmit)} disabled={updateMutation.isPending} className={ui.btnPrimary}>
                            {updateMutation.isPending ? "Saving..." : "Save Settings"}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('SMTP Host', 'SMTP Host')} required>
                            <input type="text" {...register("smtpServer", { required: true })} className={`${ui.input} ${errors.smtpServer ? 'border-red-400' : ''}`} placeholder="smtp.example.com" />
                        </FormField>
                        <FormField label={t('SMTP Port', 'SMTP Port')} required>
                            <input type="text" {...register("smtpPort", { required: true })} className={`${ui.input} ${errors.smtpPort ? 'border-red-400' : ''}`} placeholder="587" />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('SMTP User', 'SMTP User')} required>
                            <input type="text" {...register("smtpLogin", { required: true })} className={`${ui.input} ${errors.smtpLogin ? 'border-red-400' : ''}`} placeholder="username" />
                        </FormField>
                        <FormField label={t('SMTP Password', 'SMTP Password')} required>
                            <input type="password" autoComplete="new-password" {...register("smtpPassword", { required: true })} className={`${ui.input} ${errors.smtpPassword ? 'border-red-400' : ''}`} placeholder="••••••••" />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        <FormField label={t('Email From Address', 'Email From Address')} required>
                            <input type="email" {...register("fromEmail", { required: true })} className={`${ui.input} ${errors.fromEmail ? 'border-red-400' : ''}`} placeholder="noreply@example.com" />
                        </FormField>
                        <FormField label={t('Global To Address', 'Global To Address')} required>
                            <input type="email" {...register("toEmail", { required: true })} className={`${ui.input} ${errors.toEmail ? 'border-red-400' : ''}`} placeholder="admin@example.com" />
                        </FormField>
                    </div>
                    <FormField label={t('Allow Gateway Setting Active', 'Allow Gateway Setting Active')}>
                        <label className="relative inline-flex items-center cursor-pointer mt-1">
                            <input type="checkbox" {...register("isActive")} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nv-violet"></div>
                            <span className="ml-3 text-sm text-gray-600">{watch("isActive") ? "Active" : "Inactive"}</span>
                        </label>
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
