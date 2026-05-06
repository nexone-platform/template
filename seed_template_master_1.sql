DO $$
DECLARE
    -- 'template-master-1' variables
    page_key_name VARCHAR := 'template-master-1';
    
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
    -- Template Master 1 Keys
    -- English
    CALL upsert_translation(page_key_name, 'require_template_name', 'en', 'Template Name is required');
    CALL upsert_translation(page_key_name, 'save_success', 'en', 'Data saved successfully');
    CALL upsert_translation(page_key_name, 'error_saving', 'en', 'Failed to save data');
    CALL upsert_translation(page_key_name, 'delete_success', 'en', 'Data deleted successfully');
    CALL upsert_translation(page_key_name, 'error_deleting', 'en', 'Failed to delete data');
    CALL upsert_translation(page_key_name, 'error_changing_status', 'en', 'Failed to change status');
    CALL upsert_translation(page_key_name, 'title', 'en', 'Title');
    CALL upsert_translation(page_key_name, 'description', 'en', 'Description');
    CALL upsert_translation(page_key_name, 'status', 'en', 'Status');
    CALL upsert_translation(page_key_name, 'all', 'en', 'All');
    CALL upsert_translation(page_key_name, 'active', 'en', 'Active');
    CALL upsert_translation(page_key_name, 'inactive', 'en', 'Inactive');
    CALL upsert_translation(page_key_name, 'search_placeholder', 'en', 'Search...');
    CALL upsert_translation(page_key_name, 'add_button', 'en', 'Add Data');
    CALL upsert_translation(page_key_name, 'template_id', 'en', 'ID');
    CALL upsert_translation(page_key_name, 'template_name', 'en', 'Template Name');
    CALL upsert_translation(page_key_name, 'template_desc', 'en', 'Description');
    CALL upsert_translation(page_key_name, 'is_active', 'en', 'Status');
    CALL upsert_translation(page_key_name, 'action', 'en', 'Action');
    CALL upsert_translation(page_key_name, 'column_settings', 'en', 'Column Settings');
    CALL upsert_translation(page_key_name, 'view_tooltip', 'en', 'View');
    CALL upsert_translation(page_key_name, 'edit_tooltip', 'en', 'Edit');
    CALL upsert_translation(page_key_name, 'delete_tooltip', 'en', 'Delete');
    CALL upsert_translation(page_key_name, 'no_data', 'en', 'No data found');
    CALL upsert_translation(page_key_name, 'modal_add_title', 'en', 'Add New Data');
    CALL upsert_translation(page_key_name, 'modal_edit_title', 'en', 'Edit Data');
    CALL upsert_translation(page_key_name, 'modal_view_title', 'en', 'View Details');
    CALL upsert_translation(page_key_name, 'cancel', 'en', 'Cancel');
    CALL upsert_translation(page_key_name, 'saving', 'en', 'Saving...');
    CALL upsert_translation(page_key_name, 'save_button', 'en', 'Save');
    CALL upsert_translation(page_key_name, 'close', 'en', 'Close');
    CALL upsert_translation(page_key_name, 'template_name_placeholder', 'en', 'Enter template name');
    CALL upsert_translation(page_key_name, 'template_desc_placeholder', 'en', 'Enter description or remarks');
    CALL upsert_translation(page_key_name, 'usage_status', 'en', 'Usage Status');
    CALL upsert_translation(page_key_name, 'view_only_remark', 'en', '*(View Only)');
    CALL upsert_translation(page_key_name, 'delete_confirm_title', 'en', 'Confirm Deletion');
    CALL upsert_translation(page_key_name, 'deleting', 'en', 'Deleting...');
    CALL upsert_translation(page_key_name, 'delete_button', 'en', 'Delete');
    CALL upsert_translation(page_key_name, 'delete_confirm_message', 'en', 'Are you sure you want to delete this data?');
    CALL upsert_translation(page_key_name, 'delete_warning', 'en', 'This action cannot be undone');
    CALL upsert_translation(page_key_name, 'error_title', 'en', 'Error Alert');
    CALL upsert_translation(page_key_name, 'success_title', 'en', 'Success');
    CALL upsert_translation(page_key_name, 'ok_button', 'en', 'OK');
    CALL upsert_translation(page_key_name, 'column_settings_title', 'en', 'Table Display Settings');
    CALL upsert_translation(page_key_name, 'select_columns_to_show', 'en', 'Select Columns to Show');
    CALL upsert_translation(page_key_name, 'sort_data', 'en', 'Sort Data');
    CALL upsert_translation(page_key_name, 'no_sort', 'en', 'No Sort');
    CALL upsert_translation(page_key_name, 'sort', 'en', 'Sort');
    CALL upsert_translation(page_key_name, 'advanced_search_title', 'en', 'Advanced Search');
    CALL upsert_translation(page_key_name, 'template_1_report', 'en', 'Template 1 Report');

    -- Thai
    CALL upsert_translation(page_key_name, 'require_template_name', 'th', 'กรุณาระบุชื่อข้อมูล');
    CALL upsert_translation(page_key_name, 'save_success', 'th', 'บันทึกข้อมูลเรียบร้อยแล้ว');
    CALL upsert_translation(page_key_name, 'error_saving', 'th', 'บันทึกข้อมูลไม่สำเร็จ');
    CALL upsert_translation(page_key_name, 'delete_success', 'th', 'ลบข้อมูลเรียบร้อยแล้ว');
    CALL upsert_translation(page_key_name, 'error_deleting', 'th', 'ลบข้อมูลไม่สำเร็จ');
    CALL upsert_translation(page_key_name, 'error_changing_status', 'th', 'เปลี่ยนสถานะไม่สำเร็จ');
    CALL upsert_translation(page_key_name, 'title', 'th', 'หัวข้อ');
    CALL upsert_translation(page_key_name, 'description', 'th', 'คำอธิบาย');
    CALL upsert_translation(page_key_name, 'status', 'th', 'สถานะ');
    CALL upsert_translation(page_key_name, 'all', 'th', 'ทั้งหมด');
    CALL upsert_translation(page_key_name, 'active', 'th', 'ใช้งาน');
    CALL upsert_translation(page_key_name, 'inactive', 'th', 'ยกเลิก');
    CALL upsert_translation(page_key_name, 'search_placeholder', 'th', 'ค้นหาตัวอย่าง...');
    CALL upsert_translation(page_key_name, 'add_button', 'th', 'เพิ่มข้อมูล');
    CALL upsert_translation(page_key_name, 'template_id', 'th', 'รายการ');
    CALL upsert_translation(page_key_name, 'template_name', 'th', 'ชื่อข้อมูล');
    CALL upsert_translation(page_key_name, 'template_desc', 'th', 'คำอธิบาย');
    CALL upsert_translation(page_key_name, 'is_active', 'th', 'สถานะ');
    CALL upsert_translation(page_key_name, 'action', 'th', 'จัดการ');
    CALL upsert_translation(page_key_name, 'column_settings', 'th', 'ตั้งค่าคอลัมน์');
    CALL upsert_translation(page_key_name, 'view_tooltip', 'th', 'เรียกดู');
    CALL upsert_translation(page_key_name, 'edit_tooltip', 'th', 'แก้ไข');
    CALL upsert_translation(page_key_name, 'delete_tooltip', 'th', 'ลบ');
    CALL upsert_translation(page_key_name, 'no_data', 'th', 'ไม่พบข้อมูล');
    CALL upsert_translation(page_key_name, 'modal_add_title', 'th', 'เพิ่มข้อมูลใหม่');
    CALL upsert_translation(page_key_name, 'modal_edit_title', 'th', 'แก้ไขข้อมูล');
    CALL upsert_translation(page_key_name, 'modal_view_title', 'th', 'รายละเอียดข้อมูล');
    CALL upsert_translation(page_key_name, 'cancel', 'th', 'ยกเลิก');
    CALL upsert_translation(page_key_name, 'saving', 'th', 'กำลังบันทึก...');
    CALL upsert_translation(page_key_name, 'save_button', 'th', 'บันทึกข้อมูล');
    CALL upsert_translation(page_key_name, 'close', 'th', 'ปิด');
    CALL upsert_translation(page_key_name, 'template_name_placeholder', 'th', 'ระบุชื่อข้อมูล');
    CALL upsert_translation(page_key_name, 'template_desc_placeholder', 'th', 'ระบุคำอธิบาย หรือหมายเหตุ');
    CALL upsert_translation(page_key_name, 'usage_status', 'th', 'สถานะการใช้งาน');
    CALL upsert_translation(page_key_name, 'view_only_remark', 'th', '*(ดูอย่างเดียว)');
    CALL upsert_translation(page_key_name, 'delete_confirm_title', 'th', 'ยืนยันการลบข้อมูล');
    CALL upsert_translation(page_key_name, 'deleting', 'th', 'กำลังลบ...');
    CALL upsert_translation(page_key_name, 'delete_button', 'th', 'ลบข้อมูล');
    CALL upsert_translation(page_key_name, 'delete_confirm_message', 'th', 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล');
    CALL upsert_translation(page_key_name, 'delete_warning', 'th', 'การกระทำนี้จะไม่สามารถย้อนกลับได้');
    CALL upsert_translation(page_key_name, 'error_title', 'th', 'แจ้งเตือนข้อผิดพลาด');
    CALL upsert_translation(page_key_name, 'success_title', 'th', 'สำเร็จ');
    CALL upsert_translation(page_key_name, 'ok_button', 'th', 'ตกลง');
    CALL upsert_translation(page_key_name, 'column_settings_title', 'th', 'ตั้งค่าการแสดงผลตาราง');
    CALL upsert_translation(page_key_name, 'select_columns_to_show', 'th', 'เลือกคอลัมน์ที่ต้องการแสดง');
    CALL upsert_translation(page_key_name, 'sort_data', 'th', 'เรียงลำดับข้อมูล');
    CALL upsert_translation(page_key_name, 'no_sort', 'th', 'ไม่เรียง');
    CALL upsert_translation(page_key_name, 'sort', 'th', 'เรียง');
    CALL upsert_translation(page_key_name, 'advanced_search_title', 'th', 'ค้นหาขั้นสูง');
    CALL upsert_translation(page_key_name, 'template_1_report', 'th', 'Template 1 Report');

END $$;
