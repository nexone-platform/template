const http = require('http');

const data = JSON.stringify({
  workspaceId: 'TEMPLATE',
  email: 'tigerlinly@gmail.com',
  password: '123456'
});

const options = {
  hostname: 'localhost',
  port: 8101,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers, null, 2)}`);
  res.setEncoding('utf8');
  res.on('data', chunk => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', e => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
