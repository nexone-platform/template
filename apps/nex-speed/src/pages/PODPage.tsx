'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    PenTool, Camera, CheckCircle2, Trash2, Upload, X, MapPin,
    Package, User, Truck, Clock, ClipboardCheck, Image as ImageIcon,
    ChevronLeft, ChevronRight, Eye, Search, FileText
} from 'lucide-react';
import { api, Trip } from '@/services/api';

// ── Types ──────────────────────────────────────────────────────────────────────
interface EPODRecord {
    id: number;
    tripId: string;
    receiverName: string;
    signatureUrl: string;
    photoUrl: string;
    productPhotoUrl: string;
    deliveryPhotoUrl: string;
    notes: string;
    lat: number;
    lng: number;
    submittedAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// ── Signature Canvas ───────────────────────────────────────────────────────────
function SignatureCanvas({ onSave, onClear }: { onSave: (data: string) => void; onClear: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [drawing, setDrawing] = useState(false);
    const [hasStrokes, setHasStrokes] = useState(false);
    const lastPos = useRef<{ x: number; y: number } | null>(null);

    const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        if ('touches' in e) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY,
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };

    const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const canvas = canvasRef.current; if (!canvas) return;
        setDrawing(true);
        lastPos.current = getPos(e, canvas);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (!drawing) return;
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        const pos = getPos(e, canvas);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastPos.current = pos;
        setHasStrokes(true);
    };

    const endDraw = () => { setDrawing(false); };

    const clear = () => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasStrokes(false);
        onClear();
    };

    const save = () => {
        const canvas = canvasRef.current; if (!canvas || !hasStrokes) return;
        onSave(canvas.toDataURL('image/png'));
    };

    return (
        <div style={{ border: '2px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
            <div style={{ padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                    <PenTool size={12} style={{ marginRight: 4 }} />วาดลายเซ็น
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={clear} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Trash2 size={11} /> ล้าง
                    </button>
                    <button onClick={save} disabled={!hasStrokes} style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: hasStrokes ? '#2563eb' : '#e2e8f0', color: hasStrokes ? '#fff' : '#94a3b8', fontSize: '12px', cursor: hasStrokes ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={11} /> บันทึก
                    </button>
                </div>
            </div>
            <canvas
                ref={canvasRef}
                width={560}
                height={180}
                style={{ width: '100%', height: '180px', cursor: 'crosshair', display: 'block', touchAction: 'none' }}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
            />
        </div>
    );
}

// ── Photo Upload ───────────────────────────────────────────────────────────────
function PhotoUpload({ label, value, onChange, icon }: {
    label: string;
    value: string;
    onChange: (data: string) => void;
    icon: React.ReactNode;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = e => onChange(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    return (
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {icon}{label}
            </div>
            {value ? (
                <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '2px solid #22c55e' }}>
                    <img src={value} alt={label} style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
                    <button onClick={() => onChange('')} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '22px', height: '22px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={12} />
                    </button>
                    <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: '#22c55e', borderRadius: '20px', padding: '2px 8px', fontSize: '10px', color: '#fff', fontWeight: 600 }}>✓ อัปโหลดแล้ว</div>
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                    style={{ height: '100px', border: '2px dashed #cbd5e1', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', background: '#f8fafc', transition: 'all 0.15s' }}
                >
                    <Upload size={20} color="#94a3b8" />
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>คลิกหรือลากไฟล์</span>
                </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
    );
}

// ── POD Form Modal ─────────────────────────────────────────────────────────────
function PODFormModal({ trip, onClose, onSuccess }: {
    trip: Trip;
    onClose: () => void;
    onSuccess: (record: EPODRecord) => void;
}) {
    const [receiverName, setReceiverName] = useState('');
    const [notes, setNotes] = useState('');
    const [signatureData, setSignatureData] = useState('');
    const [photoData, setPhotoData] = useState('');
    const [productPhotoData, setProductPhotoData] = useState('');
    const [deliveryPhotoData, setDeliveryPhotoData] = useState('');
    const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
    const [step, setStep] = useState(1); // 1=info, 2=signature, 3=photos
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => setGps({ lat: 0, lng: 0 })
            );
        }
    }, []);

    const canGoStep2 = receiverName.trim().length > 0;
    const canGoStep3 = signatureData.length > 0;
    const canSubmit = canGoStep2 && canGoStep3;

    const handleSubmit = async () => {
        if (!canSubmit) { setError('กรุณากรอกชื่อผู้รับและวาดลายเซ็น'); return; }
        setSubmitting(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/epod`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tripId: trip.id,
                    receiverName,
                    signatureUrl: signatureData,
                    photoUrl: photoData,
                    productPhotoUrl: productPhotoData,
                    deliveryPhotoUrl: deliveryPhotoData,
                    notes,
                    lat: gps?.lat ?? 0,
                    lng: gps?.lng ?? 0,
                }),
            });
            if (!res.ok) throw new Error('บันทึกไม่สำเร็จ กรุณาลองใหม่');
            onSuccess({
                id: Date.now(),
                tripId: trip.id,
                receiverName,
                signatureUrl: signatureData,
                photoUrl: photoData,
                productPhotoUrl: productPhotoData,
                deliveryPhotoUrl: deliveryPhotoData,
                notes,
                lat: gps?.lat ?? 0,
                lng: gps?.lng ?? 0,
                submittedAt: new Date().toISOString(),
            });
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const steps = [
        { n: 1, label: 'ข้อมูล' },
        { n: 2, label: 'ลายเซ็น' },
        { n: 3, label: 'รูปถ่าย' },
    ];

    return (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '600px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.22)', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #1e40af, #2563eb)', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ClipboardCheck size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>ยืนยันการส่ง (POD)</h2>
                        <p style={{ margin: '2px 0 0', fontSize: '13px', opacity: 0.85 }}>ทริป {trip.id} · {trip.origin} → {trip.destination}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '6px', color: '#fff', cursor: 'pointer', display: 'flex' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Step Bar */}
                <div style={{ display: 'flex', padding: '16px 24px 0', gap: '0', borderBottom: '1px solid #f1f5f9' }}>
                    {steps.map((s, i) => (
                        <React.Fragment key={s.n}>
                            <div
                                onClick={() => s.n <= step && setStep(s.n)}
                                style={{ flex: 1, textAlign: 'center', paddingBottom: '12px', cursor: s.n <= step ? 'pointer' : 'default', borderBottom: `3px solid ${step === s.n ? '#2563eb' : step > s.n ? '#22c55e' : '#e2e8f0'}`, transition: 'border-color 0.2s' }}
                            >
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: step === s.n ? '#2563eb' : step > s.n ? '#22c55e' : '#e2e8f0', color: step >= s.n ? '#fff' : '#94a3b8', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
                                    {step > s.n ? '✓' : s.n}
                                </div>
                                <div style={{ fontSize: '11px', color: step === s.n ? '#2563eb' : '#64748b', fontWeight: step === s.n ? 600 : 400 }}>{s.label}</div>
                            </div>
                            {i < steps.length - 1 && <div style={{ width: '1px', background: '#e2e8f0', margin: '0 4px' }} />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

                    {/* Step 1 — Info */}
                    {step === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Trip Info Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {[
                                    { icon: <Truck size={14} />, label: 'รหัสทริป', value: trip.id },
                                    { icon: <User size={14} />, label: 'คนขับ', value: trip.driverId },
                                    { icon: <MapPin size={14} />, label: 'ต้นทาง', value: trip.origin },
                                    { icon: <MapPin size={14} />, label: 'ปลายทาง', value: trip.destination },
                                ].map((item, i) => (
                                    <div key={i} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>{item.icon}{item.label}</div>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* GPS Status */}
                            <div style={{ padding: '10px 14px', background: gps ? '#f0fdf4' : '#fffbeb', borderRadius: '10px', border: `1px solid ${gps ? '#bbf7d0' : '#fde68a'}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MapPin size={14} color={gps ? '#16a34a' : '#d97706'} />
                                <span style={{ fontSize: '12px', color: gps ? '#16a34a' : '#d97706', fontWeight: 500 }}>
                                    {gps ? `GPS พร้อม · ${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}` : 'กำลังรับ GPS...'}
                                </span>
                            </div>

                            {/* Receiver Name */}
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '6px' }}>
                                    ชื่อผู้รับสินค้า <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    value={receiverName}
                                    onChange={e => setReceiverName(e.target.value)}
                                    placeholder="กรอกชื่อผู้รับ"
                                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '6px' }}>หมายเหตุ</label>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="บันทึกเพิ่มเติม (ถ้ามี)"
                                    rows={3}
                                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2 — Signature */}
                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>ให้ผู้รับสินค้าวาดลายเซ็นในกรอบด้านล่าง แล้วกด "บันทึก"</p>
                            <SignatureCanvas
                                onSave={setSignatureData}
                                onClear={() => setSignatureData('')}
                            />
                            {signatureData && (
                                <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CheckCircle2 size={16} color="#16a34a" />
                                    <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: 500 }}>บันทึกลายเซ็นแล้ว</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3 — Photos */}
                    {step === 3 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>ถ่ายรูปหลักฐานการส่งสินค้า (ไม่บังคับแต่แนะนำ)</p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <PhotoUpload label="รูปผู้รับ" value={photoData} onChange={setPhotoData} icon={<User size={11} />} />
                                <PhotoUpload label="รูปสินค้า" value={productPhotoData} onChange={setProductPhotoData} icon={<Package size={11} />} />
                                <PhotoUpload label="รูปจุดส่ง" value={deliveryPhotoData} onChange={setDeliveryPhotoData} icon={<MapPin size={11} />} />
                            </div>
                            {error && (
                                <div style={{ padding: '10px 14px', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px' }}>
                                    ⚠️ {error}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    <button
                        onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
                        style={{ padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '14px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <ChevronLeft size={16} />{step > 1 ? 'ย้อนกลับ' : 'ยกเลิก'}
                    </button>
                    {step < 3 ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            disabled={step === 1 && !canGoStep2 || step === 2 && !canGoStep3}
                            style={{
                                padding: '10px 24px', borderRadius: '10px', border: 'none',
                                background: (step === 1 && !canGoStep2) || (step === 2 && !canGoStep3) ? '#e2e8f0' : '#2563eb',
                                color: (step === 1 && !canGoStep2) || (step === 2 && !canGoStep3) ? '#94a3b8' : '#fff',
                                fontSize: '14px', fontWeight: 600,
                                cursor: (step === 1 && !canGoStep2) || (step === 2 && !canGoStep3) ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px',
                            }}
                        >
                            ถัดไป <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !canSubmit}
                            style={{
                                padding: '10px 24px', borderRadius: '10px', border: 'none',
                                background: submitting || !canSubmit ? '#e2e8f0' : 'linear-gradient(135deg,#22c55e,#16a34a)',
                                color: submitting || !canSubmit ? '#94a3b8' : '#fff',
                                fontSize: '14px', fontWeight: 700,
                                cursor: submitting || !canSubmit ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px',
                            }}
                        >
                            <CheckCircle2 size={16} />{submitting ? 'กำลังส่ง...' : 'ยืนยันการส่ง'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── POD Viewer Modal ───────────────────────────────────────────────────────────
function PODViewerModal({ record, onClose }: { record: EPODRecord; onClose: () => void }) {
    return (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '560px', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.22)' }}>
                <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>✅ POD — ทริป {record.tripId}</h2>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', opacity: 0.9 }}>
                            ส่งเมื่อ {new Date(record.submittedAt).toLocaleString('th-TH')}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '6px', color: '#fff', cursor: 'pointer', display: 'flex' }}>
                        <X size={18} />
                    </button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {[
                            ['ชื่อผู้รับ', record.receiverName],
                            ['GPS', `${record.lat.toFixed(5)}, ${record.lng.toFixed(5)}`],
                        ].map(([k, v]) => (
                            <div key={k} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>{k}</div>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{v}</div>
                            </div>
                        ))}
                    </div>
                    {/* Signature */}
                    {record.signatureUrl && (
                        <div>
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '6px' }}>✍️ ลายเซ็นผู้รับ</div>
                            <div style={{ border: '2px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                                <img src={record.signatureUrl} alt="signature" style={{ width: '100%', background: '#fff', display: 'block' }} />
                            </div>
                        </div>
                    )}
                    {/* Photos */}
                    {(record.photoUrl || record.productPhotoUrl || record.deliveryPhotoUrl) && (
                        <div>
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '8px' }}>📸 รูปถ่ายหลักฐาน</div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {record.photoUrl && <img src={record.photoUrl} style={{ flex: 1, height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />}
                                {record.productPhotoUrl && <img src={record.productPhotoUrl} style={{ flex: 1, height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />}
                                {record.deliveryPhotoUrl && <img src={record.deliveryPhotoUrl} style={{ flex: 1, height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />}
                            </div>
                        </div>
                    )}
                    {/* Notes */}
                    {record.notes && (
                        <div style={{ padding: '12px 14px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a', fontSize: '13px', color: '#92400e' }}>
                            📝 {record.notes}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main POD Page ──────────────────────────────────────────────────────────────
export default function PODPage() {
    const [pods, setPods] = useState<EPODRecord[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loadingPods, setLoadingPods] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [viewRecord, setViewRecord] = useState<EPODRecord | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 10;

    const loadData = useCallback(async () => {
        setLoadingPods(true);
        try {
            const [podRes, tripsData] = await Promise.all([
                fetch(`${API_BASE}/epod`).then(r => r.json()),
                api.getTrips(),
            ]);
            setPods(podRes.data || []);
            setTrips(tripsData || []);
        } catch {}
        setLoadingPods(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const podMap = Object.fromEntries(pods.map(p => [p.tripId, p]));

    // Trips that can receive POD (completed or in-transit)
    const eligibleTrips = trips.filter(t => t.status === 'in-transit' || t.status === 'loading' || t.status === 'completed');
    const pendingPOD = eligibleTrips.filter(t => !podMap[t.id]);
    const completedPOD = pods.filter(p => {
        const q = search.toLowerCase();
        return !q || p.tripId.toLowerCase().includes(q) || p.receiverName.toLowerCase().includes(q);
    });

    const totalPages = Math.max(1, Math.ceil(completedPOD.length / perPage));
    const pagedPOD = completedPOD.slice((currentPage - 1) * perPage, currentPage * perPage);

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Header KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '12px' }}>
                {[
                    { icon: <ClipboardCheck size={20} />, color: '#2563eb', label: 'POD ทั้งหมด', value: pods.length },
                    { icon: <CheckCircle2 size={20} />, color: '#16a34a', label: 'ส่งสำเร็จแล้ว', value: pods.length },
                    { icon: <Clock size={20} />, color: '#f59e0b', label: 'รอ POD', value: pendingPOD.length },
                    { icon: <FileText size={20} />, color: '#8b5cf6', label: 'ทริปทั้งหมด', value: trips.length },
                ].map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', background: `${c.color}0f`, border: `1px solid ${c.color}22` }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>
                            {c.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{c.label}</div>
                            <div style={{ fontSize: '22px', fontWeight: 700, color: c.color }}>{c.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pending POD Section */}
            {pendingPOD.length > 0 && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', background: 'linear-gradient(135deg,#fef3c7,#fffbeb)', borderBottom: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} color="#d97706" />
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#92400e' }}>รอดำเนินการ POD ({pendingPOD.length} ทริป)</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {pendingPOD.slice(0, 5).map(trip => (
                            <div key={trip.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                                    <Truck size={16} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>{trip.id}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={11} />{trip.origin} → {trip.destination}
                                    </div>
                                </div>
                                <div style={{ fontSize: '12px', color: trip.status === 'completed' ? '#16a34a' : '#f59e0b', fontWeight: 600 }}>
                                    {trip.status === 'completed' ? '✅ เสร็จสิ้น' : '🚛 กำลังวิ่ง'}
                                </div>
                                <button
                                    onClick={() => setSelectedTrip(trip)}
                                    style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                                >
                                    <ClipboardCheck size={13} /> บันทึก POD
                                </button>
                            </div>
                        ))}
                        {pendingPOD.length > 5 && (
                            <div style={{ padding: '10px 20px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                                และอีก {pendingPOD.length - 5} ทริป...
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* POD History Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>ประวัติ POD ทั้งหมด ({pods.length} รายการ)</h3>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            placeholder="ค้นหาทริป, ผู้รับ..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                            style={{ paddingLeft: '30px', paddingRight: '12px', paddingTop: '7px', paddingBottom: '7px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none', width: '180px' }}
                        />
                    </div>
                </div>

                {loadingPods ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>กำลังโหลด...</div>
                ) : pagedPOD.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                        <ClipboardCheck size={40} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
                        ยังไม่มีข้อมูล POD
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    {['ทริป', 'ผู้รับ', 'ลายเซ็น', 'รูปถ่าย', 'GPS', 'เวลา', ''].map(h => (
                                        <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pagedPOD.map(record => (
                                    <tr key={record.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#2563eb' }}>{record.tripId}</td>
                                        <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 500 }}>{record.receiverName}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            {record.signatureUrl
                                                ? <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>✓ มี</span>
                                                : <span style={{ background: '#f1f5f9', color: '#94a3b8', padding: '3px 8px', borderRadius: '20px', fontSize: '11px' }}>ไม่มี</span>}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            {(record.photoUrl || record.productPhotoUrl || record.deliveryPhotoUrl)
                                                ? <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                                                    <ImageIcon size={10} style={{ marginRight: 3 }} />
                                                    {[record.photoUrl, record.productPhotoUrl, record.deliveryPhotoUrl].filter(Boolean).length} รูป
                                                </span>
                                                : <span style={{ background: '#f1f5f9', color: '#94a3b8', padding: '3px 8px', borderRadius: '20px', fontSize: '11px' }}>ไม่มี</span>}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px' }}>
                                            {record.lat !== 0 ? `${record.lat.toFixed(3)}, ${record.lng.toFixed(3)}` : '—'}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                            {new Date(record.submittedAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <button onClick={() => setViewRecord(record)} style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                                                <Eye size={13} /> ดู
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#64748b' }}>
                        <span>แสดง {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, completedPOD.length)} จาก {completedPOD.length}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} style={{ padding: '5px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}><ChevronLeft size={13} /></button>
                            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} style={{ padding: '5px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}><ChevronRight size={13} /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {selectedTrip && (
                <PODFormModal
                    trip={selectedTrip}
                    onClose={() => setSelectedTrip(null)}
                    onSuccess={record => {
                        setPods(prev => [record, ...prev]);
                        setSelectedTrip(null);
                    }}
                />
            )}
            {viewRecord && <PODViewerModal record={viewRecord} onClose={() => setViewRecord(null)} />}
        </div>
    );
}
