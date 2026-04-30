"use client";

import { useState, useEffect } from "react";
import { attendanceService } from "@/services/attendance.service";
import { dashboardService } from "@/services/dashboard.service";
import type { DashboardProfile, DashboardHoliday } from "@/services/dashboard.service";
import apiClient from "@/lib/api-client";
import { usePageTranslation } from "@/lib/language";
import { Clock, TrendingUp } from "lucide-react";

interface WorkStats {
    today: number; todayPercentage: number; thisWeek: number; weekPercentage: number;
    thisMonth: number; monthPercentage: number; remaining: number; overtime: number;
}

interface MyTask {
    taskBoardId: number;
    title: string;
    status: string;
    priority: string;
    dueDate?: string;
    projectName?: string;
    startDate?: string;
}

// Hooks


export default function MobileAnnouncementPage() {
    const { t, currentLang } = usePageTranslation();
    const [userId, setUserId] = useState<string>("");

    const [workStats, setWorkStats] = useState<WorkStats | null>(null);
    const [employee, setEmployee] = useState<DashboardProfile | null>(null);
    const [holidays, setHolidays] = useState<DashboardHoliday[]>([]);
    const [myTasks, setMyTasks] = useState<MyTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedId = localStorage.getItem("employeeId") || "";
        setUserId(storedId);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!userId) {
            setLoading(false);
            return;
        }
        
        const empId = Number(userId);

        const promises = [
            attendanceService.getStatistics(empId).then((res) => {
                setWorkStats(res as WorkStats);
            }).catch(() => {}),

            dashboardService.getEmployeeDashboard(empId, currentLang).then((res) => {
                setEmployee(res.profile);
                setHolidays(res.holidays || []);
            }).catch(() => {}),

            apiClient.get(`taskBoard/myTasks/${empId}`).then(({ data }) => {
                setMyTasks(Array.isArray(data) ? data : []);
            }).catch(() => {})
        ];

        Promise.allSettled(promises).finally(() => setLoading(false));
    }, [userId, mounted, currentLang]);

    const displayName = employee
        ? (currentLang === "th" && employee.firstNameTh ? `${employee.firstNameTh} ${employee.lastNameTh}` : `${employee.firstNameEn} ${employee.lastNameEn}`)
        : '...';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-nv-violet/20 border-t-nv-violet rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 animate-pulse">{t('Loading...', 'Loading...')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col pt-6 px-4 pb-4 space-y-6">
            {/* Header Profile Card */}
            <div className="relative rounded-2xl p-5 text-white overflow-hidden shadow-lg" style={{ background: `linear-gradient(135deg, var(--nv-violet), #4c1d95)` }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
                <div className="relative flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold backdrop-blur-sm shrink-0 border-2 border-white/40 overflow-hidden shadow-inner">
                        {employee?.imgPath ? (
                            <img src={employee.imgPath} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            displayName.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-white/70 text-xs uppercase tracking-wider font-semibold mb-0.5">{t('Welcome Back', 'Welcome Back')}</p>
                        <h2 className="text-lg font-bold truncate leading-tight">{displayName}</h2>
                        <p className="text-white/80 text-xs mt-1 truncate">{employee?.designation || employee?.department || 'Employee'}</p>
                    </div>
                </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-sky-50 rounded-bl-3xl" />
                    <Clock className="w-5 h-5 text-sky-500 mb-2 relative z-10" />
                    <p className="text-2xl font-bold text-gray-800 relative z-10">{workStats?.today != null ? workStats.today.toFixed(1) : '--'}<span className="text-sm font-normal text-gray-500 ml-1">h</span></p>
                    <p className="text-xs text-gray-500 font-medium relative z-10 mt-1">{t('Today Hours', 'Today Hours')}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-50 rounded-bl-3xl" />
                    <TrendingUp className="w-5 h-5 text-emerald-500 mb-2 relative z-10" />
                    <p className="text-2xl font-bold text-gray-800 relative z-10">{workStats?.thisWeek != null ? workStats.thisWeek.toFixed(1) : '--'}<span className="text-sm font-normal text-gray-500 ml-1">h</span></p>
                    <p className="text-xs text-gray-500 font-medium relative z-10 mt-1">{t('Week Hours', 'Week Hours')}</p>
                </div>
            </div>

            {/* My Tasks (Mobile view) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-50 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        {t('My Pending Tasks', 'My Pending Tasks')}
                    </h3>
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">{myTasks.length}</span>
                </div>
                <div className="p-4 max-h-60 overflow-y-auto">
                    {myTasks.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 py-4">{t('No pending tasks', 'No pending tasks')}</p>
                    ) : (
                        <div className="space-y-3">
                            {myTasks.map((task, idx) => (
                                <div key={idx} className="flex flex-col gap-1.5 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-semibold text-gray-800 leading-tight">{task.title}</p>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold shrink-0 ${task.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'}`}>{task.priority}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        ⏱ {mounted && task.dueDate ? new Date(task.dueDate).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' }) : '...'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Upcoming Holidays */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-50 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        {t('Upcoming Holidays', 'Upcoming Holidays')}
                    </h3>
                </div>
                <div className="p-4">
                    {holidays.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 py-4">{t('No upcoming holidays', 'No upcoming holidays')}</p>
                    ) : (
                        <div className="space-y-3">
                            {holidays.slice(0, 3).map((h, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex flex-col items-center justify-center shrink-0 border border-amber-100/50">
                                        <span className="text-[10px] font-bold uppercase">{new Date(h.holidayDate).toLocaleDateString("en", { month: "short" })}</span>
                                        <span className="text-lg font-bold leading-none">{new Date(h.holidayDate).getDate()}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 truncate">{h.title}</p>
                                        <p className="text-xs text-gray-500">{mounted ? new Date(h.holidayDate).toLocaleDateString('th-TH', { weekday: 'long' }) : '...'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Quick Actions Note */}
            <p className="text-center text-xs text-gray-400 pb-4 font-medium">Use the bottom navigation to access features</p>
        </div>
    );
}
