const http = require('http');

const test = (path) => new Promise((res, rej) => {
  http.get(`http://localhost:8001${path}`, (r) => {
    let d = '';
    r.on('data', c => d += c);
    r.on('end', () => {
      try { res(JSON.parse(d)); } catch { res(d); }
    });
  }).on('error', rej);
});

(async () => {
  console.log('Testing /api/translations/languages:');
  const langs = await test('/api/translations/languages');
  console.log(JSON.stringify(langs, null, 2));

  console.log('\nTesting /api/translations (first 2 rows):');
  const trans = await test('/api/translations');
  if (Array.isArray(trans)) {
    console.log(`Total groups: ${trans.length}`);
    console.log(JSON.stringify(trans.slice(0,2), null, 2));
  } else {
    console.log(JSON.stringify(trans, null, 2));
  }
})();
