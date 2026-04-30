import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

export interface ApprovalActionRequest {
    instanceId: number;
    stepId: number;
    approverId: number;
    action: string;
    comment: string;
    reasonId?: number;
    username?: string;
}

export function usePendingApprovals(approverId: number) {
    return useQuery({
        queryKey: ["approvals", "pending", approverId],
        queryFn: async () => {
            if (!approverId) return [];
            const { data } = await apiClient.get<any>(`approval/pending/${approverId}`);
            return data || [];
        },
        enabled: !!approverId,
    });
}

export function useApprovalAction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: ApprovalActionRequest) => {
            const { data } = await apiClient.post<any>("approval/action", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["approvals"] });
            toast.success("Action submitted successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to submit action"));
        }
    });
}

export function useCancelReasons() {
    return useQuery({
        queryKey: ["approvals", "cancel-reasons"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("approval/cancel-reasons");
            return data || [];
        },
    });
}

export interface ApprovalStep {
    step_id?: number | null;
    rule_id: number;
    step_order: number;
    position?: string | null;
    min_amount?: number | null;
    max_amount?: number | null;
    department?: string | null;
    is_parallel: boolean;
    isActive: boolean;
    threshold_count?: number | null;
    approver_id?: string | null;
    role_id?: number | null;
    designation_id?: number | null;
    ref_id?: number | null;
}

export function useApprovalSteps() {
    return useQuery({
        queryKey: ["approval-steps"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("approval/steps");
            return data || [];
        },
    });
}

export function useApprovalRules() {
    return useQuery({
        queryKey: ["approval-rules"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("approval/rules");
            return data || [];
        },
    });
}

export function useApprovalReferences() {
    return useQuery({
        queryKey: ["approval-references"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("approval/references");
            return data || [];
        },
    });
}

export function useUpsertApprovalSteps() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: { ruleId: number; steps: any[] }) => {
            const { data } = await apiClient.post<any>("approval/steps/upsert", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["approval-steps"] });
            toast.success("Workflow steps saved successfully");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Failed to save workflow steps"));
        }
    });
}
