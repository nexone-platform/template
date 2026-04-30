import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/project.service";
import { jobsService } from "@/services/jobs.service";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import type { AssignUserRequest } from "@/types/project";
import type { ManageJobs } from "@/types/project";

// ============ Projects ============
export function useProjects() {
    return useQuery({ queryKey: ["projects"], queryFn: projectService.getAll });
}

export function useProjectById(id: number) {
    return useQuery({
        queryKey: ["projects", id],
        queryFn: () => projectService.getProjectById(id),
        enabled: id > 0,
    });
}

export function useProjectTypes() {
    return useQuery({ queryKey: ["projectTypes"], queryFn: projectService.getProjectType });
}

export function useUpdateProject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: projectService.update,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); toast.success("Project saved."); },
        onError: (error) => { toast.error(getApiErrorMessage(error, "Error saving project.")); },
    });
}

export function useDeleteProject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: projectService.delete,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); toast.success("Project deleted."); },
        onError: (error) => { toast.error(getApiErrorMessage(error, "Error deleting project.")); },
    });
}

export function useAssignUser() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (req: AssignUserRequest) => projectService.assignUser(req),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); toast.success("User assigned."); },
        onError: (error) => { toast.error(getApiErrorMessage(error, "Error assigning user.")); },
    });
}

// ============ Jobs ============
export function useJobs() {
    return useQuery({ queryKey: ["jobs"], queryFn: jobsService.getAll });
}

export function useUpdateJob() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (job: ManageJobs) => jobsService.update(job),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["jobs"] }); toast.success("Job saved."); },
        onError: (error) => { toast.error(getApiErrorMessage(error, "Error saving job.")); },
    });
}

export function useDeleteJob() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: jobsService.delete,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["jobs"] }); toast.success("Job deleted."); },
        onError: (error) => { toast.error(getApiErrorMessage(error, "Error deleting job.")); },
    });
}

export function useJobTypes() {
    return useQuery({ queryKey: ["jobTypes"], queryFn: jobsService.getJobTypes });
}

export function useJobLocations() {
    return useQuery({ queryKey: ["jobLocations"], queryFn: jobsService.getLocations });
}

export function useJobPositions() {
    return useQuery({ queryKey: ["jobPositions"], queryFn: jobsService.getPositions });
}

// ============ Manage Resumes ============
import { manageResumeService, interviewQuestionService } from "@/services/jobs.service";

export function useResumes() {
    return useQuery({ queryKey: ["resumes"], queryFn: manageResumeService.getAll });
}

export function useDeleteResume() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: manageResumeService.delete,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["resumes"] }); toast.success("Resume deleted."); },
        onError: (error) => { toast.error(getApiErrorMessage(error, "Error deleting resume.")); },
    });
}

// ============ Interview Questions ============
export function useInterviewQuestions() {
    return useQuery({ queryKey: ["interviewQuestions"], queryFn: interviewQuestionService.getAllQuestion });
}

export function useInterviewCategories() {
    return useQuery({ queryKey: ["interviewCategories"], queryFn: interviewQuestionService.getAllCategory });
}

export function useUpdateInterviewQuestion() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: interviewQuestionService.updateQuestion,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["interviewQuestions"] }); toast.success("Question saved."); },
        onError: (error) => { toast.error(getApiErrorMessage(error, "Error saving question.")); },
    });
}

export function useDeleteInterviewQuestion() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: interviewQuestionService.delete,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["interviewQuestions"] }); toast.success("Question deleted."); },
        onError: (error) => { toast.error(getApiErrorMessage(error, "Error deleting question.")); },
    });
}
