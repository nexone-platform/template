"use client";

import { useState } from "react";
import { usePayrollById, useLastPayrollId } from "@/hooks/use-payroll";
import { Printer, Download, FileSpreadsheet, ArrowLeft, Info } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { getUserId } from "@/lib/auth";
import {
    PageHeader, LoadingSpinner, ModalWrapper, EmptyState, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

/* ── helpers ── */
const fmtDate = (d: string | Date | null | undefined) => {
    if (!d) return "-";
    const dt = new Date(d as string);
    if (isNaN(dt.getTime())) return "-";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
};

const fmtMonthYear = (d: string | Date | null | undefined) => {
    if (!d) return "-";
    const dt = new Date(d as string);
    if (isNaN(dt.getTime())) return "-";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[dt.getMonth()]}, ${dt.getFullYear()}`;
};

const fmtYear = (d: string | Date | null | undefined) => {
    if (!d) return "-";
    const dt = new Date(d as string);
    if (isNaN(dt.getTime())) return "-";
    return String(dt.getFullYear());
};

const fmtNum = (n: number | null | undefined) =>
    (n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function SalaryViewPage() {
    const { t } = usePageTranslation();
    const params = useParams();
    const router = useRouter();
    const paramPayrollId = String(params.payrollId || "");

    const isPlaceholder = paramPayrollId.includes("payrollId");
    const userId = isPlaceholder ? Number(getUserId() || 0) : 0;
    const { data: lastPayrollId, isFetched: isLastPayrollFetched } = useLastPayrollId(userId);

    const resolvedPayrollId = isPlaceholder
        ? (lastPayrollId ? Number(lastPayrollId) : 0)
        : Number(paramPayrollId);

    const { data: salary, isLoading, isFetched: isSalaryFetched } = usePayrollById(resolvedPayrollId);

    const [showAdditionModal, setShowAdditionModal] = useState(false);
    const [showDeductionModal, setShowDeductionModal] = useState(false);

    const isStillLoading = isLoading || (isPlaceholder && userId > 0 && !isLastPayrollFetched);

    const hasNoData = !isStillLoading && (
        (isPlaceholder && userId === 0)
        || (isPlaceholder && isLastPayrollFetched && !lastPayrollId)
        || (!isPlaceholder && isSalaryFetched && !salary)
        || (resolvedPayrollId > 0 && isSalaryFetched && !salary)
    );

    if (isStillLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <LoadingSpinner message="Loading payslip..." />
            </div>
        );
    }

    if (hasNoData || !salary) {
        return (
            <div className="p-6 text-center min-h-[400px] flex flex-col items-center justify-center">
                <EmptyState message="ไม่พบข้อมูลใบเงินเดือน" />
                <button onClick={() => router.push("/payroll/employee-salary")}
                    className="mt-4 text-nv-violet hover:underline text-sm font-medium flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
            </div>
        );
    }

    const emp = salary.employee || {} as any;

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Payslip', 'Payslip')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Payslip', 'Payslip') },
                ]}
                actions={
                    <div className="flex gap-2">
                        <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2 shadow-sm">
                            <FileSpreadsheet className="w-4 h-4 text-green-600" /> CSV
                        </button>
                        <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2 shadow-sm">
                            <Download className="w-4 h-4 text-red-600" /> PDF
                        </button>
                        <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2 shadow-sm">
                            <Printer className="w-4 h-4 text-nv-violet" /> Print
                        </button>
                    </div>
                }
            />

            {/* Payslip Card */}
            <div className={ui.tableWrapper}>
                <div className="p-6 md:p-10">

                    <h4 className="text-center text-lg font-semibold text-gray-800 mb-8">
                        Payroll for the Month Period of {fmtMonthYear(salary.monthYear)}
                    </h4>

                    {/* Header: Company + Period */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            {emp.logo ? (
                                <img src={emp.logo} alt="Company Logo" className="h-12 mb-3 object-contain" />
                            ) : (
                                <img src="/assets/img/logo2.png" alt="Company Logo" className="h-12 mb-3 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            )}
                            <ul className="text-sm text-gray-600 space-y-0.5">
                                <li className="font-bold text-gray-800">{emp.company}</li>
                                <li>{emp.companyAddress}</li>
                            </ul>
                        </div>
                        <div className="text-left md:text-right">
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li><strong>Payroll Period:</strong> {salary.payrollPeriod}</li>
                                <li><strong>Payment Date:</strong> {fmtDate(salary.payDate)}</li>
                                <li><strong>Bank Account:</strong> {salary.bankAccount}</li>
                            </ul>
                        </div>
                    </div>

                    {/* Employee Details */}
                    <div className="mb-8 bg-gray-50 rounded-lg p-4">
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li><strong>Employee Name:</strong> {emp.firstNameEn} {emp.lastNameEn}</li>
                            <li><strong>Position:</strong> {emp.designationName}</li>
                            <li><strong>Employee ID:</strong> {emp.employeeCode}</li>
                            <li><strong>Joining Date:</strong> {fmtDate(emp.joinDate)}</li>
                        </ul>
                    </div>

                    {/* Earnings / Deductions / YTD */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Earnings */}
                        <div>
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-nv-violet" /> Earnings
                            </h4>
                            <table className={`${ui.table} border border-gray-200 rounded-lg overflow-hidden`}>
                                <tbody className={ui.tbody}>
                                    {[
                                        ["Salary/Wage", salary.salary],
                                        ["Overtime", salary.overtime],
                                        ["Commission", salary.commission],
                                        ["Bonus", salary.bonus],
                                        ["Other", salary.otherAdditions],
                                    ].map(([label, val], i) => (
                                        <tr key={i} className={ui.tr}>
                                            <td className="py-2 px-3 font-medium text-gray-700 text-sm">{label}</td>
                                            <td className="py-2 px-3 text-right text-gray-800 text-sm">{fmtNum(val as number)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Deductions */}
                        <div>
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500" /> Deductions
                            </h4>
                            <table className={`${ui.table} border border-gray-200 rounded-lg overflow-hidden`}>
                                <tbody className={ui.tbody}>
                                    {[
                                        ["Social Security Fund", salary.socialSecurityFund],
                                        ["Withholding Tax", salary.wht],
                                        ["Student Loan Fund", salary.slf],
                                        ["Absent/Leave/Late", salary.penaltyAmount],
                                        ["Other", salary.otherDeductions],
                                    ].map(([label, val], i) => (
                                        <tr key={i} className={ui.tr}>
                                            <td className="py-2 px-3 font-medium text-gray-700 text-sm">{label}</td>
                                            <td className="py-2 px-3 text-right text-gray-800 text-sm">{fmtNum(val as number)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* YTD Summary */}
                        <div>
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-nv-violet" /> {fmtYear(salary.monthYear)}
                            </h4>
                            <table className={`${ui.table} border border-gray-200 rounded-lg overflow-hidden`}>
                                <tbody className={ui.tbody}>
                                    {[
                                        ["YTD Earnings", salary.ytdEarnings],
                                        ["YTD Withholding Tax", salary.ytdWithholdingTax],
                                        ["Accumulated SSF", salary.accumulatedSsf],
                                    ].map(([label, val], i) => (
                                        <tr key={i} className={ui.tr}>
                                            <td className="py-2 px-3 font-medium text-gray-700 text-sm">{label}</td>
                                            <td className="py-2 px-3 text-right text-gray-800 text-sm">{fmtNum(val as number)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Net Salary / Totals */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="space-y-2">
                            <p className="text-sm text-gray-700">
                                <strong>Total Earnings: </strong>{fmtNum(salary.totalAdditions)}
                                <button onClick={() => setShowAdditionModal(true)} className="ml-1 text-nv-violet hover:text-nv-violet-dark">
                                    <Info className="w-4 h-4 inline" />
                                </button>
                            </p>
                            <p className="text-sm text-gray-700">
                                <strong>Total Deductions: </strong>{fmtNum(salary.totalDeductions)}
                                <button onClick={() => setShowDeductionModal(true)} className="ml-1 text-nv-violet hover:text-nv-violet-dark">
                                    <Info className="w-4 h-4 inline" />
                                </button>
                            </p>
                            <div className="pt-3 border-t border-gray-200">
                                <h5 className="text-lg font-bold text-gray-900">
                                    Net Salary: {fmtNum(salary.netSalary)}
                                    {salary.netSalaryInWords && (
                                        <span className="text-sm font-normal text-gray-500 ml-2">({salary.netSalaryInWords})</span>
                                    )}
                                </h5>
                            </div>
                        </div>
                        <div>
                            <h5 className="font-bold text-gray-800 mb-1">Remarks</h5>
                            <p className="text-sm text-gray-600">{salary.remarks || "No remarks available."}</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400 italic">
                            This is a computer-generated payslip and does not require a physical signature.
                        </p>
                        <p className="text-xs text-gray-400 italic mt-1">Company Stamp.</p>
                    </div>
                </div>
            </div>

            {/* Additions Info Modal */}
            <ModalWrapper open={showAdditionModal} onClose={() => setShowAdditionModal(false)} title={t('Additions Info', 'Additions Info')} maxWidth="max-w-md">
                {salary.additions && salary.additions.length > 0 ? (
                    <div className="space-y-3">
                        {salary.additions.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded-lg">
                                <strong className="text-gray-700">{item.additionName}</strong>
                                <span className="text-gray-800">{fmtNum(item.amount)}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState message="No additions available." />
                )}
            </ModalWrapper>

            {/* Deductions Info Modal */}
            <ModalWrapper open={showDeductionModal} onClose={() => setShowDeductionModal(false)} title={t('Deductions Info', 'Deductions Info')} maxWidth="max-w-md">
                {salary.deductions && salary.deductions.length > 0 ? (
                    <div className="space-y-3">
                        {salary.deductions.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded-lg">
                                <strong className="text-gray-700">{item.deductionName}</strong>
                                <span className="text-gray-800">{fmtNum(item.amount)}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState message="No deductions available." />
                )}
            </ModalWrapper>
        </div>
    );
}
