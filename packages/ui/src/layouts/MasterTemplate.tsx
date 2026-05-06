import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useSystemConfig } from '../hooks/useSystemConfig';

interface MasterTemplateProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  appName?: string;
  sections?: any[];
  defaultThemeColor?: string;
  menuApiUrl?: string;
  pageTitle: string;
  pageSubtitle?: string;
  breadcrumb?: string[];
  user: any;
  onLogout: () => void;
  onToggleSidebar: () => void;
  allowedMenuKeys?: string[];
  deniedMenuKeys?: string[];
}

export default function MasterTemplate({
  children,
  currentPage,
  onNavigate,
  isOpen,
  appName,
  sections,
  defaultThemeColor,
  menuApiUrl,
  pageTitle,
  pageSubtitle,
  breadcrumb,
  user,
  onLogout,
  onToggleSidebar,
  allowedMenuKeys,
  deniedMenuKeys,
}: MasterTemplateProps) {
  const { configs } = useSystemConfig();

  // If the position is BREADCRUMB, inject the tenant name into breadcrumb list
  const displayBreadcrumb = configs.showTenantName && configs.tenantNameDisplayPosition === 'BREADCRUMB' && configs.tenantName
    ? [configs.tenantName, ...(breadcrumb || [])]
    : breadcrumb || [];

  return (
    <div className="app-layout" style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        isOpen={isOpen}
        appName={appName}
        sections={sections}
        defaultThemeColor={defaultThemeColor}
        menuApiUrl={menuApiUrl}
        onToggleSidebar={onToggleSidebar}
        systemConfig={configs}
        allowedMenuKeys={allowedMenuKeys}
        deniedMenuKeys={deniedMenuKeys}
      />
      <main className={`main-content ${isOpen ? '' : 'expanded'}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'all 0.3s' }}>
        <Topbar
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle || ''}
          breadcrumb={displayBreadcrumb}
          user={user}
          onLogout={onLogout}
          onToggleSidebar={onToggleSidebar}
          coreApiUrl={menuApiUrl}
          systemConfig={configs}
        />
        <div className="page-content" style={{ flex: 1, overflowY: 'auto', padding: '15px', background: 'var(--bg-page, #f8fafc)' }}>
          {children}
        </div>
      </main>
    </div>
  );
}

