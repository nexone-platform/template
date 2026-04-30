import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePage, useUpdatePage, usePublishPage, useCreatePage } from '../hooks/usePages';
import { usePageBuilderStore } from '../store/pageBuilderStore';
import { ComponentLibrary, Canvas, PropertiesPanel, LayersPanel } from '../components/Builder';
import './PageBuilder.css';

// ── SVG Icons (Professional / Formal Style) ──
const Icons = {
    back: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
        </svg>
    ),
    desktop: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
        </svg>
    ),
    tablet: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
    ),
    mobile: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
    ),
    undo: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" /><path d="M3 13c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9a9 9 0 0 1-6.36-2.64" />
        </svg>
    ),
    redo: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7v6h-6" /><path d="M21 13c0-4.97-4.03-9-9-9S3 8.03 3 13s4.03 9 9 9a9 9 0 0 0 6.36-2.64" />
        </svg>
    ),
    eye: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" />
        </svg>
    ),
    check: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
        </svg>
    ),
    add: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
        </svg>
    ),
    layers: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.84Z" /><path d="m2 17 8.58 3.91a2 2 0 0 0 1.66 0L20.76 17" /><path d="m2 12 8.58 3.91a2 2 0 0 0 1.66 0L20.76 12" />
        </svg>
    ),
    image: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
    ),
    panelLeft: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 3v18" />
        </svg>
    ),
    panelRight: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" /><path d="M15 3v18" />
        </svg>
    ),
};

export default function PageBuilder() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // React Query hooks
    const { data: pageData, isLoading } = usePage(id || '');
    const updatePage = useUpdatePage();
    const publishPage = usePublishPage();
    const createPage = useCreatePage();
    const {
        viewportMode,
        setViewportMode,
        showLeftPanel,
        showRightPanel,
        toggleLeftPanel,
        toggleRightPanel,
        undo,
        redo,
        currentPage,
        setCurrentPage,
    } = usePageBuilderStore();

    const [activeTab, setActiveTab] = useState<'add' | 'layers' | 'assets'>('add');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [draftSaved, setDraftSaved] = useState(false);
    const [isGeneratingTranslations, setIsGeneratingTranslations] = useState(false);
    const [translationResult, setTranslationResult] = useState<string | null>(null);

    const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
    const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000';

    // Preview: open frontend in new tab with current viewport mode
    const handlePreview = () => {
        if (currentPage?.slug) {
            const vpParam = viewportMode !== 'desktop' ? `&viewport=${viewportMode}` : '';
            window.open(`${FRONTEND_URL}/${currentPage.slug}?preview=true${vpParam}`, '_blank');
        }
    };

    // Save & Publish: save layout then set status to published
    const handleSaveAndPublish = async () => {
        if (!currentPage) return;
        setIsSaving(true);
        try {
            let pageId = id || '';

            if (!id) {
                // CREATE new page first
                const slug = currentPage.slug || currentPage.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'untitled';
                const created = await new Promise<any>((resolve, reject) =>
                    createPage.mutate(
                        { title: currentPage.title || 'Untitled Page', slug, layout: currentPage.layout, seoMeta: currentPage.seoMeta },
                        { onSuccess: resolve, onError: reject }
                    )
                );
                pageId = created.id;
                navigate(`/builder/${pageId}`, { replace: true });
            } else {
                // Step 1: save latest layout
                await new Promise<void>((resolve, reject) =>
                    updatePage.mutate(
                        {
                            id: currentPage.id,
                            data: {
                                title: currentPage.title,
                                slug: currentPage.slug,
                                layout: currentPage.layout,
                                seoMeta: currentPage.seoMeta,
                                status: currentPage.status,
                            },
                        },
                        { onSuccess: () => resolve(), onError: reject }
                    )
                );
            }
            // Step 2: publish
            await new Promise<void>((resolve, reject) =>
                publishPage.mutate(pageId, {
                    onSuccess: () => resolve(),
                    onError: reject,
                })
            );
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (e) {
            console.error('Save & Publish failed', e);
        } finally {
            setIsSaving(false);
        }
    };

    // Save Draft: save layout with status = draft (no publish)
    const handleSaveDraft = async () => {
        if (!currentPage) return;
        setIsSavingDraft(true);
        try {
            if (!id) {
                // CREATE new page
                const slug = currentPage.slug || currentPage.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'untitled';
                const created = await new Promise<any>((resolve, reject) =>
                    createPage.mutate(
                        { title: currentPage.title || 'Untitled Page', slug, layout: currentPage.layout, seoMeta: currentPage.seoMeta },
                        { onSuccess: resolve, onError: reject }
                    )
                );
                navigate(`/builder/${created.id}`, { replace: true });
            } else {
                // UPDATE existing page
                await new Promise<void>((resolve, reject) =>
                    updatePage.mutate(
                        {
                            id: currentPage.id,
                            data: {
                                title: currentPage.title,
                                slug: currentPage.slug,
                                layout: currentPage.layout,
                                seoMeta: currentPage.seoMeta,
                                status: 'draft',
                            },
                        },
                        { onSuccess: () => resolve(), onError: reject }
                    )
                );
            }
            setDraftSaved(true);
            setTimeout(() => setDraftSaved(false), 3000);
        } catch (e) {
            console.error('Save Draft failed', e);
        } finally {
            setIsSavingDraft(false);
        }
    };

    // Generate translations from current layout
    const handleGenerateTranslations = async () => {
        if (!currentPage) return;
        setIsGeneratingTranslations(true);
        setTranslationResult(null);
        try {
            const res = await fetch(`${API_BASE}/api/translations/generate-from-layout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    layout: currentPage.layout,
                    pageSlug: currentPage.slug,
                }),
            });
            const data = await res.json();
            if (data.success) {
                const msg = `✅ สร้าง ${data.created} keys, ข้าม ${data.skipped} keys`;
                setTranslationResult(msg);
                setTimeout(() => setTranslationResult(null), 5000);
            } else {
                setTranslationResult(`❌ ${data.message || 'Error'}`);
                setTimeout(() => setTranslationResult(null), 5000);
            }
        } catch (e) {
            setTranslationResult('❌ ไม่สามารถเชื่อมต่อ API ได้');
            setTimeout(() => setTranslationResult(null), 5000);
        } finally {
            setIsGeneratingTranslations(false);
        }
    };

    // Load page data when component mounts or ID changes
    useEffect(() => {
        if (pageData && id) {
            setCurrentPage(pageData);
        } else if (!id) {
            // Create new page mode — reset to blank page
            setCurrentPage({
                id: '',
                title: 'Untitled Page',
                slug: '',
                layout: [],
                seoMeta: { title: '', description: '', keywords: [] },
                status: 'draft',
                updatedAt: new Date().toISOString(),
            });
        }
    }, [pageData, id, setCurrentPage]);

    // Show loading state
    if (isLoading && id) {
        return (
            <div className="page-builder-loading">
                <div className="spinner"></div>
                <p>Loading page...</p>
            </div>
        );
    }

    const statusClass = currentPage?.status === 'published' ? 'page-status-published' : 'page-status-draft';

    return (
        <div className="page-builder">
            {/* ═══ Top Toolbar ═══ */}
            <div className="builder-toolbar">
                <div className="toolbar-left">
                    <button
                        onClick={toggleLeftPanel}
                        className={`toolbar-panel-toggle ${showLeftPanel ? 'active' : ''}`}
                        title="Toggle Components Panel"
                    >
                        {Icons.panelLeft}
                    </button>
                    <button
                        onClick={() => navigate('/pages')}
                        className="toolbar-back-btn"
                        title="Back to Pages"
                    >
                        {Icons.back}
                    </button>
                    <div className="page-title">
                        <input
                            type="text"
                            value={currentPage?.title || ''}
                            placeholder="Page Title"
                            onChange={(e) => {
                                if (currentPage) {
                                    const title = e.target.value;
                                    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                                    setCurrentPage({ ...currentPage, title, slug });
                                }
                            }}
                            style={{
                                background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)',
                                color: 'inherit', fontSize: '0.95rem', fontWeight: 700, padding: '2px 4px',
                                width: '180px', outline: 'none',
                            }}
                        />
                        <span className={`page-status ${statusClass}`}>
                            {currentPage?.status || 'draft'}
                        </span>
                    </div>
                </div>

                <div className="toolbar-center">
                    <div className="viewport-selector">
                        <button
                            className={`viewport-btn ${viewportMode === 'desktop' ? 'active' : ''}`}
                            onClick={() => setViewportMode('desktop')}
                            title="Desktop (1200px)"
                        >
                            {Icons.desktop}
                        </button>
                        <button
                            className={`viewport-btn ${viewportMode === 'tablet' ? 'active' : ''}`}
                            onClick={() => setViewportMode('tablet')}
                            title="Tablet (768px)"
                        >
                            {Icons.tablet}
                        </button>
                        <button
                            className={`viewport-btn ${viewportMode === 'mobile' ? 'active' : ''}`}
                            onClick={() => setViewportMode('mobile')}
                            title="Mobile (375px)"
                        >
                            {Icons.mobile}
                        </button>
                    </div>
                </div>

                <div className="toolbar-right">
                    {/* Undo/Redo */}
                    <button onClick={undo} className="toolbar-icon-btn" title="Undo (Ctrl+Z)">
                        {Icons.undo}
                    </button>
                    <button onClick={redo} className="toolbar-icon-btn" title="Redo (Ctrl+Shift+Z)">
                        {Icons.redo}
                    </button>

                    <div className="toolbar-divider"></div>

                    {/* Preview & Publish */}
                    <button
                        className="toolbar-preview-btn"
                        onClick={handlePreview}
                        disabled={!currentPage?.slug}
                        title={currentPage?.slug ? `Preview: ${FRONTEND_URL}/${currentPage.slug}` : 'No slug set'}
                    >
                        {Icons.eye}
                        Preview
                    </button>

                    {/* Generate Translations */}
                    <button
                        className="toolbar-preview-btn"
                        onClick={handleGenerateTranslations}
                        disabled={isGeneratingTranslations || !currentPage}
                        title="Auto-generate TH/EN translation keys from layout"
                        style={{ gap: '6px' }}
                    >
                        {isGeneratingTranslations ? (
                            <><div className="saving-spinner" style={{ width: 12, height: 12, borderWidth: 2 }}></div> กำลัง Gen...</>
                        ) : (
                            <><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> Gen Translations</>
                        )}
                    </button>

                    {/* Translation Result Toast */}
                    {translationResult && (
                        <div style={{
                            position: 'fixed', top: '56px', right: '20px', zIndex: 9999,
                            background: translationResult.startsWith('✅') ? '#10b981' : '#ef4444',
                            color: '#fff', padding: '10px 18px', borderRadius: '8px',
                            fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                            animation: 'fadeIn 0.3s ease',
                        }}>
                            {translationResult}
                        </div>
                    )}

                    {/* Save Draft */}
                    <button
                        className={`toolbar-preview-btn ${draftSaved ? 'success' : ''}`}
                        onClick={handleSaveDraft}
                        disabled={isSavingDraft || !currentPage}
                        title="Save current layout as draft"
                        style={{ gap: '6px' }}
                    >
                        {isSavingDraft ? (
                            <><div className="saving-spinner" style={{ width: 12, height: 12, borderWidth: 2 }}></div> Saving...</>
                        ) : draftSaved ? (
                            <><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Draft Saved!</>
                        ) : (
                            <><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save Draft</>
                        )}
                    </button>

                    <button
                        className={`toolbar-publish-btn ${saveSuccess ? 'success' : ''}`}
                        onClick={handleSaveAndPublish}
                        disabled={isSaving || !currentPage}
                    >
                        {isSaving ? (
                            <><div className="saving-spinner" style={{ width: 12, height: 12, borderWidth: 2 }}></div> Publishing...</>
                        ) : saveSuccess ? (
                            <>{Icons.check} Published!</>
                        ) : (
                            <>{Icons.check} Publish</>
                        )}
                    </button>

                    <button
                        onClick={toggleRightPanel}
                        className={`toolbar-panel-toggle ${showRightPanel ? 'active' : ''}`}
                        title="Toggle Properties Panel"
                    >
                        {Icons.panelRight}
                    </button>
                </div>
            </div>

            {/* ═══ Main Builder Area ═══ */}
            <div className="builder-workspace">
                {/* Left Panel — Vertical Icon Strip + Content */}
                {showLeftPanel && (
                    <div className="builder-panel left-panel">
                        {/* Vertical Icon Strip */}
                        <div className="panel-icon-strip">
                            <button
                                className={`panel-icon-btn ${activeTab === 'add' ? 'active' : ''}`}
                                onClick={() => setActiveTab('add')}
                                title="Add Components"
                            >
                                {Icons.add}
                                <span>Add</span>
                            </button>
                            <button
                                className={`panel-icon-btn ${activeTab === 'layers' ? 'active' : ''}`}
                                onClick={() => setActiveTab('layers')}
                                title="Templates"
                            >
                                {Icons.layers}
                                <span>Templates</span>
                            </button>
                        </div>

                        {/* Panel Content */}
                        <div className="panel-main">
                            <div className="panel-header">
                                <h3>
                                    {activeTab === 'add' && 'Components'}
                                    {activeTab === 'layers' && 'Templates'}
                                </h3>
                                <p>
                                    {activeTab === 'add' && 'Drag or click to add to canvas'}
                                    {activeTab === 'layers' && 'Choose a pre-built layout'}
                                </p>
                            </div>

                            <div className="panel-content">
                                {activeTab === 'add' && <ComponentLibrary />}
                                {activeTab === 'layers' && <LayersPanel />}
                            </div>
                        </div>
                    </div>
                )}

                {/* Center Canvas */}
                <div className="builder-canvas-container">
                    <Canvas />
                </div>

                {/* Right Panel - Properties */}
                {showRightPanel && (
                    <div className="builder-panel right-panel">
                        <PropertiesPanel />
                    </div>
                )}
            </div>
        </div>
    );
}
