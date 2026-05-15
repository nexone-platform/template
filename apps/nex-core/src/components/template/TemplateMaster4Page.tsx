'use client';
import { useSystemConfig, useLanguage } from '@nexone/ui';
import { useAuth } from '@nexone/auth';
import { format } from 'date-fns';

import React, { useState, useEffect, useCallback } from 'react';
import StatusDropdown from '@/components/StatusDropdown';
import { Search, Plus, Eye, Pencil, Trash2, X, FileSpreadsheet, Info, FileText, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, LayoutGrid, List, Package, MapPin, DollarSign, Truck, User, Calendar, Weight, Settings, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { api, Order, LocationItem } from '@/services/api';
import { ExportButtons, SearchInput, AdvancedSearchModal, AdvancedSearchField, BaseModal, SummaryCard, crudStyles } from '@/components/CrudComponents';
import ImportExcelButton from '@/components/ImportExcelButton';
import CrudLayout from '@/components/CrudLayout';
import Pagination from '@/components/Pagination';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/exportUtils';
import { usePagePermission } from '@/contexts/PermissionContext';
import { useApiConfig } from '@/contexts/ApiConfigContext';

const statusLabels = (t: Record<string, string>): Record<string, string> => ({ 
    pending: t['status_pending'] || 'รอจัดส่ง', 
    'in-transit': t['status_in_transit'] || 'กำลังขนส่ง', 
    completed: t['status_completed'] || 'สำเร็จ', 
    cancelled: t['status_cancelled'] || 'ยกเลิก' 
});
const statusColors: Record<string, string> = { pending: 'pending', 'in-transit': 'active', completed: 'completed', cancelled: 'inactive' };
const priorityLabels = (t: Record<string, string>): Record<string, string> => ({ 
    normal: t['priority_normal'] || 'ปกติ', 
    urgent: t['priority_urgent'] || '🔥 เร่งด่วน', 
    express: t['priority_express'] || '⚡ ด่วนพิเศษ' 
});
const priorityColors: Record<string, string> = { normal: 'var(--accent-blue)', urgent: 'var(--accent-amber)', express: 'var(--accent-red)' };

const getStatusLabel = (status: string, t: Record<string, string>) => {
    const map: Record<string, string> = {
        pending: t['status_pending'] || 'รอจัดส่ง',
        'in-transit': t['status_in_transit'] || 'กำลังขนส่ง',
        completed: t['status_completed'] || 'สำเร็จ',
        cancelled: t['status_cancelled'] || 'ยกเลิก'
    };
    return map[status] || status;
};

const getPriorityLabel = (priority: string, t: Record<string, string>) => {
    const map: Record<string, string> = {
        normal: t['priority_normal'] || 'ปกติ',
        urgent: t['priority_urgent'] || '🔥 เร่งด่วน',
        express: t['priority_express'] || '⚡ ด่วนพิเศษ'
    };
    return map[priority] || priority;
};

const emptyForm = {
    id: '', customerName: '', origin: '', destination: '', cargoType: '', weight: 0,
    status: 'pending', priority: 'normal', deliveryDate: '', estimatedCost: 0, vehicleId: '', driverId: '',
};

const getCargoTypes = (t: Record<string, string>) => [
    t['cargo_food'] || 'อาหาร', 
    t['cargo_material'] || 'วัสดุก่อสร้าง', 
    t['cargo_chemical'] || 'เคมีภัณฑ์', 
    t['cargo_electronic'] || 'อิเล็กทรอนิกส์', 
    t['cargo_general'] || 'สินค้าทั่วไป', 
    t['cargo_oil'] || 'น้ำมัน', 
    t['cargo_agri'] || 'เกษตร', 
    t['cargo_others'] || 'อื่นๆ'
];

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

export default function TemplateMaster4Page() {
    const perm = usePagePermission('Master Type 4');
    const { lang } = useLanguage();
    const { getEndpoint } = useApiConfig();
    const coreApi = getEndpoint('NexCore', '');
    const [t, setT] = useState<Record<string, string>>({});
    const { user: authUser } = useAuth();

    const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState({
        id: true,
        customerName: true,
        cargoType: true,
        route: true,
        weight: true,
        priority: true,
        estimatedCost: true,
        deliveryDate: true,
        status: true
    });
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({ key: '', direction: null });

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' | null = 'asc';
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') direction = 'desc';
            else if (sortConfig.direction === 'desc') direction = null;
            else direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const renderSortIcon = (columnKey: string) => {
        if (sortConfig.key !== columnKey || sortConfig.direction === null) {
            return <ChevronsUpDown size={14} style={{ opacity: 0.3 }} />;
        }
        if (sortConfig.direction === 'asc') return <ArrowDown size={14} />;
        return <ArrowUp size={14} />;
    };

    const renderTh = (label: string, columnKey: string, width?: string) => (
        <th style={{ width, cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }} onClick={() => handleSort(columnKey)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                <span>{label}</span>
                {renderSortIcon(columnKey)}
            </div>
        </th>
    );

    useEffect(() => {
        const fetchTranslations = async () => {
            try {
                const res = await fetch(`${coreApi}/translations/map?lang=${lang}`, { credentials: 'include' });
                const data = await res.json();
                if (data && typeof data === 'object') {
                    setT(data);
                }
            } catch (err) {
                console.error('Failed to load translations:', err);
            }
        };
        if (coreApi && lang) {
            fetchTranslations();
        }
    }, [coreApi, lang]);

    const hasActions = perm.canView || perm.canEdit || perm.canDelete;

    const [orders, setOrders] = useState<Order[]>([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    // Advanced Search State
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [advSearchValues, setAdvSearchValues] = useState<Record<string, string>>({
        customerName: '',
        cargoType: '',
        origin: '',
        destination: '',
        status: 'all',
        priority: 'all'
    });

    const advancedSearchFields: AdvancedSearchField[] = [
        { key: 'customerName', label: t['customer'] || 'ลูกค้า', type: 'text', placeholder: t['search_customer'] || 'ชื่อลูกค้า...' },
        { key: 'cargoType', label: t['product'] || 'สินค้า', type: 'text', placeholder: t['search_product'] || 'ประเภทสินค้า...' },
        { key: 'origin', label: t['origin'] || 'ต้นทาง', type: 'text', placeholder: t['search_origin'] || 'ต้นทาง...' },
        { key: 'destination', label: t['destination'] || 'ปลายทาง', type: 'text', placeholder: t['search_destination'] || 'ปลายทาง...' },
        { key: 'status', label: t['status'] || 'สถานะ', type: 'select', options: [
            { value: 'all', label: t['all'] || 'ทั้งหมด' },
            { value: 'pending', label: t['status_pending'] || 'รอจัดส่ง' },
            { value: 'in-transit', label: t['status_in_transit'] || 'กำลังขนส่ง' },
            { value: 'completed', label: t['status_completed'] || 'สำเร็จ' },
            { value: 'cancelled', label: t['status_cancelled'] || 'ยกเลิก' },
        ]},
        { key: 'priority', label: t['priority'] || 'Priority', type: 'select', options: [
            { value: 'all', label: t['all'] || 'ทั้งหมด' },
            { value: 'normal', label: t['priority_normal'] || 'ปกติ' },
            { value: 'urgent', label: t['priority_urgent'] || 'เร่งด่วน' },
            { value: 'express', label: t['priority_express'] || 'ด่วนพิเศษ' },
        ]},
    ];

    const handleAdvSearchChange = (key: string, value: string) => {
        setAdvSearchValues(prev => ({ ...prev, [key]: value }));
    };
    const handleAdvSearchClear = () => {
        setAdvSearchValues({ customerName: '', cargoType: '', origin: '', destination: '', status: 'all', priority: 'all' });
    };
    const handleAdvSearchSubmit = () => {
        setCurrentPage(1);
        setShowAdvancedSearch(false);
    };

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; message: string; isError: boolean }>({ isOpen: false, message: '', isError: false });

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
        api.getLocations().then(l => {
            const sortedLocations = (l || []).sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
            setLocationsList(sortedLocations);
        }).catch(() => {});
    }, []);

    useEffect(() => { loadOrders(); }, [loadOrders]);

    const filtered = orders.filter(o => {
        // Quick Search (Toolbar)
        const matchSearch = search === '' || 
            o.customerName.toLowerCase().includes(search.toLowerCase()) || 
            o.id.toLowerCase().includes(search.toLowerCase()) || 
            o.origin.toLowerCase().includes(search.toLowerCase()) || 
            o.destination.toLowerCase().includes(search.toLowerCase());

        // Card Filter (Status cards at top)
        const matchFilter = filter === 'all' || o.status === filter;

        // Advanced Search filters
        const matchAdvCustomer = !advSearchValues.customerName || o.customerName.toLowerCase().includes(advSearchValues.customerName.toLowerCase());
        const matchAdvCargo = !advSearchValues.cargoType || o.cargoType.toLowerCase().includes(advSearchValues.cargoType.toLowerCase());
        const matchAdvOrigin = !advSearchValues.origin || o.origin.toLowerCase().includes(advSearchValues.origin.toLowerCase());
        const matchAdvDest = !advSearchValues.destination || o.destination.toLowerCase().includes(advSearchValues.destination.toLowerCase());
        const matchAdvStatus = advSearchValues.status === 'all' || o.status === advSearchValues.status;
        const matchAdvPriority = advSearchValues.priority === 'all' || o.priority === advSearchValues.priority;

        return matchSearch && matchFilter && matchAdvCustomer && matchAdvCargo && matchAdvOrigin && matchAdvDest && matchAdvStatus && matchAdvPriority;
    });

    let sortedOrders = [...filtered];
    if (sortConfig.key && sortConfig.direction !== null) {
        sortedOrders.sort((a, b) => {
            let aVal = (a as any)[sortConfig.key];
            let bVal = (b as any)[sortConfig.key];
            if (sortConfig.key === 'route') {
                aVal = a.origin + a.destination;
                bVal = b.origin + b.destination;
            }
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const counts = {
        all: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        'in-transit': orders.filter(o => o.status === 'in-transit').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    };

    const totalCost = orders.reduce((a, o) => a + o.estimatedCost, 0);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(sortedOrders.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paged = sortedOrders.slice((safePage - 1) * pageSize, safePage * pageSize);

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
        { key: 'id', label: t['order_id'] || 'Order ID' },
        { key: 'customerName', label: t['customer_name'] || 'ลูกค้า' },
        { key: 'origin', label: t['origin'] || 'ต้นทาง' },
        { key: 'destination', label: t['destination'] || 'ปลายทาง' },
        { key: 'cargoType', label: t['cargo_type'] || 'สินค้า' },
        { key: 'weight', label: t['weight'] || 'น้ำหนัก (กก)' },
        { key: 'priority', label: t['priority'] || 'Priority', format: (v: any) => priorityLabels(t)[v as keyof ReturnType<typeof priorityLabels>] || v },
        { key: 'status', label: t['status'] || 'สถานะ', format: (v: any) => statusLabels(t)[v as keyof ReturnType<typeof statusLabels>] || v },
        { key: 'estimatedCost', label: t['estimated_cost'] || 'ราคา (บาท)' },
        { key: 'deliveryDate', label: t['delivery_date'] || 'วันส่ง' },
    ];


    const importColumns = [
        { key: 'id', header: t['order_id'] || 'รหัส Order', required: true, type: 'string' as const },
        { key: 'customerName', header: t['customer_name'] || 'ชื่อลูกค้า', required: true, type: 'string' as const },
        { key: 'origin', header: t['origin'] || 'ต้นทาง', required: true, type: 'string' as const },
        { key: 'destination', header: t['destination'] || 'ปลายทาง', required: true, type: 'string' as const },
        { key: 'cargoType', header: t['cargo_type'] || 'ประเภทสินค้า', type: 'string' as const },
        { key: 'weight', header: t['weight'] || 'น้ำหนัก (กก)', type: 'number' as const },
        { key: 'priority', header: t['priority'] || 'Priority', type: 'string' as const },
        { key: 'deliveryDate', header: t['delivery_date'] || 'วันส่ง', type: 'string' as const },
        { key: 'estimatedCost', header: t['estimated_cost'] || 'ราคาประเมิน (บาท)', type: 'number' as const }
    ];

    const handleImport = async (data: any[]) => {
        let success = 0;
        let failed = 0;
        for (const item of data) {
            try {
                await api.createOrder({
                    id: item.id || `ORD-${Math.floor(Math.random() * 1000)}`,
                    customerName: item.customerName,
                    origin: item.origin,
                    destination: item.destination,
                    cargoType: item.cargoType || 'General',
                    weight: Number(item.weight) || 0,
                    status: (item.status as any) || 'pending',
                    priority: (item.priority as any) || 'normal',
                    deliveryDate: item.deliveryDate || new Date().toISOString().split('T')[0],
                    estimatedCost: Number(item.estimatedCost) || 0
                });
                success++;
            } catch {
                failed++;
            }
        }
        return { success, failed };
    };

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
        if (mode === 'add' && !form.id.trim()) errors.id = t['req_order_id'] || 'กรุณาระบุรหัส';
        if (!form.customerName.trim()) errors.customerName = t['req_customer_name'] || 'กรุณาระบุชื่อลูกค้า';
        if (!form.origin.trim()) errors.origin = t['req_origin'] || 'กรุณาเลือกต้นทาง';
        if (!form.destination.trim()) errors.destination = t['req_destination'] || 'กรุณาเลือกปลายทาง';
        if (form.origin && form.destination && form.origin === form.destination) errors.destination = t['req_dest_diff_origin'] || 'ต้นทางและปลายทางต้องไม่ซ้ำกัน';
        if (!form.deliveryDate) errors.deliveryDate = t['req_delivery_date'] || 'กรุณาระบุวันส่ง';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveNew = async () => {
        if (!validateForm('add')) {
            setAlertConfig({ isOpen: true, message: t['form_incomplete'] || 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', isError: true });
            return;
        }
        setSaving(true);
        try {
            await api.createOrder({
                id: form.id, customerName: form.customerName, origin: form.origin, destination: form.destination,
                cargoType: form.cargoType, weight: form.weight, status: form.status, priority: form.priority,
                deliveryDate: form.deliveryDate, estimatedCost: form.estimatedCost,
                vehicleId: form.vehicleId || undefined, driverId: form.driverId || undefined,
                createBy: authUser?.displayName || authUser?.email || 'system',
                updateBy: authUser?.displayName || authUser?.email || 'system',
            } as any);
            setShowAddModal(false);
            setAlertConfig({ isOpen: true, message: t['save_success'] || 'บันทึกข้อมูลเรียบร้อยแล้ว', isError: false });
            loadOrders();
        } catch (err: any) {
            setAlertConfig({ isOpen: true, message: err?.message || t['save_error'] || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', isError: true });
        }
        setSaving(false);
    };

    const handleSaveEdit = async () => {
        if (!selectedOrder) return;
        if (!validateForm('edit')) {
            setAlertConfig({ isOpen: true, message: t['form_incomplete'] || 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', isError: true });
            return;
        }
        setSaving(true);
        try {
            await api.updateOrder(selectedOrder.id, {
                customerName: form.customerName, origin: form.origin, destination: form.destination,
                cargoType: form.cargoType, weight: form.weight, status: form.status, priority: form.priority,
                deliveryDate: form.deliveryDate, estimatedCost: form.estimatedCost,
                vehicleId: form.vehicleId || undefined, driverId: form.driverId || undefined,
                updateBy: authUser?.displayName || authUser?.email || 'system',
            } as any);
            setShowEditModal(false);
            setAlertConfig({ isOpen: true, message: t['save_success'] || 'บันทึกข้อมูลเรียบร้อยแล้ว', isError: false });
            loadOrders();
        } catch (err: any) {
            setAlertConfig({ isOpen: true, message: err?.message || t['save_error'] || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', isError: true });
        }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!selectedOrder) return;
        setSaving(true);
        try {
            await api.deleteOrder(selectedOrder.id);
            setShowDeleteConfirm(false);
            setAlertConfig({ isOpen: true, message: t['delete_success'] || 'ลบข้อมูลเรียบร้อยแล้ว', isError: false });
            loadOrders();
        } catch (err: any) {
            setAlertConfig({ isOpen: true, message: err?.message || t['delete_error'] || 'เกิดข้อผิดพลาดในการลบข้อมูล', isError: true });
        }
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
                        <label style={labelStyle}>{t['order_id'] || 'รหัส Order'} *</label>
                        <input style={{ ...inputStyle, ...(formErrors.id ? errorInputStyle : {}) }} value={form.id} onChange={e => { setForm(p => ({ ...p, id: e.target.value })); clearError('id'); }} placeholder={t['order_id_placeholder'] || "เช่น ORD-051"} />
                        {formErrors.id && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.id}</span>}
                    </div>
                )}
                <div>
                    <label style={labelStyle}>{t['customer_name'] || 'ชื่อลูกค้า'} *</label>
                    <input style={{ ...inputStyle, ...(formErrors.customerName ? errorInputStyle : {}) }} value={form.customerName} onChange={e => { setForm(p => ({ ...p, customerName: e.target.value })); clearError('customerName'); }} placeholder={t['customer_name_placeholder'] || "ชื่อบริษัท/ลูกค้า"} />
                    {formErrors.customerName && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.customerName}</span>}
                </div>
                <div>
                    <label style={labelStyle}>{t['cargo_type'] || 'ประเภทสินค้า'}</label>
                    <select style={inputStyle} value={form.cargoType} onChange={e => setForm(p => ({ ...p, cargoType: e.target.value }))}>
                        <option value="">-- {t['select'] || 'เลือก'} --</option>
                        {getCargoTypes(t).map(ct => <option key={ct} value={ct}>{ct}</option>)}
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>{t['origin'] || 'ต้นทาง'} *</label>
                    <select style={{ ...inputStyle, ...(formErrors.origin ? errorInputStyle : {}) }} value={form.origin} onChange={e => { setForm(p => ({ ...p, origin: e.target.value })); clearError('origin'); }}>
                        <option value="">-- {t['select_origin'] || 'เลือกต้นทาง'} --</option>
                        {availableOrigins.map(l => (
                            <option key={l.id} value={l.name}>{l.name} ({l.province})</option>
                        ))}
                    </select>
                    {formErrors.origin && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.origin}</span>}
                </div>
                <div>
                    <label style={labelStyle}>{t['destination'] || 'ปลายทาง'} *</label>
                    <select style={{ ...inputStyle, ...(formErrors.destination ? errorInputStyle : {}) }} value={form.destination} onChange={e => { setForm(p => ({ ...p, destination: e.target.value })); clearError('destination'); }}>
                        <option value="">-- {t['select_destination'] || 'เลือกปลายทาง'} --</option>
                        {availableDestinations.map(l => (
                            <option key={l.id} value={l.name}>{l.name} ({l.province})</option>
                        ))}
                    </select>
                    {formErrors.destination && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.destination}</span>}
                </div>
                <div>
                    <label style={labelStyle}>{t['weight'] || 'น้ำหนัก'} ({t['kg'] || 'กก.'})</label>
                    <input style={inputStyle} type="number" min={0} value={form.weight} onChange={e => setForm(p => ({ ...p, weight: Number(e.target.value) }))} />
                </div>
                <div>
                    <label style={labelStyle}>{t['priority'] || 'Priority'}</label>
                    <select style={inputStyle} value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                        <option value="normal">{priorityLabels(t).normal}</option>
                        <option value="urgent">{priorityLabels(t).urgent}</option>
                        <option value="express">{priorityLabels(t).express}</option>
                    </select>
                </div>
                {/* <div>
                    <label style={labelStyle}>สถานะ</label>
                    <select style={inputStyle} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                        <option value="pending">⏳ รอจัดส่ง</option>
                        <option value="in-transit">🚛 กำลังขนส่ง</option>
                        <option value="completed">สำเร็จ</option>
                        <option value="cancelled">❌ ยกเลิก</option>
                    </select>
                </div> */}
                <div>
                    <label style={labelStyle}>{t['delivery_date'] || 'วันส่ง'} *</label>
                    <input style={{ ...inputStyle, ...(formErrors.deliveryDate ? errorInputStyle : {}) }} type="date" value={form.deliveryDate} onChange={e => { setForm(p => ({ ...p, deliveryDate: e.target.value })); clearError('deliveryDate'); }} />
                    {formErrors.deliveryDate && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.deliveryDate}</span>}
                </div>
                <div>
                    <label style={labelStyle}>{t['estimated_cost'] || 'ราคาประเมิน'} ({t['baht'] || 'บาท'})</label>
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
                    <span>{t['show'] || 'แสดง'}</span>
                    <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit' }}>
                        {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <span>{t['records_per_page'] || 'รายการ / หน้า'}</span>
                    <span style={{ marginLeft: '8px', color: 'var(--text-muted)' }}>
                        ({(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} {t['from'] || 'จาก'} {filtered.length})
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



    const viewToggleStyle: React.CSSProperties = {
        width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s',
    };



    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

    return (
        <>
            <style>{`.page-content { padding: 10px !important; }`}</style>
            <CrudLayout
            summaryCards={
                <>
                    <SummaryCard title={t['all'] || "ทั้งหมด"} count={orders.length} subtitle={t['items'] || "รายการ"} icon={<Package size={22} />} color="#3b82f6" isActive={filter === 'all'} onClick={() => { setFilter('all'); setCurrentPage(1); }} />
                    <SummaryCard title={t['status_pending'] || "รอจัดส่ง"} count={counts.pending} subtitle={t['items'] || "รายการ"} icon={<Package size={22} />} color="#f59e0b" isActive={filter === 'pending'} onClick={() => { setFilter('pending'); setCurrentPage(1); }} />
                    <SummaryCard title={t['status_in_transit'] || "กำลังขนส่ง"} count={counts['in-transit']} subtitle={t['items'] || "รายการ"} icon={<Truck size={22} />} color="#10b981" isActive={filter === 'in-transit'} onClick={() => { setFilter('in-transit'); setCurrentPage(1); }} />
                    <SummaryCard title={t['status_completed'] || "สำเร็จ"} count={counts.completed} subtitle={t['items'] || "รายการ"} icon={<Package size={22} />} color="#8b5cf6" isActive={filter === 'completed'} onClick={() => { setFilter('completed'); setCurrentPage(1); }} />
                    <SummaryCard title={t['total_value'] || "มูลค่ารวม"} count={totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} subtitle={t['items'] || "รายการ"}  icon={<DollarSign size={22} />} color="#ec4899" isActive={false} />
                </>
            }
            toolbarLeft={
                <>
                    {perm.canExport && <ExportButtons 
                        t={t}
                        onExportXLSX={() => exportToXLSX(getExportData(), 'Template4', exportColumns)}
                        onExportCSV={() => exportToCSV(getExportData(), 'Template4', exportColumns)}
                        onExportPDF={(orientation) => exportToPDF(getExportData(), 'Template4', exportColumns, 'Order Report - NexSpeed', orientation)}
                    />}
                    {perm.canImport && (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 8px' }} />
                            <ImportExcelButton 
                                columns={importColumns as any}
                                filenamePrefix="Template4"
                                onImport={handleImport}
                                onImportComplete={() => loadOrders()}
                                translations={{ ...t, import_button: t['import'] }}
                            />
                        </div>
                    )}
                    {selectedIds.size > 0 && (
                        <>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-blue)', fontWeight: 600, padding: '5px 10px', borderRadius: '8px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                                ✓ {selectedIds.size} {t['items'] || 'รายการ'}
                            </span>
                            <button onClick={() => setSelectedIds(new Set())} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>{t['cancel'] || 'ยกเลิก'}</button>
                        </>
                    )}
                </>
            }
            toolbarRight={
                <>
                    {perm.canView && (
                        <SearchInput 
                            value={search} 
                            onChange={(val) => { setSearch(val); setCurrentPage(1); }} 
                            onClear={() => { setSearch(''); setCurrentPage(1); handleAdvSearchClear(); }} 
                            placeholder={t['search_placeholder'] || "ค้นหาลูกค้า, Order..."} 
                            onAdvancedSearch={() => setShowAdvancedSearch(true)}
                            advancedSearchValues={advSearchValues}
                            onAdvancedSearchClear={handleAdvSearchClear}
                        />
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'var(--bg-primary)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border-color)' }}>
                        <button onClick={() => setViewMode('list')} title={t['list_view'] || "List"}
                            style={{ ...viewToggleStyle, background: viewMode === 'list' ? 'var(--accent-blue)' : 'transparent', color: viewMode === 'list' ? 'white' : 'var(--text-muted)' }}><List size={16} /></button>
                        <button onClick={() => setViewMode('grid')} title={t['grid_view'] || "Grid"}
                            style={{ ...viewToggleStyle, background: viewMode === 'grid' ? 'var(--accent-blue)' : 'transparent', color: viewMode === 'grid' ? 'white' : 'var(--text-muted)' }}><LayoutGrid size={16} /></button>
                    </div>
                    {perm.canAdd && <button onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}><Plus size={16} /> <span>{t['add_data'] || 'เพิ่มข้อมูล'}</span></button>}
                </>
            }
        >
            {/* ===== LIST VIEW ===== */}
            {viewMode === 'list' && (
                <div className="card" style={{ padding: '10px' }}>
                    <div className="data-table-wrapper" style={{ height: '600px', overflowY: 'auto' }}>
                        <table className="data-table" style={{ position: 'relative' }}>
                            <thead style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--bg-card)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                <tr>
                                    <th style={{ width: '40px', textAlign: 'center' }}>
                                        <input type="checkbox" checked={filtered.length > 0 && selectedIds.size === filtered.length} onChange={toggleSelectAll}
                                            style={{ accentColor: '#3b82f6', width: '16px', height: '16px', cursor: 'pointer' }} title={t['select_all'] || "เลือกทั้งหมด"} />
                                    </th>
                                    {visibleColumns.id && renderTh(t['order_id'] || 'Order ID', 'id')}
                                    {visibleColumns.customerName && renderTh(t['customer'] || 'ลูกค้า', 'customerName')}
                                    {visibleColumns.cargoType && renderTh(t['product'] || 'สินค้า', 'cargoType')}
                                    {visibleColumns.route && renderTh(t['route'] || 'ต้นทาง → ปลายทาง', 'route')}
                                    {visibleColumns.weight && renderTh(t['weight'] || 'น้ำหนัก', 'weight')}
                                    {visibleColumns.priority && renderTh(t['priority'] || 'Priority', 'priority')}
                                    {visibleColumns.estimatedCost && renderTh(t['price'] || 'ราคา', 'estimatedCost')}
                                    {visibleColumns.deliveryDate && renderTh(t['delivery_date'] || 'วันส่ง', 'deliveryDate')}
                                    {visibleColumns.status && renderTh(t['status'] || 'สถานะ', 'status')}
                                    {hasActions && <th style={{ textAlign: 'center', width: '120px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <span>{t['manage'] || 'จัดการ'}</span>
                                            {perm.canView && (
                                                <span title={t['column_settings'] || 'ตั้งค่าคอลัมน์'} style={{ display: 'flex', alignItems: 'center' }}>
                                                    <Settings size={16} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsColumnSettingsOpen(true)} />
                                                </span>
                                            )}
                                        </div>
                                    </th>}
                                </tr>
                            </thead>
                            <tbody>
                                {paged.map(o => (
                                    <tr key={o.id} style={{ background: selectedIds.has(o.id) ? 'rgba(59,130,246,0.04)' : undefined }}>
                                        <td style={{ textAlign: 'center' }}>
                                            <input type="checkbox" checked={selectedIds.has(o.id)} onChange={() => toggleSelect(o.id)}
                                                style={{ accentColor: '#3b82f6', width: '15px', height: '15px', cursor: 'pointer' }} />
                                        </td>
                                        {visibleColumns.id && <td><span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{o.id}</span></td>}
                                        {visibleColumns.customerName && <td style={{ fontWeight: 600, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.customerName}</td>}
                                        {visibleColumns.cargoType && <td>{o.cargoType}</td>}
                                        {visibleColumns.route && <td style={{ fontSize: '12px' }}>{o.origin} → {o.destination}</td>}
                                        {visibleColumns.weight && <td>{o.weight} {t['kg'] || 'กก.'}</td>}
                                        {visibleColumns.priority && <td><span style={{ fontSize: '12px', fontWeight: 600, color: priorityColors[o.priority] }}>{priorityLabels(t)[o.priority]}</span></td>}
                                        {visibleColumns.estimatedCost && <td style={{ fontWeight: 600, textAlign: 'right' }}>{o.estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>}
                                        {visibleColumns.deliveryDate && <td style={{ fontSize: '13px' }}>{o.deliveryDate}</td>}
                                        {visibleColumns.status && <td style={{ textAlign: 'center' }}><StatusDropdown 
                                            value={o.status}
                                            onChange={async (newValue: any) => {
                                                setOrders(prev => prev.map(x => x.id === o.id ? { ...x, status: newValue } : x));
                                                try { await api.updateOrder(o.id, { ...o, status: newValue } as any); } catch(err) { console.error(err); }
                                            }}
                                            options={Object.keys(statusLabels(t)).map(k => ({ 
                                                value: k, 
                                                label: statusLabels(t)[k as keyof ReturnType<typeof statusLabels>], 
                                                color: (['completed'].includes(k) ? 'green' : (['cancelled'].includes(k) ? 'red' : (['in-transit'].includes(k) ? 'blue' : 'yellow'))) as any
                                            }))}
                                            disabled={!perm.canEdit}
                                        /></td>}
                                        <td style={{ textAlign: 'center' }}>
                                            {hasActions && (
                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                {perm.canView   && <button onClick={() => handleView(o)}   style={{ ...crudStyles.actionBtn, color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)' }} title={t['view'] || 'เรียกดู'}><Eye    size={14} /></button>}
                                                {perm.canEdit   && <button onClick={() => handleEdit(o)}   style={{ ...crudStyles.actionBtn, color: '#f59e0b', background: '#fef3c7' }} title={t['edit'] || 'แก้ไข'}><Pencil size={14} /></button>}
                                                {perm.canDelete && <button onClick={() => handleDeleteClick(o)} style={{ ...crudStyles.actionBtn, color: '#ef4444', background: '#fee2e2' }} title={t['delete'] || 'ลบ'}><Trash2 size={14} /></button>}
                                            </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {paged.length === 0 && (
                                    <tr><td colSpan={11} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>{t['no_data_found'] || 'ไม่พบข้อมูลคำสั่งขนส่ง'}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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
                    options={Object.keys(statusLabels(t)).map(k => ({ 
                        value: k, 
                        label: statusLabels(t)[k as keyof ReturnType<typeof statusLabels>], 
                        color: (['completed'].includes(k) ? 'green' : (['cancelled'].includes(k) ? 'red' : (['in-transit'].includes(k) ? 'blue' : 'yellow'))) as any
                    }))}
                    disabled={!perm.canEdit}
                />
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{o.customerName}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{o.origin} → {o.destination}</div>
                                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', flexWrap: 'wrap' }}>
                                    <span>{t[`cargo_${o.cargoType}`] || o.cargoType}</span>
                                    <span>⚖️ {o.weight} {t['kg'] || 'กก.'}</span>
                                    <span style={{ fontWeight: 600, color: priorityColors[o.priority] }}>{getPriorityLabel(o.priority, t)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--accent-blue)' }}>{o.estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {perm.canView   && <button onClick={() => handleView(o)}   style={{ ...crudStyles.actionBtn, color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)' }} title={t['view'] || 'เรียกดู'}><Eye    size={14} /></button>}
                                        {perm.canEdit   && <button onClick={() => handleEdit(o)}   style={{ ...crudStyles.actionBtn, color: '#f59e0b', background: '#fef3c7' }} title={t['edit'] || 'แก้ไข'}><Pencil size={14} /></button>}
                                        {perm.canDelete && <button onClick={() => handleDeleteClick(o)} style={{ ...crudStyles.actionBtn, color: '#ef4444', background: '#fee2e2' }} title={t['delete'] || 'ลบ'}><Trash2 size={14} /></button>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {filtered.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalItems={filtered.length}
                    setCurrentPage={setCurrentPage}
                    setPageSize={setPageSize}
                />
            )}

            {/* ===== VIEW MODAL ===== */}
            <BaseModal isOpen={showViewModal} title={t['view_order'] || "รายละเอียดคำสั่งขนส่ง"} onClose={() => setShowViewModal(false)}>
                {selectedOrder && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(59,130,246,0.08)', textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: '#3b82f6' }}>{selectedOrder.estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t['estimated_cost'] || 'ราคาประเมิน'}</div>
                            </div>
                            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>{selectedOrder.weight} {t['kg'] || 'กก.'}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t['weight'] || 'น้ำหนัก'}</div>
                            </div>
                        </div>
                        <DetailRow icon={<Package size={16} />} label={t['order_id'] || "Order ID"} value={selectedOrder.id} />
                        <DetailRow icon={<User size={16} />} label={t['customer_name'] || "ชื่อลูกค้า"} value={selectedOrder.customerName} />
                        <DetailRow icon={<Package size={16} />} label={t['cargo_type'] || "สินค้า"} value={selectedOrder.cargoType} />
                        <DetailRow icon={<MapPin size={16} />} label={t['origin'] || "ต้นทาง"} value={selectedOrder.origin} />
                        <DetailRow icon={<MapPin size={16} />} label={t['destination'] || "ปลายทาง"} value={selectedOrder.destination} />
                        <DetailRow icon={<Weight size={16} />} label={t['weight'] || "น้ำหนัก"} value={`${selectedOrder.weight} ${t['kg'] || 'กก.'}`} />
                        <DetailRow icon={<Calendar size={16} />} label={t['delivery_date'] || "วันส่ง"} value={selectedOrder.deliveryDate} />
                        <DetailRow icon={<Truck size={16} />} label={t['status'] || "สถานะ"} value={getStatusLabel(selectedOrder.status, t)} />
                    </div>
                )}
            </BaseModal>

            {/* Advanced Search Modal */}
            <AdvancedSearchModal
                isOpen={showAdvancedSearch}
                onClose={() => setShowAdvancedSearch(false)}
                fields={advancedSearchFields}
                values={advSearchValues}
                onChange={handleAdvSearchChange}
                onSearch={handleAdvSearchSubmit}
                onClear={handleAdvSearchClear}
            />

            {/* ===== ADD/EDIT MODAL ===== */}
            <BaseModal isOpen={showAddModal || showEditModal} title={showAddModal ? (t['add_order'] || "เพิ่มคำสั่งขนส่ง") : (t['edit_order'] || "แก้ไขคำสั่งขนส่ง")} onClose={() => { setShowAddModal(false); setShowEditModal(false); }}>
                {renderFormFields(showAddModal ? 'add' : 'edit')}
                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} 
                        style={{ 
                            padding: '8px 24px', 
                            background: 'white', 
                            color: 'var(--text-secondary)', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: '10px', 
                            cursor: 'pointer', 
                            fontWeight: 600,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                        {t['cancel'] || 'ยกเลิก'}
                    </button>
                    <button onClick={showAddModal ? handleSaveNew : handleSaveEdit} 
                        style={{ 
                            padding: '8px 24px', 
                            background: 'var(--accent-green)', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '10px', 
                            cursor: 'pointer', 
                            fontWeight: 600, 
                            opacity: saving ? 0.5 : 1,
                            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
                        }}  
                        disabled={saving}>
                        {showAddModal ? (t['add_data'] || 'เพิ่มข้อมูล') : (t['save_data'] || 'บันทึกข้อมูล')}
                    </button>
                </div>
            </BaseModal>

            {/* ===== DELETE CONFIRM ===== */}
            <BaseModal isOpen={showDeleteConfirm} title={t['confirm_delete'] || "ยืนยันการลบ"} onClose={() => setShowDeleteConfirm(false)}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {t['delete_confirm_msg'] || 'คุณต้องการลบคำสั่ง'} <strong style={{ color: 'var(--accent-red)' }}>{selectedOrder?.id}</strong> {t['of'] || 'ของ'} {selectedOrder?.customerName} {t['question_mark'] || 'หรือไม่?'}
                </p>
                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button onClick={() => setShowDeleteConfirm(false)} 
                        style={{ 
                            padding: '8px 24px', 
                            background: 'white', 
                            color: 'var(--text-secondary)', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: '10px', 
                            cursor: 'pointer', 
                            fontWeight: 600,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                        {t['cancel'] || 'ยกเลิก'}
                    </button>
                    <button onClick={handleDelete} disabled={saving}
                        style={{ 
                            background: '#ef4444', 
                            color: 'white', 
                            border: 'none', 
                            padding: '8px 24px', 
                            borderRadius: '10px', 
                            fontWeight: 600, 
                            cursor: 'pointer', 
                            opacity: saving ? 0.5 : 1,
                            boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)'
                        }}>
                        {saving ? (t['deleting'] || 'กำลังลบ...') : (t['delete_data'] || 'ลบข้อมูล')}
                    </button>
                </div>
            </BaseModal>

            {/* Custom Alert Modal */}
            <BaseModal 
                isOpen={alertConfig.isOpen} 
                title={alertConfig.isError ? (t['error'] || 'ข้อผิดพลาด') : (t['success'] || 'สำเร็จ')}
                onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
            >
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ 
                        width: '48px', height: '48px', 
                        borderRadius: '50%', 
                        background: alertConfig.isError ? '#fee2e2' : '#dcfce3',
                        color: alertConfig.isError ? '#ef4444' : '#10b981',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        {alertConfig.isError ? <X size={24} /> : <span style={{ fontSize: '24px' }}>✓</span>}
                    </div>
                    <p style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '24px' }}>
                        {alertConfig.message}
                    </p>
                    <button 
                        onClick={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                        style={{
                            background: alertConfig.isError ? '#ef4444' : '#10b981',
                            color: 'white',
                            border: 'none',
                            padding: '10px 32px',
                            borderRadius: '10px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: alertConfig.isError ? '0 4px 6px -1px rgba(239, 68, 68, 0.2)' : '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
                        }}
                    >
                        {t['ok'] || 'ตกลง'}
                    </button>
                </div>
            </BaseModal>

            {/* Column Settings Modal */}
            <BaseModal
                isOpen={isColumnSettingsOpen}
                onClose={() => setIsColumnSettingsOpen(false)}
                title={t['column_settings_title'] || 'ตั้งค่าการแสดงผลตาราง'}
                width="450px"
                footer={
                    <button onClick={() => setIsColumnSettingsOpen(false)} 
                        style={{ 
                            padding: '10px 32px', 
                            background: 'var(--accent-blue)', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '10px', 
                            cursor: 'pointer', 
                            fontWeight: 600,
                            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)'
                        }}>
                        {t['ok_button'] || 'ตกลง'}
                    </button>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.keys(visibleColumns).map(key => {
                        const labelMap: any = {
                            id: t['order_id'] || 'Order ID',
                            customerName: t['customer'] || 'ลูกค้า',
                            cargoType: t['product'] || 'สินค้า',
                            route: t['route'] || 'เส้นทาง',
                            weight: t['weight'] || 'น้ำหนัก',
                            priority: t['priority'] || 'Priority',
                            estimatedCost: t['price'] || 'ราคา',
                            deliveryDate: t['delivery_date'] || 'วันส่ง',
                            status: t['status'] || 'สถานะ'
                        };
                        return (
                            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', flex: 1 }}>
                                    <input type="checkbox" checked={(visibleColumns as any)[key]} onChange={(e) => setVisibleColumns({ ...visibleColumns, [key]: e.target.checked })} /> {labelMap[key]}
                                </label>
                                <select
                                    style={{ width: '130px', padding: '4px 8px', height: '32px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                                    value={sortConfig.key === key && sortConfig.direction !== null ? sortConfig.direction : 'none'}
                                    onChange={(e) => setSortConfig({ key, direction: e.target.value === 'none' ? null : e.target.value as 'asc' | 'desc' })}
                                >
                                    <option value="none">{t['no_sort'] || 'ไม่เรียง'}</option>
                                    <option value="asc">{t['sort'] || 'เรียง'}</option>
                                    <option value="desc">{t['sort_desc'] || 'เรียงจากมากไปน้อย'}</option>
                                </select>
                            </div>
                        );
                    })}
                </div>
            </BaseModal>
        </CrudLayout>
        </>
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

function pageBtnStyle(disabled: boolean): React.CSSProperties {
    return {
        background: disabled ? 'transparent' : 'var(--bg-primary)', border: '1px solid var(--border-color)',
        borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)', opacity: disabled ? 0.4 : 1,
        transition: 'all 0.15s', fontFamily: 'inherit',
    };
}
