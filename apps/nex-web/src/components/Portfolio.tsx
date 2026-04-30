'use client';

import { useState } from 'react';
import styles from './Portfolio.module.css';
import { useLanguage } from '@/context/LanguageContext';

type Category = 'all' | 'cloud' | 'ai' | 'fintech' | 'healthcare' | 'retail';

interface Project {
    id: number;
    title: string;
    client: string;
    category: Category;
    tags: string[];
    description: string;
    results: string[];
    emoji: string;
    color: string;
    year: string;
}

const projects: Project[] = [
    {
        id: 1,
        title: 'ระบบ ERP ครบวงจร',
        client: 'บริษัทค้าปลีกชั้นนำ',
        category: 'retail',
        tags: ['ERP', 'React', 'Node.js', 'PostgreSQL'],
        description: 'พัฒนาระบบ ERP ครอบคลุม Inventory, POS, HR, และ Finance รองรับ 50+ สาขาทั่วประเทศ',
        results: ['ลดต้นทุนดำเนินงาน 30%', 'ประมวลผล Real-time', 'รองรับ 10,000+ รายการ/วัน'],
        emoji: '🏪',
        color: '#4a90e2',
        year: '2024',
    },
    {
        id: 2,
        title: 'AI Fraud Detection Platform',
        client: 'Fintech Startup',
        category: 'fintech',
        tags: ['Python', 'TensorFlow', 'AWS', 'Kafka'],
        description: 'ระบบตรวจจับการทุจริตทางการเงินด้วย Machine Learning แบบ Real-time ความแม่นยำ 99.2%',
        results: ['ตรวจจับแม่นยำ 99.2%', 'ประมวลผล < 50ms', 'ลด False Positive 65%'],
        emoji: '🤖',
        color: '#4a90e2',
        year: '2024',
    },
    {
        id: 3,
        title: 'Cloud Migration & Modernisation',
        client: 'โรงงานอุตสาหกรรม',
        category: 'cloud',
        tags: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
        description: 'ย้าย Legacy System 200+ เซิร์ฟเวอร์ขึ้น Cloud พร้อม Containerization ด้วย Kubernetes',
        results: ['ลดค่า Infrastructure 40%', 'Uptime 99.99%', 'Auto-scaling พร้อมใช้'],
        emoji: '☁️',
        color: '#4a90e2',
        year: '2023',
    },
    {
        id: 4,
        title: 'Hospital Information System',
        client: 'โรงพยาบาลเอกชน 5 สาขา',
        category: 'healthcare',
        tags: ['React', 'NestJS', 'PostgreSQL', 'HL7 FHIR'],
        description: 'ระบบบริหารโรงพยาบาลครบวงจร ตั้งแต่นัดหมาย เวชระเบียน ไปจนถึงการเบิกจ่าย',
        results: ['ลดเวลารอ 45%', 'เวชระเบียน Paperless 100%', 'PDPA Compliant'],
        emoji: '🏥',
        color: '#4a90e2',
        year: '2023',
    },
    {
        id: 5,
        title: 'Data Analytics Dashboard',
        client: 'ธนาคารพาณิชย์',
        category: 'fintech',
        tags: ['Python', 'Apache Spark', 'Tableau', 'Azure'],
        description: 'แพลตฟอร์ม Business Intelligence วิเคราะห์ข้อมูลลูกค้า 5 ล้านราย แบบ Real-time',
        results: ['วิเคราะห์ข้อมูล 5M+ รายการ', 'ลดเวลา Report 80%', 'Insight แบบ Real-time'],
        emoji: '📊',
        color: '#4a90e2',
        year: '2023',
    },
    {
        id: 6,
        title: 'IoT Manufacturing Monitor',
        client: 'โรงงานผลิตชิ้นส่วนยานยนต์',
        category: 'cloud',
        tags: ['IoT', 'MQTT', 'InfluxDB', 'Grafana', 'AWS IoT'],
        description: 'ระบบ Monitor เครื่องจักร 500+ เครื่อง แบบ Real-time ตรวจจับความผิดปกติก่อนเกิดขึ้น',
        results: ['ลด Downtime 60%', 'ประหยัดต้นทุน 23%', 'Predictive Maintenance'],
        emoji: '⚙️',
        color: '#4a90e2',
        year: '2022',
    },
];

interface PortfolioProps {
    badge?: string;
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    [key: string]: any;
}

export default function Portfolio(props: PortfolioProps) {
    const [active, setActive] = useState<Category>('all');
    const { t } = useLanguage();
    const allFiltered = active === 'all' ? projects : projects.filter(p => p.category === active);

    // Apply t() so hardcoded project text supports language switching
    const filtered = allFiltered.map((p, i) => ({
        ...p,
        title: t(`portfolio.project_${p.id}.title`, p.title),
        client: t(`portfolio.project_${p.id}.client`, p.client),
        description: t(`portfolio.project_${p.id}.desc`, p.description),
        results: p.results.map((r, ri) => t(`portfolio.project_${p.id}.result_${ri}`, r)),
    }));

    const badgeText = props.badge || t('portfolio.title', 'Portfolio');
    const titleText = props.title || t('portfolio.heading', 'โปรเจกต์ที่เราภาคภูมิใจ');
    const subtitleText = props.subtitle || t('portfolio.desc', 'กว่า 200+ โปรเจกต์ที่ประสบความสำเร็จ ในหลากหลายอุตสาหกรรม');
    const ctaText = props.ctaText || t('portfolio.ctaText', 'สนใจร่วมงานกับเรา? เริ่มโปรเจกต์ใหม่ได้เลย');
    const ctaLink = props.ctaLink || '/contact';

    const categories: { id: Category; label: string; count: number }[] = [
        { id: 'all', label: t('common.all', 'ทั้งหมด'), count: projects.length },
        { id: 'cloud', label: 'Cloud & IoT', count: projects.filter(p => p.category === 'cloud').length },
        { id: 'ai', label: 'AI & ML', count: projects.filter(p => p.category === 'ai').length },
        { id: 'fintech', label: 'Fintech', count: projects.filter(p => p.category === 'fintech').length },
        { id: 'healthcare', label: 'Healthcare', count: projects.filter(p => p.category === 'healthcare').length },
        { id: 'retail', label: 'Retail', count: projects.filter(p => p.category === 'retail').length },
    ];

    return (
        <section className={styles.section} id="portfolio">
            <div className="container">
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.badge}>📁 {badgeText}</div>
                    <h2 className={styles.title}>
                        {titleText}
                    </h2>
                    <p className={styles.subtitle}>
                        {subtitleText}
                    </p>
                </div>

                {/* Category filter */}
                <div className={styles.filters}>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`${styles.filterBtn} ${active === cat.id ? styles.filterActive : ''}`}
                            onClick={() => setActive(cat.id)}
                        >
                            {cat.label}
                            <span className={styles.filterCount}>{cat.count}</span>
                        </button>
                    ))}
                </div>

                {/* Project grid */}
                <div className={styles.grid}>
                    {filtered.map((project, i) => (
                        <div
                            key={project.id}
                            className={styles.card}
                            style={{ animationDelay: `${i * 0.08}s`, borderColor: `${project.color}25` }}
                        >
                            {/* Card top */}
                            <div className={styles.cardTop} style={{ background: `${project.color}10` }}>
                                <div className={styles.projectEmoji}>{project.emoji}</div>
                                <div className={styles.year}>{project.year}</div>
                            </div>

                            {/* Card body */}
                            <div className={styles.cardBody}>
                                <div className={styles.clientBadge}>{project.client}</div>
                                <h3 className={styles.projectTitle}>{project.title}</h3>
                                <p className={styles.projectDesc}>{project.description}</p>

                                {/* Results */}
                                <ul className={styles.results}>
                                    {project.results.map((r, ri) => (
                                        <li key={ri} className={styles.resultItem} style={{ color: project.color }}>
                                            <span className={styles.resultDot}>✓</span>
                                            {r}
                                        </li>
                                    ))}
                                </ul>

                                {/* Tags */}
                                <div className={styles.tags}>
                                    {project.tags.map(tag => (
                                        <span key={tag} className={styles.tag}>{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className={styles.bottomCta}>
                    <p>{ctaText}</p>
                    <a href={ctaLink} className={styles.ctaBtn}>
                        {t('portfolio.ctaBtn', 'พูดคุยกับทีมงาน')} →
                    </a>
                </div>
            </div>
        </section>
    );
}
