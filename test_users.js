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
  const cookies = res.headers['set-cookie'];
  console.log('Cookies:', cookies);
  
  const req2 = http.request({
    hostname: 'localhost',
    port: 8101,
    path: '/api/users?page=1&limit=10',
    method: 'GET',
    headers: {
      'Cookie': cookies[0].split(';')[0]
    }
  }, res2 => {
    let body = '';
    res2.on('data', d => body += d);
    res2.on('end', () => console.log('GET /api/users Status:', res2.statusCode, 'Body:', body));
  });
  req2.on('error', e => console.error(e));
  req2.end();
});
req.on('error', e => console.error(e));
req.write(data);
req.end();
