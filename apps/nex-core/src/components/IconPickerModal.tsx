import React, { useState, useMemo } from 'react';
import * as LucideIcons from "lucide-react";
import { BaseModal, SearchInput } from "@/components/CrudComponents";

const ICON_CATEGORIES = [
  { label: 'All', count: 1695, keywords: [] },
  { label: 'Accessibility', count: 30, keywords: ['access', 'wheelchair', 'blind', 'deaf', 'ear'] },
  { label: 'Accounts & access', count: 137, keywords: ['user', 'lock', 'key', 'shield', 'log', 'pass'] },
  { label: 'Animals', count: 23, keywords: ['animal', 'bird', 'dog', 'cat', 'bug', 'fish', 'rabbit'] },
  { label: 'Arrows', count: 211, keywords: ['arrow', 'chevron', 'move', 'point', 'direction'] },
  { label: 'Buildings', count: 24, keywords: ['home', 'building', 'factory', 'store', 'castle'] },
  { label: 'Charts', count: 31, keywords: ['chart', 'graph', 'pie', 'bar', 'trend'] },
  { label: 'Communication', count: 55, keywords: ['mail', 'message', 'phone', 'send', 'chat', 'inbox'] },
  { label: 'Connectivity', count: 93, keywords: ['wifi', 'bluetooth', 'network', 'signal', 'link', 'cloud'] },
  { label: 'Cursors', count: 33, keywords: ['cursor', 'pointer', 'mouse', 'click'] },
  { label: 'Design', count: 143, keywords: ['pen', 'brush', 'palette', 'crop', 'layer', 'align'] },
  { label: 'Coding & development', count: 242, keywords: ['code', 'terminal', 'git', 'bug', 'bot', 'box', 'database'] },
  { label: 'Devices', count: 171, keywords: ['laptop', 'phone', 'tablet', 'monitor', 'keyboard', 'speaker', 'battery'] },
  { label: 'Emoji', count: 41, keywords: ['smile', 'frown', 'laugh', 'sad', 'emoji'] },
  { label: 'File icons', count: 162, keywords: ['file', 'folder', 'document', 'paper', 'text'] },
  { label: 'Finance', count: 56, keywords: ['money', 'coin', 'bank', 'wallet', 'credit', 'dollar', 'euro'] },
  { label: 'Food & beverage', count: 71, keywords: ['food', 'drink', 'coffee', 'pizza', 'apple', 'wine'] },
  { label: 'Gaming', count: 149, keywords: ['game', 'play', 'console', 'sword', 'dice'] },
  { label: 'Home', count: 61, keywords: ['home', 'house', 'door', 'bed', 'bath', 'kitchen'] },
  { label: 'Layout', count: 141, keywords: ['layout', 'grid', 'panel', 'sidebar', 'menu'] },
  { label: 'Mail', count: 26, keywords: ['mail', 'envelope', 'inbox', 'post'] },
  { label: 'Mathematics', count: 75, keywords: ['math', 'plus', 'minus', 'multiply', 'divide', 'calc'] },
  { label: 'Medical', count: 42, keywords: ['cross', 'pill', 'heart', 'pulse', 'syringe', 'hospital'] },
  { label: 'Multimedia', count: 141, keywords: ['video', 'audio', 'music', 'camera', 'play', 'pause'] },
  { label: 'Nature', count: 23, keywords: ['tree', 'leaf', 'flower', 'sun', 'moon', 'cloud', 'drop'] },
  { label: 'Navigation, Maps, and POIs', count: 80, keywords: ['map', 'pin', 'compass', 'route', 'navigate'] },
  { label: 'Notification', count: 40, keywords: ['bell', 'alert', 'badge'] },
  { label: 'People', count: 31, keywords: ['person', 'user', 'people', 'team'] },
  { label: 'Photography', count: 75, keywords: ['camera', 'photo', 'image', 'picture', 'aperture'] },
  { label: 'Science', count: 36, keywords: ['flask', 'atom', 'magnet', 'microscope'] },
  { label: 'Seasons', count: 5, keywords: ['sun', 'snow', 'leaf', 'cloud'] },
  { label: 'Security', count: 58, keywords: ['shield', 'lock', 'key', 'protect'] },
  { label: 'Shapes', count: 55, keywords: ['circle', 'square', 'triangle', 'hexagon', 'star'] },
  { label: 'Shopping', count: 27, keywords: ['cart', 'bag', 'store', 'shop'] },
  { label: 'Social', count: 127, keywords: ['share', 'heart', 'thumbs', 'user', 'facebook', 'twitter'] },
  { label: 'Sports', count: 15, keywords: ['ball', 'football', 'bike', 'swim', 'run'] },
  { label: 'Sustainability', count: 24, keywords: ['leaf', 'recycle', 'eco', 'earth'] },
  { label: 'Text formatting', count: 247, keywords: ['bold', 'italic', 'underline', 'align', 'list', 'type'] },
  { label: 'Time & calendar', count: 59, keywords: ['time', 'clock', 'calendar', 'hour'] },
  { label: 'Tools', count: 71, keywords: ['wrench', 'hammer', 'screwdriver', 'tool'] },
  { label: 'Transportation', count: 64, keywords: ['car', 'bus', 'train', 'plane', 'truck', 'bike'] },
  { label: 'Travel', count: 70, keywords: ['plane', 'map', 'ticket', 'luggage', 'compass'] },
  { label: 'Weather', count: 45, keywords: ['sun', 'cloud', 'rain', 'snow', 'wind'] },
];

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIcon?: string;
  onSelectIcon: (iconName: string) => void;
}

export function IconPickerModal({ isOpen, onClose, selectedIcon, onSelectIcon }: IconPickerModalProps) {
  const [iconSearch, setIconSearch] = useState("");
  const [iconColor, setIconColor] = useState("#334155");
  const [iconStroke, setIconStroke] = useState(2);
  const [iconSize, setIconSize] = useState(24);
  const [iconCurrentPage, setIconCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState("All");
  const iconPageSize = 100;

  // Reset pagination when search or category changes
  React.useEffect(() => {
    setIconCurrentPage(1);
  }, [activeCategory, iconSearch]);

  const { iconFiltered, iconPaginated, iconTotalPages } = useMemo(() => {
    if (!isOpen) return { iconFiltered: [], iconPaginated: [], iconTotalPages: 0 };
    
    const activeCatObj = ICON_CATEGORIES.find(c => c.label === activeCategory);
    
    const filtered = Object.keys(LucideIcons).filter((name) => {
      if (!/^[A-Z]/.test(name)) return false;
      const lowerName = name.toLowerCase();
      if (iconSearch && !lowerName.includes(iconSearch.toLowerCase())) return false;
      if (activeCategory !== 'All' && activeCatObj) {
        if (!activeCatObj.keywords.some(kw => lowerName.includes(kw))) return false;
      }
      return true;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / iconPageSize));
    const paginated = filtered.slice((iconCurrentPage - 1) * iconPageSize, iconCurrentPage * iconPageSize);
    
    return { iconFiltered: filtered, iconPaginated: paginated, iconTotalPages: totalPages };
  }, [isOpen, activeCategory, iconSearch, iconCurrentPage, iconPageSize]);

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="เลือกไอคอน (Lucide Icons)"
      width="1100px"
      footer={
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            {iconTotalPages > 1 && (
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  onClick={() => setIconCurrentPage(1)} 
                  disabled={iconCurrentPage === 1}
                  style={{
                    width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center",
                    background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px",
                    cursor: iconCurrentPage === 1 ? "not-allowed" : "pointer",
                    color: iconCurrentPage === 1 ? "var(--text-muted)" : "var(--text-primary)"
                  }}
                >
                  <LucideIcons.ChevronsLeft size={16} />
                </button>
                <button 
                  onClick={() => setIconCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={iconCurrentPage === 1}
                  style={{
                    width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center",
                    background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px",
                    cursor: iconCurrentPage === 1 ? "not-allowed" : "pointer",
                    color: iconCurrentPage === 1 ? "var(--text-muted)" : "var(--text-primary)"
                  }}
                >
                  <LucideIcons.ChevronLeft size={16} />
                </button>
                
                {Array.from({ length: Math.min(5, iconTotalPages) }, (_, i) => {
                  let pageNum = iconCurrentPage;
                  if (iconCurrentPage <= 3) pageNum = i + 1;
                  else if (iconCurrentPage >= iconTotalPages - 2) pageNum = iconTotalPages - 4 + i;
                  else pageNum = iconCurrentPage - 2 + i;
                  
                  if (pageNum < 1 || pageNum > iconTotalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setIconCurrentPage(pageNum)}
                      style={{
                        width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center",
                        background: iconCurrentPage === pageNum ? "#3b82f6" : "var(--bg-card)", 
                        border: "1px solid",
                        borderColor: iconCurrentPage === pageNum ? "#3b82f6" : "var(--border-color)",
                        borderRadius: "8px",
                        cursor: "pointer",
                        color: iconCurrentPage === pageNum ? "white" : "var(--text-primary)",
                        fontWeight: iconCurrentPage === pageNum ? 600 : 400
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button 
                  onClick={() => setIconCurrentPage(p => Math.min(iconTotalPages, p + 1))} 
                  disabled={iconCurrentPage === iconTotalPages}
                  style={{
                    width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center",
                    background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px",
                    cursor: iconCurrentPage === iconTotalPages ? "not-allowed" : "pointer",
                    color: iconCurrentPage === iconTotalPages ? "var(--text-muted)" : "var(--text-primary)"
                  }}
                >
                  <LucideIcons.ChevronRight size={16} />
                </button>
                <button 
                  onClick={() => setIconCurrentPage(iconTotalPages)} 
                  disabled={iconCurrentPage === iconTotalPages}
                  style={{
                    width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center",
                    background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px",
                    cursor: iconCurrentPage === iconTotalPages ? "not-allowed" : "pointer",
                    color: iconCurrentPage === iconTotalPages ? "var(--text-muted)" : "var(--text-primary)"
                  }}
                >
                  <LucideIcons.ChevronsRight size={16} />
                </button>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 500,
              color: "var(--text-primary)"
            }}
          >
            ปิดหน้าต่าง
          </button>
        </div>
      }
    >
      <div style={{ display: "flex", height: "60vh", minHeight: "500px", gap: "24px" }}>
        {/* Left Sidebar - Categories & Customizer */}
        <div style={{ width: "240px", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto", paddingRight: "8px" }} className="custom-scrollbar">
          {/* Customizer */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>Customizer</h4>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 500 }}>Color</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-secondary)", padding: "4px 8px", borderRadius: "8px" }}>
                  <input type="color" value={iconColor} onChange={e => setIconColor(e.target.value)} style={{ width: "20px", height: "20px", padding: 0, border: "none", borderRadius: "4px", background: "none", cursor: "pointer" }} />
                  <span style={{ fontSize: "12px", fontFamily: "monospace" }}>{iconColor}</span>
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", fontWeight: 500 }}>Stroke width</span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{iconStroke}px</span>
                </div>
                <input type="range" min="1" max="3" step="0.5" value={iconStroke} onChange={e => setIconStroke(parseFloat(e.target.value))} style={{ width: "100%", accentColor: "#ef4444" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", fontWeight: 500 }}>Size</span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{iconSize}px</span>
                </div>
                <input type="range" min="16" max="48" step="2" value={iconSize} onChange={e => setIconSize(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#ef4444" }} />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>Categories</h4>
            {ICON_CATEGORIES.map(cat => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 12px", borderRadius: "8px", border: "none",
                  background: activeCategory === cat.label ? "rgba(239, 68, 68, 0.1)" : "transparent",
                  color: activeCategory === cat.label ? "#ef4444" : "var(--text-primary)",
                  cursor: "pointer", textAlign: "left", transition: "all 0.2s"
                }}
                onMouseEnter={e => { if (activeCategory !== cat.label) e.currentTarget.style.background = "var(--bg-secondary)" }}
                onMouseLeave={e => { if (activeCategory !== cat.label) e.currentTarget.style.background = "transparent" }}
              >
                <span style={{ fontSize: "13px", fontWeight: activeCategory === cat.label ? 600 : 500 }}>{cat.label}</span>
                <span style={{ fontSize: "11px", color: activeCategory === cat.label ? "#ef4444" : "var(--text-muted)" }}>{cat.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Content - Search & Grid */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
          <SearchInput
            value={iconSearch}
            onChange={setIconSearch}
            placeholder={`ค้นหาไอคอน (ภาษาอังกฤษ) จาก ${iconFiltered.length} ไอคอนในหมวดนี้...`}
          />
          <div
            style={{
              display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "8px",
              overflowY: "auto", padding: "4px", paddingRight: "8px", alignContent: "start", flex: 1
            }}
            className="custom-scrollbar"
          >
            {iconPaginated.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "var(--text-muted)", fontSize: "15px" }}>
                ไม่พบไอคอนที่ตรงกับการค้นหาในหมวดหมู่นี้
              </div>
            ) : (
              iconPaginated.map((iconName) => {
                const IconComp = (LucideIcons as any)[iconName];
                const kebabName = iconName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
                if (!IconComp || typeof IconComp !== "object" && typeof IconComp !== "function") return null;

                return (
                  <div
                    key={iconName}
                    title={iconName}
                    onClick={() => onSelectIcon(kebabName)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", aspectRatio: "1",
                      borderRadius: "8px", cursor: "pointer",
                      border: selectedIcon === kebabName ? "2px solid #ef4444" : "1px solid var(--border-color)",
                      background: selectedIcon === kebabName ? "rgba(239, 68, 68, 0.05)" : "var(--bg-card)",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { if (selectedIcon !== kebabName) e.currentTarget.style.background = "var(--bg-secondary)"; }}
                    onMouseLeave={(e) => { if (selectedIcon !== kebabName) e.currentTarget.style.background = "var(--bg-card)"; }}
                  >
                    <IconComp size={iconSize} color={iconColor} strokeWidth={iconStroke} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

export const renderIcon = (iconName?: string) => {
  if (!iconName) return <LucideIcons.LayoutTemplate size={16} />;
  
  const specialMappings: Record<string, string> = {
    'users-cog': 'UserCog',
    'dashboard': 'LayoutDashboard',
    'apps': 'LayoutGrid',
    'employees': 'Users',
    'payroll': 'DollarSign',
    'report': 'FileText',
    'tax': 'Receipt',
    'training': 'GraduationCap',
    'performance': 'Activity'
  };

  let pascalName = specialMappings[iconName.toLowerCase()];
  if (!pascalName) {
    pascalName = iconName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('');
  }

  const IconComponent = (LucideIcons as any)[pascalName];
  if (IconComponent) {
    return <IconComponent size={16} />;
  }
  return <LucideIcons.LayoutTemplate size={16} />;
};
