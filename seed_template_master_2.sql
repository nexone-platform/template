DO $$
DECLARE
    -- 'template-master-2' variables
    page_key_name VARCHAR := 'template-master-2';
    
    -- Function to insert or update translations
    PROCEDURE upsert_translation(
        p_page_key VARCHAR,
        p_label_key VARCHAR,
        p_lang VARCHAR,
        p_value VARCHAR
    ) AS $proc$
    BEGIN
        INSERT INTO nex_core.language_translations (page_key, label_key, language_code, label_value, is_active)
        VALUES (p_page_key, p_label_key, p_lang, p_value, true)
        ON CONFLICT (language_code, page_key, label_key)
        DO UPDATE SET label_value = EXCLUDED.label_value, is_active = true, updated_at = NOW();
    END;
    $proc$ LANGUAGE plpgsql;

BEGIN
    -- Template Master 2 Keys
    -- English
    CALL upsert_translation(page_key_name, 'title', 'en', 'Title');
    CALL upsert_translation(page_key_name, 'category', 'en', 'Category');
    CALL upsert_translation(page_key_name, 'description', 'en', 'Description');
    CALL upsert_translation(page_key_name, 'status', 'en', 'Status');
    CALL upsert_translation(page_key_name, 'all', 'en', 'All');
    CALL upsert_translation(page_key_name, 'active', 'en', 'Active');
    CALL upsert_translation(page_key_name, 'inactive', 'en', 'Inactive');
    CALL upsert_translation(page_key_name, 'search_title', 'en', 'Search title...');
    CALL upsert_translation(page_key_name, 'search_category', 'en', 'Search category...');
    CALL upsert_translation(page_key_name, 'search_desc', 'en', 'Search description...');
    CALL upsert_translation(page_key_name, 'search_placeholder', 'en', 'Search examples...');
    CALL upsert_translation(page_key_name, 'template_id', 'en', 'ID');
    CALL upsert_translation(page_key_name, 'template_name', 'en', 'Title');
    CALL upsert_translation(page_key_name, 'template_group', 'en', 'Category');
    CALL upsert_translation(page_key_name, 'template_desc', 'en', 'Usage Description');
    CALL upsert_translation(page_key_name, 'is_active', 'en', 'Status');
    CALL upsert_translation(page_key_name, 'manage', 'en', 'Manage');
    CALL upsert_translation(page_key_name, 'total_items', 'en', 'Total Items');
    CALL upsert_translation(page_key_name, 'items', 'en', 'Items');
    CALL upsert_translation(page_key_name, 'add_data', 'en', 'Add Data');
    CALL upsert_translation(page_key_name, 'view', 'en', 'View');
    CALL upsert_translation(page_key_name, 'edit', 'en', 'Edit');
    CALL upsert_translation(page_key_name, 'delete', 'en', 'Delete');
    CALL upsert_translation(page_key_name, 'column_settings', 'en', 'Column Settings');
    CALL upsert_translation(page_key_name, 'template_2_report', 'en', 'Template 2 Report');
    CALL upsert_translation(page_key_name, 'add_new_data', 'en', 'Add New Data');
    CALL upsert_translation(page_key_name, 'edit_data', 'en', 'Edit Data');
    CALL upsert_translation(page_key_name, 'view_data', 'en', 'Data Details');
    CALL upsert_translation(page_key_name, 'cancel', 'en', 'Cancel');
    CALL upsert_translation(page_key_name, 'save_data', 'en', 'Save Data');
    CALL upsert_translation(page_key_name, 'saving', 'en', 'Saving...');
    CALL upsert_translation(page_key_name, 'close', 'en', 'Close');
    CALL upsert_translation(page_key_name, 'enter_title', 'en', 'Enter title');
    CALL upsert_translation(page_key_name, 'add_category', 'en', 'Add Category');
    CALL upsert_translation(page_key_name, 'enter_desc', 'en', 'Enter description or remarks');
    CALL upsert_translation(page_key_name, 'usage_status', 'en', 'Usage Status');
    CALL upsert_translation(page_key_name, 'read_only', 'en', '*(Read Only)');
    CALL upsert_translation(page_key_name, 'add_new_category', 'en', 'Add New Category');
    CALL upsert_translation(page_key_name, 'category_name', 'en', 'Category Name');
    CALL upsert_translation(page_key_name, 'enter_category_name', 'en', 'Enter category name');
    CALL upsert_translation(page_key_name, 'confirm_delete_title', 'en', 'Confirm Data Deletion');
    CALL upsert_translation(page_key_name, 'deleting', 'en', 'Deleting...');
    CALL upsert_translation(page_key_name, 'delete_data', 'en', 'Delete Data');
    CALL upsert_translation(page_key_name, 'delete_confirm_msg', 'en', 'Are you sure you want to delete data');
    CALL upsert_translation(page_key_name, 'cannot_undo', 'en', 'This action cannot be undone');
    CALL upsert_translation(page_key_name, 'column_settings_title', 'en', 'Table Display Settings');
    CALL upsert_translation(page_key_name, 'select_columns_to_show', 'en', 'Select columns to display');
    CALL upsert_translation(page_key_name, 'sort_data', 'en', 'Sort Data');
    CALL upsert_translation(page_key_name, 'no_sort', 'en', 'No Sort');
    CALL upsert_translation(page_key_name, 'sort', 'en', 'Sort');
    CALL upsert_translation(page_key_name, 'no_data_found', 'en', 'No data found');
    CALL upsert_translation(page_key_name, 'require_template_name', 'en', 'Please enter data name');
    CALL upsert_translation(page_key_name, 'save_success', 'en', 'Data saved successfully');
    CALL upsert_translation(page_key_name, 'error_saving', 'en', 'Error saving data');
    CALL upsert_translation(page_key_name, 'delete_success', 'en', 'Data deleted successfully');
    CALL upsert_translation(page_key_name, 'error_deleting', 'en', 'Error deleting data');
    CALL upsert_translation(page_key_name, 'error_changing_status', 'en', 'Error changing status');
    CALL upsert_translation(page_key_name, 'error_title', 'en', 'Error Notification');
    CALL upsert_translation(page_key_name, 'success_title', 'en', 'Success');
    CALL upsert_translation(page_key_name, 'ok_button', 'en', 'OK');

    -- Thai
    CALL upsert_translation(page_key_name, 'title', 'th', 'หัวข้อ');
    CALL upsert_translation(page_key_name, 'category', 'th', 'หมวดหมู่');
    CALL upsert_translation(page_key_name, 'description', 'th', 'คำอธิบาย');
    CALL upsert_translation(page_key_name, 'status', 'th', 'สถานะ');
    CALL upsert_translation(page_key_name, 'all', 'th', 'ทั้งหมด');
    CALL upsert_translation(page_key_name, 'active', 'th', 'ใช้งาน');
    CALL upsert_translation(page_key_name, 'inactive', 'th', 'ยกเลิก');
    CALL upsert_translation(page_key_name, 'search_title', 'th', 'พิมพ์หัวข้อ...');
    CALL upsert_translation(page_key_name, 'search_category', 'th', 'พิมพ์หมวดหมู่...');
    CALL upsert_translation(page_key_name, 'search_desc', 'th', 'พิมพ์คำอธิบาย...');
    CALL upsert_translation(page_key_name, 'search_placeholder', 'th', 'ค้นหาตัวอย่าง...');
    CALL upsert_translation(page_key_name, 'template_id', 'th', 'ID');
    CALL upsert_translation(page_key_name, 'template_name', 'th', 'หัวข้อ');
    CALL upsert_translation(page_key_name, 'template_group', 'th', 'หมวดหมู่');
    CALL upsert_translation(page_key_name, 'template_desc', 'th', 'อธิบายการใช้งาน');
    CALL upsert_translation(page_key_name, 'is_active', 'th', 'สถานะ');
    CALL upsert_translation(page_key_name, 'manage', 'th', 'จัดการ');
    CALL upsert_translation(page_key_name, 'total_items', 'th', 'รายการทั้งหมด');
    CALL upsert_translation(page_key_name, 'items', 'th', 'รายการ');
    CALL upsert_translation(page_key_name, 'add_data', 'th', 'เพิ่มข้อมูล');
    CALL upsert_translation(page_key_name, 'view', 'th', 'เรียกดู');
    CALL upsert_translation(page_key_name, 'edit', 'th', 'แก้ไข');
    CALL upsert_translation(page_key_name, 'delete', 'th', 'ลบ');
    CALL upsert_translation(page_key_name, 'column_settings', 'th', 'ตั้งค่าคอลัมน์');
    CALL upsert_translation(page_key_name, 'template_2_report', 'th', 'Template 2 Report');
    CALL upsert_translation(page_key_name, 'add_new_data', 'th', 'เพิ่มข้อมูลใหม่');
    CALL upsert_translation(page_key_name, 'edit_data', 'th', 'แก้ไขข้อมูล');
    CALL upsert_translation(page_key_name, 'view_data', 'th', 'รายละเอียดข้อมูล');
    CALL upsert_translation(page_key_name, 'cancel', 'th', 'ยกเลิก');
    CALL upsert_translation(page_key_name, 'save_data', 'th', 'บันทึกข้อมูล');
    CALL upsert_translation(page_key_name, 'saving', 'th', 'กำลังบันทึก...');
    CALL upsert_translation(page_key_name, 'close', 'th', 'ปิด');
    CALL upsert_translation(page_key_name, 'enter_title', 'th', 'ระบุชื่อหัวข้อ');
    CALL upsert_translation(page_key_name, 'add_category', 'th', 'เพิ่มหมวดหมู่');
    CALL upsert_translation(page_key_name, 'enter_desc', 'th', 'ระบุคำอธิบาย หรือหมายเหตุ');
    CALL upsert_translation(page_key_name, 'usage_status', 'th', 'สถานะการใช้งาน');
    CALL upsert_translation(page_key_name, 'read_only', 'th', '*(ดูอย่างเดียว)');
    CALL upsert_translation(page_key_name, 'add_new_category', 'th', 'เพิ่มหมวดหมู่ใหม่');
    CALL upsert_translation(page_key_name, 'category_name', 'th', 'ชื่อหมวดหมู่');
    CALL upsert_translation(page_key_name, 'enter_category_name', 'th', 'ระบุชื่อหมวดหมู่');
    CALL upsert_translation(page_key_name, 'confirm_delete_title', 'th', 'ยืนยันการลบข้อมูล');
    CALL upsert_translation(page_key_name, 'deleting', 'th', 'กำลังลบ...');
    CALL upsert_translation(page_key_name, 'delete_data', 'th', 'ลบข้อมูล');
    CALL upsert_translation(page_key_name, 'delete_confirm_msg', 'th', 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล');
    CALL upsert_translation(page_key_name, 'cannot_undo', 'th', 'การกระทำนี้จะไม่สามารถย้อนกลับได้');
    CALL upsert_translation(page_key_name, 'column_settings_title', 'th', 'ตั้งค่าการแสดงผลตาราง');
    CALL upsert_translation(page_key_name, 'select_columns_to_show', 'th', 'เลือกคอลัมน์ที่ต้องการแสดง');
    CALL upsert_translation(page_key_name, 'sort_data', 'th', 'เรียงลำดับข้อมูล');
    CALL upsert_translation(page_key_name, 'no_sort', 'th', 'ไม่เรียง');
    CALL upsert_translation(page_key_name, 'sort', 'th', 'เรียง');
    CALL upsert_translation(page_key_name, 'no_data_found', 'th', 'ไม่พบข้อมูล');
    CALL upsert_translation(page_key_name, 'require_template_name', 'th', 'กรุณาระบุชื่อข้อมูล');
    CALL upsert_translation(page_key_name, 'save_success', 'th', 'บันทึกข้อมูลเรียบร้อยแล้ว');
    CALL upsert_translation(page_key_name, 'error_saving', 'th', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    CALL upsert_translation(page_key_name, 'delete_success', 'th', 'ลบข้อมูลเรียบร้อยแล้ว');
    CALL upsert_translation(page_key_name, 'error_deleting', 'th', 'ลบข้อมูลไม่สำเร็จ');
    CALL upsert_translation(page_key_name, 'error_changing_status', 'th', 'เปลี่ยนสถานะไม่สำเร็จ');
    CALL upsert_translation(page_key_name, 'error_title', 'th', 'แจ้งเตือนข้อผิดพลาด');
    CALL upsert_translation(page_key_name, 'success_title', 'th', 'สำเร็จ');
    CALL upsert_translation(page_key_name, 'ok_button', 'th', 'ตกลง');

END $$;
