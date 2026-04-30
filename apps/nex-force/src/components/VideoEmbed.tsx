'use client';

import styles from './VideoEmbed.module.css';

interface VideoEmbedProps {
    url?: string;
    title?: string;
    aspectRatio?: '16:9' | '4:3' | '1:1';
    maxWidth?: string;
    borderRadius?: string;
}

function extractVideoId(url: string): { provider: 'youtube' | 'vimeo' | null; id: string } {
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
    if (ytMatch) return { provider: 'youtube', id: ytMatch[1] };

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) return { provider: 'vimeo', id: vimeoMatch[1] };

    return { provider: null, id: '' };
}

function getAspectPadding(ratio: string): string {
    switch (ratio) {
        case '4:3': return '75%';
        case '1:1': return '100%';
        default: return '56.25%'; // 16:9
    }
}

export default function VideoEmbed({
    url = '',
    title = 'Video',
    aspectRatio = '16:9',
    maxWidth = '800px',
    borderRadius = '12px',
}: VideoEmbedProps) {
    const { provider, id } = extractVideoId(url || '');

    if (!provider || !id) {
        return (
            <div className={styles.placeholder} style={{ maxWidth }}>
                <div className={styles.placeholderIcon}>▶</div>
                <p>วาง URL ของ YouTube หรือ Vimeo</p>
            </div>
        );
    }

    const embedUrl = provider === 'youtube'
        ? `https://www.youtube-nocookie.com/embed/${id}?rel=0`
        : `https://player.vimeo.com/video/${id}`;

    return (
        <div className={styles.wrapper} style={{ maxWidth, margin: '0 auto' }}>
            <div
                className={styles.container}
                style={{
                    paddingBottom: getAspectPadding(aspectRatio),
                    borderRadius,
                }}
            >
                <iframe
                    src={embedUrl}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className={styles.iframe}
                    style={{ borderRadius }}
                    loading="lazy"
                />
            </div>
        </div>
    );
}
