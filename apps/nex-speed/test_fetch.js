async function test() {
  try {
    const res = await fetch('http://localhost:8081/api/v1/system-apps');
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text);
    try {
      const json = JSON.parse(text);
      console.log('JSON parse success!', json.length);
    } catch (err) {
      console.log('JSON parse failed:', err.message);
    }
  } catch(e) {
    console.log('Fetch failed:', e);
  }
}
test();
