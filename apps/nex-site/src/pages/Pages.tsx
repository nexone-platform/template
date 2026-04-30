import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePages, useDeletePage, usePublishPage, useUnpublishPage, useToggleNavVisibility } from '../hooks/usePages';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import './Pages.css';

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000';



type ViewMode = 'grid' | 'list';

export default function Pages() {
    const navigate = useNavigate();
    const { data: pages, isLoading, error } = usePages();
    const { t } = useLanguage();
    const { showToast, showConfirm } = useToast();
    const deletePage = useDeletePage();
    const publishPage = usePublishPage();
    const unpublishPage = useUnpublishPage();
    const toggleNav = useToggleNavVisibility();

    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

    const handleEdit = (pageId: string) => navigate(`/builder/${pageId}`);

    const handleDelete = async (pageId: string) => {
        const ok = await showConfirm({
            title: 'ลบหน้าเพจ',
            message: 'ต้องการลบหน้านี้จริงหรือไม่?',
            confirmText: 'ยืนยันลบ',
            variant: 'danger',
        });
        if (ok) {
            try { await deletePage.mutateAsync(pageId); }
            catch { showToast('ไม่สามารถลบหน้าได้', 'error'); }
        }
    };

    const handleToggleStatus = async (pageId: string, currentStatus: string) => {
        try {
            if (currentStatus === 'draft') await publishPage.mutateAsync(pageId);
            else await unpublishPage.mutateAsync(pageId);
        } catch { showToast('ไม่สามารถเปลี่ยนสถานะได้', 'error'); }
    };

    if (isLoading) return <div className="pages-loading"><div className="spinner" /><p>Loading pages...</p></div>;
    if (error) return <div className="pages-error"><h2>Error Loading Pages</h2><p>{error.message}</p></div>;

    const sortedPages = [...(pages || [])].sort((a, b) => {
        if (a.slug === 'home') return -1;
        if (b.slug === 'home') return 1;
        return a.slug.localeCompare(b.slug);
    });

    const filteredPages = sortedPages.filter(p => {
        const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || p.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <div className="pages-container">
            {/* Header removed as requested */}

            {/* ── Toolbar: Search, Filter, View Toggle ── */}
            <div className="pages-toolbar">
                {/* Left: Filter badges */}
                <div className="toolbar-filters">
                    {(['all', 'published', 'draft'] as const).map(s => (
                        <button
                            key={s}
                            className={`filter-btn ${filterStatus === s ? 'active' : ''} filter-${s}`}
                            onClick={() => setFilterStatus(s)}
                        >
                        {s === 'all' ? `${t('bo.pages.all', 'All')} (${sortedPages.length})`
                                : s === 'published' ? `${t('bo.dashboard.published', 'Published')} (${sortedPages.filter(p => p.status === 'published').length})`
                                    : `${t('bo.dashboard.draft', 'Draft')} (${sortedPages.filter(p => p.status === 'draft').length})`}
                        </button>
                    ))}
                </div>

                {/* Right: Search + view toggle */}
                <div className="toolbar-right">
                    <div className="toolbar-search">
                        <span className="search-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg></span>
                        <input
                            type="text"
                            placeholder={t('bo.pages.search', 'ค้นหาหน้า...')}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="search-input"
                        />
                        {search && (
                            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
                        )}
                    </div>

                    {/* View toggle */}
                    <div className="view-toggle">
                        <button
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Grid View"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="1" y="1" width="6" height="6" rx="1" />
                                <rect x="9" y="1" width="6" height="6" rx="1" />
                                <rect x="1" y="9" width="6" height="6" rx="1" />
                                <rect x="9" y="9" width="6" height="6" rx="1" />
                            </svg>
                            <span>Grid</span>
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="List View"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="1" y="2" width="14" height="2" rx="1" />
                                <rect x="1" y="7" width="14" height="2" rx="1" />
                                <rect x="1" y="12" width="14" height="2" rx="1" />
                            </svg>
                            <span>List</span>
                        </button>
                    </div>

                    <button className="btn btn-primary" onClick={() => navigate('/builder')}>
                        + {t('bo.pages.createNew', 'Create New Page')}
                    </button>
                </div>
            </div>

            {/* ── Result count ── */}
            {search && (
                <p className="search-result-count">
                    พบ {filteredPages.length} หน้า สำหรับ "{search}"
                </p>
            )}

            {/* ── Empty State ── */}
            {filteredPages.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.4}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg></div>
                    <h3>{search ? 'ไม่พบหน้าที่ค้นหา' : 'No pages yet'}</h3>
                    <p>{search ? 'ลองใช้คำค้นหาอื่น' : 'Create your first landing page to get started'}</p>
                    {!search && (
                        <button className="btn btn-primary" onClick={() => navigate('/builder')}>
                            Create Page
                        </button>
                    )}
                </div>
            ) : viewMode === 'grid' ? (

                /* ════════ GRID VIEW ════════ */
                <div className="pages-grid">
                    {filteredPages.map((page) => {
                        const layoutComponents = (page as any).layout || [];
                        return (
                            <div key={page.id} className="page-card">
                                <div className="page-card-header">
                                    <div>
                                        <h3>{page.title}</h3>
                                        <span className="page-url">/{page.slug}</span>
                                    </div>
                                    <span className={`status-badge ${page.status}`}>
                                        {page.status === 'published' ? `● ${t('bo.dashboard.published', 'Published')}` : `○ ${t('bo.dashboard.draft', 'Draft')}`}
                                    </span>
                                </div>

                                <div className="page-card-body">
                                    <div className="page-info">
                                        <div className="info-item">
                                            <span className="label">{t('bo.pages.views', 'Views')}:</span>
                                            <span className="value">{page.views?.toLocaleString() || 0}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">{t('bo.pages.sections', 'Sections')}:</span>
                                            <span className="value">{layoutComponents.length}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">{t('bo.pages.updated', 'Updated')}:</span>
                                            <span className="value">{new Date(page.updatedAt).toLocaleDateString('th-TH')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="page-card-footer">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', width: '100%' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem', color: page.isNavVisible ? '#10b981' : '#94a3b8' }}>
                                            <button
                                                onClick={() => toggleNav.mutate(page.id)}
                                                disabled={toggleNav.isPending}
                                                style={{
                                                    width: '36px', height: '20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                                    background: page.isNavVisible ? '#10b981' : '#374151',
                                                    position: 'relative', transition: 'background 0.2s',
                                                }}
                                            >
                                                <span style={{
                                                    position: 'absolute', top: '2px', left: page.isNavVisible ? '18px' : '2px',
                                                    width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
                                                    transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                                }} />
                                            </button>
                                            {page.isNavVisible ? t('bo.pages.showNavbar', 'Show in Navbar') : t('bo.pages.hidden', 'Hidden')}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                                        <button className="btn btn-sm btn-secondary" onClick={() => window.open(`${FRONTEND_URL}/${page.slug}`, '_blank')}>{t('bo.pages.preview', 'Preview')}</button>
                                        <button
                                            className={`btn btn-sm ${page.status === 'draft' ? 'btn-success' : 'btn-warning'}`}
                                            onClick={() => handleToggleStatus(page.id, page.status)}
                                            disabled={publishPage.isPending || unpublishPage.isPending}
                                        >
                                            {page.status === 'draft' ? t('bo.pages.publish', 'Publish') : t('bo.pages.unpublish', 'Unpublish')}
                                        </button>
                                        <button className="btn btn-sm btn-primary" onClick={() => handleEdit(page.id)}>{t('bo.pages.edit', 'Edit')}</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(page.id)} disabled={deletePage.isPending}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            ) : (

                /* ════════ LIST VIEW ════════ */
                <div className="card">
                    <table className="data-table pages-list-table">
                        <thead>
                            <tr>
                                <th>{t('bo.nav.pages', 'Page')}</th>
                                <th>{t('bo.pages.slug', 'Slug')}</th>
                                <th>{t('bo.pages.sections', 'Components')}</th>
                                <th>{t('bo.common.status', 'Status')}</th>
                                <th>{t('bo.pages.navbar', 'Navbar')}</th>
                                <th style={{ textAlign: 'right' }}>{t('bo.pages.views', 'Views')}</th>
                                <th>{t('bo.pages.updated', 'Updated')}</th>
                                <th>{t('bo.common.actions', 'Actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPages.map((page) => {
                                const layoutComponents = (page as any).layout || [];
                                return (
                                    <tr key={page.id}>
                                        <td>
                                            <div className="list-page-title">
                                                <strong>{page.title}</strong>
                                            </div>
                                        </td>
                                        <td className="text-gray">/{page.slug}</td>
                                        <td>
                                            <span className="list-comp-count">{layoutComponents.length} {t('bo.pages.sections', 'sections')}</span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${page.status}`}>
                                                {page.status === 'published' ? `● ${t('bo.dashboard.published', 'Published')}` : `○ ${t('bo.dashboard.draft', 'Draft')}`}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => toggleNav.mutate(page.id)}
                                                disabled={toggleNav.isPending}
                                                title={page.isNavVisible ? 'Click to hide from navbar' : 'Click to show in navbar'}
                                                style={{
                                                    width: '36px', height: '20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                                    background: page.isNavVisible ? '#10b981' : '#374151',
                                                    position: 'relative', transition: 'background 0.2s',
                                                }}
                                            >
                                                <span style={{
                                                    position: 'absolute', top: '2px', left: page.isNavVisible ? '18px' : '2px',
                                                    width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
                                                    transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                                }} />
                                            </button>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>{(page.views ?? 0).toLocaleString()}</td>
                                        <td className="text-gray">{new Date(page.updatedAt).toLocaleDateString('th-TH')}</td>
                                        <td>
                                            <div className="flex gap-sm" style={{ flexWrap: 'nowrap' }}>
                                                <button className="btn btn-sm btn-secondary" onClick={() => window.open(`${FRONTEND_URL}/${page.slug}`, '_blank')}>{t('bo.pages.preview', 'Preview')}</button>
                                                <button
                                                    className={`btn btn-sm ${page.status === 'draft' ? 'btn-success' : 'btn-warning'}`}
                                                    onClick={() => handleToggleStatus(page.id, page.status)}
                                                    disabled={publishPage.isPending || unpublishPage.isPending}
                                                >
                                                    {page.status === 'draft' ? t('bo.pages.publish', 'Publish') : t('bo.pages.unpublish', 'Unpublish')}
                                                </button>
                                                <button className="btn btn-sm btn-primary" onClick={() => handleEdit(page.id)}>{t('bo.pages.edit', 'Edit')}</button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(page.id)} disabled={deletePage.isPending}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
