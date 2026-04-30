'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

const viewportConfig: Record<string, { width: string; label: string; icon: string; color: string; bgColor: string }> = {
    tablet: { width: '768px', label: 'Tablet', icon: '📱', color: '#2563eb', bgColor: '#eff6ff' },
    mobile: { width: '375px', label: 'Mobile', icon: '📱', color: '#d97706', bgColor: '#fef3c7' },
};

function PreviewFrameInner({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const viewport = searchParams.get('viewport');
    const isPreview = searchParams.get('preview') === 'true';
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    if (!isPreview || !viewport || !viewportConfig[viewport]) {
        return <>{children}</>;
    }

    const vp = viewportConfig[viewport];
    const sidebarWidth = sidebarCollapsed ? '48px' : '200px';

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            display: 'flex',
            background: '#f1f5f9',
        }}>
            {/* ── Sidebar ── */}
            <div style={{
                width: sidebarWidth,
                minWidth: sidebarWidth,
                height: '100vh',
                background: '#ffffff',
                borderRight: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s ease, min-width 0.3s ease',
                overflow: 'hidden',
                flexShrink: 0,
            }}>
                {/* Sidebar header */}
                <div style={{
                    padding: sidebarCollapsed ? '12px 8px' : '16px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                    gap: '8px',
                }}>
                    {!sidebarCollapsed && (
                        <span style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: '#1e293b',
                            whiteSpace: 'nowrap',
                        }}>
                            Preview
                        </span>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            color: '#64748b',
                            flexShrink: 0,
                        }}
                        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {sidebarCollapsed ? '▶' : '◀'}
                    </button>
                </div>

                {/* Viewport info */}
                <div style={{
                    padding: sidebarCollapsed ? '12px 8px' : '16px',
                    borderBottom: '1px solid #f1f5f9',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                        gap: '8px',
                        padding: '8px',
                        borderRadius: '10px',
                        background: vp.bgColor,
                    }}>
                        <span style={{ fontSize: '1.1rem' }}>{vp.icon}</span>
                        {!sidebarCollapsed && (
                            <div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: vp.color,
                                }}>{vp.label}</div>
                                <div style={{
                                    fontSize: '0.65rem',
                                    color: '#94a3b8',
                                    fontWeight: 500,
                                }}>{vp.width}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div style={{
                    padding: sidebarCollapsed ? '8px' : '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    flex: 1,
                }}>
                    {/* Switch to Desktop */}
                    <button
                        onClick={() => {
                            const url = new URL(window.location.href);
                            url.searchParams.delete('viewport');
                            window.location.href = url.toString();
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: sidebarCollapsed ? '8px' : '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            background: '#fff',
                            color: '#475569',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 500,
                            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                            whiteSpace: 'nowrap',
                            transition: 'background 0.15s',
                        }}
                        title="Switch to Desktop"
                    >
                        <span style={{ fontSize: '0.9rem' }}>🖥️</span>
                        {!sidebarCollapsed && 'Desktop'}
                    </button>

                    {/* Switch viewport buttons */}
                    {Object.entries(viewportConfig).map(([key, cfg]) => (
                        <button
                            key={key}
                            onClick={() => {
                                const url = new URL(window.location.href);
                                url.searchParams.set('viewport', key);
                                window.location.href = url.toString();
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: sidebarCollapsed ? '8px' : '8px 12px',
                                borderRadius: '8px',
                                border: viewport === key ? `2px solid ${cfg.color}` : '1px solid #e2e8f0',
                                background: viewport === key ? cfg.bgColor : '#fff',
                                color: viewport === key ? cfg.color : '#475569',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                fontWeight: viewport === key ? 700 : 500,
                                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.15s',
                            }}
                            title={cfg.label}
                        >
                            <span style={{ fontSize: '0.9rem' }}>{cfg.icon}</span>
                            {!sidebarCollapsed && cfg.label}
                        </button>
                    ))}
                </div>

                {/* Bottom: Close */}
                <div style={{
                    padding: sidebarCollapsed ? '8px' : '12px 16px',
                    borderTop: '1px solid #e2e8f0',
                }}>
                    <button
                        onClick={() => window.close()}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: sidebarCollapsed ? '8px' : '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #fecaca',
                            background: '#fef2f2',
                            color: '#dc2626',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 500,
                            width: '100%',
                            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                            whiteSpace: 'nowrap',
                            transition: 'background 0.15s',
                        }}
                        title="Close Preview"
                    >
                        <span style={{ fontSize: '0.85rem' }}>✕</span>
                        {!sidebarCollapsed && 'Close Preview'}
                    </button>
                </div>
            </div>

            {/* ── Main content area ── */}
            <div style={{
                flex: 1,
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                overflow: 'hidden',
                padding: viewport === 'mobile' ? '16px' : '12px',
            }}>
                {/* Device frame */}
                <div style={{
                    width: viewport === 'mobile' ? '420px' : '820px',
                    maxWidth: '100%',
                    height: viewport === 'mobile' ? 'calc(100vh - 32px)' : 'calc(100vh - 24px)',
                    padding: viewport === 'mobile' ? '36px 16px 28px' : '12px',
                    background: viewport === 'mobile'
                        ? 'linear-gradient(145deg, #1e293b, #334155)'
                        : '#e2e8f0',
                    borderRadius: viewport === 'mobile' ? '36px' : '20px',
                    boxShadow: viewport === 'mobile'
                        ? '0 8px 40px rgba(0,0,0,0.15), inset 0 0 0 2px #475569'
                        : '0 4px 30px rgba(0,0,0,0.08), inset 0 0 0 2px #cbd5e1',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                }}>
                    {/* Notch for mobile */}
                    {viewport === 'mobile' && (
                        <div style={{
                            position: 'absolute',
                            top: '10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '90px',
                            height: '18px',
                            background: '#0f172a',
                            borderRadius: '9px',
                            zIndex: 10,
                        }} />
                    )}

                    {/* Scrollable content */}
                    <div
                        className="preview-viewport-wrapper"
                        style={{
                            width: vp.width,
                            maxWidth: '100%',
                            margin: '0 auto',
                            background: '#fff',
                            borderRadius: viewport === 'mobile' ? '4px' : '8px',
                            overflow: 'auto',
                            flex: 1,
                            position: 'relative',
                        }}
                    >
                        {children}
                    </div>

                    {/* Home indicator for mobile */}
                    {viewport === 'mobile' && (
                        <div style={{
                            position: 'absolute',
                            bottom: '8px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '80px',
                            height: '4px',
                            background: '#64748b',
                            borderRadius: '2px',
                        }} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PreviewFrame({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<>{children}</>}>
            <PreviewFrameInner>{children}</PreviewFrameInner>
        </Suspense>
    );
}
