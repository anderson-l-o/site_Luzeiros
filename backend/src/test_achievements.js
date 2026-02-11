import http from 'http';

const API_HOST = 'localhost';
const API_PORT = 5000;
const BASE = `/api`;

function req(method, path, data = null, token = null) {
  const body = data ? JSON.stringify(data) : null;
  const headers = {
    'Content-Type': 'application/json',
  };
  if (body) headers['Content-Length'] = Buffer.byteLength(body);
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = {
    host: API_HOST,
    port: API_PORT,
    path: `${BASE}${path}`,
    method,
    headers,
  };

  return new Promise((resolve, reject) => {
    const r = http.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = data ? JSON.parse(data) : null;
        } catch (e) {
          return reject(new Error(`Invalid JSON response: ${data}`));
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data: parsed });
        } else {
          const err = new Error(`HTTP ${res.statusCode}`);
          err.status = res.statusCode;
          err.data = parsed;
          reject(err);
        }
      });
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

(async function main(){
  try {
    console.log('Logging in...');
    const login = await req('POST', '/auth/login', { email: 'admin@aventureiros.com', password: '123456' });
    const token = login.data.token;
    const userId = login.data.userId;
    console.log('OK token length:', token ? token.length : 0);

    console.log('Fetching achievement types...');
    const types = await req('GET', '/achievement-types', null, token);
    const type = Array.isArray(types.data) ? types.data[0] : types.data;
    if (!type) throw new Error('No achievement types found');
    const typeId = type.id;
    console.log('Using type:', type.name || typeId);

    const today = new Date();
    const todayStr = today.toISOString().slice(0,10);

    console.log('Creating achievement with today date', todayStr);
    const created = await req('POST', '/achievements', { userId, achievementTypeId: typeId, dateAchieved: todayStr, notes: 'automated test' }, token);
    console.log('Created id:', created.data.id);

    const future = new Date(); future.setDate(future.getDate()+5);
    const futureStr = future.toISOString().slice(0,10);
    console.log('Attempting to create achievement with future date', futureStr);
    try {
      await req('POST', '/achievements', { userId, achievementTypeId: typeId, dateAchieved: futureStr, notes: 'future test' }, token);
      console.log('ERROR: future date accepted (unexpected)');
    } catch (e) {
      console.log('Expected error for future date:', e.data || e.message);
    }

    const editDate = new Date(); editDate.setDate(editDate.getDate()-1);
    const editStr = editDate.toISOString().slice(0,10);
    console.log('Editing created achievement to date', editStr);
    const edited = await req('PUT', `/achievements/${created.data.id}`, { dateAchieved: editStr, notes: 'edited by test' }, token);
    console.log('Edited id:', edited.data.id, 'new date:', edited.data.dateAchieved);

    console.log('Deleting created achievement...');
    await req('DELETE', `/achievements/${created.data.id}`, null, token);
    console.log('Deleted. Verifying list...');
    const list = await req('GET', `/achievements?userId=${userId}`, null, token);
    console.log('Achievements count for user:', Array.isArray(list.data) ? list.data.length : 0);

    console.log('All tests completed successfully.');
  } catch (e) {
    console.error('Test failed:', e && (e.data || e.message || e));
    process.exitCode = 2;
  }
})();
