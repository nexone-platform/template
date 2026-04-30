"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { usePrefixes, useUpdatePrefix, Prefixes } from "@/hooks/use-prefixes";
import { getUserProfile } from "@/lib/auth";
import { Save, FileClock } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import {
    PageHeader, LoadingSpinner, EmptyState, ModalWrapper, FormField, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

export default function PrefixesPage() {
    const { t } = usePageTranslation();
    const { data: initialPrefixes, isLoading } = usePrefixes();
    const updateMutation = useUpdatePrefix();

    const [prefixes, setPrefixes] = useState<Prefixes[]>([]);
    const [modalOpen, setModalOpen] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<any>();

    useEffect(() => {
        if (initialPrefixes) {
            const sorted = [...initialPrefixes].sort((a, b) => (a.seqShow || 0) - (b.seqShow || 0));
            setPrefixes(sorted);
        }
    }, [initialPrefixes]);

    const handleInputChange = (index: number, value: string) => {
        const updated = [...prefixes];
        updated[index].prefixValue = value;
        setPrefixes(updated);
    };

    const handleSaveInline = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const username = getUserProfile() || "System";
            const now = new Date().toISOString();
            for (const item of prefixes) {
                const payload = { ...item };
                payload.updateDate = now;
                payload.updateBy = username;
                await updateMutation.mutateAsync(payload);
            }
        } catch {
            // handled by mutation error state
        }
    };

    const handleCancelInline = () => {
        if (initialPrefixes) {
            const sorted = [...initialPrefixes].sort((a, b) => (a.seqShow || 0) - (b.seqShow || 0));
            setPrefixes(sorted);
        }
    };

    const openModal = () => {
        reset({
            prefixId: 0, prefixKey: "", prefixLabel: "", prefixValue: "",
            seqShow: prefixes.length + 1, isActive: true,
        });
        setModalOpen(true);
    };

    const onSubmitNew = (data: any) => {
        const username = getUserProfile() || "System";
        const now = new Date().toISOString();
        data.createDate = now;
        data.createBy = username;
        data.updateDate = null;
        updateMutation.mutate(data, { onSuccess: () => { setModalOpen(false); } });
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Prefixes Configuration', 'Prefixes Configuration')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard }, { label: t('Prefixes', 'Prefixes') }]}
                actionLabel={t('Add Prefix', 'Add Prefix')}
                onAction={openModal}
            />

            <div className={ui.tableWrapper}>
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-gray-700">Format Prefixes</h2>
                        <p className="text-sm text-gray-500">Configure global ID prefixes for various documents and entities.</p>
                    </div>
                    <FileClock className="w-8 h-8 text-blue-100" />
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : prefixes.length === 0 ? (
                        <EmptyState message={t('No prefixes configured', 'No prefixes configured')} />
                    ) : (
                        <form id="prefix-form" onSubmit={handleSaveInline} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            {prefixes.map((row, index) => (
                                <div key={row.prefixId} className="flex items-center gap-4">
                                    <label className="text-sm font-medium text-gray-700 w-1/3 truncate" title={row.prefixLabel || row.prefixKey}>
                                        {row.prefixLabel || row.prefixKey}{" "}
                                        <span className="text-gray-400 text-xs font-normal">({row.prefixKey})</span>
                                    </label>
                                    <div className="w-2/3">
                                        <input
                                            type="text"
                                            className={ui.input}
                                            value={row.prefixValue || ""}
                                            onChange={(e) => handleInputChange(index, e.target.value)}
                                            placeholder={t('Enter prefix value', 'Enter prefix value')}
                                            required
                                        />
                                    </div>
                                </div>
                            ))}
                        </form>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                    <button type="button" onClick={handleCancelInline} disabled={updateMutation.isPending || prefixes.length === 0} className={ui.btnSecondary}>
                        Revert Changes
                    </button>
                    <button type="submit" form="prefix-form" disabled={updateMutation.isPending || prefixes.length === 0} className={ui.btnPrimary}>
                        {updateMutation.isPending ? "Saving..." : <><Save className="w-4 h-4 inline mr-1" /> Save All</>}
                    </button>
                </div>
            </div>

            <ModalWrapper
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={t('Add New Prefix', 'Add New Prefix')}
                maxWidth="max-w-md"
                footer={
                    <>
                        <button onClick={() => setModalOpen(false)} className={ui.btnSecondary}>{t('Cancel', 'Cancel')}</button>
                        <button onClick={handleSubmit(onSubmitNew)} disabled={updateMutation.isPending} className={ui.btnPrimary}>
                            {updateMutation.isPending ? "Creating..." : "Create"}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <FormField label={t('Prefix Key', 'Prefix Key')} required error={errors.prefixKey ? "* Required" : undefined}>
                        <input type="text" {...register("prefixKey", { required: true })} className={`${ui.input} ${errors.prefixKey ? "border-red-400" : ""}`} placeholder="e.g. EMP_ID" />
                        <p className="text-xs text-gray-400 mt-1">Unique identifier used in code</p>
                    </FormField>
                    <FormField label={t('Prefix Label', 'Prefix Label')} required error={errors.prefixLabel ? "* Required" : undefined}>
                        <input type="text" {...register("prefixLabel", { required: true })} className={`${ui.input} ${errors.prefixLabel ? "border-red-400" : ""}`} placeholder="e.g. Employee ID Prefix" />
                    </FormField>
                    <FormField label={t('Default Value', 'Default Value')} required error={errors.prefixValue ? "* Required" : undefined}>
                        <input type="text" {...register("prefixValue", { required: true })} className={`${ui.input} ${errors.prefixValue ? "border-red-400" : ""}`} placeholder="e.g. EMP-" />
                    </FormField>
                    <FormField label={t('Sequence (Sort Order)', 'Sequence (Sort Order)')} required error={errors.seqShow ? "* Required" : undefined}>
                        <input type="number" {...register("seqShow", { required: true })} className={`${ui.input} ${errors.seqShow ? "border-red-400" : ""}`} />
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
