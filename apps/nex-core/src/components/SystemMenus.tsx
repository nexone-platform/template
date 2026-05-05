import { useSystemConfig } from '@nexone/ui';
import React, { useState, useEffect } from "react";
import CrudLayout from "@/components/CrudLayout";
import {
  SearchInput,
  crudStyles,
  StatusDropdown,
  BaseModal,
  ExportButtons,
} from "@/components/CrudComponents";
import { exportToCSV, exportToXLSX, exportToPDF } from "@/utils/exportUtils";
import * as LucideIcons from "lucide-react";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Link,
  LayoutTemplate,
  Hash,
} from "lucide-react";
import Pagination from "@/components/Pagination";
import { useApiConfig } from '../contexts/ApiConfigContext';

const SYSTEM_APPS = [
  'All App (ใช้กับทุกระบบ)',
  'NexCore', 'NexSite', 'NexForce', 'NexSpeed', 'NexCost', 'NexLess', 'NexStock', 'NexSales', 'NexFinance', 'NexProcure',
  'NexProduce', 'NexBI', 'NexPOS', 'NexPayroll', 'NexAsset', 'NexTax', 'NexApprove', 'NexAudit', 'NexConnect', 
  'NexDelivery', 'NexMaint', 'NexLearn', 'Central Auth'
];

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

interface PageMenu {
  menu_id?: number;
  menu_code?: string;
  title?: string;
  route?: string;
  page_key?: string;
  is_active?: boolean;
  icon?: string;
  app_name?: string;
}

export default function SystemMenus() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { configs, loading: configLoading } = useSystemConfig();
  const [pageSize, setPageSize] = useState(configs?.pageRecordDefault || 10);
  const [hasSetDefaultPageSize, setHasSetDefaultPageSize] = useState(false);

  useEffect(() => {
    if (!configLoading && configs?.pageRecordDefault && !hasSetDefaultPageSize) {
      setPageSize(configs.pageRecordDefault);
      setHasSetDefaultPageSize(true);
    }
  }, [configs, configLoading, hasSetDefaultPageSize]);

  const [menus, setMenus] = useState<PageMenu[]>([]);
  const [systemApps, setSystemApps] = useState<any[]>([]);
  const [activeAppNames, setActiveAppNames] = useState<string[]>([]);

  // CRUD State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<
    "add" | "edit" | "view" | "delete"
  >("add");
  const [selectedItem, setSelectedItem] = useState<PageMenu | null>(null);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [iconSearch, setIconSearch] = useState("");
  const [iconColor, setIconColor] = useState("#334155"); // Set default to dark slate
  const [iconStroke, setIconStroke] = useState(2);
  const [iconSize, setIconSize] = useState(24);
  const [activeCategory, setActiveCategory] = useState("All");
  
  const [iconCurrentPage, setIconCurrentPage] = useState(1);
  const [iconPageSize, setIconPageSize] = useState(100);

  // Reset page when category or search changes
  useEffect(() => {
    setIconCurrentPage(1);
  }, [activeCategory, iconSearch]);

  const renderIcon = (iconName?: string) => {
    if (!iconName) return <LucideIcons.LayoutTemplate size={16} />;
    
    // Map specific known database strings to Lucide components
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

  const [formData, setFormData] = useState<Partial<PageMenu>>({
    title: "",
    route: "",
    menu_code: "",
    icon: "",
    app_name: "ALL",
    is_active: true,
  });

  const { getEndpoint } = useApiConfig();
  const coreApi = getEndpoint('NexCore', 'http://localhost:8001/api');
  const API_URL = `${coreApi}/menus`;

  const fetchMenus = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMenus(data);
      }
    } catch (error) {
      console.error("Error fetching menus:", error);
    }
  };

  const fetchAppsData = async () => {
    try {
      const res = await fetch(`${coreApi}/v1/system-apps?all=true`, { credentials: 'include' });
      if (!res.ok) throw new Error('API returned ' + res.status);
      const data = await res.json();
      const appsList = data.data || data;
      if (Array.isArray(appsList)) {
        setSystemApps(appsList);
        const activeNames = appsList.filter((a: any) => a.is_active === true || a.is_active === 'true' || a.is_active === 1).map((a: any) => a.app_name);
        setActiveAppNames(['All App (ใช้กับทุกระบบ)', ...activeNames]);
      } else {
        setActiveAppNames(['All App (ใช้กับทุกระบบ)', ...SYSTEM_APPS]);
      }
    } catch (error) {
      console.error('Failed to fetch system apps:', error);
      setActiveAppNames(['All App (ใช้กับทุกระบบ)', ...SYSTEM_APPS]);
    }
  };

  useEffect(() => {
    fetchMenus();
    fetchAppsData();
  }, [coreApi]);

  // Action Handlers
  const handleAdd = () => {
    setFormData({
      title: "",
      route: "",
      menu_code: "",
      icon: "",
      app_name: "ALL",
      is_active: true,
    });
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleEdit = (item: PageMenu) => {
    setFormData({ ...item, app_name: item.app_name === 'All App (ใช้กับทุกระบบ)' ? 'ALL' : item.app_name });
    setSelectedItem(item);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleView = (item: PageMenu) => {
    setFormData({ ...item, app_name: item.app_name === 'All App (ใช้กับทุกระบบ)' ? 'ALL' : item.app_name });
    setSelectedItem(item);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleDeleteClick = (item: PageMenu) => {
    setSelectedItem(item);
    setModalMode("delete");
    setIsModalOpen(true);
  };

  const saveForm = async () => {
    if (!formData.title?.trim() || !formData.menu_code?.trim()) return;

    // Convert empty string app_name to null if required by backend, but we'll send it as is.
    try {
      const method = modalMode === "edit" ? "PUT" : "POST";
      const url =
        modalMode === "edit" ? `${API_URL}/${selectedItem?.menu_id}` : API_URL;
      const res = await fetch(url, { credentials: 'include', 
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchMenus();
      }
    } catch (error) {
      console.error("Error saving menu:", error);
    }
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    try {
      const res = await fetch(`${API_URL}/${selectedItem.menu_id}`, { credentials: 'include', 
        method: "DELETE",
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchMenus();
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
    }
  };

  const toggleStatus = async (val: boolean, item: PageMenu) => {
    try {
      const res = await fetch(`${API_URL}/${item.menu_id}/status`, { credentials: 'include', 
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: val }),
      });
      if (res.ok) {
        fetchMenus();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  // Filter
  const searchLower = search.toLowerCase();
  const filteredData = menus.filter(
    (item) =>
      !searchLower ||
      item.title?.toLowerCase().includes(searchLower) ||
      item.route?.toLowerCase().includes(searchLower) ||
      item.menu_code?.toLowerCase().includes(searchLower),
  );

  // Pagination
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Icon Picker Filter & Pagination Logic
  const activeCatObj = ICON_CATEGORIES.find(c => c.label === activeCategory);
  let iconFiltered: string[] = [];
  if (isIconModalOpen) {
    iconFiltered = Object.keys(LucideIcons).filter((name) => {
      if (!/^[A-Z]/.test(name)) return false;
      const lowerName = name.toLowerCase();
      if (iconSearch && !lowerName.includes(iconSearch.toLowerCase())) return false;
      if (activeCategory !== 'All' && activeCatObj) {
        if (!activeCatObj.keywords.some(kw => lowerName.includes(kw))) return false;
      }
      return true;
    });
  }
  const iconTotalPages = Math.max(1, Math.ceil(iconFiltered.length / iconPageSize));
  const iconPaginated = iconFiltered.slice((iconCurrentPage - 1) * iconPageSize, iconCurrentPage * iconPageSize);

  return (
    <CrudLayout
      toolbarLeft={
        <ExportButtons
          onExportXLSX={() => exportToXLSX(filteredData, "SystemMenus", [
            { key: "menu_id", label: "ID" },
            { key: "menu_code", label: "รหัส (CODE)" },
            { key: "title", label: "เมนู (TITLE)" },
            { key: "route", label: "เส้นทาง (PATH)" },
            { key: "app_name", label: "เชื่อมโยงแอป" },
            { key: "is_active", label: "สถานะ", format: (item: any) => (item.is_active ? "ใช้งาน" : "ไม่ใช้งาน") }
          ])}
          onExportCSV={() => exportToCSV(filteredData, "SystemMenus", [
            { key: "menu_id", label: "ID" },
            { key: "menu_code", label: "รหัส (CODE)" },
            { key: "title", label: "เมนู (TITLE)" },
            { key: "route", label: "เส้นทาง (PATH)" },
            { key: "app_name", label: "เชื่อมโยงแอป" },
            { key: "is_active", label: "สถานะ", format: (item: any) => (item.is_active ? "ใช้งาน" : "ไม่ใช้งาน") }
          ])}
          onExportPDF={(orientation) => exportToPDF(filteredData, "SystemMenus", [
            { key: "menu_id", label: "ID" },
            { key: "menu_code", label: "รหัส (CODE)" },
            { key: "title", label: "เมนู (TITLE)" },
            { key: "route", label: "เส้นทาง (PATH)" },
            { key: "app_name", label: "เชื่อมโยงแอป" },
            { key: "is_active", label: "สถานะ", format: (item: any) => (item.is_active ? "ใช้งาน" : "ไม่ใช้งาน") }
          ], "System Menus Report", orientation)}
        />
      }
      toolbarRight={
        <>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="ค้นหาเมนู, รหัส..."
          />
          <button
            onClick={handleAdd}
            className="btn btn-primary btn-sm"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "var(--accent-blue)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <Plus size={16} /> <span>สร้างเมนูใหม่</span>
          </button>
        </>
      }
    >
      <div style={{ height: "720px", overflowY: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "60px", textAlign: "center" }}>ลำดับ</th>
              <th>รหัส (CODE)</th>
              <th className="text-center" style={{ width: "80px" }}>ไอคอน (ICON)</th>
              <th>เมนู (TITLE)</th>
              <th>ค่าเมนู (LABEL)</th>
              <th>เส้นทาง (PATH)</th>
              <th className="text-center" style={{ width: "120px" }}>เชื่อมโยงแอป</th>
              <th className="text-center" style={{ width: "120px" }}>
                สถานะ
              </th>
              <th
                className="text-center"
                style={{ width: "100px", paddingRight: "24px" }}
              >
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={item.menu_id}>
                <td style={{ textAlign: "center", color: "var(--text-muted)" }}>
                  {(currentPage - 1) * pageSize + index + 1}
                </td>
                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--accent-blue)",
                    }}
                  >
                    <Hash size={12} style={{ opacity: 0.7 }} />
                    {item.menu_code || "-"}
                  </div>
                </td>
                <td className="text-center">
                  {item.icon ? (
                    <div
                      style={{
                        background: "rgba(99,102,241,0.1)",
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                        color: "var(--accent-blue)",
                      }}
                    >
                      {renderIcon(item.icon)}
                    </div>
                  ) : (
                    <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>-</span>
                  )}
                </td>
                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        fontSize: "13px",
                      }}
                    >
                      {item.title || "-"}
                    </span>
                  </div>
                </td>
                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                      {item.page_key || "-"}
                  </div>
                </td>
                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <Link size={14} color="var(--text-muted)" />
                    {item.route || "-"}
                  </div>
                </td>
                <td className="text-center">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <Link size={14} color="var(--text-muted)" />
                    {item.app_name ? (
                      <span style={{ 
                        background: item.app_name.toUpperCase() === 'ALL' ? '#cffafe' : '#f1f5f9', 
                        color: item.app_name.toUpperCase() === 'ALL' ? '#0891b2' : '#334155', 
                        padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                        border: '1px solid ' + (item.app_name.toUpperCase() === 'ALL' ? '#a5f3fc' : '#e2e8f0')
                      }}>
                        {item.app_name}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "12px", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0 6px", display: "inline-block" }}>-</span>
                    )}
                  </div>
                </td>

                <td className="text-center">
                  <StatusDropdown
                    status={item.is_active || false}
                    onChange={(val: boolean) => toggleStatus(val, item)}
                  />
                </td>
                <td className="text-center" style={{ paddingRight: "24px" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "4px",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      onClick={() => handleView(item)}
                      style={{
                        ...crudStyles.actionBtn,
                        color: "var(--accent-blue)",
                        background: "rgba(59,130,246,0.1)",
                      }}
                      title="เรียกดู"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      style={{
                        ...crudStyles.actionBtn,
                        color: "#f59e0b",
                        background: "#fef3c7",
                      }}
                      title="แก้ไข"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item)}
                      style={{
                        ...crudStyles.actionBtn,
                        color: "#ef4444",
                        background: "#fee2e2",
                      }}
                      title="ลบ"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {menus.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#64748b",
                  }}
                >
                  ไม่พบข้อมูลเมนูระบบ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredData.length}
          setCurrentPage={setCurrentPage}
          setPageSize={setPageSize}
        />
      )}

      <BaseModal
        isOpen={isModalOpen && modalMode !== "delete"}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === "add"
            ? "สร้างเมนูใหม่"
            : modalMode === "edit"
              ? "แก้ไขเมนู"
              : "รายละเอียดเมนู"
        }
        width="600px"
        footer={
          modalMode !== "view" ? (
            <div
              style={{
                display: "flex",
                gap: "12px",
                width: "100%",
                justifyContent: "flex-end",
                paddingTop: "16px",
              }}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: "8px 24px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 500,
                  fontSize: "14px",
                }}
              >
                ยกเลิก
              </button>
              <button
                onClick={saveForm}
                style={{
                  padding: "8px 24px",
                  background: "var(--accent-blue)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 500,
                  fontSize: "14px",
                  opacity:
                    formData.title?.trim() && formData.menu_code?.trim()
                      ? 1
                      : 0.5,
                }}
                disabled={
                  !(formData.title?.trim() && formData.menu_code?.trim())
                }
              >
                {modalMode === "add" ? "บันทึกข้อมูล" : "บันทึกข้อมูล"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                padding: "8px 16px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 500,
                color: "var(--text-primary)",
              }}
            >
              ปิด
            </button>
          )
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div>
              <label style={crudStyles.label}>
                รหัส (Menu Code) <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                style={crudStyles.input}
                value={formData.menu_code || ""}
                onChange={(e) =>
                  setFormData({ ...formData, menu_code: e.target.value })
                }
                disabled={modalMode === "view"}
                placeholder="เช่น ADMIN_01"
              />
            </div>
            <div>
              <label style={crudStyles.label}>
                เมนู (Title) <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                style={crudStyles.input}
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                disabled={modalMode === "view"}
                placeholder="เช่น Dashboard"
              />
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div>
              <label style={crudStyles.label}>เส้นทาง (Route/Path)</label>
              <input
                type="text"
                style={crudStyles.input}
                value={formData.route || ""}
                onChange={(e) =>
                  setFormData({ ...formData, route: e.target.value })
                }
                disabled={modalMode === "view"}
                placeholder="เช่น /dashboard"
              />
            </div>
            <div>
              <label style={crudStyles.label}>ไอคอน (Icon)</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  style={{ ...crudStyles.input, flex: 1 }}
                  value={formData.icon || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  disabled={modalMode === "view"}
                  placeholder="เช่น home, settings"
                />
                <button
                  type="button"
                  onClick={() => setIsIconModalOpen(true)}
                  disabled={modalMode === "view"}
                  style={{
                    padding: "0 14px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    cursor: modalMode === "view" ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-primary)",
                    transition: "all 0.2s",
                  }}
                  title="เลือกไอคอน"
                >
                  {formData.icon ? renderIcon(formData.icon) : <LucideIcons.Search size={18} />}
                </button>
              </div>
            </div>
            {modalMode !== "add" ? (
              <div>
                <label style={crudStyles.label}>รหัสรายการ (ID)</label>
                <input
                  type="text"
                  style={crudStyles.input}
                  value={formData.menu_id || ""}
                  disabled
                />
              </div>
            ) : <div />}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={crudStyles.label}>เชื่อมโยงกับแอประบบ (App Name)</label>
            <select
                style={{...crudStyles.input, appearance: 'auto', width: '100%', height: '40px'}}
                value={formData.app_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, app_name: e.target.value })
                }
                disabled={modalMode === "view"}
            >
                <option value="" disabled>-- เลือกแอประบบ --</option>
                {SYSTEM_APPS.map(appName => (
                  <option key={appName} value={appName === 'All App (ใช้กับทุกระบบ)' ? 'ALL' : appName}>{appName}</option>
                ))}
            </select>
          </div>
        </div>
      </BaseModal>

      <BaseModal
        isOpen={isModalOpen && modalMode === "delete"}
        onClose={() => setIsModalOpen(false)}
        title="ยืนยันการลบเมนู"
        width="400px"
        footer={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                padding: "8px 16px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              ยกเลิก
            </button>
            <button
              onClick={confirmDelete}
              style={{
                padding: "8px 16px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              ลบข้อมูล
            </button>
          </>
        }
      >
        <div>
          <p style={{ margin: "0 0 8px 0", color: "var(--text-secondary)" }}>
            คุณต้องการลบเมนู{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {selectedItem?.title}
            </strong>{" "}
            ใช่หรือไม่?
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: "#ef4444" }}>
            การกระทำนี้จะไม่สามารถย้อนกลับได้
          </p>
        </div>
      </BaseModal>

      <BaseModal
        isOpen={isIconModalOpen}
        onClose={() => setIsIconModalOpen(false)}
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
                      color: iconCurrentPage === 1 ? "var(--text-muted)" : "var(--text-primary)",
                      opacity: iconCurrentPage === 1 ? 0.5 : 1, fontSize: "16px", transition: "all 0.15s"
                    }}
                  >«</button>
                  <button 
                    onClick={() => setIconCurrentPage(p => Math.max(1, p - 1))} 
                    disabled={iconCurrentPage === 1}
                    style={{
                      width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center",
                      background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px",
                      cursor: iconCurrentPage === 1 ? "not-allowed" : "pointer",
                      color: iconCurrentPage === 1 ? "var(--text-muted)" : "var(--text-primary)",
                      opacity: iconCurrentPage === 1 ? 0.5 : 1, fontSize: "16px", transition: "all 0.15s"
                    }}
                  >‹</button>
                  
                  {Array.from({ length: Math.min(6, iconTotalPages) }, (_, i) => {
                    let pageNum = iconCurrentPage - 2 + i;
                    if (iconCurrentPage <= 3) pageNum = i + 1;
                    else if (iconCurrentPage > iconTotalPages - 3) pageNum = iconTotalPages - 5 + i;
                    
                    if (pageNum > 0 && pageNum <= iconTotalPages) {
                      return (
                        <button 
                          key={pageNum}
                          onClick={() => setIconCurrentPage(pageNum)}
                          style={{
                            width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center",
                            background: iconCurrentPage === pageNum ? 'var(--accent-blue)' : 'var(--bg-card)',
                            color: iconCurrentPage === pageNum ? 'white' : 'var(--text-primary)',
                            border: iconCurrentPage === pageNum ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
                            borderRadius: "8px", fontSize: "14px", fontWeight: iconCurrentPage === pageNum ? 600 : 500,
                            cursor: "pointer", transition: "all 0.15s"
                          }}
                        >
                          {pageNum}
                        </button>
                      )
                    }
                    return null;
                  })}

                  <button 
                    onClick={() => setIconCurrentPage(p => Math.min(iconTotalPages, p + 1))} 
                    disabled={iconCurrentPage === iconTotalPages}
                    style={{
                      width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center",
                      background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px",
                      cursor: iconCurrentPage === iconTotalPages ? "not-allowed" : "pointer",
                      color: iconCurrentPage === iconTotalPages ? "var(--text-muted)" : "var(--text-primary)",
                      opacity: iconCurrentPage === iconTotalPages ? 0.5 : 1, fontSize: "16px", transition: "all 0.15s"
                    }}
                  >›</button>
                  <button 
                    onClick={() => setIconCurrentPage(iconTotalPages)} 
                    disabled={iconCurrentPage === iconTotalPages}
                    style={{
                      width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center",
                      background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px",
                      cursor: iconCurrentPage === iconTotalPages ? "not-allowed" : "pointer",
                      color: iconCurrentPage === iconTotalPages ? "var(--text-muted)" : "var(--text-primary)",
                      opacity: iconCurrentPage === iconTotalPages ? 0.5 : 1, fontSize: "16px", transition: "all 0.15s"
                    }}
                  >»</button>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setIsIconModalOpen(false)}
              style={{
                padding: "8px 16px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 500,
                color: "var(--text-primary)",
                whiteSpace: "nowrap"
              }}
            >
              ปิดหน้าต่าง
            </button>
          </div>
        }
      >
        <div style={{ display: "flex", gap: "32px", height: "600px", paddingTop: "8px" }}>
          
          {/* Left Sidebar: Customizer & Categories */}
          <div style={{ width: "240px", display: "flex", flexDirection: "column", gap: "32px", overflowY: "auto", paddingRight: "16px" }} className="custom-scrollbar">
            
            {/* Customizer */}
            <div>
              <h4 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", display: "flex", justifyContent: "space-between" }}>
                <span>Customizer</span>
              </h4>
              
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                  <label style={{ width: "50px" }}>Color</label>
                  <label style={{ 
                        display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-secondary)", 
                        padding: "4px 8px", borderRadius: "8px", flex: 1, cursor: "pointer", border: "1px solid var(--border-color)"
                      }}
                  >
                        <input type="color" value={iconColor} onChange={e => setIconColor(e.target.value)} style={{ width: "20px", height: "20px", padding: 0, border: "none", borderRadius: "4px", background: "none", cursor: "pointer" }} />
                        <span style={{ fontSize: "12px", fontFamily: "monospace" }}>{iconColor.toUpperCase()}</span>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                  <label>Stroke width</label>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>{iconStroke}px</span>
                </div>
                <input type="range" min="1" max="3" step="0.5" value={iconStroke} onChange={e => setIconStroke(parseFloat(e.target.value))} style={{ width: "100%", accentColor: "#ef4444" }} />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                  <label>Size</label>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>{iconSize}px</span>
                </div>
                <input type="range" min="16" max="48" step="2" value={iconSize} onChange={e => setIconSize(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#ef4444" }} />
              </div>
            </div>

            {/* View & Categories */}
            <div>
              <h4 style={{ margin: "0 0 12px", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>Categories</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {ICON_CATEGORIES.map(cat => (
                  <button
                    key={cat.label}
                    onClick={() => setActiveCategory(cat.label)}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", border: "none", borderRadius: "6px", cursor: "pointer",
                      background: activeCategory === cat.label ? "rgba(239, 68, 68, 0.05)" : "transparent",
                      color: activeCategory === cat.label ? "#ef4444" : "var(--text-secondary)",
                      fontWeight: activeCategory === cat.label ? 600 : 500, fontSize: "14px",
                      textAlign: "left", transition: "all 0.15s"
                    }}
                  >
                    <span>{cat.label}</span>
                    <span style={{ opacity: 0.6, fontSize: "12px" }}>{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>
            
          </div>

          {/* Right Main Area: Search & Grid */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
            {(() => {
              const activeCatObj = ICON_CATEGORIES.find(c => c.label === activeCategory);
              const filtered = Object.keys(LucideIcons).filter((name) => {
                if (!/^[A-Z]/.test(name)) return false;
                
                const lowerName = name.toLowerCase();
                if (iconSearch && !lowerName.includes(iconSearch.toLowerCase())) {
                  return false;
                }
                if (activeCategory !== 'All' && activeCatObj) {
                  const matches = activeCatObj.keywords.some(kw => lowerName.includes(kw));
                  if (!matches) return false;
                }
                return true;
              });

              const totalPages = Math.ceil(filtered.length / iconPageSize);
              const paginatedIcons = filtered.slice((iconCurrentPage - 1) * iconPageSize, iconCurrentPage * iconPageSize);

              return (
                <>
                  <SearchInput
                    value={iconSearch}
                    onChange={setIconSearch}
                    placeholder={`ค้นหาไอคอน (ภาษาอังกฤษ) จาก ${iconFiltered.length} ไอคอนในหมวดนี้...`}
                  />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(10, 1fr)",
                      gap: "8px",
                      overflowY: "auto",
                      padding: "4px",
                      paddingRight: "8px",
                      alignContent: "start",
                      flex: 1
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
                            onClick={() => {
                              setFormData({ ...formData, icon: kebabName });
                              setIsIconModalOpen(false);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              aspectRatio: "1",
                              borderRadius: "8px",
                              cursor: "pointer",
                              border: formData.icon === kebabName ? "2px solid #ef4444" : "1px solid var(--border-color)",
                              background: formData.icon === kebabName ? "rgba(239, 68, 68, 0.05)" : "var(--bg-card)",
                              transition: "all 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              if (formData.icon !== kebabName) e.currentTarget.style.background = "var(--bg-secondary)";
                            }}
                            onMouseLeave={(e) => {
                              if (formData.icon !== kebabName) e.currentTarget.style.background = "var(--bg-card)";
                            }}
                          >
                            <IconComp size={iconSize} color={iconColor} strokeWidth={iconStroke} />
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </BaseModal>
    </CrudLayout>
  );
}
