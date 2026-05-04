'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './JobApplicationForm.module.css';
import { useLanguage } from '@/context/LanguageContext';

/* ── Custom Date Input that always shows dd/mm/yyyy ── */
function DateInput({
    value,
    onChange,
    className,
}: {
    value: string;
    onChange: (val: string) => void;
    className?: string;
}) {
    const dateRef = useRef<HTMLInputElement>(null);

    // Format ISO date (yyyy-mm-dd) to dd/mm/yyyy for display
    const display = value
        ? value.split('-').reverse().join('/')
        : '';

    const handleClick = () => {
        const el = dateRef.current;
        if (!el) return;
        // showPicker is supported in modern Chrome/Edge/Safari
        if (typeof el.showPicker === 'function') {
            el.showPicker();
        } else {
            el.focus();
            el.click();
        }
    };

    return (
        <div className={styles.dateInputWrap} onClick={handleClick} style={{ cursor: 'pointer' }}>
            {/* Visible display layer */}
            <div className={`${className || ''}`} style={{ pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{display || <span style={{ color: '#94a3b8' }}>dd/mm/yyyy</span>}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
            </div>
            {/* Hidden native date input for picker */}
            <input
                ref={dateRef}
                type="date"
                className={styles.dateHidden}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                tabIndex={-1}
            />
        </div>
    );
}

interface Props {
    jobTitle: string;
    onClose: () => void;
}

interface Skill {
    hardSkill: string;
    softSkill: string;
}

interface Education {
    institution: string;
    subject: string;
    startDate: string;
    completeDate: string;
    degree: string;
    grade: string;
}

interface Experience {
    companyName: string;
    location: string;
    jobPosition: string;
    periodFrom: string;
    periodTo: string;
}

const POSITIONS = [
    'IOS', 'General Manager', 'Admin Officer', 'Accountant',
    'Junior Developer', 'Senior Developer', 'System Analyst',
    'Developer', 'Chief Financial Officer', 'Chief Technology Officer',
    'Chief Executive Officer', 'Chief Information Officer',
    'Sales Representative', 'Finance Officer', 'Accounting Manager',
    'Sale & Marketing Manager', 'HR Manager', 'Senior HR',
    'Recruiter / Talent Acquisition', 'Administrator / Admin Officer', 'IT Support',
];

const LOCATIONS = [
    'บริษัท มิตซูบิชิมอเตอร์ส (ประเทศไทย) จำกัด',
    'บริษัท อินฟอร์เมติค แอดวานซ์ เทคโนโลยี จำกัด',
    'บริษัท ยูแทคไทย จำกัด',
];

const TITLES = ['Mr.', 'Mrs.', 'Ms.', 'Dr.'];
const DEGREES = ['มัธยมศึกษา', 'ปวช.', 'ปวส.', 'ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก', 'อื่นๆ'];

export default function JobApplicationForm({ jobTitle, onClose }: Props) {
    const { t } = useLanguage();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Personal
    const [title, setTitle] = useState('');
    const [gender, setGender] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [position, setPosition] = useState('');
    const [location, setLocation] = useState('');

    // Skills (array)
    const emptySkill: Skill = { hardSkill: '', softSkill: '' };
    const [skills, setSkills] = useState<Skill[]>([{ ...emptySkill }]);

    const addSkill = () => setSkills(prev => [...prev, { ...emptySkill }]);
    const removeSkill = (i: number) => setSkills(prev => prev.filter((_, idx) => idx !== i));
    const updateSkill = (i: number, field: keyof Skill, value: string) => {
        setSkills(prev => prev.map((sk, idx) => idx === i ? { ...sk, [field]: value } : sk));
    };

    // Education (array)
    const emptyEdu: Education = { institution: '', subject: '', startDate: '', completeDate: '', degree: '', grade: '' };
    const [educations, setEducations] = useState<Education[]>([{ ...emptyEdu }]);

    const addEducation = () => setEducations(prev => [...prev, { ...emptyEdu }]);
    const removeEducation = (i: number) => setEducations(prev => prev.filter((_, idx) => idx !== i));
    const updateEducation = (i: number, field: keyof Education, value: string) => {
        setEducations(prev => prev.map((edu, idx) => idx === i ? { ...edu, [field]: value } : edu));
    };

    // Experience (array)
    const emptyExp: Experience = { companyName: '', location: '', jobPosition: '', periodFrom: '', periodTo: '' };
    const [experiences, setExperiences] = useState<Experience[]>([{ ...emptyExp }]);

    const addExperience = () => setExperiences(prev => [...prev, { ...emptyExp }]);
    const removeExperience = (i: number) => setExperiences(prev => prev.filter((_, idx) => idx !== i));
    const updateExperience = (i: number, field: keyof Experience, value: string) => {
        setExperiences(prev => prev.map((exp, idx) => idx === i ? { ...exp, [field]: value } : exp));
    };

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        const payload = {
            jobTitle,
            personal: { title, gender, firstName, lastName, phone, email, position, location },
            skills,
            educations,
            experiences,
            submittedAt: new Date().toISOString(),
        };

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
            const res = await fetch(`${apiBase}/jobs/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.error || t('jobForm.submitError', 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'));
            }
        } catch {
            setError(t('jobForm.submitError', 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'));
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className={styles.overlay} onClick={onClose}>
                <div className={styles.modal} onClick={e => e.stopPropagation()}>
                    <div className={styles.successOverlay}>
                        <div className={styles.successIcon}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <h2 className={styles.successTitle}>{t('jobForm.successTitle', 'ส่งใบสมัครเรียบร้อยแล้ว!')}</h2>
                        <p className={styles.successText}>{t('jobForm.successText', 'ขอบคุณสำหรับความสนใจ ทีมงานจะตรวจสอบข้อมูลและติดต่อกลับภายใน 3–5 วันทำการ')}</p>
                        <button className={styles.successBtn} onClick={onClose}>{t('jobForm.close', 'ปิด')}</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>{t('jobForm.title', 'สมัครงาน')}</h2>
                    <p className={styles.modalSubtitle}>{t('jobForm.position', 'ตำแหน่ง:')} {jobTitle}</p>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.formWrapper}>
                    <div className={styles.formBody}>

                        {/* ── Personal Information ── */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionIcon}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                </div>
                                <h3 className={styles.sectionTitle}>{t('jobForm.personalInfo', 'ข้อมูลส่วนตัว')}</h3>
                            </div>
                            <div className={styles.fieldGrid}>
                                <div className={styles.field}>
                                    <label className={styles.label}>{t('jobForm.titlePrefix', 'คำนำหน้าชื่อ')} <span className={styles.required}>*</span></label>
                                    <select className={styles.select} value={title} onChange={e => setTitle(e.target.value)} required>
                                        <option value="">{t('jobForm.titleSelect', 'เลือกคำนำหน้า')}</option>
                                        {TITLES.map(ti => <option key={ti} value={ti}>{ti}</option>)}
                                    </select>
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>{t('jobForm.gender', 'เพศ')} <span className={styles.required}>*</span></label>
                                    <select className={styles.select} value={gender} onChange={e => setGender(e.target.value)} required>
                                        <option value="">{t('jobForm.genderSelect', 'เลือกเพศ')}</option>
                                        <option value="M">Male</option>
                                        <option value="F">Female</option>
                                    </select>
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>{t('jobForm.firstName', 'ชื่อ')} <span className={styles.required}>*</span></label>
                                    <input className={styles.input} type="text" placeholder={t('jobForm.firstName', 'ชื่อ')} value={firstName} onChange={e => setFirstName(e.target.value)} required />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>{t('jobForm.lastName', 'นามสกุล')} <span className={styles.required}>*</span></label>
                                    <input className={styles.input} type="text" placeholder={t('jobForm.lastName', 'นามสกุล')} value={lastName} onChange={e => setLastName(e.target.value)} required />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>{t('jobForm.phone', 'เบอร์โทร')} <span className={styles.required}>*</span></label>
                                    <input className={styles.input} type="tel" placeholder="0XX-XXX-XXXX" value={phone} onChange={e => setPhone(e.target.value)} required />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>{t('jobForm.email', 'อีเมล')} <span className={styles.required}>*</span></label>
                                    <input className={styles.input} type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>{t('jobForm.applyPosition', 'ตำแหน่งที่สมัคร')} <span className={styles.required}>*</span></label>
                                    <select className={styles.select} value={position} onChange={e => setPosition(e.target.value)} required>
                                        <option value="">{t('jobForm.positionSelect', 'เลือกตำแหน่ง')}</option>
                                        {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>{t('jobForm.workLocation', 'สถานที่ปฏิบัติงาน')} <span className={styles.required}>*</span></label>
                                    <select className={styles.select} value={location} onChange={e => setLocation(e.target.value)} required>
                                        <option value="">{t('jobForm.locationSelect', 'เลือกสถานที่')}</option>
                                        {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ── Skills ── */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionIcon}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                </div>
                                <h3 className={styles.sectionTitle}>{t('jobForm.skills', 'ทักษะ')}</h3>
                                <button type="button" className={styles.addBtn} onClick={addSkill}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                    {t('jobForm.addSkill', 'เพิ่มทักษะ')}
                                </button>
                            </div>
                            {skills.map((sk, i) => (
                                <div key={i} className={styles.entryCard}>
                                    {skills.length > 1 && (
                                        <div className={styles.entryHeader}>
                                            <span className={styles.entryLabel}>{t('jobForm.skillNo', 'ทักษะที่')} {i + 1}</span>
                                            <button type="button" className={styles.removeBtn} onClick={() => removeSkill(i)}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                {t('jobForm.remove', 'ลบ')}
                                            </button>
                                        </div>
                                    )}
                                    <div className={styles.fieldGrid}>
                                        <div className={styles.field}>
                                            <label className={styles.label}>{t('jobForm.hardSkill', 'Hard Skill')}</label>
                                            <input className={styles.input} type="text" placeholder={t('jobForm.hardSkillPlaceholder', 'เช่น JavaScript, React, SQL, Python...')} value={sk.hardSkill} onChange={e => updateSkill(i, 'hardSkill', e.target.value)} />
                                        </div>
                                        <div className={styles.field}>
                                            <label className={styles.label}>{t('jobForm.softSkill', 'Soft Skill')}</label>
                                            <input className={styles.input} type="text" placeholder={t('jobForm.softSkillPlaceholder', 'เช่น การสื่อสาร, การทำงานเป็นทีม, ภาวะผู้นำ...')} value={sk.softSkill} onChange={e => updateSkill(i, 'softSkill', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Education ── */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionIcon}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/></svg>
                                </div>
                                <h3 className={styles.sectionTitle}>{t('jobForm.education', 'ข้อมูลการศึกษา')}</h3>
                                <button type="button" className={styles.addBtn} onClick={addEducation}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                    {t('jobForm.addEducation', 'เพิ่มการศึกษา')}
                                </button>
                            </div>
                            {educations.map((edu, i) => (
                                <div key={i} className={styles.entryCard}>
                                    {educations.length > 1 && (
                                        <div className={styles.entryHeader}>
                                            <span className={styles.entryLabel}>{t('jobForm.educationNo', 'การศึกษาที่')} {i + 1}</span>
                                            <button type="button" className={styles.removeBtn} onClick={() => removeEducation(i)}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                {t('jobForm.remove', 'ลบ')}
                                            </button>
                                        </div>
                                    )}
                                    <div className={styles.fieldGrid}>
                                        <div className={`${styles.field} ${styles.fieldFull}`}>
                                            <label className={styles.label}>{t('jobForm.institution', 'สถาบันการศึกษา')}</label>
                                            <input className={styles.input} type="text" placeholder={t('jobForm.institutionPlaceholder', 'ชื่อสถาบัน / มหาวิทยาลัย')} value={edu.institution} onChange={e => updateEducation(i, 'institution', e.target.value)} />
                                        </div>
                                        <div className={styles.field}>
                                            <label className={styles.label}>{t('jobForm.subject', 'สาขาวิชา')}</label>
                                            <input className={styles.input} type="text" placeholder={t('jobForm.subject', 'สาขาวิชา')} value={edu.subject} onChange={e => updateEducation(i, 'subject', e.target.value)} />
                                        </div>
                                        <div className={styles.field}>
                                            <label className={styles.label}>{t('jobForm.degree', 'วุฒิการศึกษา')}</label>
                                            <select className={styles.select} value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)}>
                                                <option value="">{t('jobForm.degreeSelect', 'เลือกวุฒิการศึกษา')}</option>
                                                {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div className={styles.field}>
                                            <label className={styles.label}>{t('jobForm.eduStartDate', 'วันที่เริ่มเรียน')}</label>
                                            <DateInput className={styles.input} value={edu.startDate} onChange={(v) => updateEducation(i, 'startDate', v)} />
                                        </div>
                                        <div className={styles.field}>
                                            <label className={styles.label}>{t('jobForm.eduEndDate', 'วันที่สำเร็จการศึกษา')}</label>
                                            <DateInput className={styles.input} value={edu.completeDate} onChange={(v) => updateEducation(i, 'completeDate', v)} />
                                        </div>
                                        <div className={styles.field}>
                                            <label className={styles.label}>{t('jobForm.grade', 'เกรดเฉลี่ย')}</label>
                                            <input className={styles.input} type="text" placeholder={t('jobForm.gradePlaceholder', 'เช่น 3.50')} value={edu.grade} onChange={e => updateEducation(i, 'grade', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Experience ── */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionIcon}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                                </div>
                                <h3 className={styles.sectionTitle}>{t('jobForm.experience', 'ประสบการณ์การทำงาน')}</h3>
                                <button type="button" className={styles.addBtn} onClick={addExperience}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                    {t('jobForm.addExperience', 'เพิ่มประสบการณ์')}
                                </button>
                            </div>
                            {experiences.map((exp, i) => (
                                <div key={i} className={styles.entryCard}>
                                    {experiences.length > 1 && (
                                        <div className={styles.entryHeader}>
                                            <span className={styles.entryLabel}>{t('jobForm.experienceNo', 'ประสบการณ์ที่')} {i + 1}</span>
                                            <button type="button" className={styles.removeBtn} onClick={() => removeExperience(i)}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                {t('jobForm.remove', 'ลบ')}
                                            </button>
                                        </div>
                                    )}
                                    <div className={styles.fieldGrid}>
                                        <div className={`${styles.field} ${styles.fieldFull}`}>
                                            <label className={styles.label}>{t('jobForm.companyName', 'ชื่อบริษัท')}</label>
                                            <input className={styles.input} type="text" placeholder={t('jobForm.companyPlaceholder', 'ชื่อบริษัท / องค์กร')} value={exp.companyName} onChange={e => updateExperience(i, 'companyName', e.target.value)} />
                                        </div>
                                        <div className={styles.field}>
                                            <label className={styles.label}>{t('jobForm.expLocation', 'สถานที่')}</label>
                                            <input className={styles.input} type="text" placeholder={t('jobForm.expLocationPlaceholder', 'กรุงเทพฯ, เชียงใหม่, etc.')} value={exp.location} onChange={e => updateExperience(i, 'location', e.target.value)} />
                                        </div>
                                        <div className={styles.field}>
                                            <label className={styles.label}>{t('jobForm.jobPosition', 'ตำแหน่งงาน')}</label>
                                            <input className={styles.input} type="text" placeholder={t('jobForm.jobPosition', 'ตำแหน่งงาน')} value={exp.jobPosition} onChange={e => updateExperience(i, 'jobPosition', e.target.value)} />
                                        </div>
                                        <div className={styles.field}>
                                            <label className={styles.label}>{t('jobForm.periodFrom', 'ตั้งแต่')}</label>
                                            <DateInput className={styles.input} value={exp.periodFrom} onChange={(v) => updateExperience(i, 'periodFrom', v)} />
                                        </div>
                                        <div className={styles.field}>
                                            <label className={styles.label}>{t('jobForm.periodTo', 'ถึง')}</label>
                                            <DateInput className={styles.input} value={exp.periodTo} onChange={(v) => updateExperience(i, 'periodTo', v)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={styles.formFooter}>
                        {error && (
                            <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '0 0 8px', width: '100%', textAlign: 'center' }}>
                                ⚠ {error}
                            </p>
                        )}
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>{t('jobForm.cancel', 'ยกเลิก')}</button>
                        <button type="submit" className={styles.submitBtn} disabled={submitting}>
                            {submitting ? t('jobForm.submitting', 'กำลังส่ง...') : t('jobForm.submit', 'ส่งใบสมัคร')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
