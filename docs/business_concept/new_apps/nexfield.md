# 📱 NexField — Mobile App สำหรับพนักงานภาคสนาม

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nexfield.md`
**Status:** 🆕 New App Proposal

---

## 🎯 วัตถุประสงค์

NexField คือ **Mobile App เฉพาะสำหรับพนักงานที่ทำงานนอกสถานที่** (Field Worker) ออกแบบให้ใช้งานง่ายบน Smartphone/Tablet ทำงานได้แม้ไม่มีสัญญาณอินเทอร์เน็ต (Offline Mode) และ Sync ข้อมูลอัตโนมัติเมื่อกลับมามีสัญญาณ

---

## 🏢 ธุรกิจที่ต้องการ

| ธุรกิจ | กลุ่มผู้ใช้ | Use Case |
|---|---|---|
| Service / After-Sales | Field Technician, ช่าง | รับ Job, ซ่อม, Sign-off |
| Logistics | Driver, Rider | รับ Trip, POD, COD |
| Construction | Site Engineer, Foreman | บันทึก Progress, QC |
| Retainer Service | รปภ., แม่บ้าน | Check-in/out GPS |
| Sales | Sales Rep | รับ Order ณ ลูกค้า |

---

## 📋 ฟีเจอร์หลัก

### 1. Job Management
```
├── My Jobs Today: รายการงานวันนี้เรียงตาม Priority
├── Job Detail: ข้อมูลลูกค้า, ที่อยู่, รายละเอียดงาน
├── Navigate: เปิด Google Maps ไปหาลูกค้าทันที
├── Accept / Reject Job
└── Job History: งานที่ทำผ่านมา
```

### 2. GPS Check-in / Check-out
```
├── Check-in: ระบุ Location ณ จุดปฏิบัติงาน (GPS Stamp)
├── ถ่ายรูป: บังคับถ่ายรูปก่อน/หลัง
├── Check-out: บันทึกเวลาเสร็จงาน
└── ประวัติ Location ทั้งวัน
```

### 3. Digital Checklist & Report
```
├── Checklist ตาม Job Type (ซ่อม, PM, Inspection)
├── บันทึกค่า Parameter (อุณหภูมิ, ความดัน, ฯลฯ)
├── ถ่ายรูปแนบด้วยทุก Checkpoint
└── Voice Note: อัดเสียงบันทึกแทนพิมพ์
```

### 4. Customer Signature (Digital Sign-off)
```
├── ลูกค้า Sign บนหน้าจอ
├── Generate PDF Service Report อัตโนมัติ
└── ส่ง Email ให้ลูกค้าทันที
```

### 5. Van Stock / Parts Management
```
├── ดูสต็อกอะไหล่ในรถของตัวเอง
├── เบิกอะไหล่ใช้งาน → ตัดสต็อกอัตโนมัติ [NexStock]
├── ขอเบิกจาก Warehouse: แจ้งให้จัดส่งด่วน
└── Return Parts ที่ไม่ได้ใช้
```

### 6. Timesheet (ต่อ Job/Project)
```
├── Start/Stop Timer ต่อ Task
├── บันทึก OT, เวลาพัก
└── Sync ไป NexForce/NexPayroll อัตโนมัติ
```

### 7. Offline Mode ⭐
```
├── ดาวน์โหลด Job List + ข้อมูลลูกค้าก่อนออกจากบ้าน
├── ทำงานได้ทั้งวันแม้ไม่มีเน็ต
├── Sync เมื่อกลับมามีสัญญาณ (Queue-based)
└── Conflict Resolution: ถ้า Data ชนกัน แจ้ง Supervisor
```

---

## 🔗 Integration กับแอปอื่น

```
NexField ←→ NexProduce   (รับ Job/Dispatch Order)
NexField ←→ NexForce     (Check-in, Timesheet)
NexField ←→ NexStock     (Van Stock, เบิกอะไหล่)
NexField ←→ NexSales     (ปิด Ticket, บันทึกผล)
NexField ←→ NexSpeed     (GPS Track สำหรับ Logistics)
NexField → NexLess       (อัปโหลด Photo, Report PDF)
NexField → NexFinance    (ต้นทุน Job จริง)
```

---

## 📱 UI/UX Design Principles

```
├── Simple: ปุ่มใหญ่, อ่านง่าย, ใช้งานได้แม่ถุงมือ
├── Fast: เปิดงานได้ภายใน 2 วินาที
├── Camera-First: ถ่ายรูปเป็น Primary Action
├── Thai Language First
└── Dark Mode: ใช้งานกลางแดดได้
```

---

## 🛠️ Technical Stack

```
├── Framework: React Native (iOS + Android)
├── Offline Storage: SQLite + Redux Persist
├── Sync: Background Sync + Conflict Resolution
├── Maps: Google Maps SDK
├── Camera: Native Camera + Image Compression
└── Push Notification: FCM (Firebase)
```

---

## 📊 Success Metrics

| KPI | เป้าหมาย |
|---|---|
| Field Staff Adoption | > 90% ใช้งานทุกวัน |
| Data Quality (Photos per Job) | > 95% แนบรูปครบ |
| Sync Success Rate | > 99.5% |
| App Crash Rate | < 0.1% |
| Job Completion Time (เฉลี่ย) | ลด 20% จาก Paper |

---

## 🗓️ Development Timeline (ประมาณการ)

| Phase | ระยะเวลา | สิ่งที่ทำ |
|---|---|---|
| Phase 1 | 6 สัปดาห์ | Core: Job List, GPS Check-in, Sign-off, Offline |
| Phase 2 | 4 สัปดาห์ | Van Stock, Checklist, Camera, Timesheet |
| Phase 3 | 4 สัปดาห์ | Advanced: Voice Note, Multi-language, Optimization |

---

_NexOne Development Team | NexField App Concept | April 2026_
