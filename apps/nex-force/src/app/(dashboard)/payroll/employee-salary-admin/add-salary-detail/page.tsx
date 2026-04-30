"use client";

import { useState, useEffect, useMemo, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    useEmpByPayment,
    usePayrollByPeriod,
    useSSORates,
    useCreatePayroll,
    useAllEmployees,
    EmployeePaymentDto,
    AdditionData,
    DeductionData,
    Summary,
    SocialSecurityRate,
} from "@/hooks/use-payroll";
import apiClient from "@/lib/api-client";
import { format } from "date-fns";
import { useMessages } from "@/hooks/use-messages";
import {
    Save,
    Send,
    Plus,
    Trash2,
} from "lucide-react";
import {
    PageHeader, TableHeaderBar, ActionButtons, EmptyState, PaginationBar,
    FormField, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

/* ── Enums matching Angular: AdditionTypeEnum, DeductionTypeEnum ── */
const AdditionTypeLabels: Record<number, string> = {
    1: "Salary", 2: "Overtime", 3: "Commission", 4: "Bonus", 5: "Travel", 6: "Shift", 7: "Other",
};
const DeductionTypeLabels: Record<number, string> = {
    1: "Social Security Fund", 2: "Withholding Tax", 3: "Student Loan Fund", 4: "Absent/Leave/Late", 5: "Other",
};
const additionTypes = Object.entries(AdditionTypeLabels).map(([k, v]) => ({ value: Number(k), label: v }));
const deductionTypes = Object.entries(DeductionTypeLabels).map(([k, v]) => ({ value: Number(k), label: v }));

/* ── PeriodStatus matching Angular constant ── */
const PeriodStatus = { Draft: 1, PendingApproval: 2, Approved: 3, Declined: 4, Return: 5 };

const fmtNum = (n: number | null | undefined) =>
    (n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ── Imperative API: get estimated tax by employee ID (Angular: ss.getEstimatedById) ── */
async function fetchEstimatedTax(employeeId: number): Promise<{ monthlyTax: number; yearlyTax: number } | null> {
    try {
        const { data } = await apiClient.get<{ monthlyTax: number; yearlyTax: number }>(`salary/estimated-tax/${employeeId}`);
        return data;
    } catch {
        return null;
    }
}

function AddSalaryDetailContent() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showWarning } = useMessages();
    const router = useRouter();
    const searchParams = useSearchParams();

    const periodId = Number(searchParams.get("periodId") || "0");
    const paymentTypeId = Number(searchParams.get("paymentTypeId") || "0");
    const paymentChannelId = Number(searchParams.get("paymentChannelId") || "0");
    const readonlyParam = searchParams.get("readonly") === "true";

    // ── Angular: redirect if no paymentTypeId/paymentChannelId ──
    useEffect(() => {
        if (!paymentTypeId || !paymentChannelId) {
            router.replace("/payroll/employee-salary-admin");
        }
    }, [paymentTypeId, paymentChannelId, router]);

    const { data: ssoRates } = useSSORates();
    const { data: allEmployeesRaw } = useAllEmployees();
    const createPayrollMutation = useCreatePayroll();

    const [readonly] = useState(readonlyParam);
    const [isProcessing, setIsProcessing] = useState(false);

    // ── Angular: salaryForm fields ──
    const [transactionDate, setTransactionDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
    const [startDate, setStartDate] = useState(() => format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState(() => format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), "yyyy-MM-dd"));
    const [paymentDate, setPaymentDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
    const [socialSecurityRateId, setSocialSecurityRateId] = useState<number>(6);

    const [employees, setEmployees] = useState<EmployeePaymentDto[]>([]);
    const [summary, setSummary] = useState<Summary>({
        totalEmployee: 0, sumSalary: 0, totalAddiction: 0, totalDeduction: 0,
        netPayment: 0, bankPayment: 0, cashPayment: 0, totalCost: 0,
    });
    const [transactionData, setTransactionData] = useState<any>(null);

    /* =====================================================
     *  Angular: calculateSsoAtFirst(employee) 
     *  คำนวณ SSF สำหรับพนักงาน + push/update deduction
     * ===================================================== */
    const calculateSsoForEmployee = useCallback((emp: EmployeePaymentDto, rates: SocialSecurityRate[], ssoId: number): EmployeePaymentDto => {
        const ssoRate = rates.find(r => r.socialSecurityId === ssoId);
        if (!ssoRate) return emp;

        const baseSalary = emp.salary || 0;
        const applicableSalary = Math.min(baseSalary, ssoRate.maxSalary || 0);
        const calculated = (applicableSalary * ssoRate.percentage) / 100;
        const socialSecurity = Math.min(calculated, ssoRate.maxDeduction || 0);

        const deductions = [...(emp.deductions || [])];
        const existingIdx = deductions.findIndex(d => d.type === 1); // type 1 = Social Security Fund

        if (existingIdx >= 0) {
            deductions[existingIdx] = { ...deductions[existingIdx], amount: socialSecurity };
        } else {
            deductions.push({
                deductionId: 1,
                deductionName: "Social Security",
                amount: socialSecurity,
                isPersonal: true,
                type: 1, // DeductionTypeEnum.SocialSecurityFund
            });
        }

        return { ...emp, deductions, socialSecurity };
    }, []);

    /* =====================================================
     *  Angular: calculateWthAtFirst(employee, monthlyTax) 
     *  คำนวณ WHT สำหรับพนักงาน + push/update deduction
     * ===================================================== */
    const calculateWhtForEmployee = useCallback((emp: EmployeePaymentDto, monthlyTax: number): EmployeePaymentDto => {
        const deductions = [...(emp.deductions || [])];
        const existingIdx = deductions.findIndex(d => d.type === 2); // type 2 = Withholding Tax

        if (existingIdx >= 0) {
            deductions[existingIdx] = { ...deductions[existingIdx], amount: monthlyTax };
        } else {
            deductions.push({
                deductionId: 2,
                deductionName: "Withholding Tax",
                amount: monthlyTax,
                isPersonal: true,
                type: 2, // DeductionTypeEnum.WithholdingTax
            });
        }

        return { ...emp, deductions, tax401: monthlyTax, tax402: monthlyTax };
    }, []);

    /* =====================================================
     *  Angular: calculateTotalAmounts(employee)
     * ===================================================== */
    const calculateTotalAmounts = useCallback((emp: EmployeePaymentDto): EmployeePaymentDto => {
        const totalAdditions = (emp.additions || []).reduce((acc, a) => acc + (Number(a.amount) || 0), 0);
        const totalDeductions = (emp.deductions || []).reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
        const totalPayment = (emp.salary || 0) + totalAdditions - totalDeductions;
        return { ...emp, totalAdditions, totalDeductions, totalPayment };
    }, []);

    /* =====================================================
     *  Angular: full init → getEstimatedById → SSO → WHT → totals
     *  Used when loading employees or adding new ones
     * ===================================================== */
    const initializeEmployee = useCallback(async (
        emp: EmployeePaymentDto,
        rates: SocialSecurityRate[],
        ssoId: number
    ): Promise<EmployeePaymentDto> => {
        let updated = calculateSsoForEmployee(emp, rates, ssoId);

        const taxData = await fetchEstimatedTax(emp.id);
        if (taxData) {
            updated = calculateWhtForEmployee(updated, taxData.monthlyTax);
        }

        updated = calculateTotalAmounts(updated);
        return updated;
    }, [calculateSsoForEmployee, calculateWhtForEmployee, calculateTotalAmounts]);

    // ── Angular: calculateSummary() ──
    const calculateSummary = useCallback((emps: EmployeePaymentDto[]) => {
        let totalEmployee = 0, sumSalary = 0, totalAddiction = 0, totalDeduction = 0;
        let netPayment = 0, bankPayment = 0, cashPayment = 0, totalCost = 0;

        emps.forEach(emp => {
            totalEmployee++;
            sumSalary += emp.salary || 0;
            totalAddiction += emp.totalAdditions || 0;
            totalDeduction += emp.totalDeductions || 0;
            netPayment += emp.totalPayment || 0;

            // ── Angular: totalCost = salary + type1 deductions (Social Security) ──
            const typeOneDeductions = (emp.deductions || [])
                .filter(d => d.type === 1)
                .reduce((s, d) => s + (d.amount || 0), 0);
            totalCost += (emp.salary || 0) + typeOneDeductions;

            if (paymentChannelId === 1) bankPayment += emp.totalPayment || 0;
            else cashPayment += emp.totalPayment || 0;
        });

        setSummary({ totalEmployee, sumSalary, totalAddiction, totalDeduction, netPayment, bankPayment, cashPayment, totalCost });
    }, [paymentChannelId]);

    // ── Load existing period data ──
    const { data: periodPayroll } = usePayrollByPeriod(periodId, paymentTypeId, paymentChannelId);
    const { data: newEmployees } = useEmpByPayment(periodId === 0 ? paymentTypeId : 0);

    useEffect(() => {
        if (periodId > 0 && periodPayroll && ssoRates) {
            const empData = periodPayroll.employeeData || [];
            setTransactionData(periodPayroll.transactionData);

            const td = periodPayroll.transactionData as any;
            let resolvedSsoId = socialSecurityRateId;
            if (td) {
                if (td.transactionDate) setTransactionDate(format(new Date(td.transactionDate), "yyyy-MM-dd"));
                if (td.startDate || td.periodStartDate) setStartDate(format(new Date(td.startDate || td.periodStartDate), "yyyy-MM-dd"));
                if (td.endDate || td.periodEndDate) setEndDate(format(new Date(td.endDate || td.periodEndDate), "yyyy-MM-dd"));
                if (td.paymentDate) setPaymentDate(format(new Date(td.paymentDate), "yyyy-MM-dd"));

                // ── Angular: patchValue finds SSO rate by percentage ──
                if (td.socialSecurityRate) {
                    const found = ssoRates.find(r => r.percentage === td.socialSecurityRate);
                    if (found) {
                        setSocialSecurityRateId(found.socialSecurityId);
                        resolvedSsoId = found.socialSecurityId;
                    }
                }
            }

            // ── Angular: onControlChange → recalculate SSO/WHT/totals for ALL employees ──
            const initAll = async () => {
                const initialized = await Promise.all(
                    empData.map(emp => initializeEmployee(emp, ssoRates, resolvedSsoId))
                );
                setEmployees(initialized);
                calculateSummary(initialized);
            };
            initAll();
        } else if (periodId === 0 && newEmployees && ssoRates) {
            // ── Angular: getListEmployeeByPayment → init each employee with SSO/WHT/totals ──
            const initAll = async () => {
                const initialized = await Promise.all(
                    (newEmployees as EmployeePaymentDto[]).map(emp => initializeEmployee(emp, ssoRates, socialSecurityRateId))
                );
                setEmployees(initialized);
                calculateSummary(initialized);
            };
            initAll();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periodId, periodPayroll, newEmployees, ssoRates]);

    // ── Angular: getLatestMonthRange() ──
    const monthRange = useMemo(() => {
        const today = new Date();
        const s = new Date(today.getFullYear(), today.getMonth(), 1);
        const e = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return `${s.getDate()}-${e.getDate()}/${String(s.getMonth() + 1).padStart(2, "0")}/${s.getFullYear()}`;
    }, []);

    // ── Angular: onSave(status) ──
    const handleSave = async (status: number) => {
        // ── Angular: form validation check ──
        if (!transactionDate || !startDate || !endDate || !paymentDate) {
            showWarning('REQUIRED_FIELDS', 'Warning!', "Please fill all required date fields.");
            return;
        }

        setIsProcessing(true);
        const ssoRateObj = ssoRates?.find(r => r.socialSecurityId === socialSecurityRateId);

        const payload = {
            employeeData: employees,
            transactionData: {
                transactionDate,
                startDate,
                endDate,
                paymentDate,
                socialSecurityRate: ssoRateObj ? ssoRateObj.percentage : 0,
                periodId,
                status,
                paymentChannel: paymentChannelId,
                paymentTypeId,
                summary,
            },
        };

        try {
            const response = await createPayrollMutation.mutateAsync(payload);
            showSuccess('SAVE_SUCCESS', 'Success!', response.message || "Payroll cycle saved.").then(() => {
                // ── Angular: after save → reset, reload detail with new periodId ──
                if ((response as any).data?.periodId || (response as any).periodId) {
                    const newPeriodId = (response as any).data?.periodId || (response as any).periodId;
                    router.replace(
                        `/payroll/employee-salary-admin/add-salary-detail?periodId=${newPeriodId}&paymentTypeId=${paymentTypeId}&paymentChannelId=${paymentChannelId}&readonly=false`
                    );
                } else {
                    router.push("/payroll/employee-salary-admin");
                }
            });
        } catch {
            showError('SAVE_ERROR', 'Error', 'Failed to save data.');
        } finally {
            setIsProcessing(false);
        }
    };

    // ── Angular: Draft/Send disable condition ──
    const isSaveDisabled = isProcessing || createPayrollMutation.isPending ||
        (transactionData && transactionData.status !== PeriodStatus.Draft && transactionData.status !== PeriodStatus.Return);

    // ── Add Employee Modal (Angular: #employee_modal) ──
    const [showEmpModal, setShowEmpModal] = useState(false);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [empSearchText, setEmpSearchText] = useState("");

    // ── Angular: getEmployee() → filter out already added ──
    const availableEmployees = useMemo(() => {
        if (!allEmployeesRaw) return [];
        return allEmployeesRaw.filter(
            (emp: any) => !employees.some(e => e.id === emp.id)
        );
    }, [allEmployeesRaw, employees]);

    // ── Search filter for modal ──
    const filteredEmployees = useMemo(() => {
        if (!empSearchText.trim()) return availableEmployees;
        const q = empSearchText.toLowerCase().trim();
        return availableEmployees.filter((emp: any) =>
            `${emp.firstNameEn || ""} ${emp.lastNameEn || ""}`.toLowerCase().includes(q) ||
            (emp.email || "").toLowerCase().includes(q) ||
            (emp.bankAccountNo || "").toLowerCase().includes(q)
        );
    }, [availableEmployees, empSearchText]);

    const toggleSelectRow = (emp: any) => {
        if (selectedRows.some(r => r.id === emp.id)) {
            setSelectedRows(selectedRows.filter(r => r.id !== emp.id));
        } else {
            setSelectedRows([...selectedRows, emp]);
        }
    };
    const toggleSelectAll = (checked: boolean) => {
        setSelectedRows(checked ? [...filteredEmployees] : []);
    };

    // ── Angular: addRow() → push selected, getEstimatedById for each, calculateSummary ──
    const handleAddEmployees = async () => {
        if (selectedRows.length === 0) return;
        if (!ssoRates) return;

        // Angular: for each selected employee → getEstimatedById → SSO → WHT → totals
        const initialized = await Promise.all(
            selectedRows.map(emp => initializeEmployee(emp, ssoRates, socialSecurityRateId))
        );

        setEmployees(prev => {
            const newEmps = [...prev, ...initialized];
            calculateSummary(newEmps);
            return newEmps;
        });
        setSelectedRows([]);
        setShowEmpModal(false);
    };

    // ── Angular: deleteEmployee(index) ──
    const deleteEmployee = (index: number) => {
        setEmployees(prev => {
            const arr = [...prev];
            arr.splice(index, 1);
            calculateSummary(arr);
            return arr;
        });
    };

    // ── Edit Salary Modal (Angular: #salary_modal with payrollForm) ──
    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [editingEmpIndex, setEditingEmpIndex] = useState(-1);
    const [editBaseSalary, setEditBaseSalary] = useState(0);
    const [editIncreases, setEditIncreases] = useState<{ type: number; amount: number }[]>([]);
    const [editDecreases, setEditDecreases] = useState<{ type: number; amount: number }[]>([]);
    const [editSocialSecurity, setEditSocialSecurity] = useState(0);
    const [editTax401, setEditTax401] = useState(0);
    const [editRemark, setEditRemark] = useState("");

    /* =====================================================
     *  Angular: openSalaryModal(employee)
     *  - patch baseSalary
     *  - populate increases from employee.additions
     *  - populate decreases from employee.deductions
     *  - calculateSocialSecurity()
     *  - calculateWithholdingTax(salary, empId)  ← API call
     * ===================================================== */
    const openSalaryModal = async (emp: EmployeePaymentDto, idx: number) => {
        setEditingEmpIndex(idx);
        setEditBaseSalary(emp.salary || 0);
        setEditRemark((emp as any).remark || "");

        // ── Angular: populate increases (additions) into form array ──
        setEditIncreases((emp.additions || []).map(a => ({ type: a.type, amount: a.amount })));

        // ── Angular: populate decreases (deductions) into form array ──
        setEditDecreases((emp.deductions || []).map(d => ({ type: d.type, amount: d.amount })));

        // ── Angular: calculateSocialSecurity() ──
        const ssoRate = ssoRates?.find(r => r.socialSecurityId === socialSecurityRateId);
        let ssoAmount = 0;
        if (ssoRate) {
            const applicableSalary = Math.min(emp.salary || 0, ssoRate.maxSalary || 0);
            const calculated = (applicableSalary * ssoRate.percentage) / 100;
            ssoAmount = Math.min(calculated, ssoRate.maxDeduction || 0);
            setEditSocialSecurity(ssoAmount);

            // ── Angular: update SSO in decreasesArray (find type===1) ──
            setEditDecreases(prev => {
                const arr = [...prev];
                const existingIdx = arr.findIndex(d => d.type === 1);
                if (existingIdx >= 0) {
                    arr[existingIdx] = { ...arr[existingIdx], amount: ssoAmount };
                }
                // If no SSO in array, it will be added from deductions
                return arr;
            });
        }

        // ── Angular: calculateWithholdingTax(salary, empId) ← API call to getEstimatedById ──
        const taxData = await fetchEstimatedTax(emp.id);
        if (taxData) {
            setEditTax401(taxData.monthlyTax);
            // ── Angular: update WHT in decreasesArray (find type===2) ──
            setEditDecreases(prev => {
                const arr = [...prev];
                const existingIdx = arr.findIndex(d => d.type === 2);
                if (existingIdx >= 0) {
                    arr[existingIdx] = { ...arr[existingIdx], amount: taxData.monthlyTax };
                }
                return arr;
            });
        }

        setShowSalaryModal(true);
    };

    // ── Angular: computed totalIncrease, totalDecrease, finalSalary ──
    const editTotalIncrease = editIncreases.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const editTotalDecrease = editDecreases.reduce((s, d) => s + (Number(d.amount) || 0), 0);
    const editFinalSalary = editBaseSalary + editTotalIncrease - editTotalDecrease;

    // ── Angular: addIncrease(), removeIncrease() ──
    const addIncrease = () => setEditIncreases([...editIncreases, { type: 7, amount: 0 }]);
    const removeIncrease = (i: number) => setEditIncreases(editIncreases.filter((_, idx) => idx !== i));
    // ── Angular: addDecrease(), removeDecrease() ──
    const addDecrease = () => setEditDecreases([...editDecreases, { type: 5, amount: 0 }]);
    const removeDecrease = (i: number) => setEditDecreases(editDecreases.filter((_, idx) => idx !== i));

    /* =====================================================
     *  Angular: onSubmitEmployee()
     *  - Build additionsData from increases FormArray
     *  - Build deductionsData from decreases FormArray
     *  - Update employee with totalDeductions=totalDecrease,
     *    totalAdditions=totalIncrease, totalPayment=finalSalary,
     *    tax401, tax402, socialSecurity
     *  - calculateSummary()
     * ===================================================== */
    const handleSubmitEmployee = () => {
        if (editingEmpIndex < 0) return;
        const emp = employees[editingEmpIndex];

        // ── Angular: additionsData map from formValues.increases ──
        const additionsData: AdditionData[] = editIncreases.map(inc => ({
            additionId: inc.type,
            additionName: AdditionTypeLabels[inc.type] || "Other",
            amount: Number(inc.amount) || 0,
            isPersonal: false,
            type: inc.type,
        }));

        // ── Angular: deductionsData map from formValues.decreases ──
        const deductionsData: DeductionData[] = editDecreases.map(dec => ({
            deductionId: dec.type,
            deductionName: DeductionTypeLabels[dec.type] || "Other",
            amount: Number(dec.amount) || 0,
            isPersonal: false,
            type: dec.type,
        }));

        // ── Angular: updatedEmployeeData with all fields ──
        const updated: EmployeePaymentDto = {
            ...emp,
            salary: editBaseSalary,
            additions: additionsData,
            deductions: deductionsData,
            totalAdditions: editTotalIncrease,
            totalDeductions: editTotalDecrease,
            totalPayment: editFinalSalary,
            tax401: editTax401,
            tax402: editTax401,  // Angular: tax402 = tax401
            socialSecurity: editSocialSecurity,
        };

        setEmployees(prev => {
            const newEmps = prev.map((e, i) => i === editingEmpIndex ? updated : e);
            calculateSummary(newEmps);
            return newEmps;
        });
        setShowSalaryModal(false);
    };



    // ── Table pagination ──
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const totalData = employees.length;
    const totalPages = Math.max(1, Math.ceil(totalData / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const startIdx = (safePage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalData);
    const paginatedEmployees = employees.slice(startIdx, endIdx);


    return (
        <div className={ui.pageContainer}>
            {/* Page Header */}
            <PageHeader
                title={t('Salary Detail', 'Salary Detail')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Employee Salary Admin', 'Employee Salary Admin'), href: "/payroll/employee-salary-admin" },
                    { label: t('Salary Detail', 'Salary Detail') },
                ]}
                actions={!readonly ? (
                    <div className="flex gap-3">
                        <button onClick={() => handleSave(PeriodStatus.Draft)} disabled={!!isSaveDisabled}
                            className={ui.btnSecondary + " flex items-center gap-2"}>
                            <Save className="w-4 h-4" /> {t('Draft', 'Draft')}
                        </button>
                        <button onClick={() => handleSave(PeriodStatus.PendingApproval)} disabled={!!isSaveDisabled}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-nv-violet-dark transition font-medium text-sm disabled:opacity-50">
                            <Send className="w-4 h-4" /> {t('Send for Approval', 'Send for Approval')}
                        </button>
                    </div>
                ) : undefined}
            />

            {/* Monthly List + Date Form */}
            <div className={`${ui.tableWrapper} mb-6`}>
                <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{t('Monthly List', 'Monthly List')}</h3>
                    <p className="text-sm text-gray-500 mb-4">{monthRange}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <FormField label={t('Transaction Date', 'Transaction Date')} required>
                            <input type="date" value={transactionDate} onChange={e => setTransactionDate(e.target.value)} disabled={readonly} className={ui.input} />
                        </FormField>
                        <FormField label={t('Payment Date', 'Payment Date')} required>
                            <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} disabled={readonly} className={ui.input} />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <FormField label={t('Start Period Date', 'Start Period Date')} required>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} disabled={readonly} className={ui.input} />
                        </FormField>
                        <FormField label={t('End Period Date', 'End Period Date')} required>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} disabled={readonly} className={ui.input} />
                        </FormField>
                    </div>
                    <hr className="my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Social Security Rate', 'Social Security Rate')}>
                            <select className={ui.select} value={socialSecurityRateId} onChange={e => setSocialSecurityRateId(Number(e.target.value))} disabled={readonly}>
                                <option value="">{t('Select Social Security Rate', 'Select Social Security Rate')}</option>
                                {(ssoRates || []).map(r => (
                                    <option key={r.socialSecurityId} value={r.socialSecurityId}>{r.percentage}% (Max: {fmtNum(r.maxDeduction)})</option>
                                ))}
                            </select>
                        </FormField>
                    </div>
                </div>
            </div>

            {/* Employee Table */}
            <div className={`${ui.tableWrapper} mb-6`}>
                <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                    <TableHeaderBar pageSize={pageSize} onPageSizeChange={(v) => { setPageSize(v); setCurrentPage(1); }} />
                    {!readonly && (
                        <button onClick={() => { setShowEmpModal(true); setSelectedRows([]); setEmpSearchText(""); }} className={ui.btnPrimary + " flex items-center gap-2 text-sm"}>
                            <Plus className="w-4 h-4" /> {t('Add Employee', 'Add Employee')}
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className={`${ui.table} min-w-[900px]`}>
                        <thead className={ui.thead}>
                            <tr>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">#</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('Name', 'Name')}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('Bank Account', 'Bank Account')}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('Salary', 'Salary')}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('Addition', 'Addition')}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('Deduction', 'Deduction')}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('Net Payment', 'Net Payment')}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('Status', 'Status')}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('Action', 'Action')}</th>
                            </tr>
                        </thead>
                        <tbody className={ui.tbody}>
                            {paginatedEmployees.map((emp, idx) => {
                                const realIdx = startIdx + idx;
                                return (
                                    <tr key={emp.id || idx} className={ui.tr}>
                                        <td className={ui.tdIndex}>{realIdx + 1}</td>
                                        <td className={ui.tdBold}>{emp.firstNameEn} {emp.lastNameEn}</td>
                                        <td className={ui.td}>{emp.bankAccountNo || "-"}</td>
                                        <td className="px-4 py-3 text-sm text-right">{fmtNum(emp.salary)}</td>
                                        <td className="px-4 py-3 text-sm text-right">{fmtNum(emp.totalAdditions)}</td>
                                        <td className="px-4 py-3 text-sm text-right">{fmtNum(emp.totalDeductions)}</td>
                                        <td className="px-4 py-3 text-sm text-right font-semibold">{fmtNum(emp.totalPayment)}</td>
                                        <td className="px-4 py-3 text-sm text-center">{emp.status}</td>
                                        <td className={ui.tdActions}>
                                            <ActionButtons
                                                onEdit={() => openSalaryModal(emp, realIdx)}
                                                onDelete={!readonly ? () => deleteEmployee(realIdx) : undefined}
                                                editTitle="Edit Salary"
                                                deleteTitle="Remove Employee"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                            {employees.length === 0 && <EmptyState colSpan={9} />}
                        </tbody>
                    </table>
                </div>
                <PaginationBar currentPage={safePage} totalPages={totalPages} totalData={totalData} pageSize={pageSize} onGoToPage={setCurrentPage} />
            </div>

            {/* Summary Section */}
            <div className={`${ui.tableWrapper} mb-6`}>
                <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div></div>
                        <div className="space-y-3">
                            <div className="flex justify-between"><span className="font-medium text-gray-600">{t('Total Employee', 'Total Employee')}:</span><span className="font-semibold">{summary.totalEmployee} {t('employees', 'employees')}</span></div>
                            <hr className="border-gray-100" />
                            <div className="flex justify-between"><span className="font-medium text-gray-600">{t('Total Payroll', 'Total Payroll')}:</span><span>{fmtNum(summary.sumSalary)} THB</span></div>
                            <div className="flex justify-between"><span className="font-medium text-gray-600">{t('Total Addition', 'Total Addition')}:</span><span className="text-nv-violet">{fmtNum(summary.totalAddiction)} THB</span></div>
                            <div className="flex justify-between"><span className="font-medium text-gray-600">{t('Total Deduction', 'Total Deduction')}:</span><span className="text-red-600">{fmtNum(summary.totalDeduction)} THB</span></div>
                            <div className="flex justify-between"><span className="font-medium text-gray-600">{t('Net Payment', 'Net Payment')}:</span><span className="font-semibold">{fmtNum(summary.netPayment)} THB</span></div>
                            <hr className="border-gray-100" />
                            <div className="flex justify-between"><span className="font-medium text-gray-600">{t('Bank Transfer', 'Bank Transfer')}:</span><span>{fmtNum(summary.bankPayment)} THB</span></div>
                            <div className="flex justify-between"><span className="font-medium text-gray-600">{t('Cash Payment', 'Cash Payment')}:</span><span>{fmtNum(summary.cashPayment)} THB</span></div>
                            <hr className="border-gray-100" />
                            <div className="flex justify-between font-bold text-lg"><span className="text-gray-800">{t('Total Cost', 'Total Cost')}:</span><span>{fmtNum(summary.totalCost)} THB</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Add Employee Modal (Angular: #employee_modal) ── */}
            {showEmpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowEmpModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b flex justify-between items-center shrink-0">
                            <h3 className="text-lg font-semibold text-gray-800">{t('Add Employee', 'Add Employee')}</h3>
                            <button onClick={() => setShowEmpModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                        </div>
                        <div className="px-6 py-3 border-b shrink-0">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={t('Search by name, email or bank account...', 'Search by name, email or bank account...')}
                                    value={empSearchText}
                                    onChange={e => setEmpSearchText(e.target.value)}
                                    className="w-full px-4 py-2 pl-10 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                            </div>
                        </div>
                        <div className="overflow-auto flex-grow">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b text-gray-600 sticky top-0">
                                    <tr>
                                        {!readonly && (
                                            <th className="px-4 py-3 text-center">
                                                <input type="checkbox" onChange={e => toggleSelectAll(e.target.checked)} checked={filteredEmployees.length > 0 && filteredEmployees.every((emp: any) => selectedRows.some(r => r.id === emp.id))} />
                                            </th>
                                        )}
                                        <th className="px-4 py-3 text-center">#</th>
                                        <th className="px-4 py-3 text-center">{t('Name', 'Name')}</th>
                                        <th className="px-4 py-3 text-center">{t('Bank Account', 'Bank Account')}</th>
                                        <th className="px-4 py-3 text-center">{t('Salary', 'Salary')}</th>
                                        <th className="px-4 py-3 text-center">{t('Addition', 'Addition')}</th>
                                        <th className="px-4 py-3 text-center">{t('Deduction', 'Deduction')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredEmployees.map((emp: any, i: number) => (
                                        <tr key={emp.id} className="hover:bg-gray-50">
                                            {!readonly && (
                                                <td className="px-4 py-3 text-center">
                                                    <input type="checkbox" checked={selectedRows.some(r => r.id === emp.id)} onChange={() => toggleSelectRow(emp)} />
                                                </td>
                                            )}
                                            <td className="px-4 py-3 text-center">{i + 1}</td>
                                            <td className="px-4 py-3">{emp.firstNameEn} {emp.lastNameEn}</td>
                                            <td className="px-4 py-3">{emp.bankAccountNo || "-"}</td>
                                            <td className="px-4 py-3 text-right">{fmtNum(emp.salary)}</td>
                                            <td className="px-4 py-3 text-right">{fmtNum(emp.totalAdditions)}</td>
                                            <td className="px-4 py-3 text-right">{fmtNum(emp.totalDeductions)}</td>
                                        </tr>
                                    ))}
                                    {filteredEmployees.length === 0 && (
                                        <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">{empSearchText ? "No employees match your search" : "No employees available"}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {!readonly && (
                            <div className="px-6 py-4 border-t flex justify-end shrink-0">
                                <button onClick={handleAddEmployees} className="px-8 py-2 bg-nv-violet text-white rounded-lg hover:bg-nv-violet-dark transition">{t('Submit', 'Submit')}</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Salary Edit Modal (Angular: #salary_modal with payrollForm) ── */}
            {showSalaryModal && editingEmpIndex >= 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowSalaryModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {employees[editingEmpIndex]?.firstNameEn} {employees[editingEmpIndex]?.lastNameEn}
                                </h3>
                                <p className="text-xs text-gray-500">{(employees[editingEmpIndex] as any)?.departmentName}</p>
                                <p className="text-xs text-gray-500">{(employees[editingEmpIndex] as any)?.designationName}</p>
                            </div>
                            <button onClick={() => setShowSalaryModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                        </div>
                        <div className="p-6 overflow-auto flex-grow space-y-4">
                            {/* Base Salary (Angular: baseSalary) */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">{t('Salary', 'Salary')}</label>
                                <input type="number" value={editBaseSalary || ""} onChange={e => setEditBaseSalary(Number(e.target.value))} disabled={readonly}
                                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
                            </div>
                            {/* Social Security (Angular: socialSecurity - readonly display) */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">{t('Social Security', 'Social Security')}</label>
                                <input type="number" value={editSocialSecurity} disabled className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
                            </div>
                            {/* Withholding Tax (Angular: tax401 - readonly display) */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">{t('Withholding Tax (401)', 'Withholding Tax (401)')}</label>
                                <input type="number" value={editTax401} disabled className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
                            </div>

                            <hr />

                            {/* Additions (Angular: increases FormArray) */}
                            <h5 className="font-semibold text-gray-800">{t('Additions', 'Additions')}</h5>
                            {editIncreases.map((inc, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <select value={inc.type} onChange={e => { const arr = [...editIncreases]; arr[i] = { ...arr[i], type: Number(e.target.value) }; setEditIncreases(arr); }} disabled={readonly}
                                        className="flex-1 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                                        {additionTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                    <input type="number" value={inc.amount || ""} onChange={e => { const arr = [...editIncreases]; arr[i] = { ...arr[i], amount: Number(e.target.value) }; setEditIncreases(arr); }} disabled={readonly}
                                        placeholder="Amount" className="w-32 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-right disabled:bg-gray-100" />
                                    {!readonly && (
                                        <button onClick={() => removeIncrease(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                    )}
                                </div>
                            ))}
                            {!readonly && (
                                <button onClick={addIncrease} className="text-sm text-nv-violet hover:underline flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> {t('Add More', 'Add More')}</button>
                            )}

                            <hr />

                            {/* Deductions (Angular: decreases FormArray) */}
                            <h5 className="font-semibold text-gray-800">{t('Deductions', 'Deductions')}</h5>
                            {editDecreases.map((dec, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <select value={dec.type} onChange={e => { const arr = [...editDecreases]; arr[i] = { ...arr[i], type: Number(e.target.value) }; setEditDecreases(arr); }} disabled={readonly}
                                        className="flex-1 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                                        {deductionTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                    <input type="number" value={dec.amount || ""} onChange={e => { const arr = [...editDecreases]; arr[i] = { ...arr[i], amount: Number(e.target.value) }; setEditDecreases(arr); }} disabled={readonly}
                                        placeholder="Amount" className="w-32 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-right disabled:bg-gray-100" />
                                    {!readonly && (
                                        <button onClick={() => removeDecrease(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                    )}
                                </div>
                            ))}
                            {!readonly && (
                                <button onClick={addDecrease} className="text-sm text-nv-violet hover:underline flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> {t('Add More', 'Add More')}</button>
                            )}

                            <hr />

                            {/* Remark (Angular: remark field) */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">{t('Remark', 'Remark')}</label>
                                <textarea value={editRemark} onChange={e => setEditRemark(e.target.value)} disabled={readonly}
                                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" rows={2} />
                            </div>

                            <hr />

                            {/* Summary (Angular: Salary, TotalIncrease, TotalDecrease, FinalSalary) */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><strong>{t('Salary', 'Salary')}:</strong> {fmtNum(editBaseSalary)}</div>
                                <div><strong>{t('Total Increase', 'Total Increase')}:</strong> {fmtNum(editTotalIncrease)}</div>
                                <div><strong>{t('Total Decrease', 'Total Decrease')}:</strong> {fmtNum(editTotalDecrease)}</div>
                                <div className="text-lg font-bold"><strong>{t('Final Salary', 'Final Salary')}:</strong> {fmtNum(editFinalSalary)}</div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t flex justify-end shrink-0">
                            {!readonly && (
                                <button onClick={handleSubmitEmployee} className="px-8 py-2 bg-nv-violet text-white rounded-lg hover:bg-nv-violet-dark transition">
                                    {t('Submit', 'Submit')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default function AddSalaryDetailPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center text-gray-400">Loading...</div>}>
            <AddSalaryDetailContent />
        </Suspense>
    );
}
