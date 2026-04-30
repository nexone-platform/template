export interface OvertimeFilter {
    employeeId: number;
    requestDate: string; // format: 'YYYY-MM-DD'
    projectId: number;
}

export interface Overtime {
    overtimeId: number;
    employeeId: number;
    employeeName: string;
    overtimeDate: Date | string;
    type: number;
    typeName: string;
    description: string;
    isApproved: boolean;
    approvedId: number | null;
    approvalDate: Date | string | null;
    approvedBy: string | null;
    approvedByImgPath: string | null;
    comments: string | null;
    status: string;
    imgPath: string | null;
    createDate: Date | string;
    createBy: string;
    updateDate: Date | string;
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
    createDate?: Date | string;
    createBy?: string;
    updateDate?: Date | string;
    updateBy?: string;
    employeeId: number;
    overtimeDate?: Date | string;
    type?: string;
    description?: string;
    isApproved: boolean;
    approvedId?: number;
    approvalDate?: Date | string;
    comments?: string;
    status?: string;
    hour?: number;
    employeeName?: string;
    imgPath?: string;
    approvedBy?: string;  // Approver's name
    approvedByImgPath?: string;  // Approver's image path
    id?: number;
    typeName: string;
    amount: number;
    projectId: number;
    requestorId: number;
    organizationCode: string;
}

export interface OTType {
    otTypeId: number;       // Unique identifier for the OT type
    otTypeNameEn: string;   // OT type name in English
    otTypeNameTh: string;   // OT type name in Thai
    otTypeCode: string;     // Code for the OT type
    value: number;          // Value associated with the OT type
    createDate: Date | string;       // Date when the OT type was created
    createBy: string;       // Identifier of the user who created the OT type
    updateDate?: Date | string;      // Date when the OT type was last updated
    updateBy?: string;      // Identifier of the user who last updated the OT type
    id?: number;
}
