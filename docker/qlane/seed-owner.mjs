// Creates the instance owner that the Qlane tester signs in with.
// Qlane runs this script after the n8n service is healthy (see compose.qlane.yaml).
const email = process.env.N8N_QA_OWNER_EMAIL;
const password = process.env.N8N_QA_OWNER_PASSWORD;

if (!email || !password) {
	console.error('Set N8N_QA_OWNER_EMAIL and N8N_QA_OWNER_PASSWORD on the n8n service.');
	process.exit(1);
}

const response = await fetch('http://127.0.0.1:5678/rest/owner/setup', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ email, firstName: 'QA', lastName: 'Owner', password }),
});

const body = await response.text();

if (response.ok) {
	console.log(`Created the instance owner ${email}.`);
} else if (body.includes('Instance owner already setup')) {
	console.log('The instance owner already exists.');
} else {
	console.error(`Owner setup failed with status ${response.status}: ${body}`);
	process.exit(1);
}
