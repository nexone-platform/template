'use client';

import { useState, useEffect } from 'react';
import PageRenderer from '@/components/PageRenderer';

/**
 * Builder Preview Page
 * ---------------------
 * This page is loaded inside an iframe by the backoffice Page Builder.
 * It listens for `postMessage` events containing the page layout data,
 * then renders the actual frontend components in real-time.
 *
 * Message format: { type: 'BUILDER_UPDATE', layout: [...], pageId: '...' }
 */
export default function BuilderPreviewPage() {
    const [pageData, setPageData] = useState<any>(null);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Accept messages from any origin in dev (backoffice runs on different port)
            const data = event.data;
            if (data && data.type === 'BUILDER_UPDATE') {
                setPageData({
                    id: data.pageId || 'preview',
                    title: data.title || 'Preview',
                    slug: 'preview',
                    status: 'draft',
                    layout: data.layout || [],
                    seoMeta: data.seoMeta || {},
                });
            }
        };

        window.addEventListener('message', handleMessage);

        // Notify parent that iframe is ready
        if (window.parent !== window) {
            window.parent.postMessage({ type: 'BUILDER_PREVIEW_READY' }, '*');
        }

        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Show loading state until first message
    if (!pageData) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: '#f8fafc',
                color: '#94a3b8',
                fontFamily: 'Sarabun, sans-serif',
                fontSize: '0.9rem',
            }}>
                Waiting for page builder data...
            </div>
        );
    }

    return <PageRenderer page={pageData} />;
}
