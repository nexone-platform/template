// ============ EmployeeAutocomplete (for select/dropdown) ============
export interface EmployeeAutocomplete {
    id: number;
    firstNameEn: string;
    lastNameEn: string;
}

// ============ Department ============
export interface Department {
    departmentId: number;
    department: string;
    departmentNameEn: string;
    departmentNameTh: string;
    departmentCode: string;
    isActive: boolean;
    createDate?: string;
    createBy?: string;
    updateDate?: string;
    updateBy?: string;
    id?: number;
}

export interface DepartmentData {
    data: Department[];
    totalData: number;
}

// ============ Designation ============
export interface Designation {
    designationId: number;
    designationNameTh?: string;
    designationNameEn?: string;
    designationCode?: string;
    departmentId?: number;
    isActive: boolean;
    createDate?: string;
    createBy?: string;
    updateDate?: string;
    updateBy?: string;
    departmentNameTh: string;
    departmentNameEn: string;
    id?: number;
}

export interface DesignationData {
    data: Designation[];
    totalData: number;
}

// ============ Holiday ============
export interface Holiday {
    holidayId: number;
    title: string;
    holidayDate: string;
    day: string;
    isActive: boolean;
    createDate?: string;
    createBy?: string;
    updateDate?: string;
    updateBy?: string;
    organizationId?: number;
    id?: number;
}

export interface HolidayData {
    data: Holiday[];
    totalData: number;
}

// ============ Organization / Branch ============
export interface Organization {
    organizationId: number;
    organizationNameEn: string;
    organizationNameTh: string;
    organizationCode: string;
    isActive: boolean;
    address?: string;
    phone?: string;
    email?: string;
    createDate?: string;
    createBy?: string;
    updateDate?: string;
    updateBy?: string;
    id?: number;
}

// ============ Bank ============
export interface Bank {
    bankId: number;
    bankCode: string;
    abbreviation: string;
    bankNameTh: string;
    bankNameEn: string;
    createDate?: string;
    createBy?: string;
    updateDate?: string;
    updateBy?: string;
}

// ============ Employee Search ============
export interface SearchCriteria {
    EmployeeName?: string;
    EmployeeID?: string;
    Designation?: number;
}

// ============ Employee Full ============
export interface Employee {
    id: number;
    firstNameTh?: string;
    lastNameTh?: string;
    firstNameEn: string;
    lastNameEn: string;
    email: string;
    employeeId: string;   // "2207-006" — NOT a number
    joinDate?: string;
    imgPath?: string;
    phone?: string;
    mobile?: string;
    dateOfBirth?: string;
    gender?: string;
    departmentId?: number;
    department?: string;   // API field name (not departmentName)
    designationId?: number;
    designation?: string;  // API field name (not designationName)
    isActive?: boolean;
    salary?: number;
    bankAccountNo?: string;
    companyAddress?: string;
    company?: string;
    logo?: string;
    userName?: string;
    roleName?: string;
    organizationId?: string;
    clientId?: string;
}

export interface EmployeeResponse {
    data: Employee[];
    totalData: number;
}
