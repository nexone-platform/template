-- ========== SYSTEM APPS ==========
CREATE TABLE IF NOT EXISTS nexspeed.system_apps (
    id              SERIAL PRIMARY KEY,
    app_name        VARCHAR(100) NOT NULL,
    desc_en         VARCHAR(200) NOT NULL,
    desc_th         VARCHAR(200) NOT NULL,
    icon_path       VARCHAR(200) NOT NULL,
    theme_color     VARCHAR(20) NOT NULL,
    status          VARCHAR(20) DEFAULT 'active',
    seq_no          INTEGER NOT NULL DEFAULT 99,
    created_at      TIMESTAMP DEFAULT NOW()
);

INSERT INTO nexspeed.system_apps (app_name, desc_en, desc_th, icon_path, theme_color, seq_no) VALUES
('NexSpeed', 'Transportation Management System (TMS)', 'ระบบบริหารจัดการการขนส่งและโลจิสติกส์', '/apps/nexspeed.svg', '#1D4ED8', 1),
('NexSite', 'Enterprise Website Management', 'ระบบบริหารจัดการเว็บไซต์องค์กร', '/apps/nexsite.svg', '#2563EB', 2),
('NexCost', 'Enterprise Cost Optimization', 'แพลตฟอร์มบริหารและเพิ่มประสิทธิภาพต้นทุน', '/apps/nexcost.svg', '#D97706', 3),
('NexForce', 'Human Resource Management System (HRMS)', 'ระบบบริหารจัดการทรัพยากรบุคคลครบวงจร', '/apps/nexforce.svg', '#7C3AED', 4),
('NexLess', 'Smart Paperless & Document Management', 'ระบบจัดการเอกสารดิจิทัลอัจฉริยะ', '/apps/nexless.svg', '#059669', 5),
('NexStock', 'Inventory Management System', 'ระบบบริหารจัดการสินค้าคงคลัง', '/apps/nexstock.svg', '#EA580C', 6),
('NexSales', 'Sales Order Management & CRM', 'ระบบบริหารงานขายและลูกค้าสัมพันธ์', '/apps/nexsales.svg', '#DC2626', 7),
('NexFinance', 'Enterprise Financial Management', 'ระบบบัญชีและการเงินระดับองค์กร', '/apps/nexfinance.svg', '#CA8A04', 8),
('NexProcure', 'Enterprise Procurement System', 'ระบบบริหารจัดการจัดซื้อจัดจ้าง', '/apps/nexprocure.svg', '#0891B2', 9),
('NexProduce', 'Manufacturing Execution System (MES / MRP)', 'ระบบวางแผนและควบคุมการผลิต', '/apps/nexproduce.svg', '#4F46E5', 10),
('NexBI', 'Executive Dashboard & Data Analytics', 'ระบบศูนย์กลางวิเคราะห์ข้อมูลสำหรับผู้บริหาร', '/apps/nexbi.svg', '#DB2777', 11)
ON CONFLICT DO NOTHING;
