'use client';
import React, { useState } from 'react';
import { MasterTemplate } from '@nexone/ui';
import { stockNavSections } from '../config/navigation';
import InventoryControlPage from '../views/InventoryControlPage';
import BarcodeScannerPage from '../views/BarcodeScannerPage';
import LocationManagementPage from '../views/LocationManagementPage';

export default function NexStockApp() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const user = {
        name: 'Admin User',
        role: 'Warehouse Manager',
        avatar: ''
    };

    const getPageTitle = () => {
        switch (currentPage) {
            case 'inventory': return 'จัดการสต๊อก (GR/GI)';
            case 'barcode': return 'สแกน QR / Barcode';
            case 'locations': return 'ผังคลังสินค้า & Zone';
            default: return currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
        }
    };

    const allItems = stockNavSections.flatMap(s => s.items);
    const currentItem = allItems.find(i => i.id === currentPage);
    const menuLabel = currentItem ? currentItem.label : 'NexStock WMS';

    const renderContent = () => {
        switch (currentPage) {
            case 'inventory': return <InventoryControlPage />;
            case 'barcode': return <BarcodeScannerPage />;
            case 'locations': return <LocationManagementPage />;
            default: return (
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome to NexStock, the Warehouse Management System module on NexOne platform.</p>
                    <div style={{ marginTop: '20px', padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                        หน้าปัจจุบัน: {currentPage} (อยู่ระหว่างพัฒนา)
                    </div>
                </div>
            );
        }
    };

    return (
        <MasterTemplate
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            isOpen={sidebarOpen}
            appName="NexStock"
            defaultThemeColor="#16a34a"  /* A nice green for stock, can change later */
            sections={stockNavSections}
            pageTitle={getPageTitle()}
            breadcrumb={['NexStock', menuLabel]}
            user={user}
            onLogout={() => console.log('logout')}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        >
            {renderContent()}
        </MasterTemplate>
    );
}
