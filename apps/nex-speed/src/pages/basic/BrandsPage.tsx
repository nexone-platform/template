'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api, Brand } from '@/services/api';
import CrudLayout from '@/components/CrudLayout';
import { SearchInput, crudStyles, BaseModal, ExportButtons } from '@/components/CrudComponents';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/exportUtils';
import { Plus, Edit2, Trash2, Truck, Eye } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { useSystemConfig } from '@nexone/ui';

export default function BrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editBrand, setEditBrand] = useState<Brand | null>(null);
    const [form, setForm] = useState({ name: '', nameEn: '', country: '', logo: '🚛', models: '' });
    const [showDelete, setShowDelete] = useState<Brand | null>(null);
    const [saving, setSaving] = useState(false);
    const [isViewOnly, setIsViewOnly] = useState(false);

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
    const [pageSize, setPageSize] = useState(configs?.pageRecordDefault || 15);

    const loadData = useCallback(() => {
        setLoading(true);
        api.getBrands().then(b => { setBrands(b || []); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const filtered = brands.filter(b =>
        b.name.includes(search) || b.nameEn.toLowerCase().includes(search.toLowerCase()) || b.country.includes(search)
    );

    const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleAdd = () => {
        setEditBrand(null);
        setForm({ name: '', nameEn: '', country: '', logo: '🚛', models: '' });
        setIsViewOnly(false);
        setShowModal(true);
    };

    const handleEdit = (b: Brand) => {
        setEditBrand(b);
        setForm({ name: b.name, nameEn: b.nameEn, country: b.country, logo: b.logo, models: b.models });
        setIsViewOnly(false);
        setShowModal(true);
    };

    const handleView = (b: Brand) => {
        setEditBrand(b);
        setForm({ name: b.name, nameEn: b.nameEn, country: b.country, logo: b.logo, models: b.models });
        setIsViewOnly(true);
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editBrand) {
                await api.updateBrand(editBrand.id, { name: form.name, nameEn: form.nameEn, country: form.country, logo: form.logo, models: form.models });
            } else {
                await api.createBrand({ name: form.name, nameEn: form.nameEn, country: form.country, logo: form.logo, models: form.models });
            }
            setShowModal(false);
            loadData();
        } catch { /* */ }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (showDelete) {
            setSaving(true);
            try { await api.deleteBrand(showDelete.id); setShowDelete(null); loadData(); } catch { /* */ }
            setSaving(false);
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

    const exportColumns = [
        { key: 'logo', label: 'โลโก้' },
        { key: 'name', label: 'ชื่อภาษาไทย' },
        { key: 'nameEn', label: 'ชื่อภาษาอังกฤษ' },
        { key: 'country', label: 'ประเทศ' },
        { key: 'models', label: 'รุ่นรถ' }
    ];

    return (
        <CrudLayout
            toolbarLeft={
                <ExportButtons 
                    onExportXLSX={() => exportToXLSX(filtered, 'Brands', exportColumns)}
                    onExportCSV={() => exportToCSV(filtered, 'Brands', exportColumns)}
                    onExportPDF={() => exportToPDF(filtered, 'Brands', exportColumns, 'รายการยี่ห้อรถ')}
                />
            }
            toolbarRight={
                <>
                    <SearchInput value={search} onChange={(val) => { setSearch(val); setCurrentPage(1); }} placeholder="ค้นหายี่ห้อรถ..." />
                    <button onClick={handleAdd} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /> <span>เพิ่มข้อมูล</span></button>
                </>
            }
        >
            <div style={{ height: '720px', overflowY: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                            <th>โลโก้</th>
                            <th>ชื่อภาษาไทย</th>
                            <th>ชื่อภาษาอังกฤษ</th>
                            <th>ประเทศ</th>
                            <th>รุ่นรถ</th>
                            <th style={{ textAlign: 'center', width: '100px', paddingRight: '24px' }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((b, i) => (
                            <tr key={b.id}>
                                <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{(currentPage - 1) * pageSize + i + 1}</td>
                                <td style={{ fontSize: '20px' }}>{b.logo}</td>
                                <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{b.name}</td>
                                <td><span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.nameEn}</span></td>
                                <td>
                                    <span style={{
                                        padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
                                        background: 'rgba(59,130,246,0.08)', color: 'var(--accent-blue)',
                                    }}>{b.country}</span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {b.models.split(',').filter(Boolean).slice(0, 4).map((m: string) => (
                                            <span key={m} style={{
                                                padding: '1px 6px', borderRadius: '4px', fontSize: '11px',
                                                background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                                                color: 'var(--text-secondary)',
                                            }}>{m.trim()}</span>
                                        ))}
                                        {b.models.split(',').filter(Boolean).length > 4 && (
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>+{b.models.split(',').filter(Boolean).length - 4}</span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center', paddingRight: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                        <button onClick={() => handleView(b)} title="เรียกดู" style={{ ...crudStyles.actionBtn, color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)' }}><Eye size={14} /></button>
                                        <button onClick={() => handleEdit(b)} title="แก้ไข" style={{ ...crudStyles.actionBtn, color: '#f59e0b', background: '#fef3c7' }}><Edit2 size={14} /></button>
                                        <button onClick={() => setShowDelete(b)} title="ลบ" style={{ ...crudStyles.actionBtn, color: '#ef4444', background: '#fee2e2' }}><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>ไม่พบข้อมูลยี่ห้อรถ</td></tr>
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
                isOpen={showModal} 
                onClose={() => setShowModal(false)}
                title={isViewOnly ? 'รายละเอียดข้อมูลยี่ห้อรถ' : (editBrand ? 'แก้ไขยี่ห้อรถ' : 'เพิ่มยี่ห้อรถใหม่')}
                width="520px"
                footer={
                    isViewOnly ? (
                        <button onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">ปิดหน้าต่าง</button>
                    ) : (
                        <>
                            <button onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm" disabled={saving} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                            <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={!form.name || !form.nameEn || saving} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
                                {saving ? 'กำลังบันทึก...' : (editBrand  ? 'บันทึกข้อมูล' : 'เพิ่มข้อมูล')}
                            </button>
                        </>
                    )
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label style={crudStyles.label}>ชื่อภาษาไทย <span style={{color: '#ef4444'}}>*</span></label>
                        <input style={crudStyles.input} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="เช่น ฮีโน่" disabled={saving || isViewOnly} />
                    </div>
                    <div>
                        <label style={crudStyles.label}>ชื่อภาษาอังกฤษ <span style={{color: '#ef4444'}}>*</span></label>
                        <input style={crudStyles.input} value={form.nameEn} onChange={e => setForm(p => ({ ...p, nameEn: e.target.value }))} placeholder="เช่น HINO" disabled={saving || isViewOnly} />
                    </div>
                    <div>
                        <label style={crudStyles.label}>ประเทศ</label>
                        <input style={crudStyles.input} value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} placeholder="เช่น ญี่ปุ่น" disabled={saving || isViewOnly} />
                    </div>
                    <div>
                        <label style={crudStyles.label}>ไอคอน</label>
                        <select style={crudStyles.input} value={form.logo} onChange={e => setForm(p => ({ ...p, logo: e.target.value }))} disabled={saving || isViewOnly}>
                            <option value="🚛">🚛 รถบรรทุก</option>
                            <option value="🚚">🚚 รถขนส่ง</option>
                            <option value="🚐">🚐 รถตู้</option>
                            <option value="🚜">🚜 รถพ่วง</option>
                        </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={crudStyles.label}>รุ่นรถ (คั่นด้วย ,)</label>
                        <input style={crudStyles.input} value={form.models} onChange={e => setForm(p => ({ ...p, models: e.target.value }))} placeholder="FL8J, FM8J, FG8J" disabled={saving || isViewOnly} />
                    </div>
                </div>
            </BaseModal>

            <BaseModal 
                isOpen={!!showDelete} 
                onClose={() => setShowDelete(null)}
                title="ยืนยันทำรายการลบ"
                width="400px"
                footer={
                    <>
                        <button onClick={() => setShowDelete(null)} className="btn btn-secondary btn-sm" disabled={saving} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                        <button onClick={handleDelete} className="btn" style={{ background: 'var(--accent-red)', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: 'pointer', fontWeight: 500 }} disabled={saving}>
                            {saving ? 'กำลังลบ...' : 'ลบข้อมูล'}
                        </button>
                    </>
                }
            >
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>คุณแน่ใจหรือไม่ว่าต้องการลบยี่ห้อ <strong style={{ color: 'var(--text-primary)' }}>{showDelete?.nameEn} ({showDelete?.name})</strong> ?</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#ef4444' }}>การกระทำนี้จะไม่สามารถย้อนกลับได้</p>
                </div>
            </BaseModal>
        </CrudLayout>
    );
}
