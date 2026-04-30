-- ═══════════════════════════════════════════════════════════════
-- Table Header & Pagination Translation Keys
-- Shared keys used across ALL pages (pagination, table controls)
-- ═══════════════════════════════════════════════════════════════

-- Helper: generates INSERT for both en + th for a given page_key
-- We insert for page_key = '_shared' so ALL pages can use them

-- ── Pagination & Table Control (shared across all pages) ──
-- These keys are used by TableHeaderBar and PaginationBar components

-- We need to add these for EACH page_key that uses tables.
-- Using a DO block to insert for all known page_keys at once.

DO $$
DECLARE
    pk TEXT;
    page_keys TEXT[] := ARRAY[
        'departments','designations','leave-type','leave-settings','leave-admin',
        'overtime-type','overtime-request','overtime-admin','overtime',
        'holidays','employees','attendance-admin',
        'tax-type','tax-main','tax-income',
        'training-types','training-trainer','training-lists',
        'termination-type','termination-main',
        'resignation-main','resignation-admin',
        'review','promotion-admin','promotion-views',
        'indicator','appraisal','assets','approve-page',
        'manage-jobs','menu-view','menu-languages',
        'project-type','project-cost','tasks',
        'payslip-report','timesheet-report','registation-report',
        'leave-report','expense-report','attendance-report',
        'user-view','users'
    ];
    shared_keys TEXT[][] := ARRAY[
        ARRAY['Show', 'แสดง'],
        ARRAY['entries', 'รายการ'],
        ARRAY['Showing', 'แสดง'],
        ARRAY['to', 'ถึง'],
        ARRAY['of', 'จาก'],
        ARRAY['Prev', 'ก่อนหน้า'],
        ARRAY['Next', 'ถัดไป'],
        ARRAY['Action', 'การดำเนินการ'],
        ARRAY['Actions', 'การดำเนินการ'],
        ARRAY['Status', 'สถานะ'],
        ARRAY['Search', 'ค้นหา'],
        ARRAY['Clear', 'ล้าง'],
        ARRAY['Add', 'เพิ่ม'],
        ARRAY['Delete', 'ลบ'],
        ARRAY['Cancel', 'ยกเลิก'],
        ARRAY['Submit', 'ส่ง'],
        ARRAY['Saving...', 'กำลังบันทึก...'],
        ARRAY['Dashboard', 'หน้าหลัก'],
        ARRAY['No Data Found', 'ไม่พบข้อมูล'],
        ARRAY['No data found', 'ไม่พบข้อมูล'],
        ARRAY['Are you sure you want to delete?', 'คุณแน่ใจหรือไม่ว่าต้องการลบ?'],
        ARRAY['Success!', 'สำเร็จ!'],
        ARRAY['Error!', 'ข้อผิดพลาด!'],
        ARRAY['OK', 'ตกลง'],
        ARRAY['Close', 'ปิด']
    ];
    kv TEXT[];
BEGIN
    FOREACH pk IN ARRAY page_keys LOOP
        FOREACH kv SLICE 1 IN ARRAY shared_keys LOOP
            -- English
            INSERT INTO "solution-one"."adm-tb-ms-language-translations"
                (language_code, page_key, label_key, label_value, create_date, create_by)
            SELECT 'en', pk, kv[1], kv[1], NOW(), 'system'
            WHERE NOT EXISTS (
                SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations"
                WHERE language_code = 'en' AND page_key = pk AND label_key = kv[1]
            );
            -- Thai
            INSERT INTO "solution-one"."adm-tb-ms-language-translations"
                (language_code, page_key, label_key, label_value, create_date, create_by)
            SELECT 'th', pk, kv[1], kv[2], NOW(), 'system'
            WHERE NOT EXISTS (
                SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations"
                WHERE language_code = 'th' AND page_key = pk AND label_key = kv[1]
            );
        END LOOP;
    END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- Page-specific table header translations
-- ═══════════════════════════════════════════════════════════════

-- ── departments ──
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'departments', 'Department Code', 'รหัสแผนก', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'departments' AND label_key = 'Department Code');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'departments', 'Department Name (TH)', 'ชื่อแผนก (ไทย)', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'departments' AND label_key = 'Department Name (TH)');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'departments', 'Department Name (EN)', 'ชื่อแผนก (อังกฤษ)', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'departments' AND label_key = 'Department Name (EN)');

-- ── designations ──
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'designations', 'Designation Code', 'รหัสตำแหน่ง', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'designations' AND label_key = 'Designation Code');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'designations', 'Department Name (TH)', 'ชื่อแผนก (ไทย)', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'designations' AND label_key = 'Department Name (TH)');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'designations', 'Department Name (EN)', 'ชื่อแผนก (อังกฤษ)', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'designations' AND label_key = 'Department Name (EN)');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'designations', 'Designation Name (TH)', 'ชื่อตำแหน่ง (ไทย)', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'designations' AND label_key = 'Designation Name (TH)');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'designations', 'Designation Name (EN)', 'ชื่อตำแหน่ง (อังกฤษ)', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'designations' AND label_key = 'Designation Name (EN)');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'designations', 'Designation Name', 'ชื่อตำแหน่ง', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'designations' AND label_key = 'Designation Name');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'designations', 'Department', 'แผนก', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'designations' AND label_key = 'Department');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'designations', 'Designation Detail', 'รายละเอียดตำแหน่ง', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'designations' AND label_key = 'Designation Detail');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'designations', 'Designations', 'ตำแหน่ง', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'designations' AND label_key = 'Designations');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'designations', 'Delete Designation', 'ลบตำแหน่ง', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'designations' AND label_key = 'Delete Designation');

-- ── leave-type ──
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'leave-type', 'Leave Type Code', 'รหัสประเภทการลา', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'leave-type' AND label_key = 'Leave Type Code');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'leave-type', 'Leave Type Name (TH)', 'ชื่อประเภทการลา (ไทย)', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'leave-type' AND label_key = 'Leave Type Name (TH)');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'leave-type', 'Leave Type Name (EN)', 'ชื่อประเภทการลา (อังกฤษ)', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'leave-type' AND label_key = 'Leave Type Name (EN)');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'leave-type', 'Leave Type', 'ประเภทการลา', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'leave-type' AND label_key = 'Leave Type');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'leave-type', 'Delete Leave Type', 'ลบประเภทการลา', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'leave-type' AND label_key = 'Delete Leave Type');

-- ── leave-settings ──
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'leave-settings', 'Employee Name', 'ชื่อพนักงาน', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'leave-settings' AND label_key = 'Employee Name');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'leave-settings', 'Sum Quota Days', 'จำนวนวันโควต้ารวม', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'leave-settings' AND label_key = 'Sum Quota Days');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'leave-settings', 'Year', 'ปี', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'leave-settings' AND label_key = 'Year');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'leave-settings', 'Leave Settings', 'ตั้งค่าการลา', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'leave-settings' AND label_key = 'Leave Settings');

-- ── leave-admin ──
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'leave-admin', 'Employee Name', 'ชื่อพนักงาน', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'leave-admin' AND label_key = 'Employee Name');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'leave-admin', 'Leave Type', 'ประเภทการลา', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'leave-admin' AND label_key = 'Leave Type');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'leave-admin', 'From', 'จาก', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'leave-admin' AND label_key = 'From');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'leave-admin', 'To', 'ถึง', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'leave-admin' AND label_key = 'To');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'leave-admin', 'No of Days', 'จำนวนวัน', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'leave-admin' AND label_key = 'No of Days');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'leave-admin', 'Reason', 'เหตุผล', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'leave-admin' AND label_key = 'Reason');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'leave-admin', 'Approved By', 'อนุมัติโดย', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'leave-admin' AND label_key = 'Approved By');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'leave-admin', 'Approved Date', 'วันที่อนุมัติ', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'leave-admin' AND label_key = 'Approved Date');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'leave-admin', 'Comment', 'ความคิดเห็น', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'leave-admin' AND label_key = 'Comment');

-- ── overtime-type ──
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'overtime-type', 'OT Type Code', 'รหัสประเภท OT', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'overtime-type' AND label_key = 'OT Type Code');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'overtime-type', 'OT Type Name (TH)', 'ชื่อประเภท OT (ไทย)', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'overtime-type' AND label_key = 'OT Type Name (TH)');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'overtime-type', 'OT Type Name (EN)', 'ชื่อประเภท OT (อังกฤษ)', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'overtime-type' AND label_key = 'OT Type Name (EN)');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'overtime-type', 'Value', 'ค่า', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'overtime-type' AND label_key = 'Value');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'overtime-type', 'Overtime Type', 'ประเภทล่วงเวลา', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'overtime-type' AND label_key = 'Overtime Type');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'overtime-type', 'Overtime Type Detail', 'รายละเอียดประเภทล่วงเวลา', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'overtime-type' AND label_key = 'Overtime Type Detail');
INSERT INTO "solution-one"."adm-tb-ms-language-translations" (language_code, page_key, label_key, label_value, create_date, create_by) SELECT 'th', 'overtime-type', 'Delete Overtime Type', 'ลบประเภทล่วงเวลา', NOW(), 'system' WHERE NOT EXISTS (SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations" WHERE language_code = 'th' AND page_key = 'overtime-type' AND label_key = 'Delete Overtime Type');

-- ── overtime / overtime-request / overtime-admin (shared OT table keys) ──
DO $$
DECLARE
    pk TEXT;
    ot_pages TEXT[] := ARRAY['overtime','overtime-request','overtime-admin'];
    ot_keys TEXT[][] := ARRAY[
        ARRAY['Name', 'ชื่อ'],
        ARRAY['OT Date', 'วันที่ OT'],
        ARRAY['OT Hours', 'ชั่วโมง OT'],
        ARRAY['OT Type', 'ประเภท OT'],
        ARRAY['Description', 'รายละเอียด'],
        ARRAY['Amount', 'จำนวนเงิน'],
        ARRAY['Approved By', 'อนุมัติโดย'],
        ARRAY['Approved Date', 'วันที่อนุมัติ'],
        ARRAY['Comment', 'ความคิดเห็น'],
        ARRAY['Overtime', 'ล่วงเวลา'],
        ARRAY['Overtime Detail', 'รายละเอียดล่วงเวลา'],
        ARRAY['Month', 'เดือน'],
        ARRAY['Week Interval', 'ช่วงสัปดาห์']
    ];
    kv TEXT[];
BEGIN
    FOREACH pk IN ARRAY ot_pages LOOP
        FOREACH kv SLICE 1 IN ARRAY ot_keys LOOP
            INSERT INTO "solution-one"."adm-tb-ms-language-translations"
                (language_code, page_key, label_key, label_value, create_date, create_by)
            SELECT 'en', pk, kv[1], kv[1], NOW(), 'system'
            WHERE NOT EXISTS (
                SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations"
                WHERE language_code = 'en' AND page_key = pk AND label_key = kv[1]
            );
            INSERT INTO "solution-one"."adm-tb-ms-language-translations"
                (language_code, page_key, label_key, label_value, create_date, create_by)
            SELECT 'th', pk, kv[1], kv[2], NOW(), 'system'
            WHERE NOT EXISTS (
                SELECT 1 FROM "solution-one"."adm-tb-ms-language-translations"
                WHERE language_code = 'th' AND page_key = pk AND label_key = kv[1]
            );
        END LOOP;
    END LOOP;
END $$;
