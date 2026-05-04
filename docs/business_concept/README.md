# 📚 NexOne Business Concept Library

**Path:** `docs/business_concept/README.md`
**Last Updated:** April 2026

เอกสารนี้รวมแนวคิดทางธุรกิจและ Flow การทำงานของ NexOne Platform สำหรับทุกกลุ่มธุรกิจ

---

## 📁 โครงสร้างไฟล์

```
docs/business_concept/
│
├── 00_feature_gap_analysis.md     ← วิเคราะห์ Feature ที่ขาด (ทุกธุรกิจ)
│
├── 01_logistics.md                ← ขนส่งและโลจิสติกส์
│   ├── FTL/LTL Trucking
│   ├── Last-Mile Delivery
│   ├── Cold Chain
│   └── Container/Port
│
├── 02_trading.md                  ← ซื้อมาขายไป
│   ├── Wholesale/Distributor
│   ├── Retail Multi-branch
│   ├── E-Commerce/Online
│   └── Import/Export
│
├── 03_manufacturing.md            ← รับจ้างผลิต
│   ├── Make-to-Order/Job Shop
│   ├── OEM/Contract Mfg
│   ├── Tolling/แปรรูป
│   └── Make-to-Stock
│
├── 04_service.md                  ← ธุรกิจบริการ
│   ├── Professional Services
│   ├── After-Sales/Field Service
│   ├── Retainer/รายเดือน
│   └── Hospitality/Beauty
│
├── 05_fnb.md                      ← อาหารและเครื่องดื่ม (F&B)
│   ├── Single Restaurant
│   ├── Chain/Franchise
│   ├── Cloud Kitchen
│   └── Catering
│
├── 06_real_estate.md              ← อสังหาริมทรัพย์
│   ├── Developer/ขายโครงการ
│   ├── Property Management/นิติ
│   ├── Rental/ให้เช่า
│   └── นายหน้า/Agency
│
├── 07_construction.md             ← ก่อสร้าง
│   ├── รับเหมาทั่วไป
│   ├── งานระบบ MEP
│   ├── Subcontractor
│   └── Design & Build
│
└── new_apps/                      ← New Apps ที่นำเสนอ
    ├── nexfield.md                ← Mobile App ภาคสนาม
    ├── nexportal.md               ← Customer Self-Service Portal
    ├── nexcommerce.md             ← E-Commerce Hub
    └── nexiot.md                  ← IoT Sensor Integration
```

---

## 🗺️ แผนที่ NexOne Apps ครบ 22 + 4 ใหม่

### แอปเดิม 22 แอป
| แอป | หมวด | ธุรกิจที่ใช้ |
|---|---|---|
| NexCore | Infrastructure | ทุกธุรกิจ |
| NexForce | HR | ทุกธุรกิจ |
| NexPayroll | HR-Finance | ทุกธุรกิจ |
| NexLearn | HR | ทุกธุรกิจ |
| NexAsset | Operations | Manufacturing, Service, Construction |
| NexMaint | Operations | Manufacturing, Service, Construction, Real Estate |
| NexProduce | Operations | Manufacturing, Construction, Service (Dispatch) |
| NexSales | Commerce | ทุกธุรกิจ |
| NexPOS | Commerce | Retail, F&B, Hospitality |
| NexProcure | Supply Chain | Trading, Manufacturing, Service |
| NexStock | Supply Chain | ทุกธุรกิจ (ยกเว้น Pure Service) |
| NexCost | Finance | Manufacturing, Construction, Service |
| NexFinance | Finance | ทุกธุรกิจ |
| NexTax | Finance | ทุกธุรกิจ |
| NexApprove | Workflow | ทุกธุรกิจ |
| NexSpeed | Logistics | Logistics, Trading, Manufacturing |
| NexDelivery | Logistics | Logistics, E-Commerce |
| NexConnect | Logistics/Commerce | E-Commerce, F&B |
| NexSite | Digital | ทุกธุรกิจ |
| NexLess | Document | ทุกธุรกิจ |
| NexBI | Intelligence | ทุกธุรกิจ |
| NexAudit | Compliance | ทุกธุรกิจ |

### แอปใหม่ 4 แอป (Proposed)
| แอป | หมวด | ธุรกิจที่ใช้ | Priority |
|---|---|---|---|
| **NexField** | Mobile/Field | Service, Logistics, Construction | 🔴 Phase 2 |
| **NexPortal** | Digital/Customer | ทุกธุรกิจ B2B + B2C | 🔴 Phase 2-3 |
| **NexCommerce** | Commerce | Trading, F&B, Manufacturing (DTC) | 🟡 Phase 3 |
| **NexIoT** | Intelligence | Logistics (Cold Chain), Manufacturing, Fleet | 🟡 Phase 4 |

---

## 📊 Matrix: ธุรกิจ × แอปที่จำเป็น

| แอป | Logistics | Trading | Mfg | Service | F&B | Real Estate | Construction |
|---|---|---|---|---|---|---|---|
| NexCore | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| NexForce | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| NexSales | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| NexFinance | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| NexStock | ✅ | ✅ | ✅ | ⚡ | ✅ | — | ✅ |
| NexProcure | ✅ | ✅ | ✅ | ⚡ | ✅ | ⚡ | ✅ |
| NexProduce | — | — | ✅ | ✅ | ⚡ | — | ✅ |
| NexCost | ⚡ | ⚡ | ✅ | ✅ | ⚡ | ✅ | ✅ |
| NexAsset | ✅ | ⚡ | ✅ | ✅ | ⚡ | ✅ | ✅ |
| NexMaint | ✅ | — | ✅ | ✅ | ⚡ | ✅ | ✅ |
| NexPOS | — | ✅ | — | ⚡ | ✅ | — | — |
| NexSpeed | ✅ | ✅ | ✅ | ✅ | — | — | ✅ |
| NexDelivery | ✅ | ✅ | — | — | ✅ | — | — |
| NexConnect | ⚡ | ✅ | — | — | ✅ | — | — |
| NexSite | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| NexBI | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **NexField** | ✅ | — | ✅ | ✅ | — | ✅ | ✅ |
| **NexPortal** | ✅ | ✅ | ✅ | ✅ | ⚡ | ✅ | ✅ |
| **NexCommerce** | — | ✅ | ⚡ | — | ✅ | — | — |
| **NexIoT** | ✅ | — | ✅ | — | — | ✅ | — |

> ✅ = จำเป็นมาก | ⚡ = ขึ้นอยู่กับ sub-type | — = ไม่จำเป็น

---

_NexOne Development Team | Business Concept Library | April 2026_
