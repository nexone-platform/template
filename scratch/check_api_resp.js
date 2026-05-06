const fetch = require('node-fetch');

async function check() {
  const roleId = '00000000-0000-0000-0000-000000000001'; // Just a placeholder
  const app = 'nex-core';
  try {
    const res = await fetch(`http://localhost:8101/api/roles/${roleId}/permissions?app=${app}`);
    const json = await res.json();
    const data = json.data || json;
    
    console.log('--- API RESPONSE STRUCTURE ---');
    console.log('Type:', typeof data);
    console.log('IsArray:', Array.isArray(data));
    
    if (Array.isArray(data)) {
      data.forEach((n, i) => {
        console.log(`[${i}] Title: ${n.title} | menuId: ${n.menuId} | menuType: ${n.menuType}`);
      });
    } else {
      console.log('Data:', JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.error(e);
  }
}

check();
