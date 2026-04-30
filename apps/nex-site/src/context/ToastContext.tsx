import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    showConfirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextValue>({
    showToast: () => {},
    showConfirm: () => Promise.resolve(false),
});

let _toastId = 0;

/* ── SVG Icons (professional, outline style) ── */
const SvgCheck = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
    </svg>
);
const SvgX = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
    </svg>
);
const SvgAlert = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);
const SvgInfo = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

/* Confirm dialog icons (larger, 22px) */
const SvgTrash = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);
const SvgAlertLg = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);
const SvgInfoLg = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [confirm, setConfirm] = useState<ConfirmOptions | null>(null);
    const resolveRef = useRef<((value: boolean) => void) | undefined>(undefined);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 4000) => {
        const id = ++_toastId;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const showConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setConfirm(options);
        });
    }, []);

    const handleConfirmResult = (result: boolean) => {
        resolveRef.current?.(result);
        setConfirm(null);
    };

    const variantStyles = {
        danger: { accent: '#ef4444', bg: 'linear-gradient(135deg, #ef4444, #dc2626)', hoverBg: '#dc2626' },
        warning: { accent: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b, #d97706)', hoverBg: '#d97706' },
        info: { accent: '#6366f1', bg: 'linear-gradient(135deg, #6366f1, #4f46e5)', hoverBg: '#4f46e5' },
    };

    const variant = confirm?.variant || 'danger';
    const vs = variantStyles[variant];

    return (
        <ToastContext.Provider value={{ showToast, showConfirm }}>
            {children}

            {/* Toast container */}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxWidth: '420px',
            }}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                        style={{
                            padding: '14px 20px',
                            borderRadius: '10px',
                            color: '#fff',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                            backdropFilter: 'blur(12px)',
                            animation: 'toast-slide-in 0.3s ease-out',
                            background:
                                toast.type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' :
                                toast.type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                                toast.type === 'warning' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                                'linear-gradient(135deg, #6366f1, #4f46e5)',
                        }}
                    >
                        <span style={{ marginRight: '10px', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                            {toast.type === 'success' ? <SvgCheck /> :
                             toast.type === 'error' ? <SvgX /> :
                             toast.type === 'warning' ? <SvgAlert /> : <SvgInfo />}
                        </span>
                        {toast.message}
                    </div>
                ))}
            </div>

            {/* Confirm dialog overlay */}
            {confirm && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 100000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)',
                        animation: 'confirm-fade-in 0.2s ease-out',
                    }}
                    onClick={() => handleConfirmResult(false)}
                >
                    <div
                        style={{
                            background: 'var(--card-bg, #fff)',
                            borderRadius: '16px',
                            padding: '28px',
                            maxWidth: '400px',
                            width: '90%',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            animation: 'confirm-scale-in 0.25s ease-out',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Icon */}
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: `${vs.accent}15`,
                            color: vs.accent,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px',
                        }}>
                            {variant === 'danger' ? <SvgTrash /> : variant === 'warning' ? <SvgAlertLg /> : <SvgInfoLg />}
                        </div>

                        {/* Title */}
                        {confirm.title && (
                            <h3 style={{
                                margin: '0 0 8px',
                                fontSize: '17px',
                                fontWeight: 700,
                                color: 'var(--text-primary, #1e293b)',
                            }}>
                                {confirm.title}
                            </h3>
                        )}

                        {/* Message */}
                        <p style={{
                            margin: '0 0 24px',
                            fontSize: '14px',
                            lineHeight: 1.6,
                            color: 'var(--text-secondary, #64748b)',
                        }}>
                            {confirm.message}
                        </p>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => handleConfirmResult(false)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-color, #e2e8f0)',
                                    background: 'var(--card-bg, #fff)',
                                    color: 'var(--text-primary, #475569)',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {confirm.cancelText || 'ยกเลิก'}
                            </button>
                            <button
                                onClick={() => handleConfirmResult(true)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: vs.bg,
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                    boxShadow: `0 4px 12px ${vs.accent}40`,
                                }}
                            >
                                {confirm.confirmText || 'ยืนยัน'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes toast-slide-in {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes confirm-fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes confirm-scale-in {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
