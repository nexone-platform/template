'use client';

import React, { useState, useEffect } from 'react';
import {
    Clock, MapPin, DollarSign,
    ArrowUpRight, ArrowDownRight, Truck, Leaf, TrendingUp,
} from 'lucide-react';
import { api, AIInsight } from '@/services/api';
import {
    XAxis, YAxis, Tooltip, ResponsiveContainer,
    AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, Legend,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

// Mock analytics data
const laneAnalysis = [
    { lane: 'กรุงเทพ → ชลบุรี', revenue: 450000, cost: 280000, profit: 170000, trips: 85, margin: 37.8 },
    { lane: 'สระบุรี → แหลมฉบัง', revenue: 380000, cost: 250000, profit: 130000, trips: 62, margin: 34.2 },
    { lane: 'ลพบุรี → สมุทรปราการ', revenue: 320000, cost: 230000, profit: 90000, trips: 48, margin: 28.1 },
    { lane: 'รังสิต → ศรีราชา', revenue: 280000, cost: 180000, profit: 100000, trips: 55, margin: 35.7 },
    { lane: 'ปทุมธานี → โคราช', revenue: 520000, cost: 390000, profit: 130000, trips: 40, margin: 25.0 },
];

const otdTrend = [
    { week: 'W1', otd: 92, target: 95 },
    { week: 'W2', otd: 94, target: 95 },
    { week: 'W3', otd: 89, target: 95 },
    { week: 'W4', otd: 96, target: 95 },
    { week: 'W5', otd: 93, target: 95 },
    { week: 'W6', otd: 95, target: 95 },
    { week: 'W7', otd: 97, target: 95 },
    { week: 'W8', otd: 94, target: 95 },
];

const fuelConsumption = [
    { month: 'ม.ค.', liters: 45000, cost: 1575000, efficiency: 3.2 },
    { month: 'ก.พ.', liters: 42000, cost: 1470000, efficiency: 3.3 },
    { month: 'มี.ค.', liters: 48000, cost: 1680000, efficiency: 3.1 },
    { month: 'เม.ย.', liters: 40000, cost: 1400000, efficiency: 3.4 },
    { month: 'พ.ค.', liters: 44000, cost: 1540000, efficiency: 3.2 },
    { month: 'มิ.ย.', liters: 50000, cost: 1750000, efficiency: 3.0 },
];

const emptyMileData = [
    { name: 'วิ่งมีสินค้า', value: 78, fill: '#3b82f6' },
    { name: 'วิ่งเปล่า (Deadhead)', value: 15, fill: '#f59e0b' },
    { name: 'ขากลับ (Backhaul)', value: 7, fill: '#10b981' },
];

const operationalRadar = [
    { metric: 'OTD', value: 94, fullMark: 100 },
    { metric: 'Utilization', value: 82, fullMark: 100 },
    { metric: 'Fuel Eff.', value: 78, fullMark: 100 },
    { metric: 'Safety', value: 88, fullMark: 100 },
    { metric: 'Cost/km', value: 75, fullMark: 100 },
    { metric: 'Customer Sat.', value: 91, fullMark: 100 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: '10px', padding: '12px 16px', fontSize: '13px',
            }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</p>
                {payload.map((entry, i) => (
                    <p key={i} style={{ color: entry.color }}>
                        {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function AnalyticsPage() {
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [aiScore, setAiScore] = useState(0);

    useEffect(() => {
        api.getAIInsights().then(data => {
            setInsights(data.insights || []);
            setAiScore(data.score || 0);
        }).catch(() => { });
    }, []);

    return (
        <div className="animate-fade-in">

            {/* Summary KPI */}
            <div className="kpi-grid">
                <div className="kpi-card blue">
                    <div className="kpi-card-header">
                        <span className="kpi-card-title">On-Time Delivery (OTD)</span>
                        <div className="kpi-card-icon blue"><Clock size={20} /></div>
                    </div>
                    <div className="kpi-card-value">94.2%</div>
                    <span className="kpi-card-change up"><ArrowUpRight size={12} />+2.1%</span>
                </div>
                <div className="kpi-card green">
                    <div className="kpi-card-header">
                        <span className="kpi-card-title">Fleet Utilization</span>
                        <div className="kpi-card-icon green"><Truck size={20} /></div>
                    </div>
                    <div className="kpi-card-value">82%</div>
                    <span className="kpi-card-change up"><ArrowUpRight size={12} />+5%</span>
                </div>
                <div className="kpi-card amber">
                    <div className="kpi-card-header">
                        <span className="kpi-card-title">ต้นทุนเฉลี่ย/กม.</span>
                        <div className="kpi-card-icon amber"><DollarSign size={20} /></div>
                    </div>
                    <div className="kpi-card-value">฿18.5</div>
                    <span className="kpi-card-change down"><ArrowDownRight size={12} />-3.2%</span>
                </div>
                <div className="kpi-card purple">
                    <div className="kpi-card-header">
                        <span className="kpi-card-title">CO₂ ลดลง (ESG)</span>
                        <div className="kpi-card-icon purple"><Leaf size={20} /></div>
                    </div>
                    <div className="kpi-card-value">-12%</div>
                    <span style={{ fontSize: '12px', color: 'var(--accent-green)' }}>เทียบปีก่อน</span>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="dashboard-grid">
                {/* OTD Trend */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">OTD Trend</div>
                            <div className="card-subtitle">อัตราส่งตรงเวลา vs เป้าหมาย (95%)</div>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={otdTrend}>
                                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis domain={[85, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="otd" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6' }} name="OTD (%)" />
                                <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="เป้าหมาย" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Operational Radar */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Operational Scorecard</div>
                            <div className="card-subtitle">ภาพรวมประสิทธิภาพ</div>
                        </div>
                    </div>
                    <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={operationalRadar} cx="50%" cy="50%" outerRadius="70%">
                                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                                <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="dashboard-grid">
                {/* Fuel Consumption */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">ค่าน้ำมัน</div>
                            <div className="card-subtitle">ลิตรและค่าใช้จ่ายรายเดือน</div>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={fuelConsumption}>
                                <defs>
                                    <linearGradient id="gradFuel" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={2} fill="url(#gradFuel)" name="ค่าน้ำมัน (฿)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Empty Mile */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Empty Mile Analysis</div>
                            <div className="card-subtitle">ระยะทางวิ่งรถเปล่า & Backhaul</div>
                        </div>
                    </div>
                    <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={emptyMileData} cx="50%" cy="50%" innerRadius={65} outerRadius={105} paddingAngle={3} dataKey="value">
                                    {emptyMileData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Cost per Lane Table */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">Cost-per-Lane Analysis</div>
                        <div className="card-subtitle">วิเคราะห์ต้นทุนเชิงลึกในแต่ละเส้นทาง</div>
                    </div>
                </div>
                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>เส้นทาง (Lane)</th>
                                <th>ทริป</th>
                                <th>รายได้ (฿)</th>
                                <th>ต้นทุน (฿)</th>
                                <th>กำไร (฿)</th>
                                <th>Margin %</th>
                                <th>ประเมิน</th>
                            </tr>
                        </thead>
                        <tbody>
                            {laneAnalysis.map((lane, i) => (
                                <tr key={i}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <MapPin size={14} style={{ color: 'var(--accent-blue)' }} />
                                            <span style={{ fontWeight: 600 }}>{lane.lane}</span>
                                        </div>
                                    </td>
                                    <td>{lane.trips}</td>
                                    <td style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>฿{lane.revenue.toLocaleString()}</td>
                                    <td style={{ color: 'var(--accent-amber)' }}>฿{lane.cost.toLocaleString()}</td>
                                    <td style={{ color: 'var(--accent-green)', fontWeight: 700 }}>฿{lane.profit.toLocaleString()}</td>
                                    <td>
                                        <span style={{
                                            fontWeight: 700,
                                            color: lane.margin >= 35 ? 'var(--accent-green)' : lane.margin >= 28 ? 'var(--accent-amber)' : 'var(--accent-red)',
                                        }}>
                                            {lane.margin}%
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                                            background: lane.margin >= 35 ? 'rgba(16,185,129,0.1)' : lane.margin >= 28 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                            color: lane.margin >= 35 ? 'var(--accent-green)' : lane.margin >= 28 ? 'var(--accent-amber)' : 'var(--accent-red)',
                                        }}>
                                            {lane.margin >= 35 ? '🟢 ดีมาก' : lane.margin >= 28 ? '🟡 พอใช้' : 'ต้องปรับ'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* AI Insights Section */}
                <div className="card" style={{ marginTop: '20px' }}>
                    <div className="card-header">
                        <div>
                            <div className="card-title">🤖 AI Insights — คำแนะนำอัจฉริยะ</div>
                            <div className="card-subtitle">วิเคราะห์โดย NexSpeed AI v1.0</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="ai-score-ring" style={{ '--score': aiScore } as React.CSSProperties}>
                                <span>{aiScore}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Fleet Score</div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: aiScore >= 85 ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                                    {aiScore >= 85 ? '🟢 ดีมาก' : '🟡 ควรปรับปรุง'}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '12px', padding: '16px' }}>
                        {insights.map((insight, i) => (
                            <div key={i} className={`ai-insight-card priority-${insight.priority}`}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '16px' }}>
                                            {insight.type === 'fuel' ? '⛽' : insight.type === 'time' ? '⏱️' : insight.type === 'cost' ? '💰' : '🛡️'}
                                        </span>
                                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{insight.title}</span>
                                    </div>
                                    <span className={`status-badge ${insight.priority === 'high' ? 'active' : insight.priority === 'medium' ? 'pending' : 'completed'}`}
                                        style={{ fontSize: '10px' }}>
                                        {insight.priority === 'high' ? 'สำคัญมาก' : insight.priority === 'medium' ? '🟡 ปานกลาง' : '🟢 ทั่วไป'}
                                    </span>
                                </div>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.5 }}>
                                    {insight.detail}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--accent-green)' }}>
                                    <TrendingUp size={14} />
                                    {insight.impact}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
