'use client';

import React from 'react';
import { ApiConfigProvider } from '../contexts/ApiConfigContext';
import { PermissionProvider } from '../contexts/PermissionContext';
import { AuthProvider } from '@nexone/auth';
import { LanguageProvider, ThemeProvider, ToastProvider } from '@nexone/ui';

const CORE_API_URL = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:8101/api';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApiConfigProvider>
      <AuthProvider
        apiBaseUrl={CORE_API_URL}
        onSessionExpired={() => {
          // Force reload to show login page
          window.location.reload();
        }}
      >
        <ThemeProvider coreApiUrl={CORE_API_URL}>
          <LanguageProvider>
            <ToastProvider>
              <PermissionProvider initialApp="NexCore">
                {children}
              </PermissionProvider>
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </ApiConfigProvider>
  );
}
