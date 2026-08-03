import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../../utils/axios';
import { ToastContainer, toast } from 'react-toastify';
import { 
  Users, 
  Activity, 
  Calendar,
  ArrowRight,
  Shield,
  Stethoscope,
  Plus
} from 'lucide-react';
import './adminHome.css';

const AdminHome = () => {
  const navigate = useNavigate();
  const [doctorCount, setDoctorCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);

  const onDoctorClick = () => navigate('doctor/dash');
  const onPatientClick = () => navigate('patient/dash');
  const onAppoinmentClick = () => navigate('appointment/dash');

  const getCount = async () => {
    try {
      const response = await axios.get('/doctors/count');
      setDoctorCount(response.data.doctors);
      setPatientCount(response.data.patients);
      setAppointmentCount(response.data.appointments);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  useEffect(() => {
    getCount();
  }, []);

  return (
    <div className="adminDashboard-container">
      <ToastContainer />
      <div className="dashboard-header">
        <div>
          <h1>Welcome, Admin!</h1>
          <p>Here's a quick overview of your system.</p>
        </div>
        <div className="header-badge">
          <Shield size={16} />
          <span>Admin Portal</span>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card" onClick={onDoctorClick}>
          <div className="stat-icon doctor-icon">
            <Stethoscope size={24} />
          </div>
          <div className="stat-info">
            <h3>{doctorCount}</h3>
            <p>Total Doctors</p>
          </div>
          <ArrowRight className="card-arrow" size={18} />
        </div>

        <div className="stat-card" onClick={onPatientClick}>
          <div className="stat-icon patient-icon">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{patientCount}</h3>
            <p>Total Patients</p>
          </div>
          <ArrowRight className="card-arrow" size={18} />
        </div>

        <div className="stat-card" onClick={onAppoinmentClick}>
          <div className="stat-icon appointment-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>{appointmentCount}</h3>
            <p>Total Appointments</p>
          </div>
          <ArrowRight className="card-arrow" size={18} />
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="recent-activities-section">
          <div className="section-header">
            <h2>Recent Activities</h2>
            <button onClick={() => navigate('appointment/dash')}>View All</button>
          </div>
          
          <div className="activities-list">
            <div className="activity-item">
              <div className="activity-icon-box">
                <Stethoscope size={20} />
              </div>
              <div className="activity-details">
                <h4>Dr. John Doe approved today</h4>
                <div className="activity-meta">
                  <span>System Activity</span>
                  <span className="status-badge upcoming">Success</span>
                </div>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-icon-box">
                <Calendar size={20} />
              </div>
              <div className="activity-details">
                <h4>Patient Jane Smith booked an appointment</h4>
                <div className="activity-meta">
                  <span>Appointment</span>
                  <span className="status-badge upcoming">New</span>
                </div>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-icon-box">
                <Activity size={20} />
              </div>
              <div className="activity-details">
                <h4>New doctor request pending approval</h4>
                <div className="activity-meta">
                  <span>Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="quick-actions-section">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn primary" onClick={() => navigate('add/doctor')}>
              <Plus size={18} />
              Add New Doctor
            </button>
            <button className="action-btn secondary" onClick={() => navigate('add/medicine')}>
              <Plus size={18} />
              Add Medicine
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
