# 🔧 NexMaint — ระบบบริหารงานซ่อมบำรุง (Facility & Maintenance)

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nexmaint.md`
**Status:** 🆕 App Specification

---

## 🎯 วัตถุประสงค์ (Objective)

จัดการงานแจ้งซ่อมอาคาร โรงงาน ระบบตั๋ว (Ticketing) ลด Downtime

---

## 📂 ศูนย์รวมเมนูระบบ (Menu Breakdown)

### 📌 Helpdesk Board
```text
├── Ticket แตกด่วน, MTTR, สรุปค้างซ่อม
```

### 🎫 Service Request
```text
├── Ticket Inbox (รับเรื่องซ่อม)
├── Technician Dispatch (แจกงาน)
```

### 🔩 Work Order Execution
```text
├── ซ่อมบำรุง / ซ่อมฉุกเฉิน
├── ขอเบิก Spare Parts
```

### 🛑 Reporting
```text
├── Downtime Log
├── SLA Monitoring
```

---

## 🚀 ฟีเจอร์แยกตามกลุ่มการพัฒนา (Feature breakdown)

### 📂 กลุ่ม 1: ข้อมูลหลัก (Master Data & Setup)
- **Service SLA:** ระดับความเร็วในการแก้ปัญหา (ความรุนแรงสูง = 1 ชม. ต่ำ = 24 ชม.)
- **Technician Teams:** คิวงานของช่างและความเชี่ยวชาญ (ไฟฟ้า, ประปา)

### ⚙️ กลุ่ม 2: กระบวนการหลัก (Core Operations)
- **Job Dispatching:** ลากงานแจ้งซ่อมเข้าตารางปฏิทินของช่าง ระบบจะซิงค์เตือนช่างอัตโนมัติ
- **Spare-part Requisition:** ซ่อมแล้วต้องเปลี่ยนอะไหล่ คีย์เบิกตรงนี้ให้ตัดสต้อค

### 🧩 กลุ่ม 3: ฟีเจอร์เฉพาะธุรกิจที่ครอบคลุม (Business-specific extensions)
- **Real Estate / Property Mgmt:** ให้ลูกบ้านใช้สแกนผ่านแอป/QR แจ้งซ่อมแอร์ ท่อน้ำแตก นิติฯ รับเรื่องทันที
- **Manufacturing:** เครื่องจักรสะดุด กดปุ่มแจ้งเตือน ช่างโรงงานวิ่งเข้าหยุด Downtime ทันที

### 🔗 กลุ่ม 4: การเชื่อมต่อและการบูรณาการ (Integrations)
- **เชื่อมต่อ NexAsset:** ดึงข้อมูล Asset ว่าเคยซ่อมกี่ครั้ง หมดรับประกันหรือยัง
- **เชื่อมต่อ NexIoT:** Alert เครื่องเสีย ระบบจะ Auto-create Ticket ให้ช่างเลยโดยคนไม่ต้องคีย์

---

## 🛠️ Technical Stack & Notes
```text
Ticketing State Machine
Drag & Drop Scheduler
```

---

_NexOne Development Team | NexMaint Specification | April 2026_
