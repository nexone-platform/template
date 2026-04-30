'use client';

import { useEffect, useState } from 'react';
import styles from './Header.module.css';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
            <div className="container">
                <nav className={styles.nav}>
                    {/* Logo */}
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><circle cx="12" cy="12" r="3"/></svg></span>
                        <span className={styles.logoText}>TechBiz</span>
                    </div>

                    {/* Desktop Navigation */}
                    <ul className={styles.navLinks}>
                        <li><a href="#home" className={styles.navLink}>Home</a></li>
                        <li><a href="#features" className={styles.navLink}>Features</a></li>
                        <li><a href="#pricing" className={styles.navLink}>Pricing</a></li>
                        <li><a href="#about" className={styles.navLink}>About</a></li>
                        <li><a href="#contact" className={styles.navLink}>Contact</a></li>
                    </ul>

                    {/* CTA Button */}
                    <div className={styles.navActions}>
                        <button className="btn btn-primary">Get Started</button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className={styles.mobileMenuBtn}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className={styles.hamburger}></span>
                    </button>
                </nav>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className={styles.mobileMenu}>
                        <ul className={styles.mobileNavLinks}>
                            <li><a href="#home" onClick={() => setIsMobileMenuOpen(false)}>Home</a></li>
                            <li><a href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</a></li>
                            <li><a href="#pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a></li>
                            <li><a href="#about" onClick={() => setIsMobileMenuOpen(false)}>About</a></li>
                            <li><a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</a></li>
                        </ul>
                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                            Get Started
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
