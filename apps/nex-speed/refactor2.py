import os
import glob

pages = [
    "MechanicTypePage.tsx",
    "UnitTypePage.tsx",
    "LiquidTypePage.tsx",
    "PartGroupPage.tsx",
    "StorageTypePage.tsx",
    "ParkingTypePage.tsx"
]

base_path = "c:/Task/Nex Solution/nex-speed/frontend/src/pages/basic/"

import_target = "import { SearchInput, crudStyles, BaseModal } from '@/components/CrudComponents';"
import_replacement = """import { SearchInput, crudStyles, BaseModal, ExportButtons } from '@/components/CrudComponents';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/exportUtils';"""

layout_target = """        <CrudLayout
            toolbarRight={"""

layout_replacement = """        <CrudLayout
            toolbarLeft={
                <ExportButtons 
                    onExportXLSX={() => exportToXLSX(filteredData, 'DataExport', [
                        { key: 'id', label: 'ID' },
                        { key: 'name', label: 'ชื่อข้อมูล' },
                        { key: 'description', label: 'คำอธิบาย' },
                        { key: 'status', label: 'สถานะ', format: (v: any) => v.status === 'active' ? 'ใช้งาน' : 'ระงับ' }
                    ])}
                    onExportCSV={() => exportToCSV(filteredData, 'DataExport', [
                        { key: 'id', label: 'ID' },
                        { key: 'name', label: 'ชื่อข้อมูล' },
                        { key: 'description', label: 'คำอธิบาย' },
                        { key: 'status', label: 'สถานะ', format: (v: any) => v.status === 'active' ? 'ใช้งาน' : 'ระงับ' }
                    ])}
                    onExportPDF={() => exportToPDF(filteredData, 'DataExport', [
                        { key: 'id', label: 'ID' },
                        { key: 'name', label: 'ชื่อข้อมูล' },
                        { key: 'description', label: 'คำอธิบาย' },
                        { key: 'status', label: 'สถานะ', format: (v: any) => v.status === 'active' ? 'ใช้งาน' : 'ระงับ' }
                    ], 'รายงานข้อมูลพื้นฐาน')}
                />
            }
            toolbarRight={"""

for page in pages:
    file_path = os.path.join(base_path, page)
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Replace imports
        content = content.replace(import_target, import_replacement)
        
        # Replace layout
        content = content.replace(layout_target, layout_replacement)
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {page}")
    else:
        print(f"File not found: {page}")
