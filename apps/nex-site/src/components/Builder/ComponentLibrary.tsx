import { useState, ReactNode } from 'react';
import { usePageBuilderStore } from '../../store/pageBuilderStore';
import './ComponentLibrary.css';

interface ComponentTemplate {
    id: string;
    name: string;
    icon: ReactNode;
    category: string;
    defaultProps: Record<string, any>;
}

// ── SVG Icon helpers (Lucide-style, 20×20) ──
const s = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const ICONS = {
    // Sections
    navbar:      <svg {...s}><rect x="3" y="3" width="18" height="4" rx="1"/><line x1="3" y1="12" x2="11" y2="12"/><line x1="3" y1="16" x2="8" y2="16"/></svg>,
    hero:        <svg {...s}><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>,
    features:    <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
    techstack:   <svg {...s}><path d="m12.83 2.18a2 2 0 00-1.66 0L2.6 6.08a1 1 0 000 1.83l8.58 3.91a2 2 0 001.66 0l8.58-3.9a1 1 0 000-1.84z"/><path d="m2 17 8.58 3.91a2 2 0 001.66 0L20.76 17"/><path d="m2 12 8.58 3.91a2 2 0 001.66 0L20.76 12"/></svg>,
    stats:       <svg {...s}><path d="M3 3v18h18"/><path d="M7 17V9"/><path d="M11 17V5"/><path d="M15 17v-4"/><path d="M19 17v-8"/></svg>,
    testimonials:<svg {...s}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/></svg>,
    cta:         <svg {...s}><path d="M22 12A10 10 0 1112 2"/><path d="M16 8l6-6"/><path d="M22 2v6h-6"/></svg>,
    portfolio:   <svg {...s}><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M2 8h20"/><path d="M8 2v20"/></svg>,
    careers:     <svg {...s}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="12.01"/></svg>,
    contactform: <svg {...s}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    footer:      <svg {...s}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="19" x2="15" y2="19"/></svg>,
    whyus:       <svg {...s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
    // Basic
    heading:     <svg {...s}><path d="M6 4v16"/><path d="M18 4v16"/><path d="M6 12h12"/></svg>,
    text:        <svg {...s}><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/></svg>,
    button:      <svg {...s}><rect x="3" y="7" width="18" height="10" rx="5"/><line x1="9" y1="12" x2="15" y2="12"/></svg>,
    image:       <svg {...s}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 00-2.82 0L6 21"/></svg>,
    spacer:      <svg {...s}><path d="M12 5v14"/><path d="M5 5h14"/><path d="M5 19h14"/><path d="M9 8l3-3 3 3"/><path d="M9 16l3 3 3-3"/></svg>,
    divider:     <svg {...s}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="7" y2="6"/><line x1="17" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="7" y2="18"/><line x1="17" y1="18" x2="21" y2="18"/></svg>,
    alert:       <svg {...s}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    // Media
    video:       <svg {...s}><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    sociallinks: <svg {...s}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
    // Interactive
    accordion:   <svg {...s}><rect x="3" y="3" width="18" height="6" rx="1.5"/><line x1="15" y1="6" x2="18" y2="6"/><rect x="3" y="11" width="18" height="6" rx="1.5" opacity=".6"/><line x1="15" y1="14" x2="18" y2="14"/><rect x="3" y="19" width="18" height="2" rx="1" opacity=".3"/></svg>,
};

const componentTemplates: ComponentTemplate[] = [
    {
        id: 'navbar',
        name: 'Navbar',
        icon: ICONS.navbar,
        category: 'Sections',
        defaultProps: {
            logo: 'TechBiz',
            logoIcon: '✨',
            items: [
                { label: 'หน้าแรก', href: '#home' },
                { label: 'เกี่ยวกับเรา', href: '#about' },
                { label: 'บริการของเรา', href: '#services' },
                { label: 'งานที่เปิดรับ', href: '#careers' },
                { label: 'ติดต่อเรา', href: '#contact' },
            ],
            sticky: true,
        },
    },
    {
        id: 'hero',
        name: 'Hero Section',
        icon: ICONS.hero,
        category: 'Sections',
        defaultProps: {
            slides: [
                {
                    title: 'Transform Your Business\nWith Technology',
                    subtitle: 'บริษัท Tech Biz Convergence นำเสนอโซลูชั่นด้านไอทีที่ครบวงจร ขับเคลื่อนองค์กรของคุณสู่ยุคดิจิทัลด้วยนวัตกรรมล้ำสมัย',
                    buttonText: 'เริ่มต้นกับเรา',
                    buttonLink: '#contact',
                    backgroundImage: '',
                    badge: '⚡ Innovation · Technology · Growth',
                },
            ],
            autoPlayInterval: 6000,
        },
    },
    {
        id: 'features',
        name: 'Features Grid',
        icon: ICONS.features,
        category: 'Sections',
        defaultProps: {
            title: 'Our Features',
            columns: 3,
            items: [],
        },
    },
    {
        id: 'techstack',
        name: 'Tech Stack',
        icon: ICONS.techstack,
        category: 'Sections',
        defaultProps: {},
    },
    {
        id: 'stats',
        name: 'Stats & About',
        icon: ICONS.stats,
        category: 'Sections',
        defaultProps: {},
    },
    {
        id: 'testimonials',
        name: 'Testimonials',
        icon: ICONS.testimonials,
        category: 'Sections',
        defaultProps: {},
    },
    {
        id: 'cta',
        name: 'Call To Action',
        icon: ICONS.cta,
        category: 'Sections',
        defaultProps: {
            title: 'พร้อมเริ่มต้นแล้วหรือยัง?\nติดต่อเราวันนี้',
            subtitle: 'ทีมผู้เชี่ยวชาญพร้อมให้คำปรึกษา ไม่มีข้อผูกมัด',
            primaryText: 'ปรึกษาผู้เชี่ยวชาญฟรี',
            primaryLink: '#contact',
            secondaryText: 'ดูผลงานของเรา',
            secondaryLink: '#portfolio',
        },
    },
    {
        id: 'portfolio',
        name: 'Portfolio Grid',
        icon: ICONS.portfolio,
        category: 'Sections',
        defaultProps: {},
    },
    {
        id: 'careers',
        name: 'Job Listings',
        icon: ICONS.careers,
        category: 'Sections',
        defaultProps: {},
    },
    {
        id: 'contactform',
        name: 'Contact Form',
        icon: ICONS.contactform,
        category: 'Sections',
        defaultProps: {},
    },
    {
        id: 'footer',
        name: 'Footer',
        icon: ICONS.footer,
        category: 'Sections',
        defaultProps: {},
    },

    {
        id: 'heading',
        name: 'Heading',
        icon: ICONS.heading,
        category: 'Basic',
        defaultProps: {
            text: 'Heading Text',
            level: 'h2',
            align: 'left',
        },
    },
    {
        id: 'text',
        name: 'Text',
        icon: ICONS.text,
        category: 'Basic',
        defaultProps: {
            content: 'Enter your text here',
            fontSize: '16px',
        },
    },
    {
        id: 'button',
        name: 'Button',
        icon: ICONS.button,
        category: 'Basic',
        defaultProps: {
            text: 'Click Me',
            variant: 'primary',
            size: 'medium',
        },
    },
    {
        id: 'image',
        name: 'Image',
        icon: ICONS.image,
        category: 'Basic',
        defaultProps: {
            src: '',
            alt: 'Image description',
            width: '100%',
        },
    },
    {
        id: 'spacer',
        name: 'Spacer',
        icon: ICONS.spacer,
        category: 'Basic',
        defaultProps: {
            height: '60px',
            mobileHeight: '40px',
        },
    },
    {
        id: 'divider',
        name: 'Divider',
        icon: ICONS.divider,
        category: 'Basic',
        defaultProps: {
            variant: 'solid',
            color: '#e2e8f0',
            thickness: '1px',
            width: '100%',
            marginY: '32px',
        },
    },
    {
        id: 'alert',
        name: 'Alert / Banner',
        icon: ICONS.alert,
        category: 'Basic',
        defaultProps: {
            variant: 'info',
            title: '',
            message: 'This is an alert message',
            icon: '',
        },
    },
    {
        id: 'video',
        name: 'Video Embed',
        icon: ICONS.video,
        category: 'Media',
        defaultProps: {
            url: '',
            title: 'Video',
            aspectRatio: '16:9',
            maxWidth: '800px',
        },
    },
    {
        id: 'sociallinks',
        name: 'Social Links',
        icon: ICONS.sociallinks,
        category: 'Media',
        defaultProps: {
            links: [
                { platform: 'facebook', url: 'https://facebook.com' },
                { platform: 'line', url: '#' },
                { platform: 'instagram', url: 'https://instagram.com' },
            ],
            size: 'medium',
            variant: 'filled',
            align: 'center',
        },
    },
    {
        id: 'accordion',
        name: 'Accordion / FAQ',
        icon: ICONS.accordion,
        category: 'Interactive',
        defaultProps: {
            title: 'คำถามที่พบบ่อย',
            subtitle: 'คำตอบสำหรับข้อสงสัยที่เรามักจะได้รับ',
            items: [
                { question: 'บริการของเราครอบคลุมอะไรบ้าง?', answer: 'เราให้บริการพัฒนาซอฟต์แวร์ เว็บไซต์ แอปมือถือ และระบบ IT ครบวงจร' },
                { question: 'ค่าใช้จ่ายเริ่มต้นเท่าไหร่?', answer: 'ขึ้นอยู่กับขอบเขตโปรเจกต์ ปรึกษาเราเพื่อรับใบเสนอราคาฟรี' },
                { question: 'ระยะเวลาพัฒนาประมาณเท่าไหร่?', answer: 'ตั้งแต่ 2 สัปดาห์ สำหรับเว็บไซต์ ถึง 3-6 เดือนสำหรับแอปขนาดใหญ่' },
            ],
            allowMultiple: false,
            variant: 'default',
        },
    },
    {
        id: 'whyus',
        name: 'Why Choose Us',
        icon: ICONS.whyus,
        category: 'Sections',
        defaultProps: {
            badge: 'Why Choose Us',
            title: 'ทำไมถึงเลือกเรา',
            subtitle: 'เราพร้อมส่งมอบบริการที่ดีที่สุดให้กับลูกค้าทุกท่าน',
            items: [
                { icon: '🚀', title: 'เทคโนโลยีล้ำสมัย', description: 'ใช้เครื่องมือและเทคโนโลยีที่ทันสมัยที่สุด' },
                { icon: '👨‍💻', title: 'ทีมงานมืออาชีพ', description: 'ทีมพัฒนาที่มีประสบการณ์กว่า 10 ปี' },
                { icon: '🤝', title: 'ให้คำปรึกษาฟรี', description: 'ปรึกษาเรื่องเทคโนโลยีไม่มีค่าใช้จ่าย' },
                { icon: '⏰', title: 'ส่งงานตรงเวลา', description: 'ระบบบริหารจัดการที่ช่วยให้ส่งงานทันกำหนด' },
                { icon: '💎', title: 'คุณภาพระดับสากล', description: 'ผลงานผ่านมาตรฐานการทดสอบอย่างเข้มงวด' },
                { icon: '🔒', title: 'ความปลอดภัยสูง', description: 'ให้ความสำคัญกับความปลอดภัยของข้อมูลลูกค้า' },
            ],
        },
    },
];

const categories = Array.from(new Set(componentTemplates.map((c) => c.category)));

// Tab config with nice icons
const TAB_S = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const tabConfig: Record<string, { icon: ReactNode; label: string }> = {
    all:         { icon: <svg {...TAB_S}><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>, label: 'ทั้งหมด' },
    Sections:    { icon: <svg {...TAB_S}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>, label: 'Sections' },
    Basic:       { icon: <svg {...TAB_S}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>, label: 'Basic' },
    Media:       { icon: <svg {...TAB_S}><polygon points="5 3 19 12 5 21 5 3"/></svg>, label: 'Media' },
    Interactive: { icon: <svg {...TAB_S}><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/><polyline points="10 9 7 6 10 3"/></svg>, label: 'Interactive' },
};

export default function ComponentLibrary() {
    const addComponent = usePageBuilderStore((state) => state.addComponent);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [search, setSearch] = useState('');

    const handleDragStart = (e: React.DragEvent, template: ComponentTemplate) => {
        e.dataTransfer.setData('component', JSON.stringify({
            id: `${template.id}-${Date.now()}`,
            type: template.id,
            props: template.defaultProps,
        }));
    };

    const handleAddComponent = (template: ComponentTemplate) => {
        addComponent({
            id: `${template.id}-${Date.now()}`,
            type: template.id,
            props: template.defaultProps,
        });
    };

    // Filter by tab + search
    const filteredTemplates = componentTemplates.filter((c) => {
        const matchTab = activeTab === 'all' || c.category === activeTab;
        const matchSearch = search === '' ||
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.id.toLowerCase().includes(search.toLowerCase());
        return matchTab && matchSearch;
    });

    // Group by category for display
    const visibleCategories = activeTab === 'all'
        ? categories.filter(cat => filteredTemplates.some(c => c.category === cat))
        : [activeTab].filter(cat => filteredTemplates.some(c => c.category === cat));

    return (
        <div className="component-library">
            <div className="library-header">
                <h3>Components</h3>
                <input
                    type="text"
                    placeholder="Search components..."
                    className="search-input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* ── Category Tabs ── */}
            <div className="library-tabs">
                {['all', ...categories].map((tab) => {
                    const config = tabConfig[tab] || { icon: '', label: tab };
                    const count = tab === 'all'
                        ? componentTemplates.filter(c =>
                            search === '' ||
                            c.name.toLowerCase().includes(search.toLowerCase()) ||
                            c.id.toLowerCase().includes(search.toLowerCase())
                        ).length
                        : componentTemplates.filter(c =>
                            c.category === tab && (
                                search === '' ||
                                c.name.toLowerCase().includes(search.toLowerCase()) ||
                                c.id.toLowerCase().includes(search.toLowerCase())
                            )
                        ).length;

                    return (
                        <button
                            key={tab}
                            className={`library-tab ${activeTab === tab ? 'library-tab-active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            <span className="library-tab-icon">{config.icon}</span>
                            <span className="library-tab-label">{config.label}</span>
                            <span className="library-tab-count">{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* ── Component List ── */}
            <div className="library-content">
                {filteredTemplates.length === 0 ? (
                    <div className="library-empty">
                        <div className="library-empty-icon">—</div>
                        <p>ไม่พบ component</p>
                        <p className="library-empty-hint">ลองค้นหาด้วยคำอื่น</p>
                    </div>
                ) : (
                    visibleCategories.map((category) => (
                        <div key={category} className="component-category">
                            {activeTab === 'all' && (
                                <div className="category-header">{category}</div>
                            )}
                            <div className="component-grid">
                                {filteredTemplates
                                    .filter((c) => c.category === category)
                                    .map((template) => (
                                        <div
                                            key={template.id}
                                            className={`component-item ${template.category === 'Sections' ? 'section-item' : ''}`}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, template)}
                                            onClick={() => handleAddComponent(template)}
                                            title={`Add ${template.name}`}
                                        >
                                            {template.icon && <div className="component-icon">{template.icon}</div>}
                                            <div className="component-name">{template.name}</div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
