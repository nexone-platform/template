'use client';

import React, { useEffect, useState, useRef } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
    isInstallable: boolean;
    isInstalled: boolean;
    isOffline: boolean;
    isUpdating: boolean;
    swReady: boolean;
    epodPending: number;
}

// ── PWA Manager Hook ───────────────────────────────────────────────────────────
export function usePWA() {
    const [state, setState] = useState<PWAState>({
        isInstallable: false,
        isInstalled: false,
        isOffline: false,
        isUpdating: false,
        swReady: false,
        epodPending: 0,
    });
    const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Check if already installed (standalone mode)
        const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;

        // Online/offline
        const onOnline  = () => setState(p => ({ ...p, isOffline: false }));
        const onOffline = () => setState(p => ({ ...p, isOffline: true }));
        window.addEventListener('online',  onOnline);
        window.addEventListener('offline', onOffline);
        setState(p => ({ ...p, isOffline: !navigator.onLine, isInstalled }));

        // Install prompt
        const onInstallPrompt = (e: Event) => {
            e.preventDefault();
            promptRef.current = e as BeforeInstallPromptEvent;
            setState(p => ({ ...p, isInstallable: !isInstalled }));
        };
        window.addEventListener('beforeinstallprompt', onInstallPrompt);

        // Installed confirmation
        const onInstalled = () => {
            setState(p => ({ ...p, isInstalled: true, isInstallable: false }));
            promptRef.current = null;
        };
        window.addEventListener('appinstalled', onInstalled);

        // Register Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js', { scope: '/' })
                .then((reg) => {
                    setState(p => ({ ...p, swReady: true }));

                    // Check for updates every 60s
                    setInterval(() => reg.update(), 60_000);

                    reg.addEventListener('updatefound', () => {
                        const newWorker = reg.installing;
                        if (newWorker) {
                            setState(p => ({ ...p, isUpdating: true }));
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New version ready — prompt user
                                    setState(p => ({ ...p, isUpdating: true }));
                                }
                            });
                        }
                    });
                })
                .catch(err => console.warn('[PWA] SW registration failed:', err));

            // Listen for messages from SW
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data?.type === 'epod-synced') {
                    setState(p => ({ ...p, epodPending: Math.max(0, p.epodPending - 1) }));
                }
            });
        }

        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
            window.removeEventListener('beforeinstallprompt', onInstallPrompt);
            window.removeEventListener('appinstalled', onInstalled);
        };
    }, []);

    const install = async () => {
        if (!promptRef.current) return false;
        await promptRef.current.prompt();
        const choice = await promptRef.current.userChoice;
        if (choice.outcome === 'accepted') {
            setState(p => ({ ...p, isInstalled: true, isInstallable: false }));
        }
        promptRef.current = null;
        return choice.outcome === 'accepted';
    };

    const applyUpdate = () => {
        navigator.serviceWorker.getRegistration().then(reg => {
            reg?.waiting?.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        });
    };

    return { ...state, install, applyUpdate };
}

// ── Install Banner Component ───────────────────────────────────────────────────
export function PWAInstallBanner({ onClose }: { onClose?: () => void }) {
    const { isInstallable, isInstalled, install } = usePWA();
    const [dismissed, setDismissed] = useState(false);
    const [installing, setInstalling] = useState(false);

    // Check if user already dismissed this session
    useEffect(() => {
        setDismissed(!!sessionStorage.getItem('pwa-banner-dismissed'));
    }, []);

    if (!isInstallable || isInstalled || dismissed) return null;

    const handleInstall = async () => {
        setInstalling(true);
        const ok = await install();
        if (ok || !ok) { // always hide after prompt
            setDismissed(true);
            onClose?.();
        }
        setInstalling(false);
    };

    const handleDismiss = () => {
        sessionStorage.setItem('pwa-banner-dismissed', '1');
        setDismissed(true);
        onClose?.();
    };

    return (
        <div style={{
            position: 'fixed', bottom: '80px', left: '12px', right: '12px',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #1e3a8a, #1e40af)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex', alignItems: 'center', gap: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            animation: 'slideUpBanner 0.4s cubic-bezier(0.4,0,0.2,1)',
        }}>
            {/* Icon */}
            <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', flexShrink: 0,
            }}>
                🚛
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>
                    ติดตั้งแอปคนขับ
                </div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', lineHeight: 1.4 }}>
                    ใช้งานออฟไลน์ได้ · เปิดเร็วขึ้น · เหมือนแอปจริง
                </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                <button
                    onClick={handleInstall}
                    disabled={installing}
                    style={{
                        padding: '8px 16px', borderRadius: '8px',
                        background: '#fff', color: '#1e40af',
                        border: 'none', fontWeight: 700, fontSize: '13px',
                        cursor: installing ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {installing ? '⏳ รอสักครู่' : '📲 ติดตั้ง'}
                </button>
                <button
                    onClick={handleDismiss}
                    style={{
                        padding: '6px 16px', borderRadius: '8px',
                        background: 'transparent', color: 'rgba(255,255,255,0.6)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        fontWeight: 500, fontSize: '12px', cursor: 'pointer',
                    }}
                >
                    ไม่ตอนนี้
                </button>
            </div>

            <style>{`
                @keyframes slideUpBanner {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

// ── Offline Banner ─────────────────────────────────────────────────────────────
export function OfflineBanner() {
    const { isOffline, epodPending } = usePWA();

    if (!isOffline) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0,
            zIndex: 10000,
            background: '#dc2626',
            color: '#fff',
            padding: '8px 16px',
            textAlign: 'center',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
        }}>
            📡 ออฟไลน์ — ข้อมูลที่บันทึกจะซิงค์เมื่อมีสัญญาณ
            {epodPending > 0 && (
                <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '1px 8px' }}>
                    {epodPending} POD รอส่ง
                </span>
            )}
        </div>
    );
}

// ── Update Available Banner ───────────────────────────────────────────────────
export function UpdateBanner() {
    const { isUpdating, applyUpdate } = usePWA();
    const [dismissed, setDismissed] = useState(false);

    if (!isUpdating || dismissed) return null;

    return (
        <div style={{
            position: 'fixed', top: '48px', left: '12px', right: '12px',
            zIndex: 9998,
            background: 'linear-gradient(135deg, #065f46, #047857)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            color: '#fff',
        }}>
            <span style={{ fontSize: '20px' }}>🔄</span>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>มีเวอร์ชันใหม่!</div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>อัปเดตเพื่อรับฟีเจอร์ล่าสุด</div>
            </div>
            <button
                onClick={applyUpdate}
                style={{ padding: '6px 14px', borderRadius: '8px', background: '#fff', color: '#047857', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
            >
                อัปเดต
            </button>
            <button
                onClick={() => setDismissed(true)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '16px' }}
            >
                ✕
            </button>
        </div>
    );
}
