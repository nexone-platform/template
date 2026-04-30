import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import './TopBar.css';

interface TopBarProps {
    sidebarCollapsed: boolean;
    onToggleSidebar: () => void;
    userName?: string;
    userEmail?: string;
    userRole?: string;
    onLogout?: () => void;
}

// Map path → page title keys
const PAGE_TITLE_KEYS: Record<string, { key: string; fallback: string }> = {
    '/': { key: 'bo.nav.dashboard', fallback: 'Dashboard' },
    '/pages': { key: 'bo.nav.pages', fallback: 'Pages' },
    '/page-builder': { key: 'bo.nav.pageBuilder', fallback: 'Page Builder' },
    '/theme': { key: 'bo.nav.theme', fallback: 'Theme' },
    '/translations': { key: 'bo.nav.language', fallback: 'Language' },
    '/analytics': { key: 'bo.nav.analytics', fallback: 'Analytics' },
    '/settings': { key: 'bo.nav.settings', fallback: 'Settings' },
};

// ── Flag Helper: maps language code → country code for flagcdn.com ──
const langToCountryCode: Record<string, string> = {
    th: 'th', en: 'us', ja: 'jp', zh: 'cn', ko: 'kr',
    de: 'de', fr: 'fr', es: 'es', pt: 'br', ru: 'ru',
    it: 'it', vi: 'vn', id: 'id', ms: 'my', ar: 'sa',
    hi: 'in', tr: 'tr', pl: 'pl', nl: 'nl', sv: 'se',
    da: 'dk', fi: 'fi', no: 'no', cs: 'cz', hu: 'hu',
    ro: 'ro', uk: 'ua', el: 'gr', he: 'il', bn: 'bd',
    tl: 'ph', sw: 'ke', my: 'mm', km: 'kh', lo: 'la',
};

function getFlagUrl(langCode: string, size: number = 40): string {
    const country = langToCountryCode[langCode.toLowerCase()];
    if (country) {
        return `https://flagcdn.com/${size}x${Math.round(size * 0.75)}/${country}.png`;
    }
    return `https://flagcdn.com/${size}x${Math.round(size * 0.75)}/${langCode.toLowerCase()}.png`;
}

function FlagIcon({ langCode, size = 18 }: { langCode: string; size?: number }) {
    return (
        <img
            src={getFlagUrl(langCode, size * 2)}
            alt={`${langCode} flag`}
            width={size}
            height={Math.round(size * 0.75)}
            className="lang-flag-img"
            onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
            }}
        />
    );
}

export default function TopBar({
    sidebarCollapsed,
    onToggleSidebar,
    userName = 'Admin User',
    userEmail = 'admin@techbiz.co.th',
    onLogout,
}: TopBarProps) {
    const location = useLocation();
    const { lang, setLang, t, availableLanguages } = useLanguage();
    const { mode, toggleMode } = useTheme();
    const { showToast } = useToast();
    const [langOpen, setLangOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Password form state
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordMsg, setPasswordMsg] = useState('');

    // Refs for click-outside
    const userMenuRef = useRef<HTMLDivElement>(null);
    const langMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
            if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) setLangOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Resolve page title with translation
    const titleEntry = PAGE_TITLE_KEYS[location.pathname]
        || (location.pathname.startsWith('/builder') ? { key: 'bo.nav.pageBuilder', fallback: 'Page Builder' } : { key: '', fallback: 'Backoffice' });
    const pageTitle = titleEntry.key ? t(titleEntry.key, titleEntry.fallback) : titleEntry.fallback;

    // Avatar initials from name
    const initials = userName
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const handlePasswordChange = () => {
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setPasswordMsg('กรุณากรอกข้อมูลให้ครบ');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordMsg('รหัสผ่านใหม่ไม่ตรงกัน');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            setPasswordMsg('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }
        showToast('เปลี่ยนรหัสผ่านสำเร็จ', 'success');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordMsg('');
        setShowPasswordModal(false);
    };

    return (
        <>
        <header className="topbar">
            {/* Left group */}
            <div className="topbar-left">
                <button
                    className={`topbar-toggle ${sidebarCollapsed ? 'toggled' : ''}`}
                    onClick={onToggleSidebar}
                    title={sidebarCollapsed ? 'ขยาย Sidebar' : 'ย่อ Sidebar'}
                    aria-label="Toggle sidebar"
                >
                    <span className="toggle-bar" />
                    <span className="toggle-bar" />
                    <span className="toggle-bar" />
                </button>

                <div className="topbar-breadcrumb">
                    <span className="breadcrumb-app">TechBiz CMS</span>
                    <span className="breadcrumb-sep">›</span>
                    <span className="breadcrumb-page">{pageTitle}</span>
                </div>
            </div>

            {/* Right group */}
            <div className="topbar-right">
                {/* Theme toggle */}
                <button
                    className={`topbar-icon-btn topbar-theme-toggle theme-${mode}`}
                    onClick={toggleMode}
                    title={mode === 'light' ? 'Light — คลิกเพื่อเปลี่ยนเป็นธีมเข้ม' : mode === 'dark' ? 'Dark — คลิกเพื่อเปลี่ยนเป็นธีมถนอมสายตา' : 'Comfort — คลิกเพื่อเปลี่ยนเป็นธีมสว่าง'}
                >
                    {mode === 'light' ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" />
                            <line x1="21" y1="12" x2="23" y2="12" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                    ) : mode === 'dark' ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    )}
                    <span className="theme-dot" />
                </button>

                {/* Language switcher */}
                <div className="topbar-lang-wrap" ref={langMenuRef}>
                    <button
                        className="topbar-lang-btn"
                        onClick={() => setLangOpen(!langOpen)}
                        title={t('bo.switchLang', 'เปลี่ยนภาษา')}
                    >
                        <FlagIcon langCode={lang} size={18} />
                        <span className="lang-code">{lang.toUpperCase()}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>
                    {langOpen && (
                        <div className="topbar-lang-dropdown">
                            {availableLanguages.map((l) => (
                                <button
                                    key={l.languageCode}
                                    className={`topbar-lang-option ${lang === l.languageCode ? 'active' : ''}`}
                                    onClick={() => { setLang(l.languageCode); setLangOpen(false); }}
                                >
                                    <FlagIcon langCode={l.languageCode} size={18} />
                                    <span>{l.languageName}</span>
                                    {lang === l.languageCode && (
                                        <svg className="lang-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="topbar-divider" />

                {/* User dropdown */}
                <div className="topbar-user-wrap" ref={userMenuRef}>
                    <button className="topbar-user" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                        <div className="topbar-avatar" title={userEmail}>
                            {initials}
                        </div>
                        <span className="topbar-username">{userName}</span>
                        <svg className={`topbar-user-chevron ${userMenuOpen ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>

                    {userMenuOpen && (
                        <div className="topbar-user-dropdown">
                            <button
                                className="topbar-user-menu-item"
                                onClick={() => { setUserMenuOpen(false); setShowPasswordModal(true); setPasswordMsg(''); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                Change Password
                            </button>
                            <div className="topbar-user-menu-divider" />
                            <button className="topbar-user-menu-item topbar-user-menu-logout" onClick={onLogout}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>

        {/* ── Change Password Modal ── */}
        {showPasswordModal && (
            <div className="password-modal-overlay" onClick={() => setShowPasswordModal(false)}>
                <div className="password-modal" onClick={e => e.stopPropagation()}>
                    <div className="password-modal-header">
                        <h3>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            Change Password
                        </h3>
                        <button className="password-modal-close" onClick={() => setShowPasswordModal(false)}>✕</button>
                    </div>
                    <div className="password-modal-body">
                        <div className="password-modal-field">
                            <label>รหัสผ่านปัจจุบัน</label>
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                placeholder="กรอกรหัสผ่านปัจจุบัน"
                            />
                        </div>
                        <div className="password-modal-field">
                            <label>รหัสผ่านใหม่</label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                placeholder="อย่างน้อย 6 ตัวอักษร"
                            />
                        </div>
                        <div className="password-modal-field">
                            <label>ยืนยันรหัสผ่านใหม่</label>
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                            />
                        </div>
                        {passwordMsg && (
                            <div className={`password-modal-msg ${passwordMsg.startsWith('success:') ? 'msg-success' : 'msg-error'}`}>
                                {passwordMsg.replace('success:', '')}
                            </div>
                        )}
                    </div>
                    <div className="password-modal-footer">
                        <button className="btn-modal-cancel" onClick={() => setShowPasswordModal(false)}>ยกเลิก</button>
                        <button className="btn-modal-save" onClick={handlePasswordChange}>บันทึกรหัสผ่าน</button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}
