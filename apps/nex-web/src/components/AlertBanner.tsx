'use client';

import styles from './AlertBanner.module.css';

interface AlertBannerProps {
    variant?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    message?: string;
    icon?: string;
    dismissible?: boolean;
}

const VARIANT_CONFIG = {
    info: { defaultIcon: 'ℹ️', className: 'info' },
    success: { defaultIcon: '✅', className: 'success' },
    warning: { defaultIcon: '⚠️', className: 'warning' },
    error: { defaultIcon: '❌', className: 'error' },
};

export default function AlertBanner({
    variant = 'info',
    title = '',
    message = 'Alert message here',
    icon,
}: AlertBannerProps) {
    const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.info;
    const displayIcon = icon || config.defaultIcon;

    return (
        <div className={`${styles.alert} ${styles[config.className]}`}>
            <span className={styles.icon}>{displayIcon}</span>
            <div className={styles.content}>
                {title && <div className={styles.title}>{title}</div>}
                <div className={styles.message}>{message}</div>
            </div>
        </div>
    );
}
