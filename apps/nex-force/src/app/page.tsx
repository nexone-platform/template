"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

/**
 * Root page — redirects based on authentication status:
 *   • Authenticated  → Employee Dashboard
 *   • Not authenticated → Login page
 */
export default function RootPage() {
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated()) {
            router.replace(ROUTES.employeeDashboard);
        } else {
            router.replace(ROUTES.login);
        }
    }, [router]);

    // Show a minimal loading state while redirecting
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-nv-violet border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Redirecting…</p>
            </div>
        </div>
    );
}
