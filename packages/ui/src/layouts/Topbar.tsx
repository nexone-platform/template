'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Moon, Sun, LogOut, X, Eye, EyeOff, Menu, Globe, User } from 'lucide-react';

import { useLanguage } from '../contexts/LanguageContext';

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────
export interface Notification {
    id: number;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: string;
    icon: string;
}

interface Language {
    id: number;
    languageCode: string;
    languageName: string;
    isActive: boolean;
}

interface TopbarProps {
    pageTitle: string;
    pageSubtitle?: string;
    breadcrumb?: string[];
    actions?: React.ReactNode;
    user?: { id: number; username: string; name: string; email: string; role: string; avatar: string; } | null;
    onLogout?: () => void;
    onToggleSidebar?: () => void;
    coreApiUrl?: string;
    systemConfig?: any;
}

// ──────────────────────────────────────────
// Constants
// ──────────────────────────────────────────
const topbarT = {
    th: {
        menu: 'เมนู',
        language: 'ภาษา',
        lightMode: 'โหมดสว่าง',
        darkMode: 'โหมดกลางคืน',
        notifications: 'การแจ้งเตือน',
        noNotifications: 'ไม่มีการแจ้งเตือน',
        userProfile: 'โปรไฟล์',
        user: 'ผู้ใช้งาน',
        admin: 'ผู้ดูแลระบบ',
        changePassword: 'เปลี่ยนรหัสผ่าน',
        logout: 'ออกจากระบบ',
        cancel: 'ยกเลิก',
        save: 'บันทึก',
        oldPassword: 'รหัสผ่านปัจจุบัน',
        newPassword: 'รหัสผ่านใหม่',
        confirmPassword: 'ยืนยันรหัสผ่านใหม่',
        passChangeSuccess: 'จำลองการเปลี่ยนรหัสผ่านสำเร็จ',
    },
    en: {
        menu: 'Menu',
        language: 'Language',
        lightMode: 'Light Mode',
        darkMode: 'Dark Mode',
        notifications: 'Notifications',
        noNotifications: 'No notifications',
        userProfile: 'Profile',
        user: 'User',
        admin: 'Administrator',
        changePassword: 'Change Password',
        logout: 'Logout',
        cancel: 'Cancel',
        save: 'Save',
        oldPassword: 'Current Password',
        newPassword: 'New Password',
        confirmPassword: 'Confirm Password',
        passChangeSuccess: 'Simulated password change success',
    }
};

/** Map language code → ISO 3166-1 alpha-2 country code */
const LANG_TO_COUNTRY: Record<string, string> = {
    th: 'th', en: 'gb', ja: 'jp', zh: 'cn', ko: 'kr',
    fr: 'fr', de: 'de', es: 'es', ms: 'my', vi: 'vn',
    id: 'id', ar: 'sa', pt: 'br', ru: 'ru', tr: 'tr', hi: 'in',
};

/** Renders a country flag using flag-icons CSS (SVG-based, works on all OS) */
function FlagImg({ code, size = 22 }: { code: string; size?: number }) {
    const country = LANG_TO_COUNTRY[code];
    if (!country) return <Globe size={size - 4} color="#94a3b8" />;
    return (
        <span
            className={`fi fi-${country}`}
            style={{
                fontSize: `${size}px`,
                width: `${Math.round(size * 1.33)}px`,
                height: `${size}px`,
                borderRadius: '2px',
                display: 'inline-block',
                backgroundSize: 'cover',
            }}
        />
    );
}

const CORE_API_URL =
    typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? `http://${window.location.hostname}:8101/api`
        : 'http://localhost:8101/api';

// ──────────────────────────────────────────
// Component
// ──────────────────────────────────────────
export default function Topbar({
    pageTitle,
    breadcrumb,
    actions,
    user,
    onLogout,
    onToggleSidebar,
    coreApiUrl,
    systemConfig,
}: TopbarProps) {
    const { lang, setLang } = useLanguage();

    // Inject flag-icons CSS once
    useEffect(() => {
        const id = 'flag-icons-css';
        if (!document.getElementById(id)) {
            const link = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/css/flag-icons.min.css';
            document.head.appendChild(link);
        }
    }, []);

    // Theme
    const [theme, setTheme] = useState<'dark' | 'light'>('light');

    useEffect(() => {
        const saved = localStorage.getItem('nexspeed-theme') as 'dark' | 'light';
        const resolved = saved === 'dark' ? 'dark' : 'light';
        setTheme(resolved);
        document.documentElement.setAttribute('data-theme', resolved);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('nexspeed-theme', next);
    };

    // Notifications
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications] = useState<Notification[]>([]);
    const [unreadCount] = useState(0);
    const notifRef = useRef<HTMLDivElement>(null);

    // User menu
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Change-password modal
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [pwdOld, setPwdOld] = useState('');
    const [pwdNew, setPwdNew] = useState('');
    const [pwdConfirm, setPwdConfirm] = useState('');
    const [showPwdOld, setShowPwdOld] = useState(false);
    const [showPwdNew, setShowPwdNew] = useState(false);
    const [showPwdConfirm, setShowPwdConfirm] = useState(false);

    // Language switcher
    const [languages, setLanguages] = useState<Language[]>([]);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const langMenuRef = useRef<HTMLDivElement>(null);

    // Fetch active languages from nex_core.languages via core-api
    useEffect(() => {
        const load = async () => {
            try {
                const apiUrl = coreApiUrl || CORE_API_URL;
                const res = await fetch(`${apiUrl}/translations/languages/active`);
                if (!res.ok) return;
                const json = await res.json();
                const list: Language[] = Array.isArray(json) ? json : (json.data ?? []);
                setLanguages(list);
            } catch {
                // API not available – language switcher stays hidden
            }
        };
        load();
    }, []);

    const selectLang = (newLang: Language) => {
        setLang(newLang.languageCode);
        setShowLangMenu(false);
    };

    const currentLang = languages.find(l => l.languageCode === lang) || languages[0] || null;

    // Close all dropdowns on outside click
    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
            if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) setShowLangMenu(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, []);

    const langCode = lang;
    const t = topbarT[langCode as keyof typeof topbarT] || topbarT.en;

    // ──────────────────────────────────────────
    // Render
    // ──────────────────────────────────────────
    return (
        <header className="topbar" style={{ position: 'relative' }}>
            {/* LEFT */}
            <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {onToggleSidebar && (
                    <button
                        type="button"
                        onClick={onToggleSidebar}
                        className="topbar-icon-btn"
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                        title={t.menu}
                    >
                        <Menu size={20} />
                    </button>
                )}
                {breadcrumb && breadcrumb.length > 0 && (
                    <div className="topbar-breadcrumb" style={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>
                        {breadcrumb.map((item, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && <span style={{ margin: '0 8px', color: 'var(--topbar-text-color, rgba(255,255,255,0.4))' }}>/</span>}
                                <span style={{ color: i === breadcrumb.length - 1 ? 'var(--topbar-text-color, #ffffff)' : 'var(--topbar-text-color, rgba(255,255,255,0.7))', transition: 'color 0.2s' }}>{item}</span>
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>

            {/* CENTRE title removed as per request */}

            {/* RIGHT */}
            <div className="topbar-right">
                {systemConfig?.showTenantName && systemConfig?.tenantNameDisplayPosition === 'TOP_HEADER_RIGHT' && systemConfig?.tenantName && (
                    <div style={{ marginRight: '16px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--topbar-text-color, #ffffff)', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
                            Workspace: {systemConfig.tenantName}
                        </span>
                    </div>
                )}
                {actions && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '12px' }}>{actions}</div>}

                {/* ── Language Switcher ── */}
                {languages.length > 0 && (
                    <div ref={langMenuRef} style={{ position: 'relative' }}>
                        <button
                            className="topbar-icon-btn"
                            title={`${t.language}: ${currentLang?.languageName ?? ''}`}
                            onClick={() => setShowLangMenu(v => !v)}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '40px', height: '40px', borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'transparent',
                                cursor: 'pointer', padding: 0,
                            }}
                        >
                            {currentLang
                                ? <FlagImg code={currentLang.languageCode} size={24} />
                                : <Globe size={16} color="var(--topbar-text-color, #94a3b8)" />}
                        </button>

                        {showLangMenu && (
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                                background: 'var(--bg-sidebar)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                                minWidth: '60px', zIndex: 200, padding: '6px',
                                display: 'flex', flexDirection: 'column', gap: '2px',
                            }}>
                                {languages.map(lang => {
                                    const active = currentLang?.id === lang.id;
                                    return (
                                        <button
                                            key={lang.id}
                                            onClick={() => selectLang(lang)}
                                            title={lang.languageName}
                                            style={{
                                                width: '100%',
                                                padding: '6px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: active ? 'rgba(59,130,246,0.25)' : 'transparent',
                                                border: active ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                                            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <FlagImg code={lang.languageCode} size={24} />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Theme Toggle ── */}
                <button className="topbar-icon-btn" title={theme === 'dark' ? t.lightMode : t.darkMode} onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* ── Notifications ── */}
                <div ref={notifRef} style={{ position: 'relative' }}>
                    <button className="topbar-icon-btn" title={t.notifications} onClick={() => setShowNotifications(v => !v)}>
                        <Bell size={18} />
                        {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
                    </button>

                    {showNotifications && (
                        <div className="notification-dropdown">
                            <div className="notification-header">
                                <h3>🔔 {t.notifications}</h3>
                                <button className="notification-close" onClick={() => setShowNotifications(false)}><X size={16} /></button>
                            </div>
                            <div className="notification-list">
                                {notifications.length === 0 ? (
                                    <div className="notification-empty">{t.noNotifications}</div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                                            <span className="notification-icon">{n.icon}</span>
                                            <div className="notification-content">
                                                <div className="notification-title">{n.title}</div>
                                                <div className="notification-message">{n.message}</div>
                                                <div className="notification-time">{n.time}</div>
                                            </div>
                                            {!n.read && <span className="notification-unread-dot" />}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── User Avatar ── */}
                <div ref={userMenuRef} style={{ position: 'relative' }}>
                    <button
                        className="topbar-icon-btn"
                        title={user?.name ?? t.user}
                        style={{ overflow: 'hidden', padding: 0 }}
                        onClick={() => setShowUserMenu(v => !v)}
                    >
                        {user?.avatar ? (
                            <img src={user.avatar} alt="UserProfile" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
                        ) : (
                            <User size={20} />
                        )}
                    </button>

                    {user && showUserMenu && (
                        <div className="user-dropdown" style={{
                            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                            borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            minWidth: '150px', zIndex: 100, overflow: 'hidden',
                        }}>
                            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ fontWeight: 600, fontSize: '14px' }}>{user.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.role || t.admin}</div>
                            </div>
                            <div style={{ padding: '4px 0' }}>
                                <button style={{ width: '100%', textAlign: 'left', padding: '8px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13.5px', color: 'var(--text-primary)' }}>
                                    {t.user}
                                </button>
                                <button
                                    style={{ width: '100%', textAlign: 'left', padding: '8px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13.5px', color: 'var(--text-primary)' }}
                                    onClick={() => { setShowUserMenu(false); setShowPasswordModal(true); }}
                                >
                                    {t.changePassword}
                                </button>
                                <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
                                <button
                                    style={{ width: '100%', textAlign: 'left', padding: '8px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13.5px', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    onClick={onLogout}
                                >
                                    <LogOut size={16} /> {t.logout}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Change Password Modal ── */}
            {showPasswordModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '8px', minWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '18px' }}>{t.changePassword}</h2>
                            <button onClick={() => setShowPasswordModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { label: t.oldPassword, val: pwdOld, setVal: setPwdOld, show: showPwdOld, setShow: setShowPwdOld },
                                { label: t.newPassword, val: pwdNew, setVal: setPwdNew, show: showPwdNew, setShow: setShowPwdNew },
                                { label: t.confirmPassword, val: pwdConfirm, setVal: setPwdConfirm, show: showPwdConfirm, setShow: setShowPwdConfirm },
                            ].map(({ label, val, setVal, show, setShow }) => (
                                <div key={label}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>{label}</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={show ? 'text' : 'password'}
                                            value={val}
                                            onChange={e => setVal(e.target.value)}
                                            style={{ width: '100%', padding: '8px 12px', paddingRight: '40px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                                        />
                                        <button
                                            onClick={() => setShow(!show)}
                                            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                        >
                                            {show ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                            <button onClick={() => setShowPasswordModal(false)} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>
                                {t.cancel}
                            </button>
                            <button
                                onClick={() => { alert(t.passChangeSuccess); setShowPasswordModal(false); }}
                                style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: 'var(--accent-blue)', color: '#fff', cursor: 'pointer' }}
                            >
                                {t.save}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
