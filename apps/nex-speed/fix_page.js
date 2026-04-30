import fs from 'fs';
let p = 'c:/Task/Nex Solution/nex-speed/frontend/src/app/page.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/import Sidebar(?:.*?);/, "import Sidebar, { navSections } from '@/components/Sidebar';");

let logicBefore = /const config = pageConfig\[currentPage\] \|\| pageConfig\.dashboard;/;
let logicAfter = `let config = pageConfig[currentPage];
  if (!config) {
    let fallbackTitle = currentPage;
    let fallbackBreadcrumb = ['NexSpeed', currentPage];
    for (const section of navSections) {
      const item = section.items.find(i => i.id === currentPage);
      if (item) {
        fallbackTitle = item.label;
        fallbackBreadcrumb = ['NexSpeed', item.label];
        break;
      }
    }
    // Update dashboard title logic
    config = { title: fallbackTitle, subtitle: 'จัดการข้อมูลพื้นฐานบนระบบ', breadcrumb: fallbackBreadcrumb };
  }`;
c = c.replace(logicBefore, logicAfter);

// Specifically handle dashboard Title change
c = c.replace(/dashboard: \{ title: 'Control Tower',/, "dashboard: { title: 'Dashboard',");

fs.writeFileSync(p, c);
console.log('Fixed page.tsx');
