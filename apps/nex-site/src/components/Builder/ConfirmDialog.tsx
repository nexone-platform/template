

interface ConfirmDialogProps {
    open: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
    open,
    title = 'ยืนยันการดำเนินการ',
    message,
    confirmText = 'ยืนยัน',
    cancelText = 'ยกเลิก',
    onConfirm,
    onCancel,
    variant = 'danger',
}: ConfirmDialogProps) {
    if (!open) return null;

    const colors = {
        danger: { bg: '#fef2f2', border: '#fecaca', icon: '#ef4444', btn: '#ef4444', btnHover: '#dc2626' },
        warning: { bg: '#fffbeb', border: '#fde68a', icon: '#f59e0b', btn: '#f59e0b', btnHover: '#d97706' },
        info: { bg: '#eff6ff', border: '#bfdbfe', icon: '#3b82f6', btn: '#3b82f6', btnHover: '#2563eb' },
    };
    const c = colors[variant];

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(4px)',
                animation: 'confirmFadeIn 0.15s ease',
            }}
            onClick={onCancel}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.2)',
                    width: '340px',
                    overflow: 'hidden',
                    animation: 'confirmSlideIn 0.2s ease',
                }}
            >
                {/* Icon + Title area */}
                <div style={{
                    padding: '24px 24px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                }}>
                    {/* Icon circle */}
                    <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: c.bg,
                        border: `2px solid ${c.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {variant === 'danger' ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c.icon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c.icon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                        )}
                    </div>

                    <h3 style={{
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#1e293b',
                        textAlign: 'center',
                    }}>{title}</h3>

                    <p style={{
                        margin: 0,
                        fontSize: '13px',
                        color: '#64748b',
                        textAlign: 'center',
                        lineHeight: 1.5,
                    }}>{message}</p>
                </div>

                {/* Buttons */}
                <div style={{
                    padding: '0 24px 20px',
                    display: 'flex',
                    gap: '10px',
                }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: '10px 16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            background: 'white',
                            color: '#475569',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                    >{cancelText}</button>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1,
                            padding: '10px 16px',
                            border: 'none',
                            borderRadius: '10px',
                            background: c.btn,
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = c.btnHover}
                        onMouseLeave={(e) => e.currentTarget.style.background = c.btn}
                    >{confirmText}</button>
                </div>
            </div>

            {/* Inline keyframes */}
            <style>{`
                @keyframes confirmFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes confirmSlideIn {
                    from { opacity: 0; transform: scale(0.92) translateY(-10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}
