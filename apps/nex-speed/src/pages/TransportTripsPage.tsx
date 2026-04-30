'use client';

import React, { useState, useEffect } from 'react';
import StatusDropdown from '@/components/StatusDropdown';
import { Search, MapPin, Truck, Navigation2, ChevronLeft, ChevronRight, FileSpreadsheet, FileText, Download, Eye, X } from 'lucide-react';
import { api, Trip } from '@/services/api';

const statusLabels: Record<string, string> = {
    'in-transit': '🚛 กำลังวิ่ง', loading: 'กำลังโหลด', completed: 'เสร็จสิ้น', planned: '📋 วางแผน',
};
const statusColors: Record<string, string> = {
    'in-transit': 'active', loading: 'pending', completed: 'completed', planned: 'inactive',
};

export default function TransportTripsPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const perPage = 10;

    useEffect(() => {
        api.getTrips().then(t => { setTrips(t || []); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const filtered = trips.filter(t => {
        if (filterStatus !== 'all' && t.status !== filterStatus) return false;
        if (search) {
            const q = search.toLowerCase();
            return t.id.toLowerCase().includes(q) || t.origin.toLowerCase().includes(q) ||
                t.destination.toLowerCase().includes(q) || t.vehicleId.toLowerCase().includes(q) ||
                t.driverId.toLowerCase().includes(q);
        }
        return true;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

    const activeTrips = trips.filter(t => t.status === 'in-transit' || t.status === 'loading');
    const totalDistance = trips.reduce((s, t) => s + t.distance, 0);
    const avgProgress = activeTrips.length ? Math.round(activeTrips.reduce((s, t) => s + t.progress, 0) / activeTrips.length) : 0;

    const exportCSV = () => {
        const header = 'ทริป,ต้นทาง,ปลายทาง,รถ,คนขับ,สถานะ,ความคืบหน้า,ระยะทาง\n';
        const rows = filtered.map(t => `${t.id},${t.origin},${t.destination},${t.vehicleId},${t.driverId},${statusLabels[t.status] || t.status},${t.progress}%,${t.distance} กม.`).join('\n');
        const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'transport_trips.csv'; a.click(); URL.revokeObjectURL(url);
    };

    const exportXLSX = async () => {
        const XLSX = await import('xlsx');
        if (!filtered.length) { alert('ไม่มีข้อมูลสำหรับ export'); return; }
        const wsData = [
            ['ทริป', 'ต้นทาง', 'ปลายทาง', 'รถ', 'คนขับ', 'สถานะ', 'ความคืบหน้า (%)', 'ระยะทาง (กม.)'],
            ...filtered.map(t => [t.id, t.origin, t.destination, t.vehicleId, t.driverId, statusLabels[t.status] || t.status, t.progress, t.distance])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [{ wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 12 }, { wch: 12 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'ทริปขนส่ง');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `nexspeed_trips_${new Date().toISOString().slice(0,10)}.xlsx`; a.click(); URL.revokeObjectURL(url);
    };

    const exportPDF = async () => {
        const { default: jsPDF } = await import('jspdf');
        if (!filtered.length) { alert('ไม่มีข้อมูลสำหรับ export'); return; }
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(16);
        doc.text('Transport Trips Report - NexSpeed', 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString('th-TH')} ${new Date().toLocaleTimeString('th-TH')}`, 14, 22);
        let y = 32;
        const headers = ['Trip', 'Origin', 'Destination', 'Vehicle', 'Driver', 'Status', 'Progress', 'Distance'];
        const colX = [14, 35, 75, 115, 145, 175, 205, 235];
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        headers.forEach((h, i) => doc.text(h, colX[i], y));
        doc.setFont('helvetica', 'normal');
        y += 6;
        filtered.forEach(t => {
            if (y > 190) { doc.addPage(); y = 20; }
            const row = [t.id, t.origin.substring(0, 18), t.destination.substring(0, 18), t.vehicleId, t.driverId, t.status, `${t.progress}%`, `${t.distance}`];
            row.forEach((val, i) => doc.text(val, colX[i], y));
            y += 5;
        });
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `nexspeed_trips_${new Date().toISOString().slice(0,10)}.pdf`; a.click(); URL.revokeObjectURL(url);
    };

    const eBtnStyle = (c: string): React.CSSProperties => ({
        display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px',
        background: 'transparent', border: `1.5px solid ${c}30`, borderRadius: '8px',
        color: c, fontSize: '12px', fontWeight: 600, cursor: 'pointer',
    });

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

    return (
        <div className="animate-fade-in">
            {/* ScoreCards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                {[
                    { icon: <Truck size={22} />, color: '#3b82f6', label: 'ทริปทั้งหมด', value: String(trips.length), sub: 'ทริป', bg: 'rgba(59,130,246,0.07)' },
                    { icon: <Navigation2 size={22} />, color: '#10b981', label: 'กำลังดำเนินการ', value: String(activeTrips.length), sub: 'ทริป', bg: 'rgba(16,185,129,0.07)' },
                    { icon: <MapPin size={22} />, color: '#f59e0b', label: 'ระยะทางรวม', value: totalDistance.toLocaleString(), sub: 'กม.', bg: 'rgba(245,158,11,0.07)' },
                    { icon: <Navigation2 size={22} />, color: '#8b5cf6', label: 'ความคืบหน้าเฉลี่ย', value: `${avgProgress}%`, sub: '', bg: 'rgba(139,92,246,0.07)' },
                ].map((card, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', borderRadius: '14px', background: card.bg, border: '1px solid transparent' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${card.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>{card.icon}</div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{card.label}</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                <span style={{ fontSize: '22px', fontWeight: 700, color: card.color }}>{card.value}</span>
                                {card.sub && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{card.sub}</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <button onClick={exportXLSX} style={eBtnStyle('#10b981')}><FileSpreadsheet size={14} /> XLSX</button>
                <button onClick={exportCSV} style={eBtnStyle('#10b981')}><FileText size={14} /> CSV</button>
                <button onClick={exportPDF} style={eBtnStyle('#ef4444')}><Download size={14} /> PDF</button>
                <div style={{ flex: 1 }} />
                <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                    style={{ padding: '7px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, border: '1.5px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontFamily: 'inherit', cursor: 'pointer', outline: 'none', minWidth: '160px' }}>
                    <option value="all">ทุกสถานะ ({trips.length})</option>
                    <option value="in-transit">🚛 กำลังวิ่ง</option>
                    <option value="loading">กำลังโหลด</option>
                    <option value="completed">เสร็จสิ้น</option>
                    <option value="planned">📋 วางแผน</option>
                </select>
                <div className="topbar-search" style={{ minWidth: '180px' }}>
                    <Search size={16} />
                    <input placeholder="ค้นหาทริป, เส้นทาง..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
                </div>
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ทริป</th>
                                <th>เส้นทาง</th>
                                <th>รถ</th>
                                <th>คนขับ</th>
                                <th>สถานะ</th>
                                <th>ความคืบหน้า</th>
                                <th>ระยะทาง</th>
                                <th style={{ textAlign: 'center', width: '60px' }}>ดู</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paged.map(trip => (
                                <tr key={trip.id}>
                                    <td><span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{trip.id}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <MapPin size={14} style={{ color: 'var(--accent-green)' }} />
                                            <span style={{ fontSize: '12px' }}>{trip.origin} → {trip.destination}</span>
                                        </div>
                                    </td>
                                    <td>{trip.vehicleId}</td>
                                    <td>{trip.driverId}</td>
                                    <td><StatusDropdown 
                    value={trip.status}
                    onChange={async (newValue: any) => {
                        setTrips(prev => prev.map(x => x.id === trip.id ? { ...x, status: newValue } : x));
                        try { await api.updateTrip(trip.id, { ...trip, status: newValue } as any); } catch(err) { console.error(err); }
                    }}
                    options={Object.keys(statusLabels).map(k => ({ 
                        value: k, 
                        label: statusLabels[k as keyof typeof statusLabels], 
                        color: (['active','completed','available', 'approved'].includes(k) ? 'green' : (['inactive','cancelled', 'rejected'].includes(k) ? 'red' : 'yellow')) as any
                    }))}
                /></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)' }}>
                                                <div style={{ height: '100%', borderRadius: '3px', width: `${trip.progress}%`, background: trip.progress >= 100 ? 'var(--accent-green)' : 'var(--accent-blue)', transition: 'width 0.3s ease' }} />
                                            </div>
                                            <span style={{ fontSize: '12px', fontWeight: 600 }}>{trip.progress}%</span>
                                        </div>
                                    </td>
                                    <td>{trip.distance} กม.</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button className="btn-icon btn-icon-view" onClick={() => setSelectedTrip(trip)}><Eye size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                            {paged.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>ไม่พบทริป</td></tr>}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>แสดง {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filtered.length)} จาก {filtered.length}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '6px 10px' }}><ChevronLeft size={14} /></button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => <button key={p} className={`btn ${currentPage === p ? 'btn-primary' : ''}`} onClick={() => setCurrentPage(p)} style={{ padding: '6px 12px', minWidth: '36px' }}>{p}</button>)}
                        <button className="btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '6px 10px' }}><ChevronRight size={14} /></button>
                    </div>
                </div>}
            </div>

            {/* Detail Modal */}
            {selectedTrip && (
                <div className="modal-backdrop" onClick={() => setSelectedTrip(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">🚚 ทริป {selectedTrip.id}</h3>
                            <button className="modal-close" onClick={() => setSelectedTrip(null)}><X size={18} /></button>
                        </div>
                        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {[
                                ['รหัสทริป', selectedTrip.id],
                                ['รหัสออเดอร์', selectedTrip.orderId],
                                ['รถ', selectedTrip.vehicleId],
                                ['คนขับ', selectedTrip.driverId],
                                ['ต้นทาง', selectedTrip.origin],
                                ['ปลายทาง', selectedTrip.destination],
                                ['สถานะ', statusLabels[selectedTrip.status] || selectedTrip.status],
                                ['ความคืบหน้า', `${selectedTrip.progress}%`],
                                ['ระยะทาง', `${selectedTrip.distance} กม.`],
                                ['ออกเดินทาง', selectedTrip.departureTime],
                                ['ถึงโดยประมาณ', selectedTrip.estimatedArrival],
                                ['ถึงจริง', selectedTrip.actualArrival || '-'],
                            ].map(([label, value], i) => (
                                <div key={i} style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
                                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{value}</div>
                                </div>
                            ))}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => setSelectedTrip(null)}>ปิด</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
