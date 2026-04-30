"use client";

import { Bell, User, Calendar, MessageSquare, Briefcase, Clock } from "lucide-react";
import { PageHeader, ui } from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

export default function NotificationsPage() {
    const { t } = usePageTranslation();
    const modules = [
        { id: "staff_module", name: "Employee", icon: <User className="w-5 h-5" />, status: false },
        { id: "holidays_module", name: "Holidays", icon: <Calendar className="w-5 h-5" />, status: true },
        { id: "leave_module", name: "Leaves", icon: <Clock className="w-5 h-5" />, status: true },
        { id: "events_module", name: "Events", icon: <Calendar className="w-5 h-5" />, status: true },
        { id: "chat_module", name: "Chat", icon: <MessageSquare className="w-5 h-5" />, status: true },
        { id: "job_module", name: "Jobs", icon: <Briefcase className="w-5 h-5" />, status: false },
    ];

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Notifications Settings', 'Notifications Settings')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" }, { label: t('Settings', 'Settings'), href: "/settings/company-settings" }, { label: t('Notifications', 'Notifications') }]}
            />

            <div className="max-w-2xl">
                <div className={ui.tableWrapper}>
                    <ul className="divide-y divide-gray-100">
                        {modules.map((mod) => (
                            <li key={mod.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-nv-violet-light text-nv-violet rounded-lg">
                                        {mod.icon}
                                    </div>
                                    <span className="font-medium text-gray-700">{mod.name}</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked={mod.status} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-nv-violet peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                </label>
                            </li>
                        ))}
                    </ul>
                    <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                        <button className={ui.btnPrimary}>{t('Save Changes', 'Save Changes')}</button>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                    <Bell className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                        <h4 className="font-semibold text-amber-800 text-sm">Fine-grained Controls</h4>
                        <p className="text-amber-700 text-xs mt-1">To configure specific notification channels (Push, SMS, Email) for each sub-module, please visit the <a href="/settings/notification" className="underline font-bold hover:text-amber-900 transition-colors">Channel Matrix</a>.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
