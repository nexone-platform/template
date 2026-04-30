"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// --- DTOs ---

export interface PerformanceIndicatorDto {
    id: number;
    designation: string;
    department: string;
    addedBy: string;
    createdBy: string;
    status: string;
    experience?: string;
    integrity?: string;
    marketing?: string;
    professionalism?: string;
    managementSkill?: string;
    teamwork?: string;
    administration?: string;
    criticalThinking?: string;
    presentationSkill?: string;
    conflictManagement?: string;
    qualityOfWork?: string;
    attendance?: string;
    efficiency?: string;
    meetDeadline?: string;
}

export interface PerformanceAppraisalDto {
    id: number;
    employee: string;
    designation: string;
    appraisalDate: string;
    department: string;
    status: string;
}

export interface ReviewRowDto {
    bySelf: string;
    roComment: string;
    hodComment: string;
}

export interface PerformanceReviewDto {
    employeeName: string;
    employeeId: string;
    department: string;
    designation: string;
    qualification: string;
    dateOfJoin: string;
    dateOfConfirmation: string;
    prevExp: string;
    roName: string;
    roDesignation: string;
    achievements: ReviewRowDto[];
    alterations: ReviewRowDto[];
    professionalGoals: ReviewRowDto[];
    trainingRequirements: ReviewRowDto[];
}

// --- Mock Data ---

const mockIndicators: PerformanceIndicatorDto[] = [
    {
        id: 1,
        designation: "Web Designer",
        department: "Designing",
        addedBy: "John Doe",
        createdBy: "28 Feb 2023",
        status: "Active",
        experience: "Beginner"
    },
    {
        id: 2,
        designation: "IOS Developer",
        department: "IOS",
        addedBy: "Mike Litorus",
        createdBy: "28 Feb 2023",
        status: "Active",
        experience: "Beginner"
    },
    {
        id: 3,
        designation: "Web Developer",
        department: "Web design",
        addedBy: "John Smith",
        createdBy: "28 Feb 2023",
        status: "Inactive",
        experience: "Beginner"
    }
];

const mockAppraisals: PerformanceAppraisalDto[] = [
    {
        id: 1,
        employee: "John Doe",
        designation: "Web designer",
        appraisalDate: "02-05-2023",
        department: "Web design",
        status: "Active"
    },
    {
        id: 2,
        employee: "Richard Miles",
        designation: "IOS developer",
        appraisalDate: "02-10-2023",
        department: "IOS",
        status: "Active"
    }
];

// --- Hooks ---

export function usePerformanceIndicators() {
    return useQuery({
        queryKey: ["performance", "indicators"],
        queryFn: async () => {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 800));
            return mockIndicators;
        }
    });
}

export function usePerformanceAppraisals() {
    return useQuery({
        queryKey: ["performance", "appraisals"],
        queryFn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 800));
            return mockAppraisals;
        }
    });
}

export function useCreateIndicator() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Partial<PerformanceIndicatorDto>) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return { id: Math.random(), ...data };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["performance", "indicators"] });
            toast.success("Performance indicator created successfully");
        }
    });
}

export function useUpdateIndicator() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: PerformanceIndicatorDto) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["performance", "indicators"] });
            toast.success("Performance indicator updated successfully");
        }
    });
}

export function useDeleteIndicator() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["performance", "indicators"] });
            toast.success("Performance indicator deleted successfully");
        }
    });
}

export function useCreateAppraisal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Partial<PerformanceAppraisalDto>) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return { id: Math.random(), ...data };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["performance", "appraisals"] });
            toast.success("Appraisal record created successfully");
        }
    });
}

export function useUpdateAppraisal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: PerformanceAppraisalDto) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["performance", "appraisals"] });
            toast.success("Appraisal record updated successfully");
        }
    });
}

export function useDeleteAppraisal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["performance", "appraisals"] });
            toast.success("Appraisal record deleted successfully");
        }
    });
}

// --- Review Hooks ---

const mockReviews: PerformanceReviewDto[] = [];

export function usePerformanceReviews() {
    return useQuery({
        queryKey: ["performance", "reviews"],
        queryFn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 800));
            return mockReviews;
        }
    });
}

export function useCreateReview() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Partial<PerformanceReviewDto>) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["performance", "reviews"] });
            toast.success("Review created successfully");
        }
    });
}

export function useUpdateReview() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: PerformanceReviewDto) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["performance", "reviews"] });
            toast.success("Review updated successfully");
        }
    });
}

export function useDeleteReview() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["performance", "reviews"] });
            toast.success("Review deleted successfully");
        }
    });
}

// Alias for backward compatibility
export type AppraisalDto = PerformanceAppraisalDto;
