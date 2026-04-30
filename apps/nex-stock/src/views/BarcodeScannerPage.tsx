'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Barcode, CheckCircle2, AlertCircle, Package, Search, X, Loader2 } from 'lucide-react';

export default function BarcodeScannerPage() {
    const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
    const [isScanning, setIsScanning] = useState(false);
    const [scannedResult, setScannedResult] = useState<{sku: string, name: string, qty: number} | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [logs, setLogs] = useState<{id: string, time: string, sku: string, type: 'IN'|'OUT', status: string}[]>([]);
    
    const [cameraActive, setCameraActive] = useState(false);

    // Mock items database
    const mockDb: Record<string, {name: string, qty: number}> = {
        'SKU-1001': { name: 'น้ำมันเครื่อง 5W-40', qty: 25 },
        'SKU-1002': { name: 'กรองน้ำมันเครื่อง', qty: 154 },
        'SKU-1003': { name: 'ผ้าเบรคหน้า', qty: 42 },
        'SKU-1004': { name: 'หลอดไฟหน้า H4', qty: 89 },
    };

    const handleScan = (code: string) => {
        setIsScanning(true);
        setTimeout(() => {
            const item = mockDb[code.toUpperCase()];
            if (item) {
                setScannedResult({ sku: code.toUpperCase(), ...item });
            } else {
                setScannedResult({ sku: code, name: 'ไม่พบข้อมูลสินค้า', qty: 0 });
            }
            setIsScanning(false);
        }, 600);
    };

    const handleProcess = (type: 'IN' | 'OUT') => {
        if (!scannedResult || scannedResult.name === 'ไม่พบข้อมูลสินค้า') return;
        
        const newLog = {
            id: Math.random().toString(36).substr(2, 9),
            time: new Date().toLocaleTimeString(),
            sku: scannedResult.sku,
            type,
            status: 'Success'
        };
        
        setLogs([newLog, ...logs]);
        setScannedResult(null);
        setInputValue('');
        if (scanMode === 'camera') setCameraActive(true);
    };

    const toggleCamera = () => {
        setCameraActive(!cameraActive);
        setScannedResult(null);
    };

    return (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 350px', gap: '20px', alignItems: 'start' }}>
            
            {/* Left Col: Scanner Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Barcode size={22} color="#8b5cf6" />
                            ระบบสแกนคลังสินค้า (GR / GI)
                        </h2>
                        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                            <button 
                                onClick={() => { setScanMode('camera'); setCameraActive(true); }}
                                style={{ padding: '6px 12px', border: 'none', background: scanMode === 'camera' ? '#fff' : 'transparent', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: scanMode === 'camera' ? '#0f172a' : '#64748b', cursor: 'pointer', boxShadow: scanMode === 'camera' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                            >
                                <Camera size={14} style={{ display: 'inline', marginRight: 4 }} /> กล้อง
                            </button>
                            <button 
                                onClick={() => { setScanMode('manual'); setCameraActive(false); }}
                                style={{ padding: '6px 12px', border: 'none', background: scanMode === 'manual' ? '#fff' : 'transparent', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: scanMode === 'manual' ? '#0f172a' : '#64748b', cursor: 'pointer', boxShadow: scanMode === 'manual' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                            >
                                <Search size={14} style={{ display: 'inline', marginRight: 4 }} /> พิมพ์รหัส
                            </button>
                        </div>
                    </div>

                    {scanMode === 'camera' ? (
                        <div style={{ height: '320px', background: '#0f172a', borderRadius: '16px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #334155' }}>
                            {cameraActive && !scannedResult ? (
                                <>
                                    <div style={{ position: 'absolute', inset: '20%', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '12px' }}>
                                        <div style={{ position: 'absolute', top: -2, left: -2, width: '20px', height: '20px', borderTop: '4px solid #3b82f6', borderLeft: '4px solid #3b82f6', borderRadius: '12px 0 0 0' }} />
                                        <div style={{ position: 'absolute', top: -2, right: -2, width: '20px', height: '20px', borderTop: '4px solid #3b82f6', borderRight: '4px solid #3b82f6', borderRadius: '0 12px 0 0' }} />
                                        <div style={{ position: 'absolute', bottom: -2, left: -2, width: '20px', height: '20px', borderBottom: '4px solid #3b82f6', borderLeft: '4px solid #3b82f6', borderRadius: '0 0 0 12px' }} />
                                        <div style={{ position: 'absolute', bottom: -2, right: -2, width: '20px', height: '20px', borderBottom: '4px solid #3b82f6', borderRight: '4px solid #3b82f6', borderRadius: '0 0 12px 0' }} />
                                        <div style={{ width: '100%', height: '2px', background: 'rgba(59,130,246,0.6)', position: 'absolute', top: '50%', boxShadow: '0 0 10px rgba(59,130,246,0.8)' }} className="scan-line-anim" />
                                    </div>
                                    <p style={{ color: '#94a3b8', fontSize: '13px', position: 'absolute', bottom: '24px' }}>พร้อมสแกน... กรุณาวาง Barcode ในกรอบ</p>
                                    
                                    {/* Mock scan buttons for demo */}
                                    <div style={{ position: 'absolute', right: 10, top: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                                        <button onClick={() => { setCameraActive(false); handleScan('SKU-1002'); }} style={{ fontSize: '10px', padding: '4px 8px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', cursor: 'pointer' }}>Test SKU-1002</button>
                                        <button onClick={() => { setCameraActive(false); handleScan('SKU-9999'); }} style={{ fontSize: '10px', padding: '4px 8px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', cursor: 'pointer' }}>Test Invalid</button>
                                    </div>
                                </>
                            ) : !scannedResult ? (
                                <button onClick={toggleCamera} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Camera size={18} /> เปิดกล้องสแกน
                                </button>
                            ) : (
                                <div style={{ color: '#fff' }}>สแกนสำเร็จ</div>
                            )}
                        </div>
                    ) : (
                        <div style={{ height: '320px', background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                            <div style={{ width: '100%', maxWidth: '400px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>รหัสบาร์โค้ด / SKU</label>
                                <div style={{ position: 'relative' }}>
                                    <Barcode size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input 
                                        type="text" 
                                        value={inputValue}
                                        onChange={e => setInputValue(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleScan(inputValue)}
                                        placeholder="พิมพ์หรือยิงเครื่องสแกน..."
                                        style={{ width: '100%', height: '52px', paddingLeft: '48px', paddingRight: '16px', fontSize: '16px', border: '2px solid #e2e8f0', borderRadius: '12px', outline: 'none' }}
                                        autoFocus
                                    />
                                    <button 
                                        onClick={() => handleScan(inputValue)}
                                        disabled={!inputValue || isScanning}
                                        style={{ position: 'absolute', right: 8, top: 8, height: '36px', padding: '0 16px', border: 'none', background: '#3b82f6', color: '#fff', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        {isScanning ? <Loader2 size={16} className="spin" /> : 'ค้นหา'}
                                    </button>
                                </div>
                                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px', textAlign: 'center' }}>(สแกนเนอร์ Bluetooth/USB สามารถยิงเข้าช่องนี้ได้เลย)</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Result Processing Area */}
                {scannedResult && (
                    <div className="card" style={{ padding: '24px', borderColor: scannedResult.qty > 0 ? '#bbf7d0' : '#fecaca', background: scannedResult.qty > 0 ? '#f0fdf4' : '#fef2f2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                    {scannedResult.qty > 0 ? <Package size={24} color="#16a34a" /> : <AlertCircle size={24} color="#dc2626" />}
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, fontFamily: 'monospace' }}>{scannedResult.sku}</div>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{scannedResult.name}</div>
                                    <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>จำนวนคงเหลือ: <strong style={{ fontSize: '15px', color: '#0f172a' }}>{scannedResult.qty}</strong> หน่วย</div>
                                </div>
                            </div>
                            <button onClick={() => { setScannedResult(null); if (scanMode === 'camera') setCameraActive(true); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {scannedResult.qty > 0 && (
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button onClick={() => handleProcess('IN')} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '10px', background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>
                                    + รับเข้า (GR)
                                </button>
                                <button onClick={() => handleProcess('OUT')} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '10px', background: '#3b82f6', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
                                    - เบิกออก (GI)
                                </button>
                            </div>
                        )}
                        {scannedResult.qty === 0 && (
                            <div style={{ marginTop: '16px', color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>
                                ไม่สามารถเบิกออกได้ (สินค้าหมด หรือ ไม่พบในระบบ)
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right Col: Scan Log */}
            <div className="card" style={{ padding: '0', height: '100%', alignSelf: 'stretch', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>Scan Log ล่าสุด</div>
                    <div style={{ fontSize: '11px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px', color: '#64748b', fontWeight: 600 }}>{logs.length} รายการ</div>
                </div>
                <div style={{ padding: '12px', overflowY: 'auto', flex: 1 }}>
                    {logs.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: '13px' }}>ยังไม่มีประวัติการสแกน</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {logs.map((log) => (
                                <div key={log.id} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: log.type === 'IN' ? '#dcfce7' : '#dbeafe', color: log.type === 'IN' ? '#16a34a' : '#2563eb' }}>
                                                {log.type === 'IN' ? 'รับเข้า' : 'เบิกออก'}
                                            </span>
                                            <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'monospace' }}>{log.sku}</span>
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>เวลา {log.time}</div>
                                    </div>
                                    <CheckCircle2 size={16} color="#16a34a" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes scan-line { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
                .scan-line-anim { animation: scan-line 2.5s infinite linear; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .spin { animation: spin 1s infinite linear; }
            `}</style>
        </div>
    );
}
