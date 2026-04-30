import { useState } from 'react';
import { usePageBuilderStore } from '../../store/pageBuilderStore';
import './LayersPanel.css';

// ─── Layout Templates ────────────────────────────────────────────────────────

interface LayoutTemplate {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    components: Array<{ type: string; props: Record<string, any> }>;
}

const layoutTemplates: LayoutTemplate[] = [
    {
        id: 'single-column',
        name: 'Single Column',
        description: 'Full-width stacked layout',
        icon: (
            <svg viewBox="0 0 60 40" fill="none">
                <rect x="4" y="4" width="52" height="10" rx="2" fill="currentColor" opacity="0.7" />
                <rect x="4" y="18" width="52" height="10" rx="2" fill="currentColor" opacity="0.5" />
                <rect x="4" y="32" width="52" height="6" rx="2" fill="currentColor" opacity="0.3" />
            </svg>
        ),
        components: [
            { type: 'hero', props: { title: 'Welcome to Our Platform', subtitle: 'Build amazing landing pages in minutes', buttonText: 'Get Started', backgroundImage: '' } },
            { type: 'features', props: { title: 'Our Features', columns: 3, items: [] } },
        ],
    },
    {
        id: 'two-column',
        name: 'Two Column',
        description: 'Side-by-side content layout',
        icon: (
            <svg viewBox="0 0 60 40" fill="none">
                <rect x="4" y="4" width="52" height="8" rx="2" fill="currentColor" opacity="0.7" />
                <rect x="4" y="16" width="25" height="20" rx="2" fill="currentColor" opacity="0.5" />
                <rect x="31" y="16" width="25" height="20" rx="2" fill="currentColor" opacity="0.5" />
            </svg>
        ),
        components: [
            { type: 'heading', props: { text: 'Two Column Layout', level: 'h1', align: 'center' } },
            {
                type: 'columns',
                props: {
                    ratio: 'equal',
                    gap: '24px',
                    columns: [
                        { components: [{ id: 'col1-text', type: 'text', props: { content: 'Left column content goes here. Add your text, images, or other elements.', fontSize: '16px', align: 'left' } }] },
                        { components: [{ id: 'col2-text', type: 'text', props: { content: 'Right column content goes here. Add your text, images, or other elements.', fontSize: '16px', align: 'left' } }] },
                    ],
                },
            },
        ],
    },
    {
        id: 'split-screen',
        name: 'Split Screen',
        description: 'Equal halves with contrast',
        icon: (
            <svg viewBox="0 0 60 40" fill="none">
                <rect x="4" y="4" width="25" height="32" rx="2" fill="currentColor" opacity="0.7" />
                <rect x="31" y="4" width="25" height="32" rx="2" fill="currentColor" opacity="0.3" />
            </svg>
        ),
        components: [
            {
                type: 'columns',
                props: {
                    ratio: 'equal',
                    gap: '0px',
                    columns: [
                        { components: [{ id: 'split-left', type: 'hero', props: { title: 'Left Side', subtitle: 'Your main message here', buttonText: 'Get Started', backgroundImage: '' } }] },
                        { components: [{ id: 'split-right', type: 'text', props: { content: 'Complementary content on the right side of the screen. Add images, features, or any other elements here.', fontSize: '18px', align: 'center' } }] },
                    ],
                },
            },
        ],
    },
    {
        id: 'hero-features',
        name: 'Hero + Features',
        description: 'Hero section with feature grid',
        icon: (
            <svg viewBox="0 0 60 40" fill="none">
                <rect x="4" y="4" width="52" height="14" rx="2" fill="currentColor" opacity="0.7" />
                <rect x="4" y="22" width="15" height="14" rx="2" fill="currentColor" opacity="0.5" />
                <rect x="22" y="22" width="15" height="14" rx="2" fill="currentColor" opacity="0.5" />
                <rect x="40" y="22" width="16" height="14" rx="2" fill="currentColor" opacity="0.5" />
            </svg>
        ),
        components: [
            { type: 'hero', props: { title: 'Welcome to Our Platform', subtitle: 'Build amazing landing pages in minutes', buttonText: 'Get Started', backgroundImage: '' } },
            { type: 'features', props: { title: 'Why Choose Us', columns: 3, items: [] } },
        ],
    },
    {
        id: 'card-grid',
        name: 'Card Grid',
        description: 'Grid of content cards',
        icon: (
            <svg viewBox="0 0 60 40" fill="none">
                <rect x="4" y="4" width="52" height="8" rx="2" fill="currentColor" opacity="0.7" />
                <rect x="4" y="16" width="15" height="20" rx="2" fill="currentColor" opacity="0.4" />
                <rect x="22" y="16" width="15" height="20" rx="2" fill="currentColor" opacity="0.4" />
                <rect x="40" y="16" width="16" height="20" rx="2" fill="currentColor" opacity="0.4" />
            </svg>
        ),
        components: [
            { type: 'heading', props: { text: 'Our Services', level: 'h2', align: 'center' } },
            { type: 'text', props: { content: 'Discover what we offer to help your business grow.', fontSize: '16px', align: 'center' } },
            { type: 'features', props: { title: '', columns: 3, items: [] } },
        ],
    },
    {
        id: 'landing-full',
        name: 'Full Landing',
        description: 'Complete landing page layout',
        icon: (
            <svg viewBox="0 0 60 40" fill="none">
                <rect x="4" y="2" width="52" height="6" rx="1" fill="currentColor" opacity="0.8" />
                <rect x="4" y="11" width="52" height="10" rx="2" fill="currentColor" opacity="0.6" />
                <rect x="4" y="25" width="15" height="10" rx="2" fill="currentColor" opacity="0.4" />
                <rect x="22" y="25" width="15" height="10" rx="2" fill="currentColor" opacity="0.4" />
                <rect x="40" y="25" width="16" height="10" rx="2" fill="currentColor" opacity="0.4" />
            </svg>
        ),
        components: [
            { type: 'hero', props: { title: 'Build Your Dream Landing Page', subtitle: 'Create stunning, high-converting pages with ease', buttonText: 'Start Free Trial', backgroundImage: '' } },
            { type: 'features', props: { title: 'Everything You Need', columns: 3, items: [] } },
            { type: 'heading', props: { text: 'Ready to Get Started?', level: 'h2', align: 'center' } },
            { type: 'text', props: { content: 'Join thousands of businesses already using our platform.', fontSize: '18px', align: 'center' } },
            { type: 'button', props: { text: 'Start Free Trial', variant: 'primary', size: 'large', link: '#', align: 'center' } },
        ],
    },
    {
        id: 'z-shape',
        name: 'Z-Shape',
        description: 'Alternating content layout',
        icon: (
            <svg viewBox="0 0 60 40" fill="none">
                <rect x="4" y="4" width="25" height="14" rx="2" fill="currentColor" opacity="0.6" />
                <rect x="31" y="4" width="25" height="14" rx="2" fill="currentColor" opacity="0.3" />
                <rect x="4" y="22" width="25" height="14" rx="2" fill="currentColor" opacity="0.3" />
                <rect x="31" y="22" width="25" height="14" rx="2" fill="currentColor" opacity="0.6" />
            </svg>
        ),
        components: [
            {
                type: 'columns',
                props: {
                    ratio: 'equal',
                    gap: '32px',
                    columns: [
                        { components: [{ id: 'z1-text', type: 'heading', props: { text: 'Feature One', level: 'h2', align: 'left' } }, { id: 'z1-desc', type: 'text', props: { content: 'Description of the first feature. Explain the value it brings.', fontSize: '16px', align: 'left' } }] },
                        { components: [{ id: 'z1-img', type: 'image', props: { src: '', alt: 'Feature image' } }] },
                    ],
                },
            },
            {
                type: 'columns',
                props: {
                    ratio: 'equal',
                    gap: '32px',
                    columns: [
                        { components: [{ id: 'z2-img', type: 'image', props: { src: '', alt: 'Feature image' } }] },
                        { components: [{ id: 'z2-text', type: 'heading', props: { text: 'Feature Two', level: 'h2', align: 'left' } }, { id: 'z2-desc', type: 'text', props: { content: 'Description of the second feature. Explain the value it brings.', fontSize: '16px', align: 'left' } }] },
                    ],
                },
            },
        ],
    },
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Clean, simple layout',
        icon: (
            <svg viewBox="0 0 60 40" fill="none">
                <rect x="15" y="8" width="30" height="6" rx="2" fill="currentColor" opacity="0.7" />
                <rect x="10" y="18" width="40" height="4" rx="2" fill="currentColor" opacity="0.4" />
                <rect x="20" y="26" width="20" height="8" rx="4" fill="currentColor" opacity="0.6" />
            </svg>
        ),
        components: [
            { type: 'heading', props: { text: 'Simple. Powerful. Beautiful.', level: 'h1', align: 'center' } },
            { type: 'text', props: { content: 'A clean and minimal approach to showcase your product or service.', fontSize: '18px', align: 'center' } },
            { type: 'button', props: { text: 'Learn More', variant: 'primary', size: 'large', link: '#', align: 'center' } },
        ],
    },
    {
        id: 'magazine',
        name: 'Magazine',
        description: 'Editorial content layout',
        icon: (
            <svg viewBox="0 0 60 40" fill="none">
                <rect x="4" y="4" width="52" height="8" rx="2" fill="currentColor" opacity="0.7" />
                <rect x="4" y="16" width="33" height="20" rx="2" fill="currentColor" opacity="0.5" />
                <rect x="40" y="16" width="16" height="9" rx="2" fill="currentColor" opacity="0.4" />
                <rect x="40" y="27" width="16" height="9" rx="2" fill="currentColor" opacity="0.4" />
            </svg>
        ),
        components: [
            { type: 'heading', props: { text: 'Latest Stories', level: 'h1', align: 'left' } },
            {
                type: 'columns',
                props: {
                    ratio: '2:1',
                    gap: '24px',
                    columns: [
                        { components: [{ id: 'mag-main', type: 'text', props: { content: 'Main featured article content goes here. This is the primary story with more detail and emphasis.', fontSize: '16px', align: 'left' } }] },
                        {
                            components: [
                                { id: 'mag-side1', type: 'heading', props: { text: 'Side Story 1', level: 'h3', align: 'left' } },
                                { id: 'mag-side2', type: 'heading', props: { text: 'Side Story 2', level: 'h3', align: 'left' } },
                            ]
                        },
                    ],
                },
            },
        ],
    },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LayersPanel() {
    const { currentPage, setCurrentPage } =
        usePageBuilderStore();
    const [confirmTemplate, setConfirmTemplate] = useState<LayoutTemplate | null>(null);

    // ── Apply template ──
    const applyTemplate = (template: LayoutTemplate) => {
        if (!currentPage) return;
        const newComponents = template.components.map((c, i) => ({
            id: `${c.type}-${Date.now()}-${i}`,
            type: c.type,
            props: c.props,
        }));
        setCurrentPage({ ...currentPage, layout: newComponents });
        setConfirmTemplate(null);
    };

    return (
        <div className="layers-panel">
            {/* ── TEMPLATES ── */}
            <div className="templates-view">
                <p className="templates-hint">
                    Choose a layout template. <strong>Existing content will be replaced.</strong>
                </p>
                <div className="templates-grid">
                    {layoutTemplates.map((template) => (
                        <div
                            key={template.id}
                            className="template-card"
                            onClick={() => setConfirmTemplate(template)}
                        >
                            <div className="template-preview">{template.icon}</div>
                            <div className="template-info">
                                <div className="template-name">{template.name}</div>
                                <div className="template-desc">{template.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── CONFIRM DIALOG ── */}
            {confirmTemplate && (
                <div className="template-confirm-overlay" onClick={() => setConfirmTemplate(null)}>
                    <div className="template-confirm-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-icon">{confirmTemplate.icon}</div>
                        <h3>Apply "{confirmTemplate.name}"?</h3>
                        <p>This will replace your current layout with {confirmTemplate.components.length} components.</p>
                        <div className="confirm-actions">
                            <button className="btn-cancel" onClick={() => setConfirmTemplate(null)}>
                                Cancel
                            </button>
                            <button className="btn-apply" onClick={() => applyTemplate(confirmTemplate)}>
                                Apply Template
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
