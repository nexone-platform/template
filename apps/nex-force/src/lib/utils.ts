import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Format date to dd/MM/yyyy */
export function formatDate(date: string | Date | null | undefined): string {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-GB"); // dd/MM/yyyy
}

/** Format date to ISO string for API */
export function toISOString(date: string | Date | null): string | null {
    if (!date) return null;
    return new Date(date).toISOString();
}

/** Extract filename from URL or File */
export function getFileName(fileOrUrl: string | File | null): string {
    if (!fileOrUrl) return "";
    if (typeof fileOrUrl === "string") return fileOrUrl.split("/").pop() || "";
    return fileOrUrl.name;
}
