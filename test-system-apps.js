const http = require('http');

http.get('http://localhost:8101/api/v1/system-apps?all=true', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('RESPONSE:', res.statusCode, data.substring(0, 500)));
}).on('error', err => console.log('ERROR:', err.message));
