import { Routes, Route } from 'react-router-dom';
import Home from './components/pages/Home/home';
import About from './components/pages/About/about';
import Services from './components/pages/Services/services';
import Sign from './components/pages/Sign/sign';
import Login from './components/pages/Login/login';
import Admin from './components/pages/Admin/admin';
import Doctor from './components/pages/Docter/docter';
import Patient from './components/pages/Patient/patient';
import AdminHome from './components/pages/Admin/pages/adminHome';
import Department from './components/pages/Admin/pages/departmentHome';
import DoctorDash from './components/pages/Admin/pages/doctorsHome';
import Patients from './components/pages/Admin/pages/patientHome';
import Appointment from './components/pages/Admin/pages/appointmentHome';
import DoctorDashboard from './components/pages/Docter/pages/doctorDashboard';
import DoctorAppointments from './components/pages/Docter/pages/doctorAppointments';
import DoctorProfile from './components/pages/Docter/pages/doctorProfile';
import AppointmentToday from './components/pages/Docter/pages/appointmentToday';
import PatientsDashboard from './components/pages/Patient/pages/patientDashboard';
import BookAppointments from './components/pages/Patient/pages/patientsAppoinments';
import PatientProfile from './components/pages/Patient/pages/patientProfile';
import MyAppointments from './components/pages/Patient/pages/myAppointment';
import Prescriptions from './components/pages/Patient/pages/prescriptions';
import ViewMedicine from './components/pages/Admin/pages/viewMedicine';
import AddMedicine from './components/pages/Admin/pages/addMedicine';
import AddDoctor from './components/pages/Admin/pages/addDoctor';
import PrivateRoute from './components/PrivateRoute/privateRoute';
import './App.css';

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/signUP" element={<Sign />} />
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route path="/admin" element={<Admin />}>
            <Route index element={<AdminHome />} />
            <Route path="department/dash" element={<Department />} />
            <Route path="doctor/dash" element={<DoctorDash />} />
            <Route path="patient/dash" element={<Patients />} />
            <Route path="appointment/dash" element={<Appointment />} />
            <Route path="medicines/dash" element={<ViewMedicine />} />
            <Route path="/admin/addMedicine" element={<AddMedicine />} />
            <Route path="/admin/add/doctor" element={<AddDoctor />} />
          </Route>
          <Route path="/doctor" element={<Doctor />}>
            <Route index element={<DoctorDashboard />} />
            <Route
              path="doctor/appointments"
              element={<DoctorAppointments />}
            />
            <Route
              path="doctor/appointment/today"
              element={<AppointmentToday />}
            />
            <Route path="doctor/profile/dash" element={<DoctorProfile />} />
          </Route>
          <Route path="/patient" element={<Patient />}>
            <Route index element={<PatientsDashboard />} />
            <Route
              path="patient/appointments/dash"
              element={<BookAppointments />}
            />
            <Route
              path="patient/myappointments/dash"
              element={<MyAppointments />}
            />
            <Route
              path="patient/prescriptions/dash"
              element={<Prescriptions />}
            />
            <Route path="patient/profile/dash" element={<PatientProfile />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
};

export default App;
