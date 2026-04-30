'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Search, CheckCircle, AlertTriangle, Clock, Shield, FileText, Fuel, Wrench, CreditCard, ChevronLeft, ChevronRight, X, Check, FileSpreadsheet, Download } from 'lucide-react';
import { api, Vehicle, Driver } from '@/services/api';

// ========== Types ==========
interface Alert {
    id: string;
    category: string;
    type: string;
    title: string;
    description: string;
    relatedId: string;      // vehicle/driver ID
    relatedName: string;    // plate or name
    dueDate: string;
    severity: 'critical' | 'warning' | 'info';
    isRead: boolean;
    isDismissed: boolean;
    createdAt: string;
}

const categoryConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    insurance: { icon: <Shield size={16} />, label: '🛡️ ต่อประกัน', color: 'var(--accent-red)' },
    tax: { icon: <FileText size={16} />, label: '📄 ต่อภาษี', color: 'var(--accent-amber)' },
    license: { icon: <CreditCard size={16} />, label: '🪪 ต่อใบขับขี่', color: 'var(--accent-purple)' },
    billing: { icon: <FileText size={16} />, label: '📋 วางบิล', color: 'var(--accent-blue)' },
    collection: { icon: <CreditCard size={16} />, label: '💰 เก็บเงิน', color: 'var(--accent-green)' },
    repair: { icon: <Wrench size={16} />, label: '🔧 ซ่อมรถ', color: 'var(--accent-red)' },
    oil_change: { icon: <Fuel size={16} />, label: '🛢️ เปลี่ยนถ่ายน้ำมัน', color: 'var(--accent-amber)' },
    inspection: { icon: <CheckCircle size={16} />, label: '🔍 ตรวจสภาพรถ', color: 'var(--accent-blue)' },
    tire: { icon: <Wrench size={16} />, label: '🛞 เปลี่ยนยาง', color: 'var(--accent-purple)' },
    other: { icon: <Bell size={16} />, label: '📌 อื่นๆ', color: 'var(--text-muted)' },
};

const severityConfig: Record<string, { label: string; badge: string; color: string }> = {
    critical: { label: 'เร่งด่วน', badge: 'red', color: 'var(--accent-red)' },
    warning: { label: '🟡 ใกล้ครบกำหนด', badge: 'warning', color: 'var(--accent-amber)' },
    info: { label: '🔵 แจ้งเตือน', badge: 'blue', color: 'var(--accent-blue)' },
};

// Mock alert generator
function generateAlerts(vehicles: Vehicle[], drivers: Driver[]): Alert[] {
    const alerts: Alert[] = [];
    let id = 1;
    const now = new Date();

    // Insurance alerts
    vehicles.forEach(v => {
        const exp = new Date(v.insuranceExpiry);
        const daysLeft = Math.floor((exp.getTime() - now.getTime()) / 86400000);
        if (daysLeft <= 90) {
            alerts.push({
                id: `ALT-${String(id++).padStart(4, '0')}`,
                category: 'insurance',
                type: 'vehicle',
                title: `ประกันภัย ${v.plateNumber} ใกล้หมดอายุ`,
                description: `ประกันภัยรถ ${v.id} (${v.plateNumber}) จะหมดอายุในอีก ${daysLeft} วัน (${v.insuranceExpiry})`,
                relatedId: v.id,
                relatedName: v.plateNumber,
                dueDate: v.insuranceExpiry,
                severity: daysLeft <= 14 ? 'critical' : daysLeft <= 30 ? 'warning' : 'info',
                isRead: Math.random() > 0.5,
                isDismissed: false,
                createdAt: new Date(now.getTime() - Math.random() * 7 * 86400000).toISOString(),
            });
        }
    });

    // Tax alerts (mock ~6 months from now)
    vehicles.slice(0, 5).forEach(v => {
        const dueDate = new Date(now);
        dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) + 5);
        alerts.push({
            id: `ALT-${String(id++).padStart(4, '0')}`,
            category: 'tax',
            type: 'vehicle',
            title: `ต่อภาษีรถ ${v.plateNumber}`,
            description: `ถึงกำหนดชำระภาษีรถประจำปี ${v.id} (${v.plateNumber})`,
            relatedId: v.id,
            relatedName: v.plateNumber,
            dueDate: dueDate.toISOString().split('T')[0],
            severity: 'warning',
            isRead: false,
            isDismissed: false,
            createdAt: new Date(now.getTime() - Math.random() * 3 * 86400000).toISOString(),
        });
    });

    // Driver license alerts
    drivers.forEach(d => {
        const exp = new Date(d.licenseExpiry);
        const daysLeft = Math.floor((exp.getTime() - now.getTime()) / 86400000);
        if (daysLeft <= 120) {
            alerts.push({
                id: `ALT-${String(id++).padStart(4, '0')}`,
                category: 'license',
                type: 'driver',
                title: `ใบขับขี่ ${d.name} ใกล้หมดอายุ`,
                description: `ใบขับขี่ประเภท ${d.licenseType} ของ ${d.name} (${d.id}) จะหมดอายุในอีก ${daysLeft} วัน`,
                relatedId: d.id,
                relatedName: d.name,
                dueDate: d.licenseExpiry,
                severity: daysLeft <= 30 ? 'critical' : 'warning',
                isRead: Math.random() > 0.3,
                isDismissed: false,
                createdAt: new Date(now.getTime() - Math.random() * 5 * 86400000).toISOString(),
            });
        }
    });

    // Maintenance/Oil change alerts
    vehicles.forEach(v => {
        const nextMaint = new Date(v.nextMaintenance);
        const daysLeft = Math.floor((nextMaint.getTime() - now.getTime()) / 86400000);
        if (daysLeft <= 30) {
            alerts.push({
                id: `ALT-${String(id++).padStart(4, '0')}`,
                category: v.mileage % 20000 < 10000 ? 'oil_change' : 'repair',
                type: 'vehicle',
                title: `${v.mileage % 20000 < 10000 ? 'เปลี่ยนถ่ายน้ำมัน' : 'บำรุงรักษา'} ${v.plateNumber}`,
                description: `รถ ${v.id} (${v.plateNumber}) ครบกำหนด${v.mileage % 20000 < 10000 ? 'เปลี่ยนถ่ายน้ำมันเครื่อง' : 'บำรุงรักษาตามระยะ'} (ไมล์ ${v.mileage.toLocaleString()} กม.)`,
                relatedId: v.id,
                relatedName: v.plateNumber,
                dueDate: v.nextMaintenance,
                severity: daysLeft <= 7 ? 'critical' : 'warning',
                isRead: false,
                isDismissed: false,
                createdAt: new Date(now.getTime() - Math.random() * 2 * 86400000).toISOString(),
            });
        }
    });

    // Billing alerts
    for (let i = 0; i < 4; i++) {
        const dueDate = new Date(now);
        dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 15) - 5);
        const daysLeft = Math.floor((dueDate.getTime() - now.getTime()) / 86400000);
        alerts.push({
            id: `ALT-${String(id++).padStart(4, '0')}`,
            category: i < 2 ? 'billing' : 'collection',
            type: 'finance',
            title: i < 2 ? `วางบิลครบกำหนด INV-${2026}${String(i + 1).padStart(3, '0')}` : `เก็บเงินครบกำหนด RCV-${2026}${String(i + 1).padStart(3, '0')}`,
            description: i < 2 ? `ถึงกำหนดวางบิลลูกค้า จำนวน ฿${(50000 + Math.random() * 200000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : `ถึงกำหนดเก็บเงิน จำนวน ฿${(30000 + Math.random() * 150000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
            relatedId: `INV-${i + 1}`,
            relatedName: '',
            dueDate: dueDate.toISOString().split('T')[0],
            severity: daysLeft <= 0 ? 'critical' : daysLeft <= 7 ? 'warning' : 'info',
            isRead: false,
            isDismissed: false,
            createdAt: new Date(now.getTime() - Math.random() * 5 * 86400000).toISOString(),
        });
    }

    // Tire & Inspection
    vehicles.slice(0, 3).forEach((v, i) => {
        const dueDate = new Date(now);
        dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 20) + 1);
        alerts.push({
            id: `ALT-${String(id++).padStart(4, '0')}`,
            category: i === 0 ? 'tire' : 'inspection',
            type: 'vehicle',
            title: `${i === 0 ? 'เปลี่ยนยาง' : 'ตรวจสภาพรถ'} ${v.plateNumber}`,
            description: `${i === 0 ? 'ยางหมดอายุ' : 'ครบกำหนดตรวจสภาพประจำปี'} รถ ${v.plateNumber}`,
            relatedId: v.id,
            relatedName: v.plateNumber,
            dueDate: dueDate.toISOString().split('T')[0],
            severity: 'info',
            isRead: true,
            isDismissed: false,
            createdAt: new Date(now.getTime() - Math.random() * 3 * 86400000).toISOString(),
        });
    });

    return alerts.sort((a, b) => {
        // Critical first, then by date
        const sOrder = { critical: 0, warning: 1, info: 2 };
        if (sOrder[a.severity] !== sOrder[b.severity]) return sOrder[a.severity] - sOrder[b.severity];
        return a.dueDate.localeCompare(b.dueDate);
    });
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterSeverity, setFilterSeverity] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const perPage = 12;

    useEffect(() => {
        (async () => {
            try {
                const [vehicles, drivers] = await Promise.all([api.getVehicles(), api.getDrivers()]);
                setAlerts(generateAlerts(vehicles, drivers));
            } catch { /* ignore */ }
            setLoading(false);
        })();
    }, []);

    // Filters
    const activeAlerts = alerts.filter(a => !a.isDismissed);
    const filtered = activeAlerts.filter(a => {
        if (filterCategory !== 'all' && a.category !== filterCategory) return false;
        if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
        if (search) {
            const q = search.toLowerCase();
            return a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) ||
                a.relatedId.toLowerCase().includes(q) || a.relatedName.toLowerCase().includes(q);
        }
        return true;
    });

    const totalPages = Math.ceil(filtered.length / perPage);
    const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

    // KPIs
    const critical = activeAlerts.filter(a => a.severity === 'critical').length;
    const warning = activeAlerts.filter(a => a.severity === 'warning').length;
    const info = activeAlerts.filter(a => a.severity === 'info').length;
    const unread = activeAlerts.filter(a => !a.isRead).length;

    // Handlers
    const markRead = (id: string) => {
        setAlerts(alerts.map(a => a.id === id ? { ...a, isRead: true } : a));
    };
    const dismiss = (id: string) => {
        setAlerts(alerts.map(a => a.id === id ? { ...a, isDismissed: true } : a));
    };
    const markAllRead = () => {
        setAlerts(alerts.map(a => ({ ...a, isRead: true })));
    };

    const [now] = useState(() => Date.now());

    const getDaysLeft = (dueDate: string) => {
        const days = Math.floor((new Date(dueDate).getTime() - now) / 86400000);
        if (days < 0) return <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>เลยกำหนด {Math.abs(days)} วัน</span>;
        if (days === 0) return <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>วันนี้!</span>;
        if (days <= 7) return <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>อีก {days} วัน</span>;
        return <span style={{ color: 'var(--text-secondary)' }}>อีก {days} วัน</span>;
    };

    // ===== Export =====
    const exportCSV = () => {
        const header = 'รหัส,หมวดหมู่,ระดับ,หัวข้อ,วันครบกำหนด,รหัสอ้างอิง\n';
        const rows = filtered.map(a => `${a.id},${categoryConfig[a.category]?.label || a.category},${severityConfig[a.severity]?.label || a.severity},${a.title},${a.dueDate},${a.relatedId}`).join('\n');
        const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const el = document.createElement('a'); el.href = url; el.download = 'alerts.csv'; el.click(); URL.revokeObjectURL(url);
    };
    const exportXLSX = async () => {
        const XLSX = await import('xlsx');
        if (!filtered.length) { alert('ไม่มีข้อมูลสำหรับ export'); return; }
        const wsData = [
            ['รหัส', 'หมวดหมู่', 'ระดับ', 'หัวข้อ', 'วันครบกำหนด', 'รหัสอ้างอิง'],
            ...filtered.map(a => [a.id, categoryConfig[a.category]?.label || a.category, severityConfig[a.severity]?.label || a.severity, a.title, a.dueDate, a.relatedId])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [{ wch: 12 }, { wch: 18 }, { wch: 16 }, { wch: 30 }, { wch: 12 }, { wch: 12 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'แจ้งเตือน');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const el = document.createElement('a'); el.href = url; el.download = `nexspeed_alerts_${new Date().toISOString().slice(0,10)}.xlsx`; el.click(); URL.revokeObjectURL(url);
    };
    const exportPDF = async () => {
        const { default: jsPDF } = await import('jspdf');
        if (!filtered.length) { alert('ไม่มีข้อมูลสำหรับ export'); return; }
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(16);
        doc.text('Alerts Report - NexSpeed', 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString('th-TH')} ${new Date().toLocaleTimeString('th-TH')}`, 14, 22);
        let y = 32;
        const headers = ['ID', 'Category', 'Severity', 'Title', 'Due Date', 'Related ID'];
        const colX = [14, 40, 80, 110, 210, 245];
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        headers.forEach((h, i) => doc.text(h, colX[i], y));
        doc.setFont('helvetica', 'normal');
        y += 6;
        filtered.forEach(a => {
            if (y > 190) { doc.addPage(); y = 20; }
            const row = [a.id, a.category, a.severity, a.title.substring(0, 40), a.dueDate, a.relatedId];
            row.forEach((val, i) => doc.text(val, colX[i], y));
            y += 5;
        });
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        const el = document.createElement('a'); el.href = url; el.download = `nexspeed_alerts_${new Date().toISOString().slice(0,10)}.pdf`; el.click(); URL.revokeObjectURL(url);
    };

    const eBtnStyle = (c: string): React.CSSProperties => ({
        display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px',
        background: 'transparent', border: `1.5px solid ${c}30`, borderRadius: '8px',
        color: c, fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div className="loading-spinner" /></div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* ScoreCards — FleetPage style */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                {[
                    { icon: <AlertTriangle size={22} />, color: '#ef4444', label: 'เร่งด่วน', value: String(critical), sub: 'รายการ', bg: 'rgba(239,68,68,0.07)' },
                    { icon: <Clock size={22} />, color: '#f59e0b', label: 'ใกล้ครบกำหนด', value: String(warning), sub: 'รายการ', bg: 'rgba(245,158,11,0.07)' },
                    { icon: <Bell size={22} />, color: '#3b82f6', label: 'แจ้งเตือนทั่วไป', value: String(info), sub: 'รายการ', bg: 'rgba(59,130,246,0.07)' },
                    { icon: <Bell size={22} />, color: '#8b5cf6', label: 'ยังไม่อ่าน', value: String(unread), sub: 'รายการ', bg: 'rgba(139,92,246,0.07)' },
                    { icon: <CheckCircle size={22} />, color: '#10b981', label: 'ทั้งหมด', value: String(activeAlerts.length), sub: 'รายการ', bg: 'rgba(16,185,129,0.07)' },
                ].map((card, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '16px 18px', borderRadius: '14px',
                        background: card.bg, border: '1px solid transparent', transition: 'all 0.2s',
                    }}>
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '12px',
                            background: `${card.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: card.color, flexShrink: 0,
                        }}>
                            {card.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '2px' }}>{card.label}</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                <span style={{ fontSize: '22px', fontWeight: 700, color: card.color }}>{card.value}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{card.sub}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Export + Search + Filter — FleetPage single row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <button onClick={exportXLSX} style={eBtnStyle('#10b981')}><FileSpreadsheet size={14} /> XLSX</button>
                <button onClick={exportCSV} style={eBtnStyle('#10b981')}><FileText size={14} /> CSV</button>
                <button onClick={exportPDF} style={eBtnStyle('#ef4444')}><Download size={14} /> PDF</button>
                <div style={{ flex: 1 }} />
                <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                    style={{ padding: '7px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, border: '1.5px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontFamily: 'inherit', cursor: 'pointer', outline: 'none', minWidth: '160px' }}>
                    <option value="all">ทุกหมวดหมู่</option>
                    {Object.entries(categoryConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select value={filterSeverity} onChange={e => { setFilterSeverity(e.target.value); setCurrentPage(1); }}
                    style={{ padding: '7px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, border: '1.5px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontFamily: 'inherit', cursor: 'pointer', outline: 'none', minWidth: '160px' }}>
                    <option value="all">ทุกระดับ</option>
                    {Object.entries(severityConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <div className="topbar-search" style={{ minWidth: '180px' }}>
                    <Search size={16} />
                    <input placeholder="ค้นหา ทะเบียน, ชื่อ..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
                </div>
                {unread > 0 && (
                    <button onClick={markAllRead}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: 'none', background: 'var(--accent-blue)', color: 'white', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
                        <Check size={14} /> อ่านทั้งหมด
                    </button>
                )}
            </div>

            {/* Alert Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {paged.map(alert => {
                    const cat = categoryConfig[alert.category] || categoryConfig.other;
                    const sev = severityConfig[alert.severity];
                    return (
                        <div key={alert.id} className="card"
                            onClick={() => { markRead(alert.id); setSelectedAlert(alert); }}
                            style={{
                                padding: '14px 18px', cursor: 'pointer',
                                borderLeft: `4px solid ${sev.color}`,
                                background: alert.isRead ? undefined : 'rgba(59, 130, 246, 0.03)',
                                transition: 'all 0.15s',
                            }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                                {/* Icon */}
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px',
                                    background: `${cat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: cat.color, flexShrink: 0, fontSize: '18px',
                                }}>
                                    {cat.icon}
                                </div>
                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: alert.isRead ? 500 : 700, fontSize: '14px' }}>{alert.title}</span>
                                        {!alert.isRead && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-blue)', flexShrink: 0 }} />}
                                    </div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{alert.description}</p>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                        <span className={`status-badge ${sev.badge}`} style={{ fontSize: '10px', padding: '2px 6px' }}>{sev.label}</span>
                                        <span>{cat.label}</span>
                                        <span>📅 {alert.dueDate}</span>
                                        <span>{getDaysLeft(alert.dueDate)}</span>
                                    </div>
                                </div>
                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                    <button className="btn-icon" title="ปิด" onClick={e => { e.stopPropagation(); dismiss(alert.id); }}
                                        style={{ width: '28px', height: '28px' }}>
                                        <X size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {paged.length === 0 && (
                    <div className="empty-state" style={{ padding: '60px 20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔔</div>
                        <h3 className="empty-state-title">ไม่มีการแจ้งเตือน</h3>
                        <p className="empty-state-text">ยังไม่มีรายการที่ต้องดำเนินการ</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>แสดง {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filtered.length)} จาก {filtered.length}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '6px 10px' }}><ChevronLeft size={14} /></button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                            <button key={p} className={`btn ${currentPage === p ? 'btn-primary' : ''}`} onClick={() => setCurrentPage(p)} style={{ padding: '6px 12px', minWidth: '36px' }}>{p}</button>
                        ))}
                        <button className="btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '6px 10px' }}><ChevronRight size={14} /></button>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedAlert && (
                <div className="modal-backdrop" onClick={() => setSelectedAlert(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">🔔 รายละเอียดแจ้งเตือน</h3>
                            <button className="modal-close" onClick={() => setSelectedAlert(null)}><X size={18} /></button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {[
                                    ['รหัส', selectedAlert.id],
                                    ['หมวดหมู่', categoryConfig[selectedAlert.category]?.label || selectedAlert.category],
                                    ['ระดับ', severityConfig[selectedAlert.severity]?.label || selectedAlert.severity],
                                    ['วันครบกำหนด', selectedAlert.dueDate],
                                    ['รหัสอ้างอิง', selectedAlert.relatedId],
                                    ['ชื่อ/ทะเบียน', selectedAlert.relatedName || '-'],
                                ].map(([label, value], i) => (
                                    <div key={i} style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
                                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{value}</div>
                                    </div>
                                ))}
                                <div style={{ gridColumn: 'span 2', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>รายละเอียด</div>
                                    <div style={{ fontSize: '13px', lineHeight: 1.6 }}>{selectedAlert.description}</div>
                                </div>
                                <div style={{ gridColumn: 'span 2', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>ระยะเวลา</div>
                                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{getDaysLeft(selectedAlert.dueDate)}</div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn" onClick={() => { dismiss(selectedAlert.id); setSelectedAlert(null); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <X size={14} /> ปิดการแจ้งเตือน
                            </button>
                            <button className="btn btn-primary" onClick={() => setSelectedAlert(null)}>ปิด</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
