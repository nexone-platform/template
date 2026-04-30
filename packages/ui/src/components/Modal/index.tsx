'use client';

import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

// ── Modal ─────────────────────────────────────────────────────────────────────
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  maskClosable?: boolean;
}

const sizeMap = { sm: '400px', md: '560px', lg: '720px', xl: '900px', full: '95vw' };

export const Modal = ({
  isOpen, onClose, title, subtitle, children, footer,
  size = 'md', closable = true, maskClosable = true,
}: ModalProps) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.15s ease',
        padding: '16px',
      }}
      onClick={maskClosable ? onClose : undefined}
    >
      <div
        style={{
          background: '#fff', borderRadius: '16px',
          width: '100%', maxWidth: sizeMap[size],
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          animation: 'slideUp 0.2s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        {(title || closable) && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9',
          }}>
            <div>
              {title && <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#1e293b' }}>{title}</h2>}
              {subtitle && <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>{subtitle}</p>}
            </div>
            {closable && (
              <button
                onClick={onClose}
                style={{
                  border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px',
                  color: '#94a3b8', borderRadius: '6px', display: 'flex', alignItems: 'center',
                  marginLeft: '12px', flexShrink: 0,
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: '16px 24px', borderTop: '1px solid #f1f5f9',
            display: 'flex', justifyContent: 'flex-end', gap: '8px',
          }}>
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
};

// ── Confirm Modal ─────────────────────────────────────────────────────────────
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  loading?: boolean;
}

const iconMap = {
  danger:  { icon: <XCircle size={28} />,       color: '#ef4444', bg: '#fef2f2' },
  warning: { icon: <AlertTriangle size={28} />, color: '#f59e0b', bg: '#fffbeb' },
  info:    { icon: <Info size={28} />,          color: '#3b82f6', bg: '#eff6ff' },
  success: { icon: <CheckCircle size={28} />,   color: '#22c55e', bg: '#f0fdf4' },
};

const btnColorMap = {
  danger: 'linear-gradient(135deg, #ef4444, #dc2626)',
  warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
  info: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  success: 'linear-gradient(135deg, #22c55e, #16a34a)',
};

export const ConfirmModal = ({
  isOpen, onClose, onConfirm, title, message,
  confirmLabel = 'ยืนยัน', cancelLabel = 'ยกเลิก',
  type = 'danger', loading = false,
}: ConfirmModalProps) => {
  const { icon, color, bg } = iconMap[type];
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" closable={false}>
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color, margin: '0 auto 16px',
        }}>
          {icon}
        </div>
        <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 700, color: '#1e293b' }}>{title}</h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>{message}</p>
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            flex: 1, padding: '10px', borderRadius: '8px',
            border: '1px solid #e2e8f0', background: '#f8fafc',
            color: '#64748b', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
          }}
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          style={{
            flex: 1, padding: '10px', borderRadius: '8px',
            border: 'none', background: btnColorMap[type],
            color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px', fontWeight: 600, opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? '...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
