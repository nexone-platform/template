
async function test() {
  try {
    const res = await fetch('http://localhost:8101/api/roles');
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
