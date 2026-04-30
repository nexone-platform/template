'use client';

import React, { useState, useEffect, useRef } from 'react';
import { systemAppService, SystemApp } from '../services/api';
import { FileText, Grid, Presentation, ClipboardCheck, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface AppLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuStyle?: string;
  currentAppName?: string;
}

const AppLauncherModal: React.FC<AppLauncherModalProps> = ({ isOpen, onClose, menuStyle = 'classic', currentAppName }) => {
  const [apps, setApps] = useState<SystemApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('');
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [alertPopup, setAlertPopup] = useState({ show: false, title: '', message: '' });
  const tabsRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [apps, activeTab]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const scrollAmount = tabsRef.current.clientWidth;
      tabsRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadApps();
      setTimeout(checkScroll, 100); // Check scroll after opening
    }
  }, [isOpen]);

  const loadApps = async () => {
    try {
      setLoading(true);
      const data = await systemAppService.getAll();
      setApps((data || []).filter((app: SystemApp) => app.status === 'active' || app.is_active));
    } catch (error: any) {
      console.error('Failed to load system apps:', error);
      // Fallback mock data with groups when API is down
      setApps([
        { id: 1, app_name: 'ERROR: ' + error.message, desc_en: 'TMS', desc_th: 'TMS', icon_path: '/apps/nexspeed.png', theme_color: '#3B82F6', status: 'active', app_group: 'System' },
        { id: 2, app_name: 'NexSite', desc_en: 'Site', desc_th: 'Site', icon_path: '/apps/nexsite.png', theme_color: '#10B981', status: 'active', app_group: 'Portal & Workspace' },
        { id: 3, app_name: 'NexForce', desc_en: 'Force', desc_th: 'Force', icon_path: '/apps/nexforce.png', theme_color: '#F59E0B', status: 'active', app_group: 'Workforce & HR' },
        { id: 4, app_name: 'NexCost', desc_en: 'Cost', desc_th: 'Cost', icon_path: '/apps/nexcost.png', theme_color: '#EF4444', status: 'active', app_group: 'Finance & Accounting' },
        { id: 5, app_name: 'NexStock', desc_en: 'Stock', desc_th: 'Stock', icon_path: '/apps/nexstock.png', theme_color: '#8B5CF6', status: 'active', app_group: 'Operations & Logistics' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Group apps by app_group attribute
  const groupedApps = apps.reduce((acc, app) => {
    const groupName = app.app_group || 'Platform Ecosystem';
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(app);
    return acc;
  }, {} as Record<string, SystemApp[]>);

  // Determine width based on state to simulate a rich full-page-like mega menu
  const modalWidth = loading || apps.length === 0 ? '330px' : '330px';

  return (
    <>
      <div 
        className="fixed inset-0 z-[100]" 
        onClick={onClose}
        style={{ backgroundColor: 'transparent' }} 
      />
      
      <div 
        className="fixed z-[101] flex flex-col bg-slate-50 rounded-none shadow-[0_10px_40px_rgba(0,0,0,0.2)] border-2 border-slate-700 overflow-hidden"
        style={menuStyle === 'dual' ? {
          bottom: '24px',
          left: '74px',
          width: modalWidth,
          maxHeight: 'calc(100vh - 60px)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        } : { 
          top: '56px', 
          right: '24px', // Change from left to right alignment for standard top-nav launchers
          width: modalWidth,
          maxHeight: 'calc(100vh - 80px)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="bg-slate-200 border-b border-slate-300 px-3 py-[15px] flex justify-center items-center sticky top-0 z-10 w-full">
          <h2 
            className="text-lg font-bold text-slate-800 text-center"
            style={{ width: '306px', height: '28px' }}
          >
            NexOne Platform
          </h2>
        </div>

        <div className="overflow-y-auto px-3 pt-8 pb-8 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : apps.length === 0 ? (
            <div className="flex justify-center flex-col items-center h-48 text-slate-400">
              <span className="text-sm">ไม่พบข้อมูลแอปพลิเคชัน</span>
            </div>
          ) : (
            <div className="flex flex-col space-y-3" style={{ width: '300px', margin: '0 auto' }}>
              {Object.entries(groupedApps)
                .filter(([groupName]) => {
                   const groupedKeys = Object.keys(groupedApps).sort((a, b) => groupedApps[b].length - groupedApps[a].length || a.localeCompare(b));
                   const currentTab = activeTab && groupedKeys.includes(activeTab) ? activeTab : (groupedKeys[0] || '');
                   return groupName === currentTab;
                })
                .sort(([a], [b]) => groupedApps[b].length - groupedApps[a].length || a.localeCompare(b))
                .map(([groupName, groupApps]) => (
                <div 
                  key={groupName} 
                  className="flex flex-col items-center"
                  style={{ width: '300px', height: '150px' }}
                >
                  <div className="grid grid-cols-3 gap-x-2 gap-y-2 content-start pt-4 w-full h-full">
                    {groupApps
                      .sort((a, b) => (a.seq_no || 99) - (b.seq_no || 99))
                      .map((app) => {
                      const iconUrl = app.icon_path || app.icon_url || `/apps/${app.app_name?.toLowerCase()}.png`;
                      const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL ? process.env.NEXT_PUBLIC_CDN_URL.replace(/\/$/, '') : '';
                      const fullIconUrl = iconUrl.startsWith('http') ? iconUrl : `${cdnUrl}${iconUrl.startsWith('/') ? iconUrl : '/' + iconUrl}`;

                      return (
                        <a 
                          key={app.id} 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            // Don't re-open the current app
                            if (currentAppName && app.app_name === currentAppName) {
                              onClose();
                              return;
                            }
                            const targetUrl = app.route_path || app.app_url || app.url;
                            if (targetUrl) {
                              window.open(targetUrl, '_blank');
                              onClose();
                            } else {
                              setAlertPopup({
                                show: true,
                                title: `${app.app_name}`,
                                message: 'ระบบนี้ยังไม่ได้กำหนด URL ปลายทาง กรุณาตั้งค่าใน System Apps'
                              });
                            }
                          }}
                          className="flex flex-col items-center justify-start p-1 group cursor-pointer mx-auto"
                          style={{ width: '100px' }}
                        >
                          <div 
                            className="shrink-0 mb-2 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105"
                            style={{ width: '54px', height: '54px', minWidth: '54px', minHeight: '54px', padding: '5px' }}
                          >
                            <img 
                              src={fullIconUrl.replace('.svg', '.png')} 
                              alt={app.app_name} 
                              className="w-full h-full object-contain drop-shadow-sm group-hover:drop-shadow-xl rounded-2xl transition-all duration-300"
                              onError={(e) => {
                                 (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${app.app_name?.replace('Nex', '')}&background=random&color=fff&size=100&rounded=true&bold=true`;
                              }}
                            />
                          </div>
                          <span className="text-[13px] font-medium text-center text-slate-700 leading-tight block transition-colors duration-200 group-hover:text-blue-600">
                            {app.app_name}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer Tabs */}
        <div className="bg-slate-50 border-t border-slate-200 px-2 py-[15px] flex items-center justify-center mt-auto relative">
          
          {showLeftArrow && (
            <button 
              onClick={(e) => { e.stopPropagation(); scrollTabs('left'); }}
              className="absolute left-1 z-10 p-1 bg-white border border-slate-200 rounded-full shadow-md text-slate-500 hover:text-blue-600 hover:bg-slate-50"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          <div 
            ref={tabsRef}
            onScroll={checkScroll}
            className="flex overflow-x-auto w-full scroll-smooth no-scrollbar"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            <div className="flex bg-white border-y border-slate-200 min-w-max shadow-sm">
              {Object.keys(groupedApps)
                .sort((a, b) => groupedApps[b].length - groupedApps[a].length || a.localeCompare(b))
                .map((group, index, arr) => {
                  const isFirst = index === 0;
                  const isSelected = activeTab ? activeTab === group : isFirst;
                  return (
                    <button
                      key={group}
                      onClick={(e) => { e.stopPropagation(); setActiveTab(group); }}
                      className={`w-[84.5px] flex-shrink-0 px-1 py-2 text-[13px] font-semibold transition-all duration-200 border-r border-slate-200 text-center truncate ${
                        index === arr.length - 1 ? 'border-r-0' : ''
                      } ${
                        isSelected 
                          ? 'bg-blue-50 text-blue-700 shadow-inner' 
                          : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                      title={group}
                    >
                      {group}
                    </button>
                  );
                })}
            </div>
          </div>

          {showRightArrow && (
            <button 
              onClick={(e) => { e.stopPropagation(); scrollTabs('right'); }}
              className="absolute right-1 z-10 p-1 bg-white border border-slate-200 rounded-full shadow-md text-slate-500 hover:text-blue-600 hover:bg-slate-50"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
      

      {alertPopup.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl p-8 m-4 max-w-[400px] w-full mx-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 text-center mb-3 leading-snug">{alertPopup.title}</h3>
            <p className="text-slate-500 text-center text-sm mb-8">{alertPopup.message}</p>
            <button 
              onClick={() => setAlertPopup({ ...alertPopup, show: false })}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AppLauncherModal;
