'use client';

import React, { useState, useEffect } from 'react';
import {
    DollarSign, TrendingUp, TrendingDown, Fuel, Route,
    Users, BarChart3, AlertCircle, Truck, RefreshCcw, Filter
} from 'lucide-react';
import { api, Trip } from '@/services/api';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
    CartesianGrid, LineChart, Line, Cell, PieChart, Pie, Legend,
} from 'recharts';

const API_BASE = typeof window !== 'undefined'
    ? `http://${window.location.hostname}:8081/api/v1`
    : 'http://localhost:8081/api/v1';

// ── Cost calculation helpers ──────────────────────────────────────────────────
const FUEL_RATE   = 0.35; // L/km
const FUEL_PRICE  = 33.5; // THB/L
const TOLL_RATE   = 0.8;  // THB/km
const DRIVER_RATE = 2.5;  // THB/km
const REVENUE_MULTIPLIER = 1.25; // 25% margin

interface TripCost {
    tripId: string;
    origin: string;
    destination: string;
    distance: number;
    fuelCost: number;
    tollCost: number;
    driverWage: number;
    totalCost: number;
    revenue: number;
    profit: number;
    profitMargin: number;
    costPerKm: number;
    status: string;
    driverId: string;
}

function calcTripCost(trip: Trip): TripCost {
    const distance = trip.distance || 0;
    const fuelCost    = Math.round(distance * FUEL_RATE * FUEL_PRICE);
    const tollCost    = Math.round(distance * TOLL_RATE);
    const driverWage  = Math.round(distance * DRIVER_RATE);
    const totalCost   = fuelCost + tollCost + driverWage;
    const revenue     = Math.round(totalCost * REVENUE_MULTIPLIER);
    const profit      = revenue - totalCost;
    const profitMargin = totalCost > 0 ? Math.round((profit / revenue) * 100) : 0;
    const costPerKm   = distance > 0 ? Math.round(totalCost / distance) : 0;

    return {
        tripId: trip.id,
        origin: trip.origin,
        destination: trip.destination,
        distance,
        fuelCost, tollCost, driverWage, totalCost,
        revenue, profit, profitMargin, costPerKm,
        status: trip.status,
        driverId: trip.driverId,
    };
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>{label}</div>
            {payload.map((entry: any, i: number) => (
                <div key={i} style={{ fontSize: '13px', color: entry.color, fontWeight: 600 }}>
                    {entry.name}: ฿{Number(entry.value).toLocaleString()}
                </div>
            ))}
        </div>
    );
}

// ── Stat Mini Card ────────────────────────────────────────────────────────────
function MiniStat({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
    return (
        <div style={{ padding: '14px', background: `${color}0d`, borderRadius: '10px', border: `1px solid ${color}20`, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: '17px', fontWeight: 700, color }}>{value}</div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TripCostPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(false);
    const [sortCol, setSortCol] = useState<keyof TripCost>('profit');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [filterStatus, setFilterStatus] = useState('all');

    const loadTrips = async () => {
        setLoading(true);
        try {
            const data = await api.getTrips();
            setTrips(data || []);
        } catch {}
        setLoading(false);
    };

    useEffect(() => { loadTrips(); }, []);

    const costs: TripCost[] = trips
        .filter(t => filterStatus === 'all' || t.status === filterStatus)
        .map(calcTripCost);

    const sorted = [...costs].sort((a, b) => {
        const av = a[sortCol] as number;
        const bv = b[sortCol] as number;
        return sortDir === 'desc' ? bv - av : av - bv;
    });

    // Aggregates
    const totalRevenue  = costs.reduce((s, c) => s + c.revenue, 0);
    const totalCost     = costs.reduce((s, c) => s + c.totalCost, 0);
    const totalProfit   = costs.reduce((s, c) => s + c.profit, 0);
    const totalFuel     = costs.reduce((s, c) => s + c.fuelCost, 0);
    const avgMargin     = costs.length > 0 ? Math.round(costs.reduce((s, c) => s + c.profitMargin, 0) / costs.length) : 0;
    const avgCostPerKm  = costs.length > 0 ? Math.round(costs.reduce((s, c) => s + c.costPerKm, 0) / costs.length) : 0;

    // Chart data — top 10 by profit
    const top10 = [...sorted].slice(0, 10).map(c => ({
        name: `${c.origin.slice(0, 6)}→${c.destination.slice(0, 6)}`,
        revenue: c.revenue,
        cost: c.totalCost,
        profit: c.profit,
    }));

    // Cost breakdown pie
    const costBreakdown = costs.length > 0 ? [
        { name: 'น้ำมัน', value: costs.reduce((s, c) => s + c.fuelCost, 0), fill: '#f59e0b' },
        { name: 'ค่าทางด่วน', value: costs.reduce((s, c) => s + c.tollCost, 0), fill: '#64748b' },
        { name: 'ค่าแรงขับ', value: costs.reduce((s, c) => s + c.driverWage, 0), fill: '#8b5cf6' },
    ] : [];

    // Margin trend (mock weekly)
    const marginTrend = [
        { week: 'W1', margin: 22 }, { week: 'W2', margin: 24 },
        { week: 'W3', margin: 20 }, { week: 'W4', margin: avgMargin },
    ];

    const handleSort = (col: keyof TripCost) => {
        if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortCol(col); setSortDir('desc'); }
    };

    const thStyle = (col: keyof TripCost): React.CSSProperties => ({
        padding: '10px 12px', textAlign: 'left' as const, fontSize: '11px',
        fontWeight: 700, color: sortCol === col ? '#2563eb' : '#64748b',
        background: '#f8fafc', cursor: 'pointer', userSelect: 'none',
        borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap',
    });

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '10px' }}>
                <MiniStat label="รายได้รวม" value={`฿${(totalRevenue / 1000).toFixed(0)}K`} color="#2563eb" icon={<DollarSign size={18} />} />
                <MiniStat label="ต้นทุนรวม" value={`฿${(totalCost / 1000).toFixed(0)}K`} color="#f59e0b" icon={<BarChart3 size={18} />} />
                <MiniStat label="กำไรสุทธิ" value={`฿${(totalProfit / 1000).toFixed(0)}K`} color="#16a34a" icon={<TrendingUp size={18} />} />
                <MiniStat label="ค่าน้ำมันรวม" value={`฿${(totalFuel / 1000).toFixed(0)}K`} color="#dc2626" icon={<Fuel size={18} />} />
                <MiniStat label="Margin เฉลี่ย" value={`${avgMargin}%`} color="#8b5cf6" icon={<TrendingUp size={18} />} />
                <MiniStat label="ต้นทุน/กม." value={`฿${avgCostPerKm}`} color="#0891b2" icon={<Route size={18} />} />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '12px' }}>
                {/* Revenue vs Cost Bar */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">รายได้ vs ต้นทุน (Top 10 ทริป)</div>
                            <div className="card-subtitle">เรียงจากกำไรมากไปน้อย</div>
                        </div>
                    </div>
                    <div style={{ height: '220px', padding: '0 12px 12px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={top10} barSize={12}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                                <Tooltip content={<ChartTooltip />} />
                                <Legend formatter={v => <span style={{ color: '#64748b', fontSize: 11 }}>{v}</span>} />
                                <Bar dataKey="revenue" name="รายได้" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                                <Bar dataKey="cost" name="ต้นทุน" fill="#f87171" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Cost Breakdown Pie */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">สัดส่วนต้นทุน</div>
                    </div>
                    <div style={{ height: '220px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={costBreakdown} cx="50%" cy="45%" outerRadius={75} innerRadius={45} dataKey="value">
                                    {costBreakdown.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip formatter={(v: any) => `฿${Number(v).toLocaleString()}`} />
                                <Legend formatter={(v) => <span style={{ fontSize: '11px', color: '#64748b' }}>{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-header" style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                        <div className="card-title">วิเคราะห์ต้นทุน-กำไรรายทริป</div>
                        <div className="card-subtitle">{costs.length} ทริป · คลิก header เพื่อเรียง</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {['all', 'in-transit', 'delivered'].map(s => (
                            <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600, background: filterStatus === s ? '#2563eb' : '#f1f5f9', color: filterStatus === s ? '#fff' : '#64748b' }}>
                                {s === 'all' ? 'ทั้งหมด' : s === 'in-transit' ? 'วิ่งอยู่' : 'ส่งแล้ว'}
                            </button>
                        ))}
                        <button onClick={loadTrips} style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#64748b' }}>
                            <RefreshCcw size={13} />
                        </button>
                    </div>
                </div>
                <div className="data-table-wrapper" style={{ overflowX: 'auto' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>กำลังโหลด...</div>
                    ) : (
                        <table className="data-table" style={{ minWidth: '900px' }}>
                            <thead>
                                <tr>
                                    <th style={thStyle('tripId')}>ทริป</th>
                                    <th style={{ ...thStyle('origin'), cursor: 'default' }}>เส้นทาง</th>
                                    <th style={thStyle('distance')} onClick={() => handleSort('distance')}>ระยะ (กม) {sortCol === 'distance' ? (sortDir === 'desc' ? '↓' : '↑') : ''}</th>
                                    <th style={thStyle('fuelCost')} onClick={() => handleSort('fuelCost')}>ค่าน้ำมัน {sortCol === 'fuelCost' ? (sortDir === 'desc' ? '↓' : '↑') : ''}</th>
                                    <th style={thStyle('tollCost')} onClick={() => handleSort('tollCost')}>ค่าทางด่วน</th>
                                    <th style={thStyle('driverWage')} onClick={() => handleSort('driverWage')}>ค่าแรง</th>
                                    <th style={thStyle('totalCost')} onClick={() => handleSort('totalCost')}>ต้นทุนรวม {sortCol === 'totalCost' ? (sortDir === 'desc' ? '↓' : '↑') : ''}</th>
                                    <th style={thStyle('revenue')} onClick={() => handleSort('revenue')}>รายได้</th>
                                    <th style={thStyle('profit')} onClick={() => handleSort('profit')}>กำไร {sortCol === 'profit' ? (sortDir === 'desc' ? '↓' : '↑') : ''}</th>
                                    <th style={thStyle('profitMargin')} onClick={() => handleSort('profitMargin')}>Margin {sortCol === 'profitMargin' ? (sortDir === 'desc' ? '↓' : '↑') : ''}</th>
                                    <th style={thStyle('costPerKm')} onClick={() => handleSort('costPerKm')}>฿/กม.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map(c => (
                                    <tr key={c.tripId} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                                        onMouseLeave={e => (e.currentTarget.style.background = '')}
                                    >
                                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{c.tripId.slice(0, 8)}</td>
                                        <td style={{ padding: '10px 12px', fontSize: '12px' }}>
                                            <span style={{ color: '#64748b' }}>{c.origin.slice(0, 10)}</span>
                                            <span style={{ margin: '0 4px', color: '#cbd5e1' }}>→</span>
                                            <span style={{ color: '#64748b' }}>{c.destination.slice(0, 10)}</span>
                                        </td>
                                        <td style={{ padding: '10px 12px', fontSize: '12px', textAlign: 'right' }}>{c.distance}</td>
                                        <td style={{ padding: '10px 12px', fontSize: '12px', color: '#f59e0b', textAlign: 'right', fontWeight: 600 }}>฿{c.fuelCost.toLocaleString()}</td>
                                        <td style={{ padding: '10px 12px', fontSize: '12px', color: '#64748b', textAlign: 'right' }}>฿{c.tollCost.toLocaleString()}</td>
                                        <td style={{ padding: '10px 12px', fontSize: '12px', color: '#8b5cf6', textAlign: 'right' }}>฿{c.driverWage.toLocaleString()}</td>
                                        <td style={{ padding: '10px 12px', fontSize: '12px', color: '#dc2626', textAlign: 'right', fontWeight: 700 }}>฿{c.totalCost.toLocaleString()}</td>
                                        <td style={{ padding: '10px 12px', fontSize: '12px', color: '#2563eb', textAlign: 'right', fontWeight: 600 }}>฿{c.revenue.toLocaleString()}</td>
                                        <td style={{ padding: '10px 12px', fontSize: '13px', textAlign: 'right', fontWeight: 700, color: c.profit >= 0 ? '#16a34a' : '#dc2626' }}>
                                            {c.profit >= 0 ? '+' : ''}฿{c.profit.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                                                background: c.profitMargin >= 20 ? '#f0fdf4' : c.profitMargin >= 10 ? '#fffbeb' : '#fef2f2',
                                                color: c.profitMargin >= 20 ? '#16a34a' : c.profitMargin >= 10 ? '#d97706' : '#dc2626',
                                            }}>
                                                {c.profitMargin}%
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px 12px', fontSize: '12px', color: '#64748b', textAlign: 'right' }}>฿{c.costPerKm}</td>
                                    </tr>
                                ))}
                                {/* Summary Row */}
                                {costs.length > 0 && (
                                    <tr style={{ background: '#f0fdf4', fontWeight: 700 }}>
                                        <td colSpan={3} style={{ padding: '10px 12px', fontSize: '12px', color: '#15803d' }}>รวมทั้งหมด ({costs.length} ทริป)</td>
                                        <td style={{ padding: '10px 12px', fontSize: '12px', color: '#f59e0b', textAlign: 'right' }}>฿{totalFuel.toLocaleString()}</td>
                                        <td style={{ padding: '10px 12px', fontSize: '12px', color: '#64748b', textAlign: 'right' }}>฿{costs.reduce((s,c)=>s+c.tollCost,0).toLocaleString()}</td>
                                        <td style={{ padding: '10px 12px', fontSize: '12px', color: '#8b5cf6', textAlign: 'right' }}>฿{costs.reduce((s,c)=>s+c.driverWage,0).toLocaleString()}</td>
                                        <td style={{ padding: '10px 12px', fontSize: '12px', color: '#dc2626', textAlign: 'right' }}>฿{totalCost.toLocaleString()}</td>
                                        <td style={{ padding: '10px 12px', fontSize: '12px', color: '#2563eb', textAlign: 'right' }}>฿{totalRevenue.toLocaleString()}</td>
                                        <td style={{ padding: '10px 12px', fontSize: '13px', color: '#16a34a', textAlign: 'right' }}>฿{totalProfit.toLocaleString()}</td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right' }}><span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '8px', fontSize: '12px' }}>{avgMargin}%</span></td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right' }}></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
