import React, { ReactNode } from 'react';

interface DashboardTemplateProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  widgets?: ReactNode; // specific slot for top KPIs
}

export const DashboardTemplate = ({
  title,
  subtitle,
  actions,
  children,
  widgets
}: DashboardTemplateProps) => {
  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header Profile */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-8 py-6 bg-white border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        
        {/* Actions Menu */}
        {actions && (
          <div className="mt-4 sm:mt-0">
            {actions}
          </div>
        )}
      </div>
      
      {/* Body Area */}
      <div className="p-8 flex-1 overflow-auto space-y-6">
        {/* Top KPI Widgets */}
        {widgets && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {widgets}
          </div>
        )}
        
        {/* Main Content Area */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
};
