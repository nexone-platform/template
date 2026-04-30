// ============ Payroll ============
export interface PayrollRequest {
    employeeId: number;
    year?: number;
}

export interface PayrollWithEmployee {
    payrollId: number;
    employeeId: number;
    monthYear: string;
    grossSalary: number;
    totalAdditions: number;
    totalDeductions: number;
    netSalary: number;
    createDate: string;
    createBy?: string | null;
    employee: PayrollEmployeeInfo;
}

export interface PayrollWithEmployeeDto extends PayrollWithEmployee {
    id: number;
}

export interface PayrollEmployeeInfo {
    id: number;
    firstNameTh: string;
    lastNameTh: string;
    firstNameEn: string;
    lastNameEn: string;
    email: string;
    employeeCode: string;
    joinDate: string;
    imgPath: string;
    bankAccountNo: string;
    companyAddress?: string;
    designationName?: string;
    company?: string;
    logo?: string;
}

export interface Payroll {
    payrollId: number;
    employeeId: number;
    monthYear: string;
    salary: number;
    totalAdditions: number;
    totalDeductions: number;
    netSalary: number;
    createDate: string;
    createBy: string;
    employee: PayrollEmployeeInfo;
    netSalaryInWords: string;
    payrollCode: string;
    payDate: string;
    payrollPeriod: string;
    bankAccount: string;
    ytdEarnings: number;
    ytdWithholdingTax: number;
    accumulatedSsf: number;
    remarks: string;
    deductions: DeductionData[];
    socialSecurityFund: number;
    wht: number;
    slf: number;
    penaltyAmount: number;
    otherDeductions: number;
    additions: AdditionData[];
    overtime: number;
    commission: number;
    bonus: number;
    otherAdditions: number;
}

export interface DeductionData {
    deductionId: number;
    deductionName: string;
    amount: number;
    isPersonal: boolean;
    type: string;
}

export interface AdditionData {
    additionId: number;
    additionName: string;
    amount: number;
    isPersonal: boolean;
    type: string;
}

// ============ Salary ============
export interface StatusRequest {
    status: number | null;
    month: string | null;
}

export interface PeriodRequest {
    periodId: number;
    paymentTypeId: number;
    paymentChannel: number;
}

export interface Period {
    periodId: number;
    periodStartDate: string;
    periodEndDate: string;
    monthYear: string;
    createDate: string;
    createBy: string;
    updateDate: string;
    updateBy: string;
    totalCost: number;
    totalPayment: number;
    status: string;
    id?: number;
    paymentDate: string;
    paymentChannel: number;
    paymentTypeId: number;
    reason: string;
}

export interface SocialSecurityRate {
    socialSecurityId: number;
    startDate: string;
    endDate: string;
    percentage: number;
    description?: string;
    isActive: boolean;
    maxDeduction?: number;
    maxSalary?: number;
}

export interface Summary {
    totalEmployee: number;
    sumSalary: number;
    totalAddiction: number;
    totalDeduction: number;
    netPayment: number;
    bankPayment: number;
    cashPayment: number;
    totalCost: number;
}

export interface PaymentDetails {
    transactionDate: string;
    startDate: string;
    endDate: string;
    paymentDate: string;
    socialSecurityRate: number;
    status: number;
    summary: Summary;
    paymentChannel: number;
    paymentTypeId: number;
    periodId: number;
}
