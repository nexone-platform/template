'use client';

import React from 'react';
import { systemAppService, SystemApp } from '../services/api';
import AppLauncherModal from './AppLauncherModal';
import { useLanguage } from '../contexts/LanguageContext';


import {
    LayoutDashboard,
    Home,
    LayoutTemplate,
    List,
    Truck,
    Grip,
    Grid3X3,
    Users,
    ClipboardList,
    MapPin,
    Receipt,
    Handshake,
    BarChart3,
    Settings,
    HelpCircle,
    ChevronRight,
    ChevronDown,
    Car,
    Map,
    Navigation,
    Wrench,
    Bell,
    Box,
    ShoppingBag,
    Package,
    Fuel,
    Warehouse,
    ParkingCircle,
    Route,
    Navigation2,
    Building2 as Building2_icon,
    MapPin as MapPin_icon,
    Globe as Globe_icon,
    Mail as Mail_icon,
    Monitor as Monitor_icon,
    Shield as Shield_icon,
    CreditCard as CreditCard_icon,
    Palette as Palette_icon,
    ShieldCheck,
    Database as Database_icon,
    Sliders as Sliders_icon,
    FileText as FileText_icon,
    Layout as Layout_icon,
} from 'lucide-react';

interface SidebarProps {
    currentPage: string;
    onNavigate: (page: string) => void;
    isOpen?: boolean;
    appName?: string;
    sections?: any[];
    defaultThemeColor?: string;
    onToggleSidebar?: () => void;
    menuApiUrl?: string; // e.g. 'http://localhost:8001/api' — if set, fetch menus dynamically
}

export const navSections = [
    {
        id: 'main',
        title: 'หลัก',
        icon: LayoutDashboard,
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'fleet', label: 'การจัดการรถบริษัท', icon: Truck, badge: undefined },
            { id: 'subcontractors', label: 'การจัดการรถร่วม', icon: Handshake },
            { id: 'maintenance', label: 'บำรุงรักษารถยนต์', icon: Wrench },
            { id: 'drivers', label: 'พนักงานขับรถ', icon: Users },
            { id: 'orders', label: 'คำสั่งขนส่ง', icon: ClipboardList, badge: '12' },
            { id: 'trips', label: 'GPS Tracking', icon: MapPin },
            { id: 'gps-live', label: 'GPS Live + Geofence', icon: Navigation2 },
            { id: 'route-optimizer', label: 'Route Optimizer AI', icon: Route },
            { id: 'transport-trips', label: 'ทริปขนส่ง', icon: Navigation },
            { id: 'customer-tracking', label: 'พอร์ทัลติดตามลูกค้า', icon: Map },
            { id: 'pod', label: 'ยืนยันการส่ง (POD)', icon: ClipboardList, badge: undefined },
            { id: 'alerts', label: 'แจ้งเตือน', icon: Bell, badge: '!' },
        ],
    },
    {
        id: 'mechanic',
        title: 'ช่าง & อะไหล่',
        icon: Wrench,
        items: [
            { id: 'mechanics', label: 'ช่างซ่อมรถยนต์', icon: Wrench },
            { id: 'container-mechanics', label: 'ช่างซ่อมตู้คอนเทนเนอร์', icon: Box },
            { id: 'parts-shops', label: 'ร้านอะไหล่', icon: ShoppingBag },
        ],
    },
    {
        id: 'stock',
        title: 'คลัง & สต๊อก',
        icon: Package,
        items: [
            { id: 'stock-parts', label: 'สต๊อกอะไหล่', icon: Package },
            { id: 'stock-oil', label: 'สต๊อกน้ำมัน', icon: Fuel },
            { id: 'storage', label: 'สถานที่เก็บ', icon: Warehouse },
        ],
    },

    {
        id: 'business',
        title: 'บัญชี การเงิน',
        icon: Receipt,
        items: [
            { id: 'finance', label: 'การเงิน & วางบิล', icon: Receipt },
            { id: 'invoices', label: 'วางบิลอัตโนมัติ', icon: Receipt },
            { id: 'trip-cost', label: 'วิเคราะห์ต้นทุนทริป', icon: BarChart3 },
            { id: 'analytics', label: 'วิเคราะห์ & รายงาน', icon: BarChart3 },
        ],
    },
    {
        id: 'master',
        title: 'ข้อมูลหลัก',
        icon: Map,
        items: [

            { id: 'locations', label: 'สถานที่รับ-ส่งสินค้า', icon: Navigation },
            { id: 'maintenance-plan', label: 'แผนซ่อมบำรุง', icon: Wrench },
            { id: 'expertise', label: 'ประเภทเชี่ยวชาญ', icon: MapPin },
            { id: 'parking', label: 'ลานจอดรถ', icon: ParkingCircle },
        ],
    },
    {
        id: 'basic-data',
        title: 'เมนูพื้นฐาน',
        icon: Box,
        items: [
            { id: 'brands', label: 'ยี่ห้อรถ', icon: Car },
            { id: 'vehicle-type', label: 'ประเภทรถ', icon: Car },
            { id: 'mechanic-type', label: 'ประเภทช่างซ่อม', icon: Wrench },
            { id: 'liquid-type', label: 'ประเภทของเหลว', icon: Fuel },
            { id: 'part-group', label: 'กลุ่มอะไหล่', icon: Package },
            { id: 'storage-type', label: 'ประเภทคลัง/สถานที่', icon: Warehouse },
            { id: 'parking-type', label: 'ประเภทที่จอดรถ', icon: ParkingCircle },
            { id: 'part-category', label: 'หมวดหมู่อะไหล่', icon: Package },
        ],
    },
    {
        id: 'templates',
        title: 'แม่แบบ (Template)',
        icon: LayoutTemplate,
        items: [
            { id: 'template-master-1', label: 'มาสเตอร์ แบบที่ 1', icon: Box },
            { id: 'template-master-2', label: 'มาสเตอร์ แบบที่ 2', icon: LayoutDashboard },
            { id: 'template-master-3', label: 'มาสเตอร์ แบบที่ 3', icon: LayoutDashboard },
            { id: 'template-master-graph-1', label: 'มาสเตอร์และกราฟ แบบที่ 1', icon: LayoutDashboard },
        ],
    },
    {
        id: 'system',
        title: 'ระบบ',
        icon: Settings,
        items: [
            { id: 'settings', label: 'ตั้งค่า', icon: Settings },
            { id: 'help', label: 'ช่วยเหลือ', icon: HelpCircle },
        ],
    },
];

// Icon mapping for materialicons → Lucide components
const ICON_MAP: Record<string, any> = {
    dashboard: LayoutDashboard, home: Home, settings: Settings, help: HelpCircle,
    people: Users, person: Users, group: Users, users: Users,
    business: Building2_icon, building: Building2_icon, location_on: MapPin_icon, 'map-pin': MapPin_icon, map: Map, navigation: Navigation,
    local_shipping: Truck, handshake: Handshake, build: Wrench, wrench: Wrench,
    assignment: ClipboardList, receipt: Receipt, bar_chart: BarChart3,
    gps_fixed: MapPin, inventory: Package, warehouse: Warehouse,
    credit_card: CreditCard_icon, 'credit-card': CreditCard_icon, mail: Mail_icon, language: Globe_icon, globe: Globe_icon,
    translate: Globe_icon, menu: List, apps: Grid3X3, storage: Warehouse,
    monitor: Monitor_icon, shield: Shield_icon, verified_user: ShieldCheck,
    tune: Wrench, security: ShieldCheck, straighten: Route,
    notifications: Bell, bell: Bell, history: ClipboardList, article: Box, box: Box,
    palette: Palette_icon, template: LayoutTemplate,
    layout: Layout_icon, sliders: Sliders_icon, 'file-text': FileText_icon, database: Database_icon
};

function getIconComponent(materialicon?: string): any {
    if (!materialicon) return HelpCircle;
    return ICON_MAP[materialicon.toLowerCase()] || HelpCircle;
}

// Convert flat DB menu rows to sectioned structure based on page_key prefix patterns
function flatMenusToSections(menus: any[], lang: string = 'th'): any[] {
    const activeMenus = menus.filter(m => m.is_active !== false).sort((a, b) => (a.menu_seq || 0) - (b.menu_seq || 0));
    const parents = activeMenus.filter(m => !m.parent_id);
    
    if (parents.length === 0) return [];

    const getTitle = (m: any) => m.translations?.[lang] || (lang === 'en' ? m.title_en : m.title_th) || m.title;

    // If all menus have no parent_id, just return them as a single flat section
    if (parents.length === activeMenus.length) {
        return [{
            id: 'main',
            title: getTitle({ translations: { th: 'เมนูหลัก', en: 'Main Menu' }, title: 'เมนูหลัก' }),
            icon: LayoutDashboard,
            items: activeMenus.map(m => ({
                id: m.page_key || m.route || String(m.menus_id),
                label: getTitle(m),
                icon: getIconComponent(m.materialicons || m.icon),
            }))
        }];
    }

    // Group children under their respective parents
    const sections: any[] = [];
    for (const parent of parents) {
        const children = activeMenus.filter(m => m.parent_id === parent.menus_id);
        sections.push({
            id: parent.page_key || parent.route || String(parent.menus_id),
            title: getTitle(parent),
            icon: getIconComponent(parent.materialicons || parent.icon),
            items: children.map(child => ({
                id: child.page_key || child.route || String(child.menus_id),
                label: getTitle(child),
                icon: getIconComponent(child.materialicons || child.icon),
            }))
        });
    }

    return sections;
}

export default function Sidebar({ currentPage, onNavigate, isOpen = true, appName = 'nexspeed', sections = navSections, defaultThemeColor, onToggleSidebar, menuApiUrl }: SidebarProps) {
    const [dynamicSections, setDynamicSections] = React.useState<any[] | null>(null);
    const [rawMenus, setRawMenus] = React.useState<any[]>([]);
    
    // Use the global LanguageContext instead of isolated state and window events
    const { lang } = useLanguage();

    // Recompute dynamic sections whenever lang or rawMenus changes
    React.useEffect(() => {
        if (rawMenus.length > 0) {
            setDynamicSections(flatMenusToSections(rawMenus, lang));
        } else {
            // Also translate the static sections fallback
            const translatedStatic = sections.map(s => ({
                ...s,
                title: s.translations?.[lang] || s.title,
                items: s.items.map((i: any) => ({
                    ...i,
                    label: i.translations?.[lang] || i.label
                }))
            }));
            setDynamicSections(translatedStatic);
        }
    }, [rawMenus, lang, sections]);

    const activeSections = dynamicSections || sections;
    // Default all sections to true (expanded)
    const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({});

    // Fetch menus dynamically from API if menuApiUrl is provided
    React.useEffect(() => {
        if (!menuApiUrl || !appName) return;
        const fetchMenus = async () => {
            try {
                // Map appName to kebab-case for API if needed (e.g. NexCore -> nex-core)
                const apiAppName = appName.toLowerCase() === 'nexcore' ? 'nex-core' : 
                                   appName.toLowerCase() === 'nexsite' ? 'nex-site' : 
                                   appName.toLowerCase() === 'nexspeed' ? 'nex-speed' : 
                                   appName;
                const res = await fetch(`${menuApiUrl}/menus?app_name=${encodeURIComponent(apiAppName)}`);
                if (!res.ok) return;
                const data = await res.json();
                const menus = Array.isArray(data) ? data : (data.data || []);
                if (menus.length > 0) {
                    setRawMenus(menus);
                }
            } catch (e) {
                console.warn('[Sidebar] Failed to fetch menus from DB, using static sections', e);
            }
        };
        fetchMenus();
    }, [menuApiUrl, appName]);

    const toggleSection = (title: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [title]: prev[title] === undefined ? false : !prev[title]
        }));
    };

    const [isAppLauncherOpen, setIsAppLauncherOpen] = React.useState(false);
    const [currentApp, setCurrentApp] = React.useState<SystemApp | null>(null);
    const [allApps, setAllApps] = React.useState<SystemApp[]>([]);
    const [isSystemAppsMenuExpanded, setIsSystemAppsMenuExpanded] = React.useState(false);
    const [expandedAppGroup, setExpandedAppGroup] = React.useState<string | null>(null);
    const [isSelectorUiExpanded, setIsSelectorUiExpanded] = React.useState(true);

    const [menuStyle, setMenuStyle] = React.useState<'classic' | 'dual'>('classic');
    const [activeDualSection, setActiveDualSection] = React.useState<string>('main');
    
    React.useEffect(() => {
        const loadStyle = () => {
            const saved = localStorage.getItem('nexone_menu_style');
            if (saved === 'dual' || saved === 'classic') {
                setMenuStyle(saved);
            }
        };
        loadStyle();
        // Custom event listener for style change
        window.addEventListener('nexone:menu_style_changed', loadStyle);
        return () => window.removeEventListener('nexone:menu_style_changed', loadStyle);
    }, []);

    const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStyle = e.target.value as 'classic' | 'dual';
        setMenuStyle(newStyle);
        localStorage.setItem('nexone_menu_style', newStyle);
        window.dispatchEvent(new Event('nexone:menu_style_changed'));
        // Return to first section after picking a style (don't stay on 'menu-style' panel)
        setActiveDualSection(activeSections[0]?.id || 'main');
    };

    const loadCurrentApp = async () => {
        try {
            const appsResponse = await systemAppService.getAll();
            const apps = Array.isArray(appsResponse) ? appsResponse : (appsResponse as any)?.data || [];
            setAllApps(apps);
            const app = apps.find((a: any) => a.app_name?.toLowerCase() === appName?.toLowerCase());
            if (app) setCurrentApp(app);
        } catch (err: any) {
            console.error('Failed to load current app info:', err);
            setCurrentApp({ 
                id: -1, 
                app_name: 'API ERR', 
                desc_en: 'Error', 
                desc_th: '', 
                icon_path: '', 
                theme_color: '', 
                status: '', 
                seq_no: 0,
                created_at: ''
            } as SystemApp);
        }
    };

    React.useEffect(() => {
        loadCurrentApp();
    }, []);

    const SelectorUI = () => {
        const groupedApps = React.useMemo(() => {
            const groups: { [key: string]: SystemApp[] } = {};
            (allApps || []).forEach(app => {
                if (!app.is_active && app.status !== 'active') return;
                const groupName = app.app_group || 'Platform Ecosystem';
                if (!groups[groupName]) groups[groupName] = [];
                groups[groupName].push(app);
            });
            return groups;
        }, [allApps]);

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* --- Section 1: รูปแบบเมนู --- */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div 
                        className="sidebar-section-title"
                        onClick={() => setIsSelectorUiExpanded(!isSelectorUiExpanded)}
                        style={{ 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none',
                            margin: 0
                        }}
                        title={isSelectorUiExpanded ? "ซ่อนเมนู" : "แสดงเมนู"}
                    >
                        <span style={{ color: menuStyle === 'dual' ? '#64748b' : '#8a94a6', fontSize: '13px', fontWeight: 600 }}>รูปแบบเมนู</span>
                        {isSelectorUiExpanded ? <ChevronDown size={14} style={{ opacity: 0.5, color: menuStyle === 'dual' ? '#64748b' : '#8a94a6' }} /> : <ChevronRight size={14} style={{ opacity: 0.5, color: menuStyle === 'dual' ? '#64748b' : '#8a94a6' }} />}
                    </div>
                    
                    {isSelectorUiExpanded && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div 
                                onClick={() => handleStyleChange({ target: { value: 'classic' } } as any)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                                    background: menuStyle === 'classic' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    color: menuStyle === 'classic' ? '#60a5fa' : (menuStyle === 'dual' ? '#64748b' : '#94a3b8'),
                                    fontWeight: menuStyle === 'classic' ? 600 : 500, fontSize: '13px', transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    if (menuStyle !== 'classic') {
                                        e.currentTarget.style.background = menuStyle === 'dual' ? '#f1f5f9' : 'rgba(255,255,255,0.05)';
                                        e.currentTarget.style.color = menuStyle === 'dual' ? '#1e293b' : '#e2e8f0';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (menuStyle !== 'classic') {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = menuStyle === 'dual' ? '#64748b' : '#94a3b8';
                                    }
                                }}
                            >
                                <LayoutDashboard size={16} />
                                <span>แบบปัจจุบัน (Classic)</span>
                            </div>
                            
                            <div 
                                onClick={() => handleStyleChange({ target: { value: 'dual' } } as any)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                                    background: menuStyle === 'dual' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    color: menuStyle === 'dual' ? '#3b82f6' : (menuStyle === 'classic' ? '#64748b' : '#94a3b8'),
                                    fontWeight: menuStyle === 'dual' ? 600 : 500, fontSize: '13px', transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    if (menuStyle !== 'dual') {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                        e.currentTarget.style.color = '#e2e8f0';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (menuStyle !== 'dual') {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#94a3b8';
                                    }
                                }}
                            >
                                <LayoutTemplate size={16} />
                                <span>แบบที่ 2 (Dual Sidebar)</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- Section 2: เปิดเมนูแอประบบ --- */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: menuStyle === 'dual' ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.05)', paddingTop: '0px' }}>
                    <div 
                        className="sidebar-section-title"
                        onClick={() => setIsSystemAppsMenuExpanded(!isSystemAppsMenuExpanded)}
                        style={{ 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', margin: 0
                        }}
                        title={isSystemAppsMenuExpanded ? "ซ่อนเมนู" : "แสดงเมนู"}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {menuStyle === 'dual' && <Grip size={14} style={{ color: '#64748b' }} />}
                            <span style={{ color: menuStyle === 'dual' ? '#64748b' : '#8a94a6', fontSize: '13px', fontWeight: 600 }}>เปิดเมนูแอประบบ</span>
                        </div>
                        {isSystemAppsMenuExpanded ? <ChevronDown size={14} style={{ opacity: 0.5, color: menuStyle === 'dual' ? '#64748b' : '#8a94a6' }} /> : <ChevronRight size={14} style={{ opacity: 0.5, color: menuStyle === 'dual' ? '#64748b' : '#8a94a6' }} />}
                    </div>

                    {isSystemAppsMenuExpanded && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                            {Object.entries(groupedApps)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([groupName, groupApps]) => (
                                <div key={groupName}>
                                    <div 
                                        onClick={() => setExpandedAppGroup(expandedAppGroup === groupName ? null : groupName)}
                                        style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                                            color: menuStyle === 'dual' ? '#334155' : '#cbd5e1', fontSize: '14px', padding: '8px 10px',
                                            background: expandedAppGroup === groupName ? (menuStyle === 'dual' ? '#f1f5f9' : 'rgba(255,255,255,0.05)') : 'transparent',
                                            borderRadius: '6px'
                                        }}
                                    >
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{groupName}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                            <span style={{ fontSize: '10px', background: menuStyle === 'dual' ? '#e2e8f0' : 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '10px' }}>
                                                {groupApps.length}
                                            </span>
                                            {expandedAppGroup === groupName ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                        </div>
                                    </div>
                                    
                                    {expandedAppGroup === groupName && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '8px', marginTop: '4px', borderLeft: menuStyle === 'dual' ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.1)', marginLeft: '12px', paddingRight: '4px', overflowY: 'auto', maxHeight: '160px' }} className="custom-scrollbar">
                                            {groupApps
                                                .sort((a, b) => (a.seq_no || 99) - (b.seq_no || 99))
                                                .map(app => {
                                                const iconUrl = app.icon_path || app.icon_url || `/apps/${app.app_name?.toLowerCase()}.png`;
                                                const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL ? process.env.NEXT_PUBLIC_CDN_URL.replace(/\/$/, '') : '';
                                                const fullIconUrl = iconUrl.startsWith('http') ? iconUrl : `${cdnUrl}${iconUrl.startsWith('/') ? iconUrl : '/' + iconUrl}`;

                                                return (
                                                <a 
                                                    key={app.id} 
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        // Don't open if this is the current app
                                                        if (currentApp && app.id === currentApp.id) return;
                                                        const targetUrl = app.route_path || app.app_url || app.url;
                                                        if (targetUrl) {
                                                            window.open(targetUrl, '_blank');
                                                        }
                                                    }}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 8px', borderRadius: '6px',
                                                        textDecoration: 'none', color: menuStyle === 'dual' ? '#475569' : '#94a3b8', fontSize: '14px', transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.color = menuStyle === 'dual' ? '#2563eb' : '#fff';
                                                        e.currentTarget.style.background = menuStyle === 'dual' ? '#eff6ff' : 'rgba(255,255,255,0.05)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.color = menuStyle === 'dual' ? '#475569' : '#94a3b8';
                                                        e.currentTarget.style.background = 'transparent';
                                                    }}
                                                >
                                                    <img src={fullIconUrl.replace('.svg', '.png')} alt={app.app_name} style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'contain' }} onError={(e) => {
                                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${app.app_name?.replace('Nex', '')}&background=random&color=fff&size=50&rounded=true&bold=true`;
                                                    }} />
                                                    <span>{app.app_name}</span>
                                                </a>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (menuStyle === 'dual') {
        const isMenuStyleActive = activeDualSection === 'menu-style';
        const activeSectionData = isMenuStyleActive 
            ? { title: 'รูปแบบเมนู', items: [] } as any
            : (activeSections.find(s => s.id === activeDualSection) || activeSections[0]);
        
        return (
            <>
            {/* 260px overall width wrapper to match globals.css (.sidebar) but custom structured for Dual */}
            <aside className={`sidebar ${isOpen ? '' : 'closed'}`} style={{ display: 'flex', flexDirection: 'row', padding: 0, background: 'transparent', borderRight: 'none' }}>
                
                {/* Primary Column (Thin) */}
                <div style={{ 
                    width: '64px', 
                    background: 'var(--sidebar-bg, #1e293b)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    padding: '16px 0',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
                }}>
                    <div 
                        onClick={() => onNavigate('dashboard')}
                        style={{ cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', transition: 'all 0.2s' }}
                        title="หน้าหลัก (Home)"
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        {currentApp?.icon_path ? (
                            <img 
                                src={`${process.env.NEXT_PUBLIC_CDN_URL || ''}${currentApp.icon_path.replace('.svg', '.png')}`} 
                                alt="Home" 
                                style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'contain', background: 'transparent' }} 
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${currentApp.app_name.replace('Nex', '')}&background=random&color=fff&size=80&rounded=true&bold=true`;
                                }}
                            />
                        ) : (
                            <Home size={22} color="white" />
                        )}
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                        {activeSections.map(section => {
                            const isActive = activeDualSection === section.id;
                            return (
                                <div 
                                    key={section.id}
                                    onClick={() => setActiveDualSection(section.id as string)}
                                    title={section.title}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        padding: '12px 0',
                                        cursor: 'pointer',
                                        color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                                        background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                                        borderLeft: isActive ? '3px solid #60a5fa' : '3px solid transparent',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                >
                                    <section.icon size={22} />
                                </div>
                            );
                        })}
                    </div>

                    {/* Bottom Action Icons */}
                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', paddingTop: '16px', paddingBottom: '16px' }}>
                        
                        {/* Menu Style Toggle */}
                        <div 
                            onClick={() => setActiveDualSection('menu-style')}
                            style={{ 
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                padding: '12px 0',
                                cursor: 'pointer',
                                color: isMenuStyleActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                                background: isMenuStyleActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                                borderLeft: isMenuStyleActive ? '3px solid #60a5fa' : '3px solid transparent',
                                transition: 'all 0.2s',
                                position: 'relative'
                            }}
                            title="สลับรูปแบบเมนู (Menu Style)"
                        >
                            <LayoutTemplate size={22} />
                        </div>

                        {/* 9 Dots (App Launcher) */}
                        <div 
                            onClick={() => setIsAppLauncherOpen(!isAppLauncherOpen)}
                            style={{ 
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                padding: '12px 0',
                                cursor: 'pointer',
                                color: isAppLauncherOpen ? '#ffffff' : 'rgba(255,255,255,0.5)',
                                background: isAppLauncherOpen ? 'rgba(255,255,255,0.15)' : 'transparent',
                                borderLeft: isAppLauncherOpen ? '3px solid #60a5fa' : '3px solid transparent',
                                transition: 'all 0.2s',
                                position: 'relative'
                            }}
                            title="เปิดเมนูแอประบบ"
                        >
                            <Grip size={22} />
                        </div>
                    </div>
                </div>

                {/* Secondary Column (Submenu) */}
                <div style={{ 
                    flex: 1, 
                    background: '#ffffff', // White as per second screenshot
                    borderRight: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #f1f5f9' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                            {activeSectionData.title}
                        </h2>
                    </div>
                    
                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                        {isMenuStyleActive ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div
                                    onClick={() => handleStyleChange({ target: { value: 'classic' } } as any)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        background: (menuStyle as string) === 'classic' ? '#eff6ff' : 'transparent',
                                        color: (menuStyle as string) === 'classic' ? '#2563eb' : '#64748b',
                                        fontWeight: (menuStyle as string) === 'classic' ? 600 : 500,
                                        fontSize: '14px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <LayoutDashboard size={18} />
                                    <span>Classic</span>
                                </div>
                                <div
                                    onClick={() => handleStyleChange({ target: { value: 'dual' } } as any)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        background: (menuStyle as string) === 'dual' ? '#eff6ff' : 'transparent',
                                        color: (menuStyle as string) === 'dual' ? '#2563eb' : '#64748b',
                                        fontWeight: (menuStyle as string) === 'dual' ? 600 : 500,
                                        fontSize: '14px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <LayoutTemplate size={18} />
                                    <span>Dual Sidebar</span>
                                </div>
                            </div>
                        ) : (
                            activeSectionData.items.map((item: any) => {
                                const isActive = currentPage === item.id;
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => onNavigate(item.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            background: isActive ? '#eff6ff' : 'transparent',
                                            color: isActive ? '#2563eb' : '#64748b',
                                            fontWeight: isActive ? 600 : 500,
                                            fontSize: 'var(--sidebar-font-size, 14px)',
                                            fontFamily: 'var(--sidebar-font-family, inherit)',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = 'var(--sidebar-item-hover, #f1f5f9)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = 'transparent';
                                            }
                                        }}
                                    >
                                        <item.icon size={18} />
                                        <span>{item.label}</span>
                                        {item.badge && (
                                            <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Removed duplicated select from secondary column since we have an icon in the primary column now */}
                </div>
            </aside>
            <AppLauncherModal isOpen={isAppLauncherOpen} onClose={() => setIsAppLauncherOpen(false)} menuStyle={menuStyle} />
            </>
        );
    }

    // Classic Mode
    return (
        <>
        <aside className={`sidebar ${isOpen ? '' : 'closed'}`} style={{ backgroundColor: 'var(--sidebar-bg, #1e293b)' }}>
            <div className="sidebar-brand">
                <div 
                    className="sidebar-brand-logo" 
                    onClick={() => setIsAppLauncherOpen(true)}
                    style={{ cursor: 'pointer', padding: currentApp?.icon_path ? '4px' : undefined }}
                    title="เปิดเมนูแอประบบ"
                >
                    {currentApp?.icon_path ? (
                        <img 
                            src={`${process.env.NEXT_PUBLIC_CDN_URL || ''}${currentApp.icon_path.replace('.svg', '.png')}`} 
                            alt="App Icon" 
                            style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'contain', background: 'transparent' }} 
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${currentApp.app_name.replace('Nex', '')}&background=random&color=fff&size=50&rounded=true&bold=true`;
                            }}
                        />
                    ) : (
                        <Grip size={18} />
                    )}
                </div>
                {isOpen && (
                    <div className="sidebar-brand-text">
                        <span className="sidebar-brand-name">{currentApp ? currentApp.app_name : 'NexSpeed'}</span>
                        <span className="sidebar-brand-subtitle uppercase" style={{ fontSize: '10px' }}>{currentApp ? currentApp.desc_en : 'TMS'}</span>
                    </div>
                )}
            </div>

            <nav className="sidebar-nav">
                {activeSections.map((section) => {
                    const isExpanded = expandedSections[section.title] !== false; // Default true (expanded)
                    
                    if (!isOpen) {
                        return (
                            <div 
                                key={section.title} 
                                className="sidebar-section" 
                                style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}
                            >
                                <div 
                                    onClick={() => {
                                        // Collapse all other sections, expand this one
                                        const nextExpanded: Record<string, boolean> = {};
                                        activeSections.forEach(s => nextExpanded[s.title] = false);
                                        nextExpanded[section.title] = true;
                                        setExpandedSections(nextExpanded);
                                        
                                        // Open the sidebar
                                        if (onToggleSidebar) onToggleSidebar();
                                    }}
                                    style={{ 
                                        width: '40px', 
                                        height: '40px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        cursor: 'pointer',
                                        borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: '#ffffff',
                                        transition: 'all 0.2s'
                                    }}
                                    title={section.title}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                >
                                    {section.icon ? <section.icon size={22} /> : <span style={{fontSize: '10px'}}>{section.title.substring(0,2)}</span>}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={section.title} className="sidebar-section">
                            <div 
                                className="sidebar-section-title"
                                onClick={() => toggleSection(section.title)}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                                title={isExpanded ? "ซ่อนเมนู" : "แสดงเมนู"}
                            >
                                <span>{section.title}</span>
                                {isExpanded ? <ChevronDown size={14} style={{ opacity: 0.5 }} /> : <ChevronRight size={14} style={{ opacity: 0.5 }} />}
                            </div>
                            
                            {isExpanded && section.items.map((item: any) => (
                                <div
                                    key={item.id}
                                    className={`sidebar-link ${currentPage === item.id ? 'active' : ''}`}
                                    onClick={() => onNavigate(item.id)}
                                >
                                    <item.icon className="sidebar-link-icon" size={20} />
                                    <span>{item.label}</span>
                                    {item.badge && (
                                        <span className="sidebar-link-badge">{item.badge}</span>
                                    )}
                                    {currentPage === item.id && (
                                        <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </nav>

            <div className="sidebar-footer" style={{
                padding: '0px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                marginTop: 'auto',
                display: isOpen ? 'block' : 'none'
            }}>
                <SelectorUI />
            </div>
        </aside>
        
        <AppLauncherModal 
            isOpen={isAppLauncherOpen} 
            onClose={() => setIsAppLauncherOpen(false)} 
            menuStyle={menuStyle}
        />
        </>
    );
}
