'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
    Satellite, Wifi, WifiOff, Navigation2, AlertTriangle,
    Gauge, Fuel, MapPin, Clock, RefreshCw, Bell, BellOff,
    TrendingUp, Crosshair, Play, Square, ChevronDown, ChevronUp,
    ZoomIn, Activity, Shield, ShieldAlert
} from 'lucide-react';
import { api, Trip, Vehicle, Driver } from '@/services/api';

// ── Lazy-load Leaflet (SSR-safe) ───────────────────────────────────────────────
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(m => m.Circle), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });

// ── Types ──────────────────────────────────────────────────────────────────────
interface GPSUpdate {
    type: string;
    vehicleId: string;
    tripId: string;
    lat: number;
    lng: number;
    speed: number;
    heading: number;
    fuelLevel: number;
    progress: number;
    status: string;
    timestamp: string;
    origin?: string;
    dest?: string;
    message?: string;
}

interface LiveTruck {
    tripId: string;
    vehicleId: string;
    lat: number;
    lng: number;
    speed: number;
    heading: number;
    fuelLevel: number;
    progress: number;
    status: string;
    updatedAt: string;
    trail: [number, number][];   // last N positions
    alerts: TruckAlert[];
}

interface TruckAlert {
    id: string;
    tripId: string;
    vehicleId: string;
    type: 'geofence_entry' | 'geofence_exit' | 'speed' | 'fuel' | 'trip_recycled';
    message: string;
    severity: 'info' | 'warning' | 'critical';
    timestamp: string;
    read: boolean;
}

interface Geofence {
    id: string;
    name: string;
    lat: number;
    lng: number;
    radius: number;  // metres
    color: string;
    inside: Set<string>;  // vehicleIds inside
}

// ── Constants ─────────────────────────────────────────────────────────────────
const SPEED_LIMIT = 90; // km/h alert threshold
const FUEL_LOW    = 20; // % alert threshold
const TRAIL_MAX   = 10; // number of past positions to show

const DEFAULT_GEOFENCES: Geofence[] = [
    { id: 'gf1', name: 'คลังสินค้ากรุงเทพฯ', lat: 13.72, lng: 100.78, radius: 5000, color: '#3b82f6', inside: new Set() },
    { id: 'gf2', name: 'ท่าเรือแหลมฉบัง',    lat: 13.08, lng: 100.89, radius: 4000, color: '#8b5cf6', inside: new Set() },
    { id: 'gf3', name: 'คลังเชียงใหม่',       lat: 18.79, lng: 98.99, radius: 6000,  color: '#10b981', inside: new Set() },
    { id: 'gf4', name: 'โซนภาคใต้',            lat: 7.90,  lng: 98.40, radius: 8000,  color: '#f59e0b', inside: new Set() },
];

// ── Haversine distance (km) ────────────────────────────────────────────────────
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Alert Badge ────────────────────────────────────────────────────────────────
const severityStyle: Record<string, React.CSSProperties> = {
    info:     { background: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe' },
    warning:  { background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' },
    critical: { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' },
};

// ── GPS Status Dot ─────────────────────────────────────────────────────────────
function StatusDot({ active }: { active: boolean }) {
    return (
        <span style={{
            display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
            background: active ? '#22c55e' : '#94a3b8',
            boxShadow: active ? '0 0 0 3px rgba(34,197,94,0.25)' : 'none',
            animation: active ? 'pulse 2s infinite' : 'none',
        }} />
    );
}

// ── Fuel Bar ──────────────────────────────────────────────────────────────────
function FuelBar({ level }: { level: number }) {
    const color = level < 20 ? '#ef4444' : level < 40 ? '#f59e0b' : '#22c55e';
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Fuel size={12} color={color} />
            <div style={{ flex: 1, height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${level}%`, background: color, transition: 'width 0.5s' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color, minWidth: '28px' }}>{level}%</span>
        </div>
    );
}

// ── Main GPS Live Page ────────────────────────────────────────────────────────
export default function GPSLivePage() {
    // Data
    const [trucks, setTrucks] = useState<Map<string, LiveTruck>>(new Map());
    const [allTrips, setAllTrips] = useState<Trip[]>([]);
    const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
    const [allDrivers, setAllDrivers] = useState<Driver[]>([]);

    // WS
    const wsRef = useRef<WebSocket | null>(null);
    const [wsConnected, setWsConnected] = useState(false);
    const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();

    // UI
    const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
    const [alerts, setAlerts] = useState<TruckAlert[]>([]);
    const [alertsOpen, setAlertsOpen] = useState(true);
    const [geofences] = useState<Geofence[]>(DEFAULT_GEOFENCES);
    const [showGeofences, setShowGeofences] = useState(true);
    const [showTrails, setShowTrails] = useState(true);
    const [muteAlerts, setMuteAlerts] = useState(false);
    const [leafletLib, setLeafletLib] = useState<any>(null);
    const mapRef = useRef<any>(null);
    const geofenceRef = useRef<Geofence[]>(DEFAULT_GEOFENCES);

    // Load leaflet
    useEffect(() => { import('leaflet').then(L => setLeafletLib(L)); }, []);

    // Load initial trips / vehicles / drivers
    useEffect(() => {
        Promise.all([
            api.getTrips(),
            api.getVehicles(),
            api.getDrivers(),
        ]).then(([trips, vehicles, drivers]) => {
            setAllTrips(trips || []);
            setAllVehicles(vehicles || []);
            setAllDrivers(drivers || []);

            // Pre-seed trucks from DB data
            const map = new Map<string, LiveTruck>();
            (trips || []).filter(t => t.status === 'in-transit' || t.status === 'loading').forEach(t => {
                map.set(t.id, {
                    tripId: t.id, vehicleId: t.vehicleId,
                    lat: t.currentLat, lng: t.currentLng,
                    speed: 0, heading: 0, fuelLevel: 80,
                    progress: t.progress, status: t.status,
                    updatedAt: new Date().toISOString(),
                    trail: [[t.currentLat, t.currentLng]],
                    alerts: [],
                });
            });
            setTrucks(map);
        });
    }, []);

    // Geofence check
    const checkGeofences = useCallback((tripId: string, vehicleId: string, lat: number, lng: number) => {
        const newAlerts: TruckAlert[] = [];
        geofenceRef.current.forEach(gf => {
            const distKm = haversine(lat, lng, gf.lat, gf.lng);
            const distM = distKm * 1000;
            const wasInside = gf.inside.has(vehicleId);
            const isInside = distM <= gf.radius;

            if (isInside && !wasInside) {
                gf.inside.add(vehicleId);
                newAlerts.push({
                    id: `${Date.now()}-gf-enter-${vehicleId}`,
                    tripId, vehicleId,
                    type: 'geofence_entry',
                    severity: 'info',
                    message: `🔵 ${vehicleId} เข้าโซน "${gf.name}"`,
                    timestamp: new Date().toISOString(),
                    read: false,
                });
            } else if (!isInside && wasInside) {
                gf.inside.delete(vehicleId);
                newAlerts.push({
                    id: `${Date.now()}-gf-exit-${vehicleId}`,
                    tripId, vehicleId,
                    type: 'geofence_exit',
                    severity: 'warning',
                    message: `🟡 ${vehicleId} ออกจากโซน "${gf.name}"`,
                    timestamp: new Date().toISOString(),
                    read: false,
                });
            }
        });
        return newAlerts;
    }, []);

    // WebSocket connect with auto-reconnect
    const connect = useCallback(() => {
        const wsHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        const ws = new WebSocket(`ws://${wsHost}:8081/ws/gps`);
        wsRef.current = ws;

        ws.onopen = () => setWsConnected(true);
        ws.onclose = () => {
            setWsConnected(false);
            reconnectTimer.current = setTimeout(connect, 3000);
        };
        ws.onerror = () => ws.close();

        ws.onmessage = (event) => {
            try {
                const msg: GPSUpdate = JSON.parse(event.data);

                if (msg.type === 'gps_update') {
                    setTrucks(prev => {
                        const next = new Map(prev);
                        const existing = next.get(msg.tripId);
                        const trail: [number, number][] = existing
                            ? [...existing.trail.slice(-TRAIL_MAX), [msg.lat, msg.lng]]
                            : [[msg.lat, msg.lng]];

                        next.set(msg.tripId, {
                            tripId: msg.tripId,
                            vehicleId: msg.vehicleId,
                            lat: msg.lat, lng: msg.lng,
                            speed: msg.speed, heading: msg.heading,
                            fuelLevel: msg.fuelLevel,
                            progress: msg.progress,
                            status: msg.status,
                            updatedAt: msg.timestamp,
                            trail,
                            alerts: existing?.alerts ?? [],
                        });
                        return next;
                    });

                    const newAlerts: TruckAlert[] = [];

                    // Speed alert
                    if (msg.speed > SPEED_LIMIT) {
                        newAlerts.push({
                            id: `${Date.now()}-spd-${msg.vehicleId}`,
                            tripId: msg.tripId, vehicleId: msg.vehicleId,
                            type: 'speed',
                            severity: 'critical',
                            message: `🚨 ${msg.vehicleId} ความเร็วเกิน! ${msg.speed.toFixed(0)} km/h`,
                            timestamp: msg.timestamp, read: false,
                        });
                    }

                    // Fuel alert
                    if (msg.fuelLevel <= FUEL_LOW) {
                        newAlerts.push({
                            id: `${Date.now()}-fuel-${msg.vehicleId}`,
                            tripId: msg.tripId, vehicleId: msg.vehicleId,
                            type: 'fuel',
                            severity: 'warning',
                            message: `⛽ ${msg.vehicleId} น้ำมันต่ำ! ${msg.fuelLevel}%`,
                            timestamp: msg.timestamp, read: false,
                        });
                    }

                    // Geofence
                    const gfAlerts = checkGeofences(msg.tripId, msg.vehicleId, msg.lat, msg.lng);
                    newAlerts.push(...gfAlerts);

                    if (newAlerts.length > 0) {
                        setAlerts(prev => [...newAlerts, ...prev].slice(0, 50));
                        if (!muteAlerts && newAlerts.some(a => a.severity === 'critical')) {
                            try { new Audio('/alert.mp3').play(); } catch { }
                        }
                    }
                }

                if (msg.type === 'trip_recycled') {
                    setAlerts(prev => [{
                        id: `${Date.now()}-recycled`,
                        tripId: msg.tripId ?? '',
                        vehicleId: '',
                        type: 'trip_recycled',
                        severity: 'info',
                        message: msg.message ?? `ทริปเริ่มเส้นทางใหม่`,
                        timestamp: new Date().toISOString(),
                        read: false,
                    }, ...prev].slice(0, 50));
                }
            } catch { }
        };
    }, [checkGeofences, muteAlerts]);

    useEffect(() => {
        connect();
        return () => {
            clearTimeout(reconnectTimer.current);
            wsRef.current?.close();
        };
    }, [connect]);

    // Derived
    const truckList = Array.from(trucks.values());
    const activeCount = truckList.filter(t => t.status === 'in-transit').length;
    const avgSpeed = truckList.length ? Math.round(truckList.reduce((a, t) => a + t.speed, 0) / truckList.length) : 0;
    const lowFuelCount = truckList.filter(t => t.fuelLevel <= FUEL_LOW).length;
    const unreadAlerts = alerts.filter(a => !a.read).length;
    const selectedTruck = selectedTruckId ? trucks.get(selectedTruckId) : null;
    const getTrip = (id: string) => allTrips.find(t => t.id === id);
    const getDriver = (id: string) => allDrivers.find(d => d.id === id);

    const truckIcon = useCallback((truck: LiveTruck) => {
        if (!leafletLib) return undefined;
        const isSelected = truck.tripId === selectedTruckId;
        const fuelColor = truck.fuelLevel < 20 ? '#ef4444' : truck.fuelLevel < 40 ? '#f59e0b' : '#22c55e';
        const speedBorder = truck.speed > SPEED_LIMIT ? '#ef4444' : '#1e40af';
        return new leafletLib.DivIcon({
            html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-50%);filter:drop-shadow(0 3px 6px rgba(0,0,0,0.25))">
                <div style="font-size:${isSelected ? '32' : '26'}px;line-height:1;transform:rotate(${truck.heading}deg)">🚛</div>
                <div style="background:${speedBorder};color:#fff;font-size:9px;font-weight:700;padding:1px 6px;border-radius:4px;white-space:nowrap;margin-top:-2px;box-shadow:0 1px 3px rgba(0,0,0,0.3)">
                    ${truck.vehicleId}
                </div>
                <div style="background:${fuelColor};width:24px;height:3px;border-radius:2px;margin-top:2px">
                    <div style="height:100%;width:${truck.fuelLevel}%;background:rgba(255,255,255,0.6);border-radius:2px"></div>
                </div>
            </div>`,
            className: '',
            iconSize: [90, 55],
            iconAnchor: [45, 27],
            popupAnchor: [0, -24],
        });
    }, [leafletLib, selectedTruckId]);

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 120px)' }}>

            {/* KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '10px', flexShrink: 0 }}>
                {[
                    { icon: <Satellite size={18} />, color: wsConnected ? '#22c55e' : '#94a3b8', label: 'GPS สัญญาณ', value: wsConnected ? 'ออนไลน์' : 'ออฟไลน์', extra: <StatusDot active={wsConnected} /> },
                    { icon: <Navigation2 size={18} />, color: '#3b82f6', label: 'รถที่กำลังวิ่ง', value: `${activeCount} คัน` },
                    { icon: <Gauge size={18} />, color: '#8b5cf6', label: 'ความเร็วเฉลี่ย', value: `${avgSpeed} km/h` },
                    { icon: <Fuel size={18} />, color: lowFuelCount > 0 ? '#ef4444' : '#10b981', label: 'น้ำมันต่ำ', value: `${lowFuelCount} คัน` },
                    { icon: <Bell size={18} />, color: unreadAlerts > 0 ? '#f59e0b' : '#64748b', label: 'การแจ้งเตือน', value: `${unreadAlerts} ใหม่` },
                ].map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '10px', background: `${c.color}0d`, border: `1px solid ${c.color}22` }}>
                        <div style={{ color: c.color, flexShrink: 0 }}>{c.icon}</div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500 }}>{c.label}</div>
                            <div style={{ fontSize: '15px', fontWeight: 700, color: c.color, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                {c.value} {c.extra}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Layout: Map + Panel */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', gap: '12px', minHeight: 0 }}>

                {/* Map */}
                <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative', minHeight: 0 }}>
                    {/* Map Toolbar */}
                    <div style={{
                        position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
                        zIndex: 1000, display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.95)',
                        borderRadius: '10px', padding: '6px 10px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)',
                    }}>
                        {[
                            { icon: <Shield size={14} />, label: 'Geofence', active: showGeofences, action: () => setShowGeofences(v => !v) },
                            { icon: <Activity size={14} />, label: 'เส้นทาง', active: showTrails, action: () => setShowTrails(v => !v) },
                            { icon: muteAlerts ? <BellOff size={14} /> : <Bell size={14} />, label: muteAlerts ? 'เปิดเสียง' : 'ปิดเสียง', active: !muteAlerts, action: () => setMuteAlerts(v => !v) },
                        ].map((btn, i) => (
                            <button
                                key={i}
                                onClick={btn.action}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    padding: '5px 10px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                                    fontSize: '11px', fontWeight: 600,
                                    background: btn.active ? '#2563eb' : '#f1f5f9',
                                    color: btn.active ? '#fff' : '#64748b',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {btn.icon} {btn.label}
                            </button>
                        ))}
                        <div style={{ width: '1px', background: '#e2e8f0', margin: '0 2px' }} />
                        <button
                            onClick={() => { wsRef.current?.close(); connect(); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600, background: '#f1f5f9', color: '#64748b' }}
                        >
                            <RefreshCw size={13} /> Reconnect
                        </button>
                    </div>

                    {/* WS connection banner */}
                    {!wsConnected && (
                        <div style={{ position: 'absolute', top: '58px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: '#fee2e2', color: '#b91c1c', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                            <WifiOff size={14} /> ขาดการเชื่อมต่อ GPS — กำลังเชื่อมต่อใหม่...
                        </div>
                    )}

                    {/* Leaflet CSS */}
                    {typeof window !== 'undefined' && <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />}

                    {typeof window !== 'undefined' && (
                        <MapContainer
                            center={[13.5, 101.0]}
                            zoom={6}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={true}
                            ref={(m: any) => { mapRef.current = m; }}
                        >
                            <TileLayer
                                attribution='&copy; OpenStreetMap'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {/* Geofence Circles */}
                            {showGeofences && geofences.map(gf => (
                                <Circle
                                    key={gf.id}
                                    center={[gf.lat, gf.lng]}
                                    radius={gf.radius}
                                    pathOptions={{
                                        color: gf.color,
                                        fillColor: gf.color,
                                        fillOpacity: 0.07,
                                        weight: 1.5,
                                        dashArray: '6 4',
                                    }}
                                >
                                    <Popup>
                                        <div style={{ fontSize: '13px', fontWeight: 600 }}>
                                            <ShieldAlert size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                            {gf.name}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                                            รัศมี {(gf.radius / 1000).toFixed(1)} กม. · {gf.inside.size} คันอยู่ภายใน
                                        </div>
                                    </Popup>
                                </Circle>
                            ))}

                            {/* Truck Trails + Markers */}
                            {truckList.map(truck => (
                                <React.Fragment key={truck.tripId}>
                                    {/* Trail */}
                                    {showTrails && truck.trail.length >= 2 && (
                                        <Polyline
                                            positions={truck.trail}
                                            pathOptions={{
                                                color: truck.speed > SPEED_LIMIT ? '#ef4444' : '#3b82f6',
                                                weight: 2.5,
                                                opacity: 0.5,
                                                dashArray: '4 4',
                                            }}
                                        />
                                    )}

                                    {/* Truck Marker */}
                                    <Marker
                                        position={[truck.lat, truck.lng]}
                                        icon={truckIcon(truck)}
                                        eventHandlers={{
                                            click: () => {
                                                setSelectedTruckId(truck.tripId === selectedTruckId ? null : truck.tripId);
                                                mapRef.current?.flyTo([truck.lat, truck.lng], 12, { duration: 0.8 });
                                            },
                                        }}
                                    >
                                        <Popup maxWidth={260}>
                                            <div style={{ fontSize: '13px', lineHeight: 1.8, minWidth: '220px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    🚛 {truck.vehicleId}
                                                    {truck.speed > SPEED_LIMIT && (
                                                        <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '10px', padding: '1px 6px', borderRadius: '4px' }}>⚡ เร็วเกิน</span>
                                                    )}
                                                </div>
                                                {getTrip(truck.tripId) && (
                                                    <>
                                                        <div>📍 {getTrip(truck.tripId)!.origin} → {getTrip(truck.tripId)!.destination}</div>
                                                        {getDriver(getTrip(truck.tripId)!.driverId) && (
                                                            <div>👤 {getDriver(getTrip(truck.tripId)!.driverId)!.name}</div>
                                                        )}
                                                    </>
                                                )}
                                                <div>💨 {truck.speed.toFixed(0)} km/h &nbsp; 🧭 {truck.heading.toFixed(0)}°</div>
                                                <div style={{ margin: '6px 0 2px', height: '5px', borderRadius: '3px', background: '#e5e7eb' }}>
                                                    <div style={{ height: '100%', width: `${truck.progress}%`, background: '#3b82f6', borderRadius: '3px' }} />
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#6b7280' }}>ความคืบหน้า {truck.progress}%</div>
                                                <FuelBar level={truck.fuelLevel} />
                                                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                                                    อัปเดต {new Date(truck.updatedAt).toLocaleTimeString('th-TH')}
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                </React.Fragment>
                            ))}
                        </MapContainer>
                    )}
                </div>

                {/* Right Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0 }}>

                    {/* Selected Truck Detail */}
                    {selectedTruck && (
                        <div className="card" style={{ padding: '14px', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <div style={{ fontSize: '20px' }}>🚛</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{selectedTruck.vehicleId}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>{selectedTruck.tripId}</div>
                                </div>
                                {selectedTruck.speed > SPEED_LIMIT && (
                                    <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '11px', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                                        ⚡ เร็วเกิน
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                                {[
                                    { icon: <Gauge size={12} />, label: 'ความเร็ว', value: `${selectedTruck.speed.toFixed(0)} km/h`, color: selectedTruck.speed > SPEED_LIMIT ? '#ef4444' : '#1e293b' },
                                    { icon: <TrendingUp size={12} />, label: 'คืบหน้า', value: `${selectedTruck.progress}%`, color: '#2563eb' },
                                    { icon: <MapPin size={12} />, label: 'พิกัด', value: `${selectedTruck.lat.toFixed(4)}, ${selectedTruck.lng.toFixed(4)}`, color: '#64748b' },
                                    { icon: <Clock size={12} />, label: 'อัปเดต', value: new Date(selectedTruck.updatedAt).toLocaleTimeString('th-TH'), color: '#64748b' },
                                ].map((item, i) => (
                                    <div key={i} style={{ padding: '8px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '2px' }}>{item.icon}{item.label}</div>
                                        <div style={{ fontSize: '12px', fontWeight: 600, color: item.color }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>
                            <FuelBar level={selectedTruck.fuelLevel} />
                            <button
                                onClick={() => mapRef.current?.flyTo([selectedTruck.lat, selectedTruck.lng], 14)}
                                style={{ marginTop: '8px', width: '100%', padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#2563eb', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                            >
                                <Crosshair size={13} /> โฟกัสบนแผนที่
                            </button>
                        </div>
                    )}

                    {/* Vehicle List */}
                    <div className="card" style={{ padding: 0, flex: selectedTruck ? 'none' : 1, maxHeight: selectedTruck ? '220px' : '45%', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>🚛 รถทั้งหมด ({truckList.length})</span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>{activeCount} กำลังวิ่ง</span>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {truckList.map(truck => (
                                <div
                                    key={truck.tripId}
                                    onClick={() => {
                                        setSelectedTruckId(truck.tripId === selectedTruckId ? null : truck.tripId);
                                        mapRef.current?.flyTo([truck.lat, truck.lng], 12, { duration: 0.8 });
                                    }}
                                    style={{
                                        padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f8fafc',
                                        background: truck.tripId === selectedTruckId ? '#eff6ff' : 'transparent',
                                        transition: 'background 0.1s',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                    }}
                                >
                                    <StatusDot active={truck.status === 'in-transit'} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{truck.vehicleId}</div>
                                        <div style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', gap: '8px' }}>
                                            <span>{truck.speed.toFixed(0)} km/h</span>
                                            <span>{truck.progress}%</span>
                                        </div>
                                    </div>
                                    {truck.fuelLevel <= FUEL_LOW && <Fuel size={13} color="#ef4444" />}
                                    {truck.speed > SPEED_LIMIT && <Gauge size={13} color="#ef4444" />}
                                    <ZoomIn size={13} color="#94a3b8" />
                                </div>
                            ))}
                            {truckList.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '13px' }}>
                                    <Satellite size={32} style={{ opacity: 0.3, margin: '0 auto 8px', display: 'block' }} />
                                    ไม่มีรถที่กำลังวิ่ง
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Alerts Panel */}
                    <div className="card" style={{ padding: 0, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div
                            onClick={() => setAlertsOpen(v => !v)}
                            style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Bell size={14} color={unreadAlerts > 0 ? '#f59e0b' : '#64748b'} />
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>การแจ้งเตือน</span>
                                {unreadAlerts > 0 && (
                                    <span style={{ background: '#ef4444', color: '#fff', borderRadius: '10px', padding: '1px 6px', fontSize: '10px', fontWeight: 700 }}>{unreadAlerts}</span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                {alerts.length > 0 && (
                                    <button
                                        onClick={e => { e.stopPropagation(); setAlerts(prev => prev.map(a => ({ ...a, read: true }))); }}
                                        style={{ fontSize: '11px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}
                                    >
                                        อ่านทั้งหมด
                                    </button>
                                )}
                                {alertsOpen ? <ChevronUp size={14} color="#94a3b8" /> : <ChevronDown size={14} color="#94a3b8" />}
                            </div>
                        </div>
                        {alertsOpen && (
                            <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
                                {alerts.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '12px' }}>
                                        <Shield size={24} style={{ opacity: 0.3, margin: '0 auto 6px', display: 'block' }} />
                                        ไม่มีการแจ้งเตือน
                                    </div>
                                ) : alerts.slice(0, 20).map(alert => (
                                    <div
                                        key={alert.id}
                                        onClick={() => setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, read: true } : a))}
                                        style={{
                                            ...severityStyle[alert.severity],
                                            padding: '8px 10px', borderRadius: '8px', marginBottom: '4px',
                                            cursor: 'pointer', opacity: alert.read ? 0.6 : 1,
                                            transition: 'opacity 0.2s',
                                        }}
                                    >
                                        <div style={{ fontSize: '12px', fontWeight: alert.read ? 400 : 600, lineHeight: 1.4 }}>{alert.message}</div>
                                        <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>
                                            {new Date(alert.timestamp).toLocaleTimeString('th-TH')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
            `}</style>
        </div>
    );
}
