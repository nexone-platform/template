# 🕵️ NexAudit — ระบบบันทึก Audit Log และ PDPA Compliance (Audit Base)

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nexaudit.md`
**Status:** 🆕 App Specification

---

## 🎯 วัตถุประสงค์ (Objective)

เก็บบันทึกร่องรอยการเปลี่ยนแปลงข้อมูลทั้งหมด และควบคุมเรื่องความปลอดภัยเชิง PDPA

---

## 📂 ศูนย์รวมเมนูระบบ (Menu Breakdown)

### 📌 Security Center
```text
├── ภาพรวมการเข้าถึงข้อมูลอ่อนไหว
```

### 👣 Trace Logs
```text
├── System Activity Log
├── Login & Attempt Log
```

### ⚖️ Privacy & Compliance
```text
├── PDPA Consent Center
├── Data Subject Requests (DSR)
```

### 🚨 Rules & Monitoring
```text
├── Suspicious Activity Alerts (แจ้งเตือนความผิดปกติ)
```

---

## 🚀 ฟีเจอร์แยกตามกลุ่มการพัฒนา (Feature breakdown)

### 📂 กลุ่ม 1: ข้อมูลหลัก (Master Data & Setup)
- **Privacy Policies:** เก็บเวอร์ชั่นของหน้า Accept Terms / Policy / Cookies
- **Log Mapping Schema:** โครงสร้างว่าตารางไหน คือข้อมูล PII (ส่วนบุคคล) ที่ต้องจับตาดู

### ⚙️ กลุ่ม 2: กระบวนการหลัก (Core Operations)
- **Central Event Logger:** เก็บค่า Before / After ว่านาย A ได้แก้ไขราคาขายของนาย B ตอนกี่โมง
- **Anonymization Engine:** เมื่อลูกค้าส่งเรื่อง DSR ขอลบข้อมูล ยอมรับการจัดการปกปิดตัวตน (Encrypt PII) เพื่อคงสถิติ

### 🧩 กลุ่ม 3: ฟีเจอร์เฉพาะธุรกิจที่ครอบคลุม (Business-specific extensions)
- **B2C (F&B / Retail):** จัดการกับสมาชิก Member และการให้ยินยอม SMS Marketing ลดความเสี่ยง PDPA
- **Finance:** ป้องกันปัญหา Fraud ภายใน 100%

### 🔗 กลุ่ม 4: การเชื่อมต่อและการบูรณาการ (Integrations)
- **เชื่อมต่อ NexCore:** จับตา User ทุกคนที่ล็อกอิน / แอบเปลี่ยนสิทธิ์ต่างๆ
- **เชื่อมต่อ All Databases:** เสียบ Event Listener ทุกครั้งที่ Model Database Update

---

## 🛠️ Technical Stack & Notes
```text
Elastic Search (Log Indexing)
Kafka / RabbitMQ (Event Streaming)
```

---

_NexOne Development Team | NexAudit Specification | April 2026_
