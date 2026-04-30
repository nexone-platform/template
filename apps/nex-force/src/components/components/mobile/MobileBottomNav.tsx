"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
    MapPin,
    CalendarDays,
    ClipboardList,
    UserCircle,
    Home
} from "lucide-react";

export default function MobileBottomNav() {
    const pathname = usePathname();
    const [userId, setUserId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== "undefined") {
            setUserId(localStorage.getItem("employeeId"));
            
            // Listen to storage changes in case of logout/login or custom event
            const handleStorage = () => {
                setUserId(localStorage.getItem("employeeId"));
            };
            window.addEventListener("storage", handleStorage);
            
            return () => window.removeEventListener("storage", handleStorage);
        }
    }, [pathname]); // also check on pathname change, as sometimes localstorage doesnt fire event on same tab

    if (!mounted) return null;

    const navItems = userId ? [
        {
            href: "/mobile/announcement",
            label: "Home",
            icon: Home,
        },
        {
            href: "/mobile/check-in",
            label: "Check In",
            icon: MapPin,
        },
        {
            href: "/mobile/leave-employee",
            label: "Leave",
            icon: CalendarDays,
        },
        {
            href: "/mobile/attendance-employee",
            label: "Attendance",
            icon: ClipboardList,
        },
        {
            href: "/mobile/profile",
            label: "Profile",
            icon: UserCircle,
        },
    ] : [
        {
            href: "/mobile/register-line",
            label: "Register",
            icon: UserCircle,
        }
    ];

    return (
        <nav
            id="mobile-bottom-nav"
            className="fixed bottom-0 left-0 right-0 z-50 mobile-bottom-nav"
        >
            {/* Frosted glass background */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/60" />

            {/* Safe-area spacer */}
            <div className="relative flex items-stretch justify-around px-2 pt-1.5 pb-3">
                {navItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href + "/"));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                flex flex-col items-center justify-center gap-0.5
                                flex-1 py-2 rounded-xl transition-all duration-200
                                ${
                                    isActive
                                        ? "text-nv-violet"
                                        : "text-gray-400 active:text-gray-600"
                                }
                            `}
                        >
                            {/* Active indicator pill */}
                            <div className="relative">
                                {isActive && (
                                    <span className="absolute -inset-x-3 -inset-y-1.5 bg-nv-violet/10 rounded-full animate-fade-in" />
                                )}
                                <Icon
                                    className={`relative w-5.5 h-5.5 transition-transform duration-200 ${
                                        isActive ? "scale-110" : ""
                                    }`}
                                    strokeWidth={isActive ? 2.2 : 1.8}
                                    style={{ width: 22, height: 22 }}
                                />
                            </div>
                            <span
                                className={`text-[10px] leading-tight font-medium transition-colors duration-200 ${
                                    isActive
                                        ? "text-nv-violet font-semibold"
                                        : ""
                                }`}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
