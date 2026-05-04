'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
    Route, Fuel, Clock, Leaf, DollarSign, Zap, Plus, Trash2,
    ChevronRight, Navigation, RotateCcw, Download, Truck, MapPin,
    TrendingDown, Gauge, CheckCircle2, AlertCircle, ArrowRight, X,
    Package, Info
} from 'lucide-react';
import { api, LocationItem } from '@/services/api';

// SSR-safe map components
const MapContainer  = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer     = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker        = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup         = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });
const Polyline      = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });
const CircleMarker  = dynamic(() => import('react-leaflet').then(m => m.CircleMarker), { ssr: false });

const API_BASE = typeof window !== 'undefined'
    ? `http://${window.location.hostname}:8081/api/v1`
    : '';

// ── Types ──────────────────────────────────────────────────────────────────────
interface RouteWaypoint {
    name: string; lat: number; lng: number;
    type: 'origin' | 'waypoint' | 'fuel_stop' | 'rest_stop' | 'destination';
    eta: string;
}

interface RouteResult {
    distance: number;
    duration: string;
    fuelCost: number;
    tollCost: number;
    totalCost: number;
    co2Emission: number;
    waypoints: RouteWaypoint[];
    optimizedScore: number;
    savings: number;
    algorithm: string;
}

interface RouteStop {
    id: string;
    locationId: string | null;
    name: string;
    lat: number;
    lng: number;
    type: 'origin' | 'waypoint' | 'destination';
}

interface RoutePreset {
    label: string;
    stops: { name: string; lat: number; lng: number }[];
    vehicleType: string;
    weight: number;
}

// ── Thai Route Presets ────────────────────────────────────────────────────────
const ROUTE_PRESETS: RoutePreset[] = [
    {
        label: 'กรุงเทพ → แหลมฉบัง (EEC)',
        stops: [
            { name: 'DC ลาดกระบัง', lat: 13.723, lng: 100.778 },
            { name: 'ท่าเรือแหลมฉบัง', lat: 13.096, lng: 100.905 },
        ],
        vehicleType: '18-wheeler', weight: 25,
    },
    {
        label: 'กรุงเทพ → เชียงใหม่ (ยาว)',
        stops: [
            { name: 'DC บางนา', lat: 13.667, lng: 100.640 },
            { name: 'DC เชียงใหม่', lat: 18.788, lng: 98.985 },
        ],
        vehicleType: '6-wheel', weight: 10,
    },
    {
        label: 'Multi-stop: กรุงเทพ → ขอนแก่น → อุดรฯ',
        stops: [
            { name: 'DC ลาดพร้าว', lat: 13.823, lng: 100.575 },
            { name: 'คลังขอนแก่น', lat: 16.432, lng: 102.824 },
            { name: 'สาขาอุดรธานี', lat: 17.416, lng: 102.787 },
        ],
        vehicleType: '6-wheel', weight: 8,
    },
];

// ── OSRM routing (free public) ────────────────────────────────────────────────
async function fetchOSRMRoute(stops: { lat: number; lng: number }[]): Promise<[number, number][]> {
    if (stops.length < 2) return [];
    const coords = stops.map(s => `${s.lng},${s.lat}`).join(';');
    try {
        const res = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
        );
        const data = await res.json();
        if (data.code === 'Ok' && data.routes?.[0]) {
            return (data.routes[0].geometry.coordinates as [number, number][]).map(
                ([lng, lat]) => [lat, lng]
            );
        }
    } catch {}
    return [];
}

// ── Waypoint Icon color ───────────────────────────────────────────────────────
const waypointColor: Record<string, string> = {
    origin: '#22c55e',
    destination: '#ef4444',
    fuel_stop: '#f59e0b',
    rest_stop: '#8b5cf6',
    waypoint: '#3b82f6',
};

const waypointEmoji: Record<string, string> = {
    origin: '🟢',
    destination: '🔴',
    fuel_stop: '⛽',
    rest_stop: '🛑',
    waypoint: '📍',
};

// ── Small badge ───────────────────────────────────────────────────────────────
function Chip({ children, color = '#2563eb' }: { children: React.ReactNode; color?: string }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: `${color}18`, color, padding: '2px 8px',
            borderRadius: '20px', fontSize: '11px', fontWeight: 600,
            border: `1px solid ${color}22`,
        }}>
            {children}
        </span>
    );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, savings }: {
    icon: React.ReactNode; label: string; value: string;
    sub?: string; color: string; savings?: string;
}) {
    return (
        <div style={{
            padding: '14px 16px', borderRadius: '12px',
            background: `${color}0d`, border: `1px solid ${color}22`,
            display: 'flex', alignItems: 'center', gap: '12px',
        }}>
            <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: `${color}18`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color, flexShrink: 0,
            }}>
                {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color }}>{value}</div>
                {sub && <div style={{ fontSize: '10px', color: '#64748b' }}>{sub}</div>}
            </div>
            {savings && (
                <div style={{ background: '#16a34a18', border: '1px solid #16a34a22', borderRadius: '8px', padding: '4px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>ประหยัด</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>{savings}</div>
                </div>
            )}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RouteOptimizationPage() {
    const [locations, setLocations] = useState<LocationItem[]>([]);
    const [stops, setStops] = useState<RouteStop[]>([
        { id: 'A', locationId: null, name: '', lat: 0, lng: 0, type: 'origin' },
        { id: 'B', locationId: null, name: '', lat: 0, lng: 0, type: 'destination' },
    ]);
    const [vehicleType, setVehicleType] = useState('6-wheel');
    const [weight, setWeight] = useState(10);
    const [timeWindow, setTimeWindow] = useState('morning');
    const [result, setResult] = useState<RouteResult | null>(null);
    const [routeLine, setRouteLine] = useState<[number, number][]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [leafletLib, setLeafletLib] = useState<any>(null);
    const [history, setHistory] = useState<RouteResult[]>([]);
    const [tab, setTab] = useState<'plan' | 'history'>('plan');
    const mapRef = useRef<any>(null);

    useEffect(() => {
        import('leaflet').then(L => setLeafletLib(L));
        api.getLocations().then(data => setLocations(data || [])).catch(() => {});
    }, []);

    const makeStopIcon = useCallback((type: string, label: string) => {
        if (!leafletLib) return undefined;
        const color = waypointColor[type] || '#3b82f6';
        const emoji = waypointEmoji[type] || '📍';
        return new leafletLib.DivIcon({
            html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-50%)">
                <div style="width:32px;height:32px;border-radius:50%;background:${color};border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.25)">${emoji}</div>
                <div style="background:${color};color:#fff;font-size:9px;font-weight:700;padding:1px 6px;border-radius:4px;white-space:nowrap;margin-top:2px;box-shadow:0 1px 3px rgba(0,0,0,0.3)">${label}</div>
            </div>`,
            className: '', iconSize: [80, 50], iconAnchor: [40, 25],
        });
    }, [leafletLib]);

    const setPreset = (preset: RoutePreset) => {
        const newStops: RouteStop[] = preset.stops.map((s, i) => ({
            id: String.fromCharCode(65 + i),
            locationId: null,
            name: s.name, lat: s.lat, lng: s.lng,
            type: i === 0 ? 'origin' : i === preset.stops.length - 1 ? 'destination' : 'waypoint',
        }));
        setStops(newStops);
        setVehicleType(preset.vehicleType);
        setWeight(preset.weight);
        setResult(null);
        setRouteLine([]);
        setError('');
    };

    const addStop = () => {
        const newId = String.fromCharCode(65 + stops.length);
        const last = stops[stops.length - 1];
        // Move last to waypoint, add new as destination
        setStops(prev => [
            ...prev.slice(0, -1).map((s, i) => ({ ...s, type: (i === 0 ? 'origin' : 'waypoint') as RouteStop['type'] })),
            { ...prev[prev.length - 1], type: 'waypoint' as RouteStop['type'] },
            { id: newId, locationId: null, name: '', lat: 0, lng: 0, type: 'destination' },
        ]);
    };

    const removeStop = (id: string) => {
        if (stops.length <= 2) return;
        const filtered = stops.filter(s => s.id !== id);
        setStops(filtered.map((s, i) => ({
            ...s, type: (i === 0 ? 'origin' : i === filtered.length - 1 ? 'destination' : 'waypoint') as RouteStop['type'],
        })));
    };

    const updateStop = (id: string, locId: string) => {
        const loc = locations.find(l => String(l.id) === locId);
        if (!loc) return;
        setStops(prev => prev.map(s => s.id === id
            ? { ...s, locationId: locId, name: loc.name, lat: loc.lat, lng: loc.lng }
            : s
        ));
    };

    const handleOptimize = async () => {
        const validStops = stops.filter(s => s.lat !== 0);
        if (validStops.length < 2) {
            setError('กรุณาเลือกต้นทางและปลายทาง');
            return;
        }
        setLoading(true);
        setError('');
        setResult(null);
        setRouteLine([]);

        try {
            const origin = stops[0];
            const dest   = stops[stops.length - 1];

            const [res, line] = await Promise.all([
                fetch(`${API_BASE}/ai/optimize-route`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        origin: origin.name, destination: dest.name,
                        vehicleType, weight, timeWindow,
                        originLat: origin.lat, originLng: origin.lng,
                        destLat: dest.lat, destLng: dest.lng,
                    }),
                }).then(r => r.json()),
                fetchOSRMRoute(validStops),
            ]);

            if (res.data) {
                setResult(res.data as RouteResult);
                setHistory(prev => [res.data, ...prev].slice(0, 5));
            }
            if (line.length > 0) {
                setRouteLine(line);
                // Fit map
                if (mapRef.current && leafletLib) {
                    const bounds = leafletLib.latLngBounds(line);
                    mapRef.current.fitBounds(bounds, { padding: [40, 40] });
                }
            }
        } catch {
            setError('ไม่สามารถเชื่อมต่อ API ได้ กรุณาตรวจสอบ backend');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStops([
            { id: 'A', locationId: null, name: '', lat: 0, lng: 0, type: 'origin' },
            { id: 'B', locationId: null, name: '', lat: 0, lng: 0, type: 'destination' },
        ]);
        setResult(null);
        setRouteLine([]);
        setError('');
    };

    const resultStops = result?.waypoints || [];

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Header + Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                    {['plan', 'history'].map(t => (
                        <button key={t} onClick={() => setTab(t as any)} style={{
                            padding: '7px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            fontWeight: 600, fontSize: '13px',
                            background: tab === t ? '#2563eb' : '#f1f5f9',
                            color: tab === t ? '#fff' : '#64748b',
                        }}>
                            {t === 'plan' ? '🗺️ วางแผนเส้นทาง' : `📋 ประวัติ (${history.length})`}
                        </button>
                    ))}
                </div>
                <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '13px', cursor: 'pointer' }}>
                    <RotateCcw size={13} /> ล้างข้อมูล
                </button>
            </div>

            {/* History Tab */}
            {tab === 'history' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {history.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                            <Route size={36} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
                            ยังไม่มีประวัติการวางแผนเส้นทาง
                        </div>
                    ) : history.map((h, i) => (
                        <div key={i} className="card" style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <Route size={16} color="#2563eb" />
                                <span style={{ fontWeight: 700, fontSize: '14px' }}>{h.waypoints[0]?.name} → {h.waypoints[h.waypoints.length - 1]?.name}</span>
                                <Chip color="#22c55e"><CheckCircle2 size={10} /> ประหยัด ฿{h.savings.toLocaleString()}</Chip>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b', flexWrap: 'wrap' }}>
                                <span>📏 {h.distance} กม.</span>
                                <span>⏱️ {h.duration}</span>
                                <span>⛽ ฿{h.fuelCost.toLocaleString()}</span>
                                <span>🛣️ ฿{h.tollCost.toLocaleString()}</span>
                                <span>🌿 {h.co2Emission} kg CO₂</span>
                                <span>🎯 Score: {h.optimizedScore}/100</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Plan Tab */}
            {tab === 'plan' && (
                <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '16px', minHeight: '75vh' }}>

                    {/* Left Panel — Input */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                        {/* Presets */}
                        <div className="card" style={{ padding: '14px' }}>
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>⚡ เส้นทางยอดนิยม</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {ROUTE_PRESETS.map((p, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPreset(p)}
                                        style={{
                                            textAlign: 'left', padding: '8px 12px', borderRadius: '8px',
                                            border: '1px solid #e2e8f0', background: '#f8fafc',
                                            cursor: 'pointer', fontSize: '12px', color: '#374151',
                                            fontWeight: 500, transition: 'all 0.15s',
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                        }}
                                    >
                                        <Route size={12} color="#2563eb" /> {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stops */}
                        <div className="card" style={{ padding: '14px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <MapPin size={14} color="#2563eb" /> จุดแวะ ({stops.length} จุด)
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {stops.map((stop, idx) => (
                                    <div key={stop.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                                            background: waypointColor[stop.type] || '#3b82f6',
                                            color: '#fff', fontSize: '11px', fontWeight: 700,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            {stop.id}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>
                                                {stop.type === 'origin' ? '🟢 ต้นทาง' : stop.type === 'destination' ? '🔴 ปลายทาง' : '📍 จุดแวะ'}
                                            </div>
                                            <select
                                                value={stop.locationId || ''}
                                                onChange={e => updateStop(stop.id, e.target.value)}
                                                style={{
                                                    width: '100%', padding: '7px 10px', border: '1.5px solid #e2e8f0',
                                                    borderRadius: '8px', fontSize: '12px', outline: 'none',
                                                    background: '#fff', fontFamily: 'inherit', cursor: 'pointer',
                                                }}
                                            >
                                                <option value="">— เลือกสถานที่ —</option>
                                                {locations.map(loc => (
                                                    <option key={loc.id} value={String(loc.id)}>{loc.name} ({loc.province})</option>
                                                ))}
                                            </select>
                                        </div>
                                        {stops.length > 2 && stop.type === 'waypoint' && (
                                            <button onClick={() => removeStop(stop.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px', display: 'flex' }}>
                                                <X size={14} />
                                            </button>
                                        )}
                                        {idx < stops.length - 1 && (
                                            <div style={{ position: 'absolute', left: '26px', marginTop: '36px' }}>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {stops.length < 6 && (
                                    <button
                                        onClick={addStop}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '5px',
                                            padding: '7px 12px', borderRadius: '8px',
                                            border: '1.5px dashed #cbd5e1', background: 'transparent',
                                            color: '#2563eb', fontSize: '12px', fontWeight: 600,
                                            cursor: 'pointer', width: '100%', justifyContent: 'center',
                                        }}
                                    >
                                        <Plus size={13} /> เพิ่มจุดแวะ
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Vehicle Config */}
                        <div className="card" style={{ padding: '14px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Truck size={14} color="#8b5cf6" /> ประเภทรถ & น้ำหนัก
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'block' }}>ประเภทรถ</label>
                                    <select
                                        value={vehicleType}
                                        onChange={e => setVehicleType(e.target.value)}
                                        style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff', fontFamily: 'inherit' }}
                                    >
                                        {[
                                            { v: '6-wheel', l: '🚚 รถ 6 ล้อ (น้ำหนักเบา)' },
                                            { v: '10-wheel', l: '🚛 รถ 10 ล้อ (กลาง)' },
                                            { v: '18-wheeler', l: '🚜 รถ 18 ล้อ (หนัก)' },
                                            { v: 'refrigerated', l: '❄️ รถห้องเย็น' },
                                            { v: 'tanker', l: '🛢️ รถบรรทุกน้ำมัน' },
                                        ].map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'block' }}>
                                        น้ำหนักบรรทุก: <strong style={{ color: '#1e293b' }}>{weight} ตัน</strong>
                                    </label>
                                    <input
                                        type="range" min={1} max={30} value={weight}
                                        onChange={e => setWeight(Number(e.target.value))}
                                        style={{ width: '100%', accentColor: '#8b5cf6' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
                                        <span>1 ตัน</span><span>30 ตัน</span>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'block' }}>ช่วงเวลาออกเดินทาง</label>
                                    <select
                                        value={timeWindow}
                                        onChange={e => setTimeWindow(e.target.value)}
                                        style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff', fontFamily: 'inherit' }}
                                    >
                                        <option value="morning">🌅 เช้า (06:00–10:00) — ทราฟฟิกน้อย</option>
                                        <option value="daytime">☀️ กลางวัน (10:00–16:00)</option>
                                        <option value="evening">🌆 เย็น (16:00–20:00) — ทราฟฟิกสูง</option>
                                        <option value="night">🌙 กลางคืน (20:00–06:00) — เร็วที่สุด</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Optimize Button */}
                        <button
                            onClick={handleOptimize}
                            disabled={loading}
                            style={{
                                padding: '14px', borderRadius: '12px', border: 'none',
                                background: loading ? '#e2e8f0' : 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                                color: loading ? '#94a3b8' : '#fff',
                                fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.3)',
                                transition: 'all 0.2s',
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#94a3b8', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                                    กำลังวิเคราะห์เส้นทาง...
                                </>
                            ) : (
                                <><Zap size={18} /> เริ่มวิเคราะห์เส้นทาง</>
                            )}
                        </button>

                        {error && (
                            <div style={{ padding: '12px 14px', background: '#fee2e2', borderRadius: '10px', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '13px', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
                            </div>
                        )}
                    </div>

                    {/* Right Panel — Map + Results */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>

                        {/* Map */}
                        <div className="card" style={{ padding: 0, overflow: 'hidden', flex: 1, minHeight: '400px', position: 'relative' }}>
                            {typeof window !== 'undefined' && (
                                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                            )}
                            {!result && !loading && (
                                <div style={{
                                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                                    zIndex: 500, background: 'rgba(255,255,255,0.92)', borderRadius: '14px',
                                    padding: '20px 28px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                                    backdropFilter: 'blur(4px)',
                                }}>
                                    <Route size={32} color="#2563eb" style={{ margin: '0 auto 8px', display: 'block' }} />
                                    <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '4px', fontSize: '15px' }}>เลือกเส้นทางแล้วกด วิเคราะห์</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>ระบบจะแสดงเส้นทาง + จุดแวะพร้อมต้นทุน</div>
                                </div>
                            )}
                            {typeof window !== 'undefined' && (
                                <MapContainer
                                    center={[13.5, 101.0]}
                                    zoom={6}
                                    style={{ height: '100%', width: '100%', minHeight: '400px' }}
                                    scrollWheelZoom
                                    ref={(m: any) => { mapRef.current = m; }}
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />

                                    {/* OSRM route line */}
                                    {routeLine.length > 0 && (
                                        <>
                                            {/* Shadow line */}
                                            <Polyline positions={routeLine} pathOptions={{ color: '#1e40af', weight: 8, opacity: 0.15 }} />
                                            {/* Remaining route */}
                                            <Polyline positions={routeLine} pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.9 }} />
                                        </>
                                    )}

                                    {/* API waypoints */}
                                    {resultStops.map((wp, i) => leafletLib && (
                                        <React.Fragment key={i}>
                                            <CircleMarker
                                                center={[wp.lat, wp.lng]}
                                                radius={8}
                                                pathOptions={{
                                                    color: '#fff', weight: 2,
                                                    fillColor: waypointColor[wp.type] || '#3b82f6',
                                                    fillOpacity: 1,
                                                }}
                                            >
                                                <Popup>
                                                    <div style={{ fontSize: '13px', fontWeight: 600, minWidth: '160px' }}>
                                                        {waypointEmoji[wp.type]} {wp.name}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#64748b' }}>ETA: {wp.eta}</div>
                                                </Popup>
                                            </CircleMarker>
                                        </React.Fragment>
                                    ))}

                                    {/* Input stop markers */}
                                    {stops.filter(s => s.lat !== 0).map(stop => leafletLib && (
                                        <Marker
                                            key={stop.id}
                                            position={[stop.lat, stop.lng]}
                                            icon={makeStopIcon(stop.type, stop.name.split(' ')[0])}
                                        >
                                            <Popup>
                                                <div style={{ fontSize: '13px', fontWeight: 600 }}>{stop.name}</div>
                                                <div style={{ fontSize: '11px', color: '#64748b' }}>{stop.type === 'origin' ? 'ต้นทาง' : stop.type === 'destination' ? 'ปลายทาง' : 'จุดแวะ'}</div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            )}
                        </div>

                        {/* Results */}
                        {result && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {/* Score Badge */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800 }}>
                                        {result.optimizedScore}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#1e40af', fontSize: '14px' }}>Optimization Score — เส้นทางถูกวิเคราะห์แล้ว ✅</div>
                                        <div style={{ fontSize: '12px', color: '#3b82f6' }}>{result.algorithm}</div>
                                    </div>
                                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>ประหยัดเพิ่ม</div>
                                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a' }}>฿{result.savings.toLocaleString()}</div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '10px' }}>
                                    <StatCard icon={<Route size={18} />} color="#3b82f6" label="ระยะทาง" value={`${result.distance} กม.`} sub="รวม waypoints" />
                                    <StatCard icon={<Clock size={18} />} color="#8b5cf6" label="เวลาเดินทาง" value={result.duration} sub={`ออกเดินทาง ${timeWindow}`} />
                                    <StatCard icon={<Fuel size={18} />} color="#f59e0b" label="ค่าน้ำมัน" value={`฿${result.fuelCost.toLocaleString()}`} sub="@ ฿33.5/L" savings={`฿${Math.round(result.savings * 0.7).toLocaleString()}`} />
                                    <StatCard icon={<Navigation size={18} />} color="#64748b" label="ค่าทางด่วน" value={`฿${result.tollCost.toLocaleString()}`} />
                                    <StatCard icon={<DollarSign size={18} />} color="#ef4444" label="ต้นทุนรวม" value={`฿${result.totalCost.toLocaleString()}`} savings={`฿${result.savings.toLocaleString()}`} />
                                    <StatCard icon={<Leaf size={18} />} color="#22c55e" label="CO₂ ปล่อย" value={`${result.co2Emission} kg`} sub="ต่อการเดินทางนี้" />
                                </div>

                                {/* Waypoints Timeline */}
                                <div className="card" style={{ padding: '14px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <MapPin size={14} color="#2563eb" /> เส้นทางแนะนำ ({result.waypoints.length} จุด)
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                        {result.waypoints.map((wp, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                {/* Timeline dot */}
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <div style={{
                                                        width: '28px', height: '28px', borderRadius: '50%',
                                                        background: waypointColor[wp.type] || '#3b82f6',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '12px', flexShrink: 0, color: '#fff', fontWeight: 700,
                                                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                                    }}>
                                                        {waypointEmoji[wp.type]}
                                                    </div>
                                                    {i < result.waypoints.length - 1 && (
                                                        <div style={{ width: '2px', height: '24px', background: '#e2e8f0', margin: '3px 0' }} />
                                                    )}
                                                </div>
                                                {/* Content */}
                                                <div style={{ flex: 1, paddingBottom: '12px' }}>
                                                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>{wp.name}</div>
                                                    <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                        <span>ETA: <strong style={{ color: '#64748b' }}>{wp.eta}</strong></span>
                                                        <span style={{ color: waypointColor[wp.type] }}>
                                                            {wp.type === 'origin' ? 'จุดออกเดินทาง' : wp.type === 'destination' ? 'ปลายทาง' : wp.type === 'fuel_stop' ? '⛽ แวะเติมน้ำมัน' : '🛑 จุดพักคนขับ (HOS)'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Savings Breakdown */}
                                <div style={{ padding: '12px 16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#15803d', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <TrendingDown size={14} /> การประหยัดจากการ Optimize
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '12px' }}>
                                        {[
                                            { label: '🛣️ ลดระยะทาง', value: `~${Math.round(result.distance * 0.08)} กม.` },
                                            { label: '⛽ ประหยัดน้ำมัน', value: `~${Math.round(result.savings * 0.7).toLocaleString()} ฿` },
                                            { label: '🌿 ลด CO₂', value: `~${(result.co2Emission * 0.12).toFixed(1)} kg` },
                                        ].map((item, i) => (
                                            <div key={i} style={{ background: '#fff', borderRadius: '8px', padding: '8px 10px', border: '1px solid #dcfce7' }}>
                                                <div style={{ color: '#94a3b8', fontSize: '11px' }}>{item.label}</div>
                                                <div style={{ fontWeight: 700, color: '#16a34a' }}>{item.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
