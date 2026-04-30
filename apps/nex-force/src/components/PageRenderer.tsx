'use client';

import { Page, ComponentInstance } from '@/lib/api';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import Heading from '@/components/Heading';
import Text from '@/components/Text';
import Button from '@/components/Button';
import Image from '@/components/Image';
import Stats from '@/components/Stats';
import CallToAction from '@/components/CallToAction';
import TechStack from '@/components/TechStack';
import Testimonials from '@/components/Testimonials';
import ContactForm from '@/components/ContactForm';
import Portfolio from '@/components/Portfolio';
import Careers from '@/components/Careers';
import Spacer from '@/components/Spacer';
import Divider from '@/components/Divider';
import VideoEmbed from '@/components/VideoEmbed';
import AlertBanner from '@/components/AlertBanner';
import SocialLinks from '@/components/SocialLinks';
import Accordion from '@/components/Accordion';
import WhyUs from '@/components/WhyUs';
import styles from '@/components/PageRenderer.module.css';

interface PageRendererProps {
    page: Page;
}

// Component mapping — maps component type strings to React components
const ComponentMap: Record<string, React.ComponentType<any>> = {
    hero: Hero,
    features: Features,
    header: Header,
    navbar: Navbar,
    footer: Footer,
    heading: Heading,
    text: Text,
    button: Button,
    image: Image,
    stats: Stats,
    cta: CallToAction,
    techstack: TechStack,
    testimonials: Testimonials,
    contactform: ContactForm,
    portfolio: Portfolio,
    careers: Careers,
    spacer: Spacer,
    divider: Divider,
    video: VideoEmbed,
    alert: AlertBanner,
    sociallinks: SocialLinks,
    accordion: Accordion,
    whyus: WhyUs,
    // Capitalised aliases (legacy)
    Hero,
    Features,
    Header,
    Navbar,
    Footer,
    Heading,
    Text,
    Button,
    Image,
    Stats,
    CallToAction,
    TechStack,
    Testimonials,
    ContactForm,
    Portfolio,
    Careers,
};

// Build inline style from props.layout (set via PropertiesPanel Style tab)
function buildLayoutStyle(layout?: Record<string, any>): React.CSSProperties {
    if (!layout) return {};
    return {
        ...(layout.width ? { width: layout.width } : {}),
        ...(layout.minHeight ? { minHeight: layout.minHeight } : {}),
        ...(layout.paddingTop ? { paddingTop: layout.paddingTop } : {}),
        ...(layout.paddingBottom ? { paddingBottom: layout.paddingBottom } : {}),
        ...(layout.paddingLeft ? { paddingLeft: layout.paddingLeft } : {}),
        ...(layout.paddingRight ? { paddingRight: layout.paddingRight } : {}),
        ...(layout.marginTop ? { marginTop: layout.marginTop } : {}),
        ...(layout.marginBottom ? { marginBottom: layout.marginBottom } : {}),
        ...(layout.backgroundColor ? { backgroundColor: layout.backgroundColor } : {}),
        ...(layout.backgroundImage
            ? {
                backgroundImage: `url(${layout.backgroundImage})`,
                backgroundSize: layout.backgroundSize || 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }
            : {}),
        ...(layout.borderRadius ? { borderRadius: layout.borderRadius } : {}),
        ...(layout.opacity !== undefined ? { opacity: layout.opacity } : {}),
        boxSizing: 'border-box',
    };
}

// Render a single non-columns component
function renderSingleComponent(component: ComponentInstance): React.ReactNode {
    // Try lowercase first (new format), then capitalised (legacy)
    const Component =
        ComponentMap[component.type] ||
        ComponentMap[component.type.charAt(0).toUpperCase() + component.type.slice(1)];

    if (!Component) {
        console.warn(`Component type "${component.type}" not found in ComponentMap`);
        return null;
    }

    const layoutStyle = buildLayoutStyle(component.props.layout);
    const hasLayout = Object.keys(layoutStyle).length > 1; // >1 because boxSizing is always there

    if (hasLayout) {
        return (
            <div key={component.id} style={layoutStyle}>
                <Component {...component.props} />
            </div>
        );
    }

    return <Component key={component.id} {...component.props} />;
}

// Render a columns container (side-by-side grid)
function renderColumnsComponent(component: ComponentInstance): React.ReactNode {
    const cols: Array<{ components: ComponentInstance[] }> = component.props.columns || [];
    const gap: string = component.props.gap || '24px';
    const layoutStyle = buildLayoutStyle(component.props.layout);

    // Priority: drag-saved gridTemplate > ratio preset > equal
    const getGridTemplate = (): string => {
        // gridTemplate stored as "0.6667 0.3333" (plain numbers, no "fr")
        const raw: string = component.props.gridTemplate || '';
        if (raw) {
            const parts = raw.trim().split(/\s+/);
            if (parts.length === cols.length && parts.every(p => !isNaN(parseFloat(p)))) {
                return parts.map(p => `${p}fr`).join(' ');
            }
            // Already has "fr" units
            if (raw.includes('fr')) return raw;
        }
        // Fallback to ratio preset
        const ratio: string = component.props.ratio || 'equal';
        switch (ratio) {
            case '1:2': return '1fr 2fr';
            case '2:1': return '2fr 1fr';
            case '1:3': return '1fr 3fr';
            case '3:1': return '3fr 1fr';
            default: return cols.map(() => '1fr').join(' ');
        }
    };

    return (
        <div
            key={component.id}
            className={styles.columnsContainer}
            style={{ gridTemplateColumns: getGridTemplate(), gap, ...layoutStyle }}
        >
            {cols.map((col, colIdx) => (
                <div key={colIdx} className={styles.columnSlot}>
                    {(col.components || []).map((child) => renderComponent(child))}
                </div>
            ))}
        </div>
    );
}



// Dispatch to correct renderer
function renderComponent(component: ComponentInstance): React.ReactNode {
    // Skip hidden components (toggled off in page builder)
    if (component.props.hidden === true) {
        return null;
    }
    if (component.type === 'columns') {
        return renderColumnsComponent(component);
    }
    return renderSingleComponent(component);
}

export default function PageRenderer({ page }: PageRendererProps) {
    if (!page.layout || page.layout.length === 0) {
        return (
            <div className={styles.pageContainer}>
                <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9ca3af' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📄</div>
                    <h2>This page has no content yet</h2>
                    <p>Add components in the page builder to get started.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            {page.layout.map((component) => renderComponent(component))}
        </div>
    );
}
