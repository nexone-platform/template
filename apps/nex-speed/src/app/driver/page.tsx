'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    MapPin, Navigation, Phone, Camera, CheckCircle, Clock,
    Truck, Package, AlertTriangle, ChevronRight, User, LogOut,
    Play, FileText, Send, Fuel, Route, MessageCircle, Eye, EyeOff, Lock,
    Crosshair, Home, ScanLine, Receipt
} from 'lucide-react';
import './driver.css';
import dynamic from 'next/dynamic';
import { PWAInstallBanner, OfflineBanner, UpdateBanner } from '@/components/PWAManager';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(m => m.CircleMarker), { ssr: false });

// Smart map controller: auto-follows GPS but stops when user interacts
const MapController = dynamic(
    () => import('react-leaflet').then(mod => {
        const Controller = ({ lat, lng, following, onUserInteract, mapRef }: {
            lat: number; lng: number; following: boolean; onUserInteract: () => void;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mapRef?: React.MutableRefObject<any>;
        }) => {
            const map = mod.useMap();
            const isUserAction = React.useRef(false);

            // Expose map instance via ref
            React.useEffect(() => {
                if (mapRef) mapRef.current = map;
            }, [map, mapRef]);

            React.useEffect(() => {
                // Detect user drag/zoom → stop auto-following
                const onMoveStart = () => {
                    if (!isUserAction.current) {
                        isUserAction.current = true;
                    } else {
                        onUserInteract();
                    }
                };
                map.on('dragstart', onMoveStart);
                map.on('zoomstart', () => {
                    // Only trigger if it's a user-initiated zoom (not programmatic)
                    isUserAction.current = true;
                });
                return () => {
                    map.off('dragstart', onMoveStart);
                };
            }, [map, onUserInteract]);

            React.useEffect(() => {
                if (following && lat && lng) {
                    isUserAction.current = false;
                    map.setView([lat, lng], map.getZoom(), { animate: true });
                }
            }, [lat, lng, following, map]);

            return null;
        };
        Controller.displayName = 'MapController';
        return Controller;
    }),
    { ssr: false }
);

// Auto-fit map to bounds of origin/destination
const FitBounds = dynamic(
    () => import('react-leaflet').then(mod => {
        const Fitter = ({ bounds }: { bounds: [number, number][] }) => {
            const map = mod.useMap();
            React.useEffect(() => {
                if (bounds.length >= 2) {
                    const L = require('leaflet');
                    map.fitBounds(L.latLngBounds(bounds), { padding: [30, 30], maxZoom: 12 });
                } else if (bounds.length === 1) {
                    map.setView(bounds[0], 10);
                }
            }, [map, bounds]);
            return null;
        };
        Fitter.displayName = 'FitBounds';
        return Fitter;
    }),
    { ssr: false }
);

// Types
interface DriverTrip {
    id: string; orderId: string; driverId: string; origin: string; destination: string;
    distance: number; progress: number; status: string;
    currentLat: number; currentLng: number;
    originLat: number; originLng: number;
    destLat: number; destLng: number;
    scheduledDeparture?: string; estimatedArrival?: string;
}

// Haversine distance calculator
function calcDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface DriverProfile {
    id: string; name: string; phone: string; licenseType: string;
    status: string; safetyScore: number; hoursToday: number; totalTrips: number;
    vehicleId?: string;
}

const API_BASE = typeof window !== 'undefined' ? `http://${window.location.hostname}:8081/api/v1` : 'http://localhost:8081/api/v1';

// ============================================
// IMAGE COMPRESSION (≤1MB)
// ============================================
function compressImage(file: File, maxSizeKB = 1024): Promise<{ dataUrl: string; blob: Blob }> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Scale down if very large
                let w = img.width, h = img.height;
                const maxDim = 1920;
                if (w > maxDim || h > maxDim) {
                    const ratio = Math.min(maxDim / w, maxDim / h);
                    w = Math.round(w * ratio);
                    h = Math.round(h * ratio);
                }
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, 0, 0, w, h);
                // Iteratively reduce quality until ≤ maxSizeKB
                let quality = 0.85;
                let dataUrl = canvas.toDataURL('image/jpeg', quality);
                while (dataUrl.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) {
                    quality -= 0.1;
                    dataUrl = canvas.toDataURL('image/jpeg', quality);
                }
                canvas.toBlob((blob) => {
                    resolve({ dataUrl, blob: blob! });
                }, 'image/jpeg', quality);
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
}

function makeFilename(vehicleId: string, type: string): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    return `${vehicleId || 'TRUCK'}_${ts}_${type}`;
}

// ============================================
// SIGNATURE PAD COMPONENT
// ============================================
function SignaturePad({ onSave, onClose }: { onSave: (dataUrl: string, filename: string) => void; onClose: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);

    const getPos = (e: React.TouchEvent | React.MouseEvent) => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        if ('touches' in e) {
            return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        }
        return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
    };

    const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        isDrawing.current = true;
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            const { x, y } = getPos(e);
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    };

    const draw = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        if (!isDrawing.current) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            const { x, y } = getPos(e);
            ctx.lineTo(x, y);
            ctx.strokeStyle = '#1e3a5f';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        }
    };

    const endDraw = () => { isDrawing.current = false; };

    const clearPad = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    };

    // Init white background
    React.useEffect(() => {
        clearPad();
    }, []);

    const handleSave = () => {
        const dataUrl = canvasRef.current?.toDataURL('image/png') || '';
        onSave(dataUrl, 'signature');
    };

    return (
        <div className="driver-signature-overlay">
            <div className="driver-signature-modal">
                <div className="driver-signature-header">
                    <h3>✍️ ลายเซ็นผู้รับสินค้า</h3>
                    <button className="driver-signature-close" onClick={onClose}>✕</button>
                </div>
                <div className="driver-signature-canvas-wrap">
                    <canvas
                        ref={canvasRef}
                        width={360}
                        height={200}
                        onMouseDown={startDraw}
                        onMouseMove={draw}
                        onMouseUp={endDraw}
                        onMouseLeave={endDraw}
                        onTouchStart={startDraw}
                        onTouchMove={draw}
                        onTouchEnd={endDraw}
                    />
                    <p className="driver-signature-hint">กรุณาเซ็นชื่อในกรอบด้านบน</p>
                </div>
                <div className="driver-btn-row">
                    <button className="driver-btn-outline" onClick={clearPad}>🗑️ ล้าง</button>
                    <button className="driver-btn-primary" onClick={handleSave}>💾 บันทึก</button>
                </div>
            </div>
        </div>
    );
}

// ============================================
// ePOD FORM COMPONENT
// ============================================
interface EpodData {
    productPhotoUrl?: string;
    deliveryPhotoUrl?: string;
    signatureUrl?: string;
    receiverName?: string;
    notes?: string;
}
function EpodForm({ currentTrip, driver, epodReceiver, setEpodReceiver, epodNote, setEpodNote, loading, onSubmit, savedData, isReadOnly }: {
    currentTrip: DriverTrip | null;
    driver: DriverProfile | null;
    epodReceiver: string;
    setEpodReceiver: (v: string) => void;
    epodNote: string;
    setEpodNote: (v: string) => void;
    loading: boolean;
    onSubmit: (data: { productPhoto?: string; deliveryPhoto?: string; signature?: string }) => void;
    savedData?: EpodData;
    isReadOnly?: boolean;
}) {
    const [productPhoto, setProductPhoto] = useState<{ dataUrl: string; filename: string } | null>(null);
    const [deliveryPhoto, setDeliveryPhoto] = useState<{ dataUrl: string; filename: string } | null>(null);
    const [signatureImg, setSignatureImg] = useState<{ dataUrl: string; filename: string } | null>(null);
    const [previewImg, setPreviewImg] = useState<string | null>(null);
    const [showSignPad, setShowSignPad] = useState(false);

    const productInputRef = useRef<HTMLInputElement>(null);
    const deliveryInputRef = useRef<HTMLInputElement>(null);

    // Load saved data on mount
    React.useEffect(() => {
        if (savedData) {
            if (savedData.productPhotoUrl) setProductPhoto({ dataUrl: savedData.productPhotoUrl, filename: 'saved_product' });
            if (savedData.deliveryPhotoUrl) setDeliveryPhoto({ dataUrl: savedData.deliveryPhotoUrl, filename: 'saved_delivery' });
            if (savedData.signatureUrl) setSignatureImg({ dataUrl: savedData.signatureUrl, filename: 'saved_signature' });
        }
    }, [savedData]);

    const handleCapture = async (file: File, type: 'product' | 'delivery') => {
        const { dataUrl } = await compressImage(file);
        const filename = makeFilename(driver?.vehicleId || currentTrip?.id || 'TRUCK', type);
        if (type === 'product') setProductPhoto({ dataUrl, filename });
        else setDeliveryPhoto({ dataUrl, filename });
    };

    const [showCamera, setShowCamera] = useState<{ type: 'product' | 'delivery' | 'scan-job' | 'fuel-bill' } | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const forceOpenCamera = async (type: 'product' | 'delivery') => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
            streamRef.current = stream;
            setShowCamera({ type });
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            }, 100);
        } catch {
            // Fallback to file input
            if (type === 'product') productInputRef.current?.click();
            else deliveryInputRef.current?.click();
        }
    };

    const captureFromVideo = () => {
        if (!videoRef.current || !showCamera) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const fn = makeFilename(driver?.vehicleId || currentTrip?.id || 'TRUCK', showCamera.type);
        if (showCamera.type === 'product') setProductPhoto({ dataUrl, filename: fn });
        else if (showCamera.type === 'delivery') setDeliveryPhoto({ dataUrl, filename: fn });
        stopCamera();
    };

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        setShowCamera(null);
    };

    const handleSignatureSave = (dataUrl: string) => {
        const filename = makeFilename(driver?.vehicleId || currentTrip?.id || 'TRUCK', 'signature');
        setSignatureImg({ dataUrl, filename });
        setShowSignPad(false);
    };

    const handleSubmitClick = () => {
        onSubmit({
            productPhoto: productPhoto?.dataUrl,
            deliveryPhoto: deliveryPhoto?.dataUrl,
            signature: signatureImg?.dataUrl,
        });
    };

    return (
        <>
            <div className="driver-card">
                <div className="driver-card-title">📍 จุดหมาย</div>
                <p className="driver-card-value">{currentTrip?.destination || '-'}</p>
            </div>

            <div className="driver-card">
                <div className="driver-card-title">ชื่อผู้รับสินค้า *</div>
                <input
                    type="text"
                    className="driver-input"
                    value={epodReceiver}
                    onChange={e => setEpodReceiver(e.target.value)}
                    placeholder="ชื่อ-นามสกุล ผู้รับ"
                    readOnly={isReadOnly}
                />
            </div>

            <div className="driver-card">
                <div className="driver-card-title">📸 ถ่ายรูปหลักฐาน</div>
                <div className="driver-photo-grid">
                    {/* Product Photo */}
                    {!isReadOnly && <input ref={productInputRef} type="file" accept="image/*" capture="environment" hidden
                        onChange={e => { if (e.target.files?.[0]) handleCapture(e.target.files[0], 'product'); }} />}
                    {productPhoto ? (
                        <div className="driver-photo-thumb" onClick={() => setPreviewImg(productPhoto.dataUrl)}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={productPhoto.dataUrl} alt="product" />
                            <span className="driver-photo-label">📷 ภาพสินค้า</span>
                            {!isReadOnly && <button className="driver-photo-retake" onClick={(e) => { e.stopPropagation(); setProductPhoto(null); productInputRef.current?.click(); }}>📸</button>}
                        </div>
                    ) : (
                        <button className="driver-photo-btn" onClick={() => productInputRef.current?.click()} disabled={isReadOnly}>
                            <Camera size={24} />
                            <span>ภาพสินค้า</span>
                        </button>
                    )}

                    {/* Delivery Note Photo */}
                    {!isReadOnly && <input ref={deliveryInputRef} type="file" accept="image/*" capture="environment" hidden
                        onChange={e => { if (e.target.files?.[0]) handleCapture(e.target.files[0], 'delivery'); }} />}
                    {deliveryPhoto ? (
                        <div className="driver-photo-thumb" onClick={() => setPreviewImg(deliveryPhoto.dataUrl)}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={deliveryPhoto.dataUrl} alt="delivery" />
                            <span className="driver-photo-label">📋 ใบส่งของ</span>
                            {!isReadOnly && <button className="driver-photo-retake" onClick={(e) => { e.stopPropagation(); setDeliveryPhoto(null); deliveryInputRef.current?.click(); }}>📸</button>}
                        </div>
                    ) : (
                        <button className="driver-photo-btn" onClick={() => deliveryInputRef.current?.click()} disabled={isReadOnly}>
                            <FileText size={24} />
                            <span>ใบส่งของ</span>
                        </button>
                    )}

                    {/* Signature */}
                    {signatureImg ? (
                        <div className="driver-photo-thumb" onClick={() => setPreviewImg(signatureImg.dataUrl)}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={signatureImg.dataUrl} alt="signature" />
                            <span className="driver-photo-label">✍️ ลายเซ็น</span>
                            {!isReadOnly && <button className="driver-photo-retake" onClick={(e) => { e.stopPropagation(); setShowSignPad(true); }}>✍️</button>}
                        </div>
                    ) : (
                        <button className="driver-photo-btn" onClick={() => setShowSignPad(true)} disabled={isReadOnly}>
                            <User size={24} />
                            <span>ลายเซ็น</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="driver-card">
                <div className="driver-card-title">หมายเหตุ</div>
                <textarea
                    className="driver-input driver-textarea"
                    value={epodNote}
                    onChange={e => setEpodNote(e.target.value)}
                    placeholder="บันทึกเพิ่มเติม (ถ้ามี)..."
                    rows={3}
                    readOnly={isReadOnly}
                />
            </div>

            {!isReadOnly && (
                <button
                    className="driver-btn-primary driver-btn-success"
                    onClick={handleSubmitClick}
                    disabled={!epodReceiver || loading}
                >
                    {loading ? <div className="driver-spinner" /> : <><Send size={18} /> ยืนยันการส่งสินค้า</>}
                </button>
            )}

            {isReadOnly && (
                <div className="driver-epod-saved-badge">
                    <CheckCircle size={18} /> บันทึก ePOD เรียบร้อยแล้ว
                </div>
            )}

            {/* Fullscreen Preview */}
            {previewImg && (
                <div className="driver-preview-overlay" onClick={() => setPreviewImg(null)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewImg} alt="preview" />
                    <button className="driver-preview-close">✕ ปิด</button>
                </div>
            )}

            {/* Camera Overlay */}
            {showCamera && (
                <div className="driver-preview-overlay" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', maxHeight: '70vh', borderRadius: 12, background: '#000' }} />
                    <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                        <button className="driver-btn-primary" onClick={captureFromVideo} style={{ padding: '12px 32px', fontSize: 16 }}>
                            📸 ถ่ายรูป
                        </button>
                        <button className="driver-btn-primary" onClick={stopCamera} style={{ padding: '12px 32px', fontSize: 16, background: 'rgba(239,68,68,0.8)' }}>
                            ✕ ยกเลิก
                        </button>
                    </div>
                </div>
            )}

            {/* Signature Pad Modal */}
            {showSignPad && (
                <SignaturePad
                    onSave={handleSignatureSave}
                    onClose={() => setShowSignPad(false)}
                />
            )}
        </>
    );
}

// ============================================
// DRIVER APP COMPONENT
// ============================================
export default function DriverApp() {
    const [screen, setScreen] = useState<'login' | 'home' | 'menu' | 'trip' | 'epod' | 'history' | 'profile' | 'navigate' | 'scan-job' | 'fuel-bill'>('login');
    const [driver, setDriver] = useState<DriverProfile | null>(null);
    const [currentTrip, setCurrentTrip] = useState<DriverTrip | null>(null);
    const [allTrips, setAllTrips] = useState<DriverTrip[]>([]);
    const [loginId, setLoginId] = useState('D001');
    const [loginPassword, setLoginPassword] = useState('P001');
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [loading, setLoading] = useState(false);
    const [epodNote, setEpodNote] = useState('');
    const [epodReceiver, setEpodReceiver] = useState('');
    const [epodSubmitted, setEpodSubmitted] = useState(false);
    const [savedEpod, setSavedEpod] = useState<EpodData | null>(null);
    const [epodIsReadOnly, setEpodIsReadOnly] = useState(false);
    const [selectedHistoryTrip, setSelectedHistoryTrip] = useState<DriverTrip | null>(null);
    const [historyEpod, setHistoryEpod] = useState<EpodData | null>(null);
    const [tripAction, setTripAction] = useState<string | null>(null);
    const [showFuelCamera, setShowFuelCamera] = useState(false);
    const fuelVideoRef = useRef<HTMLVideoElement>(null);
    const fuelStreamRef = useRef<MediaStream | null>(null);
    const stopFuelCamera = () => { fuelStreamRef.current?.getTracks().forEach(t => t.stop()); fuelStreamRef.current = null; setShowFuelCamera(false); };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedFuelBill, setSelectedFuelBill] = useState<any>(null);
    const [ocrProcessing, setOcrProcessing] = useState(false);
    const [ocrProgress, setOcrProgress] = useState(0);
    const [odometerProcessing, setOdometerProcessing] = useState(false);
    // Compress image to max 1MB
    const compressImage = useCallback(async (dataUrl: string, maxSizeKB = 1024): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                // Scale down if too large
                const maxDim = 1600;
                if (width > maxDim || height > maxDim) {
                    const ratio = Math.min(maxDim / width, maxDim / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, 0, 0, width, height);
                // Try quality levels
                let quality = 0.8;
                let result = canvas.toDataURL('image/jpeg', quality);
                while (result.length > maxSizeKB * 1370 && quality > 0.1) { // base64 ~1.37x
                    quality -= 0.1;
                    result = canvas.toDataURL('image/jpeg', quality);
                }
                resolve(result);
            };
            img.src = dataUrl;
        });
    }, []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [fuelBills, setFuelBills] = useState<any[]>([]);
    const loadFuelBills = useCallback(async (did?: string) => {
        try {
            const dId = did || driver?.id;
            if (!dId) return;
            // Try Go backend first
            const apiHost = typeof window !== 'undefined' ? `http://${window.location.hostname}:8081` : '';
            let loaded = false;
            try {
                const res = await fetch(`${apiHost}/api/v1/fuel-bills?driver_id=${dId}`);
                const json = await res.json();
                if (json.success) { setFuelBills(json.data || []); loaded = true; }
            } catch { /* Go backend unavailable */ }
            // Fallback to Next.js API
            if (!loaded) {
                const res = await fetch(`/api/fuel-bills?driver_id=${dId}`);
                const json = await res.json();
                if (json.success) setFuelBills(json.data || []);
            }
        } catch {
            setFuelBills(JSON.parse(localStorage.getItem('nexspeed_fuel') || '[]'));
        }
    }, [driver?.id]);
    useEffect(() => { if (screen === 'fuel-bill') loadFuelBills(); }, [screen, loadFuelBills]);
    const wsRef = useRef<WebSocket | null>(null);
    const [mapFollowing, setMapFollowing] = useState(true);
    const [mapRotation, setMapRotation] = useState(0); // degrees
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapInstanceRef = useRef<any>(null);
    const dragRef = useRef<{ active: boolean; lastX: number; lastY: number }>({ active: false, lastX: 0, lastY: 0 });

    // Rotated map drag: transform screen coords by inverse rotation, then panBy
    const handleRotatedDrag = useCallback((clientX: number, clientY: number) => {
        if (!dragRef.current.active || !mapInstanceRef.current) return;
        const dx = clientX - dragRef.current.lastX;
        const dy = clientY - dragRef.current.lastY;
        dragRef.current.lastX = clientX;
        dragRef.current.lastY = clientY;
        // Transform by inverse rotation
        const rad = (-mapRotation * Math.PI) / 180;
        const mapDx = dx * Math.cos(rad) - dy * Math.sin(rad);
        const mapDy = dx * Math.sin(rad) + dy * Math.cos(rad);
        mapInstanceRef.current.panBy([-mapDx, -mapDy], { animate: false });
    }, [mapRotation]);

    const onDragOverlayMouseDown = useCallback((e: React.MouseEvent) => {
        dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
        setMapFollowing(false);
        const onMove = (ev: MouseEvent) => handleRotatedDrag(ev.clientX, ev.clientY);
        const onUp = () => { dragRef.current.active = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, [handleRotatedDrag]);

    const onDragOverlayTouchStart = useCallback((e: React.TouchEvent) => {
        const t = e.touches[0];
        dragRef.current = { active: true, lastX: t.clientX, lastY: t.clientY };
        setMapFollowing(false);
        const onMove = (ev: TouchEvent) => { ev.preventDefault(); handleRotatedDrag(ev.touches[0].clientX, ev.touches[0].clientY); };
        const onEnd = () => { dragRef.current.active = false; window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd); };
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onEnd);
    }, [handleRotatedDrag]);

    // Route state — only store the raw data, derive the rest via useMemo
    const [fullRoute, setFullRoute] = useState<[number, number][]>([]);
    const [routeDistance, setRouteDistance] = useState(0); // total km from OSRM
    const [routeDuration, setRouteDuration] = useState(0); // total min from OSRM
    const [routeLoaded, setRouteLoaded] = useState(false);
    const [navSteps, setNavSteps] = useState<{ instruction: string; distance: number; duration: number; modifier?: string; type?: string }[]>([]);

    // Calculate geographic bearing from pointA to pointB (0-360°)
    const calcBearing = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const toRad = (d: number) => d * Math.PI / 180;
        const toDeg = (r: number) => r * 180 / Math.PI;
        const dLng = toRad(lng2 - lng1);
        const y = Math.sin(dLng) * Math.cos(toRad(lat2));
        const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
        return (toDeg(Math.atan2(y, x)) + 360) % 360;
    };

    // Fetch single OSRM route: origin → destination (with curb for correct lane)
    const fetchFullRoute = async (oLat: number, oLng: number, dLat: number, dLng: number) => {
        if (!oLat || !dLat) return;
        try {
            const bearing = calcBearing(oLat, oLng, dLat, dLng);
            const url = `https://router.project-osrm.org/route/v1/driving/${oLng},${oLat};${dLng},${dLat}?overview=full&geometries=geojson&approaches=curb;curb&bearings=${Math.round(bearing)},30;&steps=true`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.code === 'Ok' && data.routes?.[0]) {
                const route = data.routes[0];
                const coords: [number, number][] = route.geometry.coordinates.map(
                    (c: [number, number]) => [c[1], c[0]] as [number, number]
                );
                setFullRoute(coords);
                setRouteDistance(Math.round(route.distance / 100) / 10);
                setRouteDuration(Math.round(route.duration / 60));
                setRouteLoaded(true);
                // Extract step-by-step navigation instructions
                const steps = route.legs?.[0]?.steps?.map((s: { maneuver: { instruction: string; modifier?: string; type?: string }; distance: number; duration: number }) => ({
                    instruction: s.maneuver.instruction || '',
                    distance: s.distance,
                    duration: s.duration,
                    modifier: s.maneuver.modifier,
                    type: s.maneuver.type,
                })) || [];
                setNavSteps(steps);
            }
        } catch { /* fallback */ }
    };

    // Derive route split, truck position, distances from fullRoute + progress (pure computation)
    const progress = currentTrip?.progress || 0;
    const routeSplit = useMemo(() => {
        if (fullRoute.length < 2) return null;
        const fraction = Math.max(0, Math.min(100, progress)) / 100;

        // Walk along route to find position at fraction
        const segDists: number[] = [];
        let totalDist = 0;
        for (let i = 1; i < fullRoute.length; i++) {
            const d = calcDistanceKm(fullRoute[i - 1][0], fullRoute[i - 1][1], fullRoute[i][0], fullRoute[i][1]);
            segDists.push(d);
            totalDist += d;
        }
        const targetDist = fraction * totalDist;
        let accumulated = 0;
        let splitIdx = fullRoute.length - 1;
        let pos: [number, number] = fullRoute[fullRoute.length - 1];
        for (let i = 0; i < segDists.length; i++) {
            if (accumulated + segDists[i] >= targetDist) {
                const segFrac = segDists[i] > 0 ? (targetDist - accumulated) / segDists[i] : 0;
                pos = [
                    fullRoute[i][0] + segFrac * (fullRoute[i + 1][0] - fullRoute[i][0]),
                    fullRoute[i][1] + segFrac * (fullRoute[i + 1][1] - fullRoute[i][1]),
                ];
                splitIdx = i + 1;
                break;
            }
            accumulated += segDists[i];
        }

        const completed: [number, number][] = [...fullRoute.slice(0, splitIdx), pos];
        const remaining: [number, number][] = [pos, ...fullRoute.slice(splitIdx)];

        let tDist = 0;
        for (let i = 1; i < completed.length; i++) {
            tDist += calcDistanceKm(completed[i - 1][0], completed[i - 1][1], completed[i][0], completed[i][1]);
        }
        let rDist = 0;
        for (let i = 1; i < remaining.length; i++) {
            rDist += calcDistanceKm(remaining[i - 1][0], remaining[i - 1][1], remaining[i][0], remaining[i][1]);
        }

        return {
            completed,
            remaining,
            truckPos: pos,
            travelledDist: Math.round(tDist * 10) / 10,
            remainingDist: Math.round(rDist * 10) / 10,
        };
    }, [fullRoute, progress]);

    // Convenience accessors from the memoized split
    const routeCompleted = routeSplit?.completed || [];
    const routeRemaining = routeSplit?.remaining || [];
    const truckOnRoute = routeSplit?.truckPos || null;
    const travelledDist = routeSplit?.travelledDist || 0;
    const remainingDist = routeSplit?.remainingDist || 0;

    // Login
    const handleLogin = async () => {
        setLoading(true);
        setLoginError('');
        // Validate password: D001 → P001, D002 → P002, etc.
        const expectedPass = loginId.replace(/^D/, 'P');
        if (loginPassword.toUpperCase() !== expectedPass) {
            setLoginError('รหัสผ่านไม่ถูกต้อง');
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/drivers`);
            const json = await res.json();
            const found = (json.data as DriverProfile[])?.find(d => d.id === loginId);
            if (found) {
                setDriver(found);
                setScreen('menu');
                loadTrips(found.id);
            } else {
                setLoginError('ไม่พบรหัสพนักงาน');
            }
        } catch {
            setLoginError('เชื่อมต่อ server ไม่ได้');
        }
        setLoading(false);
    };

    // Load trips for driver
    const loadTrips = async (driverId: string) => {
        try {
            const res = await fetch(`${API_BASE}/trips`);
            const json = await res.json();
            const driverTrips = (json.data as DriverTrip[])?.filter(t => t.driverId === driverId) || [];
            setAllTrips(driverTrips);
            const active = driverTrips.find(t => t.status === 'in-transit' || t.status === 'loading');
            if (active) {
                setCurrentTrip(active);
                if (active.originLat && active.destLat) {
                    fetchFullRoute(active.originLat, active.originLng, active.destLat, active.destLng);
                }
            }
        } catch { /* */ }
    };

    // WebSocket GPS
    useEffect(() => {
        if (!driver) return;
        const connect = () => {
            const wsHost = window.location.hostname;
            const ws = new WebSocket(`ws://${wsHost}:8081/ws/gps`);
            wsRef.current = ws;
            ws.onmessage = (event) => {
                try {
                    const u = JSON.parse(event.data);
                    if (u.type === 'gps_update' && currentTrip && u.tripId === currentTrip.id) {
                        setCurrentTrip(prev => prev ? { ...prev, progress: u.progress, currentLat: u.lat, currentLng: u.lng, status: u.status } : prev);
                    }
                } catch { /* */ }
            };
            ws.onclose = () => setTimeout(connect, 5000);
            ws.onerror = () => ws.close();
        };
        connect();
        return () => { wsRef.current?.close(); };
    }, [driver, currentTrip]);

    // Trip action handler
    const handleTripAction = (action: string) => {
        setTripAction(action);
        setTimeout(() => setTripAction(null), 2000);

        if (action === 'start' && currentTrip) {
            setCurrentTrip({ ...currentTrip, status: 'in-transit' });
            if (currentTrip.originLat && currentTrip.destLat) {
                fetchFullRoute(currentTrip.originLat, currentTrip.originLng, currentTrip.destLat, currentTrip.destLng);
            }
        }
        if (action === 'arrive') {
            if (currentTrip) loadEpodData(currentTrip.id);
            setScreen('epod');
        }
        if (action === 'navigate' && currentTrip) {
            // Open in-app navigation screen
            if (currentTrip.originLat && currentTrip.destLat) {
                fetchFullRoute(currentTrip.originLat, currentTrip.originLng, currentTrip.destLat, currentTrip.destLng);
            }
            setScreen('navigate');
        }
        if (action === 'sos') {
            // Open phone dialer with emergency number
            const tel = '1669'; // Thailand emergency
            if (typeof window !== 'undefined') {
                window.open(`tel:${tel}`, '_self');
            }
        }
    };

    // Submit ePOD
    const handleSubmitEpod = async (photoData: { productPhoto?: string; deliveryPhoto?: string; signature?: string }) => {
        if (!currentTrip || !epodReceiver) return;
        setLoading(true);
        try {
            await fetch(`${API_BASE}/epod`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tripId: currentTrip.id,
                    receiverName: epodReceiver,
                    notes: epodNote,
                    productPhotoUrl: photoData.productPhoto || '',
                    deliveryPhotoUrl: photoData.deliveryPhoto || '',
                    signatureUrl: photoData.signature || '',
                    lat: currentTrip.currentLat || 0,
                    lng: currentTrip.currentLng || 0,
                }),
            });
            setEpodSubmitted(true);
            setTimeout(() => {
                setEpodSubmitted(false);
                setEpodNote('');
                setEpodReceiver('');
                setSavedEpod(null);
                setScreen('home');
            }, 2000);
        } catch { /* */ }
        setLoading(false);
    };

    // Load saved ePOD data for current trip
    const loadEpodData = async (tripId: string) => {
        try {
            const res = await fetch(`${API_BASE}/epod/${tripId}`);
            const json = await res.json();
            if (json.success && json.data) {
                const d = json.data;
                setSavedEpod({
                    productPhotoUrl: d.productPhotoUrl || '',
                    deliveryPhotoUrl: d.deliveryPhotoUrl || '',
                    signatureUrl: d.signatureUrl || '',
                    receiverName: d.receiverName || '',
                    notes: d.notes || '',
                });
                setEpodReceiver(d.receiverName || '');
                setEpodNote(d.notes || '');
                setEpodIsReadOnly(true);
            } else {
                setSavedEpod(null);
                setEpodIsReadOnly(false);
            }
        } catch {
            setSavedEpod(null);
            setEpodIsReadOnly(false);
        }
    };

    // ===================== LOGIN SCREEN =====================
    if (screen === 'login') {
        return (
            <div className="driver-app">
                <div className="driver-login">

                    <div className="driver-login-center">
                        <div className="driver-login-logo">
                            <h1>NexSpeed</h1>
                            <p>DRIVER APP</p>
                        </div>

                        <div className="driver-login-form">
                            <div className="driver-login-field">
                                <label><User size={14} /> รหัสพนักงาน</label>
                                <input
                                    type="text"
                                    value={loginId}
                                    onChange={e => { setLoginId(e.target.value.toUpperCase()); setLoginError(''); }}
                                    placeholder="เช่น D001"
                                    className="driver-input"
                                />
                            </div>
                            <div className="driver-login-field">
                                <label><Lock size={14} /> รหัสผ่าน</label>
                                <div className="driver-input-password-wrap">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={loginPassword}
                                        onChange={e => { setLoginPassword(e.target.value.toUpperCase()); setLoginError(''); }}
                                        placeholder="เช่น P001"
                                        className="driver-input"
                                    />
                                    <button
                                        type="button"
                                        className="driver-password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {loginError && (
                                <div className="driver-login-error">
                                    <AlertTriangle size={14} /> {loginError}
                                </div>
                            )}

                            <button className="driver-btn-primary" onClick={handleLogin} disabled={loading}>
                                {loading ? <div className="driver-spinner" /> : <><LogOut size={18} /> เข้าสู่ระบบ</>}
                            </button>
                            <p className="driver-login-hint">รหัสพนักงาน D001 - D015 | รหัสผ่าน P001 - P015</p>
                        </div>
                    </div>

            <div className="driver-login-version">NexSpeed Driver v1.0.0</div>
                </div>
                {/* PWA Banners */}
                <OfflineBanner />
                <UpdateBanner />
                <PWAInstallBanner />
            </div>
        );
    }

    // ===================== NAVIGATION SCREEN (Google Maps style) =====================
    if (screen === 'navigate' && currentTrip) {
        const tLat = truckOnRoute ? truckOnRoute[0] : (currentTrip.currentLat || 13.7563);
        const tLng = truckOnRoute ? truckOnRoute[1] : (currentTrip.currentLng || 100.5018);

        // Calculate current step from progress
        const stepIdx = Math.min(
            Math.floor((currentTrip.progress / 100) * navSteps.length),
            navSteps.length - 1
        );
        const currentStep = navSteps[stepIdx] || null;
        const nextStep = navSteps[stepIdx + 1] || null;

        // Direction arrow based on maneuver modifier
        const getArrow = (modifier?: string, type?: string) => {
            if (type === 'arrive') return '🏁';
            if (type === 'depart') return '↑';
            switch (modifier) {
                case 'left': case 'sharp left': return '←';
                case 'slight left': return '↰';
                case 'right': case 'sharp right': return '→';
                case 'slight right': return '↱';
                case 'uturn': return '↩';
                case 'straight': default: return '↑';
            }
        };

        // ETA calculation
        const now = new Date();
        const eta = new Date(now.getTime() + remainingDist / (routeDistance || 1) * routeDuration * 60000);
        const etaStr = `${String(eta.getHours()).padStart(2, '0')}:${String(eta.getMinutes()).padStart(2, '0')}`;

        // Speed estimation from progress (deterministic)
        const speed = currentTrip.progress > 0 && currentTrip.progress < 100 ? Math.round(50 + (currentTrip.progress % 30)) : 0;

        return (
            <div className="driver-app driver-nav-fullscreen">
                {typeof window !== 'undefined' && <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />}

                {/* Green Direction Bar */}
                <div className="driver-nav-direction-bar">
                    <div className="driver-nav-direction-main">
                        <span className="driver-nav-arrow">{currentStep ? getArrow(currentStep.modifier, currentStep.type) : '↑'}</span>
                        <span className="driver-nav-instruction">
                            {currentStep?.instruction || 'กำลังคำนวณเส้นทาง...'}
                        </span>
                    </div>
                    {nextStep && (
                        <div className="driver-nav-direction-next">
                            จากนั้น {getArrow(nextStep.modifier, nextStep.type)} {nextStep.modifier === 'left' || nextStep.modifier === 'sharp left' || nextStep.modifier === 'slight left' ? 'เลี้ยวซ้าย' : nextStep.modifier === 'right' || nextStep.modifier === 'sharp right' || nextStep.modifier === 'slight right' ? 'เลี้ยวขวา' : 'ตรงไป'}
                        </div>
                    )}
                </div>

                {/* Full Screen Map */}
                <div className="driver-nav-map" style={{ overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', transform: `rotate(${mapRotation}deg)`, transition: 'transform 0.3s ease', transformOrigin: 'center center', pointerEvents: mapRotation % 360 !== 0 ? 'none' : 'auto' }}>
                        {typeof window !== 'undefined' && (
                            <MapContainer
                                center={[tLat, tLng]}
                                zoom={15}
                                style={{ height: '100%', width: '100%' }}
                                zoomControl={false}
                                scrollWheelZoom={true}
                            >
                                <TileLayer
                                    attribution='&copy; Google Maps'
                                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                                />

                                {/* Route polyline (purple like Google Maps) */}
                                {routeCompleted.length >= 2 && (
                                    <Polyline
                                        positions={routeCompleted}
                                        pathOptions={{ color: '#1565c0', weight: 6, opacity: 0.6 }}
                                    />
                                )}
                                {routeRemaining.length >= 2 && (
                                    <Polyline
                                        positions={routeRemaining}
                                        pathOptions={{ color: '#1976d2', weight: 6, opacity: 0.95 }}
                                    />
                                )}

                                {/* Destination marker */}
                                <CircleMarker center={[currentTrip.destLat, currentTrip.destLng]} radius={8}
                                    pathOptions={{ color: '#fff', fillColor: '#ef4444', fillOpacity: 1, weight: 3 }}>
                                    <Popup>{currentTrip.destination}</Popup>
                                </CircleMarker>

                                {/* GPS blue dot */}
                                <CircleMarker center={[tLat, tLng]} radius={10}
                                    pathOptions={{ color: '#fff', fillColor: '#4285f4', fillOpacity: 1, weight: 3 }} />
                                <CircleMarker center={[tLat, tLng]} radius={20}
                                    pathOptions={{ color: 'transparent', fillColor: '#4285f4', fillOpacity: 0.15, weight: 0 }} />

                                <MapController lat={tLat} lng={tLng} following={mapFollowing} onUserInteract={() => setMapFollowing(false)} mapRef={mapInstanceRef} />
                            </MapContainer>
                        )}
                    </div>{/* end rotating inner div */}

                    {/* Drag overlay for rotated nav map */}
                    {mapRotation % 360 !== 0 && (
                        <div
                            className="driver-map-drag-overlay"
                            onMouseDown={onDragOverlayMouseDown}
                            onTouchStart={onDragOverlayTouchStart}
                        />
                    )}

                    {/* Map controls — compass style */}
                    <div className="driver-map-toolbar" style={{ top: 'auto', bottom: 80, right: 12, left: 'auto' }}>
                        <button
                            className={`driver-map-tool-btn${mapFollowing ? ' active' : ''}`}
                            onClick={() => { setMapFollowing(true); setMapRotation(0); }}
                            title="กลับตำแหน่งรถ"
                        >
                            <Crosshair size={18} />
                        </button>
                        <button
                            className="driver-map-tool-btn compass"
                            onClick={() => setMapRotation(r => r - 45)}
                            onContextMenu={(e) => { e.preventDefault(); setMapRotation(r => r + 45); }}
                            title="หมุนซ้าย (คลิกขวา = หมุนขวา)"
                        >
                            <div className="driver-compass-needle" style={{ transform: `rotate(${-mapRotation}deg)` }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L15 10L12 8.5L9 10L12 2Z" fill="#ef4444" />
                                    <path d="M12 22L9 14L12 15.5L15 14L12 22Z" fill="#94a3b8" />
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>{/* end nav-map */}

                {/* Bottom Info Bar */}
                <div className="driver-nav-bottom-bar">
                    <div className="driver-nav-speed">
                        <span className="driver-nav-speed-num">{speed}</span>
                        <span className="driver-nav-speed-unit">km/h</span>
                    </div>
                    <div className="driver-nav-eta">
                        <span className="driver-nav-eta-time">{Math.ceil(remainingDist / (routeDistance || 1) * routeDuration)} น.</span>
                        <span className="driver-nav-eta-detail">{remainingDist} กม. • {etaStr}</span>
                    </div>
                    <button className="driver-nav-close" onClick={() => setScreen('trip')}>
                        ✕
                    </button>
                </div>
            </div>
        );
    }
    if (screen === 'epod') {
        return (
            <div className="driver-app">
                <div className="driver-header">
                    <div className="driver-avatar-sm driver-home-btn" style={{ width: 32, height: 32 }} onClick={() => setScreen('menu')}><Home size={16} /></div>
                    <h2>📋 ยืนยันการส่ง (ePOD)</h2>
                </div>
                <div className="driver-body">
                    {epodSubmitted ? (
                        <div className="driver-epod-success">
                            <CheckCircle size={64} color="#10b981" />
                            <h2>ส่งสำเร็จ!</h2>
                            <p>ePOD ถูกบันทึกเรียบร้อย</p>
                        </div>
                    ) : (
                        <EpodForm
                            currentTrip={currentTrip}
                            driver={driver}
                            epodReceiver={epodReceiver}
                            setEpodReceiver={setEpodReceiver}
                            epodNote={epodNote}
                            setEpodNote={setEpodNote}
                            loading={loading}
                            onSubmit={handleSubmitEpod}
                            savedData={savedEpod || undefined}
                            isReadOnly={epodIsReadOnly}
                        />
                    )}
                </div>
                <DriverNav screen={screen} setScreen={setScreen} />
            </div>
        );
    }

    // ===================== TRIP DETAIL SCREEN =====================
    if (screen === 'trip' && currentTrip) {
        return (
            <div className="driver-app">
                <div className="driver-header">
                    <div className="driver-avatar-sm driver-home-btn" style={{ width: 32, height: 32 }} onClick={() => setScreen('menu')}><Home size={16} /></div>
                    <h2>🗺️ ทริปปัจจุบัน</h2>
                </div>
                <div className="driver-body">
                    {/* Real Road Map (OSRM 2-segment routing) */}
                    <div className="driver-map-container">
                        {typeof window !== 'undefined' && <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />}
                        {typeof window !== 'undefined' && (() => {
                            const oLat = currentTrip.originLat || 0;
                            const oLng = currentTrip.originLng || 0;
                            const dLat = currentTrip.destLat || 0;
                            const dLng = currentTrip.destLng || 0;
                            const cLat = currentTrip.currentLat || 13.7563;
                            const cLng = currentTrip.currentLng || 100.5018;
                            // Truck position: use route-snapped pos if available, otherwise GPS
                            const tLat = truckOnRoute ? truckOnRoute[0] : cLat;
                            const tLng = truckOnRoute ? truckOnRoute[1] : cLng;
                            const hasRoute = oLat !== 0 && dLat !== 0;
                            const hasRoadRoute = routeLoaded && (routeCompleted.length > 2 || routeRemaining.length > 2);

                            // Calculate bounds from all route points
                            const allPoints: [number, number][] = hasRoadRoute
                                ? [...routeCompleted, ...routeRemaining]
                                : [[tLat, tLng], ...(hasRoute ? [[oLat, oLng] as [number, number], [dLat, dLng] as [number, number]] : [])];
                            const centerLat = allPoints.length > 0 ? (Math.min(...allPoints.map(p => p[0])) + Math.max(...allPoints.map(p => p[0]))) / 2 : tLat;
                            const centerLng = allPoints.length > 0 ? (Math.min(...allPoints.map(p => p[1])) + Math.max(...allPoints.map(p => p[1]))) / 2 : tLng;

                            return (
                                <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', transform: `rotate(${mapRotation}deg)`, transition: 'transform 0.3s ease', transformOrigin: 'center center', pointerEvents: mapRotation % 360 !== 0 ? 'none' : 'auto' }}>
                                    <MapContainer
                                        center={[centerLat, centerLng]}
                                        zoom={hasRoute ? 8 : 12}
                                        style={{ height: '100%', width: '100%' }}
                                        scrollWheelZoom={true}
                                        zoomControl={false}
                                    >
                                        <TileLayer
                                            attribution='&copy; Google Maps'
                                            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                                        />

                                        {/* Completed road route: origin → current (solid blue) */}
                                        {hasRoute && routeCompleted.length >= 2 && (
                                            <Polyline
                                                positions={routeCompleted}
                                                pathOptions={{ color: '#1565c0', weight: 5, opacity: 0.9 }}
                                            />
                                        )}

                                        {/* Remaining road route: current → destination (dashed) */}
                                        {hasRoute && routeRemaining.length >= 2 && (
                                            <Polyline
                                                positions={routeRemaining}
                                                pathOptions={{ color: '#1976d2', weight: 4, opacity: 0.5, dashArray: '10 8' }}
                                            />
                                        )}

                                        {/* Straight line fallback when OSRM not loaded */}
                                        {hasRoute && !hasRoadRoute && (
                                            <>
                                                <Polyline
                                                    positions={[[oLat, oLng], [tLat, tLng]]}
                                                    pathOptions={{ color: '#1565c0', weight: 3, opacity: 0.5, dashArray: '4 4' }}
                                                />
                                                <Polyline
                                                    positions={[[tLat, tLng], [dLat, dLng]]}
                                                    pathOptions={{ color: '#94a3b8', weight: 3, opacity: 0.3, dashArray: '4 4' }}
                                                />
                                            </>
                                        )}

                                        {/* Origin marker (green) */}
                                        {hasRoute && (
                                            <CircleMarker center={[oLat, oLng]} radius={8}
                                                pathOptions={{ color: '#fff', fillColor: '#10b981', fillOpacity: 1, weight: 3 }}>
                                                <Popup>
                                                    <div style={{ fontSize: '13px', fontWeight: 600 }}>
                                                        🟢 ต้นทาง: {currentTrip.origin}
                                                    </div>
                                                </Popup>
                                            </CircleMarker>
                                        )}

                                        {/* Destination marker (red) */}
                                        {hasRoute && (
                                            <CircleMarker center={[dLat, dLng]} radius={8}
                                                pathOptions={{ color: '#fff', fillColor: '#ef4444', fillOpacity: 1, weight: 3 }}>
                                                <Popup>
                                                    <div style={{ fontSize: '13px', fontWeight: 600 }}>
                                                        🔴 ปลายทาง: {currentTrip.destination}
                                                    </div>
                                                </Popup>
                                            </CircleMarker>
                                        )}

                                        {/* Current position (truck marker — snapped to route) */}
                                        <Marker position={[tLat, tLng]}>
                                            <Popup>
                                                <div style={{ fontSize: '13px', lineHeight: 1.6, minWidth: '220px' }}>
                                                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>🚛 {currentTrip.id} — ตำแหน่งปัจจุบัน</div>
                                                    <div>📍 จาก: {currentTrip.origin}</div>
                                                    <div>🏁 ถึง: {currentTrip.destination}</div>
                                                    {hasRoadRoute && (
                                                        <>
                                                            <div>📏 เหลืออีก: <strong>{remainingDist} กม.</strong> (ตามถนน)</div>
                                                            <div>✅ ผ่านมาแล้ว: {travelledDist} กม.</div>
                                                        </>
                                                    )}
                                                    <div>🔄 Progress: {currentTrip.progress}%</div>
                                                    <div style={{ marginTop: '6px', height: '5px', borderRadius: '3px', background: '#e5e7eb' }}>
                                                        <div style={{ height: '100%', borderRadius: '3px', width: `${currentTrip.progress}%`, background: '#3b82f6' }} />
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>

                                        <MapController
                                            lat={tLat}
                                            lng={tLng}
                                            following={mapFollowing}
                                            onUserInteract={() => setMapFollowing(false)}
                                            mapRef={mapInstanceRef}
                                        />
                                    </MapContainer>
                                </div>
                            );
                        })()}

                        {/* Drag overlay for rotated map */}
                        {mapRotation % 360 !== 0 && (
                            <div
                                className="driver-map-drag-overlay"
                                onMouseDown={onDragOverlayMouseDown}
                                onTouchStart={onDragOverlayTouchStart}
                            />
                        )}

                        {/* Map controls: Zoom + GPS + Compass (left side) */}
                        <div className="driver-map-toolbar">
                            <button
                                className="driver-map-tool-btn"
                                onClick={() => mapInstanceRef.current?.zoomIn()}
                                title="ซูมเข้า"
                            >
                                <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>+</span>
                            </button>
                            <button
                                className="driver-map-tool-btn"
                                onClick={() => mapInstanceRef.current?.zoomOut()}
                                title="ซูมออก"
                            >
                                <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>−</span>
                            </button>
                            <button
                                className={`driver-map-tool-btn${mapFollowing ? ' active' : ''}`}
                                onClick={() => { setMapFollowing(true); setMapRotation(0); }}
                                title="กลับตำแหน่งรถ"
                            >
                                <Crosshair size={18} />
                            </button>
                            <button
                                className="driver-map-tool-btn compass"
                                onClick={() => setMapRotation(r => r + 45)}
                                onContextMenu={(e) => { e.preventDefault(); setMapRotation(0); }}
                                title="หมุนแผนที่ (คลิกขวาเพื่อ reset)"
                            >
                                <div className="driver-compass-needle" style={{ transform: `rotate(${-mapRotation}deg)` }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 2L15 10L12 8.5L9 10L12 2Z" fill="#ef4444" />
                                        <path d="M12 22L9 14L12 15.5L15 14L12 22Z" fill="#94a3b8" />
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Route Distance Info Card */}
                    {currentTrip.destLat !== 0 && (
                        <div className="driver-card" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(6,182,212,0.05))', borderColor: 'rgba(59,130,246,0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ระยะทางที่เหลือ</div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-blue)' }}>
                                        {routeLoaded ? remainingDist : calcDistanceKm(currentTrip.currentLat, currentTrip.currentLng, currentTrip.destLat, currentTrip.destLng).toFixed(1)} กม.
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>เส้นทางรวม</div>
                                    <div style={{ fontSize: '16px', fontWeight: 700, color: routeLoaded ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                                        {routeLoaded ? `${routeDistance} กม. / ${routeDuration} นาที` : 'กำลังโหลด...'}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ผ่านมาแล้ว</div>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-green)' }}>
                                        {routeLoaded ? travelledDist : calcDistanceKm(currentTrip.originLat, currentTrip.originLng, currentTrip.currentLat, currentTrip.currentLng).toFixed(1)} กม.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Progress */}
                    <div className="driver-card">
                        <div className="driver-trip-progress">
                            <div className="driver-progress-bar">
                                <div className="driver-progress-fill" style={{ width: `${currentTrip.progress}%` }} />
                            </div>
                            <div className="driver-progress-labels">
                                <span>{currentTrip.origin}</span>
                                <span className="driver-progress-pct">{currentTrip.progress}%</span>
                                <span>{currentTrip.destination}</span>
                            </div>
                        </div>
                    </div>

                    {/* Trip Info */}
                    <div className="driver-info-grid">
                        <div className="driver-info-item">
                            <Route size={16} />
                            <div>
                                <small>ระยะทาง</small>
                                <strong>{currentTrip.distance} กม.</strong>
                            </div>
                        </div>
                        <div className="driver-info-item">
                            <Package size={16} />
                            <div>
                                <small>Order</small>
                                <strong>{currentTrip.orderId}</strong>
                            </div>
                        </div>
                        <div className="driver-info-item">
                            <Clock size={16} />
                            <div>
                                <small>สถานะ</small>
                                <strong>{currentTrip.status === 'in-transit' ? '🚛 กำลังขนส่ง' : '📦 กำลังโหลด'}</strong>
                            </div>
                        </div>
                        <div className="driver-info-item">
                            <Fuel size={16} />
                            <div>
                                <small>ทริป</small>
                                <strong>{currentTrip.id}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="driver-actions">
                        {tripAction && (
                            <div className="driver-action-toast">
                                <CheckCircle size={16} /> {tripAction === 'start' ? 'เริ่มทริปแล้ว' : tripAction === 'navigate' ? 'เปิดแผนที่แล้ว' : 'อัปเดตแล้ว'}
                            </div>
                        )}

                        {currentTrip.status === 'loading' && (
                            <button className="driver-btn-primary" onClick={() => handleTripAction('start')}>
                                <Play size={18} /> เริ่มออกเดินทาง
                            </button>
                        )}

                        {currentTrip.status === 'in-transit' && (
                            <>
                                <div className="driver-btn-row">
                                    <button className="driver-btn-outline" onClick={() => handleTripAction('navigate')}>
                                        <Navigation size={18} /> นำทาง
                                    </button>
                                    <button className="driver-btn-outline driver-btn-danger" onClick={() => handleTripAction('sos')}>
                                        <AlertTriangle size={18} /> SOS
                                    </button>
                                </div>
                                {currentTrip.progress >= 80 && (
                                    <button className="driver-btn-primary driver-btn-success" onClick={() => handleTripAction('arrive')}>
                                        <CheckCircle size={18} /> ถึงปลายทาง — ส่ง ePOD
                                    </button>
                                )}
                            </>
                        )}

                        {currentTrip.status === 'loading' && (
                            <button className="driver-btn-outline driver-btn-danger" onClick={() => handleTripAction('sos')}>
                                <AlertTriangle size={18} /> แจ้งเหตุฉุกเฉิน (SOS)
                            </button>
                        )}
                    </div>
                </div>
                <DriverNav screen={screen} setScreen={setScreen} />
            </div>
        );
    }

    // ===================== HISTORY SCREEN =====================
    if (screen === 'history') {
        const completedTrips = allTrips.filter(t => t.status === 'completed');

        const viewHistoryDetail = async (trip: DriverTrip) => {
            setSelectedHistoryTrip(trip);
            if (trip.originLat && trip.destLat) fetchFullRoute(trip.originLat, trip.originLng, trip.destLat, trip.destLng);
            try {
                const res = await fetch(`${API_BASE}/epod/${trip.id}`);
                const json = await res.json();
                if (json.data) setHistoryEpod(json.data);
                else setHistoryEpod(null);
            } catch { setHistoryEpod(null); }
        };

        // Detail view
        if (selectedHistoryTrip) {
            return (
                <div className="driver-app">
                    <div className="driver-header">
                        <div className="driver-avatar-sm driver-home-btn" style={{ width: 32, height: 32 }} onClick={() => setSelectedHistoryTrip(null)}><ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /></div>
                        <h2>📋 {selectedHistoryTrip.id}</h2>
                    </div>
                    <div className="driver-body">
                        {/* Map */}
                        <div className="driver-card" style={{ padding: 0, overflow: 'hidden', height: 250, borderRadius: 14 }}>
                            <MapContainer
                                key={selectedHistoryTrip.id}
                                center={[selectedHistoryTrip.originLat || 14.5, selectedHistoryTrip.originLng || 100.5]}
                                zoom={7}
                                style={{ width: '100%', height: '100%' }}
                                zoomControl={false}
                                attributionControl={false}
                            >
                                <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" attribution="&copy; Google Maps" />
                                {selectedHistoryTrip.originLat && (
                                    <Marker position={[selectedHistoryTrip.originLat, selectedHistoryTrip.originLng]}>
                                        <Popup>🟢 ต้นทาง: {selectedHistoryTrip.origin}</Popup>
                                    </Marker>
                                )}
                                {selectedHistoryTrip.destLat && (
                                    <Marker position={[selectedHistoryTrip.destLat, selectedHistoryTrip.destLng]}>
                                        <Popup>🔴 ปลายทาง: {selectedHistoryTrip.destination}</Popup>
                                    </Marker>
                                )}
                                {fullRoute.length > 1 && <Polyline positions={fullRoute} color="#3b82f6" weight={4} />}
                                <FitBounds bounds={[
                                    ...(selectedHistoryTrip.originLat ? [[selectedHistoryTrip.originLat, selectedHistoryTrip.originLng] as [number, number]] : []),
                                    ...(selectedHistoryTrip.destLat ? [[selectedHistoryTrip.destLat, selectedHistoryTrip.destLng] as [number, number]] : []),
                                ]} />
                            </MapContainer>
                        </div>

                        {/* Trip Info */}
                        <div className="driver-card">
                            <div className="driver-card-title">🚛 ข้อมูลงาน</div>
                            <div className="driver-trip-route" style={{ marginBottom: 8 }}>
                                <MapPin size={14} />
                                <span>{selectedHistoryTrip.origin} → {selectedHistoryTrip.destination}</span>
                            </div>
                            <div className="driver-trip-meta">
                                <span>ระยะทาง: {selectedHistoryTrip.distance} กม.</span>
                                <span>สถานะ: ✅ เสร็จสมบูรณ์</span>
                            </div>
                        </div>

                        {/* ePOD Data */}
                        <div className="driver-card">
                            <div className="driver-card-title">📷 ข้อมูล ePOD</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>ชื่อผู้รับสินค้า</label>
                                <div className="driver-input" style={{ flex: 1, background: 'var(--bg-input)', padding: '10px 12px', borderRadius: 10 }}>
                                    {historyEpod?.receiverName || 'ไม่มีข้อมูล'}
                                </div>
                            </div>

                            <div style={{ marginBottom: 12 }}>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>📸 ถ่ายรูปหลักฐาน</label>
                                <div className="driver-photo-grid" style={{ marginTop: 8 }}>
                                    <div className="driver-photo-btn" style={{ opacity: historyEpod?.productPhotoUrl ? 1 : 0.4 }}>
                                        <Camera size={24} />
                                        <span>ภาพสินค้า</span>
                                        {historyEpod?.productPhotoUrl && <span style={{ fontSize: 10, color: 'var(--accent-green)' }}>✅</span>}
                                    </div>
                                    <div className="driver-photo-btn" style={{ opacity: historyEpod?.deliveryPhotoUrl ? 1 : 0.4 }}>
                                        <FileText size={24} />
                                        <span>ใบส่งของ</span>
                                        {historyEpod?.deliveryPhotoUrl && <span style={{ fontSize: 10, color: 'var(--accent-green)' }}>✅</span>}
                                    </div>
                                    <div className="driver-photo-btn" style={{ opacity: historyEpod?.signatureUrl ? 1 : 0.4 }}>
                                        <User size={24} />
                                        <span>ลายเซ็น</span>
                                        {historyEpod?.signatureUrl && <span style={{ fontSize: 10, color: 'var(--accent-green)' }}>✅</span>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>หมายเหตุ</label>
                                <div className="driver-input" style={{ marginTop: 4, background: 'var(--bg-input)', padding: '10px 12px', borderRadius: 10, minHeight: 60 }}>
                                    {historyEpod?.notes || 'ไม่มีหมายเหตุ'}
                                </div>
                            </div>
                        </div>
                    </div>
                    <DriverNav screen={screen} setScreen={setScreen} />
                </div>
            );
        }

        // List view
        return (
            <div className="driver-app">
                <div className="driver-header">
                    <div className="driver-avatar-sm driver-home-btn" style={{ width: 32, height: 32 }} onClick={() => setScreen('menu')}><Home size={16} /></div>
                    <h2>📋 ประวัติการวิ่งงาน</h2>
                </div>
                <div className="driver-body">
                    {completedTrips.length === 0 ? (
                        <div className="driver-empty">
                            <Truck size={48} />
                            <p>ยังไม่มีประวัติการวิ่งงาน</p>
                        </div>
                    ) : (
                        completedTrips.map(trip => (
                            <div key={trip.id} className="driver-card driver-trip-card" onClick={() => viewHistoryDetail(trip)}>
                                <div className="driver-trip-card-header">
                                    <span className="driver-trip-id">{trip.id}</span>
                                    <span className="driver-trip-status completed">✅ เสร็จสมบูรณ์</span>
                                </div>
                                <div className="driver-trip-route">
                                    <MapPin size={14} />
                                    <span>{trip.origin} → {trip.destination}</span>
                                </div>
                                <div className="driver-trip-meta">
                                    <span>{trip.distance} กม.</span>
                                </div>
                                <ChevronRight size={18} className="driver-trip-arrow" />
                            </div>
                        ))
                    )}
                </div>
                <DriverNav screen={screen} setScreen={setScreen} />
            </div>
        );
    }

    // ===================== SCAN JOB (รับงาน) =====================
    if (screen === ('scan-job' as string)) {
        return (
            <div className="driver-app">
                <div className="driver-header">
                    <div className="driver-avatar-sm driver-home-btn" style={{ width: 32, height: 32 }} onClick={() => setScreen('menu')}><Home size={16} /></div>
                    <h2>📋 รับงาน</h2>
                </div>
                <div className="driver-body">
                    <div className="driver-card">
                        <div className="driver-card-title">📷 สแกนใบรับงาน</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>ถ่ายรูปใบรับงาน ระบบจะอ่านข้อมูลอัตโนมัติ (OCR)</p>
                        <input type="file" accept="image/*" capture="environment" id="scan-job-input" style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = () => {
                                    // Mock OCR result
                                    const ocrResult = {
                                        jobId: `JOB-${Date.now().toString().slice(-6)}`,
                                        customer: 'บริษัท ABC จำกัด',
                                        pickup: 'คลังสินค้าสระบุรี',
                                        dropoff: 'ท่าเรือแหลมฉบัง',
                                        items: '20 พาเลท',
                                        weight: '15,000 กก.',
                                        note: 'สินค้าแตกง่าย ระวังเป็นพิเศษ',
                                        scannedAt: new Date().toLocaleString('th-TH'),
                                        imageData: reader.result as string,
                                    };
                                    // Save to localStorage
                                    const existing = JSON.parse(localStorage.getItem('nexspeed_jobs') || '[]');
                                    existing.unshift(ocrResult);
                                    localStorage.setItem('nexspeed_jobs', JSON.stringify(existing));
                                    alert(`✅ บันทึกใบรับงาน ${ocrResult.jobId} สำเร็จ!`);
                                };
                                reader.readAsDataURL(file);
                            }}
                        />
                        <label htmlFor="scan-job-input" className="driver-btn-primary" style={{ width: '100%', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                            <Camera size={18} /> ถ่ายรูป / เลือกรูป
                        </label>
                    </div>

                    {/* Show saved jobs */}
                    <div className="driver-card">
                        <div className="driver-card-title">📂 ใบรับงานที่สแกนแล้ว</div>
                        {(() => {
                            const jobs = JSON.parse(localStorage.getItem('nexspeed_jobs') || '[]');
                            if (jobs.length === 0) return <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>ยังไม่มีรายการ</p>;
                            return jobs.slice(0, 10).map((job: { jobId: string; customer: string; pickup: string; dropoff: string; items: string; scannedAt: string }, i: number) => (
                                <div key={i} className="driver-mini-trip" style={{ cursor: 'default' }}>
                                    <div className="driver-mini-trip-info">
                                        <strong>{job.jobId}</strong>
                                        <span>{job.customer} • {job.pickup} → {job.dropoff}</span>
                                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{job.items} • {job.scannedAt}</span>
                                    </div>
                                    <span>📋</span>
                                </div>
                            ));
                        })()}
                    </div>
                </div>
                <DriverNav screen={screen} setScreen={setScreen} />
            </div>
        );
    }

    // ===================== FUEL BILL (บิลน้ำมัน) =====================
    if (screen === ('fuel-bill' as string)) {
        return (
            <div className="driver-app">
                <div className="driver-header">
                    <div className="driver-avatar-sm driver-home-btn" style={{ width: 32, height: 32 }} onClick={() => setScreen('menu')}><Home size={16} /></div>
                    <h2>⛽ บิลน้ำมัน</h2>
                </div>
                <div className="driver-body">
                    {/* Detail View */}
                    {selectedFuelBill ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer', color: 'var(--accent-blue)' }} onClick={() => setSelectedFuelBill(null)}>
                                <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> ← กลับรายการ
                            </div>
                            <div className="driver-card">
                                <div className="driver-card-title">🧾 รายละเอียดบิลน้ำมัน</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', fontSize: 13, marginTop: 8 }}>
                                    <div><span style={{ color: 'var(--text-secondary)' }}>เลขที่บิล</span><div style={{ fontWeight: 600 }}>{selectedFuelBill.billNo}</div></div>
                                    <div><span style={{ color: 'var(--text-secondary)' }}>วันที่เติม</span><div style={{ fontWeight: 600 }}>{selectedFuelBill.fillDate}</div></div>
                                    <div><span style={{ color: 'var(--text-secondary)' }}>สถานีบริการ</span><div style={{ fontWeight: 600 }}>{selectedFuelBill.station}</div></div>
                                    <div><span style={{ color: 'var(--text-secondary)' }}>สาขา</span><div style={{ fontWeight: 600 }}>{selectedFuelBill.branch}</div></div>
                                    <div><span style={{ color: 'var(--text-secondary)' }}>ชนิดน้ำมัน</span><div style={{ fontWeight: 600 }}>{selectedFuelBill.fuelType}</div></div>
                                    <div><span style={{ color: 'var(--text-secondary)' }}>จำนวนลิตร</span><div style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{selectedFuelBill.liters} ลิตร</div></div>
                                    <div><span style={{ color: 'var(--text-secondary)' }}>ราคา/ลิตร</span><div style={{ fontWeight: 600 }}>฿{selectedFuelBill.pricePerLiter}</div></div>
                                    <div><span style={{ color: 'var(--text-secondary)' }}>ยอดรวม</span><div style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: 16 }}>฿{selectedFuelBill.totalAmount}</div></div>
                                    <div><span style={{ color: 'var(--text-secondary)' }}>เลขไมล์</span><div style={{ fontWeight: 600 }}>{selectedFuelBill.odometer} กม.</div></div>
                                    <div><span style={{ color: 'var(--text-secondary)' }}>วิธีชำระ</span><div style={{ fontWeight: 600 }}>{selectedFuelBill.paymentMethod}</div></div>
                                    <div><span style={{ color: 'var(--text-secondary)' }}>เลขที่ผู้เสียภาษี</span><div style={{ fontWeight: 600, fontSize: 11 }}>{selectedFuelBill.taxId}</div></div>
                                    <div><span style={{ color: 'var(--text-secondary)' }}>ทะเบียนรถ</span><div style={{ fontWeight: 600 }}>{selectedFuelBill.vehicleId}</div></div>
                                    <div><span style={{ color: 'var(--text-secondary)' }}>คนขับ</span><div style={{ fontWeight: 600 }}>{selectedFuelBill.driverName}</div></div>
                                    <div><span style={{ color: 'var(--text-secondary)' }}>บันทึกเมื่อ</span><div style={{ fontWeight: 600, fontSize: 11 }}>{selectedFuelBill.scannedAt}</div></div>
                                </div>
                            </div>
                            {selectedFuelBill.imageData && (
                                <div className="driver-card" style={{ marginTop: 12 }}>
                                    <div className="driver-card-title">📸 ภาพใบเสร็จ</div>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={selectedFuelBill.imageData} alt="bill" style={{ width: '100%', borderRadius: 8, marginTop: 8 }} />
                                </div>
                            )}
                            {selectedFuelBill.ocrRawText && (
                                <div className="driver-card" style={{ marginTop: 12 }}>
                                    <div className="driver-card-title">📝 ข้อความ OCR (Raw)</div>
                                    <pre style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 6, maxHeight: 200, overflow: 'auto', marginTop: 8 }}>{selectedFuelBill.ocrRawText}</pre>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="driver-card">
                                <div className="driver-card-title">📷 สแกนใบเสร็จน้ำมัน</div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>ถ่ายรูปใบเสร็จ ระบบจะอ่านข้อมูลอัตโนมัติ (OCR)</p>
                                <input type="file" accept="image/*" capture="environment" id="fuel-bill-input" style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        // Read image as dataURL
                                        const rawData = await new Promise<string>((resolve) => {
                                            const reader = new FileReader();
                                            reader.onload = () => resolve(reader.result as string);
                                            reader.readAsDataURL(file);
                                        });
                                        // Compress to max 1MB
                                        const imageData = await compressImage(rawData, 1024);
                                        setOcrProcessing(true);
                                        setOcrProgress(50);
                                        try {
                                            // Send to Go backend OCR API
                                            const apiHost = `http://${window.location.hostname}:8081`;
                                            const res = await fetch(`${apiHost}/api/v1/fuel-bills/ocr`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    imageData,
                                                    vehicleId: driver?.vehicleId || 'V001',
                                                    driverId: driver?.id || 'D001',
                                                    driverName: driver?.name || 'N/A',
                                                }),
                                            });
                                            setOcrProgress(90);
                                            const json = await res.json();
                                            if (json.success && json.data) {
                                                const d = json.data;
                                                setSelectedFuelBill({ ...d, imageData });
                                            } else {
                                                // Fallback: save via Next.js API
                                                const now = new Date();
                                                const fallback = {
                                                    billId: `FUEL-${Date.now().toString().slice(-6)}`,
                                                    billNo: `INV-${Date.now().toString().slice(-6)}`,
                                                    fillDate: now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                                                    station: 'ไม่ระบุ', branch: '', fuelType: 'ไม่ระระบุ',
                                                    liters: 'ไม่ระบุ', pricePerLiter: 'ไม่ระบุ', totalAmount: 'ไม่ระบุ',
                                                    odometer: 'ไม่ระบุ', taxId: 'ไม่ระบุ', paymentMethod: 'ไม่ระบุ',
                                                    vehicleId: driver?.vehicleId || 'V001',
                                                    driverId: driver?.id || 'D001',
                                                    driverName: driver?.name || 'N/A',
                                                    scannedAt: now.toLocaleString('th-TH'),
                                                    ocrRawText: json.message || '(OCR ไม่สามารถอ่านได้)',
                                                    imageData,
                                                };
                                                await fetch('/api/fuel-bills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fallback) }).catch(() => { });
                                                setSelectedFuelBill(fallback);
                                            }
                                        } catch {
                                            // Go backend unavailable → save via Next.js API
                                            const now = new Date();
                                            const fallback = {
                                                billId: `FUEL-${Date.now().toString().slice(-6)}`,
                                                billNo: `INV-${Date.now().toString().slice(-6)}`,
                                                fillDate: now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                                                station: 'ไม่ระบุ', branch: '', fuelType: 'ไม่ระบุ',
                                                liters: 'ไม่ระบุ', pricePerLiter: 'ไม่ระบุ', totalAmount: 'ไม่ระบุ',
                                                odometer: 'ไม่ระบุ', taxId: 'ไม่ระบุ', paymentMethod: 'ไม่ระบุ',
                                                vehicleId: driver?.vehicleId || 'V001',
                                                driverId: driver?.id || 'D001',
                                                driverName: driver?.name || 'N/A',
                                                scannedAt: now.toLocaleString('th-TH'),
                                                ocrRawText: '(Backend OCR unavailable)',
                                                imageData,
                                            };
                                            await fetch('/api/fuel-bills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fallback) }).catch(() => { });
                                            setSelectedFuelBill(fallback);
                                        }
                                        loadFuelBills();
                                        setOcrProcessing(false);
                                        setOcrProgress(0);
                                    }}
                                />
                                {ocrProcessing ? (
                                    <div style={{ width: '100%', marginBottom: 12, textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 8, color: 'var(--accent-blue)' }}>
                                            <div className="driver-spinner" /> กำลังอ่านข้อมูล OCR... {ocrProgress}%
                                        </div>
                                        <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                                            <div style={{ width: `${ocrProgress}%`, height: '100%', background: 'var(--gradient-blue)', borderRadius: 3, transition: 'width 0.3s' }} />
                                        </div>
                                    </div>
                                ) : (
                                    <label htmlFor="fuel-bill-input" className="driver-btn-primary" style={{ width: '100%', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                                        <Camera size={18} /> 📷 ถ่ายรูปใบเสร็จ
                                    </label>
                                )}
                            </div>

                            {/* Odometer Photo */}
                            <div className="driver-card">
                                <div className="driver-card-title">🔢 ถ่ายรูปเลขไมล์</div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>ถ่ายรูปหน้าปัดเลขไมล์ ระบบจะอ่านค่าอัตโนมัติ</p>
                                <input type="file" accept="image/*" capture="environment" id="odometer-input" style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const rawData = await new Promise<string>((resolve) => {
                                            const reader = new FileReader();
                                            reader.onload = () => resolve(reader.result as string);
                                            reader.readAsDataURL(file);
                                        });
                                        const odometerImage = await compressImage(rawData, 1024);
                                        setOdometerProcessing(true);
                                        try {
                                            const apiHost = `http://${window.location.hostname}:8081`;
                                            const res = await fetch(`${apiHost}/api/v1/odometer/ocr`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    imageData: odometerImage,
                                                    vehicleId: driver?.vehicleId || 'V001',
                                                    driverId: driver?.id || 'D001',
                                                    driverName: driver?.name || 'N/A',
                                                }),
                                            });
                                            const json = await res.json();
                                            if (json.success && json.data) {
                                                const reading = json.data.reading || 'ไม่ระบุ';
                                                // Update latest fuel bill odometer if exists
                                                if (fuelBills.length > 0) {
                                                    const updated = [...fuelBills];
                                                    updated[0] = { ...updated[0], odometer: reading };
                                                    setFuelBills(updated);
                                                }
                                                if (reading !== 'ไม่ระบุ') {
                                                    alert(`🔢 เลขไมล์ที่อ่านได้: ${reading} กม.\n\nภาพถูกบันทึกเรียบร้อย`);
                                                } else {
                                                    alert(`📸 ภาพเลขไมล์ถูกบันทึกแล้ว\n\nระบบไม่สามารถอ่านตัวเลขได้อัตโนมัติ\nกรุณาตรวจสอบและกรอกเลขไมล์ด้วยตนเอง`);
                                                }
                                            } else {
                                                alert(`📸 ภาพเลขไมล์ถูกบันทึกแล้ว\n\n${json.message || 'OCR ไม่สามารถอ่านได้'}`);
                                            }
                                        } catch {
                                            // Fallback: save via Next.js API
                                            try {
                                                await fetch('/api/fuel-bills', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        billId: `ODO-${Date.now().toString().slice(-6)}`,
                                                        type: 'odometer',
                                                        odometer: 'ไม่ระบุ',
                                                        vehicleId: driver?.vehicleId || 'V001',
                                                        driverId: driver?.id || 'D001',
                                                        driverName: driver?.name || 'N/A',
                                                        scannedAt: new Date().toLocaleString('th-TH'),
                                                        imageData: odometerImage,
                                                    }),
                                                });
                                            } catch { /* ignore */ }
                                            alert('📸 ภาพเลขไมล์ถูกบันทึกแล้ว\n\nOCR Backend ไม่พร้อมใช้งาน กรุณากรอกเลขไมล์ด้วยตนเอง');
                                        }
                                        setOdometerProcessing(false);
                                        if (e.target) e.target.value = '';
                                    }}
                                />
                                {odometerProcessing ? (
                                    <div style={{ width: '100%', marginBottom: 12, textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: 'var(--accent-blue)' }}>
                                            <div className="driver-spinner" /> กำลังอ่านเลขไมล์...
                                        </div>
                                    </div>
                                ) : (
                                    <label htmlFor="odometer-input" className="driver-btn-primary" style={{ width: '100%', marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                        <Camera size={18} /> 📸 ถ่ายรูปเลขไมล์
                                    </label>
                                )}
                            </div>

                            {/* Fuel Bill History */}
                            <div className="driver-card">
                                <div className="driver-card-title">⛽ ประวัติการเติมน้ำมัน</div>
                                {fuelBills.length === 0 ? (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>ยังไม่มีรายการ</p>
                                ) : (
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    fuelBills.slice(0, 20).map((bill: any, i: number) => {
                                        const st = bill.station || bill.station || '';
                                        const br = bill.branch || bill.branch || '';
                                        const dt = bill.fillDate || bill.fill_date || bill.scannedAt || bill.scanned_at || '';
                                        const lt = bill.liters || bill.liters || '';
                                        const ta = bill.totalAmount || bill.total_amount || '';
                                        return (
                                            <div key={i} className="driver-mini-trip" style={{ cursor: 'pointer' }} onClick={() => setSelectedFuelBill({
                                                ...bill,
                                                billNo: bill.billNo || bill.bill_no,
                                                fillDate: bill.fillDate || bill.fill_date,
                                                station: st, branch: br,
                                                fuelType: bill.fuelType || bill.fuel_type,
                                                liters: lt,
                                                pricePerLiter: bill.pricePerLiter || bill.price_per_liter,
                                                totalAmount: ta,
                                                odometer: bill.odometer || '',
                                                taxId: bill.taxId || bill.tax_id,
                                                paymentMethod: bill.paymentMethod || bill.payment_method,
                                                vehicleId: bill.vehicleId || bill.vehicle_id,
                                                driverName: bill.driverName || bill.driver_name,
                                                scannedAt: bill.scannedAt || bill.scanned_at,
                                                ocrRawText: bill.ocrRawText || bill.ocr_raw_text,
                                                imageData: bill.imageData || bill.image_data,
                                            })}>
                                                <div className="driver-mini-trip-info">
                                                    <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        ⛽ {st} {br}
                                                    </strong>
                                                    <span>{dt}</span>
                                                    <span style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                                                        <span style={{ color: 'var(--accent-blue)' }}>🛢️ {lt} ลิตร</span>
                                                        <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>฿{ta}</span>
                                                    </span>
                                                </div>
                                                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </>
                    )}
                </div>
                {/* Fuel Camera Overlay with Receipt Frame */}
                {showFuelCamera && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                            <video ref={fuelVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {/* Receipt frame overlay */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: '85%', height: '60%', border: '2px dashed rgba(255,255,255,0.7)', borderRadius: 12, position: 'relative', boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }}>
                                    <div style={{ position: 'absolute', top: -2, left: -2, width: 24, height: 24, borderTop: '3px solid #3b82f6', borderLeft: '3px solid #3b82f6', borderRadius: '8px 0 0 0' }} />
                                    <div style={{ position: 'absolute', top: -2, right: -2, width: 24, height: 24, borderTop: '3px solid #3b82f6', borderRight: '3px solid #3b82f6', borderRadius: '0 8px 0 0' }} />
                                    <div style={{ position: 'absolute', bottom: -2, left: -2, width: 24, height: 24, borderBottom: '3px solid #3b82f6', borderLeft: '3px solid #3b82f6', borderRadius: '0 0 0 8px' }} />
                                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderBottom: '3px solid #3b82f6', borderRight: '3px solid #3b82f6', borderRadius: '0 0 8px 0' }} />
                                    <div style={{ position: 'absolute', top: 12, left: 0, right: 0, textAlign: 'center' }}>
                                        <span style={{ background: 'rgba(59,130,246,0.8)', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>📄 วางใบเสร็จในกรอบ</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', gap: 20, paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
                            <button onClick={() => stopFuelCamera()} style={{ padding: '14px 28px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>✕ ยกเลิก</button>
                            <button onClick={async () => {
                                if (!fuelVideoRef.current) return;
                                const canvas = document.createElement('canvas');
                                canvas.width = fuelVideoRef.current.videoWidth;
                                canvas.height = fuelVideoRef.current.videoHeight;
                                canvas.getContext('2d')?.drawImage(fuelVideoRef.current, 0, 0);
                                const rawDataUrl = canvas.toDataURL('image/jpeg', 0.85);
                                stopFuelCamera();
                                // Compress & send to Go OCR API (same flow as file input)
                                const imageData = await compressImage(rawDataUrl, 1024);
                                setOcrProcessing(true);
                                setOcrProgress(50);
                                try {
                                    const apiHost = `http://${window.location.hostname}:8081`;
                                    const res = await fetch(`${apiHost}/api/v1/fuel-bills/ocr`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            imageData,
                                            vehicleId: driver?.vehicleId || 'V001',
                                            driverId: driver?.id || 'D001',
                                            driverName: driver?.name || 'N/A',
                                        }),
                                    });
                                    setOcrProgress(90);
                                    const json = await res.json();
                                    if (json.success && json.data) {
                                        setSelectedFuelBill({ ...json.data, imageData });
                                    } else {
                                        const now = new Date();
                                        const fallback = {
                                            billId: `FUEL-${Date.now().toString().slice(-6)}`,
                                            billNo: `INV-${Date.now().toString().slice(-6)}`,
                                            fillDate: now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                                            station: 'ไม่ระบุ', branch: '', fuelType: 'ไม่ระบุ',
                                            liters: 'ไม่ระบุ', pricePerLiter: 'ไม่ระบุ', totalAmount: 'ไม่ระบุ',
                                            odometer: 'ไม่ระบุ', taxId: 'ไม่ระบุ', paymentMethod: 'ไม่ระบุ',
                                            vehicleId: driver?.vehicleId || 'V001',
                                            driverId: driver?.id || 'D001',
                                            driverName: driver?.name || 'N/A',
                                            scannedAt: now.toLocaleString('th-TH'),
                                            ocrRawText: json.message || '(OCR ไม่สามารถอ่านได้)',
                                            imageData,
                                        };
                                        await fetch('/api/fuel-bills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fallback) }).catch(() => { });
                                        setSelectedFuelBill(fallback);
                                    }
                                } catch {
                                    const now = new Date();
                                    const fallback = {
                                        billId: `FUEL-${Date.now().toString().slice(-6)}`,
                                        billNo: `INV-${Date.now().toString().slice(-6)}`,
                                        fillDate: now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                                        station: 'ไม่ระบุ', branch: '', fuelType: 'ไม่ระบุ',
                                        liters: 'ไม่ระบุ', pricePerLiter: 'ไม่ระบุ', totalAmount: 'ไม่ระบุ',
                                        odometer: 'ไม่ระบุ', taxId: 'ไม่ระบุ', paymentMethod: 'ไม่ระบุ',
                                        vehicleId: driver?.vehicleId || 'V001',
                                        driverId: driver?.id || 'D001',
                                        driverName: driver?.name || 'N/A',
                                        scannedAt: now.toLocaleString('th-TH'),
                                        ocrRawText: '(Backend OCR unavailable)',
                                        imageData,
                                    };
                                    await fetch('/api/fuel-bills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fallback) }).catch(() => { });
                                    setSelectedFuelBill(fallback);
                                }
                                loadFuelBills();
                                setOcrProcessing(false);
                                setOcrProgress(0);
                            }} style={{ padding: '14px 36px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 12px rgba(59,130,246,0.4)' }}>📸 ถ่ายรูป</button>
                        </div>
                    </div>
                )}
                <DriverNav screen={screen} setScreen={setScreen} />
            </div>
        );
    }

    // ===================== PROFILE SCREEN =====================
    if (screen === 'profile') {
        return (
            <div className="driver-app">
                <div className="driver-header">
                    <div className="driver-avatar-sm driver-home-btn" style={{ width: 32, height: 32 }} onClick={() => setScreen('menu')}><Home size={16} /></div>
                    <h2>👤 โปรไฟล์</h2>
                </div>
                <div className="driver-body">
                    <div className="driver-profile-card">
                        <div className="driver-avatar-lg">
                            <User size={40} />
                        </div>
                        <h2>{driver?.name || 'N/A'}</h2>
                        <p className="driver-profile-id">{driver?.id}</p>
                    </div>

                    <div className="driver-stats-grid">
                        <div className="driver-stat">
                            <span className="driver-stat-value">{driver?.safetyScore || 0}</span>
                            <span className="driver-stat-label">Safety Score</span>
                        </div>
                        <div className="driver-stat">
                            <span className="driver-stat-value">{driver?.totalTrips || 0}</span>
                            <span className="driver-stat-label">ทริปทั้งหมด</span>
                        </div>
                        <div className="driver-stat">
                            <span className="driver-stat-value">{driver?.hoursToday || 0}h</span>
                            <span className="driver-stat-label">ขับวันนี้</span>
                        </div>
                    </div>

                    <div className="driver-card">
                        <div className="driver-profile-row">
                            <Phone size={16} />
                            <span>เบอร์โทร</span>
                            <strong>{driver?.phone || '-'}</strong>
                        </div>
                        <div className="driver-profile-row">
                            <FileText size={16} />
                            <span>ใบขับขี่</span>
                            <strong>{driver?.licenseType || '-'}</strong>
                        </div>
                        <div className="driver-profile-row">
                            <Truck size={16} />
                            <span>รถประจำ</span>
                            <strong>{driver?.vehicleId || 'ไม่มี'}</strong>
                        </div>
                        <div className="driver-profile-row">
                            <Clock size={16} />
                            <span>สถานะ</span>
                            <strong>{driver?.status === 'on-duty' ? '🟢 ปฏิบัติงาน' : '🔵 พักงาน'}</strong>
                        </div>
                    </div>


                </div>
                <DriverNav screen={screen} setScreen={setScreen} />
            </div>
        );
    }

    // ===================== MENU SCREEN =====================
    if (screen === 'menu') {
        return (
            <div className="driver-app">
                <div className="driver-header driver-header-home">
                    <div className="driver-header-user">
                        <div className="driver-avatar-sm driver-home-btn" onClick={() => setScreen('home')}>
                            <Home size={18} />
                        </div>
                        <div>
                            <h2>สวัสดี, {driver?.name?.split(' ')[0] || 'คนขับ'} 👋</h2>
                            <p>{driver?.status === 'on-duty' ? '🟢 กำลังปฏิบัติงาน' : '🔵 พักงาน'}</p>
                        </div>
                    </div>
                    <button className="driver-btn-icon driver-btn-logout" onClick={() => { setDriver(null); setScreen('login'); }} title="ออกจากระบบ">
                        <LogOut size={18} />
                    </button>
                </div>
                <div className="driver-body">
                    <div className="driver-card" style={{ textAlign: 'center', padding: '24px 16px' }}>
                        {/* Container truck image hidden
                        <img src="/container-truck.png" alt="Container Truck" style={{ width: 120, height: 'auto', marginBottom: 8 }} />
                        */}
                        <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>เลือกเมนู</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>เลือกงานที่ต้องการดำเนินการ</p>
                    </div>

                    <div className="driver-menu-grid">
                        <button className="driver-menu-box" onClick={() => setScreen('scan-job')}>
                            <div className="driver-menu-box-icon teal"><ScanLine size={24} /></div>
                            <span>รับงาน</span>
                        </button>
                        <button className="driver-menu-box" onClick={() => setScreen('fuel-bill')}>
                            <div className="driver-menu-box-icon orange"><Fuel size={24} /></div>
                            <span>เติมน้ำมัน</span>
                        </button>
                        <button className="driver-menu-box">
                            <div className="driver-menu-box-icon blue"><Package size={24} /></div>
                            <span>บำรุงรักษา</span>
                        </button>
                        <button className="driver-menu-box">
                            <div className="driver-menu-box-icon red"><AlertTriangle size={24} /></div>
                            <span>แจ้งซ่อม</span>
                        </button>
                        <button className="driver-menu-box">
                            <div className="driver-menu-box-icon green"><FileText size={24} /></div>
                            <span>เช็ครายได้</span>
                        </button>
                    </div>
                </div>
                <DriverNav screen={screen} setScreen={setScreen} />
            </div>
        );
    }

    // ===================== HOME SCREEN =====================
    return (
        <div className="driver-app">
            <div className="driver-header driver-header-home">
                <div className="driver-header-user">
                    <div className="driver-avatar-sm driver-home-btn" onClick={() => setScreen('home')}>
                        <Home size={18} />
                    </div>
                    <div>
                        <h2>สวัสดี, {driver?.name?.split(' ')[0] || 'คนขับ'} 👋</h2>
                        <p>{driver?.status === 'on-duty' ? '🟢 กำลังปฏิบัติงาน' : '🔵 พักงาน'}</p>
                    </div>
                </div>
                <button className="driver-btn-icon driver-btn-logout" onClick={() => { setDriver(null); setScreen('login'); }} title="ออกจากระบบ">
                    <LogOut size={18} />
                </button>
            </div>

            <div className="driver-body">
                {/* Current Trip Card */}
                {currentTrip ? (
                    <div className="driver-card driver-active-trip" onClick={() => { setScreen('trip'); if (currentTrip.originLat && currentTrip.destLat) fetchFullRoute(currentTrip.originLat, currentTrip.originLng, currentTrip.destLat, currentTrip.destLng); }}>
                        <div className="driver-active-trip-header">
                            <div className="driver-active-trip-badge">🚛 ทริปปัจจุบัน</div>
                            <div className="driver-active-trip-action">
                                แตะเพื่อดูรายละเอียด <ChevronRight size={16} />
                            </div>
                        </div>
                        <div className="driver-active-trip-route">
                            <div className="driver-route-dot start" />
                            <div className="driver-route-line" />
                            <div className="driver-route-dot end" />
                        </div>
                        <div className="driver-active-trip-labels">
                            <span>{currentTrip.origin}</span>
                            <span>{currentTrip.destination}</span>
                        </div>
                        <div className="driver-trip-progress">
                            <div className="driver-progress-bar">
                                <div className="driver-progress-fill" style={{ width: `${currentTrip.progress}%` }} />
                            </div>
                            <div className="driver-progress-labels">
                                <span>{currentTrip.id}</span>
                                <span className="driver-progress-pct">{currentTrip.progress}%</span>
                                <span>{currentTrip.distance} กม.</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="driver-card driver-no-trip">
                        <Truck size={32} />
                        <h3>ไม่มีทริปที่ active</h3>
                        <p>รอการมอบหมายทริปจาก dispatcher</p>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="driver-quick-actions">
                    <button className="driver-quick-btn" onClick={() => handleTripAction('navigate')} disabled={!currentTrip}>
                        <div className={`driver-quick-icon blue${!currentTrip ? ' disabled' : ''}`}><Navigation size={20} /></div>
                        <span>นำทาง</span>
                    </button>
                    <button className="driver-quick-btn" onClick={() => { if (currentTrip) loadEpodData(currentTrip.id); setScreen('epod'); }} disabled={!currentTrip}>
                        <div className={`driver-quick-icon green${!currentTrip ? ' disabled' : ''}`}><Camera size={20} /></div>
                        <span>ePOD</span>
                    </button>
                    <button className="driver-quick-btn" onClick={() => setScreen('history')}>
                        <div className="driver-quick-icon purple"><Clock size={20} /></div>
                        <span>ประวัติ</span>
                    </button>
                    <button className="driver-quick-btn" disabled={!currentTrip}>
                        <div className={`driver-quick-icon amber${!currentTrip ? ' disabled' : ''}`}><MessageCircle size={20} /></div>
                        <span>แชท</span>
                    </button>
                </div>

                {/* Today Stats */}
                <div className="driver-card">
                    <div className="driver-card-title">📊 สรุปวันนี้</div>
                    <div className="driver-today-stats">
                        <div className="driver-today-item">
                            <span className="driver-today-value">{allTrips.filter(t => t.status === 'completed').length}</span>
                            <span className="driver-today-label">ทริปเสร็จ</span>
                        </div>
                        <div className="driver-today-item">
                            <span className="driver-today-value">{allTrips.reduce((a, t) => a + (t.status === 'completed' ? t.distance : 0), 0)}</span>
                            <span className="driver-today-label">กม. วิ่ง</span>
                        </div>
                        <div className="driver-today-item">
                            <span className="driver-today-value">{driver?.hoursToday || 0}h</span>
                            <span className="driver-today-label">ชม. ขับ</span>
                        </div>
                        <div className="driver-today-item">
                            <span className="driver-today-value">{driver?.safetyScore || 0}</span>
                            <span className="driver-today-label">Safety</span>
                        </div>
                    </div>
                </div>

                {/* Upcoming trips */}
                <div className="driver-card" style={{ padding: 0, height: 270 }}>
                    <div className="driver-card-title" style={{ padding: '12px 16px 8px' }}>📋 ทริปวันนี้ ({allTrips.length})</div>
                    <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                        {allTrips.map(trip => (
                            <div key={trip.id} className="driver-mini-trip" onClick={() => { setCurrentTrip(trip); setScreen('trip'); if (trip.originLat && trip.destLat) fetchFullRoute(trip.originLat, trip.originLng, trip.destLat, trip.destLng); }}>
                                <div className="driver-mini-trip-info">
                                    <strong>{trip.id}</strong>
                                    <span>{trip.origin} → {trip.destination}</span>
                                </div>
                                <span className={`driver-trip-status ${trip.status}`}>
                                    {trip.status === 'in-transit' ? '🚛' : trip.status === 'completed' ? '✅' : '📦'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* PWA Banners — show in all logged-in screens */}
            <OfflineBanner />
            <UpdateBanner />
            <PWAInstallBanner />
            <DriverNav screen={screen} setScreen={setScreen} />
        </div>
    );
}

// ===================== BOTTOM NAV =====================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DriverNav({ screen, setScreen }: { screen: string; setScreen: (s: any) => void }) {
    return (
        <nav className="driver-nav">
            <button className={`driver-nav-btn ${screen === 'menu' || screen === 'home' ? 'active' : ''}`} onClick={() => setScreen('menu')}>
                <Home size={18} />
                <span>เมนู</span>
            </button>
            <button className={`driver-nav-btn ${screen === 'scan-job' ? 'active' : ''}`} onClick={() => setScreen('scan-job')}>
                <ScanLine size={18} />
                <span>รับงาน</span>
            </button>
            <button className={`driver-nav-btn ${screen === 'trip' ? 'active' : ''}`} onClick={() => setScreen('trip')}>
                <MapPin size={18} />
                <span>ทริป</span>
            </button>
            <button className={`driver-nav-btn ${screen === 'fuel-bill' ? 'active' : ''}`} onClick={() => setScreen('fuel-bill')}>
                <Receipt size={18} />
                <span>บิลน้ำมัน</span>
            </button>
            <button className={`driver-nav-btn ${screen === 'history' ? 'active' : ''}`} onClick={() => setScreen('history')}>
                <Clock size={18} />
                <span>ประวัติ</span>
            </button>
            <button className={`driver-nav-btn ${screen === 'profile' ? 'active' : ''}`} onClick={() => setScreen('profile')}>
                <User size={18} />
                <span>โปรไฟล์</span>
            </button>
        </nav>
    );
}
