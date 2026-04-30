import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// --- Types ---

export interface TrainingListDto {
    id: number;
    trainingType: string;
    trainer: string;
    employee: string;
    timeDuration: string;
    startDate: string;
    endDate: string;
    description: string;
    cost: string;
    status: string;
    img: string;
}

export interface TrainingTypeDto {
    id: number;
    type: string;
    description: string;
    status: string;
}

export interface TrainerDto {
    id: number;
    name: string;
    lname: string;
    role: string;
    contactNumber: string;
    mail: string;
    description: string;
    status: string;
    img: string;
}

// --- Mock Data (Based on Angular assets/JSON) ---

const MOCK_TRAINING_LIST: TrainingListDto[] = [
    {
        id: 1,
        trainingType: "Git Training",
        trainer: "John Doe",
        employee: "Bernardo Galaviz",
        timeDuration: "7 May 2023 - 10 May 2023",
        startDate: "2023-05-07",
        endDate: "2023-05-10",
        description: "Comprehensive Git version control training.",
        cost: "400",
        status: "Active",
        img: "/assets/img/profiles/avatar-02.jpg"
    },
    {
        id: 2,
        trainingType: "Swift Training",
        trainer: "Richard Miles",
        employee: "Jeffrey Warden",
        timeDuration: "7 May 2023 - 10 May 2023",
        startDate: "2023-05-07",
        endDate: "2023-05-10",
        description: "iOS development with Swift language.",
        cost: "800",
        status: "Active",
        img: "/assets/img/profiles/avatar-09.jpg"
    },
    {
        id: 3,
        trainingType: "Node Training",
        trainer: "John Doe",
        employee: "John Doe",
        timeDuration: "7 May 2023 - 10 May 2023",
        startDate: "2023-05-07",
        endDate: "2023-05-10",
        description: "Backend development with Node.js.",
        cost: "400",
        status: "Inactive",
        img: "/assets/img/profiles/avatar-09.jpg"
    },
    {
        id: 4,
        trainingType: "Angular Training",
        trainer: "Mike Litorus",
        employee: "Richard Miles",
        timeDuration: "7 May 2023 - 10 May 2023",
        startDate: "2023-05-07",
        endDate: "2023-05-10",
        description: "Frontend framework training with Angular.",
        cost: "400",
        status: "Active",
        img: "/assets/img/profiles/avatar-05.jpg"
    }
];

const MOCK_TRAINING_TYPES: TrainingTypeDto[] = [
    { id: 1, type: "Node Training", description: "Backend development concepts.", status: "Inactive" },
    { id: 2, type: "Git Training", description: "Version control systems.", status: "Active" },
    { id: 3, type: "Swift Training", description: "Mobile app development.", status: "Inactive" },
    { id: 4, type: "Html Training", description: "Web structure and markup.", status: "Inactive" },
    { id: 5, type: "Laravel Training", description: "PHP framework training.", status: "Inactive" }
];

const MOCK_TRAINERS: TrainerDto[] = [
    {
        id: 1,
        name: "John Doe",
        lname: "Doe",
        role: "Senior Developer",
        contactNumber: "9876543210",
        mail: "johndoe@example.com",
        description: "Expert in Git and Node.js.",
        status: "Inactive",
        img: "/assets/img/profiles/avatar-02.jpg"
    },
    {
        id: 2,
        name: "Mike Litorus",
        lname: "Litorus",
        role: "Web Developer",
        contactNumber: "9876543120",
        mail: "mikelitorus@example.com",
        description: "Specializes in modern frontend frameworks.",
        status: "Active",
        img: "/assets/img/profiles/avatar-05.jpg"
    },
    {
        id: 3,
        name: "Wilmer Deluna",
        lname: "Deluna",
        role: "Fullstack Developer",
        contactNumber: "9876543210",
        mail: "wilmerdeluna@example.com",
        description: "Passionate about clean code and automation.",
        status: "Inactive",
        img: "/assets/img/profiles/avatar-11.jpg"
    }
];

// --- Hooks ---

export function useTrainingLists() {
    return useQuery({
        queryKey: ["training", "lists"],
        queryFn: async () => {
            return MOCK_TRAINING_LIST;
        },
    });
}

export function useTrainingTypes() {
    return useQuery({
        queryKey: ["training", "types"],
        queryFn: async () => {
            return MOCK_TRAINING_TYPES;
        },
    });
}

export function useTrainers() {
    return useQuery({
        queryKey: ["training", "trainers"],
        queryFn: async () => {
            return MOCK_TRAINERS;
        },
    });
}

// --- Mutations (Simulated) ---

export function useCreateTrainingList() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newData: Partial<TrainingListDto>) => {
return newData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["training", "lists"] });
            toast.success("Training entry created successfully (Mock)");
        },
    });
}

export function useUpdateTrainingList() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (updatedData: Partial<TrainingListDto>) => {
return updatedData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["training", "lists"] });
            toast.success("Training entry updated successfully (Mock)");
        },
    });
}

export function useDeleteTrainingList() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["training", "lists"] });
            toast.success("Training entry deleted successfully (Mock)");
        },
    });
}
