fetch('http://localhost:8101/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'admin@company.com',
        password: 'Password123!'
    })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
