import apiClient from "@/lib/api-client";
import type { ManageJobs, ManageJobsData, JobTypeDto, LocationJobDto, PositionJobDto } from "@/types/project";

export const jobsService = {
    getAll: async (): Promise<ManageJobsData> => {
        const { data } = await apiClient.get<ManageJobsData>("manageJobs/getAllManageJobs");
        return data;
    },

    search: async (criteria: unknown): Promise<{ data: ManageJobs[]; totalData: number }> => {
        const { data } = await apiClient.post<{ data: ManageJobs[]; totalData: number }>("manageJobs/searchManageJob", criteria);
        return data;
    },

    update: async (job: ManageJobs): Promise<ManageJobs> => {
        const { data } = await apiClient.post<ManageJobs>("manageJobs/update", job);
        return data;
    },

    delete: async (id: number): Promise<{ message: string }> => {
        const { data } = await apiClient.delete<{ message: string }>(`manageJobs/delete?id=${id}`);
        return data;
    },

    getJobTypes: async (): Promise<JobTypeDto[]> => {
        const { data } = await apiClient.get<JobTypeDto[]>("manageJobs/getAllEmployeeType");
        return data;
    },

    getLocations: async (): Promise<LocationJobDto[]> => {
        const { data } = await apiClient.get<LocationJobDto[]>("manageJobs/getAllLocationJob");
        return data;
    },

    getPositions: async (): Promise<PositionJobDto[]> => {
        const { data } = await apiClient.get<PositionJobDto[]>("manageJobs/getAllDesignation");
        return data;
    },
};

export const manageResumeService = {
    getAll: async () => {
        const { data } = await apiClient.get("manageResume/getAllManageResume");
        return data;
    },
    search: async (criteria: any) => {
        const { data } = await apiClient.post("manageResume/searchResume", criteria);
        return data;
    },
    update: async (resume: any) => {
        const { data } = await apiClient.post("manageResume/update", resume);
        return data;
    },
    delete: async (id: number) => {
        const { data } = await apiClient.delete(`manageResume/delete?id=${id}`);
        return data;
    },
    getById: async (id: number) => {
        const { data } = await apiClient.get(`manageResume/getManageResumeById/${id}`);
        return data;
    }
};

export const interviewQuestionService = {
    getAllCategory: async () => {
        const { data } = await apiClient.get("interviewQuestions/getAllCategory");
        return data;
    },
    getAllQuestion: async () => {
        const { data } = await apiClient.get("interviewQuestions/getAllQuestion");
        return data;
    },
    search: async (criteria: any) => {
        const { data } = await apiClient.post("interviewQuestions/searchQuestion", criteria);
        return data;
    },
    updateCategory: async (category: any) => {
        const { data } = await apiClient.post("interviewQuestions/updateCategory", category);
        return data;
    },
    updateQuestion: async (question: FormData) => {
        const { data } = await apiClient.post("interviewQuestions/updateQuestion", question);
        return data;
    },
    delete: async (id: number) => {
        const { data } = await apiClient.delete(`interviewQuestions/delete?id=${id}`);
        return data;
    },
    getById: async (id: number) => {
        const { data } = await apiClient.get(`interviewQuestions/getQuestionById/${id}`);
        return data;
    }
};
