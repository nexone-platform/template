# 💰 NexFinance — ระบบบัญชีและการเงินระดับองค์กร (Finance & Accounting)

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nexfinance.md`
**Status:** 🆕 App Specification

---

## 🎯 วัตถุประสงค์ (Objective)

บัญชีแยกประเภทสมบูรณ์ทั้งรับ-จ่าย ออกใบกำกับภาษี บิลนิ่ง และกระทบยอด Bank

---

## 📂 ศูนย์รวมเมนูระบบ (Menu Breakdown)

### 📌 Finance Board
```text
├── Cash Flow, กระแสเงินสดเข้าออกวันต่อวัน
```

### 🧾 Accounts Receivable (AR)
```text
├── Invoices (ใบแจ้งหนี้)
├── Receipts (ใบเสร็จรับเงิน)
├── Credit Notes (ใบลดหนี้)
```

### 💵 Accounts Payable (AP)
```text
├── Vendor Bills (ตั้งหนี้)
├── Payments (จ่ายเงิน)
├── Debit Notes (ใบเพิ่มหนี้)
```

### 📓 General Ledger (GL)
```text
├── Chart of Accounts (ผังบัญชี)
├── Journal Entries (สมุดรายวัน)
├── Trial Balance (งบทดลอง)
```

### 📈 Bank & Cash
```text
├── Bank Reconciliation
├── Petty Cash (เงินสดย่อย)
```

---

## 🚀 ฟีเจอร์แยกตามกลุ่มการพัฒนา (Feature breakdown)

### 📂 กลุ่ม 1: ข้อมูลหลัก (Master Data & Setup)
- **Chart of Accounts (COA):** กำหนดโครงสร้างผังบัญชี ผสมกับ Cost Center
- **Bank Accounts:** รวมเลขบัญชีบริษัทเพื่อใช้คอนเฟิร์มว่ารับเงินเข้ากระเป๋าไหน

### ⚙️ กลุ่ม 2: กระบวนการหลัก (Core Operations)
- **3-Way Matching:** ระบบสอบเทียบรัดกุม เปรียบเทียบ PO, ใบรับเกรด (GRN) และบิลผู้ค้า ให้ตรงกันก่อนจ่าย (AP)
- **Automated JV Posting:** ลงบัญชีคู่ให้อัตโนมัติในเบื้องหลังเมื่อเกิดรายการขาย หรือเบิกของ ทุกระบบเชื่อมมาที่นี่

### 🧩 กลุ่ม 3: ฟีเจอร์เฉพาะธุรกิจที่ครอบคลุม (Business-specific extensions)
- **Real Estate:** รับเงินดาวน์ เงินงวด และการผ่อนบัญชีรายเดือน
- **Construction:** ออกใบเรียกเก็บเงินตามงวดงาน Construction Progress Billing (Retention Deductions)

### 🔗 กลุ่ม 4: การเชื่อมต่อและการบูรณาการ (Integrations)
- **เชื่อมต่อ NexTax:** แยกยอดภาษีไปรวมกรอกแบบรายงาน (Input / Output Tax)
- **เชื่อมต่อ NexCost:** ส่งยอดค่าใช้จ่ายกระจายไปคิด Overhead ศูนย์ต่างๆ

---

## 🛠️ Technical Stack & Notes
```text
Double-Entry Ledger Architecture
High Precision Decimal (Numeric 15,4)
```

---

_NexOne Development Team | NexFinance Specification | April 2026_
