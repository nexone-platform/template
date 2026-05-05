const http = require('http');

const data = JSON.stringify({
  email: 'tigerlinly@gmail.com',
  password: 'password123',
  workspaceId: 'TEMPLATE'
});

const req = http.request({
  hostname: 'localhost',
  port: 8101,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body));
});
req.on('error', e => console.error(e));
req.write(data);
req.end();
