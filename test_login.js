const http = require('http');

const data = JSON.stringify({
  workspaceId: 'TEMPLATE',
  email: 'tigerlinly@gmail.com',
  password: 'P@ssw0rd123!'
});

const options = {
  hostname: 'localhost',
  port: 8101,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
