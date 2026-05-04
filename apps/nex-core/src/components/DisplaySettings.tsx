import React, { useState, useEffect } from 'react';
import { Save, Settings, Layout } from 'lucide-react';
import { useApiConfig } from '../contexts/ApiConfigContext';
import { useTheme, applyThemeToCSS, useToast } from '@nexone/ui';



interface Theme {
  theme_id?: number;
  primary_color?: string;
  accent_color?: string;
  success_color?: string;
  danger_color?: string;
  warning_color?: string;
  sidebar_color?: string;
  sidebar_hover?: string;
  header_color?: string;
  text_secondary?: string;
  border_color?: string;
  font_family?: string;
  font_size_base?: string;
  sidebar_width?: string;
  header_height?: string;
  dark_mode_enabled?: boolean;
  compact_mode?: boolean;
  // Header/Topbar
  header_text_color?: string;
  header_font_size?: string;
  header_font_family?: string;
  is_active?: boolean;
  // Content
  bg_color?: string;
  card_color?: string;
  text_primary?: string;
  text_muted?: string;
  border_radius?: string;
}

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)',
    marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px',
};
const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '14px',
    border: '1.5px solid var(--border-color)', background: 'var(--bg-primary)',
    color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s',
};

const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <div>
        <label style={labelStyle}>{label}</label>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-primary)", padding: "6px 10px", borderRadius: "8px", border: "1.5px solid var(--border-color)" }}>
            <input 
                type="color" 
                value={value || '#000000'} 
                onChange={(e) => onChange(e.target.value)}
                style={{ width: "24px", height: "24px", padding: 0, border: "none", cursor: "pointer", background: "transparent" }} 
            />
            <input 
                type="text" 
                value={value || ''} 
                onChange={(e) => onChange(e.target.value)}
                style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", fontSize: "13px", color: "var(--text-primary)", outline: "none", fontFamily: "monospace", textTransform: "uppercase" }} 
            />
        </div>
    </div>
);

const TextInput = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <div>
        <label style={labelStyle}>{label}</label>
        <input 
            type="text" 
            style={inputStyle} 
            value={value || ''} 
            onChange={e => onChange(e.target.value)} 
        />
    </div>
);

const SelectInput = ({ label, value, options, onChange }: { label: string, value: string, options: {label: string, value: string}[], onChange: (v: string) => void }) => (
    <div>
        <label style={labelStyle}>{label}</label>
        <select 
            style={inputStyle} 
            value={value || ''} 
            onChange={e => onChange(e.target.value)}
        >
            <option value="">-- เลือก --</option>
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

const FONT_SIZE_OPTIONS = [
    { label: '12px (Small)', value: '12px' },
    { label: '13px (Compact)', value: '13px' },
    { label: '14px (Default)', value: '14px' },
    { label: '15px (Medium)', value: '15px' },
    { label: '16px (Large)', value: '16px' },
    { label: '18px (Extra Large)', value: '18px' },
];

const FONT_FAMILY_OPTIONS = [
    { label: 'Inter (Default)', value: '"Inter", sans-serif' },
    { label: 'Roboto', value: '"Roboto", sans-serif' },
    { label: 'Noto Sans Thai', value: '"Noto Sans Thai", sans-serif' },
    { label: 'Sarabun', value: '"Sarabun", sans-serif' },
    { label: 'Kanit', value: '"Kanit", sans-serif' },
    { label: 'Prompt', value: '"Prompt", sans-serif' },
];

export default function DisplaySettings() {
    const [saving, setSaving] = useState(false);
    const { refreshTheme } = useTheme();
    const { success, error } = useToast();
    // Active tab removed since all are displayed simultaneously
    
    // System UI State
    const [themeData, setThemeData] = useState<Theme | null>(null);
    const [originalThemeData, setOriginalThemeData] = useState<Theme | null>(null);

    const [loadingSystem, setLoadingSystem] = useState(true);

    const { getEndpoint } = useApiConfig();
    const coreApi = getEndpoint('NexCore', '');
    const API_THEMES_URL = `${coreApi}/v1/themes`;

    useEffect(() => {
        if (themeData === null) {
            setLoadingSystem(true);
            fetch(`${API_THEMES_URL}/active`)
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setThemeData(data.data);
                    setOriginalThemeData(data.data);
                }
                setLoadingSystem(false);
            })
            .catch(err => {
                console.error('Failed to fetch system theme:', err);
                setLoadingSystem(false);
            });
        }

        return () => {
            // Revert to original theme if unmounted without saving
            if (originalThemeData) {
                applyThemeToCSS(originalThemeData as any);
            }
        };
    }, [originalThemeData]);



    const handleThemeChange = (field: keyof Theme, value: any) => {
        setThemeData(prev => {
            const newData = prev ? { ...prev, [field]: value } : null;
            if (newData) {
                applyThemeToCSS(newData as any);
            }
            return newData;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (themeData && themeData.theme_id) {
                const res = await fetch(`${API_THEMES_URL}/${themeData.theme_id}`, { credentials: 'include', 
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(themeData)
                });
                if (res.ok) {
                    success('บันทึกการตั้งค่าธีมเรียบร้อยแล้ว');
                    setOriginalThemeData(themeData);
                    // Refresh theme across the platform
                    await refreshTheme();
                } else {
                    error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
                }
            }
        } catch (err) {
            console.error('Save system theme failed:', err);
            error('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "40px" }}>
            
            {/* Page Header Removed */}

            {/* Tabs removed to show all settings sequentially */}

            {/* ── Tab Content ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* ── TAB CONTENT: System Settings ── */}
                    {loadingSystem ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="loading-spinner" /></div>
                    ) : themeData && (
                        <>
                                {/* Section 1: การตั้งค่าพื้นฐาน */}
                                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                    <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-color)", background: "var(--bg-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <Settings size={18} color="var(--accent-blue)" />
                                            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>การตั้งค่าพื้นฐานของระบบ (Basic Settings)</h3>
                                        </div>
                                        <button 
                                            onClick={handleSave} 
                                            disabled={saving}
                                            className="btn btn-primary"
                                            style={{ 
                                                padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px", 
                                                fontSize: "14px", fontWeight: 600, borderRadius: "8px", background: "var(--accent-blue)", 
                                                color: "white", border: "none", cursor: saving ? "not-allowed" : "pointer", 
                                                opacity: saving ? 0.7 : 1, transition: "all 0.2s", whiteSpace: "nowrap"
                                            }}
                                        >
                                            <Save size={16} />
                                            {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า (Save Settings)'}
                                        </button>
                                    </div>
                                    <div style={{ padding: "24px" }}>
                                        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                            <div style={{ display: 'flex', gap: '16px', flex: '0 0 auto' }}>
                                                <div>
                                                    <label style={labelStyle}>ธีมสีของหน้าจอ (Color Theme)</label>
                                                    <select style={inputStyle} value={themeData.dark_mode_enabled ? 'dark' : 'light'} onChange={e => handleThemeChange('dark_mode_enabled', e.target.value === 'dark')}>
                                                        <option value="dark">🌙 มืด (Dark)</option>
                                                        <option value="light">☀️ สว่าง (Light)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={labelStyle}>ความหนาแน่น (Density)</label>
                                                    <select style={inputStyle} value={themeData.compact_mode ? 'compact' : 'default'} onChange={e => handleThemeChange('compact_mode', e.target.value === 'compact')}>
                                                        <option value="compact">กะทัดรัด (Compact)</option>
                                                        <option value="default">ปกติ (Default)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div style={{ flex: 1, minWidth: '0' }}>

                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                                                    <ColorInput label="Primary Color" value={themeData.primary_color || ''} onChange={v => handleThemeChange('primary_color', v)} />
                                                    <ColorInput label="Accent Color" value={themeData.accent_color || ''} onChange={v => handleThemeChange('accent_color', v)} />
                                                    <ColorInput label="Success Color" value={themeData.success_color || ''} onChange={v => handleThemeChange('success_color', v)} />
                                                    <ColorInput label="Warning Color" value={themeData.warning_color || ''} onChange={v => handleThemeChange('warning_color', v)} />
                                                    <ColorInput label="Danger Color" value={themeData.danger_color || ''} onChange={v => handleThemeChange('danger_color', v)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Sidebar */}
                                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                    <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-color)", background: "var(--bg-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
                                        <Layout size={18} color="var(--accent-blue)" />
                                        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>แถบด้านข้าง (Sidebar)</h3>
                                    </div>
                                    <div style={{ padding: "24px" }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                                            <ColorInput label="สีพื้น (Background Color)" value={themeData.sidebar_color || ''} onChange={v => handleThemeChange('sidebar_color', v)} />
                                            <ColorInput label="สีตัวอักษร (Text Color)" value={themeData.text_secondary || ''} onChange={v => handleThemeChange('text_secondary', v)} />
                                            <ColorInput label="สีเส้นขอบ (Border Color)" value={themeData.border_color || ''} onChange={v => handleThemeChange('border_color', v)} />
                                            <SelectInput label="ขนาดตัวอักษร (Font Size Base)" value={themeData.font_size_base || ''} options={FONT_SIZE_OPTIONS} onChange={v => handleThemeChange('font_size_base', v)} />
                                            <SelectInput label="แบบตัวอักษร (Font Family)" value={themeData.font_family || ''} options={FONT_FAMILY_OPTIONS} onChange={v => handleThemeChange('font_family', v)} />
                                            <ColorInput label="สีเมื่อชี้เมาส์ (Hover Color)" value={themeData.sidebar_hover || ''} onChange={v => handleThemeChange('sidebar_hover', v)} />
                                            <TextInput label="ความกว้าง Sidebar (Width)" value={themeData.sidebar_width || ''} onChange={v => handleThemeChange('sidebar_width', v)} />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Topbar */}
                                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                    <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-color)", background: "var(--bg-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
                                        <Layout size={18} color="var(--accent-blue)" />
                                        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>แถบด้านบน (Topbar)</h3>
                                    </div>
                                    <div style={{ padding: "24px" }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                                            <ColorInput label="สีพื้น (Background Color)" value={themeData.header_color || ''} onChange={v => handleThemeChange('header_color', v)} />
                                            <ColorInput label="สีตัวอักษร (Text Color)" value={themeData.header_text_color || ''} onChange={v => handleThemeChange('header_text_color', v)} />
                                            <SelectInput label="ขนาดตัวอักษร (Font Size)" value={themeData.header_font_size || ''} options={FONT_SIZE_OPTIONS} onChange={v => handleThemeChange('header_font_size', v)} />
                                            <SelectInput label="แบบตัวอักษร (Font Family)" value={themeData.header_font_family || ''} options={FONT_FAMILY_OPTIONS} onChange={v => handleThemeChange('header_font_family', v)} />
                                            <TextInput label="ความสูง Topbar (Height)" value={themeData.header_height || ''} onChange={v => handleThemeChange('header_height', v)} />
                                        </div>
                                    </div>
                                </div>
                                {/* Section 4: พื้นที่แสดงผล (Content) */}
                                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                    <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-color)", background: "var(--bg-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
                                        <Layout size={18} color="var(--accent-blue)" />
                                        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>พื้นที่แสดงผล (Content)</h3>
                                    </div>
                                    <div style={{ padding: "24px" }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                                            <ColorInput label="สีพื้นหลัง (Background Color)" value={themeData.bg_color || ''} onChange={v => handleThemeChange('bg_color', v)} />
                                            <ColorInput label="สีการ์ด (Card Color)" value={themeData.card_color || ''} onChange={v => handleThemeChange('card_color', v)} />
                                            <ColorInput label="สีตัวอักษรหลัก (Text Primary)" value={themeData.text_primary || ''} onChange={v => handleThemeChange('text_primary', v)} />
                                            <ColorInput label="สีตัวอักษรรอง (Text Muted)" value={themeData.text_muted || ''} onChange={v => handleThemeChange('text_muted', v)} />
                                            <TextInput label="ความโค้งมุม (Border Radius)" value={themeData.border_radius || ''} onChange={v => handleThemeChange('border_radius', v)} />
                                        </div>
                                    </div>
                                </div>

                        </>
                    )}

            </div>
        </div>
    );
}
