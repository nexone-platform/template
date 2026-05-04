const http = require('http');

const data = JSON.stringify({
  "menu_seq": 1035,
  "parent_id": "0138db9f-16c7-4455-90db-9079a2291b56"
});

const options = {
  hostname: 'localhost',
  port: 8101,
  path: '/api/menus/f418beb3-43fd-45ea-8bc3-746d4571d906', // The menu_id from the user's screenshot
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
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
