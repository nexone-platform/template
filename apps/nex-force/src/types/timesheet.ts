export interface EventResponse {
    id: number;
    title: string;
    start: Date | string; // ISO 8601
    end: Date | string;   // ISO 8601
    description: string | null;
    timesheetHeaderId: number;
    employee_id: number;
    color: string;
    textColor: string;
}

export interface TimesheetDetailDto {
    timesheetId?: number;
    workName?: string;
    startTime?: string;
    endTime?: string;
    actualHours?: number;
    otHours?: number;
    workPercentage?: number;
    taskId?: number | null;
    taskBoardId?: number | null;
    taskTitle?: string;
    isOt?: boolean;
    workDescription?: string;
    problemDescription?: string;
    problemResolve?: string;
    otId?: string;
    attFile?: string | File | null;
    project?: string;
    comments?: string;
}

export interface TimesheetRespond {
    timesheetHeaderId?: number;
    createDate?: string;
    createBy?: string;
    updateDate?: string;
    updateBy?: string;
    employeeId?: number;
    employeeName?: string;
    employeeCode?: string;
    projectId?: number;
    projectName?: string;
    projectCode?: string;
    clientId?: number;
    clientName?: string;
    inchargeName?: string;
    projectLeaderName?: string;
    projectDeadline?: string | null;
    workDate?: string;
    jobType?: string;
    organizationCode?: string;
    organizationName?: string;
    imgPath?: string;
    totalWorkHours?: number;
    totalOtHours?: number;
    details?: TimesheetDetailDto[];
    id?: number;
}
