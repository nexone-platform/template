const http = require('http');

const data = JSON.stringify({ email: 'admin@nexone.com', password: 'password', workspaceId: 'TEMPLATE' });
const options = {
  hostname: 'localhost',
  port: 8101,
  path: '/api/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('LOGIN:', res.statusCode, body);
    const cookie = res.headers['set-cookie'] ? res.headers['set-cookie'][0] : '';
    
    const putData = JSON.stringify({
      "menu_id": "020f2d9a-78ce-4142-a31a-ce48d5aae9d8",
      "menu_seq": 1030,
      "parent_id": "0138db9f-16c7-4455-90db-9079a2291b56"
    });
    
    const putOptions = {
      hostname: 'localhost',
      port: 8101,
      path: '/api/menus/020f2d9a-78ce-4142-a31a-ce48d5aae9d8',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': putData.length,
        'Cookie': cookie
      }
    };
    
    const putReq = http.request(putOptions, putRes => {
      let putBody = '';
      putRes.on('data', d => putBody += d);
      putRes.on('end', () => console.log('UPDATE:', putRes.statusCode, putBody));
    });
    putReq.write(putData);
    putReq.end();
  });
});
req.write(data);
req.end();
