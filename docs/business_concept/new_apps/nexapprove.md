# ✅ NexApprove — ระบบ Workflow อนุมัติเอกสารแบบครบวงจร (Dynamic Workflow)

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nexapprove.md`
**Status:** 🆕 App Specification

---

## 🎯 วัตถุประสงค์ (Objective)

ออกแบบสายอนุมัติที่ยืดหยุ่น เชื่อมต่อเอกสารทุกประเภทมาอนุมัติที่ศูนย์เดียว

---

## 📂 ศูนย์รวมเมนูระบบ (Menu Breakdown)

### 📌 Approval Center
```text
├── เอกสารรออนุมัติของฉัน
├── เอกสารที่ฉันเพิ่งอนุมัติ
```

### 📨 Execution
```text
├── กด Approve/Reject
├── Delegation (มอบหมายเพื่อนแทนตอนลา)
```

### 🛠️ Workflow Builder
```text
├── Flow Configurator
├── Condition Rules (เส้นทางเงิน)
```

### 📈 Monitoring
```text
├── SLA Watchdog (แจ้งคนดองงาน)
```

---

## 🚀 ฟีเจอร์แยกตามกลุ่มการพัฒนา (Feature breakdown)

### 📂 กลุ่ม 1: ข้อมูลหลัก (Master Data & Setup)
- **Condition Matrix:** กำหนดวงเงินว่าหากเงินมากกว่า 100,000 บาท ต้องข้ามไปให้ Manager หรือ Director ขั้นไหน
- **Approval Hierarchy:** ผูกกับ Organization Chart จาก NexCore

### ⚙️ กลุ่ม 2: กระบวนการหลัก (Core Operations)
- **Visual Flow Editor:** อินเตอร์เฟสวาดผังเส้นทางอนุมัติด้วยการลากวาง ใช้งานง่ายเหมือน Visio
- **API Response Trigger:** เมื่ออนุมัติจบสิ้น ให้คืนค่าไปยังแอปตั้งต้นเพื่อให้ทำงานต่อ

### 🧩 กลุ่ม 3: ฟีเจอร์เฉพาะธุรกิจที่ครอบคลุม (Business-specific extensions)
- **ทำงานร่วมกันทุกองค์กร:** กระดาษทุกใบ (PO, Leave, Contract, Payment) วิ่งมาตัดผ่านแอปกลางนี้ เพื่อไม่ต้องไปสร้าง Logic ซ้ำซ้อนໃນ每個แอป

### 🔗 กลุ่ม 4: การเชื่อมต่อและการบูรณาการ (Integrations)
- **เชื่อมต่อ NexProcure (PR/PO):** ยิงใบสั่งซื้อเข้ามาขอผ่านมติ
- **เชื่อมต่อ NexSpeed:** ยิงขออนุมัติจ่ายค่าน้ำมัน หรือเคลียร์ค่าแรงวิ่งด่วน

---

## 🛠️ Technical Stack & Notes
```text
BPMS (Business Process Management) Engine
React Flow UI
```

---

_NexOne Development Team | NexApprove Specification | April 2026_
