"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    useNotiModules, useNotiChanels, useNotiSettings,
    useAddNotiModule, useDeleteNotiModule
} from "@/hooks/use-notification";
import { Trash2, Bell, Smartphone, Mail } from "lucide-react";
import { useMessages } from "@/hooks/use-messages";
import { getApiErrorMessage } from "@/lib/api-error";
import {
    PageHeader, ModalWrapper, FormField, LoadingSpinner, EmptyState, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

export default function NotificationPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showConfirm } = useMessages();
    const { data: modules, isLoading: modulesLoading } = useNotiModules();
    const { data: channels, isLoading: channelsLoading } = useNotiChanels();
    const { data: settings, isLoading: settingsLoading } = useNotiSettings();

    const addMutation = useAddNotiModule();
    const deleteMutation = useDeleteNotiModule();

    const [modalOpen, setModalOpen] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<any>();

    const openModal = () => {
        reset({ moduleId: 0, module: "", description: "", SeqShow: 0, isActive: true });
        setModalOpen(true);
    };

    const onSubmit = (data: any) => {
        const now = new Date().toISOString();
        data.createDate = now;
        data.updateDate = null;
        addMutation.mutate(data, {
            onSuccess: () => {
                showSuccess('SAVE_SUCCESS', 'Success!', 'Module added successfully.');
                setModalOpen(false);
            },
            onError: (err) => {
                showError('SAVE_ERROR', 'Error!', getApiErrorMessage(err, "Failed to add module."));
            },
        });
    };

    const confirmDelete = (id: number) => {
        showConfirm('DELETE_CONFIRM', () => {deleteMutation.mutate(id, {
                    onSuccess: () => showSuccess('DELETE_SUCCESS', 'Deleted!', 'Module deleted.'),
                    onError: () => showError('SAVE_ERROR', 'Error!', 'Failed to delete.'),
                });}, { fallbackTitle: 'Delete Module', fallbackMsg: 'Are you sure you want to delete this module?' });
    };

    const getSettingForModuleAndChannel = (moduleId: number, chanelType: string) => {
        if (!channels || !settings) return null;
        const chanel = channels.find((c: any) => c.ChanelKey === chanelType || c.ChanelName === chanelType);
        if (!chanel) return null;
        return settings.find((s: any) => s.ModuleId === moduleId && s.ChanelId === chanel.ChanelId);
    };

    const isLoading = modulesLoading || channelsLoading || settingsLoading;
    const moduleList = modules || [];
    const displayChannels = ["Push", "SMS", "Email"];

    const getChannelIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case "push": return <Bell className="w-4 h-4" />;
            case "sms": return <Smartphone className="w-4 h-4" />;
            case "email": return <Mail className="w-4 h-4" />;
            default: return <Bell className="w-4 h-4" />;
        }
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Notification Settings', 'Notification Settings')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" }, { label: t('Settings', 'Settings'), href: "/settings/company-settings" }, { label: t('Notification', 'Notification') }]}
                actionLabel={t('Add Module', 'Add Module')}
                onAction={openModal}
            />

            <div className={ui.tableWrapper}>
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="font-semibold text-gray-700">Notification Channels</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Configure which modules send notifications through which channels.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className={ui.table}>
                        <thead className={ui.thead}>
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Modules', 'Modules')}</th>
                                {displayChannels.map((channel) => (
                                    <th key={channel} className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                                        <div className="flex items-center justify-center gap-1.5">{getChannelIcon(channel)} {channel}</div>
                                    </th>
                                ))}
                                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('Actions', 'Actions')}</th>
                            </tr>
                        </thead>
                        <tbody className={ui.tbody}>
                            {isLoading ? (
                                <LoadingSpinner colSpan={displayChannels.length + 2} />
                            ) : moduleList.length === 0 ? (
                                <EmptyState colSpan={displayChannels.length + 2} message="No modules found. Add a module to get started." />
                            ) : (
                                moduleList.map((module: any) => (
                                    <tr key={module.moduleId} className={ui.tr}>
                                        <td className="px-5 py-4">
                                            <div className="font-medium text-gray-800">{module.module}</div>
                                            <div className="text-gray-400 text-xs mt-0.5">{module.description}</div>
                                        </td>
                                        {displayChannels.map((channelType) => {
                                            const setting = getSettingForModuleAndChannel(module.moduleId, channelType);
                                            const isChecked = setting ? setting.isActive : true;
                                            return (
                                                <td key={channelType} className="px-5 py-4 text-center">
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" className="sr-only peer" checked={isChecked} onChange={() => { }} />
                                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-nv-violet peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                                    </label>
                                                </td>
                                            );
                                        })}
                                        <td className={ui.tdActions}>
                                            <button onClick={() => confirmDelete(module.moduleId)} title={t('Delete Module', 'Delete Module')}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ModalWrapper open={modalOpen} onClose={() => setModalOpen(false)} title={t('Add Module Detail', 'Add Module Detail')} maxWidth="max-w-md"
                footer={<>
                    <button onClick={() => setModalOpen(false)} className={ui.btnSecondary}>{t('Cancel', 'Cancel')}</button>
                    <button onClick={handleSubmit(onSubmit)} disabled={addMutation.isPending} className={ui.btnPrimary}>
                        {addMutation.isPending ? "Submitting..." : "Submit"}
                    </button>
                </>}
            >
                <div className="space-y-4">
                    <FormField label={t('Module Name', 'Module Name')} required error={errors.module ? "Required" : undefined}>
                        <input type="text" {...register("module", { required: true })} className={`${ui.input} ${errors.module ? "border-red-400" : ""}`} placeholder="e.g. Leave Approval" />
                    </FormField>
                    <FormField label={t('Description', 'Description')} required error={errors.description ? "Required" : undefined}>
                        <input type="text" {...register("description", { required: true })} className={`${ui.input} ${errors.description ? "border-red-400" : ""}`} placeholder="Enter module description" />
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
