"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { getUserProfile, getUserId, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/language";

export function Header() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [userId, setUserId] = useState<string | null>(null);
    const [designation, setDesignation] = useState("");

    const [menuOpen, setMenuOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const langRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const { currentLang, changeLang, languages, t } = useLanguage();
    const currentLangConfig = languages.find(l => l.code === currentLang) || languages[0];

    useEffect(() => {
        const syncProfile = () => {
            const profile = getUserProfile();
            const id = getUserId();
            setUsername(profile || "User");
            setUserId(id);
            setDesignation(localStorage.getItem("designation") || "");
        };
        syncProfile();

        // Listen for same-tab updates (custom event from dashboard)
        window.addEventListener("profile-updated", syncProfile);
        // Listen for cross-tab updates (StorageEvent)
        const handleStorage = (e: StorageEvent) => {
            if (e.key === "designation" || e.key === "username") syncProfile();
        };
        window.addEventListener("storage", handleStorage);
        return () => {
            window.removeEventListener("profile-updated", syncProfile);
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(e.target as Node)) {
                setLangOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleNavigateProfile = () => {
        if (userId) {
            router.push(ROUTES.employeeProfile(userId));
            setMenuOpen(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const handleChangeLang = (langCode: string) => {
        changeLang(langCode);
        setLangOpen(false);
    };

    return (
        <header
            className="border-b border-nv-border flex items-center justify-end pl-14 pr-3 sm:pl-6 sm:pr-6 lg:pl-6 sticky top-0 z-30 gap-2 sm:gap-3 backdrop-blur-xl"
            style={{
                height: "var(--nv-header-height, 64px)",
                backgroundColor: "var(--nv-header, rgba(255,255,255,0.8))",
            }}
        >
            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
                <button
                    onClick={() => setLangOpen(!langOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-xl transition-all duration-200 text-sm"
                    suppressHydrationWarning
                >
                    <img
                        src={currentLangConfig.flag}
                        alt={currentLangConfig.name}
                        className="w-5 h-auto rounded-sm"
                        suppressHydrationWarning
                    />
                    <span className="text-gray-700 font-medium hidden sm:block" suppressHydrationWarning>{currentLangConfig.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {langOpen && (
                    <div className="absolute right-0 mt-2 w-44 [background-color:var(--nv-card,#fff)] rounded-xl shadow-lg shadow-black/8 border border-gray-100 py-1.5 z-50">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleChangeLang(lang.code)}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-all duration-150 ${
                                    currentLang === lang.code ? "bg-nv-violet-light text-nv-violet font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                            >
                                <img src={lang.flag} alt={lang.name} className="w-4 h-auto rounded-sm" />
                                {lang.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
                <div
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-100 rounded-xl px-3 py-1.5 transition-all duration-200"
                >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-nv-violet via-purple-500 to-nv-cyan flex items-center justify-center text-white text-sm font-bold shadow-sm shadow-nv-violet/30">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm font-semibold text-gray-800" suppressHydrationWarning>{username}</p>
                        <p className="text-[11px] text-gray-400 -mt-0.5 max-w-[120px] truncate" suppressHydrationWarning>{designation || t('Employee', 'Employee')}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                </div>

                {/* Dropdown Menu */}
                {menuOpen && (
                    <div className="absolute right-0 mt-2 w-52 [background-color:var(--nv-card,#fff)] rounded-xl shadow-lg shadow-black/8 border border-gray-100 py-1.5 z-50">
                        <button
                            onClick={handleNavigateProfile}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                            {t('My Profile', 'My Profile')}
                        </button>
                        <button
                            onClick={() => {
                                router.push("/settings/change-password");
                                setMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                            {t('Change Password', 'Change Password')}
                        </button>
                        <div className="my-1 border-t border-gray-100" />
                        <button
                            onClick={() => {
                                router.push("/settings/company-settings");
                                setMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                            {t('Settings', 'Settings')}
                        </button>
                        <div className="my-1 border-t border-gray-100" />
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                            {t('Logout', 'Logout')}
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
