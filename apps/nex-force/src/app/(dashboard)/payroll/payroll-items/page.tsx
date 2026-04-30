"use client";

import { useState } from "react";
import {
    useAdditions,
    useDeductions,
    useDeleteAddition,
    useDeleteDeduction,
    useSaveAddition,
    useSaveDeduction,
} from "@/hooks/use-payroll";
import apiClient from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    List,
    ArrowUpCircle,
    ArrowDownCircle,
    Settings2,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { useMessages } from "@/hooks/use-messages";
import { PageHeader, ModalWrapper, FormField, ui } from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

/* โ”€โ”€ Angular Constants โ”€โ”€ */
const AssignmentType = {
    NoAssignee: 1,
    AllEmployees: 2,
    Specific: 3,
    Department: 4,
    Project: 5,
} as const;

const AdditionTypeEnum = {
    Salary: 1, Overtime: 2, Commission: 3, Bonus: 4, Travel: 5, Shift: 6, Other: 7,
} as const;

const DeductionTypeEnum = {
    SocialSecurityFund: 1, WithholdingTax: 2, StudentLoanFund: 3, AbsentLeaveLate: 4, Other: 5,
} as const;

/* โ”€โ”€ Helper hooks for dropdown data (Angular: innitData) โ”€โ”€ */
function useEmployeesForSelect() {
    return useQuery({
        queryKey: ["employees-for-select"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("employees/getEmployeeForSelect");
            return data?.data || [];
        },
    });
}

function useDepartments() {
    return useQuery({
        queryKey: ["departments-all"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("departments/getAllDepartment");
            return data?.data || [];
        },
    });
}

function useProjectList() {
    return useQuery({
        queryKey: ["projects-list"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("projects/getProject");
            return data?.data || [];
        },
    });
}

/* โ”€โ”€ Form defaults (Angular: createForm) โ”€โ”€ */
const defaultAdditionForm = {
    additionsId: 0,
    additionsName: "",
    isActive: true,
    unitAmount: null as number | null,
    percentAmount: null as number | null,
    assigneeType: AssignmentType.NoAssignee as number,
    exceptedEmployees: [] as number[],
    departmentId: [] as number[],
    employeeId: [] as number[],
    amountType: "unit" as "unit" | "percent",
    projectId: [] as number[],
    additionType: null as number | null,
};

const defaultDeductionForm = {
    deductionId: 0,
    deductionName: "",
    isActive: true,
    unitAmount: null as number | null,
    percentAmount: null as number | null,
    assigneeType: AssignmentType.NoAssignee as number,
    exceptedEmployees: [] as number[],
    departmentId: [] as number[],
    employeeId: [] as number[],
    amountType: "unit" as "unit" | "percent",
    deductionType: null as number | null,
    projectId: [] as number[],
};

export default function PayrollItemsPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showConfirm, showWarning } = useMessages();
    const [activeTab, setActiveTab] = useState<"additions" | "deductions">("additions");
    const [searchQuery, setSearchQuery] = useState("");

    // โ”€โ”€ Data (Angular: innitData) โ”€โ”€
    const { data: additions, isLoading: loadingAdditions } = useAdditions();
    const { data: deductions, isLoading: loadingDeductions } = useDeductions();
    const { data: employees } = useEmployeesForSelect();
    const { data: departments } = useDepartments();
    const { data: projects } = useProjectList();

    // โ”€โ”€ Mutations โ”€โ”€
    const saveAdditionMutation = useSaveAddition();
    const saveDeductionMutation = useSaveDeduction();
    const deleteAdditionMutation = useDeleteAddition();
    const deleteDeductionMutation = useDeleteDeduction();

    // โ”€โ”€ Modal state โ”€โ”€
    const [showAdditionModal, setShowAdditionModal] = useState(false);
    const [showDeductionModal, setShowDeductionModal] = useState(false);

    // โ”€โ”€ Form state (Angular: additionForm, deductionForm) โ”€โ”€
    const [additionForm, setAdditionForm] = useState(defaultAdditionForm);
    const [deductionForm, setDeductionForm] = useState(defaultDeductionForm);


    // โ”€โ”€ Angular: openEdit(data: Addition) โ”€โ”€
    const openEditAddition = (data: any) => {
        const assignments = data.assignments || [];
        setAdditionForm({
            additionsId: data.additionsId,
            additionsName: data.additionsName,
            isActive: data.isActive,
            unitAmount: data.unitAmount,
            percentAmount: data.percentAmount,
            additionType: data.additionType,
            assigneeType: assignments[0]?.assignmentType ?? AssignmentType.NoAssignee,
            exceptedEmployees: assignments
                .filter((a: any) => a.exceptedEmployeeIds !== null)
                .map((a: any) => a.exceptedEmployeeIds),
            departmentId: assignments
                .filter((a: any) => a.departmentId !== null)
                .map((a: any) => a.departmentId),
            employeeId: assignments
                .filter((a: any) => a.employeeId !== null)
                .map((a: any) => a.employeeId),
            amountType: (data.unitAmount ?? 0) > 0 ? "unit" : "percent",
            projectId: [],
        });
        setShowAdditionModal(true);
    };

    // โ”€โ”€ Angular: openEditDeduction(data: Deduction) โ”€โ”€
    const openEditDeduction = (data: any) => {
        const assignments = data.assignments || [];
        setDeductionForm({
            deductionId: data.deductionId,
            deductionName: data.deductionName || "",
            isActive: data.isActive ?? true,
            unitAmount: data.unitAmount ?? null,
            percentAmount: data.percentAmount ?? null,
            deductionType: data.deductionType ?? null,
            assigneeType: assignments[0]?.assignmentType ?? AssignmentType.NoAssignee,
            exceptedEmployees: assignments
                .filter((a: any) => a.exceptedEmployeeIds !== null)
                .map((a: any) => a.exceptedEmployeeIds),
            departmentId: assignments
                .filter((a: any) => a.departmentId !== null)
                .map((a: any) => a.departmentId),
            employeeId: assignments
                .filter((a: any) => a.employeeId !== null)
                .map((a: any) => a.employeeId),
            amountType: (data.unitAmount ?? 0) > 0 ? "unit" : "percent",
            projectId: [],
        });
        setShowDeductionModal(true);
    };

    // โ”€โ”€ Angular: onSubmit() โ€” builds assignees based on assigneeType โ”€โ”€
    const onSubmitAddition = () => {
        if (!additionForm.additionsName.trim()) {
            showWarning('REQUIRED_FIELDS', 'Warning!', 'Form is invalid');
            return;
        }

        const formValue = { ...additionForm };
        if (!formValue.additionsId) formValue.additionsId = 0;

        const assignmentData: any = { ...formValue };
        switch (formValue.assigneeType) {
            case AssignmentType.NoAssignee:
                assignmentData.assignees = null;
                break;
            case AssignmentType.AllEmployees:
                assignmentData.assignees = { type: AssignmentType.AllEmployees, employeeIds: formValue.exceptedEmployees };
                break;
            case AssignmentType.Department:
                assignmentData.assignees = { type: AssignmentType.Department, departmentId: formValue.departmentId, employeeIds: formValue.exceptedEmployees };
                break;
            case AssignmentType.Specific:
                assignmentData.assignees = { type: AssignmentType.Specific, employeeIds: formValue.employeeId };
                break;
            case AssignmentType.Project:
                assignmentData.assignees = { type: AssignmentType.Project, projectId: formValue.projectId };
                break;
        }

        saveAdditionMutation.mutate(assignmentData, {
            onSuccess: (response: any) => {
                showSuccess('SAVE_SUCCESS', 'Success!', response?.message || "Saved successfully").then(() => {
                    setShowAdditionModal(false);
                    setAdditionForm(defaultAdditionForm);
                });
            },
            onError: () => {
                showError('SAVE_ERROR', 'Error', 'Failed to save addition.');
            },
        });
    };

    // โ”€โ”€ Angular: onSubmitDeduction() โ”€โ”€
    const onSubmitDeduction = () => {
        if (!deductionForm.deductionName.trim()) {
            showWarning('REQUIRED_FIELDS', 'Warning!', 'Form is invalid');
            return;
        }

        const formValue = { ...deductionForm };
        if (!formValue.deductionId) formValue.deductionId = 0;

        const assignmentData: any = { ...formValue };
        switch (formValue.assigneeType) {
            case AssignmentType.NoAssignee:
                assignmentData.assignees = null;
                break;
            case AssignmentType.AllEmployees:
                assignmentData.assignees = { type: AssignmentType.AllEmployees, employeeIds: formValue.exceptedEmployees };
                break;
            case AssignmentType.Department:
                assignmentData.assignees = { type: AssignmentType.Department, departmentId: formValue.departmentId, employeeIds: formValue.exceptedEmployees };
                break;
            case AssignmentType.Specific:
                assignmentData.assignees = { type: AssignmentType.Specific, employeeIds: formValue.employeeId };
                break;
            case AssignmentType.Project:
                assignmentData.assignees = { type: AssignmentType.Project, projectId: formValue.projectId };
                break;
        }

        saveDeductionMutation.mutate(assignmentData, {
            onSuccess: (response: any) => {
                showSuccess('SAVE_SUCCESS', 'Success!', response?.message || "Saved successfully").then(() => {
                    setShowDeductionModal(false);
                    setDeductionForm(defaultDeductionForm);
                });
            },
            onError: () => {
                showError('SAVE_ERROR', 'Error', 'Failed to save deduction.');
            },
        });
    };

    // โ”€โ”€ Angular: onDelete(id) โ”€โ”€
    const handleDeleteAddition = (id: number) => {
        showConfirm('DELETE_CONFIRM', () => {deleteAdditionMutation.mutate(id, {
                    onSuccess: (response: any) => {
                        showSuccess('SAVE_SUCCESS', 'Success!', response?.message || "Deleted");
                    },
                    onError: () => {
                        showError('SAVE_ERROR', 'Error!', 'Error deleting addition');
                    },
                });}, { fallbackTitle: 'Delete Addition', fallbackMsg: 'Are you sure you want to delete this addition?' });
    };

    // โ”€โ”€ Angular: onDeleteDeduction(id) โ”€โ”€
    const handleDeleteDeduction = (id: number) => {
        showConfirm('DELETE_CONFIRM', () => {deleteDeductionMutation.mutate(id, {
                    onSuccess: (response: any) => {
                        showSuccess('SAVE_SUCCESS', 'Success!', response?.message || "Deleted");
                    },
                    onError: () => {
                        showError('SAVE_ERROR', 'Error!', 'Error deleting deduction');
                    },
                });}, { fallbackTitle: 'Delete Deduction', fallbackMsg: 'Are you sure you want to delete this deduction?' });
    };

    const filteredAdditions = additions?.filter((a: any) =>
        a.additionsName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredDeductions = deductions?.filter((d: any) =>
        (d.deductionName || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={`${ui.pageContainer} max-w-[1600px] mx-auto min-h-screen`}>
            {/* Header section */}
            <PageHeader
                title={t('Payroll Configuration', 'Payroll Configuration')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Payroll', 'Payroll'), href: "/payroll" },
                    { label: t('Payroll Items', 'Payroll Items') },
                ]}
                actionLabel={`New ${activeTab === "additions" ? "Addition" : "Deduction"}`}
                onAction={() => {
                    if (activeTab === "additions") {
                        setAdditionForm(defaultAdditionForm);
                        setShowAdditionModal(true);
                    } else {
                        setDeductionForm(defaultDeductionForm);
                        setShowDeductionModal(true);
                    }
                }}
                actionIcon={<Plus className="w-4 h-4" />}
            />

            {/* Tabs and Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                <div className="flex bg-white p-1.5 rounded-[2rem] shadow-sm border border-slate-100 w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab("additions")}
                        className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.5rem] text-sm font-black transition-all ${activeTab === "additions"
                            ? "bg-slate-900 text-white shadow-lg"
                            : "text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        <ArrowUpCircle className={`w-5 h-5 ${activeTab === "additions" ? "text-emerald-400" : ""}`} />
                        Additions
                    </button>
                    <button
                        onClick={() => setActiveTab("deductions")}
                        className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.5rem] text-sm font-black transition-all ${activeTab === "deductions"
                            ? "bg-slate-900 text-white shadow-lg"
                            : "text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        <ArrowDownCircle className={`w-5 h-5 ${activeTab === "deductions" ? "text-rose-400" : ""}`} />
                        Deductions
                    </button>
                </div>

                <div className="relative w-full md:w-[400px] group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-nv-violet transition-colors" />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[2rem] shadow-sm outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-600 placeholder:text-slate-300"
                    />
                </div>
            </div>

            {/* List Board */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {activeTab === "additions" ? (
                    loadingAdditions ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="h-[200px] bg-white rounded-[2.5rem] animate-pulse border border-slate-50"></div>
                        ))
                    ) : filteredAdditions?.length ? (
                        filteredAdditions.map((item: any) => (
                            <ItemCard
                                key={item.additionsId}
                                item={item}
                                type="addition"
                                onEdit={() => openEditAddition(item)}
                                onDelete={(id) => handleDeleteAddition(id)}
                            />
                        ))
                    ) : (
                        <EmptyState message="No additions found." />
                    )
                ) : (
                    loadingDeductions ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="h-[200px] bg-white rounded-[2.5rem] animate-pulse border border-slate-50"></div>
                        ))
                    ) : filteredDeductions?.length ? (
                        filteredDeductions.map((item: any) => (
                            <ItemCard
                                key={item.deductionId}
                                item={item}
                                type="deduction"
                                onEdit={() => openEditDeduction(item)}
                                onDelete={(id) => handleDeleteDeduction(id)}
                            />
                        ))
                    ) : (
                        <EmptyState message="No deductions found." />
                    )
                )}
            </div>

            {/* โ”€โ”€ Addition Modal (Angular: #add_addition) โ”€โ”€ */}
            <ModalWrapper open={showAdditionModal} onClose={() => setShowAdditionModal(false)} title={t('Addition Details', 'Addition Details')} maxWidth="max-w-lg"
                footer={<button onClick={onSubmitAddition} className={ui.btnPrimary}>{t('Submit', 'Submit')}</button>}>
                <div className="space-y-4">
                    {/* Name */}
                    <FormField label={t('Name', 'Name')} required>
                        <input type="text" value={additionForm.additionsName}
                            onChange={e => setAdditionForm(f => ({ ...f, additionsName: e.target.value }))}
                            className={ui.input} />
                    </FormField>
                    {/* Addition Type */}
                    <FormField label={t('Select Addition Type', 'Select Addition Type')}>
                        <select value={additionForm.additionType ?? ""}
                            onChange={e => setAdditionForm(f => ({ ...f, additionType: e.target.value ? Number(e.target.value) : null }))}
                            className={ui.select}>
                            <option value="">{t('Select Addition Type', 'Select Addition Type')}</option>
                            <option value={AdditionTypeEnum.Salary}>{t('Salary', 'Salary')}</option>
                            <option value={AdditionTypeEnum.Overtime}>{t('Overtime', 'Overtime')}</option>
                            <option value={AdditionTypeEnum.Commission}>{t('Commission', 'Commission')}</option>
                            <option value={AdditionTypeEnum.Bonus}>{t('Bonus', 'Bonus')}</option>
                            <option value={AdditionTypeEnum.Travel}>{t('Travel', 'Travel')}</option>
                            <option value={AdditionTypeEnum.Shift}>{t('Shift', 'Shift')}</option>
                            <option value={AdditionTypeEnum.Other}>{t('Other', 'Other')}</option>
                        </select>
                    </FormField>
                    {/* Active */}
                    <FormField label={t('Active', 'Active')}>
                        <ToggleSwitch checked={additionForm.isActive}
                            onChange={v => setAdditionForm(f => ({ ...f, isActive: v }))} />
                    </FormField>
                    {/* Amount Type */}
                    <FormField label={t('Amount Type', 'Amount Type')}>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm">
                                <input type="radio" name="addAmountType" value="unit"
                                    checked={additionForm.amountType === "unit"}
                                    onChange={() => setAdditionForm(f => ({ ...f, amountType: "unit" }))} /> Unit
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="radio" name="addAmountType" value="percent"
                                    checked={additionForm.amountType === "percent"}
                                    onChange={() => setAdditionForm(f => ({ ...f, amountType: "percent" }))} /> Percent
                            </label>
                        </div>
                    </FormField>
                    {/* Unit Amount */}
                    {additionForm.amountType === "unit" && (
                        <FormField label={t('Unit Amount', 'Unit Amount')}>
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                <span className="px-3 text-sm bg-gray-50 border-r border-gray-200 py-2">$</span>
                                <input type="number" value={additionForm.unitAmount ?? ""}
                                    onChange={e => setAdditionForm(f => ({ ...f, unitAmount: e.target.value ? Number(e.target.value) : null }))}
                                    className="flex-1 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                <span className="px-3 text-sm bg-gray-50 border-l border-gray-200 py-2">.00</span>
                            </div>
                        </FormField>
                    )}
                    {/* Percent Amount */}
                    {additionForm.amountType === "percent" && (
                        <FormField label={t('Percent Amount', 'Percent Amount')}>
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                <span className="px-3 text-sm bg-gray-50 border-r border-gray-200 py-2">$</span>
                                <input type="number" value={additionForm.percentAmount ?? ""}
                                    onChange={e => setAdditionForm(f => ({ ...f, percentAmount: e.target.value ? Number(e.target.value) : null }))}
                                    className="flex-1 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                <span className="px-3 text-sm bg-gray-50 border-l border-gray-200 py-2">%</span>
                            </div>
                        </FormField>
                    )}
                    {/* Assignee */}
                    <AssigneeSection form={additionForm} setForm={setAdditionForm as any}
                        employees={employees || []} departments={departments || []} projects={projects || []} />
                </div>
            </ModalWrapper>

            {/* โ”€โ”€ Deduction Modal (Angular: #add_deduction) โ”€โ”€ */}
            <ModalWrapper open={showDeductionModal} onClose={() => setShowDeductionModal(false)} title={t('Deduction Details', 'Deduction Details')} maxWidth="max-w-lg"
                footer={<button onClick={onSubmitDeduction} className={ui.btnPrimary}>{t('Submit', 'Submit')}</button>}>
                <div className="space-y-4">
                    {/* Name */}
                    <FormField label={t('Name', 'Name')} required>
                        <input type="text" value={deductionForm.deductionName}
                            onChange={e => setDeductionForm(f => ({ ...f, deductionName: e.target.value }))}
                            className={ui.input} />
                    </FormField>
                    {/* Deduction Type */}
                    <FormField label={t('Select Deduction Type', 'Select Deduction Type')}>
                        <select value={deductionForm.deductionType ?? ""}
                            onChange={e => setDeductionForm(f => ({ ...f, deductionType: e.target.value ? Number(e.target.value) : null }))}
                            className={ui.select}>
                            <option value="">{t('Select Deduction Type', 'Select Deduction Type')}</option>
                            <option value={DeductionTypeEnum.SocialSecurityFund}>{t('Social Security Fund', 'Social Security Fund')}</option>
                            <option value={DeductionTypeEnum.WithholdingTax}>{t('Withholding Tax', 'Withholding Tax')}</option>
                            <option value={DeductionTypeEnum.StudentLoanFund}>{t('Student Loan Fund', 'Student Loan Fund')}</option>
                            <option value={DeductionTypeEnum.AbsentLeaveLate}>{t('Absent/Leave/Late', 'Absent/Leave/Late')}</option>
                            <option value={DeductionTypeEnum.Other}>{t('Other', 'Other')}</option>
                        </select>
                    </FormField>
                    {/* Active */}
                    <FormField label={t('Active', 'Active')}>
                        <ToggleSwitch checked={deductionForm.isActive}
                            onChange={v => setDeductionForm(f => ({ ...f, isActive: v }))} />
                    </FormField>
                    {/* Amount Type */}
                    <FormField label={t('Amount Type', 'Amount Type')}>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm">
                                <input type="radio" name="dedAmountType" value="unit"
                                    checked={deductionForm.amountType === "unit"}
                                    onChange={() => setDeductionForm(f => ({ ...f, amountType: "unit" }))} /> Unit
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="radio" name="dedAmountType" value="percent"
                                    checked={deductionForm.amountType === "percent"}
                                    onChange={() => setDeductionForm(f => ({ ...f, amountType: "percent" }))} /> Percent
                            </label>
                        </div>
                    </FormField>
                    {/* Unit Amount */}
                    {deductionForm.amountType === "unit" && (
                        <FormField label={t('Unit Amount', 'Unit Amount')}>
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                <span className="px-3 text-sm bg-gray-50 border-r border-gray-200 py-2">$</span>
                                <input type="number" value={deductionForm.unitAmount ?? ""}
                                    onChange={e => setDeductionForm(f => ({ ...f, unitAmount: e.target.value ? Number(e.target.value) : null }))}
                                    className="flex-1 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                <span className="px-3 text-sm bg-gray-50 border-l border-gray-200 py-2">.00</span>
                            </div>
                        </FormField>
                    )}
                    {/* Percent Amount */}
                    {deductionForm.amountType === "percent" && (
                        <FormField label={t('Percent Amount', 'Percent Amount')}>
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                <span className="px-3 text-sm bg-gray-50 border-r border-gray-200 py-2">$</span>
                                <input type="number" value={deductionForm.percentAmount ?? ""}
                                    onChange={e => setDeductionForm(f => ({ ...f, percentAmount: e.target.value ? Number(e.target.value) : null }))}
                                    className="flex-1 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                <span className="px-3 text-sm bg-gray-50 border-l border-gray-200 py-2">%</span>
                            </div>
                        </FormField>
                    )}
                    {/* Assignee */}
                    <AssigneeSection form={deductionForm} setForm={setDeductionForm as any}
                        employees={employees || []} departments={departments || []} projects={projects || []} />
                </div>
            </ModalWrapper>

        </div>
    );
}

/* โ”€โ”€ Shared Assignee Section (Angular: radio buttons + conditional selects) โ”€โ”€ */
function AssigneeSection({ form, setForm, employees, departments, projects }: {
    form: any;
    setForm: (fn: (prev: any) => any) => void;
    employees: any[];
    departments: any[];
    projects: any[];

}) {
    const { t } = usePageTranslation();
    const assigneeOptions = [
        { value: AssignmentType.NoAssignee, label: t('No Assignee', 'No Assignee'), desc: t('เนเธกเนเธเธณเธซเธเธ”เธเธนเนเธฃเธฑเธ', 'เนเธกเนเธเธณเธซเธเธ”เธเธนเนเธฃเธฑเธ') },
        { value: AssignmentType.AllEmployees, label: t('All Employees', 'All Employees'), desc: t('เธเธเธฑเธเธเธฒเธเธ—เธธเธเธเธ', 'เธเธเธฑเธเธเธฒเธเธ—เธธเธเธเธ') },
        { value: AssignmentType.Department, label: t('Department', 'Department'), desc: t('เธ•เธฒเธกเนเธเธเธ', 'เธ•เธฒเธกเนเธเธเธ') },
        { value: AssignmentType.Specific, label: t('Specific', 'Specific'), desc: t('เน€เธฅเธทเธญเธเธเธเธฑเธเธเธฒเธ', 'เน€เธฅเธทเธญเธเธเธเธฑเธเธเธฒเธ') },
        { value: AssignmentType.Project, label: t('Project', 'Project'), desc: t('เธ•เธฒเธกเนเธเธฃเน€เธเธ', 'เธ•เธฒเธกเนเธเธฃเน€เธเธ') },
    ];

    return (
        <>
            <FormField label={t('Assignee', 'Assignee')}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {assigneeOptions.map(opt => {
                        const isSelected = form.assigneeType === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setForm((f: any) => ({ ...f, assigneeType: opt.value }))}
                                className={`text-left px-3 py-2.5 rounded-lg border-2 transition-all text-sm ${
                                    isSelected
                                        ? "border-nv-violet bg-nv-violet-light ring-1 ring-blue-200"
                                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                <div className={`font-semibold ${isSelected ? "text-nv-violet-dark" : "text-gray-700"}`}>
                                    {opt.label}
                                </div>
                                <div className={`text-xs mt-0.5 ${isSelected ? "text-nv-violet" : "text-gray-400"}`}>
                                    {opt.desc}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </FormField>

            {/* Department select (Angular: assigneeType === 4) */}
            {form.assigneeType === AssignmentType.Department && (
                <FormField label={t('Department', 'Department')}>
                    <CheckboxDropdown
                        placeholder={t('Select departments...', 'Select departments...')}
                        options={departments.map((d: any) => ({ value: d.departmentId, label: d.departmentNameTh || d.departmentNameEn }))}
                        selected={form.departmentId}
                        onChange={(vals) => setForm((f: any) => ({ ...f, departmentId: vals }))}
                    />
                </FormField>
            )}

            {/* Excepted Persons (Angular: assigneeType === 2 || 5 || 4) */}
            {(form.assigneeType === AssignmentType.AllEmployees || form.assigneeType === AssignmentType.Project || form.assigneeType === AssignmentType.Department) && (
                <FormField label={t('Excepted Persons (เธขเธเน€เธงเนเธเธเธเธฑเธเธเธฒเธ)', 'Excepted Persons (เธขเธเน€เธงเนเธเธเธเธฑเธเธเธฒเธ)')}>
                    <CheckboxDropdown
                        placeholder={t('Select employees to exclude...', 'Select employees to exclude...')}
                        options={employees.map((emp: any) => ({ value: emp.id, label: `${emp.firstNameEn} ${emp.lastNameEn}` }))}
                        selected={form.exceptedEmployees}
                        onChange={(vals) => setForm((f: any) => ({ ...f, exceptedEmployees: vals }))}
                    />
                </FormField>
            )}

            {/* Select Employee (Angular: assigneeType === 3) */}
            {form.assigneeType === AssignmentType.Specific && (
                <FormField label={t('Select Employee', 'Select Employee')}>
                    <CheckboxDropdown
                        placeholder={t('Select employees...', 'Select employees...')}
                        options={employees.map((emp: any) => ({ value: emp.id, label: `${emp.firstNameEn} ${emp.lastNameEn}` }))}
                        selected={form.employeeId}
                        onChange={(vals) => setForm((f: any) => ({ ...f, employeeId: vals }))}
                    />
                </FormField>
            )}

            {/* Select Project (Angular: assigneeType === 5) */}
            {form.assigneeType === AssignmentType.Project && (
                <FormField label={t('Select Project', 'Select Project')}>
                    <CheckboxDropdown
                        placeholder={t('Select projects...', 'Select projects...')}
                        options={projects.map((p: any) => ({ value: p.projectId, label: p.projectName }))}
                        selected={form.projectId}
                        onChange={(vals) => setForm((f: any) => ({ ...f, projectId: vals }))}
                    />
                </FormField>
            )}
        </>
    );
}

/* โ”€โ”€ Checkbox Dropdown (multi-select with search + pills) โ”€โ”€ */
function CheckboxDropdown({ options, selected, onChange, placeholder }: {
    options: { value: number; label: string }[];
    selected: number[];
    onChange: (values: number[]) => void;
    placeholder: string;
}) {
    const { t } = usePageTranslation();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
    const selectedLabels = options.filter(o => selected.includes(o.value));

    const toggle = (val: number) => {
        onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
    };

    return (
        <div className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full text-left border rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50 transition flex items-center justify-between min-h-[40px]"
            >
                {selectedLabels.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {selectedLabels.map(s => (
                            <span key={s.value} className="inline-flex items-center gap-1 bg-nv-violet-light text-nv-violet-dark text-xs font-medium px-2 py-0.5 rounded-full">
                                {s.label}
                                <button type="button" onClick={(e) => { e.stopPropagation(); toggle(s.value); }}
                                    className="hover:text-blue-900 ml-0.5">ร—</button>
                            </span>
                        ))}
                    </div>
                ) : (
                    <span className="text-gray-400">{placeholder}</span>
                )}
                <svg className={`w-4 h-4 text-gray-400 ml-2 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-[220px] flex flex-col">
                    {/* Search */}
                    <div className="p-2 border-b">
                        <input
                            type="text"
                            placeholder={t('Search...', 'Search...')}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full border rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-200"
                            autoFocus
                        />
                    </div>
                    {/* Options */}
                    <div className="overflow-y-auto flex-1">
                        {filtered.length === 0 ? (
                            <div className="px-3 py-4 text-center text-gray-400 text-sm">No results found</div>
                        ) : (
                            filtered.map(opt => (
                                <label key={opt.value}
                                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-nv-violet-light cursor-pointer text-sm transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(opt.value)}
                                        onChange={() => toggle(opt.value)}
                                        className="rounded accent-blue-600 w-4 h-4"
                                    />
                                    <span className="text-gray-700">{opt.label}</span>
                                </label>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* โ”€โ”€ Reusable Components โ”€โ”€ */



function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative w-12 h-6 rounded-full transition-colors ${checked ? "bg-green-500" : "bg-gray-300"}`}
        >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-6" : ""}`} />
        </button>
    );
}

function ItemCard({ item, type, onEdit, onDelete }: {
    item: { isActive?: boolean; assignments?: any[];[key: string]: any },
    type: "addition" | "deduction",
    onEdit: (item: any) => void,
    onDelete: (id: number) => void
}) {
    const isAddition = type === "addition";
    const name = isAddition ? item.additionsName : item.deductionName;
    const id = isAddition ? item.additionsId : item.deductionId;
    const amount = item.unitAmount ? `เธฟ ${item.unitAmount?.toLocaleString()}` : `${item.percentAmount}% of Salary`;

    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden">
            {/* Background pattern */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:scale-150 transition-transform ${isAddition ? "bg-nv-violet" : "bg-rose-500"}`}></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isAddition ? "bg-nv-violet-light text-nv-violet" : "bg-rose-50 text-rose-500"}`}>
                    {isAddition ? <ArrowUpCircle className="w-8 h-8" /> : <ArrowDownCircle className="w-8 h-8" />}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(item)}
                        className="p-2.5 bg-slate-50 text-slate-400 hover:text-nv-violet hover:bg-nv-violet-light rounded-xl transition-all active:scale-95"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(id)}
                        className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-95"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-1 relative z-10">
                <h3 className="text-xl font-black text-slate-800 truncate tracking-tight">{name}</h3>
                <p className="text-slate-400 text-sm font-bold truncate">Default: {amount}</p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                    {item.isActive ? (
                        <div className="bg-nv-violet-light px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-100">
                            <CheckCircle2 className="w-3 h-3 text-nv-violet" />
                            <span className="text-[10px] uppercase font-black text-nv-violet tracking-wider">Active</span>
                        </div>
                    ) : (
                        <div className="bg-slate-50 px-3 py-1 rounded-full flex items-center gap-1.5 border border-slate-100">
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Draft</span>
                        </div>
                    )}
                </div>

                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                    <List className="w-3 h-3" />
                    {item.assignments?.length || 0} Rules
                </span>
            </div>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="col-span-full py-20 bg-white rounded-[3rem] border border-slate-50 border-dashed flex flex-col items-center justify-center gap-4 text-slate-400">
            <Settings2 className="w-16 h-16 opacity-10" />
            <p className="font-bold italic">{message}</p>
        </div>
    );
}
