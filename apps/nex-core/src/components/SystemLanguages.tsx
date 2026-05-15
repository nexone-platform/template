import React, { useState, useEffect, useCallback } from "react";
import CrudLayout from "@/components/CrudLayout";
import {
  SearchInput,
  AdvancedSearchModal,
  AdvancedSearchField,
  crudStyles,
  StatusDropdown,
  BaseModal,
  ExportButtons,
} from "@/components/CrudComponents";
import ImportExcelButton from "@/components/ImportExcelButton";
import { exportToCSV, exportToXLSX, exportToPDF } from "@/utils/exportUtils";
import {
  Plus,
  Edit2,
  Trash2,
  Hash,
  FileText,
  Eye,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  Settings
} from "lucide-react";
import Pagination from "@/components/Pagination";
import { useApiConfig } from '../contexts/ApiConfigContext';
import { useSystemConfig, useLanguage } from '@nexone/ui';

interface Language {
  id?: number;
  languageCode?: string;
  languageName?: string;
  description?: string;
  isActive?: boolean;
}

export default function SystemLanguages() {
  const { lang } = useLanguage();
  const { getEndpoint } = useApiConfig();
  const { configs, loading: configLoading } = useSystemConfig();
  const coreApi = getEndpoint('NexCore', '');
  const API_URL = `${coreApi}/translations/languages`;

  const [t, setT] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const res = await fetch(`${coreApi}/translations/map?lang=${lang}`, { credentials: 'include' });
        const data = await res.json();
        if (data && typeof data === 'object') {
          setT(data);
        }
      } catch (err) {
        console.error('Failed to load translations:', err);
      }
    };
    if (coreApi && lang) {
      fetchTranslations();
    }
  }, [coreApi, lang]);

  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({ key: '', direction: null });

  // Column Settings State
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    no: true,
    languageCode: true,
    languageName: true,
    description: true,
    isActive: true
  });

  // Advanced Search State
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advSearchValues, setAdvSearchValues] = useState<Record<string, string>>({ code: '', name: '', status: 'all' });

  const advancedSearchFields: AdvancedSearchField[] = [
    { key: 'code', label: t['language_code'] || 'รหัสภาษา', type: 'text', placeholder: 'พิมพ์รหัส...' },
    { key: 'name', label: t['language_name'] || 'ชื่อภาษา', type: 'text', placeholder: 'พิมพ์ชื่อภาษา...' },
    {
      key: 'status', label: t['status'] || 'สถานะ', type: 'select', options: [
        { value: 'all', label: t['all'] || 'ทั้งหมด' },
        { value: 'active', label: t['active'] || 'ใช้งาน' },
        { value: 'inactive', label: t['inactive'] || 'ไม่ใช้งาน' },
      ]
    },
  ];

  const handleAdvSearchChange = (key: string, value: string) => {
    setAdvSearchValues(prev => ({ ...prev, [key]: value }));
  };
  const handleAdvSearchClear = () => {
    setAdvSearchValues({ code: '', name: '', status: 'all' });
  };
  const handleAdvSearchSubmit = () => {
    setCurrentPage(1);
    setShowAdvancedSearch(false);
  };

  const [pageSize, setPageSize] = useState(configs?.pageRecordDefault || 10);
  const [hasSetDefaultPageSize, setHasSetDefaultPageSize] = useState(false);

  useEffect(() => {
    if (!configLoading && configs?.pageRecordDefault && !hasSetDefaultPageSize) {
      setPageSize(configs.pageRecordDefault);
      setHasSetDefaultPageSize(true);
    }
  }, [configLoading, configs?.pageRecordDefault, hasSetDefaultPageSize]);

  // CRUD State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view" | "delete">("add");
  const [selectedItem, setSelectedItem] = useState<Language | null>(null);
  const [formData, setFormData] = useState<Partial<Language>>({ languageCode: "", languageName: "", description: "", isActive: true });
  const [saving, setSaving] = useState(false);

  const fetchLanguages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { credentials: 'include' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setLanguages(data);
      } else if (data && data.data && Array.isArray(data.data)) {
        setLanguages(data.data);
      }
    } catch (error) {
      console.error("Error fetching languages:", error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  // Action Handlers
  const handleAdd = () => {
    setFormData({ languageCode: "", languageName: "", description: "", isActive: true });
    setModalMode("add");
    setIsModalOpen(true);
  };
  const handleEdit = (item: Language) => {
    setFormData({ ...item });
    setSelectedItem(item);
    setModalMode("edit");
    setIsModalOpen(true);
  };
  const handleView = (item: Language) => {
    setFormData({ ...item });
    setSelectedItem(item);
    setModalMode("view");
    setIsModalOpen(true);
  };
  const handleDeleteClick = (item: Language) => {
    setSelectedItem(item);
    setModalMode("delete");
    setIsModalOpen(true);
  };

  const saveForm = async () => {
    if (!formData.languageCode?.trim() || !formData.languageName?.trim()) return;
    setSaving(true);
    try {
      const method = modalMode === "edit" ? "PUT" : "POST";
      const url = modalMode === "edit" ? `${API_URL}/${selectedItem?.id}` : API_URL;
      const res = await fetch(url, {
        credentials: 'include',
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchLanguages();
      }
    } catch (error) {
      console.error("Error saving language:", error);
    }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/${selectedItem.id}`, {
        credentials: 'include',
        method: "DELETE",
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchLanguages();
      }
    } catch (error) {
      console.error("Error deleting language:", error);
    }
    setSaving(false);
  };

  const toggleStatus = async (val: boolean, item: Language) => {
    try {
      const res = await fetch(`${API_URL}/${item.id}`, {
        credentials: 'include',
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: val }),
      });
      if (res.ok) {
        setLanguages(prev => prev.map(d => d.id === item.id ? { ...d, isActive: val } : d));
      }
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const handleImport = async (data: any[]) => {
    let success = 0;
    let failed = 0;
    try {
      for (const item of data) {
        if (item.languageCode && item.languageName) {
          const res = await fetch(API_URL, {
            credentials: 'include',
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              languageCode: item.languageCode,
              languageName: item.languageName,
              description: item.description || '',
              isActive: true
            })
          });
          if (res.ok) success++; else failed++;
        } else {
          failed++;
        }
      }
    } catch (err) {
      console.error('Import failed:', err);
    }
    return { success, failed };
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = null;
      else direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  // Filter
  const searchLower = search.toLowerCase();
  const filteredData = languages.filter((item) => {
    const matchQuickSearch = !searchLower ||
      item.languageName?.toLowerCase().includes(searchLower) ||
      item.languageCode?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower);

    const matchCode = !advSearchValues.code || (item.languageCode || '').toLowerCase().includes(advSearchValues.code.toLowerCase());
    const matchName = !advSearchValues.name || (item.languageName || '').toLowerCase().includes(advSearchValues.name.toLowerCase());
    const matchStatus = advSearchValues.status === 'all' || advSearchValues.status === '' ||
      (advSearchValues.status === 'active' && item.isActive) ||
      (advSearchValues.status === 'inactive' && !item.isActive);

    return matchQuickSearch && matchCode && matchName && matchStatus;
  });

  // Sort
  let sortedData = [...filteredData];
  if (sortConfig.key && sortConfig.direction !== null) {
    sortedData.sort((a, b) => {
      const aVal = (a as any)[sortConfig.key];
      const bVal = (b as any)[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const renderSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey || sortConfig.direction === null) return <ChevronsUpDown size={14} style={{ opacity: 0.3 }} />;
    if (sortConfig.direction === 'asc') return <ArrowDown size={14} />;
    return <ArrowUp size={14} />;
  };

  const renderTh = (label: string, columnKey: string, width?: string) => (
    <th style={{ width, cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }} onClick={() => handleSort(columnKey)}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
        <span>{label}</span>
        {renderSortIcon(columnKey)}
      </div>
    </th>
  );

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

  return (
    <CrudLayout
      toolbarLeft={
        <div style={{ display: 'flex', gap: '8px' }}>
          <ExportButtons
            onExportXLSX={() => exportToXLSX(filteredData, "SystemLanguages", [
              { key: "id", label: "ID" },
              { key: "languageCode", label: "รหัส (CODE)" },
              { key: "languageName", label: "ชื่อภาษา (NAME)" },
              { key: "description", label: "รายละเอียด (DESCRIPTION)" },
              { key: "isActive", label: "สถานะ", format: (item: any) => (item.isActive ? "ใช้งาน" : "ไม่ใช้งาน") }
            ])}
            onExportCSV={() => exportToCSV(filteredData, "SystemLanguages", [
              { key: "id", label: "ID" },
              { key: "languageCode", label: "รหัส (CODE)" },
              { key: "languageName", label: "ชื่อภาษา (NAME)" },
              { key: "description", label: "รายละเอียด (DESCRIPTION)" },
              { key: "isActive", label: "สถานะ", format: (item: any) => (item.isActive ? "ใช้งาน" : "ไม่ใช้งาน") }
            ])}
            onExportPDF={(orientation) => exportToPDF(filteredData, "SystemLanguages", [
              { key: "id", label: "ID" },
              { key: "languageCode", label: "รหัส (CODE)" },
              { key: "languageName", label: "ชื่อภาษา (NAME)" },
              { key: "description", label: "รายละเอียด (DESCRIPTION)" },
              { key: "isActive", label: "สถานะ", format: (item: any) => (item.isActive ? "ใช้งาน" : "ไม่ใช้งาน") }
            ], "System Languages Report", orientation)}
          />
          <ImportExcelButton
            columns={[
              { header: t['language_code'] || 'รหัส (CODE)', key: 'languageCode', required: true },
              { header: t['language_name'] || 'ชื่อภาษา (NAME)', key: 'languageName', required: true },
              { header: t['description'] || 'รายละเอียด (DESCRIPTION)', key: 'description' }
            ]}
            filenamePrefix="Languages_Import"
            onImport={handleImport}
            onImportComplete={() => fetchLanguages()}
            translations={{ ...t, import_button: t['import'] }}
          />
        </div>
      }
      toolbarRight={
        <>
          <SearchInput
            value={search}
            onChange={(val) => { setSearch(val); setCurrentPage(1); }}
            onClear={() => { setSearch(''); setCurrentPage(1); handleAdvSearchClear(); }}
            placeholder={t['search_placeholder'] || 'ค้นหาภาษา, รหัส...'}
            onAdvancedSearch={() => setShowAdvancedSearch(true)}
            advancedSearchValues={advSearchValues}
            onAdvancedSearchClear={handleAdvSearchClear}
            t={t}
          />
          <button
            onClick={handleAdd}
            className="btn btn-primary btn-sm"
            style={{
              display: "flex", alignItems: "center", gap: "6px", background: "var(--accent-blue)", color: "white", border: "none", borderRadius: "8px", padding: "8px 16px", fontWeight: 500, cursor: "pointer", height: '38.39px', whiteSpace: 'nowrap', flexShrink: 0
            }}
          >
            <Plus size={16} /> <span>{t['add_button'] || 'เพิ่มภาษาใหม่'}</span>
          </button>
        </>
      }
    >
      <div style={{ height: "720px", overflowY: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              {visibleColumns.no && <th style={{ width: "60px", textAlign: "center" }}>ลำดับ</th>}
              {visibleColumns.languageCode && renderTh('รหัส (CODE)', 'languageCode')}
              {visibleColumns.languageName && renderTh('ชื่อภาษา (NAME)', 'languageName')}
              {visibleColumns.description && renderTh('รายละเอียด (DESCRIPTION)', 'description')}
              {visibleColumns.isActive && renderTh('สถานะ', 'isActive', '120px')}
              <th className="text-center" style={{ width: "100px", paddingRight: "16px", whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                  <span>จัดการ</span>
                  <span title="ตั้งค่าคอลัมน์" style={{ display: 'flex', alignItems: 'center' }}>
                    <Settings size={16} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsColumnSettingsOpen(true)} />
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={item.id}>
                {visibleColumns.no && <td style={{ textAlign: "center", color: "var(--text-muted)" }}>
                  {(currentPage - 1) * pageSize + index + 1}
                </td>}
                {visibleColumns.languageCode && <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "var(--accent-blue)" }}>
                    <Hash size={12} style={{ opacity: 0.7 }} />
                    {item.languageCode || "-"}
                  </div>
                </td>}
                {visibleColumns.languageName && <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "13px" }}>
                      {item.languageName || "-"}
                    </span>
                  </div>
                </td>}
                {visibleColumns.description && <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)" }}>
                    <FileText size={14} color="var(--text-muted)" />
                    {item.description || "-"}
                  </div>
                </td>}
                {visibleColumns.isActive && <td className="text-center">
                  <StatusDropdown status={item.isActive ?? false} onChange={(val: boolean) => toggleStatus(val, item)} />
                </td>}
                <td className="text-center" style={{ paddingRight: "24px" }}>
                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button onClick={() => handleView(item)} style={{ ...crudStyles.actionBtn, color: "var(--accent-blue)", background: "var(--accent-blue-glow)" }} title="ดูรายละเอียด"><Eye size={14} /></button>
                    <button onClick={() => handleEdit(item)} style={{ ...crudStyles.actionBtn, color: "#f59e0b", background: "#fef3c7" }} title="แก้ไข"><Edit2 size={14} /></button>
                    <button onClick={() => handleDeleteClick(item)} style={{ ...crudStyles.actionBtn, color: "#ef4444", background: "#fee2e2" }} title="ลบ"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  ไม่พบข้อมูลภาษา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredData.length > 0 && (
        <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={filteredData.length} setCurrentPage={setCurrentPage} setPageSize={setPageSize} t={t} />
      )}

      {/* Column Settings Modal */}
      <BaseModal
        isOpen={isColumnSettingsOpen}
        onClose={() => setIsColumnSettingsOpen(false)}
        title="ตั้งค่าการแสดงผลตาราง"
        width="450px"
        footer={
          <button onClick={() => setIsColumnSettingsOpen(false)} style={{ padding: '10px 32px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>
            ตกลง
          </button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Object.keys(visibleColumns).map(key => {
            const labelMap: any = { no: 'ลำดับ', languageCode: 'รหัส (CODE)', languageName: 'ชื่อภาษา (NAME)', description: 'รายละเอียด (DESCRIPTION)', isActive: 'สถานะ' };
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', flex: 1 }}>
                  <input type="checkbox" checked={(visibleColumns as any)[key]} onChange={(e) => setVisibleColumns({ ...visibleColumns, [key]: e.target.checked })} /> {labelMap[key]}
                </label>
                <select style={{ width: '130px', padding: '4px 8px', height: '32px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                  value={sortConfig.key === key && sortConfig.direction !== null ? sortConfig.direction : 'none'}
                  onChange={(e) => setSortConfig({ key, direction: e.target.value === 'none' ? null : e.target.value as 'asc' | 'desc' })}>
                  <option value="none">ไม่เรียง</option>
                  <option value="asc">เรียง</option>
                  <option value="desc">เรียงจากมากไปน้อย</option>
                </select>
              </div>
            );
          })}
        </div>
      </BaseModal>

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        fields={advancedSearchFields}
        values={advSearchValues}
        onChange={handleAdvSearchChange}
        onClear={handleAdvSearchClear}
        onSubmit={handleAdvSearchSubmit}
        t={t}
      />

      {/* CRUD Modals */}
      <BaseModal
        isOpen={isModalOpen && modalMode !== "delete"}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "add" ? "เพิ่มภาษาใหม่" : modalMode === "edit" ? "แก้ไขข้อมูลภาษา" : "รายละเอียดภาษา"}
        width="600px"
        footer={
          modalMode !== "view" ? (
            <div style={{ display: "flex", gap: "12px", width: "100%", justifyContent: "flex-end", paddingTop: "16px" }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: "8px 24px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 500, fontSize: "14px" }}>ยกเลิก</button>
              <button onClick={saveForm} disabled={!(formData.languageCode?.trim() && formData.languageName?.trim()) || saving} style={{ padding: "8px 24px", background: "var(--accent-blue)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 500, fontSize: "14px", opacity: formData.languageCode?.trim() && formData.languageName?.trim() && !saving ? 1 : 0.5 }}>บันทึกข้อมูล</button>
            </div>
          ) : (
            <button onClick={() => setIsModalOpen(false)} style={{ padding: "8px 16px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", cursor: "pointer", fontWeight: 500, color: "var(--text-primary)" }}>ปิด</button>
          )
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={crudStyles.label}>รหัสภาษา (Code) <span style={{ color: "#ef4444" }}>*</span></label>
              <input type="text" style={crudStyles.input} value={formData.languageCode || ""} onChange={(e) => setFormData({ ...formData, languageCode: e.target.value })} disabled={modalMode === "view"} placeholder="เช่น th, en, cn" />
            </div>
            <div>
              <label style={crudStyles.label}>ชื่อภาษา (Name) <span style={{ color: "#ef4444" }}>*</span></label>
              <input type="text" style={crudStyles.input} value={formData.languageName || ""} onChange={(e) => setFormData({ ...formData, languageName: e.target.value })} disabled={modalMode === "view"} placeholder="เช่น Thai, English" />
            </div>
          </div>
          <div>
            <label style={crudStyles.label}>รายละเอียด (Description)</label>
            <input type="text" style={crudStyles.input} value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} disabled={modalMode === "view"} placeholder="คำอธิบายเพิ่มเติม (ถ้ามี)" />
          </div>
        </div>
      </BaseModal>

      <BaseModal
        isOpen={isModalOpen && modalMode === "delete"}
        onClose={() => setIsModalOpen(false)}
        title="ยืนยันการลบข้อมูลภาษา"
        width="400px"
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} style={{ padding: "8px 16px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 500 }}>ยกเลิก</button>
            <button onClick={confirmDelete} disabled={saving} style={{ padding: "8px 16px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 500 }}>{saving ? 'กำลังลบ...' : 'ลบข้อมูล'}</button>
          </>
        }
      >
        <div>
          <p style={{ margin: "0 0 8px 0", color: "var(--text-secondary)" }}>คุณต้องการลบภาษา <strong style={{ color: "var(--text-primary)" }}>{selectedItem?.languageName}</strong> ใช่หรือไม่?</p>
          <p style={{ margin: 0, fontSize: "13px", color: "#ef4444" }}>การกระทำนี้จะไม่สามารถย้อนกลับได้</p>
        </div>
      </BaseModal>
    </CrudLayout>
  );
}
