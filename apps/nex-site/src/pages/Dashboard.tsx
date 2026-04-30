import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePages } from '../hooks/usePages';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE_URL } from '../services/api';
import './Dashboard.css';

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000';

interface AuthLog {
    id: string;
    userId: string;
    username: string;
    action: 'login' | 'logout';
    ipAddress: string;
    userAgent: string;
    success: boolean;
    failReason: string | null;
    createdAt: string;
}

export default function Dashboard() {
    const navigate = useNavigate();
    const { data: pages, isLoading } = usePages();
    const { t } = useLanguage();
    const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(true);
    const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
    const [chartView, setChartView] = useState<'timeline' | 'page'>('page');
    const [viewStats, setViewStats] = useState<{ pageId: string; pageTitle: string; pageSlug: string; views: number }[]>([]);
    const [viewStatsLoading, setViewStatsLoading] = useState(true);
    const [timeSeries, setTimeSeries] = useState<{ label: string; views: number }[]>([]);
    const [timeSeriesLoading, setTimeSeriesLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/auth/logs?limit=50`)
            .then(res => res.json())
            .then(data => { setAuthLogs(data); setLogsLoading(false); })
            .catch(() => setLogsLoading(false));
    }, []);

    // Fetch time-series data when period changes
    useEffect(() => {
        setTimeSeriesLoading(true);
        fetch(`${API_BASE_URL}/pages/view-time-series?period=${chartPeriod}`)
            .then(res => res.json())
            .then(data => {
                setTimeSeries(data.series || []);
                setTimeSeriesLoading(false);
            })
            .catch(() => setTimeSeriesLoading(false));

        // Fetch per-page view stats
        setViewStatsLoading(true);
        fetch(`${API_BASE_URL}/pages/view-stats?period=${chartPeriod}`)
            .then(res => res.json())
            .then(data => {
                setViewStats(data.pages || []);
                setViewStatsLoading(false);
            })
            .catch(() => setViewStatsLoading(false));
    }, [chartPeriod]);

    const totalPages = pages?.length ?? 0;
    const publishedPages = pages?.filter((p) => p.status === 'published').length ?? 0;
    const totalViews = (pages ?? []).reduce((s, p) => s + (p.views ?? 0), 0);

    const todayStr = new Date().toISOString().slice(0, 10);
    const loginsToday = authLogs.filter(
        l => l.action === 'login' && l.success && l.createdAt.slice(0, 10) === todayStr
    ).length;
    const failedLogins = authLogs.filter(l => l.action === 'login' && !l.success).length;

    const loading = isLoading || logsLoading;

    const tsMaxViews = timeSeries.length > 0 ? Math.max(...timeSeries.map(s => s.views), 1) : 1;

    // Per-page chart data
    const pageChartData = viewStats.length > 0
        ? viewStats
        : (pages ?? []).map(p => ({ pageId: p.id, pageTitle: p.title, pageSlug: p.slug, views: p.views ?? 0 }))
            .sort((a, b) => b.views - a.views);
    const maxPageViews = pageChartData[0]?.views || 1;
    const periodLabels = [
        { key: 'day' as const, label: 'วัน' },
        { key: 'week' as const, label: 'สัปดาห์' },
        { key: 'month' as const, label: 'เดือน' },
        { key: 'year' as const, label: 'ปี' },
    ];

    const allSorted = [...(pages ?? [])]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        if (isToday) {
            return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    };

    // Bar colors for chart
    const barColors = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#7c3aed', '#6d28d9'];

    return (
        <div className="dashboard">

            {/* ══════ Stats Cards ══════ */}
            <div className="dash-stats">
                <div className="dash-stat-card">
                    <div className="dash-stat-icon dash-stat-icon-pages">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    </div>
                    <div className="dash-stat-info">
                        <span className="dash-stat-label">{t('bo.dashboard.totalPages', 'Total Pages')}</span>
                        <span className="dash-stat-value">{loading ? '…' : totalPages}</span>
                    </div>
                </div>
                <div className="dash-stat-card">
                    <div className="dash-stat-icon dash-stat-icon-published">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    </div>
                    <div className="dash-stat-info">
                        <span className="dash-stat-label">{t('bo.dashboard.published', 'Published')}</span>
                        <span className="dash-stat-value">{loading ? '…' : `${publishedPages} / ${totalPages}`}</span>
                    </div>
                </div>
                <div className="dash-stat-card">
                    <div className="dash-stat-icon dash-stat-icon-views">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    </div>
                    <div className="dash-stat-info">
                        <span className="dash-stat-label">{t('bo.dashboard.totalViews', 'Total Views')}</span>
                        <span className="dash-stat-value">{loading ? '…' : totalViews.toLocaleString()}</span>
                    </div>
                </div>
                <div className="dash-stat-card">
                    <div className="dash-stat-icon dash-stat-icon-logins">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <div className="dash-stat-info">
                        <span className="dash-stat-label">{t('bo.analytics.loginsToday', 'Logins Today')}</span>
                        <span className="dash-stat-value">{loading ? '…' : loginsToday}</span>
                    </div>
                </div>
                <div className="dash-stat-card">
                    <div className="dash-stat-icon dash-stat-icon-failed">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    </div>
                    <div className="dash-stat-info">
                        <span className="dash-stat-label">{t('bo.analytics.failedLogins', 'Failed Logins')}</span>
                        <span className="dash-stat-value">{loading ? '…' : failedLogins}</span>
                    </div>
                </div>
            </div>

            {/* ══════ Charts Section ══════ */}
            <div className="dash-charts-grid">
                <div className="dash-chart-card card">
                    <div className="dash-chart-header">
                        <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 6, verticalAlign: 'text-bottom'}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>{t('bo.analytics.topPages', 'Page Views')}</h3>
                        <div className="dash-period-filters">
                            <div className="dash-view-toggle">
                                <button
                                    className={`dash-period-btn ${chartView === 'page' ? 'active' : ''}`}
                                    onClick={() => setChartView('page')}
                                >ตามหน้า</button>
                                <button
                                    className={`dash-period-btn ${chartView === 'timeline' ? 'active' : ''}`}
                                    onClick={() => setChartView('timeline')}
                                >ตามช่วงเวลา</button>
                            </div>
                            {chartView === 'timeline' && (
                                <div className="dash-view-toggle" style={{marginLeft: 8}}>
                                    {periodLabels.map(p => (
                                        <button
                                            key={p.key}
                                            className={`dash-period-btn ${chartPeriod === p.key ? 'active' : ''}`}
                                            onClick={() => setChartPeriod(p.key)}
                                        >{p.label}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="dash-chart-body">
                        {chartView === 'page' ? (
                            /* Per-Page Chart */
                            (isLoading || viewStatsLoading) ? (
                                <div className="dash-chart-loading"><div className="spinner" /><p>Loading...</p></div>
                            ) : pageChartData.length === 0 ? (
                                <div className="dash-chart-empty">ยังไม่มีข้อมูลหน้า</div>
                            ) : (
                                <div className="dash-bar-chart">
                                    <div className="dash-bar-y-axis">
                                        {[100, 75, 50, 25, 0].map(pct => (
                                            <span key={pct} className="dash-bar-y-label">
                                                {Math.round((maxPageViews) * pct / 100).toLocaleString()}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="dash-bar-area">
                                        <div className="dash-bar-gridlines">
                                            {[0, 1, 2, 3, 4].map(i => (
                                                <div key={i} className="dash-bar-gridline" />
                                            ))}
                                        </div>
                                        <div className="dash-bar-bars">
                                            {pageChartData.map((page: { pageId: string; pageTitle: string; views: number }, i: number) => {
                                                const pct = maxPageViews > 0 ? (page.views / maxPageViews) * 100 : 0;
                                                return (
                                                    <div key={page.pageId} className="dash-bar-col" title={`${page.pageTitle}: ${page.views.toLocaleString()} views`}>
                                                        <div className="dash-bar-fill-wrap">
                                                            <div
                                                                className="dash-bar-fill"
                                                                style={{
                                                                    height: `${Math.max(pct, 2)}%`,
                                                                    background: barColors[i % barColors.length],
                                                                    animationDelay: `${i * 0.08}s`,
                                                                }}
                                                            >
                                                                <span className="dash-bar-tooltip">{page.views.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                        <span className="dash-bar-label">{page.pageTitle.length > 10 ? page.pageTitle.slice(0, 10) + '…' : page.pageTitle}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : (
                            /* Time-Series Chart */
                            (isLoading || timeSeriesLoading) ? (
                                <div className="dash-chart-loading"><div className="spinner" /><p>Loading...</p></div>
                            ) : timeSeries.length === 0 ? (
                                <div className="dash-chart-empty">ยังไม่มีข้อมูลการเข้าชม</div>
                            ) : (
                                <div className="dash-bar-chart">
                                    <div className="dash-bar-y-axis">
                                        {[100, 75, 50, 25, 0].map(pct => (
                                            <span key={pct} className="dash-bar-y-label">
                                                {Math.round((tsMaxViews) * pct / 100).toLocaleString()}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="dash-bar-area">
                                        <div className="dash-bar-gridlines">
                                            {[0, 1, 2, 3, 4].map(i => (
                                                <div key={i} className="dash-bar-gridline" />
                                            ))}
                                        </div>
                                        <div className="dash-bar-bars">
                                            {timeSeries.map((item, i) => {
                                                const pct = tsMaxViews > 0 ? (item.views / tsMaxViews) * 100 : 0;
                                                return (
                                                    <div key={`${item.label}-${i}`} className="dash-bar-col" title={`${item.label}: ${item.views.toLocaleString()} views`}>
                                                        <div className="dash-bar-fill-wrap">
                                                            <div
                                                                className="dash-bar-fill"
                                                                style={{
                                                                    height: `${Math.max(pct, 2)}%`,
                                                                    background: barColors[i % barColors.length],
                                                                    animationDelay: `${i * 0.08}s`,
                                                                }}
                                                            >
                                                                <span className="dash-bar-tooltip">{item.views.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                        <span className="dash-bar-label">{item.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Activity Timeline */}
                <div className="dash-chart-card card">
                    <div className="dash-chart-header">
                        <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 6, verticalAlign: 'text-bottom'}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{t('bo.analytics.recentActivity', 'Recent Activity')}</h3>
                    </div>
                    <div className="dash-chart-body dash-activity-body">
                        {logsLoading ? (
                            <div className="dash-chart-loading"><div className="spinner" /><p>Loading...</p></div>
                        ) : authLogs.length === 0 ? (
                            <div className="dash-chart-empty">ยังไม่มีกิจกรรม</div>
                        ) : (
                            <div className="dash-timeline">
                                {authLogs.slice(0, 8).map(log => (
                                    <div key={log.id} className="dash-timeline-item">
                                        <div className={`dash-timeline-dot ${log.action === 'login' ? (log.success ? 'dot-success' : 'dot-fail') : 'dot-logout'}`} />
                                        <div className="dash-timeline-content">
                                            <div className="dash-timeline-top">
                                                <span className="dash-timeline-user">{log.username}</span>
                                                <span className={`dash-timeline-badge ${log.action === 'login' ? (log.success ? 'tbadge-success' : 'tbadge-fail') : 'tbadge-logout'}`}>
                                                    {log.action === 'login' ? (log.success ? 'Logged in' : 'Failed') : 'Logged out'}
                                                </span>
                                            </div>
                                            <span className="dash-timeline-time">{new Date(log.createdAt).toLocaleString('th-TH')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ══════ Recent Pages Inbox ══════ */}
            <div className="gmail-inbox">
                <div className="gmail-header dashboard-card-header-sticky">
                    <h2 className="gmail-header-title">{t('bo.dashboard.recentPages', 'Recent Pages')}</h2>
                    <div className="gmail-header-actions">
                        <Link to="/pages" className="text-primary">{t('bo.pages.all', 'View All')} →</Link>
                        <Link to="/builder" className="btn btn-primary btn-sm">
                            <span>+</span> {t('bo.pages.createNew', 'Create New Page')}
                        </Link>
                    </div>
                </div>

                <div className="gmail-rows">
                    {isLoading ? (
                        <div className="gmail-empty">
                            <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                            <p>{t('bo.analytics.loading', 'Loading...')}</p>
                        </div>
                    ) : allSorted.length === 0 ? (
                        <div className="gmail-empty">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <p style={{ marginTop: '12px' }}>No pages found. <Link to="/builder" className="text-primary">Create your first page</Link></p>
                        </div>
                    ) : (
                        allSorted.map((page) => (
                            <div
                                key={page.id}
                                className="gmail-row"
                                onClick={() => navigate(`/builder/${page.id}`)}
                            >
                                <span className="gmail-sender">{page.title}</span>
                                <span className="gmail-subject">
                                    <span className="gmail-subject-slug">/{page.slug}</span>
                                    <span className="gmail-subject-sep"> — </span>
                                    <span className={`gmail-status-dot ${page.status}`} />
                                    <span className="gmail-subject-status">{page.status === 'published' ? t('bo.dashboard.published', 'Published') : t('bo.dashboard.draft', 'Draft')}</span>
                                    <span className="gmail-subject-preview"> · {(page.views ?? 0).toLocaleString()} {t('bo.common.views', 'views')}</span>
                                </span>
                                <span className="gmail-date">{formatDate(page.updatedAt)}</span>
                                <div className="gmail-hover-actions" onClick={e => e.stopPropagation()}>
                                    <button className="gmail-action-btn" title="Edit" onClick={() => navigate(`/builder/${page.id}`)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </button>
                                    <button className="gmail-action-btn" title="Preview" onClick={() => window.open(`${FRONTEND_URL}/${page.slug}`, '_blank')}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                    </button>
                                    <button className="gmail-action-btn" title="Open in new tab" onClick={() => window.open(`${FRONTEND_URL}/${page.slug}`, '_blank')}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
}
