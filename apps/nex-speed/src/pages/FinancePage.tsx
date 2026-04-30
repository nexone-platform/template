'use client';

import React, { useState, useEffect } from 'react';
import StatusDropdown from '@/components/StatusDropdown';
import { Receipt, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api, Invoice, RevenueMonthly } from '@/services/api';

const statusLabels: Record<string, string> = { paid: 'ชำระแล้ว', pending: '⏳ รอชำระ', overdue: 'เกินกำหนด', draft: '📝 แบบร่าง' };
const statusColors: Record<string, string> = { paid: 'completed', pending: 'pending', overdue: 'active', draft: 'inactive' };

export default function FinancePage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [revenue, setRevenue] = useState<RevenueMonthly[]>([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.getInvoices(), api.getRevenue()]).then(([inv, rev]) => {
            setInvoices(inv || []); setRevenue(rev || []); setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const filtered = invoices.filter(inv => filter === 'all' || inv.status === filter);
    const totalPaid = invoices.filter(i => i.status === 'paid').reduce((a, i) => a + i.amount, 0);
    const totalPending = invoices.filter(i => i.status === 'pending').reduce((a, i) => a + i.amount, 0);
    const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((a, i) => a + i.amount, 0);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

    return (
        <div className="animate-fade-in">

            <div className="kpi-grid" style={{ marginBottom: '20px' }}>
                {[
                    { title: 'ชำระแล้ว', value: `฿${totalPaid.toLocaleString()}`, color: 'green', icon: CheckCircle },
                    { title: 'รอชำระ', value: `฿${totalPending.toLocaleString()}`, color: 'amber', icon: Receipt },
                    { title: 'เกินกำหนด', value: `฿${totalOverdue.toLocaleString()}`, color: 'red', icon: AlertTriangle },
                    { title: 'Invoice ทั้งหมด', value: invoices.length, color: 'blue', icon: DollarSign },
                ].map((kpi, i) => (
                    <div key={i} className={`kpi-card ${kpi.color}`}>
                        <div className="kpi-card-header"><span className="kpi-card-title">{kpi.title}</span><div className={`kpi-card-icon ${kpi.color}`}><kpi.icon size={18} /></div></div>
                        <div className="kpi-card-value">{kpi.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="card">
                    <div className="card-header"><div><div className="card-title">📊 รายได้ vs ต้นทุน</div></div></div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={revenue}>
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                            <Tooltip formatter={(v) => `฿${Number(v).toLocaleString()}`} contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                            <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="รายได้" />
                            <Bar dataKey="cost" fill="#f59e0b" radius={[4, 4, 0, 0]} name="ต้นทุน" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="card">
                    <div className="card-header"><div><div className="card-title">💰 กำไรรายเดือน</div></div></div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={revenue}>
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                            <Tooltip formatter={(v) => `฿${Number(v).toLocaleString()}`} contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                            <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} name="กำไร" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {[{ key: 'all', label: 'ทั้งหมด' }, { key: 'paid', label: 'ชำระแล้ว' }, { key: 'pending', label: '⏳ รอชำระ' }, { key: 'overdue', label: 'เกินกำหนด' }].map(f => (
                    <button key={f.key} className={`btn ${filter === f.key ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilter(f.key)}>{f.label}</button>
                ))}
            </div>

            <div className="card">
                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead><tr><th>Invoice</th><th>ลูกค้า</th><th>จำนวน</th><th>สถานะ</th><th>วันออก</th><th>ครบกำหนด</th><th>Order</th></tr></thead>
                        <tbody>
                            {filtered.map(inv => (
                                <tr key={inv.id}>
                                    <td><span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{inv.id}</span></td>
                                    <td style={{ fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.customerName}</td>
                                    <td style={{ fontWeight: 700 }}>฿{inv.amount.toLocaleString()}</td>
                                    <td><StatusDropdown 
                    value={inv.status}
                    onChange={async (newValue: any) => {
                        setInvoices(prev => prev.map(x => x.id === inv.id ? { ...x, status: newValue } : x));
                        try { await api.updateInvoice(inv.id, { ...inv, status: newValue } as any); } catch(err) { console.error(err); }
                    }}
                    options={Object.keys(statusLabels).map(k => ({ 
                        value: k, 
                        label: statusLabels[k as keyof typeof statusLabels], 
                        color: (['active','completed','available', 'approved'].includes(k) ? 'green' : (['inactive','cancelled', 'rejected'].includes(k) ? 'red' : 'yellow')) as any
                    }))}
                /></td>
                                    <td>{inv.issueDate}</td>
                                    <td>{inv.dueDate || '-'}</td>
                                    <td>{inv.orderId || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
