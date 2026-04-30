'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './Hero.module.css';
import { useLanguage } from '@/context/LanguageContext';

export interface HeroSlide {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
    backgroundImage?: string;
    badge?: string;
}

interface HeroProps {
    /* Legacy single-slide props */
    title?: string;
    subtitle?: string;
    buttonText?: string;
    backgroundImage?: string;
    /* Multi-slide props */
    slides?: HeroSlide[];
    autoPlayInterval?: number; // ms, default 6000
    /* Style variants */
    heroVariant?: 'default' | 'centered' | 'minimal' | 'fullwidth' | 'imageLeft' | 'wave';
    overlayOpacity?: number;
    showStats?: boolean;
}

const DEFAULT_SLIDES: HeroSlide[] = [
    {
        title: 'Transform Your Business\nWith Technology',
        subtitle: 'บริษัท Tech Biz Convergence นำเสนอโซลูชั่นด้านไอทีที่ครบวงจร ขับเคลื่อนองค์กรของคุณสู่ยุคดิจิทัลด้วยนวัตกรรมล้ำสมัย',
        buttonText: 'เริ่มต้นกับเรา',
        buttonLink: '#contact',
        badge: '✦ Innovation · Technology · Growth',
    },
];

export default function Hero({
    title,
    subtitle,
    buttonText,
    backgroundImage = '',
    slides,
    autoPlayInterval = 6000,
    heroVariant = 'default',
    overlayOpacity = 60,
    showStats = true,
}: HeroProps) {
    const { t, lang } = useLanguage();

    // Build slides array — use new slides prop or fall back to legacy single-slide props
    const heroSlides: HeroSlide[] = (slides && slides.length > 0)
        ? slides
        : [{
            title: title || DEFAULT_SLIDES[0].title,
            subtitle: subtitle || DEFAULT_SLIDES[0].subtitle,
            buttonText: buttonText || DEFAULT_SLIDES[0].buttonText,
            buttonLink: '#contact',
            backgroundImage: backgroundImage || '',
            badge: DEFAULT_SLIDES[0].badge,
        }];

    const [current, setCurrent] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [direction, setDirection] = useState<'left' | 'right'>('right');
    const totalSlides = heroSlides.length;

    // Auto-play
    useEffect(() => {
        if (totalSlides <= 1) return;
        const timer = setInterval(() => {
            setDirection('right');
            setIsAnimating(true);
            setTimeout(() => {
                setCurrent(prev => (prev + 1) % totalSlides);
                setIsAnimating(false);
            }, 500);
        }, autoPlayInterval);
        return () => clearInterval(timer);
    }, [totalSlides, autoPlayInterval]);

    const goTo = useCallback((idx: number) => {
        if (idx === current || isAnimating) return;
        setDirection(idx > current ? 'right' : 'left');
        setIsAnimating(true);
        setTimeout(() => {
            setCurrent(idx);
            setIsAnimating(false);
        }, 500);
    }, [current, isAnimating]);

    const goPrev = useCallback(() => {
        if (isAnimating) return;
        setDirection('left');
        setIsAnimating(true);
        setTimeout(() => {
            setCurrent(prev => (prev - 1 + totalSlides) % totalSlides);
            setIsAnimating(false);
        }, 500);
    }, [isAnimating, totalSlides]);

    const goNext = useCallback(() => {
        if (isAnimating) return;
        setDirection('right');
        setIsAnimating(true);
        setTimeout(() => {
            setCurrent(prev => (prev + 1) % totalSlides);
            setIsAnimating(false);
        }, 500);
    }, [isAnimating, totalSlides]);

    const slide = heroSlides[current];

    // Resolve translations
    const resolvedTitle = lang !== 'th'
        ? t('hero.title', slide.title || '')
        : (slide.title || t('hero.title', 'Transform Your Business\nWith Technology'));
    const resolvedSubtitle = lang !== 'th'
        ? t('hero.subtitle', slide.subtitle || '')
        : (slide.subtitle || t('hero.subtitle', 'บริษัท Tech Biz Convergence นำเสนอโซลูชั่นด้านไอทีที่ครบวงจร'));
    const resolvedButton = lang !== 'th'
        ? t('hero.button', slide.buttonText || 'เริ่มต้นกับเรา')
        : (slide.buttonText || t('hero.button', 'เริ่มต้นกับเรา'));
    const titleLines = resolvedTitle.split('\n');
    const resolvedBadge = slide.badge || '✦ Innovation · Technology · Growth';

    const VARIANT_CLASSES: Record<string, string> = {
        default: '',
        centered: styles.heroCentered || '',
        minimal: styles.heroMinimal || '',
        fullwidth: styles.heroFullwidth || '',
        imageLeft: styles.heroImageLeft || '',
        wave: styles.heroWave || '',
    };
    const variantClass = VARIANT_CLASSES[heroVariant] || '';

    return (
        <section
            className={`${styles.hero} ${variantClass}`}
            id="home"
            style={{
                ...(slide.backgroundImage ? { backgroundImage: `url(${slide.backgroundImage})` } : {}),
            }}
        >
            {/* Animated background */}
            <div className={styles.background}>
                <div className={styles.gradientOrb1} />
                <div className={styles.gradientOrb2} />
                <div className={styles.gradientOrb3} />
                <div className={styles.grid} />
            </div>

            <div className="container">
                <div className={styles.content}>
                    {/* ── Left: Text ── */}
                    <div
                        className={`${styles.textContent} ${isAnimating ? (direction === 'right' ? styles.slideOutLeft : styles.slideOutRight) : styles.slideIn}`}
                        key={`text-${current}`}
                    >
                        <div className={styles.badge}>
                            <span>{resolvedBadge}</span>
                        </div>

                        <h1 className={styles.title}>
                            {titleLines[0]}
                            {titleLines[1] && (
                                <span className={styles.titleGradient}>{titleLines[1]}</span>
                            )}
                        </h1>

                        <p className={styles.subtitle}>{resolvedSubtitle}</p>

                        <div className={styles.cta}>
                            <a href={slide.buttonLink || '#contact'} className={styles.ctaPrimary}>
                                {resolvedButton} <span>→</span>
                            </a>
                            <a href="#services" className={styles.ctaSecondary}>
                                <span>▶</span> {t('cta.secondary', 'ดูบริการของเรา')}
                            </a>
                        </div>

                        {showStats && (
                        <div className={styles.stats}>
                            <div className={styles.stat}>
                                <div className={styles.statNumber}>200+</div>
                                <div className={styles.statLabel}>{t('stats.projects', 'Projects Delivered')}</div>
                            </div>
                            <div className={styles.stat}>
                                <div className={styles.statNumber}>98%</div>
                                <div className={styles.statLabel}>{t('stats.clients', 'Client Satisfaction')}</div>
                            </div>
                            <div className={styles.stat}>
                                <div className={styles.statNumber}>10+</div>
                                <div className={styles.statLabel}>{t('stats.years', 'Years Experience')}</div>
                            </div>
                        </div>
                        )}
                    </div>

                    {/* ── Right: Visual ── */}
                    <div
                        className={`${styles.imageContent} ${isAnimating ? (direction === 'right' ? styles.slideOutLeft : styles.slideOutRight) : styles.slideIn}`}
                        key={`img-${current}`}
                    >
                        {slide.backgroundImage ? (
                            /* Show uploaded image */
                            <div className={styles.slideImageWrapper}>
                                <div className={styles.mockupGlow} />
                                <img
                                    src={slide.backgroundImage}
                                    alt={slide.title || 'Hero'}
                                    className={styles.slideImage}
                                />
                            </div>
                        ) : (
                            /* Default: Floating Dashboard Card */
                            <div className={styles.mockup}>
                                <div className={styles.mockupGlow} />
                                <div className={styles.mockupCard}>
                                    <div className={styles.mockupWindowBar}>
                                        <span /><span /><span />
                                    </div>
                                    <div className={styles.mockupMetric}>
                                        <span className={styles.metricLabel}>System Uptime</span>
                                        <span className={styles.metricValue}>99.97%</span>
                                        <span className={styles.metricBadge}>↑ Stable</span>
                                    </div>
                                    <div className={styles.mockupMetric}>
                                        <span className={styles.metricLabel}>Active Clients</span>
                                        <span className={styles.metricValue}>1,248</span>
                                        <span className={`${styles.metricBadge} ${styles.metricBadgePink}`}>+12%</span>
                                    </div>
                                    <div className={styles.mockupMetric}>
                                        <span className={styles.metricLabel}>Projects Running</span>
                                        <span className={styles.metricValue}>47</span>
                                        <span className={styles.metricBadge}>On Track</span>
                                    </div>
                                    <div className={styles.mockupMetric}>
                                        <span className={styles.metricLabel}>Response Time</span>
                                        <span className={styles.metricValue}>1.2ms</span>
                                        <span className={`${styles.metricBadge} ${styles.metricBadgePink}`}>Fast</span>
                                    </div>
                                </div>
                                <div className={`${styles.chip} ${styles.chip1}`}>
                                    <span className={styles.chipDot} />
                                    Cloud Native Ready
                                </div>
                                <div className={`${styles.chip} ${styles.chip2}`}>
                                    <span className={`${styles.chipDot} ${styles.chipDotPink}`} />
                                    AI-Powered Solutions
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Slider Controls (only when multi-slide) ── */}
            {totalSlides > 1 && (
                <div className={styles.sliderControls}>
                    <button className={styles.sliderArrow} onClick={goPrev} aria-label="Previous slide">
                        ‹
                    </button>
                    <div className={styles.sliderDots}>
                        {heroSlides.map((_, idx) => (
                            <button
                                key={idx}
                                className={`${styles.sliderDot} ${idx === current ? styles.sliderDotActive : ''}`}
                                onClick={() => goTo(idx)}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                    <button className={styles.sliderArrow} onClick={goNext} aria-label="Next slide">
                        ›
                    </button>
                </div>
            )}

            {/* Wave decoration for wave variant */}
            {heroVariant === 'wave' && (
                <div className={styles.waveDecoration}>
                    <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
                        <path d="M0,40 C150,80 350,0 500,50 C650,100 800,20 1000,60 C1200,100 1350,30 1440,50 L1440,120 L0,120 Z" fill="#ffffff" />
                        <path d="M0,60 C200,100 400,20 600,70 C800,120 1000,40 1200,80 C1350,110 1400,60 1440,70 L1440,120 L0,120 Z" fill="#ffffff" opacity="0.5" />
                    </svg>
                </div>
            )}

            {/* Scroll indicator */}
            <div className={styles.scrollIndicator}>
                <div className={styles.mouse}>
                    <div className={styles.wheel} />
                </div>
                <span>Scroll to explore</span>
            </div>
        </section>
    );
}
