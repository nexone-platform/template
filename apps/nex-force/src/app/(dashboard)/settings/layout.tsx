"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Building2,
    MapPin,
    Key,
    Mail,
    Settings as SettingsIcon,
    ThumbsUp,
    FileText,
    Hash,
    Bell,
    Layers,
    Database,
    ArrowLeft,
    Palette,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { usePageTranslation } from "@/lib/language";

const SETTINGS_MENU = [
    { label: "Company Settings", href: "/settings/company-settings", icon: Building2 },
    { label: "Branch Settings", href: "/settings/branch-settings", icon: MapPin },
    { label: "Theme Settings", href: "/settings/theme-settings", icon: Palette },
    { label: "Roles & Permissions", href: "/settings/role", icon: Key },
    { label: "Email Templates", href: "/settings/email-template", icon: Mail },
    { label: "Email Settings", href: "/settings/email-settings", icon: SettingsIcon },
    { label: "Approval Settings", href: "/settings/approval-settings", icon: ThumbsUp },
    { label: "Document Running", href: "/settings/document-running", icon: FileText },
    { label: "Prefixes", href: "/settings/prefixes", icon: Hash },
    { label: "Notification", href: "/settings/notification", icon: Bell },
    { label: "Approval Step", href: "/settings/approval-step", icon: Layers },
    { label: "Initial Data", href: "/settings/initial-data", icon: Database },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {

    return (
        <div className="flex-1 overflow-y-auto bg-nv-bg">
            {children}
        </div>
    );
}

/**
 * Settings sidebar content — rendered inside the main Sidebar when path is /settings/*
 */
export function SettingsSidebarContent() {
    const pathname = usePathname();
    const { t } = usePageTranslation("settings");

    return (
        <div className="flex flex-col h-full">
            {/* Back to main + Title */}
            <div className="p-4 border-b border-white/10">
                <Link href={ROUTES.adminDashboard} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-3 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t("Back to Dashboard")}</span>
                </Link>
                <h2 className="text-lg font-bold text-white">{t("Settings")}</h2>
            </div>

            {/* Menu items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {SETTINGS_MENU.map((menu) => {
                    const Icon = menu.icon;
                    const isActive = pathname === menu.href || pathname.startsWith(menu.href + "/");
                    return (
                        <Link
                            key={menu.href}
                            href={menu.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? "bg-nv-violet/15 text-nv-violet"
                                : "text-zinc-400 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? "text-nv-violet" : "text-zinc-500"}`} />
                            {t(menu.label)}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
