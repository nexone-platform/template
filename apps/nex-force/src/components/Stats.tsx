'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Stats.module.css';
import { useLanguage } from '@/context/LanguageContext';

interface StatItem {
    number: number;
    suffix: string;
    label: string;
    icon: React.ReactNode;
}

interface StatsProps {
    statsItems?: Array<{ label: string; value: string; suffix?: string }>;
    whyBadge?: string;
    whyHeading?: string;
    whyHeadingGradient?: string;
    whyItems?: Array<{ title: string; desc: string }>;
    titleColor?: string;
    textColor?: string;
    statValueColor?: string;
    statLabelColor?: string;
    [key: string]: any;
}

// Simple counter animation hook
function useCounter(target: number, duration = 2000, started = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!started) return;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [started, target, duration]);
    return count;
}

function StatCard({ number, suffix, label, icon, started, valueColor, labelColor }: StatItem & { started: boolean; valueColor?: string; labelColor?: string }) {
    const count = useCounter(number, 1800, started);
    return (
        <div className={styles.statCard}>
            <div className={styles.statIcon}>{icon}</div>
            <div className={styles.statNumber} style={valueColor ? { color: valueColor, WebkitTextFillColor: valueColor, background: 'none' } : {}}>
                {count}{suffix}
            </div>
            <div className={styles.statLabel} style={labelColor ? { color: labelColor } : {}}>{label}</div>
        </div>
    );
}

// Default SVG icons for stats
const defaultStatIcons = [
    <svg key="i0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    <svg key="i1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    <svg key="i2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
    <svg key="i3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
];

// Default SVG icons for Why Us cards
const defaultWhyIcons = [
    <svg key="w0" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    <svg key="w1" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    <svg key="w2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
    <svg key="w3" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>,
];

export default function Stats(props: StatsProps) {
    const [started, setStarted] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { t } = useLanguage();

    // Use props from page builder if available, otherwise use defaults with translation
    const defaultStats = [
        { number: 200, suffix: '+', label: t('stats.projects', 'โปรเจกต์ที่ส่งมอบ'), icon: defaultStatIcons[0] },
        { number: 98, suffix: '%', label: t('stats.clients', 'ลูกค้าพึงพอใจ'), icon: defaultStatIcons[1] },
        { number: 10, suffix: '+', label: t('stats.years', 'ปีประสบการณ์'), icon: defaultStatIcons[2] },
        { number: 50, suffix: '+', label: t('stats.team', 'ผู้เชี่ยวชาญในทีม'), icon: defaultStatIcons[3] },
    ];

    const stats: StatItem[] = props.statsItems
        ? props.statsItems.map((item, i) => ({
            number: parseInt(item.value) || 0,
            suffix: item.suffix || '',
            label: t(`stats.card_${i}.label`, item.label),
            icon: defaultStatIcons[i % defaultStatIcons.length],
        }))
        : defaultStats;

    // Why Us data — from props or defaults
    const badgeText = props.whyBadge || t('stats.title', 'Why TechBiz Convergence');
    const headingLine1 = props.whyHeading || t('stats.whyHeading', 'ทำไมองค์กรชั้นนำ');
    const headingLine2 = props.whyHeadingGradient || t('stats.whyHeadingGradient', 'เลือกทำงานกับเรา');

    const defaultWhyUs = [
        { title: t('whyus.results.title', 'เน้นผลลัพธ์จริง'), desc: t('whyus.results.desc', 'เราวัดความสำเร็จจากผลลัพธ์ทางธุรกิจของลูกค้า ไม่ใช่แค่การส่งมอบ Software') },
        { title: t('whyus.partner.title', 'พาร์ทเนอร์ระยะยาว'), desc: t('whyus.partner.desc', 'ดูแลและพัฒนาระบบต่อเนื่อง พร้อม Support 24/7 หลัง Go-live') },
        { title: t('whyus.tech.title', 'เทคโนโลยีล่าสุด'), desc: t('whyus.tech.desc', 'ใช้ Stack ที่ทันสมัย เหมาะกับโจทย์ของแต่ละองค์กร ไม่ยัดเยียดวิธีเดียว') },
        { title: t('whyus.local.title', 'เข้าใจธุรกิจไทย'), desc: t('whyus.local.desc', 'ทีมงานคนไทย เข้าใจบริบทและข้อกำหนดของตลาดในประเทศอย่างลึกซึ้ง') },
    ];

    const rawWhyUs = props.whyItems || defaultWhyUs;
    // Apply t() to whyItems so they support language switching
    const whyUs = rawWhyUs.map((item, i) => ({
        title: t(`whyus.card_${i}.title`, item.title),
        desc: t(`whyus.card_${i}.desc`, item.desc),
    }));

    // Color customization
    const titleColor = props.titleColor || undefined;
    const textColor = props.textColor || undefined;
    const statValueColor = props.statValueColor || undefined;
    const statLabelColor = props.statLabelColor || undefined;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section className={styles.stats} id="about">
            <div className="container">
                {/* Stats counters */}
                <div className={styles.statsGrid} ref={ref}>
                    {stats.map((s, i) => (
                        <StatCard key={i} {...s} started={started} valueColor={statValueColor} labelColor={statLabelColor} />
                    ))}
                </div>

                {/* Divider */}
                <div className={styles.divider} />

                {/* Why Us */}
                <div className={styles.whyHeader}>
                    <div className={styles.badge}>✦ {badgeText}</div>
                    <h2 className={styles.whyTitle} style={titleColor ? { color: titleColor } : {}}>
                        {headingLine1}<br />
                        <span className={styles.gradient}>{headingLine2}</span>
                    </h2>
                </div>
                <div className={styles.whyGrid}>
                    {whyUs.map((item, i) => (
                        <div key={i} className={styles.whyCard} style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className={styles.whyIcon}>{defaultWhyIcons[i % defaultWhyIcons.length]}</div>
                            <h3 className={styles.whyCardTitle} style={titleColor ? { color: titleColor } : {}}>{item.title}</h3>
                            <p className={styles.whyCardDesc} style={textColor ? { color: textColor } : {}}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

