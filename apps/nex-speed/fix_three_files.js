import fs from 'fs';

function fixFile(file, searchStr, replaceStr) {
    let c = fs.readFileSync(file, 'utf-8');
    c = c.replace(searchStr, replaceStr);
    fs.writeFileSync(file, c);
    console.log('Fixed', file);
}

// Fix MaintenancePlanPage
fixFile(
    'src/pages/MaintenancePlanPage.tsx',
    /<ExportButtons[\s\S]*?<thead>/,
    `<ExportButtons 
                    onExportXLSX={() => exportToXLSX(filteredData, 'MaintenancePlan', exportConfigs)}
                    onExportCSV={() => exportToCSV(filteredData, 'MaintenancePlan', exportConfigs)}
                    onExportPDF={() => exportToPDF(filteredData, 'MaintenancePlan', exportConfigs, 'รายงานแผนบำรุงรักษา')}
                />
            }
            toolbarRight={
                <>
                    <SearchInput value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="ค้นหาแผนบำรุงรักษา..." />
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }} onClick={handleAdd}>
                        <Plus size={16} /> <span>สร้างแผนใหม่</span>
                    </button>
                </>
            }
        >
            <div style={{ height: '720px', overflowY: 'auto' }}>
                <table className="data-table">
                    <thead>`
);

// We need to also patch ParkingPage.tsx
fixFile(
    'src/pages/ParkingPage.tsx',
    /<SearchInput value=\{search\} onChange=\{\(v\) => \{ setSearch\(v\); setCurrentPage\(1\); \}\} placeholder="ค้นหาลานจอดรถ\.\.\." \/>\s*<Plus size=\{16\} \/>/g,
    `<SearchInput value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="ค้นหาลานจอดรถ..." />
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }} onClick={handleAdd}>
                        <Plus size={16} />`
);

// We need to also patch PartCategoryPage.tsx
fixFile(
    'src/pages/PartCategoryPage.tsx',
    /<SearchInput value=\{search\} onChange=\{\(v\) => \{ setSearch\(v\); setCurrentPage\(1\); \}\} placeholder="ค้นหาหมวดหมู่อะไหล่\.\.\." \/>\s*<Plus size=\{16\} \/>/g,
    `<SearchInput value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="ค้นหาหมวดหมู่อะไหล่..." />
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }} onClick={() => { setModal('add'); setForm({ name: '', description: '', status: 'active', subCategories: [] }); }}>
                        <Plus size={16} />`
);
