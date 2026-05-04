'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Fuel, Plus, Eye, Pencil, Trash2, X, Truck, Calendar, Shield, Gauge, Weight, FileSpreadsheet, FileText, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Activity, LayoutGrid, List } from 'lucide-react';
import { api, Vehicle } from '@/services/api';
import { useSystemConfig } from '@nexone/ui';

// Download helper — uses showSaveFilePicker for "Save As" dialog
async function triggerDownload(blob: Blob, filename: string, accept?: Record<string, string[]>) {
    // Try modern File System Access API (shows native "Save As" dialog)
    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
        try {
            const ext = filename.split('.').pop() || '';
            const types: { description: string; accept: Record<string, string[]> }[] = [];
            if (accept) {
                types.push({ description: filename, accept });
            } else if (ext === 'csv') {
                types.push({ description: 'CSV File', accept: { 'text/csv': ['.csv'] } });
            } else if (ext === 'xlsx') {
                types.push({ description: 'Excel File', accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] } });
            } else if (ext === 'pdf') {
                types.push({ description: 'PDF Document', accept: { 'application/pdf': ['.pdf'] } });
            }

            const handle = await (window as unknown as { showSaveFilePicker: (opts: unknown) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
                suggestedName: filename,
                types: types.length > 0 ? types : undefined,
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return; // Success
        } catch (err: unknown) {
            // User cancelled the dialog or API not supported
            if (err instanceof Error && err.name === 'AbortError') return; // User cancelled
            // Fall through to legacy download
        }
    }

    // Fallback: hidden anchor download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }, 1000);
}

const statusLabels: Record<string, string> = {
    'on-trip': '🚛 กำลังวิ่ง', available: 'พร้อมใช้', maintenance: '🔧 ซ่อมบำรุง', inactive: 'ปิดใช้งาน',
};

const statusColors: Record<string, string> = {
    'on-trip': 'active', available: 'completed', maintenance: 'pending', inactive: 'inactive',
};

const vehicleTypes = ['รถ 10 ล้อ', 'รถเทรลเลอร์', 'รถ 6 ล้อ', 'รถตู้', 'รถห้องเย็น', 'รถกระบะ'];
const vehicleStatuses = [
    { value: 'available', label: 'พร้อมใช้' },
    { value: 'on-trip', label: 'กำลังวิ่ง' },
    { value: 'maintenance', label: 'ซ่อมบำรุง' },
    { value: 'inactive', label: 'ปิดใช้งาน' },
];

const statusText: Record<string, string> = {
    'on-trip': 'กำลังวิ่ง', available: 'พร้อมใช้', maintenance: 'ซ่อมบำรุง', inactive: 'ปิดใช้งาน',
};

const emptyForm = {
    id: '', plateNumber: '', type: 'รถ 10 ล้อ', brand: '', model: '', year: new Date().getFullYear(),
    status: 'available', fuelLevel: 100, mileage: 0, nextMaintenance: '', insuranceExpiry: '', capacity: 0,
};

export default function FleetPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
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

    const loadVehicles = useCallback(() => {
        setLoading(true);
        api.getVehicles().then(v => { setVehicles(v || []); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    useEffect(() => { loadVehicles(); }, [loadVehicles]);

    const filtered = vehicles.filter(v => {
        const matchFilter = filter === 'all' || v.status === filter;
        const matchSearch = search === '' || v.plateNumber.toLowerCase().includes(search.toLowerCase()) || v.brand.toLowerCase().includes(search.toLowerCase()) || v.type.includes(search) || v.id.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const counts = {
        all: vehicles.length,
        'on-trip': vehicles.filter(v => v.status === 'on-trip').length,
        available: vehicles.filter(v => v.status === 'available').length,
        maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    };

    // Average fuel
    const avgFuel = vehicles.length > 0 ? Math.round(vehicles.reduce((s, v) => s + v.fuelLevel, 0) / vehicles.length) : 0;
    // Total mileage
    const totalMileage = vehicles.reduce((s, v) => s + v.mileage, 0);

    // Pagination computed
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

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
                        style={{
                            padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color)',
                            background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit',
                        }}>
                        {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <span>รายการ / หน้า</span>
                    <span style={{ marginLeft: '8px', color: 'var(--text-muted)' }}>
                        ({(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} จาก {filtered.length})
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button onClick={() => setCurrentPage(1)} disabled={safePage <= 1} style={pageBtnStyle(safePage <= 1)}>
                        <ChevronsLeft size={16} />
                    </button>
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage <= 1} style={pageBtnStyle(safePage <= 1)}>
                        <ChevronLeft size={16} />
                    </button>
                    {pageNumbers(safePage, totalPages).map((p: number | string, i: number) =>
                        p === '...' ? (
                            <span key={`dot${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)' }}>…</span>
                        ) : (
                            <button key={p} onClick={() => setCurrentPage(Number(p))}
                                style={{
                                    ...pageBtnStyle(false),
                                    background: Number(p) === safePage ? 'var(--accent-blue)' : 'transparent',
                                    color: Number(p) === safePage ? 'white' : 'var(--text-secondary)',
                                    fontWeight: Number(p) === safePage ? 700 : 500,
                                    minWidth: '32px',
                                }}>
                                {p}
                            </button>
                        )
                    )}
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} style={pageBtnStyle(safePage >= totalPages)}>
                        <ChevronRight size={16} />
                    </button>
                    <button onClick={() => setCurrentPage(totalPages)} disabled={safePage >= totalPages} style={pageBtnStyle(safePage >= totalPages)}>
                        <ChevronsRight size={16} />
                    </button>
                </div>
            </div>
        );
    };

    // ===== Selection =====
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filtered.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filtered.map(v => v.id)));
        }
    };

    const getExportData = () => {
        // If rows are selected, always export only selected ones
        if (selectedIds.size > 0) {
            return filtered.filter(v => selectedIds.has(v.id));
        }
        return filtered;
    };

    // ===== Export Functions =====
    const exportCSV = () => {
        const data = getExportData();
        if (data.length === 0) { alert('ไม่มีข้อมูลสำหรับ export'); return; }
        const header = 'ID,ทะเบียน,ประเภท,ยี่ห้อ,รุ่น,ปี,สถานะ,น้ำมัน(%),ระยะทาง(กม.),ความจุ(ตัน),ซ่อมบำรุงถัดไป,ประกันหมดอายุ';
        const rows = data.map(v => [
            v.id, `"${v.plateNumber}"`, `"${v.type}"`, `"${v.brand}"`, `"${v.model}"`, v.year,
            `"${statusText[v.status] || v.status}"`, v.fuelLevel, v.mileage, v.capacity,
            v.nextMaintenance || '-', v.insuranceExpiry || '-',
        ].join(','));
        const csv = '\uFEFF' + header + '\n' + rows.join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        triggerDownload(blob, `nexspeed_fleet_${dateStr()}.csv`);
    };

    const exportXLSX = async () => {
        const data = getExportData();
        if (data.length === 0) { alert('ไม่มีข้อมูลสำหรับ export'); return; }
        const XLSX = await import('xlsx-js-style');

        const headers = ['ID', 'ทะเบียน', 'ประเภท', 'ยี่ห้อ', 'รุ่น', 'ปี', 'สถานะ', 'น้ำมัน(%)', 'ระยะทาง(กม.)', 'ความจุ(ตัน)', 'ซ่อมบำรุงถัดไป', 'ประกันหมดอายุ'];
        const rows = data.map(v => [
            v.id, v.plateNumber, v.type, v.brand, v.model, v.year,
            statusText[v.status] || v.status, v.fuelLevel, v.mileage, v.capacity,
            v.nextMaintenance || '-', v.insuranceExpiry || '-',
        ]);

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

        // Column widths
        ws['!cols'] = [
            { wch: 8 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 6 },
            { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 12 }, { wch: 16 }, { wch: 16 },
        ];

        // Style header row — light blue background
        const headerStyle = {
            fill: { fgColor: { rgb: 'DCE6F1' } },
            font: { bold: true, color: { rgb: '1F4E79' }, sz: 11 },
            alignment: { horizontal: 'center' as const, vertical: 'center' as const },
            border: {
                top: { style: 'thin' as const, color: { rgb: 'B4C6E7' } },
                bottom: { style: 'thin' as const, color: { rgb: 'B4C6E7' } },
                left: { style: 'thin' as const, color: { rgb: 'B4C6E7' } },
                right: { style: 'thin' as const, color: { rgb: 'B4C6E7' } },
            },
        };
        for (let c = 0; c < headers.length; c++) {
            const cellRef = XLSX.utils.encode_cell({ r: 0, c });
            if (ws[cellRef]) ws[cellRef].s = headerStyle;
        }

        // Format data cells
        const fuelCol = 7;     // Column H (0-indexed = 7) — น้ำมัน
        const mileageCol = 8;  // Column I (0-indexed = 8) — ระยะทาง
        for (let r = 1; r <= data.length; r++) {
            // น้ำมัน — append % to display
            const fuelRef = XLSX.utils.encode_cell({ r, c: fuelCol });
            if (ws[fuelRef]) {
                ws[fuelRef].z = '0"%"';  // Number format: shows as 85%
                ws[fuelRef].t = 'n';     // Ensure type is number
            }
            // ระยะทาง — comma-separated number
            const mileRef = XLSX.utils.encode_cell({ r, c: mileageCol });
            if (ws[mileRef]) {
                ws[mileRef].z = '#,##0';  // Number format: 45,320
                ws[mileRef].t = 'n';
            }
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'การจัดการรถบริษัท');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        triggerDownload(blob, `nexspeed_fleet_${dateStr()}.xlsx`);
    };

    const exportPDF = async () => {
        const data = getExportData();
        if (data.length === 0) { alert('ไม่มีข้อมูลสำหรับ export'); return; }
        const { default: jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        // Load Thai font (Sarabun)
        try {
            const fontRes = await fetch('/fonts/Sarabun-Regular.ttf');
            const fontBuf = await fontRes.arrayBuffer();
            const fontBase64 = btoa(String.fromCharCode(...new Uint8Array(fontBuf)));
            doc.addFileToVFS('Sarabun-Regular.ttf', fontBase64);
            doc.addFont('Sarabun-Regular.ttf', 'Sarabun', 'normal');
            doc.setFont('Sarabun');
        } catch {
            // If font fails, continue with default font
        }

        doc.setFontSize(16);
        doc.text('รายงานการจัดการรถบริษัท NexSpeed', 14, 15);
        doc.setFontSize(10);
        doc.text(`สร้างเมื่อ: ${new Date().toLocaleDateString('th-TH')} ${new Date().toLocaleTimeString('th-TH')}`, 14, 22);

        const tableData = data.map(v => [
            v.id, v.plateNumber, v.type, `${v.brand} ${v.model}`, String(v.year),
            statusText[v.status] || v.status, `${v.fuelLevel}%`,
            `${v.mileage.toLocaleString()}`, `${v.capacity}`, v.nextMaintenance || '-',
        ]);

        autoTable(doc, {
            startY: 28,
            head: [['รหัส', 'ทะเบียน', 'ประเภท', 'ยี่ห้อ/รุ่น', 'ปี', 'สถานะ', 'น้ำมัน', 'ระยะทาง(กม.)', 'ความจุ(ตัน)', 'ซ่อมบำรุง']],
            body: tableData,
            styles: { fontSize: 9, cellPadding: 2, font: 'Sarabun' },
            headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'normal', font: 'Sarabun' },
            alternateRowStyles: { fillColor: [245, 247, 250] },
        });
        const pdfBlob = doc.output('blob');
        triggerDownload(pdfBlob, `nexspeed_fleet_${dateStr()}.pdf`);
    };

    // ===== Handlers =====
    const handleAdd = () => { setForm(emptyForm); setFormErrors({}); setShowAddModal(true); };
    const handleView = (v: Vehicle) => { setSelectedVehicle(v); setShowViewModal(true); };
    const handleEdit = (v: Vehicle) => {
        setSelectedVehicle(v);
        setForm({
            id: v.id, plateNumber: v.plateNumber, type: v.type, brand: v.brand, model: v.model,
            year: v.year, status: v.status, fuelLevel: v.fuelLevel, mileage: v.mileage,
            nextMaintenance: v.nextMaintenance || '', insuranceExpiry: v.insuranceExpiry || '', capacity: v.capacity,
        });
        setFormErrors({});
        setShowEditModal(true);
    };
    const handleDeleteClick = (v: Vehicle) => { setSelectedVehicle(v); setShowDeleteConfirm(true); };

    const validateForm = (mode: 'add' | 'edit'): boolean => {
        const errors: Record<string, string> = {};
        if (mode === 'add' && !form.id.trim()) errors.id = 'กรุณาระบุรหัสรถ';
        if (!form.plateNumber.trim()) errors.plateNumber = 'กรุณาระบุทะเบียนรถ';
        if (!form.brand.trim()) errors.brand = 'กรุณาระบุยี่ห้อ';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveNew = async () => {
        if (!validateForm('add')) return;
        setSaving(true);
        try {
            await api.createVehicle({
                id: form.id, plateNumber: form.plateNumber, type: form.type, brand: form.brand,
                model: form.model, year: form.year, status: form.status, fuelLevel: form.fuelLevel,
                mileage: form.mileage, nextMaintenance: form.nextMaintenance, insuranceExpiry: form.insuranceExpiry, capacity: form.capacity,
            });
            setShowAddModal(false);
            loadVehicles();
        } catch { /* */ }
        setSaving(false);
    };

    const handleSaveEdit = async () => {
        if (!selectedVehicle) return;
        if (!validateForm('edit')) return;
        setSaving(true);
        try {
            await api.updateVehicle(selectedVehicle.id, {
                plateNumber: form.plateNumber, type: form.type, brand: form.brand, model: form.model,
                year: form.year, status: form.status, fuelLevel: form.fuelLevel, mileage: form.mileage,
                nextMaintenance: form.nextMaintenance, insuranceExpiry: form.insuranceExpiry, capacity: form.capacity,
            });
            setShowEditModal(false);
            loadVehicles();
        } catch { /* */ }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!selectedVehicle) return;
        setSaving(true);
        try {
            await api.deleteVehicle(selectedVehicle.id);
            setShowDeleteConfirm(false);
            loadVehicles();
        } catch { /* */ }
        setSaving(false);
    };

    // ===== Form Component =====
    // Inline form fields (NOT a component — avoids re-mount on every keystroke)
    const renderFormFields = (mode: 'add' | 'edit') => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {mode === 'add' && (
                <div>
                    <label style={labelStyle}>รหัสรถ *</label>
                    <input style={{ ...inputStyle, ...(formErrors.id ? { borderColor: '#ef4444', background: 'rgba(239,68,68,0.04)' } : {}) }} value={form.id} onChange={e => { setForm(prev => ({ ...prev, id: e.target.value })); setFormErrors(prev => { const n = { ...prev }; delete n.id; return n; }); }} placeholder="เช่น V016" />
                    {formErrors.id && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.id}</span>}
                </div>
            )}
            <div>
                <label style={labelStyle}>ทะเบียน *</label>
                <input style={{ ...inputStyle, ...(formErrors.plateNumber ? { borderColor: '#ef4444', background: 'rgba(239,68,68,0.04)' } : {}) }} value={form.plateNumber} onChange={e => { setForm(prev => ({ ...prev, plateNumber: e.target.value })); setFormErrors(prev => { const n = { ...prev }; delete n.plateNumber; return n; }); }} placeholder="เช่น 1กก 1234" />
                {formErrors.plateNumber && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.plateNumber}</span>}
            </div>
            <div>
                <label style={labelStyle}>ประเภท</label>
                <select style={inputStyle} value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}>
                    {vehicleTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div>
                <label style={labelStyle}>ยี่ห้อ *</label>
                <input style={{ ...inputStyle, ...(formErrors.brand ? { borderColor: '#ef4444', background: 'rgba(239,68,68,0.04)' } : {}) }} value={form.brand} onChange={e => { setForm(prev => ({ ...prev, brand: e.target.value })); setFormErrors(prev => { const n = { ...prev }; delete n.brand; return n; }); }} placeholder="HINO, ISUZU..." />
                {formErrors.brand && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.brand}</span>}
            </div>
            <div>
                <label style={labelStyle}>รุ่น</label>
                <input style={inputStyle} value={form.model} onChange={e => setForm(prev => ({ ...prev, model: e.target.value }))} placeholder="FL8J, FE85..." />
            </div>
            <div>
                <label style={labelStyle}>ปี</label>
                <input style={inputStyle} type="number" value={form.year} onChange={e => setForm(prev => ({ ...prev, year: Number(e.target.value) }))} />
            </div>
            <div>
                <label style={labelStyle}>สถานะ</label>
                <select style={inputStyle} value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}>
                    {vehicleStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
            </div>
            <div>
                <label style={labelStyle}>น้ำมัน (%)</label>
                <input style={inputStyle} type="number" min={0} max={100} value={form.fuelLevel} onChange={e => setForm(prev => ({ ...prev, fuelLevel: Number(e.target.value) }))} />
            </div>
            <div>
                <label style={labelStyle}>ระยะทาง (กม.)</label>
                <input style={inputStyle} type="number" value={form.mileage} onChange={e => setForm(prev => ({ ...prev, mileage: Number(e.target.value) }))} />
            </div>
            <div>
                <label style={labelStyle}>ความจุ (ตัน)</label>
                <input style={inputStyle} type="number" value={form.capacity} onChange={e => setForm(prev => ({ ...prev, capacity: Number(e.target.value) }))} />
            </div>
            <div>
                <label style={labelStyle}>ซ่อมบำรุงถัดไป</label>
                <input style={inputStyle} type="date" value={form.nextMaintenance} onChange={e => setForm(prev => ({ ...prev, nextMaintenance: e.target.value }))} />
            </div>
            <div>
                <label style={labelStyle}>ประกันหมดอายุ</label>
                <input style={inputStyle} type="date" value={form.insuranceExpiry} onChange={e => setForm(prev => ({ ...prev, insuranceExpiry: e.target.value }))} />
            </div>
        </div>
    );

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

    return (
        <div className="animate-fade-in">

            {/* Score Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <ScoreCard icon={<Truck size={22} />} color="#3b82f6" label="รถทั้งหมด" value={String(counts.all)} sub="คัน" bg="rgba(59,130,246,0.07)" />
                <ScoreCard icon={<Activity size={22} />} color="#f59e0b" label="กำลังวิ่ง" value={String(counts['on-trip'])} sub="คัน" bg="rgba(245,158,11,0.07)" />
                <ScoreCard icon={<Shield size={22} />} color="#10b981" label="พร้อมใช้" value={String(counts.available)} sub="คัน" bg="rgba(16,185,129,0.07)" />
                <ScoreCard icon={<Gauge size={22} />} color="#8b5cf6" label="ซ่อมบำรุง" value={String(counts.maintenance)} sub="คัน" bg="rgba(139,92,246,0.07)" />
                <ScoreCard icon={<Fuel size={22} />} color={avgFuel < 30 ? '#ef4444' : '#10b981'} label="น้ำมันเฉลี่ย" value={`${avgFuel}%`} sub={avgFuel < 30 ? 'ต่ำ' : 'ปกติ'} bg={avgFuel < 30 ? 'rgba(239,68,68,0.07)' : 'rgba(16,185,129,0.07)'} />
                <ScoreCard icon={<Gauge size={22} />} color="#6366f1" label="ระยะทางรวม" value={totalMileage.toLocaleString()} sub="กม." bg="rgba(99,102,241,0.07)" />
            </div>

            {/* Export + Search + Filter dropdown + Add — single row */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap',
            }}>
                {/* Export buttons */}
                <button onClick={exportXLSX} style={exportBtnStyle('#10b981')}>
                    <FileSpreadsheet size={14} /> XLSX
                </button>
                <button onClick={exportCSV} style={exportBtnStyle('#10b981')}>
                    <FileText size={14} /> CSV
                </button>
                <button onClick={exportPDF} style={exportBtnStyle('#ef4444')}>
                    <Download size={14} /> PDF
                </button>
                {selectedIds.size > 0 && (
                    <>
                        <span style={{
                            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px',
                            color: 'var(--accent-blue)', fontWeight: 600,
                            padding: '5px 10px', borderRadius: '8px',
                            background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.15)',
                        }}>
                            ✓ {selectedIds.size} รายการ
                        </span>
                        <button onClick={() => setSelectedIds(new Set())} style={{
                            background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '11px',
                            cursor: 'pointer', textDecoration: 'underline',
                        }}>ยกเลิก</button>
                    </>
                )}

                <div style={{ flex: 1 }} />

                {/* Status filter dropdown */}
                <select
                    value={filter}
                    onChange={e => { setFilter(e.target.value); setCurrentPage(1); }}
                    style={{
                        padding: '7px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 500,
                        border: '1.5px solid var(--border-color)', background: 'var(--bg-card)',
                        color: 'var(--text-primary)', fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
                        minWidth: '160px',
                    }}
                >
                    <option value="all">รถทั้งหมด ({counts.all})</option>
                    <option value="on-trip">🚛 กำลังวิ่ง ({counts['on-trip']})</option>
                    <option value="available">พร้อมใช้ ({counts.available})</option>
                    <option value="maintenance">🔧 ซ่อมบำรุง ({counts.maintenance})</option>
                </select>

                {/* Search */}
                <div className="topbar-search" style={{ minWidth: '180px' }}>
                    <Search size={16} />
                    <input placeholder="ค้นหาทะเบียน, ยี่ห้อ..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
                </div>

                {/* View toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'var(--bg-primary)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border-color)' }}>
                    <button onClick={() => setViewMode('list')} title="List"
                        style={{
                            ...viewToggleStyle, background: viewMode === 'list' ? 'var(--accent-blue)' : 'transparent',
                            color: viewMode === 'list' ? 'white' : 'var(--text-muted)',
                        }}><List size={16} /></button>
                    <button onClick={() => setViewMode('grid')} title="Grid"
                        style={{
                            ...viewToggleStyle, background: viewMode === 'grid' ? 'var(--accent-blue)' : 'transparent',
                            color: viewMode === 'grid' ? 'white' : 'var(--text-muted)',
                        }}><LayoutGrid size={16} /></button>
                </div>

                {/* Add button */}
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
                                        <input
                                            type="checkbox"
                                            checked={filtered.length > 0 && selectedIds.size === filtered.length}
                                            onChange={toggleSelectAll}
                                            style={{ accentColor: '#3b82f6', width: '16px', height: '16px', cursor: 'pointer' }}
                                            title="เลือกทั้งหมด"
                                        />
                                    </th>
                                    <th>ID</th><th>ทะเบียน</th><th>ประเภท</th><th>ยี่ห้อ/รุ่น</th><th>สถานะ</th><th>น้ำมัน</th><th>ระยะทาง</th><th>บรรทุก</th><th style={{ textAlign: 'center', width: '120px' }}>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paged.map(v => (
                                    <tr key={v.id} style={{ background: selectedIds.has(v.id) ? 'rgba(59, 130, 246, 0.04)' : undefined }}>
                                        <td style={{ textAlign: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(v.id)}
                                                onChange={() => toggleSelect(v.id)}
                                                style={{ accentColor: '#3b82f6', width: '16px', height: '16px', cursor: 'pointer' }}
                                            />
                                        </td>
                                        <td><span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{v.id}</span></td>
                                        <td style={{ fontWeight: 600 }}>{v.plateNumber}</td>
                                        <td>{v.type}</td>
                                        <td>{v.brand} {v.model} ({v.year})</td>
                                        <td><span className={`status-badge ${statusColors[v.status]}`}>{statusLabels[v.status]}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
                                                <Fuel size={14} style={{ color: v.fuelLevel < 30 ? 'var(--accent-red)' : 'var(--accent-green)' }} />
                                                <span style={{ color: v.fuelLevel < 30 ? 'var(--accent-red)' : undefined }}>{v.fuelLevel}%</span>
                                            </div>
                                        </td>
                                        <td>{v.mileage.toLocaleString()} กม.</td>
                                        <td>{v.capacity} ตัน</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                <button onClick={() => handleView(v)} title="ดูรายละเอียด" style={actionBtnStyle}>
                                                    <Eye size={15} />
                                                </button>
                                                <button onClick={() => handleEdit(v)} title="แก้ไข" style={{ ...actionBtnStyle, color: 'var(--accent-amber)' }}>
                                                    <Pencil size={15} />
                                                </button>
                                                <button onClick={() => handleDeleteClick(v)} title="ลบ" style={{ ...actionBtnStyle, color: 'var(--accent-red)' }}>
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paged.length === 0 && (
                                    <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>ไม่พบข้อมูลรถ</td></tr>
                                )}
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
                        {paged.map(v => (
                            <div key={v.id} style={{
                                background: 'var(--bg-card)', borderRadius: '14px', padding: '16px',
                                border: selectedIds.has(v.id) ? '2px solid var(--accent-blue)' : '1px solid var(--border-color)',
                                transition: 'all 0.2s', cursor: 'pointer', position: 'relative',
                            }} onClick={() => toggleSelect(v.id)}>
                                {/* Header */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '10px',
                                            background: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Truck size={18} style={{ color: 'var(--accent-blue)' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--accent-blue)' }}>{v.id}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{v.type}</div>
                                        </div>
                                    </div>
                                    <span className={`status-badge ${statusColors[v.status]}`} style={{ fontSize: '11px' }}>
                                        {statusLabels[v.status]}
                                    </span>
                                </div>

                                {/* Plate + Brand */}
                                <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
                                    {v.plateNumber}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                    {v.brand} {v.model} ({v.year})
                                </div>

                                {/* Stats */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                    <div style={{ textAlign: 'center', padding: '6px', borderRadius: '8px', background: 'var(--bg-primary)' }}>
                                        <Fuel size={14} style={{ color: v.fuelLevel < 30 ? 'var(--accent-red)' : 'var(--accent-green)', margin: '0 auto 2px' }} />
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: v.fuelLevel < 30 ? 'var(--accent-red)' : 'var(--text-primary)' }}>{v.fuelLevel}%</div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>น้ำมัน</div>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '6px', borderRadius: '8px', background: 'var(--bg-primary)' }}>
                                        <Gauge size={14} style={{ color: 'var(--accent-blue)', margin: '0 auto 2px' }} />
                                        <div style={{ fontSize: '14px', fontWeight: 700 }}>{v.mileage.toLocaleString()}</div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>กม.</div>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '6px', borderRadius: '8px', background: 'var(--bg-primary)' }}>
                                        <Weight size={14} style={{ color: '#8b5cf6', margin: '0 auto 2px' }} />
                                        <div style={{ fontSize: '14px', fontWeight: 700 }}>{v.capacity}</div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ตัน</div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                                    <button onClick={e => { e.stopPropagation(); handleView(v); }} title="ดู" style={actionBtnStyle}><Eye size={15} /></button>
                                    <button onClick={e => { e.stopPropagation(); handleEdit(v); }} title="แก้ไข" style={{ ...actionBtnStyle, color: 'var(--accent-amber)' }}><Pencil size={15} /></button>
                                    <button onClick={e => { e.stopPropagation(); handleDeleteClick(v); }} title="ลบ" style={{ ...actionBtnStyle, color: 'var(--accent-red)' }}><Trash2 size={15} /></button>
                                </div>

                                {/* Selection checkbox */}
                                <input type="checkbox" checked={selectedIds.has(v.id)} readOnly
                                    style={{ position: 'absolute', top: '12px', right: '12px', accentColor: '#3b82f6', width: '16px', height: '16px', display: 'none' }} />
                            </div>
                        ))}
                    </div>
                    {paged.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>ไม่พบข้อมูลรถ</div>
                    )}
                    {/* Pagination for grid */}
                    <div className="card" style={{ marginTop: '12px' }}>
                        {renderPagination()}
                    </div>
                </>
            )}

            {/* ===== ADD MODAL ===== */}
            {
                showAddModal && (
                    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                        <div className="modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Plus size={20} style={{ color: 'var(--accent-blue)' }} /> เพิ่มรถใหม่
                                </h3>
                                <button onClick={() => setShowAddModal(false)} style={closeBtnStyle}><X size={18} /></button>
                            </div>
                            <div className="modal-body">
                                {renderFormFields('add')}
                            </div>
                            <div className="modal-footer">
                                <button onClick={() => setShowAddModal(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                                <button onClick={handleSaveNew} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }} className="btn btn-primary btn-sm" disabled={saving || !form.id || !form.plateNumber || !form.brand}>{showAddModal ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ===== VIEW MODAL ===== */}
            {
                showViewModal && selectedVehicle && (
                    <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
                        <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Truck size={20} style={{ color: 'var(--accent-blue)' }} /> รายละเอียดรถ {selectedVehicle.id}
                                </h3>
                                <button onClick={() => setShowViewModal(false)} style={closeBtnStyle}><X size={18} /></button>
                            </div>
                            <div className="modal-body">
                                {/* Score Gauges */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                    {/* Fuel Gauge */}
                                    <div style={{ textAlign: 'center', padding: '16px 12px', borderRadius: '12px', background: selectedVehicle.fuelLevel < 30 ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)', border: '1px solid var(--border-color)' }}>
                                        <Fuel size={20} style={{ color: selectedVehicle.fuelLevel < 30 ? '#ef4444' : '#10b981', marginBottom: '6px' }} />
                                        <div style={{ fontSize: '24px', fontWeight: 800, color: selectedVehicle.fuelLevel < 30 ? '#ef4444' : '#10b981' }}>{selectedVehicle.fuelLevel}%</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>น้ำมัน</div>
                                        <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border-color)' }}>
                                            <div style={{ width: `${selectedVehicle.fuelLevel}%`, height: '100%', borderRadius: '3px', background: selectedVehicle.fuelLevel < 30 ? '#ef4444' : '#10b981', transition: 'width 0.5s' }} />
                                        </div>
                                    </div>
                                    {/* Mileage */}
                                    <div style={{ textAlign: 'center', padding: '16px 12px', borderRadius: '12px', background: 'rgba(59,130,246,0.06)', border: '1px solid var(--border-color)' }}>
                                        <Gauge size={20} style={{ color: '#3b82f6', marginBottom: '6px' }} />
                                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedVehicle.mileage.toLocaleString()}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>กิโลเมตร</div>
                                    </div>
                                    {/* Capacity */}
                                    <div style={{ textAlign: 'center', padding: '16px 12px', borderRadius: '12px', background: 'rgba(139,92,246,0.06)', border: '1px solid var(--border-color)' }}>
                                        <Weight size={20} style={{ color: '#8b5cf6', marginBottom: '6px' }} />
                                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedVehicle.capacity}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ตัน</div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <DetailRow icon={<Truck size={16} />} label="รหัส" value={selectedVehicle.id} />
                                    <DetailRow icon={<span>🔢</span>} label="ทะเบียน" value={selectedVehicle.plateNumber} highlight />
                                    <DetailRow icon={<span>📋</span>} label="ประเภท" value={selectedVehicle.type} />
                                    <DetailRow icon={<span>🏭</span>} label="ยี่ห้อ/รุ่น" value={`${selectedVehicle.brand} ${selectedVehicle.model}`} />
                                    <DetailRow icon={<Calendar size={16} />} label="ปี" value={String(selectedVehicle.year)} />
                                    <DetailRow icon={<span>📊</span>} label="สถานะ" value={statusLabels[selectedVehicle.status] || selectedVehicle.status} />
                                    <DetailRow icon={<Shield size={16} />} label="ประกันหมดอายุ" value={selectedVehicle.insuranceExpiry || '-'} />
                                    <DetailRow icon={<span>🔧</span>} label="ซ่อมบำรุงถัดไป" value={selectedVehicle.nextMaintenance || '-'} />
                                    <DetailRow icon={<span>👤</span>} label="คนขับประจำ" value={selectedVehicle.driverId || 'ไม่มี'} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary btn-sm" onClick={() => setShowViewModal(false)}>ปิด</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ===== EDIT MODAL ===== */}
            {
                showEditModal && selectedVehicle && (
                    <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                        <div className="modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Pencil size={20} style={{ color: 'var(--accent-amber)' }} /> แก้ไขรถ {selectedVehicle.id}
                                </h3>
                                <button onClick={() => setShowEditModal(false)} style={closeBtnStyle}><X size={18} /></button>
                            </div>
                            <div className="modal-body">
                                {renderFormFields('edit')}
                            </div>
                            <div className="modal-footer">
                                <button onClick={() => setShowEditModal(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                                <button onClick={handleSaveEdit} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }} className="btn btn-primary btn-sm" disabled={saving}>{showAddModal ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ===== DELETE CONFIRM ===== */}
            {
                showDeleteConfirm && selectedVehicle && (
                    <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                        <div className="modal" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)' }}>
                                    <Trash2 size={20} /> ยืนยันลบรถ
                                </h3>
                                <button onClick={() => setShowDeleteConfirm(false)} style={closeBtnStyle}><X size={18} /></button>
                            </div>
                            <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 16px',
                                    background: 'rgba(239, 68, 68, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Trash2 size={28} style={{ color: 'var(--accent-red)' }} />
                                </div>
                                <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
                                    ลบรถ {selectedVehicle.id}?
                                </p>
                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    ทะเบียน <strong>{selectedVehicle.plateNumber}</strong> — {selectedVehicle.brand} {selectedVehicle.model}
                                    <br />การดำเนินการนี้ไม่สามารถย้อนกลับได้
                                </p>
                            </div>
                            <div className="modal-footer" style={{ justifyContent: 'center', gap: '12px' }}>
                                <button onClick={() => setShowDeleteConfirm(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                                <button className="btn btn-sm" onClick={handleDelete} disabled={saving}
                                    style={{
                                        background: 'var(--accent-red)', color: 'white', border: 'none', borderRadius: '8px',
                                        padding: '8px 20px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
                                    }}>
                                    {saving ? 'กำลังลบ...' : <><Trash2 size={14} /> ลบรถ</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}

// ===== Detail Row for View Modal =====
function DetailRow({ icon, label, value, highlight, valueColor }: {
    icon: React.ReactNode; label: string; value: string; highlight?: boolean; valueColor?: string;
}) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', gap: '4px',
            padding: '12px 14px', borderRadius: '10px',
            background: highlight ? 'rgba(59, 130, 246, 0.04)' : 'var(--bg-primary)',
            border: highlight ? '1px solid rgba(59, 130, 246, 0.12)' : '1px solid transparent',
        }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                {icon} {label}
            </span>
            <span style={{ fontSize: '15px', fontWeight: 600, color: valueColor || 'var(--text-primary)' }}>
                {value}
            </span>
        </div>
    );
}

// ===== Helpers =====
function dateStr() {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}${String(d.getSeconds()).padStart(2, '0')}`;
}

// downloadBlob removed — using file-saver (saveAs) for reliable cross-browser downloads

// ===== Shared Styles =====
const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)',
    borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'inherit', outline: 'none',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
};

const actionBtnStyle: React.CSSProperties = {
    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer',
    color: 'var(--accent-blue)', transition: 'all 0.15s',
};

const closeBtnStyle: React.CSSProperties = {
    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px',
    borderRadius: '8px', display: 'flex',
};

const viewToggleStyle: React.CSSProperties = {
    width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s',
};

function exportBtnStyle(borderColor: string): React.CSSProperties {
    return {
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '6px 12px', borderRadius: '8px',
        border: `1.5px solid ${borderColor}`,
        background: 'transparent', color: borderColor,
        fontSize: '12px', fontWeight: 600, fontFamily: 'inherit',
        cursor: 'pointer', transition: 'all 0.15s',
    };
}

// ===== Score Card Component =====
function ScoreCard({ icon, color, label, value, sub, bg }: {
    icon: React.ReactNode; color: string; label: string; value: string; sub: string; bg: string;
}) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '16px 18px', borderRadius: '14px',
            background: bg, border: '1px solid transparent',
            transition: 'all 0.2s',
        }}>
            <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color, flexShrink: 0,
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '2px' }}>{label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '22px', fontWeight: 700, color }}>{value}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub}</span>
                </div>
            </div>
        </div>
    );
}

// ===== Pagination Helpers =====
function pageBtnStyle(disabled: boolean): React.CSSProperties {
    return {
        width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
        opacity: disabled ? 0.5 : 1,
        fontSize: '13px', fontFamily: 'inherit', transition: 'all 0.15s',
    };
}

function pageNumbers(current: number, total: number): (number | string)[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | string)[] = [];
    if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
    } else if (current >= total - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
    }
    return pages;
}
