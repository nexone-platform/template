'use client';
import { useSystemConfig } from '@nexone/ui';

import React, { useState, useEffect, useCallback } from 'react';
import StatusDropdown from '@/components/StatusDropdown';
import { Search, Plus, Eye, Pencil, Trash2, X, FileSpreadsheet, Info, FileText, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, LayoutGrid, List, Package, MapPin, DollarSign, Truck, User, Calendar, Weight } from 'lucide-react';
import { api, Order, LocationItem } from '@/services/api';
import { ExportButtons, ImportExcelButton, SearchInput } from '@/components/CrudComponents';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/exportUtils';
import { usePagePermission } from '@/contexts/PermissionContext';

const statusLabels: Record<string, string> = { pending: 'รอจัดส่ง', 'in-transit': 'กำลังขนส่ง', completed: 'สำเร็จ', cancelled: 'ยกเลิก' };
const statusColors: Record<string, string> = { pending: 'pending', 'in-transit': 'active', completed: 'completed', cancelled: 'inactive' };
const priorityLabels: Record<string, string> = { normal: 'ปกติ', urgent: '🔥 เร่งด่วน', express: '⚡ ด่วนพิเศษ' };
const priorityColors: Record<string, string> = { normal: 'var(--accent-blue)', urgent: 'var(--accent-amber)', express: 'var(--accent-red)' };

const emptyForm = {
    id: '', customerName: '', origin: '', destination: '', cargoType: '', weight: 0,
    status: 'pending', priority: 'normal', deliveryDate: '', estimatedCost: 0, vehicleId: '', driverId: '',
};

const cargoTypes = ['อาหาร', 'วัสดุก่อสร้าง', 'เคมีภัณฑ์', 'อิเล็กทรอนิกส์', 'สินค้าทั่วไป', 'น้ำมัน', 'เกษตร', 'อื่นๆ'];

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

export default function TemplateMaster3Page() {
    const perm = usePagePermission('Master Type 3');
    const hasActions = perm.canView || perm.canEdit || perm.canDelete;

    const [orders, setOrders] = useState<Order[]>([]);
    const [filter, setFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Selection for export
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const { configs, loading: configLoading } = useSystemConfig();
    const [pageSize, setPageSize] = useState(configs?.pageRecordDefault || 10);
    const [hasSetDefaultPageSize, setHasSetDefaultPageSize] = useState(false);

    useEffect(() => {
        if (!configLoading && configs?.pageRecordDefault && !hasSetDefaultPageSize) {
            setPageSize(configs.pageRecordDefault);
            setHasSetDefaultPageSize(true);
        }
    }, [configLoading, configs?.pageRecordDefault, hasSetDefaultPageSize]);

    // View mode
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Locations for origin/destination dropdowns
    const [locationsList, setLocationsList] = useState<LocationItem[]>([]);

    const loadOrders = useCallback(() => {
        setLoading(true);
        api.getOrders().then(o => { setOrders(o || []); setLoading(false); }).catch(() => setLoading(false));
        api.getLocations().then(l => setLocationsList(l || [])).catch(() => {});
    }, []);

    useEffect(() => { loadOrders(); }, [loadOrders]);

    const filtered = orders.filter(o => {
        const matchFilter = filter === 'all' || o.status === filter;
        const matchPriority = priorityFilter === 'all' || o.priority === priorityFilter;
        const matchSearch = search === '' || o.customerName.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()) || o.origin.toLowerCase().includes(search.toLowerCase()) || o.destination.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchPriority && matchSearch;
    });

    const counts = {
        all: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        'in-transit': orders.filter(o => o.status === 'in-transit').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    };

    const totalCost = orders.reduce((a, o) => a + o.estimatedCost, 0);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

    // ===== Date Utils =====
    // removed local dateStr and triggerDownload as they are provided by exportUtils

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
        else setSelectedIds(new Set(filtered.map(o => o.id)));
    };
    const getExportData = () => selectedIds.size > 0 ? filtered.filter(o => selectedIds.has(o.id)) : filtered;

    const exportColumns = [
        { key: 'id', label: 'Order ID' },
        { key: 'customerName', label: 'ลูกค้า' },
        { key: 'origin', label: 'ต้นทาง' },
        { key: 'destination', label: 'ปลายทาง' },
        { key: 'cargoType', label: 'สินค้า' },
        { key: 'weight', label: 'น้ำหนัก (ตัน)' },
        { key: 'priority', label: 'Priority', format: (v: any) => priorityLabels[v] || v },
        { key: 'status', label: 'สถานะ', format: (v: any) => statusLabels[v] || v },
        { key: 'estimatedCost', label: 'ราคา (บาท)' },
        { key: 'deliveryDate', label: 'วันส่ง' },
    ];


    // ===== Handlers =====
    const handleAdd = () => { setForm(emptyForm); setFormErrors({}); setShowAddModal(true); };
    const handleView = (o: Order) => { setSelectedOrder(o); setShowViewModal(true); };
    const handleEdit = (o: Order) => {
        setSelectedOrder(o);
        setForm({
            id: o.id, customerName: o.customerName, origin: o.origin, destination: o.destination,
            cargoType: o.cargoType, weight: o.weight, status: o.status, priority: o.priority,
            deliveryDate: o.deliveryDate, estimatedCost: o.estimatedCost,
            vehicleId: o.vehicleId || '', driverId: o.driverId || '',
        });
        setFormErrors({});
        setShowEditModal(true);
    };
    const handleDeleteClick = (o: Order) => { setSelectedOrder(o); setShowDeleteConfirm(true); };

    const validateForm = (mode: 'add' | 'edit'): boolean => {
        const errors: Record<string, string> = {};
        if (mode === 'add' && !form.id.trim()) errors.id = 'กรุณาระบุรหัส';
        if (!form.customerName.trim()) errors.customerName = 'กรุณาระบุชื่อลูกค้า';
        if (!form.origin.trim()) errors.origin = 'กรุณาเลือกต้นทาง';
        if (!form.destination.trim()) errors.destination = 'กรุณาเลือกปลายทาง';
        if (form.origin && form.destination && form.origin === form.destination) errors.destination = 'ต้นทางและปลายทางต้องไม่ซ้ำกัน';
        if (!form.deliveryDate) errors.deliveryDate = 'กรุณาระบุวันส่ง';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveNew = async () => {
        if (!validateForm('add')) return;
        setSaving(true);
        try {
            await api.createOrder({
                id: form.id, customerName: form.customerName, origin: form.origin, destination: form.destination,
                cargoType: form.cargoType, weight: form.weight, status: form.status, priority: form.priority,
                deliveryDate: form.deliveryDate, estimatedCost: form.estimatedCost,
                vehicleId: form.vehicleId || undefined, driverId: form.driverId || undefined,
            });
            setShowAddModal(false);
            loadOrders();
        } catch { /* */ }
        setSaving(false);
    };

    const handleSaveEdit = async () => {
        if (!selectedOrder) return;
        if (!validateForm('edit')) return;
        setSaving(true);
        try {
            await api.updateOrder(selectedOrder.id, {
                customerName: form.customerName, origin: form.origin, destination: form.destination,
                cargoType: form.cargoType, weight: form.weight, status: form.status, priority: form.priority,
                deliveryDate: form.deliveryDate, estimatedCost: form.estimatedCost,
                vehicleId: form.vehicleId || undefined, driverId: form.driverId || undefined,
            });
            setShowEditModal(false);
            loadOrders();
        } catch { /* */ }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!selectedOrder) return;
        setSaving(true);
        try {
            await api.deleteOrder(selectedOrder.id);
            setShowDeleteConfirm(false);
            loadOrders();
        } catch { /* */ }
        setSaving(false);
    };

    // ===== Form Fields =====
    const clearError = (key: string) => setFormErrors(p => { const n = { ...p }; delete n[key]; return n; });

    const renderFormFields = (mode: 'add' | 'edit') => {
        // Filter locations by type for origin/destination
        const originLocations = locationsList.filter(l => l.type === 'origin' || l.type === 'both');
        const destinationLocations = locationsList.filter(l => l.type === 'destination' || l.type === 'both');
        // Exclude selected destination from origin options and vice versa
        const availableOrigins = originLocations.filter(l => l.name !== form.destination);
        const availableDestinations = destinationLocations.filter(l => l.name !== form.origin);

        return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {mode === 'add' && (
                    <div>
                        <label style={labelStyle}>รหัส Order *</label>
                        <input style={{ ...inputStyle, ...(formErrors.id ? errorInputStyle : {}) }} value={form.id} onChange={e => { setForm(p => ({ ...p, id: e.target.value })); clearError('id'); }} placeholder="เช่น ORD-051" />
                        {formErrors.id && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.id}</span>}
                    </div>
                )}
                <div>
                    <label style={labelStyle}>ชื่อลูกค้า *</label>
                    <input style={{ ...inputStyle, ...(formErrors.customerName ? errorInputStyle : {}) }} value={form.customerName} onChange={e => { setForm(p => ({ ...p, customerName: e.target.value })); clearError('customerName'); }} placeholder="ชื่อบริษัท/ลูกค้า" />
                    {formErrors.customerName && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.customerName}</span>}
                </div>
                <div>
                    <label style={labelStyle}>ประเภทสินค้า</label>
                    <select style={inputStyle} value={form.cargoType} onChange={e => setForm(p => ({ ...p, cargoType: e.target.value }))}>
                        <option value="">-- เลือก --</option>
                        {cargoTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>ต้นทาง *</label>
                    <select style={{ ...inputStyle, ...(formErrors.origin ? errorInputStyle : {}) }} value={form.origin} onChange={e => { setForm(p => ({ ...p, origin: e.target.value })); clearError('origin'); }}>
                        <option value="">-- เลือกต้นทาง --</option>
                        {availableOrigins.map(l => (
                            <option key={l.id} value={l.name}>{l.name} ({l.province})</option>
                        ))}
                    </select>
                    {formErrors.origin && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.origin}</span>}
                </div>
                <div>
                    <label style={labelStyle}>ปลายทาง *</label>
                    <select style={{ ...inputStyle, ...(formErrors.destination ? errorInputStyle : {}) }} value={form.destination} onChange={e => { setForm(p => ({ ...p, destination: e.target.value })); clearError('destination'); }}>
                        <option value="">-- เลือกปลายทาง --</option>
                        {availableDestinations.map(l => (
                            <option key={l.id} value={l.name}>{l.name} ({l.province})</option>
                        ))}
                    </select>
                    {formErrors.destination && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.destination}</span>}
                </div>
                <div>
                    <label style={labelStyle}>น้ำหนัก (ตัน)</label>
                    <input style={inputStyle} type="number" min={0} value={form.weight} onChange={e => setForm(p => ({ ...p, weight: Number(e.target.value) }))} />
                </div>
                <div>
                    <label style={labelStyle}>Priority</label>
                    <select style={inputStyle} value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                        <option value="normal">ปกติ</option>
                        <option value="urgent">🔥 เร่งด่วน</option>
                        <option value="express">⚡ ด่วนพิเศษ</option>
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>สถานะ</label>
                    <select style={inputStyle} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                        <option value="pending">⏳ รอจัดส่ง</option>
                        <option value="in-transit">🚛 กำลังขนส่ง</option>
                        <option value="completed">สำเร็จ</option>
                        <option value="cancelled">❌ ยกเลิก</option>
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>วันส่ง *</label>
                    <input style={{ ...inputStyle, ...(formErrors.deliveryDate ? errorInputStyle : {}) }} type="date" value={form.deliveryDate} onChange={e => { setForm(p => ({ ...p, deliveryDate: e.target.value })); clearError('deliveryDate'); }} />
                    {formErrors.deliveryDate && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.deliveryDate}</span>}
                </div>
                <div>
                    <label style={labelStyle}>ราคาประเมิน (บาท)</label>
                    <input style={inputStyle} type="number" min={0} value={form.estimatedCost} onChange={e => setForm(p => ({ ...p, estimatedCost: Number(e.target.value) }))} />
                </div>
            </div>
        );
    };

    // ===== Pagination =====
    const renderPagination = () => {
        if (filtered.length <= 0) return null;
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', padding: '10px', borderTop: '1px solid var(--border-color)', gap: '12px' }}>
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

    // ===== Modal =====
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

    const viewToggleStyle: React.CSSProperties = {
        width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s',
    };

        const handleImport = async (data: any[]) => {
        setSaving(true);
        try {
            for (const item of data) {
                if (item['ลูกค้า']) {
                    await api.createOrder({
                        id: item['Order ID'] || `ORD-${Math.floor(Math.random() * 1000)}`,
                        customerName: item['ลูกค้า'],
                        origin: item['ต้นทาง'] || '',
                        destination: item['ปลายทาง'] || '',
                        cargoType: item['สินค้า'] || '',
                        weight: Number(item['น้ำหนัก (ตัน)']) || 0,
                        status: 'pending',
                        priority: 'normal',
                        deliveryDate: item['วันส่ง'] || new Date().toISOString().split('T')[0],
                        estimatedCost: Number(item['ราคา (บาท)']) || 0
                    });
                }
            }
            loadOrders();
        } catch (err) {
            console.error('Import failed:', err);
        }
        setSaving(false);
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

    return (
        <div className="animate-fade-in">

            {/* Score Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <ScoreCard icon={<Package size={22} />} color="#3b82f6" label="ทั้งหมด" value={String(orders.length)} sub="รายการ" bg="rgba(59,130,246,0.15)" onClick={() => { setFilter('all'); setCurrentPage(1); }} active={filter === 'all'} />
                <ScoreCard icon={<Package size={22} />} color="#f59e0b" label="รอจัดส่ง" value={String(counts.pending)} sub="รายการ" bg="rgba(245,158,11,0.15)" onClick={() => { setFilter('pending'); setCurrentPage(1); }} active={filter === 'pending'} />
                <ScoreCard icon={<Truck size={22} />} color="#10b981" label="กำลังขนส่ง" value={String(counts['in-transit'])} sub="รายการ" bg="rgba(16,185,129,0.15)" onClick={() => { setFilter('in-transit'); setCurrentPage(1); }} active={filter === 'in-transit'} />
                <ScoreCard icon={<Package size={22} />} color="#8b5cf6" label="สำเร็จ" value={String(counts.completed)} sub="รายการ" bg="rgba(139,92,246,0.15)" onClick={() => { setFilter('completed'); setCurrentPage(1); }} active={filter === 'completed'} />
                <ScoreCard icon={<DollarSign size={22} />} color="#ec4899" label="มูลค่ารวม" value={`฿${totalCost.toLocaleString()}`} sub="" bg="rgba(236,72,153,0.15)" />
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                {perm.canExport && <ExportButtons 
                    onExportXLSX={() => exportToXLSX(getExportData(), 'Template3', exportColumns)}
                    onExportCSV={() => exportToCSV(getExportData(), 'Template3', exportColumns)}
                    onExportPDF={() => exportToPDF(getExportData(), 'Template3', exportColumns, 'Order Report - NexSpeed')}
                />}
                {perm.canAdd && (
                    <ImportExcelButton 
                        onImport={handleImport}
                        expectedColumns={['ลูกค้า', 'ต้นทาง', 'ปลายทาง', 'สินค้า', 'น้ำหนัก (ตัน)', 'ราคา (บาท)', 'วันส่ง']}
                        isLoading={saving}
                    />
                )}
                {selectedIds.size > 0 && (
                    <>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-blue)', fontWeight: 600, padding: '5px 10px', borderRadius: '8px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                            ✓ {selectedIds.size} รายการ
                        </span>
                        <button onClick={() => setSelectedIds(new Set())} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                    </>
                )}

                <div style={{ flex: 1 }} />



                {perm.canView && <SearchInput value={search} onChange={(val) => { setSearch(val); setCurrentPage(1); }} onClear={() => { setSearch(''); setCurrentPage(1); }} placeholder="ค้นหาลูกค้า, Order..." />}

                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'var(--bg-primary)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border-color)' }}>
                    <button onClick={() => setViewMode('list')} title="List"
                        style={{ ...viewToggleStyle, background: viewMode === 'list' ? 'var(--accent-blue)' : 'transparent', color: viewMode === 'list' ? 'white' : 'var(--text-muted)' }}><List size={16} /></button>
                    <button onClick={() => setViewMode('grid')} title="Grid"
                        style={{ ...viewToggleStyle, background: viewMode === 'grid' ? 'var(--accent-blue)' : 'transparent', color: viewMode === 'grid' ? 'white' : 'var(--text-muted)' }}><LayoutGrid size={16} /></button>
                </div>

                {perm.canAdd && <button onClick={handleAdd} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /> <span>เพิ่มข้อมูล</span></button>}
            </div>

            {/* ===== LIST VIEW ===== */}
            {viewMode === 'list' && (
                <div className="card">
                    <div className="data-table-wrapper" style={{ height: '600px', overflowY: 'auto' }}>
                        <table className="data-table" style={{ position: 'relative' }}>
                            <thead style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--bg-card)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                <tr>
                                    <th style={{ width: '40px', textAlign: 'center' }}>
                                        <input type="checkbox" checked={filtered.length > 0 && selectedIds.size === filtered.length} onChange={toggleSelectAll}
                                            style={{ accentColor: '#3b82f6', width: '16px', height: '16px', cursor: 'pointer' }} title="เลือกทั้งหมด" />
                                    </th>
                                    <th>Order ID</th><th>ลูกค้า</th><th>สินค้า</th><th>ต้นทาง → ปลายทาง</th><th>น้ำหนัก</th><th>Priority</th><th>ราคา</th><th>วันส่ง</th><th style={{ textAlign: 'center' }}>สถานะ</th>{hasActions && <th style={{ textAlign: 'center', width: '120px' }}>จัดการ</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {paged.map(o => (
                                    <tr key={o.id} style={{ background: selectedIds.has(o.id) ? 'rgba(59,130,246,0.04)' : undefined }}>
                                        <td style={{ textAlign: 'center' }}>
                                            <input type="checkbox" checked={selectedIds.has(o.id)} onChange={() => toggleSelect(o.id)}
                                                style={{ accentColor: '#3b82f6', width: '15px', height: '15px', cursor: 'pointer' }} />
                                        </td>
                                        <td><span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{o.id}</span></td>
                                        <td style={{ fontWeight: 600, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.customerName}</td>
                                        <td>{o.cargoType}</td>
                                        <td style={{ fontSize: '12px' }}>{o.origin} → {o.destination}</td>
                                        <td>{o.weight} ตัน</td>
                                        <td><span style={{ fontSize: '12px', fontWeight: 600, color: priorityColors[o.priority] }}>{priorityLabels[o.priority]}</span></td>
                                        <td style={{ fontWeight: 600 }}>฿{o.estimatedCost.toLocaleString()}</td>
                                        <td style={{ fontSize: '13px' }}>{o.deliveryDate}</td>
                                        <td style={{ textAlign: 'center' }}><StatusDropdown 
                    value={o.status}
                    onChange={async (newValue: any) => {
                        setOrders(prev => prev.map(x => x.id === o.id ? { ...x, status: newValue } : x));
                        try { await api.updateOrder(o.id, { ...o, status: newValue } as any); } catch(err) { console.error(err); }
                    }}
                    options={Object.keys(statusLabels).map(k => ({ 
                        value: k, 
                        label: statusLabels[k as keyof typeof statusLabels], 
                        color: (['completed'].includes(k) ? 'green' : (['cancelled'].includes(k) ? 'red' : (['in-transit'].includes(k) ? 'blue' : 'yellow'))) as any
                    }))}
                    disabled={!perm.canEdit}
                /></td>
                                        <td style={{ textAlign: 'center' }}>
                                            {hasActions && (
                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                {perm.canView   && <button onClick={() => handleView(o)} title="ดู" style={actionBtnStyle('var(--accent-blue)')}><Eye size={14} /></button>}
                                                {perm.canEdit   && <button onClick={() => handleEdit(o)} title="แก้ไข" style={actionBtnStyle('var(--accent-amber)')}><Pencil size={14} /></button>}
                                                {perm.canDelete && <button onClick={() => handleDeleteClick(o)} title="ลบ" style={actionBtnStyle('var(--accent-red)')}><Trash2 size={14} /></button>}
                                            </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {paged.length === 0 && (
                                    <tr><td colSpan={11} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>ไม่พบข้อมูลคำสั่งขนส่ง</td></tr>
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px', height: '600px', overflowY: 'auto', alignContent: 'start', paddingRight: '4px', paddingBottom: '12px' }}>
                        {paged.map(o => (
                            <div key={o.id} className="card" style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{o.id}</span>
                                    <StatusDropdown 
                    value={o.status}
                    onChange={async (newValue: any) => {
                        setOrders(prev => prev.map(x => x.id === o.id ? { ...x, status: newValue } : x));
                        try { await api.updateOrder(o.id, { ...o, status: newValue } as any); } catch(err) { console.error(err); }
                    }}
                    options={Object.keys(statusLabels).map(k => ({ 
                        value: k, 
                        label: statusLabels[k as keyof typeof statusLabels], 
                        color: (['completed'].includes(k) ? 'green' : (['cancelled'].includes(k) ? 'red' : (['in-transit'].includes(k) ? 'blue' : 'yellow'))) as any
                    }))}
                    disabled={!perm.canEdit}
                />
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{o.customerName}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{o.origin} → {o.destination}</div>
                                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', flexWrap: 'wrap' }}>
                                    <span>{o.cargoType}</span>
                                    <span>⚖️ {o.weight} ตัน</span>
                                    <span style={{ fontWeight: 600, color: priorityColors[o.priority] }}>{priorityLabels[o.priority]}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--accent-blue)' }}>฿{o.estimatedCost.toLocaleString()}</span>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {perm.canView   && <button onClick={() => handleView(o)} style={actionBtnStyle('var(--accent-blue)')}><Eye size={14} /></button>}
                                        {perm.canEdit   && <button onClick={() => handleEdit(o)} style={actionBtnStyle('var(--accent-amber)')}><Pencil size={14} /></button>}
                                        {perm.canDelete && <button onClick={() => handleDeleteClick(o)} style={actionBtnStyle('var(--accent-red)')}><Trash2 size={14} /></button>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="card" style={{ marginTop: '12px', padding: 0 }}>{renderPagination()}</div>
                </>
            )}

            {/* ===== VIEW MODAL ===== */}
            <Modal show={showViewModal} title="รายละเอียดคำสั่งขนส่ง" onClose={() => setShowViewModal(false)}>
                {selectedOrder && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(59,130,246,0.08)', textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: '#3b82f6' }}>฿{selectedOrder.estimatedCost.toLocaleString()}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ราคาประเมิน</div>
                            </div>
                            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>{selectedOrder.weight} ตัน</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>น้ำหนัก</div>
                            </div>
                        </div>
                        <DetailRow icon={<Package size={16} />} label="Order ID" value={selectedOrder.id} />
                        <DetailRow icon={<User size={16} />} label="ลูกค้า" value={selectedOrder.customerName} />
                        <DetailRow icon={<Package size={16} />} label="สินค้า" value={selectedOrder.cargoType} />
                        <DetailRow icon={<MapPin size={16} />} label="ต้นทาง" value={selectedOrder.origin} />
                        <DetailRow icon={<MapPin size={16} />} label="ปลายทาง" value={selectedOrder.destination} />
                        <DetailRow icon={<Weight size={16} />} label="น้ำหนัก" value={`${selectedOrder.weight} ตัน`} />
                        <DetailRow icon={<Calendar size={16} />} label="วันส่ง" value={selectedOrder.deliveryDate} />
                        <DetailRow icon={<Truck size={16} />} label="สถานะ" value={statusLabels[selectedOrder.status]} />
                        
                        <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                                <Info size={16} />
                                <span style={{ fontSize: '13px', fontWeight: 600 }}>ข้อมูลระบบ (System Logs)</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>สร้างโดย</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>-</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>วันที่สร้าง</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('th-TH') : '-'}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>แก้ไขล่าสุดโดย</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>-</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>วันที่แก้ไขล่าสุด</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedOrder.updatedAt ? new Date(selectedOrder.updatedAt).toLocaleString('th-TH') : '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ===== ADD MODAL ===== */}
            <Modal show={showAddModal} title="เพิ่มคำสั่งขนส่งใหม่" onClose={() => setShowAddModal(false)}
                footer={<>
                    <button onClick={() => setShowAddModal(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                    <button onClick={handleSaveNew} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: saving ? 0.5 : 1 }}  disabled={saving}>{showAddModal ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}</button>
                </>}>
                {renderFormFields('add')}
            </Modal>

            {/* ===== EDIT MODAL ===== */}
            <Modal show={showEditModal} title="แก้ไขคำสั่งขนส่ง" onClose={() => setShowEditModal(false)}
                footer={<>
                    <button onClick={() => setShowEditModal(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                    <button onClick={handleSaveEdit} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: saving ? 0.5 : 1 }}  disabled={saving}>{showAddModal ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}</button>
                </>}>
                {renderFormFields('edit')}
            </Modal>

            {/* ===== DELETE CONFIRM ===== */}
            <Modal show={showDeleteConfirm} title="ยืนยันการลบ" onClose={() => setShowDeleteConfirm(false)}
                footer={<>
                    <button onClick={() => setShowDeleteConfirm(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                    <button onClick={handleDelete} disabled={saving}
                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.5 : 1 }}>
                        {saving ? 'กำลังลบ...' : 'ลบ'}
                    </button>
                </>}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    คุณต้องการลบคำสั่ง <strong style={{ color: 'var(--accent-red)' }}>{selectedOrder?.id}</strong> ของ {selectedOrder?.customerName} หรือไม่?
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

function ScoreCard({ icon, color, label, value, sub, bg, onClick, active }: { icon: React.ReactNode; color: string; label: string; value: string; sub: string; bg: string; onClick?: () => void; active?: boolean }) {
    return (
        <div onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', borderRadius: '14px', background: bg, border: active ? `2px solid ${color}` : `1px solid ${color}30`, opacity: (active || !onClick) ? 1 : 0.7, transition: 'all 0.2s' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
            <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '2px' }}>{label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '22px', fontWeight: 800, color }}>{value}</span>
                    {sub && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub}</span>}
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
