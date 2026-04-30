"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, Users, Briefcase, TrendingUp, Clock, CheckCircle } from "lucide-react";
import apiClient from "@/lib/api-client";
import { PageHeader, LoadingSpinner, ui } from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

export default function JobsDashboardPage() {
    const { t } = usePageTranslation();
    const { data: dashData, isLoading } = useQuery({
        queryKey: ["jobsDashboard"],
        queryFn: async () => { const { data } = await apiClient.get<any>("manageJobs/getJobsDashboard"); return data; },
    });

    const stats = [
        { label: t('Total Jobs', 'Total Jobs'), value: dashData?.totalJobs || 0, icon: Briefcase, color: "bg-nv-violet", lightColor: "bg-nv-violet-light text-nv-violet" },
        { label: t('Open Positions', 'Open Positions'), value: dashData?.openPositions || 0, icon: TrendingUp, color: "bg-nv-violet", lightColor: "bg-nv-violet-light text-nv-violet" },
        { label: t('Total Applicants', 'Total Applicants'), value: dashData?.totalApplicants || 0, icon: Users, color: "bg-violet-500", lightColor: "bg-violet-50 text-violet-600" },
        { label: t('Pending Reviews', 'Pending Reviews'), value: dashData?.pendingReviews || 0, icon: Clock, color: "bg-nv-warn", lightColor: "bg-amber-50 text-amber-600" },
        { label: t('Shortlisted', 'Shortlisted'), value: dashData?.shortlisted || 0, icon: CheckCircle, color: "bg-teal-500", lightColor: "bg-teal-50 text-teal-600" },
        { label: t('Hired', 'Hired'), value: dashData?.hired || 0, icon: BarChart3, color: "bg-nv-violet", lightColor: "bg-nv-violet-light text-nv-violet" },
    ];

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Jobs Dashboard', 'Jobs Dashboard')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Jobs Dashboard', 'Jobs Dashboard') },
                ]}
            />

            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.map((s, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                                <div className={`p-3 rounded-lg ${s.color} text-white`}><s.icon className="w-6 h-6" /></div>
                                <div><p className="text-2xl font-bold text-gray-800">{s.value}</p><p className="text-sm text-gray-500">{s.label}</p></div>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Job Statistics</h3>
                            <p className="text-gray-400 text-sm">Job statistics chart will be displayed here.</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Applications</h3>
                            <p className="text-gray-400 text-sm">Recent applications list will be displayed here.</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
