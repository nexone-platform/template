import React, { useState, useEffect } from "react";
import {
  Server,
  Activity,
  Cpu,
  RefreshCcw,
  Network,
  Clock,
  HardDrive,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";

// Mock Data
const cpuData = [
  { time: "10:00", usage: 45 }, { time: "10:05", usage: 52 }, { time: "10:10", usage: 48 }, { time: "10:15", usage: 61 },
  { time: "10:20", usage: 55 }, { time: "10:25", usage: 72 }, { time: "10:30", usage: 68 }, { time: "10:35", usage: 45 },
  { time: "10:40", usage: 50 }, { time: "10:45", usage: 58 }, { time: "10:50", usage: 82 }, { time: "10:55", usage: 40 },
];

const memoryData = [
  { time: "10:00", value: 3.2 }, { time: "10:05", value: 3.4 }, { time: "10:10", value: 3.5 }, { time: "10:15", value: 3.5 },
  { time: "10:20", value: 3.7 }, { time: "10:25", value: 4.1 }, { time: "10:30", value: 4.0 }, { time: "10:35", value: 3.8 },
  { time: "10:40", value: 3.6 }, { time: "10:45", value: 3.7 }, { time: "10:50", value: 3.9 }, { time: "10:55", value: 3.8 },
];

const networkData = [
  { time: "10:00", in: 120, out: 80 }, { time: "10:05", in: 150, out: 95 }, { time: "10:10", in: 140, out: 110 },
  { time: "10:15", in: 200, out: 140 }, { time: "10:20", in: 180, out: 130 }, { time: "10:25", in: 250, out: 180 },
  { time: "10:30", in: 220, out: 160 }, { time: "10:35", in: 170, out: 120 }, { time: "10:40", in: 160, out: 110 },
  { time: "10:45", in: 190, out: 135 }, { time: "10:50", in: 310, out: 210 }, { time: "10:55", in: 150, out: 100 },
];

const services = [
  { name: "NexSpeed Microservice", status: "online", uptime: "99.9%", latency: "42ms" },
  { name: "PostgreSQL Primary", status: "online", uptime: "100%", latency: "12ms" },
  { name: "Redis Cache", status: "online", uptime: "99.98%", latency: "2ms" },
  { name: "File Storage Queue", status: "degraded", uptime: "98.5%", latency: "1.2s" },
];

export default function SystemMonitoring() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const StatCard = ({ title, value, unit, icon: Icon, color, trend, trendValue }: any) => (
    <div style={{
      background: "white", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)", border: "1px solid #e2e8f0", position: "relative", overflow: "hidden"
    }}>
      <div style={{ position: "absolute", top: "-15px", right: "-15px", opacity: 0.05, transform: "rotate(-15deg)" }}>
        <Icon size={120} color={color} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
            <Icon size={18} />
          </div>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)" }}>{title}</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "auto" }}>
        <span style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-1px" }}>{value}</span>
        <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 500 }}>{unit}</span>
      </div>
      {trend && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "12px", fontSize: "13px", fontWeight: 500, color: trend === 'up' ? '#10b981' : '#ef4444' }}>
          {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span>{trendValue} จากสัปดาห์ที่แล้ว</span>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: "100%", overflowX: "hidden", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px 0" }}>System Monitoring</h2>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>ตรวจสอบสถานะการทำงานของเซิร์ฟเวอร์และทรัพยากรระบบแบบเรียลไทม์</p>
        </div>
        <button
          onClick={handleRefresh}
          style={{
            display: "flex", alignItems: "center", gap: "8px", background: "white", border: "1px solid #e2e8f0",
            padding: "8px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: 500, color: "var(--text-primary)",
            cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
          }}
          onMouseOver={(e) => Object.assign(e.currentTarget.style, { background: "var(--bg-secondary)" })}
          onMouseOut={(e) => Object.assign(e.currentTarget.style, { background: "white" })}
        >
          <RefreshCcw size={16} className={isRefreshing ? "animate-spin" : ""} />
          อัปเดตข้อมูล
        </button>
      </div>

      {/* Top Value Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
        <StatCard title="Uptime ระบบ" value="99.98" unit="%" icon={Clock} color="#10b981" trend="up" trendValue="+0.02%" />
        <StatCard title="CPU Usage" value="45" unit="%" icon={Cpu} color="#8b5cf6" trend="down" trendValue="-5%" />
        <StatCard title="Memory Usage" value="3.8" unit="GB" icon={Server} color="#f59e0b" trend="up" trendValue="+0.2GB" />
        <StatCard title="Network Traffic" value="1.2" unit="GB/s" icon={Network} color="#3b82f6" trend="up" trendValue="+0.1GB/s" />
      </div>

      {/* Charts Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))", gap: "20px" }}>
        
        {/* CPU Chart */}
        <div style={{ background: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>CPU Monitoring</h3>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>การใช้งานประมวลผลเซิร์ฟเวอร์หลัก (1 ชั่วโมงล่าสุด)</p>
          </div>
          <div style={{ height: "260px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cpuData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "none", borderRadius: "8px", color: "white", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                  itemStyle={{ color: "white" }}
                />
                <Area type="monotone" dataKey="usage" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#cpuGradient)" activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Network Chart */}
        <div style={{ background: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>Network I/O</h3>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>ปริมาณการรับส่งข้อมูลผ่านเครือข่าย (MB/s)</p>
            </div>
            <div style={{ display: "flex", gap: "12px", fontSize: "13px", fontWeight: 500 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#3b82f6" }}></span> Inbound</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }}></span> Outbound</div>
            </div>
          </div>
          <div style={{ height: "260px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={networkData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "none", borderRadius: "8px", color: "white" }}
                  itemStyle={{ color: "white" }}
                />
                <Line type="monotone" dataKey="in" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="out" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Services Status Table */}
      <div style={{ background: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>สถานะเซอร์วิส (Service Health)</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-secondary)", borderRadius: "8px" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600, borderBottom: "none" }}>ชื่อบริการ (Service Name)</th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600, borderBottom: "none" }}>สถานะ (Status)</th>
                <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600, borderBottom: "none" }}>Uptime</th>
                <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600, borderBottom: "none" }}>Latency</th>
              </tr>
            </thead>
            <tbody>
              {services.map((svc, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "16px", fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Server size={18} color="var(--text-muted)" /> {svc.name}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    {svc.status === 'online' ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#ecfdf5", color: "#10b981", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                        <CheckCircle2 size={14} /> ทำงานปกติ
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#fef2f2", color: "#ef4444", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                        <AlertCircle size={14} /> มีปัญหาจุกจิก
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "16px", textAlign: "right", fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>{svc.uptime}</td>
                  <td style={{ padding: "16px", textAlign: "right", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{svc.latency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Global css overrides specifically for spin */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}} />
    </div>
  );
}
