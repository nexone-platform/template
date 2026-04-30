// ============ Project ============
export interface ProjectResponse {
    projectId: string;
    projectName: string;
    project: string;
    deadline: string;
    priority: string;
    description: string;
    startDate: string;
    id: number;
    isActive: boolean;
    projectCode: string;
    approver: string;
    auditor: string;
    inchargeName: string;
    ivNo: string;
    ivDate: string;
    teamLead: TeamMemberResponse;
    team: TeamMemberResponse[];
    files?: ProjectFileDTO[];
}

export interface ProjectResponseDTO {
    projectId: number;
    projectName?: string;
    client?: number;
    startDate?: string | null;
    endDate?: string | null;
    rate?: string;
    rateType?: string;
    priority?: string;
    projectLeader?: number;
    description?: string;
    isActive?: boolean;
    team?: string;
    createDate?: string | null;
    createBy?: string;
    updateDate?: string | null;
    updateBy?: string;
    projectTypeId?: number;
    projectCode?: string;
    inchargeName?: string;
    auditor?: string;
    approver?: string;
    ivDate?: string | null;
    ivNo?: string;
    poNo?: string;
    timesheetDateStart?: number;
    files: ProjectFileDTO[];
}

export interface ProjectView {
    projectId: number;
    startDate?: string | null;
    deadline?: string | null;
    priority?: string;
    isActive?: boolean;
    description?: string;
    id: number;
    projectCode?: string;
    inchargeName?: string;
    auditor?: string;
    approver?: string;
    ivDate?: string | null;
    timesheetDateStart?: number;
    ivNo?: string;
    poNo?: string;
    projectTypeId?: number;
    teamLead?: TeamMemberResponse | null;
    team?: TeamMemberResponse[] | null;
    projectName?: string;
    updateDate: string;
    files: ProjectFileDTO[];
    imageFiles: ProjectFileDTO[];
}

export interface TeamMemberResponse {
    employeeId: string;
    id: number;
    firstNameEn: string;
    lastNameEn: string;
    imgPath: string;
}

export interface ProjectType {
    projectTypeId: number;
    id: number;
    projectTypeNameTh: string;
    projectTypeNameEn: string;
    projectTypeCode: string;
    isActive: boolean | null;
    createDate: string | null;
    createBy: string | null;
    updateDate: string | null;
    updateBy: string | null;
}

export interface ProjectFileDTO {
    fileId: number;
    fileCategory?: string;
    originalName: string;
    storedName?: string;
    filePath?: string;
}

export interface AssignUserRequest {
    projectId: number;
    employeeId: number;
    roleType?: string;
}

// ============ Jobs ============
export interface ManageJobs {
    manageJobId: number;
    jobTitle: string;
    department: string;
    location: string;
    noOfVacancies: number;
    experience: string;
    salaryFrom: number;
    salaryTo: number;
    jobType: string;
    status: string;
    startDate: string;
    expiredDate: string;
    description: string;
    createDate?: string;
    createBy?: string;
    updateDate?: string;
    updateBy?: string;
    id?: number;
}

export interface ManageJobsData {
    data: ManageJobs[];
    totalData: number;
}

export interface JobTypeDto {
    employee_type_id: number;
    employee_type_code: string | null;
    employee_type_name_en: string | null;
}

export interface LocationJobDto {
    jobLocationId: number;
    client_id: number;
    client_code: string | null;
    client_name_en: string | null;
}

export interface PositionJobDto {
    designation_id: number;
    designation_code: string | null;
    designation_name_en: string | null;
}
