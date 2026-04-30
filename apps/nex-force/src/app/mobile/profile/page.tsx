"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";
import { useRouter } from "next/navigation";
import { LogOut, UserCircle, Mail, CalendarDays, Building } from "lucide-react";
import { dashboardService } from "@/services/dashboard.service";
import type { DashboardProfile } from "@/services/dashboard.service";
import { usePageTranslation } from "@/lib/language";
import { ROUTES } from "@/lib/routes";
import { logout as authLogout } from "@/lib/auth";

export default function MobileProfilePage() {
    const { t, currentLang } = usePageTranslation();
    const router = useRouter();
    const [profile, setProfile] = useState<DashboardProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = localStorage.getItem("employeeId");
        if (!userId) {
            router.push(ROUTES.registerLine);
            return;
        }

        dashboardService.getEmployeeDashboard(Number(userId), currentLang)
            .then(res => {
                setProfile(res.profile);
            })
            .catch(err => {
                console.error("Failed to load profile", err);
            })
            .finally(() => setLoading(false));

    }, [currentLang, router]);

    const handleLogout = () => {
        // Logout from LINE (wrapped in try-catch because LIFF may not be initialized)
        try {
            if (liff.isLoggedIn()) {
                liff.logout();
            }
        } catch (e) {
            console.warn("LIFF logout skipped (SDK not ready)", e);
        }

        // Use centralized logout which clears localStorage + cookie
        // But first dispatch storage event for MobileBottomNav
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("employeeId");
        localStorage.removeItem("isSuperadmin");
        localStorage.removeItem("designation");
        // Clear the auth cookie
        document.cookie = "auth-token=; path=/; max-age=0; SameSite=Lax";
        
        // Dispatch storage event to update MobileBottomNav
        window.dispatchEvent(new Event("storage"));

        // Redirect to register LINE specifically for Mobile app (Hard reload to reset LIFF SDK state)
        window.location.href = ROUTES.registerLine;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-nv-violet/20 border-t-nv-violet rounded-full animate-spin" />
            </div>
        );
    }

    const displayName = profile
        ? (currentLang === "th" && profile.firstNameTh ? `${profile.firstNameTh} ${profile.lastNameTh}` : `${profile.firstNameEn} ${profile.lastNameEn}`)
        : '...';

    return (
        <div className="flex flex-col pt-6 px-4 pb-4 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">{t('My Profile', 'My Profile')}</h2>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Banner */}
                <div className="h-24 bg-gradient-to-r from-nv-violet to-purple-600 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                </div>
                
                {/* Avatar */}
                <div className="px-6 relative flex justify-center -mt-12 mb-4">
                    <div className="w-24 h-24 bg-white p-1 rounded-full shadow-md">
                        <div className="w-full h-full bg-indigo-50 rounded-full flex items-center justify-center text-3xl font-bold text-nv-violet overflow-hidden">
                            {profile?.imgPath ? (
                                <img src={profile.imgPath} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                displayName.charAt(0).toUpperCase()
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-6 text-center pb-6 border-b border-gray-50">
                    <h3 className="text-xl font-bold text-gray-900">{displayName}</h3>
                    <p className="text-sm text-gray-500 mt-1">{profile?.designation || 'Employee'}</p>
                    <p className="text-xs text-indigo-600 font-semibold mt-1.5 uppercase bg-indigo-50 inline-block px-2 py-0.5 rounded-full">{profile?.department || 'Department'}</p>
                </div>

                {/* Details */}
                <div className="px-6 py-5 space-y-4">
                    <div className="flex items-start gap-3">
                        <UserCircle className="w-5 h-5 text-gray-400 shrink-0" />
                        <div>
                            <p className="text-xs text-gray-500 font-medium">{t('Employee ID', 'Employee ID')}</p>
                            <p className="text-sm font-semibold text-gray-800">{profile?.employeeId || '--'}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                        <div>
                            <p className="text-xs text-gray-500 font-medium">{t('Email', 'Email')}</p>
                            <p className="text-sm font-semibold text-gray-800 break-all">{profile?.email || '--'}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Building className="w-5 h-5 text-gray-400 shrink-0" />
                        <div>
                            <p className="text-xs text-gray-500 font-medium">{t('Organization', 'Organization')}</p>
                            <p className="text-sm font-semibold text-gray-800">{profile?.organizationName || profile?.organizationCode || '--'}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <CalendarDays className="w-5 h-5 text-gray-400 shrink-0" />
                        <div>
                            <p className="text-xs text-gray-500 font-medium">{t('Join Date', 'Join Date')}</p>
                            <p className="text-sm font-semibold text-gray-800">
                                {profile?.joinDate ? new Date(profile.joinDate).toLocaleDateString("en-GB") : '--'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout Button */}
            <div className="pt-2">
                <button 
                    onClick={handleLogout}
                    className="w-full bg-white border border-red-100 text-red-500 hover:bg-red-50 font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
                >
                    <LogOut className="w-5 h-5" />
                    {t('Logout from LINE', 'Logout from LINE')}
                </button>
                <p className="text-center text-xs text-gray-400 font-medium mt-3">
                    {t('This will disconnect your LINE session until next login.', 'This will disconnect your LINE session until next login.')}
                </p>
            </div>
        </div>
    );
}
