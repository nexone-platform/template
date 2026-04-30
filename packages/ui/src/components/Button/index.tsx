'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: '#ffffff',
    border: '1px solid transparent',
  },
  secondary: {
    background: '#f1f5f9',
    color: '#334155',
    border: '1px solid #e2e8f0',
  },
  danger: {
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#ffffff',
    border: '1px solid transparent',
  },
  ghost: {
    background: 'transparent',
    color: '#64748b',
    border: '1px solid transparent',
  },
  outline: {
    background: 'transparent',
    color: '#2563eb',
    border: '1px solid #2563eb',
  },
  success: {
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#ffffff',
    border: '1px solid transparent',
  },
};

const variantHover: Record<ButtonVariant, React.CSSProperties> = {
  primary: { background: 'linear-gradient(135deg, #1d4ed8, #1e40af)' },
  secondary: { background: '#e2e8f0' },
  danger: { background: 'linear-gradient(135deg, #dc2626, #b91c1c)' },
  ghost: { background: 'rgba(100,116,139,0.08)' },
  outline: { background: '#eff6ff' },
  success: { background: 'linear-gradient(135deg, #16a34a, #15803d)' },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  xs: { padding: '4px 10px', fontSize: '11px', borderRadius: '6px', height: '26px' },
  sm: { padding: '6px 12px', fontSize: '12px', borderRadius: '7px', height: '32px' },
  md: { padding: '8px 16px', fontSize: '14px', borderRadius: '8px', height: '38px' },
  lg: { padding: '10px 20px', fontSize: '15px', borderRadius: '10px', height: '44px' },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  disabled,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}, ref) => {
  const [hovered, setHovered] = React.useState(false);

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontWeight: 500,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all 0.18s ease',
    outline: 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    width: fullWidth ? '100%' : undefined,
    boxShadow: (variant === 'primary' || variant === 'danger' || variant === 'success') && !disabled && !loading
      ? '0 1px 4px rgba(0,0,0,0.12)'
      : 'none',
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...(hovered && !disabled && !loading ? variantHover[variant] : {}),
    ...style,
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      style={baseStyle}
      onMouseEnter={(e) => { setHovered(true); onMouseEnter?.(e); }}
      onMouseLeave={(e) => { setHovered(false); onMouseLeave?.(e); }}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});

Button.displayName = 'Button';
