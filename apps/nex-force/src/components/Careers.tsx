'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Careers.module.css';
import { useLanguage } from '@/context/LanguageContext';
import { API_BASE_URL } from '@/lib/api';

interface Job {
    id: string;
    title: string;
    department: string;
    location: string;
    type: string;
    salary?: string | null;
    description: string;
    experience: string;
    qualification: string;
    position: number;
    age: string;
    tags: string[];
    status: 'open' | 'closed';
    closingDate?: string | null;
    createdAt: string;
}

function typeLabel(type: string, t: (k: string, d: string) => string) {
    const map: Record<string, [string, string]> = {
        'full-time': ['careers.type.fulltime', 'Full-time'],
        'part-time': ['careers.type.parttime', 'Part-time'],
        'internship': ['careers.type.internship', 'Internship'],
        'contract': ['careers.type.contract', 'Contract'],
    };
    const entry = map[type];
    return entry ? t(entry[0], entry[1]) : type;
}
const TYPE_COLORS: Record<string, string> = {
    'full-time': '#4a90e2',
    'part-time': '#4a90e2',
    'internship': '#10b981',
    'contract': '#f59e0b',
};

export default function Careers() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { t, lang } = useLanguage();
    const ALL = '__all__';
    const [activeDept, setActiveDept] = useState(ALL);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch(`${API_BASE_URL}/jobs/external`)
            .then(r => r.json())
            .then(data => {
                setJobs(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => {
                setError(t('common.error', 'ไม่สามารถโหลดข้อมูลได้'));
                setLoading(false);
            });
    }, []);

    // Build dynamic department list from actual data
    const departments = [ALL, ...Array.from(new Set(jobs.map(j => j.department).filter(Boolean)))];

    const filtered = jobs.filter(job => {
        const matchDept = activeDept === ALL || job.department === activeDept;
        const q = search.toLowerCase();
        const matchSearch = !q ||
            job.title.toLowerCase().includes(q) ||
            job.department.toLowerCase().includes(q) ||
            job.tags?.some(tag => tag.toLowerCase().includes(q));
        return matchDept && matchSearch;
    });

    const daysLeft = (closingDate?: string | null) => {
        if (!closingDate) return null;
        const diff = Math.ceil((new Date(closingDate).getTime() - Date.now()) / 86400000);
        return diff > 0 ? diff : 0;
    };

    return (
        <section className={styles.section} id="careers">
            {/* Header */}
            <div className={styles.header}>
                <div className="container">
                    <div className={styles.badge}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'4px'}}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> {t('careers.badge', 'ร่วมงานกับเรา')}</div>
                    <h1 className={styles.title}>
                        {t('careers.heading', 'งานที่')}{' '}
                        <span className={styles.titleGradient}>{t('careers.headingGradient', 'เปิดรับ')}</span>
                    </h1>
                    <p className={styles.subtitle}>
                        {t('careers.desc', 'เราค้นหาคนเก่งที่มีความหลงใหลในเทคโนโลยีมาร่วมสร้างอนาคตไปด้วยกัน')}
                    </p>

                    {/* Search */}
                    <div className={styles.searchBox}>
                        <span className={styles.searchIcon}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                        <input
                            type="text"
                            placeholder={t('careers.searchPlaceholder', 'ค้นหาตำแหน่งงาน, แผนก, ทักษะ...')}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>
            </div>

            <div className="container">
                {/* Department filters — dynamic from real data */}
                <div className={styles.filters}>
                    {departments.map(dept => (
                        <button
                            key={dept}
                            className={`${styles.filterBtn} ${activeDept === dept ? styles.filterActive : ''}`}
                            onClick={() => setActiveDept(dept)}
                        >
                            {dept === ALL ? t('common.all', 'ทั้งหมด') : dept}
                        </button>
                    ))}
                </div>

                {/* Stats bar */}
                <div className={styles.statsBar}>
                    <span className={styles.resultCount}>
                        {loading ? '...' : `${filtered.length} ${t('careers.positions', 'ตำแหน่งงาน')}`}
                    </span>
                    <span className={styles.updateText}>{t('careers.lastUpdated', 'อัปเดตล่าสุด')}: {new Date().toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>

                {/* Loading */}
                {loading && (
                    <div className={styles.loadingGrid}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className={styles.skeleton} />
                        ))}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
                        <p>{error}</p>
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && filtered.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
                        <h3>{t('careers.emptyTitle', 'ไม่พบตำแหน่งงานที่ตรงกัน')}</h3>
                        <p>{t('careers.emptyDesc', 'ลองเปลี่ยนคำค้นหาหรือเลือกแผนกอื่น')}</p>
                    </div>
                )}

                {/* Job Cards */}
                {!loading && !error && filtered.length > 0 && (
                    <div className={styles.grid}>
                        {filtered.map((job, i) => (
                            <article
                                key={job.id}
                                className={styles.card}
                                style={{ animationDelay: `${i * 0.06}s` }}
                            >
                                {/* Card Top */}
                                <div className={styles.cardTop}>
                                    <div className={styles.cardMeta}>
                                        <span
                                            className={styles.typeBadge}
                                            style={{
                                                background: `${TYPE_COLORS[job.type] || '#4a90e2'}18`,
                                                color: TYPE_COLORS[job.type] || '#4a90e2',
                                                borderColor: `${TYPE_COLORS[job.type] || '#4a90e2'}30`,
                                            }}
                                        >
                                            {typeLabel(job.type, t)}
                                        </span>
                                        {job.position > 0 && (
                                            <span className={styles.deadline}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'3px'}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> {job.position} {t('careers.openings', 'อัตรา')}
                                            </span>
                                        )}
                                        {daysLeft(job.closingDate) !== null && daysLeft(job.closingDate)! <= 14 && (
                                            <span className={`${styles.deadline} ${daysLeft(job.closingDate)! <= 7 ? styles.deadlineUrgent : ''}`}>
                                                ⏰ {daysLeft(job.closingDate)} {t('careers.daysLeft', 'วันที่เหลือ')}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className={styles.jobTitle}>{job.title}</h2>
                                    <p className={styles.department}>{job.department}</p>
                                </div>

                                {/* Info Row */}
                                <div className={styles.infoRow}>
                                    {job.salary && <span className={styles.infoItem}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'3px'}}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> {job.salary}</span>}
                                    {job.experience && <span className={styles.infoItem}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'3px'}}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> {job.experience} {t('careers.yearsExp', 'ปี')}</span>}
                                </div>

                                {/* Description */}
                                <p className={styles.description}>
                                    {job.description.length > 120 ? job.description.slice(0, 120) + '...' : job.description}
                                </p>

                                {/* Tags */}
                                {job.tags?.length > 0 && (
                                    <div className={styles.tags}>
                                        {job.tags.slice(0, 4).map(tag => (
                                            <span key={tag} className={styles.tag}>{tag}</span>
                                        ))}
                                    </div>
                                )}

                                {/* Action */}
                                <div className={styles.cardFooter}>
                                    <span className={styles.postedDate}>
                                        {new Date(job.createdAt).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                    <Link href={`/careers/${job.id}`} className={styles.applyBtn}>
                                        {t('careers.viewDetails', 'ดูรายละเอียด')} →
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <div className={styles.cta}>
                    <div className={styles.ctaCard}>
                        <div className={styles.ctaIcon}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
                        <h3 className={styles.ctaTitle}>{t('careers.ctaTitle', 'ไม่เจอตำแหน่งที่ใช่?')}</h3>
                        <p className={styles.ctaText}>{t('careers.ctaDesc', 'ส่ง Resume มาได้เลย เราจะติดต่อกลับเมื่อมีตำแหน่งที่เหมาะสม')}</p>
                        <Link href="/contact" className={styles.ctaBtn}>
                            {t('careers.ctaBtn', 'ส่ง Resume')}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
