const http = require('http');

http.get('http://localhost:8101/api/v1/system-apps?all=true', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const nexCost = json.data.find(a => a.app_name === 'NexCost');
    console.log('NexCost:', nexCost);
  });
}).on('error', err => console.log('ERROR:', err.message));
