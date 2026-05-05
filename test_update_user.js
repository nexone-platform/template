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
  
  const updateData = JSON.stringify({
    displayName: 'Admin User',
    email: 'tigerlinly@gmail.com',
    roleId: '',
    isActive: true
  });

  const req2 = http.request({
    hostname: 'localhost',
    port: 8101,
    path: '/api/users/baa6f7ca-bb1b-435b-81a2-6966a9476e01',
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': updateData.length,
      'Cookie': cookies[0].split(';')[0]
    }
  }, res2 => {
    let body = '';
    res2.on('data', d => body += d);
    res2.on('end', () => console.log('PATCH /api/users Status:', res2.statusCode, 'Body:', body));
  });
  req2.on('error', e => console.error(e));
  req2.write(updateData);
  req2.end();
});
req.on('error', e => console.error(e));
req.write(data);
req.end();
