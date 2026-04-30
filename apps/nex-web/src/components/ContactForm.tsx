'use client';

import { useState } from 'react';
import styles from './ContactForm.module.css';
import { useLanguage } from '@/context/LanguageContext';
import { API_BASE_URL } from '@/lib/api';
import PrivacyPolicyModal from './PrivacyPolicyModal';

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    subject: string;
    service: string;
    message: string;
}

interface ContactFormProps {
    phone?: string;
    phone2?: string;
    lineId?: string;
    hrEmail?: string;
    companyName?: string;
    officeHours?: string;
    address?: string;
    officeName?: string;
    officePhone?: string;
    officeMapUrl?: string;
    titleColor?: string;
    subtitleColor?: string;
    labelColor?: string;
    [key: string]: any;
}

const SERVICES = [
    'Cloud Solutions & Infrastructure',
    'AI & Machine Learning',
    'Cyber Security',
    'Data Analytics & Business Intelligence',
    'Digital Transformation',
    'Software Development',
    'IT Consulting & Strategy',
    'Other',

];

export default function ContactForm({
    phone: propPhone,
    phone2: propPhone2,
    lineId: propLineId,
    hrEmail: propHrEmail,
    companyName: propCompanyName,
    officeHours: propOfficeHours,
    address: propAddress,
    officeName: propOfficeName,
    officePhone: propOfficePhone,
    officeMapUrl: propOfficeMapUrl,
    titleColor,
    subtitleColor,
    labelColor,
}: ContactFormProps) {
    const contactPhone = propPhone || '061-789-4422';
    const contactPhone2 = propPhone2 || '083-289-3156';
    const lineId = propLineId || 'hr_tb';
    const hrEmail = propHrEmail || 'hr@techbizconvergence.com';
    const companyName = propCompanyName || '';
    const contactOfficeHours = propOfficeHours || '';
    const contactAddress = propAddress || '';
    const officeName = propOfficeName || '';
    const officePhone = propOfficePhone || '061-789-4422';
    const officeMapUrl = propOfficeMapUrl || 'https://maps.google.com/?q=326/224+ทุ่งสุขลา+ศรีราชา+ชลบุรี';

    const [form, setForm] = useState<FormData>({
        firstName: '', lastName: '', email: '', phone: '',
        company: '', subject: '', service: '', message: '',
    });
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [agreed, setAgreed] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const { t } = useLanguage();



    const set = (field: keyof FormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => setForm(f => ({ ...f, [field]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreed) return;
        setStatus('sending');

        try {
            const res = await fetch(`${API_BASE_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    email: form.email,
                    phone: form.phone,
                    company: form.company,
                    subject: form.subject,
                    service: form.service,
                    message: form.message,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <section className={styles.section}>
                <div className={styles.container}>
                    <div className={styles.successWrap}>
                        <div className={styles.successCard}>
                            <div className={styles.successAnim}>
                                <svg viewBox="0 0 52 52" className={styles.checkSvg}>
                                    <circle cx="26" cy="26" r="25" fill="none" className={styles.checkCircle} />
                                    <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" className={styles.checkMark} />
                                </svg>
                            </div>
                            <h2 className={styles.successTitle}>{t('contact.success', 'ส่งข้อความสำเร็จ!')}</h2>
                            <p className={styles.successText}>
                                {t('contact.successThank', 'ขอบคุณที่ติดต่อ TechBiz Convergence')}<br />
                                {t('contact.successSub', 'ทีมผู้เชี่ยวชาญของเราจะติดต่อกลับภายใน')} <strong>{t('contact.successDay', '1 วันทำการ')}</strong>
                            </p>
                            <button
                                className={styles.resetBtn}
                                onClick={() => {
                                    setStatus('idle');
                                    setAgreed(false);
                                    setForm({ firstName: '', lastName: '', email: '', phone: '', company: '', subject: '', service: '', message: '' });
                                }}
                            >
                                {t('common.sendAgain', 'ส่งข้อความอีกครั้ง')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.section} id="contact">

            {/* ── Hero Header ── */}
            <div className={styles.hero}>
                <div className={styles.container}>
                    <div className={styles.heroInner}>
                        <div className={styles.heroText}>
                            <h1 className={styles.heroTitle}>
                                {t('contact.heroTitle', 'Contact Us')}
                            </h1>
                            <p className={styles.heroSub}>
                                {t('contact.heroSub1', 'ติดต่อเพื่อรับข้อมูลเพิ่มเติมสำหรับผลิตภัณฑ์และบริการ')}<br className={styles.brHide} />
                                {t('contact.heroSub2', 'หรือให้ข้อเสนอแนะ / แจ้งข้อร้องเรียนทุกประเภท')}
                            </p>
                        </div>
                        <div className={styles.heroStats}>
                            <div className={styles.heroStat}>
                                <span className={styles.heroStatNum}>24h</span>
                                <span className={styles.heroStatLabel}>{t('contact.stat.response', 'ตอบกลับภายใน')}</span>
                            </div>

                            <div className={styles.heroStatDivider} />
                            <div className={styles.heroStat}>
                                <span className={styles.heroStatNum}>100%</span>
                                <span className={styles.heroStatLabel}>{t('contact.stat.secure', 'ปลอดภัย')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className={styles.container}>
                <div className={styles.mainGrid}>

                    {/* Left: Contact Info */}
                    <div className={styles.infoCol}>

                        {/* Quick contacts */}
                        <div className={styles.infoBlock}>
                            <h2 className={styles.infoTitle} style={titleColor ? { color: titleColor } : {}}>{t('contact.infoTitle', 'ข้อมูลติดต่อ')}</h2>

                            <a href={`tel:${contactPhone.replace(/[^0-9+]/g, '')}`} className={styles.contactCard}>
                                <div className={`${styles.contactCardIcon} ${styles.iconBlue}`}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                </div>
                                <div className={styles.contactCardBody}>
                                    <div className={styles.contactCardLabel} style={labelColor ? { color: labelColor } : {}}>{t('contact.label.tel', 'Tel.')}</div>
                                    <div className={styles.contactCardValue}>{contactPhone}</div>
                                    <div className={styles.contactCardSub}>{contactPhone2}</div>
                                </div>
                                <div className={styles.contactCardArrow}>→</div>
                            </a>

                            <div className={styles.contactCard}>
                                <div className={`${styles.contactCardIcon} ${styles.iconGreen}`}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                </div>
                                <div className={styles.contactCardBody}>
                                    <div className={styles.contactCardLabel} style={labelColor ? { color: labelColor } : {}}>{t('contact.label.line', 'LINE ID')}</div>
                                    <div className={styles.contactCardValue}>{lineId}</div>
                                    <div className={styles.contactCardSub}>{t('contact.lineDesc', 'สอบถามข้อมูลเพิ่มเติมผ่าน LINE')}</div>
                                </div>
                            </div>

                            <div className={styles.contactCard}>
                                <div className={`${styles.contactCardIcon} ${styles.iconOrange}`}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                </div>
                                <div className={styles.contactCardBody}>
                                    <div className={styles.contactCardLabel} style={labelColor ? { color: labelColor } : {}}>{t('contact.label.officeHours', 'Office Hours')}</div>
                                    <div className={styles.contactCardValue}>{contactOfficeHours || t('contact.officeHours', 'จันทร์ – ศุกร์ 09:00 – 18:00 น.')}</div>
                                </div>
                            </div>

                            <div className={styles.contactCard}>
                                <div className={`${styles.contactCardIcon} ${styles.iconPurple}`}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                </div>
                                <div className={styles.contactCardBody}>
                                    <div className={styles.contactCardLabel} style={labelColor ? { color: labelColor } : {}}>{t('contact.label.address', 'Address')}</div>
                                    <div className={styles.contactCardValue}>{companyName || t('contact.companyName', 'บริษัท เทค บิซ คอนเวอร์เจนซ์ จำกัด')}</div>
                                    <div className={styles.contactCardSub}>{contactAddress || t('contact.address', '326/224 หมู่ 6 ต.ทุ่งสุขลา อ.ศรีราชา จ.ชลบุรี 20230')}</div>
                                </div>
                            </div>

                            <a href={`mailto:${hrEmail}`} className={styles.contactCard}>
                                <div className={`${styles.contactCardIcon} ${styles.iconBlue}`}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                                </div>
                                <div className={styles.contactCardBody}>
                                    <div className={styles.contactCardLabel} style={labelColor ? { color: labelColor } : {}}>{t('contact.applyJob', 'Apply Job / ร่วมงานกับเรา')}</div>
                                    <div className={styles.contactCardValue}>{hrEmail}</div>
                                    <div className={styles.contactCardSub}>LINE: {lineId}</div>
                                </div>
                                <div className={styles.contactCardArrow}>→</div>
                            </a>
                        </div>

                        {/* Offices */}
                        <div className={styles.officesBlock}>
                            <h3 className={styles.officesTitle}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '6px' }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                                {t('contact.location', 'Location')}
                            </h3>
                            <div className={styles.officesList}>
                                    <a href={officeMapUrl} target="_blank" rel="noopener noreferrer" className={styles.officeCard}>
                                        <div className={styles.officeNum}>01</div>
                                        <div className={styles.officeInfo}>
                                            <div className={styles.officeName}>{officeName || t('contact.officeName', 'สำนักงานใหญ่')}</div>
                                            <div className={styles.officeAddress}>{contactAddress || t('contact.officeAddress', '326/224 หมู่ 6 ต.ทุ่งสุขลา อ.ศรีราชา จ.ชลบุรี 20230')}</div>
                                            <div className={styles.officePhone}>{officePhone}</div>
                                        </div>
                                        <span className={styles.officeMapBtn}>{t('contact.viewMap', 'ดูแผนที่ →')}</span>
                                    </a>
                            </div>
                        </div>

                    </div>

                    {/* Right: Form */}
                    <div className={styles.formCol}>
                        <div className={styles.formCard}>
                            <div className={styles.formHeader}>
                                <h2 className={styles.formTitle} style={titleColor ? { color: titleColor } : {}}>{t('contact.formTitle', 'Send a Message')}</h2>
                                <p className={styles.formSubtitle} style={subtitleColor ? { color: subtitleColor } : {}}>{t('contact.formSubtitle', 'กรอกแบบฟอร์มด้านล่าง ทีมงานจะติดต่อกลับโดยเร็วที่สุด')}</p>
                            </div>

                            <form onSubmit={handleSubmit} className={styles.form} noValidate>

                                {/* Name row */}
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>
                                            {t('contact.firstName', 'ชื่อ')} <span className={styles.req}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={form.firstName}
                                            onChange={set('firstName')}
                                            placeholder={t('contact.placeholder.firstName', 'สมชาย')}
                                            required
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>
                                            {t('contact.lastName', 'นามสกุล')} <span className={styles.req}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={form.lastName}
                                            onChange={set('lastName')}
                                            placeholder={t('contact.placeholder.lastName', 'วงศ์พิทักษ์')}
                                            required
                                            className={styles.input}
                                        />
                                    </div>
                                </div>

                                {/* Email + Phone */}
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>
                                            {t('contact.email', 'อีเมล')} <span className={styles.req}>*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={set('email')}
                                            placeholder="you@company.com"
                                            required
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>{t('contact.phone', 'เบอร์โทรศัพท์')}</label>
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={set('phone')}
                                            placeholder="08x-xxx-xxxx"
                                            className={styles.input}
                                        />
                                    </div>
                                </div>

                                {/* Company */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('contact.company', 'บริษัท / องค์กร')}</label>
                                    <input
                                        type="text"
                                        value={form.company}
                                        onChange={set('company')}
                                        placeholder="Tech Corp Ltd."
                                        className={styles.input}
                                    />
                                </div>

                                {/* Subject */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        {t('contact.subject', 'หัวข้อ')} <span className={styles.req}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.subject}
                                        onChange={set('subject')}
                                        placeholder={t('contact.placeholder.subject', 'ขอข้อมูลบริการ Cloud...')}
                                        required
                                        className={styles.input}
                                    />
                                </div>

                                {/* Service */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('contact.service', 'บริการที่สนใจ')}</label>
                                    <div className={styles.selectWrap}>
                                        <select value={form.service} onChange={set('service')} className={styles.select}>
                                            <option value="">{t('contact.selectService', '-- เลือกบริการ --')}</option>
                                            {SERVICES.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                        <span className={styles.selectArrow}>▾</span>
                                    </div>
                                </div>

                                {/* Message */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        {t('contact.message', 'รายละเอียด / ข้อความ')} <span className={styles.req}>*</span>
                                    </label>
                                    <textarea
                                        value={form.message}
                                        onChange={set('message')}
                                        rows={5}
                                        placeholder={t('contact.placeholder.message', 'เล่าให้เราฟังเกี่ยวกับโปรเจกต์ของคุณ สิ่งที่ต้องการ หรือปัญหาที่ต้องการแก้ไข...')}
                                        required
                                        className={styles.textarea}
                                    />
                                </div>

                                {/* Privacy agreement */}
                                <label className={styles.privacyCheck}>
                                    <input
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={e => setAgreed(e.target.checked)}
                                        className={styles.checkbox}
                                    />
                                    <span className={styles.privacyText}>
                                        {t('contact.privacyPre', 'การติดต่อสื่อสารกับทางบริษัทจะอยู่ภายใต้')}{' '}
                                        <button
                                            type="button"
                                            className={styles.privacyLink}
                                            onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }}
                                        >
                                            {t('contact.privacyLink', 'นโยบายความเป็นส่วนตัวของบริษัท')}
                                        </button>{' '}
                                        {t('contact.privacyPost', 'ซึ่งท่านสามารถศึกษาได้ที่นี่')}
                                    </span>
                                </label>

                                <button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={status === 'sending' || !agreed}
                                >
                                    {status === 'sending' ? (
                                        <><span className={styles.spinner} /> {t('common.loading', 'กำลังส่ง...')}</>
                                    ) : (
                                        <>{t('contact.submit', 'ส่งข้อความ')} <span className={styles.btnArrow}>→</span></>
                                    )}
                                </button>

                            </form>
                        </div>
                    </div>

                </div>
            </div>

            {/* ── Any Questions Strip ── */}
            <div className={styles.anyQuestions}>
                <div className={styles.container}>
                    <div className={styles.aqInner}>
                        <div className={styles.aqText}>
                            <h3 className={styles.aqTitle}>{t('contact.anyQuestions', 'Any questions?')}</h3>
                            <p className={styles.aqSub}>{t('contact.readyToUplift', 'Ready to uplift your digital life?')}</p>
                        </div>
                        <div className={styles.aqRight}>
                            <a href={`tel:${contactPhone.replace(/[^0-9+]/g, '')}`} className={styles.aqPhone}>{contactPhone}</a>
                            <a href={`https://line.me/R/ti/p/~${lineId}`} target="_blank" rel="noopener noreferrer" className={styles.aqEmail}>
                                LINE: {lineId}
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <PrivacyPolicyModal open={showPrivacy} onClose={() => setShowPrivacy(false)} />
        </section>
    );
}
