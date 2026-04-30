'use client';

import React, { useState, useCallback } from 'react';
import { usePermissions } from '@/contexts/PermissionContext';
import { useAuth } from '@nexone/auth';
import { MasterTemplate, useLanguage } from '@nexone/ui';
import { Settings, Building2, MapPin, Palette, ShieldCheck, Mail, Users, Globe, LayoutDashboard, Database, Bell, FileText, Shield, Monitor, LayoutTemplate, Box } from 'lucide-react';
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
import ActivityLogs from '@/components/ActivityLogs';
import SystemAnnouncements from '@/components/SystemAnnouncements';

import TemplateMaster1Page from '@/components/template/TemplateMaster1Page';
import TemplateMaster2Page from '@/components/template/TemplateMaster2Page';
import TemplateMaster3Page from '@/components/template/TemplateMaster3Page';
import TemplateMasterGraph1Page from '@/components/template/TemplateMasterGraph1Page';

import SecuritySettings from '@/components/SecuritySettings';
import BillingSettings from '@/components/BillingSettings';
import DisplaySettings from '@/components/DisplaySettings';
import ProvincesSettings from '@/components/ProvincesSettings';
import UnitTypeSettings from '@/components/UnitTypeSettings';

import { CreditCard, Eye, SlidersHorizontal, Megaphone } from 'lucide-react';

// Nav Sections specific to NexCore Admin
const adminNavSections = [
  {
    id: 'overview',
    title: 'ภาพรวม',
    icon: LayoutDashboard,
    items: [
      { id: 'dashboard', label: 'ภาพรวมระบบ', icon: Globe },
      { id: 'announcements', label: 'ระบบประกาศ', icon: Megaphone },
      { id: 'notifications', label: 'การแจ้งเตือน', icon: Bell },
      { id: 'logs', label: 'ประวัติการใช้งาน', icon: FileText },
    ],
  },
  {
    id: 'organization',
    title: 'องค์กร',
    icon: Building2,
    items: [
      { id: 'company', label: 'ข้อมูลบริษัท', icon: Building2 },
      { id: 'branch', label: 'ข้อมูลสาขา', icon: MapPin },
      { id: 'billing', label: 'การเงิน & ภาษี', icon: CreditCard },
    ],
  },
  {
    id: 'security',
    title: 'ความปลอดภัย',
    icon: Shield,
    items: [
      { id: 'users', label: 'ผู้ใช้งานระบบ', icon: Users },
      { id: 'roles', label: 'บทบาทและสิทธิ์', icon: ShieldCheck },
      { id: 'security-config', label: 'ตั้งค่าความปลอดภัย', icon: Shield },
    ],
  },
  {
    id: 'appearance',
    title: 'การปรับแต่ง',
    icon: Palette,
    items: [
      { id: 'display', label: 'การแสดงผล & ธีม', icon: SlidersHorizontal },
      { id: 'email', label: 'อีเมล์แม่แบบ', icon: Mail },
    ],
  },
  {
    id: 'templates',
    title: 'แม่แบบ',
    icon: LayoutTemplate,
    items: [
      { id: 'template-master-1', label: 'มาสเตอร์ แบบที่ 1', icon: LayoutTemplate },
      { id: 'template-master-2', label: 'มาสเตอร์ แบบที่ 2', icon: LayoutTemplate },
      { id: 'template-master-3', label: 'มาสเตอร์ แบบที่ 3', icon: LayoutTemplate },
      { id: 'template-master-graph', label: 'มาสเตอร์และกราฟ แบบที่ 1', icon: LayoutTemplate },
    ],
  },
  {
    id: 'system',
    title: 'ระบบ',
    icon: Settings,
    items: [
      { id: 'languages', label: 'ภาษา', icon: Globe },
      { id: 'menus', label: 'เมนู', icon: LayoutTemplate },
      { id: 'menus-languages', label: 'ภาษาเมนู', icon: Globe },
      { id: 'system-apps', label: 'แอปในระบบ', icon: LayoutDashboard },
      { id: 'database', label: 'ฐานข้อมูล', icon: Database },
      { id: 'monitoring', label: 'ตรวจสอบระบบ', icon: Monitor },
    ],
  },
  {
    id: 'master-data',
    title: 'ข้อมูลอ้างอิง',
    icon: Database,
    items: [
      { id: 'provinces', label: 'จังหวัด / พื้นที่', icon: MapPin },
      { id: 'unit-type', label: 'หน่วยนับ', icon: Box },
    ],
  },
];

export default function AdminPage() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { refreshPermissions } = usePermissions();
  const { isLoggedIn, user: authUser, login, logout, loading: authLoading, error: authError } = useAuth();

  // ดึงสิทธิ์ใหม่ทุกครั้งที่กด sidebar
  const handleNavigate = useCallback((page: string) => {
    setCurrentPage(page);
    refreshPermissions();
  }, [refreshPermissions]);

  const [dynamicMenus, setDynamicMenus] = useState<any[]>([]);
  const [systemApp, setSystemApp] = useState<any>(null);
  const { lang } = useLanguage();

  React.useEffect(() => {
    if (!isLoggedIn) return; // Don't fetch menus until logged in
    const apiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:8001/api';

    const fetchMenus = async () => {
      try {
        const res = await fetch(`${apiUrl}/menus?app_name=nex-core`);
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
  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={async (email, password) => {
          return login({ email, password, appName: 'nex-core' });
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
      case 'template-master-graph':
        return <TemplateMasterGraph1Page />;
      case 'provinces':
        return <ProvincesSettings />;
      case 'unit-type':
        return <UnitTypeSettings />;
      default:
        return <div className="p-6 bg-white rounded-lg shadow"><h3>Welcome to NexCore Admin</h3></div>;
    }
  };



  const allItems = adminNavSections.flatMap(s => s.items);
  const currentItem = allItems.find(i => i.id === currentPage);
  
  // For topbar & breadcrumbs, translate based on selected lang
  const currentMenuEntity = dynamicMenus.find(m => m.page_key === currentPage || m.route === currentPage || m.base === currentPage);
  
  // Default to dynamic label from menu entity
  const dynamicLabel = currentMenuEntity?.translations?.[lang] || (lang === 'en' ? currentMenuEntity?.title_en : currentMenuEntity?.title_th) || currentMenuEntity?.title;
  const displayLabel = dynamicLabel || (currentItem ? currentItem.label : 'NexCore Admin');

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
      sections={adminNavSections}
      menuApiUrl={process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:8001/api'}
      pageTitle={getPageTitle()}
      breadcrumb={[breadcrumbAppName, getPageTitle()]}
      user={user}
      onLogout={() => logout()}
      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
    >
      <React.Fragment key={currentPage}>
        {renderContent()}
      </React.Fragment>
    </MasterTemplate>
  );
}
