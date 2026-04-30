'use client';

import styles from './CallToAction.module.css';
import { useLanguage } from '@/context/LanguageContext';

interface CTAProps {
    title?: string;
    subtitle?: string;
    primaryText?: string;
    primaryLink?: string;
    secondaryText?: string;
    secondaryLink?: string;
    titleColor?: string;
    subtitleColor?: string;
    badgeColor?: string;
    ctaVariant?: 'default' | 'minimal' | 'boxed';
    [key: string]: any;
}

export default function CallToAction({
    title,
    subtitle,
    primaryText,
    primaryLink = '#contact',
    secondaryText,
    secondaryLink = '#portfolio',
    titleColor,
    subtitleColor,
    badgeColor,
    ctaVariant = 'default',
}: CTAProps) {
    const { t, lang } = useLanguage();

    // When lang is not 'th', prefer translations over CMS props
    const resolvedTitle = lang !== 'th'
        ? t('cta.title', title || 'พร้อมเปลี่ยนธุรกิจของคุณ\nให้เติบโตด้วยเทคโนโลยี?')
        : (title || t('cta.title', 'พร้อมเปลี่ยนธุรกิจของคุณ\nให้เติบโตด้วยเทคโนโลยี?'));
    const resolvedSubtitle = lang !== 'th'
        ? t('cta.subtitle', subtitle || 'ทีมผู้เชี่ยวชาญของเราพร้อมรับฟังและออกแบบโซลูชั่นที่เหมาะสมกับองค์กรของคุณ เริ่มต้นด้วยการปรึกษาฟรี ไม่มีข้อผูกมัด')
        : (subtitle || t('cta.subtitle', 'ทีมผู้เชี่ยวชาญของเราพร้อมรับฟังและออกแบบโซลูชั่นที่เหมาะสมกับองค์กรของคุณ เริ่มต้นด้วยการปรึกษาฟรี ไม่มีข้อผูกมัด'));
    const resolvedPrimary = lang !== 'th'
        ? t('cta.primary', primaryText || 'ปรึกษาผู้เชี่ยวชาญฟรี')
        : (primaryText || t('cta.primary', 'ปรึกษาผู้เชี่ยวชาญฟรี'));
    const resolvedSecondary = lang !== 'th'
        ? t('cta.secondary', secondaryText || 'ดูผลงานของเรา')
        : (secondaryText || t('cta.secondary', 'ดูผลงานของเรา'));
    const lines = resolvedTitle.split('\n');

    const variantClass = ctaVariant === 'minimal' ? styles.ctaMinimal : ctaVariant === 'boxed' ? styles.ctaBoxed : '';

    return (
        <section className={`${styles.cta} ${variantClass}`} id="contact">
            {/* Background effects */}
            <div className={styles.bg}>
                <div className={styles.orb1} />
                <div className={styles.orb2} />
                <div className={styles.grid} />
            </div>

            <div className="container">
                <div className={styles.inner}>
                    {/* Icon */}
                    <div className={styles.iconWrap}>
                        <span className={styles.icon}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></span>
                    </div>

                    {/* Heading */}
                    <h2 className={styles.title} style={titleColor ? { color: titleColor } : {}}>
                        {lines[0]}
                        {lines[1] && <><br /><span className={styles.gradient} style={titleColor ? { color: titleColor } : {}}>{lines[1]}</span></>}
                    </h2>

                    <p className={styles.subtitle} style={subtitleColor ? { color: subtitleColor } : {}}>{resolvedSubtitle}</p>

                    {/* Buttons */}
                    <div className={styles.actions}>
                        <a href={primaryLink} className={styles.primaryBtn}>
                            {resolvedPrimary}
                            <span className={styles.arrow}>→</span>
                        </a>
                        <a href={secondaryLink} className={styles.secondaryBtn}>
                            {resolvedSecondary}
                        </a>
                    </div>

                    {/* Trust badges */}
                    <div className={styles.trust}>
                        {[
                            `✓ ${t('cta.trust.free', 'ปรึกษาฟรี ไม่มีเงื่อนไข')}`,
                            `✓ ${t('cta.trust.response', 'ทีมผู้เชี่ยวชาญตอบภายใน 24 ชั่วโมง')}`,
                            `✓ ${t('cta.trust.experience', 'ประสบการณ์กว่า 10 ปี')}`
                        ].map((badge, i) => (
                            <span key={i} className={styles.trustBadge} style={badgeColor ? { color: badgeColor } : {}}>{badge}</span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
