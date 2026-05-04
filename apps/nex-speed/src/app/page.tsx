'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar, navSections } from '@nexone/ui';
import { Topbar } from '@nexone/ui';
import DashboardPage from '@/pages/DashboardPage';
import FleetPage from '@/pages/FleetPage';
import DriversPage from '@/pages/DriversPage';
import OrdersPage from '@/pages/OrdersPage';
import TripsPage from '@/pages/TripsPage';
import FinancePage from '@/pages/FinancePage';
import SubcontractorsPage from '@/pages/SubcontractorsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SettingsPage from '@/pages/SettingsPage';
import HelpPage from '@/pages/HelpPage';
import BrandsPage from '@/pages/basic/BrandsPage';
import LocationsPage from '@/pages/LocationsPage';
import MaintenancePage from '@/pages/MaintenancePage';
import AlertsPage from '@/pages/AlertsPage';
import MechanicsPage from '@/pages/MechanicsPage';
import ContainerMechanicsPage from '@/pages/ContainerMechanicsPage';
import PartsShopsPage from '@/pages/PartsShopsPage';
import StockPartsPage from '@/pages/StockPartsPage';
import StockOilPage from '@/pages/StockOilPage';

// Missing Master Data Pages
import MaintenancePlanPage from '@/pages/MaintenancePlanPage';
import ExpertisePage from '@/pages/ExpertisePage';
import PartCategoryPage from '@/pages/PartCategoryPage';
import StoragePage from '@/pages/StoragePage';
import ParkingPage from '@/pages/ParkingPage';
import TransportTripsPage from '@/pages/TransportTripsPage';
import PODPage from '@/pages/PODPage';
import GPSLivePage from '@/pages/GPSLivePage';
import RouteOptimizationPage from '@/pages/RouteOptimizationPage';
import InvoicePage from '@/pages/InvoicePage';
import TripCostPage from '@/pages/TripCostPage';
import CustomerTrackingPage from '@/pages/CustomerTrackingPage';

// Basic Menu Pages
import MechanicTypePage from '@/pages/basic/MechanicTypePage';
import VehicleTypePage from '@/pages/basic/VehicleTypePage';
import UnitTypePage from '@/pages/basic/UnitTypePage';
import LiquidTypePage from '@/pages/basic/LiquidTypePage';
import PartGroupPage from '@/pages/basic/PartGroupPage';
import StorageTypePage from '@/pages/basic/StorageTypePage';
import ParkingTypePage from '@/pages/basic/ParkingTypePage';
import ProvincePage from '@/pages/basic/ProvincePage';
// Template Demo Pages
import TemplateMaster1Page from '@/pages/template/TemplateMaster1Page';
import TemplateMaster2Page from '@/pages/template/TemplateMaster2Page';
import TemplateMaster3Page from '@/pages/template/TemplateMaster3Page';
import TemplateMasterGraph1Page from '@/pages/template/TemplateMasterGraph1Page';

const API_HOST = typeof window !== 'undefined' ? `http://${window.location.hostname}:8081` : '';

// ============ Types ============
interface AuthUser {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

const pageConfig: Record<string, { title: string; subtitle: string; breadcrumb: string[] }> = {
  dashboard: { title: 'Control Tower', subtitle: 'ภาพรวมการดำเนินงาน — Real-time from PostgreSQL', breadcrumb: ['NexSpeed', 'Dashboard'] },
  fleet: { title: 'การจัดการรถบริษัท', subtitle: 'รายการยานพาหนะทั้งหมด', breadcrumb: ['NexSpeed', 'การจัดการรถบริษัท'] },
  drivers: { title: 'พนักงานขับรถ', subtitle: 'จัดการคนขับและข้อมูลใบอนุญาต', breadcrumb: ['NexSpeed', 'พนักงาน'] },
  orders: { title: 'คำสั่งขนส่ง', subtitle: 'รายการออเดอร์และการจัดส่ง', breadcrumb: ['NexSpeed', 'Orders'] },
  trips: { title: '🛰️ GPS Tracking & การติดตามรถ', subtitle: 'Real-time GPS via WebSocket', breadcrumb: ['NexSpeed', 'การติดตามรถ'] },
  'gps-live': { title: '🛰️ GPS Live & Geofence Alerts', subtitle: 'Real-time tracking พร้อม Geofence + Speed + Fuel alerts', breadcrumb: ['NexSpeed', 'GPS Live'] },
  'route-optimizer': { title: '🧠 Route Optimization AI', subtitle: 'วางแผนเส้นทางอัจฉริยะ — ลดต้นทุนน้ำมัน 15-25% ด้วย NexSpeed AI', breadcrumb: ['NexSpeed', 'Route Optimizer'] },
  'transport-trips': { title: 'ทริปขนส่ง', subtitle: 'รายการทริปขนส่งทั้งหมด', breadcrumb: ['NexSpeed', 'ทริปขนส่ง'] },
  'pod': { title: 'ยืนยันการส่ง (POD)', subtitle: 'Electronic Proof of Delivery — ลายเซ็น + รูปถ่าย', breadcrumb: ['NexSpeed', 'ยืนยันการส่ง'] },
  finance: { title: 'การเงิน & วางบิล', subtitle: 'Invoice & Revenue Management', breadcrumb: ['NexSpeed', 'การเงิน'] },
  invoices: { title: 'ใบแจ้งหนี้อัตโนมัติ', subtitle: 'Auto-generate Invoices', breadcrumb: ['NexSpeed', 'ใบแจ้งหนี้อัตโนมัติ'] },
  'trip-cost': { title: 'วิเคราะห์ต้นทุนทริป', subtitle: 'Trip Cost & Profit', breadcrumb: ['NexSpeed', 'วิเคราะห์ต้นทุน'] },
  'customer-tracking': { title: 'Customer Tracking Portal', subtitle: 'Public Tracking Links', breadcrumb: ['NexSpeed', 'Tracking Portal'] },
  subcontractors: { title: 'การจัดการรถร่วม', subtitle: 'จัดการรถร่วม ผู้ประกอบการ และ KPI ประสิทธิภาพ', breadcrumb: ['NexSpeed', 'การจัดการรถร่วม'] },
  analytics: { title: 'วิเคราะห์ & รายงาน', subtitle: 'Business Intelligence & KPI Analytics', breadcrumb: ['NexSpeed', 'Analytics'] },
  settings: { title: 'ตั้งค่า', subtitle: 'การตั้งค่าระบบและบัญชี', breadcrumb: ['NexSpeed', 'Settings'] },
  help: { title: 'ช่วยเหลือ', subtitle: 'คู่มือและข้อมูลติดต่อ', breadcrumb: ['NexSpeed', 'Help'] },
  brands: { title: 'ยี่ห้อรถ', subtitle: 'ข้อมูลยี่ห้อและรุ่นรถ', breadcrumb: ['NexSpeed', 'เมนูพื้นฐาน', 'ยี่ห้อรถ'] },
  provinces: { title: 'จังหวัด', subtitle: 'ข้อมูลจังหวัดและตัวย่อ', breadcrumb: ['NexSpeed', 'เมนูพื้นฐาน', 'จังหวัด'] },
  locations: { title: 'ต้นทาง/ปลายทาง', subtitle: 'จัดการสถานที่ต้นทางและปลายทางพร้อมพิกัด GPS', breadcrumb: ['NexSpeed', 'ข้อมูลหลัก', 'ต้นทาง/ปลายทาง'] },
  'maintenance-plan': { title: 'แผนซ่อมบำรุง', subtitle: 'จัดการแผนซ่อมบำรุงเชิงป้องกัน (PM)', breadcrumb: ['NexSpeed', 'ข้อมูลหลัก', 'แผนซ่อมบำรุง'] },
  'expertise': { title: 'ประเภทเชี่ยวชาญ', subtitle: 'ความเชี่ยวชาญพิเศษของช่างซ่อม', breadcrumb: ['NexSpeed', 'ข้อมูลหลัก', 'ประเภทเชี่ยวชาญ'] },
  'part-category': { title: 'หมวดหมู่อะไหล่', subtitle: 'จัดการหมวดหมู่อะไหล่และรหัสสินค้า', breadcrumb: ['NexSpeed', 'ข้อมูลหลัก', 'หมวดหมู่อะไหล่'] },
  maintenance: { title: 'บำรุงรักษารถยนต์', subtitle: 'จัดการงานซ่อมและบำรุงรักษายานพาหนะ', breadcrumb: ['NexSpeed', 'บำรุงรักษา'] },
  alerts: { title: 'แจ้งเตือน', subtitle: 'การแจ้งเตือนประกัน, ภาษี, ใบขับขี่, การซ่อมบำรุง', breadcrumb: ['NexSpeed', 'แจ้งเตือน'] },
  mechanics: { title: 'ช่างซ่อมรถยนต์', subtitle: 'ข้อมูลช่างซ่อมรถยนต์และอู่ซ่อม', breadcrumb: ['NexSpeed', 'ช่าง & อะไหล่', 'ช่างซ่อมรถยนต์'] },
  'container-mechanics': { title: 'ช่างซ่อมตู้คอนเทนเนอร์', subtitle: 'ข้อมูลช่างซ่อมตู้คอนเทนเนอร์', breadcrumb: ['NexSpeed', 'ช่าง & อะไหล่', 'ช่างตู้คอนเทนเนอร์'] },
  'parts-shops': { title: 'ร้านอะไหล่', subtitle: 'ข้อมูลร้านอะไหล่และผู้จัดจำหน่าย', breadcrumb: ['NexSpeed', 'ช่าง & อะไหล่', 'ร้านอะไหล่'] },
  'stock-parts': { title: 'สต๊อกอะไหล่', subtitle: 'จัดการสต๊อกอะไหล่และวัสดุสิ้นเปลือง', breadcrumb: ['NexSpeed', 'คลัง & สต๊อก', 'สต๊อกอะไหล่'] },
  'stock-oil': { title: 'สต๊อกน้ำมัน', subtitle: 'จัดการสต๊อกน้ำมันเครื่องและหล่อลื่น', breadcrumb: ['NexSpeed', 'คลัง & สต๊อก', 'สต๊อกน้ำมัน'] },
  storage: { title: 'สถานที่เก็บ', subtitle: 'ข้อมูลคลังสินค้าและสถานที่จัดเก็บ', breadcrumb: ['NexSpeed', 'คลัง & สต๊อก', 'สถานที่เก็บ'] },
  parking: { title: 'ลานจอดรถ', subtitle: 'จัดการลานจอดรถและจุดพักรถ', breadcrumb: ['NexSpeed', 'สถานที่', 'ลานจอดรถ'] },
  'vehicle-type': { title: 'ประเภทรถ', subtitle: 'จัดการประเภทของยานพาหนะต่างๆ', breadcrumb: ['NexSpeed', 'เมนูพื้นฐาน', 'ประเภทรถ'] },
  'mechanic-type': { title: 'ประเภทช่างซ่อม', subtitle: 'จัดการประเภทความชำนาญของช่าง', breadcrumb: ['NexSpeed', 'เมนูพื้นฐาน', 'ประเภทช่างซ่อม'] },
  'unit-type': { title: 'หน่วยนับ', subtitle: 'จัดการหน่วยนับพื้นฐานในระบบ', breadcrumb: ['NexSpeed', 'เมนูพื้นฐาน', 'หน่วยนับ'] },
  'liquid-type': { title: 'ประเภทของเหลว', subtitle: 'จัดการประเภทของเหลวต่างๆ', breadcrumb: ['NexSpeed', 'เมนูพื้นฐาน', 'ประเภทของเหลว'] },
  'part-group': { title: 'กลุ่มอะไหล่', subtitle: 'จัดการหมวดหมู่และกลุ่มของอะไหล่', breadcrumb: ['NexSpeed', 'เมนูพื้นฐาน', 'กลุ่มอะไหล่'] },
  'storage-type': { title: 'ประเภทคลัง/สถานที่', subtitle: 'จัดการประเภทของพื้นที่จัดเก็บ', breadcrumb: ['NexSpeed', 'เมนูพื้นฐาน', 'ประเภทคลัง/สถานที่'] },
  'parking-type': { title: 'ประเภทที่จอดรถ', subtitle: 'จัดการประเภทของจุดจอดรถและลานจอด', breadcrumb: ['NexSpeed', 'เมนูพื้นฐาน', 'ประเภทที่จอดรถ'] },
  'template-master-1': { title: 'มาสเตอร์ แบบที่ 1', subtitle: 'โค้ดตัวอย่างหน้า CRUD แบบไม่มีกล่องสรุปด้านบน', breadcrumb: ['NexSpeed', 'ตัวอย่าง Template', 'มาสเตอร์ แบบที่ 1'] },
  'template-master-2': { title: 'มาสเตอร์ แบบที่ 2', subtitle: 'โค้ดตัวอย่างหน้า CRUD แบบมีกล่องสรุปด้านบน', breadcrumb: ['NexSpeed', 'ตัวอย่าง Template', 'มาสเตอร์ แบบที่ 2'] },
  'template-master-3': { title: 'มาสเตอร์ แบบที่ 3', subtitle: 'โค้ดตัวอย่างหน้า CRUD แบบมีกล่องสรุปด้านบน', breadcrumb: ['NexSpeed', 'ตัวอย่าง Template', 'มาสเตอร์ แบบที่ 3'] },
  'template-master-graph-1': { title: 'มาสเตอร์และกราฟ แบบที่ 1', subtitle: 'โค้ดตัวอย่างหน้าการเงิน', breadcrumb: ['NexSpeed', 'ตัวอย่าง Template', 'มาสเตอร์และกราฟ แบบที่ 1'] },
};

const renderPage = (page: string) => {
  switch (page) {
    case 'dashboard': return <DashboardPage />;
    case 'fleet': return <FleetPage />;
    case 'drivers': return <DriversPage />;
    case 'orders': return <OrdersPage />;
    case 'trips': return <TripsPage />;
    case 'finance': return <FinancePage />;
    case 'invoices': return <InvoicePage />;
    case 'trip-cost': return <TripCostPage />;
    case 'customer-tracking': return <CustomerTrackingPage />;
    case 'subcontractors': return <SubcontractorsPage />;
    case 'analytics': return <AnalyticsPage />;
    case 'settings': return <SettingsPage />;
    case 'help': return <HelpPage />;
    case 'brands': return <BrandsPage />;
    case 'provinces': return <ProvincePage />;
    case 'locations': return <LocationsPage />;
    case 'maintenance-plan': return <MaintenancePlanPage />;
    case 'expertise': return <ExpertisePage />;
    case 'part-category': return <PartCategoryPage />;
    case 'maintenance': return <MaintenancePage />;
    case 'alerts': return <AlertsPage />;
    case 'mechanics': return <MechanicsPage />;
    case 'container-mechanics': return <ContainerMechanicsPage />;
    case 'parts-shops': return <PartsShopsPage />;
    case 'stock-parts': return <StockPartsPage />;
    case 'stock-oil': return <StockOilPage />;
    case 'storage': return <StoragePage />;
    case 'parking': return <ParkingPage />;
    case 'transport-trips': return <TransportTripsPage />;
    case 'pod': return <PODPage />;
    case 'gps-live': return <GPSLivePage />;
    case 'route-optimizer': return <RouteOptimizationPage />;
    case 'vehicle-type': return <VehicleTypePage />;
    case 'mechanic-type': return <MechanicTypePage />;
    case 'unit-type': return <UnitTypePage />;
    case 'liquid-type': return <LiquidTypePage />;
    case 'part-group': return <PartGroupPage />;
    case 'storage-type': return <StorageTypePage />;
    case 'parking-type': return <ParkingTypePage />;
    case 'template-master-1': return <TemplateMaster1Page />;
    case 'template-master-2': return <TemplateMaster2Page />;
    case 'template-master-3': return <TemplateMaster3Page />;
    case 'template-master-graph-1': return <TemplateMasterGraph1Page />;
    default:
      return (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ width: '80px', height: '80px', fontSize: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚧</div>
          <h3 className="empty-state-title">กำลังพัฒนา</h3>
          <p className="empty-state-text">หน้า {pageConfig[page]?.title || page} อยู่ระหว่างการพัฒนา</p>
        </div>
      );
  }
};

// ============ Login Component ============
function LoginPage({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_HOST}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const json = await res.json();

      if (json.success && json.data) {
        // Save to localStorage
        localStorage.setItem('nexspeed_user', JSON.stringify(json.data));
        onLogin(json.data);
      } else {
        setError(json.error || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch {
      setError('ไม่สามารถเชื่อมต่อ server ได้');
    } finally {
      setLoading(false);
    }
  }, [username, password, onLogin]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 50%, #dbeafe 100%)',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        animation: 'slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '28px',
            fontWeight: 800,
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
          }}>
            N
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#1e293b',
            letterSpacing: '-0.5px',
            marginBottom: '4px',
          }}>
            NexSpeed TMS
          </h1>
          <p style={{
            fontSize: '13px',
            color: '#94a3b8',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            TRANSPORTATION MANAGEMENT
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '36px 32px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: '4px',
          }}>
            เข้าสู่ระบบ
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#94a3b8',
            marginBottom: '28px',
          }}>
            กรอกข้อมูลเพื่อเข้าใช้งานระบบ
          </p>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 14px',
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              borderRadius: '12px',
              color: '#dc2626',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '20px',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#64748b',
                marginBottom: '8px',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                ชื่อผู้ใช้
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="เช่น admin, demo"
                autoComplete="username"
                autoFocus
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: '#f8fafc',
                  border: '1.5px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '12px',
                  color: '#1e293b',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#64748b',
                marginBottom: '8px',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                รหัสผ่าน
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '14px 48px 14px 16px',
                    background: '#f8fafc',
                    border: '1.5px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '12px',
                    color: '#1e293b',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '4px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '40px',
                    height: '40px',
                    border: 'none',
                    background: 'transparent',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                  }}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(59, 130, 246, 0.3)',
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite',
                  }} />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  เข้าสู่ระบบ
                </>
              )}
            </button>
          </form>
        </div>

        {/* Hint */}
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '12px',
          color: '#94a3b8',
          lineHeight: 1.6,
        }}>
          <p>ข้อมูลทดสอบ: <strong style={{ color: '#64748b' }}>admin</strong> / <strong style={{ color: '#64748b' }}>admin123</strong></p>
          <p style={{ marginTop: '4px' }}>หรือ <strong style={{ color: '#64748b' }}>demo</strong> / <strong style={{ color: '#64748b' }}>admin123</strong></p>
        </div>

        {/* Version */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '11px',
          color: 'rgba(148, 163, 184, 0.5)',
          letterSpacing: '1px',
        }}>
          NexSpeed TMS v2.0.0
        </div>
      </div>
    </div>
  );
}

// ============ Main App ============
export default function Home() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<AuthUser | null>({ id: 1, username: 'admin', name: 'Admin User', email: 'admin@nexone.com', role: 'admin', avatar: '' });
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Auto-login bypassing login screen
    setCheckingAuth(false);
  }, []);

  const handleLogin = useCallback((u: AuthUser) => {
    setUser(u);
  }, []);

  const handleLogout = useCallback(() => {
    // Prevent logout or simulate it without breaking the flow
    console.log('Logout disabled in offline mode');
  }, []);

  // Loading state
  if (checkingAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f7fa',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(59,130,246,0.15)',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }} />
      </div>
    );
  }

  // Grab dynamic English titles from local storage if available
  let englishTitle = null;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('nexone_menus_nex-speed');
      if (stored) {
        const dynamicMenus = JSON.parse(stored);
        const currentMenuEntity = dynamicMenus.find((m: any) => m.page_key === currentPage || m.route === currentPage || m.base === currentPage);
        if (currentMenuEntity) {
          englishTitle = currentMenuEntity.translations?.['en'] || currentMenuEntity.title;
        }
      }
    } catch(e) {}
  }

  let config = pageConfig[currentPage];
  if (!config) {
    let fallbackTitle = currentPage;
    let fallbackBreadcrumb = ['NexSpeed', currentPage];
    for (const section of navSections) {
      const item = section.items.find((i: any) => i.id === currentPage);
      if (item) {
        fallbackTitle = item.label;
        fallbackBreadcrumb = ['NexSpeed', item.label];
        break;
      }
    }
    config = { title: fallbackTitle, subtitle: 'จัดการข้อมูลพื้นฐานบนระบบ', breadcrumb: fallbackBreadcrumb };
  }

  const finalPageTitle = englishTitle || config.title;
  const finalBreadcrumb = config.breadcrumb.slice();
  if (finalBreadcrumb.length > 1) {
    finalBreadcrumb[finalBreadcrumb.length - 1] = finalPageTitle;
  }

  return (
    <div className="app-layout">
      <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          isOpen={sidebarOpen}
          appName="nex-speed"
          menuApiUrl={process.env.NEXT_PUBLIC_CORE_API_URL || ''}
        />
      <main className={`main-content ${sidebarOpen ? '' : 'expanded'}`}>
        <Topbar
          pageTitle={finalPageTitle}
          pageSubtitle={config.subtitle}
          breadcrumb={finalBreadcrumb}
          user={user}
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        />
        <div className="page-content">
          {renderPage(currentPage)}
        </div>
      </main>
    </div>
  );
}
