import React, { useState } from "react";
import {
  Database,
  Server,
  Activity,
  HardDrive,
  Download,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  FileArchive,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

// Mock Data for Charts
const activityDataMonthly = [
  { time: "ม.ค.", connections: 450 }, { time: "ก.พ.", connections: 520 }, { time: "มี.ค.", connections: 600 }, { time: "เม.ย.", connections: 810 }, { time: "พ.ค.", connections: 750 }, { time: "มิ.ย.", connections: 920 },
];
const activityDataWeekly = [
  { time: "สัปดาห์ 1", connections: 320 }, { time: "สัปดาห์ 2", connections: 380 }, { time: "สัปดาห์ 3", connections: 510 }, { time: "สัปดาห์ 4", connections: 490 },
];
const activityDataDaily = [
  { time: "จ.", connections: 250 }, { time: "อ.", connections: 320 }, { time: "พ.", connections: 480 }, { time: "พฤ.", connections: 410 }, { time: "ศ.", connections: 550 }, { time: "ส.", connections: 120 }, { time: "อา.", connections: 90 },
];
const activityDataHourly = [
  { time: "00:00", connections: 45 }, { time: "04:00", connections: 30 }, { time: "08:00", connections: 120 }, { time: "12:00", connections: 210 }, { time: "16:00", connections: 180 }, { time: "20:00", connections: 95 }, { time: "24:00", connections: 50 },
];

const storageData = [
  { name: "System Logs", value: 45, color: "#cbd5e1" },
  { name: "Transactions", value: 30, color: "#3b82f6" },
  { name: "Users & Auth", value: 15, color: "#8b5cf6" },
  { name: "Other Models", value: 10, color: "#10b981" },
];

// Mock Data for Backups Table
const backupHistory = [
  {
    id: "BK-20260418-01",
    filename: "nexone_db_dump_2026-04-18.sql",
    date: "2026-04-18 02:00:00",
    size: "2.4 GB",
    type: "Automated (Daily)",
    createdBy: "System",
    status: "Completed",
  },
  {
    id: "BK-20260417-01",
    filename: "nexone_db_dump_2026-04-17.sql",
    date: "2026-04-17 02:00:00",
    size: "2.38 GB",
    type: "Automated (Daily)",
    createdBy: "System",
    status: "Completed",
  },
  {
    id: "BK-20260416-M1",
    filename: "manual_snapshot_pre_deploy.sql",
    date: "2026-04-16 14:30:00",
    size: "2.35 GB",
    type: "Manual",
    createdBy: "Admin User",
    status: "Completed",
  },
  {
    id: "BK-20260415-01",
    filename: "nexone_db_dump_2026-04-15.sql",
    date: "2026-04-15 02:00:00",
    size: "2.31 GB",
    type: "Automated (Daily)",
    createdBy: "System",
    status: "Completed",
  },
];

export default function DatabaseManagement() {
  const [search, setSearch] = useState("");
  const [chartFilter, setChartFilter] = useState("hourly");

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: "success" | "error" | "info" }>({
    visible: false,
    message: "",
    type: "info",
  });

  const [confirmModal, setConfirmModal] = useState<{ visible: boolean; title: string; message: string; onConfirm: () => void }>({
    visible: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  let currentChartData;
  switch (chartFilter) {
    case "monthly":
      currentChartData = activityDataMonthly;
      break;
    case "weekly":
      currentChartData = activityDataWeekly;
      break;
    case "daily":
      currentChartData = activityDataDaily;
      break;
    case "hourly":
    default:
      currentChartData = activityDataHourly;
      break;
  }

  const StatCard = ({
    title,
    value,
    suffix,
    icon: Icon,
    color,
    bgColor,
    iconBgColor
  }: any) => (
    <div
      style={{
        background: bgColor,
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        border: `1px solid ${color}`,
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: iconBgColor,
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
            fontSize: "13px",
            color: "#64748b",
            fontWeight: 500,
            marginBottom: "4px",
          }}
        >
          {title}
        </span>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
          <span
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: color,
              letterSpacing: "-0.5px",
            }}
          >
            {value}
          </span>
          {suffix && (
            <span style={{ fontSize: "13px", color: "#64748b" }}>{suffix}</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: "100%", overflowX: "hidden" }}>
      {/* Metrics Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "24px",
          marginBottom: "24px",
        }}
      >
        <StatCard
          title="การเชื่อมต่อปัจจุบัน (Active)"
          value="142"
          suffix="Connections"
          icon={Activity}
          color="#3b82f6" // Blue
          bgColor="#eff6ff"
          iconBgColor="#dbeafe"
        />
        <StatCard
          title="ขนาดฐานข้อมูล (Total Size)"
          value="12.4"
          suffix="GB"
          icon={HardDrive}
          color="#f59e0b" // Orange
          bgColor="#fffbeb"
          iconBgColor="#fef3c7"
        />
        <StatCard
          title="เวลาเปิดทำงาน (Uptime)"
          value="99.98"
          suffix="%"
          icon={Server}
          color="#10b981" // Green
          bgColor="#ecfdf5"
          iconBgColor="#d1fae5"
        />
        <StatCard
          title="จำนวนตาราง (Total Tables)"
          value="248"
          suffix="Tables"
          icon={Database}
          color="#ef4444" // Red
          bgColor="#fef2f2"
          iconBgColor="#fee2e2"
        />
      </div>

      {/* Charts Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "24px",
          marginBottom: "24px",
        }}
      >
        {/* Line Chart: Connection Logs */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>
              แนวโน้มการเชื่อมต่อ ({chartFilter === 'monthly' ? 'รายเดือน' : chartFilter === 'weekly' ? 'รายสัปดาห์' : chartFilter === 'daily' ? 'รายวัน' : 'รายชั่วโมง'})
            </h3>
            <div style={{ display: "flex", gap: "8px" }}>
               {['monthly', 'weekly', 'daily', 'hourly'].map((filter) => {
                 const labels: any = { monthly: 'รายเดือน', weekly: 'รายสัปดาห์', daily: 'รายวัน', hourly: 'รายชั่วโมง' };
                 return (
                   <button
                     key={filter}
                     onClick={() => setChartFilter(filter)}
                     style={{
                       padding: "6px 12px",
                       borderRadius: "6px",
                       border: chartFilter === filter ? "none" : "1px solid var(--border-color)",
                       background: chartFilter === filter ? "var(--accent-blue)" : "white",
                       color: chartFilter === filter ? "white" : "var(--text-secondary)",
                       fontSize: "12px",
                       cursor: "pointer",
                       transition: "all 0.2s"
                     }}
                   >
                     {labels[filter]}
                   </button>
                 );
               })}
            </div>
          </div>
          <div style={{ height: "300px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConnections" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
                <Area key={chartFilter} type="monotone" dataKey="connections" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorConnections)" animationDuration={500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Storage Distribution */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>
              การใช้พื้นที่ (Storage Distribution)
            </h3>
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={storageData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {storageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Absolute Center Text */}
            <div style={{
              position: "absolute", top: "45%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center"
            }}>
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "var(--text-primary)" }}>12.4</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "-2px" }}>GB Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: 600, color: "var(--text-primary)" }}>
              ประวัติการสำรองข้อมูล (Backup History)
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
              ระบบทำการสำรองข้อมูลอัตโนมัติทุกๆ เวลา 02:00 น.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div
              style={{
                position: "relative",
                width: "260px",
              }}
            >
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                placeholder="ค้นหาประวัติการสำรอง..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 36px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  outline: "none",
                  fontSize: "14px",
                  transition: "border-color 0.2s",
                }}
              />
            </div>
            
            <button
               onClick={() => {
                 setConfirmModal({
                   visible: true,
                   title: "ยืนยันการลบ",
                   message: "คุณมั่นใจหรือไม่ที่จะลบ Logs ขยะที่เก่าเกิน 90 วัน? ข้อมูลที่ถูกลบจะไม่สามารถกู้คืนได้",
                   onConfirm: () => {
                     setConfirmModal(prev => ({ ...prev, visible: false }));
                     showToast("ระบบได้เริ่มทำการเคลียร์ Logs ขยะในพื้นหลังแล้ว", "success");
                   }
                 });
               }}
               className="btn btn-secondary btn-sm"
               style={{
                 display: "flex",
                 alignItems: "center",
                 gap: "6px",
                 background: "white",
                 color: "var(--text-primary)",
                 border: "1px solid #e2e8f0",
                 borderRadius: "8px",
                 padding: "8px 16px",
                 fontWeight: 500,
                 cursor: "pointer",
                 transition: "all 0.2s"
               }}
               onMouseOver={(e) => e.currentTarget.style.background = "#fef2f2"}
               onMouseOut={(e) => e.currentTarget.style.background = "white"}
            >
              <Trash2 size={16} color="#ef4444" /> <span style={{ color: "#ef4444" }}>ลบ Logs ขยะ</span>
            </button>
            <button
              onClick={() => {
                showToast("ระบบกำลังสร้าง Database Backup โปรดรอสักครู่...", "info");
              }}
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
              <FileArchive size={16} /> <span>สร้าง Backup ทันที</span>
            </button>
          </div>
        </div>

        {/* Table Wrapper for Scrolling */}
        <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "160px", borderBottom: "1px solid var(--border-color)" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "60px", textAlign: "center" }}>ลำดับ</th>
                <th>รหัสอ้างอิง (ID)</th>
                <th>ชื่อไฟล์ (FILE NAME)</th>
                <th>วันที่สำรองข้อมูล (DATE)</th>
                <th>ขนาดไฟล์ (SIZE)</th>
                <th>รูปแบบ (TYPE)</th>
                <th className="text-center" style={{ width: "120px" }}>สถานะ</th>
                <th className="text-center" style={{ width: "120px", paddingRight: "24px" }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {backupHistory.map((item, index) => (
                <tr key={item.id}>
                  <td style={{ textAlign: "center", color: "var(--text-muted)" }}>{index + 1}</td>
                  <td>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent-blue)", background: "rgba(59, 130, 246, 0.1)", padding: "4px 8px", borderRadius: "4px" }}>
                      {item.id}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Database size={16} color="var(--text-muted)" />
                      <span style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: "13px" }}>{item.filename}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)" }}>
                      <Clock size={14} />
                      {item.date}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#475569" }}>{item.size}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{item.type}</span>
                  </td>
                  <td className="text-center">
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "center", background: "#ecfdf5", color: "#10b981", padding: "4px 12px", borderRadius: "24px", fontSize: "12px", fontWeight: 600, width: "max-content", margin: "0 auto" }}>
                      <CheckCircle2 size={14} /> Completed
                    </div>
                  </td>
                  <td className="text-center" style={{ paddingRight: "24px" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                      <button
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          color: "var(--accent-blue)",
                          background: "var(--accent-blue-glow)",
                        }}
                        title="ดาวน์โหลด SQL Dump"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          color: "#f59e0b",
                          background: "#fef3c7",
                        }}
                        title="กู้คืนข้อมูล (Restore)"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Custom Confirm Modal */}
      {confirmModal.visible && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "white", padding: "24px", borderRadius: "16px", minWidth: "400px", maxWidth: "90%", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", transform: "scale(1)", transition: "all 0.2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "20px", background: "#fef2f2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertTriangle size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {confirmModal.title}
                </h3>
              </div>
              <button onClick={() => setConfirmModal(prev => ({ ...prev, visible: false }))} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ margin: "0 0 24px 0", color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
              {confirmModal.message}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button 
                onClick={() => setConfirmModal(prev => ({ ...prev, visible: false }))} 
                style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "white", color: "var(--text-primary)", fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.background = "var(--bg-secondary)"}
                onMouseOut={(e) => e.currentTarget.style.background = "white"}
              >
                ยกเลิก
              </button>
              <button 
                onClick={confirmModal.onConfirm} 
                style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: "#ef4444", color: "white", fontWeight: 500, cursor: "pointer", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)", transition: "all 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.background = "#dc2626"}
                onMouseOut={(e) => e.currentTarget.style.background = "#ef4444"}
              >
                ยืนยันลบข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Toast Notification */}
      {toast.visible && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          background: "white",
          borderLeft: `4px solid ${toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#3b82f6'}`,
          borderRadius: "8px",
          padding: "16px 20px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          zIndex: 10000,
          animation: "slideInUp 0.3s ease-out forwards",
          maxWidth: "400px"
        }}>
          {toast.type === 'success' && <CheckCircle2 size={24} color="#10b981" />}
          {toast.type === 'error' && <AlertTriangle size={24} color="#ef4444" />}
          {toast.type === 'info' && <Database size={24} color="#3b82f6" />}
          <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>
            {toast.message}
          </div>
          <button 
            onClick={() => setToast(prev => ({ ...prev, visible: false }))} 
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", marginLeft: "8px", display: "flex" }}
          >
            <X size={16} />
          </button>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes slideInUp {
              from { transform: translateY(100%); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}} />
        </div>
      )}
    </div>
  );
}
