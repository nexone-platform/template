// ============ Leave Types ============
export interface LeaveType {
    leaveTypeId: number;
    leaveTypeName: string;
}

export interface LeaveTypeData {
    id: number;
    leaveTypeId: number;
    leaveTypeNameTh: string;
    leaveTypeNameEn: string;
    isActive: boolean;
    leaveTypeCode: string;
    createDate: string | null;
    createBy: string | null;
    updateDate: string | null;
    updateBy: string | null;
}

export interface LeaveRequest {
    leaveRequestId: number;
    employeeId: number;
    leaveTypeId: number;
    startDate: string;
    endDate: string;
    totalDays: number;
    dayType: string;
    reason: string;
    comments: string;
    requestDate: string;
    status: string;
    approverId: number;
    currentApprovalLevel: number;
    createDate: string;
    createBy: string;
    updateDate: string | null;
    updateBy: string | null;
    approvedDate: string | null;
    refId: number | null;
}

// ============ Overtime ============
export interface OvertimeFilter {
    employeeId: number;
    requestDate: string;
    projectId: number;
}

export interface Overtime {
    overtimeId: number;
    employeeId: number;
    employeeName: string;
    overtimeDate: string;
    type: number;
    typeName: string;
    description: string;
    isApproved: boolean;
    approvedId: number | null;
    approvalDate: string | null;
    approvedBy: string | null;
    approvedByImgPath: string | null;
    comments: string | null;
    status: string;
    imgPath: string | null;
    createDate: string;
    createBy: string;
    updateDate: string;
    updateBy: string;
    hour: number;
    amount: number;
    projectId: number;
    project: string;
    organization: string;
    organizationCode: string;
    requestorId: number;
    requestor: string;
    currentApprovalLevel: number;
}

export interface OvertimeRequestDto {
    overtimeId: number;
    employeeId: number;
    overtimeDate?: string;
    type?: string;
    description?: string;
    isApproved: boolean;
    approvedId?: number;
    status?: string;
    hour?: number;
    employeeName?: string;
    imgPath?: string;
    id: number;
    typeName: string;
    amount: number;
    projectId: number;
    requestorId: number;
    organizationCode: string;
}

export interface OTType {
    otTypeId: number;
    otTypeNameEn: string;
    otTypeNameTh: string;
    otTypeCode: string;
    value: number;
    createDate: string;
    createBy: string;
    updateDate?: string;
    updateBy?: string;
    id: number;
}

// ============ Attendance ============
export interface Statistics {
    today: number;
    todayPercentage: number;
    thisWeek: number;
    weekPercentage: number;
    thisMonth: number;
    monthPercentage: number;
    remaining: number;
    overtime: number;
}

export interface CheckInResponse {
    checkInId: number;
    employeeId: number;
    checkInTime: string;
    checkOutTime: string;
    productionHours: number;
    breakHours: number;
    overtime: number;
    id?: number;
}

export interface AttendanceEvent {
    dayNumber: number;
    color: string;
    time: string;
    hour: number;
}

export interface EmployeeAttendance {
    employeeId: number;
    name: string;
    attendance: AttendanceEvent[][];
}

export interface AttendanceResponse {
    data: EmployeeAttendance[];
}
