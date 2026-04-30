"use client";

import { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { attendanceService } from "@/services/attendance.service";
import { dashboardService } from "@/services/dashboard.service";
import type { DashboardProfile, DashboardHoliday, DashboardLeaveBalance, DashboardLeaveRequests } from "@/services/dashboard.service";
import { ui } from "@/components/shared/ui-components";
import apiClient from "@/lib/api-client";
import { usePageTranslation } from "@/lib/language";

/* ──────────────────────────────────────────────────────────────────────────
 * Employee Dashboard — fetches real data from DB via backend APIs
 * ────────────────────────────────────────────────────────────────────────── */

interface WorkStats {
    today: number; todayPercentage: number; thisWeek: number; weekPercentage: number;
    thisMonth: number; monthPercentage: number; remaining: number; overtime: number;
}

interface MyTask {
    taskBoardId: number;
    projectId: number;
    taskId?: number;
    taskCode?: string;
    taskName?: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    assigneeName?: string;
    dueDate?: string;
    projectName?: string;
    startDate?: string;
}

/* Hydration-safe localStorage reader using useSyncExternalStore */
const subscribe = (cb: () => void) => {
    window.addEventListener("storage", cb);
    return () => window.removeEventListener("storage", cb);
};
function useLocalStorage(key: string, fallback: string): string {
    return useSyncExternalStore(
        subscribe,
        () => localStorage.getItem(key) ?? fallback,
        () => fallback,
    );
}

export default function EmployeeDashboardPage() {
    const { t, currentLang } = usePageTranslation();

    const userId = useLocalStorage("employeeId", "");

    // ── State ──
    const [workStats, setWorkStats] = useState<WorkStats | null>(null);
    const [employee, setEmployee] = useState<DashboardProfile | null>(null);
    const [holidays, setHolidays] = useState<DashboardHoliday[]>([]);
    const [leaveAvailable, setLeaveAvailable] = useState<DashboardLeaveBalance[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<DashboardLeaveRequests>({
        total: 0, pending: 0, approved: 0, rejected: 0,
    });
    const [myTasks, setMyTasks] = useState<MyTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    // ── Fetch all data on mount ──
    useEffect(() => {
        setMounted(true);
        if (!userId) return;
        const empId = Number(userId);

        const promises = [
            // 1. Work statistics (Attendance-Server)
            attendanceService.getStatistics(empId).then((res) => {
                setWorkStats(res as WorkStats);
            }).catch(() => {}),

            // 2. Aggregated dashboard data (profile, holidays, leaves)
            dashboardService.getEmployeeDashboard(empId, currentLang).then((res) => {
                setEmployee(res.profile);
                setHolidays(res.holidays || []);
                setLeaveRequests(res.leaveRequests || { total: 0, pending: 0, approved: 0, rejected: 0 });
                setLeaveAvailable(res.leaveBalance || []);
                if (res.profile?.designation) {
                    localStorage.setItem("designation", res.profile.designation);
                }
                window.dispatchEvent(new Event("profile-updated"));
            }).catch(() => {}),

            // 3. My incomplete tasks
            apiClient.get(`taskBoard/myTasks/${empId}`).then(({ data }) => {
                setMyTasks(Array.isArray(data) ? data : []);
            }).catch(() => {}),
        ];

        Promise.allSettled(promises).finally(() => setLoading(false));
    }, [userId, currentLang]);

    const formatDate = (dateStr: string) => {
        if (!mounted) return "";
        try {
            return new Date(dateStr).toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
        } catch { return dateStr; }
    };

    // ── Computed values ──
    const totalLeaveTaken = useMemo(() => {
        return leaveAvailable.reduce((sum, l) => sum + (l.used ?? 0), 0);
    }, [leaveAvailable]);

    const totalLeaveAvailable = useMemo(() => {
        return leaveAvailable.reduce((sum, l) => sum + (l.available ?? 0), 0);
    }, [leaveAvailable]);

    const totalLeaveQuota = useMemo(() => {
        return leaveAvailable.reduce((sum, l) => sum + (l.totalQuota ?? 0), 0);
    }, [leaveAvailable]);

    const displayName = employee
        ? (currentLang === "th" && employee.firstNameTh ? `${employee.firstNameTh} ${employee.lastNameTh}` : `${employee.firstNameEn} ${employee.lastNameEn}`)
        : '...';

    if (loading) {
        return (
            <div className={ui.pageContainer}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-nv-violet/20 border-t-nv-violet rounded-full animate-spin" />
                        <p className="text-sm text-gray-500 animate-pulse">{t('Loading dashboard...', 'Loading dashboard...')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={ui.pageContainer}>
            {/* ════════════ Welcome Banner ════════════ */}
            <div className="relative rounded-2xl p-6 md:p-8 text-white mb-6 overflow-hidden" style={{ background: `linear-gradient(to right, var(--nv-violet), var(--nv-violet-dark))` }}>
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -right-10 -top-10 w-48 h-48 bg-white rounded-full" />
                    <div className="absolute right-20 -bottom-8 w-32 h-32 bg-white rounded-full" />
                    <div className="absolute left-1/3 -top-6 w-20 h-20 bg-white rounded-full" />
                </div>
                <div className="relative flex items-center gap-5">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold backdrop-blur-sm shrink-0 overflow-hidden border-2 border-white/30">
                        {employee?.imgPath ? (
                            <img src={employee.imgPath} alt="" className="w-full h-full object-cover" />
                        ) : (
                            displayName.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-white/60 text-sm">{t('Welcome Back', 'Welcome Back')} 👋</p>
                        <h2 className="text-xl md:text-2xl font-bold truncate">{displayName}</h2>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {employee?.designation && (
                                <span className="text-xs px-2.5 py-1 bg-white/15 rounded-full backdrop-blur-sm">{employee.designation}</span>
                            )}
                            {employee?.department && (
                                <span className="text-xs px-2.5 py-1 bg-white/10 rounded-full backdrop-blur-sm">{employee.department}</span>
                            )}
                        </div>
                    </div>
                    <div className="ml-auto hidden md:flex items-center gap-3">
                        <Link href={userId ? ROUTES.employeeProfile(userId) : "#"} className="px-5 py-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-sm font-medium transition-all backdrop-blur-sm border border-white/20 hover:border-white/30">
                            {t('View Profile', 'View Profile')}
                        </Link>
                    </div>
                </div>
            </div>

            {/* ════════════ Leave Stats Row ════════════ */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {[
                    { label: t('Leave Quota', 'Leave Quota'), value: totalLeaveQuota || 0, color: 'from-violet-500 to-indigo-500', bg: 'bg-violet-50', text: 'text-violet-700' },
                    { label: t('Leaves Taken', 'Leaves Taken'), value: totalLeaveTaken, color: 'from-sky-500 to-cyan-500', bg: 'bg-sky-50', text: 'text-sky-700' },
                    { label: t('Available', 'Available'), value: totalLeaveAvailable, color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
                    { label: t('Pending', 'Pending'), value: leaveRequests.pending, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-700' },
                    { label: t('Approved', 'Approved'), value: leaveRequests.approved, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50', text: 'text-green-700' },
                    { label: t('Rejected', 'Rejected'), value: leaveRequests.rejected, color: 'from-rose-500 to-pink-500', bg: 'bg-rose-50', text: 'text-rose-700' },
                ].map((stat) => (
                    <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-white hover:shadow-md transition-all duration-200 group`}>
                        <div className={`w-8 h-1.5 bg-gradient-to-r ${stat.color} rounded-full mb-3 group-hover:w-12 transition-all duration-300`} />
                        <p className={`text-2xl font-bold ${stat.text}`}>{stat.value}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* ════════════ Main Content Grid ════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* ── Col 1: Profile + Holidays ── */}
                <div className="lg:col-span-4 space-y-6">
                    {/* My Tasks Card */}
                    <div className={`${ui.tableWrapper} p-0 overflow-hidden`}>
                        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 px-5 py-3.5 border-b border-indigo-100/60">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <span className="w-1.5 h-5 rounded-full" style={{ background: 'var(--nv-violet)' }} />
                                    {t('My Tasks', 'My Tasks')}
                                </h4>
                                <span className="text-xs bg-white px-2.5 py-1 rounded-full text-gray-500 border border-gray-100">
                                    {myTasks.length} {t('tasks', 'tasks')}
                                </span>
                            </div>
                        </div>
                        <div className="p-4 max-h-[420px] overflow-y-auto">
                            {myTasks.length === 0 ? (
                                <div className="text-center py-8 text-sm text-gray-400">
                                    <span className="text-3xl block mb-2">🎉</span>
                                    {t('No pending tasks', 'No pending tasks')}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {myTasks.map((task) => {
                                        const taskDate = task.dueDate ? new Date(task.dueDate) : null;
                                        const now = new Date();
                                        now.setHours(0, 0, 0, 0);
                                        const isOverdue = taskDate && taskDate < now;
                                        
                                        const priorityStyle: Record<string, { bg: string, text: string, icon: string }> = {
                                            High: { bg: 'bg-rose-600', text: 'text-white', icon: '🔥' },
                                            Medium: { bg: 'bg-amber-100 text-amber-700', text: 'text-amber-700', icon: '⚡' },
                                            Low: { bg: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-700', icon: '🌱' },
                                        };
                                        const statusLabel: Record<string, string> = {
                                            pending: 'Pending', progress: 'In Progress', review: 'Review', hold: 'On Hold',
                                        };
                                        const statusStyle: Record<string, string> = {
                                            pending: 'bg-amber-50 text-amber-600 border-amber-100',
                                            progress: 'bg-blue-50 text-blue-600 border-blue-100',
                                            review: 'bg-purple-50 text-purple-600 border-purple-100',
                                            hold: 'bg-gray-100 text-gray-600 border-gray-200',
                                        };

                                        return (
                                            <div key={task.taskBoardId} 
                                                className={`relative overflow-hidden p-4 rounded-xl border transition-all hover:shadow-md group
                                                ${task.priority === 'High' 
                                                    ? 'border-rose-300 bg-rose-100/40 shadow-[4px_0_12px_-4px_rgba(225,29,72,0.2),inset_4px_0_0_0_#e11d48]' 
                                                    : mounted && isOverdue 
                                                        ? 'border-gray-200 bg-gray-50 shadow-[inset_4px_0_0_0_#ef4444]' 
                                                        : 'border-gray-200 bg-gray-50 hover:border-indigo-200'}`}>
                                                
                                                <div className="flex items-start justify-between gap-3 mb-2.5">
                                                    <div className="flex-1 min-w-0">
                                                        <h5 className="text-sm font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                                                            {task.title}
                                                        </h5>
                                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                            {task.taskCode && (
                                                                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold border border-indigo-100">
                                                                    📋 {task.taskCode}
                                                                </span>
                                                            )}
                                                            <span className="text-[10px] text-gray-400 flex items-center gap-1 shrink-0">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                                                                </svg>
                                                                {task.projectName || 'General'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider flex items-center gap-1 ${priorityStyle[task.priority]?.bg || 'bg-gray-100'} ${priorityStyle[task.priority]?.text || 'text-gray-600'}`}>
                                                            {priorityStyle[task.priority]?.icon} {task.priority}
                                                        </span>
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${statusStyle[task.status] || 'bg-gray-50'}`}>
                                                            {statusLabel[task.status] || task.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100/60">
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100/50">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span className="font-medium">
                                                            {mounted && task.startDate ? new Date(task.startDate).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' }) : '...'}
                                                            <span className="mx-1 text-gray-300">→</span>
                                                            <span className={mounted && isOverdue ? 'text-rose-600 font-bold' : 'text-gray-900 font-bold'}>
                                                                {mounted && task.dueDate ? new Date(task.dueDate).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }) : '...'}
                                                            </span>
                                                        </span>
                                                    </div>
                                                    {mounted && isOverdue && (
                                                        <span className="text-[10px] font-extrabold text-white bg-rose-600 px-2 py-0.5 rounded shadow-sm flex items-center gap-1 animate-pulse">
                                                            ⚠️ {t('OVERDUE', 'LATE')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {myTasks.length > 0 && (
                                <Link href="/projects/task-board" className="mt-3 flex items-center justify-center gap-2 text-sm text-white font-medium transition-all py-2.5 rounded-xl shadow-sm hover:shadow-md hover:opacity-90" style={{ background: `linear-gradient(to right, var(--nv-violet), var(--nv-violet-dark))` }}>
                                    {t('View Task Board', 'View Task Board')} →
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Holidays */}
                    <div className={`${ui.tableWrapper} p-0 overflow-hidden`}>
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-3.5 border-b border-amber-100/60">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <span className="w-1.5 h-5 bg-amber-400 rounded-full" />
                                    {t('Upcoming Holidays', 'Upcoming Holidays')}
                                </h4>
                                <Link href={ROUTES.holidays} className="text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors">
                                    {t('View All', 'View All')} →
                                </Link>
                            </div>
                        </div>
                        <div className="p-4">
                            {holidays.length === 0 ? (
                                <div className="text-center py-6 text-sm text-gray-400">
                                    {t('No upcoming holidays', 'No upcoming holidays')}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {holidays.slice(0, 3).map((h) => (
                                        <div key={h.holidayId} className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50/50 transition-colors group">
                                            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex flex-col items-center justify-center text-white shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                                                <span className="text-[9px] font-bold uppercase leading-none opacity-80">{new Date(h.holidayDate).toLocaleDateString("en", { month: "short" })}</span>
                                                <span className="text-lg font-bold leading-none">{new Date(h.holidayDate).getDate()}</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{h.title}</p>
                                                <p className="text-xs text-gray-500">{formatDate(h.holidayDate)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Col 2: Leave Balance + Work Stats ── */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Leave Balance */}
                    <div className={`${ui.tableWrapper} p-0 overflow-hidden`}>
                        <div className="px-5 py-3.5 border-b flex justify-between items-center" style={{ background: `linear-gradient(to right, color-mix(in srgb, var(--nv-violet) 8%, white), color-mix(in srgb, var(--nv-violet) 4%, white))`, borderColor: `color-mix(in srgb, var(--nv-violet) 15%, white)` }}>
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                <span className="w-1.5 h-5 rounded-full" style={{ background: 'var(--nv-violet)' }} />
                                {t('Leave Balance', 'Leave Balance')}
                            </h4>
                            <span className="text-xs bg-white px-2.5 py-1 rounded-full text-gray-500 border border-gray-100">{mounted ? new Date().getFullYear() : "..."}</span>
                        </div>
                        <div className="p-5">
                            {leaveAvailable.length === 0 ? (
                                <div className="text-center py-6 text-sm text-gray-400">
                                    {t('No leave data', 'No leave data')}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {leaveAvailable.map((leave, idx) => {
                                        const name = leave.leaveTypeName || `Type ${idx + 1}`;
                                        const total = leave.totalQuota ?? 0;
                                        const used = leave.used ?? 0;
                                        const remain = leave.available ?? (total - used);
                                        const pct = total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0;
                                        const barColor = pct > 80 ? 'bg-gradient-to-r from-rose-400 to-rose-500' : pct > 50 ? 'bg-gradient-to-r from-amber-400 to-orange-400' : '';
                                        return (
                                            <div key={idx} className="group">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm text-gray-700 font-medium truncate">{name}</span>
                                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                                        <span className="text-xs font-semibold text-gray-900">{used}/{total}</span>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                                    <div className={`${barColor} h-2.5 rounded-full transition-all duration-700 ease-out`} style={{ width: `${pct}%`, ...(!barColor ? { background: `linear-gradient(to right, var(--nv-violet), var(--nv-violet-dark))` } : {}) }} />
                                                </div>
                                                <div className="flex justify-between mt-1.5">
                                                    <span className="text-[10px] text-gray-400">{pct}% {t('used', 'used')}</span>
                                                    <span className="text-[10px] text-nv-violet font-semibold">{remain} {t('remaining', 'remaining')}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            <Link href={ROUTES.leaveEmployee} className="mt-4 flex items-center justify-center gap-2 text-sm text-white font-medium transition-all py-2.5 rounded-xl shadow-sm hover:shadow-md hover:opacity-90" style={{ background: `linear-gradient(to right, var(--nv-violet), var(--nv-violet-dark))` }}>
                                {t('Apply Leave', 'Apply Leave')}
                            </Link>
                        </div>
                    </div>

                    {/* Work Statistics */}
                    <div className={`${ui.tableWrapper} p-0 overflow-hidden`}>
                        <div className="bg-gradient-to-r from-sky-50 to-cyan-50 px-5 py-3.5 border-b border-sky-100/60">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-sky-500 rounded-full" />
                                {t('Work Statistics', 'Work Statistics')}
                            </h4>
                        </div>
                        <div className="p-5 grid grid-cols-2 gap-3">
                            {[
                                { label: t('Today', 'Today'), value: workStats?.today, pct: workStats?.todayPercentage, color: 'nv-violet', bg: 'from-violet-50 to-indigo-50', border: 'border-violet-100/40', icon: '📊' },
                                { label: t('This Week', 'This Week'), value: workStats?.thisWeek, pct: workStats?.weekPercentage, color: 'cyan-500', bg: 'from-cyan-50 to-sky-50', border: 'border-cyan-100/40', icon: '📅' },
                                { label: t('This Month', 'This Month'), value: workStats?.thisMonth, pct: workStats?.monthPercentage, color: 'emerald-500', bg: 'from-emerald-50 to-green-50', border: 'border-emerald-100/40', icon: '📆' },
                                { label: t('Remaining', 'Remaining'), value: workStats?.remaining, pct: null, color: 'amber-500', bg: 'from-amber-50 to-yellow-50', border: 'border-amber-100/40', icon: '⏰' },
                            ].map((item) => (
                                <div key={item.label} className={`p-4 bg-gradient-to-br ${item.bg} rounded-xl border ${item.border} text-center hover:shadow-sm transition-shadow`}>
                                    <span className="text-xl block mb-1">{item.icon}</span>
                                    <p className="text-xl font-bold text-gray-900">{item.value != null ? `${item.value.toFixed(1)}h` : '--'}</p>
                                    <p className="text-[11px] text-gray-500 mt-0.5">{item.label}</p>
                                    {item.pct != null && (
                                        <div className="w-full bg-white/60 rounded-full h-1.5 mt-2">
                                            <div className={`bg-${item.color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${Math.min(item.pct, 100)}%` }} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Col 3: Quick Actions + Leave Requests ── */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Quick Actions */}
                    <div className={`${ui.tableWrapper} p-0 overflow-hidden`}>
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-3.5 border-b border-emerald-100/60">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-emerald-500 rounded-full" />
                                {t('Quick Actions', 'Quick Actions')}
                            </h4>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-2 gap-2.5">
                                {[
                                    { label: t('My Attendance', 'My Attendance'), icon: '📋', href: ROUTES.attendanceEmployee, color: 'from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100', iconBg: 'bg-indigo-100' },
                                    { label: t('My Leaves', 'My Leaves'), icon: '🌴', href: ROUTES.leaveEmployee, color: 'from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100', iconBg: 'bg-emerald-100' },
                                    { label: t('My Salary', 'My Salary'), icon: '💰', href: ROUTES.payroll, color: 'from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100', iconBg: 'bg-amber-100' },
                                    { label: t('Holidays', 'Holidays'), icon: '🎉', href: ROUTES.holidays, color: 'from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100', iconBg: 'bg-rose-100' },
                                    { label: t('My Profile', 'My Profile'), icon: '👤', href: userId ? ROUTES.employeeProfile(userId) : '#', color: 'from-cyan-50 to-sky-50 hover:from-cyan-100 hover:to-sky-100', iconBg: 'bg-cyan-100' },
                                    { label: t('Overtime', 'Overtime'), icon: '⏰', href: ROUTES.overtime, color: 'from-purple-50 to-fuchsia-50 hover:from-purple-100 hover:to-fuchsia-100', iconBg: 'bg-purple-100' },
                                ].map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={`flex flex-col items-center gap-2.5 p-4 bg-gradient-to-br ${item.color} rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group`}
                                    >
                                        <div className={`w-11 h-11 ${item.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                                            <span className="text-xl">{item.icon}</span>
                                        </div>
                                        <span className="text-xs font-medium text-gray-700 text-center leading-tight">{item.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Leave Requests */}
                    <div className={`${ui.tableWrapper} p-0 overflow-hidden`}>
                        <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-5 py-3.5 border-b border-rose-100/60">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-rose-400 rounded-full" />
                                {t('Leave Requests', 'Leave Requests')}
                            </h4>
                        </div>
                        <div className="p-4 space-y-2">
                            {[
                                { label: t('Total Requests', 'Total Requests'), value: leaveRequests.total, icon: '📝', bg: 'bg-gray-50 hover:bg-gray-100', color: 'text-gray-900' },
                                { label: t('Pending', 'Pending'), value: leaveRequests.pending, icon: '⏳', bg: 'bg-amber-50 hover:bg-amber-100', color: 'text-amber-600' },
                                { label: t('Approved', 'Approved'), value: leaveRequests.approved, icon: '✅', bg: 'bg-emerald-50 hover:bg-emerald-100', color: 'text-emerald-600' },
                                { label: t('Rejected', 'Rejected'), value: leaveRequests.rejected, icon: '❌', bg: 'bg-rose-50 hover:bg-rose-100', color: 'text-rose-600' },
                            ].map((item) => (
                                <div key={item.label} className={`flex items-center justify-between p-3.5 ${item.bg} rounded-xl transition-colors`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-base">{item.icon}</span>
                                        <span className="text-sm text-gray-700 font-medium">{item.label}</span>
                                    </div>
                                    <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
