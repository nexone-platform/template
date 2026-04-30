'use client';

import React, { useState, useEffect } from 'react';
import {
    Settings, Building2, Users, Bell, Shield, Palette,
    Database, Truck, MapPin, CreditCard, FileText, Key,
    Mail, Phone, Clock, ChevronRight,
    Upload, Download,
    Zap, Wifi, Server, HardDrive, AlertTriangle,
} from 'lucide-react';

interface SettingSection {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
}

const settingSections: SettingSection[] = [
    { id: 'notifications', label: 'การแจ้งเตือน', icon: Bell },
    { id: 'fleet', label: 'การตั้งค่ารถบริษัท', icon: Truck },
    { id: 'geofence', label: 'Geofence & พื้นที่', icon: MapPin },
    { id: 'integrations', label: 'เชื่อมต่อระบบ', icon: Zap },
];

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState('notifications');

    // Toggle states for notification settings
    const [notiOrder, setNotiOrder] = useState(true);
    const [notiTrip, setNotiTrip] = useState(true);
    const [notiMaint, setNotiMaint] = useState(true);
    const [notiHOS, setNotiHOS] = useState(true);
    const [notiDelay, setNotiDelay] = useState(true);
    const [notiEmail, setNotiEmail] = useState(false);
    const [notiLine, setNotiLine] = useState(true);
    const [notiSMS, setNotiSMS] = useState(false);

    // Fleet settings
    const [maxHOS, setMaxHOS] = useState('8');
    const [fuelAlert, setFuelAlert] = useState('20');
    const [maintInterval, setMaintInterval] = useState('10000');
    const [speedLimit, setSpeedLimit] = useState('90');



    const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
        <div
            onClick={onToggle}
            style={{
                width: '44px', height: '24px', borderRadius: '999px', cursor: 'pointer',
                background: enabled ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)',
                transition: 'background 0.2s ease', position: 'relative', flexShrink: 0,
            }}
        >
            <div style={{
                width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                position: 'absolute', top: '3px', transition: 'left 0.2s ease',
                left: enabled ? '23px' : '3px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }} />
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {


            case 'notifications':
                return (
                    <div className="animate-fade-in">
                        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>การแจ้งเตือน</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>กำหนดประเภทและช่องทางการแจ้งเตือน</p>

                        <div style={{ marginBottom: '28px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-secondary)' }}>🔔 ประเภทการแจ้งเตือน</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    { label: 'ออเดอร์ใหม่', desc: 'แจ้งเมื่อมีคำสั่งขนส่งเข้ามาใหม่', enabled: notiOrder, toggle: () => setNotiOrder(!notiOrder) },
                                    { label: 'อัปเดตทริป', desc: 'แจ้งเมื่อสถานะทริปเปลี่ยนแปลง (ออกรถ, ถึงปลายทาง)', enabled: notiTrip, toggle: () => setNotiTrip(!notiTrip) },
                                    { label: 'ซ่อมบำรุงใกล้กำหนด', desc: 'แจ้งก่อนถึงกำหนดซ่อมบำรุง 7 วัน', enabled: notiMaint, toggle: () => setNotiMaint(!notiMaint) },
                                    { label: 'HOS เกินโควต้า', desc: 'แจ้งเมื่อคนขับเกินชั่วโมงการทำงาน', enabled: notiHOS, toggle: () => setNotiHOS(!notiHOS) },
                                    { label: 'ทริปล่าช้า', desc: 'แจ้งเมื่อ ETA เลยเวลากำหนด 30 นาที', enabled: notiDelay, toggle: () => setNotiDelay(!notiDelay) },
                                ].map(item => (
                                    <div key={item.label} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '14px 16px', background: 'rgba(255,255,255,0.02)',
                                        borderRadius: '12px', border: '1px solid var(--border-color)',
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 600 }}>{item.label}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.desc}</div>
                                        </div>
                                        <ToggleSwitch enabled={item.enabled} onToggle={item.toggle} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-secondary)' }}>📨 ช่องทางการส่ง</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    { icon: Bell, label: 'In-App Notification', desc: 'แจ้งเตือนในระบบ (เปิดเสมอ)', enabled: true, toggle: () => { }, disabled: true },
                                    { icon: Mail, label: 'อีเมล', desc: 'ส่งไปที่ patinya@nexspeed.co.th', enabled: notiEmail, toggle: () => setNotiEmail(!notiEmail) },
                                    { icon: Phone, label: 'LINE Notify', desc: 'ส่งผ่าน LINE Group Token', enabled: notiLine, toggle: () => setNotiLine(!notiLine) },
                                    { icon: Phone, label: 'SMS', desc: 'ส่ง SMS (ค่าบริการเพิ่มเติม)', enabled: notiSMS, toggle: () => setNotiSMS(!notiSMS) },
                                ].map(item => (
                                    <div key={item.label} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '14px 16px', background: 'rgba(255,255,255,0.02)',
                                        borderRadius: '12px', border: '1px solid var(--border-color)',
                                        opacity: item.disabled ? 0.6 : 1,
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '10px',
                                                background: 'rgba(59,130,246,0.1)', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <item.icon size={18} style={{ color: 'var(--accent-blue)' }} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: 600 }}>{item.label}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.desc}</div>
                                            </div>
                                        </div>
                                        <ToggleSwitch enabled={item.enabled} onToggle={item.toggle} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'fleet':
                return (
                    <div className="animate-fade-in">
                        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>การตั้งค่ารถบริษัท</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>กำหนดค่ามาตรฐานสำหรับรถบริษัท, HOS, ซ่อมบำรุง</p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">🕐 จำกัดชั่วโมงขับ (HOS) ต่อวัน</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input className="form-input" type="number" value={maxHOS} onChange={e => setMaxHOS(e.target.value)} style={{ width: '120px' }} />
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ชั่วโมง (ตาม กฎ DLT สูงสุด 8 ชม.)</span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">⛽ แจ้งเตือนน้ำมันต่ำ</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input className="form-input" type="number" value={fuelAlert} onChange={e => setFuelAlert(e.target.value)} style={{ width: '120px' }} />
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>% ของถังน้ำมัน</span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">🔧 รอบบำรุงรักษา</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input className="form-input" type="number" value={maintInterval} onChange={e => setMaintInterval(e.target.value)} style={{ width: '120px' }} />
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>กม. ต่อรอบ</span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">🚨 จำกัดความเร็ว</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input className="form-input" type="number" value={speedLimit} onChange={e => setSpeedLimit(e.target.value)} style={{ width: '120px' }} />
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>กม./ชม.</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>ประเภทรถที่เปิดใช้งาน</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {['รถ 4 ล้อ', 'รถ 6 ล้อ', 'รถ 10 ล้อ', 'รถเทรลเลอร์', 'รถตู้', 'รถกระบะ', 'รถห้องเย็น', 'รถบรรทุกตู้คอนเทนเนอร์'].map(type => (
                                    <span key={type} style={{
                                        padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 500,
                                        background: 'rgba(59,130,246,0.08)', color: 'var(--accent-blue)',
                                        border: '1px solid rgba(59,130,246,0.2)', cursor: 'pointer',
                                    }}>
                                        ✓ {type}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(245,158,11,0.06)', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.15)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <AlertTriangle size={16} style={{ color: 'var(--accent-amber)' }} />
                                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-amber)' }}>Predictive Maintenance</span>
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                ระบบจะวิเคราะห์รูปแบบการใช้งานและพยากรณ์ช่วงเวลาที่ควรซ่อมบำรุงอัตโนมัติ (Phase 2 — AI Engine)
                            </p>
                        </div>
                    </div>
                );

            case 'integrations':
                return (
                    <div className="animate-fade-in">
                        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>เชื่อมต่อระบบภายนอก</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>API Integration & Third-party Services</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { name: 'GPS Tracking Provider', desc: 'AIS Fleet / TrueTrack GPS Monitoring', status: 'connected', icon: Wifi, color: 'var(--accent-green)' },
                                { name: 'Thai e-Tax (กรมสรรพากร)', desc: 'XML v2.0 — ใบกำกับภาษีอิเล็กทรอนิกส์', status: 'pending', icon: FileText, color: 'var(--accent-amber)' },
                                { name: 'LINE Notify', desc: 'แจ้งเตือนผ่าน LINE Group', status: 'connected', icon: Bell, color: 'var(--accent-green)' },
                                { name: 'Google Maps API', desc: 'Geocoding, Directions, Distance Matrix', status: 'connected', icon: MapPin, color: 'var(--accent-green)' },
                                { name: 'Payment Gateway (2C2P)', desc: 'ระบบรับชำระเงินออนไลน์', status: 'not-configured', icon: CreditCard, color: 'var(--text-muted)' },
                                { name: 'ERP / SAP', desc: 'เชื่อมต่อกับระบบ ERP หลัก', status: 'not-configured', icon: Server, color: 'var(--text-muted)' },
                                { name: 'DLT Gateway (กรมขนส่ง)', desc: 'ระบบติดตามรถบรรทุก GPS DLT', status: 'pending', icon: Shield, color: 'var(--accent-amber)' },
                            ].map(item => (
                                <div key={item.name} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '16px 18px', background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '12px', border: '1px solid var(--border-color)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{
                                            width: '42px', height: '42px', borderRadius: '10px',
                                            background: `${item.color}12`, display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <item.icon size={20} style={{ color: item.color }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 600 }}>{item.name}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.desc}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                                            background: item.status === 'connected' ? 'rgba(16,185,129,0.1)' : item.status === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(100,116,139,0.1)',
                                            color: item.status === 'connected' ? 'var(--accent-green)' : item.status === 'pending' ? 'var(--accent-amber)' : 'var(--text-muted)',
                                        }}>
                                            {item.status === 'connected' ? '✓ เชื่อมต่อแล้ว' : item.status === 'pending' ? '⏳ รอตั้งค่า' : '○ ยังไม่ตั้งค่า'}
                                        </span>
                                        <button className="btn btn-secondary btn-sm">ตั้งค่า</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );



            case 'geofence':
                return (
                    <div className="animate-fade-in">
                        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Geofence & พื้นที่</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>กำหนดพื้นที่ Geofence สำหรับแจ้งเตือนเข้า-ออกจุดโหลด/ส่ง</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                            {[
                                { name: 'สำนักงานใหญ่ สระบุรี', lat: '14.5286', lng: '100.9103', radius: '500', type: 'สำนักงาน', status: true },
                                { name: 'ท่าเรือแหลมฉบัง', lat: '13.0817', lng: '100.8908', radius: '1000', type: 'ท่าเรือ', status: true },
                                { name: 'นิคมอุตฯ ลาดกระบัง', lat: '13.7274', lng: '100.7767', radius: '800', type: 'นิคมอุตสาหกรรม', status: true },
                                { name: 'คลังสินค้า ชลบุรี', lat: '13.3622', lng: '100.9847', radius: '300', type: 'คลังสินค้า', status: true },
                                { name: 'จุดพักรถ นครราชสีมา', lat: '14.9799', lng: '102.0977', radius: '200', type: 'จุดพักรถ', status: false },
                            ].map(zone => (
                                <div key={zone.name} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '16px 18px', background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '12px', border: '1px solid var(--border-color)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{
                                            width: '42px', height: '42px', borderRadius: '10px',
                                            background: zone.status ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <MapPin size={20} style={{ color: zone.status ? 'var(--accent-green)' : 'var(--text-muted)' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 600 }}>{zone.name}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                {zone.lat}, {zone.lng} — รัศมี {zone.radius} ม. — <span style={{ color: 'var(--accent-blue)' }}>{zone.type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <ToggleSwitch enabled={zone.status} onToggle={() => { }} />
                                        <button className="btn btn-secondary btn-sm">แก้ไข</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div className="form-group">
                                <label className="form-label">🔔 แจ้งเตือนเมื่อเข้า Geofence</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <ToggleSwitch enabled={true} onToggle={() => { }} />
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ส่งแจ้งเตือนทันทีเมื่อรถเข้าพื้นที่</span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">🔔 แจ้งเตือนเมื่อออกจาก Geofence</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <ToggleSwitch enabled={true} onToggle={() => { }} />
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ส่งแจ้งเตือนทันทีเมื่อรถออกจากพื้นที่</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-primary btn-sm"><MapPin size={14} /> เพิ่ม Geofence ใหม่</button>
                            <button className="btn btn-secondary btn-sm"><Upload size={14} /> นำเข้าจาก KML</button>
                        </div>
                    </div>
                );



            default:
                return (
                    <div className="animate-fade-in" style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{ fontSize: '42px', marginBottom: '12px' }}>⚙️</div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
                            {settingSections.find(s => s.id === activeSection)?.label}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                            ส่วนนี้กำลังพัฒนาเพิ่มเติม
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px' }}>
                {/* Settings Nav */}
                <div className="card" style={{ padding: '8px', height: 'fit-content', position: 'sticky', top: '88px' }}>
                    {settingSections.map(section => (
                        <div
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                                background: activeSection === section.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                                color: activeSection === section.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
                                transition: 'all 0.15s ease', fontSize: '13px', fontWeight: 500,
                            }}
                        >
                            <section.icon size={18} />
                            <span style={{ flex: 1 }}>{section.label}</span>
                            {section.badge && (
                                <span style={{
                                    fontSize: '11px', fontWeight: 600, padding: '1px 7px',
                                    borderRadius: '999px', background: 'rgba(59,130,246,0.15)',
                                    color: 'var(--accent-blue)',
                                }}>{section.badge}</span>
                            )}
                            {activeSection === section.id && <ChevronRight size={14} />}
                        </div>
                    ))}
                </div>

                {/* Settings Content */}
                <div className="card">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
