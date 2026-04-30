'use client';

import React from 'react';
import GlobalAlertProvider from '@/components/GlobalAlertProvider';
import { ThemeProvider, ToastProvider } from '@nexone/ui';

const CORE_API_URL = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:8001/api';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider coreApiUrl={CORE_API_URL}>
      <ToastProvider>
        <GlobalAlertProvider>
          {children}
        </GlobalAlertProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
