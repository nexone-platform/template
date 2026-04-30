import { useState } from 'react';
import { usePageBuilderStore } from '../../store/pageBuilderStore';
import IconPicker from './IconPicker';
import TechPicker, { TECH_LIBRARY } from './TechPicker';
import ConfirmDialog from './ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import './PropertiesPanel.css';

// Human-readable type names
const typeLabels: Record<string, string> = {
    navbar: 'Navbar',
    hero: 'Hero Section',
    features: 'Features Grid',
    techstack: 'Tech Stack Marquee',
    stats: 'Stats & About',
    testimonials: 'Testimonials',
    cta: 'Call To Action',
    portfolio: 'Portfolio Grid',
    careers: 'Job Listings (งานที่เปิดรับ)',
    contactform: 'Contact Form',
    footer: 'Footer',
    heading: 'Heading',
    text: 'Text',
    button: 'Button',
    image: 'Image',
    columns: 'Columns Layout',
    spacer: 'Spacer',
    divider: 'Divider',
    video: 'Video Embed',
    alert: 'Alert / Banner',
    sociallinks: 'Social Links',
    accordion: 'Accordion / FAQ',
    whyus: 'Why Choose Us',
};

export default function PropertiesPanel() {
    const { selectedComponentId, updateComponent, deleteComponent, findComponentById,
        currentPage, selectComponent, reorderComponents } =
        usePageBuilderStore();

    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const { showToast } = useToast();

    // Deep search — finds component even inside columns containers
    const selectedComponent = selectedComponentId ? findComponentById(selectedComponentId) : null;
    const layout = currentPage?.layout || [];

    if (!selectedComponent) {
        return (
            <div className="properties-panel">
                <div className="sections-list">
                    <div className="sections-list-header">
                        <h3>Layers</h3>
                        <span className="sections-count">{layout.length}</span>
                    </div>
                    {layout.length === 0 ? (
                        <div className="panel-empty">
                            <div className="empty-icon"></div>
                            <h3>No Layers Yet</h3>
                            <p>Add components from the left panel to start building</p>
                        </div>
                    ) : (
                        <div className="sections-items">
                            {layout.map((component, index) => {
                                const label = typeLabels[component.type] || component.type;
                                const isHidden = component.props.hidden === true;
                                return (
                                    <div
                                        key={component.id}
                                        className={`section-item ${isHidden ? 'section-item-hidden' : ''}`}
                                        onClick={() => selectComponent(component.id)}
                                    >
                                        <div className="section-item-info">
                                            <span className="section-item-index">{index + 1}</span>
                                            <span className="section-item-label">{label}</span>
                                        </div>
                                        <div className="section-item-actions">
                                            <button
                                                className={`section-action-btn toggle-btn ${isHidden ? 'hidden-state' : ''}`}
                                                title={isHidden ? 'Show Section' : 'Hide Section'}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateComponent(component.id, { hidden: !isHidden });
                                                }}
                                            >
                                                {isHidden ? (
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                                        <line x1="1" y1="1" x2="23" y2="23" />
                                                    </svg>
                                                ) : (
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                )}
                                            </button>
                                            <button
                                                className="section-action-btn"
                                                title="Move Up"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (index > 0) reorderComponents(index, index - 1);
                                                }}
                                                disabled={index === 0}
                                            >▲</button>
                                            <button
                                                className="section-action-btn"
                                                title="Move Down"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (index < layout.length - 1) reorderComponents(index, index + 1);
                                                }}
                                                disabled={index === layout.length - 1}
                                            >▼</button>
                                            <button
                                                className="section-action-btn danger"
                                                title="Delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConfirmDeleteId(component.id);
                                                }}
                                            >✕</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                {/* Delete confirmation popup (sections list view) */}
                <ConfirmDialog
                    open={!!confirmDeleteId}
                    title="ลบ Component"
                    message={`คุณต้องการลบ "${confirmDeleteId ? (typeLabels[(layout.find(c => c.id === confirmDeleteId) || {type:''}).type] || 'Component') : ''}" ใช่ไหม? การดำเนินการนี้ไม่สามารถกู้คืนได้`}
                    confirmText="ยืนยันลบ"
                    cancelText="ยกเลิก"
                    variant="danger"
                    onConfirm={() => {
                        if (confirmDeleteId) {
                            deleteComponent(confirmDeleteId);
                            setConfirmDeleteId(null);
                        }
                    }}
                    onCancel={() => setConfirmDeleteId(null)}
                />
            </div>
        );
    }

    const handlePropChange = (key: string, value: any) => {
        updateComponent(selectedComponent.id, { [key]: value });
    };

    const handleDelete = () => {
        setConfirmDeleteId(selectedComponent.id);
    };

    const label = typeLabels[selectedComponent.type] || selectedComponent.type;

    return (
        <div className="properties-panel">
            <div className="panel-header">
                <div className="panel-header-left">
                    <button
                        onClick={() => selectComponent(null)}
                        className="panel-back-btn"
                        title="Back to Layers"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
                        </svg>
                    </button>
                    <h3>{label}</h3>
                </div>
                <button onClick={handleDelete} className="btn btn-sm btn-danger" title="Delete Component">
                    ✕
                </button>
            </div>

            {/* Content Properties */}
            <div className="properties-content">
                    <div className="properties-section">
                        <h4>Content Properties</h4>

                        {/* ── NAVBAR ── */}
                        {selectedComponent.type === 'navbar' && (() => {
                            const items: Array<{ label: string; href: string }> =
                                selectedComponent.props.items || [];

                            const updateItem = (idx: number, field: 'label' | 'href', val: string) => {
                                const next = items.map((it, i) =>
                                    i === idx ? { ...it, [field]: val } : it
                                );
                                handlePropChange('items', next);
                            };

                            const addItem = () =>
                                handlePropChange('items', [
                                    ...items,
                                    { label: 'เมนูใหม่', href: '#new' },
                                ]);

                            const removeItem = (idx: number) =>
                                handlePropChange('items', items.filter((_, i) => i !== idx));

                            return (
                                <>
                                    {/* Logo Icon — text/emoji or image upload */}
                                    <div className="form-group">
                                        <label>Logo Icon</label>
                                        {selectedComponent.props.logoIcon && selectedComponent.props.logoIcon.startsWith('data:') ? (
                                            <div style={{ marginBottom: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                    <div style={{
                                                        width: 40, height: 40, borderRadius: '6px', flexShrink: 0,
                                                        background: 'repeating-conic-gradient(#e2e8f0 0% 25%, transparent 0% 50%) 0 0 / 12px 12px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        <img
                                                            src={selectedComponent.props.logoIcon}
                                                            alt="Logo"
                                                            style={{ width: 40, height: 40, objectFit: 'contain' }}
                                                        />
                                                    </div>
                                                    <span style={{ flex: 1, fontSize: '0.8rem', color: '#64748b' }}>รูปภาพ Logo</span>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handlePropChange('logoIcon', '')}
                                                        style={{ fontSize: '11px', padding: '2px 8px' }}
                                                        title="ลบรูปภาพ"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={selectedComponent.props.logoIcon || '✨'}
                                                onChange={(e) => handlePropChange('logoIcon', e.target.value)}
                                                className="form-control"
                                                placeholder="TBC หรือ ✨"
                                            />
                                        )}
                                        <div style={{ marginTop: '6px' }}>
                                            <label
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                    padding: '5px 12px', background: '#f0f7ff', border: '1px dashed #93c5fd',
                                                    borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', color: '#3b82f6',
                                                    transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={e => { (e.target as HTMLElement).style.background = '#dbeafe'; }}
                                                onMouseLeave={e => { (e.target as HTMLElement).style.background = '#f0f7ff'; }}
                                            >
                                                Upload
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        if (file.size > 500 * 1024) {
                                                            showToast('ไฟล์ใหญ่เกิน 500KB กรุณาเลือกไฟล์ที่เล็กกว่า', 'warning');
                                                            return;
                                                        }
                                                        const reader = new FileReader();
                                                        reader.onload = (ev) => {
                                                            const dataUrl = ev.target?.result as string;
                                                            // Process image: remove white background → transparent PNG
                                                            const img = new window.Image();
                                                            img.onload = () => {
                                                                const canvas = document.createElement('canvas');
                                                                canvas.width = img.width;
                                                                canvas.height = img.height;
                                                                const ctx = canvas.getContext('2d');
                                                                if (!ctx) {
                                                                    handlePropChange('logoIcon', dataUrl);
                                                                    return;
                                                                }
                                                                ctx.drawImage(img, 0, 0);
                                                                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                                                                const data = imageData.data;
                                                                // Threshold: pixels with R,G,B all > 230 are considered "white bg"
                                                                const threshold = 230;
                                                                for (let i = 0; i < data.length; i += 4) {
                                                                    const r = data[i], g = data[i + 1], b = data[i + 2];
                                                                    if (r > threshold && g > threshold && b > threshold) {
                                                                        data[i + 3] = 0; // set alpha to 0 (transparent)
                                                                    }
                                                                }
                                                                ctx.putImageData(imageData, 0, 0);
                                                                const pngUrl = canvas.toDataURL('image/png');
                                                                handlePropChange('logoIcon', pngUrl);
                                                            };
                                                            img.onerror = () => {
                                                                // Fallback: use original if processing fails
                                                                handlePropChange('logoIcon', dataUrl);
                                                            };
                                                            img.src = dataUrl;
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }}
                                                />
                                            </label>
                                            <small style={{ display: 'block', marginTop: '4px', color: '#94a3b8', fontSize: '0.75rem' }}>
                                                PNG, JPG, SVG (สูงสุด 500KB) — พื้นหลังสีขาวจะถูกลบอัตโนมัติ
                                            </small>
                                        </div>
                                    </div>

                                    {/* Logo Text */}
                                    <div className="form-group">
                                        <label>Logo Text</label>
                                        <input
                                            type="text"
                                            value={selectedComponent.props.logo || ''}
                                            onChange={(e) => handlePropChange('logo', e.target.value)}
                                            className="form-control"
                                            placeholder="TechBiz"
                                        />
                                    </div>

                                    {/* Nav Items */}
                                    <div className="form-group">
                                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>เมนู ({items.length} รายการ)</span>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={addItem}
                                                style={{ fontSize: '11px', padding: '2px 8px' }}
                                            >
                                                + เพิ่ม
                                            </button>
                                        </label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                                            {items.map((item, idx) => (
                                                <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <input
                                                            type="text"
                                                            value={item.label}
                                                            onChange={(e) => updateItem(idx, 'label', e.target.value)}
                                                            className="form-control"
                                                            placeholder="ชื่อเมนู"
                                                            style={{ fontSize: '12px', padding: '4px 8px' }}
                                                        />
                                                        <input
                                                            type="text"
                                                            value={item.href}
                                                            onChange={(e) => updateItem(idx, 'href', e.target.value)}
                                                            className="form-control"
                                                            placeholder="#section"
                                                            style={{ fontSize: '11px', padding: '3px 8px', color: '#6b7280' }}
                                                        />
                                                    </div>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => removeItem(idx)}
                                                        style={{ fontSize: '11px', padding: '2px 6px', alignSelf: 'flex-start' }}
                                                        title="ลบเมนูนี้"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sticky toggle */}
                                    <div className="form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedComponent.props.sticky !== false}
                                                onChange={(e) => handlePropChange('sticky', e.target.checked)}
                                            />
                                            Fixed (ติดด้านบนเมื่อ scroll)
                                        </label>
                                    </div>
                                </>
                            );
                        })()}

                        {/* ── HERO (Multi-Slide) ── */}
                        {selectedComponent.type === 'hero' && (() => {
                            const slides: Array<{
                                title?: string; subtitle?: string; buttonText?: string;
                                buttonLink?: string; backgroundImage?: string; badge?: string;
                            }> = selectedComponent.props.slides || [{
                                title: selectedComponent.props.title || '',
                                subtitle: selectedComponent.props.subtitle || '',
                                buttonText: selectedComponent.props.buttonText || '',
                                buttonLink: '#contact',
                                backgroundImage: selectedComponent.props.backgroundImage || '',
                                badge: '⚡ Innovation · Technology · Growth',
                            }];

                            const updateSlide = (idx: number, field: string, val: string) => {
                                const next = slides.map((s, i) => i === idx ? { ...s, [field]: val } : s);
                                handlePropChange('slides', next);
                            };

                            const addSlide = () => {
                                handlePropChange('slides', [
                                    ...slides,
                                    {
                                        title: 'หัวข้อ Slide ใหม่\nข้อความรอง',
                                        subtitle: 'รายละเอียดเพิ่มเติม...',
                                        buttonText: 'เริ่มต้นกับเรา',
                                        buttonLink: '#contact',
                                        backgroundImage: '',
                                        badge: '⚡ Innovation · Technology · Growth',
                                    },
                                ]);
                            };

                            const removeSlide = (idx: number) => {
                                if (slides.length <= 1) return;
                                handlePropChange('slides', slides.filter((_, i) => i !== idx));
                            };

                            return (
                                <>
                                    {/* ── 🎨 Hero Template ── */}
                                    <div style={{ marginBottom: '16px', padding: '10px', background: 'var(--color-surface-secondary)', borderRadius: '8px', border: '1px solid var(--color-surface-border)' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🎨 Hero Template</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                                            {([
                                                { id: 'default', label: 'Split', desc: 'ซ้าย-ขวา' },
                                                { id: 'centered', label: 'Center', desc: 'กึ่งกลาง' },
                                                { id: 'minimal', label: 'Minimal', desc: 'เรียบง่าย' },
                                                { id: 'fullwidth', label: 'Full BG', desc: 'ภาพเต็มพื้นหลัง' },
                                                { id: 'imageLeft', label: 'Image Left', desc: 'ภาพซ้าย' },
                                                { id: 'wave', label: 'Wave', desc: 'คลื่นด้านล่าง' },
                                            ] as const).map((t) => {
                                                const isActive = (selectedComponent.props.heroVariant || 'default') === t.id;
                                                return (
                                                    <button
                                                        key={t.id}
                                                        onClick={() => handlePropChange('heroVariant', t.id)}
                                                        title={t.desc}
                                                        style={{
                                                            padding: '8px 4px 6px',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.6rem',
                                                            fontWeight: 600,
                                                            textAlign: 'center',
                                                            background: isActive ? 'var(--theme-primary, #4a90e2)' : 'var(--color-surface-primary, #fff)',
                                                            color: isActive ? '#fff' : 'var(--color-text-secondary)',
                                                            border: isActive ? '2px solid var(--theme-primary, #4a90e2)' : '1px solid var(--color-surface-border, #e2e8f0)',
                                                            transition: 'all 0.2s ease',
                                                        }}
                                                    >
                                                        {/* Mini layout preview */}
                                                        <div style={{
                                                            width: '100%', height: '32px',
                                                            marginBottom: '4px',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px',
                                                            borderRadius: '4px',
                                                            background: isActive ? 'rgba(255,255,255,0.15)' : '#f1f5f9',
                                                            overflow: 'hidden', position: 'relative',
                                                        }}>
                                                            {t.id === 'default' && <>
                                                                <div style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '4px' }}>
                                                                    <div style={{ width: '70%', height: '3px', borderRadius: '1px', background: isActive ? '#fff' : '#94a3b8' }} />
                                                                    <div style={{ width: '100%', height: '2px', borderRadius: '1px', background: isActive ? 'rgba(255,255,255,0.5)' : '#cbd5e1' }} />
                                                                    <div style={{ width: '40%', height: '4px', borderRadius: '2px', background: isActive ? '#fff' : '#4a90e2', marginTop: '2px' }} />
                                                                </div>
                                                                <div style={{ width: '40%', height: '24px', borderRadius: '3px', background: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0' }} />
                                                            </>}
                                                            {t.id === 'centered' && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                                <div style={{ width: '20px', height: '3px', borderRadius: '1px', background: isActive ? '#fff' : '#94a3b8' }} />
                                                                <div style={{ width: '34px', height: '2px', borderRadius: '1px', background: isActive ? 'rgba(255,255,255,0.5)' : '#cbd5e1' }} />
                                                                <div style={{ width: '16px', height: '4px', borderRadius: '2px', background: isActive ? '#fff' : '#4a90e2', marginTop: '2px' }} />
                                                            </div>}
                                                            {t.id === 'minimal' && <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '6px', width: '100%' }}>
                                                                <div style={{ width: '50%', height: '3px', borderRadius: '1px', background: isActive ? '#fff' : '#94a3b8' }} />
                                                                <div style={{ width: '70%', height: '2px', borderRadius: '1px', background: isActive ? 'rgba(255,255,255,0.4)' : '#cbd5e1' }} />
                                                            </div>}
                                                            {t.id === 'fullwidth' && <>
                                                                <div style={{ position: 'absolute', inset: 0, background: isActive ? 'rgba(255,255,255,0.1)' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#fff' : '#94a3b8'} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/></svg>
                                                                </div>
                                                                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', zIndex: 1 }}>
                                                                    <div style={{ width: '22px', height: '3px', borderRadius: '1px', background: isActive ? '#fff' : '#64748b' }} />
                                                                    <div style={{ width: '14px', height: '4px', borderRadius: '2px', background: isActive ? '#fff' : '#4a90e2', marginTop: '1px' }} />
                                                                </div>
                                                            </>}
                                                            {t.id === 'imageLeft' && <>
                                                                <div style={{ width: '40%', height: '24px', borderRadius: '3px', background: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0' }} />
                                                                <div style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: '4px' }}>
                                                                    <div style={{ width: '70%', height: '3px', borderRadius: '1px', background: isActive ? '#fff' : '#94a3b8' }} />
                                                                    <div style={{ width: '100%', height: '2px', borderRadius: '1px', background: isActive ? 'rgba(255,255,255,0.5)' : '#cbd5e1' }} />
                                                                    <div style={{ width: '40%', height: '4px', borderRadius: '2px', background: isActive ? '#fff' : '#4a90e2', marginTop: '2px' }} />
                                                                </div>
                                                            </>}
                                                            {t.id === 'wave' && <>
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                                    <div style={{ width: '20px', height: '3px', borderRadius: '1px', background: isActive ? '#fff' : '#94a3b8' }} />
                                                                    <div style={{ width: '30px', height: '2px', borderRadius: '1px', background: isActive ? 'rgba(255,255,255,0.5)' : '#cbd5e1' }} />
                                                                </div>
                                                                <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }} height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
                                                                    <path d="M0 6 Q25 0 50 4 Q75 8 100 2 L100 6 Z" fill={isActive ? 'rgba(255,255,255,0.3)' : '#e2e8f0'} />
                                                                </svg>
                                                            </>}
                                                        </div>
                                                        {t.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* ── Style Controls ── */}
                                    <div style={{ marginBottom: '16px', padding: '10px', background: 'var(--color-surface-secondary)', borderRadius: '8px', border: '1px solid var(--color-surface-border)' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚙️ Style Controls</div>
                                        <div className="form-group" style={{ marginBottom: '8px' }}>
                                            <label>Overlay Opacity</label>
                                            <input
                                                type="range"
                                                min="0" max="100" step="5"
                                                value={selectedComponent.props.overlayOpacity ?? 60}
                                                onChange={(e) => handlePropChange('overlayOpacity', parseInt(e.target.value))}
                                                style={{ width: '100%' }}
                                            />
                                            <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{selectedComponent.props.overlayOpacity ?? 60}%</small>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '0' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedComponent.props.showStats !== false}
                                                    onChange={(e) => handlePropChange('showStats', e.target.checked)}
                                                />
                                                แสดงตัวเลขสถิติ
                                            </label>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>Slides ({slides.length} รายการ)</span>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={addSlide}
                                                style={{ fontSize: '11px', padding: '2px 8px' }}
                                            >
                                                + เพิ่ม Slide
                                            </button>
                                        </label>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {slides.map((slide, idx) => (
                                            <div key={idx} style={{
                                                background: '#f8faff', padding: '10px', borderRadius: '10px',
                                                border: '1px solid #e5e7eb',
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4a90e2' }}>
                                                        Slide #{idx + 1}
                                                    </span>
                                                    {slides.length > 1 && (
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => removeSlide(idx)}
                                                            style={{ fontSize: '10px', padding: '1px 6px' }}
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Title (ใช้ \n ขึ้นบรรทัดใหม่)</label>
                                                        <textarea
                                                            value={slide.title || ''}
                                                            onChange={(e) => updateSlide(idx, 'title', e.target.value)}
                                                            className="form-control"
                                                            rows={2}
                                                            placeholder="หัวข้อ Slide"
                                                            style={{ fontSize: '12px', padding: '4px 8px' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Subtitle</label>
                                                        <textarea
                                                            value={slide.subtitle || ''}
                                                            onChange={(e) => updateSlide(idx, 'subtitle', e.target.value)}
                                                            className="form-control"
                                                            rows={2}
                                                            placeholder="ข้อความรอง"
                                                            style={{ fontSize: '11px', padding: '4px 8px' }}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Button Text</label>
                                                            <input
                                                                type="text"
                                                                value={slide.buttonText || ''}
                                                                onChange={(e) => updateSlide(idx, 'buttonText', e.target.value)}
                                                                className="form-control"
                                                                placeholder="เริ่มต้นกับเรา"
                                                                style={{ fontSize: '11px', padding: '3px 6px' }}
                                                            />
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Button Link</label>
                                                            <input
                                                                type="text"
                                                                value={slide.buttonLink || '#contact'}
                                                                onChange={(e) => updateSlide(idx, 'buttonLink', e.target.value)}
                                                                className="form-control"
                                                                placeholder="#contact"
                                                                style={{ fontSize: '11px', padding: '3px 6px' }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Badge Text</label>
                                                        <input
                                                            type="text"
                                                            value={slide.badge || ''}
                                                            onChange={(e) => updateSlide(idx, 'badge', e.target.value)}
                                                            className="form-control"
                                                            placeholder="⚡ Innovation · Technology · Growth"
                                                            style={{ fontSize: '11px', padding: '3px 6px' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>รูปภาพ (ฝั่งขวา)</label>
                                                        {slide.backgroundImage && (
                                                            <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <img src={slide.backgroundImage} alt="" style={{ width: 50, height: 36, objectFit: 'cover', borderRadius: '6px' }} />
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => updateSlide(idx, 'backgroundImage', '')}
                                                                    style={{ fontSize: '10px', padding: '1px 6px' }}
                                                                >
                                                                    ✕ ลบรูป
                                                                </button>
                                                            </div>
                                                        )}
                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                            <input
                                                                type="text"
                                                                value={slide.backgroundImage || ''}
                                                                onChange={(e) => updateSlide(idx, 'backgroundImage', e.target.value)}
                                                                className="form-control"
                                                                placeholder="URL รูปภาพ หรือ อัปโหลด →"
                                                                style={{ flex: 1, fontSize: '10px', padding: '3px 6px' }}
                                                            />
                                                            <label style={{
                                                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                                padding: '3px 8px', background: '#f0f7ff', border: '1px dashed #93c5fd',
                                                                borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem', color: '#3b82f6',
                                                                whiteSpace: 'nowrap', transition: 'all 0.2s',
                                                            }}>
                                                                📁
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    style={{ display: 'none' }}
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (!file) return;
                                                                        if (file.size > 2 * 1024 * 1024) {
                                                                            showToast('ไฟล์ใหญ่เกิน 2MB', 'warning');
                                                                            return;
                                                                        }
                                                                        const reader = new FileReader();
                                                                        reader.onload = (ev) => {
                                                                            updateSlide(idx, 'backgroundImage', ev.target?.result as string);
                                                                        };
                                                                        reader.readAsDataURL(file);
                                                                    }}
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="form-group" style={{ marginTop: '8px' }}>
                                        <label>Auto-Play Interval (ms)</label>
                                        <input
                                            type="number"
                                            value={selectedComponent.props.autoPlayInterval || 6000}
                                            onChange={(e) => handlePropChange('autoPlayInterval', parseInt(e.target.value) || 6000)}
                                            className="form-control"
                                            min={2000}
                                            step={500}
                                            placeholder="6000"
                                        />
                                        <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                                            ระยะเวลาสไลด์อัตโนมัติ (มิลลิวินาที) — 6000 = 6 วินาที
                                        </small>
                                    </div>
                                </>
                            );
                        })()}

                        {/* ── CTA ── */}
                        {selectedComponent.type === 'cta' && (
                            <>
                                {/* ── 🎨 CTA Template ── */}
                                <div style={{ marginBottom: '16px', padding: '10px', background: 'var(--color-surface-secondary)', borderRadius: '8px', border: '1px solid var(--color-surface-border)' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🎨 CTA Template</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                                        {([{ id: 'default', label: 'Gradient' }, { id: 'minimal', label: 'Minimal' }, { id: 'boxed', label: 'Boxed' }] as const).map((t) => {
                                            const isA = (selectedComponent.props.ctaVariant || 'default') === t.id;
                                            return (
                                                <button key={t.id} onClick={() => handlePropChange('ctaVariant', t.id)} style={{ padding: '8px 4px 6px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.6rem', fontWeight: 600, textAlign: 'center', background: isA ? 'var(--theme-primary, #4a90e2)' : 'var(--color-surface-primary, #fff)', color: isA ? '#fff' : 'var(--color-text-secondary)', border: isA ? '2px solid var(--theme-primary, #4a90e2)' : '1px solid var(--color-surface-border, #e2e8f0)', transition: 'all 0.2s ease' }}>
                                                    <div style={{ width: '100%', height: '28px', marginBottom: '4px', borderRadius: '4px', background: isA ? 'rgba(255,255,255,0.15)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                        {t.id === 'default' && <div style={{ width: '80%', height: '100%', borderRadius: '4px', background: isA ? 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))' : 'linear-gradient(135deg, #4a90e2, #7c3aed)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}><div style={{ width: '50%', height: '3px', borderRadius: '1px', background: '#fff' }} /><div style={{ width: '30%', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.7)', marginTop: '1px' }} /></div>}
                                                        {t.id === 'minimal' && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}><div style={{ width: '30px', height: '3px', borderRadius: '1px', background: isA ? '#fff' : '#94a3b8' }} /><div style={{ width: '18px', height: '4px', borderRadius: '2px', background: isA ? '#fff' : '#4a90e2', marginTop: '2px' }} /></div>}
                                                        {t.id === 'boxed' && <div style={{ width: '70%', height: '20px', borderRadius: '4px', border: `1.5px solid ${isA ? '#fff' : '#94a3b8'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1px' }}><div style={{ width: '50%', height: '2px', borderRadius: '1px', background: isA ? '#fff' : '#94a3b8' }} /><div style={{ width: '30%', height: '3px', borderRadius: '1px', background: isA ? '#fff' : '#4a90e2', marginTop: '1px' }} /></div>}
                                                    </div>
                                                    {t.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Title (ใส่ \n เพื่อขึ้นบรรทัดใหม่)</label>
                                    <textarea
                                        value={selectedComponent.props.title || ''}
                                        onChange={(e) => handlePropChange('title', e.target.value)}
                                        rows={2}
                                        placeholder="พร้อมเริ่มต้นแล้วหรือยัง?\nติดต่อเราวันนี้"
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Subtitle</label>
                                    <textarea
                                        value={selectedComponent.props.subtitle || ''}
                                        onChange={(e) => handlePropChange('subtitle', e.target.value)}
                                        rows={3}
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>ข้อความปุ่มหลัก</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.primaryText || ''}
                                        onChange={(e) => handlePropChange('primaryText', e.target.value)}
                                        className="form-control"
                                        placeholder="ปรึกษาผู้เชี่ยวชาญฟรี"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Link ปุ่มหลัก</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.primaryLink || '#contact'}
                                        onChange={(e) => handlePropChange('primaryLink', e.target.value)}
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>ข้อความปุ่มรอง</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.secondaryText || ''}
                                        onChange={(e) => handlePropChange('secondaryText', e.target.value)}
                                        className="form-control"
                                        placeholder="ดูผลงานของเรา"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Link ปุ่มรอง</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.secondaryLink || '#portfolio'}
                                        onChange={(e) => handlePropChange('secondaryLink', e.target.value)}
                                        className="form-control"
                                    />
                                </div>

                                {/* Text Colors */}
                                <div style={{ marginTop: '12px', padding: '10px', background: '#fefce8', borderRadius: '8px', border: '1px solid #fde68a' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Text Colors</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                        <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '80px' }}>Title</label>
                                        <input type="color" value={selectedComponent.props.titleColor || '#ffffff'} onChange={(e) => handlePropChange('titleColor', e.target.value)} style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                        <input type="text" value={selectedComponent.props.titleColor || ''} onChange={(e) => handlePropChange('titleColor', e.target.value)} className="form-control" style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }} placeholder="#ffffff" />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                        <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '80px' }}>Subtitle</label>
                                        <input type="color" value={selectedComponent.props.subtitleColor || '#ffffffbf'} onChange={(e) => handlePropChange('subtitleColor', e.target.value)} style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                        <input type="text" value={selectedComponent.props.subtitleColor || ''} onChange={(e) => handlePropChange('subtitleColor', e.target.value)} className="form-control" style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }} placeholder="#ffffffbf" />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '80px' }}>Badge</label>
                                        <input type="color" value={selectedComponent.props.badgeColor || '#ffffff99'} onChange={(e) => handlePropChange('badgeColor', e.target.value)} style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                        <input type="text" value={selectedComponent.props.badgeColor || ''} onChange={(e) => handlePropChange('badgeColor', e.target.value)} className="form-control" style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }} placeholder="#ffffff99" />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── PORTFOLIO ── */}
                        {selectedComponent.type === 'portfolio' && (
                            <>
                                {/* ── 🎨 Portfolio Template ── */}
                                <div style={{ marginBottom: '16px', padding: '10px', background: 'var(--color-surface-secondary)', borderRadius: '8px', border: '1px solid var(--color-surface-border)' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🎨 Portfolio Template</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '10px' }}>
                                        {([{ id: 'default', label: 'Grid' }, { id: 'masonry', label: 'Masonry' }, { id: 'carousel', label: 'Carousel' }] as const).map((t) => {
                                            const isA = (selectedComponent.props.portfolioVariant || 'default') === t.id;
                                            return (
                                                <button key={t.id} onClick={() => handlePropChange('portfolioVariant', t.id)} style={{ padding: '8px 4px 6px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.6rem', fontWeight: 600, textAlign: 'center', background: isA ? 'var(--theme-primary, #4a90e2)' : 'var(--color-surface-primary, #fff)', color: isA ? '#fff' : 'var(--color-text-secondary)', border: isA ? '2px solid var(--theme-primary, #4a90e2)' : '1px solid var(--color-surface-border, #e2e8f0)', transition: 'all 0.2s ease' }}>
                                                    <div style={{ width: '100%', height: '28px', marginBottom: '4px', borderRadius: '4px', background: isA ? 'rgba(255,255,255,0.15)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', padding: '4px' }}>
                                                        {t.id === 'default' && <>{[1,2,3].map(i => <div key={i} style={{ width: '30%', height: '18px', borderRadius: '2px', background: isA ? 'rgba(255,255,255,0.3)' : '#e2e8f0' }} />)}</>}
                                                        {t.id === 'masonry' && <div style={{ display: 'flex', gap: '2px', width: '100%', height: '100%' }}><div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}><div style={{ height: '55%', borderRadius: '2px', background: isA ? 'rgba(255,255,255,0.3)' : '#e2e8f0' }} /><div style={{ flex: 1, borderRadius: '2px', background: isA ? 'rgba(255,255,255,0.2)' : '#d1d5db' }} /></div><div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}><div style={{ height: '40%', borderRadius: '2px', background: isA ? 'rgba(255,255,255,0.2)' : '#d1d5db' }} /><div style={{ flex: 1, borderRadius: '2px', background: isA ? 'rgba(255,255,255,0.3)' : '#e2e8f0' }} /></div></div>}
                                                        {t.id === 'carousel' && <div style={{ display: 'flex', alignItems: 'center', gap: '2px', width: '100%' }}><div style={{ fontSize: '8px', color: isA ? '#fff' : '#94a3b8' }}>‹</div><div style={{ flex: 1, height: '18px', borderRadius: '2px', background: isA ? 'rgba(255,255,255,0.3)' : '#e2e8f0' }} /><div style={{ fontSize: '8px', color: isA ? '#fff' : '#94a3b8' }}>›</div></div>}
                                                    </div>
                                                    {t.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '0' }}>
                                        <label>Columns</label>
                                        <select value={selectedComponent.props.portfolioColumns || '3'} onChange={(e) => handlePropChange('portfolioColumns', e.target.value)} className="form-control">
                                            <option value="2">2 คอลัมน์</option>
                                            <option value="3">3 คอลัมน์</option>
                                            <option value="4">4 คอลัมน์</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Badge Text</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.badge || ''}
                                        onChange={(e) => handlePropChange('badge', e.target.value)}
                                        className="form-control"
                                        placeholder="Portfolio"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Section Title</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.title || ''}
                                        onChange={(e) => handlePropChange('title', e.target.value)}
                                        className="form-control"
                                        placeholder="ผลงานของเรา"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Section Subtitle</label>
                                    <textarea
                                        value={selectedComponent.props.subtitle || ''}
                                        onChange={(e) => handlePropChange('subtitle', e.target.value)}
                                        rows={2}
                                        className="form-control"
                                        placeholder="โปรเจกต์ที่เราภูมิใจ..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>CTA Button Text</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.ctaText || ''}
                                        onChange={(e) => handlePropChange('ctaText', e.target.value)}
                                        className="form-control"
                                        placeholder="เริ่มโปรเจกต์กับเรา"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>CTA Link</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.ctaLink || '/contact'}
                                        onChange={(e) => handlePropChange('ctaLink', e.target.value)}
                                        className="form-control"
                                        placeholder="/contact"
                                    />
                                </div>
                                <div style={{ padding: '10px', background: '#f0f7ff', borderRadius: '8px', fontSize: '0.8rem', color: '#4a6fa5' }}>
                                    💡 รายการโปรเจกต์ถูกกำหนดไว้ใน Portfolio.tsx
                                </div>
                            </>
                        )}

                        {/* ── CONTACT FORM ── */}
                        {selectedComponent.type === 'contactform' && (
                            <>
                                <div className="form-group">
                                    <label>Section Title</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.title || ''}
                                        onChange={(e) => handlePropChange('title', e.target.value)}
                                        className="form-control"
                                        placeholder="ติดต่อเรา"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Section Subtitle</label>
                                    <textarea
                                        value={selectedComponent.props.subtitle || ''}
                                        onChange={(e) => handlePropChange('subtitle', e.target.value)}
                                        rows={2}
                                        className="form-control"
                                        placeholder="พร้อมให้คำปรึกษาทุกวัน..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>อีเมลติดต่อ</label>
                                    <input
                                        type="email"
                                        value={selectedComponent.props.email || ''}
                                        onChange={(e) => handlePropChange('email', e.target.value)}
                                        className="form-control"
                                        placeholder="hello@techbiz.co.th"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>เบอร์โทรศัพท์หลัก</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.phone || ''}
                                        onChange={(e) => handlePropChange('phone', e.target.value)}
                                        className="form-control"
                                        placeholder="061-789-4422"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>เบอร์โทรศัพท์รอง</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.phone2 || ''}
                                        onChange={(e) => handlePropChange('phone2', e.target.value)}
                                        className="form-control"
                                        placeholder="083-289-3156"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>LINE ID</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.lineId || ''}
                                        onChange={(e) => handlePropChange('lineId', e.target.value)}
                                        className="form-control"
                                        placeholder="hr_tb"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>อีเมล HR / สมัครงาน</label>
                                    <input
                                        type="email"
                                        value={selectedComponent.props.hrEmail || ''}
                                        onChange={(e) => handlePropChange('hrEmail', e.target.value)}
                                        className="form-control"
                                        placeholder="hr@techbizconvergence.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>ชื่อบริษัท</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.companyName || ''}
                                        onChange={(e) => handlePropChange('companyName', e.target.value)}
                                        className="form-control"
                                        placeholder="บริษัท เทค บิซ คอนเวอร์เจนซ์ จำกัด"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>เวลาทำการ</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.officeHours || ''}
                                        onChange={(e) => handlePropChange('officeHours', e.target.value)}
                                        className="form-control"
                                        placeholder="จันทร์ – ศุกร์ 09:00 – 18:00 น."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>ที่อยู่</label>
                                    <textarea
                                        value={selectedComponent.props.address || ''}
                                        onChange={(e) => handlePropChange('address', e.target.value)}
                                        rows={2}
                                        className="form-control"
                                        placeholder="326/224 หมู่ 6 ต.ทุ่งสุขลา อ.ศรีราชา จ.ชลบุรี 20230"
                                    />
                                </div>

                                {/* Office Info */}
                                <div style={{ marginTop: '12px', padding: '10px', background: '#f0f7ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Office Location</div>
                                    <div className="form-group" style={{ marginBottom: '6px' }}>
                                        <label style={{ fontSize: '0.7rem' }}>ชื่อสำนักงาน</label>
                                        <input
                                            type="text"
                                            value={selectedComponent.props.officeName || ''}
                                            onChange={(e) => handlePropChange('officeName', e.target.value)}
                                            className="form-control"
                                            placeholder="สำนักงานใหญ่"
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '6px' }}>
                                        <label style={{ fontSize: '0.7rem' }}>เบอร์โทรสำนักงาน</label>
                                        <input
                                            type="text"
                                            value={selectedComponent.props.officePhone || ''}
                                            onChange={(e) => handlePropChange('officePhone', e.target.value)}
                                            className="form-control"
                                            placeholder="061-789-4422"
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '0' }}>
                                        <label style={{ fontSize: '0.7rem' }}>Google Maps URL</label>
                                        <input
                                            type="url"
                                            value={selectedComponent.props.officeMapUrl || ''}
                                            onChange={(e) => handlePropChange('officeMapUrl', e.target.value)}
                                            className="form-control"
                                            placeholder="https://maps.google.com/?q=..."
                                        />
                                    </div>
                                </div>

                                {/* Text Colors */}
                                <div style={{ marginTop: '12px', padding: '10px', background: '#fefce8', borderRadius: '8px', border: '1px solid #fde68a' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Text Colors</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                        <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '80px' }}>Title</label>
                                        <input type="color" value={selectedComponent.props.titleColor || '#1e293b'} onChange={(e) => handlePropChange('titleColor', e.target.value)} style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                        <input type="text" value={selectedComponent.props.titleColor || ''} onChange={(e) => handlePropChange('titleColor', e.target.value)} className="form-control" style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }} placeholder="#1e293b" />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                        <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '80px' }}>Subtitle</label>
                                        <input type="color" value={selectedComponent.props.subtitleColor || '#64748b'} onChange={(e) => handlePropChange('subtitleColor', e.target.value)} style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                        <input type="text" value={selectedComponent.props.subtitleColor || ''} onChange={(e) => handlePropChange('subtitleColor', e.target.value)} className="form-control" style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }} placeholder="#64748b" />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '80px' }}>Label</label>
                                        <input type="color" value={selectedComponent.props.labelColor || '#94a3b8'} onChange={(e) => handlePropChange('labelColor', e.target.value)} style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                        <input type="text" value={selectedComponent.props.labelColor || ''} onChange={(e) => handlePropChange('labelColor', e.target.value)} className="form-control" style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }} placeholder="#94a3b8" />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── CAREERS ── */}
                        {selectedComponent.type === 'careers' && (() => {
                            const sectionTitle = selectedComponent.props.sectionTitle || 'งานที่เปิดรับ';
                            const sectionSubtitle = selectedComponent.props.sectionSubtitle || '';
                            return (
                                <>
                                    <div className="form-group">
                                        <label>Section Title</label>
                                        <input
                                            type="text"
                                            value={sectionTitle}
                                            onChange={(e) => handlePropChange('sectionTitle', e.target.value)}
                                            className="form-control"
                                            placeholder="งานที่เปิดรับ"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Section Subtitle</label>
                                        <textarea
                                            value={sectionSubtitle}
                                            onChange={(e) => handlePropChange('sectionSubtitle', e.target.value)}
                                            rows={2}
                                            className="form-control"
                                            placeholder="ร่วมเป็นส่วนหนึ่งของทีม..."
                                        />
                                    </div>
                                    <div style={{ padding: '10px', background: '#f0f7ff', borderRadius: '8px', fontSize: '0.8rem', color: '#4a6fa5' }}>
                                        Note: รายการตำแหน่งงานดึงจาก Database โดยตรง<br />
                                        จัดการผ่าน API <code style={{ background: '#e0eaff', borderRadius: 4, padding: '1px 6px' }}>/api/jobs</code>
                                    </div>
                                </>
                            );
                        })()}

                        {/* ── STATS & ABOUT ── */}
                        {selectedComponent.type === 'stats' && (() => {
                            // Style block rendered inside return
                            const statsItems: Array<{ label: string; value: string; suffix?: string }> =
                                selectedComponent.props.statsItems || [
                                    { label: 'ปีแห่งประสบการณ์', value: '10', suffix: '+' },
                                    { label: 'โปรเจกต์สำเร็จ', value: '200', suffix: '+' },
                                    { label: 'ลูกค้าที่วางใจ', value: '50', suffix: '+' },
                                    { label: 'ทีมผู้เชี่ยวชาญ', value: '30', suffix: '+' },
                                ];
                            const addStat = () => handlePropChange('statsItems', [
                                ...statsItems,
                                { label: 'รายการใหม่', value: '0', suffix: '+' },
                            ]);
                            const updateStat = (idx: number, field: string, val: string) => {
                                const next = statsItems.map((it, i) => i === idx ? { ...it, [field]: val } : it);
                                handlePropChange('statsItems', next);
                            };
                            const removeStat = (idx: number) =>
                                handlePropChange('statsItems', statsItems.filter((_, i) => i !== idx));

                            return (
                                <>
                                    {/* ── 🎨 Stats Template ── */}
                                    <div style={{ marginBottom: '16px', padding: '10px', background: 'var(--color-surface-secondary)', borderRadius: '8px', border: '1px solid var(--color-surface-border)' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🎨 Stats Template</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                                            {([{ id: 'default', label: 'Default' }, { id: 'cards', label: 'Cards' }, { id: 'inline', label: 'Inline' }] as const).map((t) => {
                                                const isA = (selectedComponent.props.statsVariant || 'default') === t.id;
                                                return (
                                                    <button key={t.id} onClick={() => handlePropChange('statsVariant', t.id)} style={{ padding: '8px 4px 6px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.6rem', fontWeight: 600, textAlign: 'center', background: isA ? 'var(--theme-primary, #4a90e2)' : 'var(--color-surface-primary, #fff)', color: isA ? '#fff' : 'var(--color-text-secondary)', border: isA ? '2px solid var(--theme-primary, #4a90e2)' : '1px solid var(--color-surface-border, #e2e8f0)', transition: 'all 0.2s ease' }}>
                                                        <div style={{ width: '100%', height: '28px', marginBottom: '4px', borderRadius: '4px', background: isA ? 'rgba(255,255,255,0.15)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', padding: '4px' }}>
                                                            {t.id === 'default' && <>{[1,2,3].map(i => <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}><div style={{ width: '14px', height: '6px', borderRadius: '1px', background: isA ? '#fff' : '#94a3b8', fontWeight: 800 }} /><div style={{ width: '10px', height: '2px', borderRadius: '1px', background: isA ? 'rgba(255,255,255,0.5)' : '#cbd5e1' }} /></div>)}</>}
                                                            {t.id === 'cards' && <>{[1,2,3].map(i => <div key={i} style={{ width: '28%', height: '18px', borderRadius: '3px', border: `1px solid ${isA ? 'rgba(255,255,255,0.4)' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '8px', height: '4px', borderRadius: '1px', background: isA ? '#fff' : '#94a3b8' }} /></div>)}</>}
                                                            {t.id === 'inline' && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'center' }}>{[1,2,3].map(i => <><div key={`v${i}`} style={{ width: '12px', height: '6px', borderRadius: '1px', background: isA ? '#fff' : '#94a3b8' }} />{i < 3 && <div style={{ width: '1px', height: '10px', background: isA ? 'rgba(255,255,255,0.3)' : '#e2e8f0' }} />}</>)}</div>}
                                                        </div>
                                                        {t.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Section Title</label>
                                        <input
                                            type="text"
                                            value={selectedComponent.props.title || ''}
                                            onChange={(e) => handlePropChange('title', e.target.value)}
                                            className="form-control"
                                            placeholder="เกี่ยวกับเรา"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Section Subtitle</label>
                                        <textarea
                                            value={selectedComponent.props.subtitle || ''}
                                            onChange={(e) => handlePropChange('subtitle', e.target.value)}
                                            rows={3}
                                            className="form-control"
                                            placeholder="บริษัทชั้นนำด้าน IT..."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>About Description</label>
                                        <textarea
                                            value={selectedComponent.props.aboutDescription || ''}
                                            onChange={(e) => handlePropChange('aboutDescription', e.target.value)}
                                            rows={4}
                                            className="form-control"
                                            placeholder="รายละเอียดเกี่ยวกับบริษัท..."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>ตัวเลขสถิติ ({statsItems.length})</span>
                                            <button className="btn btn-sm btn-primary" onClick={addStat} style={{ fontSize: '11px', padding: '2px 8px' }}>
                                                + เพิ่ม
                                            </button>
                                        </label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                                            {statsItems.map((stat, idx) => (
                                                <div key={idx} style={{ display: 'flex', gap: '4px', alignItems: 'center', background: '#f8faff', padding: '6px', borderRadius: '6px' }}>
                                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                        <input type="text" value={stat.value} onChange={(e) => updateStat(idx, 'value', e.target.value)} className="form-control" placeholder="10" style={{ fontSize: '12px', padding: '3px 6px', fontWeight: 700 }} />
                                                        <input type="text" value={stat.suffix || ''} onChange={(e) => updateStat(idx, 'suffix', e.target.value)} className="form-control" placeholder="+" style={{ fontSize: '11px', padding: '2px 6px', color: '#6b7280' }} />
                                                        <input type="text" value={stat.label} onChange={(e) => updateStat(idx, 'label', e.target.value)} className="form-control" placeholder="ชื่อรายการ" style={{ fontSize: '11px', padding: '2px 6px' }} />
                                                    </div>
                                                    <button className="btn btn-sm btn-danger" onClick={() => removeStat(idx)} style={{ fontSize: '11px', padding: '2px 6px' }} title="ลบ">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Why Us Section */}
                                    <div style={{ marginTop: '12px', padding: '10px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534', marginBottom: '8px', display: 'block' }}>
                                            ✦ ส่วน "ทำไมต้องเลือกเรา"
                                        </label>
                                    </div>

                                    <div className="form-group">
                                        <label>Badge Text</label>
                                        <input
                                            type="text"
                                            value={selectedComponent.props.whyBadge || ''}
                                            onChange={(e) => handlePropChange('whyBadge', e.target.value)}
                                            className="form-control"
                                            placeholder="✦ Why TechBiz Convergence"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Why Heading (บรรทัดแรก)</label>
                                        <input
                                            type="text"
                                            value={selectedComponent.props.whyHeading || ''}
                                            onChange={(e) => handlePropChange('whyHeading', e.target.value)}
                                            className="form-control"
                                            placeholder="ทำไมองค์กรชั้นนำ"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Why Heading Gradient (บรรทัดสอง)</label>
                                        <input
                                            type="text"
                                            value={selectedComponent.props.whyHeadingGradient || ''}
                                            onChange={(e) => handlePropChange('whyHeadingGradient', e.target.value)}
                                            className="form-control"
                                            placeholder="เลือกทำงานกับเรา"
                                        />
                                    </div>

                                    {/* Why Us Cards */}
                                    {(() => {
                                        const whyItems: Array<{ title: string; desc: string }> =
                                            selectedComponent.props.whyItems || [
                                                { title: 'เน้นผลลัพธ์จริง', desc: 'เราวัดความสำเร็จจากผลลัพธ์ทางธุรกิจของลูกค้า ไม่ใช่แค่การส่งมอบ Software' },
                                                { title: 'พาร์ทเนอร์ระยะยาว', desc: 'ดูแลและพัฒนาระบบต่อเนื่อง พร้อม Support 24/7 หลัง Go-live' },
                                                { title: 'เทคโนโลยีล่าสุด', desc: 'ใช้ Stack ที่ทันสมัย เหมาะกับโจทย์ของแต่ละองค์กร ไม่ยัดเยียดวิธีเดียว' },
                                                { title: 'เข้าใจธุรกิจไทย', desc: 'ทีมงานคนไทย เข้าใจบริบทและข้อกำหนดของตลาดในประเทศอย่างลึกซึ้ง' },
                                            ];
                                        const addWhyItem = () => handlePropChange('whyItems', [
                                            ...whyItems,
                                            { title: 'จุดเด่นใหม่', desc: 'รายละเอียด...' },
                                        ]);
                                        const updateWhyItem = (idx: number, field: string, val: string) => {
                                            const next = whyItems.map((it, i) => i === idx ? { ...it, [field]: val } : it);
                                            handlePropChange('whyItems', next);
                                        };
                                        const removeWhyItem = (idx: number) =>
                                            handlePropChange('whyItems', whyItems.filter((_, i) => i !== idx));

                                        return (
                                            <div className="form-group">
                                                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span>การ์ด "ทำไมต้องเรา" ({whyItems.length})</span>
                                                    <button className="btn btn-sm btn-primary" onClick={addWhyItem} style={{ fontSize: '11px', padding: '2px 8px' }}>
                                                        + เพิ่ม
                                                    </button>
                                                </label>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                                                    {whyItems.map((item, idx) => (
                                                        <div key={idx} style={{ background: '#f0fdf4', padding: '8px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a' }}>#{idx + 1}</span>
                                                                {whyItems.length > 1 && (
                                                                    <button className="btn btn-sm btn-danger" onClick={() => removeWhyItem(idx)} style={{ fontSize: '10px', padding: '1px 5px' }}>✕</button>
                                                                )}
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                <input
                                                                    type="text"
                                                                    value={item.title}
                                                                    onChange={(e) => updateWhyItem(idx, 'title', e.target.value)}
                                                                    className="form-control"
                                                                    placeholder="หัวข้อ"
                                                                    style={{ fontSize: '12px', padding: '3px 6px', fontWeight: 600 }}
                                                                />
                                                                <textarea
                                                                    value={item.desc}
                                                                    onChange={(e) => updateWhyItem(idx, 'desc', e.target.value)}
                                                                    rows={2}
                                                                    className="form-control"
                                                                    placeholder="รายละเอียด..."
                                                                    style={{ fontSize: '11px', padding: '3px 6px' }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Text Colors */}
                                    <div style={{ marginTop: '12px', padding: '10px', background: 'var(--color-surface-secondary)', borderRadius: '8px', border: '1px solid var(--color-surface-border)' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Text Colors</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                            <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '80px' }}>Title</label>
                                            <input type="color" value={selectedComponent.props.titleColor || '#1e293b'} onChange={(e) => handlePropChange('titleColor', e.target.value)} style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                            <input type="text" value={selectedComponent.props.titleColor || ''} onChange={(e) => handlePropChange('titleColor', e.target.value)} className="form-control" style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }} placeholder="#1e293b" />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                            <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '80px' }}>Text</label>
                                            <input type="color" value={selectedComponent.props.textColor || '#64748b'} onChange={(e) => handlePropChange('textColor', e.target.value)} style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                            <input type="text" value={selectedComponent.props.textColor || ''} onChange={(e) => handlePropChange('textColor', e.target.value)} className="form-control" style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }} placeholder="#64748b" />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                            <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '80px' }}>Stat Value</label>
                                            <input type="color" value={selectedComponent.props.statValueColor || '#6366f1'} onChange={(e) => handlePropChange('statValueColor', e.target.value)} style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                            <input type="text" value={selectedComponent.props.statValueColor || ''} onChange={(e) => handlePropChange('statValueColor', e.target.value)} className="form-control" style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }} placeholder="#6366f1" />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '80px' }}>Stat Label</label>
                                            <input type="color" value={selectedComponent.props.statLabelColor || '#64748b'} onChange={(e) => handlePropChange('statLabelColor', e.target.value)} style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                            <input type="text" value={selectedComponent.props.statLabelColor || ''} onChange={(e) => handlePropChange('statLabelColor', e.target.value)} className="form-control" style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }} placeholder="#64748b" />
                                        </div>
                                    </div>
                                </>
                            );
                        })()}


                        {/* ── TESTIMONIALS ── */}
                        {selectedComponent.type === 'testimonials' && (() => {
                            const items: Array<{ name: string; role: string; company: string; text: string; avatar?: string }> =
                                selectedComponent.props.testimonials || [];
                            const addTestimonial = () => handlePropChange('testimonials', [
                                ...items,
                                { name: 'ชื่อลูกค้า', role: 'ตำแหน่ง', company: 'บริษัท', text: 'ข้อความรีวิว...', avatar: '' },
                            ]);
                            const updateTestimonial = (idx: number, field: string, val: string) => {
                                const next = items.map((it, i) => i === idx ? { ...it, [field]: val } : it);
                                handlePropChange('testimonials', next);
                            };
                            const removeTestimonial = (idx: number) =>
                                handlePropChange('testimonials', items.filter((_, i) => i !== idx));

                            return (
                                <>
                                    {/* ── 🎨 Testimonials Template ── */}
                                    <div style={{ marginBottom: '16px', padding: '10px', background: 'var(--color-surface-secondary)', borderRadius: '8px', border: '1px solid var(--color-surface-border)' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🎨 Testimonials Template</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '10px' }}>
                                            {([{ id: 'default', label: 'Carousel' }, { id: 'grid', label: 'Grid' }, { id: 'featured', label: 'Featured' }] as const).map((t) => {
                                                const isA = (selectedComponent.props.testimonialVariant || 'default') === t.id;
                                                return (
                                                    <button key={t.id} onClick={() => handlePropChange('testimonialVariant', t.id)} style={{ padding: '8px 4px 6px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.6rem', fontWeight: 600, textAlign: 'center', background: isA ? 'var(--theme-primary, #4a90e2)' : 'var(--color-surface-primary, #fff)', color: isA ? '#fff' : 'var(--color-text-secondary)', border: isA ? '2px solid var(--theme-primary, #4a90e2)' : '1px solid var(--color-surface-border, #e2e8f0)', transition: 'all 0.2s ease' }}>
                                                        <div style={{ width: '100%', height: '28px', marginBottom: '4px', borderRadius: '4px', background: isA ? 'rgba(255,255,255,0.15)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', padding: '4px' }}>
                                                            {t.id === 'default' && <div style={{ display: 'flex', alignItems: 'center', gap: '2px', width: '100%' }}><div style={{ fontSize: '7px', color: isA ? '#fff' : '#94a3b8' }}>‹</div><div style={{ flex: 1, height: '16px', borderRadius: '3px', background: isA ? 'rgba(255,255,255,0.25)' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isA ? '#fff' : '#94a3b8' }} /></div><div style={{ fontSize: '7px', color: isA ? '#fff' : '#94a3b8' }}>›</div></div>}
                                                            {t.id === 'grid' && <>{[1,2,3].map(i => <div key={i} style={{ width: '28%', height: '16px', borderRadius: '3px', background: isA ? 'rgba(255,255,255,0.25)' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '4px', height: '4px', borderRadius: '50%', background: isA ? '#fff' : '#94a3b8' }} /></div>)}</>}
                                                            {t.id === 'featured' && <div style={{ display: 'flex', alignItems: 'center', gap: '3px', width: '100%' }}><div style={{ width: '55%', height: '20px', borderRadius: '3px', background: isA ? 'rgba(255,255,255,0.3)' : '#e2e8f0', border: `1px solid ${isA ? 'rgba(255,255,255,0.4)' : '#cbd5e1'}` }} /><div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>{[1,2].map(i => <div key={i} style={{ height: '8px', borderRadius: '2px', background: isA ? 'rgba(255,255,255,0.15)' : '#e8ecf0' }} />)}</div></div>}
                                                        </div>
                                                        {t.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '0' }}>
                                            <label>Animation Speed (ms)</label>
                                            <input type="number" value={selectedComponent.props.testimonialSpeed || 5000} onChange={(e) => handlePropChange('testimonialSpeed', parseInt(e.target.value) || 5000)} className="form-control" min={2000} step={500} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Badge Text</label>
                                        <input
                                            type="text"
                                            value={selectedComponent.props.badge || ''}
                                            onChange={(e) => handlePropChange('badge', e.target.value)}
                                            className="form-control"
                                            placeholder="Client Testimonials"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Section Title (บรรทัดแรก)</label>
                                        <input
                                            type="text"
                                            value={selectedComponent.props.title || ''}
                                            onChange={(e) => handlePropChange('title', e.target.value)}
                                            className="form-control"
                                            placeholder="ลูกค้าพูดถึงเรา"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Heading Gradient (บรรทัดสอง)</label>
                                        <input
                                            type="text"
                                            value={selectedComponent.props.headingGradient || ''}
                                            onChange={(e) => handlePropChange('headingGradient', e.target.value)}
                                            className="form-control"
                                            placeholder="อย่างไร"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Section Subtitle</label>
                                        <textarea
                                            value={selectedComponent.props.subtitle || ''}
                                            onChange={(e) => handlePropChange('subtitle', e.target.value)}
                                            rows={2}
                                            className="form-control"
                                            placeholder="ความสำเร็จของลูกค้าคือความสำเร็จของเรา..."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>รีวิว ({items.length})</span>
                                            <button className="btn btn-sm btn-primary" onClick={addTestimonial} style={{ fontSize: '11px', padding: '2px 8px' }}>
                                                + เพิ่ม
                                            </button>
                                        </label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                                            {items.map((item, idx) => (
                                                <div key={idx} style={{ background: 'var(--color-surface-secondary)', padding: '8px', borderRadius: '8px', border: '1px solid var(--color-surface-border)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6366f1' }}>#{idx + 1}</span>
                                                        <button className="btn btn-sm btn-danger" onClick={() => removeTestimonial(idx)} style={{ fontSize: '10px', padding: '1px 5px' }}>✕</button>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <input type="text" value={item.name} onChange={(e) => updateTestimonial(idx, 'name', e.target.value)} className="form-control" placeholder="ชื่อ" style={{ fontSize: '12px', padding: '3px 6px' }} />
                                                        <input type="text" value={item.role} onChange={(e) => updateTestimonial(idx, 'role', e.target.value)} className="form-control" placeholder="ตำแหน่ง" style={{ fontSize: '11px', padding: '3px 6px' }} />
                                                        <input type="text" value={item.company} onChange={(e) => updateTestimonial(idx, 'company', e.target.value)} className="form-control" placeholder="บริษัท" style={{ fontSize: '11px', padding: '3px 6px' }} />
                                                        <textarea value={item.text} onChange={(e) => updateTestimonial(idx, 'text', e.target.value)} rows={2} className="form-control" placeholder="ข้อความรีวิว..." style={{ fontSize: '11px', padding: '3px 6px' }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {items.length === 0 && (
                                        <div style={{ padding: '10px', background: 'var(--color-surface-secondary)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                            Note: ถ้าไม่ได้เพิ่มรีวิว จะใช้ข้อมูลเริ่มต้นของ Testimonials component
                                        </div>
                                    )}

                                    {/* Text Colors */}
                                    <div style={{ marginTop: '12px', padding: '10px', background: 'var(--color-surface-secondary)', borderRadius: '8px', border: '1px solid var(--color-surface-border)' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Text Colors</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                            <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '80px' }}>Title</label>
                                            <input type="color" value={selectedComponent.props.titleColor || '#1e293b'} onChange={(e) => handlePropChange('titleColor', e.target.value)} style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                            <input type="text" value={selectedComponent.props.titleColor || ''} onChange={(e) => handlePropChange('titleColor', e.target.value)} className="form-control" style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }} placeholder="#1e293b" />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                            <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '80px' }}>Review Text</label>
                                            <input type="color" value={selectedComponent.props.textColor || '#334155'} onChange={(e) => handlePropChange('textColor', e.target.value)} style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                            <input type="text" value={selectedComponent.props.textColor || ''} onChange={(e) => handlePropChange('textColor', e.target.value)} className="form-control" style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }} placeholder="#334155" />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '80px' }}>Name</label>
                                            <input type="color" value={selectedComponent.props.nameColor || '#1e293b'} onChange={(e) => handlePropChange('nameColor', e.target.value)} style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                            <input type="text" value={selectedComponent.props.nameColor || ''} onChange={(e) => handlePropChange('nameColor', e.target.value)} className="form-control" style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }} placeholder="#1e293b" />
                                        </div>
                                    </div>
                                </>
                            );
                        })()}

                        {/* ── FOOTER ── */}
                        {selectedComponent.type === 'footer' && (
                            <>
                                {/* ── 🎨 Footer Template ── */}
                                <div style={{ marginBottom: '16px', padding: '10px', background: 'var(--color-surface-secondary)', borderRadius: '8px', border: '1px solid var(--color-surface-border)' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🎨 Footer Template</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                                        {([{ id: 'default', label: 'Full' }, { id: 'minimal', label: 'Minimal' }, { id: 'centered', label: 'Centered' }] as const).map((t) => {
                                            const isA = (selectedComponent.props.footerVariant || 'default') === t.id;
                                            return (
                                                <button key={t.id} onClick={() => handlePropChange('footerVariant', t.id)} style={{ padding: '8px 4px 6px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.6rem', fontWeight: 600, textAlign: 'center', background: isA ? 'var(--theme-primary, #4a90e2)' : 'var(--color-surface-primary, #fff)', color: isA ? '#fff' : 'var(--color-text-secondary)', border: isA ? '2px solid var(--theme-primary, #4a90e2)' : '1px solid var(--color-surface-border, #e2e8f0)', transition: 'all 0.2s ease' }}>
                                                    <div style={{ width: '100%', height: '28px', marginBottom: '4px', borderRadius: '4px', background: isA ? 'rgba(255,255,255,0.15)' : '#f1f5f9', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '3px', padding: '3px' }}>
                                                        {t.id === 'default' && <div style={{ display: 'flex', gap: '3px', width: '100%' }}>{[1,2,3,4].map(i => <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px' }}><div style={{ width: '100%', height: '3px', borderRadius: '1px', background: isA ? 'rgba(255,255,255,0.4)' : '#cbd5e1' }} /><div style={{ width: '60%', height: '2px', borderRadius: '1px', background: isA ? 'rgba(255,255,255,0.2)' : '#e2e8f0' }} /></div>)}</div>}
                                                        {t.id === 'minimal' && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}><div style={{ width: '25%', height: '3px', borderRadius: '1px', background: isA ? '#fff' : '#94a3b8' }} /><div style={{ display: 'flex', gap: '3px' }}>{[1,2,3].map(i => <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: isA ? 'rgba(255,255,255,0.4)' : '#cbd5e1' }} />)}</div></div>}
                                                        {t.id === 'centered' && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', width: '100%' }}><div style={{ width: '30%', height: '3px', borderRadius: '1px', background: isA ? '#fff' : '#94a3b8' }} /><div style={{ display: 'flex', gap: '3px' }}>{[1,2,3].map(i => <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: isA ? 'rgba(255,255,255,0.4)' : '#cbd5e1' }} />)}</div><div style={{ width: '50%', height: '2px', borderRadius: '1px', background: isA ? 'rgba(255,255,255,0.2)' : '#e2e8f0' }} /></div>}
                                                    </div>
                                                    {t.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Company Name</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.companyName || ''}
                                        onChange={(e) => handlePropChange('companyName', e.target.value)}
                                        className="form-control"
                                        placeholder="TechBiz Convergence"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Company Description</label>
                                    <textarea
                                        value={selectedComponent.props.description || ''}
                                        onChange={(e) => handlePropChange('description', e.target.value)}
                                        rows={3}
                                        className="form-control"
                                        placeholder="บริษัทผู้เชี่ยวชาญด้าน IT..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>อีเมลติดต่อ</label>
                                    <input
                                        type="email"
                                        value={selectedComponent.props.email || ''}
                                        onChange={(e) => handlePropChange('email', e.target.value)}
                                        className="form-control"
                                        placeholder="info@techbiz.co.th"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>เบอร์โทรศัพท์</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.phone || ''}
                                        onChange={(e) => handlePropChange('phone', e.target.value)}
                                        className="form-control"
                                        placeholder="061-789-4422"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>ที่อยู่</label>
                                    <textarea
                                        value={selectedComponent.props.address || ''}
                                        onChange={(e) => handlePropChange('address', e.target.value)}
                                        rows={2}
                                        className="form-control"
                                        placeholder="326/224 หมู่ 6 ต.ทุ่งสุขลา..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>เวลาทำการ</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.workHours || ''}
                                        onChange={(e) => handlePropChange('workHours', e.target.value)}
                                        className="form-control"
                                        placeholder="จ-ศ 09:00 – 18:00"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Copyright Text</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.copyright || ''}
                                        onChange={(e) => handlePropChange('copyright', e.target.value)}
                                        className="form-control"
                                        placeholder="© 2026 TechBiz Convergence"
                                    />
                                </div>

                                <div style={{ marginTop: '12px', padding: '10px', background: 'var(--color-surface-secondary)', borderRadius: '8px', border: '1px solid var(--color-surface-border)' }}>
                                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px', display: 'block' }}>Social Media Links</label>
                                </div>
                                <div className="form-group">
                                    <label>Facebook URL</label>
                                    <input
                                        type="url"
                                        value={selectedComponent.props.facebook || ''}
                                        onChange={(e) => handlePropChange('facebook', e.target.value)}
                                        className="form-control"
                                        placeholder="https://facebook.com/..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>LINE URL</label>
                                    <input
                                        type="url"
                                        value={selectedComponent.props.lineId || ''}
                                        onChange={(e) => handlePropChange('lineId', e.target.value)}
                                        className="form-control"
                                        placeholder="https://line.me/R/ti/p/@..."
                                    />
                                </div>

                                {/* Text Colors */}
                                <div style={{ marginTop: '12px', padding: '10px', background: 'var(--color-surface-secondary)', borderRadius: '8px', border: '1px solid var(--color-surface-border)' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Text Colors</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                        <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '80px' }}>Text</label>
                                        <input type="color" value={selectedComponent.props.textColor || '#94a3b8'} onChange={(e) => handlePropChange('textColor', e.target.value)} style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                        <input type="text" value={selectedComponent.props.textColor || ''} onChange={(e) => handlePropChange('textColor', e.target.value)} className="form-control" style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }} placeholder="#94a3b8" />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                        <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '80px' }}>Links</label>
                                        <input type="color" value={selectedComponent.props.linkColor || '#a5b4fc'} onChange={(e) => handlePropChange('linkColor', e.target.value)} style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                        <input type="text" value={selectedComponent.props.linkColor || ''} onChange={(e) => handlePropChange('linkColor', e.target.value)} className="form-control" style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }} placeholder="#a5b4fc" />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '80px' }}>Copyright</label>
                                        <input type="color" value={selectedComponent.props.copyrightColor || '#64748b'} onChange={(e) => handlePropChange('copyrightColor', e.target.value)} style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                        <input type="text" value={selectedComponent.props.copyrightColor || ''} onChange={(e) => handlePropChange('copyrightColor', e.target.value)} className="form-control" style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }} placeholder="#64748b" />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── FEATURES ── */}
                        {selectedComponent.type === 'features' && (() => {
                            const featureItems: Array<{ icon: string; title: string; description: string; detail: string; color: string; iconColor: string; bgColor: string; textColor: string }> =
                                (selectedComponent.props.items || []).map((it: any) => ({
                                    icon: it.icon || '',
                                    title: it.title || '',
                                    description: it.description || '',
                                    detail: it.detail || '',
                                    color: it.color || '#4a90e2',
                                    iconColor: it.iconColor || '',
                                    bgColor: it.bgColor || '',
                                    textColor: it.textColor || '',
                                }));
                            const addFeature = () => handlePropChange('items', [
                                ...featureItems,
                                { icon: '⭐', title: 'Feature ใหม่', description: 'รายละเอียด...', detail: '', color: '#4a90e2', iconColor: '', bgColor: '', textColor: '' },
                            ]);
                            const updateFeature = (idx: number, field: string, val: string) => {
                                const next = featureItems.map((it, i) => i === idx ? { ...it, [field]: val } : it);
                                handlePropChange('items', next);
                            };
                            const removeFeature = (idx: number) =>
                                handlePropChange('items', featureItems.filter((_, i) => i !== idx));
                            const moveFeature = (from: number, to: number) => {
                                if (to < 0 || to >= featureItems.length) return;
                                const next = [...featureItems];
                                const [moved] = next.splice(from, 1);
                                next.splice(to, 0, moved);
                                handlePropChange('items', next);
                            };

                            return (
                                <>
                                    {/* ── 🎨 Features Template ── */}
                                    <div style={{ marginBottom: '16px', padding: '10px', background: 'var(--color-surface-secondary)', borderRadius: '8px', border: '1px solid var(--color-surface-border)' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🎨 Features Card Style</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px', marginBottom: '10px' }}>
                                            {([{ id: 'elevated', label: 'Elevated' }, { id: 'flat', label: 'Flat' }, { id: 'bordered', label: 'Border' }, { id: 'glass', label: 'Glass' }] as const).map((t) => {
                                                const isA = (selectedComponent.props.featureCardStyle || 'elevated') === t.id;
                                                return (
                                                    <button key={t.id} onClick={() => handlePropChange('featureCardStyle', t.id)} style={{ padding: '8px 2px 6px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.55rem', fontWeight: 600, textAlign: 'center', background: isA ? 'var(--theme-primary, #4a90e2)' : 'var(--color-surface-primary, #fff)', color: isA ? '#fff' : 'var(--color-text-secondary)', border: isA ? '2px solid var(--theme-primary, #4a90e2)' : '1px solid var(--color-surface-border, #e2e8f0)', transition: 'all 0.2s ease' }}>
                                                        <div style={{ width: '100%', height: '24px', marginBottom: '3px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {t.id === 'elevated' && <div style={{ width: '70%', height: '16px', borderRadius: '3px', background: isA ? 'rgba(255,255,255,0.25)' : '#f8fafc', boxShadow: `0 2px 6px ${isA ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}` }} />}
                                                            {t.id === 'flat' && <div style={{ width: '70%', height: '16px', borderRadius: '3px', background: isA ? 'rgba(255,255,255,0.15)' : '#f1f5f9' }} />}
                                                            {t.id === 'bordered' && <div style={{ width: '70%', height: '16px', borderRadius: '3px', background: 'transparent', border: `1.5px solid ${isA ? 'rgba(255,255,255,0.5)' : '#cbd5e1'}` }} />}
                                                            {t.id === 'glass' && <div style={{ width: '70%', height: '16px', borderRadius: '3px', background: isA ? 'rgba(255,255,255,0.15)' : 'rgba(148,163,184,0.1)', backdropFilter: 'blur(4px)', border: `1px solid ${isA ? 'rgba(255,255,255,0.3)' : 'rgba(148,163,184,0.2)'}` }} />}
                                                        </div>
                                                        {t.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '8px' }}>
                                            <label>Grid Columns</label>
                                            <select
                                                value={selectedComponent.props.columns || 3}
                                                onChange={(e) => handlePropChange('columns', parseInt(e.target.value))}
                                                className="form-control"
                                            >
                                                <option value={2}>2 คอลัมน์</option>
                                                <option value={3}>3 คอลัมน์</option>
                                                <option value={4}>4 คอลัมน์</option>
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '0' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedComponent.props.showDetail !== false}
                                                    onChange={(e) => handlePropChange('showDetail', e.target.checked)}
                                                />
                                                แสดงรายละเอียดเพิ่มเติม (Hover/Modal)
                                            </label>
                                        </div>
                                    </div>
                                    {/* ── Section Header Settings ── */}
                                    <div style={{ marginBottom: '16px', padding: '10px', background: 'var(--color-surface-secondary)', borderRadius: '8px', border: '1px solid var(--color-surface-border)' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Section Header</div>
                                        
                                        <div className="form-group" style={{ marginBottom: '8px' }}>
                                            <label>Badge Text</label>
                                            <input
                                                type="text"
                                                value={selectedComponent.props.badge || ''}
                                                onChange={(e) => handlePropChange('badge', e.target.value)}
                                                className="form-control"
                                                placeholder="Our Services"
                                            />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '8px' }}>
                                            <label>Heading (Main Title)</label>
                                            <input
                                                type="text"
                                                value={selectedComponent.props.title || ''}
                                                onChange={(e) => handlePropChange('title', e.target.value)}
                                                className="form-control"
                                                placeholder="โซลูชั่นไอทีครบวงจร"
                                            />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '8px' }}>
                                            <label>Heading Gradient (Accent Line)</label>
                                            <input
                                                type="text"
                                                value={selectedComponent.props.headingGradient || ''}
                                                onChange={(e) => handlePropChange('headingGradient', e.target.value)}
                                                className="form-control"
                                                placeholder="สำหรับทุกธุรกิจ"
                                            />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '0' }}>
                                            <label>Description</label>
                                            <textarea
                                                value={selectedComponent.props.subtitle || ''}
                                                onChange={(e) => handlePropChange('subtitle', e.target.value)}
                                                rows={2}
                                                className="form-control"
                                                placeholder="คำอธิบายใต้หัวข้อ..."
                                                style={{ fontSize: '0.8rem' }}
                                            />
                                        </div>
                                    </div>

                                    {/* ── Grid Layout ── */}
                                    <div className="form-group" style={{ marginBottom: '12px' }}>
                                        <label>Grid Columns</label>
                                        <select
                                            value={selectedComponent.props.columns || 3}
                                            onChange={(e) => handlePropChange('columns', parseInt(e.target.value))}
                                            className="form-control"
                                        >
                                            <option value={2}>2 Columns</option>
                                            <option value={3}>3 Columns</option>
                                            <option value={4}>4 Columns</option>
                                        </select>
                                    </div>

                                    {/* ── Feature Cards ── */}
                                    <div className="form-group">
                                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>Feature Cards ({featureItems.length})</span>
                                            <button className="btn btn-sm btn-primary" onClick={addFeature} style={{ fontSize: '11px', padding: '2px 8px' }}>
                                                + Add
                                            </button>
                                        </label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                                            {featureItems.map((item, idx) => (
                                                <div key={idx} style={{ background: 'var(--color-surface-secondary)', padding: '10px', borderRadius: '10px', border: `1.5px solid var(--color-surface-border)`, position: 'relative' }}>
                                                    {/* Card header */}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6366f1' }}>Card #{idx + 1}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '3px' }}>
                                                            <button
                                                                className="section-action-btn"
                                                                onClick={() => moveFeature(idx, idx - 1)}
                                                                disabled={idx === 0}
                                                                title="Move Up"
                                                                style={{ width: '20px', height: '20px', fontSize: '8px' }}
                                                            >▲</button>
                                                            <button
                                                                className="section-action-btn"
                                                                onClick={() => moveFeature(idx, idx + 1)}
                                                                disabled={idx === featureItems.length - 1}
                                                                title="Move Down"
                                                                style={{ width: '20px', height: '20px', fontSize: '8px' }}
                                                            >▼</button>
                                                            <button className="section-action-btn danger" onClick={() => removeFeature(idx)} title="Delete" style={{ width: '20px', height: '20px', fontSize: '9px' }}>✕</button>
                                                        </div>
                                                    </div>

                                                    {/* Icon & Title row */}
                                                    <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
                                                        <IconPicker value={item.icon} onChange={(iconId) => updateFeature(idx, 'icon', iconId)} />
                                                    </div>
                                                    <div style={{ marginBottom: '4px' }}>
                                                        <input type="text" value={item.title} onChange={(e) => updateFeature(idx, 'title', e.target.value)} className="form-control" style={{ fontSize: '12px', padding: '4px 6px' }} placeholder="Title" />
                                                    </div>

                                                    {/* Description */}
                                                    <div style={{ marginBottom: '4px' }}>
                                                        <textarea value={item.description} onChange={(e) => updateFeature(idx, 'description', e.target.value)} rows={2} className="form-control" placeholder="Short description..." style={{ fontSize: '11px', padding: '4px 6px' }} />
                                                    </div>

                                                    {/* Detail (expandable content) */}
                                                    <div style={{ marginBottom: '4px' }}>
                                                        <label style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: '2px' }}>Detail (Expandable)</label>
                                                        <textarea
                                                            value={item.detail}
                                                            onChange={(e) => updateFeature(idx, 'detail', e.target.value)}
                                                            rows={3}
                                                            className="form-control"
                                                            placeholder={"Use bullet points:\n• Point 1\n• Point 2\n• Point 3"}
                                                            style={{ fontSize: '11px', padding: '4px 6px', fontFamily: 'monospace' }}
                                                        />
                                                    </div>

                                                    {/* Accent Color */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                        <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '72px' }}>Accent</label>
                                                        <input
                                                            type="color"
                                                            value={item.color}
                                                            onChange={(e) => updateFeature(idx, 'color', e.target.value)}
                                                            style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }}
                                                        />
                                                        <input
                                                            type="text"
                                                            value={item.color}
                                                            onChange={(e) => updateFeature(idx, 'color', e.target.value)}
                                                            className="form-control"
                                                            style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }}
                                                            placeholder="#4a90e2"
                                                        />
                                                    </div>
                                                    {/* Icon Color */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                        <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '72px' }}>Icon Color</label>
                                                        <input
                                                            type="color"
                                                            value={item.iconColor || item.color}
                                                            onChange={(e) => updateFeature(idx, 'iconColor', e.target.value)}
                                                            style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }}
                                                        />
                                                        <input
                                                            type="text"
                                                            value={item.iconColor}
                                                            onChange={(e) => updateFeature(idx, 'iconColor', e.target.value)}
                                                            className="form-control"
                                                            style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }}
                                                            placeholder="default: accent color"
                                                        />
                                                    </div>
                                                    {/* Background Color */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                        <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '72px' }}>Card BG</label>
                                                        <input
                                                            type="color"
                                                            value={item.bgColor || '#fafbff'}
                                                            onChange={(e) => updateFeature(idx, 'bgColor', e.target.value)}
                                                            style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }}
                                                        />
                                                        <input
                                                            type="text"
                                                            value={item.bgColor}
                                                            onChange={(e) => updateFeature(idx, 'bgColor', e.target.value)}
                                                            className="form-control"
                                                            style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }}
                                                            placeholder="default: #fafbff"
                                                        />
                                                    </div>
                                                    {/* Text Color */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '72px' }}>Text Color</label>
                                                        <input
                                                            type="color"
                                                            value={item.textColor || '#1e293b'}
                                                            onChange={(e) => updateFeature(idx, 'textColor', e.target.value)}
                                                            style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }}
                                                        />
                                                        <input
                                                            type="text"
                                                            value={item.textColor}
                                                            onChange={(e) => updateFeature(idx, 'textColor', e.target.value)}
                                                            className="form-control"
                                                            style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }}
                                                            placeholder="default: #1e293b"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            );
                        })()}

                        {/* ── TECH STACK MARQUEE ── */}
                        {selectedComponent.type === 'techstack' && (() => {
                            const techItems: string[] = selectedComponent.props.items || [];
                            const addTech = (techId: string) => {
                                if (!techItems.includes(techId)) {
                                    handlePropChange('items', [...techItems, techId]);
                                }
                            };
                            const removeTech = (idx: number) => {
                                handlePropChange('items', techItems.filter((_, i) => i !== idx));
                            };
                            const moveTech = (from: number, to: number) => {
                                if (to < 0 || to >= techItems.length) return;
                                const next = [...techItems];
                                const [moved] = next.splice(from, 1);
                                next.splice(to, 0, moved);
                                handlePropChange('items', next);
                            };
                            const updateTech = (idx: number, newId: string) => {
                                const next = [...techItems];
                                next[idx] = newId;
                                handlePropChange('items', next);
                            };

                            return (
                                <>
                                    {/* Section Header */}
                                    <div style={{ marginBottom: '16px', padding: '10px', background: 'var(--color-surface-secondary)', borderRadius: '8px', border: '1px solid var(--color-surface-border)' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Section Header</div>
                                        <div className="form-group" style={{ marginBottom: '8px' }}>
                                            <label>Label</label>
                                            <input
                                                type="text"
                                                value={selectedComponent.props.label || ''}
                                                onChange={(e) => handlePropChange('label', e.target.value)}
                                                className="form-control"
                                                placeholder="TECHNOLOGY PARTNERS & STACK"
                                            />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '0' }}>
                                            <label>Title</label>
                                            <input
                                                type="text"
                                                value={selectedComponent.props.title || ''}
                                                onChange={(e) => handlePropChange('title', e.target.value)}
                                                className="form-control"
                                                placeholder="เครื่องมือ & เทคโนโลยีที่เราเชี่ยวชาญ"
                                            />
                                        </div>
                                    </div>

                                    {/* Colors */}
                                    <div style={{ marginBottom: '12px', padding: '10px', background: 'var(--color-surface-secondary)', borderRadius: '8px', border: '1px solid var(--color-surface-border)' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Text Colors</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                            <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '72px' }}>Label</label>
                                            <input type="color" value={selectedComponent.props.labelColor || '#a78bfa'} onChange={(e) => handlePropChange('labelColor', e.target.value)} style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                            <input type="text" value={selectedComponent.props.labelColor || ''} onChange={(e) => handlePropChange('labelColor', e.target.value)} className="form-control" style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }} placeholder="#a78bfa" />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '72px' }}>Title</label>
                                            <input type="color" value={selectedComponent.props.titleColor || '#1e293b'} onChange={(e) => handlePropChange('titleColor', e.target.value)} style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                            <input type="text" value={selectedComponent.props.titleColor || ''} onChange={(e) => handlePropChange('titleColor', e.target.value)} className="form-control" style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }} placeholder="#1e293b" />
                                        </div>
                                    </div>

                                    {/* Technologies list */}
                                    <div className="form-group">
                                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>Technologies ({techItems.length})</span>
                                        </label>

                                        {/* Current tech items */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                                            {techItems.map((techId, idx) => {
                                                const tech = TECH_LIBRARY.find(t => t.id === techId);
                                                return (
                                                    <div key={idx} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '4px 6px',
                                                        background: 'var(--color-surface-secondary)',
                                                        borderRadius: '6px',
                                                        border: '1px solid var(--color-surface-border)',
                                                    }}>
                                                        <span style={{ color: '#6366f1', display: 'flex', flexShrink: 0 }}>{tech?.svg || '?'}</span>
                                                        <TechPicker
                                                            value={techId}
                                                            onChange={(newId) => updateTech(idx, newId)}
                                                            excludeIds={techItems.filter((_, i) => i !== idx)}
                                                        />
                                                        <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                                                            <button
                                                                className="section-action-btn"
                                                                onClick={() => moveTech(idx, idx - 1)}
                                                                disabled={idx === 0}
                                                                title="Move Up"
                                                                style={{ width: '18px', height: '18px', fontSize: '7px' }}
                                                            >▲</button>
                                                            <button
                                                                className="section-action-btn"
                                                                onClick={() => moveTech(idx, idx + 1)}
                                                                disabled={idx === techItems.length - 1}
                                                                title="Move Down"
                                                                style={{ width: '18px', height: '18px', fontSize: '7px' }}
                                                            >▼</button>
                                                            <button
                                                                className="section-action-btn danger"
                                                                onClick={() => removeTech(idx)}
                                                                title="Remove"
                                                                style={{ width: '18px', height: '18px', fontSize: '8px' }}
                                                            >✕</button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Add new tech */}
                                        <div style={{ marginTop: '8px' }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Add Technology</div>
                                            <TechPicker
                                                value=""
                                                onChange={(techId) => addTech(techId)}
                                                excludeIds={techItems}
                                            />
                                        </div>
                                    </div>
                                </>
                            );
                        })()}

                        {selectedComponent.type === 'heading' && (
                            <>
                                <div className="form-group">
                                    <label>Text</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.text || ''}
                                        onChange={(e) => handlePropChange('text', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Heading Level</label>
                                    <select
                                        value={selectedComponent.props.level || 'h2'}
                                        onChange={(e) => handlePropChange('level', e.target.value)}
                                    >
                                        <option value="h1">H1 — Page Title</option>
                                        <option value="h2">H2 — Section Title</option>
                                        <option value="h3">H3 — Sub-section</option>
                                        <option value="h4">H4</option>
                                        <option value="h5">H5</option>
                                        <option value="h6">H6</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Alignment</label>
                                    <div className="align-buttons">
                                        {(['left', 'center', 'right'] as const).map((a) => (
                                            <button
                                                key={a}
                                                className={`align-btn ${(selectedComponent.props.align || 'left') === a ? 'active' : ''}`}
                                                onClick={() => handlePropChange('align', a)}
                                            >
                                                {a === 'left' ? '⬅' : a === 'center' ? '↔' : '➡'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── TEXT ── */}
                        {selectedComponent.type === 'text' && (
                            <>
                                <div className="form-group">
                                    <label>Content</label>
                                    <textarea
                                        value={selectedComponent.props.content || ''}
                                        onChange={(e) => handlePropChange('content', e.target.value)}
                                        rows={6}
                                        placeholder="Enter your text here..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Font Size</label>
                                    <select
                                        value={selectedComponent.props.fontSize || '16px'}
                                        onChange={(e) => handlePropChange('fontSize', e.target.value)}
                                    >
                                        <option value="12px">12px — Small</option>
                                        <option value="14px">14px — Body Small</option>
                                        <option value="16px">16px — Body</option>
                                        <option value="18px">18px — Body Large</option>
                                        <option value="20px">20px — Lead</option>
                                        <option value="24px">24px — Large</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Alignment</label>
                                    <div className="align-buttons">
                                        {(['left', 'center', 'right'] as const).map((a) => (
                                            <button
                                                key={a}
                                                className={`align-btn ${(selectedComponent.props.align || 'left') === a ? 'active' : ''}`}
                                                onClick={() => handlePropChange('align', a)}
                                            >
                                                {a === 'left' ? '⬅' : a === 'center' ? '↔' : '➡'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── BUTTON ── */}
                        {selectedComponent.type === 'button' && (
                            <>
                                {/* ── 🎨 Style Block ── */}
                                <div style={{ marginBottom: '16px', padding: '10px', background: 'var(--color-surface-secondary)', borderRadius: '8px', border: '1px solid var(--color-surface-border)' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🎨 Style</div>

                                    {/* Variant Visual Selector */}
                                    <div className="form-group" style={{ marginBottom: '10px' }}>
                                        <label>รูปแบบปุ่ม</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '4px' }}>
                                            {([
                                                { id: 'primary', label: 'Primary', bg: 'var(--theme-primary, #4a90e2)', color: '#fff', border: 'none' },
                                                { id: 'secondary', label: 'Secondary', bg: '#64748b', color: '#fff', border: 'none' },
                                                { id: 'outline', label: 'Outline', bg: 'transparent', color: 'var(--theme-primary, #4a90e2)', border: '2px solid var(--theme-primary, #4a90e2)' },
                                                { id: 'ghost', label: 'Ghost', bg: 'transparent', color: 'var(--theme-primary, #4a90e2)', border: '1px dashed #cbd5e1' },
                                                { id: 'gradient', label: 'Gradient', bg: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none' },
                                                { id: 'glow', label: 'Glow', bg: 'var(--theme-primary, #4a90e2)', color: '#fff', border: 'none' },
                                            ] as const).map((v) => (
                                                <button
                                                    key={v.id}
                                                    onClick={() => handlePropChange('variant', v.id)}
                                                    style={{
                                                        padding: '8px 4px',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 600,
                                                        textAlign: 'center',
                                                        background: (selectedComponent.props.variant || 'primary') === v.id ? 'var(--theme-primary, #4a90e2)' : 'var(--color-surface-primary, #fff)',
                                                        color: (selectedComponent.props.variant || 'primary') === v.id ? '#fff' : 'var(--color-text-secondary)',
                                                        border: (selectedComponent.props.variant || 'primary') === v.id ? '2px solid var(--theme-primary, #4a90e2)' : '1px solid var(--color-surface-border, #e2e8f0)',
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '100%', height: '22px', borderRadius: '4px', marginBottom: '4px',
                                                        background: v.bg, border: v.border || 'none',
                                                        boxShadow: v.id === 'glow' ? '0 0 12px rgba(74,144,226,0.5)' : 'none',
                                                    }} />
                                                    {v.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Shape */}
                                    <div className="form-group" style={{ marginBottom: '10px' }}>
                                        <label>รูปทรง</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '4px' }}>
                                            {([
                                                { id: 'rounded', label: 'Rounded', radius: '8px' },
                                                { id: 'pill', label: 'Pill', radius: '999px' },
                                                { id: 'square', label: 'Square', radius: '0px' },
                                                { id: 'circle', label: 'Circle', radius: '50%' },
                                            ] as const).map((s) => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => handlePropChange('shape', s.id)}
                                                    style={{
                                                        padding: '6px 4px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 600,
                                                        textAlign: 'center',
                                                        background: (selectedComponent.props.shape || 'rounded') === s.id ? 'var(--theme-primary, #4a90e2)' : 'var(--color-surface-primary, #fff)',
                                                        color: (selectedComponent.props.shape || 'rounded') === s.id ? '#fff' : 'var(--color-text-secondary)',
                                                        border: (selectedComponent.props.shape || 'rounded') === s.id ? '2px solid var(--theme-primary, #4a90e2)' : '1px solid var(--color-surface-border, #e2e8f0)',
                                                    }}
                                                >
                                                    <div style={{
                                                        width: s.id === 'circle' ? '20px' : '100%', height: '14px',
                                                        borderRadius: s.radius, background: '#94a3b8',
                                                        margin: s.id === 'circle' ? '0 auto 3px' : '0 0 3px',
                                                    }} />
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Size */}
                                    <div className="form-group" style={{ marginBottom: '10px' }}>
                                        <label>ขนาด</label>
                                        <select
                                            value={selectedComponent.props.size || 'medium'}
                                            onChange={(e) => handlePropChange('size', e.target.value)}
                                            className="form-control"
                                        >
                                            <option value="xs">XS (เล็กมาก)</option>
                                            <option value="small">Small (เล็ก)</option>
                                            <option value="medium">Medium (กลาง)</option>
                                            <option value="large">Large (ใหญ่)</option>
                                            <option value="xl">XL (ใหญ่มาก)</option>
                                        </select>
                                    </div>

                                    {/* Full Width */}
                                    <div className="form-group" style={{ marginBottom: '0' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedComponent.props.fullWidth === true}
                                                onChange={(e) => handlePropChange('fullWidth', e.target.checked)}
                                            />
                                            เต็มความกว้าง (Full Width)
                                        </label>
                                    </div>
                                </div>

                                {/* ── Content ── */}
                                <div className="form-group">
                                    <label>ข้อความปุ่ม</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.text || ''}
                                        onChange={(e) => handlePropChange('text', e.target.value)}
                                        className="form-control"
                                        placeholder="Click Me"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Link URL</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.link || '#'}
                                        onChange={(e) => handlePropChange('link', e.target.value)}
                                        className="form-control"
                                        placeholder="https://example.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 400 }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedComponent.props.openNewTab === true}
                                            onChange={(e) => handlePropChange('openNewTab', e.target.checked)}
                                        />
                                        เปิดในแท็บใหม่
                                    </label>
                                </div>

                                {/* ── Icon ── */}
                                <div style={{ marginTop: '8px', padding: '10px', background: 'var(--color-surface-secondary)', borderRadius: '8px', border: '1px solid var(--color-surface-border)' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Icon</div>
                                    <div className="form-group" style={{ marginBottom: '8px' }}>
                                        <label>ตำแหน่ง Icon</label>
                                        <select
                                            value={selectedComponent.props.iconPosition || 'none'}
                                            onChange={(e) => handlePropChange('iconPosition', e.target.value)}
                                            className="form-control"
                                        >
                                            <option value="none">ไม่มี Icon</option>
                                            <option value="left">ซ้าย</option>
                                            <option value="right">ขวา</option>
                                        </select>
                                    </div>
                                    {(selectedComponent.props.iconPosition && selectedComponent.props.iconPosition !== 'none') && (
                                        <div className="form-group" style={{ marginBottom: '0' }}>
                                            <label>Icon (emoji หรือ symbol)</label>
                                            <input
                                                type="text"
                                                value={selectedComponent.props.icon || '→'}
                                                onChange={(e) => handlePropChange('icon', e.target.value)}
                                                className="form-control"
                                                placeholder="→ ✦ ★ ♦ ⚡ 🚀"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* ── Colors ── */}
                                <div style={{ marginTop: '8px', padding: '10px', background: 'var(--color-surface-secondary)', borderRadius: '8px', border: '1px solid var(--color-surface-border)' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>สีกำหนดเอง</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                        <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '60px' }}>พื้นหลัง</label>
                                        <input type="color" value={selectedComponent.props.bgColor || '#4a90e2'} onChange={(e) => handlePropChange('bgColor', e.target.value)} style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                        <input type="text" value={selectedComponent.props.bgColor || ''} onChange={(e) => handlePropChange('bgColor', e.target.value)} className="form-control" style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }} placeholder="ใช้ค่าเริ่มต้น" />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                        <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '60px' }}>ตัวอักษร</label>
                                        <input type="color" value={selectedComponent.props.textColor || '#ffffff'} onChange={(e) => handlePropChange('textColor', e.target.value)} style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                        <input type="text" value={selectedComponent.props.textColor || ''} onChange={(e) => handlePropChange('textColor', e.target.value)} className="form-control" style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }} placeholder="ใช้ค่าเริ่มต้น" />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <label style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', width: '60px' }}>ขอบ</label>
                                        <input type="color" value={selectedComponent.props.borderColor || '#4a90e2'} onChange={(e) => handlePropChange('borderColor', e.target.value)} style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                        <input type="text" value={selectedComponent.props.borderColor || ''} onChange={(e) => handlePropChange('borderColor', e.target.value)} className="form-control" style={{ flex: 1, fontSize: '11px', padding: '3px 6px', fontFamily: 'monospace' }} placeholder="ใช้ค่าเริ่มต้น" />
                                    </div>
                                </div>

                                {/* ── Animation ── */}
                                <div style={{ marginTop: '8px', padding: '10px', background: 'var(--color-surface-secondary)', borderRadius: '8px', border: '1px solid var(--color-surface-border)' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Animation</div>
                                    <div className="form-group" style={{ marginBottom: '0' }}>
                                        <label>Hover Effect</label>
                                        <select
                                            value={selectedComponent.props.hoverEffect || 'lift'}
                                            onChange={(e) => handlePropChange('hoverEffect', e.target.value)}
                                            className="form-control"
                                        >
                                            <option value="none">ไม่มี</option>
                                            <option value="lift">ยกขึ้น (Lift)</option>
                                            <option value="scale">ขยาย (Scale)</option>
                                            <option value="shine">เงาวิ่ง (Shine)</option>
                                            <option value="pulse">กระพริบ (Pulse)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Alignment */}
                                <div className="form-group" style={{ marginTop: '8px' }}>
                                    <label>ตำแหน่ง</label>
                                    <div className="align-buttons">
                                        {(['left', 'center', 'right'] as const).map((a) => (
                                            <button
                                                key={a}
                                                className={`align-btn ${(selectedComponent.props.align || 'left') === a ? 'active' : ''}`}
                                                onClick={() => handlePropChange('align', a)}
                                            >
                                                {a === 'left' ? '⬅' : a === 'center' ? '↔' : '➡'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}


                        {/* ── IMAGE ── */}
                        {selectedComponent.type === 'image' && (
                            <>
                                <div className="form-group">
                                    <label>Image URL</label>
                                    <input
                                        type="url"
                                        value={selectedComponent.props.src || ''}
                                        onChange={(e) => handlePropChange('src', e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Alt Text</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.alt || ''}
                                        onChange={(e) => handlePropChange('alt', e.target.value)}
                                        placeholder="Describe the image..."
                                    />
                                </div>
                            </>
                        )}

                        {/* ── SPACER ── */}
                        {selectedComponent.type === 'spacer' && (
                            <>
                                <div className="form-group">
                                    <label>Height (Desktop)</label>
                                    <select
                                        value={selectedComponent.props.height || '60px'}
                                        onChange={(e) => handlePropChange('height', e.target.value)}
                                    >
                                        <option value="20px">20px — Tiny</option>
                                        <option value="40px">40px — Small</option>
                                        <option value="60px">60px — Medium</option>
                                        <option value="80px">80px — Large</option>
                                        <option value="120px">120px — Extra Large</option>
                                        <option value="160px">160px — Huge</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Height (Mobile)</label>
                                    <select
                                        value={selectedComponent.props.mobileHeight || '40px'}
                                        onChange={(e) => handlePropChange('mobileHeight', e.target.value)}
                                    >
                                        <option value="10px">10px</option>
                                        <option value="20px">20px</option>
                                        <option value="40px">40px</option>
                                        <option value="60px">60px</option>
                                        <option value="80px">80px</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {/* ── DIVIDER ── */}
                        {selectedComponent.type === 'divider' && (
                            <>
                                <div className="form-group">
                                    <label>Style</label>
                                    <select
                                        value={selectedComponent.props.variant || 'solid'}
                                        onChange={(e) => handlePropChange('variant', e.target.value)}
                                    >
                                        <option value="solid">Solid ───</option>
                                        <option value="dashed">Dashed - - -</option>
                                        <option value="dotted">Dotted · · ·</option>
                                        <option value="gradient">Gradient ═══</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Color</label>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                        <input type="color" value={selectedComponent.props.color || '#e2e8f0'} onChange={(e) => handlePropChange('color', e.target.value)} style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                        <input type="text" value={selectedComponent.props.color || ''} onChange={(e) => handlePropChange('color', e.target.value)} className="form-control" placeholder="#e2e8f0" style={{ flex: 1, fontSize: '11px', fontFamily: 'monospace' }} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Thickness</label>
                                    <select
                                        value={selectedComponent.props.thickness || '1px'}
                                        onChange={(e) => handlePropChange('thickness', e.target.value)}
                                    >
                                        <option value="1px">1px — Fine</option>
                                        <option value="2px">2px — Medium</option>
                                        <option value="3px">3px — Bold</option>
                                        <option value="4px">4px — Heavy</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Width</label>
                                    <select
                                        value={selectedComponent.props.width || '100%'}
                                        onChange={(e) => handlePropChange('width', e.target.value)}
                                    >
                                        <option value="100%">100% — Full</option>
                                        <option value="80%">80%</option>
                                        <option value="60%">60%</option>
                                        <option value="40%">40%</option>
                                        <option value="200px">200px — Short</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Vertical Margin</label>
                                    <select
                                        value={selectedComponent.props.marginY || '32px'}
                                        onChange={(e) => handlePropChange('marginY', e.target.value)}
                                    >
                                        <option value="8px">8px</option>
                                        <option value="16px">16px</option>
                                        <option value="32px">32px</option>
                                        <option value="48px">48px</option>
                                        <option value="64px">64px</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {/* ── VIDEO EMBED ── */}
                        {selectedComponent.type === 'video' && (
                            <>
                                <div className="form-group">
                                    <label>Video URL</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.url || ''}
                                        onChange={(e) => handlePropChange('url', e.target.value)}
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="form-control"
                                    />
                                    <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>รองรับ YouTube และ Vimeo</small>
                                </div>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.title || 'Video'}
                                        onChange={(e) => handlePropChange('title', e.target.value)}
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Aspect Ratio</label>
                                    <select
                                        value={selectedComponent.props.aspectRatio || '16:9'}
                                        onChange={(e) => handlePropChange('aspectRatio', e.target.value)}
                                    >
                                        <option value="16:9">16:9 — Widescreen</option>
                                        <option value="4:3">4:3 — Standard</option>
                                        <option value="1:1">1:1 — Square</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Max Width</label>
                                    <select
                                        value={selectedComponent.props.maxWidth || '800px'}
                                        onChange={(e) => handlePropChange('maxWidth', e.target.value)}
                                    >
                                        <option value="600px">600px — Compact</option>
                                        <option value="800px">800px — Medium</option>
                                        <option value="1000px">1000px — Wide</option>
                                        <option value="100%">100% — Full Width</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {/* ── ALERT / BANNER ── */}
                        {selectedComponent.type === 'alert' && (
                            <>
                                <div className="form-group">
                                    <label>Variant</label>
                                    <select
                                        value={selectedComponent.props.variant || 'info'}
                                        onChange={(e) => handlePropChange('variant', e.target.value)}
                                    >
                                        <option value="info">ℹ️ Info (Blue)</option>
                                        <option value="success">✅ Success (Green)</option>
                                        <option value="warning">⚠️ Warning (Yellow)</option>
                                        <option value="error">❌ Error (Red)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Title (optional)</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.title || ''}
                                        onChange={(e) => handlePropChange('title', e.target.value)}
                                        className="form-control"
                                        placeholder="Alert Title"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Message</label>
                                    <textarea
                                        value={selectedComponent.props.message || ''}
                                        onChange={(e) => handlePropChange('message', e.target.value)}
                                        rows={3}
                                        className="form-control"
                                        placeholder="Alert message text..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Custom Icon (emoji)</label>
                                    <input
                                        type="text"
                                        value={selectedComponent.props.icon || ''}
                                        onChange={(e) => handlePropChange('icon', e.target.value)}
                                        className="form-control"
                                        placeholder="เว้นว่างเพื่อใช้ icon ค่าเริ่มต้น"
                                    />
                                </div>
                            </>
                        )}

                        {/* ── SOCIAL LINKS ── */}
                        {selectedComponent.type === 'sociallinks' && (() => {
                            const links: Array<{ platform: string; url: string }> = selectedComponent.props.links || [];
                            const PLATFORMS = ['facebook', 'line', 'instagram', 'twitter', 'linkedin', 'youtube', 'github', 'website'];
                            const addLink = () => handlePropChange('links', [...links, { platform: 'website', url: '#' }]);
                            const updateLink = (idx: number, field: string, val: string) => {
                                const next = links.map((l, i) => i === idx ? { ...l, [field]: val } : l);
                                handlePropChange('links', next);
                            };
                            const removeLink = (idx: number) => handlePropChange('links', links.filter((_, i) => i !== idx));
                            return (
                                <>
                                    <div className="form-group">
                                        <label>Style</label>
                                        <select
                                            value={selectedComponent.props.variant || 'filled'}
                                            onChange={(e) => handlePropChange('variant', e.target.value)}
                                        >
                                            <option value="filled">Filled (สีเต็ม)</option>
                                            <option value="outline">Outline (เส้นขอบ)</option>
                                            <option value="ghost">Ghost (ไม่มีพื้น)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Size</label>
                                        <select
                                            value={selectedComponent.props.size || 'medium'}
                                            onChange={(e) => handlePropChange('size', e.target.value)}
                                        >
                                            <option value="small">Small (32px)</option>
                                            <option value="medium">Medium (40px)</option>
                                            <option value="large">Large (48px)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Alignment</label>
                                        <div className="align-buttons">
                                            {(['left', 'center', 'right'] as const).map((a) => (
                                                <button
                                                    key={a}
                                                    className={`align-btn ${(selectedComponent.props.align || 'center') === a ? 'active' : ''}`}
                                                    onClick={() => handlePropChange('align', a)}
                                                >
                                                    {a === 'left' ? '⬅' : a === 'center' ? '↔' : '➡'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>Links ({links.length})</span>
                                            <button className="btn btn-sm btn-primary" onClick={addLink} style={{ fontSize: '11px', padding: '2px 8px' }}>+ เพิ่ม</button>
                                        </label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                                            {links.map((link, idx) => (
                                                <div key={idx} style={{ background: '#f0f7ff', padding: '8px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6' }}>#{idx + 1}</span>
                                                        <button className="btn btn-sm btn-danger" onClick={() => removeLink(idx)} style={{ fontSize: '10px', padding: '1px 5px' }}>✕</button>
                                                    </div>
                                                    <select
                                                        value={link.platform}
                                                        onChange={(e) => updateLink(idx, 'platform', e.target.value)}
                                                        className="form-control"
                                                        style={{ fontSize: '12px', marginBottom: '4px' }}
                                                    >
                                                        {PLATFORMS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                                                    </select>
                                                    <input
                                                        type="text"
                                                        value={link.url}
                                                        onChange={(e) => updateLink(idx, 'url', e.target.value)}
                                                        className="form-control"
                                                        placeholder="URL"
                                                        style={{ fontSize: '11px' }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            );
                        })()}

                        {/* ── ACCORDION / FAQ ── */}
                        {selectedComponent.type === 'accordion' && (() => {
                            const items: Array<{ question: string; answer: string }> = selectedComponent.props.items || [];
                            const addItem = () => handlePropChange('items', [...items, { question: 'คำถามใหม่?', answer: 'คำตอบ...' }]);
                            const updateItem = (idx: number, field: string, val: string) => {
                                const next = items.map((it, i) => i === idx ? { ...it, [field]: val } : it);
                                handlePropChange('items', next);
                            };
                            const removeItem = (idx: number) => handlePropChange('items', items.filter((_, i) => i !== idx));
                            return (
                                <>
                                    <div className="form-group">
                                        <label>Title</label>
                                        <input
                                            type="text"
                                            value={selectedComponent.props.title || ''}
                                            onChange={(e) => handlePropChange('title', e.target.value)}
                                            className="form-control"
                                            placeholder="คำถามที่พบบ่อย"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Subtitle</label>
                                        <input
                                            type="text"
                                            value={selectedComponent.props.subtitle || ''}
                                            onChange={(e) => handlePropChange('subtitle', e.target.value)}
                                            className="form-control"
                                            placeholder="คำอธิบายเพิ่มเติม"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Variant</label>
                                        <select
                                            value={selectedComponent.props.variant || 'default'}
                                            onChange={(e) => handlePropChange('variant', e.target.value)}
                                        >
                                            <option value="default">Default (เส้นล่าง)</option>
                                            <option value="bordered">Bordered (กรอบ)</option>
                                            <option value="separated">Separated (แยกการ์ด)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedComponent.props.allowMultiple || false}
                                                onChange={(e) => handlePropChange('allowMultiple', e.target.checked)}
                                            />
                                            เปิดหลายข้อพร้อมกัน
                                        </label>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>Q&A ({items.length})</span>
                                            <button className="btn btn-sm btn-primary" onClick={addItem} style={{ fontSize: '11px', padding: '2px 8px' }}>+ เพิ่ม</button>
                                        </label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                                            {items.map((item, idx) => (
                                                <div key={idx} style={{ background: '#fefce8', padding: '8px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#92400e' }}>Q{idx + 1}</span>
                                                        {items.length > 1 && <button className="btn btn-sm btn-danger" onClick={() => removeItem(idx)} style={{ fontSize: '10px', padding: '1px 5px' }}>✕</button>}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={item.question}
                                                        onChange={(e) => updateItem(idx, 'question', e.target.value)}
                                                        className="form-control"
                                                        placeholder="คำถาม"
                                                        style={{ fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}
                                                    />
                                                    <textarea
                                                        value={item.answer}
                                                        onChange={(e) => updateItem(idx, 'answer', e.target.value)}
                                                        rows={2}
                                                        className="form-control"
                                                        placeholder="คำตอบ..."
                                                        style={{ fontSize: '11px' }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            );
                        })()}

                        {/* ── WHY US ── */}
                        {selectedComponent.type === 'whyus' && (() => {
                            const WHYUS_ICON_OPTIONS = [
                                { id: 'rocket', label: 'Rocket' },
                                { id: 'users', label: 'Team' },
                                { id: 'headphones', label: 'Support' },
                                { id: 'clock', label: 'Clock' },
                                { id: 'award', label: 'Award' },
                                { id: 'shield', label: 'Shield' },
                                { id: 'zap', label: 'Zap' },
                                { id: 'target', label: 'Target' },
                                { id: 'trending-up', label: 'Growth' },
                                { id: 'check-circle', label: 'Check' },
                                { id: 'cpu', label: 'CPU' },
                                { id: 'globe', label: 'Globe' },
                                { id: 'lock', label: 'Lock' },
                                { id: 'star', label: 'Star' },
                                { id: 'settings', label: 'Settings' },
                                { id: 'heart', label: 'Heart' },
                                { id: 'cloud', label: 'Cloud' },
                                { id: 'server', label: 'Server' },
                                { id: 'database', label: 'Database' },
                                { id: 'code', label: 'Code' },
                                { id: 'layers', label: 'Layers' },
                                { id: 'chart-bar', label: 'Chart' },
                                { id: 'briefcase', label: 'Business' },
                                { id: 'lightbulb', label: 'Idea' },
                            ];
                            // Inline SVG mini icons for the picker (16x16)
                            const MINI_ICONS: Record<string, React.ReactNode> = {
                                'rocket': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>,
                                'users': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                                'headphones': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
                                'clock': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                                'award': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>,
                                'shield': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
                                'zap': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
                                'target': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
                                'trending-up': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
                                'check-circle': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
                                'cpu': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/></svg>,
                                'globe': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
                                'lock': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
                                'star': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
                                'settings': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09c-.658.003-1.25.396-1.51 1z"/></svg>,
                                'heart': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
                                'cloud': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>,
                                'server': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>,
                                'database': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
                                'code': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
                                'layers': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
                                'chart-bar': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="3" y1="20" x2="21" y2="20"/></svg>,
                                'briefcase': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
                                'lightbulb': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>,
                            };
                            const items: Array<{ icon: string; title: string; description: string }> = selectedComponent.props.items || [];
                            const addItem = () => handlePropChange('items', [...items, { icon: 'zap', title: 'จุดเด่นใหม่', description: 'รายละเอียด...' }]);
                            const updateItem = (idx: number, field: string, val: string) => {
                                const next = items.map((it, i) => i === idx ? { ...it, [field]: val } : it);
                                handlePropChange('items', next);
                            };
                            const removeItem = (idx: number) => handlePropChange('items', items.filter((_, i) => i !== idx));
                            return (
                                <>
                                    {/* ── 🎨 Icon Style ── */}
                                    <div style={{ marginBottom: '16px', padding: '10px', background: 'var(--color-surface-secondary)', borderRadius: '8px', border: '1px solid var(--color-surface-border)' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🎨 Icon Style</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
                                            {([
                                                { id: 'outline', label: 'Outline', shape: '8px', bg: 'transparent', iconFill: false, border: '1.5px solid', shadow: false },
                                                { id: 'filled', label: 'Filled', shape: '50%', bg: '#fff', iconFill: true, border: '1.5px solid #e2e8f0', shadow: true },
                                                { id: 'gradient', label: 'Gradient', shape: '50%', bg: 'linear-gradient(135deg, #4a90e2, #7c3aed)', iconFill: true, border: 'none', shadow: true },
                                                { id: 'duotone', label: 'Duotone', shape: '8px', bg: 'rgba(74,144,226,0.12)', iconFill: false, border: 'none', shadow: false },
                                                { id: 'boxed', label: 'Boxed', shape: '6px', bg: '#4a90e2', iconFill: true, border: 'none', shadow: true },
                                            ] as const).map((s) => {
                                                const isActive = (selectedComponent.props.iconStyle || 'outline') === s.id;
                                                return (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => handlePropChange('iconStyle', s.id)}
                                                        style={{
                                                            padding: '8px 2px',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.6rem',
                                                            fontWeight: 600,
                                                            textAlign: 'center',
                                                            background: isActive ? 'var(--theme-primary, #4a90e2)' : 'var(--color-surface-primary, #fff)',
                                                            color: isActive ? '#fff' : 'var(--color-text-secondary)',
                                                            border: isActive ? '2px solid var(--theme-primary, #4a90e2)' : '1px solid var(--color-surface-border, #e2e8f0)',
                                                            transition: 'all 0.2s ease',
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: '28px', height: '28px',
                                                            borderRadius: s.shape,
                                                            margin: '0 auto 4px',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            background: s.bg,
                                                            border: s.border,
                                                            borderColor: s.id === 'outline' ? (isActive ? '#fff' : '#94a3b8') : undefined,
                                                            boxShadow: s.shadow ? '0 2px 6px rgba(0,0,0,0.12)' : 'none',
                                                            color: s.iconFill ? '#fff' : (isActive ? '#fff' : '#4a90e2'),
                                                        }}>
                                                            {s.iconFill ? (
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                                                            ) : (
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                                                            )}
                                                        </div>
                                                        {s.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Badge</label>
                                        <input
                                            type="text"
                                            value={selectedComponent.props.badge || ''}
                                            onChange={(e) => handlePropChange('badge', e.target.value)}
                                            className="form-control"
                                            placeholder="Why Choose Us"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Title</label>
                                        <input
                                            type="text"
                                            value={selectedComponent.props.title || ''}
                                            onChange={(e) => handlePropChange('title', e.target.value)}
                                            className="form-control"
                                            placeholder="ทำไมถึงเลือกเรา"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Subtitle</label>
                                        <textarea
                                            value={selectedComponent.props.subtitle || ''}
                                            onChange={(e) => handlePropChange('subtitle', e.target.value)}
                                            rows={2}
                                            className="form-control"
                                            placeholder="คำอธิบายเพิ่มเติม..."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>การ์ดจุดเด่น ({items.length})</span>
                                            <button className="btn btn-sm btn-primary" onClick={addItem} style={{ fontSize: '11px', padding: '2px 8px' }}>+ เพิ่ม</button>
                                        </label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                                            {items.map((item, idx) => (
                                                <div key={idx} style={{ background: 'var(--color-surface-secondary, #f0fdf4)', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-surface-border, #bbf7d0)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--theme-primary, #4a90e2)' }}>#{idx + 1}</span>
                                                        {items.length > 1 && <button className="btn btn-sm btn-danger" onClick={() => removeItem(idx)} style={{ fontSize: '10px', padding: '1px 5px' }}>✕</button>}
                                                    </div>
                                                    {/* Icon Picker Grid */}
                                                    <div style={{ marginBottom: '8px' }}>
                                                        <label style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Icon</label>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '3px' }}>
                                                            {WHYUS_ICON_OPTIONS.map((opt) => (
                                                                <button
                                                                    key={opt.id}
                                                                    title={opt.label}
                                                                    onClick={() => updateItem(idx, 'icon', opt.id)}
                                                                    style={{
                                                                        width: '28px', height: '28px',
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                        borderRadius: '6px', cursor: 'pointer',
                                                                        background: item.icon === opt.id ? 'var(--theme-primary, #4a90e2)' : 'var(--color-surface-primary, #fff)',
                                                                        color: item.icon === opt.id ? '#fff' : '#64748b',
                                                                        border: item.icon === opt.id ? '2px solid var(--theme-primary, #4a90e2)' : '1px solid #e2e8f0',
                                                                        transition: 'all 0.15s ease',
                                                                        padding: 0,
                                                                    }}
                                                                >
                                                                    {MINI_ICONS[opt.id] || opt.label[0]}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={item.title}
                                                        onChange={(e) => updateItem(idx, 'title', e.target.value)}
                                                        className="form-control"
                                                        placeholder="หัวข้อ"
                                                        style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}
                                                    />
                                                    <textarea
                                                        value={item.description}
                                                        onChange={(e) => updateItem(idx, 'description', e.target.value)}
                                                        rows={2}
                                                        className="form-control"
                                                        placeholder="รายละเอียด..."
                                                        style={{ fontSize: '11px' }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            );
                        })()}

                        {/* ── COLUMNS (container) ── */}
                        {selectedComponent.type === 'columns' && (
                            <>
                                <div className="form-group">
                                    <label>Column Ratio</label>
                                    <select
                                        value={selectedComponent.props.ratio || 'equal'}
                                        onChange={(e) => handlePropChange('ratio', e.target.value)}
                                    >
                                        <option value="equal">Equal (50/50)</option>
                                        <option value="1:2">1:2 (33/67)</option>
                                        <option value="2:1">2:1 (67/33)</option>
                                        <option value="1:3">1:3 (25/75)</option>
                                        <option value="3:1">3:1 (75/25)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Gap Between Columns</label>
                                    <select
                                        value={selectedComponent.props.gap || '24px'}
                                        onChange={(e) => handlePropChange('gap', e.target.value)}
                                    >
                                        <option value="0px">None</option>
                                        <option value="8px">Small (8px)</option>
                                        <option value="16px">Medium (16px)</option>
                                        <option value="24px">Large (24px)</option>
                                        <option value="48px">Extra Large (48px)</option>
                                    </select>
                                </div>
                                <div className="columns-info">
                                    <span>Note:</span>
                                    <p>Click a component inside a column to edit its content.</p>
                                </div>
                            </>
                        )}

                    </div>
            </div>

            {/* Delete confirmation popup */}
            <ConfirmDialog
                open={!!confirmDeleteId}
                title="ลบ Component"
                message={`คุณต้องการลบ "${confirmDeleteId ? (typeLabels[(findComponentById(confirmDeleteId) || {type:''}).type as string] || 'Component') : ''}" ใช่ไหม? การดำเนินการนี้ไม่สามารถกู้คืนได้`}
                confirmText="ยืนยันลบ"
                cancelText="ยกเลิก"
                variant="danger"
                onConfirm={() => {
                    if (confirmDeleteId) {
                        deleteComponent(confirmDeleteId);
                        setConfirmDeleteId(null);
                    }
                }}
                onCancel={() => setConfirmDeleteId(null)}
            />
        </div>
    );
}
