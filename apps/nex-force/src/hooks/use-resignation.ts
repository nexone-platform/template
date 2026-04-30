import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface ResignationDto {
    resignationId: number;
    employeeId: number;
    employeeName: string;
    noticeDate: string;
    resignationDate: string;
    requestDate: string;
    reason: string;
    isApproved: boolean;
    status: string;
    id: number;
    imgPath: string | null;
}

export function useUserResignations() {
    return useQuery({
        queryKey: ["userResignations"],
        queryFn: async () => {
            const empId = localStorage.getItem("employeeId");
            if (!empId) return [];
            const { data } = await apiClient.get(`/resignations/getResignationsById/${empId}`);
            return data.data as ResignationDto[];
        }
    });
}

export function useAllResignations() {
    return useQuery({
        queryKey: ["allResignations"],
        queryFn: async () => {
            const { data } = await apiClient.get("/resignations/getAllResignations");
            return data.data as ResignationDto[];
        }
    });
}

export function useUpdateResignation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Partial<ResignationDto> & { username?: string }) => {
            const response = await apiClient.post("/resignations/update", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userResignations"] });
            queryClient.invalidateQueries({ queryKey: ["allResignations"] });
        }
    });
}

export function useApproveResignation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number, data: { approverId: number, username: string, status: number, comments: string } }) => {
            const response = await apiClient.post(`/resignations/approve/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["allResignations"] });
        }
    });
}
