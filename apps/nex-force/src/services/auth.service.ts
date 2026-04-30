import apiClient from "@/lib/api-client";
import type { LoginRequest, LoginResponse, RegisterRequest } from "@/types/auth";

export const authService = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const { data: res } = await apiClient.post<LoginResponse>("auth/login", data);
        return res;
    },

    loginByLine: async (data: { lineToken: string }): Promise<LoginResponse> => {
        const { data: res } = await apiClient.post<LoginResponse>("auth/login-by-line", data);
        return res;
    },

    register: async (data: RegisterRequest): Promise<{ message: string }> => {
        const { data: res } = await apiClient.post<{ message: string }>("auth/register", data);
        return res;
    },

    forgotPassword: async (email: string): Promise<{ message: string }> => {
        const { data: res } = await apiClient.post<{ message: string }>("auth/forgot-password", { email });
        return res;
    },

    changePassword: async (data: { oldPassword: string; newPassword: string; username: string }): Promise<{ message: string }> => {
        const { data: res } = await apiClient.post<{ message: string }>("auth/change-password", data);
        return res;
    },

    resetPassword: async (data: { password: string; token: string }): Promise<{ message: string }> => {
        const { data: res } = await apiClient.post<{ message: string }>("auth/reset-password", data);
        return res;
    },

    registerline: async (data: { employeeId: string; password: string; lineToken: string }): Promise<LoginResponse> => {
        const { data: res } = await apiClient.post<LoginResponse>("auth/register-line", data);
        return res;
    },

    checkLineToken: async (lineToken: string): Promise<{ exists: boolean }> => {
        const { data: res } = await apiClient.get<{ exists: boolean }>(`auth/check-line-token/${lineToken}`);
        return res;
    },
};
