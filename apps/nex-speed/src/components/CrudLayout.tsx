import React, { ReactNode } from 'react';

export interface CrudLayoutProps {
    /** 
     * กล่องข้อมูลสรุปด้านบน (Template แบบที่ 2) 
     * ถ้าไม่ส่งค่ามา จะกลายเป็น Template แบบที่ 1 อัตโนมัติ 
     */
    summaryCards?: ReactNode;

    /**
     * เนื้อหาพิเศษที่จะแทรกระหว่าง Summary Cards กับ Toolbar (ใช้สำหรับ Template แบบที่ 3 เช่น กราฟ)
     */
    customHeaderContent?: ReactNode;

    /** 
     * ส่วนเครื่องมือด้านซ้าย เช่น ปุ่ม Export (PDF, CSV, XLSX) หรือ Dropdown Filter 
     */
    toolbarLeft?: ReactNode;

    /** 
     * ส่วนเครื่องมือด้านขวา เช่น ช่องค้นหา (Search) และปุ่มเพิ่มข้อมูล (Add) 
     */
    toolbarRight?: ReactNode;

    /** 
     * เนื้อหาหลัก คือส่วนของตาราง (Table) และ Pagination 
     */
    children: ReactNode;

    /** 
     * ส่วนของ Modal ต่างๆ (Add, Edit, View, Delete) 
     */
    modals?: ReactNode;
}

export default function CrudLayout({
    summaryCards,
    customHeaderContent,
    toolbarLeft,
    toolbarRight,
    children,
    modals
}: CrudLayoutProps) {
    const getSummaryGridColumns = () => {
        if (!summaryCards) return '1fr';
        
        let count = 0;
        React.Children.forEach(summaryCards, (child) => {
            if (React.isValidElement(child) && child.type === React.Fragment) {
                count += React.Children.count((child.props as any).children);
            } else if (child) {
                count++;
            }
        });

        if (count === 0) return '1fr';
        return `repeat(${count}, 1fr)`;
    };

    return (
        <div className="animate-fade-in">
            
            {/* 1. Summary Cards (ถ้ามี) */}
            {summaryCards && (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: getSummaryGridColumns(), 
                    gap: '12px', 
                    marginBottom: '16px' 
                }}>
                    {summaryCards}
                </div>
            )}

            {/* 1.5 Custom Header Content (ถ้ามี - สำหรับกราฟ Template 3) */}
            {customHeaderContent && (
                <div style={{ marginBottom: '16px' }}>
                    {customHeaderContent}
                </div>
            )}

            {/* 2. Toolbar (ส่วน Header ก่อนตาราง) */}
            {(toolbarLeft || toolbarRight) && (
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '12px', 
                    flexWrap: 'wrap' 
                }}>
                    {/* ด้านซ้าย */}
                    {toolbarLeft && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {toolbarLeft}
                        </div>
                    )}
                    
                    {/* ดันไปขวา */}
                    <div style={{ flex: 1 }} />
                    
                    {/* ด้านขวา */}
                    {toolbarRight && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', justifyContent: 'flex-end', flex: '1 1 auto', minWidth: 0 }}>
                            {toolbarRight}
                        </div>
                    )}
                </div>
            )}

            {/* 3. Main Data Card (ตาราง) */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    {children}
                </div>
            </div>

            {/* 4. Modals (กรอบเด้งทับหน้าจอ) */}
            {modals}

        </div>
    );
}
