const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('./app');
const {
  connect,
  resetDb,
  disconnect,
  makeToken,
  createUser,
  createDoctor,
  createAppointment,
  createInvoice,
  createPrescription,
  createNotification,
} = require('./helpers');

let admin, patientA, patientB, doctorUser1, doctorUser2, doctor1, doctor2;
let apptA, apptB;
let adminToken, patientAToken, patientBToken, doctor1Token, doctor2Token;

const auth = token => ({ Authorization: `Bearer ${token}` });

before(async () => {
  await connect('projectdb_test_permissions');
});

after(async () => {
  await disconnect();
});

beforeEach(async () => {
  await resetDb();

  admin = await createUser({ name: 'Admin User', email: 'admin@test.com', role: 'admin' });
  patientA = await createUser({ name: 'Patient A', email: 'a@test.com', role: 'patient' });
  patientB = await createUser({ name: 'Patient B', email: 'b@test.com', role: 'patient' });
  doctorUser1 = await createUser({ name: 'Doctor One', email: 'd1@test.com', role: 'doctor' });
  doctorUser2 = await createUser({ name: 'Doctor Two', email: 'd2@test.com', role: 'doctor' });
  doctor1 = await createDoctor(doctorUser1);
  doctor2 = await createDoctor(doctorUser2);

  apptA = await createAppointment({ patient: patientA._id, doctor: doctor1._id, date: '2026-09-10', time: '09:00 AM' });
  apptB = await createAppointment({ patient: patientB._id, doctor: doctor2._id, date: '2026-09-11', time: '10:00 AM' });

  adminToken = makeToken(admin._id, 'admin');
  patientAToken = makeToken(patientA._id, 'patient');
  patientBToken = makeToken(patientB._id, 'patient');
  doctor1Token = makeToken(doctorUser1._id, 'doctor');
  doctor2Token = makeToken(doctorUser2._id, 'doctor');
});

test('unauthenticated requests are rejected', async () => {
  await request(app).get('/get/all/appointments').expect(403);
  await request(app).get('/get/prescriptions/patients/xyz').expect(403);
});

test('patient A can read own appointment history, not patient B', async () => {
  await request(app)
    .get(`/patient/${patientA._id}`)
    .set(auth(patientAToken))
    .expect(200);

  await request(app)
    .get(`/patient/${patientB._id}`)
    .set(auth(patientAToken))
    .expect(403);
});

test('hidden patient lookup is forbidden for strangers', async () => {
  const stranger = await createUser({ name: 'Stranger', email: 's@test.com', role: 'patient' });
  const strangerToken = makeToken(stranger._id, 'patient');

  await request(app)
    .get(`/patient/${patientA._id}`)
    .set(auth(strangerToken))
    .expect(403);

  await request(app)
    .get(`/patient/profile/${patientA._id}`)
    .set(auth(strangerToken))
    .expect(403);
});

test('patient cannot cancel another patient appointment', async () => {
  await request(app)
    .delete(`/cancel/${apptB._id}`)
    .set(auth(patientAToken))
    .expect(403);
});

test('patient cannot book an appointment for another patient', async () => {
  const res = await request(app)
    .post('/book/appointment')
    .set(auth(patientAToken))
    .send({
      doctorId: doctor1._id.toString(),
      patientId: patientB._id.toString(),
      date: '2026-09-12',
      time: '11:00 AM',
    });
  assert.equal(res.status, 403);
});

test('patient cannot read another patient prescriptions / records / invoices', async () => {
  await createPrescription({ patient: patientB._id, doctor: doctor2._id });
  await createInvoice({ patient: patientB._id, doctor: doctor2._id });

  await request(app)
    .get(`/get/prescriptions/patients/${patientB._id}`)
    .set(auth(patientAToken))
    .expect(403);

  await request(app)
    .get(`/medical-records/patient/${patientB._id}`)
    .set(auth(patientAToken))
    .expect(403);

  await request(app)
    .get(`/invoices/patient/${patientB._id}`)
    .set(auth(patientAToken))
    .expect(403);
});

test('patient cannot pay another patient invoice', async () => {
  const invoice = await createInvoice({ patient: patientB._id, doctor: doctor2._id });

  await request(app)
    .patch(`/invoices/pay/${invoice._id}`)
    .set(auth(patientAToken))
    .expect(403);
});

test('patient cannot read another user notifications', async () => {
  const notification = await createNotification({ user: patientA._id });

  await request(app)
    .get(`/notifications/user/${patientA._id}`)
    .set(auth(patientBToken))
    .expect(403);

  await request(app)
    .patch(`/notifications/read/${notification._id}`)
    .set(auth(patientBToken))
    .expect(403);
});

test('doctor can only see own appointments, not other doctor appointments', async () => {
  await request(app)
    .get(`/doctor/${doctor1._id}`)
    .set(auth(doctor1Token))
    .expect(200);

  await request(app)
    .get(`/doctor/${doctor2._id}`)
    .set(auth(doctor1Token))
    .expect(403);
});

test('doctor can only access patients they have a relationship with', async () => {
  // doctor1 has an appointment with patientA but not patientB
  await request(app)
    .get(`/patient/${patientB._id}`)
    .set(auth(doctor1Token))
    .expect(403);

  await request(app)
    .get(`/get/prescriptions/patients/${patientB._id}`)
    .set(auth(doctor1Token))
    .expect(403);

  await request(app)
    .get(`/medical-records/patient/${patientB._id}`)
    .set(auth(doctor1Token))
    .expect(403);
});

test('doctor cannot update appointment status for another doctor appointment', async () => {
  await request(app)
    .patch(`/appointment/${apptB._id}/status`)
    .set(auth(doctor1Token))
    .send({ status: 'Confirmed' })
    .expect(403);

  await request(app)
    .patch(`/appointment/${apptB._id}`)
    .set(auth(doctor1Token))
    .expect(403);
});

test('doctor cannot update another doctor profile', async () => {
  await request(app)
    .patch(`/doctor/update/${doctor2._id}`)
    .set(auth(doctor1Token))
    .send({ specialization: 'Hacked' })
    .expect(403);
});

test('doctor cannot post prescription as another doctor or for unrelated patient', async () => {
  const unrelated = await createUser({ name: 'Unrelated', email: 'u@test.com', role: 'patient' });

  await request(app)
    .post('/post/prescriptions')
    .set(auth(doctor1Token))
    .send({ patient: patientB._id.toString(), doctor: doctor2._id.toString() })
    .expect(403);

  await request(app)
    .post('/post/prescriptions')
    .set(auth(doctor1Token))
    .send({ patient: unrelated._id.toString(), doctor: doctor1._id.toString() })
    .expect(403);
});

test('doctor can post prescription for own patient with own doctor id', async () => {
  const res = await request(app)
    .post('/post/prescriptions')
    .set(auth(doctor1Token))
    .send({
      patient: patientA._id.toString(),
      doctor: doctor1._id.toString(),
      appointment: apptA._id.toString(),
      findings: 'Routine check',
      medicines: [{ name: 'Paracetamol', dosage: '500mg', duration: '3 days' }],
    });
  assert.equal(res.status, 201);
  assert.equal(res.body.data.doctor.toString(), doctor1._id.toString());
});

test('admin can access all patient records', async () => {
  await createPrescription({ patient: patientB._id, doctor: doctor2._id });

  await request(app)
    .get(`/patient/${patientB._id}`)
    .set(auth(adminToken))
    .expect(200);

  await request(app)
    .get(`/get/prescriptions/patients/${patientB._id}`)
    .set(auth(adminToken))
    .expect(200);

  await request(app)
    .get(`/get/all/appointments`)
    .set(auth(adminToken))
    .expect(200);
});

test('doctor patient list is restricted to own patients', async () => {
  const res = await request(app)
    .get('/get/patients')
    .set(auth(doctor1Token));

  assert.equal(res.status, 200);
  const emails = res.body.items.map(p => p.email);
  assert.ok(emails.includes('a@test.com'));
  assert.ok(!emails.includes('b@test.com'));
});

test('patient rating must target self and matching appointment', async () => {
  await request(app)
    .post('/ratings')
    .set(auth(patientAToken))
    .send({ doctor: doctor1._id, patient: patientB._id, rating: 5 })
    .expect(403);

  await request(app)
    .post('/ratings')
    .set(auth(patientAToken))
    .send({ doctor: doctor1._id, patient: patientA._id, rating: 5, appointment: apptB._id })
    .expect(400);

  await request(app)
    .post('/ratings')
    .set(auth(patientAToken))
    .send({ doctor: doctor1._id, patient: patientA._id, rating: 5, appointment: apptA._id })
    .expect(201);

  await request(app)
    .get('/ratings/check?appointment=' + apptB._id)
    .set(auth(patientAToken))
    .expect(403);
});