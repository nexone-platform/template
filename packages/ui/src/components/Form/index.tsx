'use client';

import React from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

// ── Form Group ────────────────────────────────────────────────────────────────
export interface FormGroupProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const FormGroup = ({ label, required, error, hint, children, style }: FormGroupProps) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', ...style }}>
    {label && (
      <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
      </label>
    )}
    {children}
    {error && (
      <span style={{ fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <AlertCircle size={12} /> {error}
      </span>
    )}
    {hint && !error && (
      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{hint}</span>
    )}
  </div>
);

// ── Input ─────────────────────────────────────────────────────────────────────
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  leftIcon, rightIcon, error, style, onFocus, onBlur, ...props
}, ref) => {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {leftIcon && (
        <div style={{ position: 'absolute', left: '10px', color: focused ? '#2563eb' : '#94a3b8', display: 'flex', pointerEvents: 'none' }}>
          {React.cloneElement(leftIcon as React.ReactElement, { size: 16 } as any)}
        </div>
      )}
      <input
        ref={ref}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        style={{
          width: '100%',
          padding: `8px ${rightIcon ? '36px' : '12px'} 8px ${leftIcon ? '34px' : '12px'}`,
          border: `1.5px solid ${error ? '#ef4444' : focused ? '#2563eb' : '#e2e8f0'}`,
          borderRadius: '8px', fontSize: '14px',
          color: '#1e293b', background: props.disabled ? '#f8fafc' : '#fff',
          outline: 'none', transition: 'border-color 0.15s',
          boxShadow: focused ? `0 0 0 3px ${error ? 'rgba(239,68,68,0.12)' : 'rgba(37,99,235,0.10)'}` : 'none',
          ...style,
        }}
        {...props}
      />
      {rightIcon && (
        <div style={{ position: 'absolute', right: '10px', color: '#94a3b8', display: 'flex' }}>
          {React.cloneElement(rightIcon as React.ReactElement, { size: 16 } as any)}
        </div>
      )}
    </div>
  );
});
Input.displayName = 'Input';

// ── Password Input ────────────────────────────────────────────────────────────
export const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'rightIcon'>>((props, ref) => {
  const [show, setShow] = React.useState(false);
  return (
    <Input
      ref={ref}
      {...props}
      type={show ? 'text' : 'password'}
      rightIcon={
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0, color: '#94a3b8' }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      }
    />
  );
});
PasswordInput.displayName = 'PasswordInput';

// ── Textarea ──────────────────────────────────────────────────────────────────
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ error, style, onFocus, onBlur, ...props }, ref) => {
  const [focused, setFocused] = React.useState(false);
  return (
    <textarea
      ref={ref}
      onFocus={(e) => { setFocused(true); onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); onBlur?.(e); }}
      style={{
        width: '100%', padding: '8px 12px',
        border: `1.5px solid ${error ? '#ef4444' : focused ? '#2563eb' : '#e2e8f0'}`,
        borderRadius: '8px', fontSize: '14px', color: '#1e293b',
        outline: 'none', resize: 'vertical', minHeight: '80px',
        fontFamily: 'inherit',
        boxShadow: focused ? `0 0 0 3px ${error ? 'rgba(239,68,68,0.12)' : 'rgba(37,99,235,0.10)'}` : 'none',
        transition: 'border-color 0.15s',
        ...style,
      }}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

// ── Select ────────────────────────────────────────────────────────────────────
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  placeholder?: string;
  options: { label: string; value: string | number }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  error, style, placeholder, options, onFocus, onBlur, ...props
}, ref) => {
  const [focused, setFocused] = React.useState(false);
  return (
    <select
      ref={ref}
      onFocus={(e) => { setFocused(true); onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); onBlur?.(e); }}
      style={{
        width: '100%', padding: '8px 32px 8px 12px',
        border: `1.5px solid ${error ? '#ef4444' : focused ? '#2563eb' : '#e2e8f0'}`,
        borderRadius: '8px', fontSize: '14px', color: '#1e293b',
        outline: 'none', appearance: 'none',
        background: `#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 10px center`,
        boxShadow: focused ? `0 0 0 3px ${error ? 'rgba(239,68,68,0.12)' : 'rgba(37,99,235,0.10)'}` : 'none',
        transition: 'border-color 0.15s', cursor: 'pointer',
        ...style,
      }}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
});
Select.displayName = 'Select';

// ── Checkbox ──────────────────────────────────────────────────────────────────
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ label, id, style, ...props }, ref) => {
  const uid = id ?? `cb-${Math.random().toString(36).slice(2)}`;
  return (
    <label htmlFor={uid} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none', fontSize: '14px', color: '#334155', ...style }}>
      <input ref={ref} id={uid} type="checkbox" style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563eb' }} {...props} />
      {label}
    </label>
  );
});
Checkbox.displayName = 'Checkbox';
