"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import liff from "@line/liff";
import { authService } from "@/services/auth.service";
import { setToken } from "@/lib/auth";
import { jwtDecode } from "jwt-decode";
import { useRouter, usePathname } from "next/navigation";
import { ROUTES } from "@/lib/routes";

interface TokenPayload {
    sub: string;
    nameid: string;
}

interface LiffContextType {
    liffReady: boolean;
    liffError: string | null;
}

const LiffContext = createContext<LiffContextType>({ liffReady: false, liffError: null });

export function useLiff() {
    return useContext(LiffContext);
}

/**
 * Map each mobile route to its specific LIFF ID.
 * Each Rich Menu button opens a different LIFF app, so we must init with the matching ID.
 */
const LIFF_ROUTE_MAP: Record<string, string> = {
    "/mobile/check-in":      "2008746159-jDjM2yvJ",
    "/mobile/attendance":    "2008746159-zLbA81LK",
    "/mobile/leave":         "2008746159-iFVolEx1",
    "/mobile/announcement":  "2008746159-LlzPX0pr",
    "/mobile/register-line": "2008746159-GpA9Gbhb",
};

/** Default / fallback LIFF ID (Register page) */
const DEFAULT_LIFF_ID = "2008746159-GpA9Gbhb";

function getLiffIdForPath(pathname: string): string {
    // Exact match first
    if (LIFF_ROUTE_MAP[pathname]) return LIFF_ROUTE_MAP[pathname];
    
    // Partial match (e.g. /mobile/check-in/xxx)
    for (const [route, liffId] of Object.entries(LIFF_ROUTE_MAP)) {
        if (pathname.startsWith(route)) return liffId;
    }
    
    return process.env.NEXT_PUBLIC_LIFF_ID || DEFAULT_LIFF_ID;
}

/**
 * LiffAuthProvider — handles LINE LIFF auto-login for /mobile/* pages.
 *
 * Each Rich Menu button opens a different LIFF app (different LIFF ID).
 * We detect the current route and use the matching LIFF ID to init.
 */
export default function LiffAuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
    const [liffReady, setLiffReady] = useState(false);
    const [liffError, setLiffError] = useState<string | null>(null);
    const initCalledRef = useRef(false);

    useEffect(() => {
        if (initCalledRef.current) return;
        initCalledRef.current = true;

        const initLiff = async () => {
            // 1. If already have JWT token → skip LIFF, already authenticated
            const hasToken = !!localStorage.getItem("token");
            if (hasToken) {
                setAuthState("authenticated");
                setLiffReady(true);
                return;
            }

            // 2. Get the correct LIFF ID for the current page
            const liffId = getLiffIdForPath(pathname);
            console.log(`[LIFF] Route: ${pathname} → LIFF ID: ${liffId}`);

            if (!liffId) {
                setLiffError("LIFF ID not configured");
                setAuthState("unauthenticated");
                return;
            }

            try {
                // 3. Initialize LIFF with the correct ID for this route
                await liff.init({ liffId });
                setLiffReady(true);
                setLiffError(null);

                // 4. If LINE logged in → try auto-login via backend
                if (liff.isLoggedIn()) {
                    const idToken = liff.getIDToken();
                    if (idToken) {
                        try {
                            const res = await authService.loginByLine({ lineToken: idToken });
                            if (res.token) {
                                setToken(res.token);
                                try {
                                    const decoded = jwtDecode<TokenPayload>(res.token);
                                    localStorage.setItem("username", decoded.sub);
                                    localStorage.setItem("employeeId", decoded.nameid);
                                } catch (e) {
                                    console.error("Token decode failed", e);
                                }
                                window.dispatchEvent(new Event("storage"));
                                setAuthState("authenticated");

                                // If user was on register-line, redirect to announcement
                                if (pathname.includes("/register-line")) {
                                    router.push(ROUTES.mobileAnnouncement);
                                }
                                return;
                            }
                        } catch (e: any) {
                            console.error("loginByLine failed:", e);
                            // LINE not registered yet → show register page
                            if (!pathname.includes("/register-line")) {
                                router.push(ROUTES.registerLine);
                            }
                            setAuthState("unauthenticated");
                            return;
                        }
                    }
                }

                // 5. Not logged in to LINE yet
                if (pathname.includes("/register-line")) {
                    setAuthState("unauthenticated");
                    return;
                }

                // On other pages → trigger LINE login to get identity
                liff.login();
                
            } catch (err: any) {
                console.error("LIFF initialization failed", err);
                setLiffError(`${err?.message || "LIFF init failed"} (ID: ${liffId})`);

                if (!pathname.includes("/register-line")) {
                    router.push(ROUTES.registerLine);
                }
                setAuthState("unauthenticated");
            }
        };

        initLiff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // On register-line page, always show content
    if (pathname.includes("/register-line")) {
        return (
            <LiffContext.Provider value={{ liffReady, liffError }}>
                {children}
            </LiffContext.Provider>
        );
    }

    if (authState === "loading") {
        return (
            <LiffContext.Provider value={{ liffReady, liffError }}>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-nv-violet/20 border-t-nv-violet rounded-full animate-spin" />
                        <p className="text-sm text-gray-500 animate-pulse">กำลังเข้าสู่ระบบอัตโนมัติ...</p>
                    </div>
                </div>
            </LiffContext.Provider>
        );
    }

    if (authState === "authenticated") {
        return (
            <LiffContext.Provider value={{ liffReady, liffError }}>
                {children}
            </LiffContext.Provider>
        );
    }

    return (
        <LiffContext.Provider value={{ liffReady, liffError }}>
            {null}
        </LiffContext.Provider>
    );
}
