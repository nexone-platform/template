'use client';

import React from 'react';
import { ApiConfigProvider } from '../contexts/ApiConfigContext';
import { ThemeProvider } from '@nexone/ui';

const CORE_API_URL = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:8001/api';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApiConfigProvider>
      <ThemeProvider coreApiUrl={CORE_API_URL}>
        {children}
      </ThemeProvider>
    </ApiConfigProvider>
  );
}
