// ============ Auth Types ============
export interface LoginRequest {
    Email?: string;
    Password?: string;
}

export interface LoginResponse {
    token: string;
}

export interface RegisterRequest {
    EmployeeId: string;
    Email: string;
    Password: string;
    ConfirmPassword: string;
}

export interface UserProfile {
    username: string;
    employeeId: number;
    email: string;
    role: string;
}
