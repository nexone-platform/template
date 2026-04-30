'use client';

import styles from './SocialLinks.module.css';

interface SocialLinkItem {
    platform: string;
    url: string;
    icon?: string;
}

interface SocialLinksProps {
    links?: SocialLinkItem[];
    size?: 'small' | 'medium' | 'large';
    variant?: 'filled' | 'outline' | 'ghost';
    align?: 'left' | 'center' | 'right';
}

const PLATFORM_ICONS: Record<string, { svg: string; color: string; label: string }> = {
    facebook: {
        svg: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
        color: '#1877F2',
        label: 'Facebook',
    },
    line: {
        svg: '<path d="M12 2C6.48 2 2 5.82 2 10.5c0 4.21 3.74 7.74 8.79 8.4.34.07.81.22.93.51.1.26.07.67.03.93l-.15.93c-.05.27-.22 1.06.93.58 1.15-.49 6.2-3.65 8.46-6.25C22.74 13.58 22 12.09 22 10.5 22 5.82 17.52 2 12 2z"/>',
        color: '#06C755',
        label: 'LINE',
    },
    instagram: {
        svg: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/>',
        color: '#E4405F',
        label: 'Instagram',
    },
    twitter: {
        svg: '<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>',
        color: '#1DA1F2',
        label: 'Twitter',
    },
    linkedin: {
        svg: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
        color: '#0A66C2',
        label: 'LinkedIn',
    },
    youtube: {
        svg: '<path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.35 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>',
        color: '#FF0000',
        label: 'YouTube',
    },
    github: {
        svg: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>',
        color: '#333',
        label: 'GitHub',
    },
    website: {
        svg: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
        color: '#6366f1',
        label: 'Website',
    },
};

const SIZE_MAP = { small: 32, medium: 40, large: 48 };

export default function SocialLinks({
    links = [],
    size = 'medium',
    variant = 'filled',
    align = 'center',
}: SocialLinksProps) {
    const iconSize = SIZE_MAP[size] || 40;

    if (links.length === 0) {
        return (
            <div className={styles.placeholder}>
                <span>🔗</span>
                <p>เพิ่มลิงก์ Social Media ใน Properties Panel</p>
            </div>
        );
    }

    return (
        <div className={styles.wrapper} style={{ justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center' }}>
            {links.map((link, idx) => {
                const platform = PLATFORM_ICONS[link.platform] || PLATFORM_ICONS.website;
                const iconColor = variant === 'filled' ? '#fff' : platform.color;
                const bgColor = variant === 'filled' ? platform.color : 'transparent';
                const borderColor = variant === 'outline' ? platform.color : 'transparent';

                return (
                    <a
                        key={idx}
                        href={link.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.link} ${styles[variant]}`}
                        style={{
                            width: iconSize,
                            height: iconSize,
                            backgroundColor: bgColor,
                            borderColor,
                        }}
                        title={platform.label}
                        aria-label={platform.label}
                    >
                        <svg
                            width={iconSize * 0.5}
                            height={iconSize * 0.5}
                            viewBox="0 0 24 24"
                            fill={variant === 'ghost' ? platform.color : 'none'}
                            stroke={iconColor}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            dangerouslySetInnerHTML={{ __html: platform.svg }}
                        />
                    </a>
                );
            })}
        </div>
    );
}
