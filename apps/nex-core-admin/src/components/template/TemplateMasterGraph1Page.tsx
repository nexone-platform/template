import React, { useState, useEffect, useCallback } from 'react';
import CrudLayout from '@/components/CrudLayout';
import { SummaryCard, SearchInput, crudStyles, BaseModal } from '@/components/CrudComponents';
import { Plus, Edit2, Trash2, Eye, CheckCircle2, ChevronDown, Check, Clock, AlertTriangle, Receipt, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { usePagePermission } from '@/contexts/PermissionContext';

// ---------- Types ----------
interface InvoiceRecord {
    id: number;
    invoice: string;
    customer: string;
    amount: number;
    status: string;
    issueDate: string;
    dueDate: string;
    orderId: string | null;
    isActive: boolean;
}

// ---------- Chart data (static — ใช้แสดงเป็น template) ----------
const chartData = [
    { name: 'ม.ค.', revenue: 2500000, cost: 1800000, profit: 700000 },
    { name: 'ก.พ.', revenue: 2600000, cost: 1900000, profit: 700000 },
    { name: 'มี.ค.', revenue: 3100000, cost: 2000000, profit: 1100000 },
    { name: 'เม.ย.', revenue: 2300000, cost: 1700000, profit: 600000 },
    { name: 'พ.ค.', revenue: 2700000, cost: 1900000, profit: 800000 },
    { name: 'มิ.ย.', revenue: 3200000, cost: 2100000, profit: 1100000 },
];

const EMPTY_FORM = { invoice: '', customer: '', amount: 0, status: 'รอชำระ', issueDate: '', dueDate: '', orderId: '' };

export default function TemplateMasterGraph1Page() {
    const perm = usePagePermission('Master Graph 1');
    const API = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:8001/api';

    // ---------- State ----------
    const [data, setData] = useState<InvoiceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [currentTab, setCurrentTab] = useState('ทั้งหมด');

    // CRUD modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | 'delete'>('add');
    const [selectedItem, setSelectedItem] = useState<InvoiceRecord | null>(null);
    const [formData, setFormData] = useState(EMPTY_FORM);

    // ---------- API helpers ----------
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/template-master-graph`);
            if (res.ok) {
                const json = await res.json();
                // map snake_case → camelCase
                const mapped: InvoiceRecord[] = (Array.isArray(json) ? json : []).map((r: any) => ({
                    id: r.id,
                    invoice: r.invoice,
                    customer: r.customer,
                    amount: parseFloat(r.amount),
                    status: r.status,
                    issueDate: r.issue_date ?? r.issueDate ?? '',
                    dueDate: r.due_date ?? r.dueDate ?? '',
                    orderId: r.order_id ?? r.orderId ?? null,
                    isActive: r.is_active ?? r.isActive ?? true,
                }));
                setData(mapped);
            }
        } catch (e) {
            console.error('[TemplateMasterGraph] fetch failed', e);
        } finally {
            setLoading(false);
        }
    }, [API]);

    useEffect(() => { loadData(); }, [loadData]);

    // ---------- Action Handlers ----------
    const handleAdd = () => {
        const nextNum = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;
        setFormData({ ...EMPTY_FORM, invoice: `INV-2026-${String(nextNum).padStart(3, '0')}`, issueDate: new Date().toISOString().split('T')[0] });
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleEdit = (item: InvoiceRecord) => {
        setFormData({ invoice: item.invoice, customer: item.customer, amount: item.amount, status: item.status, issueDate: item.issueDate, dueDate: item.dueDate, orderId: item.orderId || '' });
        setSelectedItem(item);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (item: InvoiceRecord) => {
        setFormData({ invoice: item.invoice, customer: item.customer, amount: item.amount, status: item.status, issueDate: item.issueDate, dueDate: item.dueDate, orderId: item.orderId || '' });
        setSelectedItem(item);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleDelete = (item: InvoiceRecord) => {
        setSelectedItem(item);
        setModalMode('delete');
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.customer.trim()) return;
        setSaving(true);
        try {
            const body = {
                invoice: formData.invoice,
                customer: formData.customer,
                amount: formData.amount,
                status: formData.status,
                issue_date: formData.issueDate,
                due_date: formData.dueDate,
                order_id: formData.orderId || null,
            };
            if (modalMode === 'add') {
                await fetch(`${API}/template-master-graph`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            } else if (modalMode === 'edit' && selectedItem) {
                await fetch(`${API}/template-master-graph/${selectedItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            }
            setIsModalOpen(false);
            loadData();
        } catch (e) { console.error(e); }
        setSaving(false);
    };

    const handleConfirmDelete = async () => {
        if (!selectedItem) return;
        setSaving(true);
        try {
            await fetch(`${API}/template-master-graph/${selectedItem.id}`, { method: 'DELETE' });
            setIsModalOpen(false);
            loadData();
        } catch (e) { console.error(e); }
        setSaving(false);
    };

    // ---------- Filter & Pagination ----------
    const searchLower = searchTerm.toLowerCase();
    const searchedData = data.filter(item =>
        item.invoice.toLowerCase().includes(searchLower) ||
        item.customer.toLowerCase().includes(searchLower)
    );
    const filteredData = searchedData.filter(item => currentTab === 'ทั้งหมด' || item.status === currentTab);
    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const summaryData = {
        paidCount: searchedData.filter(d => d.status === 'ชำระแล้ว').length,
        pendingCount: searchedData.filter(d => d.status === 'รอชำระ').length,
        overdueCount: searchedData.filter(d => d.status === 'เกินกำหนด').length,
        totalCount: searchedData.length,
    };

    const hasActions = perm.canView || perm.canEdit || perm.canDelete;

    // ---------- Helpers ----------
    const renderStatusDropdown = (item: InvoiceRecord) => {
        let color, bg, icon;
        if (item.status === 'ชำระแล้ว')     { color = 'var(--accent-green)';  bg = 'rgba(16, 185, 129, 0.12)'; icon = <Check size={14} />; }
        else if (item.status === 'รอชำระ')   { color = 'var(--accent-amber)';  bg = 'rgba(245, 158, 11, 0.12)'; icon = <Clock size={14} />; }
        else                                  { color = 'var(--accent-red)';    bg = 'rgba(239, 68, 68, 0.12)';  icon = <AlertTriangle size={14} />; }
        return (
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '100px', border: 'none', background: bg, color, fontSize: '13px', fontWeight: 600, cursor: 'default' }}>
                    {icon}{item.status}
                </button>
            </div>
        );
    };

    const getTabStyle = (tabName: string) => {
        const isActive = currentTab === tabName;
        return { padding: '8px 16px', borderRadius: '100px', border: 'none', fontSize: '13px', fontWeight: isActive ? 600 : 500, background: isActive ? 'var(--accent-blue)' : 'var(--bg-card)', color: isActive ? '#fff' : 'var(--text-muted)', cursor: 'pointer', boxShadow: isActive ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' } as React.CSSProperties;
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

    return (
        <CrudLayout
            summaryCards={
                <>
                    <SummaryCard title="ชำระแล้ว"   count={summaryData.paidCount}    icon={<CheckCircle2 size={24} color="#10b981" />} color="#10b981" isActive={currentTab === 'ชำระแล้ว'}   onClick={() => { setCurrentTab('ชำระแล้ว');   setCurrentPage(1); }} />
                    <SummaryCard title="รอชำระ"      count={summaryData.pendingCount}  icon={<Clock       size={24} color="#f59e0b" />} color="#f59e0b" isActive={currentTab === 'รอชำระ'}     onClick={() => { setCurrentTab('รอชำระ');     setCurrentPage(1); }} />
                    <SummaryCard title="เกินกำหนด"   count={summaryData.overdueCount}  icon={<AlertTriangle size={24} color="#ef4444" />} color="#ef4444" isActive={currentTab === 'เกินกำหนด'} onClick={() => { setCurrentTab('เกินกำหนด'); setCurrentPage(1); }} />
                    <SummaryCard title="Invoice ทั้งหมด" count={summaryData.totalCount} icon={<Receipt size={24} color="#3b82f6" />} color="#3b82f6" isActive={currentTab === 'ทั้งหมด'}     onClick={() => { setCurrentTab('ทั้งหมด');   setCurrentPage(1); }} />
                </>
            }
            customHeaderContent={
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px' }}>
                    <div className="card h-full">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: 600 }}>
                            <BarChart3 size={18} color="var(--accent-blue)" /> รายได้ vs ต้นทุน
                        </div>
                        <div style={{ height: '260px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                                    <Tooltip formatter={(v: any) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(v)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-card)' }} />
                                    <Bar dataKey="revenue" name="รายได้" fill="var(--accent-blue)"  radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="cost"    name="ต้นทุน" fill="var(--accent-amber)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="card h-full">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: 600 }}>
                            <LineChartIcon size={18} color="var(--accent-green)" /> กำไรรายเดือน
                        </div>
                        <div style={{ height: '260px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                                    <Tooltip formatter={(v: any) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(v)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-card)' }} />
                                    <Bar dataKey="profit" name="กำไร" fill="var(--accent-green)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            }
            toolbarLeft={
                <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '100px' }}>
                    <button style={getTabStyle('ทั้งหมด')}   onClick={() => { setCurrentTab('ทั้งหมด');   setCurrentPage(1); }}>ทั้งหมด</button>
                    <button style={getTabStyle('ชำระแล้ว')}  onClick={() => { setCurrentTab('ชำระแล้ว');  setCurrentPage(1); }}><Check        size={14} color={currentTab === 'ชำระแล้ว'  ? '#fff' : 'var(--accent-green)'} /> ชำระแล้ว</button>
                    <button style={getTabStyle('รอชำระ')}    onClick={() => { setCurrentTab('รอชำระ');    setCurrentPage(1); }}><Clock        size={14} color={currentTab === 'รอชำระ'    ? '#fff' : 'var(--accent-amber)'} /> รอชำระ</button>
                    <button style={getTabStyle('เกินกำหนด')} onClick={() => { setCurrentTab('เกินกำหนด'); setCurrentPage(1); }}><AlertTriangle size={14} color={currentTab === 'เกินกำหนด' ? '#fff' : 'var(--accent-red)'}   /> เกินกำหนด</button>
                </div>
            }
            toolbarRight={
                <>
                    {perm.canView && <SearchInput value={searchTerm} onChange={e => { setSearchTerm(e); setCurrentPage(1); }} placeholder="ค้นหา Invoice, ลูกค้า..." />}
                    {perm.canAdd  && <button onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /><span>เพิ่มข้อมูล</span></button>}
                </>
            }
        >
            <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '14%' }}>INVOICE</th>
                            <th style={{ width: '24%' }}>ลูกค้า</th>
                            <th style={{ width: '10%' }}>จำนวน</th>
                            <th style={{ width: '13%' }}>สถานะ</th>
                            <th style={{ width: '12%' }}>วันออก</th>
                            <th style={{ width: '12%' }}>ครบกำหนด</th>
                            <th style={{ width: '12%' }}>ORDER</th>
                            {hasActions && <th style={{ width: '13%', textAlign: 'center' }}>จัดการ</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(item => (
                            <tr key={item.id} className="hover-highlight">
                                <td style={{ color: 'var(--accent-blue)', fontWeight: 500 }}>{item.invoice}</td>
                                <td className="font-medium">{item.customer}</td>
                                <td className="font-medium">฿{Number(item.amount).toLocaleString()}</td>
                                <td>{renderStatusDropdown(item)}</td>
                                <td className="text-muted">{item.issueDate}</td>
                                <td className="text-muted">{item.dueDate}</td>
                                <td className="text-muted">{item.orderId || '-'}</td>
                                {hasActions && (
                                    <td className="text-center" style={{ paddingRight: '24px' }}>
                                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                            {perm.canView   && <button onClick={() => handleView(item)}   style={{ ...crudStyles.actionBtn, color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)' }} title="เรียกดู"><Eye    size={14} /></button>}
                                            {perm.canEdit   && <button onClick={() => handleEdit(item)}   style={{ ...crudStyles.actionBtn, color: '#f59e0b', background: '#fef3c7' }} title="แก้ไข"><Edit2  size={14} /></button>}
                                            {perm.canDelete && <button onClick={() => handleDelete(item)} style={{ ...crudStyles.actionBtn, color: '#ef4444', background: '#fee2e2' }} title="ลบ"><Trash2 size={14} /></button>}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr><td colSpan={hasActions ? 8 : 7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>ไม่พบข้อมูล</td></tr>
                        )}
                    </tbody>
                </table>

            {filteredData.length > 0 && (
                <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={filteredData.length} setCurrentPage={setCurrentPage} setPageSize={setPageSize} />
            )}

            {/* ===== Add / Edit / View Modal ===== */}
            <BaseModal
                isOpen={isModalOpen && modalMode !== 'delete'}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'add' ? 'สร้างรายการ Invoice ใหม่' : modalMode === 'edit' ? 'แก้ไขรายการ Invoice' : 'รายละเอียด Invoice'}
                footer={
                    modalMode !== 'view' ? (
                        <>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                            <button onClick={handleSave} disabled={!formData.customer.trim() || saving} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: (!formData.customer.trim() || saving) ? 0.5 : 1 }}>
                                {saving ? 'กำลังบันทึก...' : modalMode === 'add' ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>ปิด</button>
                    )
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={crudStyles.label}>รหัส Invoice <span style={{ color: '#ef4444' }}>*</span></label>
                        <input type="text" style={crudStyles.input} value={formData.invoice} disabled />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={crudStyles.label}>ลูกค้า <span style={{ color: '#ef4444' }}>*</span></label>
                        <input type="text" style={crudStyles.input} placeholder="ระบุชื่อลูกค้าและบริษัท" value={formData.customer} onChange={e => setFormData({ ...formData, customer: e.target.value })} disabled={modalMode === 'view'} />
                    </div>
                    <div>
                        <label style={crudStyles.label}>จำนวนเงิน</label>
                        <input type="number" style={crudStyles.input} placeholder="ระบุจำนวนเงิน" value={formData.amount} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} disabled={modalMode === 'view'} />
                    </div>
                    <div>
                        <label style={crudStyles.label}>สถานะ <span style={{ color: '#ef4444' }}>*</span></label>
                        <select style={crudStyles.input} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} disabled={modalMode === 'view'}>
                            <option value="รอชำระ">รอชำระ</option>
                            <option value="ชำระแล้ว">ชำระแล้ว</option>
                            <option value="เกินกำหนด">เกินกำหนด</option>
                        </select>
                    </div>
                    <div>
                        <label style={crudStyles.label}>วันออกเอกสาร</label>
                        <input type="date" style={crudStyles.input} value={formData.issueDate} onChange={e => setFormData({ ...formData, issueDate: e.target.value })} disabled={modalMode === 'view'} />
                    </div>
                    <div>
                        <label style={crudStyles.label}>วันครบกำหนด</label>
                        <input type="date" style={crudStyles.input} value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} disabled={modalMode === 'view'} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={crudStyles.label}>Order ID (อ้างอิง)</label>
                        <input type="text" style={crudStyles.input} placeholder="เช่น ORD-2026-0001" value={formData.orderId} onChange={e => setFormData({ ...formData, orderId: e.target.value })} disabled={modalMode === 'view'} />
                    </div>
                </div>
            </BaseModal>

            {/* ===== Delete Confirm Modal ===== */}
            <BaseModal
                isOpen={isModalOpen && modalMode === 'delete'}
                onClose={() => setIsModalOpen(false)}
                title="ยืนยันการลบข้อมูล"
                width="400px"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>ยกเลิก</button>
                        <button onClick={handleConfirmDelete} disabled={saving} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: saving ? 0.5 : 1 }}>{saving ? 'กำลังลบ...' : 'ลบข้อมูล'}</button>
                    </>
                }
            >
                <div>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>คุณแน่ใจหรือไม่ว่าต้องการลบ Invoice <strong style={{ color: 'var(--text-primary)' }}>{selectedItem?.invoice}</strong> ?</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#ef4444' }}>การกระทำนี้จะไม่สามารถย้อนกลับได้</p>
                </div>
            </BaseModal>
        </CrudLayout>
    );
}
