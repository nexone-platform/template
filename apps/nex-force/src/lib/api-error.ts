import { AxiosError } from "axios";

/**
 * Extract a human-readable error message from an API error response.
 *
 * The backend returns errors in several shapes:
 *   1. { message: "..." }          — most controllers
 *   2. { Message: "..." }          — OvertimeController, etc. (capital M)
 *   3. plain string body           — some BadRequest("...") calls
 *   4. { title: "...", errors: {} } — ASP.NET validation ProblemDetails
 *
 * Priority: backend message → Axios message → fallback string.
 */
export function getApiErrorMessage(error: unknown, fallback = "An unexpected error occurred."): string {
    if (error instanceof AxiosError && error.response) {
        const data = error.response.data;

        // Case 1 & 2: object with message / Message
        if (data && typeof data === "object") {
            // ASP.NET ProblemDetails (validation errors)
            if (data.errors && typeof data.errors === "object") {
                const msgs = Object.values(data.errors).flat();
                if (msgs.length > 0) return msgs.join("\n");
            }
            if (typeof data.message === "string" && data.message) return data.message;
            if (typeof data.Message === "string" && data.Message) return data.Message;
            if (typeof data.title === "string" && data.title) return data.title;
        }

        // Case 3: plain string body
        if (typeof data === "string" && data) return data;
    }

    // Axios network / timeout errors
    if (error instanceof AxiosError && error.message) {
        return error.message;
    }

    // Generic Error
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
}
