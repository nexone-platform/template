import React, { useState, useEffect, useRef } from 'react';
import { Bell, Send, CheckCircle2, AlertTriangle, Info, Clock, Search, Filter, MailPlus, User, Plus, X, Check, Megaphone } from 'lucide-react';
import { coreAnnouncementApi, Announcement } from '../services/api';
import { useLanguage, useSystemConfig } from '@nexone/ui';
import { format } from 'date-fns';

const StatCard = ({ title, value, suffix, icon: Icon, color, iconBgColor }: any) => (
  <div
    style={{
      background: iconBgColor,
      borderRadius: "8px",
      padding: "24px",
      display: "flex",
      alignItems: "center",
      gap: "20px",
      border: `1px solid ${color}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}
  >
    <div
      style={{
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        background: "rgba(255, 255, 255, 0.6)",
        color: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon size={24} strokeWidth={2} />
    </div>
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span
        style={{
          fontSize: "18px",
          color: color,
          fontWeight: 600,
          marginBottom: "4px",
        }}
      >
        {title}
      </span>
      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
        <span
          style={{
            fontSize: "18px",
            fontWeight: 800,
            color: color,
            letterSpacing: "-0.5px",
          }}
        >
          {value}
        </span>
        {suffix && (
          <span style={{ fontSize: "18px", color: color, fontWeight: 700, letterSpacing: "-0.5px" }}>{suffix}</span>
        )}
      </div>
    </div>
  </div>
);

const TARGET_OPTIONS: Record<string, {id: string, label: string}[]> = {
  DEPARTMENT: [
    { id: 'HR', label: 'Human Resources (HR)' },
    { id: 'IT', label: 'Information Technology (IT)' },
    { id: 'MKT', label: 'Marketing (MKT)' },
    { id: 'SALES', label: 'Sales' },
    { id: 'FIN', label: 'Finance (FIN)' },
  ],
  ROLE: [
    { id: 'ADMIN', label: 'Administrator' },
    { id: 'MANAGER', label: 'Manager' },
    { id: 'USER', label: 'General User' },
    { id: 'SUPERVISOR', label: 'Supervisor' },
  ],
  USER: [
    { id: 'U001', label: 'Somchai (U001)' },
    { id: 'U002', label: 'Somsri (U002)' },
    { id: 'U003', label: 'Mana (U003)' },
    { id: 'U004', label: 'Manee (U004)' },
  ]
};


export default function Notifications() {
  const { lang } = useLanguage();
  const { configs } = useSystemConfig();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Announcement>>({
    title: '',
    message: '',
    targetType: 'ALL',
    targetIds: [],
    isActive: true,
    scheduleDate: '',
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await coreAnnouncementApi.getAll();
      setAnnouncements(data);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const openModal = (announcement?: Announcement) => {
    if (announcement) {
      setEditingId(announcement.id);
      setFormData({
        title: announcement.title,
        message: announcement.message,
        targetType: announcement.targetType,
        targetIds: announcement.targetIds || [],
        isActive: announcement.isActive,
        scheduleDate: announcement.scheduleDate || '',
        endDate: announcement.endDate || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        message: '',
        targetType: 'ALL',
        targetIds: [],
        isActive: true,
        scheduleDate: '',
        endDate: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        targetIds: Array.isArray(formData.targetIds) ? formData.targetIds : typeof formData.targetIds === 'string' ? formData.targetIds.split(',').map((s: string) => s.trim()) : formData.targetIds,
        scheduleDate: formData.scheduleDate ? new Date(formData.scheduleDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      };

      if (editingId) {
        await coreAnnouncementApi.update(editingId, payload);
      } else {
        await coreAnnouncementApi.create(payload);
      }
      fetchAnnouncements();
      closeModal();
    } catch (err) {
      console.error('Failed to save announcement:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(lang === 'th' ? 'คุณแน่ใจหรือไม่ว่าต้องการลบประกาศนี้?' : 'Are you sure you want to delete this announcement?')) {
      try {
        await coreAnnouncementApi.remove(id);
        fetchAnnouncements();
      } catch (err) {
        console.error('Failed to delete announcement:', err);
      }
    }
  };

  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'broadcast') return matchesSearch && a.targetType === 'ALL';
    // Mocks for UI tabs
    if (activeTab === 'alert') return matchesSearch && a.targetType === 'ROLE';
    if (activeTab === 'system') return matchesSearch && a.targetType === 'DEPARTMENT';
    return matchesSearch;
  });

  const getTargetLabel = (type: string) => {
    switch(type) {
      case 'ALL': return 'All Users';
      case 'DEPARTMENT': return 'Department';
      case 'ROLE': return 'Role';
      case 'USER': return 'Specific Users';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'broadcast': return <Send size={18} color="#3b82f6" />;
      case 'alert': return <AlertTriangle size={18} color="#ef4444" />;
      case 'success': return <CheckCircle2 size={18} color="#10b981" />;
      default: return <Info size={18} color="#f59e0b" />;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'scheduled') {
      return <span style={{ padding: "4px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 600, background: "#fef3c7", color: "#d97706", border: "1px solid #fde68a", display: "inline-flex", alignItems: "center", gap: "4px" }}><Clock size={12}/> ตั้งเวลาส่ง</span>;
    }
    return <span style={{ padding: "4px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 600, background: "#ecfdf5", color: "#10b981", border: "1px solid #a7f3d0", display: "inline-flex", alignItems: "center", gap: "4px" }}><CheckCircle2 size={12}/> ส่งแล้ว</span>;
  };

  return (
    <div style={{ maxWidth: "100%", overflowX: "hidden", display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* ── Welcome Header ── */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px 32px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1e293b", margin: "0 0 8px 0" }}>
            จัดการประกาศองค์กร
          </h2>
          <p style={{ fontSize: "15px", color: "#64748b", margin: 0 }}>
            ศูนย์รวมการส่งข้อความ ประกาศองค์กร และตรวจสอบประวัติการแจ้งเตือนของระบบไปยังผู้ใช้งาน
          </p>
        </div>
        <button
          onClick={() => openModal()}
          style={{
            background: "#3b82f6",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "14px",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 6px rgba(59, 130, 246, 0.2)"
          }}
        >
          <Plus size={18} /> สร้างประกาศใหม่
        </button>
      </div>

      {/* ── Metrics Row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "24px",
        }}
      >
        <StatCard title="ส่งแล้ว (วันนี้)" value="15,420" suffix="Messages" icon={Send} color="#3b82f6" iconBgColor="#eff6ff" />
        <StatCard title="อัตราการอ่าน (Read Rate)" value="87.5" suffix="%" icon={CheckCircle2} color="#10b981" iconBgColor="#ecfdf5" />
        <StatCard title="ตั้งเวลา (Scheduled)" value="4" suffix="Queue" icon={Clock} color="#f59e0b" iconBgColor="#fffbeb" />
        <StatCard title="แจ้งปัญหา (Alerts)" value="12" suffix="Issues" icon={AlertTriangle} color="#ef4444" iconBgColor="#fef2f2" />
      </div>

      {/* ── Main Panel ── */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          
          <div style={{ display: "flex", gap: "24px" }}>
            {['all', 'broadcast', 'alert', 'system'].map((tab) => (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: activeTab === tab ? "#3b82f6" : "#64748b",
                  paddingBottom: "2px",
                  borderBottom: activeTab === tab ? "2px solid #3b82f6" : "2px solid transparent",
                }}
              >
                {tab === 'all' && 'ทั้งหมด'}
                {tab === 'broadcast' && 'ประกาศ (Broadcast)'}
                {tab === 'alert' && 'แจ้งเตือนระบบ (Alert)'}
                {tab === 'system' && 'ข้อความทั่วไป'}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} size={16} />
              <input
                type="text"
                placeholder="ค้นหาประกาศ/ผู้รับ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: "8px 12px 8px 34px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "13px",
                  outline: "none",
                  width: "220px",
                }}
              />
            </div>
            <button style={{ padding: "8px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", color: "#475569", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
              <Filter size={14} /> ตัวกรอง
            </button>
          </div>
        </div>

        <div style={{ padding: "0", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                <th style={{ padding: "14px 24px", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>รหัส / ประเภท</th>
                <th style={{ padding: "14px 24px", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>หัวข้อประกาศ (Title)</th>
                <th style={{ padding: "14px 24px", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>ผู้รับ (Target)</th>
                <th style={{ padding: "14px 24px", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>อัตราการอ่าน</th>
                <th style={{ padding: "14px 24px", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>กำหนดเวลา</th>
                <th style={{ padding: "14px 24px", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>สถานะ</th>
                <th style={{ padding: "14px 24px", fontSize: "12px", fontWeight: 600, color: "#64748b", textAlign: "right" }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "48px 24px", textAlign: "center", color: "#64748b" }}>
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : filteredAnnouncements.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "48px 24px", textAlign: "center", color: "#64748b" }}>
                    ไม่พบข้อมูลประกาศ
                  </td>
                </tr>
              ) : (
                filteredAnnouncements.map((item, index) => {
                  const isBroadcast = item.targetType === 'ALL';
                  const codeNumber = (1004 - index).toString().padStart(4, '0');
                  // Fake type for UI colors
                  const uiType: string = isBroadcast ? 'broadcast' : (item.targetType === 'DEPARTMENT' ? 'info' : 'alert');
                  const uiStatus = item.isActive ? 'sent' : 'scheduled';
                  
                  return (
                    <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "16px 24px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: uiType === 'broadcast' ? "#eff6ff" : uiType === 'alert' ? "#fef2f2" : uiType === 'success' ? "#ecfdf5" : "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {getTypeIcon(uiType)}
                          </div>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>NOT-{codeNumber}</div>
                            <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" }}>{uiType}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px", verticalAlign: "middle", maxWidth: "400px" }}>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>{item.title}</div>
                        <div style={{ fontSize: "12px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.message}</div>
                      </td>
                      <td style={{ padding: "16px 24px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#475569", fontWeight: 500 }}>
                          <User size={14} color="#94a3b8" /> {getTargetLabel(item.targetType)}
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px", verticalAlign: "middle", minWidth: "160px" }}>
                        {uiStatus === 'sent' ? (
                          <div style={{ width: "100%" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "12px", fontWeight: 600, color: "#475569" }}>
                              <span>Read Rate</span>
                              <span>85%</span>
                            </div>
                            <div style={{ width: "100%", height: "4px", background: "#e2e8f0", borderRadius: "2px" }}>
                              <div style={{ width: `85%`, height: "100%", background: "#3b82f6", borderRadius: "2px" }} />
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>N/A (รอส่ง)</span>
                        )}
                      </td>
                      <td style={{ padding: "16px 24px", verticalAlign: "middle", minWidth: "160px" }}>
                        <div style={{ fontSize: "12px", color: "#475569" }}>
                          <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                            เริ่ม: <span style={{ fontWeight: 400 }}>{item.scheduleDate ? format(new Date(item.scheduleDate), configs?.dateTimeFormat || 'yyyy-MM-dd HH:mm:ss') : 'ทันที'}</span>
                          </div>
                          <div style={{ fontWeight: 600 }}>
                            สิ้นสุด: <span style={{ fontWeight: 400 }}>{item.endDate ? format(new Date(item.endDate), configs?.dateTimeFormat || 'yyyy-MM-dd HH:mm:ss') : 'ไม่มี'}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px", verticalAlign: "middle", minWidth: "130px" }}>
                        {getStatusBadge(uiStatus)}
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "6px", fontWeight: 500 }}>
                          {item.createDate ? format(new Date(item.createDate), configs?.dateTimeFormat || 'yyyy-MM-dd HH:mm:ss') : '-'}
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px", verticalAlign: "middle", textAlign: "right", minWidth: "120px" }}>
                        <button 
                          onClick={() => openModal(item)}
                          style={{ background: "transparent", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: "13px", fontWeight: 600, padding: "4px 8px", borderRadius: "6px", transition: "background 0.2s" }}
                          onMouseOver={(e) => e.currentTarget.style.background = "#eff6ff"}
                          onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          แก้ไข
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "13px", fontWeight: 600, padding: "4px 8px", borderRadius: "6px", transition: "background 0.2s", marginLeft: "4px" }}
                          onMouseOver={(e) => e.currentTarget.style.background = "#fef2f2"}
                          onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(2px)", padding: "16px"
        }}>
          <div style={{
            background: "#fff", borderRadius: "12px", width: "100%", maxWidth: "500px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px",
              borderBottom: "1px solid #e2e8f0"
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Megaphone size={20} color="#3b82f6" />
                {editingId ? (lang === 'th' ? 'แก้ไขประกาศ' : 'Edit Announcement') : (lang === 'th' ? 'สร้างประกาศใหม่' : 'Create New Announcement')}
              </h3>
              <button
                onClick={closeModal}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", padding: "4px", borderRadius: "6px" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                    {lang === 'th' ? 'หัวข้อประกาศ *' : 'Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                    placeholder={lang === 'th' ? 'ระบุหัวข้อประกาศ...' : 'Enter announcement title...'}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                    {lang === 'th' ? 'รายละเอียดประกาศ *' : 'Message *'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none", resize: "none", boxSizing: "border-box" }}
                    placeholder={lang === 'th' ? 'ระบุรายละเอียด...' : 'Enter message content...'}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                    {lang === 'th' ? 'กลุ่มเป้าหมาย' : 'Target Audience'}
                  </label>
                  <select
                    value={formData.targetType}
                    onChange={(e) => setFormData({ ...formData, targetType: e.target.value, targetIds: [] })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                  >
                    <option value="ALL">{lang === 'th' ? 'ทุกคนในระบบ (All)' : 'All Users'}</option>
                    <option value="DEPARTMENT">{lang === 'th' ? 'เฉพาะแผนก (Department)' : 'Specific Department'}</option>
                    <option value="ROLE">{lang === 'th' ? 'เฉพาะบทบาท (Role)' : 'Specific Role'}</option>
                    <option value="USER">{lang === 'th' ? 'เฉพาะผู้ใช้งาน (Users)' : 'Specific Users'}</option>
                  </select>
                </div>

                {formData.targetType !== 'ALL' && (
                  <div ref={dropdownRef} style={{ position: "relative" }}>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                      {lang === 'th' ? 'เลือกกลุ่มเป้าหมาย (Multi-select)' : 'Select Targets (Multi-select)'}
                    </label>
                    <div 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      style={{ 
                        width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", 
                        fontSize: "14px", outline: "none", boxSizing: "border-box", minHeight: "40px",
                        cursor: "pointer", display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center"
                      }}
                    >
                      {(!formData.targetIds || formData.targetIds.length === 0) && (
                        <span style={{ color: "#94a3b8" }}>
                          {lang === 'th' ? 'เลือกเป้าหมาย...' : 'Select targets...'}
                        </span>
                      )}
                      {Array.isArray(formData.targetIds) && formData.targetIds.map((id: string) => {
                        const optionLabel = (formData.targetType && TARGET_OPTIONS[formData.targetType]?.find((o: any) => o.id === id)?.label) || id;
                        return (
                          <span key={id} style={{
                            background: "#eff6ff", color: "#3b82f6", padding: "4px 8px", borderRadius: "4px",
                            display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 500
                          }}>
                            {optionLabel}
                            <X size={14} style={{ cursor: "pointer", padding: "2px", borderRadius: "50%" }} 
                              onMouseOver={(e) => e.currentTarget.style.background = "#dbeafe"}
                              onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData({ ...formData, targetIds: formData.targetIds.filter((tId: string) => tId !== id) });
                              }} 
                            />
                          </span>
                        );
                      })}
                    </div>
                    
                    {isDropdownOpen && (
                      <div style={{
                        position: "absolute", top: "100%", left: 0, right: 0, marginTop: "4px",
                        background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", zIndex: 10,
                        maxHeight: "200px", overflowY: "auto"
                      }}>
                        {formData.targetType && TARGET_OPTIONS[formData.targetType]?.length > 0 ? (
                          TARGET_OPTIONS[formData.targetType].map((option: any) => {
                            const isSelected = Array.isArray(formData.targetIds) && formData.targetIds.includes(option.id);
                            return (
                              <div 
                                key={option.id}
                                onClick={() => {
                                  const currentIds = Array.isArray(formData.targetIds) ? formData.targetIds : [];
                                  if (isSelected) {
                                    setFormData({ ...formData, targetIds: currentIds.filter((id: string) => id !== option.id) });
                                  } else {
                                    setFormData({ ...formData, targetIds: [...currentIds, option.id] });
                                  }
                                }}
                                style={{
                                  padding: "10px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
                                  background: isSelected ? "#f8fafc" : "#fff",
                                  borderBottom: "1px solid #f1f5f9", transition: "background 0.2s"
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = isSelected ? "#f1f5f9" : "#f8fafc"}
                                onMouseOut={(e) => e.currentTarget.style.background = isSelected ? "#f8fafc" : "#fff"}
                              >
                                <div style={{
                                  width: "18px", height: "18px", border: "1px solid #cbd5e1", borderRadius: "4px",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  background: isSelected ? "#3b82f6" : "#fff", borderColor: isSelected ? "#3b82f6" : "#cbd5e1"
                                }}>
                                  {isSelected && <Check size={14} color="#fff" />}
                                </div>
                                <span style={{ fontSize: "14px", color: "#334155", fontWeight: isSelected ? 500 : 400 }}>
                                  {option.label}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ padding: "12px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                            ไม่มีข้อมูลให้เลือก
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", gap: "24px", marginTop: "8px", alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", width: "100%" }}>
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => {
                        setFormData({ 
                          ...formData, 
                          isActive: e.target.checked,
                          scheduleDate: e.target.checked ? '' : formData.scheduleDate,
                          endDate: e.target.checked ? '' : formData.endDate
                        });
                      }}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <label htmlFor="isActive" style={{ fontSize: "14px", fontWeight: 500, color: "#334155", cursor: "pointer" }}>
                      {lang === 'th' ? 'เปิดใช้งานประกาศนี้ทันที' : 'Set Active Status'}
                    </label>
                  </div>

                  {!formData.isActive && (
                    <>
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                          {lang === 'th' ? 'เวลาที่เริ่มประกาศ *' : 'Start Date & Time *'}
                        </label>
                        <input
                          type="datetime-local"
                          required={!formData.isActive}
                          value={formData.scheduleDate || ''}
                          onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                          style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#334155", marginBottom: "6px" }}>
                          {lang === 'th' ? 'เวลาสิ้นสุดประกาศ' : 'End Date & Time'}
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.endDate || ''}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "32px" }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: "10px 16px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "8px",
                    color: "#475569", fontWeight: 600, fontSize: "14px", cursor: "pointer"
                  }}
                >
                  {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 16px", background: "#3b82f6", border: "none", borderRadius: "8px",
                    color: "#fff", fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                  }}
                >
                  <Check size={16} />
                  {lang === 'th' ? 'บันทึกข้อมูล' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
