# 🎓 NexLearn — ระบบฝึกอบรมและองค์ความรู้ (Learning Management System)

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nexlearn.md`
**Status:** 🆕 App Specification

---

## 🎯 วัตถุประสงค์ (Objective)

เพิ่มศักยภาพพนักงาน ส่งแบบทดสอบ ออกใบรับรองแบบ e-Learning ขับเคลื่อนพัฒนาธุรกิจ

---

## 📂 ศูนย์รวมเมนูระบบ (Menu Breakdown)

### 📌 My Learning Hub
```text
├── ห้องเรียนของฉัน, เปอร์เซ็นความก้าวหน้า
```

### 📚 Academy Center
```text
├── Course Catalog (วิดีโอ/บทความ)
├── SCORM Standard Upload
```

### 🛤️ Corporate Tracking
```text
├── Learning Pathways (คอร์สบังคับ)
├── Manager Analytics
```

### ❓ Assessments
```text
├── Quiz & Exam Builder
├── Certificate Generator
```

---

## 🚀 ฟีเจอร์แยกตามกลุ่มการพัฒนา (Feature breakdown)

### 📂 กลุ่ม 1: ข้อมูลหลัก (Master Data & Setup)
- **Course Library:** จัดการเนื้อหา, บทเรียน และหมวดหมู่วิชา
- **Exam Bank:** คลังข้อสอบและตัวเลือกสุ่มสำหรับป้องกันการลอก

### ⚙️ กลุ่ม 2: กระบวนการหลัก (Core Operations)
- **Learning Gamification:** ทำแบบทดสอบให้เป็นสเตจ เก็บคะแนน แจกใบอนุญาต หรือเข็มกลัด (Badge)
- **SCORM Player:** รองรับไฟล์เรียนมาตรฐานสากล ที่นับการกดคลิกและการมีส่วนร่วมในวิดีโอ

### 🧩 กลุ่ม 3: ฟีเจอร์เฉพาะธุรกิจที่ครอบคลุม (Business-specific extensions)
- **Construction:** อบรมหลักสูตรความปลอดภัย (Safety/OH&S) ก่อนให้พนักงานลงไซต์จริง (Mandatory)
- **F&B:** การเทรนนิ่งพนักงานใหม่เกี่ยวกับการทำอาหาร การต้อนรับลูกค้า มารยาท (Standard Ops)

### 🔗 กลุ่ม 4: การเชื่อมต่อและการบูรณาการ (Integrations)
- **เชื่อมต่อ NexForce:** ลิงก์การสอบผ่าน (Certificate) กลับไปเป็นแต้ม Skill ของพนักงาน HR เพื่อปรับขึ้นเงินเดือน

---

## 🛠️ Technical Stack & Notes
```text
Video Streaming Codec (HLS)
Canvas API for Certificate PDF
```

---

_NexOne Development Team | NexLearn Specification | April 2026_
