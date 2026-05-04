'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
    MapPin, Truck, CheckCircle, Clock, Navigation,
    Package, Phone, RefreshCcw, ExternalLink, Eye, Copy, Share2,
    Route, Gauge, Fuel, AlertCircle, Info
} from 'lucide-react';
import { api, Trip } from '@/services/api';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer    = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker       = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup        = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });
const Polyline     = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(m => m.CircleMarker), { ssr: false });

const API_BASE = typeof window !== 'undefined'
    ? `http://${window.location.hostname}:8081/api/v1`
    : '';

const WS_HOST = typeof window !== 'undefined'
    ? `ws://${window.location.hostname}:8081/ws/gps`
    : '';

// ── Types ──────────────────────────────────────────────────────────────────────
interface TrackTrip extends Trip {
    trackingToken: string;
    customerName?: string;
    orderRef?: string;
}

type TripStatusKey = 'pending' | 'loading' | 'in-transit' | 'delivered' | 'cancelled';

const STATUS_CONFIG: Record<TripStatusKey, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
    pending:    { label: 'รอดำเนินการ', color: '#64748b', bg: '#f1f5f9',   icon: <Clock size={14} /> },
    loading:    { label: 'กำลังโหลดสินค้า', color: '#d97706', bg: '#fffbeb', icon: <Package size={14} /> },
    'in-transit': { label: 'กำลังขนส่ง', color: '#2563eb', bg: '#eff6ff',  icon: <Truck size={14} /> },
    delivered:  { label: 'ส่งสำเร็จ', color: '#16a34a', bg: '#f0fdf4',    icon: <CheckCircle size={14} /> },
    cancelled:  { label: 'ยกเลิก', color: '#dc2626', bg: '#fef2f2',        icon: <AlertCircle size={14} /> },
};

function makeToken(tripId: string): string {
    return btoa(tripId + ':' + Date.now()).replace(/=/g, '').slice(0, 24);
}

// ── Tracking Link Generator ───────────────────────────────────────────────────
function TokenCard({ trip }: { trip: TrackTrip }) {
    const [copied, setCopied] = useState(false);
    const trackUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/track/${trip.trackingToken}`
        : `/track/${trip.trackingToken}`;

    const copy = () => {
        navigator.clipboard.writeText(trackUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>🔗 Tracking Link (สาธารณะ)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <code style={{ fontSize: '11px', color: '#334155', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    /track/{trip.trackingToken}
                </code>
                <button onClick={copy} style={{ background: copied ? '#f0fdf4' : '#eff6ff', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: copied ? '#16a34a' : '#2563eb', fontSize: '11px', fontWeight: 600, flexShrink: 0 }}>
                    <Copy size={11} style={{ display: 'inline', marginRight: 2 }} /> {copied ? 'คัดลอก!' : 'คัดลอก'}
                </button>
            </div>
        </div>
    );
}

// ── Progress Steps ────────────────────────────────────────────────────────────
const STEPS: { key: TripStatusKey; label: string }[] = [
    { key: 'pending',    label: 'รับคำสั่ง' },
    { key: 'loading',    label: 'โหลดสินค้า' },
    { key: 'in-transit', label: 'ระหว่างขนส่ง' },
    { key: 'delivered',  label: 'ส่งสำเร็จ' },
];

function ProgressStepper({ status }: { status: string }) {
    const stepIdx = STEPS.findIndex(s => s.key === status);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '10px 0' }}>
            {STEPS.map((step, i) => {
                const done = i < stepIdx;
                const active = i === stepIdx;
                return (
                    <React.Fragment key={step.key}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                            <div style={{
                                width: '28px', height: '28px', borderRadius: '50%', fontSize: '11px', fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: done ? '#16a34a' : active ? '#2563eb' : '#e2e8f0',
                                color: done || active ? '#fff' : '#94a3b8',
                                boxShadow: active ? '0 0 0 3px rgba(37,99,235,0.2)' : 'none',
                            }}>
                                {done ? '✓' : i + 1}
                            </div>
                            <div style={{ fontSize: '10px', marginTop: '4px', fontWeight: active ? 700 : 400, color: active ? '#2563eb' : done ? '#16a34a' : '#94a3b8', textAlign: 'center' }}>
                                {step.label}
                            </div>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div style={{ height: '2px', flex: 1, background: i < stepIdx ? '#16a34a' : '#e2e8f0', marginBottom: '16px', transition: 'background 0.3s' }} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// ── Trip Card ─────────────────────────────────────────────────────────────────
function TripCard({ trip, selected, onSelect, liveData }: {
    trip: TrackTrip; selected: boolean;
    onSelect: (t: TrackTrip) => void;
    liveData?: { lat: number; lng: number; speed: number; progress: number };
}) {
    const sc = STATUS_CONFIG[trip.status as TripStatusKey] || STATUS_CONFIG.pending;
    const progress = liveData?.progress ?? trip.progress ?? 0;

    return (
        <div
            onClick={() => onSelect(trip)}
            style={{
                padding: '14px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
                border: `2px solid ${selected ? '#2563eb' : '#e2e8f0'}`,
                background: selected ? '#eff6ff' : '#fff',
                boxShadow: selected ? '0 2px 8px rgba(37,99,235,0.12)' : '0 1px 3px rgba(0,0,0,0.05)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{trip.id.slice(0, 8)}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{trip.orderId?.slice(0, 12)}</div>
                </div>
                <span style={{ background: sc.bg, color: sc.color, padding: '3px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    {sc.icon}{sc.label}
                </span>
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                <MapPin size={11} /> {trip.origin} → {trip.destination}
            </div>
            {/* Progress bar */}
            <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: '#2563eb', borderRadius: '2px', transition: 'width 0.5s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                <span>ความคืบหน้า {Math.round(progress)}%</span>
                {liveData && <span>🚛 {liveData.speed} km/h</span>}
            </div>
            <div style={{ marginTop: '8px' }}>
                <TokenCard trip={trip} />
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CustomerTrackingPage() {
    const [trips, setTrips] = useState<TrackTrip[]>([]);
    const [selected, setSelected] = useState<TrackTrip | null>(null);
    const [loading, setLoading] = useState(false);
    const [liveMap, setLiveMap] = useState<Record<string, { lat: number; lng: number; speed: number; progress: number }>>({});
    const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');
    const [leafletLib, setLeafletLib] = useState<any>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const mapRef = useRef<any>(null);

    useEffect(() => { import('leaflet').then(L => setLeafletLib(L)); }, []);

    const loadTrips = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getTrips();
            const active = (data || [])
                .filter((t: Trip) => t.status !== 'cancelled')
                .map((t: Trip) => ({
                    ...t,
                    trackingToken: makeToken(t.id),
                    customerName: t.origin + ' → ' + t.destination,
                }));
            setTrips(active);
            if (!selected && active.length > 0) setSelected(active[0]);
        } catch {}
        setLoading(false);
    }, [selected]);

    useEffect(() => { loadTrips(); }, []);

    // WebSocket GPS
    useEffect(() => {
        if (!WS_HOST) return;
        const connect = () => {
            setWsStatus('connecting');
            const ws = new WebSocket(WS_HOST);
            wsRef.current = ws;
            ws.onopen = () => setWsStatus('connected');
            ws.onmessage = (event) => {
                try {
                    const u = JSON.parse(event.data);
                    if (u.type === 'gps_update') {
                        setLiveMap(prev => ({
                            ...prev,
                            [u.tripId]: { lat: u.lat, lng: u.lng, speed: u.speed, progress: u.progress },
                        }));
                        // Update trip progress
                        setTrips(prev => prev.map(t =>
                            t.id === u.tripId ? { ...t, progress: u.progress, currentLat: u.lat, currentLng: u.lng } : t
                        ));
                    }
                } catch {}
            };
            ws.onclose = () => { setWsStatus('offline'); setTimeout(connect, 5000); };
            ws.onerror = () => ws.close();
        };
        connect();
        return () => wsRef.current?.close();
    }, []);

    const makeTruckIcon = useCallback((status: string) => {
        if (!leafletLib) return undefined;
        const color = status === 'in-transit' ? '#2563eb' : status === 'delivered' ? '#16a34a' : '#94a3b8';
        return new leafletLib.DivIcon({
            html: `<div style="width:32px;height:32px;border-radius:50%;background:${color};border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🚛</div>`,
            className: '', iconSize: [32, 32], iconAnchor: [16, 16],
        });
    }, [leafletLib]);

    const selectedLive = selected ? liveMap[selected.id] : null;
    const mapCenter: [number, number] = selectedLive
        ? [selectedLive.lat, selectedLive.lng]
        : selected?.currentLat ? [selected.currentLat, selected.currentLng]
        : [13.5, 101.0];

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Header bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: wsStatus === 'connected' ? '#16a34a' : wsStatus === 'connecting' ? '#d97706' : '#dc2626' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', animation: wsStatus === 'connected' ? 'pulse 2s infinite' : 'none' }} />
                    {wsStatus === 'connected' ? 'GPS Live' : wsStatus === 'connecting' ? 'กำลังเชื่อมต่อ...' : 'ออฟไลน์'}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{trips.length} ทริปที่ติดตาม</div>
                <button onClick={loadTrips} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '12px', color: '#64748b' }}>
                    <RefreshCcw size={12} /> รีเฟรช
                </button>
            </div>

            {/* Info banner */}
            <div style={{ padding: '10px 14px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe', display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '12px', color: '#1e40af' }}>
                <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                    <strong>Customer Tracking Portal</strong> — แต่ละทริปมี Tracking Link สาธารณะที่คัดลอกส่งให้ลูกค้าได้ทันที
                    ลูกค้าสามารถติดตามสถานะพัสดุแบบ Real-time ผ่านหน้าเว็บโดยไม่ต้องล็อกอิน
                </div>
            </div>

            {/* Main layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '12px', minHeight: '65vh' }}>

                {/* Trip List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '70vh', paddingRight: '4px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>กำลังโหลด...</div>
                    ) : trips.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            <Truck size={32} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
                            ไม่มีทริปที่กำลังดำเนินการ
                        </div>
                    ) : trips.map(trip => (
                        <TripCard
                            key={trip.id}
                            trip={trip}
                            selected={selected?.id === trip.id}
                            onSelect={setSelected}
                            liveData={liveMap[trip.id]}
                        />
                    ))}
                </div>

                {/* Map + Detail */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Map */}
                    <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', minHeight: '360px', position: 'relative' }}>
                        {typeof window !== 'undefined' && (
                            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                        )}
                        {typeof window !== 'undefined' && (
                            <MapContainer
                                center={mapCenter}
                                zoom={selected?.currentLat ? 11 : 6}
                                style={{ height: '100%', width: '100%', minHeight: '360px' }}
                                scrollWheelZoom
                                ref={(m: any) => { mapRef.current = m; }}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />

                                {/* All active trucks */}
                                {trips.filter(t => t.currentLat).map(trip => {
                                    const live = liveMap[trip.id];
                                    const lat = live?.lat ?? trip.currentLat;
                                    const lng = live?.lng ?? trip.currentLng;
                                    if (!lat) return null;
                                    return leafletLib ? (
                                        <Marker
                                            key={trip.id}
                                            position={[lat, lng]}
                                            icon={makeTruckIcon(trip.status)}
                                        >
                                            <Popup>
                                                <div style={{ fontSize: '13px', fontWeight: 700 }}>{trip.id.slice(0, 8)}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>{trip.origin} → {trip.destination}</div>
                                                {live && <div style={{ fontSize: '12px' }}>🚛 {live.speed} km/h · {Math.round(live.progress)}%</div>}
                                            </Popup>
                                        </Marker>
                                    ) : null;
                                })}
                            </MapContainer>
                        )}
                    </div>

                    {/* Detail Panel */}
                    {selected && (
                        <div className="card" style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '15px' }}>ทริป {selected.id.slice(0, 8)}</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>คำสั่งขนส่ง: {selected.orderId?.slice(0, 12)}</div>
                                </div>
                                {(() => {
                                    const sc = STATUS_CONFIG[selected.status as TripStatusKey] || STATUS_CONFIG.pending;
                                    return (
                                        <span style={{ background: sc.bg, color: sc.color, padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {sc.icon} {sc.label}
                                        </span>
                                    );
                                })()}
                            </div>

                            {/* Progress Stepper */}
                            <ProgressStepper status={selected.status} />

                            {/* Info Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginTop: '12px' }}>
                                {[
                                    { icon: <MapPin size={14} />, label: 'ต้นทาง', value: selected.origin, color: '#16a34a' },
                                    { icon: <MapPin size={14} />, label: 'ปลายทาง', value: selected.destination, color: '#dc2626' },
                                    { icon: <Route size={14} />, label: 'ระยะทาง', value: `${selected.distance || 0} กม.`, color: '#2563eb' },
                                    { icon: <Clock size={14} />, label: 'ETA', value: selected.estimatedArrival?.slice(11, 16) || '—', color: '#8b5cf6' },
                                ].map((item, i) => (
                                    <div key={i} style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#94a3b8', marginBottom: '3px' }}>
                                            <span style={{ color: item.color }}>{item.icon}</span> {item.label}
                                        </div>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Live stats */}
                            {selectedLive && (
                                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                    {[
                                        { label: 'ความเร็ว', value: `${selectedLive.speed} km/h`, color: '#2563eb' },
                                        { label: 'ความคืบหน้า', value: `${Math.round(selectedLive.progress)}%`, color: '#16a34a' },
                                    ].map((s, i) => (
                                        <div key={i} style={{ flex: 1, padding: '8px 12px', background: `${s.color}0d`, border: `1px solid ${s.color}20`, borderRadius: '8px' }}>
                                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>{s.label}</div>
                                            <div style={{ fontSize: '16px', fontWeight: 700, color: s.color }}>{s.value}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </div>
    );
}
