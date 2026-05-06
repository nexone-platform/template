const http = require('http');

// First, login to get the cookie
const loginData = JSON.stringify({
  workspaceId: 'TEMPLATE',
  email: 'tigerlinly@gmail.com',
  password: '123456'
});

const loginOptions = {
  hostname: 'localhost',
  port: 8101,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

const req = http.request(loginOptions, res => {
  const cookies = res.headers['set-cookie'];
  if (!cookies) {
    console.error('No cookies returned');
    return;
  }
  
  const sidCookie = cookies[0].split(';')[0];
  
  // Now try /api/auth/me
  const meOptions = {
    hostname: 'localhost',
    port: 8101,
    path: '/api/auth/me',
    method: 'GET',
    headers: {
      'Cookie': sidCookie
    }
  };
  
  const meReq = http.request(meOptions, meRes => {
    console.log(`ME STATUS: ${meRes.statusCode}`);
    meRes.setEncoding('utf8');
    meRes.on('data', chunk => {
      console.log(`ME BODY: ${chunk}`);
    });
  });
  
  meReq.end();
});

req.write(loginData);
req.end();
