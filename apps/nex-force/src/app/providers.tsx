"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState, type ReactNode } from "react";
import { LanguageProvider } from "@/lib/language";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemeProvider as NexThemeProvider } from "@nexone/ui";

const CORE_API_URL = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:8001/api';

/**
 * Root providers — replaces Angular's module-level providers.
 * Wraps app with QueryClient (replaces RxJS subscriptions) and toast notifications.
 */
export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        retry: 1,
                    },
                },
            })
    );

    return (
        <NexThemeProvider coreApiUrl={CORE_API_URL}>
            <QueryClientProvider client={queryClient}>
                <LanguageProvider>
                    <ThemeProvider>
                        {children}
                    </ThemeProvider>
                </LanguageProvider>
                <Toaster position="top-right" richColors />
            </QueryClientProvider>
        </NexThemeProvider>
    );
}
