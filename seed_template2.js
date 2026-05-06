const { Client } = require('pg');

async function seed() {
    const client = new Client({
        user: 'postgres',
        host: '203.151.66.51',
        database: 'nexone_template',
        password: 'qwerty',
        port: 5434,
    });
    
    try {
        await client.connect();
        
        const translations = [
            // General & Search
            { key: 'title', th: 'หัวข้อ', en: 'Title' },
            { key: 'category', th: 'หมวดหมู่', en: 'Category' },
            { key: 'description', th: 'คำอธิบาย', en: 'Description' },
            { key: 'status', th: 'สถานะ', en: 'Status' },
            { key: 'all', th: 'ทั้งหมด', en: 'All' },
            { key: 'active', th: 'ใช้งาน', en: 'Active' },
            { key: 'inactive', th: 'ยกเลิก', en: 'Inactive' },
            { key: 'search_title', th: 'พิมพ์หัวข้อ...', en: 'Search title...' },
            { key: 'search_category', th: 'พิมพ์หมวดหมู่...', en: 'Search category...' },
            { key: 'search_desc', th: 'พิมพ์คำอธิบาย...', en: 'Search description...' },
            { key: 'search_placeholder', th: 'ค้นหาตัวอย่าง...', en: 'Search examples...' },
            
            // Table Headers
            { key: 'template_id', th: 'ID', en: 'ID' },
            { key: 'template_name', th: 'หัวข้อ', en: 'Title' },
            { key: 'template_group', th: 'หมวดหมู่', en: 'Category' },
            { key: 'template_desc', th: 'อธิบายการใช้งาน', en: 'Usage Description' },
            { key: 'is_active', th: 'สถานะ', en: 'Status' },
            { key: 'manage', th: 'จัดการ', en: 'Manage' },
        
            // Summary Cards
            { key: 'total_items', th: 'รายการทั้งหมด', en: 'Total Items' },
            { key: 'items', th: 'รายการ', en: 'Items' },
        
            // Actions
            { key: 'add_data', th: 'เพิ่มข้อมูล', en: 'Add Data' },
            { key: 'view', th: 'เรียกดู', en: 'View' },
            { key: 'edit', th: 'แก้ไข', en: 'Edit' },
            { key: 'delete', th: 'ลบ', en: 'Delete' },
            { key: 'column_settings', th: 'ตั้งค่าคอลัมน์', en: 'Column Settings' },
            { key: 'template_2_report', th: 'Template 2 Report', en: 'Template 2 Report' },
        
            // Modals (CRUD)
            { key: 'add_new_data', th: 'เพิ่มข้อมูลใหม่', en: 'Add New Data' },
            { key: 'edit_data', th: 'แก้ไขข้อมูล', en: 'Edit Data' },
            { key: 'view_data', th: 'รายละเอียดข้อมูล', en: 'Data Details' },
            { key: 'cancel', th: 'ยกเลิก', en: 'Cancel' },
            { key: 'save_data', th: 'บันทึกข้อมูล', en: 'Save Data' },
            { key: 'saving', th: 'กำลังบันทึก...', en: 'Saving...' },
            { key: 'close', th: 'ปิด', en: 'Close' },
        
            // Modal Inputs
            { key: 'enter_title', th: 'ระบุชื่อหัวข้อ', en: 'Enter title' },
            { key: 'add_category', th: 'เพิ่มหมวดหมู่', en: 'Add Category' },
            { key: 'enter_desc', th: 'ระบุคำอธิบาย หรือหมายเหตุ', en: 'Enter description or remarks' },
            { key: 'usage_status', th: 'สถานะการใช้งาน', en: 'Usage Status' },
            { key: 'read_only', th: '*(ดูอย่างเดียว)', en: '*(Read Only)' },
        
            // Add Category Modal
            { key: 'add_new_category', th: 'เพิ่มหมวดหมู่ใหม่', en: 'Add New Category' },
            { key: 'category_name', th: 'ชื่อหมวดหมู่', en: 'Category Name' },
            { key: 'enter_category_name', th: 'ระบุชื่อหมวดหมู่', en: 'Enter category name' },
        
            // Delete Confirmation
            { key: 'confirm_delete_title', th: 'ยืนยันการลบข้อมูล', en: 'Confirm Data Deletion' },
            { key: 'deleting', th: 'กำลังลบ...', en: 'Deleting...' },
            { key: 'delete_data', th: 'ลบข้อมูล', en: 'Delete Data' },
            { key: 'delete_confirm_msg', th: 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล', en: 'Are you sure you want to delete data' },
            { key: 'cannot_undo', th: 'การกระทำนี้จะไม่สามารถย้อนกลับได้', en: 'This action cannot be undone' },
        
            // Column Settings
            { key: 'column_settings_title', th: 'ตั้งค่าการแสดงผลตาราง', en: 'Table Display Settings' },
            { key: 'select_columns_to_show', th: 'เลือกคอลัมน์ที่ต้องการแสดง', en: 'Select columns to display' },
            { key: 'sort_data', th: 'เรียงลำดับข้อมูล', en: 'Sort Data' },
            { key: 'no_sort', th: 'ไม่เรียง', en: 'No Sort' },
            { key: 'sort', th: 'เรียง', en: 'Sort' },
        
            // Feedback / Alert Messages
            { key: 'no_data_found', th: 'ไม่พบข้อมูล', en: 'No data found' },
            { key: 'require_template_name', th: 'กรุณาระบุชื่อข้อมูล', en: 'Please enter data name' },
            { key: 'save_success', th: 'บันทึกข้อมูลเรียบร้อยแล้ว', en: 'Data saved successfully' },
            { key: 'error_saving', th: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', en: 'Error saving data' },
            { key: 'delete_success', th: 'ลบข้อมูลเรียบร้อยแล้ว', en: 'Data deleted successfully' },
            { key: 'error_deleting', th: 'ลบข้อมูลไม่สำเร็จ', en: 'Error deleting data' },
            { key: 'error_changing_status', th: 'เปลี่ยนสถานะไม่สำเร็จ', en: 'Error changing status' },
            { key: 'error_title', th: 'แจ้งเตือนข้อผิดพลาด', en: 'Error Notification' },
            { key: 'success_title', th: 'สำเร็จ', en: 'Success' },
            { key: 'ok_button', th: 'ตกลง', en: 'OK' }
        ];
        
        console.log('Inserting translations...');
        for(const t of translations) {
            // Use ON CONFLICT if possible, or just DELETE first, then INSERT
            await client.query(`DELETE FROM nex_core.language_translations WHERE page_key = 'template-master-2' AND label_key = $1`, [t.key]);

            // Insert TH
            await client.query(`
                INSERT INTO nex_core.language_translations (translation_id, language_code, page_key, label_key, label_value)
                VALUES (gen_random_uuid(), 'th', 'template-master-2', $1, $2)
            `, [t.key, t.th]);
            
            // Insert EN
            await client.query(`
                INSERT INTO nex_core.language_translations (translation_id, language_code, page_key, label_key, label_value)
                VALUES (gen_random_uuid(), 'en', 'template-master-2', $1, $2)
            `, [t.key, t.en]);
        }
        
        console.log('Done inserting translations.');
        await client.end();
        console.log('Done.');
    } catch(err) {
        console.error('Error:', err);
    }
}

seed();
