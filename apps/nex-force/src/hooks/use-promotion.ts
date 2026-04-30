import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface PromotionDto {
    promotionId: number;
    employeeId: number;
    employeeName?: string;
    designationFromId: number;
    designationFrom?: string;
    departmentFromId: number;
    departmentFrom?: string;
    designationToId: number;
    designationTo?: string;
    departmentToId: number;
    departmentTo?: string;
    promotionDate: string;
    approvalDate?: string;
    oldSalary: number;
    newSalary: number;
    status?: string;
    approverId: number;
    approverName?: string;
    id: number;
    comments: string;
    approvedByImgPath: string;
    imgPath: string;
    refId: number | null;
    currentApprovalLevel: number;
}

export function useAllPromotions() {
    return useQuery({
        queryKey: ["allPromotions"],
        queryFn: async () => {
            const { data } = await apiClient.get("/promotion");
            return data.data as PromotionDto[];
        }
    });
}

export function useUpdatePromotion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Partial<PromotionDto> & { username?: string }) => {
            const response = await apiClient.post("/promotion/update", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["allPromotions"] });
        }
    });
}

export function useApprovePromotion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number, data: { approverId: number, username: string, status: number, comments: string } }) => {
            const response = await apiClient.post(`/promotion/approve/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["allPromotions"] });
        }
    });
}
