// Creates the instance owner that the Qlane tester signs in with.
// Qlane runs this script after the n8n service is healthy (see compose.qlane.yaml).
const email = process.env.N8N_QA_OWNER_EMAIL;
const password = process.env.N8N_QA_OWNER_PASSWORD;

if (!email || !password) {
	console.error('Set N8N_QA_OWNER_EMAIL and N8N_QA_OWNER_PASSWORD on the n8n service.');
	process.exit(1);
}

// The REST routes exist only after migrations finish, so wait for readiness first.
const isReady = async () => {
	try {
		return (await fetch('http://127.0.0.1:5678/healthz/readiness')).ok;
	} catch {
		return false;
	}
};

const deadline = Date.now() + 60_000;
while (!(await isReady())) {
	if (Date.now() > deadline) {
		console.error('n8n did not report ready within 60 seconds.');
		process.exit(1);
	}
	await new Promise((resolve) => setTimeout(resolve, 2_000));
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
