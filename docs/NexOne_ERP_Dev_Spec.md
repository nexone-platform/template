# 📘 NexOne ERP Platform — Development Specification

**Document Version:** 1.1  
**Date:** April 2026  
**Status:** Draft for Development Team

---

## 1. 🏷️ ชื่อแพลตฟอร์ม — Brand Naming

> [!CAUTION]
> **⚠️ ผลการตรวจสอบ Trademark: "NexOne" มีปัญหา!**
>
> พบว่า **NexOne Corporation** (แคนาดา) ได้จดทะเบียน trademark ชื่อ **"NEXONE"**, **"NEX ONE"**, **"NEXONE OFFICE"** ไว้แล้ว  
> เป็นซอฟต์แวร์ด้าน Real Estate / Transaction Management  
> ➡️ **ใช้ชื่อ NexOne อาจมีความเสี่ยงทางกฎหมาย** หากขยายตลาดต่างประเทศ

### ตัวสำรองที่แนะนำ (ยังไม่มี trademark ที่ชัดเจน)

| ชื่อ          | ความหมาย                     | ความพร้อม                           | คะแนน      |
| ------------- | ---------------------------- | ----------------------------------- | ---------- |
| **NexOne**    | One Platform ครบทุกอย่าง     | ⚠️ มี trademark ต่างประเทศ (แคนาดา) | ⚠️         |
| **NexHub** ⭐ | Hub = ศูนย์กลางทุกระบบ       | ✅ ยังไม่พบ trademark ชนชัดเจน      | ⭐⭐⭐⭐⭐ |
| **NexFlow**   | Flow = กระบวนการทำงานไหลลื่น | ✅ ยังไม่พบ                         | ⭐⭐⭐⭐   |
| **NexCore**   | Core = แกนกลางของธุรกิจ      | ✅ ยังไม่พบ                         | ⭐⭐⭐⭐   |
| **NexLink**   | Link = เชื่อมทุกระบบ         | ✅ ยังไม่พบ                         | ⭐⭐⭐⭐   |
| **NexOps**    | Operations Platform          | ✅ ยังไม่พบ                         | ⭐⭐⭐     |

> [!TIP]
> **คำแนะนำกรณีใช้ชื่อ NexOne ต่อ:**
>
> - ถ้าใช้เฉพาะในไทย ระยะแรก → ความเสี่ยงต่ำ
> - ถ้าวางแผนขยายต่างประเทศ → ให้ที่ปรึกษาด้าน IP/Trademark ตรวจสอบก่อน
> - ตรวจสอบเพิ่มเติมที่: https://ipthailand.go.th (ไทย) และ https://www.wipo.int/branddb (สากล)

---

### 1.1 🌐 Domain Name — คำแนะนำการจด

> [!NOTE]
> จากการตรวจสอบโดเมน **nexone.\*** พบว่ายังมีโดเมนน่าสนใจหลายตัวที่ยังว่างอยู่ (ณ April 2026)

#### ⭐ แนะนำให้จดทันที (Priority 1)

| โดเมน               | เหตุผล                                           | ราคาโดยประมาณ           |
| ------------------- | ------------------------------------------------ | ----------------------- |
| **nexone.co.th** ⭐ | โดเมนไทยอย่างเป็นทางการ น่าเชื่อถือสูง ใช้ทำ B2B | ต้องมีเอกสารจด          |
| **nexone.com**      | Global standard สำหรับ SaaS / ERP                | ~190 บาท/ปี (ซื้อ 3 ปี) |
| **nexone.net**      | รองจาก .com เหมาะสำหรับ platform/network         | ราคาปกติ                |
| **nexone.in.th**    | รองรับตลาดในไทย ราคาถูก                          | ต้องมีเอกสารจด          |

#### 🔵 แนะนำจดเพิ่มเติม (Priority 2 — ป้องกัน brand)

| โดเมน               | วัตถุประสงค์                  |
| ------------------- | ----------------------------- |
| **nexone.app**      | สำหรับ Mobile App / Platform  |
| **nexone.io**       | นิยมในวงการ Tech Startup      |
| **nexone.asia**     | ตลาด Asia Pacific             |
| **nexone.group**    | ถ้าบริษัทมีหลายกลุ่มธุรกิจ    |
| **nexone.services** | หน้า landing พอร์ทัล services |
| **nexone.cloud**    | เน้น Cloud ERP positioning    |

#### 🟡 โดเมนที่มีอยู่แต่ไม่แนะนำจดหลัก

| โดเมน                       | หมายเหตุ                         |
| --------------------------- | -------------------------------- |
| nexone.me                   | เหมาะ personal brand มากกว่า B2B |
| nexone.website              | ฟังดูไม่ professional            |
| nexone.click                | ไม่เหมาะ ERP                     |
| nexone.limo                 | ไม่เกี่ยวข้อง                    |
| nexone.fun / .club / .games | ไม่เหมาะ enterprise software     |

#### 🏗️ กลยุทธ์การใช้โดเมน (Recommended Setup)

```
nexone.co.th      ← เว็บหลักสำหรับลูกค้าไทย (NexSite)
nexone.com        ← Brand protection + redirect ไป .co.th
nexone.in.th      ← เผื่อตลาด SME ไทย

โครงสร้าง Subdomain:
  app.nexone.co.th          ← NexOne Platform Login (SSO)
  speed.nexone.co.th        ← NexSpeed
  stock.nexone.co.th        ← NexStock
  finance.nexone.co.th      ← NexFinance
  hr.nexone.co.th           ← NexForce
  bi.nexone.co.th           ← NexBI
  api.nexone.co.th          ← API Gateway
  docs.nexone.co.th         ← Documentation
  status.nexone.co.th       ← System Status Page
```

#### 📋 โดเมนทั้งหมดที่ตรวจสอบแล้วว่าพร้อมจด

```
กลุ่มหลัก (.th):
  nexone.co.th ✅   nexone.in.th ✅   nexone.net.th ✅

กลุ่มสากล:
  nexone.com ✅     nexone.net ✅     nexone.org ⚠️ (Premium)
  nexone.co  ✅     nexone.me  ✅     nexone.asia ✅

กลุ่ม Tech / Developer:
  nexone.io  ✅     nexone.app ✅      nexone.cloud ✅
  nexone.software ✅ nexone.security ✅ nexone.digital ✅
  nexone.dev ✅     nexone.systems ✅  nexone.computer ✅
  nexone.works ✅   nexone.exchange ✅  nexone.run ✅

กลุ่ม Business (Enterprise):
  nexone.biz ✅         nexone.group ✅      nexone.services ✅
  nexone.company ✅     nexone.work ✅       nexone.inc ✅
  nexone.ltd ✅         nexone.partners ✅   nexone.ventures ✅
  nexone.enterprises ✅ nexone.holdings ✅   nexone.international ✅
  nexone.industries ✅  nexone.institute ✅  nexone.consulting ✅
  nexone.expert ✅      nexone.direct ✅     nexone.plus ✅
  nexone.limited ✅     nexone.engineering ✅ nexone.agency ✅
  nexone.sale ✅        nexone.market ✅     nexone.express ✅
  nexone.delivery ✅    nexone.energy ✅     nexone.construction ✅
  nexone.capital ✅     nexone.fund ✅       nexone.deals ✅
  nexone.careers ✅     nexone.community ✅  nexone.academy ✅
  nexone.directory ✅   nexone.report ✅     nexone.fyi ✅

กลุ่ม Finance / Legal / Commerce (เหมาะกับ ERP Module):
  nexone.finance ✅    nexone.money ✅      nexone.credit ✅
  nexone.cash ✅       nexone.tax ✅        nexone.legal ✅
  nexone.insure ✅     nexone.parts ✅      nexone.supply ✅
  nexone.trading ✅   nexone.markets ✅    nexone.supplies ✅
  nexone.equipment ✅ nexone.accountants ✅ nexone.contractors ✅
  nexone.associates ✅ nexone.discount ✅   nexone.bargains ✅
  nexone.claims ✅    nexone.lease ✅       nexone.mortgage ✅
  nexone.protection ✅

กลุ่ม Health / HR / Industry:
  nexone.healthcare ✅  nexone.health ✅  nexone.care ✅
  nexone.properties ✅  nexone.city ✅    nexone.town ✅
  nexone.chat ✅        nexone.tips ✅    nexone.uno ✅
  nexone.watch ✅       nexone.page ✅    nexone.rest ✅

กลุ่ม Content/Support:
  nexone.site ✅       nexone.online ✅    nexone.blog ✅
  nexone.news ✅       nexone.support ✅   nexone.wiki ✅
  nexone.press ✅      nexone.marketing ✅ nexone.media ✅
  nexone.guide ✅      nexone.reviews ✅   nexone.events ✅
  nexone.education ✅  nexone.school ✅    nexone.live ✅
  nexone.travel ✅     nexone.rocks ✅     nexone.ninja ✅
  nexone.domains ✅    nexone.gratis ✅    nexone.buzz ✅
  nexone.best ✅       nexone.cards ✅     nexone.icu ✅
```

> [!TIP]
> **⭐ สรุป Domain ที่แนะนำสำหรับ ERP Platform โดยตรง:**
>
> | ลำดับ | โดเมน                | เหตุผล                                     | เหมาะกับ Module ใด |
> | :---: | -------------------- | ------------------------------------------ | ------------------ |
> |   1   | `nexone.co.th`       | โดเมนไทยอย่างเป็นทางการ น่าเชื่อถือสูงสุด  | ทุก Module         |
> |   2   | `nexone.software` ⭐ | ตรงตัวที่สุด ระบุว่าเป็น Software Platform | Platform หลัก      |
> |   3   | `nexone.systems` ⭐  | สื่อถึง ERP Systems โดยตรง                 | Platform หลัก      |
> |   4   | `nexone.dev`         | เหมาะ Community นักพัฒนา / API Docs        | API / Docs         |
> |   5   | `nexone.consulting`  | บริการที่ปรึกษา ERP Implementation         | บริการ             |
> |   6   | `nexone.tax`         | ตรงกับ Module บัญชีภาษี                    | NexFinance         |
> |   7   | `nexone.legal`       | สัญญา / เอกสารกฎหมาย                       | NexLess            |
> |   8   | `nexone.supply`      | Supply Chain Management                    | NexStock           |
> |   9   | `nexone.healthcare`  | ถ้าขยายสู่ธุรกิจสุขภาพ                     | เฉพาะกลุ่ม         |
> |  10   | `nexone.capital`     | Positioning ด้านการเงิน / Investor         | NexFinance         |
> |  11   | `nexone.careers`     | หน้าสมัครงาน / HR Portal                   | NexForce           |
> |  12   | `nexone.exchange`    | API Data Exchange / Integration Hub        | Core API           |
> |  13   | `nexone.enterprises` | ตรงกลุ่ม Enterprise Customer               | Sales / Marketing  |
> |  14   | `nexone.community`   | User Community / Forum / Support           | NexSite            |

## 2. 🗂️ ภาพรวม NexOne Platform (22 แอปพลิเคชัน)

> [!NOTE]
> เริ่มต้นด้วย **12 แอปหลัก** (Phase 1–2) จากนั้นขยายเป็น **22 แอป**เต็มรูปแบบ (Phase 3–4)
> แอปที่เพิ่มเข้ามาใหม่และแอปหลักส่วนกลางจะแสดงสัญลักษณ์ ⭐

```text
NexOne Platform
│
├── [กลุ่ม Core]
│   └── NexCore      — Central Admin / SSO / Role Management ⭐ (3001)
│
├── [กลุ่ม People]
│   ├── NexForce     — HRM / Field Force / ประวัติพนักงาน (3002)
│   └── NexLearn     — LMS / ฝึกอบรม / e-Learning ⭐ (3020)
│
├── [กลุ่ม Site & Portal]
│   └── NexSite      — เว็บไซต์ / Portal องค์กร / Landing Page (3003)
│
├── [กลุ่ม Operations]
│   ├── NexAsset     — Asset Management / ครุภัณฑ์ ⭐ (3004)
│   ├── NexStock     — WMS คลังสินค้า (3006)
│   ├── NexProduce   — MES ระบบการผลิต (3007)
│   ├── NexSpeed     — TMS ระบบขนส่ง / Logistics (3008)
│   ├── NexDelivery  — Last-mile Delivery Tracking ⭐ (3011)
│   └── NexMaint     — Preventive Maintenance / ซ่อมบำรุง ⭐ (3019)
│
├── [กลุ่ม Commerce]
│   ├── NexProcure   — Procurement / จัดซื้อจัดจ้าง (3005)
│   ├── NexSales     — CRM / ระบบขาย / ใบเสนอราคา (3009)
│   ├── NexPOS       — Point of Sale / ระบบหน้าร้าน ⭐ (3010)
│   └── NexConnect   — Integration Hub / API เชื่อมต่อภายนอก ⭐ (3021)
│
├── [กลุ่ม Finance]
│   ├── NexFinance   — ERP การเงิน / บัญชี / GL / AP / AR (3012)
│   ├── NexCost      — Cost Management / ต้นทุน / งบประมาณ (3013)
│   ├── NexTax       — ภาษีมูลค่าเพิ่ม / WHT / สรรพากร ⭐ (3014)
│   └── NexPayroll   — เงินเดือน / ประกันสังคม / ภาษีหัก ณ ที่จ่าย ⭐ (3015)
│
├── [กลุ่ม Governance]
│   ├── NexLess      — Paperless / เอกสารดิจิทัล (3016)
│   ├── NexApprove   — Workflow E-Approval / ใบสั่งซื้อ / ใบลา ⭐ (3017)
│   └── NexAudit     — Audit Log / PDPA Compliance ⭐ (3018)
│
└── [กลุ่ม Analytics]
    └── NexBI        — Business Intelligence / Dashboard / KPI (3022)
```

### 📋 ตารางสรุปแผนการส่งมอบพอร์ตและเฟสการทำงาน (22 ระบบ)

*จัดกลุ่มตาม **Phase การส่งมอบ (Delivery Phase)** โดยอิงตาม Workflow การทำงานจริงของธุรกิจลูกค้า เพื่อให้ลูกค้าสามารถทดสอบระบบเชื่อมต่อเนื่องกันได้อย่างสมบูรณ์ (ต้องมีการตั้งค่าโครงสร้างบริษัท -> ฝ่ายคลัง/ผลิต -> ฝ่ายขาย/การเงิน -> สรุปวิเคราะห์ข้อมูล)*

| Phase | ลำดับ | Port | ชื่อระบบ (App Name) | กลุ่ม (Group) | ชื่อภาษาอังกฤษ (English Desc) | ชื่อภาษาไทย (Thai Desc) | สถานะ |
|:---:|:---:|:---:|---------------------|---------------|-------------------------------|------------------------|:---:|
| **1** | 1 | `3001` | **NexCore** ⭐      | Core          | Central Admin & SSO Control   | ศูนย์ควบคุมกลางและจัดการสิทธิ์ผู้ใช้ | 🟢 กำลังพัฒนา |
| **1** | 2 | `3002` | **NexForce**        | People        | Human Resource Management     | ระบบบริหารทรัพยากรบุคคลครบวงจร   | 📋 วางแผน |
| **1** | 3 | `3003` | **NexSite**         | Site & Portal | Enterprise Website & Portal   | ระบบเว็บไซต์และพอร์ทัลองค์กร      | 📋 วางแผน |
| **1** | 4 | `3004` | **NexAsset** ⭐     | Operations    | Enterprise Asset Management   | ระบบบริหารสินทรัพย์และครุภัณฑ์    | 💡 แนะนำ |
| **2** | 5 | `3005` | **NexProcure**      | Commerce      | Enterprise Procurement System | ระบบบริหารจัดซื้อจัดจ้าง         | 📋 วางแผน |
| **2** | 6 | `3006` | **NexStock**        | Operations    | Inventory Management System   | ระบบบริหารสินค้าคงคลัง (WMS)    | 🟢 กำลังพัฒนา |
| **2** | 7 | `3007` | **NexProduce**      | Operations    | Manufacturing Execution System| ระบบวางแผนและควบคุมการผลิต     | 📋 วางแผน |
| **2** | 8 | `3008` | **NexSpeed**        | Operations    | Transportation Management     | ระบบบริหารการขนส่ง (TMS)        | 🟢 กำลังพัฒนา |
| **3** | 9 | `3009` | **NexSales**        | Commerce      | Sales Order Management & CRM  | ระบบบริหารงานขายและลูกค้าสัมพันธ์| 📋 วางแผน |
| **3** | 10| `3010` | **NexPOS** ⭐       | Commerce      | Point of Sale System          | ระบบจัดการหน้าร้าน (POS)        | 💡 แนะนำ |
| **3** | 11| `3011` | **NexDelivery** ⭐  | Operations    | Last-mile Delivery Tracking   | ระบบตรวจสอบสถานะจัดส่งให้ลูกค้า  | 💡 แนะนำ |
| **3** | 12| `3012` | **NexFinance**      | Finance       | Enterprise Financial ERP      | ระบบบัญชีและการเงินระดับองค์กร   | 📋 วางแผน |
| **3** | 13| `3013` | **NexCost**         | Finance       | Enterprise Cost Optimization  | แพลตฟอร์มบริหารต้นทุน           | 📋 วางแผน |
| **3** | 14| `3014` | **NexTax** ⭐       | Finance       | Corporate Tax & VAT Management| ระบบจัดการภาษีและหัก ณ ที่จ่าย   | 💡 แนะนำ |
| **3** | 15| `3015` | **NexPayroll** ⭐   | Finance       | Payroll & Employee Tax        | ระบบเงินเดือนและประกันสังคม     | 💡 แนะนำ |
| **4** | 16| `3016` | **NexLess**         | Governance    | Paperless & Document Mgt.     | ระบบจัดการเอกสารดิจิทัล         | 📋 วางแผน |
| **4** | 17| `3017` | **NexApprove** ⭐   | Governance    | E-Approval Workflow Engine    | ระบบ Workflow อนุมัติเอกสาร      | 💡 แนะนำ |
| **4** | 18| `3018` | **NexAudit** ⭐     | Governance    | Audit & PDPA Compliance       | ระบบบันทึก Audit Log และ PDPA  | 💡 แนะนำ |
| **4** | 19| `3019` | **NexMaint** ⭐     | Operations    | Preventive Maintenance System | ระบบบริหารงานซ่อมบำรุง          | 💡 แนะนำ |
| **4** | 20| `3020` | **NexLearn** ⭐     | People        | Learning Management System    | ระบบจัดการฝึกอบรม (LMS)        | 💡 แนะนำ |
| **4** | 21| `3021` | **NexConnect** ⭐   | Commerce      | API Integration & External Hub| ศูนย์เชื่อมต่อ API และบูรณาการ   | 💡 แนะนำ |
| **4** | 22| `3022` | **NexBI**           | Analytics     | Executive Dashboard & Analytics| ศูนย์วิเคราะห์ข้อมูลผู้บริหาร (BI)  | 📋 วางแผน |

---

## 3. 📦 Core Platform (ส่วนกลาง)

> [!IMPORTANT]
> ทีม **Platform Core** ต้องพัฒนาส่วนนี้ก่อน ก่อนที่ App Teams จะเริ่มพัฒนาแอปแต่ละตัวได้

### 3.1 packages/ui — Design System & Component Library

**รับผิดชอบ:** Platform Team  
**Tech Stack:** React, TypeScript, CSS Variables

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── Button/         — Primary, Secondary, Danger, Icon
│   │   ├── Card/           — Card, CardHeader, CardBody, CardFooter
│   │   ├── DataTable/      — Sort, Pagination, Filter, Export
│   │   ├── Modal/          — Confirm, Form, Alert
│   │   ├── Form/           — Input, Select, Checkbox, DatePicker
│   │   ├── Badge/          — Status, Count
│   │   ├── Chart/          — Line, Bar, Donut (wrapper ของ Recharts)
│   │   ├── KpiCard/        — Summary card บน dashboard
│   │   └── EmptyState/     — No data placeholder
│   │
│   ├── layouts/
│   │   ├── AppShell/       — Sidebar + Topbar shell
│   │   ├── CrudLayout/     — Template 1, 2, 3 (มาจาก NexSpeed)
│   │   └── DashboardLayout/
│   │
│   └── themes/
│       ├── tokens.css      — CSS Variables (colors, spacing, radius)
│       ├── globals.css     — Base reset + typography
│       └── dark.css        — Dark theme overrides
```

**Deliverables:**

- [ ] Component Library พร้อม Storybook
- [ ] Design Token documentation
- [ ] CRUD Template 3 แบบ (พร้อมใช้งาน)
- [ ] Dark theme (สีหลัก: #1a2130 / #2a3447 / #1e293b)

---

### 3.2 packages/auth — Authentication & Authorization

**รับผิดชอบ:** Platform Team  
**Tech Stack:** NextAuth.js / JWT, RBAC

```
packages/auth/
├── src/
│   ├── AuthProvider.tsx    — Context Provider
│   ├── useAuth.ts          — Hook: user, token, login, logout
│   ├── withAuth.tsx        — HOC: Route Guard
│   ├── permissions.ts      — RBAC permission matrix
│   └── types.ts            — User, Role, Permission interfaces
```

**Features:**

- Single Sign-On (SSO) ข้ามทุกแอป
- Role-Based Access Control (RBAC) ต่อ แอป / หน้า / action
- JWT Auto-refresh
- Session timeout

---

### 3.3 packages/api-client — HTTP Layer

**รับผิดชอบ:** Platform Team  
**Tech Stack:** Axios, React Query

```
packages/api-client/
├── src/
│   ├── client.ts           — Axios instance + interceptors
│   ├── hooks.ts            — useQuery, useMutation wrappers
│   └── endpoints/
│       ├── auth.ts
│       ├── nex-speed.ts
│       ├── nex-stock.ts
│       └── ...
```

---

### 3.4 packages/types — Shared TypeScript Types

```typescript
// packages/types/src/common.ts
export interface User { id, name, email, role, appAccess[] }
export interface Company { id, name, taxId, address }
export interface ApiResponse<T> { data: T, success, message, pagination }
export interface PaginationMeta { page, limit, total, totalPages }
```

---

### 3.5 services/auth-service — Backend Auth Service

**Tech Stack:** NestJS, PostgreSQL, Redis  
**Endpoints:**

```
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /auth/me
GET  /auth/apps          ← รายการแอปที่ user เข้าถึงได้
```

---

### 3.6 services/gateway — API Gateway

**Tech Stack:** NestJS (หรือ Kong / Nginx)  
**หน้าที่:**

- Route requests ไปยัง microservice ที่ถูกต้อง
- Auth validation ที่ Gateway level
- Rate limiting / logging

---

### 3.7 🧩 Platform Shared Capabilities (ความสามารถกลางของแพลตฟอร์ม)

> [!IMPORTANT]
> ฟีเจอร์เหล่านี้คือ **Core Infrastructure Services** ที่ทุกแอปใน NexOne Platform สามารถเรียกใช้ผ่าน `packages/shared-services` ไม่ต้องพัฒนาซ้ำในแต่ละแอป

---

#### 3.7.1 📸 OCR, Document Scan & Photo Capture

| รายละเอียด     | ค่า                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| **Package**    | `packages/shared-services/ocr`                                                                                |
| **Tech Stack** | Tesseract.js (ฝั่ง client), Google Cloud Vision API (ฝั่ง server)                                             |
| **Mobile SDK** | React Native Camera + ML Kit (Android/iOS)                                                                    |
| **ใช้งานใน**   | NexSpeed (POD รูปถ่าย, สแกนใบขับขี่), NexStock (สแกนสินค้า), NexProduce (QC รูปถ่าย), NexApprove (สแกนเอกสาร) |

**ความสามารถ:**

- 📄 OCR สแกนตัวอักษรจากรูปภาพ / PDF (ใบแจ้งหนี้, ใบส่งของ, บัตรประชาชน, ใบขับขี่)
- 📷 ถ่ายรูปผ่านกล้องมือถือ → อัปโหลดอัตโนมัติ
- 📂 Document Scanner โหมด Auto-crop / Enhancement
- 🏷️ สกัดข้อมูลจากเอกสาร (เช่น ราคา, วันที่, เลขที่)
- 🌏 รองรับภาษาไทย + อังกฤษ

```typescript
// ตัวอย่างการใช้งาน
import { useOCR } from "@nexone/shared-services/ocr";
const { scanDocument, extractText, capturePhoto } = useOCR();
```

---

#### 3.7.2 📍 GPS & Location Services

| รายละเอียด     | ค่า                                                                                             |
| -------------- | ----------------------------------------------------------------------------------------------- |
| **Package**    | `packages/shared-services/location`                                                             |
| **Tech Stack** | Google Maps Platform API, HERE Maps (fallback), Geolocation API                                 |
| **Mobile**     | React Native Geolocation, Background Location                                                   |
| **ใช้งานใน**   | NexSpeed (Fleet Tracking, POD), NexForce (Field Check-in), NexProduce (Delivery), NexSite (Map) |

**ความสามารถ:**

- 🗺️ Live Map แสดงตำแหน่งยานพาหนะ / พนักงาน Real-time
- 📡 Background GPS Tracking (คนขับ, พนักงานภาคสนาม)
- 🔔 Geofence Alert (เมื่อเข้า/ออกพื้นที่กำหนด)
- 🛣️ Route Optimization (Multi-stop, Shortest Path)
- 📍 Reverse Geocoding (พิกัด → ที่อยู่)
- 📏 ระยะทาง / เวลาโดยประมาณ (ETA)

---

#### 3.7.3 📡 Live Streaming

| รายละเอียด     | ค่า                                                                                 |
| -------------- | ----------------------------------------------------------------------------------- |
| **Package**    | `packages/shared-services/streaming`                                                |
| **Tech Stack** | WebRTC, HLS (HTTP Live Streaming), Agora.io / LiveKit                               |
| **ใช้งานใน**   | NexSite (Webinar, Training), NexForce (ประชุม Remote), NexProduce (ตรวจสอบไลน์ผลิต) |

**ความสามารถ:**

- 🎥 Video Conference (1-on-1 / Group)
- 📺 Live Broadcast (1-to-Many) สำหรับ Training, ประกาศ
- 🔴 CCTV / กล้องโรงงาน Streaming (ดูสายการผลิต Real-time)
- 💬 Chat & Reaction ระหว่าง Streaming
- 📼 บันทึกวิดีโอและเก็บใน Cloud Storage

---

#### 3.7.4 💳 Payment Gateway

| รายละเอียด     | ค่า                                                                                  |
| -------------- | ------------------------------------------------------------------------------------ |
| **Package**    | `packages/shared-services/payment`                                                   |
| **Tech Stack** | Omise / 2C2P / Stripe (Multi-provider), Webhook Handler                              |
| **ใช้งานใน**   | NexPOS (ร้านค้า), NexSales (ชำระออนไลน์), NexFinance (ชำระบิล), NexSite (E-commerce) |

**ช่องทางการชำระเงินที่รองรับ:**

| ช่องทาง                | Provider              | Mobile | WebApp | POS |
| ---------------------- | --------------------- | :----: | :----: | :-: |
| **PromptPay QR**       | ธนาคารแห่งประเทศไทย   | ✅     | ✅     | ✅  |
| **บัตรเครดิต / เดบิต** | Omise / 2C2P          | ✅     | ✅     | ✅  |
| **Mobile Banking**     | KBank, SCB, BBL       | ✅     | ✅     | —   |
| **True Money Wallet**  | True Money            | ✅     | ✅     | ✅  |
| **LINE Pay**           | LINE Pay              | ✅     | ✅     | —   |
| **Corporate Payment**  | Bank Transfer, Cheque | —      | ✅     | —   |

```typescript
import { usePayment } from "@nexone/shared-services/payment";
const { createPaymentIntent, verifyPayment, refund } = usePayment();
```

---

#### 3.7.5 💱 Exchange Rate Service

| รายละเอียด     | ค่า                                                                              |
| -------------- | -------------------------------------------------------------------------------- |
| **Package**    | `packages/shared-services/exchange-rate`                                         |
| **Tech Stack** | Open Exchange Rates API / BOT (ธนาคารแห่งประเทศไทย) API                          |
| **Cache**      | Redis (อัปเดตทุก 1 ชั่วโมง)                                                      |
| **ใช้งานใน**   | NexFinance (งบหลายสกุลเงิน), NexSales (ราคา Export), NexProcure (ซื้อต่างประเทศ) |

**ความสามารถ:**

- 🌍 Real-time Exchange Rate 30+ สกุลเงิน (THB, USD, EUR, CNY, JPY, SGD, ฯลฯ)
- 📊 HistoricalRate สำหรับงบการเงินย้อนหลัง
- 🔄 Auto-convert ราคาเมื่อสร้างเอกสาร
- 📈 Rate Trend Chart (7 วัน / 30 วัน)

---

#### 3.7.6 🧾 Slip Verification (ตรวจสอบสลิปโอนเงิน)

| รายละเอียด     | ค่า                                                |
| -------------- | -------------------------------------------------- |
| **Package**    | `packages/shared-services/slip-verify`             |
| **Tech Stack** | PromptPay Slip Verify API (NDID/SCB), OCR Fallback |
| **ใช้งานใน**   | NexPOS, NexFinance, NexSales, NexSite              |

**ความสามารถ:**

- 📱 สแกนสลิปจากรูปภาพ / Screenshot → ยืนยันอัตโนมัติ
- ✅ ตรวจสอบกับฐานข้อมูล PromptPay/BOT จริง (ป้องกัน Fake Slip)
- 🕐 ตรวจสอบ Timestamp ว่าสลิปซ้ำหรือไม่
- 📋 Extract ข้อมูล: จำนวนเงิน, ผู้โอน, เวลา, ธนาคาร

---

#### 3.7.7 🔐 Two-Factor Authentication (2FA)

| รายละเอียด     | ค่า                                                           |
| -------------- | ------------------------------------------------------------- |
| **Package**    | `packages/auth/2fa`                                           |
| **Tech Stack** | TOTP (Google Authenticator), SMS OTP (Twilio/DTAC), Email OTP |
| **ใช้งานใน**   | ทุกแอป (เปิด/ปิดตาม Role และ Policy)                          |

**วิธี 2FA ที่รองรับ:**

| วิธี                                  | ความปลอดภัย     | UX         |
| ------------------------------------- | --------------- | ---------- |
| **TOTP App** (Google Auth, Authy)     | 🔴🔴🔴 สูงสุด   | กลาง       |
| **SMS OTP**                           | 🔴🔴 ปานกลาง    | ง่าย       |
| **Email OTP**                         | 🔴 ต่ำกว่า      | ง่าย       |
| **Biometric** (Face ID / Fingerprint) | 🔴🔴🔴 สูง      | ง่ายมาก    |
| **Hardware Key** (YubiKey)            | 🔴🔴🔴🔴 สูงสุด | Enterprise |

```typescript
import { use2FA } from "@nexone/auth/2fa";
const { enable2FA, verify2FA, disable2FA, generateQR } = use2FA();
```

---

#### 3.7.8 📊 Barcode & QR Code Generator

| รายละเอียด     | ค่า                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| **Package**    | `packages/shared-services/barcode`                                                                   |
| **Tech Stack** | JsBarcode, qrcode.js, ZXing (Scanner)                                                                |
| **ใช้งานใน**   | NexStock (สินค้า), NexSpeed (พัสดุ/ทริป), NexProduce (ชิ้นงาน), NexPOS (สินค้า), NexApprove (เอกสาร) |

**ความสามารถ:**

| ฟีเจอร์               | รายละเอียด                                         |
| --------------------- | -------------------------------------------------- |
| **Generate QR Code**  | Text, URL, JSON, vCard, PromptPay                  |
| **Generate Barcode**  | Code128, Code39, EAN-13, EAN-8, UPC                |
| **Batch Generate**    | สร้าง Barcode/QR จำนวนมากพร้อมกัน (Export PDF/PNG) |
| **Scan QR/Barcode**   | ผ่านกล้องมือถือ หรือ USB Scanner                   |
| **Label Printing**    | พิมพ์ Label กับ Printer ความร้อน (Zebra, DYMO)     |
| **Embed in Document** | ฝัง QR ในใบส่งสินค้า, ใบเสร็จ, Certificate         |

---

#### 3.7.9 ⚙️ Workflow Automation & Approval Engine

| รายละเอียด     | ค่า                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| **Package**    | `packages/shared-services/workflow`                                                                    |
| **Tech Stack** | BullMQ (Queue), State Machine (XState), Node-RED (optional)                                            |
| **ใช้งานใน**   | NexApprove (หลัก), NexProcure (PO Approval), NexFinance (AP/AR), NexForce (Leave), NexSales (Discount) |

**ความสามารถ:**

| ฟีเจอร์                     | รายละเอียด                                      |
| --------------------------- | ----------------------------------------------- |
| **Visual Workflow Builder** | ลากวางสร้าง Flow อนุมัติแบบ Drag & Drop         |
| **Multi-level Approval**    | กำหนด Approver หลายลำดับ (ผู้จัดการ → VP → CEO) |
| **Condition-based Routing** | เส้นทางอนุมัติเปลี่ยนตามมูลค่า / แผนก / ประเภท  |
| **Escalation**              | ถ้าไม่อนุมัติภายใน X วัน → ส่งต่ออัตโนมัติ      |
| **Delegate / Proxy**        | มอบอำนาจอนุมัติแทนช่วงลา                        |
| **Parallel Approval**       | อนุมัติพร้อมกันหลายคน                           |
| **Audit Trail**             | บันทึกทุกการกระทำ: ใคร, เมื่อไร, เหตุผล         |
| **Notification**            | แจ้งเตือนผ่าน In-app, Email, LINE Notify, SMS   |
| **Mobile Approval**         | อนุมัติ/ปฏิเสธผ่านมือถือ พร้อมเหตุผล            |

```typescript
import { WorkflowEngine } from "@nexone/shared-services/workflow";
// กำหนด Flow สำหรับ Purchase Order
const poApprovalFlow = WorkflowEngine.create({
  name: "PO Approval",
  trigger: "purchase_order.created",
  steps: [
    { role: "manager", condition: "amount < 50000" },
    { role: "vp", condition: "amount >= 50000" },
    { role: "ceo", condition: "amount >= 500000" },
  ],
});
```

---

#### 3.7.10 ✍️ Digital Signature

| รายละเอียด     | ค่า                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------ |
| **Package**    | `packages/shared-services/digital-sign`                                                          |
| **Tech Stack** | PDF-lib, DocuSign API / OpenSign (Self-hosted), Canvas Signature                                 |
| **ใช้งานใน**   | NexApprove (สัญญา), NexSpeed (POD), NexForce (สัญญาจ้าง), NexSales (ใบเสนอราคา), NexProcure (PO) |

**ความสามารถ:**

| ฟีเจอร์               | รายละเอียด                                        |
| --------------------- | ------------------------------------------------- |
| **Draw Signature**    | วาดลายเซ็นบนหน้าจอ (มือถือ / Tablet)              |
| **Upload Signature**  | อัปโหลดรูปลายเซ็น                                 |
| **Typed Signature**   | พิมพ์ชื่อเป็นฟอนต์ลายมือ                          |
| **Embed in PDF**      | ฝังลายเซ็นในตำแหน่งที่กำหนด                       |
| **Timestamp & Hash**  | บันทึกเวลา + Hash SHA-256 เพื่อตรวจสอบการแก้ไข    |
| **Certificate-based** | รองรับ PKI Digital Certificate (สำหรับองค์กรใหญ่) |
| **Multi-signer Flow** | ส่งเอกสารให้หลายคนเซ็นตามลำดับ                    |
| **Audit Log**         | IP Address, Device, Timestamp ของทุกการเซ็น       |

---

#### 3.7.11 🤖 AI Assistance

| รายละเอียด     | ค่า                                                                                |
| -------------- | ---------------------------------------------------------------------------------- |
| **Package**    | `packages/shared-services/ai`                                                      |
| **Tech Stack** | Google Gemini API / OpenAI GPT-4o, LangChain, RAG (Retrieval-Augmented Generation) |
| **ใช้งานใน**   | ทุกแอป (บทบาทแตกต่างกันตามบริบท)                                                   |

**ความสามารถต่อแอป:**

| แอป            | AI ช่วยอะไร                                               |
| -------------- | --------------------------------------------------------- |
| **NexSpeed**   | วิเคราะห์เส้นทางที่ดีที่สุด, แจ้งเตือนความเสี่ยงทริป      |
| **NexStock**   | พยากรณ์ความต้องการสินค้า (Demand Forecast), แนะนำ Reorder |
| **NexProduce** | ตรวจจับความผิดปกติในสายการผลิต (Anomaly Detection)        |
| **NexSales**   | แนะนำสินค้า Upsell/Cross-sell, วิเคราะห์โอกาสปิดการขาย    |
| **NexFinance** | ตรวจจับ Fraud, พยากรณ์กระแสเงินสด                         |
| **NexApprove** | สรุปเอกสาร, แนะนำผู้อนุมัติที่เหมาะสม                     |
| **NexForce**   | วิเคราะห์ประสิทธิภาพพนักงาน, แนะนำ Training               |
| **NexBI**      | Natural Language Query ("ยอดขายเดือนที่แล้วเท่าไร?")      |

**Core AI Services:**

| Service                  | รายละเอียด                                            |
| ------------------------ | ----------------------------------------------------- |
| **NexAI Chat**           | AI Assistant ฝังในทุกแอป ถามตอบข้อมูลระบบ             |
| **Document AI**          | สรุปเอกสาร, ดึงข้อมูลสำคัญออกจากสัญญา/ใบแจ้งหนี้      |
| **Smart Search**         | ค้นหาด้วยภาษาธรรมชาติข้ามทุก Module                   |
| **Predictive Analytics** | พยากรณ์ KPI ล่วงหน้า 30/60/90 วัน                     |
| **Auto-categorize**      | จัดหมวดหมู่ธุรกรรม, สินค้า, เอกสาร อัตโนมัติ          |
| **Anomaly Detection**    | แจ้งเตือนพฤติกรรมผิดปกติ (การเงิน, การผลิต, ยานพาหนะ) |
| **Thai NLP**             | ประมวลผลภาษาไทย (ค้นหา, สรุป, แปล)                    |

```typescript
import { NexAI } from "@nexone/shared-services/ai";
const ai = new NexAI({ context: "nexspeed", userId: user.id });
const response = await ai.ask("ทริปไหนมีต้นทุนสูงสุดในเดือนนี้?");
```

---

#### 🗺️ Shared Capabilities — สรุปการนำไปใช้แต่ละแอป

| ความสามารถ             | NexSpeed | NexStock | NexProduce | NexSales | NexFinance | NexPOS | NexApprove | NexForce |
| ---------------------- | :------: | :------: | :--------: | :------: | :--------: | :----: | :--------: | :------: |
| **OCR / Scan**         | ✅       | ✅       | ✅         | ⚡       | ✅         | ⚡     | ✅         | ✅       |
| **GPS**                | ✅       | ⚡       | —          | ⚡       | —          | —      | —          | ✅       |
| **Live Streaming**     | —        | —        | ✅         | ⚡       | —          | —      | —          | ✅       |
| **Payment Gateway**    | ⚡       | —        | —          | ✅       | ✅         | ✅     | —          | —        |
| **Exchange Rate**      | —        | —        | —          | ✅       | ✅         | ⚡     | —          | —        |
| **Slip Verify**        | ⚡       | —        | —          | ✅       | ✅         | ✅     | —          | —        |
| **2FA**                | ✅       | ✅       | ✅         | ✅       | ✅         | ✅     | ✅         | ✅       |
| **QR / Barcode**       | ✅       | ✅       | ✅         | ✅       | ⚡         | ✅     | ✅         | ⚡       |
| **Workflow / Approve** | ⚡       | ✅       | ✅         | ✅       | ✅         | —      | ✅         | ✅       |
| **Digital Sign**       | ✅       | —        | ⚡         | ✅       | ✅         | —      | ✅         | ✅       |
| **AI Assistance**      | ✅       | ✅       | ✅         | ✅       | ✅         | ✅     | ✅         | ✅       |

> **คำอธิบาย:** ✅ = ใช้งานหลัก | ⚡ = ใช้งานบางส่วน | — = ไม่ใช้

---

## 4. 📱 App Specifications (ทีละแอป)

---

### 4.1 🚚 NexSpeed — Transportation Management System (TMS)

**สถานะ:** ✅ Phase 1 (Flagship App) | **ทีม:** Operations Team | **Port:** 3000  
**Database:** PostgreSQL | **Stack:** React + NestJS + PostgreSQL

> **คำอธิบายสัญลักษณ์:** ✅ = รองรับ | — = ไม่รองรับ / ไม่จำเป็น | ⚡ = รองรับบางส่วน | 🔴 = ต้องพัฒนาเพิ่ม

---

#### 🚛 กลุ่ม Fleet Management (บริหารยานพาหนะ)

| Module                       | Feature                                     | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| ---------------------------- | ------------------------------------------- | :-------: | :-------: | :----: |
| **Fleet Management**         | ทะเบียนรถบริษัท, ประเภทรถ, สถานะ, ประกัน    | —         | ✅        | —      |
| **Subcontractor Management** | รถร่วม, เจ้าของรถ, สัญญา, ราคา              | —         | ✅        | —      |
| **Vehicle Inspection**       | ตรวจสภาพรถก่อน-หลังวิ่ง, ถ่ายรูป, เช็คลิสต์ | ✅        | ✅        | —      |
| **Parking / Bay Management** | คานจอดรถ, สถานะว่าง/ใช้งาน, จัดตำแหน่ง      | —         | ✅        | —      |
| **Document Expiry Alert**    | แจ้งเตือน พ.ร.บ., ประกัน, ทะเบียนหมดอายุ    | ✅        | ✅        | —      |
| **Vehicle KPI**              | ประสิทธิภาพรถ: Idle Time, Utilization Rate  | —         | ✅        | —      |

#### 👨‍✈️ กลุ่ม Driver Management (บริหารพนักงานขับรถ)

| Module                     | Feature                                 | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| -------------------------- | --------------------------------------- | :-------: | :-------: | :----: |
| **Driver Profile**         | ข้อมูลคนขับ, ใบขับขี่, ประวัติ, สังกัด  | ⚡        | ✅        | —      |
| **Driver License Expiry**  | แจ้งเตือนใบขับขี่หมดอายุ                | ✅        | ✅        | —      |
| **Driver KPI / Scorecard** | OTD%, การขับขี่ปลอดภัย, Fuel Efficiency | —         | ✅        | —      |
| **Driver Mobile App** 🔴   | รับงาน, นำทาง, รายงานปัญหา, POD         | ✅        | —         | —      |

#### 📦 กลุ่ม Order & Trip Management (บริหารงานขนส่ง)

| Module                       | Feature                                         | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| ---------------------------- | ----------------------------------------------- | :-------: | :-------: | :----: |
| **Transport Orders**         | คำสั่งขนส่ง, ลูกค้า, ต้นทาง-ปลายทาง, สินค้า     | —         | ✅        | —      |
| **Trip Management**          | สร้างทริป, จับคู่รถ-คนขับ, สถานะทริป            | —         | ✅        | —      |
| **Route Planning** 🔴        | วางแผนเส้นทางอัตโนมัติ, Multi-stop Optimization | —         | ✅        | —      |
| **Dispatch Board**           | Control Tower, มอบหมายงาน, ดูภาพรวม             | —         | ✅        | —      |
| **Queue Management** 🔴      | จัดคิวรถเข้า-ออกคลัง / ท่าเรือ / โรงงาน         | ✅        | ✅        | —      |
| **Trip Cost Calculation** 🔴 | ค่าน้ำมัน + ค่าทางด่วน + ค่าแรงต่อทริป          | —         | ✅        | —      |

#### 📍 กลุ่ม Tracking & Visibility (ติดตามและมองเห็น)

| Module                          | Feature                                         | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| ------------------------------- | ----------------------------------------------- | :-------: | :-------: | :----: |
| **GPS Real-time Tracking** 🔴   | เชื่อม GPS อุปกรณ์ภายนอก แสดง Live Map          | ✅        | ✅        | —      |
| **Transport Trip Tracking**     | ติดตามสถานะทริป Manual Update                   | ✅        | ✅        | —      |
| **Location Master**             | สถานที่รับ-ส่งสินค้า, พิกัด GPS, ประเภท         | —         | ✅        | —      |
| **Alert & Notification**        | แจ้งเตือนล่าช้า, ฉุกเฉิน, เหตุผิดปกติ           | ✅        | ✅        | —      |
| **Customer Tracking Portal** 🔴 | ลูกค้าติดตามสินค้าเองผ่าน Link (เชื่อม NexSite) | ✅        | ✅        | —      |

#### ✅ กลุ่ม Delivery Confirmation (ยืนยันการส่ง)

| Module                         | Feature                                 | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| ------------------------------ | --------------------------------------- | :-------: | :-------: | :----: |
| **POD — Proof of Delivery** 🔴 | ยืนยันส่งสำเร็จ, ลายเซ็นลูกค้า, รูปถ่าย | ✅        | ✅        | —      |
| **E-Delivery Note** 🔴         | ใบส่งสินค้าดิจิทัล แทนกระดาษ            | ✅        | ✅        | —      |
| **Rejection Handling** 🔴      | บันทึกสินค้าถูกปฏิเสธ, รับคืน, เหตุผล   | ✅        | ✅        | —      |

#### 🔧 กลุ่ม Maintenance (ซ่อมบำรุง)

| Module                    | Feature                                | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| ------------------------- | -------------------------------------- | :-------: | :-------: | :----: |
| **Mechanics Management**  | ทะเบียนช่างซ่อมรถยนต์, ความเชี่ยวชาญ   | —         | ✅        | —      |
| **Container Mechanics**   | ช่างซ่อมตู้คอนเทนเนอร์                 | —         | ✅        | —      |
| **Maintenance Records**   | บันทึกการซ่อม, ต้นทุน, ชิ้นส่วนที่ใช้  | ✅        | ✅        | —      |
| **Maintenance Plan**      | แผนซ่อมบำรุงตาม KM / ระยะเวลา          | —         | ✅        | —      |
| **Maintenance Schedule**  | ตารางนัดซ่อม, แจ้งเตือนล่วงหน้า        | ✅        | ✅        | —      |
| **Parts Shops (Vendors)** | ร้านอะไหล่, ผู้ขาย → เชื่อม NexProcure | —         | ✅        | —      |

#### 🛢️ กลุ่ม Stock Management (สต็อกเฉพาะ TMS)

| Module               | Feature                                 | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| -------------------- | --------------------------------------- | :-------: | :-------: | :----: |
| **Stock Parts**      | สต็อกอะไหล่เฉพาะรถ, เบิก-รับ, แจ้งเตือน | ✅        | ✅        | —      |
| **Stock Oil / Fuel** | สต็อกน้ำมันและของเหลว, บันทึกการเติม    | ✅        | ✅        | —      |
| **Storage Location** | สถานที่เก็บอะไหล่, คลังย่อย             | —         | ✅        | —      |

#### 💰 กลุ่ม Finance & Billing (การเงิน)

| Module                         | Feature                                     | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| ------------------------------ | ------------------------------------------- | :-------: | :-------: | :----: |
| **Finance & Billing**          | วางบิลลูกค้า, รับชำระ, สถานะ                | —         | ✅        | —      |
| **Invoice Auto-generation** 🔴 | ออกใบแจ้งหนี้อัตโนมัติหลัง POD สำเร็จ       | —         | ✅        | —      |
| **Trip Cost Analysis** 🔴      | ต้นทุนต่อทริป, กำไรต่อ Order                | —         | ✅        | —      |
| **Customer Contract** 🔴       | ราคาตามสัญญา, SLA, เงื่อนไขพิเศษ → NexSales | —         | ✅        | —      |

#### 📊 กลุ่ม Analytics & Reporting (วิเคราะห์)

| Module                   | Feature                                | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| ------------------------ | -------------------------------------- | :-------: | :-------: | :----: |
| **Operations Dashboard** | Control Tower, KPI, สถานะรวม Real-time | ⚡        | ✅        | —      |
| **Analytics & Reports**  | รายงานการขนส่ง, OTD, ประสิทธิภาพ       | —         | ✅        | —      |
| **Carbon Footprint** 🔴  | คำนวณ CO₂ ต่อทริป รองรับ ESG Reporting | —         | ✅        | —      |

#### ⚙️ กลุ่ม Basic Data & Settings (ข้อมูลพื้นฐาน)

| Module                         | Feature                                | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| ------------------------------ | -------------------------------------- | :-------: | :-------: | :----: |
| **Vehicle Brands / Types**     | ยี่ห้อรถ, ประเภทรถ                     | —         | ✅        | —      |
| **Mechanic Types / Expertise** | ประเภทช่าง, ความเชี่ยวชาญ              | —         | ✅        | —      |
| **Part Groups / Categories**   | กลุ่มอะไหล่, หมวดหมู่                  | —         | ✅        | —      |
| **Storage / Parking Types**    | ประเภทคลัง, ประเภทที่จอดรถ             | —         | ✅        | —      |
| **Units / Liquid Types**       | หน่วยนับ, ประเภทของเหลว                | —         | ✅        | —      |
| **Province / Zones**           | จังหวัด, โซนพื้นที่ขนส่ง               | —         | ✅        | —      |
| **System Settings**            | ตั้งค่าระบบ, User Permission, API Keys | —         | ✅        | —      |

---

> [!WARNING]
>
> ### ⚠️ โมดูลที่ซ้ำซ้อนกับแอปอื่นใน NexOne Platform (ระยะยาว)
>
> | โมดูลใน NexSpeed         | ซ้ำกับแอปใด         | แนวทาง                                             |
> | ------------------------ | ------------------- | -------------------------------------------------- |
> | **การเงิน & วางบิล**     | NexFinance          | เชื่อม API ระยะยาว ปัจจุบันเก็บไว้ใน NexSpeed ก่อน |
> | **Analytics & Reports**  | NexBI               | NexBI pull ข้อมูลจาก NexSpeed แทน                  |
> | **ร้านอะไหล่ (Vendors)** | NexProcure          | เชื่อม Vendor Master จาก NexProcure                |
> | **พนักงาน / Driver**     | NexForce            | NexForce เป็น Master พนักงาน, NexSpeed ดึงอ้างอิง  |
> | **Maintenance Plan**     | NexAsset / NexMaint | Migrate เมื่อ NexAsset พร้อม (Phase 3+)            |

> [!NOTE]
>
> ### 🔴 ฟีเจอร์ที่ต้องพัฒนาเพิ่มใน NexSpeed (Priority)
>
> | ฟีเจอร์                       | เหตุผล                                       | Priority |
> | ----------------------------- | -------------------------------------------- | :------: |
> | **Route Optimization**        | หัวใจ TMS สมัยใหม่ ลดต้นทุนน้ำมัน 15-25%     |  🔴 สูง  |
> | **POD — Proof of Delivery**   | สร้างความเชื่อมั่น, ลด Dispute กับลูกค้า     |  🔴 สูง  |
> | **GPS Real-time Integration** | Live Map ดูตำแหน่งรถได้จริง, Geofence Alert  |  🔴 สูง  |
> | **Driver Mobile App**         | คนขับรับงาน/ส่งงานผ่านมือถือ ลด Manual       |  🔴 สูง  |
> | **Invoice Auto-generation**   | ส่งแล้วออกบิลอัตโนมัติ ลด Admin 80%          | 🟡 กลาง  |
> | **Trip Cost Analysis**        | วิเคราะห์กำไรต่อทริป ตัดสินใจธุรกิจได้ดีขึ้น | 🟡 กลาง  |
> | **Customer Tracking Portal**  | Self-service ลูกค้าไม่ต้องโทรถาม             | 🟡 กลาง  |
> | **Queue Management**          | ลดเวลารอหน้าคลัง / ท่าเรือ                   | 🟡 กลาง  |
> | **Carbon Footprint Report**   | รองรับ ESG สำหรับลูกค้าองค์กร                |  🟢 ต่ำ  |
> | **Customer Contract & SLA**   | เชื่อมกับ NexSales, ราคาพิเศษต่อลูกค้า       |  🟢 ต่ำ  |

### 4.2 📦 NexStock — Warehouse Management System (WMS)

**สถานะ:** 📋 Planned | **ทีม:** Operations Team | **Port:** 3001

| Module                  | Feature                                                        | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| ----------------------- | -------------------------------------------------------------- | :-------: | :-------: | :----: |
| **Inventory Control**   | รับสินค้าเข้า (GR), เบิกสินค้าออก (GI), โอนย้ายระหว่าง Zone    | ✅        | ✅        | —      |
| **Location Management** | Rack / Zone / Bin / Shelf พร้อมผังแผนที่คลัง                   | —         | ✅        | —      |
| **Barcode / QR Scan**   | สแกนรับ-จ่ายสินค้าผ่านกล้องมือถือ / Scanner                    | ✅        | ⚡        | ✅     |
| **Stock Movement**      | บันทึกทุกความเคลื่อนไหว พร้อม Audit Trail                      | —         | ✅        | —      |
| **Stock Count**         | นับสต็อก Cycle Count / Full Count พร้อมปรับยอด                 | ✅        | ✅        | —      |
| **FIFO / FEFO**         | จัดการ Lot, Batch, Expiry Date                                 | —         | ✅        | —      |
| **Low Stock Alert**     | แจ้งเตือนเมื่อต่ำกว่า Min Stock / Reorder Point                | ✅        | ✅        | —      |
| **Stock Report**        | ยอดคงเหลือ, Aging, การเคลื่อนไหว, มูลค่าสต็อก                  | —         | ✅        | —      |
| **Return Management**   | รับคืนสินค้า, แยก Good / Damage / Quarantine                   | ✅        | ✅        | ⚡     |
| **Picking & Packing**   | หยิบสินค้าตาม Order, จัดกล่อง, พิมพ์ Label                     | ✅        | ✅        | —      |
| **Integration**         | NexProcure (PO→GR), NexSales (SO→Picking), NexFinance (มูลค่า) | —         | ✅        | —      |

---

### 4.3 📄 NexLess — Paperless & Document Management

**สถานะ:** 📋 Planned | **ทีม:** Governance Team | **Port:** 3002

| Module                 | Feature                                            | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| ---------------------- | -------------------------------------------------- | :-------: | :-------: | :----: |
| **Document Templates** | สร้าง template PDF / Word ด้วย Drag & Drop         | —         | ✅        | —      |
| **e-Form**             | แบบฟอร์มดิจิทัล ส่งข้อมูลเข้าระบบ แทนกระดาษ        | ✅        | ✅        | —      |
| **e-Signature**        | ลายเซ็นดิจิทัล PDPA-compliant, พร้อมวันที่/ตำแหน่ง | ✅        | ✅        | —      |
| **Approval Workflow**  | ส่งอนุมัติ Multi-level, กำหนดผู้อนุมัติแต่ละขั้น   | ✅        | ✅        | —      |
| **Document Archive**   | จัดเก็บ, ค้นหา Full-text, Version Control          | —         | ✅        | —      |
| **Document Sharing**   | แชร์ Link ชั่วคราว, กำหนดสิทธิ์ดู/แก้ไข            | ✅        | ✅        | —      |
| **OCR**                | สแกนเอกสารกระดาษ → แปลงเป็น Digital Text           | ✅        | ✅        | —      |
| **Expiry Tracking**    | ติดตามวันหมดอายุเอกสาร (ใบอนุญาต, สัญญา)           | ⚡        | ✅        | —      |
| **QR Document Link**   | แนบ QR บนเอกสาร เปิดดูเวอร์ชันล่าสุดได้ทันที       | ✅        | ✅        | —      |
| **Integration**        | ดึงข้อมูลจากทุกแอป สร้างเอกสารอัตโนมัติ            | —         | ✅        | —      |

---

### 4.4 🏭 NexProduce — Manufacturing Execution System (MES) + Production Planning

**สถานะ:** 📋 Planned | **ทีม:** Operations Team | **Port:** 3003

> [!IMPORTANT]
> NexProduce ครอบคลุมทั้ง **MES (ควบคุมการผลิต)** และ **APS (วางแผนการผลิต)**
> ไม่จำเป็นต้องมีแอปแยกสำหรับ Production Planning เพราะรวมอยู่ในนี้แล้ว

#### 🗓️ กลุ่ม Production Planning (APS)

| Module                               | Feature                                       | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| ------------------------------------ | --------------------------------------------- | :-------: | :-------: | :----: |
| **Demand Planning**                  | รับ Sales Forecast / Sales Order จาก NexSales | —         | ✅        | —      |
| **MRP**                              | คำนวณความต้องการวัตถุดิบอัตโนมัติ             | —         | ✅        | —      |
| **Master Production Schedule (MPS)** | ตารางการผลิต: ผลิตอะไร, เมื่อไหร่, เท่าไหร่   | —         | ✅        | —      |
| **Capacity Planning**                | ตรวจสอบกำลังการผลิตและ Bottleneck             | —         | ✅        | —      |
| **Production Calendar**              | ปฏิทินการผลิต, วันหยุด, Shift                 | ⚡        | ✅        | —      |
| **Gantt Chart Scheduling**           | จัดลำดับงานผลิตบน Gantt Chart                 | —         | ✅        | —      |
| **What-if Simulation**               | จำลองแผนถ้าเปลี่ยนสินค้า / เครื่องจักร        | —         | ✅        | —      |

#### ⚙️ กลุ่ม Manufacturing Execution (MES)

| Module                     | Feature                                                      | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| -------------------------- | ------------------------------------------------------------ | :-------: | :-------: | :----: |
| **Production Order (WO)**  | สร้างใบสั่งงาน, BOM, Routing                                 | —         | ✅        | —      |
| **Work Center Management** | เครื่องจักร, กำลังการผลิต, OEE                               | —         | ✅        | —      |
| **Shop Floor Control**     | บันทึก Start/Stop งาน, เวลาจริง จากหน้างาน                   | ✅        | ✅        | —      |
| **Material Consumption**   | เบิกวัตถุดิบ (Backflush / Manual) ต่อ Lot                    | ✅        | ✅        | —      |
| **Labor Tracking**         | บันทึกชม.แรงงาน, คนงาน ต่อ Job                               | ✅        | ✅        | —      |
| **Quality Control (QC)**   | In-process QC, ตรวจสอบ, Reject, Rework                       | ✅        | ✅        | —      |
| **Lot / Serial Tracking**  | ติดตาม Lot Number ตลอด Supply Chain                          | —         | ✅        | —      |
| **Scrap Management**       | บันทึก Scrap, คำนวณต้นทุนของเสีย                             | —         | ✅        | —      |
| **OEE Dashboard**          | Availability, Performance, Quality Real-time                 | ⚡        | ✅        | —      |
| **Integration**            | NexStock (เบิกวัตถุดิบ), NexCost (ต้นทุน), NexSales (ส่งของ) | —         | ✅        | —      |

---

### 4.5 💼 NexSales — CRM & Sales Management

**สถานะ:** 📋 Planned | **ทีม:** Commerce Team | **Port:** 3004

| Module                   | Feature                                   | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| ------------------------ | ----------------------------------------- | :-------: | :-------: | :----: |
| **Lead Management**      | บันทึก Lead, แหล่งที่มา, คะแนน Lead Score | ✅        | ✅        | —      |
| **Opportunity Pipeline** | Kanban ขั้นตอนขาย, Win / Loss Reason      | ✅        | ✅        | —      |
| **Customer Management**  | ข้อมูลลูกค้า, Contact, History, เครดิต    | ⚡        | ✅        | ⚡     |
| **Quotation**            | ใบเสนอราคา, อนุมัติ, ส่ง Email อัตโนมัติ  | ✅        | ✅        | —      |
| **Sales Order**          | ยืนยันคำสั่งซื้อ, Dispatch ไป NexStock    | —         | ✅        | ⚡     |
| **Customer Contract**    | สัญญาซื้อขาย, ราคาพิเศษ, Credit Limit     | —         | ✅        | —      |
| **Price List**           | ราคาตามลูกค้า / ปริมาณ / วันที่           | —         | ✅        | ✅     |
| **Commission**           | คำนวณค่าคอม, Sales Target vs Actual       | —         | ✅        | —      |
| **Activity Log**         | บันทึกการโทร, นัดหมาย, Email, Visit       | ✅        | ✅        | —      |
| **Sales Report**         | ยอดขาย, Target, Forecast, Win Rate        | ⚡        | ✅        | —      |
| **Loyalty / Points**     | สะสมแต้ม, Redeem, Tier Member             | ⚡        | ✅        | ✅     |

---

### 4.6 🛒 NexProcure — Procurement Management

**สถานะ:** 📋 Planned | **ทีม:** Commerce Team | **Port:** 3005

| Module                    | Feature                                         | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| ------------------------- | ----------------------------------------------- | :-------: | :-------: | :----: |
| **Purchase Request (PR)** | ขอซื้อ, กำหนดผู้อนุมัติ, เหตุผล                 | ✅        | ✅        | —      |
| **Vendor Management**     | ข้อมูลผู้ขาย, ประเมินผล, Blacklist              | —         | ✅        | —      |
| **RFQ / Quotation**       | ขอราคาจาก Vendor หลายราย, เปรียบเทียบ           | —         | ✅        | —      |
| **Purchase Order (PO)**   | ออกใบสั่งซื้อ, ติดตาม Delivery                  | ⚡        | ✅        | —      |
| **Goods Receipt (GR)**    | รับสินค้า → ส่งข้อมูล NexStock อัตโนมัติ        | ✅        | ✅        | —      |
| **AP Invoice**            | ใบแจ้งหนี้ผู้ขาย, 3-way Matching (PO+GR+INV)    | —         | ✅        | —      |
| **Vendor Performance**    | ประเมิน OTD, คุณภาพ, ราคา                       | —         | ✅        | —      |
| **Contract Management**   | สัญญาผู้ขาย, วันหมดอายุ, แจ้งเตือน              | —         | ✅        | —      |
| **Spend Analysis**        | ค่าใช้จ่ายตาม Category / Vendor / Month         | —         | ✅        | —      |
| **Integration**           | NexStock (GR), NexFinance (AP), NexApprove (PO) | —         | ✅        | —      |

---

### 4.7 💰 NexFinance — Financial Accounting (ERP)

**สถานะ:** 📋 Planned | **ทีม:** Finance Team | **Port:** 3006

| Module                       | Feature                                          | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| ---------------------------- | ------------------------------------------------ | :-------: | :-------: | :----: |
| **General Ledger (GL)**      | บัญชีแยกประเภท, Chart of Accounts, Journal Entry | —         | ✅        | —      |
| **Accounts Receivable (AR)** | ลูกหนี้, วางบิล, รับชำระ, ติดตามหนี้             | ⚡        | ✅        | —      |
| **Accounts Payable (AP)**    | เจ้าหนี้, จ่ายชำระ, กำหนดวันชำระ                 | —         | ✅        | —      |
| **Bank Reconciliation**      | กระทบยอดธนาคาร, Import Statement                 | —         | ✅        | —      |
| **Cash Flow**                | ประมาณการรับ-จ่าย, วางแผนสภาพคล่อง               | ⚡        | ✅        | —      |
| **Fixed Asset**              | ทรัพย์สินถาวร, คิดค่าเสื่อมราคา                  | —         | ✅        | —      |
| **Financial Report**         | งบ P&L, งบดุล (BS), Cash Flow Statement          | —         | ✅        | —      |
| **VAT Report**               | สรุป ภ.พ.30, Output/Input VAT                    | —         | ✅        | ✅     |
| **BI Integration**           | ส่งข้อมูลไป NexBI แบบ Real-time                  | —         | ✅        | —      |

---

### 4.8 📊 NexCost — Cost Management

**สถานะ:** 📋 Planned | **ทีม:** Finance Team | **Port:** 3007

| Module                | Feature                                         | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| --------------------- | ----------------------------------------------- | :-------: | :-------: | :----: |
| **Cost Center**       | ศูนย์ต้นทุนแต่ละแผนก / โปรเจค / สาขา            | —         | ✅        | —      |
| **Budget Planning**   | ตั้งงบประมาณ, อนุมัติ, ติดตาม vs Actual         | —         | ✅        | —      |
| **Standard Cost**     | ต้นทุนมาตรฐาน (Raw Material + Labor + Overhead) | —         | ✅        | —      |
| **Actual Cost**       | ต้นทุนจริงหลังผลิต / ส่งงาน                     | —         | ✅        | —      |
| **Job Costing**       | ต้นทุนต่อ Job / Shipment / Order                | —         | ✅        | —      |
| **Variance Analysis** | วิเคราะห์ส่วนต่าง Standard vs Actual            | —         | ✅        | —      |
| **Profitability**     | กำไรต่อลูกค้า / สินค้า / สาขา / ทริป            | ⚡        | ✅        | —      |

---

### 4.9 👥 NexForce — Human Resource Management (HRM)

**สถานะ:** 📋 Planned | **ทีม:** People Team | **Port:** 3008

| Module                     | Feature                                     | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| -------------------------- | ------------------------------------------- | :-------: | :-------: | :----: |
| **Employee Profile**       | ข้อมูลพนักงาน, สัญญา, เอกสาร, ประวัติ       | ⚡        | ✅        | —      |
| **Org Chart**              | โครงสร้างองค์กร, สายการบังคับบัญชา          | —         | ✅        | —      |
| **Attendance**             | บันทึกเวลาเข้า-ออก (GPS / QR / Face ID), OT | ✅        | ✅        | ⚡     |
| **Leave Management**       | ยื่นลา, อนุมัติ, โควต้า, ปฏิทินทีม          | ✅        | ✅        | —      |
| **Shift Management**       | กำหนดกะ, สลับกะ, กะฉุกเฉิน                  | —         | ✅        | —      |
| **Payroll** ⚠️             | เชื่อมต่อ NexPayroll (ไม่ซ้ำซ้อน)           | —         | ✅        | —      |
| **Performance Evaluation** | ตั้ง KPI, ประเมิน, 360 Degree Feedback      | ⚡        | ✅        | —      |
| **Field Force Tracking**   | ติดตาม GPS ทีมภาคสนาม Real-time             | ✅        | ✅        | —      |
| **Training & Cert**        | บันทึกการอบรม, วันหมดอายุ Cert              | ⚡        | ✅        | —      |
| **Document Expiry**        | แจ้งเตือนเอกสารหมดอายุ (ใบขับขี่, วีซ่า)    | ✅        | ✅        | —      |
| **Integration**            | NexPayroll, NexSpeed (Driver), NexLess      | —         | ✅        | —      |

---

### 4.10 🌐 NexSite — Corporate Website & Customer Portal

**สถานะ:** 📋 Planned | **ทีม:** Platform Team | **Port:** 3009

| Module              | Feature                                    | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| ------------------- | ------------------------------------------ | :-------: | :-------: | :----: |
| **Landing Page**    | หน้าบริษัท, บริการ, โปรไฟล์ทีม, SEO        | ✅        | ✅        | —      |
| **Customer Portal** | ลูกค้า Login, Track Shipment/Order/Invoice | ✅        | ✅        | —      |
| **Tracking Link**   | Link สาธารณะติดตามสินค้าโดยไม่ต้อง Login   | ✅        | ✅        | —      |
| **Blog / News**     | ข่าวสาร, บทความ, SEO-ready                 | ✅        | ✅        | —      |
| **Contact Form**    | ติดต่อ → สร้าง Lead ใน NexSales อัตโนมัติ  | ✅        | ✅        | —      |
| **Careers Page**    | ประกาศงาน, รับสมัคร → NexForce             | ✅        | ✅        | —      |
| **Multi-language**  | รองรับภาษาไทย / อังกฤษ / เพิ่มได้          | ✅        | ✅        | —      |
| **CMS**             | แก้ไขเนื้อหาได้เองโดยไม่ต้องเขียนโค้ด      | —         | ✅        | —      |

---

### 4.11 📈 NexBI — Business Intelligence & Analytics

**สถานะ:** 📋 Planned (พัฒนาหลังสุด) | **ทีม:** Platform Team | **Port:** 3010

| Module                    | Feature                                | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| ------------------------- | -------------------------------------- | :-------: | :-------: | :----: |
| **Executive Dashboard**   | KPI รวมทุกแอป แบบ Real-time            | ✅        | ✅        | —      |
| **Custom Report Builder** | Drag-and-drop สร้างรายงานเอง           | —         | ✅        | —      |
| **Data Pipeline (ETL)**   | รวบรวมข้อมูลจากทุก Service             | —         | ✅        | —      |
| **Chart Library**         | Line, Bar, Donut, Heatmap, Sankey, Map | ⚡        | ✅        | —      |
| **Drill-down**            | คลิกลงรายละเอียดได้ทุก Chart           | ⚡        | ✅        | —      |
| **Scheduled Report**      | ส่งรายงาน Email อัตโนมัติตามรอบ        | —         | ✅        | —      |
| **Alert & Notification**  | แจ้งเตือนเมื่อ KPI ต่ำกว่า Threshold   | ✅        | ✅        | —      |
| **Export**                | PDF, Excel, CSV ทุกรายงาน              | ⚡        | ✅        | —      |

---

### 4.12 🏪 NexPOS — Point of Sale ⭐

**สถานะ:** 💡 แนะนำ Phase 3 | **ทีม:** Commerce Team | **Port:** 3011

| Module               | Feature                                            | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| -------------------- | -------------------------------------------------- | :-------: | :-------: | :----: |
| **POS Interface**    | หน้าขาย Touch-screen, Barcode Scan                 | ✅        | ✅        | ✅     |
| **Cart & Checkout**  | เพิ่ม/ลด/ลบสินค้า, ส่วนลด, คูปอง                   | ✅        | ✅        | ✅     |
| **Payment Method**   | เงินสด, บัตรเครดิต, QR PromptPay, E-Wallet         | ✅        | ✅        | ✅     |
| **Receipt Printing** | ใบเสร็จ Thermal Printer + Digital + Email          | ✅        | ✅        | ✅     |
| **Shift Management** | เปิด-ปิด Shift, นับเงิน, รายงาน Shift              | —         | ✅        | ✅     |
| **Customer Lookup**  | ค้นหาลูกค้า, สะสมแต้ม, Member                      | ✅        | ✅        | ✅     |
| **Offline Mode**     | ทำงานเมื่อ Internet หลุด, Sync ภายหลัง             | ✅        | —         | ✅     |
| **Return / Refund**  | รับคืนสินค้า, คืนเงิน / Credit Note                | —         | ✅        | ✅     |
| **Daily Summary**    | รายงานยอดขายรายวัน / Shift                         | —         | ✅        | ✅     |
| **Multi-Branch**     | ควบคุมหลายสาขาจากศูนย์กลาง                         | —         | ✅        | —      |
| **Integration**      | NexStock (ตัดสต็อก), NexFinance (รายได้), NexSales | —         | ✅        | ✅     |

---

### 4.13 💵 NexPayroll — Payroll & Statutory Filing ⭐

**สถานะ:** 💡 แนะนำ Phase 3 | **ทีม:** Finance Team | **Port:** 3012

| Module                  | Feature                                    | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| ----------------------- | ------------------------------------------ | :-------: | :-------: | :----: |
| **Payroll Calculation** | คำนวณเงินเดือน, OT, เบี้ยเลี้ยง, หักลบ     | —         | ✅        | —      |
| **Thai Income Tax**     | คำนวณภาษีบุคคลธรรมดา Progressive Rate      | —         | ✅        | —      |
| **Social Security**     | คำนวณ SSO, นำส่งสรรพากรอัตโนมัติ           | —         | ✅        | —      |
| **Provident Fund**      | กองทุนสำรองเลี้ยงชีพ                       | —         | ✅        | —      |
| **Payslip**             | สลิปเงินเดือน PDF ส่งอีเมล / แจ้งมือถือ    | ✅        | ✅        | —      |
| **Bank Transfer File**  | ไฟล์โอนเงินธนาคาร (KBank, SCB, BAY Format) | —         | ✅        | —      |
| **PND1 / PND1ก**        | ยื่นภาษีหัก ณ ที่จ่ายรายเดือน / รายปี      | —         | ✅        | —      |
| **Year-end 50 ทวิ**     | สรุปรายได้ประจำปี พิมพ์/ส่งผู้เสียภาษี     | ✅        | ✅        | —      |

---

### 4.14 🏗️ NexAsset — Asset Management ⭐

**สถานะ:** 💡 แนะนำ Phase 3 | **ทีม:** Finance Team | **Port:** 3013

| Module                   | Feature                                                      | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| ------------------------ | ------------------------------------------------------------ | :-------: | :-------: | :----: |
| **Asset Registry**       | ทะเบียนสินทรัพย์, Serial No, QR Code                         | —         | ✅        | —      |
| **Asset Tagging**        | ติด QR/Barcode ทุกชิ้น สแกนตรวจสอบ                           | ✅        | ✅        | —      |
| **Depreciation**         | คิดค่าเสื่อมราคา Straight-line / Declining Balance           | —         | ✅        | —      |
| **Asset Assignment**     | มอบหมายสินทรัพย์ให้พนักงาน / แผนก                            | —         | ✅        | —      |
| **Asset Transfer**       | ย้ายสินทรัพย์ระหว่างสาขา / แผนก                              | ✅        | ✅        | —      |
| **Maintenance Schedule** | กำหนด PM, แจ้งเตือน, บันทึกซ่อม                              | ✅        | ✅        | —      |
| **Asset Inspection**     | ตรวจสภาพสินทรัพย์ สแกน QR + ถ่ายรูป                          | ✅        | ✅        | —      |
| **Disposal**             | จำหน่าย / ตัดออก พร้อมบันทึกบัญชี                            | —         | ✅        | —      |
| **Asset Report**         | รายการสินทรัพย์, มูลค่าสุทธิ, ค่าเสื่อมสะสม                  | ⚡        | ✅        | —      |
| **Integration**          | NexFinance (บัญชี), NexMaint (ซ่อม), NexForce (ผู้รับผิดชอบ) | —         | ✅        | —      |

---

### 4.15 ✅ NexApprove — Workflow & E-Approval ⭐

**สถานะ:** 💡 แนะนำ Phase 3 | **ทีม:** Governance Team | **Port:** 3014

| Module                   | Feature                                           | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| ------------------------ | ------------------------------------------------- | :-------: | :-------: | :----: |
| **Workflow Designer**    | ออกแบบ No-code Drag & Drop ขั้นตอนอนุมัติ         | —         | ✅        | —      |
| **Request Types**        | ใบลา, ใบเบิก, ใบสั่งซื้อ, ค่าใช้จ่าย, OT          | ✅        | ✅        | —      |
| **Multi-level Approval** | กำหนดผู้อนุมัติ ≥ 1 คน ต่อขั้น + เงื่อนไข         | ✅        | ✅        | —      |
| **Delegation**           | มอบอำนาจอนุมัติแทนเมื่อลา                         | —         | ✅        | —      |
| **Notification**         | แจ้งเตือน LINE Notify, Email, Push                | ✅        | ✅        | —      |
| **Approval History**     | ดูประวัติการอนุมัติทุก Request                    | ✅        | ✅        | —      |
| **Escalation**           | Auto-escalate เมื่อไม่อนุมัติภายในเวลา            | —         | ✅        | —      |
| **Condition Rules**      | กำหนดเงื่อนไข เช่น วงเงิน > X บาท เพิ่มผู้อนุมัติ | —         | ✅        | —      |
| **Integration**          | รองรับทุกแอป (NexProcure, NexForce, NexFinance)   | —         | ✅        | —      |

---

### 4.16 📑 NexTax — Corporate Tax & VAT Management ⭐

**สถานะ:** 💡 แนะนำ Phase 3 | **ทีม:** Finance Team | **Port:** 3015

| Module                   | Feature                                             | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| ------------------------ | --------------------------------------------------- | :-------: | :-------: | :----: |
| **VAT Management**       | คำนวณสรุปภาษีซื้อ-ภาษีขาย (ภ.พ.30)                  | —         | ✅        | —      |
| **Withholding Tax**      | คำนวณภาษีหัก ณ ที่จ่าย 1%, 3%, 5% (ภ.ง.ด.3, 53)     | —         | ✅        | —      |
| **Corporate Income Tax** | ประมาณการภาษีเงินได้นิติบุคคล (ภ.ง.ด.50, 51)        | —         | ✅        | —      |
| **e-Tax Invoice**        | ออกใบกำกับภาษีอิเล็กทรอนิกส์ส่งกรมสรรพากรเต็มรูปแบบ | —         | ✅        | —      |
| **Document Filing**      | ออกรายงานและเตรียมไฟล์เพื่อ Upload ยื่นสรรพากร      | —         | ✅        | —      |
| **Integration**          | NexFinance (ดึง GL/AP/AR), NexSales, NexPayroll     | —         | ✅        | —      |

---

### 4.17 🔒 NexAudit — Audit Log & PDPA Compliance ⭐

**สถานะ:** 💡 แนะนำ Phase 4 | **ทีม:** Governance Team | **Port:** 3016

| Module                  | Feature                                               | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| ----------------------- | ----------------------------------------------------- | :-------: | :-------: | :----: |
| **Central Audit Trail** | บันทึกประวัติการกระทำของทุกระบบแบบ Centralized        | —         | ✅        | —      |
| **PDPA Consent**        | จัดการ Cookie, Consent Form ของลูกค้าและพนักงาน       | ✅        | ✅        | —      |
| **Data Masking**        | ปิดบังข้อมูลส่วนบุคคลบนระบบและ Report ตามสิทธิ์       | —         | ✅        | —      |
| **Security Alerts**     | แจ้งเตือนเมื่อมีการเข้าถึง Data ผิดปกติหรือเยอะเกินไป | —         | ✅        | —      |
| **Access History**      | ตรวจสอบย้อนหลังว่าใครเข้าดูข้อมูลใดบ้าง               | —         | ✅        | —      |

---

### 4.18 🔌 NexConnect — API Integration Hub ⭐

**สถานะ:** 💡 แนะนำ Phase 4 | **ทีม:** Commerce Team | **Port:** 3017

| Module               | Feature                                      | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| -------------------- | -------------------------------------------- | :-------: | :-------: | :----: |
| **Open API Gateway** | ให้บริการ API แก่ Software ลูกค้าหรือ Vendor | —         | ✅        | —      |
| **Webhook Manager**  | ตั้งค่าส่งข้อมูลออกไปยังระบบภายนอกอัตโนมัติ  | —         | ✅        | —      |
| **Marketplace Sync** | เชื่อมต่อข้อมูล Shopee, Lazada, TikTok Shop  | —         | ✅        | —      |
| **Bank Connect**     | เชื่อมต่อ Bank Statement ของไทย (Direct API) | —         | ✅        | —      |
| **Partner Portal**   | ให้ Partner เข้ามา Register App & API Key    | —         | ✅        | —      |

---

### 4.19 🛵 NexDelivery — Last-mile Delivery Tracking ⭐

**สถานะ:** 💡 แนะนำ Phase 4 | **ทีม:** Operations Team | **Port:** 3018

| Module                     | Feature                                         | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| -------------------------- | ----------------------------------------------- | :-------: | :-------: | :----: |
| **Rider App**              | แอปสำหรับแมสเซนเจอร์รับ/ส่งพัสดุย่อย            | ✅        | —         | —      |
| **Customer Tracking**      | ลิงก์ติดตามพัสดุสำหรับลูกค้ารายย่อย             | ✅        | ✅        | —      |
| **Micro-Routing**          | คำนวณเส้นทางลดเวลาสำหรับมอเตอร์ไซค์/รถกระบะเล็ก | ✅        | ✅        | —      |
| **Cash on Delivery (COD)** | เก็บเงินปลายทางและรวบรวมยอดประจำวัน             | ✅        | ✅        | —      |

---

### 4.20 🔧 NexMaint — Preventive Maintenance System ⭐

**สถานะ:** 💡 แนะนำ Phase 4 | **ทีม:** Operations Team | **Port:** 3019

| Module                       | Feature                                             | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| ---------------------------- | --------------------------------------------------- | :-------: | :-------: | :----: |
| **Maintenance Plan**         | วางแผนบำรุงรักษาเชิงป้องกันตามระยะเวลาหรือการใช้งาน | —         | ✅        | —      |
| **Work Order (Maintenance)** | ใบสั่งซ่อม, เบิกอะไหล่, มอบหมายช่าง                 | ✅        | ✅        | —      |
| **Technician App**           | แอปช่างซ่อมหน้างาน, อัปเดตสถานะ, ถ่ายรูปก่อน-หลัง   | ✅        | —         | —      |
| **IoT Integration**          | วางแผนเชื่อมอุปกรณ์ Sensor ดึงสถานะเครื่องจักร      | —         | ⚡        | —      |

---

### 4.21 🎓 NexLearn — Learning Management System (LMS) ⭐

**สถานะ:**💡 แนะนำ Phase 4 | **ทีม:** People Team | **Port:** 3020

| Module                | Feature                                            | 📱 Mobile | 🖥️ WebApp | 🏪 POS |
| --------------------- | -------------------------------------------------- | :-------: | :-------: | :----: |
| **Course Manager**    | สร้างคอร์สเรียน, อัปโหลด VDO, เอกสารประกอบ         | —         | ✅        | —      |
| **Online Quiz**       | ข้อสอบออนไลน์, ประเมินผลอัตโนมัติ, แจก Certificate | ✅        | ✅        | —      |
| **Employee Training** | กำหนดแผนเรียนของพนักงาน (Onboarding, ปรับตำแหน่ง)  | ✅        | ✅        | —      |
| **Knowledge Base**    | แหล่งรวมคู่มือการใช้ระบบและวินัยองค์กร             | ✅        | ✅        | ⚡     |

---

## 📊 สรุป Platform Support ทุกแอป

> **ตำนาน:** 🔴 = จำเป็นมาก | 🟡 = จำเป็น | 🟢 = บางส่วน | ❌ = ไม่จำเป็น

| แอป             | 📱 Mobile | 🖥️ WebApp | 🏪 POS | หมายเหตุ                           |
| --------------- | :-------: | :-------: | :----: | ---------------------------------- |
| **NexSpeed**    | 🔴        | 🔴        | ❌     | Driver App + Dispatch + GPS        |
| **NexProduce**  | 🔴        | 🔴        | ❌     | Shop Floor + QC หน้างาน            |
| **NexForce**    | 🔴        | 🔴        | 🟢     | ลงเวลา + ขอลา + Field GPS          |
| **NexPOS**      | 🔴        | 🟡        | 🔴     | Tablet = POS Terminal              |
| **NexSite**     | 🔴        | 🔴        | ❌     | ลูกค้าใช้มือถือทุกหน้า             |
| **NexApprove**  | 🔴        | 🔴        | ❌     | อนุมัติได้ทุกที่ทุกเวลา            |
| **NexSales**    | 🟡        | 🔴        | 🟢     | Sales Rep ใช้มือถือภาคสนาม         |
| **NexStock**    | 🟡        | 🔴        | 🟢     | Barcode Scan + Stock Count         |
| **NexProcure**  | 🟡        | 🔴        | ❌     | อนุมัติ PR/PO + รับสินค้า          |
| **NexAsset**    | 🟡        | 🔴        | ❌     | สแกน QR ตรวจสินทรัพย์              |
| **NexLess**     | 🟡        | 🔴        | ❌     | e-Signature + Approval             |
| **NexFinance**  | 🟢        | 🔴        | 🟢     | ดู Dashboard + อนุมัติ             |
| **NexBI**       | 🟢        | 🔴        | ❌     | Executive Dashboard                |
| **NexPayroll**  | 🟢        | 🔴        | ❌     | ดู Payslip เท่านั้น                |
| **NexCost**     | ❌        | 🔴        | ❌     | Desktop เท่านั้น                   |
| **NexTax**      | ❌        | 🔴        | ❌     | ออก e-Tax และคำนวณภาษี             |
| **NexAudit**    | ❌        | 🔴        | ❌     | Compliance และระบบลงบันทึกส่วนกลาง |
| **NexConnect**  | ❌        | 🔴        | ❌     | API Portal ของ Partner             |
| **NexDelivery** | 🔴        | 🔴        | ❌     | Rider App สำหรับ Last-mile         |
| **NexMaint**    | 🔴        | 🔴        | ❌     | Tech App แจ้งซ่อมและรับงานซ่อม     |
| **NexLearn**    | 🔴        | 🔴        | ❌     | เรียน VDO และทำแบบทดสอบ            |

---

## 5. 🐙 GitHub Setup

### 5.1 สร้าง GitHub Organization

```
Organization Name:  nexone-platform   (ปรับชื่อตาม brand ที่ตัดสินใจ)
Visibility:         Private
Plan:               GitHub Team ($4/user/month)
                    → ได้ Branch protection, Code Reviews, Actions 2000 min/mo
```

### 5.2 Repositories ที่ต้องสร้าง

```
nexone-platform/
├── nexone              ← Monorepo หลัก (Turborepo) — apps + packages + services
├── nexone-docs         ← Documentation (Docusaurus)
├── nexone-design       ← Figma exports, brand assets, icons
└── nexone-ops          ← Infrastructure, Docker, Ansible, Nginx configs
```

### 5.3 โครงสร้าง Monorepo (nexone repo)

```
nexone/
├── apps/
│   ├── nex-speed/        (Next.js)  ← ย้ายมาจาก repo ปัจจุบัน
│   ├── nex-stock/        (Next.js)
│   ├── nex-sales/        (Next.js)
│   ├── nex-finance/      (Next.js)
│   ├── nex-force/        (Next.js)
│   ├── nex-less/         (Next.js)
│   ├── nex-cost/         (Next.js)
│   ├── nex-procure/      (Next.js)
│   ├── nex-produce/      (Next.js)
│   ├── nex-site/         (Next.js)
│   └── nex-bi/           (Next.js)
│
├── packages/
│   ├── ui/               ← @nexone/ui — Design System
│   ├── auth/             ← @nexone/auth — SSO
│   ├── api-client/       ← @nexone/api-client
│   ├── types/            ← @nexone/types
│   └── config/           ← @nexone/config
│
├── services/
│   ├── gateway/          ← API Gateway (NestJS)
│   ├── auth-service/     ← JWT, SSO (NestJS)
│   ├── nex-speed-api/    ← TMS API (NestJS + PostgreSQL)
│   └── ...               ← per-app APIs
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### 5.4 ขั้นตอนสร้าง Repository

```bash
# Step 1: สร้าง Monorepo บน local
npx create-turbo@latest nexone --package-manager pnpm
cd nexone

# Step 2: ย้าย nex-speed ที่มีอยู่
cp -r ../nex-speed/frontend apps/nex-speed
cp -r ../nex-speed/backend  services/nex-speed-api

# Step 3: push ขึ้น GitHub
git init
git remote add origin https://github.com/nexone-platform/nexone.git
git add .
git commit -m "chore: initial monorepo setup with nex-speed"
git push -u origin main

# Step 4: ตั้ง branch develop
git checkout -b develop
git push -u origin develop
```

### 5.5 Branch Strategy

```
main          ← Production  🔒 Protected
develop       ← Integration 🔒 Protected (CI must pass)
staging       ← UAT (optional)

Feature Branches:
  feat/[app]-[feature]     → feat/speed-trip-gps
  fix/[app]-[bug]          → fix/stock-inventory-mismatch
  platform/[task]          → platform/ui-component-table
  chore/[task]             → chore/upgrade-nextjs-15
  docs/[task]              → docs/api-reference
```

### 5.6 Branch Protection Rules

```
Branch: main
  ✅ Require pull request (ห้าม push ตรง)
  ✅ Require 1 approving review (Tech Lead อนุมัติ)
  ✅ Require CI status checks to pass
  ✅ Restrict who can push (Tech Lead only)

Branch: develop
  ✅ Require CI status checks to pass
  ✅ Require linear history
```

### 5.7 GitHub Labels

```
app/nex-speed    🚚  app/nex-stock   📦  app/nex-sales    💼
app/nex-finance  💰  app/nex-force   👥  app/nex-bi       📈
platform/ui      🎨  platform/auth   🔐  platform/devops  🛠️
priority/high    🔴  priority/medium 🟡  priority/low     🟢
type/feature     ✨  type/bug        🐛  type/refactor    ♻️
```

---

## 6. 👥 Team Structure & Responsibilities

### Platform Core Team (1-2 คน)

**บทบาท:** Tech Lead / Architect  
**รับผิดชอบ:**

- `packages/ui` — Design System + Component Library
- `packages/auth` — SSO & Permissions
- `services/auth-service` + `services/gateway`
- GitHub setup, CI/CD pipelines, DevOps
- **Code Review ทุก PR ที่ merge เข้า develop/main**
- ออก API contract ให้ App Teams ยึดตาม

---

### Operations Team (2-3 คน)

**Apps:** NexSpeed ✅, NexStock, NexLess, NexProduce  
**งาน:**

- พัฒนา business logic ของแต่ละแอป
- ใช้ components จาก `@nexone/ui` (ห้ามสร้าง component ซ้ำ)
- เขียน API ใน `services/[app]-api/`
- ส่ง PR → develop ทุก sprint

---

### Commerce & Finance Team (2-3 คน)

**Apps:** NexSales, NexProcure, NexFinance, NexCost  
**งาน:**

- พัฒนาระบบ transaction และ workflow
- Integration flow: Sales → Stock → Finance → Cost
- เขียน E2E test สำหรับ business flow สำคัญ

---

### People & Analytics Team (1-2 คน)

**Apps:** NexForce, NexSite, NexBI  
**งาน:**

- NexForce: HR workflows, Payroll
- NexSite: Landing page, Customer Portal
- NexBI: Data pipeline จากทุกแอป, Dashboard

---

## 7. 🔄 Development Phases

### Phase 0 — Foundation (1-2 เดือน)

> [!IMPORTANT]
> ต้องเสร็จก่อน App Team เริ่มทำงาน

- [ ] Setup Monorepo (Turborepo + pnpm)
- [ ] `packages/ui` v1.0 — Component Library พื้นฐาน
- [ ] `packages/auth` — SSO / JWT basic
- [ ] `services/auth-service` — Login endpoint
- [ ] Dark Theme Design Tokens
- [ ] CRUD Layout Template 3 แบบ

### Phase 1 — Operations Core (2-3 เดือน)

- [ ] **NexSpeed** — เสร็จสมบูรณ์ 100%
- [ ] **NexStock** — Inventory + Location + Movement
- [ ] **NexForce** — Employee + Attendance

### Phase 2 — Commerce & Finance (3-4 เดือน)

- [ ] **NexSales** — Lead, Customer, Quotation, Order
- [ ] **NexProcure** — PR, PO, GRN
- [ ] **NexFinance** — GL, AR, AP, Report
- [ ] **NexCost** — Cost Center=, Budget

### Phase 3 — Extended (2-3 เดือน)

- [ ] **NexLess** — Document, e-Signature, Workflow
- [ ] **NexProduce** — Production Order, BOM, QC
- [ ] **NexSite** — Landing Page, Customer Portal

### Phase 4 — Intelligence (2 เดือน)

- [ ] **NexBI** — Unified Dashboard + Report Builder
- [ ] Cross-app integration สมบูรณ์ครบทุกแอป

---

## 8. 🔗 App Integration Map

```
NexSales ──────→ NexProcure  (สั่งซื้อตามยอดขาย)
    ↓                 ↓
NexStock ←────────────┘       (รับ/จ่ายสินค้า)
    ↓
NexProduce                    (ผลิตตามสต๊อก)
    ↓
NexCost ──────→ NexFinance    (ต้นทุน → บัญชี)
    ↓
NexSpeed                      (ขนส่งสินค้าออก)
    ↓
NexForce                      (พนักงานทุกแผนก)
    ↓
NexLess                       (เอกสารทุก transaction)
    ↓
NexBI ← ทุกแอป                (รวม data วิเคราะห์)
```

---

## 9. 📐 Technical Standards

### Frontend

| เรื่อง           | เทคโนโลยี                                               |
| ---------------- | ------------------------------------------------------- |
| Framework        | Next.js 14+ (App Router)                                |
| Language         | TypeScript (strict mode)                                |
| Styling          | Tailwind CSS v4 + CSS Variables                         |
| State Management | Zustand (client) + React Query (server)                 |
| UI Library       | `@nexone/ui` (internal — ห้าม hardcode style)           |
| Dark Theme       | Background `#1a2130`, Card `#2a3447`, Sidebar `#1e293b` |

### Backend

| เรื่อง    | เทคโนโลยี                      |
| --------- | ------------------------------ |
| Framework | NestJS (TypeScript)            |
| Database  | PostgreSQL (แยก schema ต่อแอป) |
| Cache     | Redis                          |
| ORM       | Prisma                         |
| Auth      | JWT + Refresh Token            |

### DevOps / Tooling

| เรื่อง          | เทคโนโลยี                      |
| --------------- | ------------------------------ |
| Monorepo        | Turborepo                      |
| Package Manager | pnpm                           |
| Linting         | ESLint + Prettier              |
| Testing         | Jest (unit) + Playwright (E2E) |
| CI/CD           | GitHub Actions                 |
| Container       | Docker + Docker Compose        |

---

## 10. 🚀 CI/CD Pipeline

```yaml
# .github/workflows/deploy-nex-speed.yml
on:
  push:
    branches: [main]
    paths:
      - "apps/nex-speed/**"
      - "packages/**"

jobs:
  deploy:
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm turbo test --filter=nex-speed
      - run: pnpm turbo build --filter=nex-speed
      - run: docker build -t nexone/nex-speed:latest apps/nex-speed
      - run: docker push nexone/nex-speed:latest
      - name: Deploy to Server
        run: ssh deploy@server "docker-compose pull && docker-compose up -d nex-speed"
```

---

## 11. 📋 Naming Conventions

```
Files & Components:
  PascalCase  → FleetPage.tsx, DataTable.tsx, KpiCard.tsx
  camelCase   → useFleet.ts, useAuth.ts, apiClient.ts
  kebab-case  → /api/fleet-vehicles, nex-speed-api

Database (PostgreSQL):
  snake_case  → table: fleet_vehicles, column: created_at, updated_at

Git Commits (Conventional Commits):
  feat(speed): add real-time GPS trip tracking
  fix(stock): correct inventory count off-by-one
  platform(ui): add KpiCard component to design system
  chore: upgrade Next.js to 14.2
  docs: update API contract for fleet endpoint
```

---

## 12. ✅ Quick Start สำหรับ Dev ใหม่

```bash
# 1. Clone
git clone https://github.com/nexone-platform/nexone.git
cd nexone

# 2. Install (ใช้ pnpm เท่านั้น)
pnpm install

# 3. Setup environment
cp apps/nex-speed/.env.example apps/nex-speed/.env.local
# แก้ไข DATABASE_URL, JWT_SECRET, NEXT_PUBLIC_API_URL

# 4. Start database (Docker)
docker-compose up -d postgres redis

# 5. Run migration
cd services/nex-speed-api && pnpm prisma migrate dev

# 6. Start development (เฉพาะแอปที่ต้องการ)
pnpm turbo dev --filter=nex-speed
pnpm turbo dev --filter=nex-speed-api

# 7. หรือรันทุกอย่างพร้อมกัน
pnpm dev
```

---

_เอกสารจัดทำโดย: Tech Lead / Architect_  
_ปรับปรุงล่าสุด: April 2026 v1.1_  
_Platform: NexOne ERP — Built by Nex Solution Co., Ltd._
