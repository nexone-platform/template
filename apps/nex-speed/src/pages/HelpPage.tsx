'use client';

import React, { useState } from 'react';
import {
    HelpCircle, MessageCircle, ChevronDown, ChevronUp,
    Truck, Users, ClipboardList, MapPin, Receipt, BarChart3,
    Phone, Mail, Search, Lightbulb,
    Play, BookOpen, Headphones,
} from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const faqs: FAQItem[] = [
    {
        category: 'general',
        question: 'ระบบ NexSpeed TMS คืออะไร?',
        answer: 'NexSpeed TMS เป็นระบบบริหารจัดการขนส่ง (Transportation Management System) สำหรับบริษัทขนส่งขนาดกลาง ที่ครอบคลุมตั้งแต่การจัดการรถบริษัท, พนักงานขับรถ, คำสั่งขนส่ง, ติดตามรถ GPS แบบ Real-time, ไปจนถึงระบบการเงินและ e-Tax ของไทย',
    },
    {
        category: 'fleet',
        question: 'จะเพิ่มรถใหม่เข้าระบบอย่างไร?',
        answer: 'ไปที่เมนู "การจัดการรถบริษัท" → คลิกปุ่ม "เพิ่มรถใหม่" → กรอกข้อมูลทะเบียนรถ, ประเภท, ยี่ห้อ/รุ่น, ขนาดการบรรทุก, วันหมดอายุประกัน/พ.ร.บ. → กดบันทึก รถจะถูกเพิ่มในสถานะ "พร้อมใช้งาน" โดยอัตโนมัติ',
    },
    {
        category: 'fleet',
        question: 'Predictive Maintenance ทำงานอย่างไร?',
        answer: 'ระบบจะวิเคราะห์รูปแบบการใช้งานรถ เช่น ระยะทาง, ชั่วโมงเครื่องยนต์, ประวัติซ่อมบำรุง แล้วใช้ AI พยากรณ์ช่วงเวลาที่ควรเข้าตรวจสอบ เพื่อป้องกันปัญหาก่อนเกิดขึ้น ระบบจะแจ้งเตือนล่วงหน้า 7 วัน',
    },
    {
        category: 'driver',
        question: 'HOS (Hours of Service) คืออะไร?',
        answer: 'HOS คือ ระบบติดตามชั่วโมงการทำงานของคนขับ ตามกฎของกรมการขนส่งทางบก (DLT) คนขับต้องไม่ขับเกิน 8 ชั่วโมง/วัน ระบบจะแจ้งเตือนอัตโนมัติเมื่อเหลือเวลาเพียง 30 นาที',
    },
    {
        category: 'driver',
        question: 'Safety Score คำนวณจากอะไร?',
        answer: 'Safety Score คำนวณจาก: (1) การเบรกกระทันหัน (Hard Braking) (2) การเร่งเครื่องรุนแรง (3) ความเร็วเกินกำหนด (4) ชั่วโมงขับต่อเนื่อง (5) ประวัติอุบัติเหตุ คะแนนเต็ม 100 — คนขับที่ได้คะแนนต่ำกว่า 70 จะถูกแจ้งเตือน',
    },
    {
        category: 'order',
        question: 'ระบบ VRP (Vehicle Routing Problem) ช่วยอะไร?',
        answer: 'VRP เป็น AI Engine ที่วิเคราะห์และจัดเส้นทางที่ดีที่สุดให้รถทุกคัน โดยพิจารณา: ต้นทาง-ปลายทาง, Time Window, ขนาดรถ, น้ำหนักสินค้า, สภาพจราจร และต้นทุนรวม เพื่อลด Empty Mile และเวลาขนส่ง',
    },
    {
        category: 'order',
        question: 'ความแตกต่างระหว่าง Priority: ปกติ, เร่งด่วน, ด่วนพิเศษ?',
        answer: 'ปกติ = ส่งภายใน 24-48 ชม. / เร่งด่วน (Urgent) = ส่งภายวันเดียวกัน โดยให้ลำดับจัดสายก่อน / ด่วนพิเศษ (Express) = ส่งทันที ใช้รถเฉพาะ มีค่าบริการเพิ่มเติม 1.5-2x',
    },
    {
        category: 'trip',
        question: 'ePOD คืออะไร?',
        answer: 'ePOD (Electronic Proof of Delivery) คือ หลักฐานการส่งมอบสินค้าแบบดิจิทัล คนขับถ่ายรูป + ลายเซ็นอิเล็กทรอนิกส์ผ่านแอปบนมือถือ พร้อม Timestamp และ GPS Location — ไม่ต้องใช้กระดาษ',
    },
    {
        category: 'finance',
        question: 'ระบบ e-Tax ทำงานร่วมกับกรมสรรพากรอย่างไร?',
        answer: 'ระบบรองรับ Thai e-Tax Invoice XML v2.0 โดยสร้าง Invoice ดิจิทัลที่มีลายเซ็นอิเล็กทรอนิกส์ (Digital Signature) และส่งผ่าน API ของกรมสรรพากรโดยตรง รองรับทั้งใบกำกับภาษี, ใบเพิ่มหนี้ และใบลดหนี้',
    },
    {
        category: 'finance',
        question: 'Self-billing คืออะไร?',
        answer: 'Self-billing คือ ระบบออก Invoice อัตโนมัติตาม Rate Card ที่ตกลงกับลูกค้า โดยคำนวณจาก: ระยะทาง × อัตรา/กม. + Surcharge (ค่าทางด่วน, ค่า Fuel Surcharge, ค่ารอ) ลดเวลาทำบัญชี 80%',
    },
];

const categories = [
    { id: 'all', label: 'ทั้งหมด', icon: HelpCircle },
    { id: 'general', label: 'ทั่วไป', icon: Lightbulb },
    { id: 'fleet', label: 'การจัดการรถบริษัท', icon: Truck },
    { id: 'driver', label: 'คนขับ', icon: Users },
    { id: 'order', label: 'ออเดอร์', icon: ClipboardList },
    { id: 'trip', label: 'ทริป', icon: MapPin },
    { id: 'finance', label: 'การเงิน', icon: Receipt },
];

const guides = [
    { title: 'เริ่มต้นใช้งาน NexSpeed', desc: 'แนะนำภาพรวมระบบและวิธีเข้าใช้งานครั้งแรก', icon: Play, color: 'var(--accent-blue)', duration: '5 นาที' },
    { title: 'จัดการรถบริษัทเบื้องต้น', desc: 'เพิ่มรถ, อัปเดตสถานะ, ตั้งค่าซ่อมบำรุง', icon: Truck, color: 'var(--accent-green)', duration: '8 นาที' },
    { title: 'สร้างและจัดส่ง Order', desc: 'รับ Order, จัดสายรถ, Dispatch ออกรถ', icon: ClipboardList, color: 'var(--accent-amber)', duration: '10 นาที' },
    { title: 'ติดตามทริป Real-time', desc: 'ใช้แผนที่ GPS, ดู ETA, จัดการ Delay', icon: MapPin, color: 'var(--accent-red)', duration: '6 นาที' },
    { title: 'ออก Invoice & e-Tax', desc: 'สร้าง Invoice, ส่ง e-Tax ให้กรมสรรพากร', icon: Receipt, color: 'var(--accent-purple)', duration: '7 นาที' },
    { title: 'อ่านรายงาน Analytics', desc: 'ดู KPI, Cost-per-Lane, OTD, Empty Mile', icon: BarChart3, color: 'var(--accent-cyan)', duration: '5 นาที' },
];

const shortcuts = [
    { keys: ['Ctrl', 'K'], action: 'ค้นหาด่วน (Quick Search)' },
    { keys: ['Ctrl', 'N'], action: 'สร้าง Order ใหม่' },
    { keys: ['Ctrl', 'D'], action: 'กลับหน้า Dashboard' },
    { keys: ['Ctrl', 'F'], action: 'ค้นหาในตาราง' },
    { keys: ['Esc'], action: 'ปิด Modal / ยกเลิก' },
    { keys: ['Ctrl', ','], action: 'เปิดตั้งค่า' },
];

export default function HelpPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);

    const filteredFAQs = faqs.filter(faq => {
        const matchCategory = activeCategory === 'all' || faq.category === activeCategory;
        const matchSearch = searchTerm === '' ||
            faq.question.includes(searchTerm) ||
            faq.answer.includes(searchTerm);
        return matchCategory && matchSearch;
    });

    return (
        <div className="animate-fade-in">

            {/* Hero Search */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.08) 100%)',
                border: '1px solid rgba(59,130,246,0.15)', borderRadius: '20px',
                padding: '40px', textAlign: 'center', marginBottom: '28px',
            }}>
                <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
                    มีอะไรให้ช่วยครับ? 🤝
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                    ค้นหาคำถาม, คู่มือ หรือวิธีใช้งานฟีเจอร์ต่างๆ ของ NexSpeed TMS
                </p>
                <div className="topbar-search" style={{ maxWidth: '480px', margin: '0 auto', minWidth: 'auto' }}>
                    <Search size={18} style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="พิมพ์คำค้นหา เช่น 'HOS', 'เพิ่มรถ', 'Invoice'..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ fontSize: '14px' }}
                    />
                </div>
            </div>

            {/* Quick Start Guides */}
            <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>📚 คู่มือเริ่มต้นใช้งาน</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>เรียนรู้แต่ละฟีเจอร์ทีละขั้นตอน</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                    {guides.map((guide, i) => (
                        <div key={i} className="card" style={{ padding: '18px', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                                <div style={{
                                    width: '42px', height: '42px', borderRadius: '12px',
                                    background: `${guide.color}12`, display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <guide.icon size={20} style={{ color: guide.color }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{guide.title}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{guide.desc}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: guide.color }}>
                                        <BookOpen size={12} />
                                        <span>{guide.duration}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px', marginBottom: '28px' }}>
                {/* Category Filter */}
                <div className="card" style={{ padding: '8px', height: 'fit-content', position: 'sticky', top: '88px' }}>
                    <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        หมวดหมู่
                    </div>
                    {categories.map(cat => (
                        <div
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '9px 12px', borderRadius: '10px', cursor: 'pointer',
                                background: activeCategory === cat.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                                color: activeCategory === cat.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
                                transition: 'all 0.15s ease', fontSize: '13px', fontWeight: 500,
                            }}
                        >
                            <cat.icon size={16} />
                            <span>{cat.label}</span>
                        </div>
                    ))}
                </div>

                {/* FAQ List */}
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>❓ คำถามที่พบบ่อย (FAQ)</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>{filteredFAQs.length} คำถาม</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {filteredFAQs.map((faq, i) => {
                            const isOpen = openFAQ === i;
                            return (
                                <div
                                    key={i}
                                    className="card"
                                    style={{
                                        padding: 0, cursor: 'pointer',
                                        border: isOpen ? '1px solid rgba(59,130,246,0.3)' : undefined,
                                    }}
                                    onClick={() => setOpenFAQ(isOpen ? null : i)}
                                >
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '16px 20px', gap: '12px',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <HelpCircle size={18} style={{ color: isOpen ? 'var(--accent-blue)' : 'var(--text-muted)', flexShrink: 0 }} />
                                            <span style={{ fontSize: '14px', fontWeight: 600, color: isOpen ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                                                {faq.question}
                                            </span>
                                        </div>
                                        {isOpen ? <ChevronUp size={16} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                                    </div>
                                    {isOpen && (
                                        <div style={{
                                            padding: '0 20px 18px 50px',
                                            fontSize: '13px', lineHeight: 1.8, color: 'var(--text-secondary)',
                                            animation: 'fadeIn 0.2s ease',
                                        }}>
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="card" style={{ marginBottom: '28px' }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">⌨️ ปุ่มลัด (Keyboard Shortcuts)</div>
                        <div className="card-subtitle">ใช้งานเร็วขึ้นด้วยคีย์บอร์ด</div>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {shortcuts.map((sc, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 14px', background: 'rgba(255,255,255,0.02)',
                            borderRadius: '10px', border: '1px solid var(--border-color)',
                        }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{sc.action}</span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {sc.keys.map(key => (
                                    <span key={key} style={{
                                        padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                                        background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)',
                                        color: 'var(--text-secondary)', fontFamily: 'monospace',
                                    }}>
                                        {key}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Support */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div className="card" style={{ textAlign: 'center', padding: '28px' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 16px',
                        background: 'rgba(59,130,246,0.1)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Headphones size={26} style={{ color: 'var(--accent-blue)' }} />
                    </div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>โทรหาเรา</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                        ทีมซัพพอร์ตพร้อมให้บริการ จ.-ศ. 08:00-18:00
                    </p>
                    <a href="tel:021234567" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                        <Phone size={16} /> 02-123-4567
                    </a>
                </div>

                <div className="card" style={{ textAlign: 'center', padding: '28px' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 16px',
                        background: 'rgba(16,185,129,0.1)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <MessageCircle size={26} style={{ color: 'var(--accent-green)' }} />
                    </div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>LINE Official</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                        แชทกับทีมซัพพอร์ตผ่าน LINE ได้ตลอด 24 ชม.
                    </p>
                    <button className="btn btn-success" style={{ width: '100%', justifyContent: 'center' }}>
                        <MessageCircle size={16} /> @NexSpeed
                    </button>
                </div>

                <div className="card" style={{ textAlign: 'center', padding: '28px' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 16px',
                        background: 'rgba(139,92,246,0.1)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Mail size={26} style={{ color: 'var(--accent-purple)' }} />
                    </div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>อีเมล</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                        ส่งรายละเอียดปัญหาหรือคำขอเพิ่มเติม
                    </p>
                    <a href="mailto:support@nexspeed.co.th" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', border: '1px solid rgba(139,92,246,0.3)', color: 'var(--accent-purple)' }}>
                        <Mail size={16} /> support@nexspeed.co.th
                    </a>
                </div>
            </div>
        </div>
    );
}
