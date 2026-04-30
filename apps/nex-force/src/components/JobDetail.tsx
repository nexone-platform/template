'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './JobDetail.module.css';
import { useLanguage } from '@/context/LanguageContext';
import JobApplicationForm from './JobApplicationForm';

interface Job {
    id: string;
    title: string;
    department: string;
    location: string;
    type: string;
    salary: string | null;
    description: string;
    experience: string;
    qualification: string;
    position: number;
    age: string;
    tags: string[];
    status: 'open' | 'closed';
    closingDate: string | null;
    startDate: string | null;
    createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
    'full-time': '#4a90e2',
    'part-time': '#4a90e2',
    'internship': '#10b981',
    'contract': '#f59e0b',
};

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

// Split text into bullet points — each line or sentence becomes a list item
function toBullets(text: string): string[] {
    if (!text) return [];
    return text
        .split(/\n|(?<=[.?!])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 3);
}

export default function JobDetail({ job }: { job: Job }) {
    const { t, lang } = useLanguage();
    const typeColor = TYPE_COLORS[job.type] || '#4a90e2';
    const [showForm, setShowForm] = useState(false);

    const formatDate = (iso: string | null) => {
        if (!iso) return '-';
        return new Date(iso).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', {
            day: 'numeric', month: 'long', year: 'numeric',
        });
    };

    const daysLeft = (iso: string | null) => {
        if (!iso) return null;
        return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
    };

    const left = daysLeft(job.closingDate);
    const qualBullets = toBullets(job.qualification);
    const descBullets = toBullets(job.description);

    return (
        <div className={styles.page}>
            {/* ─── Hero / Header ─── */}
            <div className={styles.hero}>
                <div className={styles.heroInner}>
                    <Link href="/careers" className={styles.backBtn}>
                        ← {t('careers.backToList', 'กลับไปหน้างานที่เปิดรับ')}
                    </Link>

                    <div className={styles.heroBadges}>
                        <span className={styles.typeBadge}>
                            {typeLabel(job.type, t)}
                        </span>
                        <span className={`${styles.statusBadge} ${job.status === 'open' ? styles.open : styles.closed}`}>
                            {job.status === 'open'
                                ? <><svg width="10" height="10" viewBox="0 0 10 10" style={{verticalAlign:'middle',marginRight:'4px'}}><circle cx="5" cy="5" r="4" fill="#34d399"/></svg>{t('careers.statusOpen', 'กำลังรับสมัคร')}</>
                                : <><svg width="10" height="10" viewBox="0 0 10 10" style={{verticalAlign:'middle',marginRight:'4px'}}><circle cx="5" cy="5" r="4" fill="#f87171"/></svg>{t('careers.statusClosed', 'ปิดรับสมัคร')}</>}
                        </span>
                        {left !== null && left <= 14 && (
                            <span className={`${styles.urgentBadge} ${left <= 7 ? styles.urgent : ''}`}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'3px'}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> {t('careers.remaining', 'เหลือ')} {left} {t('careers.days', 'วัน')}
                            </span>
                        )}
                    </div>

                    <h1 className={styles.jobTitle}>{job.title}</h1>
                    <p className={styles.department}>{job.department}</p>

                    {/* Info chips */}
                    <div className={styles.chips}>
                        <span className={styles.chip}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'3px'}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> {job.location || t('careers.noLocation', 'ไม่ระบุสถานที่')}</span>
                        {job.salary && <span className={styles.chip}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'3px'}}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> {job.salary}</span>}
                        {job.experience && <span className={styles.chip}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'3px'}}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> {t('careers.experience', 'ประสบการณ์')} {job.experience} {t('careers.yearsUnit', 'ปี')}</span>}
                        {job.position > 0 && <span className={styles.chip}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'3px'}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> {job.position} {t('careers.openings', 'อัตรา')}</span>}
                        {job.age && <span className={styles.chip}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'3px'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> {t('careers.age', 'อายุ')} {job.age} {t('careers.yearsUnit', 'ปี')}</span>}
                    </div>
                </div>
            </div>

            {/* ─── Body ─── */}
            <div className={styles.body}>
                <div className={styles.main}>

                    {/* Description / Responsibilities */}
                    {descBullets.length > 0 && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></span>
                                {t('careers.jobDescription', 'รายละเอียดงาน')}
                            </h2>
                            <ul className={styles.bulletList}>
                                {descBullets.map((b, i) => (
                                    <li key={i} className={styles.bulletItem}>{b}</li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Qualifications */}
                    {qualBullets.length > 0 && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></span>
                                {t('careers.qualifications', 'คุณสมบัติที่ต้องการ')}
                            </h2>
                            <ul className={styles.bulletList}>
                                {qualBullets.map((b, i) => (
                                    <li key={i} className={styles.bulletItem}>{b}</li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                {/* ─── Sidebar ─── */}
                <aside className={styles.sidebar}>
                    {/* Apply card */}
                    <div className={styles.applyCard}>
                        <div className={styles.applyCardHeader}>{t('careers.interestedTitle', 'สนใจตำแหน่งนี้?')}</div>
                        <p className={styles.applyCardSub}>
                            {t('careers.interestedDesc', 'ส่งใบสมัครของคุณวันนี้ เราจะติดต่อกลับภายใน 3–5 วันทำการ')}
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            className={styles.applyBtn}
                        >
                            {t('careers.applyNow', 'สมัครงานตำแหน่งนี้')}
                        </button>
                        <Link href="/careers" className={styles.backLink}>
                            {t('careers.viewOther', 'ดูตำแหน่งอื่น')}
                        </Link>
                    </div>

                    {/* Details summary */}
                    <div className={styles.detailCard}>
                        <h3 className={styles.detailCardTitle}>{t('careers.positionInfo', 'ข้อมูลตำแหน่ง')}</h3>
                        <dl className={styles.detailList}>
                            <div className={styles.detailRow}>
                                <dt>{t('careers.detail.department', 'แผนก')}</dt>
                                <dd>{job.department || '-'}</dd>
                            </div>
                            <div className={styles.detailRow}>
                                <dt>{t('careers.detail.jobType', 'ประเภทงาน')}</dt>
                                <dd>{typeLabel(job.type, t)}</dd>
                            </div>
                            <div className={styles.detailRow}>
                                <dt>{t('careers.detail.vacancies', 'อัตราว่าง')}</dt>
                                <dd>{job.position || '-'} {t('careers.openings', 'อัตรา')}</dd>
                            </div>
                            {job.salary && (
                                <div className={styles.detailRow}>
                                    <dt>{t('careers.detail.salary', 'เงินเดือน')}</dt>
                                    <dd>{job.salary}</dd>
                                </div>
                            )}
                            {job.experience && (
                                <div className={styles.detailRow}>
                                    <dt>{t('careers.experience', 'ประสบการณ์')}</dt>
                                    <dd>{job.experience} {t('careers.yearsUnit', 'ปี')}</dd>
                                </div>
                            )}
                            {job.age && (
                                <div className={styles.detailRow}>
                                    <dt>{t('careers.age', 'อายุ')}</dt>
                                    <dd>{job.age} {t('careers.yearsUnit', 'ปี')}</dd>
                                </div>
                            )}
                            {job.closingDate && (
                                <div className={styles.detailRow}>
                                    <dt>{t('careers.detail.closingDate', 'ปิดรับ')}</dt>
                                    <dd className={left !== null && left <= 7 ? styles.urgentText : ''}>
                                        {formatDate(job.closingDate)}
                                    </dd>
                                </div>
                            )}
                            <div className={styles.detailRow}>
                                <dt>{t('careers.detail.postedDate', 'ลงประกาศ')}</dt>
                                <dd>{formatDate(job.createdAt)}</dd>
                            </div>
                        </dl>
                    </div>
                </aside>
            </div>

            {/* ─── Bottom CTA ─── */}
            <div className={styles.bottomCta}>
                <div className={styles.bottomCtaInner}>
                    <div>
                        <h3>{t('careers.readyToStart', 'พร้อมเริ่มต้นกับเรา?')}</h3>
                        <p>{t('careers.applyToday', 'สมัครได้เลยวันนี้ ไม่ต้องรอ')}</p>
                    </div>
                    <div className={styles.bottomCtaBtns}>
                        <button
                            onClick={() => setShowForm(true)}
                            className={styles.applyBtn}
                        >
                            {t('careers.apply', 'สมัครงาน')}
                        </button>
                        <Link href="/careers" className={styles.outlineBtn}>
                            {t('careers.viewOther', 'ดูตำแหน่งอื่น')}
                        </Link>
                    </div>
                </div>
            </div>

            {/* ─── Application Form Modal ─── */}
            {showForm && (
                <JobApplicationForm
                    jobTitle={job.title}
                    onClose={() => setShowForm(false)}
                />
            )}
        </div>
    );
}
