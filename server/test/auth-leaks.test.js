const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const request = require('supertest');
const app = require('./app');
const { connect, resetDb, disconnect, createUser } = require('./helpers');

before(async () => {
  await connect('projectdb_test_auth');
});

after(async () => {
  await disconnect();
});

beforeEach(async () => {
  await resetDb();
});

test('registration response never contains the OTP', async () => {
  const res = await request(app).post('/signUp/register').send({
    name: 'New Patient ' + Date.now(),
    email: 'new' + Date.now() + '@test.com',
    password: 'secret123',
    confirmPassword: 'secret123',
    age: 30,
    gender: 'Male',
  });

  assert.equal(res.status, 200);
  assert.ok(res.body.email);
  assert.equal(res.body.otp, undefined);
  assert.equal(res.body.note, undefined);
});

test('resend-otp response never contains the OTP', async () => {
  await createUser({ name: 'Patient', email: 'foo@test.com', role: 'patient', isVerified: false });

  const res = await request(app).post('/resend-otp').send({ email: 'foo@test.com' });
  assert.equal(res.status, 200);
  assert.equal(res.body.otp, undefined);
});

test('forgot-password response never contains the reset token', async () => {
  await createUser({ name: 'Patient', email: 'foo2@test.com', role: 'patient' });

  const res = await request(app).post('/forgot-password').send({ email: 'foo2@test.com' });
  assert.equal(res.status, 200);
  assert.equal(res.body.resetToken, undefined);
  assert.equal(res.body.note, undefined);
  assert.ok(!JSON.stringify(res.body).match(/resetToken/i));
});

test('config requires a JWT_SECRET in production', () => {
  const { tmpdir } = require('node:os');
  const fs = require('node:fs');
  const configPath = JSON.stringify(path.join(__dirname, '..', 'config.js'));
  const emptyDir = fs.mkdtempSync(path.join(tmpdir(), 'mediconnect-config-'));
  const run = () =>
    execFileSync(
      process.execPath,
      [
        '-e',
        `
        process.env.NODE_ENV = 'production';
        delete process.env.JWT_SECRET;
        try {
          require(${configPath});
          process.exit(0);
        } catch (e) {
          if (/JWT_SECRET is required in production/.test(e.message)) process.exit(42);
          console.error(e.message);
          process.exit(1);
        }
        `,
      ],
      { cwd: emptyDir, stdio: 'pipe' }
    );

  try {
    run();
    assert.fail('expected process to exit with code 42');
  } catch (e) {
    assert.equal(e.status, 42, 'config should throw when JWT_SECRET is missing in production');
  }
});