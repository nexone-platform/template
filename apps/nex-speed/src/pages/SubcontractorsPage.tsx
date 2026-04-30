'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Eye, Pencil, Trash2, X, Handshake, Award, Truck, Shield, FileSpreadsheet, FileText, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, LayoutGrid, List, Activity, Phone, Building2 } from 'lucide-react';
import { api, Subcontractor } from '@/services/api';

// Download helper
async function triggerDownload(blob: Blob, filename: string) {
    if ('showSaveFilePicker' in window) {
        try {
            const ext = filename.split('.').pop() || '';
            const types: Record<string, { description: string; accept: Record<string, string[]> }> = {
                xlsx: { description: 'Excel', accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] } },
                csv: { description: 'CSV', accept: { 'text/csv': ['.csv'] } },
                pdf: { description: 'PDF', accept: { 'application/pdf': ['.pdf'] } },
            };
            const handle = await (window as unknown as { showSaveFilePicker: (opts: unknown) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
                suggestedName: filename, types: types[ext] ? [types[ext]] : [],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return;
        } catch (e) { if ((e as DOMException).name === 'AbortError') return; }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

function dateStr() {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
}

const tierLabels: Record<string, string> = { gold: '🥇 Gold', silver: '🥈 Silver', bronze: '🥉 Bronze' };
const tierColors: Record<string, string> = { gold: '#f59e0b', silver: '#94a3b8', bronze: '#cd7f32' };
const statusLabels: Record<string, string> = { active: 'ใช้งาน', suspended: 'ระงับ', 'pending-approval': '⏳ รออนุมัติ' };
const statusColors: Record<string, string> = { active: 'completed', suspended: 'inactive', 'pending-approval': 'pending' };
const statusText: Record<string, string> = { active: 'ใช้งาน', suspended: 'ระงับ', 'pending-approval': 'รออนุมัติ' };
const tierOptions = [
    { value: 'gold', label: 'Gold' },
    { value: 'silver', label: 'Silver' },
    { value: 'bronze', label: 'Bronze' },
];
const statusOptions = [
    { value: 'active', label: 'ใช้งาน' },
    { value: 'suspended', label: 'ระงับ' },
    { value: 'pending-approval', label: 'รออนุมัติ' },
];

const emptyForm = {
    id: '', companyName: '', contactPerson: '', phone: '', tier: 'silver',
    vehicleCount: 0, performanceScore: 0, onTimeRate: 0, bounceRate: 0,
    status: 'active', totalTrips: 0, licenseValid: true, insuranceValid: true, joinDate: '',
};

// Shared styles
const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)',
    marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px',
};
const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '14px',
    border: '1.5px solid var(--border-color)', background: 'var(--bg-primary)',
    color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s',
};

// Reusable components
function ScoreCard({ icon, color, label, value, sub, bg }: { icon: React.ReactNode; color: string; label: string; value: string; sub: string; bg: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', borderRadius: '14px', background: bg, border: '1px solid transparent', transition: 'all 0.2s' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
            <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '22px', fontWeight: 700, color }}>{value}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub}</span>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ color: 'var(--text-muted)', width: '20px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
            <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</div>
                <div style={{ fontSize: '14px', fontWeight: highlight ? 700 : 500, color: highlight ? 'var(--accent-blue)' : 'var(--text-primary)' }}>{value}</div>
            </div>
        </div>
    );
}

// Styles
const actionBtnStyle: React.CSSProperties = {
    background: 'none', border: '1px solid var(--border-color)', borderRadius: '8px',
    padding: '6px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
};
const exportBtnStyle = (c: string): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px',
    background: 'transparent', border: `1.5px solid ${c}30`, borderRadius: '8px',
    color: c, fontSize: '12px', fontWeight: 600, cursor: 'pointer',
});
const closeBtnStyle: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
    padding: '4px', borderRadius: '8px',
};
const pageBtnStyle = (disabled: boolean): React.CSSProperties => ({
    padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--border-color)',
    background: disabled ? 'transparent' : 'var(--bg-card)', color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
    cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
});
const viewToggleStyle: React.CSSProperties = {
    padding: '6px 8px', border: 'none', borderRadius: '6px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
};

function pageNumbers(current: number, total: number): (number | string)[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | string)[] = [1];
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    if (total > 1) pages.push(total);
    return pages;
}

export default function SubcontractorsPage() {
    const [subs, setSubs] = useState<Subcontractor[]>([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedSub, setSelectedSub] = useState<Subcontractor | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const loadData = useCallback(() => {
        setLoading(true);
        api.getSubcontractors().then(s => { setSubs(s || []); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const filtered = subs.filter(s => {
        const matchFilter = filter === 'all' || s.status === filter;
        const matchSearch = search === '' ||
            s.companyName.toLowerCase().includes(search.toLowerCase()) ||
            s.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
            s.id.toLowerCase().includes(search.toLowerCase()) ||
            s.phone.includes(search);
        return matchFilter && matchSearch;
    });

    const counts = {
        all: subs.length,
        active: subs.filter(s => s.status === 'active').length,
        suspended: subs.filter(s => s.status === 'suspended').length,
        pending: subs.filter(s => s.status === 'pending-approval').length,
    };

    const totalVehicles = subs.reduce((a, s) => a + s.vehicleCount, 0);
    const totalTrips = subs.reduce((a, s) => a + s.totalTrips, 0);
    const avgScore = subs.length > 0 ? Math.round(subs.reduce((a, s) => a + s.performanceScore, 0) / subs.length) : 0;
    const avgOTD = subs.length > 0 ? Math.round(subs.reduce((a, s) => a + s.onTimeRate, 0) / subs.length) : 0;

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

    // Selection
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
    };
    const toggleSelectAll = () => {
        if (selectedIds.size === filtered.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(filtered.map(s => s.id)));
    };
    const getExportData = () => selectedIds.size > 0 ? filtered.filter(s => selectedIds.has(s.id)) : filtered;

    // ===== Export =====
    const exportCSV = () => {
        const data = getExportData();
        if (!data.length) { alert('ไม่มีข้อมูลสำหรับ export'); return; }
        const header = 'ID,บริษัท,ผู้ติดต่อ,โทร,Tier,จำนวนรถ,Score,OTD(%),ทริปรวม,สถานะ';
        const rows = data.map(s => [s.id, `"${s.companyName}"`, `"${s.contactPerson}"`, s.phone, s.tier, s.vehicleCount, s.performanceScore, s.onTimeRate, s.totalTrips, `"${statusText[s.status] || s.status}"`].join(','));
        const blob = new Blob(['\uFEFF' + header + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
        triggerDownload(blob, `nexspeed_subcontractors_${dateStr()}.csv`);
    };

    const exportXLSX = async () => {
        const data = getExportData();
        if (!data.length) { alert('ไม่มีข้อมูลสำหรับ export'); return; }
        const XLSX = await import('xlsx');
        const wsData = [
            ['ID', 'บริษัท', 'ผู้ติดต่อ', 'โทร', 'Tier', 'จำนวนรถ', 'Score', 'OTD(%)', 'Bounce(%)', 'ทริปรวม', 'ใบอนุญาต', 'ประกัน', 'สถานะ'],
            ...data.map(s => [s.id, s.companyName, s.contactPerson, s.phone, s.tier, s.vehicleCount, s.performanceScore, s.onTimeRate, s.bounceRate, s.totalTrips, s.licenseValid ? 'Valid' : 'Invalid', s.insuranceValid ? 'Valid' : 'Invalid', statusText[s.status] || s.status])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [{ wch: 8 }, { wch: 24 }, { wch: 18 }, { wch: 14 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'การจัดการรถร่วม');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        triggerDownload(blob, `nexspeed_subcontractors_${dateStr()}.xlsx`);
    };

    const exportPDF = async () => {
        const data = getExportData();
        if (!data.length) { alert('ไม่มีข้อมูลสำหรับ export'); return; }
        const { default: jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        try {
            const fontRes = await fetch('/fonts/Sarabun-Regular.ttf');
            const fontBuf = await fontRes.arrayBuffer();
            const fontBase64 = btoa(String.fromCharCode(...new Uint8Array(fontBuf)));
            doc.addFileToVFS('Sarabun-Regular.ttf', fontBase64);
            doc.addFont('Sarabun-Regular.ttf', 'Sarabun', 'normal');
            doc.setFont('Sarabun');
        } catch { /* fallback */ }
        doc.setFontSize(16);
        doc.text('รายงานการจัดการรถร่วม NexSpeed', 14, 15);
        doc.setFontSize(10);
        doc.text(`สร้างเมื่อ: ${new Date().toLocaleDateString('th-TH')} ${new Date().toLocaleTimeString('th-TH')}`, 14, 22);
        const tableData = data.map(s => [s.id, s.companyName, s.contactPerson, s.phone, s.tier.toUpperCase(), String(s.vehicleCount), String(s.performanceScore), `${s.onTimeRate}%`, String(s.totalTrips), statusText[s.status] || s.status]);
        autoTable(doc, {
            startY: 28,
            head: [['รหัส', 'บริษัท', 'ผู้ติดต่อ', 'โทร', 'Tier', 'รถ', 'Score', 'OTD', 'ทริป', 'สถานะ']],
            body: tableData,
            styles: { fontSize: 9, cellPadding: 2, font: 'Sarabun' },
            headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: 'normal', font: 'Sarabun' },
            alternateRowStyles: { fillColor: [245, 247, 250] },
        });
        const pdfBlob = doc.output('blob');
        triggerDownload(pdfBlob, `nexspeed_subcontractors_${dateStr()}.pdf`);
    };

    // ===== Handlers =====
    const handleAdd = () => { setForm(emptyForm); setFormErrors({}); setShowAddModal(true); };
    const handleView = (s: Subcontractor) => { setSelectedSub(s); setShowViewModal(true); };
    const handleEdit = (s: Subcontractor) => {
        setSelectedSub(s);
        setForm({
            id: s.id, companyName: s.companyName, contactPerson: s.contactPerson, phone: s.phone,
            tier: s.tier, vehicleCount: s.vehicleCount, performanceScore: s.performanceScore,
            onTimeRate: s.onTimeRate, bounceRate: s.bounceRate, status: s.status,
            totalTrips: s.totalTrips, licenseValid: s.licenseValid, insuranceValid: s.insuranceValid,
            joinDate: s.joinDate || '',
        });
        setFormErrors({});
        setShowEditModal(true);
    };
    const handleDeleteClick = (s: Subcontractor) => { setSelectedSub(s); setShowDeleteConfirm(true); };

    const validateForm = (mode: 'add' | 'edit'): boolean => {
        const errors: Record<string, string> = {};
        if (mode === 'add' && !form.id.trim()) errors.id = 'กรุณาระบุรหัส';
        if (!form.companyName.trim()) errors.companyName = 'กรุณาระบุชื่อบริษัท';
        if (!form.contactPerson.trim()) errors.contactPerson = 'กรุณาระบุผู้ติดต่อ';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveNew = async () => {
        if (!validateForm('add')) return;
        setSaving(true);
        try {
            await api.createSubcontractor({
                id: form.id, companyName: form.companyName, contactPerson: form.contactPerson,
                phone: form.phone, tier: form.tier, vehicleCount: form.vehicleCount,
                performanceScore: form.performanceScore, onTimeRate: form.onTimeRate,
                bounceRate: form.bounceRate, status: form.status, totalTrips: form.totalTrips,
                licenseValid: form.licenseValid, insuranceValid: form.insuranceValid,
                joinDate: form.joinDate,
            });
            setShowAddModal(false); loadData();
        } catch { /* */ }
        setSaving(false);
    };

    const handleSaveEdit = async () => {
        if (!selectedSub) return;
        if (!validateForm('edit')) return;
        setSaving(true);
        try {
            await api.updateSubcontractor(selectedSub.id, {
                companyName: form.companyName, contactPerson: form.contactPerson,
                phone: form.phone, tier: form.tier, vehicleCount: form.vehicleCount,
                performanceScore: form.performanceScore, onTimeRate: form.onTimeRate,
                bounceRate: form.bounceRate, status: form.status, totalTrips: form.totalTrips,
                licenseValid: form.licenseValid, insuranceValid: form.insuranceValid,
            });
            setShowEditModal(false); loadData();
        } catch { /* */ }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!selectedSub) return;
        setSaving(true);
        try { await api.deleteSubcontractor(selectedSub.id); setShowDeleteConfirm(false); loadData(); } catch { /* */ }
        setSaving(false);
    };

    // ===== Form =====
    const renderFormFields = (mode: 'add' | 'edit') => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {mode === 'add' && (
                <div>
                    <label style={labelStyle}>รหัส *</label>
                    <input style={{ ...inputStyle, ...(formErrors.id ? { borderColor: '#ef4444' } : {}) }} value={form.id} onChange={e => { setForm(p => ({ ...p, id: e.target.value })); setFormErrors(p => { const n = { ...p }; delete n.id; return n; }); }} placeholder="เช่น SUB-006" />
                    {formErrors.id && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.id}</span>}
                </div>
            )}
            <div>
                <label style={labelStyle}>ชื่อบริษัท *</label>
                <input style={{ ...inputStyle, ...(formErrors.companyName ? { borderColor: '#ef4444' } : {}) }} value={form.companyName} onChange={e => { setForm(p => ({ ...p, companyName: e.target.value })); setFormErrors(p => { const n = { ...p }; delete n.companyName; return n; }); }} placeholder="ชื่อบริษัทรถร่วม" />
                {formErrors.companyName && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.companyName}</span>}
            </div>
            <div>
                <label style={labelStyle}>ผู้ติดต่อ *</label>
                <input style={{ ...inputStyle, ...(formErrors.contactPerson ? { borderColor: '#ef4444' } : {}) }} value={form.contactPerson} onChange={e => { setForm(p => ({ ...p, contactPerson: e.target.value })); setFormErrors(p => { const n = { ...p }; delete n.contactPerson; return n; }); }} placeholder="ชื่อผู้ติดต่อ" />
                {formErrors.contactPerson && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.contactPerson}</span>}
            </div>
            <div>
                <label style={labelStyle}>โทรศัพท์</label>
                <input style={inputStyle} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="0xx-xxx-xxxx" />
            </div>
            <div>
                <label style={labelStyle}>Tier</label>
                <select style={inputStyle} value={form.tier} onChange={e => setForm(p => ({ ...p, tier: e.target.value }))}>
                    {tierOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
            </div>
            <div>
                <label style={labelStyle}>สถานะ</label>
                <select style={inputStyle} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
            </div>
            <div>
                <label style={labelStyle}>จำนวนรถ</label>
                <input style={inputStyle} type="number" min={0} value={form.vehicleCount} onChange={e => setForm(p => ({ ...p, vehicleCount: Number(e.target.value) }))} />
            </div>
            <div>
                <label style={labelStyle}>Performance Score</label>
                <input style={inputStyle} type="number" min={0} max={100} value={form.performanceScore} onChange={e => setForm(p => ({ ...p, performanceScore: Number(e.target.value) }))} />
            </div>
            <div>
                <label style={labelStyle}>On-Time Rate (%)</label>
                <input style={inputStyle} type="number" min={0} max={100} value={form.onTimeRate} onChange={e => setForm(p => ({ ...p, onTimeRate: Number(e.target.value) }))} />
            </div>
            <div>
                <label style={labelStyle}>Bounce Rate (%)</label>
                <input style={inputStyle} type="number" min={0} max={100} value={form.bounceRate} onChange={e => setForm(p => ({ ...p, bounceRate: Number(e.target.value) }))} />
            </div>
            <div>
                <label style={labelStyle}>ทริปรวม</label>
                <input style={inputStyle} type="number" min={0} value={form.totalTrips} onChange={e => setForm(p => ({ ...p, totalTrips: Number(e.target.value) }))} />
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.licenseValid} onChange={e => setForm(p => ({ ...p, licenseValid: e.target.checked }))} style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }} />
                    ใบอนุญาต
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.insuranceValid} onChange={e => setForm(p => ({ ...p, insuranceValid: e.target.checked }))} style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }} />
                    ประกันภัย
                </label>
            </div>
        </div>
    );

    // ===== Pagination =====
    const renderPagination = () => {
        if (filtered.length <= 0) return null;
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', padding: '10px', borderTop: '1px solid var(--border-color)', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <span>แสดง</span>
                    <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit' }}>
                        {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <span>รายการ / หน้า</span>
                    <span style={{ marginLeft: '8px', color: 'var(--text-muted)' }}>({(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} จาก {filtered.length})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button onClick={() => setCurrentPage(1)} disabled={safePage <= 1} style={pageBtnStyle(safePage <= 1)}><ChevronsLeft size={16} /></button>
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage <= 1} style={pageBtnStyle(safePage <= 1)}><ChevronLeft size={16} /></button>
                    {pageNumbers(safePage, totalPages).map((p, i) =>
                        p === '...' ? <span key={`dot${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)' }}>…</span> : (
                            <button key={p} onClick={() => setCurrentPage(Number(p))} style={{ ...pageBtnStyle(false), background: Number(p) === safePage ? 'var(--accent-blue)' : 'transparent', color: Number(p) === safePage ? 'white' : 'var(--text-secondary)', fontWeight: Number(p) === safePage ? 700 : 500, minWidth: '32px' }}>{p}</button>
                        )
                    )}
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} style={pageBtnStyle(safePage >= totalPages)}><ChevronRight size={16} /></button>
                    <button onClick={() => setCurrentPage(totalPages)} disabled={safePage >= totalPages} style={pageBtnStyle(safePage >= totalPages)}><ChevronsRight size={16} /></button>
                </div>
            </div>
        );
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

    return (
        <div className="animate-fade-in">
            {/* Score Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <ScoreCard icon={<Handshake size={22} />} color="#3b82f6" label="รถร่วมทั้งหมด" value={String(counts.all)} sub="บริษัท" bg="rgba(59,130,246,0.07)" />
                <ScoreCard icon={<Activity size={22} />} color="#10b981" label="ใช้งาน" value={String(counts.active)} sub="บริษัท" bg="rgba(16,185,129,0.07)" />
                <ScoreCard icon={<Truck size={22} />} color="#f59e0b" label="จำนวนรถรวม" value={String(totalVehicles)} sub="คัน" bg="rgba(245,158,11,0.07)" />
                <ScoreCard icon={<Award size={22} />} color="#8b5cf6" label="Avg Score" value={String(avgScore)} sub={`/ OTD ${avgOTD}%`} bg="rgba(139,92,246,0.07)" />
                <ScoreCard icon={<Shield size={22} />} color="#6366f1" label="ทริปรวม" value={totalTrips.toLocaleString()} sub="ทริป" bg="rgba(99,102,241,0.07)" />
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <button onClick={exportXLSX} style={exportBtnStyle('#10b981')}><FileSpreadsheet size={14} /> XLSX</button>
                <button onClick={exportCSV} style={exportBtnStyle('#10b981')}><FileText size={14} /> CSV</button>
                <button onClick={exportPDF} style={exportBtnStyle('#ef4444')}><Download size={14} /> PDF</button>
                {selectedIds.size > 0 && (
                    <>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-blue)', fontWeight: 600, padding: '5px 10px', borderRadius: '8px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>✓ {selectedIds.size} รายการ</span>
                        <button onClick={() => setSelectedIds(new Set())} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}>ยกเลิก</button>
                    </>
                )}
                <div style={{ flex: 1 }} />
                <select value={filter} onChange={e => { setFilter(e.target.value); setCurrentPage(1); }} style={{ padding: '7px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, border: '1.5px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontFamily: 'inherit', cursor: 'pointer', outline: 'none', minWidth: '160px' }}>
                    <option value="all">ทั้งหมด ({counts.all})</option>
                    <option value="active">ใช้งาน ({counts.active})</option>
                    <option value="suspended">ระงับ ({counts.suspended})</option>
                    <option value="pending-approval">⏳ รออนุมัติ ({counts.pending})</option>
                </select>
                <div className="topbar-search" style={{ minWidth: '180px' }}>
                    <Search size={16} />
                    <input placeholder="ค้นหาบริษัท, ผู้ติดต่อ..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'var(--bg-primary)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border-color)' }}>
                    <button onClick={() => setViewMode('list')} title="List" style={{ ...viewToggleStyle, background: viewMode === 'list' ? 'var(--accent-blue)' : 'transparent', color: viewMode === 'list' ? 'white' : 'var(--text-muted)' }}><List size={16} /></button>
                    <button onClick={() => setViewMode('grid')} title="Grid" style={{ ...viewToggleStyle, background: viewMode === 'grid' ? 'var(--accent-blue)' : 'transparent', color: viewMode === 'grid' ? 'white' : 'var(--text-muted)' }}><LayoutGrid size={16} /></button>
                </div>
                <button onClick={handleAdd} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /> <span>เพิ่มข้อมูล</span></button>
            </div>

            {/* LIST VIEW */}
            {viewMode === 'list' && (
                <div className="card">
                    <div className="data-table-wrapper" style={{ maxHeight: 'calc(100vh - 340px)', overflowY: 'auto' }}>
                        <table className="data-table" style={{ position: 'relative' }}>
                            <thead style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--bg-card)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                <tr>
                                    <th style={{ width: '40px', textAlign: 'center' }}>
                                        <input type="checkbox" checked={filtered.length > 0 && selectedIds.size === filtered.length} onChange={toggleSelectAll} style={{ accentColor: '#3b82f6', width: '16px', height: '16px', cursor: 'pointer' }} title="เลือกทั้งหมด" />
                                    </th>
                                    <th>ID</th><th>บริษัท</th><th>ผู้ติดต่อ</th><th>Tier</th><th>รถ</th><th>Score</th><th>OTD</th><th>ทริป</th><th>เอกสาร</th><th>สถานะ</th><th style={{ textAlign: 'center', width: '120px' }}>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paged.map(s => (
                                    <tr key={s.id} style={{ background: selectedIds.has(s.id) ? 'rgba(59,130,246,0.04)' : undefined }}>
                                        <td style={{ textAlign: 'center' }}>
                                            <input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => toggleSelect(s.id)} style={{ accentColor: '#3b82f6', width: '16px', height: '16px', cursor: 'pointer' }} />
                                        </td>
                                        <td><span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{s.id}</span></td>
                                        <td style={{ fontWeight: 600 }}>{s.companyName}</td>
                                        <td><div style={{ fontSize: '13px' }}>{s.contactPerson}</div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.phone}</div></td>
                                        <td><span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: `${tierColors[s.tier]}20`, color: tierColors[s.tier], textTransform: 'uppercase' }}>{s.tier}</span></td>
                                        <td><div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Truck size={14} style={{ color: 'var(--text-muted)' }} />{s.vehicleCount}</div></td>
                                        <td><span style={{ fontWeight: 700, color: s.performanceScore >= 80 ? '#10b981' : s.performanceScore >= 60 ? '#f59e0b' : '#ef4444' }}>{s.performanceScore}</span></td>
                                        <td><span style={{ color: s.onTimeRate >= 90 ? '#10b981' : '#f59e0b' }}>{s.onTimeRate}%</span></td>
                                        <td>{s.totalTrips.toLocaleString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <span style={{ padding: '2px 6px', borderRadius: '6px', fontSize: '10px', background: s.licenseValid ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: s.licenseValid ? '#10b981' : '#ef4444' }}>{s.licenseValid ? '✓' : '✗'} ใบอนุญาต</span>
                                                <span style={{ padding: '2px 6px', borderRadius: '6px', fontSize: '10px', background: s.insuranceValid ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: s.insuranceValid ? '#10b981' : '#ef4444' }}>{s.insuranceValid ? '✓' : '✗'} ประกัน</span>
                                            </div>
                                        </td>
                                        <td><span className={`status-badge ${statusColors[s.status]}`}>{statusLabels[s.status]}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                <button onClick={() => handleView(s)} title="ดูรายละเอียด" style={actionBtnStyle}><Eye size={15} /></button>
                                                <button onClick={() => handleEdit(s)} title="แก้ไข" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}><Pencil size={15} /></button>
                                                <button onClick={() => handleDeleteClick(s)} title="ลบ" style={{ ...actionBtnStyle, color: 'var(--accent-red)' }}><Trash2 size={15} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paged.length === 0 && (
                                    <tr><td colSpan={12} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>ไม่พบข้อมูลรถร่วม</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {renderPagination()}
                </div>
            )}

            {/* GRID VIEW */}
            {viewMode === 'grid' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
                        {paged.map(s => (
                            <div key={s.id} style={{ background: 'var(--bg-card)', borderRadius: '14px', padding: '16px', border: selectedIds.has(s.id) ? '2px solid var(--accent-blue)' : '1px solid var(--border-color)', transition: 'all 0.2s', cursor: 'pointer' }} onClick={() => toggleSelect(s.id)}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${tierColors[s.tier]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Handshake size={18} style={{ color: tierColors[s.tier] }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--accent-blue)' }}>{s.id}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tierLabels[s.tier]}</div>
                                        </div>
                                    </div>
                                    <span className={`status-badge ${statusColors[s.status]}`} style={{ fontSize: '11px' }}>{statusLabels[s.status]}</span>
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>{s.companyName}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>{s.contactPerson} • {s.phone}</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                    {[
                                        { label: 'Score', value: s.performanceScore, color: s.performanceScore >= 80 ? '#10b981' : '#f59e0b' },
                                        { label: 'OTD', value: `${s.onTimeRate}%`, color: s.onTimeRate >= 90 ? '#10b981' : '#f59e0b' },
                                        { label: 'รถ', value: s.vehicleCount, color: 'var(--text-primary)' },
                                        { label: 'ทริป', value: s.totalTrips, color: 'var(--text-primary)' },
                                    ].map((m, i) => (
                                        <div key={i} style={{ textAlign: 'center', padding: '6px', borderRadius: '8px', background: 'var(--bg-primary)' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: m.color }}>{m.value}</div>
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{m.label}</div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                                    <span style={{ padding: '3px 8px', borderRadius: '999px', fontSize: '10px', background: s.licenseValid ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: s.licenseValid ? '#10b981' : '#ef4444' }}>{s.licenseValid ? '✓ ใบอนุญาต' : '✗ ใบอนุญาต'}</span>
                                    <span style={{ padding: '3px 8px', borderRadius: '999px', fontSize: '10px', background: s.insuranceValid ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: s.insuranceValid ? '#10b981' : '#ef4444' }}>{s.insuranceValid ? '✓ ประกันภัย' : '✗ ประกันภัย'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                                    <button onClick={e => { e.stopPropagation(); handleView(s); }} title="ดู" style={actionBtnStyle}><Eye size={15} /></button>
                                    <button onClick={e => { e.stopPropagation(); handleEdit(s); }} title="แก้ไข" style={{ ...actionBtnStyle, color: 'var(--accent-amber)' }}><Pencil size={15} /></button>
                                    <button onClick={e => { e.stopPropagation(); handleDeleteClick(s); }} title="ลบ" style={{ ...actionBtnStyle, color: 'var(--accent-red)' }}><Trash2 size={15} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {paged.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>ไม่พบข้อมูลรถร่วม</div>}
                    <div className="card" style={{ marginTop: '12px' }}>{renderPagination()}</div>
                </>
            )}

            {/* ADD MODAL */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={20} style={{ color: 'var(--accent-blue)' }} /> เพิ่มรถร่วมใหม่</h3>
                            <button onClick={() => setShowAddModal(false)} style={closeBtnStyle}><X size={18} /></button>
                        </div>
                        <div className="modal-body">{renderFormFields('add')}</div>
                        <div className="modal-footer">
                            <button onClick={() => setShowAddModal(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                            <button onClick={handleSaveNew} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }} className="btn btn-primary btn-sm" disabled={saving || !form.id || !form.companyName}>{showAddModal ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW MODAL */}
            {showViewModal && selectedSub && (
                <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
                    <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Handshake size={20} style={{ color: tierColors[selectedSub.tier] }} /> รายละเอียด {selectedSub.companyName}</h3>
                            <button onClick={() => setShowViewModal(false)} style={closeBtnStyle}><X size={18} /></button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ textAlign: 'center', padding: '16px 12px', borderRadius: '12px', background: 'rgba(245,158,11,0.06)', border: '1px solid var(--border-color)' }}>
                                    <Award size={20} style={{ color: '#f59e0b', marginBottom: '6px' }} />
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b' }}>{selectedSub.performanceScore}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Score</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '16px 12px', borderRadius: '12px', background: `rgba(16,185,129,0.06)`, border: '1px solid var(--border-color)' }}>
                                    <Activity size={20} style={{ color: '#10b981', marginBottom: '6px' }} />
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>{selectedSub.onTimeRate}%</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>On-Time</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '16px 12px', borderRadius: '12px', background: 'rgba(59,130,246,0.06)', border: '1px solid var(--border-color)' }}>
                                    <Truck size={20} style={{ color: '#3b82f6', marginBottom: '6px' }} />
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedSub.vehicleCount}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>คัน</div>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <DetailRow icon={<Building2 size={16} />} label="รหัส" value={selectedSub.id} />
                                <DetailRow icon={<Handshake size={16} />} label="บริษัท" value={selectedSub.companyName} highlight />
                                <DetailRow icon={<span>👤</span>} label="ผู้ติดต่อ" value={selectedSub.contactPerson} />
                                <DetailRow icon={<Phone size={16} />} label="โทร" value={selectedSub.phone} />
                                <DetailRow icon={<Award size={16} />} label="Tier" value={tierLabels[selectedSub.tier] || selectedSub.tier} />
                                <DetailRow icon={<span>📊</span>} label="สถานะ" value={statusLabels[selectedSub.status] || selectedSub.status} />
                                <DetailRow icon={<span>📈</span>} label="Bounce Rate" value={`${selectedSub.bounceRate}%`} />
                                <DetailRow icon={<Shield size={16} />} label="ทริปรวม" value={String(selectedSub.totalTrips)} />
                                <DetailRow icon={<span>{selectedSub.licenseValid ? '✅' : '❌'}</span>} label="ใบอนุญาต" value={selectedSub.licenseValid ? 'ถูกต้อง' : 'หมดอายุ'} />
                                <DetailRow icon={<span>{selectedSub.insuranceValid ? '✅' : '❌'}</span>} label="ประกันภัย" value={selectedSub.insuranceValid ? 'ถูกต้อง' : 'หมดอายุ'} />
                            </div>
                        </div>
                        <div className="modal-footer"><button className="btn btn-secondary btn-sm" onClick={() => setShowViewModal(false)}>ปิด</button></div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {showEditModal && selectedSub && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Pencil size={20} style={{ color: 'var(--accent-amber)' }} /> แก้ไข {selectedSub.companyName}</h3>
                            <button onClick={() => setShowEditModal(false)} style={closeBtnStyle}><X size={18} /></button>
                        </div>
                        <div className="modal-body">{renderFormFields('edit')}</div>
                        <div className="modal-footer">
                            <button onClick={() => setShowEditModal(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                            <button onClick={handleSaveEdit} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }} className="btn btn-primary btn-sm" disabled={saving || !form.companyName}>{showAddModal ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRM */}
            {showDeleteConfirm && selectedSub && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="modal" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Trash2 size={20} style={{ color: 'var(--accent-red)' }} /> ยืนยันการลบ</h3>
                            <button onClick={() => setShowDeleteConfirm(false)} style={closeBtnStyle}><X size={18} /></button>
                        </div>
                        <div className="modal-body">
                            <p style={{ textAlign: 'center', fontSize: '15px', color: 'var(--text-primary)', margin: '10px 0' }}>
                                คุณต้องการลบ <strong style={{ color: 'var(--accent-red)' }}>{selectedSub.companyName}</strong> ({selectedSub.id}) ใช่หรือไม่?
                            </p>
                            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowDeleteConfirm(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                            <button className="btn btn-sm" onClick={handleDelete} disabled={saving} style={{ background: 'var(--accent-red)', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>{saving ? 'กำลังลบ...' : <><Trash2 size={14} /> ลบ</>}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
