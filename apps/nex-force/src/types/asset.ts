/**
 * Asset types — converted from Angular's assets.service.ts interfaces.
 *
 * Changes:
 *   - Removed duplicate `AssetDTO` (merged with `AssetData`)
 *   - Made field names consistent (camelCase)
 *   - Used `string` for dates (API returns ISO strings)
 */

export interface Asset {
    assetId: number;
    assetName: string;
    assetModel: string;
    assetCode: string;
    productNo: string;
    type: string;
    serialNumber: string;
    brand: string;
    cost: number;
    location: string;
    warrantyStart: string;
    warrantyEnd: string;
    warranty: string;
    vendor: string;
    category: string;
    condition: string;
    description: string;
    status: string;
    isActive: boolean;
    employeeId: number | null;
    assignedDate: string;
    assetUser: string;
    assetImg1: string | null;
    assetImg2: string | null;
    assetImg3: string | null;
    assetImg4: string | null;
    createDate: string | null;
    createBy: string | null;
    updateDate: string | null;
    updateBy: string | null;
}

export interface AssetData {
    id: number;
    assetId: number;
    assetName: string;
    assetCode: string;
    assignedDate: string;
    category: string;
    type: string;
    serialNumber: string;
    brand: string;
    cost: number;
    location: string;
    warrantyStart: string;
    warrantyEnd: string;
    warranty: string;
    vendor: string;
    assetModel: string;
    productNo: string;
    assetImg1?: string;
    assetImg2?: string;
    assetImg3?: string;
    assetImg4?: string;
    assetUser: string;
    description: string;
    status: string;
}

export interface AssetResponse {
    data: AssetData[];
    totalData: number;
}

export type AssetStatus = "Pending" | "Approved" | "Deployed" | "Returned";

export interface AssigneeData {
    name: string;
    profileImg: string;
    email: string;
    id: number;
}
