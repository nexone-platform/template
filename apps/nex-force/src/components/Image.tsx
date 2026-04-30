'use client';

interface ImageProps {
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
    objectFit?: 'cover' | 'contain' | 'fill';
    align?: 'left' | 'center' | 'right';
    borderRadius?: string;
}

export default function Image({
    src = '',
    alt = '',
    width = 800,
    height = 450,
    objectFit = 'cover',
    align = 'center',
    borderRadius = '0px',
}: ImageProps) {
    if (!src) {
        return (
            <div
                style={{
                    width: '100%',
                    height: `${height}px`,
                    background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius,
                    color: '#9ca3af',
                    fontSize: '2rem',
                }}
            >
                🖼️
            </div>
        );
    }

    return (
        <div style={{ textAlign: align }}>
            {/* Use regular img for external URLs to avoid Next.js domain restrictions */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={src}
                alt={alt}
                style={{
                    maxWidth: '100%',
                    height: 'auto',
                    objectFit,
                    borderRadius,
                    display: 'inline-block',
                }}
            />
        </div>
    );
}
