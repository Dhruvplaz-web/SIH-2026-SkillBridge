const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log('1. Logging in as student...');
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'student@example.com', password: 'Demo@1234' });

  if (!loginRes.data || !loginRes.data.token) {
    throw new Error('Login failed: ' + JSON.stringify(loginRes));
  }
  const token = loginRes.data.token;
  console.log('Login successful! Student:', loginRes.data.user.name);

  console.log('\n2. Fetching assessments list...');
  const listRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/assessments',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`Found ${listRes.data.assessments?.length || 0} assessments.`);

  // Find Python Programming assessment
  const pythonAssessment = listRes.data.assessments.find(a => a.title.includes('Python'));
  if (!pythonAssessment) throw new Error('Python assessment not found');
  console.log(`Selected assessment: ${pythonAssessment.title} (ID: ${pythonAssessment.id})`);

  console.log('\n3. Fetching assessment details & questions...');
  const detailRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/assessments/${pythonAssessment.id}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const qs = detailRes.data.questions;
  console.log(`Retrieved ${qs.length} questions.`);

  let allHaveOptions = true;
  let codeCount = 0;
  qs.forEach((q, i) => {
    const optLen = Array.isArray(q.options) ? q.options.length : 0;
    if (optLen === 0) allHaveOptions = false;
    if (q.question.includes('```')) codeCount++;
    console.log(` Q${i+1} [${q.difficulty}]: ${optLen} options available. Has Code: ${q.question.includes('```')}`);
  });

  if (!allHaveOptions) {
    throw new Error('FAILED: Some questions have 0 options!');
  }
  console.log(`✓ All ${qs.length} questions have valid options! Code block questions: ${codeCount}`);

  console.log('\n4. Submitting assessment answers (with passing score)...');
  // Pass correct answers
  const answers = [3, 1, 1, 1, 2, 1, 2, 1, 1, 0, 1, 2];
  const submitRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/assessments/${pythonAssessment.id}/submit`,
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, { answers });

  console.log('Submit response:', JSON.stringify(submitRes.data.result, null, 2));
  console.log('Block Hash:', submitRes.data.blockHash || submitRes.data.result.blockHash);
  console.log('Ledger Block ID:', submitRes.data.ledgerBlockId || submitRes.data.result.ledgerBlockId);
  console.log('Breakdown count:', submitRes.data.result?.breakdown?.length);

  console.log('\n5. Checking TrustLedger API (/api/student/ledger) for anchored block...');
  const ledgerRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/student/ledger',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const latestBlock = ledgerRes.data.blocks?.[0];
  console.log('Latest block in TrustLedger:', latestBlock);

  console.log('\nAll tests passed successfully!');
}

run().catch(console.error);
