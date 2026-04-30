import React, { useState, useEffect } from 'react';
import { Activity, Users, Server, Globe2, ShieldCheck, Database, LayoutTemplate, Smartphone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

export default function DashboardOverview({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [appCount, setAppCount] = useState<number>(0);
  const [totalAppCount, setTotalAppCount] = useState<number>(24);
  const [totalUsers, setTotalUsers] = useState<number>(1248);
  const [onlineUsers, setOnlineUsers] = useState<number>(124);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const CORE_API_URL = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:8001/api';
      try {
        const logsRes = await fetch(`${CORE_API_URL}/audit-logs/recent?limit=5`);
        if (logsRes.ok) {
          const data = await logsRes.json();
          setAuditLogs(Array.isArray(data) ? data : []);
        }

        const appsRes = await fetch(`${CORE_API_URL}/v1/system-apps?all=true`);
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          const apps = Array.isArray(appsData) ? appsData : (appsData?.data || []);
          setTotalAppCount(apps.length);
          setAppCount(apps.filter((a: any) => a.is_active || a.status === 'active').length);
        }

        const statsRes = await fetch(`${CORE_API_URL}/v1/dashboard/users-stats`);
        if (statsRes.ok) {
          const stats = await statsRes.json();
          if (stats.totalUsers !== undefined) setTotalUsers(stats.totalUsers);
          if (stats.onlineUsers !== undefined) setOnlineUsers(stats.onlineUsers);
        }
      } catch (e) {
        console.error("Failed to fetch dashboard data", e);
      }
    };
    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'SUCCESS': return '#10b981';
      case 'FAILED': return '#ef4444';
      case 'WARNING': return '#f59e0b';
      case 'INFO': return '#3b82f6';
      default: return '#94a3b8';
    }
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
          flexDirection: "column",
          gap: "16px",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "absolute", right: "-20px", top: "-20px", opacity: 0.03, pointerEvents: "none" }}>
          <Server size={200} />
        </div>
        <div style={{ position: "relative", zIndex: 1, maxWidth: "800px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1e293b", margin: "0 0 8px 0" }}>
            ยินดีต้อนรับสู่ NexCore Control Center
          </h2>
          <p style={{ fontSize: "15px", color: "#64748b", margin: "0 0 20px 0", lineHeight: "1.6" }}>
            คุณสามารถบริหารจัดการสิทธิ์ผู้ใช้งาน, โครงสร้างองค์กร, สาขา, และดูแลความปลอดภัยของระบบ ERP ทั้งหมดได้จากที่เดียว
          </p>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              style={{
                background: "#3b82f6",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
              }}
            >
              เอกสารคู่มือ Admin
            </button>
            <button
              style={{
                background: "#3b82f6",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
              }}
            >
              เอกสารคู่มือการใช้งานระบบ
            </button>
          </div>
        </div>
      </div>

      {/* ── Metrics Row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "24px",
        }}
      >
        <StatCard
          title="แอปพลิเคชันออนไลน์"
          value={appCount}
          suffix={`/ ${totalAppCount} Apps`}
          icon={LayoutTemplate}
          color="#3b82f6"
          iconBgColor="#eff6ff"
        />
        <StatCard
          title="บัญชีบุคลากร"
          value={onlineUsers}
          suffix={`/ ${totalUsers} Users`}
          icon={Users}
          color="#f59e0b"
          iconBgColor="#fffbeb"
        />
        <StatCard
          title="สาขา / ศูนย์เครือข่าย"
          value="12"
          suffix="Branches"
          icon={Globe2}
          color="#10b981"
          iconBgColor="#ecfdf5"
        />
        <StatCard
          title="เวลาเปิดทำงาน (Uptime)"
          value="99.99"
          suffix="%"
          icon={Activity}
          color="#ef4444"
          iconBgColor="#fef2f2"
        />
      </div>

      {/* ── Content Row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "24px",
        }}
      >
        
        {/* System Health */}
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <Activity size={18} color="#64748b" /> ตรวจสอบทรัพยากรระบบ (System Health)
            </h3>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#10b981", background: "#ecfdf5", padding: "4px 10px", borderRadius: "100px", border: "1px solid #a7f3d0" }}>
               สถานะการทำงาน 100%
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {[
              { title: "PostgreSQL (Primary Database)", desc: "Response Time: 12ms • Connections: 142/500", icon: Database, color: "#3b82f6", bg: "#eff6ff", statLabel: "Utilization", statValue: "45%", w: "45%" },
              { title: "API Gateway (Node.js Microservices)", desc: "Requests: 3,420 / min • Error Rate: 0.01%", icon: Server, color: "#a855f7", bg: "#faf5ff", statLabel: "CPU Load", statValue: "62%", w: "62%" },
              { title: "Redis In-Memory (Session / Caching)", desc: "Hit Rate: 98.5% • Memory: 4.2 / 8 GB", icon: Smartphone, color: "#10b981", bg: "#ecfdf5", statLabel: "Memory Usage", statValue: "52%", w: "52%" },
            ].map((item, i) => (
              <div key={i} style={{ padding: "16px", borderRadius: "8px", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fafbfc" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "8px", background: item.bg, color: item.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <item.icon size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#334155" }}>{item.title}</div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{item.desc}</div>
                  </div>
                </div>
                <div style={{ minWidth: "150px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>{item.statLabel}</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>{item.statValue}</span>
                  </div>
                  <div style={{ width: "100%", height: "6px", background: "#e2e8f0", borderRadius: "100px", overflow: "hidden" }}>
                    <div style={{ height: "100%", background: item.color, width: item.w, borderRadius: "100px" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Logs */}
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 430px)",
            minHeight: "356px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={18} color="#64748b" /> บันทึกความปลอดภัย
            </h3>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto", paddingRight: "4px" }}>
            {auditLogs.length > 0 ? (
              auditLogs.map((log, i) => (
                <div key={i} style={{ display: "flex", gap: "12px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: getStatusColor(log.status), marginTop: "6px", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#334155" }}>{log.title}</div>
                    <div style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 4px" }}>{log.description}</div>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: "13px", color: "#64748b" }}>Loading logs...</div>
            )}
          </div>

          <button
            onClick={() => onNavigate && onNavigate('logs')}
            style={{
              width: "100%",
              marginTop: "24px",
              padding: "10px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              color: "#3b82f6",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            รายละเอียดทั้งหมด
          </button>
        </div>

      </div>
    </div>
  );
}
