# 🔍 NexOne — Feature Gap Analysis
## วิเคราะห์ฟีเจอร์ที่ต้องเพิ่มจาก 7 ธุรกิจ

**วิเคราะห์จาก:** Logistics / Trading / Manufacturing / Service / F&B / Real Estate / Construction  
**Date:** April 2026

---

## 📊 สรุปภาพรวม

| หมวด                        | จำนวน Feature ที่ขาด | ความสำคัญ                  |
|---                          |---                  |---                        |
| แอปที่มีอยู่ต้องเพิ่ม Sub-feature  | 32 ฟีเจอร์             | 🔴 Critical / 🟡 Medium |
| Cross-cutting ทุกธุรกิจต้องมี    | 8 ฟีเจอร์             | 🔴 Critical              |
| พิจารณาเพิ่มแอปใหม่             | 4 แอป               | 🟡 Medium-Term          |

---

## 📋 รายละเอียดฟีเจอร์ (Master Plan)

> **✅ สถานะปัจจุบัน:** รายละเอียดฟีเจอร์ทั้งหมดได้ถูกย้ายไปเพิ่มในส่วน **Master Plan** ของแต่ละเอกสาร Business Concept ของทั้ง 7 ธุรกิจแล้ว (เอกสาร `01_logistics.md` - `07_construction.md`)
>
> กรุณาอ้างอิงเอกสารรายธุรกิจสำหรับการวางแผน พัฒนาระบบ และตรวจสอบรายละเอียดฟีเจอร์ที่ต้องการเพิ่มเติมของแต่ละอุตสาหกรรม

---

## 🗺️ แผนการพัฒนาฟีเจอร์ใหม่ (Roadmap)

```
Phase 1 (Foundation):
  ├── NexCore: Notification Engine, Multi-branch
  ├── NexApprove: Workflow Builder
  ├── NexForce: GPS Check-in, Timesheet
  └── NexTax: e-Tax Invoice ← บังคับโดย กรมสรรพากร

Phase 2 (Business Core):
  ├── NexSales: CRM Pipeline, Service Ticket, SLA, Booking
  ├── NexFinance: Multi-Currency, 3-Way Matching, Deferred Revenue
  ├── NexProduce: BOM, MRP, Shop Floor, QC, Dispatch, Project Board
  ├── NexStock: FEFO, Expiry Alert
  └── NexField: Mobile App (Field Technician) ← NEW

Phase 3 (Advanced):
  ├── NexSales: Package/Membership, Loyalty, COD Reconcile
  ├── NexStock: Van Stock, Consigned Stock, Lot Recall
  ├── NexProduce: OEE, Lot Traceability
  ├── NexForce: Skill Matrix, Workforce Map
  └── NexPortal: Customer Self-Service Portal ← NEW

Phase 4 (Intelligence & Integration):
  ├── NexBI: Dashboard Builder, Demand Forecast (AI)
  ├── NexCommerce: E-Commerce Hub ← NEW
  └── NexIoT: Sensor Integration ← NEW
```

---

## 💡 ข้อสังเกตสำคัญ

> [!IMPORTANT]
> **NexProduce** ถูกใช้หนักมาก — ครอบคลุมทั้ง Manufacturing (MRP/BOM/QC) และ Service (Dispatch/SLA/Project) ควรพิจารณาว่าจะ **แยก Mode** หรือ **แยกแอป** เพื่อไม่ให้ซับซ้อนเกินไปสำหรับผู้ใช้ที่ต้องการเฉพาะด้านใดด้านหนึ่ง

> [!WARNING]
> **e-Tax Invoice** เป็น Legal Requirement ที่ **กรมสรรพากร** กำหนด ธุรกิจที่มียอดขายเกิน 30 ล้านบาท/ปี ต้องออก e-Tax ไม่ใช่ฟีเจอร์ Optional

> [!TIP]
> **NexField (Mobile App)** ถ้ารอ Phase 3 จะทำให้ Service-Field Business ไม่สามารถใช้ระบบได้จริง เพราะช่างใช้ Desktop ไม่ได้ ควรเลื่อนขึ้นมาเป็น Phase 2

---

_วิเคราะห์โดย: NexOne Development Team_  
_อ้างอิงจาก: nexone_logistics_flow.md, nexone_trading_flow.md, nexone_manufacturing_flow.md, nexone_service_flow.md_
