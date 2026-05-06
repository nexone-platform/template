async function testLogin() {
  const credentials = {
    workspaceId: 'TEMPLATE',
    email: 'admin@company.com',
    password: 'P@ssw0rd123!'
  };

  try {
    const response = await fetch('http://localhost:8101/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testLogin();
