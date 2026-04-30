import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';
import './PrivacyPolicyEditor.css';

export default function PrivacyPolicyEditor() {
    const [data, setData] = useState<Record<string, string>>({
        privacy_company_name: 'บริษัท เทค บิซ คอนเวอร์เจนซ์ จำกัด',
        privacy_last_updated: '1 มกราคม 2569',
        privacy_s1_p1: '',
        privacy_s1_p2: '',
        privacy_s2_c1_title: 'ข้อมูลระบุตัวตน',
        privacy_s2_c1_desc: '',
        privacy_s2_c2_title: 'ข้อมูลทางเทคนิค',
        privacy_s2_c2_desc: '',
        privacy_s2_c3_title: 'ข้อมูลธุรกรรม',
        privacy_s2_c3_desc: '',
        privacy_s2_c4_title: 'ข้อมูลการติดต่อ',
        privacy_s2_c4_desc: '',
        privacy_s3_purposes: '',
        privacy_s4_disclosures: '',
        privacy_s5_p1: '',
        privacy_s5_features: '',
        privacy_s7_p1: '',
        privacy_s8_p1: '',
        privacy_s9_email: 'dpo@techbiz.co.th',
        privacy_s9_phone: '061-789-4422',
        privacy_s9_address: '',
    });

    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/site-settings/map`);
                const all = await res.json();
                const privacyKeys = Object.keys(all).filter(k => k.startsWith('privacy_'));
                if (privacyKeys.length > 0) {
                    setData(prev => {
                        const updated = { ...prev };
                        privacyKeys.forEach(k => { updated[k] = all[k]; });
                        return updated;
                    });
                }
            } catch { /* ignore */ }
        })();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMsg('');
        try {
            const res = await fetch(`${API_BASE_URL}/site-settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: data }),
            });
            const result = await res.json();
            if (result.success) {
                setMsg('success');
                setTimeout(() => setMsg(''), 3000);
            } else {
                setMsg('error');
            }
        } catch {
            setMsg('error');
        }
        setSaving(false);
    };

    const set = (key: string, val: string) => setData(prev => ({ ...prev, [key]: val }));

    const purposes = (data.privacy_s3_purposes || '').split('\n').filter(Boolean);
    const disclosures = (data.privacy_s4_disclosures || '').split('\n').filter(Boolean).map(line => {
        const [title, ...rest] = line.split('|');
        return { title, desc: rest.join('|') };
    });
    const secFeatures = (data.privacy_s5_features || '').split('\n').filter(Boolean);

    return (
        <div className="pp-editor">
            {/* Toolbar */}
            <div className="pp-toolbar">
                <div className="pp-toolbar-left">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    <span>แก้ไขนโยบายความเป็นส่วนตัว</span>
                </div>
                <div className="pp-toolbar-right">
                    {msg === 'success' && <span className="pp-save-msg pp-save-ok">✓ บันทึกสำเร็จ</span>}
                    {msg === 'error' && <span className="pp-save-msg pp-save-err">เกิดข้อผิดพลาด</span>}
                    <button className="pp-save-btn" onClick={handleSave} disabled={saving}>
                        {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                    </button>
                </div>
            </div>

            {/* Visual Form */}
            <div className="pp-preview">
                {/* Header */}
                <div className="pp-header">
                    <div className="pp-header-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <input className="pp-h1" value="นโยบายความเป็นส่วนตัว" readOnly />
                    <div className="pp-header-row">
                        <label className="pp-inline-label">ชื่อบริษัท</label>
                        <input className="pp-inline-input" value={data.privacy_company_name} onChange={e => set('privacy_company_name', e.target.value)} />
                    </div>
                    <div className="pp-header-row">
                        <label className="pp-inline-label">อัปเดตล่าสุด</label>
                        <input className="pp-inline-input pp-inline-sm" value={data.privacy_last_updated} onChange={e => set('privacy_last_updated', e.target.value)} />
                    </div>
                </div>

                {/* Section 1 */}
                <div className="pp-section">
                    <div className="pp-section-head">
                        <span className="pp-num">1</span>
                        <h3>บทนำ</h3>
                    </div>
                    <textarea className="pp-text" value={data.privacy_s1_p1} onChange={e => set('privacy_s1_p1', e.target.value)} rows={4} placeholder="เนื้อหาย่อหน้าที่ 1..." />
                    <textarea className="pp-text" value={data.privacy_s1_p2} onChange={e => set('privacy_s1_p2', e.target.value)} rows={2} placeholder="เนื้อหาย่อหน้าที่ 2..." />
                </div>

                {/* Section 2 */}
                <div className="pp-section">
                    <div className="pp-section-head">
                        <span className="pp-num">2</span>
                        <h3>ข้อมูลส่วนบุคคลที่เราเก็บรวบรวม</h3>
                    </div>
                    <div className="pp-card-grid">
                        {[1,2,3,4].map(n => (
                            <div key={n} className="pp-card">
                                <div className="pp-card-icon-row">
                                    <div className="pp-card-icon-dot" />
                                    <input className="pp-card-title" value={data[`privacy_s2_c${n}_title`] || ''} onChange={e => set(`privacy_s2_c${n}_title`, e.target.value)} placeholder="ชื่อหมวดหมู่" />
                                </div>
                                <textarea className="pp-card-desc" value={data[`privacy_s2_c${n}_desc`] || ''} onChange={e => set(`privacy_s2_c${n}_desc`, e.target.value)} rows={2} placeholder="รายละเอียด..." />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 3 */}
                <div className="pp-section">
                    <div className="pp-section-head">
                        <span className="pp-num">3</span>
                        <h3>วัตถุประสงค์ในการเก็บรวบรวมและใช้ข้อมูล</h3>
                    </div>
                    <div className="pp-purpose-preview">
                        {purposes.map((p, i) => (
                            <div key={i} className="pp-purpose-item">
                                <span className="pp-check">✓</span>
                                <span>{p}</span>
                            </div>
                        ))}
                        {purposes.length === 0 && <p className="pp-empty">ยังไม่มีรายการ</p>}
                    </div>
                    <div className="pp-edit-hint">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        <span>แก้ไข (แต่ละข้อขึ้นบรรทัดใหม่)</span>
                    </div>
                    <textarea className="pp-text" value={data.privacy_s3_purposes} onChange={e => set('privacy_s3_purposes', e.target.value)} rows={7} placeholder="เพื่อให้บริการ...&#10;เพื่อปรับปรุง...&#10;..." />
                </div>

                {/* Section 4 */}
                <div className="pp-section">
                    <div className="pp-section-head">
                        <span className="pp-num">4</span>
                        <h3>การเปิดเผยข้อมูลส่วนบุคคล</h3>
                    </div>
                    <div className="pp-disclosure-preview">
                        {disclosures.map((d, i) => (
                            <div key={i} className="pp-disclosure-item">
                                <div className="pp-dot" />
                                <div>
                                    <strong>{d.title}</strong>
                                    <p>{d.desc}</p>
                                </div>
                            </div>
                        ))}
                        {disclosures.length === 0 && <p className="pp-empty">ยังไม่มีรายการ</p>}
                    </div>
                    <div className="pp-edit-hint">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        <span>แก้ไข (รูปแบบ: หัวข้อ|รายละเอียด แต่ละข้อขึ้นบรรทัดใหม่)</span>
                    </div>
                    <textarea className="pp-text" value={data.privacy_s4_disclosures} onChange={e => set('privacy_s4_disclosures', e.target.value)} rows={5} placeholder="ผู้ให้บริการภายนอก|รายละเอียด...&#10;หน่วยงานราชการ|รายละเอียด..." />
                </div>

                {/* Section 5 */}
                <div className="pp-section">
                    <div className="pp-section-head">
                        <span className="pp-num">5</span>
                        <h3>การรักษาความปลอดภัยของข้อมูล</h3>
                    </div>
                    <textarea className="pp-text" value={data.privacy_s5_p1} onChange={e => set('privacy_s5_p1', e.target.value)} rows={3} placeholder="คำอธิบายมาตรการรักษาความปลอดภัย..." />
                    <div className="pp-security-preview">
                        {secFeatures.map((f, i) => (
                            <div key={i} className="pp-security-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                <span>{f}</span>
                            </div>
                        ))}
                        {secFeatures.length === 0 && <p className="pp-empty">ยังไม่มีรายการ</p>}
                    </div>
                    <div className="pp-edit-hint">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        <span>แก้ไขมาตรการ (แต่ละข้อขึ้นบรรทัดใหม่)</span>
                    </div>
                    <textarea className="pp-text" value={data.privacy_s5_features} onChange={e => set('privacy_s5_features', e.target.value)} rows={5} placeholder="การเข้ารหัสข้อมูล SSL/TLS&#10;ระบบควบคุมการเข้าถึง&#10;..." />
                </div>

                {/* Section 6 - Rights (read-only display, hardcoded) */}
                <div className="pp-section pp-section-readonly">
                    <div className="pp-section-head">
                        <span className="pp-num">6</span>
                        <h3>สิทธิของเจ้าของข้อมูล</h3>
                    </div>
                    <p className="pp-readonly-note">ส่วนนี้เป็นข้อมูลตามกฎหมาย PDPA ไม่สามารถแก้ไขได้</p>
                    <div className="pp-rights-grid">
                        {['สิทธิในการเข้าถึง','สิทธิในการแก้ไข','สิทธิในการลบ','สิทธิในการจำกัด','สิทธิในการโอนย้าย','สิทธิในการคัดค้าน'].map((r, i) => (
                            <div key={i} className="pp-right-card">
                                <strong>{r}</strong>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 7 */}
                <div className="pp-section">
                    <div className="pp-section-head">
                        <span className="pp-num">7</span>
                        <h3>คุกกี้และเทคโนโลยีการติดตาม</h3>
                    </div>
                    <textarea className="pp-text" value={data.privacy_s7_p1} onChange={e => set('privacy_s7_p1', e.target.value)} rows={4} placeholder="คำอธิบายเกี่ยวกับคุกกี้..." />
                </div>

                {/* Section 8 */}
                <div className="pp-section">
                    <div className="pp-section-head">
                        <span className="pp-num">8</span>
                        <h3>ระยะเวลาในการเก็บรักษาข้อมูล</h3>
                    </div>
                    <textarea className="pp-text" value={data.privacy_s8_p1} onChange={e => set('privacy_s8_p1', e.target.value)} rows={4} placeholder="ระยะเวลาในการเก็บรักษา..." />
                </div>

                {/* Section 9 - Contact */}
                <div className="pp-section">
                    <div className="pp-section-head">
                        <span className="pp-num">9</span>
                        <h3>ช่องทางการติดต่อ</h3>
                    </div>
                    <div className="pp-contact-card">
                        <div className="pp-contact-row">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                            <input className="pp-contact-input" value={data.privacy_s9_email} onChange={e => set('privacy_s9_email', e.target.value)} placeholder="dpo@example.com" />
                        </div>
                        <div className="pp-contact-row">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                            <input className="pp-contact-input" value={data.privacy_s9_phone} onChange={e => set('privacy_s9_phone', e.target.value)} placeholder="061-xxx-xxxx" />
                        </div>
                        <div className="pp-contact-row">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                            <input className="pp-contact-input pp-contact-wide" value={data.privacy_s9_address} onChange={e => set('privacy_s9_address', e.target.value)} placeholder="ที่อยู่บริษัท" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Save */}
            <div className="pp-bottom-bar">
                {msg === 'success' && <span className="pp-save-msg pp-save-ok">✓ บันทึกสำเร็จ</span>}
                {msg === 'error' && <span className="pp-save-msg pp-save-err">เกิดข้อผิดพลาด</span>}
                <button className="pp-save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? 'กำลังบันทึก...' : 'บันทึกนโยบายความเป็นส่วนตัว'}
                </button>
            </div>
        </div>
    );
}
