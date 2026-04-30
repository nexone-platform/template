'use client';

import React, { useState } from 'react';
import { Warehouse, Map, Search, Box, ChevronRight, Layers, AlertTriangle } from 'lucide-react';

interface LocationNode {
    id: string;
    name: string;
    type: 'zone' | 'rack' | 'bin';
    capacity: number;
    usage: number;
    children?: LocationNode[];
    items?: {sku: string, name: string, qty: number}[];
}

const WAREHOUSE_MAP: LocationNode[] = [
    {
        id: 'Z-A', name: 'Zone A: ของเหลว/น้ำมัน', type: 'zone', capacity: 1000, usage: 850,
        children: [
            { id: 'R-A1', name: 'Rack A1', type: 'rack', capacity: 500, usage: 480, items: [
                {sku: 'SKU-1001', name: 'น้ำมันเครื่อง 5W-40 Synthetic', qty: 250},
                {sku: 'SKU-1011', name: 'น้ำมันเบรค DOT4', qty: 230}
            ]},
            { id: 'R-A2', name: 'Rack A2', type: 'rack', capacity: 500, usage: 370, items: [] },
        ]
    },
    {
        id: 'Z-B', name: 'Zone B: อะไหล่สำรอง', type: 'zone', capacity: 2000, usage: 1200,
        children: [
            { id: 'R-B1', name: 'Rack B1', type: 'rack', capacity: 1000, usage: 900, items: [] },
            { id: 'R-B2', name: 'Rack B2', type: 'rack', capacity: 1000, usage: 300, items: [] },
        ]
    },
    {
        id: 'Z-C', name: 'Zone C: ยางรถบรรทุก', type: 'zone', capacity: 500, usage: 480,
        children: [
            { id: 'F-C1', name: 'Floor C1', type: 'rack', capacity: 250, usage: 250, items: [] },
            { id: 'F-C2', name: 'Floor C2', type: 'rack', capacity: 250, usage: 230, items: [] },
        ]
    }
];

export default function LocationManagementPage() {
    const [selectedZone, setSelectedZone] = useState<LocationNode | null>(WAREHOUSE_MAP[0]);
    const [selectedRack, setSelectedRack] = useState<LocationNode | null>(null);

    const getOccupancyColor = (percent: number) => {
        if (percent >= 90) return '#ef4444'; // Red
        if (percent >= 70) return '#f59e0b'; // Amber
        return '#10b981'; // Green
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Warehouse size={24} color="#3b82f6" />
                        ผังคลังสินค้า & สถานที่เก็บ (Location Management)
                    </h2>
                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px' }}>จัดการ Zone, Rack และ Bin พร้อมตรวจสอบพื้นที่ว่าง (Capacity)</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 10 }} />
                        <input type="text" placeholder="ค้นหา Location ID..." style={{ padding: '8px 16px 8px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '20px' }}>
                {/* Left Panel: Warehouse Zones List */}
                <div className="card" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Map size={18} /> Zone ทั้งหมด
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {WAREHOUSE_MAP.map(zone => {
                            const percent = (zone.usage / zone.capacity) * 100;
                            const isSelected = selectedZone?.id === zone.id;
                            return (
                                <div 
                                    key={zone.id} 
                                    onClick={() => { setSelectedZone(zone); setSelectedRack(null); }}
                                    style={{ 
                                        padding: '16px', borderRadius: '12px', border: `1px solid ${isSelected ? '#3b82f6' : '#e2e8f0'}`,
                                        background: isSelected ? '#eff6ff' : '#fff', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{zone.name}</div>
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: getOccupancyColor(percent) }}>
                                            {percent.toFixed(1)}%
                                        </div>
                                    </div>
                                    <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                                        <div style={{ width: `${percent}%`, height: '100%', background: getOccupancyColor(percent), borderRadius: '99px' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: '#64748b' }}>
                                        <span>ใช้ไป: {zone.usage}</span>
                                        <span>พื้นที่รวม: {zone.capacity}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Panel: Zone Canvas Details */}
                <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                    {selectedZone ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px' }}>
                                        {selectedZone.id.split('-')[1]}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{selectedZone.name}</h3>
                                        <p style={{ fontSize: '13px', color: '#64748b' }}>มีทั้งหมด {selectedZone.children?.length || 0} Racks / โซนย่อย</p>
                                    </div>
                                </div>
                                <button className="btn btn-secondary btn-sm">+ เพิ่ม Rack</button>
                            </div>

                            {/* Racks Display */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                {selectedZone.children?.map(rack => {
                                    const percent = (rack.usage / rack.capacity) * 100;
                                    const active = selectedRack?.id === rack.id;
                                    return (
                                        <div 
                                            key={rack.id} 
                                            onClick={() => setSelectedRack(rack)}
                                            style={{ 
                                                border: `2px solid ${active ? '#3b82f6' : '#e2e8f0'}`, borderRadius: '12px', padding: '16px',
                                                cursor: 'pointer', background: active ? '#f8fafc' : '#fff', position: 'relative'
                                            }}
                                        >
                                            {percent >= 95 && <AlertTriangle size={16} color="#ef4444" style={{ position: 'absolute', right: 16, top: 16 }} />}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                                <Layers size={18} color="#64748b" />
                                                <span style={{ fontWeight: 600 }}>{rack.name}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <div>
                                                    <div style={{ fontSize: '24px', fontWeight: 700, lineHeight: 1 }}>{rack.usage} <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>/ {rack.capacity}</span></div>
                                                </div>
                                                <div style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: `${getOccupancyColor(percent)}20`, color: getOccupancyColor(percent) }}>
                                                    {percent.toFixed(0)}%
                                                </div>
                                            </div>
                                            <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                                                <div style={{ width: `${percent}%`, height: '100%', background: getOccupancyColor(percent) }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Selected Rack Items List */}
                            {selectedRack ? (
                                <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#334155' }}>
                                        <Box size={16} /> 
                                        <span style={{ fontWeight: 600, fontSize: '14px' }}>สินค้าใน {selectedRack.name}</span>
                                    </div>
                                    {selectedRack.items && selectedRack.items.length > 0 ? (
                                        <table className="data-table" style={{ background: 'transparent' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ background: 'transparent', padding: '8px 0' }}>SKU</th>
                                                    <th style={{ background: 'transparent', padding: '8px 0' }}>ชื่อสินค้า</th>
                                                    <th style={{ background: 'transparent', padding: '8px 0', textAlign: 'right' }}>จำนวน</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedRack.items.map(item => (
                                                    <tr key={item.sku}>
                                                        <td style={{ padding: '12px 0', fontWeight: 600, fontFamily: 'monospace', color: '#475569' }}>{item.sku}</td>
                                                        <td style={{ padding: '12px 0' }}>{item.name}</td>
                                                        <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 700 }}>{item.qty}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>ไม่มีสินค้าใน Location นี้ (พื้นที่ว่าง)</div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                    คลิกที่ Rack เพื่อดูรายการสินค้าภายใน
                                </div>
                            )}

                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>กรุณาเลือก Zone จากเมนูด้านซ้าย</div>
                    )}
                </div>
            </div>
        </div>
    );
}
