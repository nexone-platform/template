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
import {
  Plus,
  Edit2,
  Trash2,
  Globe,
  Hash,
  Type,
  FileText,
  Eye
} from "lucide-react";
import Pagination from "@/components/Pagination";
import { useApiConfig } from '../contexts/ApiConfigContext';

interface Language {
  id?: number;
  languageCode?: string;
  languageName?: string;
  description?: string;
  isActive?: boolean;
}

export default function SystemLanguages() {
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
    }, [configLoading, configs?.pageRecordDefault, hasSetDefaultPageSize]);
  const [languages, setLanguages] = useState<Language[]>([]);

  // CRUD State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<
    "add" | "edit" | "view" | "delete"
  >("add");
  const [selectedItem, setSelectedItem] = useState<Language | null>(null);

  const [formData, setFormData] = useState<Partial<Language>>({
    languageCode: "",
    languageName: "",
    description: "",
    isActive: true,
  });

  const { getEndpoint } = useApiConfig();
    const coreApi = getEndpoint('NexCore', '');
    const API_URL = `${coreApi}/translations/languages`;

  const fetchLanguages = async () => {
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
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  // Action Handlers
  const handleAdd = () => {
    setFormData({
      languageCode: "",
      languageName: "",
      description: "",
      isActive: true,
    });
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
    try {
      const method = modalMode === "edit" ? "PUT" : "POST";
      const url =
        modalMode === "edit" ? `${API_URL}/${selectedItem?.id}` : API_URL;
      const res = await fetch(url, { credentials: 'include', 
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
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    try {
      const res = await fetch(`${API_URL}/${selectedItem.id}`, { credentials: 'include', 
        method: "DELETE",
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchLanguages();
      }
    } catch (error) {
      console.error("Error deleting language:", error);
    }
  };

  const toggleStatus = async (val: boolean, item: Language) => {
    try {
      const res = await fetch(`${API_URL}/${item.id}`, { credentials: 'include', 
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: val }),
      });
      if (res.ok) {
        fetchLanguages();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  // Filter
  const searchLower = search.toLowerCase();
  const filteredData = languages.filter(
    (item) =>
      !searchLower ||
      item.languageName?.toLowerCase().includes(searchLower) ||
      item.languageCode?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower),
  );

  // Pagination
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <CrudLayout
      toolbarLeft={
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
          onExportPDF={() => exportToPDF(filteredData, "SystemLanguages", [
            { key: "id", label: "ID" },
            { key: "languageCode", label: "รหัส (CODE)" },
            { key: "languageName", label: "ชื่อภาษา (NAME)" },
            { key: "description", label: "รายละเอียด (DESCRIPTION)" },
            { key: "isActive", label: "สถานะ", format: (item: any) => (item.isActive ? "ใช้งาน" : "ไม่ใช้งาน") }
          ], "System Languages Report")}
        />
      }
      toolbarRight={
        <>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="ค้นหาภาษา, รหัส..."
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
            <Plus size={16} /> <span>เพิ่มภาษาใหม่</span>
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
              <th>ชื่อภาษา (NAME)</th>
              <th>รายละเอียด (DESCRIPTION)</th>
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
              <tr key={item.id}>
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
                    {item.languageCode || "-"}
                  </div>
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
                      {item.languageName || "-"}
                    </span>
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
                    <FileText size={14} color="var(--text-muted)" />
                    {item.description || "-"}
                  </div>
                </td>
                <td className="text-center">
                  <StatusDropdown
                    status={item.isActive ?? false}
                    onChange={(val: boolean) => toggleStatus(val, item)}
                  />
                </td>
                <td className="text-center" style={{ paddingRight: "24px" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      onClick={() => handleView(item)}
                      style={{
                        ...crudStyles.actionBtn,
                        color: "var(--accent-blue)",
                        background: "var(--accent-blue-glow)",
                      }}
                      title="ดูรายละเอียด"
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
            {languages.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#64748b",
                  }}
                >
                  ไม่พบข้อมูลภาษา
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
            ? "เพิ่มภาษาใหม่"
            : modalMode === "edit"
              ? "แก้ไขข้อมูลภาษา"
              : "รายละเอียดภาษา"
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
                    formData.languageCode?.trim() && formData.languageName?.trim()
                      ? 1
                      : 0.5,
                }}
                disabled={
                  !(formData.languageCode?.trim() && formData.languageName?.trim())
                }
              >
                บันทึกข้อมูล
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
                รหัสภาษา (Code) <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                style={crudStyles.input}
                value={formData.languageCode || ""}
                onChange={(e) =>
                  setFormData({ ...formData, languageCode: e.target.value })
                }
                disabled={modalMode === "view"}
                placeholder="เช่น th, en, cn"
              />
            </div>
            <div>
              <label style={crudStyles.label}>
                ชื่อภาษา (Name) <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                style={crudStyles.input}
                value={formData.languageName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, languageName: e.target.value })
                }
                disabled={modalMode === "view"}
                placeholder="เช่น Thai, English"
              />
            </div>
          </div>
          <div>
            <label style={crudStyles.label}>รายละเอียด (Description)</label>
            <input
              type="text"
              style={crudStyles.input}
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={modalMode === "view"}
              placeholder="คำอธิบายเพิ่มเติม (ถ้ามี)"
            />
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
            คุณต้องการลบภาษา{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {selectedItem?.languageName}
            </strong>{" "}
            ใช่หรือไม่?
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: "#ef4444" }}>
            การกระทำนี้จะไม่สามารถย้อนกลับได้
          </p>
        </div>
      </BaseModal>
    </CrudLayout>
  );
}
