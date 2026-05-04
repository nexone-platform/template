const http = require('http');

const data = JSON.stringify({
  "menu_id": "0138db9f-16c7-4455-90db-9079a2291b56",
  "menu_seq": 1010,
  "parent_id": null,
  "app_name": "nex-core",
  "icon": "dashboard",
  "is_active": true,
  "menu_code": "nex-core:overview",
  "page_key": "overview",
  "route": "/overview",
  "title": "Overview",
  "translations": {
    "en": "Overview",
    "th": "ภาพรวม"
  }
});

const options = {
  hostname: 'localhost',
  port: 8101,
  path: '/api/menus/0138db9f-16c7-4455-90db-9079a2291b56',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body));
});

req.on('error', (e) => {
  console.error(e);
});

req.write(data);
req.end();
