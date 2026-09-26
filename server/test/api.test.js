const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const { once } = require('node:events');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'student-profile-api-'));
process.env.DATABASE_PATH = path.join(temporaryDirectory, 'test.db');
process.env.DEMO_STUDENT_PASSWORD = 'test-password-123';

const { app, ready, closeDatabase } = require('../server');
let server;
let apiUrl;

async function request(route, options = {}) {
    const response = await fetch(`${apiUrl}${route}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers },
        body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });
    const payload = response.status === 204 ? null : await response.json();
    return { response, payload };
}

function withToken(token, options = {}) {
    return {
        ...options,
        headers: { ...options.headers, Authorization: `Bearer ${token}` }
    };
}

before(async () => {
    await ready;
    server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    apiUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
    if (server) {
        server.close();
        await once(server, 'close');
    }
    await closeDatabase();
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
});

test('authentication, ownership, CRUD, and logout are enforced', async () => {
    const unauthenticatedRead = await request('/profile/2023-0001');
    assert.equal(unauthenticatedRead.response.status, 401);

    const invalidLogin = await request('/login', {
        method: 'POST',
        body: { studentId: '2023-0001', password: 'incorrect-password' }
    });
    assert.equal(invalidLogin.response.status, 401);

    const login = await request('/login', {
        method: 'POST',
        body: { studentId: '2023-0001', password: 'test-password-123' }
    });
    assert.equal(login.response.status, 200);
    assert.ok(login.payload.token);
    const token = login.payload.token;

    const fetchedProfile = await request('/profile/2023-0001', withToken(token));
    assert.equal(fetchedProfile.response.status, 200);
    assert.equal(fetchedProfile.payload.student_id, '2023-0001');

    const otherProfile = await request('/profile/other-student', withToken(token));
    assert.equal(otherProfile.response.status, 403);

    const created = await request('/students', {
        method: 'POST',
        body: {
            studentId: 'test-delete-1',
            password: 'another-test-password',
            name: 'Delete Test',
            course: 'Test Course',
            yearLevel: '1st Year'
        }
    });
    assert.equal(created.response.status, 201);

    const updated = await request('/profile/2023-0001', withToken(token, {
        method: 'PUT',
        body: {
            name: 'Updated Test Name',
            course: 'Test Course',
            year_level: '2nd Year',
            about: 'Updated about',
            skills: 'Testing'
        }
    }));
    assert.equal(updated.response.status, 200);

    const updatedProfile = await request('/profile/2023-0001', withToken(token));
    assert.equal(updatedProfile.payload.name, 'Updated Test Name');

    const crossAccountDelete = await request('/students/test-delete-1', withToken(token, { method: 'DELETE' }));
    assert.equal(crossAccountDelete.response.status, 403);

    const deletedLogin = await request('/login', {
        method: 'POST',
        body: { studentId: 'test-delete-1', password: 'another-test-password' }
    });
    const deleteOwn = await request('/students/test-delete-1', withToken(deletedLogin.payload.token, { method: 'DELETE' }));
    assert.equal(deleteOwn.response.status, 200);

    const logout = await request('/logout', withToken(token, { method: 'POST' }));
    assert.equal(logout.response.status, 204);
    const expiredRead = await request('/profile/2023-0001', withToken(token));
    assert.equal(expiredRead.response.status, 401);
});