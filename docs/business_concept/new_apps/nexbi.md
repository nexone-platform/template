# 📈 NexBI — ระบบวิเคราะห์ข้อมูล (Executive Data Analytics & Dashboard)

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nexbi.md`
**Status:** 🆕 App Specification

---

## 🎯 วัตถุประสงค์ (Objective)

รวม Big Data ทุกแอป ออกเป็นทัศนวิสัยเพื่อขับเคลื่อนยุทธศาสตร์องค์กรของผู้บริหาร

---

## 📂 ศูนย์รวมเมนูระบบ (Menu Breakdown)

### 📌 CEO Dashboard
```text
├── มุมมองแบบ Helicopter View (Gross Margin, Revenue)
```

### 📊 Visualization
```text
├── Custom Board Builder (สร้างหน้าจอส่วนตัว)
├── Geospatial Map Data
```

### 🎯 Targets & Goals
```text
├── KPI / OKR Tracker (รายแผนก/บุคคล)
```

### 🔗 Data Warehouse
```text
├── Data Source Configs
├── Cube & Metric Definition
```

---

## 🚀 ฟีเจอร์แยกตามกลุ่มการพัฒนา (Feature breakdown)

### 📂 กลุ่ม 1: ข้อมูลหลัก (Master Data & Setup)
- **KPI / Target Base:** ตั้งโจทย์ ยอดขายรายปี เป้ายิงแอด เพื่อเปรียบเทียบตัวเลขจริง (Actuals)
- **Dashboard Templates:** เตรียม View สำเร็จรูปสำหรับ MD, CFO, CSO

### ⚙️ กลุ่ม 2: กระบวนการหลัก (Core Operations)
- **Self-Serve Reporting:** ผู้ใช้ลากแกน X, Y คอลัมน์ที่ต้องการไปสร้างกราฟได้เอง (คล้าย PowerBI)
- **Scheduled Delivery:** ถ่ายรูปกราฟ (Snapshot) แล้วอีเมลส่งเข้าเครื่องตอนเช้าตรู่ทุกวัน จ.-ศ.

### 🧩 กลุ่ม 3: ฟีเจอร์เฉพาะธุรกิจที่ครอบคลุม (Business-specific extensions)
- **Real Estate / Asset:** ติดตาม Yield (ผลกำไรต่อห้อง/ตร.ม.), หรือสภาพรวมค้างค่าเช่า
- **Retail / Logistics:** ดู Hitmap กราฟแสดงรายได้เจาะลึกระดับอำเภอ, สาขาที่ประสิทธิภาพต่ำสุด (Bottom 5)

### 🔗 กลุ่ม 4: การเชื่อมต่อและการบูรณาการ (Integrations)
- **เชื่อมต่อ ทุกแอประบบ (All apps):** สูบข้อมูลลง Data Lake / Warehouse อย่างต่อเนื่อง

---

## 🛠️ Technical Stack & Notes
```text
Apache Echarts / D3.js
OLAP Cube (ClickHouse / Snowflake integration)
```

---

_NexOne Development Team | NexBI Specification | April 2026_
