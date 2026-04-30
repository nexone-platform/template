'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Pencil, Trash2, X, MapPin, Navigation, Eye } from 'lucide-react';
import { api, LocationItem, Province } from '@/services/api';
import CrudLayout from '@/components/CrudLayout';
import { SearchInput, crudStyles, BaseModal, ExportButtons } from '@/components/CrudComponents';
import StatusDropdown from '@/components/StatusDropdown';
import Pagination from '@/components/Pagination';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/exportUtils';

const typeLabels: Record<string, string> = { origin: 'ต้นทาง', destination: 'ปลายทาง', both: 'ทั้งสอง' };
const typeColors: Record<string, string> = { origin: '#3b82f6', destination: '#10b981', both: '#8b5cf6' };

const emptyForm = { name: '', type: 'both' as 'origin' | 'destination' | 'both', address: '', province: '', lat: 0, lng: 0 };

export default function LocationsPage() {
    const [locations, setLocations] = useState<LocationItem[]>([]);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    
    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add'|'edit'|'view'>('add');
    const [editLoc, setEditLoc] = useState<LocationItem | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [showDelete, setShowDelete] = useState<LocationItem | null>(null);
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(() => {
        setLoading(true);
        Promise.all([
            api.getLocations(),
            api.getProvinces()
        ]).then(([locData, provData]) => {
            setLocations(locData || []);
            setProvinces(provData || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const filtered = locations.filter(loc => {
        const matchSearch = loc.name.toLowerCase().includes(search.toLowerCase()) || loc.address.toLowerCase().includes(search.toLowerCase()) || loc.province.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === 'all' || loc.type === typeFilter;
        return matchSearch && matchType;
    });

    const counts = {
        all: locations.length,
        origin: locations.filter(l => l.type === 'origin').length,
        destination: locations.filter(l => l.type === 'destination').length,
        both: locations.filter(l => l.type === 'both').length,
    };

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(currentPage, totalPages > 0 ? totalPages : 1);
    const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

    const clearError = (key: string) => setFormErrors(p => { const n = { ...p }; delete n[key]; return n; });

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!form.name.trim()) errors.name = 'กรุณาระบุชื่อสถานที่';
        if (!form.province.trim()) errors.province = 'กรุณาระบุจังหวัด';
        if (form.lat === 0 && form.lng === 0) errors.lat = 'กรุณาระบุพิกัด';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAdd = () => {
        setEditLoc(null);
        setForm(emptyForm);
        setFormErrors({});
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleEdit = (loc: LocationItem) => {
        setEditLoc(loc);
        setForm({ name: loc.name, type: loc.type as 'origin' | 'destination' | 'both', address: loc.address, province: loc.province, lat: loc.lat, lng: loc.lng });
        setFormErrors({});
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (loc: LocationItem) => {
        setEditLoc(loc);
        setForm({ name: loc.name, type: loc.type as 'origin' | 'destination' | 'both', address: loc.address, province: loc.province, lat: loc.lat, lng: loc.lng });
        setFormErrors({});
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setSaving(true);
        try {
            if (editLoc) {
                await api.updateLocation(editLoc.id, { name: form.name, type: form.type, address: form.address, province: form.province, lat: form.lat, lng: form.lng });
            } else {
                await api.createLocation({ name: form.name, type: form.type, address: form.address, province: form.province, lat: form.lat, lng: form.lng });
            }
            setIsModalOpen(false);
            loadData();
        } catch { /* */ }
        setSaving(false);
    };

    const confirmDelete = async () => {
        if (showDelete) {
            setSaving(true);
            try { 
                await api.deleteLocation(showDelete.id); 
                setIsDeleteModalOpen(false); 
                setShowDelete(null); 
                loadData(); 
            } catch { /* */ }
            setSaving(false);
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

    const exportConfigs = [
        { key: 'name', label: 'ชื่อสถานที่' },
        { key: 'type', label: 'ประเภท', format: (v: any) => typeLabels[v.type] || v.type },
        { key: 'address', label: 'ที่อยู่' },
        { key: 'province', label: 'จังหวัด' },
        { key: 'coordinates', label: 'พิกัด', format: (v: any) => `${v.lat}, ${v.lng}` },
        { key: 'status', label: 'สถานะ', format: (v: any) => v.status === 'inactive' ? 'ระงับ' : 'ใช้งาน' },
    ];

    return (
        <CrudLayout
            toolbarLeft={
                <ExportButtons 
                    onExportXLSX={() => exportToXLSX(filtered, 'Locations', exportConfigs)}
                    onExportCSV={() => exportToCSV(filtered, 'Locations', exportConfigs)}
                    onExportPDF={() => exportToPDF(filtered, 'Locations', exportConfigs, 'รายงานสถานที่ต้นทางและปลายทาง')}
                />
            }
            toolbarRight={
                <>
                    <SearchInput value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="ค้นหาสถานที่, จังหวัด..." />
                    <button onClick={handleAdd} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /> <span>เพิ่มข้อมูล</span></button>
                </>
            }
        >
            <div style={{ height: '600px', overflowY: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                            <th>ชื่อสถานที่</th>
                            <th>ประเภท</th>
                            <th>ที่อยู่</th>
                            <th>จังหวัด</th>
                            <th style={{ textAlign: 'center', width: '120px' }}>พิกัด</th>
                            <th className="text-center" style={{ width: '100px' }}>สถานะ</th>
                            <th className="text-center" style={{ width: '120px', paddingRight: '24px' }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paged.map((loc, i) => (
                            <tr key={loc.id}>
                                <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{(safePage - 1) * pageSize + i + 1}</td>
                                <td style={{ fontWeight: 600 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <MapPin size={14} style={{ color: typeColors[loc.type] || '#999' }} />
                                        <span style={{ color: 'var(--text-primary)' }}>{loc.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <span style={{
                                        padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                                        background: `${typeColors[loc.type]}15`, color: typeColors[loc.type],
                                    }}>{typeLabels[loc.type]}</span>
                                </td>
                                <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loc.address}</td>
                                <td>{loc.province}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <a 
                                        href={`https://www.google.com/maps/@${loc.lat},${loc.lng},30z/data=!3m1!1e1`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{ color: 'var(--accent-blue)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, padding: '4px 12px', background: 'rgba(59,130,246,0.1)', borderRadius: '20px' }}
                                        title="เปิดแผนที่ 30x"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MapPin size={14} />
                                        <span>GPS</span>
                                    </a>
                                </td>
                                <td className="text-center">
                                    <StatusDropdown
                                        value={loc.status || 'active'}
                                        onChange={async (val: any) => {
                                            setLocations(prev => prev.map(x => x.id === loc.id ? { ...x, status: val } : x));
                                            try { await api.updateLocation(loc.id, { ...loc, status: val }); } catch (err) {}
                                        }}
                                        options={[
                                            { value: 'active', label: 'ใช้งาน', color: 'green' },
                                            { value: 'inactive', label: 'ระงับ', color: 'red' }
                                        ]}
                                    />
                                </td>
                                <td className="text-center" style={{ paddingRight: '24px' }}>
                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                        <button onClick={() => handleView(loc)} style={crudStyles.viewBtn} title="เรียกดู">
                                            <Eye size={15} />
                                        </button>
                                        <button onClick={() => handleEdit(loc)} style={crudStyles.editBtn} title="แก้ไข">
                                            <Pencil size={15} />
                                        </button>
                                        <button onClick={() => { setShowDelete(loc); setIsDeleteModalOpen(true); }} style={crudStyles.deleteBtn} title="ลบ">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {paged.length === 0 && (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>ไม่พบข้อมูลสถานที่</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {filtered.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalItems={filtered.length}
                    setCurrentPage={setCurrentPage}
                    setPageSize={setPageSize}
                />
            )}

            <BaseModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'add' ? 'เพิ่มสถานที่ใหม่' : modalMode === 'edit' ? 'แก้ไขสถานที่' : 'รายละเอียดสถานที่'}
                width="560px"
                footer={
                    modalMode !== 'view' ? (
                        <>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                            <button onClick={handleSave} disabled={saving} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {saving ? 'กำลังบันทึก...' : modalMode === 'add' ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>ปิด</button>
                    )
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={crudStyles.label}>ชื่อสถานที่ <span style={{color: '#ef4444'}}>*</span></label>
                            <input 
                                style={{ ...crudStyles.input, ...(formErrors.name ? { borderColor: '#ef4444', background: 'rgba(239,68,68,0.04)' } : {}) }} 
                                value={form.name} 
                                onChange={e => { setForm(p => ({ ...p, name: e.target.value })); clearError('name'); }} 
                                placeholder="เช่น คลังสินค้ากรุงเทพ" 
                                disabled={modalMode === 'view'}
                            />
                            {formErrors.name && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.name}</span>}
                        </div>
                        <div>
                            <label style={crudStyles.label}>ประเภท</label>
                            <select 
                                style={{ ...crudStyles.input, cursor: modalMode === 'view' ? 'default' : 'pointer' }} 
                                value={form.type} 
                                onChange={e => setForm(p => ({ ...p, type: e.target.value as 'origin' | 'destination' | 'both' }))}
                                disabled={modalMode === 'view'}
                            >
                                <option value="origin">ต้นทาง</option>
                                <option value="destination">ปลายทาง</option>
                                <option value="both">ทั้งสอง</option>
                            </select>
                        </div>
                        <div>
                            <label style={crudStyles.label}>จังหวัด <span style={{color: '#ef4444'}}>*</span></label>
                            <select 
                                style={{ ...crudStyles.input, cursor: modalMode === 'view' ? 'default' : 'pointer', ...(formErrors.province ? { borderColor: '#ef4444', background: 'rgba(239,68,68,0.04)' } : {}) }} 
                                value={form.province} 
                                onChange={e => { setForm(p => ({ ...p, province: e.target.value })); clearError('province'); }} 
                                disabled={modalMode === 'view'}
                            >
                                <option value="">-- เลือกจังหวัด --</option>
                                {provinces.map(p => (
                                    <option key={p.id} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                            {formErrors.province && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.province}</span>}
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={crudStyles.label}>ที่อยู่</label>
                            <input 
                                style={crudStyles.input} 
                                value={form.address} 
                                onChange={e => setForm(p => ({ ...p, address: e.target.value }))} 
                                placeholder="ที่อยู่เต็ม" 
                                disabled={modalMode === 'view'}
                            />
                        </div>
                        <div>
                            <label style={crudStyles.label}>ละติจูด (Latitude) <span style={{color: '#ef4444'}}>*</span></label>
                            <input 
                                style={{ ...crudStyles.input, fontFamily: 'monospace', ...(formErrors.lat ? { borderColor: '#ef4444', background: 'rgba(239,68,68,0.04)' } : {}) }} 
                                type="number" 
                                step="0.0001" 
                                value={form.lat === 0 ? '' : form.lat} 
                                onChange={e => { setForm(p => ({ ...p, lat: Number(e.target.value) })); clearError('lat'); }} 
                                placeholder="13.7563" 
                                disabled={modalMode === 'view'}
                            />
                            {formErrors.lat && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.lat}</span>}
                        </div>
                        <div>
                            <label style={crudStyles.label}>ลองติจูด (Longitude) <span style={{color: '#ef4444'}}>*</span></label>
                            <input 
                                style={{ ...crudStyles.input, fontFamily: 'monospace' }} 
                                type="number" 
                                step="0.0001" 
                                value={form.lng === 0 ? '' : form.lng} 
                                onChange={e => setForm(p => ({ ...p, lng: Number(e.target.value) }))} 
                                placeholder="100.5018" 
                                disabled={modalMode === 'view'}
                            />
                        </div>
                    </div>

                    {(form.lat !== 0 || form.lng !== 0) && (
                        <div style={{ marginTop: '4px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                            <div style={{ padding: '8px 12px', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                <Navigation size={12} /> พิกัด: {form.lat.toFixed(4)}, {form.lng.toFixed(4)}
                                <a href={`https://www.google.com/maps/@${form.lat},${form.lng},18z/data=!3m1!1e1`} target="_blank" rel="noopener noreferrer"
                                    style={{ marginLeft: 'auto', color: 'var(--accent-blue)', fontSize: '11px', textDecoration: 'none' }}>
                                    🗺️ เปิด Google Maps
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </BaseModal>

            <BaseModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)}
                title="ยืนยันการลบข้อมูล"
                width="400px"
                footer={
                    <>
                        <button onClick={() => setIsDeleteModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                        <button onClick={confirmDelete} disabled={saving} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
                            {saving ? 'กำลังลบ...' : 'ลบข้อมูล'}
                        </button>
                    </>
                }
            >
                <div>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>คุณแน่ใจหรือไม่ว่าต้องการลบสถานที่ <strong style={{ color: '#ef4444' }}>{showDelete?.name}</strong> ?</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#ef4444' }}>การกระทำนี้จะไม่สามารถย้อนกลับได้</p>
                </div>
            </BaseModal>

        </CrudLayout>
    );
}

