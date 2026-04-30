import React, { useRef, useState, useEffect } from 'react';
import { usePageBuilderStore } from '../../store/pageBuilderStore';
import './Canvas.css';

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000';

export default function Canvas() {
    const {
        currentPage, viewportMode,
        addComponent, selectComponent,
    } = usePageBuilderStore();

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeReady, setIframeReady] = useState(false);
    const [iframeLoaded, setIframeLoaded] = useState(false);

    const layout = currentPage?.layout || [];

    // ── Listen for BUILDER_PREVIEW_READY from iframe ──────────────────
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'BUILDER_PREVIEW_READY') {
                setIframeReady(true);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // ── Send layout data to iframe whenever layout or page changes ────
    useEffect(() => {
        if (!iframeReady || !iframeRef.current?.contentWindow) return;

        const message = {
            type: 'BUILDER_UPDATE',
            layout: currentPage?.layout || [],
            pageId: currentPage?.id || 'preview',
            title: currentPage?.title || 'Preview',
            seoMeta: currentPage?.seoMeta || {},
        };

        iframeRef.current.contentWindow.postMessage(message, '*');
    }, [iframeReady, currentPage?.layout, currentPage?.id, currentPage?.title, currentPage?.seoMeta]);

    // Also send on iframe ready (initial data push)
    useEffect(() => {
        if (!iframeReady || !iframeRef.current?.contentWindow || !currentPage) return;

        const timer = setTimeout(() => {
            iframeRef.current?.contentWindow?.postMessage({
                type: 'BUILDER_UPDATE',
                layout: currentPage.layout || [],
                pageId: currentPage.id || 'preview',
                title: currentPage.title || 'Preview',
                seoMeta: currentPage.seoMeta || {},
            }, '*');
        }, 100);

        return () => clearTimeout(timer);
    }, [iframeReady, currentPage]);

    // ── Drop from ComponentLibrary (add new component) ────────────────
    const handleCanvasDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const componentData = e.dataTransfer.getData('component');
        if (componentData) {
            const component = JSON.parse(componentData);
            addComponent(component);
        }
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

    // ── Canvas style (viewport simulation) ───────────────────────────
    const viewportWidths = {
        desktop: { width: '100%', maxWidth: '100%', label: 'Desktop', size: '100%' },
        tablet: { width: '768px', maxWidth: '768px', label: 'Tablet', size: '768px' },
        mobile: { width: '375px', maxWidth: '375px', label: 'Mobile', size: '375px' },
    };

    const vp = viewportWidths[viewportMode] || viewportWidths.desktop;

    return (
        <div className="canvas-wrapper">
            {/* Viewport label */}
            <div className={`viewport-label viewport-${viewportMode}`}>
                <span>{vp.label}</span>
                <span className="viewport-label-size">{vp.size}</span>
            </div>

            {/* Device frame wrapper */}
            <div className={`device-frame device-${viewportMode}`}>
                <div
                    className="canvas-iframe-container"
                    style={{ width: vp.width, maxWidth: vp.maxWidth }}
                    onDrop={handleCanvasDrop}
                    onDragOver={handleDragOver}
                    onClick={() => selectComponent(null)}
                >
                    {/* Live preview iframe */}
                    <iframe
                        ref={iframeRef}
                        src={`${FRONTEND_URL}/builder-preview`}
                        className="canvas-iframe"
                        title="Page Preview"
                        onLoad={() => setIframeLoaded(true)}
                    />

                    {/* Loading overlay */}
                    {!iframeLoaded && (
                        <div className="canvas-iframe-loading">
                            <div className="spinner" />
                            <p>Loading preview...</p>
                        </div>
                    )}

                    {/* Empty state */}
                    {layout.length === 0 && iframeLoaded && (
                        <div className="canvas-empty-overlay">
                            <h3>Start Building Your Page</h3>
                            <p>Drag components from the left panel or click to add them</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
