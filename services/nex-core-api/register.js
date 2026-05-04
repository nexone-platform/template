fetch('http://localhost:8101/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'user@company.com',
        password: 'Password123!',
        displayName: 'Test User'
    })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);

fetch('http://localhost:8101/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'admin@company.com',
        password: 'Password123!',
        displayName: 'Admin User'
    })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
