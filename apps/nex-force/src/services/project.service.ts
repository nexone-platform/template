import apiClient from "@/lib/api-client";
import type { ProjectResponseDTO, ProjectView, AssignUserRequest } from "@/types/project";

export const projectService = {
    getAll: async (): Promise<{ data: unknown[]; totalData: number }> => {
        const { data } = await apiClient.get<{ data: unknown[]; totalData: number }>("projects/getAllProject");
        return data;
    },

    search: async (criteria: unknown): Promise<{ data: unknown[]; totalData: number }> => {
        const { data } = await apiClient.post<{ data: unknown[]; totalData: number }>("projects/searchProjects", criteria);
        return data;
    },

    update: async (project: FormData): Promise<{ message: string }> => {
        const { data } = await apiClient.post<{ message: string }>("projects/update", project, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
    },

    getById: async (id: number): Promise<ProjectResponseDTO> => {
        const { data } = await apiClient.get<ProjectResponseDTO>(`projects/${id}`);
        return data;
    },

    getProjectById: async (id: number): Promise<ProjectView> => {
        const { data } = await apiClient.get<ProjectView>(`projects/getProjectById/${id}`);
        return data;
    },

    getProjectType: async (): Promise<unknown> => {
        const { data } = await apiClient.get("projects/getProjectType");
        return data;
    },

    updateProjectType: async (projectType: unknown): Promise<{ message: string }> => {
        const { data } = await apiClient.post<{ message: string }>("projects/projectType/update", projectType);
        return data;
    },

    delete: async (id: number): Promise<{ message: string }> => {
        const { data } = await apiClient.delete<{ message: string }>(`projects/delete?id=${id}`);
        return data;
    },

    deleteProjectType: async (id: number): Promise<{ message: string }> => {
        const { data } = await apiClient.delete<{ message: string }>(`projects/projectType/delete?id=${id}`);
        return data;
    },

    getProjectList: async (): Promise<unknown> => {
        const { data } = await apiClient.get("projects/getProject");
        return data;
    },

    deleteFile: async (id: number): Promise<{ message: string }> => {
        const { data } = await apiClient.delete<{ message: string }>(`projects/deleteFile?id=${id}`);
        return data;
    },

    getEmployeeForAssign: async (): Promise<unknown> => {
        const { data } = await apiClient.get("projects/getEmployeeForAssign");
        return data;
    },

    assignUser: async (request: AssignUserRequest): Promise<{ message: string }> => {
        const { data } = await apiClient.post<{ message: string }>("projects/assignUser", request);
        return data;
    },

    removeUser: async (request: AssignUserRequest): Promise<{ message: string }> => {
        const { data } = await apiClient.post<{ message: string }>("projects/removeUser", request);
        return data;
    },
};
