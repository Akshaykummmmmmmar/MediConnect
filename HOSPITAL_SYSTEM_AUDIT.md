# MediConnect Hospital System Audit

## Overview

MediConnect has a strong demo foundation: separate Admin, Doctor, and Patient portals; appointment booking; doctor availability; prescriptions; medical records; invoices; ratings; notifications; analytics; JWT authentication; Helmet; rate limiting; Swagger; and Socket.IO.

To operate like a real hospital system, the next work should prioritize data security, clinical data integrity, and operational workflows before advanced AI or telemedicine features.

## 1. Highest Priority: Patient-Data Authorization

Several APIs validate only a user's role, not whether that user owns or is authorized to access the requested record.

Potentially affected areas include:

- Patient appointment history
- Patient prescriptions
- Medical records
- Patient invoices
- Notifications
- Doctor profile updates
- Appointment status updates

Relevant files:

- `server/Routes/appointmentBook.js`
- `server/Routes/prescriptionRoute.js`
- `server/Routes/medicalRecordRoute.js`
- `server/Routes/invoiceRoute.js`
- `server/Routes/notificationRoute.js`

Required changes:

- Patients may access only records belonging to `req.user.id`.
- Doctors may access only appointments and patients assigned to them.
- Doctors may update only their own doctor profile.
- Doctors may update appointment status only for their own appointments.
- Admins may access all records according to their permissions.
- Every clinical-data mutation must verify ownership before writing.
- Add automated IDOR/permission tests for every patient and doctor endpoint.

This is the most urgent production requirement.

## 2. Replace Demo Authentication Behavior

The current system can return OTP and password-reset tokens in API responses, and a fallback JWT secret exists in source code.

Relevant files:

- `server/Routes/userRoute.js`
- `server/middleware/checkToken.js`
- `frontend/src/components/pages/ForgotPassword/forgotPassword.jsx`

Required changes:

- Send OTP and reset links only through verified email or SMS.
- Never return OTPs or reset tokens in JSON responses.
- Require `JWT_SECRET` in production and fail startup if it is missing.
- Use short-lived access tokens with refresh-token rotation.
- Add session revocation and secure logout.
- Add account lockout and suspicious-login tracking.
- Store audit events for login, logout, password changes, and failed attempts.

## 3. Improve Clinical Data Modeling

The current model is closer to a clinic demo than a complete hospital record system.

Add or improve these entities:

- Patient demographics and hospital identifiers
- Encounters and visits
- Vital signs
- Allergies and adverse reactions
- Current medications
- Diagnoses
- Clinical notes
- Lab orders and results
- Imaging reports
- Referrals
- Discharge summaries
- Consent records
- Insurance information
- Read/download audit events

Prescriptions and medical records should always be linked to the patient, doctor, appointment/encounter, author, and creation timestamp.

Clinical records should not be freely deleted. Use correction and amendment history instead.

## 4. Make Appointment Scheduling Hospital-Grade

The current booking flow supports basic doctor/date/time booking but needs a complete appointment lifecycle.

Add support for:

- Consultation, follow-up, emergency, procedure, and teleconsultation types
- Appointment duration and room/location
- Queue and check-in status
- Cancellation and no-show reasons
- Rescheduling workflow
- Doctor leave and holiday calendars
- Slot locking and transaction protection against double booking
- Timezone-safe dates and times
- 24-hour and 2-hour reminders
- Waitlists
- Recurring doctor availability
- Emergency and same-day appointment rules

The current payment selection is also not a true payment workflow. Payment state should be handled separately from appointment booking.

## 5. Replace Simulated Payments

The current invoice payment flow changes the invoice status directly. It does not process money.

Add:

- Razorpay or Stripe payment orders/intents
- Webhook verification
- Transaction IDs
- Payment reconciliation
- Refunds
- Failed-payment states
- Insurance claims
- Tax-compliant receipts

An invoice must never be marked as paid solely because a frontend request was made.

## 6. Correct Clinical Workflow Permissions

Recommended rules:

- Only the assigned doctor can create a prescription for an encounter.
- Every prescription must reference a valid patient appointment.
- Patients may upload documents only to their own record.
- Doctors should view patients only when they have a legitimate appointment or assignment.
- Admin clinical access must be auditable.
- Medical-record views and downloads should be logged, not only creation and deletion.

There is also a likely notification bug in `server/Routes/prescriptionRoute.js`: after finding `patientUser`, the notification is sent using `patient._id`, although `patient` is the request ID value. It should use `patientUser._id`.

## 7. Add Real Hospital Operations

The current roles are Admin, Doctor, and Patient. A practical hospital platform should also support:

- Receptionist/front desk
- Nurse
- Pharmacist
- Lab technician
- Billing staff
- Hospital manager
- Super admin

Operational workflows should include:

- Patient registration and duplicate detection
- OPD check-in
- Token and queue management
- Admission and discharge
- Bed and room allocation
- Nursing observations
- Pharmacy dispensing
- Lab sample collection
- Insurance desk
- Referrals
- Emergency department tracking

## 8. Improve Role Dashboards

### Admin dashboard

- Today's appointments
- Pending confirmations
- Check-ins and waiting queue
- Revenue collected and outstanding
- Bed and room occupancy
- Low-stock and expiring medicines
- Staff availability
- Cancellation and no-show rates
- Patient registration trends

### Doctor dashboard

- Today's queue
- Next patient
- Unfinished clinical notes
- Follow-ups due
- Prescription history
- Relevant patient history before consultation

### Patient dashboard

- Upcoming appointment and check-in instructions
- Medication schedule
- Pending invoices
- Test results
- Follow-up reminders
- Secure notifications and communication

## 9. Improve Engineering Quality

The frontend lint check currently reports 8 errors and 20 warnings, including unused variables, empty catch blocks, missing React hook dependencies, and unused appointment data.

The backend has no real test suite. `server npm test` currently exits with `no test specified`.

Add:

- Unit tests for validators and business rules
- API integration tests with a test MongoDB
- Playwright end-to-end workflows
- Permission and IDOR security tests
- Double-booking tests
- Invoice/payment webhook tests
- CI checks for lint, build, and tests
- Error tracking such as Sentry
- Structured server logging

## 10. Improve Architecture

The application contains duplicated route patterns and data-fetching functions.

Refactor toward:

- Feature-based frontend folders
- Shared API service functions
- Shared pagination/filter hooks
- Central server error handling
- Request validation with Zod, Joi, or express-validator
- Service and repository layers
- Consistent API response format
- API versioning such as `/api/v1`
- Centralized status enums
- Centralized timezone/date utilities

The root `package.json` is inconsistent with the Vite frontend because it only declares `react-scripts`. Either remove it or convert the root into a proper workspace/monorepo configuration.

## Recommended Implementation Order

### Phase 1 — Safety and correctness

- Fix IDOR and ownership checks.
- Remove OTP/reset-token response leaks.
- Remove fallback secrets.
- Fix the prescription notification bug.
- Add request validation.
- Fix all lint errors.
- Add API permission tests.

### Phase 2 — Core hospital workflows

- Patient registration and duplicate detection.
- Appointment lifecycle and check-in queue.
- Doctor encounter workflow.
- Prescription and medical-record linking.
- Lab/report attachments.
- Invoice and payment lifecycle.

### Phase 3 — Hospital operations

- Receptionist, nurse, pharmacist, and billing roles.
- Pharmacy fulfillment.
- Laboratory workflows.
- Bed and room management.
- Insurance and refunds.
- Appointment reminders.

### Phase 4 — Production readiness

- Refresh tokens and session management.
- Audit read access.
- Backups and disaster recovery.
- Monitoring and error tracking.
- Docker and CI/CD deployment.
- FHIR-compatible export and consent management.

## Final Recommendation

MediConnect is visually progressing well, but the next development cycle should focus on authorization, clinical data integrity, appointment correctness, and real operational workflows. AI, chat, video consultation, and predictive analytics should follow after these foundations are secure and reliable.
