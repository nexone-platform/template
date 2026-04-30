import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, XCircle, MinusCircle, Clock, Truck, ChevronDown } from 'lucide-react';

export interface StatusOption {
    value: string;
    label: string;
    color: 'green' | 'red' | 'yellow' | 'gray' | 'blue';
}

interface StatusDropdownProps {
    value: string;
    onChange: (val: string) => void;
    options?: StatusOption[];
    hideIcon?: boolean;
}

const defaultOptions: StatusOption[] = [
    { value: 'active', label: 'ใช้งาน', color: 'green' },
    { value: 'inactive', label: 'ปิดใช้งาน', color: 'red' },
];

export default function StatusDropdown({ value, onChange, options = defaultOptions, hideIcon = false }: StatusDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const currentOption = options.find(o => o.value === value) || options[0];

    const getColors = (color: string) => {
        switch(color) {
            case 'green': return { bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--accent-green)' };
            case 'red': return { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--accent-red)' };
            case 'yellow': return { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--accent-amber)' };
            case 'blue': return { bg: 'rgba(59, 130, 246, 0.1)', text: 'var(--accent-blue)' };
            case 'gray': default: return { bg: '#f1f5f9', text: '#64748b' };
        }
    };

    const currentStyle = getColors(currentOption?.color || 'gray');

    const renderIcon = (color: string) => {
        if (color === 'green') return <CheckCircle2 size={14} />;
        if (color === 'red') return <XCircle size={14} />;
        if (color === 'yellow') return <Clock size={14} />;
        if (color === 'blue') return <Truck size={14} />;
        if (color === 'gray') return <MinusCircle size={14} />;
        return null;
    };

    return (
        <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '6px', 
                    padding: '4px 10px', borderRadius: '999px',
                    background: currentStyle.bg, color: currentStyle.text,
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    userSelect: 'none', transition: 'all 0.2s'
                }}
            >
                {!hideIcon && renderIcon(currentOption?.color)}
                <span>{currentOption?.label}</span>
                <ChevronDown size={14} style={{ opacity: 0.5, marginLeft: '2px' }} />
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                    marginTop: '4px', background: 'white', borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 50,
                    minWidth: '120px', overflow: 'hidden', border: '1px solid var(--border-color)'
                }}>
                    {options.map(opt => (
                        <div 
                            key={opt.value}
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            style={{
                                padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px',
                                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                                background: value === opt.value ? 'rgba(0,0,0,0.02)' : 'transparent',
                                color: 'var(--text-primary)', transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                            onMouseLeave={e => e.currentTarget.style.background = value === opt.value ? 'rgba(0,0,0,0.02)' : 'transparent'}
                        >
                            {!hideIcon && renderIcon(opt.color)}
                            <span style={{ color: opt.color === 'green' ? 'var(--accent-green)' : (opt.color === 'red' ? 'var(--accent-red)' : undefined) }}>
                                {opt.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
