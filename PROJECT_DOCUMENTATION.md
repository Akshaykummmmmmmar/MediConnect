# MediConnect — Hospital Management System

A full-stack **MERN** application for managing a hospital/clinic: doctors, patients, departments, appointments, prescriptions, medical records, invoicing, notifications, analytics, and audit logs.

- **Frontend:** React 19 + Vite 7, React Router 7, Axios, lucide-react icons, react-toastify, html2pdf (PDF generation)
- **Backend:** Node.js + Express 5 (CommonJS), Mongoose 9 (MongoDB)
- **Auth:** JWT (role-based), bcrypt password hashing, OTP email verification (simulated), password reset tokens (simulated)
- **File uploads:** Multer (disk storage) for doctor images

---

## 1. Project Structure

```
Main Project/
├── package.json                  # Root deps (react-scripts)
├── frontend/                     # React SPA (Vite)
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx              # Entry — BrowserRouter + App
│       ├── App.jsx               # All routes
│       ├── App.css / index.css   # Global styles + CSS variables (light/dark theme)
│       ├── utils/
│       │   ├── axios.js          # Axios instance w/ JWT interceptor (baseURL localhost:4000)
│       │   ├── exportCsv.js      # Blob download helper for CSV exports
│       │   └── validation.js     # Shared client-side validators
│       └── components/
│           ├── PrivateRoute/     # Guards authenticated routes
│           ├── Pagination/       # Reusable table pagination
│           ├── Search/           # Reusable search box
│           ├── GetPatients/      # Patient dropdown picker
│           ├── NotificationBell/ # Notification dropdown (polling)
│           ├── ThemeToggle/      # Light/dark theme switcher
│           ├── LogoutBtn/        # Logout button
│           └── pages/
│               ├── Home/ About/ Services/   # Public pages
│               ├── Sign/ Login/ VerifyOtp/ ForgotPassword/ ResetPassword/  # Auth pages
│               ├── Admin/        # Admin layout + 12 admin pages
│               ├── Docter/       # Doctor layout + 5 doctor pages
│               └── Patient/      # Patient layout + 7 patient pages
└── server/                       # Express API
    ├── server.js                 # App entry — registers all routers on port 4000
    ├── database/
    │   ├── index.js              # Mongoose connection → mongodb://localhost:27017/projectdb
    │   └── models/               # 11 Mongoose schemas
    ├── middleware/checkToken.js  # JWT + role authorization guard
    ├── Routes/                   # 12 route modules
    ├── helpers.js                # sendNotification() & logActivity()
    ├── validation.js             # Server-side validators + OTP generator
    └── public/                   # Uploaded images (multer destination)
```

---

## 2. Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB running locally on `localhost:27017`

### Install & Run

```bash
# Install server dependencies
cd server
npm install

# Start the API (nodemon dev mode)
npm run dev          # → http://localhost:4000

# In a second terminal — frontend
cd frontend
npm install
npm run dev          # → http://localhost:5173
```

The frontend talks to the API at `http://localhost:4000` (hardcoded in `frontend/src/utils/axios.js`). Uploaded images are served statically from `server/public`.

### Enable Google (Gmail) email delivery

Account-verification OTPs and password-reset tokens are already sent through the backend mailer. To deliver them from a Gmail account:

1. Enable **2-Step Verification** on the Gmail account that should send MediConnect emails.
2. Create an **App Password** at `https://myaccount.google.com/apppasswords` (select **Mail** or a custom name such as `MediConnect`). Google shows the 16-character password once.
3. Copy `server/.env.example` to `server/.env`, then set the following values. Keep the App Password private; `.env` is ignored by Git.

```env
MAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-google-account@gmail.com
SMTP_PASS=your-16-character-google-app-password
MAIL_FROM=MediConnect <your-google-account@gmail.com>
```

4. Restart the backend and register a new patient or request a password reset to confirm delivery.

Gmail no longer supports a normal account password for this SMTP connection. If an organization blocks App Passwords, use an approved SMTP provider instead.

> Note: No admin seed script exists. Create the first admin by calling `POST /addAdmin` manually (requires a valid admin JWT), or insert an admin `User` directly in the DB.

---

## 3. Roles & Access Model

Three roles controlled by JWT claims (`role`) and enforced by `checkToken(roles)` middleware:

| Role      | Can access                                                                               | Redirect after login |
| --------- | ---------------------------------------------------------------------------------------- | -------------------- |
| `admin`   | All admin pages, manages doctors/medicines/patients/appointments/invoices/logs/analytics | `/admin`             |
| `doctor`  | Own appointments, availability, profile                                                  | `/doctor`            |
| `patient` | Book appointments, prescriptions, records, invoices, profile                             | `/patient`           |

**Authentication flow**

1. User submits credentials to `POST /login`.
2. Server verifies email, checks `isVerified`, compares bcrypt password.
3. On success returns a **JWT** (expires 7 days) plus user identity (`_id`, `name`, `role`, `email`) and role-specific profile data (`doctor`, `patient`).
4. Frontend persists `token`, `userId`, `userEmail`, `role`, `name` (and role extras like `doctorId`) in `localStorage`.
5. Axios request interceptor (`utils/axios.js`) automatically attaches `Authorization: Bearer <token>` to every request.
6. `PrivateRoute` checks for a token in `localStorage` — if missing, redirects to `/login`.

**Registration flow (patient)**

1. `POST /signUp/register` — validates input, hashes password, creates a `User` (role `patient`, `isVerified: false`) and a linked `Patient` document, and generates a 6-digit OTP (expires in 10 min). **OTP is returned in the JSON response for demo purposes** (not actually emailed).
2. `POST /verify-otp` — marks the user verified and clears OTP fields.
3. `POST /resend-otp` — issues a fresh OTP.

**Password reset flow**

1. `POST /forgot-password` — stores a random reset token (valid 1 hour); **token is returned in the response for demo purposes**.
2. `POST /reset-password` — validates token + expiry, hashes the new password.
3. `PATCH /change-password` — authenticated users change password with the old password.

---

## 4. User Workflows

### 4.1 Patient

1. **Register + verify OTP → Login.**
2. **Dashboard** (`/patient`) — shows total appointments & prescriptions; upcoming appointments.
3. **Book appointment** (`patient/appointments/dash`):
   - Fetches available slots via `GET /book/appointment-slots?doctorId=`.
   - Slots are computed from the doctor's `availability` (working days, start/end time, slot duration). Already-booked times are disabled.
   - Only dates within the next 7 days are bookable.
   - `POST /book/appointment` creates an appointment with status `Pending` and sends notifications to both patient and doctor.
4. **My Appointments** — lists own appointments; can cancel (`DELETE /cancel/:id`) → notifies both parties.
5. **Prescriptions** — `GET /get/prescriptions/patients/:id`; view detail and **download as PDF** (html2pdf from the rendered prescription document).
6. **Medical Records** — `GET /medical-records/patient/:id`.
7. **Invoices** — `GET /invoices/patient/:id`; can **pay** a pending invoice (`PATCH /invoices/pay/:id`) choosing a payment method (Card/UPI/Cash/Insurance), and **download the invoice as PDF**.
8. **Rate a doctor** — after a completed appointment, submit `POST /ratings` (1–5 stars + review). One rating per appointment.
9. **Profile** — view/update details via `GET/PATCH /user/profile` (incl. blood group, allergies, medical history).

### 4.2 Doctor

1. **Login** — frontend additionally fetches `GET /doctor/byUser/:userId` to get `doctorId`, stored in `localStorage`.
2. **Dashboard** (`/doctor`) — patient count + shortcuts.
3. **Appointments** (`doctor/appointments`) — `GET /doctor/:id` for the doctor's own appointment list; update status via `PATCH /appointment/:id/status` (`Confirmed`, `Completed`, `Cancelled`, `No-show`).
4. **Today's Appointments** — filtered view of the day's schedule.
5. **Post prescription** — `POST /post/prescriptions` with findings, diagnosis, medicines `[{name, dosage, duration}]`, advice, follow-up date → notifies the patient.
6. **My Availability** (`doctor/availability/dash`) — set working days, start/end time, slot duration via `PATCH /doctor/update/:id`.
7. **Profile** — update specialization, about, qualifications, experience, consultation fee.

### 4.3 Admin

1. **Login** (admin role).
2. **Dashboard** — counts (doctors/patients/appointments), recent activity feed, quick actions.
3. **Departments** — `POST /add/department`, `GET /department/get`.
4. **Doctors** — list w/ search, department filter, rating badge; **Add Doctor** (`POST /adddoctor`, incl. image upload); delete (`DELETE /doctor/delete/:id` — also deletes the linked User); **Export CSV**.
5. **Patients** — `GET /get/patients` w/ search; **Export CSV**.
6. **Appointments** — `GET /get/all/appointments` w/ status filter; update status; **Export CSV**.
7. **Medicines** — add (`POST /add/medicine`), list w/ search (`GET /get/medicines/`), view medicine page; **Export CSV**.
8. **Analytics** — `GET /analytics/overview`: counts, appointment status breakdown, top-5 doctors by appointments, appointments per day, revenue (total/pending), average rating.
9. **Invoices** — create invoices (`POST /invoices` with items + tax, auto-computes subtotal/total), view all w/ status filter.
10. **Activity Logs** — `GET /activity-logs` — full audit trail of all actions.

---

## 5. Dataflow

### 5.1 High-level request lifecycle

```
React component
   │  axios.get('/doctors/get')        (utils/axios.js injects Bearer token)
   ▼
Express server (port 4000)             (server.js mounts all routers)
   │  checkToken(['admin','patient','doctor'])  → verifies JWT + role
   ▼
Route handler                          (queries Mongoose models, populate refs)
   │
   ▼
MongoDB  projectdb                     (mongodb://localhost:27017/projectdb)
   │  response JSON (often paginated: { items, total, page, limit, totalPages })
   ▼
React component                        (setState → render)
```

### 5.2 Pagination convention

Most list endpoints accept `?page=&limit=` (default `1` / `10`). Each returns a shared shape (built by a local `paginate()` helper in each route file):

```json
{ "items": [...], "total": 12, "page": 1, "limit": 10, "totalPages": 2 }
```

The `Pagination` component consumes `page`, `totalPages`, `onPageChange`.

### 5.3 Reference dataflow — booking an appointment

1. Patient opens booking page → `GET /book/appointment-slots?doctorId=...` returns the next 7 dates, doctor-generated time slots, and a `booked` map of `{date: [taken times]}` so the UI disables conflicts.
2. Patient picks a slot → `POST /book/appointment` `{doctorId, patientId, date, time}`.
3. Server re-validates: date within 7 days, doctor works that day, time is a valid slot, slot not already taken → creates `Appointment` (`status: 'Pending'`).
4. `helpers.sendNotification()` creates a `Notification` for the patient and the doctor.
5. `helpers.logActivity()` writes an `ActivityLog` (`APPOINTMENT_BOOKED`).
6. Response → toast success, list refreshes.

### 5.4 Notification + audit pipeline

Almost every mutation funnels through `server/helpers.js`:

```js
sendNotification({ user, title, message, type, relatedId })
  → creates a Notification document (type ∈ appointment|prescription|billing|rating|system)

logActivity({ user, role, action, details })
  → creates an ActivityLog document (the admin audit trail)
```

The frontend `NotificationBell` polls `GET /notifications/user/:id?limit=8` and `GET /notifications/unread/:id` every 30s, and supports mark-read (`PATCH /notifications/read/:id`) and mark-all-read (`PATCH /notifications/read-all`).

---

## 6. Database Schema (11 collections)

| Collection       | Model (file)             | Key fields                                                                                                                                                                                                    |
| ---------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users`          | `userSchema.js`          | name, age, gender, emergencyContact, address, email (unique), password (hashed), role (`admin`/`doctor`/`patient`), contactNumber, otp, otpExpires, isVerified, resetPasswordToken, resetPasswordExpires      |
| `docters`        | `docterSchema.js`        | user (ref User), image, department (ref Department), age, specialization, experience, licenseNumber, consultationFee, about, qualifications, availability `{workingDays[], startTime, endTime, slotDuration}` |
| `patients`       | `patientSchema.js`       | user (ref User), age, bloodGroup, medicalHistory, allergies                                                                                                                                                   |
| `appointments`   | `appointmentSchema.js`   | patient (ref User), doctor (ref docter), date, time, status (`Pending`/`Confirmed`/`Completed`/`Cancelled`/`No-show`/`Booked`)                                                                                |
| `invoices`       | `invoiceSchema.js`       | invoiceNumber (unique), appointment, patient, doctor, items `[{description, amount}]`, subtotal, tax, total, status (`Pending`/`Paid`), paymentMethod (`Cash`/`Card`/`UPI`/`Insurance`)                       |
| `prescriptions`  | `prescriptionSchema.js`  | patient, doctor, findings, diagnosis, medicines `[{name, dosage, duration}]`, advice, followUp                                                                                                                |
| `medicalrecords` | `medicalRecordSchema.js` | patient, doctor, appointment, title, recordType (`diagnosis`/`report`/`test`/`vaccination`/`surgery`/`other`), description, attachment                                                                        |
| `departments`    | `department.js`          | name (unique), description                                                                                                                                                                                    |
| `medicines`      | `medicinesSchema.js`     | name (unique, lowercase, trimmed), description, manufacturer, expiryDate, price (min 0)                                                                                                                       |
| `notifications`  | `notificationSchema.js`  | user (ref User), title, message, type, read (bool), relatedId                                                                                                                                                 |
| `activitylogs`   | `activityLogSchema.js`   | user (ref User), role, action, details                                                                                                                                                                        |
| `ratings`        | `ratingSchema.js`        | doctor, patient, appointment, rating (1–5), review; unique index on `(doctor, appointment)`                                                                                                                   |

---

## 7. API Reference

All routes mounted in `server.js`. Auth middleware `checkToken([...])` where noted.

### Auth & Users (`Routes/userRoute.js`)

| Method | Endpoint           | Auth                   | Purpose                                                  |
| ------ | ------------------ | ---------------------- | -------------------------------------------------------- |
| POST   | `/signUp/register` | —                      | Patient registration (creates User + Patient, sends OTP) |
| POST   | `/verify-otp`      | —                      | Verify OTP                                               |
| POST   | `/resend-otp`      | —                      | Resend OTP                                               |
| POST   | `/login`           | —                      | Login → JWT + identity                                   |
| POST   | `/forgot-password` | —                      | Issue reset token                                        |
| POST   | `/reset-password`  | —                      | Reset password with token                                |
| PATCH  | `/change-password` | admin, doctor, patient | Change own password                                      |
| GET    | `/user/profile`    | admin, doctor, patient | Get own profile (+ doctor/patient doc)                   |
| PATCH  | `/user/profile`    | admin, doctor, patient | Update own profile                                       |
| GET    | `/doctors/count`   | —                      | Doctor/patient/appointment counts                        |

### Admin (`Routes/adminRoute.js`)

| Method | Endpoint                 | Auth                   | Purpose                                  |
| ------ | ------------------------ | ---------------------- | ---------------------------------------- |
| POST   | `/addAdmin`              | admin                  | Create admin                             |
| POST   | `/adddoctor`             | admin                  | Add doctor (creates User + Doctor)       |
| PATCH  | `/doctor/update/:id`     | admin, doctor          | Update doctor profile/availability       |
| DELETE | `/doctor/delete/:id`     | admin                  | Delete doctor + linked user              |
| GET    | `/doctor/byUser/:userId` | —                      | Lookup doctor by user id (used at login) |
| GET    | `/doctors/get`           | admin, patient, doctor | List doctors (search/dept/rating filter) |
| POST   | `/add/medicine`          | admin                  | Add medicine                             |
| GET    | `/get/medicines/`        | —                      | List medicines (search)                  |
| GET    | `/analytics/overview`    | admin                  | Dashboard analytics                      |
| GET    | `/activity-logs`         | admin                  | Audit logs                               |

### Appointments (`Routes/appointmentBook.js`)

| Method | Endpoint                  | Auth           | Purpose                              |
| ------ | ------------------------- | -------------- | ------------------------------------ |
| POST   | `/book/appointment`       | patient, admin | Book appointment                     |
| GET    | `/book/appointment-slots` | patient, admin | Slot availability for a doctor       |
| GET    | `/get/all/appointments`   | —              | All appointments (status filter)     |
| GET    | `/doctor/:id`             | —              | Doctor's appointments                |
| GET    | `/patient/:id`            | —              | Patient's appointments               |
| DELETE | `/cancel/:id`             | patient        | Cancel appointment                   |
| PATCH  | `/appointment/:id/status` | —              | Update status (Confirm/No-show/etc.) |
| PATCH  | `/appointment/:id`        | —              | Mark completed                       |

### Patients (`Routes/patientRoute.js`)

| Method | Endpoint               | Purpose                               |
| ------ | ---------------------- | ------------------------------------- |
| GET    | `/get/patients`        | List patients (search)                |
| GET    | `/patient/profile/:id` | Patient profile (User + Patient docs) |

### Departments (`Routes/departmentRoute.js`)

| Method | Endpoint          | Auth          | Purpose           |
| ------ | ----------------- | ------------- | ----------------- |
| POST   | `/add/department` | —             | Create department |
| GET    | `/department/get` | admin, doctor | List departments  |

### Prescriptions (`Routes/prescriptionRoute.js`)

| Method | Endpoint                          | Auth            | Purpose                                |
| ------ | --------------------------------- | --------------- | -------------------------------------- |
| POST   | `/post/prescriptions`             | doctor, patient | Create prescription (notifies patient) |
| GET    | `/get/prescriptions/patients/:id` | patient, doctor | List patient's prescriptions           |

### Medical Records (`Routes/medicalRecordRoute.js`)

| Method | Endpoint                       | Auth                   | Purpose         |
| ------ | ------------------------------ | ---------------------- | --------------- |
| POST   | `/medical-records`             | doctor, patient, admin | Create record   |
| GET    | `/medical-records/patient/:id` | patient, doctor, admin | List by patient |
| GET    | `/medical-records/:id`         | patient, doctor, admin | Single record   |
| DELETE | `/medical-records/:id`         | doctor, admin          | Delete record   |

### Invoices (`Routes/invoiceRoute.js`)

| Method | Endpoint                | Auth           | Purpose                                  |
| ------ | ----------------------- | -------------- | ---------------------------------------- |
| POST   | `/invoices`             | admin, doctor  | Create invoice (computes subtotal/total) |
| GET    | `/invoices/patient/:id` | patient, admin | Patient's invoices                       |
| GET    | `/invoices`             | admin          | All invoices (status filter)             |
| PATCH  | `/invoices/pay/:id`     | patient, admin | Mark paid + payment method               |

### Ratings (`Routes/feedbackRoute.js`)

| Method | Endpoint              | Auth    | Purpose                           |
| ------ | --------------------- | ------- | --------------------------------- |
| POST   | `/ratings`            | patient | Submit/update rating              |
| GET    | `/ratings/doctor/:id` | —       | Ratings + average for a doctor    |
| GET    | `/ratings/check`      | patient | Check if an appointment was rated |

### Notifications (`Routes/notificationRoute.js`)

| Method | Endpoint                    | Auth      | Purpose                         |
| ------ | --------------------------- | --------- | ------------------------------- |
| GET    | `/notifications/user/:id`   | all roles | List + unread count (paginated) |
| GET    | `/notifications/unread/:id` | all roles | Unread count                    |
| PATCH  | `/notifications/read/:id`   | all roles | Mark one read                   |
| PATCH  | `/notifications/read-all`   | all roles | Mark all read                   |

### Images (`Routes/imageRoute.js`)

| Method | Endpoint        | Purpose                                                                                                                                                 |
| ------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/image-upload` | Multer upload (single field `image`) → saves to `server/public/` with a uniqid-prefixed filename; returns `{ url: "http://localhost:4000/<filename>" }` |

### CSV Export (`Routes/exportRoute.js`) — all admin

| Endpoint                   | File                                                                      |
| -------------------------- | ------------------------------------------------------------------------- |
| `/export/patients.csv`     | Name, Email, Age, Gender, Contact, Address, Emergency Contact, Registered |
| `/export/doctors.csv`      | Name, Email, Specialization, Experience, Department, Fee, License         |
| `/export/appointments.csv` | Date, Time, Patient, Patient Email, Doctor, Status, Booked                |
| `/export/medicines.csv`    | Name, Description, Manufacturer, Expiry, Price                            |

---

## 8. Frontend UI Setup

### 8.1 Routing (`App.jsx`)

- **Public:** `/`, `/about`, `/services`, `/signUP`, `/login`, `/verify-otp`, `/forgot-password`, `/reset-password`
- **Protected** (wrapped in `<PrivateRoute />`):
  - `/admin/*` — layout with nested index + 8 dashboard routes + `/admin/addMedicine`, `/admin/add/doctor`
  - `/doctor/*` — 5 routes
  - `/patient/*` — 7 routes

### 8.2 Layout pattern

Three role shells (`Admin`, `Docter`, `Patient` components) share a common design:

- **Sidebar** — brand ("MediConnect" + role-specific tag, e.g. "Admin Panel"), icon menu via `NavLink` (active state highlighted), and a bottom cluster with `NotificationBell`, `ThemeToggle`, `Logout`.
- **Main content** — `<Outlet />` renders the nested page.
- Responsive: sidebar + content collapse under 720px.

### 8.3 Theming (light/dark)

- CSS custom properties in `index.css` under `:root` (light) and `[data-theme='dark']` (dark).
- `ThemeToggle` sets `data-theme="dark"` on `<html>` and persists choice in `localStorage('theme')`; falls back to `prefers-color-scheme`.
- Shared status badges (`.status-badge`, `.status-pending`, `.status-confirmed`, `.status-cancelled`, etc.) and dashboard polish are defined globally.

### 8.4 Shared components

| Component          | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| `PrivateRoute`     | Redirects unauthenticated users to `/login`            |
| `Pagination`       | Table/list pagination UI                               |
| `Search`           | Debounced/filtering search input                       |
| `GetPatients`      | Patient select for admin/doctor flows                  |
| `NotificationBell` | Polling dropdown with unread badge + mark read actions |
| `ThemeToggle`      | Light/dark switch                                      |
| `LogoutBtn`        | Clears token from localStorage, returns home           |

### 8.5 UX conventions

- **Toasts** via `react-toastify` (`<ToastContainer />` + `toast.success/error/info`).
- **Icons** from `lucide-react`.
- **Modals** built with a shared `.modal-overlay` pattern.
- **PDF download** via `html2pdf.js-forked` — renders a hidden `#invoice-print-area` / `#prescription-document` DOM node into an A4 portrait PDF.
- **CSV download** via `utils/exportCsv.js` — fetches the export endpoint as a blob and triggers a browser download.

---

## 9. Security Notes & Known Quirks

- **Secrets are hardcoded**: JWT `SECRET_KEY = 'gghfhergyfgreherhuerhue'` appears in `checkToken.js` and `userRoute.js` — move to env vars before production.
- **OTP & reset tokens are returned in API responses** for demo purposes; in production they should be emailed/SMS-ed and never returned.
- **Password hashing** uses `bcrypt` (10 salt rounds). The password field is excluded from queries that expose users.
- **No rate limiting, no helmet**, and `cors()` is wide open — acceptable for a demo, should be tightened for production.
- Some endpoints (e.g. `GET /get/all/appointments`, `PATCH /appointment/:id/status`, `POST /add/department`, `GET /get/medicines/`) are **not** token-protected.
- The login flow stores `age`/`gender`/`address` for patients directly from the `User` document, while extra patient fields live on the `Patient` document.
- Doctor dashboard contains hardcoded demo content (e.g. appointment count `23`, static activity rows).
- Route paths are inconsistent in places (e.g. nested paths like `doctor/appointments`, `admin/add/doctor` use absolute/relative mixes), and a few pages navigate with duplicated segments (e.g. `navigate('/patient/patient/appointments/dash')`) that rely on React Router's relative resolution.

---

## 10. Summary Diagram

```
                          ┌─────────────────────────────────────────┐
                          │           React SPA (Vite :5173)        │
                          │  Public pages  •  Admin  •  Doctor  •  Patient │
                          │  (Router → layout → pages → components) │
                          └───────────────┬─────────────────────────┘
                                          │  Axios + Bearer JWT
                                          ▼
                          ┌─────────────────────────────────────────┐
                          │        Express API (Node :4000)         │
                          │  checkToken(roles) → route handlers     │
                          │  helpers: sendNotification/logActivity  │
                          └───────────────┬─────────────────────────┘
                                          │  Mongoose ODM
                                          ▼
                          ┌─────────────────────────────────────────┐
                          │   MongoDB (localhost:27017/projectdb)   │
                          │  users docters patients appointments    │
                          │  invoices prescriptions medicalrecords  │
                          │  departments medicines notifications    │
                          │  activitylogs ratings                   │
                          └─────────────────────────────────────────┘
```
