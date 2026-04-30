import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './components/Sidebar.tsx';
import TopBar from './components/TopBar.tsx';
import Dashboard from './pages/Dashboard';
import Pages from './pages/Pages';
import PageBuilder from './pages/PageBuilder';
import ThemeSettings from './pages/ThemeSettings';

import Settings from './pages/Settings';
import Login from './pages/Login';
import TranslationMapping from './pages/TranslationMapping';
import useAuthStore from './store/useAuthStore';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import './App.css';

// ─── Query Client ───
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// ─── Protected Route Wrapper ───
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// ─── Page Guard: checks allowedPages permission ───
function PageGuard({ pageId, children }: { pageId: string; children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';
  const allowedPages = user?.allowedPages || [];

  if (!isAdmin && !allowedPages.includes(pageId)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

// ─── Inner App (needs router context for useNavigate) ───
function AppInner() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Listen for sidebar-reload event to force page re-mount
  const handleSidebarReload = useCallback(() => {
    setReloadKey(k => k + 1);
  }, []);

  useEffect(() => {
    window.addEventListener('sidebar-reload', handleSidebarReload);
    return () => window.removeEventListener('sidebar-reload', handleSidebarReload);
  }, [handleSidebarReload]);

  const SIDEBAR_WIDTH = sidebarCollapsed ? 64 : 260;

  return (
    <div className="app">
      <Routes>
        {/* Login page — accessible when NOT authenticated */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          }
        />

        {/* Page Builder — full screen, no sidebar/topbar, protected */}
        <Route
          path="/builder"
          element={
            <ProtectedRoute>
              <PageGuard pageId="builder">
                <PageBuilder />
              </PageGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/builder/:id"
          element={
            <ProtectedRoute>
              <PageGuard pageId="builder">
                <PageBuilder />
              </PageGuard>
            </ProtectedRoute>
          }
        />

        {/* All other pages — with sidebar + topbar layout, protected */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="app-layout">
                <Sidebar collapsed={sidebarCollapsed} />

                {/* Right column: topbar + content */}
                <div
                  className="app-right"
                  style={{ marginLeft: SIDEBAR_WIDTH }}
                >
                  <TopBar
                    sidebarCollapsed={sidebarCollapsed}
                    onToggleSidebar={() => setSidebarCollapsed(c => !c)}
                    userName={user?.displayName || 'Admin User'}
                    userEmail={user ? `${user.username}@techbiz.co.th` : 'admin@techbiz.co.th'}
                    userRole={user?.role || 'admin'}
                    onLogout={handleLogout}
                  />

                  <main className="app-content" key={reloadKey}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/pages" element={<PageGuard pageId="pages"><Pages /></PageGuard>} />

                      <Route path="/settings" element={<PageGuard pageId="settings"><Settings /></PageGuard>} />
                      <Route path="/theme" element={<PageGuard pageId="theme"><ThemeSettings /></PageGuard>} />
                      <Route path="/translations" element={<PageGuard pageId="translations"><TranslationMapping /></PageGuard>} />
                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

// ─── Root App ───
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
      <LanguageProvider>
      <ThemeProvider>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
      </ThemeProvider>
      </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

