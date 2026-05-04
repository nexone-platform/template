import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import useAuthStore from '../store/useAuthStore';
import { AppLauncherModal } from '@nexone/ui';
import { ChevronDown, ChevronRight, LayoutDashboard, LayoutTemplate } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
    collapsed: boolean;
}

interface MenuItem {
    menu_id: number | string;
    title: string;
    route: string | null;
    icon?: string | null;
    materialicons?: string | null;
    page_key?: string | null;
    menu_seq?: number;
    is_active: boolean;
    parent_id?: string | null;
    app_name?: string;
}

interface MenuItemWithChildren extends MenuItem {
    children: MenuItemWithChildren[];
}

/* ── SVG Icons ── */
const Icons = {
    logo: (
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
            <path d="M8 12h6v2H8v-2Zm0 4h10v2H8v-2Zm0 4h8v2H8v-2Z" fill="rgba(255,255,255,0.5)" />
            <path d="M20 10l4 6-4 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <defs><linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32"><stop stopColor="#6366f1" /><stop offset="1" stopColor="#a855f7" /></linearGradient></defs>
        </svg>
    ),
    default: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
        </svg>
    ),
    dashboard: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    ),
    pages: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
    ),
    theme: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="10.5" r="2.5" />
            <circle cx="8.5" cy="7.5" r="2.5" /><circle cx="6.5" cy="12.5" r="2.5" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.8 1.7-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.8-1.7 1.7-1.7H17c3.1 0 5.6-2.5 5.6-5.6C22.6 5.7 18 2 12 2z" />
        </svg>
    ),
    translations: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    ),
    settings: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
};

/** Map materialicons/icon field → SVG icon */
function resolveIcon(item: MenuItem): React.ReactNode {
    const key = (item.materialicons || item.icon || '').toLowerCase();
    if (key.includes('dashboard') || key.includes('home')) return Icons.dashboard;
    if (key.includes('pages') || key.includes('article') || key.includes('description')) return Icons.pages;
    if (key.includes('palette') || key.includes('theme') || key.includes('color')) return Icons.theme;
    if (key.includes('translate') || key.includes('language') || key.includes('globe')) return Icons.translations;
    if (key.includes('settings') || key.includes('gear') || key.includes('tune')) return Icons.settings;
    return Icons.default;
}

/** Fallback static menu ถ้า API ไม่ตอบสนอง */
const FALLBACK_ITEMS: MenuItem[] = [
    { menu_id: 1, title: 'Dashboard', route: '/', page_key: 'dashboard', is_active: true, materialicons: 'dashboard' },
    { menu_id: 2, title: 'Pages', route: '/pages', page_key: 'pages', is_active: true, materialicons: 'pages' },
    { menu_id: 3, title: 'Theme', route: '/theme', page_key: 'theme', is_active: true, materialicons: 'palette' },
    { menu_id: 4, title: 'Language', route: '/translations', page_key: 'translations', is_active: true, materialicons: 'translate' },
    { menu_id: 5, title: 'Settings', route: '/settings', page_key: 'settings', is_active: true, materialicons: 'settings' },
];

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function Sidebar({ collapsed }: SidebarProps) {
    const { t } = useLanguage();
    const user = useAuthStore((s) => s.user);
    const allowedPages = user?.allowedPages || ['dashboard', 'pages', 'builder', 'theme', 'translations', 'analytics', 'settings'];
    const isAdmin = user?.role === 'admin';
    const location = useLocation();
    const navigate = useNavigate();

    const [isAppLauncherOpen, setIsAppLauncherOpen] = useState(false);
    const [isSelectorUiExpanded, setIsSelectorUiExpanded] = useState(true);
    const [menuStyle, setMenuStyle] = useState(() => localStorage.getItem('nexone_menu_style') || 'classic');
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [menuLoading, setMenuLoading] = useState(true);
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

    const toggleExpand = (id: string | number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setExpandedMenus(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // ดึงเมนูจากตาราง menus โดย filter app_name=nex-site
    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const res = await fetch(`${API_BASE}/menus?app_name=nex-site`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data: MenuItem[] = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setMenuItems(data.filter(m => m.is_active));
                } else {
                    setMenuItems(FALLBACK_ITEMS);
                }
            } catch (err) {
                console.warn('[Sidebar] Falling back to static menu:', err);
                setMenuItems(FALLBACK_ITEMS);
            } finally {
                setMenuLoading(false);
            }
        };
        fetchMenus();
    }, []);

    useEffect(() => {
        const handleStorage = () => {
            const style = localStorage.getItem('nexone_menu_style') || 'classic';
            setMenuStyle(style);
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Admin เห็นทุกเมนู / User เห็นเฉพาะ allowedPages
    const visibleItems = isAdmin
        ? menuItems
        : menuItems.filter(item => !item.page_key || allowedPages.includes(item.page_key));

    const buildTree = (items: MenuItem[]): MenuItemWithChildren[] => {
        const map = new Map<string | number, MenuItemWithChildren>();
        items.forEach(item => map.set(item.menu_id, { ...item, children: [] }));
        
        const tree: MenuItemWithChildren[] = [];
        
        items.forEach(item => {
            if (item.parent_id && map.has(item.parent_id)) {
                map.get(item.parent_id)!.children.push(map.get(item.menu_id)!);
            } else {
                tree.push(map.get(item.menu_id)!);
            }
        });
        
        // Sort by menu_seq
        const sortTree = (nodes: MenuItemWithChildren[]) => {
            nodes.sort((a, b) => (a.menu_seq || 0) - (b.menu_seq || 0));
            nodes.forEach(node => sortTree(node.children));
        };
        sortTree(tree);
        
        return tree;
    };

    const treeData = buildTree(visibleItems);

    const renderMenuItem = (item: MenuItemWithChildren, depth = 0) => {
        const isSection = !item.parent_id && !item.route && !item.icon && !item.materialicons;
        const hasChildren = item.children && item.children.length > 0;
        const safeId = item.menu_id ? item.menu_id.toString() : Math.random().toString();
        const isExpanded = !!expandedMenus[safeId];

        if (isSection) {
            return (
                <div key={safeId} className="sidebar-section-heading" style={{
                    padding: collapsed ? '12px 0' : '16px 16px 8px 16px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: collapsed ? 'center' : 'left'
                }}>
                    {!collapsed ? item.title : '—'}
                </div>
            );
        }

        const icon = resolveIcon(item);

        if (hasChildren) {
            return (
                <div key={safeId} className="nav-group">
                    <div 
                        className={`nav-item nav-parent ${isExpanded ? 'expanded' : ''}`}
                        onClick={(e) => toggleExpand(safeId, e)}
                        style={{ cursor: 'pointer', paddingLeft: depth === 0 ? undefined : `${(depth * 12) + 12}px` }}
                    >
                        <span className="nav-icon">{icon}</span>
                        {!collapsed && (
                            <>
                                <span className="nav-text">{item.title}</span>
                                <span className="nav-arrow" style={{ 
                                    marginLeft: 'auto', 
                                    transition: 'transform 0.2s',
                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                                }}>
                                    <ChevronDown size={16} />
                                </span>
                            </>
                        )}
                    </div>
                    {isExpanded && !collapsed && (
                        <div className="nav-children" style={{ marginLeft: depth === 0 ? '12px' : '0' }}>
                            {item.children.map(child => renderMenuItem(child, depth + 1))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <NavLink
                key={safeId}
                to={item.route || '#'}
                end={item.route === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? item.title : undefined}
                onClick={(e) => {
                    if (!item.route) e.preventDefault();
                    else handleNavClick(e, item.route);
                }}
                style={{ paddingLeft: depth === 0 ? undefined : `${(depth * 12) + 12}px` }}
            >
                <span className="nav-icon">{icon}</span>
                {!collapsed && <span className="nav-text">{item.title}</span>}
            </NavLink>
        );
    };

    const handleNavClick = (e: React.MouseEvent, itemTo: string) => {
        const isCurrentPage = itemTo === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(itemTo);
        if (isCurrentPage) {
            e.preventDefault();
            navigate(itemTo, { replace: true });
            window.dispatchEvent(new CustomEvent('sidebar-reload'));
        }
    };

    return (
        <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Logo */}
            <NavLink to="/" className="sidebar-header sidebar-logo-link">
                <div className="logo">
                    <span className="logo-icon">{Icons.logo}</span>
                    {!collapsed && <span className="logo-text">Backoffice</span>}
                </div>
            </NavLink>

            {/* Navigation — ดึงจาก DB */}
            <nav className="sidebar-nav">
                {menuLoading ? (
                    <div style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
                        Loading...
                    </div>
                ) : (
                    treeData.map((item) => renderMenuItem(item))
                )}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Section 1: รูปแบบเมนู */}
                {!collapsed && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div
                            onClick={() => setIsSelectorUiExpanded(!isSelectorUiExpanded)}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', margin: 0 }}
                            title={isSelectorUiExpanded ? 'ซ่อนเมนู' : 'แสดงเมนู'}
                        >
                            <span style={{ color: menuStyle === 'dual' ? '#64748b' : '#8a94a6', fontSize: '13px', fontWeight: 600 }}>รูปแบบเมนู</span>
                            {isSelectorUiExpanded
                                ? <ChevronDown size={14} style={{ opacity: 0.5, color: menuStyle === 'dual' ? '#64748b' : '#8a94a6' }} />
                                : <ChevronRight size={14} style={{ opacity: 0.5, color: menuStyle === 'dual' ? '#64748b' : '#8a94a6' }} />}
                        </div>

                        {isSelectorUiExpanded && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {[
                                    { key: 'classic', label: 'แบบปัจจุบัน (Classic)', Icon: LayoutDashboard },
                                    { key: 'dual', label: 'แบบที่ 2 (Dual Sidebar)', Icon: LayoutTemplate },
                                ].map(({ key, label, Icon }) => (
                                    <div
                                        key={key}
                                        onClick={() => {
                                            setMenuStyle(key);
                                            localStorage.setItem('nexone_menu_style', key);
                                            window.dispatchEvent(new Event('storage'));
                                        }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                                            background: menuStyle === key ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                            color: menuStyle === key ? '#3b82f6' : '#94a3b8',
                                            fontWeight: menuStyle === key ? 600 : 500, fontSize: '13px', transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (menuStyle !== key) {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                                e.currentTarget.style.color = '#e2e8f0';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (menuStyle !== key) {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = '#94a3b8';
                                            }
                                        }}
                                    >
                                        <Icon size={16} />
                                        <span>{label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Section 2: เปิดเมนูแอประบบ */}
                {!collapsed && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                        <div
                            onClick={() => setIsAppLauncherOpen(true)}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', margin: 0 }}
                            title="เปิดใช้งาน App Launcher"
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#8a94a6', fontSize: '13px', fontWeight: 600 }}>เปิดเมนูแอประบบ</span>
                            </div>
                            <ChevronDown size={14} style={{ opacity: 0.5, color: '#8a94a6' }} />
                        </div>
                    </div>
                )}

                {collapsed && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                        <div onClick={() => setIsSelectorUiExpanded(!isSelectorUiExpanded)} style={{ color: '#94a3b8', cursor: 'pointer' }} title="รูปแบบเมนู">
                            {menuStyle === 'classic' ? <LayoutDashboard size={20} /> : <LayoutTemplate size={20} />}
                        </div>
                        <div onClick={() => setIsAppLauncherOpen(true)} style={{ color: '#94a3b8', cursor: 'pointer' }} title="เปิดเมนูแอประบบ">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            <AppLauncherModal
                isOpen={isAppLauncherOpen}
                onClose={() => setIsAppLauncherOpen(false)}
                menuStyle={menuStyle}
                currentAppName="nex-site"
            />
        </aside>
    );
}
