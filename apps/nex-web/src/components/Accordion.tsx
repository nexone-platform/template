'use client';

import { useState } from 'react';
import styles from './Accordion.module.css';

interface AccordionItem {
    question: string;
    answer: string;
}

interface AccordionProps {
    title?: string;
    subtitle?: string;
    items?: AccordionItem[];
    allowMultiple?: boolean;
    variant?: 'default' | 'bordered' | 'separated';
}

export default function Accordion({
    title = '',
    subtitle = '',
    items = [],
    allowMultiple = false,
    variant = 'default',
}: AccordionProps) {
    const [openItems, setOpenItems] = useState<Set<number>>(new Set());

    const toggleItem = (index: number) => {
        setOpenItems(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                if (!allowMultiple) next.clear();
                next.add(index);
            }
            return next;
        });
    };

    if (items.length === 0) {
        return (
            <div className={styles.placeholder}>
                <span>❓</span>
                <p>เพิ่มคำถาม-คำตอบใน Properties Panel</p>
            </div>
        );
    }

    return (
        <section className={styles.section}>
            {(title || subtitle) && (
                <div className={styles.header}>
                    {title && <h2 className={styles.title}>{title}</h2>}
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
            )}
            <div className={`${styles.list} ${styles[variant]}`}>
                {items.map((item, idx) => {
                    const isOpen = openItems.has(idx);
                    return (
                        <div key={idx} className={`${styles.item} ${isOpen ? styles.open : ''}`}>
                            <button
                                className={styles.question}
                                onClick={() => toggleItem(idx)}
                                aria-expanded={isOpen}
                            >
                                <span>{item.question}</span>
                                <svg
                                    className={styles.chevron}
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>
                            <div className={styles.answerWrapper}>
                                <div className={styles.answer}>
                                    {item.answer}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
