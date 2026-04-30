import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

/**
 * Axios instance — replaces Angular's BaseApiService + TokenInterceptor.
 *
 * Angular equivalent:
 *   BaseApiService → apiClient (get/post/put/delete wrappers)
 *   TokenInterceptor → request interceptor below
 *   ApiConfigService → NEXT_PUBLIC_API_URL env var
 *
 * Environment setup:
 *   .env.development  → http://localhost:8001  (local Ocelot gateway)
 *   .env.production   → https://techbizconvergence.co.th/api
 *   .env.local        → your personal override (gitignored)
 */
const rawUrl = process.env.NEXT_PUBLIC_API_URL;

if (!rawUrl && typeof window !== "undefined") {
    console.warn(
        "[api-client] ⚠️ NEXT_PUBLIC_API_URL is not set! " +
        "Copy .env.example → .env.local and configure your API gateway URL. " +
        "See: .env.example"
    );
}

// Ensure trailing slash so `apiClient.get("employees")` resolves correctly
const baseURL = rawUrl?.endsWith("/") ? rawUrl : `${rawUrl}/`;

const apiClient = axios.create({
    baseURL,
    timeout: 30000, // 30s — prevents premature timeout on approval flows
    headers: {
        "X-Requested-With": "XMLHttpRequest"
    },
});

// ---------- Request Interceptor (replaces TokenInterceptorService) ----------
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ---------- Response Interceptor (global error handling) ----------
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401 && typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("employeeId");
            // Clear auth cookie so middleware also blocks
            document.cookie = "auth-token=; path=/; max-age=0; SameSite=Lax";

            // Redirect based on path context only if not already on the login page
            const isLoginPage = window.location.pathname === "/login";
            if (!isLoginPage) {
                const isMobile = window.location.pathname.startsWith("/mobile");
                window.location.href = isMobile ? "/mobile/register-line" : "/login";
            }
        }

        // Normalize error response: ensure `data.message` is always set
        // so downstream consumers can rely on `error.response.data.message`.
        if (error.response?.data) {
            const d = error.response.data as Record<string, unknown>;
            if (typeof d === "object" && d !== null) {
                // Backend sometimes uses capital-M "Message"
                if (!d.message && d.Message) {
                    d.message = d.Message;
                }
            } else if (typeof error.response.data === "string" && error.response.data) {
                // Plain string body from BadRequest("...")
                error.response.data = { message: error.response.data } as unknown;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
