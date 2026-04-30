"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
    useApprovalSteps, useApprovalRules, useApprovalReferences, useUpsertApprovalSteps,
} from "@/hooks/use-approval";
import { useDepartments } from "@/hooks/use-organization";
import { useRoles } from "@/hooks/use-role";
import { Trash2, ArrowUp, ArrowDown, Save, Layers } from "lucide-react";
import { toast } from "sonner";
import {
    PageHeader, ModalWrapper, FormField, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

export default function ApprovalStepPage() {
    const { t } = usePageTranslation();
    const { data: stepsData, isLoading: stepsLoading } = useApprovalSteps();
    const { data: rulesData, isLoading: rulesLoading } = useApprovalRules();
    const { data: referencesData } = useApprovalReferences();
    const { data: departments } = useDepartments();
    const { data: roles } = useRoles();

    const upsertMutation = useUpsertApprovalSteps();

    const [selectedRuleId, setSelectedRuleId] = useState<number | "">("");
    const [modalOpen, setModalOpen] = useState(false);

    const { register, handleSubmit, reset } = useForm<any>();
    const { control, getValues, reset: resetSteps } = useForm({
        defaultValues: { steps: [] as any[] }
    });
    const { fields, append, remove, move } = useFieldArray({ control, name: "steps" });

    useEffect(() => {
        if (selectedRuleId !== "" && stepsData) {
            const ruleSteps = stepsData
                .filter((s: any) => Number(s.rule_id) === Number(selectedRuleId))
                .sort((a: any, b: any) => (a.step_order || 0) - (b.step_order || 0));
            resetSteps({ steps: ruleSteps });
        } else {
            resetSteps({ steps: [] });
        }
    }, [selectedRuleId, stepsData, resetSteps]);

    const openModal = () => {
        if (selectedRuleId === "") { toast.error("Please select a rule first"); return; }
        reset({
            rule_id: selectedRuleId, position: "", min_amount: "", max_amount: "",
            department: "", approver_id: "", ref_id: "", is_parallel: false,
            isActive: true, threshold_count: "", role_id: "",
        });
        setModalOpen(true);
    };

    const submitAddForm = (data: any) => {
        if (data.min_amount && data.max_amount && parseFloat(data.min_amount) > parseFloat(data.max_amount)) {
            toast.error("Min amount cannot be greater than Max amount"); return;
        }
        append({
            step_id: null, rule_id: Number(selectedRuleId), step_order: fields.length + 1,
            position: data.position || null, min_amount: data.min_amount ? parseFloat(data.min_amount) : null,
            max_amount: data.max_amount ? parseFloat(data.max_amount) : null,
            department: data.department || null, is_parallel: !!data.is_parallel,
            isActive: !!data.isActive, threshold_count: data.is_parallel && data.threshold_count ? parseInt(data.threshold_count) : null,
            approver_id: data.approver_id || null, role_id: data.role_id ? parseInt(data.role_id) : null,
            designation_id: null, ref_id: data.ref_id ? parseInt(data.ref_id) : null,
        });
        setModalOpen(false);
    };

    const onSaveSteps = () => {
        if (selectedRuleId === "") { toast.error("Please select a rule to save"); return; }
        const currentSteps = getValues("steps");
        if (currentSteps.length === 0) { toast.error("No steps to save"); return; }
        const payload = currentSteps.map((s, idx) => ({ ...s, step_order: idx + 1, rule_id: Number(selectedRuleId) }));
        upsertMutation.mutate({ ruleId: Number(selectedRuleId), steps: payload });
    };

    const isLoading = stepsLoading || rulesLoading;

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Approval Steps', 'Approval Steps')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" }, { label: t('Settings', 'Settings'), href: "/settings/company-settings" }, { label: t('Approval Steps', 'Approval Steps') }]}
            />

            {/* Rule Selector */}
            <div className={`${ui.filterCard} flex flex-col sm:flex-row items-start sm:items-center gap-3`}>
                <label className="text-sm font-semibold text-gray-700 shrink-0">Select Rule Target <span className="text-red-500">*</span></label>
                <select
                    value={selectedRuleId}
                    onChange={(e) => setSelectedRuleId(e.target.value ? Number(e.target.value) : "")}
                    className={`${ui.select} max-w-md`}
                >
                    <option value="">-- Please Select --</option>
                    {rulesData?.map((r: any) => (
                        <option key={r.rule_id} value={r.rule_id}>{r.rule_name || `Rule #${r.rule_id}`}</option>
                    ))}
                </select>
            </div>

            {/* Steps Table */}
            {selectedRuleId !== "" && (
                <div className={ui.tableWrapper}>
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-nv-violet" /> Workflow Steps
                        </h2>
                        <button onClick={openModal} className="px-3 py-1.5 bg-nv-violet-light text-nv-violet rounded-lg flex items-center gap-1.5 hover:bg-nv-violet-light font-medium text-sm transition-colors">
                            + Add Step
                        </button>
                    </div>
                    <div className="overflow-x-auto min-h-[250px]">
                        <table className={ui.table}>
                            <thead className={ui.thead}>
                                <tr>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase w-20">{t('Order', 'Order')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Position/Role', 'Position/Role')}</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('Min Amount', 'Min Amount')}</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('Max Amount', 'Max Amount')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Department', 'Department')}</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('Type', 'Type')}</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('Actions', 'Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className={ui.tbody}>
                                {fields.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center">
                                            <div className="inline-flex flex-col items-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl p-8 bg-gray-50/50">
                                                <Layers className="w-8 h-8 mb-2 opacity-50" />
                                                <p className="font-medium text-gray-600">No steps defined for this rule.</p>
                                                <p className="text-sm mt-1">Click &quot;Add Step&quot; to create an approval workflow.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    fields.map((field: any, index: number) => (
                                        <tr key={field.id} className={`${ui.tr} group`}>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <button onClick={() => move(index, index - 1)} disabled={index === 0} className="text-gray-300 hover:text-nv-violet disabled:opacity-30 transition-colors"><ArrowUp className="w-3 h-3" /></button>
                                                    <span className="bg-gray-100 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">{index + 1}</span>
                                                    <button onClick={() => move(index, index + 1)} disabled={index === fields.length - 1} className="text-gray-300 hover:text-nv-violet disabled:opacity-30 transition-colors"><ArrowDown className="w-3 h-3" /></button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-800">{field.position || "Any Position"}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">Approver: {field.approver_id || "Auto"}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-sm text-gray-600">{field.min_amount != null ? field.min_amount.toLocaleString() : "0"}</td>
                                            <td className="px-4 py-3 text-right font-mono text-sm text-gray-600">{field.max_amount != null ? field.max_amount.toLocaleString() : "∞"}</td>
                                            <td className={ui.td}>{field.department || "Any Department"}</td>
                                            <td className="px-4 py-3 text-center">
                                                {field.is_parallel ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200">Parallel (Min {field.threshold_count || 1})</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">{t('Sequential', 'Sequential')}</span>
                                                )}
                                            </td>
                                            <td className={ui.tdActions}>
                                                <button onClick={() => remove(index)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                        <button disabled={upsertMutation.isPending || fields.length === 0} onClick={onSaveSteps} className={`${ui.btnPrimary} flex items-center gap-2`}>
                            {upsertMutation.isPending ? t('Saving...', 'Saving...') : <><Save className="w-4 h-4" /> {t('Save Workflow', 'Save Workflow')}</>}
                        </button>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!selectedRuleId && !isLoading && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center p-16 text-center text-gray-400">
                    <Layers className="w-16 h-16 mb-4 opacity-20" />
                    <h2 className="text-xl font-semibold text-gray-600 mb-2">{t('Configure Workflow Rules', 'Configure Workflow Rules')}</h2>
                    <p className="max-w-md text-sm">Select a rule from the dropdown above to view and edit its approval steps.</p>
                </div>
            )}

            {/* Add Step Modal */}
            <ModalWrapper open={modalOpen} onClose={() => setModalOpen(false)} title={t('Add Approval Component', 'Add Approval Component')} maxWidth="max-w-2xl"
                footer={<>
                    <button onClick={() => setModalOpen(false)} className={ui.btnSecondary}>{t('Cancel', 'Cancel')}</button>
                    <button onClick={handleSubmit(submitAddForm)} className={ui.btnPrimary}>{t('Insert Step', 'Insert Step')}</button>
                </>}
            >
                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Position Level', 'Position Level')} required>
                            <input type="text" {...register("position", { required: true })} className={ui.input} placeholder="e.g. Manager" />
                        </FormField>
                        <FormField label={t('Department Scope', 'Department Scope')}>
                            <select {...register("department")} className={ui.select}>
                                <option value="">{t('Any Department', 'Any Department')}</option>
                                {departments?.map((dep: any) => (<option key={dep.departmentId} value={dep.departmentCode}>{dep.departmentName}</option>))}
                            </select>
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <FormField label={t('Min Amount', 'Min Amount')}>
                            <input type="number" {...register("min_amount")} className={ui.input} placeholder="0" />
                        </FormField>
                        <FormField label={t('Max Amount', 'Max Amount')}>
                            <input type="number" {...register("max_amount")} className={ui.input} placeholder="unlimited" />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Role Type', 'Role Type')}>
                            <select {...register("role_id")} className={ui.select}>
                                <option value="">-- Optional --</option>
                                {roles?.map((r: any) => (<option key={r.roleId} value={r.roleId}>{r.roleName}</option>))}
                            </select>
                        </FormField>
                        <FormField label={t('Reference ID', 'Reference ID')}>
                            <select {...register("ref_id")} className={ui.select}>
                                <option value="">-- Optional --</option>
                                {referencesData?.map((ref: any) => (<option key={ref.ref_id} value={ref.ref_id}>{ref.description || ref.ref_type}</option>))}
                            </select>
                        </FormField>
                    </div>
                    <FormField label={t('Specific Approver ID', 'Specific Approver ID')}>
                        <input type="text" {...register("approver_id")} className={ui.input} placeholder="Employee ID (if fixed approver)" />
                    </FormField>
                    <div className="p-4 bg-nv-violet-light border border-blue-100 rounded-lg space-y-3">
                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" {...register("is_parallel")} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nv-violet"></div>
                            </label>
                            <span className="text-sm font-medium text-gray-800">{t('Use Parallel Approval', 'Use Parallel Approval')}</span>
                        </div>
                        <div className="pl-6">
                            <label className="text-xs font-medium text-gray-600 block mb-1">Min required approvals (if parallel)</label>
                            <input type="number" {...register("threshold_count")} className={`${ui.input} max-w-xs`} placeholder="e.g. 2 of 3" />
                        </div>
                    </div>
                </div>
            </ModalWrapper>
        </div>
    );
}
