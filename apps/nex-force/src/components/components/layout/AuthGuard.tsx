"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

/**
 * AuthGuard — Client-side auth check for dashboard pages.
 *
 * Even though the middleware handles server-side redirect,
 * this provides a safety net for client-side navigation
 * and prevents content flash for unauthenticated users.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.replace(ROUTES.login);
        } else {
            setChecked(true);
        }
    }, [router]);

    if (!checked) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--nv-bg, #f8fafc)' }}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-nv-violet border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Verifying session…</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
