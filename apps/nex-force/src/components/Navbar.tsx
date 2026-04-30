'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import { useLanguage } from '@/context/LanguageContext';
import { API_BASE_URL } from '@/lib/api';

interface NavItem {
    label: string;
    href: string;
}

interface NavbarProps {
    logo?: string;
    logoIcon?: string;
    items?: NavItem[];
    ctaText?: string;
    ctaLink?: string;
    backgroundColor?: string;
    textColor?: string;
    sticky?: boolean;
}


export default function Navbar({
    logo = 'TechBiz Convergence',
    logoIcon = 'TBC',
    ctaText = 'เข้าสู่ระบบ',
    ctaLink = '/contact',
    backgroundColor,
    textColor,
    sticky = true,
}: NavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [dynamicItems, setDynamicItems] = useState<NavItem[] | null>(null);
    const [homeHref, setHomeHref] = useState('/home');
    const [dynamicLogo, setDynamicLogo] = useState<string | null>(null);
    const [dynamicLogoIcon, setDynamicLogoIcon] = useState<string | null>(null);
    const pathname = usePathname();
    const loginRef = useRef<HTMLDivElement>(null);

    const { t } = useLanguage();

    // Translation-aware slug labels
    const slugLabels: Record<string, string> = {
        home: t('nav.home', 'Home'),
        services: t('nav.services', 'Services'),
        about: t('nav.about', 'About Us'),
        careers: t('nav.careers', 'Careers'),
        contact: t('nav.contact', 'Contact'),
        portfolio: t('portfolio.title', 'Portfolio'),
    };

    const defaultItems: NavItem[] = [
        { label: t('nav.home', 'Home'), href: '/home' },
        { label: t('nav.services', 'Services'), href: '/services' },
        { label: t('nav.about', 'About Us'), href: '/about' },
        { label: t('nav.careers', 'Careers'), href: '/careers' },
        { label: t('nav.contact', 'Contact'), href: '/contact' },
    ];

    // Always fetch nav-visible pages from API (ignore hardcoded items prop from layout)
    // Also fetch navbar config (logo, logoIcon) from home page layout
    useEffect(() => {
        fetch(`${API_BASE_URL}/pages/nav-visible?_t=${Date.now()}`, { cache: 'no-store' })
            .then(res => res.json())
            .then((pages: any[]) => {
                if (Array.isArray(pages) && pages.length > 0) {
                    const navItems: NavItem[] = pages.map(p => ({
                        label: p.slug.startsWith('home')
                            ? slugLabels['home'] || 'Home'
                            : (slugLabels[p.slug] || p.title),
                        href: `/${p.slug}`,
                    }));
                    // Sort: home variants always come first
                    navItems.sort((a, b) => {
                        const aIsHome = a.href.startsWith('/home');
                        const bIsHome = b.href.startsWith('/home');
                        if (aIsHome && !bIsHome) return -1;
                        if (!aIsHome && bIsHome) return 1;
                        return 0;
                    });
                    // Track which home version is active for logo link
                    const homeItem = navItems.find(i => i.href.startsWith('/home'));
                    if (homeItem) setHomeHref(homeItem.href);
                    setDynamicItems(navItems);

                    // Fetch logo/logoIcon from the home page's navbar section
                    const homeSlug = homeItem ? homeItem.href.slice(1) : 'home';
                    fetch(`${API_BASE_URL}/pages/slug/${homeSlug}?_t=${Date.now()}`, { cache: 'no-store' })
                        .then(r => r.json())
                        .then((page: any) => {
                            if (page?.layout && Array.isArray(page.layout)) {
                                const navbarSection = page.layout.find((s: any) => s.type === 'navbar');
                                if (navbarSection?.props) {
                                    if (navbarSection.props.logo) setDynamicLogo(navbarSection.props.logo);
                                    if (navbarSection.props.logoIcon) setDynamicLogoIcon(navbarSection.props.logoIcon);
                                }
                            }
                        })
                        .catch(() => { /* use prop defaults */ });
                }
            })
            .catch(() => setDynamicItems(null));
    }, [t]);

    const items = dynamicItems || defaultItems;
    const resolvedLogo = dynamicLogo || logo;
    const resolvedLogoIcon = dynamicLogoIcon || logoIcon;

    useEffect(() => {
        if (!sticky) return;
        const onScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [sticky]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileOpen(false);
        setIsLoginOpen(false);
    }, [pathname]);

    // Close login dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
                setIsLoginOpen(false);
            }
        };
        if (isLoginOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isLoginOpen]);

    const navStyle: React.CSSProperties = {
        ...(backgroundColor ? { '--navbar-bg': backgroundColor } as any : {}),
        ...(textColor ? { '--navbar-text': textColor } as any : {}),
    };

    // Determines if a nav link is the active page
    const isActive = (href: string) => {
        if (href === '/home' && pathname === '/') return true;
        // Any /homeX variant is active when visiting any /homeX path
        if (href.startsWith('/home') && pathname.startsWith('/home')) return true;
        return pathname === href || pathname.startsWith(href + '/');
    };

    return (
        <>
            {/* Spacer so content below fixed navbar is not hidden underneath */}
            {sticky && <div className="navbar-spacer" style={{ height: '68px', flexShrink: 0 }} aria-hidden="true" />}
            <header
                className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''} ${sticky ? styles.sticky : styles.relative}`}
                style={navStyle}
                data-nav-header
            >
                <div className={styles.container}>
                    <nav className={styles.nav}>
                        {/* Logo → goes to active home version */}
                        <Link href={homeHref} className={styles.logo}>
                            <span
                                className={[
                                    styles.logoIcon,
                                    (resolvedLogoIcon && (resolvedLogoIcon.startsWith('data:') || resolvedLogoIcon.startsWith('http') || resolvedLogoIcon.startsWith('/')))
                                        ? styles.logoIconImage
                                        : ''
                                ].filter(Boolean).join(' ')}
                                data-logo-type={
                                    (resolvedLogoIcon && (resolvedLogoIcon.startsWith('data:') || resolvedLogoIcon.startsWith('http') || resolvedLogoIcon.startsWith('/')))
                                        ? 'image'
                                        : 'text'
                                }
                            >
                                {resolvedLogoIcon && (resolvedLogoIcon.startsWith('data:') || resolvedLogoIcon.startsWith('http') || resolvedLogoIcon.startsWith('/'))
                                    ? <img src={resolvedLogoIcon} alt="Logo" style={{ width: 28, height: 28, objectFit: 'contain', display: 'block', background: 'transparent' }} />
                                    : resolvedLogoIcon
                                }
                            </span>
                            <span className={styles.logoText}>{resolvedLogo}</span>
                        </Link>

                        {/* Desktop Links */}
                        <ul className={styles.navLinks} data-nav-links>
                            {items.map((item, i) => (
                                <li key={i}>
                                    <Link
                                        href={item.href}
                                        className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ''}`}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {/* Language Switcher + Login */}
                        <div className={styles.navActions} data-nav-actions ref={loginRef}>
                            {/* Language Toggle */}
                            <LangSwitcher />
                            <button
                                className={styles.ctaBtn}
                                onClick={() => setIsLoginOpen(!isLoginOpen)}
                                aria-expanded={isLoginOpen}
                                aria-label="เข้าสู่ระบบ"
                                type="button"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </button>

                            {/* Login Dropdown */}
                            {isLoginOpen && (
                                <div className={styles.loginDropdown}>
                                    <a
                                        href="https://techbizconvergence.co.th/login"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.loginOption}
                                    >
                                        <span className={styles.loginOptionIcon}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></span>
                                        <div className={styles.loginOptionText}>
                                            <span className={styles.loginOptionTitle}>{t('nav.loginEmployee', 'สำหรับพนักงาน')}</span>
                                            <span className={styles.loginOptionDesc}>{t('nav.loginEmployeeDesc', 'เข้าสู่ระบบภายในองค์กร')}</span>
                                        </div>
                                    </a>
                                    <a
                                        href={process.env.NEXT_PUBLIC_BACKOFFICE_URL || 'https://nex-admin.techbizconvergence.co.th'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.loginOption}
                                    >
                                        <span className={styles.loginOptionIcon}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></span>
                                        <div className={styles.loginOptionText}>
                                            <span className={styles.loginOptionTitle}>{t('nav.loginBackoffice', 'จัดการหน้าเว็บ')}</span>
                                            <span className={styles.loginOptionDesc}>{t('nav.loginBackofficeDesc', 'Backoffice Management')}</span>
                                        </div>
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Hamburger */}
                        <button
                            className={`${styles.hamburgerBtn} ${isMobileOpen ? styles.open : ''}`}
                            onClick={() => setIsMobileOpen(!isMobileOpen)}
                            aria-label="Toggle menu"
                            aria-expanded={isMobileOpen}
                            data-nav-hamburger
                        >
                            <span />
                            <span />
                            <span />
                        </button>
                    </nav>
                </div>
            </header>

            {/* Sidebar Overlay — rendered OUTSIDE header for proper containment in preview frame */}
            {isMobileOpen && (
                <div
                    data-nav-overlay
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Menu — rendered OUTSIDE header for proper containment in preview frame */}
            <div
                data-nav-sidebar
                data-sidebar-open={isMobileOpen ? 'true' : 'false'}
            >
                {/* Close button */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    data-nav-sidebar-close
                    aria-label="Close menu"
                >
                    ✕
                </button>

                <ul data-nav-sidebar-links>
                    {items.map((item, i) => (
                        <li key={i}>
                            <Link
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Language Switcher in sidebar */}
                <div className={styles.sidebarLangRow}>
                    <span className={styles.sidebarLangLabel}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'4px'}}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span>
                    <SidebarLangSwitcher />
                </div>

                {/* Login buttons in sidebar */}
                <div className={styles.sidebarLogin}>
                    <div className={styles.sidebarLoginLabel}>{t('nav.login', 'เข้าสู่ระบบ')}</div>
                    <a
                        href="https://techbizconvergence.co.th/login"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.sidebarLoginBtn}
                        onClick={() => setIsMobileOpen(false)}
                    >
                        <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'3px'}}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></span>
                        <span>{t('nav.loginEmployee', 'สำหรับพนักงาน')}</span>
                    </a>
                    <a
                        href={process.env.NEXT_PUBLIC_BACKOFFICE_URL || 'https://nex-admin.techbizconvergence.co.th'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.sidebarLoginBtnAlt}
                        onClick={() => setIsMobileOpen(false)}
                    >
                        <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'3px'}}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></span>
                        <span>{t('nav.loginBackoffice', 'จัดการหน้าเว็บ')}</span>
                    </a>
                </div>
            </div>
        </>
    );
}

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
    // Fallback: try using the language code as country code directly
    return `https://flagcdn.com/${size}x${Math.round(size * 0.75)}/${langCode.toLowerCase()}.png`;
}

function FlagIcon({ langCode, size = 20 }: { langCode: string; size?: number }) {
    return (
        <img
            src={getFlagUrl(langCode, size * 2)}
            alt={`${langCode} flag`}
            width={size}
            height={Math.round(size * 0.75)}
            className={styles.langFlagImg}
            style={{ objectFit: 'cover', borderRadius: 3, flexShrink: 0 }}
            onError={(e) => {
                // If flag image fails, show a placeholder
                (e.target as HTMLImageElement).style.display = 'none';
            }}
        />
    );
}

// ── Language Switcher Button ──
function LangSwitcher() {
    const { lang, setLang, availableLanguages } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const code = lang.toUpperCase();

    // Simple toggle for 2 languages
    if (availableLanguages.length <= 2) {
        const nextLang = availableLanguages.find(l => l.languageCode !== lang);
        return (
            <button
                className={styles.langSwitcher}
                onClick={() => nextLang && setLang(nextLang.languageCode)}
                aria-label="Switch language"
                title={nextLang ? `Switch to ${nextLang.languageName}` : 'Switch language'}
                type="button"
            >
                <FlagIcon langCode={lang} size={20} />
                <span className={styles.langCode}>{code}</span>
            </button>
        );
    }

    // Dropdown for 3+ languages
    return (
        <div className={styles.langDropdownWrap} ref={dropdownRef}>
            <button
                className={styles.langSwitcher}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Switch language"
                aria-expanded={isOpen}
                type="button"
            >
                <FlagIcon langCode={lang} size={20} />
                <span className={styles.langCode}>{code}</span>
                <span className={styles.langArrow}>▾</span>
            </button>
            {isOpen && (
                <div className={styles.langDropdown}>
                    {availableLanguages.map(l => (
                        <button
                            key={l.languageCode}
                            className={`${styles.langOption} ${l.languageCode === lang ? styles.langOptionActive : ''}`}
                            onClick={() => { setLang(l.languageCode); setIsOpen(false); }}
                            type="button"
                        >
                            <FlagIcon langCode={l.languageCode} size={20} />
                            <span>{l.languageCode.toUpperCase()}</span>
                            <span className={styles.langOptionName}>{l.languageName}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Sidebar Language Switcher (Dropdown) ──
function SidebarLangSwitcher() {
    const { lang, setLang, availableLanguages } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const currentLang = availableLanguages.find(l => l.languageCode === lang);

    return (
        <div className={styles.sidebarLangDropdown}>
            <button
                className={styles.sidebarLangTrigger}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <span className={styles.sidebarLangCurrent}>
                    <FlagIcon langCode={lang} size={20} />
                    <span>{currentLang?.languageName || lang.toUpperCase()}</span>
                </span>
                <span className={`${styles.sidebarLangArrow} ${isOpen ? styles.sidebarLangArrowOpen : ''}`}>▾</span>
            </button>
            {isOpen && (
                <div className={styles.sidebarLangOptions}>
                    {availableLanguages.map(l => (
                        <button
                            key={l.languageCode}
                            className={`${styles.sidebarLangOption} ${l.languageCode === lang ? styles.sidebarLangOptionActive : ''}`}
                            onClick={() => { setLang(l.languageCode); setIsOpen(false); }}
                            type="button"
                        >
                            <FlagIcon langCode={l.languageCode} size={20} />
                            <span>{l.languageName}</span>
                            {l.languageCode === lang && <span className={styles.sidebarLangCheck}>✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
