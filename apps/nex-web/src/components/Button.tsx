'use client';

import styles from './Button.module.css';

interface ButtonProps {
    text?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'glow';
    shape?: 'rounded' | 'pill' | 'square' | 'circle';
    size?: 'xs' | 'small' | 'medium' | 'large' | 'xl';
    link?: string;
    align?: 'left' | 'center' | 'right';
    fullWidth?: boolean;
    openNewTab?: boolean;
    icon?: string;
    iconPosition?: 'none' | 'left' | 'right';
    hoverEffect?: 'none' | 'lift' | 'scale' | 'shine' | 'pulse';
    bgColor?: string;
    textColor?: string;
    borderColor?: string;
}

export default function Button({
    text = 'Click Me',
    variant = 'primary',
    shape = 'rounded',
    size = 'medium',
    link = '#',
    align = 'left',
    fullWidth = false,
    openNewTab = false,
    icon,
    iconPosition = 'none',
    hoverEffect = 'lift',
    bgColor,
    textColor,
    borderColor,
}: ButtonProps) {
    const variantClass = styles[`btn_${variant}`] || styles.btn_primary;
    const shapeClass = styles[`shape_${shape}`] || '';
    const sizeClass = styles[`size_${size}`] || styles.size_medium;
    const hoverClass = hoverEffect !== 'none' ? (styles[`hover_${hoverEffect}`] || '') : '';
    const fullWidthClass = fullWidth ? styles.fullWidth : '';

    const customStyle: React.CSSProperties = {};
    if (bgColor) customStyle.background = bgColor;
    if (textColor) customStyle.color = textColor;
    if (borderColor) customStyle.borderColor = borderColor;

    const iconEl = icon && iconPosition !== 'none' ? (
        <span className={styles.icon}>{icon}</span>
    ) : null;

    return (
        <div style={{ textAlign: align }} className={styles.wrapper}>
            <a
                href={link}
                target={openNewTab ? '_blank' : undefined}
                rel={openNewTab ? 'noopener noreferrer' : undefined}
                className={`${styles.btn} ${variantClass} ${shapeClass} ${sizeClass} ${hoverClass} ${fullWidthClass}`}
                style={customStyle}
            >
                {iconPosition === 'left' && iconEl}
                <span>{text}</span>
                {iconPosition === 'right' && iconEl}
            </a>
        </div>
    );
}
