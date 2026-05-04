# ⚙️ NexOne Platform — STEP 0 Comparison Table (7 Business Types)

**Document Version:** 1.0 | **Date:** April 2026  
**วัตถุประสงค์:** ตารางเปรียบเทียบการตั้งค่าระบบเริ่มต้น (Setup) สำหรับทั้ง 7 กลุ่มธุรกิจ  
ใช้เป็นแผนพัฒนาระบบและ Onboarding Guide สำหรับทีม Implementation

---

## 📊 Legend (คำอธิบายสัญลักษณ์)

| สัญลักษณ์       | ความหมาย                                              |
| :-------------- | :---------------------------------------------------- |
| 🔴 **จำเป็น**  | ต้องตั้งค่าก่อนเริ่มใช้งานได้เลย — ขาดไม่ได้        |
| 🟡 **แนะนำ**   | ควรตั้งค่าใน Phase แรก ระบบทำงานได้บางส่วน          |
| 🔵 **เสริม**   | ตั้งค่าได้ภายหลัง เมื่อขยายธุรกิจ                   |
| ⬜ **ไม่ใช้**  | ไม่ตรงกับลักษณะธุรกิจนี้                             |

---

## 🗂️ ตัวย่อกลุ่มธุรกิจ

| ตัวย่อ  | ธุรกิจ                              | ตัวอย่าง                                        |
| :------ | :---------------------------------- | :---------------------------------------------- |
| **LOG** | Logistics / ขนส่ง                  | รถบรรทุก, Last-Mile, Cold Chain, Container      |
| **TRD** | Trading / ซื้อมาขายไป              | ขายส่ง, ขายปลีก, E-Commerce, Import-Export      |
| **MFG** | Manufacturing / รับจ้างผลิต        | Job Shop, OEM, Tolling, Make-to-Stock            |
| **SVC** | Service / บริการ                   | ที่ปรึกษา, ซ่อมบำรุง, Retainer, Hospitality    |
| **FNB** | F&B / อาหารและเครื่องดื่ม          | ร้านอาหาร, Chain, Cloud Kitchen, Catering       |
| **RES** | Real Estate / อสังหาริมทรัพย์      | Developer, Property Mgt, เช่า, Agency           |
| **CON** | Construction / ก่อสร้าง            | รับเหมา, MEP, Subcontract, Design & Build       |

---

## 🏢 ตาราง Step 0 — รายแอป × รายธุรกิจ

### MODULE 1: NexCore (ระบบกลาง — SSO / Role / Company)

| รายการตั้งค่า                                           | LOG | TRD | MFG | SVC | FNB | RES | CON |
| :-------------------------------------------------- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| ลงทะเบียนข้อมูลบริษัท (เลขนิติบุคคล, ที่อยู่, เลขภาษี)         | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |
| ตั้งค่า Multi-branch / Multi-project                   | 🔴 | 🟡 | 🟡 | 🟡 | 🟡 | 🔴 | 🔴 |
| สร้าง Role & Permission                              | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |
| เปิด SSO (Single Sign-On)                            | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |
| ตั้งค่าแผนก / ตำแหน่งงาน                                | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 |
| ตั้งค่า Notification / Alert Engine                    | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 |

**Role ที่ต้องสร้างต่อธุรกิจ:**

| ธุรกิจ    | Roles หลักที่ต้องกำหนดใน NexCore                                                           |
| :------ | :---------------------------------------------------------------------------------------|
| **LOG** | MD, Operations Manager, Dispatcher, Driver, Finance, Customer                           |
| **TRD** | Owner, Sales, Purchasing, Warehouse, Finance, Cashier                                   |
| **MFG** | MD, Sales, Production Planner, Production Supervisor, QC, Warehouse, Purchasing, Finance|
| **SVC** | MD, Sales/BDM, Project Manager, Consultant/Technician, Dispatcher, Finance, HR          |
| **FNB** | Owner, Branch Manager, Server, Chef, Cashier, Delivery                                  |
| **RES** | MD, Sales, PM, Juristic, Accounting, Maintenance, Tenant                                |
| **CON** | MD, Estimator, PM, Site Engineer, Foreman, QC, Purchasing, Finance                      |

---

### MODULE 2: NexForce (HR / พนักงาน / กะ / Timesheet)

| รายการตั้งค่า                                | LOG | TRD | MFG | SVC | FNB | RES | CON |
| :---------------------------------------- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| ลงทะเบียนพนักงานทุกคน                       | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |
| ตั้งค่า Skill Matrix / Certificate           | 🔴 | ⬜ | 🔴 | 🔴 | 🟡 | 🟡 | 🔴 |
| กำหนดกะทำงาน (Shift)                      | 🔴 | 🟡 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |
| บันทึกข้อมูลใบขับขี่ + Certificate              | 🔴 | ⬜ | ⬜ | 🟡 | ⬜ | ⬜ | ⬜ |
| ตั้งค่า Availability Calendar                | 🟡 | ⬜ | 🟡 | 🔴 | 🟡 | 🔴 | 🟡 |
| ตั้งค่า OT Rules                             | 🟡 | 🟡 | 🔴 | 🟡 | 🟡 | 🟡 | 🔴 |
| ตั้งค่า Leave Quota                          | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 |
| ตั้งค่า Timesheet ต่อ Project/Job             | ⬜ | ⬜ | 🔴 | 🔴 | ⬜ | ⬜ | 🔴 |

**จุดต่างสำคัญ:**
- `LOG`: เน้นข้อมูลใบขับขี่ Driver + กะกลางวัน/กลางคืน
- `MFG`: เน้น Shift A/B/C + Timesheet ต่อ Work Order
- `SVC`: เน้น Skill Matrix + Availability + GPS Check-in
- `CON`: เน้น Daily Timesheet ต่อ Project Phase + แรงงานรายวัน

---

### MODULE 3: NexAsset (ทรัพย์สิน / ยานพาหนะ / เครื่องจักร)

| รายการตั้งค่า                                      | LOG | TRD | MFG | SVC | FNB | RES | CON |
| :------------------------------------------------- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| ลงทะเบียนยานพาหนะ (ทะเบียน, ประกัน, พ.ร.บ.)      | 🔴 | 🟡 | 🟡 | 🟡 | ⬜ | ⬜ | 🟡 |
| ลงทะเบียนเครื่องจักร / เครื่องมือ                     | ⬜ | ⬜ | 🔴 | 🟡 | ⬜ | 🟡 | 🔴 |
| ติด QR Code ต่อชิ้นทรัพย์สิน                        | 🔴 | 🟡 | 🔴 | 🟡 | ⬜ | 🟡 | 🟡 |
| กำหนดรอบ PM (Preventive Maintenance)               | 🔴 | ⬜ | 🔴 | 🟡 | ⬜ | 🔴 | 🔴 |
| ตั้งค่า Depreciation                               | 🟡 | 🟡 | 🟡 | 🟡 | ⬜ | 🟡 | 🔴 |
| ลงทะเบียนทรัพย์สินส่วนกลาง (ของลูกค้า/โครงการ)    | ⬜ | ⬜ | ⬜ | 🟡 | ⬜ | 🔴 | ⬜ |
| ตั้งค่า Warranty ต่อ Asset                         | ⬜ | ⬜ | 🟡 | 🟡 | ⬜ | 🔴 | 🟡 |

**จุดต่างสำคัญ:**
- `LOG`: ยานพาหนะเป็น Core — ครบทุก Field
- `MFG`: เครื่องจักรเป็น Core — OEE + PM Critical
- `RES`: ทรัพย์สินส่วนกลางอาคาร + Warranty ต่อ Unit
- `CON`: เครื่องจักรหนัก (รถแบ็คโฮ, ปั้นจั่น) + Depreciation

---

### MODULE 4: NexSales (การขาย / CRM / Catalog / Pricing)

| รายการตั้งค่า                            | LOG | TRD | MFG | SVC | FNB | RES | CON |
| :--------------------------------------- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Customer Master Data                     | 🔴 | 🔴 | 🔴 | 🔴 | 🟡 | 🔴 | 🔴 |
| Credit Limit / Payment Term ต่อลูกค้า    | 🔴 | 🔴 | 🔴 | 🔴 | ⬜ | 🔴 | 🔴 |
| Product / Service Catalog                | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |
| Price List / Rate Card (ต่อ Tier)        | 🔴 | 🔴 | 🟡 | 🔴 | 🔴 | 🔴 | 🔴 |
| Contract / Blanket Agreement             | 🔴 | 🟡 | 🔴 | 🔴 | ⬜ | 🔴 | 🔴 |
| Promotion Engine                         | ⬜ | 🟡 | ⬜ | ⬜ | 🔴 | ⬜ | ⬜ |
| Table Layout / Booking System            | ⬜ | ⬜ | ⬜ | 🟡 | 🔴 | 🔴 | ⬜ |
| Unit Master Data (ห้อง/พื้นที่/โต๊ะ)     | ⬜ | ⬜ | ⬜ | ⬜ | 🔴 | 🔴 | ⬜ |
| BOQ / Rate Card ต่อหน่วยงาน              | ⬜ | ⬜ | 🟡 | ⬜ | ⬜ | ⬜ | 🔴 |
| SLA Level ต่อ Tier ลูกค้า               | ⬜ | ⬜ | ⬜ | 🔴 | ⬜ | ⬜ | ⬜ |

**จุดต่างสำคัญ:**
- `LOG`: ราคาขนส่งตามเส้นทาง/น้ำหนัก/ประเภทรถ (Rate per Lane)
- `FNB`: Menu + Recipe + Price Tier (Dine-in/Delivery) + Promo Engine
- `RES`: Unit Master Data (เลขห้อง, ขนาด, ชั้น, ราคา, Status)
- `CON`: BOQ Template + Rate Card ต่อประเภทงาน

---

### MODULE 5: NexStock (คลังสินค้า / วัตถุดิบ / สต็อก)

| รายการตั้งค่า                         | LOG | TRD | MFG | SVC | FNB | RES | CON |
| :------------------------------------ | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Product / Material Master Data        | ⬜ | 🔴 | 🔴 | 🟡 | 🔴 | ⬜ | 🔴 |
| Unit of Measure (UOM)                 | ⬜ | 🔴 | 🔴 | ⬜ | 🔴 | ⬜ | 🔴 |
| Warehouse / Location (Zone / Bin)     | 🟡 | 🔴 | 🔴 | 🟡 | 🟡 | ⬜ | 🔴 |
| Min Stock / Reorder Point             | ⬜ | 🔴 | 🔴 | 🟡 | 🔴 | ⬜ | 🔴 |
| Barcode / QR Setup                    | ⬜ | 🔴 | 🔴 | 🟡 | ⬜ | ⬜ | 🟡 |
| FEFO อาหาร / วัตถุดิบหมดอายุ          | ⬜ | 🟡 | 🟡 | ⬜ | 🔴 | ⬜ | ⬜ |
| Lot / Batch / Serial Tracking         | ⬜ | 🟡 | 🔴 | ⬜ | 🔴 | ⬜ | 🟡 |
| Consigned Stock (สต็อกของลูกค้า)      | ⬜ | ⬜ | 🔴 | ⬜ | ⬜ | ⬜ | ⬜ |
| Container Yard Management             | 🟡 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Van Stock (สต็อกในรถช่าง)             | ⬜ | ⬜ | ⬜ | 🔴 | ⬜ | ⬜ | ⬜ |
| Recipe / BOM Material Link            | ⬜ | ⬜ | 🔴 | ⬜ | 🔴 | ⬜ | ⬜ |
| Site Stock (สต็อกหน้างานก่อสร้าง)     | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔴 |

**จุดต่างสำคัญ:**
- `MFG`: RM/WIP/FG แยก Location ชัดเจน + Consigned Stock สำหรับ Tolling
- `FNB`: Ingredient + FEFO + Recipe Link + Waste Tracking
- `SVC Field`: Van Stock ต่อรถช่าง + Spare Parts ใน Warehouse กลาง
- `CON`: Site Stock แยกต่อ Project + Material Schedule

---

### MODULE 6: NexProcure (จัดซื้อ / Vendor / PO)

| รายการตั้งค่า                              | LOG | TRD | MFG | SVC | FNB | RES | CON |
| :----------------------------------------- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Vendor / Supplier Master Data              | 🔴 | 🔴 | 🔴 | 🟡 | 🔴 | 🔴 | 🔴 |
| ราคา Vendor ต่อสินค้า (Vendor Price List)  | 🔴 | 🔴 | 🔴 | 🟡 | 🔴 | ⬜ | 🔴 |
| Lead Time ต่อ Vendor                       | 🟡 | 🔴 | 🔴 | ⬜ | 🔴 | 🟡 | 🔴 |
| MOQ / Minimum Order Quantity               | ⬜ | 🟡 | 🔴 | ⬜ | 🟡 | ⬜ | 🟡 |
| วงเงินอนุมัติ PO แต่ละระดับ                | 🔴 | 🔴 | 🔴 | 🔴 | 🟡 | 🔴 | 🔴 |
| ตั้งค่า Payment Term ต่อ Vendor            | 🟡 | 🔴 | 🔴 | 🟡 | 🟡 | 🔴 | 🔴 |
| Subcontractor Registry                     | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔴 | 🔴 |
| Material Schedule Link (จาก MRP/WBS)       | ⬜ | ⬜ | 🔴 | ⬜ | ⬜ | ⬜ | 🔴 |

---

### MODULE 7: NexFinance (บัญชี / การเงิน / Chart of Accounts)

| รายการตั้งค่า                              | LOG | TRD | MFG | SVC | FNB | RES | CON |
| :----------------------------------------- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Chart of Accounts (ผังบัญชี)               | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |
| รอบบัญชี + สกุลเงิน                        | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |
| Cost Center ต่อแผนก/สาขา                   | 🔴 | 🟡 | 🔴 | 🔴 | 🟡 | 🔴 | 🔴 |
| Bank Account + ตั้งค่า Reconcile           | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |
| Deferred Revenue Setup (Package/Contract)  | ⬜ | ⬜ | ⬜ | 🔴 | 🟡 | 🔴 | 🟡 |
| Multi-Currency / FX Rate                   | ⬜ | 🔴 | 🟡 | 🟡 | ⬜ | ⬜ | 🟡 |
| Retention / Warranty Reserve               | ⬜ | ⬜ | 🟡 | ⬜ | ⬜ | 🟡 | 🔴 |
| Progress Billing Setup (งวดเงิน)           | ⬜ | ⬜ | 🟡 | 🔴 | ⬜ | 🔴 | 🔴 |
| Recurring Invoice Auto-generate            | 🔴 | 🟡 | ⬜ | 🔴 | ⬜ | 🔴 | ⬜ |

---

### MODULE 8: NexProduce (การผลิต / Project / Dispatch)

| รายการตั้งค่า                              | LOG | TRD | MFG | SVC | FNB | RES | CON |
| :----------------------------------------- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Work Center / ประเภทเครื่อง / สถานีงาน     | ⬜ | ⬜ | 🔴 | ⬜ | ⬜ | ⬜ | ⬜ |
| BOM (Bill of Materials) ต่อสินค้า          | ⬜ | ⬜ | 🔴 | ⬜ | 🔴 | ⬜ | ⬜ |
| Routing (ลำดับขั้นตอนการผลิต)              | ⬜ | ⬜ | 🔴 | ⬜ | ⬜ | ⬜ | ⬜ |
| Capacity (กำลังผลิตต่อวัน)                 | ⬜ | ⬜ | 🔴 | ⬜ | ⬜ | ⬜ | ⬜ |
| WBS / Project Structure                    | ⬜ | ⬜ | ⬜ | 🔴 | ⬜ | 🟡 | 🔴 |
| Milestone ต่อ Project                      | ⬜ | ⬜ | ⬜ | 🔴 | ⬜ | 🟡 | 🔴 |
| Dispatch Zone / Scheduling                 | 🔴 | ⬜ | ⬜ | 🔴 | ⬜ | ⬜ | ⬜ |
| SLA Level / Priority Matrix                | ⬜ | ⬜ | ⬜ | 🔴 | ⬜ | 🟡 | ⬜ |
| Catering Work Order Template               | ⬜ | ⬜ | ⬜ | ⬜ | 🟡 | ⬜ | ⬜ |

**จุดต่างสำคัญ:**
- `MFG`: BOM + Routing + Capacity = หัวใจระบบผลิต
- `SVC`: WBS + Milestone + Dispatch + SLA = หัวใจ Service Management
- `LOG`: Dispatch Zone + Vehicle Availability = Control Tower
- `CON`: WBS + Milestone + Resource = Gantt Chart

---

### MODULE 9: NexTax (ภาษี / e-Tax Invoice / VAT)

| รายการตั้งค่า                                  | LOG | TRD | MFG | SVC | FNB | RES | CON |
| :--------------------------------------------- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| ตั้งค่า VAT 7% (Output/Input)                  | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |
| WHT (ภาษีหัก ณ ที่จ่าย) ต่อประเภทการจ่าย      | 🔴 | 🔴 | 🔴 | 🔴 | 🟡 | 🔴 | 🔴 |
| e-Tax Invoice Integration (กรมสรรพากร)          | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 |
| ตั้งค่า ภ.พ.30 รายเดือน                        | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |
| ภ.ง.ด.3/53 (บริการ/จ้างทำของ)                 | 🔴 | 🔴 | 🔴 | 🔴 | 🟡 | 🔴 | 🔴 |

---

### MODULE 10: NexPOS (ระบบ POS หน้าร้าน)

| รายการตั้งค่า                            | LOG | TRD | MFG | SVC | FNB | RES | CON |
| :--------------------------------------- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| ตั้งค่า Terminal / เครื่อง POS           | ⬜ | 🔴 | ⬜ | 🟡 | 🔴 | ⬜ | ⬜ |
| Payment Method (เงินสด/QR/บัตร/Wallet)  | ⬜ | 🔴 | ⬜ | 🔴 | 🔴 | 🟡 | ⬜ |
| Table Layout / Zone (Floor Plan)         | ⬜ | ⬜ | ⬜ | ⬜ | 🔴 | ⬜ | ⬜ |
| ตั้งค่า Split Bill                       | ⬜ | ⬜ | ⬜ | ⬜ | 🔴 | ⬜ | ⬜ |
| Kitchen Display System (KDS)             | ⬜ | ⬜ | ⬜ | ⬜ | 🔴 | ⬜ | ⬜ |
| Cashier / Shift Closing                  | ⬜ | 🔴 | ⬜ | 🟡 | 🔴 | ⬜ | ⬜ |

---

### MODULE 11: NexSpeed (ระบบขนส่ง + Dispatch)

| รายการตั้งค่า                           | LOG | TRD | MFG | SVC | FNB | RES | CON |
| :-------------------------------------- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| ประเภทรถ / Vehicle Type                 | 🔴 | 🟡 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Location Master (จุดรับ-ส่ง)            | 🔴 | 🟡 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| ราคาค่าขนส่งต่อเส้นทาง/น้ำหนัก         | 🔴 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Driver App Setup                        | 🔴 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| GPS Zone / Geofence                     | 🔴 | ⬜ | ⬜ | 🟡 | ⬜ | ⬜ | ⬜ |
| Queue Management (คิวเข้าท่า/จุด)       | 🟡 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

---

### MODULE 12: NexPayroll (เงินเดือน)

| รายการตั้งค่า                                   | LOG | TRD | MFG | SVC | FNB | RES | CON |
| :----------------------------------------------- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| โครงสร้างเงินเดือน (ระดับ/ตำแหน่ง)               | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |
| ค่าตอบแทนพิเศษ (ค่ากะ, ค่าทริป, ค่าคอม)          | 🔴 | 🟡 | 🔴 | 🔴 | 🟡 | 🟡 | 🔴 |
| ประกันสังคม (SSO) + ภาษีเงินได้บุคคล              | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |
| เงินเดือนแรงงานรายวัน                             | ⬜ | ⬜ | 🟡 | ⬜ | 🟡 | 🟡 | 🔴 |
| Commission Structure                              | ⬜ | 🔴 | ⬜ | 🟡 | ⬜ | 🔴 | ⬜ |

---

## 📋 สรุปจำนวน Item "จำเป็น" ต่อธุรกิจ (นับเฉพาะ 🔴)

| Module        | LOG | TRD | MFG | SVC | FNB | RES | CON |
| :------------ | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| NexCore       |  4  |  4  |  4  |  4  |  4  |  4  |  4  |
| NexForce      |  4  |  2  |  5  |  5  |  3  |  3  |  5  |
| NexAsset      |  4  |  0  |  3  |  0  |  0  |  2  |  4  |
| NexSales      |  5  |  5  |  4  |  5  |  5  |  5  |  5  |
| NexStock      |  0  |  5  |  6  |  1  |  5  |  0  |  5  |
| NexProcure    |  3  |  4  |  5  |  1  |  3  |  3  |  5  |
| NexFinance    |  4  |  5  |  5  |  6  |  5  |  6  |  6  |
| NexProduce    |  1  |  0  |  4  |  4  |  0  |  0  |  2  |
| NexTax        |  4  |  4  |  4  |  4  |  4  |  4  |  4  |
| NexPOS        |  0  |  3  |  0  |  1  |  5  |  0  |  0  |
| NexSpeed      |  5  |  0  |  0  |  0  |  0  |  0  |  0  |
| NexPayroll    |  3  |  3  |  3  |  3  |  3  |  3  |  4  |
| **รวม**       | **37** | **35** | **43** | **34** | **37** | **30** | **44** |

> **MFG และ CON มี Setup Items มากที่สุด** เพราะต้องบริหารทั้งวัตถุดิบ + เครื่องจักร + การผลิต + บัญชีต้นทุน

---

## 🗺️ Unique Features ต่อธุรกิจ (Setup พิเศษที่ธุรกิจอื่นไม่มี)

| ธุรกิจ  | Unique Setup                                                                                    |
| :------ | :---------------------------------------------------------------------------------------------- |
| **LOG** | Vehicle Registry + Driver License Expiry + Dispatch Zone + GPS Route + Container Yard          |
| **TRD** | Multi-Channel (NexConnect Link) + Multi-branch POS + Loyalty Program Setup                    |
| **MFG** | BOM + Routing + Work Center + Capacity + Consigned Stock + OEE Dashboard                      |
| **SVC** | Skill Matrix + SLA Matrix + GPS Check-in Policy + Deferred Revenue (Package)                  |
| **FNB** | Recipe / Formula Link + Kitchen Display (KDS) + Table Layout + FEFO daily                     |
| **RES** | Unit Master Data (Floor Plan) + Resident Portal + Tenant Registry + Recurring Collection      |
| **CON** | BOQ Template + WBS + Earned Value Setup + Subcontractor Registry + Site Stock per Project     |

---

## 🚀 แผนพัฒนาตาม Phase — ทุกธุรกิจ

### Phase 0: Foundation (ทุกธุรกิจต้องทำก่อน)

> **เป้าหมาย:** พนักงานเข้าสู่ระบบได้ + ข้อมูลพื้นฐานพร้อม

| ลำดับ | รายการ                           | แอป                    | ทุก Industry |
| :---: | :------------------------------- | :--------------------- | :----------: |
|   1   | ลงทะเบียนบริษัท + เลขภาษี        | NexCore                |      ✅      |
|   2   | สร้าง Role & Permission ตามธุรกิจ | NexCore                |      ✅      |
|   3   | เปิด SSO ทุกแอปที่ใช้            | NexCore                |      ✅      |
|   4   | ลงทะเบียนพนักงานทุกคน             | NexForce               |      ✅      |
|   5   | ตั้งค่ากะทำงาน                   | NexForce               |      ✅      |
|   6   | ผังบัญชี (Chart of Accounts)     | NexFinance             |      ✅      |
|   7   | ตั้งค่า VAT + WHT                | NexTax                 |      ✅      |
|   8   | Customer / Vendor Master Data    | NexSales / NexProcure  |      ✅      |

### Phase 1: Core Operations (ตามประเภทธุรกิจ)

> **เป้าหมาย:** ทำงานหลักของธุรกิจได้ครบวงจร

| ธุรกิจ  | Module ที่ต้อง Setup ใน Phase 1                                          |
| :------ | :----------------------------------------------------------------------- |
| **LOG** | NexSpeed (ประเภทรถ + Location + ราคา), NexAsset (ทะเบียนรถ)            |
| **TRD** | NexStock (สินค้า + Barcode + Location), NexSales (Price List)           |
| **MFG** | NexProduce (BOM + Routing + Work Center), NexStock (RM/WIP/FG)          |
| **SVC** | NexForce (Skill Matrix + Availability), NexSales (Service Catalog + Rate) |
| **FNB** | NexPOS (Menu + Table Layout + KDS), NexStock (Recipe + Ingredient)      |
| **RES** | NexSales (Unit Master Data + Price Matrix), NexAsset (ส่วนกลาง + PM)   |
| **CON** | NexProduce (WBS + Milestone), NexProcure (Vendor + Subcontractor)       |

### Phase 2: Finance & HR Complete

> **เป้าหมาย:** เก็บเงินได้ + จ่ายเงินได้ + ภาษีถูกต้อง

- NexFinance: AR/AP/GL ครบ
- NexPayroll: เงินเดือนพร้อม
- NexTax: e-Tax Invoice + ภ.พ.30

### Phase 3: Analytics & Automation

> **เป้าหมาย:** ระบบทำงานอัตโนมัติ + Dashboard ผู้บริหาร

- NexBI: Dashboard KPI
- NexApprove: Workflow อนุมัติ
- NexConnect: เชื่อม External Systems

---

## ⏱️ ประมาณเวลา Setup (โดยประมาณ)

| ธุรกิจ  | เวลา Setup Phase 0 | เวลา Setup รวม Phase 0-1 | ความซับซ้อน |
| :------ | :----------------: | :----------------------: | :---------: |
| **LOG** |      3-5 วัน       |        2-3 สัปดาห์       |  ⭐⭐⭐⭐   |
| **TRD** |      2-4 วัน       |        1-2 สัปดาห์       |   ⭐⭐⭐    |
| **MFG** |      5-7 วัน       |        3-4 สัปดาห์       | ⭐⭐⭐⭐⭐  |
| **SVC** |      2-4 วัน       |        1-2 สัปดาห์       |   ⭐⭐⭐    |
| **FNB** |      1-3 วัน       |         1 สัปดาห์        |    ⭐⭐     |
| **RES** |      3-5 วัน       |        2-3 สัปดาห์       |  ⭐⭐⭐⭐   |
| **CON** |      5-7 วัน       |        3-4 สัปดาห์       | ⭐⭐⭐⭐⭐  |

---

## 🔧 Development Priority — Features ที่ต้องพัฒนาใน NexCore ก่อน

| ลำดับ | Feature                              | ใช้กับธุรกิจ            | Priority      |
| :---: | :----------------------------------- | :---------------------- | :-----------: |
|   1   | Dynamic Role & Permission Builder    | ทุกธุรกิจ              | 🔴 Critical   |
|   2   | Multi-branch / Multi-project Structure | LOG, RES, CON, TRD   | 🔴 Critical   |
|   3   | Notification Engine (SMS/Email/Push) | ทุกธุรกิจ              | 🔴 Critical   |
|   4   | SSO + App Launcher                   | ทุกธุรกิจ              | 🔴 Critical   |
|   5   | Onboarding Wizard (Step-by-step Setup) | ทุกธุรกิจ            | 🟡 High       |
|   6   | Industry Template (เลือก Business Type) | ทุกธุรกิจ           | 🟡 High       |
|   7   | Data Import Tool (Excel → System)    | ทุกธุรกิจ              | 🟡 High       |

---

_เอกสารจัดทำโดย: NexOne Development Team_  
_วัตถุประสงค์: ใช้เป็นแผนพัฒนาระบบและ Implementation Guide_  
_ปรับปรุงล่าสุด: April 2026_
