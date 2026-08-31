import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import PrivateRoute from './components/PrivateRoute/privateRoute';
import './App.css';

const Home = lazy(() => import('./components/pages/Home/home'));
const About = lazy(() => import('./components/pages/About/about'));
const Services = lazy(() => import('./components/pages/Services/services'));
const Sign = lazy(() => import('./components/pages/Sign/sign'));
const Login = lazy(() => import('./components/pages/Login/login'));
const VerifyOtp = lazy(() => import('./components/pages/VerifyOtp/verifyOtp'));
const ForgotPassword = lazy(() => import('./components/pages/ForgotPassword/forgotPassword'));
const ResetPassword = lazy(() => import('./components/pages/ResetPassword/resetPassword'));

const Admin = lazy(() => import('./components/pages/Admin/admin'));
const Doctor = lazy(() => import('./components/pages/Docter/docter'));
const Patient = lazy(() => import('./components/pages/Patient/patient'));

const AdminHome = lazy(() => import('./components/pages/Admin/pages/adminHome'));
const Department = lazy(() => import('./components/pages/Admin/pages/departmentHome'));
const DoctorDash = lazy(() => import('./components/pages/Admin/pages/doctorsHome'));
const Patients = lazy(() => import('./components/pages/Admin/pages/patientHome'));
const Appointment = lazy(() => import('./components/pages/Admin/pages/appointmentHome'));
const ViewMedicine = lazy(() => import('./components/pages/Admin/pages/viewMedicine'));
const AddMedicine = lazy(() => import('./components/pages/Admin/pages/addMedicine'));
const AddDoctor = lazy(() => import('./components/pages/Admin/pages/addDoctor'));
const AnalyticsHome = lazy(() => import('./components/pages/Admin/pages/analyticsHome'));
const InvoiceHome = lazy(() => import('./components/pages/Admin/pages/invoiceHome'));
const LogsHome = lazy(() => import('./components/pages/Admin/pages/logsHome'));

const DoctorDashboard = lazy(() => import('./components/pages/Docter/pages/doctorDashboard'));
const DoctorAppointments = lazy(() => import('./components/pages/Docter/pages/doctorAppointments'));
const DoctorProfile = lazy(() => import('./components/pages/Docter/pages/doctorProfile'));
const AppointmentToday = lazy(() => import('./components/pages/Docter/pages/appointmentToday'));
const DoctorAvailability = lazy(() => import('./components/pages/Docter/pages/doctorAvailability'));
const DoctorCalendar = lazy(() => import('./components/pages/Docter/pages/doctorCalendar'));

const PatientsDashboard = lazy(() => import('./components/pages/Patient/pages/patientDashboard'));
const BookAppointments = lazy(() => import('./components/pages/Patient/pages/patientsAppoinments'));
const PatientProfile = lazy(() => import('./components/pages/Patient/pages/patientProfile'));
const MyAppointments = lazy(() => import('./components/pages/Patient/pages/myAppointment'));
const Prescriptions = lazy(() => import('./components/pages/Patient/pages/prescriptions'));
const MedicalRecords = lazy(() => import('./components/pages/Patient/pages/medicalRecords'));
const PatientInvoices = lazy(() => import('./components/pages/Patient/pages/patientInvoices'));

const Loading = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-muted)' }}>
    Loading...
  </div>
);

const App = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={2500}
        limit={3}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/signUP" element={<Sign />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<PrivateRoute />}>
          <Route path="/admin" element={<Admin />}>
            <Route index element={<AdminHome />} />
            <Route path="departments" element={<Department />} />
            <Route path="doctors" element={<DoctorDash />} />
            <Route path="patients" element={<Patients />} />
            <Route path="appointments" element={<Appointment />} />
            <Route path="medicines" element={<ViewMedicine />} />
            <Route path="medicines/add" element={<AddMedicine />} />
            <Route path="doctors/add" element={<AddDoctor />} />
            <Route path="analytics" element={<AnalyticsHome />} />
            <Route path="invoices" element={<InvoiceHome />} />
            <Route path="logs" element={<LogsHome />} />
          </Route>

          <Route path="/doctor" element={<Doctor />}>
            <Route index element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="calendar" element={<DoctorCalendar />} />
            <Route path="today" element={<AppointmentToday />} />
            <Route path="profile" element={<DoctorProfile />} />
            <Route path="availability" element={<DoctorAvailability />} />
          </Route>

          <Route path="/patient" element={<Patient />}>
            <Route index element={<PatientsDashboard />} />
            <Route path="appointments" element={<BookAppointments />} />
            <Route path="my-appointments" element={<MyAppointments />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            <Route path="records" element={<MedicalRecords />} />
            <Route path="invoices" element={<PatientInvoices />} />
            <Route path="profile" element={<PatientProfile />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
