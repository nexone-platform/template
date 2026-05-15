'use client';

import React, { useEffect,  useState, useCallback, useMemo } from 'react';
import { usePermissions } from '@/contexts/PermissionContext';
import { useAuth } from '@nexone/auth';
import { MasterTemplate, useLanguage } from '@nexone/ui';
import * as LucideIcons from 'lucide-react';
import LoginPage from '@/components/LoginPage';
import CompanySettings from '@/components/CompanySettings';
import BranchSettings from '@/components/BranchSettings';
import RoleSettings from '@/components/RoleSettings';
import EmailTemplates from '@/components/EmailTemplates';
import UserManagement from '@/components/UserManagement';
import DashboardOverview from '@/components/DashboardOverview';
import SystemMenus from '@/components/SystemMenus';
import SystemMenuLanguages from '@/components/SystemMenuLanguages';
import SystemApps from '@/components/SystemApps';
import SystemLanguages from '@/components/SystemLanguages';
import DatabaseManagement from '@/components/DatabaseManagement';
import SystemMonitoring from '@/components/SystemMonitoring';
import Notifications from '@/components/Notifications';
import AppMenus from '@/components/AppMenus';
import ActivityLogs from '@/components/ActivityLogs';
import SystemAnnouncements from '@/components/SystemAnnouncements';

import TemplateMaster1Page from '@/components/template/TemplateMaster1Page';
import TemplateMaster2Page from '@/components/template/TemplateMaster2Page';
import TemplateMaster3Page from '@/components/template/TemplateMaster3Page';
import TemplateMaster4Page from '@/components/template/TemplateMaster4Page';
import TemplateMasterGraph1Page from '@/components/template/TemplateMasterGraph1Page';

import SecuritySettings from '@/components/SecuritySettings';
import BillingSettings from '@/components/BillingSettings';
import DisplaySettings from '@/components/DisplaySettings';
import UnitTypeSettings from '@/components/UnitTypeSettings';
import ProvincesSettings from '@/components/ProvincesSettings';

// Hardcoded nav sections have been removed. Menus are now fully dynamic.

export default function AdminPage() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { permissions, refreshPermissions } = usePermissions();
  const { isLoggedIn, user: authUser, login, logout, loading: authLoading, error: authError } = useAuth();

  // ดึงสิทธิ์ใหม่ทุกครั้งที่กด sidebar
  const handleNavigate = useCallback((page: string) => {
    setCurrentPage(page);
    refreshPermissions();
  }, [refreshPermissions]);

  const [dynamicMenus, setDynamicMenus] = useState<any[]>([]);
  const [systemApp, setSystemApp] = useState<any>(null);
  const { lang } = useLanguage();

  const resolveIcon = (iconName: string | undefined | null, DefaultIcon: any) => {
    if (!iconName) return DefaultIcon;
    
    // Remove "lucide-" prefix if user types it
    const cleanIconName = iconName.toLowerCase().startsWith('lucide-') 
      ? iconName.slice(7) 
      : iconName;

    // Handle both kebab-case and pascal-case
    const pascalName = cleanIconName
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    
    // First try PascalCase, then exact match
    const IconComponent = (LucideIcons as any)[pascalName] || (LucideIcons as any)[cleanIconName] || (LucideIcons as any)[iconName];
    return IconComponent || DefaultIcon;
  };



  useEffect(() => {
    if (!isLoggedIn) return; // Don't fetch menus until logged in
    const apiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:8101/api';

    const fetchMenus = async () => {
      try {
        const res = await fetch(`${apiUrl}/menus?app_name=NexCore`);
        if (res.ok) {
           const json = await res.json();
           const items = Array.isArray(json) ? json : (json?.data || []);
           setDynamicMenus(items);
        }
      } catch(e) {}
    };

    const fetchSystemApp = async () => {
      try {
        const res = await fetch(`${apiUrl}/v1/system-apps`);
        if (res.ok) {
            const json = await res.json();
            const apps = Array.isArray(json) ? json : (json?.data || []);
            const coreApp = apps.find((a: any) => a.app_name.toLowerCase() === 'nexcore' || a.id === 1);
            setSystemApp(coreApp);
        }
      } catch(e) {}
    };

    fetchMenus();
    fetchSystemApp();
  }, [isLoggedIn]);

  // ── Auth Guard: Show Login Page ──
  // Loading = checking if existing session cookie is valid
  if (authLoading && !isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)',
      }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <div style={{
            width: 40, height: 40, border: '3px solid #334155', borderTopColor: '#6366f1',
            borderRadius: '50%', margin: '0 auto 16px',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ fontSize: 14 }}>กำลังตรวจสอบสิทธิ์...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={async (workspaceId, email, password) => {
          return login({ workspaceId, email, password, appName: 'NexCore' });
        }}
        appName="NexOne ERP"
        error={authError?.message}
        loading={authLoading}
      />
    );
  }

  // Real user from auth session
  const user = {
    name: authUser?.displayName || authUser?.email || (lang === 'th' ? 'แอดมิน' : 'Admin User'),
    role: authUser?.roleName || (lang === 'th' ? 'ผู้ดูแลระบบ' : 'Administrator'),
    avatar: (authUser as any)?.avatarUrl || ''
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardOverview onNavigate={handleNavigate} />;
      case 'announcements':
        return <SystemAnnouncements />;
      case 'notifications':
        return <Notifications />;
      case 'logs':
        return <ActivityLogs />;
      case 'company':
        return <CompanySettings />;
      case 'branch':
        return <BranchSettings />;
      case 'users':
        return <UserManagement />;
      case 'roles':
        return <RoleSettings />;
      case 'email':
        return <EmailTemplates />;
      case 'languages':
        return <SystemLanguages />;
      case 'menus':
        return <SystemMenus />;
      case 'app-menus':
        return <AppMenus />;
      case 'menus-languages':
        return <SystemMenuLanguages />;
      case 'system-apps':
        return <SystemApps />;
      case 'database':
        return <DatabaseManagement />;
      case 'monitoring':
        return <SystemMonitoring />;
      case 'security-config':
        return <SecuritySettings />;
      case 'billing':
        return <BillingSettings />;
      case 'display':
        return <DisplaySettings />;
      case 'template-master-1':
        return <TemplateMaster1Page />;
      case 'template-master-2':
        return <TemplateMaster2Page />;
      case 'template-master-3':
        return <TemplateMaster3Page />;
      case 'template-master-4':
        return <TemplateMaster4Page />;
      case 'template-master-graph':
        return <TemplateMasterGraph1Page />;
      case 'provinces':
        return <ProvincesSettings />;
      case 'unit-type':
        return <UnitTypeSettings />;
      default:
        return <div className="p-6 bg-white rounded-lg shadow"><h3>Welcome to NexCore</h3></div>;
    }
  };



  const currentMenuEntity = dynamicMenus.find(m => m.page_key === currentPage || m.route === currentPage);
  
  // Default to dynamic label from menu entity
  const dynamicLabel = currentMenuEntity?.translations?.[lang] || currentMenuEntity?.title;
  const displayLabel = dynamicLabel || 'NexCore Admin';

  const breadcrumbAppName = systemApp ? (systemApp.translations?.[lang] || systemApp.app_name) : 'NexCore Admin';

  const getPageTitle = () => {
    return dynamicLabel || displayLabel;
  };

    return (
    <MasterTemplate
      currentPage={currentPage}
      onNavigate={handleNavigate}
      isOpen={sidebarOpen}
      appName="NexCore"
      defaultThemeColor="#6366f1"
      sections={[]}
      menuApiUrl={process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:8101/api'}
      pageTitle={getPageTitle()}
      breadcrumb={[breadcrumbAppName, getPageTitle()]}
      user={user}
      onLogout={() => logout()}
      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      allowedMenuKeys={permissions.filter(p => p.isActive).map(p => p.menuCode)}
      deniedMenuKeys={permissions.filter(p => !p.isActive).map(p => p.menuCode)}
    >
      <React.Fragment key={currentPage}>
        {renderContent()}
      </React.Fragment>
    </MasterTemplate>
  );
}
