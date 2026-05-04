const http = require('http');

const data = JSON.stringify({
  "menu_id": "020f2d9a-78ce-4142-a31a-ce48d5aae9d8",
  "menu_seq": 1030,
  "app_name": "nex-core",
  "icon": "megaphone",
  "is_active": false,
  "menu_code": "nex-core:announcements",
  "page_key": "announcements",
  "parent_id": "0138db9f-16c7-4455-90db-9079a2291b56",
  "route": "/announcements",
  "title": "Announcements",
  "translations": {}
});

const options = {
  hostname: 'localhost',
  port: 8101,
  path: '/api/menus/020f2d9a-78ce-4142-a31a-ce48d5aae9d8',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Authorization': 'Bearer test' // Just in case, but let's test what it returns
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', body));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
