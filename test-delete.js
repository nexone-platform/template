const fetch = require('node-fetch');

async function test() {
    try {
        const createRes = await fetch('http://localhost:8101/api/templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ template_name: 'test_delete', template_desc: 'test', is_active: true })
        });
        const created = await createRes.json();
        console.log('Created:', created);

        if (created && created.template_id) {
            const id = created.template_id;
            console.log(`Deleting ID ${id}...`);
            const delRes = await fetch(`http://localhost:8101/api/templates/${id}`, {
                method: 'DELETE'
            });
            const deletedText = await delRes.text();
            console.log('Delete Response:', delRes.status, deletedText);
        }
    } catch (e) {
        console.error(e);
    }
}
test();
