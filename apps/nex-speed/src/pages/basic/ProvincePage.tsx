'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CrudLayout from '@/components/CrudLayout';
import { SummaryCard, SearchInput, crudStyles, BaseModal, ExportButtons } from '@/components/CrudComponents';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/exportUtils';
import { Plus, Edit2, Trash2, MapPin, Eye, Map } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { api, Province } from '@/services/api';

const regionColors: Record<string, string> = {
    'กลาง': '#3b82f6',
    'เหนือ': '#10b981',
    'ตะวันออกเฉียงเหนือ': '#f59e0b',
    'ใต้': '#ef4444',
    'ตะวันออก': '#8b5cf6',
    'ตะวันตก': '#06b6d4',
};

export default function ProvincePage() {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterRegion, setFilterRegion] = useState('all');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add'|'edit'|'view'|'delete'>('add');
    const [selectedItem, setSelectedItem] = useState<Province | null>(null);
    const [form, setForm] = useState({ name: '', nameEn: '', abbr: '', region: 'กลาง' });
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(() => {
        setLoading(true);
        api.getProvinces().then(p => { setProvinces(p || []); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleAdd = () => {
        setForm({ name: '', nameEn: '', abbr: '', region: 'กลาง' });
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleEdit = (p: Province) => {
        setForm({ name: p.name, nameEn: p.nameEn, abbr: p.abbr, region: p.region });
        setSelectedItem(p);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (p: Province) => {
        setForm({ name: p.name, nameEn: p.nameEn, abbr: p.abbr, region: p.region });
        setSelectedItem(p);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleDelete = (p: Province) => {
        setSelectedItem(p);
        setModalMode('delete');
        setIsModalOpen(true);
    };

    const saveForm = async () => {
        if (!form.name || !form.nameEn || !form.abbr) return;
        setSaving(true);
        try {
            if (modalMode === 'add') {
                await api.createProvince({ name: form.name, nameEn: form.nameEn, abbr: form.abbr, region: form.region });
            } else if (modalMode === 'edit' && selectedItem) {
                await api.updateProvince(selectedItem.id, { name: form.name, nameEn: form.nameEn, abbr: form.abbr, region: form.region });
            }
            setIsModalOpen(false);
            loadData();
        } catch (err) {
            console.error(err);
        }
        setSaving(false);
    };

    const confirmDelete = async () => {
        if (selectedItem) {
            setSaving(true);
            try { 
                await api.deleteProvince(selectedItem.id); 
                setIsModalOpen(false); 
                loadData(); 
            } catch (err) { console.error(err); }
            setSaving(false);
        }
    };

    const searchLower = search.toLowerCase();
    const baseData = provinces.filter(p => 
        !searchLower || 
        p.name.includes(searchLower) || 
        p.nameEn.toLowerCase().includes(searchLower) || 
        p.abbr.includes(searchLower)
    );

    const filteredData = baseData.filter(item => {
        if (filterRegion === 'all') return true;
        return item.region === filterRegion;
    });

    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const regions = ['all', ...Object.keys(regionColors)];

    return (
        <CrudLayout
            summaryCards={
                <>
                    {regions.map((r, index) => {
                        const count = r === 'all' ? baseData.length : baseData.filter(i => i.region === r).length;
                        const title = r === 'all' ? 'ทั้งหมด' : r;
                        const color = r === 'all' ? '#3b82f6' : regionColors[r];
                        return (
                            <SummaryCard 
                                key={r}
                                title={title} 
                                count={count} 
                                icon={<Map size={22} />} 
                                color={color}
                                isActive={filterRegion === r} 
                                onClick={() => { setFilterRegion(r); setCurrentPage(1); }} 
                            />
                        );
                    })}
                </>
            }
            toolbarLeft={
                <ExportButtons 
                    onExportXLSX={() => exportToXLSX(filteredData, 'Provinces', [
                        { key: 'id', label: 'ID' },
                        { key: 'name', label: 'ชื่อจังหวัด' },
                        { key: 'nameEn', label: 'ชื่ออังกฤษ' },
                        { key: 'abbr', label: 'ตัวย่อ' },
                        { key: 'region', label: 'ภาค' }
                    ])}
                    onExportCSV={() => exportToCSV(filteredData, 'Provinces', [
                        { key: 'id', label: 'ID' },
                        { key: 'name', label: 'ชื่อจังหวัด' },
                        { key: 'nameEn', label: 'ชื่ออังกฤษ' },
                        { key: 'abbr', label: 'ตัวย่อ' },
                        { key: 'region', label: 'ภาค' }
                    ])}
                    onExportPDF={() => exportToPDF(filteredData, 'Provinces', [
                        { key: 'id', label: 'ID' },
                        { key: 'name', label: 'ชื่อจังหวัด' },
                        { key: 'nameEn', label: 'ชื่ออังกฤษ' },
                        { key: 'abbr', label: 'ตัวย่อ' },
                        { key: 'region', label: 'ภาค' }
                    ], 'Provinces Report')}
                />
            }
            toolbarRight={
                <>
                    <SearchInput value={search} onChange={(val) => { setSearch(val); setCurrentPage(1); }} placeholder="ค้นหาจังหวัด, ตัวย่อ..." />
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>แสดง {filteredData.length} จังหวัด</span>
                    <button onClick={handleAdd} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /> <span>เพิ่มข้อมูล</span></button>
                </>
            }
        >
            <div style={{ height: '600px', overflowY: 'auto' }}>
                <table className="data-table">
                <thead>
                    <tr>
                        <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                        <th>ชื่อจังหวัด</th>
                        <th>ชื่ออังกฤษ</th>
                        <th style={{ textAlign: 'center' }}>ตัวย่อ</th>
                        <th>ภาค</th>
                        <th className="text-center" style={{ width: '100px', paddingRight: '24px' }}>จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
                    ) : paginatedData.length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>ไม่พบข้อมูลจังหวัด</td></tr>
                    ) : (
                        paginatedData.map((p, i) => (
                            <tr key={p.id}>
                                <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{(currentPage - 1) * pageSize + i + 1}</td>
                                <td style={{ fontWeight: 600 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <MapPin size={16} style={{ color: regionColors[p.region] || '#999' }} />
                                        <span style={{ color: 'var(--accent-blue)' }}>{p.name}</span>
                                    </div>
                                </td>
                                <td className="text-secondary">{p.nameEn}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontWeight: 600, fontSize: '13px', letterSpacing: '1px', background: 'rgba(59,130,246,0.08)', color: 'var(--accent-blue)' }}>
                                        {p.abbr}
                                    </span>
                                </td>
                                <td>
                                    <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, background: `${regionColors[p.region] || '#999'}15`, color: regionColors[p.region] || '#999' }}>
                                        {p.region}
                                    </span>
                                </td>
                                <td className="text-center" style={{ paddingRight: '24px' }}>
                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                        <button onClick={() => handleView(p)} style={{ ...crudStyles.actionBtn, color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)' }} title="เรียกดู">
                                            <Eye size={14} />
                                        </button>
                                        <button onClick={() => handleEdit(p)} style={{ ...crudStyles.actionBtn, color: '#f59e0b', background: '#fef3c7' }} title="แก้ไข">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(p)} style={{ ...crudStyles.actionBtn, color: '#ef4444', background: '#fee2e2' }} title="ลบ">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
                </table>
            </div>

            {filteredData.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalItems={filteredData.length}
                    setCurrentPage={setCurrentPage}
                    setPageSize={setPageSize}
                />
            )}

            <BaseModal 
                isOpen={isModalOpen && modalMode !== 'delete'} 
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'add' ? 'เพิ่มจังหวัดใหม่' : modalMode === 'edit' ? 'แก้ไขจังหวัด' : 'รายละเอียดจังหวัด'}
                footer={
                    modalMode !== 'view' ? (
                        <>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                            <button onClick={saveForm} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: (!form.name || !form.nameEn || !form.abbr) ? 0.5 : 1 }}  disabled={saving || !form.name || !form.nameEn || !form.abbr}>{modalMode === 'add' ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}</button>
                        </>
                    ) : (
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>ปิด</button>
                    )
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label style={crudStyles.label}>ชื่อจังหวัด <span style={{color: '#ef4444'}}>*</span></label>
                        <input 
                            style={crudStyles.input} 
                            value={form.name} 
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
                            placeholder="เช่น กรุงเทพมหานคร" 
                            disabled={modalMode === 'view' || saving}
                        />
                    </div>
                    <div>
                        <label style={crudStyles.label}>ชื่ออังกฤษ <span style={{color: '#ef4444'}}>*</span></label>
                        <input 
                            style={crudStyles.input} 
                            value={form.nameEn} 
                            onChange={e => setForm(p => ({ ...p, nameEn: e.target.value }))} 
                            placeholder="เช่น Bangkok" 
                            disabled={modalMode === 'view' || saving}
                        />
                    </div>
                    <div>
                        <label style={crudStyles.label}>ตัวย่อ <span style={{color: '#ef4444'}}>*</span></label>
                        <input 
                            style={crudStyles.input} 
                            value={form.abbr} 
                            onChange={e => setForm(p => ({ ...p, abbr: e.target.value }))} 
                            placeholder="เช่น กท" 
                            maxLength={3}
                            disabled={modalMode === 'view' || saving}
                        />
                    </div>
                    <div>
                        <label style={crudStyles.label}>ภาค</label>
                        <select 
                            style={{...crudStyles.input, cursor: modalMode === 'view' ? 'default' : 'pointer'}} 
                            value={form.region} 
                            onChange={e => setForm(p => ({ ...p, region: e.target.value }))}
                            disabled={modalMode === 'view' || saving}
                        >
                            {Object.keys(regionColors).map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                </div>
            </BaseModal>

            <BaseModal 
                isOpen={isModalOpen && modalMode === 'delete'} 
                onClose={() => setIsModalOpen(false)}
                title="ยืนยันการลบข้อมูล"
                width="400px"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                        <button onClick={confirmDelete} disabled={saving} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
                            {saving ? 'กำลังลบ...' : 'ลบข้อมูล'}
                        </button>
                    </>
                }
            >
                <div>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>คุณแน่ใจหรือไม่ว่าต้องการลบจังหวัด <strong style={{ color: 'var(--text-primary)' }}>{selectedItem?.name}</strong> ({selectedItem?.abbr})?</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#ef4444' }}>การกระทำนี้จะไม่สามารถย้อนกลับได้</p>
                </div>
            </BaseModal>
        </CrudLayout>
    );
}
