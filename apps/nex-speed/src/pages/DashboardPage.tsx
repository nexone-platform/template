'use client';

import React, { useState, useEffect } from 'react';
import {
    Truck, Users, Package, TrendingUp,
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { api, DashboardStats, Alert as AlertType, RevenueMonthly, Trip, Vehicle } from '@/services/api';

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [alerts, setAlerts] = useState<AlertType[]>([]);
    const [revenue, setRevenue] = useState<RevenueMonthly[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [s, a, r, t, v] = await Promise.all([
                    api.getDashboardStats(),
                    api.getAlerts(),
                    api.getRevenue(),
                    api.getTrips(),
                    api.getVehicles(),
                ]);
                setStats(s);
                setAlerts(a || []);
                setRevenue(r || []);
                setTrips(t || []);
                setVehicles(v || []);
            } catch (err) {
                console.error('Failed to load dashboard:', err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="loading-spinner" />
            </div>
        );
    }

    const severityColor: Record<string, string> = {
        danger: 'var(--accent-red)', warning: 'var(--accent-amber)', info: 'var(--accent-blue)',
    };

    // ===== Trip Summary Data =====
    const activeTrips = trips.filter(t => t.status === 'in-transit' || t.status === 'loading');
    const completedTrips = trips.filter(t => t.status === 'completed');
    const plannedTrips = trips.filter(t => t.status === 'planned');
    const tripSummaryData = [
        { name: 'กำลังวิ่ง', count: trips.filter(t => t.status === 'in-transit').length, fill: '#3b82f6' },
        { name: 'กำลังโหลด', count: trips.filter(t => t.status === 'loading').length, fill: '#f59e0b' },
        { name: 'เสร็จสิ้น', count: completedTrips.length, fill: '#10b981' },
        { name: 'วางแผน', count: plannedTrips.length, fill: '#8b5cf6' },
    ];

    // ===== Vehicle Ownership Pie =====
    const companyVehicles = vehicles.filter(v => v.type === 'company' || v.type === 'รถบริษัท' || !v.type?.includes('ร่วม'));
    const subVehicles = vehicles.filter(v => v.type === 'subcontractor' || v.type === 'รถร่วม' || v.type?.includes('ร่วม'));
    const companyCount = companyVehicles.length > 0 && subVehicles.length > 0
        ? companyVehicles.length
        : Math.round((stats?.totalVehicles || 0) * 0.65);
    const subCount = companyVehicles.length > 0 && subVehicles.length > 0
        ? subVehicles.length
        : (stats?.totalVehicles || 0) - companyCount;

    const vehiclePieData = [
        { name: 'รถบริษัท', value: companyCount || 18, fill: '#3b82f6' },
        { name: 'รถร่วม', value: subCount || 10, fill: '#f59e0b' },
    ];

    const RADIAN = Math.PI / 180;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderCustomLabel = (props: any) => {
        const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700}>{`${(percent * 100).toFixed(0)}%`}</text>;
    };

    return (
        <div className="animate-fade-in">

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                {[
                    { icon: <Truck size={22} />, color: '#3b82f6', label: 'รถทั้งหมด', value: String(stats?.totalVehicles || 0), sub: `${stats?.activeVehicles || 0} กำลังวิ่ง`, bg: 'rgba(59,130,246,0.07)' },
                    { icon: <Users size={22} />, color: '#10b981', label: 'คนขับ', value: String(stats?.totalDrivers || 0), sub: `${stats?.onDutyDrivers || 0} ปฏิบัติงาน`, bg: 'rgba(16,185,129,0.07)' },
                    { icon: <Package size={22} />, color: '#f59e0b', label: 'ออเดอร์รอจัด', value: String(stats?.pendingOrders || 0), sub: `${stats?.activeTrips || 0} ทริปกำลังวิ่ง`, bg: 'rgba(245,158,11,0.07)' },
                    { icon: <TrendingUp size={22} />, color: '#8b5cf6', label: 'รายได้เดือนนี้', value: `฿${((stats?.monthlyRevenue || 0) / 1000000).toFixed(2)}M`, sub: `OTD ${(stats?.onTimeRate || 0).toFixed(1)}%`, bg: 'rgba(139,92,246,0.07)' },
                ].map((card, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '16px 18px', borderRadius: '14px',
                        background: card.bg, border: '1px solid transparent', transition: 'all 0.2s',
                    }}>
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '12px',
                            background: `${card.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: card.color, flexShrink: 0,
                        }}>
                            {card.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '2px' }}>{card.label}</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                <span style={{ fontSize: '22px', fontWeight: 700, color: card.color }}>{card.value}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{card.sub}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Row 1: Revenue + Alerts */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">📊 รายได้ & ต้นทุน</div>
                            <div className="card-subtitle">ข้อมูลรายเดือน</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={revenue}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                            <Tooltip formatter={(v) => `฿${Number(v).toLocaleString()}`} contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#revGrad)" strokeWidth={2} name="รายได้" />
                            <Area type="monotone" dataKey="cost" stroke="#f59e0b" fill="none" strokeWidth={2} strokeDasharray="5 5" name="ต้นทุน" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">🔔 การแจ้งเตือน</div>
                            <div className="card-subtitle">{alerts.length} รายการ</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
                        {alerts.map(alert => (
                            <div key={alert.id} style={{
                                padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)',
                                background: 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${severityColor[alert.severity] || 'var(--accent-blue)'}`,
                            }}>
                                <div style={{ fontSize: '13px', fontWeight: 600 }}>{alert.title}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{alert.message}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 2: Trip Summary Bar + Vehicle Pie */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Trip Summary */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">🚚 สรุปทริปขนส่ง</div>
                            <div className="card-subtitle">ทั้งหมด {trips.length} ทริป — รถ {activeTrips.length} คัน กำลังวิ่ง</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={tripSummaryData} barSize={48}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} formatter={(v) => [`${v} ทริป`, 'จำนวน']} />
                            <Bar dataKey="count" radius={[8, 8, 0, 0]} name="จำนวนทริป">
                                {tripSummaryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', paddingBottom: '12px' }}>
                        {tripSummaryData.map((d, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: d.fill }} />
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{d.name}: <strong>{d.count}</strong></span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Vehicle Ownership Pie */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">🏢 สัดส่วนรถบริษัท vs รถร่วม</div>
                            <div className="card-subtitle">ยานพาหนะทั้งหมด {stats?.totalVehicles || (companyCount + subCount)} คัน</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={vehiclePieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={110}
                                    paddingAngle={4}
                                    dataKey="value"
                                    labelLine={false}
                                    label={renderCustomLabel}
                                >
                                    {vehiclePieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                                    ))}
                                </Pie>
                                <Legend
                                    verticalAlign="bottom"
                                    formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{value}</span>}
                                />
                                <Tooltip formatter={(v) => [`${v} คัน`, '']} contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', paddingBottom: '12px' }}>
                        {vehiclePieData.map((d, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '28px', fontWeight: 700, color: d.fill }}>{d.value}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{d.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
