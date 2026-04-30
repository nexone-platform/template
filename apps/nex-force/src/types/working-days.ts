export interface Special {
    specialDaysId: number;
    titleEn: string;
    titleTh: string;
    specialDate: string;
    day: string;
    isAnnual: boolean;
    isActive: boolean;
    createDate: string;
    createBy: string;
    updateDate: string;
    updateBy: string;
    id?: number;
    organizationNameEn?: string;
    organizationNameTh?: string;
    organizationCode?: number;
}

export interface SpecialData {
    data: Special[];
    totalData: number;
}
