"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CompanyProvider } from "@/lib/company-context";
import { DynamicFavicon } from "@/components/layout/dynamic-favicon";
import AuthGuard from "@/components/layout/AuthGuard";

/**
 * Dashboard layout — wraps all authenticated pages with sidebar + header.
 * AuthGuard prevents content flash for unauthenticated users.
 * CompanyProvider fetches company settings (logo, favicon) once and shares them.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <CompanyProvider>
                <DynamicFavicon />
                <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--nv-bg)' }}>
                    <Sidebar />
                    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                        <Header />
                        <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
                    </div>
                </div>
            </CompanyProvider>
        </AuthGuard>
    );
}

