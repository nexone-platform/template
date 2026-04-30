import React, { useState, useRef, useEffect } from 'react';

// ── Technology Library with official-style SVG icons ──
export interface TechItem {
    id: string;
    name: string;
    category: string;
    svg: React.ReactNode;
}

export const TECH_LIBRARY: TechItem[] = [
    // ── Cloud ──
    { id: 'aws', name: 'AWS', category: 'Cloud', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> },
    { id: 'gcloud', name: 'Google Cloud', category: 'Cloud', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
    { id: 'azure', name: 'Microsoft Azure', category: 'Cloud', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><path d="M13 10V4.5" /><path d="M17 10V6" /></svg> },

    // ── DevOps / Infra ──
    { id: 'docker', name: 'Docker', category: 'DevOps', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="10" width="20" height="10" rx="2"/><rect x="5" y="5" width="4" height="5"/><rect x="10" y="5" width="4" height="5"/><rect x="5" y="13" width="3" height="3"/><rect x="9.5" y="13" width="3" height="3"/><rect x="14" y="13" width="3" height="3"/></svg> },
    { id: 'kubernetes', name: 'Kubernetes', category: 'DevOps', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg> },
    { id: 'terraform', name: 'Terraform', category: 'DevOps', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> },
    { id: 'jenkins', name: 'Jenkins', category: 'DevOps', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852 1.001 1.51 1H21a2 2 0 0 1 0 4h-.09c-.658 0-1.25.397-1.51 1z"/></svg> },
    { id: 'github', name: 'GitHub', category: 'DevOps', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg> },
    { id: 'gitlab', name: 'GitLab', category: 'DevOps', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 13.29-3.33-10a.42.42 0 0 0-.14-.18.38.38 0 0 0-.22-.11.39.39 0 0 0-.23.07.42.42 0 0 0-.14.18l-2.26 6.67H8.32L6.1 3.26a.42.42 0 0 0-.1-.18.38.38 0 0 0-.26-.08.39.39 0 0 0-.23.07.42.42 0 0 0-.14.18L2 13.29a.74.74 0 0 0 .27.83L12 21l9.69-6.88a.71.71 0 0 0 .31-.83Z"/></svg> },

    // ── Frontend ──
    { id: 'react', name: 'React', category: 'Frontend', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></svg> },
    { id: 'nextjs', name: 'Next.js', category: 'Frontend', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 15V9l7.745 10.65A9 9 0 1 1 19 17.657"/><circle cx="12" cy="12" r="9"/><path d="M15 9v3"/></svg> },
    { id: 'vuejs', name: 'Vue.js', category: 'Frontend', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h4l6 10.5L18 3h4L12 21z"/><path d="M7 3l5 8.5L17 3"/></svg> },
    { id: 'angular', name: 'Angular', category: 'Frontend', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 4 20 12 23 20 20 22 7 12 2"/><path d="M12 2v21"/><path d="M7 14h10"/></svg> },
    { id: 'typescript', name: 'TypeScript', category: 'Frontend', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 17v-6h3"/><path d="M7 11h5"/><path d="M16 8a2 2 0 0 0-2 2c0 2 4 2 4 4a2 2 0 0 1-2 2"/></svg> },
    { id: 'flutter', name: 'Flutter', category: 'Frontend', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
    { id: 'tailwind', name: 'Tailwind CSS', category: 'Frontend', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8c2-4 5-4 6-2s4 2 6-2"/><path d="M6 16c2-4 5-4 6-2s4 2 6-2"/></svg> },

    // ── Backend ──
    { id: 'nodejs', name: 'Node.js', category: 'Backend', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/></svg> },
    { id: 'nestjs', name: 'NestJS', category: 'Backend', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/></svg> },
    { id: 'python', name: 'Python', category: 'Backend', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="14" y1="4" x2="10" y2="20"/></svg> },
    { id: 'java', name: 'Java', category: 'Backend', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21c0-3.28 2.87-4.52 4-5.72S14 13 14 10c0 2 1.18 3.95 0 6-.82 1.43-2.17 2.24-2 5"/><path d="M15.54 8.46a6 6 0 0 1-7.08 0"/><path d="M6 12a6 6 0 0 1 12 0"/><path d="M18 12c0 3-2.69 5-6 5s-6-2-6-5"/></svg> },
    { id: 'go', name: 'Go', category: 'Backend', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 17l4-8 4 4 4-10"/></svg> },
    { id: 'rust', name: 'Rust', category: 'Backend', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="10"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/></svg> },

    // ── Database ──
    { id: 'postgresql', name: 'PostgreSQL', category: 'Database', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg> },
    { id: 'mongodb', name: 'MongoDB', category: 'Database', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M12 8v14"/></svg> },
    { id: 'mysql', name: 'MySQL', category: 'Database', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg> },
    { id: 'redis', name: 'Redis', category: 'Database', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/><polyline points="2 15.5 12 8.5 22 15.5"/></svg> },

    // ── AI/ML ──
    { id: 'tensorflow', name: 'TensorFlow', category: 'AI/ML', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg> },
    { id: 'pytorch', name: 'PyTorch', category: 'AI/ML', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12l-4-4"/><circle cx="12" cy="18" r="3"/></svg> },
    { id: 'openai', name: 'OpenAI', category: 'AI/ML', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg> },

    // ── Tools ──
    { id: 'grafana', name: 'Grafana', category: 'Tools', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg> },
    { id: 'elasticsearch', name: 'Elasticsearch', category: 'Tools', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg> },
    { id: 'kafka', name: 'Kafka', category: 'Tools', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg> },
    { id: 'nginx', name: 'Nginx', category: 'Tools', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg> },
    { id: 'powerbi', name: 'Power BI', category: 'Tools', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="3" y1="20" x2="21" y2="20"/></svg> },
    { id: 'figma', name: 'Figma', category: 'Tools', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"/><path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"/><path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"/><path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"/><path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"/></svg> },
];

// Get tech item by ID
export function getTechById(id: string): TechItem | undefined {
    return TECH_LIBRARY.find(t => t.id === id);
}

// Group techs by category
function getCategories(): string[] {
    return [...new Set(TECH_LIBRARY.map(t => t.category))];
}

// ── Tech Picker Component (dropdown to select a tech) ──
interface TechPickerProps {
    value: string;
    onChange: (techId: string) => void;
    excludeIds?: string[];
}

export default function TechPicker({ value, onChange, excludeIds = [] }: TechPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const current = TECH_LIBRARY.find(t => t.id === value);
    const categories = getCategories();
    const filteredBySearch = TECH_LIBRARY.filter(t =>
        !excludeIds.includes(t.id) &&
        (t.name.toLowerCase().includes(search.toLowerCase()) ||
         t.category.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div ref={ref} style={{ position: 'relative', flex: 1 }}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    background: isOpen ? '#f0f4ff' : 'white',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#475569',
                    width: '100%',
                    transition: 'all 0.15s ease',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', color: '#6366f1' }}>
                    {current ? current.svg : <span style={{ width: 18, height: 18, display: 'inline-block', background: '#f1f5f9', borderRadius: '4px' }} />}
                </span>
                <span style={{ flex: 1, textAlign: 'left', fontSize: '12px' }}>{current?.name || 'Select Technology'}</span>
                <span style={{ fontSize: '8px', color: '#94a3b8' }}>▼</span>
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '240px',
                    marginTop: '4px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                    zIndex: 999,
                    overflow: 'hidden',
                }}>
                    <div style={{ padding: '8px' }}>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search tech..."
                            autoFocus
                            style={{ width: '100%', padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                        />
                    </div>
                    <div style={{ maxHeight: '250px', overflowY: 'auto', padding: '0 4px 4px' }}>
                        {categories.map(cat => {
                            const items = filteredBySearch.filter(t => t.category === cat);
                            if (items.length === 0) return null;
                            return (
                                <div key={cat}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', padding: '6px 8px 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {cat}
                                    </div>
                                    {items.map(tech => (
                                        <button
                                            key={tech.id}
                                            type="button"
                                            onClick={() => { onChange(tech.id); setIsOpen(false); setSearch(''); }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                width: '100%',
                                                padding: '5px 8px',
                                                border: value === tech.id ? '1px solid #6366f1' : '1px solid transparent',
                                                borderRadius: '6px',
                                                background: value === tech.id ? '#eef2ff' : 'transparent',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                color: value === tech.id ? '#6366f1' : '#475569',
                                                transition: 'all 0.1s ease',
                                                textAlign: 'left',
                                            }}
                                            onMouseEnter={(e) => { if (value !== tech.id) e.currentTarget.style.background = '#f8fafc'; }}
                                            onMouseLeave={(e) => { if (value !== tech.id) e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <span style={{ display: 'flex', color: '#6366f1' }}>{tech.svg}</span>
                                            <span>{tech.name}</span>
                                        </button>
                                    ))}
                                </div>
                            );
                        })}
                        {filteredBySearch.length === 0 && (
                            <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>No results</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
