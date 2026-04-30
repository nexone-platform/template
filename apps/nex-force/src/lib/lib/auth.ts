/**
 * Auth helpers — replaces Angular's AuthService for client-side usage.
 *
 * Conversion:
 *   AuthService.setToken() → setToken()
 *   AuthService.getToken() → getToken()
 *   AuthService.getUserProfile() → getUserProfile()
 *   AuthService.logout() → logout()
 *
 * Cookie note:
 *   The Next.js middleware (server-side) cannot read localStorage.
 *   We mirror the auth token into an `auth-token` cookie so the
 *   middleware can enforce login redirects.
 */

// ── Cookie helpers ──────────────────────────────────────────────
function setAuthCookie(token: string): void {
    const maxAge = 7 * 24 * 60 * 60; // 7 days
    document.cookie = `auth-token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearAuthCookie(): void {
    document.cookie = "auth-token=; path=/; max-age=0; SameSite=Lax";
}

// ── Token management ────────────────────────────────────────────
export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
}

export function setToken(token: string): void {
    localStorage.setItem("token", token);
    setAuthCookie(token);
}

export function getUserProfile(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("username");
}

export function getUserId(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("employeeId");
}

export function isSuperAdmin(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("isSuperadmin") === "true";
}

export function isAuthenticated(): boolean {
    return !!getToken();
}

/**
 * Check if current path is under /mobile to decide redirect target.
 */
export function isMobilePath(): boolean {
    if (typeof window === "undefined") return false;
    return window.location.pathname.startsWith("/mobile");
}

/**
 * Logout and redirect to the appropriate login page based on context.
 * @param redirectTo — optional explicit redirect path
 */
export function logout(redirectTo?: string): void {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("employeeId");
    localStorage.removeItem("isSuperadmin");
    localStorage.removeItem("designation");
    clearAuthCookie();

    if (redirectTo) {
        window.location.href = redirectTo;
    } else {
        window.location.href = isMobilePath() ? "/mobile/register-line" : "/login";
    }
}
