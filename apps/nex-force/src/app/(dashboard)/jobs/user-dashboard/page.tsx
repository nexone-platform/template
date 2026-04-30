"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, Users, Briefcase, FileText } from "lucide-react";
import apiClient from "@/lib/api-client";
import { PageHeader, LoadingSpinner, ui } from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

export default function UserDashboardPage() {
    const { t } = usePageTranslation();
    const { data: dashData, isLoading } = useQuery({
        queryKey: ["userJobDashboard"],
        queryFn: async () => { const { data } = await apiClient.get<any>("manageJobs/getUserDashboard"); return data; },
    });

    const stats = [
        { label: t('Applied Jobs', 'Applied Jobs'), value: dashData?.appliedJobs || 0, icon: Briefcase, color: "bg-nv-violet" },
        { label: t('Shortlisted', 'Shortlisted'), value: dashData?.shortlisted || 0, icon: Users, color: "bg-nv-violet" },
        { label: t('Total Interviews', 'Total Interviews'), value: dashData?.totalInterviews || 0, icon: FileText, color: "bg-violet-500" },
        { label: t('Offered', 'Offered'), value: dashData?.offered || 0, icon: BarChart3, color: "bg-nv-warn" },
    ];

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('User Dashboard', 'User Dashboard')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Jobs', 'Jobs'), href: "/jobs" },
                    { label: t('User Dashboard', 'User Dashboard') },
                ]}
            />

            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((s, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                                <div className={`p-3 rounded-lg ${s.color} text-white`}><s.icon className="w-6 h-6" /></div>
                                <div><p className="text-2xl font-bold text-gray-800">{s.value}</p><p className="text-sm text-gray-500">{s.label}</p></div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h3>
                        <p className="text-gray-400 text-sm">Your recent job applications and interview schedules will appear here.</p>
                    </div>
                </>
            )}
        </div>
    );
}
