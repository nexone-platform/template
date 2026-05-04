'use client';

import React, { useState, useEffect, useCallback } from 'react';
import StatusDropdown from '@/components/StatusDropdown';
import { Users, Search, Shield, AlertTriangle, Plus, Eye, Pencil, Trash2, X, Phone, Calendar, Truck, FileSpreadsheet, FileText, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, LayoutGrid, List } from 'lucide-react';
import { api, Driver, Vehicle } from '@/services/api';
import { useSystemConfig } from '@nexone/ui';

const statusLabels: Record<string, string> = { 'on-duty': '🟢 ปฏิบัติงาน', 'off-duty': '🔵 พักงาน', 'on-leave': '🟡 ลา' };
const statusColors: Record<string, string> = { 'on-duty': 'active', 'off-duty': 'inactive', 'on-leave': 'pending' };

const emptyForm = {
    id: '', name: '', phone: '', licenseType: 'ท.2', licenseExpiry: '',
    status: 'off-duty', safetyScore: 100, hoursToday: 0, totalTrips: 0, vehicleId: '',
};

const licenseTypes = ['ท.1', 'ท.2', 'ท.3', 'ท.4'];

// ===== Shared Styles =====
const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)',
    marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px',
};
const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '14px',
    border: '1.5px solid var(--border-color)', background: 'var(--bg-primary)',
    color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s',
};
const errorInputStyle: React.CSSProperties = { borderColor: '#ef4444', background: 'rgba(239,68,68,0.04)' };

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
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

function dateStr() {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}${String(d.getSeconds()).padStart(2, '0')}`;
}

export default function DriversPage() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Selection for export
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const { configs, loading: configLoading } = useSystemConfig();
    const [hasSetDefaultPageSize, setHasSetDefaultPageSize] = useState(false);

    useEffect(() => {
        if (!configLoading && configs?.pageRecordDefault && !hasSetDefaultPageSize) {
            setPageSize(configs.pageRecordDefault);
            setHasSetDefaultPageSize(true);
        }
    }, [configLoading, configs?.pageRecordDefault, hasSetDefaultPageSize]);
    const [pageSize, setPageSize] = useState(configs?.pageRecordDefault || 10);

    // View mode
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Available vehicles (no driver assigned)
    const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);

    const loadDrivers = useCallback(() => {
        setLoading(true);
        api.getDrivers().then(d => { setDrivers(d || []); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const loadVehicles = useCallback(() => {
        api.getVehicles().then(v => setAllVehicles(v || [])).catch(() => { });
    }, []);

    useEffect(() => { loadDrivers(); loadVehicles(); }, [loadDrivers, loadVehicles]);

    // Vehicles available for assignment: not assigned to any other driver
    const getAvailableVehicles = (currentVehicleId?: string) => {
        // Build set of vehicleIds already assigned to OTHER drivers
        const assignedVehicleIds = new Set(
            drivers.filter(d => d.vehicleId && d.vehicleId !== currentVehicleId).map(d => d.vehicleId!)
        );
        return allVehicles.filter(v => !assignedVehicleIds.has(v.id) || v.id === currentVehicleId);
    };

    const filtered = drivers.filter(d => {
        const matchFilter = filter === 'all' || d.status === filter;
        const matchSearch = search === '' || d.name.toLowerCase().includes(search.toLowerCase()) || d.phone.includes(search) || d.id.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const counts = {
        all: drivers.length,
        'on-duty': drivers.filter(d => d.status === 'on-duty').length,
        'off-duty': drivers.filter(d => d.status === 'off-duty').length,
        'on-leave': drivers.filter(d => d.status === 'on-leave').length,
    };

    const avgSafety = drivers.length > 0 ? Math.round(drivers.reduce((a, d) => a + d.safetyScore, 0) / drivers.length) : 0;
    const hosAlerts = drivers.filter(d => d.hoursToday >= 7).length;

    // Pagination computed
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

    // ===== Selection =====
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };
    const toggleSelectAll = () => {
        if (selectedIds.size === filtered.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(filtered.map(d => d.id)));
    };
    const getExportData = () => selectedIds.size > 0 ? filtered.filter(d => selectedIds.has(d.id)) : filtered;

    // ===== Export =====
    const exportCSV = () => {
        const data = getExportData();
        if (!data.length) { alert('ไม่มีข้อมูลสำหรับ export'); return; }
        const header = 'ID,ชื่อ,โทร,ใบขับขี่,หมดอายุ,สถานะ,Safety Score,HOS วันนี้,ทริปรวม,รถ';
        const rows = data.map(d => [
            d.id, `"${d.name}"`, d.phone, d.licenseType, d.licenseExpiry,
            `"${statusLabels[d.status] || d.status}"`, d.safetyScore, d.hoursToday, d.totalTrips, d.vehicleId || '-'
        ].join(','));
        const bom = '\uFEFF';
        const blob = new Blob([bom + header + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
        triggerDownload(blob, `nexspeed_drivers_${dateStr()}.csv`);
    };

    const exportXLSX = async () => {
        const XLSX = await import('xlsx');
        const data = getExportData();
        if (!data.length) { alert('ไม่มีข้อมูลสำหรับ export'); return; }
        const wsData = [
            ['ID', 'ชื่อ', 'โทร', 'ใบขับขี่', 'หมดอายุ', 'สถานะ', 'Safety Score', 'HOS วันนี้', 'ทริปรวม', 'รถ'],
            ...data.map(d => [d.id, d.name, d.phone, d.licenseType, d.licenseExpiry, statusLabels[d.status] || d.status, d.safetyScore, d.hoursToday, d.totalTrips, d.vehicleId || '-'])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        // Header style
        ws['!cols'] = [{ wch: 8 }, { wch: 20 }, { wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'พนักงานขับรถ');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        triggerDownload(blob, `nexspeed_drivers_${dateStr()}.xlsx`);
    };

    const exportPDF = async () => {
        const { default: jsPDF } = await import('jspdf');
        const data = getExportData();
        if (!data.length) { alert('ไม่มีข้อมูลสำหรับ export'); return; }
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(16);
        doc.text('Driver Report - NexSpeed', 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString('th-TH')} ${new Date().toLocaleTimeString('th-TH')}`, 14, 22);
        let y = 32;
        const headers = ['ID', 'Name', 'Phone', 'License', 'Status', 'Safety', 'HOS', 'Trips', 'Vehicle'];
        const colX = [14, 30, 80, 115, 140, 170, 195, 215, 235];
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        headers.forEach((h, i) => doc.text(h, colX[i], y));
        doc.setFont('helvetica', 'normal');
        y += 6;
        data.forEach(d => {
            if (y > 190) { doc.addPage(); y = 20; }
            const row = [d.id, d.name, d.phone, d.licenseType, d.status, String(d.safetyScore), String(d.hoursToday), String(d.totalTrips), d.vehicleId || '-'];
            row.forEach((val, i) => doc.text(val, colX[i], y));
            y += 5;
        });
        const blob = doc.output('blob');
        triggerDownload(blob, `nexspeed_drivers_${dateStr()}.pdf`);
    };

    // ===== Handlers =====
    const handleAdd = () => { setForm(emptyForm); setFormErrors({}); setShowAddModal(true); };
    const handleView = (d: Driver) => { setSelectedDriver(d); setShowViewModal(true); };
    const handleEdit = (d: Driver) => {
        setSelectedDriver(d);
        setForm({
            id: d.id, name: d.name, phone: d.phone, licenseType: d.licenseType,
            licenseExpiry: d.licenseExpiry, status: d.status, safetyScore: d.safetyScore,
            hoursToday: d.hoursToday, totalTrips: d.totalTrips, vehicleId: d.vehicleId || '',
        });
        setFormErrors({});
        setShowEditModal(true);
    };
    const handleDeleteClick = (d: Driver) => { setSelectedDriver(d); setShowDeleteConfirm(true); };

    const validateForm = (mode: 'add' | 'edit'): boolean => {
        const errors: Record<string, string> = {};
        if (mode === 'add' && !form.id.trim()) errors.id = 'กรุณาระบุรหัส';
        if (!form.name.trim()) errors.name = 'กรุณาระบุชื่อ';
        if (!form.phone.trim()) errors.phone = 'กรุณาระบุเบอร์โทร';
        if (!form.licenseExpiry) errors.licenseExpiry = 'กรุณาระบุวันหมดอายุ';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveNew = async () => {
        if (!validateForm('add')) return;
        setSaving(true);
        try {
            await api.createDriver({
                id: form.id, name: form.name, phone: form.phone, licenseType: form.licenseType,
                licenseExpiry: form.licenseExpiry, status: form.status, safetyScore: form.safetyScore,
                hoursToday: form.hoursToday, totalTrips: form.totalTrips, vehicleId: form.vehicleId || undefined,
            });
            setShowAddModal(false);
            loadDrivers();
        } catch { /* */ }
        setSaving(false);
    };

    const handleSaveEdit = async () => {
        if (!selectedDriver) return;
        if (!validateForm('edit')) return;
        setSaving(true);
        try {
            await api.updateDriver(selectedDriver.id, {
                name: form.name, phone: form.phone, licenseType: form.licenseType,
                licenseExpiry: form.licenseExpiry, status: form.status, safetyScore: form.safetyScore,
                hoursToday: form.hoursToday, totalTrips: form.totalTrips, vehicleId: form.vehicleId || undefined,
            });
            setShowEditModal(false);
            loadDrivers();
        } catch { /* */ }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!selectedDriver) return;
        setSaving(true);
        try {
            await api.deleteDriver(selectedDriver.id);
            setShowDeleteConfirm(false);
            loadDrivers();
        } catch { /* */ }
        setSaving(false);
    };

    // ===== Form Fields =====
    const renderFormFields = (mode: 'add' | 'edit') => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {mode === 'add' && (
                <div>
                    <label style={labelStyle}>รหัส *</label>
                    <input style={{ ...inputStyle, ...(formErrors.id ? errorInputStyle : {}) }} value={form.id} onChange={e => { setForm(p => ({ ...p, id: e.target.value })); setFormErrors(p => { const n = { ...p }; delete n.id; return n; }); }} placeholder="เช่น D011" />
                    {formErrors.id && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.id}</span>}
                </div>
            )}
            <div>
                <label style={labelStyle}>ชื่อ-นามสกุล *</label>
                <input style={{ ...inputStyle, ...(formErrors.name ? errorInputStyle : {}) }} value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setFormErrors(p => { const n = { ...p }; delete n.name; return n; }); }} placeholder="ชื่อ นามสกุล" />
                {formErrors.name && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.name}</span>}
            </div>
            <div>
                <label style={labelStyle}>เบอร์โทร *</label>
                <input style={{ ...inputStyle, ...(formErrors.phone ? errorInputStyle : {}) }} value={form.phone} onChange={e => { setForm(p => ({ ...p, phone: e.target.value })); setFormErrors(p => { const n = { ...p }; delete n.phone; return n; }); }} placeholder="08x-xxx-xxxx" />
                {formErrors.phone && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.phone}</span>}
            </div>
            <div>
                <label style={labelStyle}>ประเภทใบขับขี่</label>
                <select style={inputStyle} value={form.licenseType} onChange={e => setForm(p => ({ ...p, licenseType: e.target.value }))}>
                    {licenseTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div>
                <label style={labelStyle}>ใบขับขี่หมดอายุ *</label>
                <input style={{ ...inputStyle, ...(formErrors.licenseExpiry ? errorInputStyle : {}) }} type="date" value={form.licenseExpiry} onChange={e => { setForm(p => ({ ...p, licenseExpiry: e.target.value })); setFormErrors(p => { const n = { ...p }; delete n.licenseExpiry; return n; }); }} />
                {formErrors.licenseExpiry && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.licenseExpiry}</span>}
            </div>
            <div>
                <label style={labelStyle}>สถานะ</label>
                <select style={inputStyle} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="off-duty">🔵 พักงาน</option>
                    <option value="on-duty">🟢 ปฏิบัติงาน</option>
                    <option value="on-leave">🟡 ลา</option>
                </select>
            </div>
            <div>
                <label style={labelStyle}>Safety Score</label>
                <input style={inputStyle} type="number" min={0} max={100} value={form.safetyScore} onChange={e => setForm(p => ({ ...p, safetyScore: Number(e.target.value) }))} />
            </div>
            <div>
                <label style={labelStyle}>รถที่รับผิดชอบ</label>
                <select style={inputStyle} value={form.vehicleId} onChange={e => setForm(p => ({ ...p, vehicleId: e.target.value }))}>
                    <option value="">-- ไม่ระบุ --</option>
                    {getAvailableVehicles(mode === 'edit' ? form.vehicleId : undefined).map(v => (
                        <option key={v.id} value={v.id}>
                            {v.id} • {v.plateNumber} • {v.brand}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );

    // ===== Pagination =====
    const renderPagination = () => {
        if (filtered.length <= 0) return null;
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
                padding: '10px', borderTop: '1px solid var(--border-color)', gap: '12px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <span>แสดง</span>
                    <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit' }}>
                        {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <span>รายการ / หน้า</span>
                    <span style={{ marginLeft: '8px', color: 'var(--text-muted)' }}>
                        ({(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} จาก {filtered.length})
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button onClick={() => setCurrentPage(1)} disabled={safePage <= 1} style={pageBtnStyle(safePage <= 1)}><ChevronsLeft size={16} /></button>
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage <= 1} style={pageBtnStyle(safePage <= 1)}><ChevronLeft size={16} /></button>
                    <span style={{ padding: '0 12px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{safePage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} style={pageBtnStyle(safePage >= totalPages)}><ChevronRight size={16} /></button>
                    <button onClick={() => setCurrentPage(totalPages)} disabled={safePage >= totalPages} style={pageBtnStyle(safePage >= totalPages)}><ChevronsRight size={16} /></button>
                </div>
            </div>
        );
    };

    // ===== Modal Wrapper =====
    const Modal = ({ show, title, onClose, children, footer }: { show: boolean; title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) => {
        if (!show) return null;
        return (
            <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', width: '90%', maxWidth: '640px', maxHeight: '90vh', overflow: 'auto', border: '1px solid var(--border-color)', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{title}</h3>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}><X size={20} /></button>
                    </div>
                    <div style={{ padding: '24px' }}>{children}</div>
                    {footer && <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>{footer}</div>}
                </div>
            </div>
        );
    };

    const exportBtnStyle = (borderColor: string): React.CSSProperties => ({
        display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px',
        borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
        background: 'transparent', color: borderColor, border: `1.5px solid ${borderColor}`,
        fontFamily: 'inherit', transition: 'all 0.15s',
    });

    const viewToggleStyle: React.CSSProperties = {
        width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s',
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

    return (
        <div className="animate-fade-in">

            {/* Score Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <ScoreCard icon={<Users size={22} />} color="#3b82f6" label="ทั้งหมด" value={String(drivers.length)} sub="คน" bg="rgba(59,130,246,0.07)" />
                <ScoreCard icon={<Users size={22} />} color="#10b981" label="ปฏิบัติงาน" value={String(counts['on-duty'])} sub="คน" bg="rgba(16,185,129,0.07)" />
                <ScoreCard icon={<Users size={22} />} color="#6366f1" label="พักงาน" value={String(counts['off-duty'])} sub="คน" bg="rgba(99,102,241,0.07)" />
                <ScoreCard icon={<Shield size={22} />} color="#8b5cf6" label="Safety เฉลี่ย" value={String(avgSafety)} sub="คะแนน" bg="rgba(139,92,246,0.07)" />
                <ScoreCard icon={<AlertTriangle size={22} />} color="#ef4444" label="HOS Alert" value={String(hosAlerts)} sub="คน" bg="rgba(239,68,68,0.07)" />
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                {/* Export */}
                <button onClick={exportXLSX} style={exportBtnStyle('#10b981')}><FileSpreadsheet size={14} /> XLSX</button>
                <button onClick={exportCSV} style={exportBtnStyle('#10b981')}><FileText size={14} /> CSV</button>
                <button onClick={exportPDF} style={exportBtnStyle('#ef4444')}><Download size={14} /> PDF</button>
                {selectedIds.size > 0 && (
                    <>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-blue)', fontWeight: 600, padding: '5px 10px', borderRadius: '8px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                            ✓ {selectedIds.size} รายการ
                        </span>
                        <button onClick={() => setSelectedIds(new Set())} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                    </>
                )}

                <div style={{ flex: 1 }} />

                {/* Status dropdown */}
                <select value={filter} onChange={e => { setFilter(e.target.value); setCurrentPage(1); }}
                    style={{ padding: '7px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, border: '1.5px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontFamily: 'inherit', cursor: 'pointer', outline: 'none', minWidth: '160px' }}>
                    <option value="all">พนักงานทั้งหมด ({counts.all})</option>
                    <option value="on-duty">🟢 ปฏิบัติงาน ({counts['on-duty']})</option>
                    <option value="off-duty">🔵 พักงาน ({counts['off-duty']})</option>
                    <option value="on-leave">🟡 ลา ({counts['on-leave']})</option>
                </select>

                {/* Search */}
                <div className="topbar-search" style={{ minWidth: '180px' }}>
                    <Search size={16} />
                    <input placeholder="ค้นหาชื่อ, เบอร์โทร..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
                </div>

                {/* View toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'var(--bg-primary)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border-color)' }}>
                    <button onClick={() => setViewMode('list')} title="List"
                        style={{ ...viewToggleStyle, background: viewMode === 'list' ? 'var(--accent-blue)' : 'transparent', color: viewMode === 'list' ? 'white' : 'var(--text-muted)' }}><List size={16} /></button>
                    <button onClick={() => setViewMode('grid')} title="Grid"
                        style={{ ...viewToggleStyle, background: viewMode === 'grid' ? 'var(--accent-blue)' : 'transparent', color: viewMode === 'grid' ? 'white' : 'var(--text-muted)' }}><LayoutGrid size={16} /></button>
                </div>

                {/* Add */}
                <button onClick={handleAdd} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /> <span>เพิ่มข้อมูล</span></button>
            </div>

            {/* ===== LIST VIEW ===== */}
            {viewMode === 'list' && (
                <div className="card">
                    <div className="data-table-wrapper" style={{ maxHeight: 'calc(100vh - 340px)', overflowY: 'auto' }}>
                        <table className="data-table" style={{ position: 'relative' }}>
                            <thead style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--bg-card)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                <tr>
                                    <th style={{ width: '40px', textAlign: 'center' }}>
                                        <input type="checkbox" checked={filtered.length > 0 && selectedIds.size === filtered.length} onChange={toggleSelectAll}
                                            style={{ accentColor: '#3b82f6', width: '16px', height: '16px', cursor: 'pointer' }} title="เลือกทั้งหมด" />
                                    </th>
                                    <th>ID</th><th>ชื่อ</th><th>โทร</th><th>ใบขับขี่</th><th>สถานะ</th><th>Safety Score</th><th>HOS วันนี้</th><th>ทริปรวม</th><th>รถ</th><th style={{ textAlign: 'center', width: '120px' }}>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paged.map(d => (
                                    <tr key={d.id} style={{ background: selectedIds.has(d.id) ? 'rgba(59,130,246,0.04)' : undefined }}>
                                        <td style={{ textAlign: 'center' }}>
                                            <input type="checkbox" checked={selectedIds.has(d.id)} onChange={() => toggleSelect(d.id)}
                                                style={{ accentColor: '#3b82f6', width: '15px', height: '15px', cursor: 'pointer' }} />
                                        </td>
                                        <td><span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{d.id}</span></td>
                                        <td style={{ fontWeight: 600 }}>{d.name}</td>
                                        <td style={{ fontSize: '13px' }}>{d.phone}</td>
                                        <td>{d.licenseType} (ถึง {d.licenseExpiry})</td>
                                        <td><StatusDropdown 
                    value={d.status}
                    onChange={async (newValue: any) => {
                        setDrivers(prev => prev.map(x => x.id === d.id ? { ...x, status: newValue } : x));
                        try { await api.updateDriver(d.id, { ...d, status: newValue } as any); } catch(err) { console.error(err); }
                    }}
                    options={Object.keys(statusLabels).map(k => ({ 
                        value: k, 
                        label: statusLabels[k as keyof typeof statusLabels], 
                        color: (['active','completed','available', 'approved'].includes(k) ? 'green' : (['inactive','cancelled', 'rejected'].includes(k) ? 'red' : 'yellow')) as any
                    }))}
                /></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ width: '40px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)' }}>
                                                    <div style={{ height: '100%', borderRadius: '3px', width: `${d.safetyScore}%`, background: d.safetyScore >= 90 ? 'var(--accent-green)' : d.safetyScore >= 75 ? 'var(--accent-amber)' : 'var(--accent-red)' }} />
                                                </div>
                                                <span style={{ fontSize: '13px', fontWeight: 600, color: d.safetyScore >= 90 ? 'var(--accent-green)' : d.safetyScore >= 75 ? 'var(--accent-amber)' : 'var(--accent-red)' }}>{d.safetyScore}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ color: d.hoursToday >= 7 ? 'var(--accent-red)' : undefined, fontWeight: d.hoursToday >= 7 ? 700 : 400 }}>
                                                {d.hoursToday >= 7 && <AlertTriangle size={12} style={{ marginRight: '4px' }} />}{d.hoursToday} / 8 ชม.
                                            </span>
                                        </td>
                                        <td>{d.totalTrips}</td>
                                        <td>{d.vehicleId || '-'}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                <button onClick={() => handleView(d)} title="ดู" style={actionBtnStyle('var(--accent-blue)')}><Eye size={14} /></button>
                                                <button onClick={() => handleEdit(d)} title="แก้ไข" style={actionBtnStyle('var(--accent-amber)')}><Pencil size={14} /></button>
                                                <button onClick={() => handleDeleteClick(d)} title="ลบ" style={actionBtnStyle('var(--accent-red)')}><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {renderPagination()}
                </div>
            )}

            {/* ===== GRID VIEW ===== */}
            {viewMode === 'grid' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                        {paged.map(d => (
                            <div key={d.id} className="card" style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{d.id}</span>
                                    <StatusDropdown 
                    value={d.status}
                    onChange={async (newValue: any) => {
                        setDrivers(prev => prev.map(x => x.id === d.id ? { ...x, status: newValue } : x));
                        try { await api.updateDriver(d.id, { ...d, status: newValue } as any); } catch(err) { console.error(err); }
                    }}
                    options={Object.keys(statusLabels).map(k => ({ 
                        value: k, 
                        label: statusLabels[k as keyof typeof statusLabels], 
                        color: (['active','completed','available', 'approved'].includes(k) ? 'green' : (['inactive','cancelled', 'rejected'].includes(k) ? 'red' : 'yellow')) as any
                    }))}
                />
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{d.name}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{d.phone} • {d.licenseType}</div>
                                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                                    <span>Safety: <strong style={{ color: d.safetyScore >= 90 ? 'var(--accent-green)' : 'var(--accent-amber)' }}>{d.safetyScore}</strong></span>
                                    <span>HOS: <strong style={{ color: d.hoursToday >= 7 ? 'var(--accent-red)' : undefined }}>{d.hoursToday}/8</strong></span>
                                    <span>ทริป: <strong>{d.totalTrips}</strong></span>
                                </div>
                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => handleView(d)} style={actionBtnStyle('var(--accent-blue)')}><Eye size={14} /></button>
                                    <button onClick={() => handleEdit(d)} style={actionBtnStyle('var(--accent-amber)')}><Pencil size={14} /></button>
                                    <button onClick={() => handleDeleteClick(d)} style={actionBtnStyle('var(--accent-red)')}><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="card" style={{ marginTop: '12px', padding: 0 }}>{renderPagination()}</div>
                </>
            )}

            {/* ===== VIEW MODAL ===== */}
            <Modal show={showViewModal} title="ข้อมูลพนักงาน" onClose={() => setShowViewModal(false)}>
                {selectedDriver && (
                    <div>
                        {/* Score cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(139,92,246,0.08)', textAlign: 'center' }}>
                                <div style={{ fontSize: '22px', fontWeight: 700, color: '#8b5cf6' }}>{selectedDriver.safetyScore}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Safety Score</div>
                            </div>
                            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(59,130,246,0.08)', textAlign: 'center' }}>
                                <div style={{ fontSize: '22px', fontWeight: 700, color: '#3b82f6' }}>{selectedDriver.totalTrips}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ทริปทั้งหมด</div>
                            </div>
                            <div style={{ padding: '12px', borderRadius: '10px', background: selectedDriver.hoursToday >= 7 ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', textAlign: 'center' }}>
                                <div style={{ fontSize: '22px', fontWeight: 700, color: selectedDriver.hoursToday >= 7 ? '#ef4444' : '#10b981' }}>{selectedDriver.hoursToday}/8</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>HOS วันนี้</div>
                            </div>
                        </div>
                        <DetailRow icon={<Users size={16} />} label="ชื่อ" value={selectedDriver.name} />
                        <DetailRow icon={<Phone size={16} />} label="โทร" value={selectedDriver.phone} />
                        <DetailRow icon={<Shield size={16} />} label="ใบขับขี่" value={`${selectedDriver.licenseType} (ถึง ${selectedDriver.licenseExpiry})`} />
                        <DetailRow icon={<Calendar size={16} />} label="สถานะ" value={statusLabels[selectedDriver.status]} />
                        <DetailRow icon={<Truck size={16} />} label="รถที่ขับ" value={selectedDriver.vehicleId || '-'} />
                    </div>
                )}
            </Modal>

            {/* ===== ADD MODAL ===== */}
            <Modal show={showAddModal} title="เพิ่มพนักงานใหม่" onClose={() => setShowAddModal(false)}
                footer={<>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                    <button onClick={handleSaveNew} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }} className="btn btn-primary btn-sm" disabled={saving}>{showAddModal ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}</button>
                </>}>
                {renderFormFields('add')}
            </Modal>

            {/* ===== EDIT MODAL ===== */}
            <Modal show={showEditModal} title="แก้ไขข้อมูลพนักงาน" onClose={() => setShowEditModal(false)}
                footer={<>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowEditModal(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                    <button onClick={handleSaveEdit} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }} className="btn btn-primary btn-sm" disabled={saving}>{showAddModal ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}</button>
                </>}>
                {renderFormFields('edit')}
            </Modal>

            {/* ===== DELETE CONFIRM ===== */}
            <Modal show={showDeleteConfirm} title="ยืนยันการลบ" onClose={() => setShowDeleteConfirm(false)}
                footer={<>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowDeleteConfirm(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                    <button className="btn btn-sm" onClick={handleDelete} disabled={saving}
                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                        {saving ? 'กำลังลบ...' : 'ลบ'}
                    </button>
                </>}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    คุณต้องการลบพนักงาน <strong style={{ color: 'var(--accent-red)' }}>{selectedDriver?.name}</strong> ({selectedDriver?.id}) หรือไม่?
                </p>
            </Modal>
        </div>
    );
}

// ===== Sub Components =====
function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ color: 'var(--accent-blue)' }}>{icon}</div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', width: '100px' }}>{label}</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
        </div>
    );
}

function ScoreCard({ icon, color, label, value, sub, bg }: { icon: React.ReactNode; color: string; label: string; value: string; sub: string; bg: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', borderRadius: '14px', background: bg, border: '1px solid transparent', transition: 'all 0.2s' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
            <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '2px' }}>{label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '22px', fontWeight: 800, color }}>{value}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub}</span>
                </div>
            </div>
        </div>
    );
}

function actionBtnStyle(color: string): React.CSSProperties {
    return {
        background: 'transparent', border: 'none', borderRadius: '8px',
        width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color, transition: 'all 0.15s',
    };
}

function pageBtnStyle(disabled: boolean): React.CSSProperties {
    return {
        background: disabled ? 'transparent' : 'var(--bg-primary)', border: '1px solid var(--border-color)',
        borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)', opacity: disabled ? 0.4 : 1,
        transition: 'all 0.15s', fontFamily: 'inherit',
    };
}
