import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../../utils/axios';
import { toast } from 'react-toastify';
import { 
  Users, 
  Activity, 
  Calendar,
  ArrowRight,
  Shield,
  Stethoscope,
  Plus,
  UserPlus,
  ClipboardList,
  CreditCard,
  Star,
} from 'lucide-react';
import './adminHome.css';

const activityIcon = action => {
  switch (action) {
    case 'REGISTERED':
    case 'LOGIN':
    case 'EMAIL_VERIFIED':
    case 'ADMIN_CREATED':
      return <UserPlus size={20} />;
    case 'DOCTOR_ADDED':
    case 'DOCTOR_UPDATED':
    case 'DOCTOR_DELETED':
      return <Stethoscope size={20} />;
    case 'APPOINTMENT_BOOKED':
    case 'APPOINTMENT_CANCELLED':
    case 'APPOINTMENT_STATUS_UPDATED':
      return <Calendar size={20} />;
    case 'PAYMENT_MADE':
    case 'INVOICE_CREATED':
      return <CreditCard size={20} />;
    case 'MEDICAL_RECORD_ADDED':
      return <ClipboardList size={20} />;
    case 'RATING_SUBMITTED':
      return <Star size={20} />;
    case 'MEDICINE_ADDED':
      return <Plus size={20} />;
    default:
      return <Activity size={20} />;
  }
};

const formatTime = timestamp => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
};

const AdminHome = () => {
  const navigate = useNavigate();
  const [doctorCount, setDoctorCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [activities, setActivities] = useState([]);

  const onDoctorClick = () => navigate('doctors');
  const onPatientClick = () => navigate('patients');
  const onAppoinmentClick = () => navigate('appointments');

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

  const getActivities = async () => {
    try {
      const response = await axios.get('/activity-logs?page=1&limit=4');
      setActivities(response.data.items || []);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  useEffect(() => {
    getCount();
    getActivities();
  }, []);

  return (
    <div className="adminDashboard-container">
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
            <button onClick={() => navigate('appointments')}>View All</button>
          </div>
          
          <div className="activities-list">
            {activities.length === 0 && (
              <div className="activity-item">
                <div className="activity-details">
                  <h4>No recent activity yet</h4>
                </div>
              </div>
            )}
            {activities.map((activity, idx) => (
              <div className="activity-item" key={activity._id || idx}>
                <div className="activity-icon-box">{activityIcon(activity.action)}</div>
                <div className="activity-details">
                  <h4>
                    {activity.details || `${activity.action.replaceAll('_', ' ')}`}
                  </h4>
                  <div className="activity-meta">
                    <span>{activity.user?.name || activity.role || 'System'}</span>
                    <span>{formatTime(activity.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="quick-actions-section">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn primary" onClick={() => navigate('doctors/add')}>
              <Plus size={18} />
              Add New Doctor
            </button>
            <button className="action-btn secondary" onClick={() => navigate('medicines/add')}>
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
