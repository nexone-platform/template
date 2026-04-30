'use client';

import styles from './Divider.module.css';

interface DividerProps {
    variant?: 'solid' | 'dashed' | 'dotted' | 'gradient';
    color?: string;
    thickness?: string;
    width?: string;
    marginY?: string;
    gradientFrom?: string;
    gradientTo?: string;
}

export default function Divider({
    variant = 'solid',
    color = '#e2e8f0',
    thickness = '1px',
    width = '100%',
    marginY = '32px',
    gradientFrom = '#3b82f6',
    gradientTo = '#8b5cf6',
}: DividerProps) {
    const baseStyle: React.CSSProperties = {
        width,
        margin: `${marginY} auto`,
        border: 'none',
    };

    if (variant === 'gradient') {
        return (
            <div
                className={styles.divider}
                style={{
                    ...baseStyle,
                    height: thickness,
                    background: `linear-gradient(90deg, transparent, ${gradientFrom}, ${gradientTo}, transparent)`,
                    borderRadius: '999px',
                }}
            />
        );
    }

    return (
        <hr
            className={styles.divider}
            style={{
                ...baseStyle,
                borderTop: `${thickness} ${variant} ${color}`,
            }}
        />
    );
}
