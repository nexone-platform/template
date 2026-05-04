'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Eye, Pencil, Trash2, X, Box, Phone, Star, FileSpreadsheet, FileText, Download } from 'lucide-react';
import { api, ContainerMechanic as APICMech } from '@/services/api';
import CrudLayout from '@/components/CrudLayout';
import { SearchInput, crudStyles, BaseModal, ExportButtons, SummaryCard } from '@/components/CrudComponents';
import Pagination from '@/components/Pagination';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/exportUtils';
import { useSystemConfig } from '@nexone/ui';

interface ContainerMechanic { id: string; name: string; specialty: string; phone: string; address: string; rating: number; status: string; experience: number; certifications: string; notes: string; }

const specialties = ['ซ่อมทั่วไป', 'ซ่อมพื้นตู้', 'ซ่อมผนังตู้', 'ซ่อมประตูตู้', 'งานเชื่อม/โครงสร้าง', 'ระบบทำความเย็น', 'ซ่อมหลังคาตู้', 'ทำสี/เคลือบกันสนิม'];
const statusLabels: Record<string, string> = { active: 'ใช้งาน', inactive: 'ปิดใช้งาน' };
const statusColors: Record<string, string> = { active: 'var(--accent-green)', inactive: 'var(--text-muted)' };

const emptyForm: Partial<ContainerMechanic> = { name: '', specialty: 'ซ่อมทั่วไป', phone: '', address: '', rating: 4.0, status: 'active', experience: 0, certifications: '', notes: '' };
const mapToDisplay = (r: APICMech): ContainerMechanic => ({ id: r.id, name: r.name, specialty: r.specialization, phone: r.phone, address: r.address, rating: r.rating, status: r.status, experience: r.experience, certifications: r.certification, notes: r.notes });
const mapToAPI = (f: Partial<ContainerMechanic>): Partial<APICMech> => ({ ...f, specialization: f.specialty, certification: f.certifications } as Partial<APICMech>);

export default function ContainerMechanicsPage() {
    const [data, setData] = useState<ContainerMechanic[]>([]);
    const [search, setSearch] = useState('');
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
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | 'delete' | null>(null);
    const [selected, setSelected] = useState<ContainerMechanic | null>(null);
    const [form, setForm] = useState<Partial<ContainerMechanic>>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => { 
        try { 
            const res = await api.getContainerMechanics(); 
            setData((res || []).map(mapToDisplay)); 
        } catch { } finally { setLoading(false); }
    }, []);
    useEffect(() => { loadData(); }, [loadData]);

    const filtered = data.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.specialty.includes(search) || r.id.toLowerCase().includes(search.toLowerCase()));
    
    // pagination for CrudLayout is manual since it's just rendering the rows
    const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // ===== Handlers =====
    const handleAdd = () => { setForm(emptyForm); setFormErrors({}); setModalMode('add'); };
    const handleView = (r: ContainerMechanic) => { setSelected(r); setModalMode('view'); };
    const handleEdit = (r: ContainerMechanic) => {
        setSelected(r);
        setForm({ ...r });
        setFormErrors({});
        setModalMode('edit');
    };
    const handleDeleteClick = (r: ContainerMechanic) => { setSelected(r); setModalMode('delete'); };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!form.name?.trim()) errors.name = 'กรุณาระบุชื่อ';
        if (!form.phone?.trim()) errors.phone = 'กรุณาระบุเบอร์โทร';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveNew = async () => {
        if (!validateForm()) return;
        setSaving(true);
        try {
            await api.createContainerMechanic({ ...mapToAPI(form), id: `CMC-${String(data.length + 1).padStart(3, '0')}` });
            setModalMode(null);
            await loadData();
        } catch { } finally { setSaving(false); }
    };

    const handleSaveEdit = async () => {
        if (!selected) return;
        if (!validateForm()) return;
        setSaving(true);
        try {
            await api.updateContainerMechanic(selected.id, mapToAPI(form));
            setModalMode(null);
            await loadData();
        } catch { } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            await api.deleteContainerMechanic(selected.id);
            setModalMode(null);
            await loadData();
        } catch { } finally { setSaving(false); }
    };

    const exportCols = [
        { header: 'รหัส', key: 'id' },
        { header: 'ชื่อ', key: 'name' },
        { header: 'ความชำนาญ', key: 'specialty' },
        { header: 'เบอร์โทร', key: 'phone' },
        { header: 'Rating', key: 'rating' },
        { header: 'ประสบการณ์ (ปี)', key: 'experience' },
        { header: 'สถานะ', key: 'status', format: (val: any) => statusLabels[val] || val }
    ];

    if (loading) return <div style={{ padding: '24px', color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</div>;

    const labelStyle: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' };
    const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' };
    const errorInputStyle: React.CSSProperties = { borderColor: '#ef4444', background: 'rgba(239,68,68,0.04)' };
    const errorTextStyle: React.CSSProperties = { color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' };

    const renderFormFields = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>ชื่อ *</label>
                <input style={{ ...inputStyle, ...(formErrors.name ? errorInputStyle : {}) }} value={form.name} onChange={e => { setForm(prev => ({ ...prev, name: e.target.value })); setFormErrors(prev => { const n = { ...prev }; delete n.name; return n; }); }} placeholder="ชื่อ-นามสกุล" disabled={modalMode === "view"} />
                {formErrors.name && <span style={errorTextStyle}>{formErrors.name}</span>}
            </div>
            <div>
                <label style={labelStyle}>ความชำนาญ</label>
                <select style={inputStyle} value={form.specialty} onChange={e => setForm(prev => ({ ...prev, specialty: e.target.value }))} disabled={modalMode === "view"}>
                    {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div>
                <label style={labelStyle}>โทร *</label>
                <input style={{ ...inputStyle, ...(formErrors.phone ? errorInputStyle : {}) }} value={form.phone} onChange={e => { setForm(prev => ({ ...prev, phone: e.target.value })); setFormErrors(prev => { const n = { ...prev }; delete n.phone; return n; }); }} placeholder="08x-xxx-xxxx" disabled={modalMode === "view"} />
                {formErrors.phone && <span style={errorTextStyle}>{formErrors.phone}</span>}
            </div>
            <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>ที่อยู่</label>
                <input style={inputStyle} value={form.address} onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))} placeholder="ที่อยู่" disabled={modalMode === "view"} />
            </div>
            <div>
                <label style={labelStyle}>ประสบการณ์ (ปี)</label>
                <input style={inputStyle} type="number" value={form.experience} onChange={e => setForm(prev => ({ ...prev, experience: +e.target.value }))} disabled={modalMode === "view"} />
            </div>
            <div>
                <label style={labelStyle}>สถานะ</label>
                <select style={inputStyle} value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))} disabled={modalMode === "view"}>
                    {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
            </div>
            <div>
                <label style={labelStyle}>Rating</label>
                <input style={inputStyle} type="number" min={0} max={5} step={0.1} value={form.rating} onChange={e => setForm(prev => ({ ...prev, rating: +e.target.value }))} disabled={modalMode === "view"} />
            </div>
            <div>
                <label style={labelStyle}>ใบรับรอง</label>
                <input style={inputStyle} value={form.certifications} onChange={e => setForm(prev => ({ ...prev, certifications: e.target.value }))} placeholder="ใบรับรอง (ถ้ามี)" disabled={modalMode === "view"} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>หมายเหตุ</label>
                <input style={inputStyle} value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="หมายเหตุเพิ่มเติม" disabled={modalMode === "view"} />
            </div>
        </div>
    );

    return (
        <CrudLayout
            toolbarLeft={
                <ExportButtons 
                    onExportXLSX={() => exportToXLSX(filtered, 'ContainerMechanics', exportCols)}
                    onExportCSV={() => exportToCSV(filtered, 'ContainerMechanics', exportCols)}
                    onExportPDF={() => exportToPDF(filtered, 'ContainerMechanics', exportCols, 'Container Mechanics Report')}
                />
            }
            toolbarRight={
                <>
                    <SearchInput value={search} onChange={setSearch} placeholder="ค้นหาชื่อ, ความชำนาญ..." />
                    <button onClick={handleAdd} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /> <span>เพิ่มข้อมูล</span></button>
                </>
            }
        >
            <div style={{ height: '720px', overflowY: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '80px' }}>รหัส</th>
                            <th style={{ width: '180px' }}>ชื่อ-นามสกุล</th>
                            <th style={{ width: '160px' }}>ความชำนาญ</th>
                            <th style={{ width: '120px' }}>เบอร์โทร</th>
                            <th style={{ width: '100px' }}>Rating</th>
                            <th style={{ width: '100px', textAlign: 'center' }}>สถานะ</th>
                            <th style={{ width: '120px', textAlign: 'center', paddingRight: '24px' }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paged.length > 0 ? paged.map(r => (
                            <tr key={r.id}>
                                <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{r.id}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)', fontWeight: 600, fontSize: '14px' }}>
                                            {r.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</div>
                                            {r.certifications && <div style={{ fontSize: '12px', color: 'var(--accent-blue)', marginTop: '2px' }}>{r.certifications}</div>}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: 'var(--bg-input)', borderRadius: '6px', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                        <Box size={14} /> {r.specialty}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        <Phone size={14} /> {r.phone}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '13px', fontWeight: 600 }}>
                                        <Star size={14} fill="currentColor" /> {r.rating.toFixed(1)}
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, background: `rgba(${r.status === 'active' ? '16, 185, 129' : '156, 163, 175'}, 0.1)`, color: statusColors[r.status] }}>
                                        {statusLabels[r.status]}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center', paddingRight: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                                        <button onClick={() => handleView(r)} style={{ ...crudStyles.actionBtn, color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)' }} title="เรียกดู"><Eye size={14} /></button>
                                        <button onClick={() => handleEdit(r)} style={{ ...crudStyles.actionBtn, color: 'var(--accent-amber)', background: 'rgba(245,158,11,0.1)' }} title="แก้ไข"><Pencil size={14} /></button>
                                        <button onClick={() => handleDeleteClick(r)} style={{ ...crudStyles.actionBtn, color: 'var(--accent-red)', background: 'rgba(239,68,68,0.1)' }} title="ลบ"><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>ไม่มีข้อมูลช่าง</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination 
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={filtered.length}
                setCurrentPage={setCurrentPage}
                setPageSize={setPageSize}
            />

            <BaseModal
                isOpen={modalMode !== null}
                onClose={() => setModalMode(null)}
                title={
                    modalMode === 'add' ? 'เพิ่มช่างซ่อมตู้คอนเทนเนอร์' :
                    modalMode === 'edit' ? `แก้ไข: ${selected?.name}` :
                    modalMode === 'view' ? `รายละเอียด: ${selected?.name}` :
                    'ลบช่างซ่อมตู้คอนเทนเนอร์'
                }
                width={modalMode === 'delete' ? '400px' : '640px'}
            >
                {modalMode === 'delete' ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 16px', background: 'rgba(239, 68, 68, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trash2 size={28} style={{ color: 'var(--accent-red)' }} />
                        </div>
                        <p style={{ fontSize: '16px', marginBottom: '8px', fontWeight: 600 }}>คุณต้องการลบ <strong>{selected?.name}</strong> ใช่หรือไม่?</p>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                            <button onClick={() => setModalMode(null)} className="btn btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 500, cursor: 'pointer' }}>ยกเลิก</button>
                            <button onClick={handleDelete} className="btn" disabled={saving} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--accent-red)', color: 'white', fontWeight: 500, cursor: 'pointer' }}>{saving ? 'กำลังลบ...' : 'ยืนยันการลบ'}</button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div style={{ padding: '0' }}>
                            {renderFormFields()}
                        </div>
                        {modalMode !== 'view' && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                                <button onClick={() => setModalMode(null)} className="btn btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 500, cursor: 'pointer' }}>ยกเลิก</button>
                                <button onClick={modalMode === 'add' ? handleSaveNew : handleSaveEdit} className="btn" disabled={saving} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--accent-green)', color: 'white', fontWeight: 500, cursor: 'pointer' }}>
                                    {saving ? 'กำลังบันทึก...' : (modalMode === 'add' ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล')}
                                </button>
                            </div>
                        )}
                        {modalMode === 'view' && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                                <button onClick={() => setModalMode(null)} className="btn btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 500, cursor: 'pointer' }}>ปิด</button>
                            </div>
                        )}
                    </div>
                )}
            </BaseModal>
        </CrudLayout>
    );
}
