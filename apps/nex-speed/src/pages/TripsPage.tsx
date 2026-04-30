'use client';

import React, { useState, useEffect, useRef } from 'react';
import StatusDropdown from '@/components/StatusDropdown';
import { MapPin, Navigation2, Crosshair, ChevronDown, ChevronUp } from 'lucide-react';
import { api, Trip, Vehicle, Driver } from '@/services/api';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

const statusLabels: Record<string, string> = { 'in-transit': '🚛 กำลังวิ่ง', loading: 'กำลังโหลด', completed: 'เสร็จ', planned: '📋 วางแผน' };
const statusColors: Record<string, string> = { 'in-transit': 'active', loading: 'pending', completed: 'completed', planned: 'inactive' };

interface GPSUpdate {
    type: string; vehicleId: string; tripId: string;
    lat: number; lng: number; speed: number; heading: number;
    fuelLevel: number; progress: number; status: string; timestamp: string;
}

export default function TripsPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
    const [hoveredTrip, setHoveredTrip] = useState<Trip | null>(null);
    const [sidebarFilter, setSidebarFilter] = useState('all');
    const wsRef = useRef<WebSocket | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapRef = useRef<any>(null);

    useEffect(() => {
        Promise.all([
            api.getTrips().then(t => setTrips(t || [])),
            api.getVehicles().then(v => setVehicles(v || [])),
            api.getDrivers().then(d => setDrivers(d || [])),
        ]).finally(() => setLoading(false));
    }, []);

    // Lookup helpers
    const getVehicle = (id: string) => vehicles.find(v => v.id === id);
    const getDriver = (id: string) => drivers.find(d => d.id === id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [leafletLib, setLeafletLib] = useState<any>(null);
    useEffect(() => {
        import('leaflet').then(L => setLeafletLib(L));
    }, []);

    // WebSocket GPS
    useEffect(() => {
        const connect = () => {
            const wsHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
            const ws = new WebSocket(`ws://${wsHost}:8081/ws/gps`);
            wsRef.current = ws;
            ws.onmessage = (event) => {
                try {
                    const u: GPSUpdate = JSON.parse(event.data);
                    if (u.type === 'gps_update') {
                        setTrips(prev => prev.map(trip =>
                            trip.id === u.tripId
                                ? { ...trip, currentLat: u.lat, currentLng: u.lng, progress: u.progress, status: u.status }
                                : trip
                        ));
                    }
                } catch { /* ignore */ }
            };
            ws.onclose = () => { setTimeout(connect, 3000); };
            ws.onerror = () => ws.close();
        };
        connect();
        return () => { wsRef.current?.close(); };
    }, []);

    const activeTrips = trips.filter(t => t.status === 'in-transit' || t.status === 'loading');

    // Sidebar + Map filter
    const filteredTrips = sidebarFilter === 'all' ? trips : trips.filter(t => t.status === sidebarFilter);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

    return (
        <div className="animate-fade-in">

            {/* KPI — FleetPage ScoreCard style */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                {[
                    { icon: <MapPin size={22} />, color: '#3b82f6', label: 'ทริปทั้งหมด', value: String(trips.length), sub: 'ทริป', bg: 'rgba(59,130,246,0.07)' },
                    { icon: <Navigation2 size={22} />, color: '#10b981', label: 'กำลังวิ่ง', value: String(activeTrips.length), sub: 'ทริป', bg: 'rgba(16,185,129,0.07)' },
                    { icon: <MapPin size={22} />, color: '#f59e0b', label: 'ระยะทางรวม', value: trips.reduce((a, t) => a + t.distance, 0).toLocaleString(), sub: 'กม.', bg: 'rgba(245,158,11,0.07)' },
                    { icon: <Navigation2 size={22} />, color: '#8b5cf6', label: 'Avg Progress', value: `${activeTrips.length ? Math.round(activeTrips.reduce((a, t) => a + t.progress, 0) / activeTrips.length) : 0}%`, sub: '', bg: 'rgba(139,92,246,0.07)' },
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
                                {card.sub && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{card.sub}</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Map + Sidebar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', marginBottom: '20px' }}>
                {/* Map */}
                <div className="card" style={{ padding: 0, overflow: 'hidden', height: 'calc(100vh - 220px)', position: 'relative' }}>
                    {typeof window !== 'undefined' && <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />}
                    {typeof window !== 'undefined' && (
                        <MapContainer
                            center={[13.5, 101.0]}
                            zoom={6}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={true}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            ref={(mapInstance: any) => { mapRef.current = mapInstance; }}
                        >
                            {/* Google Maps-style tile (OpenStreetMap Mapnik) */}
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {filteredTrips.map(trip => {
                                const vehicle = getVehicle(trip.vehicleId);
                                const driver = getDriver(trip.driverId);
                                const plateText = vehicle?.plateNumber || trip.vehicleId;
                                const truckIcon = leafletLib ? new leafletLib.DivIcon({
                                    html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-50%)">
                                        <div style="font-size:28px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));line-height:1">🚛</div>
                                        <div style="background:#1e40af;color:#fff;font-size:9px;font-weight:700;padding:1px 6px;border-radius:4px;white-space:nowrap;margin-top:-2px;box-shadow:0 1px 3px rgba(0,0,0,0.3);letter-spacing:0.5px">${plateText}</div>
                                    </div>`,
                                    className: '',
                                    iconSize: [80, 50],
                                    iconAnchor: [40, 25],
                                    popupAnchor: [0, -20],
                                }) : undefined;
                                return (
                                    <Marker key={trip.id} position={[trip.currentLat, trip.currentLng]} icon={truckIcon}>
                                        <Popup>
                                            <div style={{ fontSize: '13px', lineHeight: 1.8, minWidth: '220px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>🚛 {trip.vehicleId} • {plateText}</div>
                                                {driver && <div>👤 {driver.name} • {driver.phone}</div>}
                                                <div>ต้นทาง: {trip.origin}</div>
                                                <div>🏁 ปลายทาง: {trip.destination}</div>
                                                <div>📏 {trip.distance} กม. | {trip.progress}%</div>
                                                <div>Order: {trip.orderId}</div>
                                                <div style={{ marginTop: '6px', height: '6px', borderRadius: '3px', background: '#e5e7eb' }}>
                                                    <div style={{ height: '100%', borderRadius: '3px', width: `${trip.progress}%`, background: '#3b82f6' }} />
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                        </MapContainer>
                    )}
                </div>

                {/* Vehicle List Sidebar */}
                <div className="card" style={{ padding: 0, height: 'calc(100vh - 220px)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <Navigation2 size={16} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                        <select value={sidebarFilter} onChange={e => setSidebarFilter(e.target.value)}
                            style={{
                                flex: 1, padding: '6px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                                border: '1.5px solid var(--border-color)', background: 'var(--bg-primary)',
                                color: 'var(--text-primary)', fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
                            }}>
                            <option value="all">รถทั้งหมด ({trips.length})</option>
                            <option value="in-transit">🚛 กำลังวิ่ง ({trips.filter(t => t.status === 'in-transit').length})</option>
                            <option value="loading">กำลังโหลด ({trips.filter(t => t.status === 'loading').length})</option>
                            <option value="completed">เสร็จ ({trips.filter(t => t.status === 'completed').length})</option>
                            <option value="planned">📋 วางแผน ({trips.filter(t => t.status === 'planned').length})</option>
                        </select>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{filteredTrips.length} คัน</span>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {filteredTrips.map(t => {
                            const isExpanded = selectedTrip === t.id;
                            return (
                                <div key={t.id}
                                    style={{
                                        padding: isExpanded ? '10px 12px' : '8px 12px', borderRadius: '10px',
                                        border: isExpanded ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
                                        background: isExpanded ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.02)',
                                        transition: 'all 0.2s ease',
                                    }}>
                                    {/* Header row - always visible */}
                                    <div
                                        onMouseEnter={() => {
                                            setHoveredTrip(t);
                                            if (mapRef.current) {
                                                mapRef.current.flyTo([t.currentLat, t.currentLng], 14, { duration: 0.8 });
                                            }
                                        }}
                                        onMouseLeave={() => setHoveredTrip(null)}
                                        onClick={() => setSelectedTrip(isExpanded ? null : t.id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                        <span style={{ fontWeight: 700, color: 'var(--accent-blue)', fontSize: '13px' }}>{t.id}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: hoveredTrip?.id === t.id ? 'var(--accent-blue)' : 'var(--text-muted)', transition: 'color 0.2s' }}><Crosshair size={10} /> GPS</span>
                                        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <StatusDropdown 
                    value={t.status}
                    onChange={async (newValue: any) => {
                        setTrips(prev => prev.map(x => x.id === t.id ? { ...x, status: newValue } : x));
                        try { await api.updateTrip(t.id, { ...t, status: newValue } as any); } catch(err) { console.error(err); }
                    }}
                    options={Object.keys(statusLabels).map(k => ({ 
                        value: k, 
                        label: statusLabels[k as keyof typeof statusLabels], 
                        color: (['active','completed','available', 'approved'].includes(k) ? 'green' : (['inactive','cancelled', 'rejected'].includes(k) ? 'red' : 'yellow')) as any
                    }))}
                />
                                            {isExpanded ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
                                        </span>
                                    </div>
                                    {/* Expanded details */}
                                    {isExpanded && (
                                        <div style={{ marginTop: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                                🚛 {t.vehicleId} {getVehicle(t.vehicleId)?.plateNumber ? `• ${getVehicle(t.vehicleId)!.plateNumber}` : ''}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                                👤 {t.driverId} {getDriver(t.driverId)?.name ? `• ${getDriver(t.driverId)!.name}` : ''} {getDriver(t.driverId)?.phone ? `• ${getDriver(t.driverId)!.phone}` : ''}
                                            </div>
                                            <div style={{ fontSize: '11px', marginBottom: '6px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                                    <MapPin size={11} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
                                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, minWidth: '40px' }}>ต้นทาง</span>
                                                    <span style={{ color: 'var(--text-secondary)' }}>{t.origin}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <MapPin size={11} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
                                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, minWidth: '40px' }}>ปลายทาง</span>
                                                    <span style={{ color: 'var(--text-secondary)' }}>{t.destination}</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                                <span>📏 {t.distance} กม.</span>
                                                <span>{t.orderId}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ flex: 1, height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)' }}>
                                                    <div style={{
                                                        height: '100%', borderRadius: '3px', width: `${t.progress}%`,
                                                        background: t.progress >= 80 ? 'var(--accent-green)' : 'var(--accent-blue)',
                                                        transition: 'width 0.5s ease',
                                                    }} />
                                                </div>
                                                <span style={{
                                                    fontSize: '11px', fontWeight: 700, minWidth: '32px', textAlign: 'right',
                                                    color: t.progress >= 80 ? 'var(--accent-green)' : 'var(--accent-blue)',
                                                }}>{t.progress}%</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {filteredTrips.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '13px' }}>ไม่พบข้อมูล</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
