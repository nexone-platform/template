import { LayoutDashboard, Package, Warehouse, Barcode, ArrowRightLeft, ClipboardCheck, AlertTriangle, Settings } from 'lucide-react';

export const stockNavSections = [
    {
        id: 'main',
        title: 'ระบบคลังสินค้า',
        icon: Package,
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'inventory', label: 'จัดการสต๊อก (GR/GI)', icon: Package, badge: '!' },
            { id: 'movements', label: 'โอนย้าย & เคลื่อนไหว', icon: ArrowRightLeft },
            { id: 'locations', label: 'ผังคลังสินค้า & Zone', icon: Warehouse },
        ],
    },
    {
        id: 'operations',
        title: 'ปฏิบัติการ',
        icon: Barcode,
        items: [
            { id: 'barcode', label: 'สแกน QR / Barcode', icon: Barcode },
            { id: 'stock-count', label: 'นับสต๊อก (Stock Count)', icon: ClipboardCheck },
            { id: 'low-stock', label: 'สินค้าใกล้หมด', icon: AlertTriangle, badge: '5' },
        ],
    },
    {
        id: 'settings',
        title: 'ตั้งค่าระบบ',
        icon: Settings,
        items: [
            { id: 'settings', label: 'ตั้งค่าคลังสินค้า', icon: Settings },
        ],
    }
];
