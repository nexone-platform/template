"use client";

import { useState } from "react";
import { useEmployees } from "@/hooks/use-employee";
import {
    CreditCard,
    CalendarCheck,
    FileText,
    LogOut,
    Save,
    Plus,
    X,
    Info
} from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/lib/routes";
import { PageHeader, ui } from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

export default function ApprovalSettingsPage() {
    const { t } = usePageTranslation();
    const { data: employees } = useEmployees();
    const [activeTab, setActiveTab] = useState("expenses");

    const tabs = [
        { id: "expenses", label: t('Expenses Approval', 'Expenses Approval'), icon: <CreditCard className="w-4 h-4" /> },
        { id: "leave", label: t('Leave Approval', 'Leave Approval'), icon: <CalendarCheck className="w-4 h-4" /> },
        { id: "offer", label: t('Offer Approval', 'Offer Approval'), icon: <FileText className="w-4 h-4" /> },
        { id: "resignation", label: t('Resignation Notice', 'Resignation Notice'), icon: <LogOut className="w-4 h-4" /> },
    ];

    const [expenseApprovers, setExpenseApprovers] = useState([{ id: 1, type: "CEO" }, { id: 2, type: "Direct Manager" }]);

    const addExpenseApprover = () => {
        const newId = expenseApprovers.length + 1;
        setExpenseApprovers([...expenseApprovers, { id: newId, type: "Select Approvers" }]);
    };

    const removeExpenseApprover = (id: number) => {
        setExpenseApprovers(expenseApprovers.filter(a => a.id !== id));
    };

    const renderExpensesTab = () => (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div>
                <h4 className="font-semibold text-gray-800 mb-4">{t('Expense Approval Settings', 'Expense Approval Settings')}</h4>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                    <label className="text-sm font-medium text-gray-700 block">{t('Default Expense Approval Method', 'Default Expense Approval Method')}</label>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="radio" name="expense_mode" className="w-4 h-4 text-nv-violet" defaultChecked />
                            <div className="flex items-center gap-1.5 ">
                                <span className="text-sm text-gray-700 group-hover:text-black transition-colors">Sequence Approval (Chain)</span>
                                <Info className="w-3.5 h-3.5 text-nv-violet" />
                            </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="radio" name="expense_mode" className="w-4 h-4 text-nv-violet" />
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm text-gray-700 group-hover:text-black transition-colors">{t('Simultaneous Approval', 'Simultaneous Approval')}</span>
                                <Info className="w-3.5 h-3.5 text-nv-violet" />
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-700">{t('Expense Approvers', 'Expense Approvers')}</label>
                <div className="space-y-3">
                    {expenseApprovers.map((approver, index) => (
                        <div key={approver.id} className="flex items-center gap-4 group">
                            <div className="w-32 text-xs font-medium text-gray-400 uppercase tracking-wider">Approver {index + 1}</div>
                            <div className="flex-1 max-w-md relative">
                                <select className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-nv-violet transition-all appearance-none cursor-pointer">
                                    <option>{approver.type}</option>
                                    <option>{t('CEO', 'CEO')}</option>
                                    <option>{t('Direct Manager', 'Direct Manager')}</option>
                                    <option>{t('Finance Manager', 'Finance Manager')}</option>
                                    {employees?.map((emp: any) => (
                                        <option key={emp.employeeId}>{emp.firstName} {emp.lastName}</option>
                                    ))}
                                </select>
                            </div>
                            {index > 0 && (
                                <button onClick={() => removeExpenseApprover(approver.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                    <div className="flex items-center gap-4 pt-2">
                        <div className="w-32"></div>
                        <button onClick={addExpenseApprover} className="text-nv-violet hover:text-nv-violet-dark font-medium text-sm flex items-center gap-1 px-2 py-1 hover:bg-nv-violet-light rounded-md transition-all">
                            <Plus className="w-4 h-4" /> {t('Add Approver', 'Add Approver')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end border-t border-gray-100 pt-6">
                <button onClick={() => toast.success("Expense approval settings saved")} className="px-6 py-2.5 bg-nv-violet text-white rounded-xl hover:bg-nv-violet-dark shadow-md transition-all flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {t('Save Changes', 'Save Changes')}
                </button>
            </div>
        </div>
    );

    const renderLeaveTab = () => (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div>
                <h4 className="font-semibold text-gray-800 mb-4">{t('Leave Approval Settings', 'Leave Approval Settings')}</h4>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                    <label className="text-sm font-medium text-gray-700 block">{t('Default Leave Approval Method', 'Default Leave Approval Method')}</label>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="radio" name="leave_mode" className="w-4 h-4 text-nv-violet" />
                            <span className="text-sm text-gray-700">{t('Sequence Approval', 'Sequence Approval')}</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="radio" name="leave_mode" className="w-4 h-4 text-nv-violet" defaultChecked />
                            <span className="text-sm text-gray-700">{t('Simultaneous Approval', 'Simultaneous Approval')}</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-700">{t('Leave Approvers', 'Leave Approvers')}</label>
                <div className="max-w-md">
                    <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-nv-violet transition-all">
                        <option>{t('Test Lead', 'Test Lead')}</option>
                        <option>{t('UI/UX Designer', 'UI/UX Designer')}</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-end border-t border-gray-100 pt-6">
                <button onClick={() => toast.success("Leave approval settings saved")} className="px-6 py-2.5 bg-nv-violet text-white rounded-xl hover:bg-nv-violet-dark shadow-md transition-all flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {t('Save Changes', 'Save Changes')}
                </button>
            </div>
        </div>
    );

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Approval Settings', 'Approval Settings')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard }, { label: t('Approval Settings', 'Approval Settings') }]}
            />

            <div className={ui.tableWrapper}>
                <div className="border-b border-gray-100">
                    <div className="flex px-6 overflow-x-auto no-scrollbar">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 px-6 text-sm font-medium transition-all relative whitespace-nowrap ${activeTab === tab.id
                                    ? "text-nv-violet"
                                    : "text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-nv-violet animate-in slide-in-from-left duration-300" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-8 flex-1 overflow-y-auto">
                    {activeTab === "expenses" && renderExpensesTab()}
                    {activeTab === "leave" && renderLeaveTab()}
                    {activeTab === "offer" && (
                        <div className="text-center py-20 text-gray-400">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-10" />
                            <p>Offer approval settings configuration...</p>
                        </div>
                    )}
                    {activeTab === "resignation" && (
                        <div className="space-y-6">
                            <h4 className="font-semibold text-gray-800">{t('Resignation Notice Configuration', 'Resignation Notice Configuration')}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">{t('Email Notification Profile', 'Email Notification Profile')}</label>
                                    <select className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                                        <option>{t('HR Manager', 'HR Manager')}</option>
                                        <option>{t('Direct Supervisor', 'Direct Supervisor')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">{t('Notice Period (Days)', 'Notice Period (Days)')}</label>
                                    <input type="number" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50" defaultValue={30} />
                                </div>
                            </div>
                            <div className="flex justify-end pt-6">
                                <button className="px-6 py-2.5 bg-nv-violet text-white rounded-xl hover:bg-nv-violet-dark shadow-md">{t('Save Changes', 'Save Changes')}</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
