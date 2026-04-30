'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';
import { useLanguage } from '@/context/LanguageContext';
import PrivacyPolicyModal from './PrivacyPolicyModal';



interface FooterProps {
    companyName?: string;
    description?: string;
    email?: string;
    phone?: string;
    address?: string;
    workHours?: string;
    copyright?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    lineId?: string;
    textColor?: string;
    linkColor?: string;
    copyrightColor?: string;
    [key: string]: any;
}

export default function Footer(props: FooterProps) {
    const year = new Date().getFullYear();
    const { t } = useLanguage();
    const [showPrivacy, setShowPrivacy] = useState(false);

    const companyName = props.companyName || 'TechBiz Convergence';
    const description = props.description || t('footer.description', 'บริษัทที่ปรึกษาด้านเทคโนโลยีชั้นนำ ให้บริการโซลูชั่น IT ครบวงจร');
    const email = props.email || 'hello@techbiz.co.th';
    const phone = props.phone || t('footer.phone', '061-789-4422');
    const address = props.address || t('footer.address', 'กรุงเทพมหานคร, ประเทศไทย');
    const workHours = props.workHours || t('footer.workHours', 'จ-ศ 09:00 – 18:00');
    const copyrightText = props.copyright || `© ${year} ${t('footer.company', 'TechBiz Convergence Co., Ltd.')} ${t('footer.rights', 'สงวนลิขสิทธิ์ทุกประการ')}`;

    // Color customization
    const textColor = props.textColor || undefined;
    const linkColor = props.linkColor || undefined;
    const copyrightColor = props.copyrightColor || undefined;

    // Build social links from props, fallback to defaults
    const socialLinksData = [
        {
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            ),
            href: props.facebook || 'https://www.facebook.com/techbiz2106/', label: 'Facebook',
        },
        {
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
            ),
            href: props.lineId || 'https://line.me/R/ti/p/@674rczub', label: 'LINE',
        },
    ];

    const navLinks = [
        { label: t('nav.home', 'Home'), href: '/home' },
        { label: t('nav.services', 'Services'), href: '/services' },
        { label: t('nav.about', 'About Us'), href: '/about' },
        { label: t('nav.careers', 'Careers'), href: '/careers' },
        { label: t('nav.contact', 'Contact'), href: '/contact' },
    ];

    const services = [
        t('features.cloud.title', 'Cloud Solutions'),
        t('features.ai.title', 'AI & Automation'),
        t('features.security.title', 'Cybersecurity'),
        t('features.consulting.title', 'Data Analytics'),
        t('features.software.title', 'Digital Transformation'),
        t('features.network.title', 'Web & App Development'),
    ];

    return (
        <footer className={styles.footer} style={{
            ...(linkColor ? { '--footer-link-color': linkColor } as React.CSSProperties : {}),
            ...(textColor ? { '--footer-contact-color': textColor } as React.CSSProperties : {}),
        }}>
            <div className="container">
                <div className={styles.content}>
                    {/* Brand column */}
                    <div className={styles.column}>
                        <Link href="/home" className={styles.logo}>
                            <span className={styles.logoIcon}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><circle cx="12" cy="12" r="3"/></svg>
                            </span>
                            <span className={styles.logoText}>{companyName}</span>
                        </Link>
                        <p className={styles.description} style={textColor ? { color: textColor } : {}}>
                            {description}
                        </p>
                        <div className={styles.social}>
                            {socialLinksData.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.socialLink}
                                    aria-label={s.label}
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className={styles.column}>
                        <h3 className={styles.columnTitle} style={linkColor ? { color: linkColor } : {}}>{t('footer.quickLinks', 'เมนู')}</h3>
                        <ul className={styles.links}>
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} style={linkColor ? { color: linkColor } : {}}>{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div className={styles.column}>
                        <h3 className={styles.columnTitle} style={linkColor ? { color: linkColor } : {}}>{t('footer.services', 'บริการ')}</h3>
                        <ul className={styles.links}>
                            {services.map((s, i) => (
                                <li key={i}>
                                    <span style={linkColor ? { color: linkColor } : {}}>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className={styles.column}>
                        <h3 className={styles.columnTitle} style={linkColor ? { color: linkColor } : {}}>{t('footer.contactUs', 'ติดต่อเรา')}</h3>
                        <ul className={styles.links}>
                            <li>
                                <span className={styles.footerContactItem} style={textColor ? { color: textColor } : {}}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                    {address}
                                </span>
                            </li>
                            <li>
                                <span className={styles.footerContactItem} style={textColor ? { color: textColor } : {}}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                    {phone}
                                </span>
                            </li>
                            <li>
                                <span className={styles.footerContactItem} style={textColor ? { color: textColor } : {}}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                    {email}
                                </span>
                            </li>
                            <li>
                                <span className={styles.footerContactItem} style={textColor ? { color: textColor } : {}}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    {workHours}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className={styles.bottom}>
                    <div className={styles.bottomLeft}>
                        <p className={styles.copyright} style={copyrightColor ? { color: copyrightColor } : {}}>
                            {copyrightText}
                        </p>
                    </div>
                    <div className={styles.bottomRight}>
                        <button onClick={() => setShowPrivacy(true)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit', padding: 0 }}>{t('footer.privacy', 'นโยบายความเป็นส่วนตัว')}</button>
                        <span className={styles.separator}>•</span>
                        <a href="#">{t('footer.terms', 'เงื่อนไขการใช้งาน')}</a>
                        <span className={styles.separator}>•</span>
                        <a href="#">Sitemap</a>
                    </div>
                </div>
            </div>
            <PrivacyPolicyModal open={showPrivacy} onClose={() => setShowPrivacy(false)} />
        </footer>
    );
}
