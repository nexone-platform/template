import React, { useState } from 'react';
import CrudLayout from '@/components/CrudLayout';
import { SummaryCard, SearchInput, crudStyles, BaseModal } from '@/components/CrudComponents';
import { Plus, Edit2, Trash2, Eye, CheckCircle2, ChevronDown, Check, Clock, AlertTriangle, Receipt, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function TemplateMasterGraph1Page() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [currentTab, setCurrentTab] = useState('ทั้งหมด');
    
    // ข้อมูลกราฟจำลอง
    const chartData = [
        { name: 'ม.ค.', revenue: 2500000, cost: 1800000, profit: 700000 },
        { name: 'ก.พ.', revenue: 2600000, cost: 1900000, profit: 700000 },
        { name: 'มี.ค.', revenue: 3100000, cost: 2000000, profit: 1100000 },
        { name: 'เม.ย.', revenue: 2300000, cost: 1700000, profit: 600000 },
        { name: 'พ.ค.', revenue: 2700000, cost: 1900000, profit: 800000 },
        { name: 'มิ.ย.', revenue: 3200000, cost: 2100000, profit: 1100000 },
    ];

    // ข้อมูลตารางจำลอง
    const [dummyData, setDummyData] = useState(
        Array.from({ length: 45 }, (_, i) => {
            const statusType = i % 7 === 0 ? 'เกินกำหนด' : i % 3 === 0 ? 'รอชำระ' : 'ชำระแล้ว';
            const customers = ['บริษัท สยามซีเมนต์ จำกัด', 'บริษัท ซีพี ออลล์ จำกัด', 'บริษัท เบทาโกร จำกัด', 'บริษัท ทรู คอร์ปอเรชั่น จำกัด', 'บริษัท โตโยต้า มอเตอร์ จำกัด', 'บริษัท ลาซาด้า จำกัด'];
            return { 
                id: i + 1, 
                invoice: `INV-2026-${String(i + 1).padStart(3, '0')}`, 
                customer: customers[i % customers.length], 
                amount: 4200 + (i * 1150) - (i % 2 === 0 ? 500 : 0), 
                status: statusType, 
                issueDate: `2026-03-${String((i % 28) + 1).padStart(2, '0')}`, 
                dueDate: `2026-03-${String(((i + 14) % 28) + 1).padStart(2, '0')}`, 
                orderId: i % 4 !== 0 ? `ORD-2026-${String(i + 1).padStart(4, '0')}` : '-'
            };
        })
    );

    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ invoice: '', customer: '', amount: 0, status: 'รอชำระ', issueDate: '', dueDate: '', orderId: '' });

    // Action Handlers
    const handleAdd = () => {
        setFormData({ 
            invoice: `INV-2026-${String(dummyData.length + 1).padStart(3, '0')}`, 
            customer: '', 
            amount: 0, 
            status: 'รอชำระ', 
            issueDate: new Date().toISOString().split('T')[0], 
            dueDate: '', 
            orderId: '' 
        });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.customer.trim()) return;
        const newId = dummyData.length > 0 ? Math.max(...dummyData.map(d => d.id)) + 1 : 1;
        setDummyData([{ id: newId, ...formData }, ...dummyData]);
        setIsModalOpen(false);
    };

    // Filter by Tab logic and Pagination logic
    const searchLower = searchTerm.toLowerCase();
    const searchedData = dummyData.filter(item => 
        item.invoice.toLowerCase().includes(searchLower) ||
        item.customer.toLowerCase().includes(searchLower)
    );
    const filteredData = searchedData.filter(item => currentTab === 'ทั้งหมด' || item.status === currentTab);
    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // คำนวณข้อมูลสำหรับกล่องสรุปด้านบน (Summary Cards) ดึงตาม Searched Data (ก่อนแยกแท็บ)
    const summaryData = {
        paidCount: searchedData.filter(d => d.status === 'ชำระแล้ว').length,
        pendingCount: searchedData.filter(d => d.status === 'รอชำระ').length,
        overdueCount: searchedData.filter(d => d.status === 'เกินกำหนด').length,
        totalCount: searchedData.length
    };
    
    // Helper function for formatting currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    };

    // Component จำลองสำหรับ Dropdown สถานะของแบบที่ 3 ที่รองรับหลายสถานะ (ไม่ใช่แค่ boolean)
    const renderStatusDropdown = (item: any) => {
        let color, bg, icon;
        if (item.status === 'ชำระแล้ว') {
            color = 'var(--accent-green)';
            bg = 'rgba(16, 185, 129, 0.12)';
            icon = <Check size={14} />;
        } else if (item.status === 'รอชำระ') {
            color = 'var(--accent-amber)';
            bg = 'rgba(245, 158, 11, 0.12)';
            icon = <Clock size={14} />;
        } else {
            color = 'var(--accent-red)';
            bg = 'rgba(239, 68, 68, 0.12)';
            icon = <AlertTriangle size={14} />;
        }

        return (
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <button 
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '4px 10px', borderRadius: '100px', border: 'none',
                        background: bg, color: color, fontSize: '13px', fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}
                >
                    {icon}
                    {item.status}
                    <ChevronDown size={14} style={{ opacity: 0.7 }} />
                </button>
            </div>
        );
    };

    // Filter style
    const getTabStyle = (tabName: string) => {
        const isActive = currentTab === tabName;
        return {
            padding: '8px 16px',
            borderRadius: '100px',
            border: 'none',
            fontSize: '13px',
            fontWeight: isActive ? 600 : 500,
            background: isActive ? 'var(--accent-blue)' : 'var(--bg-card)',
            color: isActive ? '#fff' : 'var(--text-muted)',
            cursor: 'pointer',
            boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        };
    };

    return (
        <CrudLayout
            summaryCards={
                <>
                    <SummaryCard 
                        title="ชำระแล้ว" 
                        count={summaryData.paidCount} 
                        icon={<CheckCircle2 size={24} color={currentTab === 'ชำระแล้ว' || currentTab === 'ทั้งหมด' ? '#10b981' : 'currentColor'} />} 
                        color="#10b981"
                        isActive={currentTab === 'ชำระแล้ว'}
                        onClick={() => { setCurrentTab('ชำระแล้ว'); setCurrentPage(1); }}
                    />
                    <SummaryCard 
                        title="รอชำระ" 
                        count={summaryData.pendingCount} 
                        icon={<Clock size={24} color={currentTab === 'รอชำระ' || currentTab === 'ทั้งหมด' ? '#f59e0b' : 'currentColor'} />} 
                        color="#f59e0b"
                        isActive={currentTab === 'รอชำระ'}
                        onClick={() => { setCurrentTab('รอชำระ'); setCurrentPage(1); }}
                    />
                    <SummaryCard 
                        title="เกินกำหนด" 
                        count={summaryData.overdueCount} 
                        icon={<AlertTriangle size={24} color={currentTab === 'เกินกำหนด' || currentTab === 'ทั้งหมด' ? '#ef4444' : 'currentColor'} />} 
                        color="#ef4444"
                        isActive={currentTab === 'เกินกำหนด'}
                        onClick={() => { setCurrentTab('เกินกำหนด'); setCurrentPage(1); }}
                    />
                    <SummaryCard 
                        title="Invoice ทั้งหมด" 
                        count={summaryData.totalCount} 
                        icon={<Receipt size={24} color={currentTab === 'ทั้งหมด' ? '#3b82f6' : 'currentColor'} />} 
                        color="#3b82f6"
                        isActive={currentTab === 'ทั้งหมด'}
                        onClick={() => { setCurrentTab('ทั้งหมด'); setCurrentPage(1); }}
                    />
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
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                                    <Tooltip 
                                        formatter={(value: any) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value)}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-card)' }}
                                    />
                                    <Bar dataKey="revenue" name="รายได้" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="cost" name="ต้นทุน" fill="var(--accent-amber)" radius={[4, 4, 0, 0]} />
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
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                                    <Tooltip 
                                        formatter={(value: any) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value)}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-card)' }}
                                    />
                                    <Bar dataKey="profit" name="กำไร" fill="var(--accent-green)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            }
            toolbarLeft={
                <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '100px' }}>
                    <button style={getTabStyle('ทั้งหมด')} onClick={() => { setCurrentTab('ทั้งหมด'); setCurrentPage(1); }}>ทั้งหมด</button>
                    <button style={getTabStyle('ชำระแล้ว')} onClick={() => { setCurrentTab('ชำระแล้ว'); setCurrentPage(1); }}>
                        <Check size={14} color={currentTab === 'ชำระแล้ว' ? '#fff' : 'var(--accent-green)'} /> ชำระแล้ว
                    </button>
                    <button style={getTabStyle('รอชำระ')} onClick={() => { setCurrentTab('รอชำระ'); setCurrentPage(1); }}>
                        <Clock size={14} color={currentTab === 'รอชำระ' ? '#fff' : 'var(--accent-amber)'} /> รอชำระ
                    </button>
                    <button style={getTabStyle('เกินกำหนด')} onClick={() => { setCurrentTab('เกินกำหนด'); setCurrentPage(1); }}>
                        <AlertTriangle size={14} color={currentTab === 'เกินกำหนด' ? '#fff' : 'var(--accent-red)'} /> เกินกำหนด
                    </button>
                </div>
            }
            toolbarRight={
                <>
                    <SearchInput value={searchTerm} onChange={e => { setSearchTerm(e); setCurrentPage(1); }} placeholder="ค้นหา Invoice, ลูกค้า..." />
                    <button onClick={handleAdd} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /> <span>เพิ่มข้อมูล</span></button>
                </>
            }
        >
            <div style={{ height: '280px', overflowY: 'auto' }}>
            <table className="data-table">
                <thead>
                    <tr>
                        <th style={{ width: '15%' }}>INVOICE</th>
                        <th style={{ width: '25%' }}>ลูกค้า</th>
                        <th style={{ width: '10%' }}>จำนวน</th>
                        <th style={{ width: '15%' }}>สถานะ</th>
                        <th style={{ width: '15%' }}>วันออก</th>
                        <th style={{ width: '15%' }}>ครบกำหนด</th>
                        <th style={{ width: '15%' }}>ORDER</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.map(item => (
                        <tr key={item.id} className="hover-highlight">
                            <td className="text-primary font-medium" style={{ color: 'var(--accent-blue)' }}>{item.invoice}</td>
                            <td className="font-medium">{item.customer}</td>
                            <td className="font-medium">฿{item.amount.toLocaleString()}</td>
                            <td>{renderStatusDropdown(item)}</td>
                            <td className="text-muted">{item.issueDate}</td>
                            <td className="text-muted">{item.dueDate}</td>
                            <td className="text-muted">{item.orderId}</td>
                        </tr>
                    ))}
                    {paginatedData.length === 0 && (
                        <tr>
                            <td colSpan={7} className="text-center text-muted" style={{ padding: '32px' }}>
                                ไม่พบข้อมูล
                            </td>
                        </tr>
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
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="สร้างรายการ Invoice ใหม่"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                        <button onClick={handleSave} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}  >{true ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}</button>
                    </>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={crudStyles.label}>รหัส Invoice <span style={{color: '#ef4444'}}>*</span></label>
                        <input 
                            type="text" 
                            style={crudStyles.input} 
                            value={formData.invoice}
                            disabled
                        />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={crudStyles.label}>ลูกค้า <span style={{color: '#ef4444'}}>*</span></label>
                        <input 
                            type="text" 
                            style={crudStyles.input} 
                            placeholder="ระบุชื่อลูกค้าและบริษัท"
                            value={formData.customer}
                            onChange={(e) => setFormData({...formData, customer: e.target.value})}
                        />
                    </div>
                    <div>
                        <label style={crudStyles.label}>จำนวนเงิน</label>
                        <input 
                            type="number" 
                            style={crudStyles.input} 
                            placeholder="ระบุจำนวนเงิน"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label style={crudStyles.label}>สถานะ <span style={{color: '#ef4444'}}>*</span></label>
                        <select 
                            style={crudStyles.input} 
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                        >
                            <option value="รอชำระ">รอชำระ</option>
                            <option value="ชำระแล้ว">ชำระแล้ว</option>
                            <option value="เกินกำหนด">เกินกำหนด</option>
                        </select>
                    </div>
                    <div>
                        <label style={crudStyles.label}>วันออกเอกสาร</label>
                        <input 
                            type="date" 
                            style={crudStyles.input} 
                            value={formData.issueDate}
                            onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                        />
                    </div>
                    <div>
                        <label style={crudStyles.label}>วันครบกำหนด</label>
                        <input 
                            type="date" 
                            style={crudStyles.input} 
                            value={formData.dueDate}
                            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                        />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={crudStyles.label}>Order ID (อ้างอิง)</label>
                        <input 
                            type="text" 
                            style={crudStyles.input} 
                            placeholder="เช่น ORD-2026-0001"
                            value={formData.orderId}
                            onChange={(e) => setFormData({...formData, orderId: e.target.value})}
                        />
                    </div>
                </div>
            </BaseModal>
        </CrudLayout>
    );
}
