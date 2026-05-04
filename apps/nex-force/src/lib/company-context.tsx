"use client";

import React, { createContext, useContext } from "react";
import { useCompany, type Company } from "@/hooks/use-organization";

interface CompanyContextValue {
    company: Company | undefined;
    isLoading: boolean;
    /** Full URL for the company logo, or fallback to default */
    logoUrl: string;
    /** Full URL for the company favicon, or fallback to default */
    faviconUrl: string;
}

const CompanyContext = createContext<CompanyContextValue>({
    company: undefined,
    isLoading: true,
    logoUrl: "/logo.png",
    faviconUrl: "/favicon.png",
});

/**
 * Resolves a logo/favicon path from the API to a full URL.
 * The backend stores paths like "uploads/logo_xxx.png".
 * We need to prepend the API base URL to get the full URL.
 */
function resolveAssetUrl(path: string | undefined, fallback: string): string {
    if (!path || path.trim() === "") return fallback;

    // Already a full URL (data: or http)
    if (path.startsWith("data:") || path.startsWith("http")) return path;

    // Build full URL from API base
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
    const cleanBase = apiBase.replace(/\/+$/, "");
    const cleanPath = path.replace(/^\/+/, "");
    return `${cleanBase}/${cleanPath}`;
}

export function CompanyProvider({ children }: { children: React.ReactNode }) {
    const { data: company, isLoading } = useCompany();

    const logoUrl = resolveAssetUrl(company?.logo, "/logo.png");
    const faviconUrl = resolveAssetUrl(company?.favicon, "/favicon.png");

    return (
        <CompanyContext.Provider value={{ company, isLoading, logoUrl, faviconUrl }}>
            {children}
        </CompanyContext.Provider>
    );
}

export function useCompanyContext() {
    return useContext(CompanyContext);
}
