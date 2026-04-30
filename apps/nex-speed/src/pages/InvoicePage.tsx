'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    FileText, CheckCircle2, Clock, AlertCircle, DollarSign,
    Plus, Eye, Download, Filter, Search, RefreshCcw, Zap, X
} from 'lucide-react';
import { api, Trip, Invoice } from '@/services/api';

const API_BASE = typeof window !== 'undefined'
    ? `http://${window.location.hostname}:8081/api/v1`
    : 'http://localhost:8081/api/v1';

type InvStatus = 'all' | 'draft' | 'sent' | 'paid' | 'overdue';

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
    draft:   { label: 'ร่าง', color: '#64748b', bg: '#f1f5f9' },
    sent:    { label: 'ส่งแล้ว', color: '#2563eb', bg: '#eff6ff' },
    paid:    { label: 'ชำระแล้ว', color: '#16a34a', bg: '#f0fdf4' },
    overdue: { label: 'เกินกำหนด', color: '#dc2626', bg: '#fef2f2' },
    cancelled: { label: 'ยกเลิก', color: '#94a3b8', bg: '#f8fafc' },
};

// ── Generate Invoice Number ───────────────────────────────────────────────────
function genInvoiceNo(): string {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const seq = String(Math.floor(Math.random() * 9000) + 1000);
    return `INV-${yy}${mm}-${seq}`;
}

// ── Auto-generate Invoice from completed Trip + POD ───────────────────────────
async function autoGenerateInvoice(trip: Trip): Promise<Invoice | null> {
    // Calculate costs
    const distance = trip.distance || 0;
    const fuelRate = 0.35;  // L/km
    const fuelPrice = 33.5; // THB/L
    const fuelCost = Math.round(distance * fuelRate * fuelPrice);
    const tollCost = Math.round(distance * 0.8);
    const driverWage = Math.round(distance * 2.5);
    const totalCost = fuelCost + tollCost + driverWage;
    const revenue = Math.round(totalCost * 1.25); // 25% margin

    const payload = {
        invoiceNo: genInvoiceNo(),
        customerName: trip.origin + ' → ' + trip.destination,
        tripId: trip.id,
        orderId: trip.orderId,
        amount: revenue,
        tax: Math.round(revenue * 0.07),
        totalAmount: Math.round(revenue * 1.07),
        status: 'draft',
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        notes: `Auto-generated จากทริป ${trip.id} — ระยะทาง ${distance} กม.`,
    };

    try {
        const res = await fetch(`${API_BASE}/invoices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const json = await res.json();
        return json.data as Invoice;
    } catch {
        return null;
    }
}

// ── Invoice Row ───────────────────────────────────────────────────────────────
function InvoiceRow({ inv, onView }: { inv: Invoice; onView: (inv: Invoice) => void }) {
    const s = STATUS_LABEL[inv.status] || STATUS_LABEL.draft;
    return (
        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
            <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px', fontWeight: 600 }}>
                {(inv as any).invoiceNo || inv.id.slice(0, 12).toUpperCase()}
            </td>
            <td style={{ padding: '12px 16px', fontSize: '13px' }}>{inv.customerName}</td>
            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>
                {inv.issueDate}
            </td>
            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>
                {inv.dueDate || '—'}
            </td>
            <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                ฿{Number(inv.amount).toLocaleString()}
            </td>
            <td style={{ padding: '12px 16px' }}>
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                    background: s.bg, color: s.color,
                }}>
                    {s.label}
                </span>
            </td>
            <td style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => onView(inv)} style={{ background: '#eff6ff', border: 'none', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', color: '#2563eb', fontSize: '12px', fontWeight: 600 }}>
                        <Eye size={12} style={{ display: 'inline', marginRight: 3 }} /> ดู
                    </button>
                    <button style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', color: '#64748b', fontSize: '12px' }}>
                        <Download size={12} style={{ display: 'inline' }} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ── Invoice Detail Modal ──────────────────────────────────────────────────────
function InvoiceModal({ inv, onClose }: { inv: Invoice; onClose: () => void }) {
    const s = STATUS_LABEL[inv.status] || STATUS_LABEL.draft;
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
            <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '560px', padding: '28px', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Invoice</div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>{(inv as any).invoiceNo || inv.id.slice(0, 12).toUpperCase()}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>{s.label}</span>
                        <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}><X size={16} /></button>
                    </div>
                </div>

                {/* Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                    {[
                        { label: 'ลูกค้า', value: inv.customerName },
                        { label: 'รหัสทริป', value: inv.tripId || '—' },
                        { label: 'วันที่ออก', value: inv.issueDate },
                        { label: 'ครบกำหนด', value: inv.dueDate || '—' },
                    ].map((item, i) => (
                        <div key={i}>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{item.label}</div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{item.value}</div>
                        </div>
                    ))}
                </div>

                {/* Amount Table */}
                <div style={{ borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '20px' }}>
                    {[
                        { label: 'มูลค่าบริการ', amount: inv.amount },
                        { label: 'ภาษีมูลค่าเพิ่ม 7%', amount: (inv as any).tax || Math.round(inv.amount * 0.07) },
                    ].map((row, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>{row.label}</span>
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>฿{Number(row.amount).toLocaleString()}</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: '#eff6ff' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e40af' }}>รวมทั้งสิ้น</span>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#1e40af' }}>฿{Number((inv as any).totalAmount || inv.amount).toLocaleString()}</span>
                    </div>
                </div>

                {inv.notes && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#92400e', marginBottom: '16px' }}>
                        📝 {inv.notes}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={{ padding: '9px 20px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>ปิด</button>
                    <button style={{ padding: '9px 20px', border: 'none', borderRadius: '8px', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                        <Download size={13} style={{ display: 'inline', marginRight: 4 }} /> ดาวน์โหลด PDF
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function InvoicePage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(false);
    const [autoLoading, setAutoLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<InvStatus>('all');
    const [selectedInv, setSelectedInv] = useState<Invoice | null>(null);
    const [autoSuccess, setAutoSuccess] = useState(0);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [invData, tripData] = await Promise.all([
                api.getInvoices(),
                api.getTrips(),
            ]);
            setInvoices(invData || []);
            setTrips((tripData || []).filter((t: Trip) => t.status === 'delivered'));
        } catch {}
        setLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleAutoGenerate = async () => {
        // Find delivered trips without invoices
        const tripIdsWithInv = new Set(invoices.map(inv => inv.tripId).filter(Boolean));
        const eligible = trips.filter(t => !tripIdsWithInv.has(t.id));

        if (eligible.length === 0) {
            alert('ไม่มีทริปที่ส่งสำเร็จและยังไม่มีใบแจ้งหนี้');
            return;
        }

        setAutoLoading(true);
        let success = 0;
        for (const trip of eligible.slice(0, 10)) {
            const inv = await autoGenerateInvoice(trip);
            if (inv) success++;
        }
        setAutoSuccess(success);
        await loadData();
        setAutoLoading(false);
        setTimeout(() => setAutoSuccess(0), 4000);
    };

    const filtered = invoices.filter(inv => {
        const matchSearch = !search || inv.customerName.toLowerCase().includes(search.toLowerCase()) || ((inv as any).invoiceNo || '').includes(search);
        const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // Stats
    const totalAmount  = invoices.reduce((s, i) => s + Number(i.amount), 0);
    const paidAmount   = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0);
    const pendingCount = invoices.filter(i => i.status === 'sent' || i.status === 'draft').length;
    const overdueCount = invoices.filter(i => i.status === 'overdue').length;
    const noInvoiceCount = trips.filter(t => !invoices.some(inv => inv.tripId === t.id)).length;

    return (
        <div className="animate-fade-in">
            {/* Auto-generate Banner */}
            {autoSuccess > 0 && (
                <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: 600 }}>
                    <CheckCircle2 size={16} /> ออกใบแจ้งหนี้อัตโนมัติสำเร็จ {autoSuccess} รายการ!
                </div>
            )}

            {/* KPI */}
            <div className="kpi-grid" style={{ marginBottom: '16px' }}>
                {[
                    { icon: <FileText size={20} />, label: 'รวมทั้งหมด', value: `฿${totalAmount.toLocaleString()}`, cls: 'blue' },
                    { icon: <CheckCircle2 size={20} />, label: 'ชำระแล้ว', value: `฿${paidAmount.toLocaleString()}`, cls: 'green' },
                    { icon: <Clock size={20} />, label: 'รอชำระ', value: `${pendingCount} ใบ`, cls: 'amber' },
                    { icon: <AlertCircle size={20} />, label: 'เกินกำหนด', value: `${overdueCount} ใบ`, cls: 'purple' },
                ].map((k, i) => (
                    <div key={i} className={`kpi-card ${k.cls}`}>
                        <div className="kpi-card-header">
                            <span className="kpi-card-title">{k.label}</span>
                            <div className={`kpi-card-icon ${k.cls}`}>{k.icon}</div>
                        </div>
                        <div className="kpi-card-value">{k.value}</div>
                    </div>
                ))}
            </div>

            {/* Auto-generate Card */}
            {noInvoiceCount > 0 && (
                <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', borderRadius: '12px', border: '1px solid #bfdbfe', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Zap size={20} color="#2563eb" />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#1e40af', fontSize: '14px' }}>พบทริปที่ส่งสำเร็จ {noInvoiceCount} รายการ ยังไม่มีใบแจ้งหนี้</div>
                        <div style={{ fontSize: '12px', color: '#3b82f6' }}>ระบบสามารถออกใบแจ้งหนี้อัตโนมัติพร้อมคำนวณค่าบริการจากต้นทุนจริง</div>
                    </div>
                    <button
                        onClick={handleAutoGenerate}
                        disabled={autoLoading}
                        style={{ padding: '9px 18px', border: 'none', borderRadius: '8px', background: '#2563eb', color: '#fff', cursor: autoLoading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
                    >
                        {autoLoading ? '⏳ กำลังออก...' : <><Zap size={14} /> ออกอัตโนมัติ</>}
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="card">
                <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', padding: '16px 20px' }}>
                    <div>
                        <div className="card-title">ใบแจ้งหนี้ทั้งหมด</div>
                        <div className="card-subtitle">{filtered.length} รายการ</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Status Filter */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {(['all', 'draft', 'sent', 'paid', 'overdue'] as InvStatus[]).map(s => (
                                <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600, background: statusFilter === s ? '#2563eb' : '#f1f5f9', color: statusFilter === s ? '#fff' : '#64748b' }}>
                                    {s === 'all' ? 'ทั้งหมด' : STATUS_LABEL[s]?.label}
                                </button>
                            ))}
                        </div>
                        {/* Search */}
                        <div style={{ position: 'relative' }}>
                            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="ค้นหา..."
                                style={{ paddingLeft: '30px', paddingRight: '10px', height: '32px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
                            />
                        </div>
                        <button onClick={loadData} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, fontSize: '12px' }}>
                            <RefreshCcw size={13} />
                        </button>
                    </div>
                </div>

                <div className="data-table-wrapper">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>กำลังโหลด...</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            <FileText size={32} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
                            ไม่พบใบแจ้งหนี้
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    {['เลขที่ใบแจ้งหนี้', 'ลูกค้า', 'วันที่ออก', 'ครบกำหนด', 'มูลค่า', 'สถานะ', 'จัดการ'].map(h => (
                                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', background: '#f8fafc' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(inv => <InvoiceRow key={inv.id} inv={inv} onView={setSelectedInv} />)}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {selectedInv && <InvoiceModal inv={selectedInv} onClose={() => setSelectedInv(null)} />}
        </div>
    );
}
