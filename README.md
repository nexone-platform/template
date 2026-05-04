# NexOne ERP — Template

Monorepo Template สำหรับสร้างระบบ ERP/Admin ใหม่บนสถาปัตยกรรม NexOne

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo |
| Frontend | Next.js 16 + React 19 + TailwindCSS v4 |
| Backend | NestJS 10 + TypeORM |
| Database | PostgreSQL |

## โครงสร้าง

```
├── apps/               # Frontend Applications
│   ├── nex-core/       # Admin Console (:3101)
│   ├── nex-force/      # HRM (:3102)
│   ├── nex-speed/      # TMS (:3108)
│   ├── nex-stock/      # WMS (:3103)
│   ├── nex-web/        # Web Portal (:3100)
│   └── nex-site/       # CMS (:3106)
│
├── services/           # Backend APIs
│   ├── nex-core-api/   # Core API - NestJS (:8101)
│   ├── nex-force-api/  # HRM API
│   ├── nex-speed-api/  # TMS API - Go
│   └── nex-site-api/   # CMS API - NestJS
│
├── packages/           # Shared Libraries
│   ├── ui/             # @nexone/ui - Shared Components
│   ├── auth/           # @nexone/auth
│   ├── types/          # @nexone/types
│   ├── api-client/     # @nexone/api-client
│   ├── eslint-config/  # Shared ESLint
│   └── typescript-config/
│
└── database/           # SQL Schema (18 modules)
```

## เริ่มต้นใช้งาน

```bash
# 1. Install dependencies
npm install

# 2. ตั้งค่า Environment
cp services/nex-core-api/.env.example services/nex-core-api/.env
# แก้ไข .env ให้ตรงกับ Database ของคุณ

# 3. รันทั้งหมด
npm run dev

# หรือรันเฉพาะ app
npx turbo dev --filter=nex-core
npx turbo dev --filter=nex-core-api
```

## สร้างระบบใหม่

1. Copy `apps/nex-core` → `apps/my-app`
2. Copy `services/nex-core-api` → `services/my-api`
3. สร้าง database schema ใหม่
4. ลงทะเบียน menus + permissions ใน `nex_core`
5. แก้ `package.json`, `.env`, `page.tsx`

## Port Assignments

| App | Port |
|-----|------|
| nex-web | 3100 |
| nex-core | 3101 |
| nex-force | 3102 |
| nex-stock | 3103 |
| nex-site | 3106 |
| nex-speed | 3108 |
| nex-core-api | 8101 |
