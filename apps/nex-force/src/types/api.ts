/** Generic API response — replaces Angular's `apiResultFormat` */
export interface ApiResult<T = unknown> {
    data: T;
    totalData: number;
    totalData2?: unknown;
}

/** Generic single-item API response */
export interface ApiResponse<T = unknown> {
    data: T;
    message: string;
}

/** Permissions — replaces Angular's `RolePermission` */
export interface RolePermission {
    canView: boolean;
    canAdd: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canImport: boolean;
    canExport: boolean;
}

/** Pagination state */
export interface PaginationState {
    currentPage: number;
    pageSize: number;
    totalData: number;
    totalPages: number;
}
