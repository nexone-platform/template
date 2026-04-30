'use client';

import React, { useState } from 'react';
import { Package, ArrowDownToLine, ArrowUpFromLine, RefreshCcw, Filter, Search } from 'lucide-react';

interface StockItem {
    sku: string;
    name: string;
    category: string;
    location: string;
    qty: number;
    unit: string;
    status: 'good' | 'low' | 'out';
}

const INV_DATA: StockItem[] = [
    { sku: 'SKU-1001', name: 'น้ำมันเครื่อง 5W-40 Synthetic', category: 'ของเหลว/น้ำมัน', location: 'Zone A - R1', qty: 25, unit: 'แกลลอน', status: 'good' },
    { sku: 'SKU-1002', name: 'กรองน้ำมันเครื่อง Toyota', category: 'อะไหล่ยนต์', location: 'Zone B - R4', qty: 154, unit: 'ชิ้น', status: 'good' },
    { sku: 'SKU-1003', name: 'ผ้าเบรคหน้า Isuzu D-MAX', category: 'อะไหล่ยนต์', location: 'Zone B - R2', qty: 8, unit: 'ชุด', status: 'low' },
    { sku: 'SKU-1004', name: 'หลอดไฟหน้า H4 12V', category: 'ระบบไฟ', location: 'Zone C - R1', qty: 89, unit: 'หลอด', status: 'good' },
    { sku: 'SKU-1005', name: 'ยางรถบรรทุก 295/80R22.5', category: 'ยาง', location: 'Zone D - Floor', qty: 0, unit: 'เส้น', status: 'out' },
];

export default function InventoryControlPage() {
    const [search, setSearch] = useState('');
    const [items] = useState<StockItem[]>(INV_DATA);

    const filtered = items.filter(
        i => i.sku.toLowerCase().includes(search.toLowerCase()) || 
             i.name.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'good': return <span style={{ background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>ปกติ</span>;
            case 'low': return <span style={{ background: '#fef08a', color: '#b45309', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>ใกล้หมด</span>;
            case 'out': return <span style={{ background: '#fecaca', color: '#dc2626', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>หมดสต๊อก</span>;
        }
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Package size={20} color="#2563eb" />
                        Inventory Control (จัดการสต๊อกสินค้า)
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>รับสินค้าเข้า (GR), เบิกสินค้าออก (GI), โอนย้ายระหว่าง Zone</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ArrowDownToLine size={16} /> รับเข้า (GR)
                    </button>
                    <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ArrowUpFromLine size={16} /> เบิกออก (GI)
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', marginBottom: 0 }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="ค้นหารหัส SKU หรือชื่อสินค้า..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ 
                                width: '100%', padding: '8px 12px 8px 34px', 
                                border: '1px solid var(--border-color)', borderRadius: '8px',
                                fontSize: '13px', outline: 'none'
                            }}
                        />
                    </div>
                    <div className="card-actions">
                        <button className="btn btn-secondary btn-sm"><Filter size={14} /> Filter</button>
                        <button className="btn btn-secondary btn-sm"><RefreshCcw size={14} /> Refresh</button>
                    </div>
                </div>
                
                <div className="data-table-wrapper" style={{ minHeight: '400px' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>รหัสสินค้า (SKU)</th>
                                <th>ชื่อสินค้า</th>
                                <th>หมวดหมู่</th>
                                <th>ตำแหน่ง (Location)</th>
                                <th style={{ textAlign: 'right' }}>จำนวนคงเหลือ</th>
                                <th>หน่วย</th>
                                <th>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                                        <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                                        ไม่พบข้อมูลสินค้า
                                    </td>
                                </tr>
                            ) : filtered.map(item => (
                                <tr key={item.sku}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#475569' }}>{item.sku}</td>
                                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                                    <td><span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', color: '#64748b' }}>{item.category}</span></td>
                                    <td style={{ color: '#0f172a', fontWeight: 600 }}>{item.location}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '14px', color: item.qty === 0 ? '#dc2626' : '#0f172a' }}>{item.qty}</td>
                                    <td>{item.unit}</td>
                                    <td>{getStatusBadge(item.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
