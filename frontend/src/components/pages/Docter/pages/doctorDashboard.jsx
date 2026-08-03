import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../../utils/axios';
import { ToastContainer, toast } from 'react-toastify';
import { 
  Users, 
  Activity, 
  Calendar,
  ArrowRight,
  Stethoscope,
  CheckCircle2,
  Clock
} from 'lucide-react';
import './doctorDashboard.css';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [patientCount, setPatientCount] = useState(0);
  const name = localStorage.getItem('name');

  const onAppoinmentClick = () => {
    navigate('doctor/appointments');
  };

  const getCount = async () => {
    try {
      const response = await axios.get('/doctors/count');
      setPatientCount(response.data.patients);
    } catch (e) {
      if (e.response?.data?.message) {
        toast.error(e.response.data.message);
      } else {
        toast.error(e.message);
      }
    }
  };

  useEffect(() => {
    getCount();
  }, []);

  return (
    <div className="doctorDashboard-container">
      <ToastContainer />
      <div className="dashboard-header">
        <div>
          <h1>Welcome, Dr. {name}!</h1>
          <p>Here's a quick overview of your system.</p>
        </div>
        <div className="header-badge">
          <Stethoscope size={16} />
          <span>Doctor Portal</span>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
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
            <h3>23</h3>
            <p>Appointments</p>
          </div>
          <ArrowRight className="card-arrow" size={18} />
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="recent-activities-section">
          <div className="section-header">
            <h2>Recent Messages & Activity</h2>
            <button onClick={onAppoinmentClick}>View All</button>
          </div>
          
          <div className="activities-list">
            <div className="activity-item">
              <div className="activity-icon-box">
                <CheckCircle2 size={20} />
              </div>
              <div className="activity-details">
                <h4>Dr. John Doe approved today</h4>
                <div className="activity-meta">
                  <span>System</span>
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
                  <span>New Booking</span>
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
                  <span>Action Required</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="quick-actions-section">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn primary" onClick={onAppoinmentClick}>
              <Calendar size={18} />
              View Appointments
            </button>
            <button className="action-btn secondary" onClick={() => navigate('/doctor/profile')}>
              <Users size={18} />
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
