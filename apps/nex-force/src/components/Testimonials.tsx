'use client';

import { useState } from 'react';
import styles from './Testimonials.module.css';
import { useLanguage } from '@/context/LanguageContext';

interface TestimonialItem {
    name: string;
    role: string;
    company: string;
    text: string;
    avatar?: string;
    rating?: number;
    color?: string;
}

interface TestimonialsProps {
    badge?: string;
    title?: string;
    headingGradient?: string;
    subtitle?: string;
    testimonials?: TestimonialItem[];
    titleColor?: string;
    textColor?: string;
    nameColor?: string;
    [key: string]: any;
}

const defaultTestimonials: TestimonialItem[] = [
    {
        name: 'คุณสมชาย วงศ์พิทักษ์',
        role: 'CTO, บริษัท ไทยมาร์ท จำกัด',
        avatar: 'SC',
        rating: 5,
        text: 'TechBiz Convergence ช่วยพัฒนาระบบ ERP ให้เราได้ตรงตามความต้องการ ทีมงานมีความเชี่ยวชาญสูง สื่อสารชัดเจน ส่งงานตรงเวลา และดูแลหลัง Go-live ได้ดีมาก ขอแนะนำเป็นอย่างยิ่ง',
        company: 'ThaiMart',
        color: '#4a90e2',
    },
    {
        name: 'คุณนภาพร เจริญสุข',
        role: 'CEO, StartUp Fintech Thailand',
        avatar: 'NT',
        rating: 5,
        text: 'เราให้ทีมพัฒนาแพลตฟอร์ม Fintech ที่รองรับ 50,000+ users ในเวลาเพียง 4 เดือน สถาปัตยกรรม Cloud-native ที่ออกแบบมาให้ scale ได้จริง ประทับใจมากครับ',
        company: 'FinTech TH',
        color: '#4a90e2',
    },
    {
        name: 'คุณวิทยา ศรีสถิตย์',
        role: 'IT Director, โรงพยาบาลเอกชน',
        avatar: 'WS',
        rating: 5,
        text: 'ระบบ Hospital Information System ที่พัฒนาให้มีความเสถียรสูงมาก Uptime 99.9% ตลอด 2 ปีที่ผ่านมา ทีม Support ตอบสนองรวดเร็ว ไม่เคยทำให้ผิดหวัง',
        company: 'Private Hospital',
        color: '#4a90e2',
    },
    {
        name: 'คุณประพันธ์ ดีเลิศ',
        role: 'Operations Manager, โรงงานอุตสาหกรรม',
        avatar: 'PD',
        rating: 5,
        text: 'ระบบ IoT Monitoring ที่ TechBiz สร้างให้ช่วยลดต้นทุนการผลิตได้ถึง 23% ภายใน 6 เดือน ทีมงานเข้าใจ Process ของโรงงานได้ดีมาก แก้โจทย์ได้ตรงจุด',
        company: 'Manufacturing Co.',
        color: '#4a90e2',
    },
];

function StarRating({ count }: { count: number }) {
    return (
        <div className={styles.stars}>
            {Array.from({ length: count }).map((_, i) => (
                <span key={i} className={styles.star}>★</span>
            ))}
        </div>
    );
}

export default function Testimonials(props: TestimonialsProps) {
    const [active, setActive] = useState(0);
    const { t: tr } = useLanguage();

    // Use props from Page Builder, fallback to defaults
    const rawItems = (props.testimonials && props.testimonials.length > 0)
        ? props.testimonials.map(t => ({
            ...t,
            avatar: t.avatar || t.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
            rating: t.rating || 5,
            color: t.color || '#4a90e2',
        }))
        : defaultTestimonials;

    // Apply t() so testimonial text supports language switching
    const items = rawItems.map((item, i) => ({
        ...item,
        name: tr(`testimonials.card_${i}.name`, item.name),
        role: tr(`testimonials.card_${i}.role`, item.role),
        text: tr(`testimonials.card_${i}.text`, item.text),
    }));

    const badgeText = props.badge || tr('testimonials.badge', 'Client Testimonials');
    const titleText = props.title || tr('testimonials.heading', 'ลูกค้าพูดถึงเรา');
    const gradientText = props.headingGradient || tr('testimonials.headingGradient', 'อย่างไร');
    const subtitleText = props.subtitle || tr('testimonials.subtitle', 'ความสำเร็จของลูกค้าคือความสำเร็จของเรา — ฟังประสบการณ์จริงจากองค์กรที่ไว้วางใจเรา');

    const prev = () => setActive(i => (i - 1 + items.length) % items.length);
    const next = () => setActive(i => (i + 1) % items.length);

    const item = items[active];

    // Color customization
    const titleColor = props.titleColor || undefined;
    const textColor = props.textColor || undefined;
    const nameColor = props.nameColor || undefined;

    return (
        <section className={styles.section} id="portfolio">
            <div className="container">
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.badge}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'4px'}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> {badgeText}</div>
                    <h2 className={styles.title} style={titleColor ? { color: titleColor } : {}}>
                        {titleText}<br />
                        <span className={styles.gradient}>{gradientText}</span>
                    </h2>
                    <p className={styles.subtitle} style={textColor ? { color: textColor } : {}}>
                        {subtitleText}
                    </p>
                </div>

                {/* Main card */}
                <div className={styles.cardWrap}>
                    <div
                        className={styles.card}
                        style={{ boxShadow: `0 20px 60px ${item.color}18` }}
                        key={active}
                    >
                        {/* Quote icon */}
                        <div className={styles.quoteIcon} style={{ color: item.color }}>❝</div>

                        <StarRating count={item.rating || 5} />

                        <p className={styles.text} style={textColor ? { color: textColor } : {}}>&ldquo;{item.text}&rdquo;</p>

                        <div className={styles.author}>
                            <div
                                className={styles.avatar}
                                style={{ background: `linear-gradient(135deg, ${item.color}cc, ${item.color}66)` }}
                            >
                                {item.avatar}
                            </div>
                            <div>
                                <div className={styles.name} style={nameColor ? { color: nameColor } : {}}>{item.name}</div>
                                <div className={styles.role}>{item.role}</div>
                            </div>
                            <div className={styles.companyBadge}>{item.company}</div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className={styles.nav}>
                        <button className={styles.navBtn} onClick={prev} aria-label="Previous">‹</button>
                        <div className={styles.dots}>
                            {items.map((_, i) => (
                                <button
                                    key={i}
                                    className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
                                    onClick={() => setActive(i)}
                                    aria-label={`Testimonial ${i + 1}`}
                                />
                            ))}
                        </div>
                        <button className={styles.navBtn} onClick={next} aria-label="Next">›</button>
                    </div>
                </div>

                {/* Summary strip */}
                <div className={styles.strip}>
                    {[
                        { val: '200+', label: tr('stats.projects', 'โปรเจกต์สำเร็จ') },
                        { val: '98%', label: tr('stats.clients', 'ลูกค้าพึงพอใจ') },
                        { val: '4.9★', label: tr('testimonials.avgRating', 'คะแนนเฉลี่ย') },
                        { val: '10Y+', label: tr('stats.years', 'ประสบการณ์') },
                    ].map((s, i) => (
                        <div key={i} className={styles.stripItem}>
                            <span className={styles.stripVal}>{s.val}</span>
                            <span className={styles.stripLabel}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
