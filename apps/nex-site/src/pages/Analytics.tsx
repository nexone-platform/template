import { useState, useEffect } from 'react';
import { usePages } from '../hooks/usePages';
import { API_BASE_URL } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import './Analytics.css';

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

export default function Analytics() {
    const { data: pages, isLoading: pagesLoading } = usePages();
    const { t } = useLanguage();
    const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(true);
    const [filterAction, setFilterAction] = useState<'all' | 'login' | 'logout'>('all');

    useEffect(() => {
        fetch(`${API_BASE_URL}/auth/logs?limit=50`)
            .then(res => res.json())
            .then(data => {
                setAuthLogs(data);
                setLogsLoading(false);
            })
            .catch(() => setLogsLoading(false));
    }, []);

    // ── Compute stats ──
    const totalViews = (pages ?? []).reduce((s, p) => s + (p.views ?? 0), 0);
    const totalPages = pages?.length ?? 0;
    const publishedPages = pages?.filter(p => p.status === 'published').length ?? 0;

    const todayStr = new Date().toISOString().slice(0, 10);
    const loginsToday = authLogs.filter(
        l => l.action === 'login' && l.success && l.createdAt.slice(0, 10) === todayStr
    ).length;

    const failedLogins = authLogs.filter(l => l.action === 'login' && !l.success).length;

    // ── Page ranking by views ──
    const sortedPages = [...(pages ?? [])].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    const maxViews = sortedPages[0]?.views ?? 1;

    // ── Filtered logs ──
    const filteredLogs = filterAction === 'all'
        ? authLogs
        : authLogs.filter(l => l.action === filterAction);

    const loading = pagesLoading || logsLoading;

    return (
        <div className="analytics-page">

            {/* Stats Grid */}
            <div className="analytics-stats">
                <div className="a-stat-card">
                    <div className="a-stat-icon a-stat-icon-views"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></div>
                    <div className="a-stat-info">
                        <span className="a-stat-label">{t('bo.analytics.totalViews', 'Total Page Views')}</span>
                        <span className="a-stat-value">{loading ? '…' : totalViews.toLocaleString()}</span>
                    </div>
                </div>
                <div className="a-stat-card">
                    <div className="a-stat-icon a-stat-icon-pages"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg></div>
                    <div className="a-stat-info">
                        <span className="a-stat-label">{t('bo.analytics.publishedPages', 'Published Pages')}</span>
                        <span className="a-stat-value">{loading ? '…' : `${publishedPages} / ${totalPages}`}</span>
                    </div>
                </div>
                <div className="a-stat-card">
                    <div className="a-stat-icon a-stat-icon-login"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg></div>
                    <div className="a-stat-info">
                        <span className="a-stat-label">{t('bo.analytics.loginsToday', 'Logins Today')}</span>
                        <span className="a-stat-value">{loading ? '…' : loginsToday}</span>
                    </div>
                </div>
                <div className="a-stat-card">
                    <div className="a-stat-icon a-stat-icon-fail"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg></div>
                    <div className="a-stat-info">
                        <span className="a-stat-label">{t('bo.analytics.failedLogins', 'Failed Logins')}</span>
                        <span className="a-stat-value">{loading ? '…' : failedLogins}</span>
                    </div>
                </div>
            </div>

            {/* Two-column layout */}
            <div className="analytics-grid">
                {/* Page Views Ranking */}
                <div className="card analytics-card">
                    <div className="card-header">
                        <h2>{t('bo.analytics.topPages', 'Top Pages')}</h2>
                    </div>
                    {pagesLoading ? (
                        <div className="analytics-loading">
                            <div className="spinner" />
                            <p>{t('bo.analytics.loading', 'Loading...')}</p>
                        </div>
                    ) : sortedPages.length === 0 ? (
                        <div className="analytics-empty">ยังไม่มีข้อมูลหน้า</div>
                    ) : (
                        <div className="ranking-list">
                            {sortedPages.map((page, i) => {
                                const pct = maxViews > 0 ? ((page.views ?? 0) / maxViews) * 100 : 0;
                                return (
                                    <div key={page.id} className="ranking-item">
                                        <div className="ranking-rank">#{i + 1}</div>
                                        <div className="ranking-info">
                                            <div className="ranking-top">
                                                <span className="ranking-title">{page.title}</span>
                                                <span className="ranking-views">{(page.views ?? 0).toLocaleString()} {t('bo.common.views', 'views')}</span>
                                            </div>
                                            <div className="ranking-bar-bg">
                                                <div
                                                    className="ranking-bar-fill"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Activity Timeline */}
                <div className="card analytics-card">
                    <div className="card-header">
                        <h2>{t('bo.analytics.recentActivity', 'Recent Activity')}</h2>
                    </div>
                    {logsLoading ? (
                        <div className="analytics-loading">
                            <div className="spinner" />
                            <p>{t('bo.analytics.loading', 'Loading...')}</p>
                        </div>
                    ) : authLogs.length === 0 ? (
                        <div className="analytics-empty">ยังไม่มีกิจกรรม</div>
                    ) : (
                        <div className="timeline-list">
                            {authLogs.slice(0, 10).map(log => (
                                <div key={log.id} className="timeline-item">
                                    <div className={`timeline-dot ${log.action === 'login' ? (log.success ? 'dot-login' : 'dot-fail') : 'dot-logout'}`} />
                                    <div className="timeline-content">
                                        <div className="timeline-top">
                                            <span className="timeline-user">{log.username}</span>
                                            <span className={`timeline-action-badge ${log.action === 'login' ? (log.success ? 'badge-login' : 'badge-fail') : 'badge-logout'}`}>
                                                {log.action === 'login' ? (log.success ? 'Logged in' : 'Failed') : 'Logged out'}
                                            </span>
                                        </div>
                                        <div className="timeline-meta">
                                            <span>{new Date(log.createdAt).toLocaleString('th-TH')}</span>
                                            {log.ipAddress && <span>• IP: {log.ipAddress}</span>}
                                        </div>
                                        {log.failReason && (
                                            <div className="timeline-fail-reason">{log.failReason}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Auth Logs Table */}
            <div className="card analytics-card-full">
                <div className="card-header">
                    <h2>{t('bo.analytics.authLogs', 'Auth Logs')}</h2>
                    <div className="log-filters">
                        {(['all', 'login', 'logout'] as const).map(f => (
                            <button
                                key={f}
                                className={`log-filter-btn ${filterAction === f ? 'active' : ''}`}
                                onClick={() => setFilterAction(f)}
                            >
                                {f === 'all' ? 'All' : f === 'login' ? 'Login' : 'Logout'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="table-container">
                    {logsLoading ? (
                        <div className="analytics-loading">
                            <div className="spinner" />
                            <p>{t('bo.analytics.loading', 'Loading...')}</p>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="analytics-empty">ไม่มีรายการ</div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ผู้ใช้</th>
                                    <th>Action</th>
                                    <th>สถานะ</th>
                                    <th>IP Address</th>
                                    <th>เวลา</th>
                                    <th>หมายเหตุ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map(log => (
                                    <tr key={log.id}>
                                        <td>
                                            <div className="log-user">
                                                <span className="log-user-avatar">
                                                    {log.username.charAt(0).toUpperCase()}
                                                </span>
                                                {log.username}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${log.action === 'login' ? 'badge-login-type' : 'badge-logout-type'}`}>
                                                {log.action === 'login' ? 'Login' : 'Logout'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${log.success ? 'badge-published' : 'badge-fail-type'}`}>
                                                {log.success ? 'Success' : 'Failed'}
                                            </span>
                                        </td>
                                        <td className="text-gray">{log.ipAddress || '-'}</td>
                                        <td className="text-gray">
                                            {new Date(log.createdAt).toLocaleString('th-TH')}
                                        </td>
                                        <td className="text-gray">{log.failReason || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
