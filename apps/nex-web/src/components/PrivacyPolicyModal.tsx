'use client';

import { useEffect } from 'react';
import styles from './PrivacyPolicyModal.module.css';
import { useLanguage } from '@/context/LanguageContext';

interface PrivacyPolicyModalProps {
    open: boolean;
    onClose: () => void;
}

export default function PrivacyPolicyModal({ open, onClose }: PrivacyPolicyModalProps) {
    const { t } = useLanguage();

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (open) window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={styles.headerIcon}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className={styles.headerTitle}>{t('privacy.title', 'นโยบายความเป็นส่วนตัว')}</h2>
                            <p className={styles.headerSub}>{t('privacy.subtitle', 'บริษัท เทค บิซ คอนเวอร์เจนซ์ จำกัด')}</p>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className={styles.body}>
                    <div className={styles.updatedBadge}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        {t('privacy.lastUpdated', 'อัปเดตล่าสุด: 1 มกราคม 2569')}
                    </div>

                    {/* Section 1 */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.num}>1</span>
                            <h3>{t('privacy.s1.title', 'บทนำ')}</h3>
                        </div>
                        <p>{t('privacy.s1.p1', 'บริษัท เทค บิซ คอนเวอร์เจนซ์ จำกัด ("บริษัท", "เรา") ให้ความสำคัญอย่างยิ่งต่อการคุ้มครองข้อมูลส่วนบุคคลของท่าน นโยบายความเป็นส่วนตัวฉบับนี้จัดทำขึ้นเพื่ออธิบายถึงวิธีการที่เราเก็บรวบรวม ใช้ เปิดเผย และจัดการข้อมูลส่วนบุคคลของท่าน ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)')}</p>
                        <p>{t('privacy.s1.p2', 'นโยบายนี้มีผลบังคับใช้กับผู้ใช้งานเว็บไซต์ ลูกค้า พันธมิตรทางธุรกิจ ผู้สมัครงาน และบุคคลทั่วไปที่มีปฏิสัมพันธ์กับบริษัทในทุกช่องทาง')}</p>
                    </section>

                    {/* Section 2 */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.num}>2</span>
                            <h3>{t('privacy.s2.title', 'ข้อมูลส่วนบุคคลที่เราเก็บรวบรวม')}</h3>
                        </div>
                        <p>{t('privacy.s2.intro', 'เราอาจเก็บรวบรวมข้อมูลส่วนบุคคลของท่านในประเภทต่อไปนี้:')}</p>
                        <div className={styles.cardGrid}>
                            <div className={styles.card}>
                                <div className={styles.cardIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></div>
                                <strong>{t('privacy.s2.c1.title', 'ข้อมูลระบุตัวตน')}</strong>
                                <p>{t('privacy.s2.c1.desc', 'ชื่อ-นามสกุล, ที่อยู่, หมายเลขโทรศัพท์, อีเมล, เลขบัตรประชาชน (กรณีจำเป็น), ตำแหน่งงาน, ชื่อบริษัท')}</p>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.cardIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg></div>
                                <strong>{t('privacy.s2.c2.title', 'ข้อมูลทางเทคนิค')}</strong>
                                <p>{t('privacy.s2.c2.desc', 'IP Address, ประเภทเบราว์เซอร์, ระบบปฏิบัติการ, คุกกี้, ข้อมูลการใช้งานเว็บไซต์, พฤติกรรมการเข้าชม')}</p>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.cardIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg></div>
                                <strong>{t('privacy.s2.c3.title', 'ข้อมูลธุรกรรม')}</strong>
                                <p>{t('privacy.s2.c3.desc', 'รายละเอียดการใช้บริการ, ประวัติการสั่งซื้อ, ข้อมูลการชำระเงิน, ใบแจ้งหนี้และใบเสร็จ')}</p>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.cardIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div>
                                <strong>{t('privacy.s2.c4.title', 'ข้อมูลการติดต่อ')}</strong>
                                <p>{t('privacy.s2.c4.desc', 'บันทึกการสนทนา, ข้อความที่ส่งผ่านแบบฟอร์มติดต่อ, อีเมลโต้ตอบ, ข้อมูลการร้องเรียน')}</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.num}>3</span>
                            <h3>{t('privacy.s3.title', 'วัตถุประสงค์ในการเก็บรวบรวมและใช้ข้อมูล')}</h3>
                        </div>
                        <ul className={styles.checkList}>
                            <li><span className={styles.check}>✓</span>{t('privacy.s3.p1', 'เพื่อให้บริการและดำเนินการตามสัญญาที่ทำกับท่าน')}</li>
                            <li><span className={styles.check}>✓</span>{t('privacy.s3.p2', 'เพื่อปรับปรุงและพัฒนาบริการของเรา')}</li>
                            <li><span className={styles.check}>✓</span>{t('privacy.s3.p3', 'เพื่อติดต่อสื่อสารและตอบข้อสอบถาม')}</li>
                            <li><span className={styles.check}>✓</span>{t('privacy.s3.p4', 'เพื่อส่งข้อมูลข่าวสาร โปรโมชั่น และการตลาด (โดยได้รับความยินยอม)')}</li>
                            <li><span className={styles.check}>✓</span>{t('privacy.s3.p5', 'เพื่อปฏิบัติตามกฎหมายและข้อบังคับที่เกี่ยวข้อง')}</li>
                            <li><span className={styles.check}>✓</span>{t('privacy.s3.p6', 'เพื่อป้องกันการทุจริตและรักษาความปลอดภัยของระบบ')}</li>
                            <li><span className={styles.check}>✓</span>{t('privacy.s3.p7', 'เพื่อพิจารณาใบสมัครงานและบริหารทรัพยากรบุคคล')}</li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.num}>4</span>
                            <h3>{t('privacy.s4.title', 'การเปิดเผยข้อมูลส่วนบุคคล')}</h3>
                        </div>
                        <p>{t('privacy.s4.intro', 'เราอาจเปิดเผยข้อมูลส่วนบุคคลของท่านให้กับบุคคลภายนอกในกรณีดังต่อไปนี้:')}</p>
                        <div className={styles.disclosureList}>
                            <div className={styles.disclosureItem}>
                                <div className={styles.dot} />
                                <div>
                                    <strong>{t('privacy.s4.d1.title', 'ผู้ให้บริการภายนอก')}</strong>
                                    <p>{t('privacy.s4.d1.desc', 'ผู้ให้บริการ Cloud, บริษัทที่ปรึกษา, ผู้ให้บริการ IT ที่ได้รับมอบหมาย โดยมีสัญญารักษาความลับ')}</p>
                                </div>
                            </div>
                            <div className={styles.disclosureItem}>
                                <div className={styles.dot} />
                                <div>
                                    <strong>{t('privacy.s4.d2.title', 'หน่วยงานราชการ')}</strong>
                                    <p>{t('privacy.s4.d2.desc', 'ตามที่กฎหมายกำหนด เช่น กรมสรรพากร, ศาล, หรือหน่วยงานกำกับดูแลที่เกี่ยวข้อง')}</p>
                                </div>
                            </div>
                            <div className={styles.disclosureItem}>
                                <div className={styles.dot} />
                                <div>
                                    <strong>{t('privacy.s4.d3.title', 'พันธมิตรทางธุรกิจ')}</strong>
                                    <p>{t('privacy.s4.d3.desc', 'ในกรณีที่มีความจำเป็นเพื่อให้บริการร่วมกัน โดยจะแจ้งให้ท่านทราบล่วงหน้า')}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.num}>5</span>
                            <h3>{t('privacy.s5.title', 'การรักษาความปลอดภัยของข้อมูล')}</h3>
                        </div>
                        <p>{t('privacy.s5.p1', 'บริษัทใช้มาตรการรักษาความปลอดภัยที่เหมาะสมทั้งในเชิงเทคนิคและองค์กร เพื่อป้องกันการเข้าถึง แก้ไข เปิดเผย หรือทำลายข้อมูลส่วนบุคคลโดยไม่ได้รับอนุญาต ซึ่งรวมถึง:')}</p>
                        <div className={styles.securityGrid}>
                            <div className={styles.securityItem}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> {t('privacy.s5.f1', 'การเข้ารหัสข้อมูล SSL/TLS')}</div>
                            <div className={styles.securityItem}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> {t('privacy.s5.f2', 'ระบบควบคุมการเข้าถึงแบบหลายชั้น')}</div>
                            <div className={styles.securityItem}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> {t('privacy.s5.f3', 'การตรวจสอบและเฝ้าระวังตลอด 24 ชม.')}</div>
                            <div className={styles.securityItem}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> {t('privacy.s5.f4', 'การฝึกอบรมพนักงานด้านความปลอดภัย')}</div>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.num}>6</span>
                            <h3>{t('privacy.s6.title', 'สิทธิของเจ้าของข้อมูล')}</h3>
                        </div>
                        <p>{t('privacy.s6.intro', 'ภายใต้พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล ท่านมีสิทธิดังต่อไปนี้:')}</p>
                        <div className={styles.rightsGrid}>
                            {[
                                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>, title: t('privacy.s6.r1.title', 'สิทธิในการเข้าถึง'), desc: t('privacy.s6.r1.desc', 'ขอเข้าถึงและรับสำเนาข้อมูลส่วนบุคคลของท่าน') },
                                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>, title: t('privacy.s6.r2.title', 'สิทธิในการแก้ไข'), desc: t('privacy.s6.r2.desc', 'ขอให้แก้ไขข้อมูลที่ไม่ถูกต้องหรือไม่สมบูรณ์') },
                                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>, title: t('privacy.s6.r3.title', 'สิทธิในการลบ'), desc: t('privacy.s6.r3.desc', 'ขอให้ลบข้อมูลส่วนบุคคลเมื่อไม่มีเหตุจำเป็น') },
                                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>, title: t('privacy.s6.r4.title', 'สิทธิในการจำกัด'), desc: t('privacy.s6.r4.desc', 'ขอให้จำกัดการประมวลผลข้อมูลส่วนบุคคล') },
                                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>, title: t('privacy.s6.r5.title', 'สิทธิในการโอนย้าย'), desc: t('privacy.s6.r5.desc', 'ขอรับข้อมูลในรูปแบบที่สามารถอ่านได้ด้วยเครื่อง') },
                                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>, title: t('privacy.s6.r6.title', 'สิทธิในการคัดค้าน'), desc: t('privacy.s6.r6.desc', 'คัดค้านการประมวลผลข้อมูลเพื่อการตลาดโดยตรง') },
                            ].map((r, i) => (
                                <div key={i} className={styles.rightCard}>
                                    <span className={styles.rightIcon}>{r.icon}</span>
                                    <strong>{r.title}</strong>
                                    <p>{r.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 7 */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.num}>7</span>
                            <h3>{t('privacy.s7.title', 'คุกกี้และเทคโนโลยีการติดตาม')}</h3>
                        </div>
                        <p>{t('privacy.s7.p1', 'เว็บไซต์ของเราใช้คุกกี้และเทคโนโลยีที่คล้ายคลึงกันเพื่อปรับปรุงประสบการณ์การใช้งาน วิเคราะห์การเข้าชม และนำเสนอเนื้อหาที่ตรงกับความสนใจ ท่านสามารถจัดการการตั้งค่าคุกกี้ได้ผ่านเบราว์เซอร์ของท่าน')}</p>
                        <div className={styles.cookieList}>
                            <div className={styles.cookieItem}>
                                <span className={styles.cookieBadge} data-type="essential">จำเป็น</span>
                                <span>{t('privacy.s7.c1', 'คุกกี้ที่จำเป็นสำหรับการทำงานพื้นฐานของเว็บไซต์ ไม่สามารถปิดได้')}</span>
                            </div>
                            <div className={styles.cookieItem}>
                                <span className={styles.cookieBadge} data-type="analytics">วิเคราะห์</span>
                                <span>{t('privacy.s7.c2', 'คุกกี้ที่ช่วยให้เราเข้าใจว่าผู้ใช้มีปฏิสัมพันธ์กับเว็บไซต์อย่างไร')}</span>
                            </div>
                            <div className={styles.cookieItem}>
                                <span className={styles.cookieBadge} data-type="marketing">การตลาด</span>
                                <span>{t('privacy.s7.c3', 'คุกกี้ที่ใช้เพื่อแสดงโฆษณาที่ตรงกับความสนใจของท่าน')}</span>
                            </div>
                        </div>
                    </section>

                    {/* Section 8 */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.num}>8</span>
                            <h3>{t('privacy.s8.title', 'ระยะเวลาในการเก็บรักษาข้อมูล')}</h3>
                        </div>
                        <p>{t('privacy.s8.p1', 'เราจะเก็บรักษาข้อมูลส่วนบุคคลของท่านเท่าที่จำเป็นตามวัตถุประสงค์ที่ได้แจ้งไว้ หรือตามที่กฎหมายกำหนด โดยทั่วไปจะเก็บรักษาไม่เกิน 5 ปี นับจากวันที่ท่านยุติความสัมพันธ์กับบริษัท เว้นแต่มีข้อกำหนดทางกฎหมายที่กำหนดให้เก็บรักษานานกว่า')}</p>
                    </section>

                    {/* Section 9 */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.num}>9</span>
                            <h3>{t('privacy.s9.title', 'ช่องทางการติดต่อ')}</h3>
                        </div>
                        <p>{t('privacy.s9.intro', 'หากท่านมีคำถามหรือต้องการใช้สิทธิเกี่ยวกับข้อมูลส่วนบุคคล สามารถติดต่อเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO) ได้ที่:')}</p>
                        <div className={styles.contactCard}>
                            <div className={styles.contactRow}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                dpo@techbiz.co.th
                            </div>
                            <div className={styles.contactRow}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                061-789-4422
                            </div>
                            <div className={styles.contactRow}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                326/224 Moo 6, Thungsukla, Sriracha, Chonburi 20230
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <button className={styles.closeFooterBtn} onClick={onClose}>
                        {t('common.close', 'ปิด')}
                    </button>
                </div>
            </div>
        </div>
    );
}
