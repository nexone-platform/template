"use client";

import { PageHeader, ui } from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

export default function DashboardPage() {
    const { t } = usePageTranslation();
    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Dashboard', 'Dashboard')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard') }]}
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: t('Employees', 'Employees'), value: "—", gradient: "from-nv-violet to-purple-600", icon: "👥" },
                    { label: t('Departments', 'Departments'), value: "—", gradient: "from-nv-cyan to-teal-500", icon: "🏢" },
                    { label: t('Projects', 'Projects'), value: "—", gradient: "from-rose-400 to-nv-danger", icon: "📁" },
                    { label: t('Pending Leaves', 'Pending Leaves'), value: "—", gradient: "from-nv-warn to-amber-500", icon: "📋" },
                ].map((card) => (
                    <div key={card.label} className={`bg-gradient-to-br ${card.gradient} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-white/80 text-sm font-medium">{card.label}</p>
                                <p className="text-3xl font-bold mt-1">{card.value}</p>
                            </div>
                            <span className="text-3xl opacity-80">{card.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={ui.tableWrapper}>
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                            <svg className="w-12 h-12 mb-3 stroke-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm">Connect to API to load activities...</p>
                        </div>
                    </div>
                </div>
                <div className={ui.tableWrapper}>
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h2>
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                            <svg className="w-12 h-12 mb-3 stroke-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm">Connect to API to load events...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
