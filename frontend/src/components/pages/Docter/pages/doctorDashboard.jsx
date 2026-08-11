import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../../utils/axios';
import { toast } from 'react-toastify';
import { 
  Users, 
  Calendar,
  ArrowRight,
  Stethoscope,
  CheckCircle2,
  Clock,
  CalendarClock,
  Star
} from 'lucide-react';
import './doctorDashboard.css';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [patientCount, setPatientCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const name = localStorage.getItem('name');
  const doctorId = localStorage.getItem('doctorId');

  const onAppoinmentClick = () => {
    navigate('/doctor/appointments');
  };

  const getDashboardData = async () => {
    try {
      setLoading(true);
      const [countRes, apptRes] = await Promise.all([
        axios.get('/doctors/count'),
        axios.get(`/doctor/${doctorId}?limit=5`),
      ]);
      setPatientCount(countRes.data.patients);

      const items = apptRes.data?.items || [];
      setAppointmentCount(apptRes.data?.total ?? items.length);
      setRecent(items);

      const today = new Date().toISOString().split('T')[0];
      setTodayCount(items.filter(a => a.date?.split('T')[0] === today).length);

      try {
        const rateRes = await axios.get(`/ratings/doctor/${doctorId}`);
        setAvgRating(rateRes.data.average || 0);
      } catch (e) {
        setAvgRating(0);
      }
    } catch (e) {
      if (e.response?.data?.message) {
        toast.error(e.response.data.message);
      } else {
        toast.error(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  return (
    <div className="doctorDashboard-container">
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
            <h3>{loading ? '…' : appointmentCount}</h3>
            <p>Total Appointments</p>
          </div>
          <ArrowRight className="card-arrow" size={18} />
        </div>

        <div className="stat-card" onClick={() => navigate('/doctor/today')}>
          <div className="stat-icon today-icon">
            <CalendarClock size={24} />
          </div>
          <div className="stat-info">
            <h3>{loading ? '…' : todayCount}</h3>
            <p>Today</p>
          </div>
          <ArrowRight className="card-arrow" size={18} />
        </div>

        <div className="stat-card">
          <div className="stat-icon rating-icon">
            <Star size={24} />
          </div>
          <div className="stat-info">
            <h3>{avgRating || '—'}</h3>
            <p>Avg Rating</p>
          </div>
          <ArrowRight className="card-arrow" size={18} />
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="recent-activities-section">
          <div className="section-header">
            <h2>Recent Appointments</h2>
            <button onClick={onAppoinmentClick}>View All</button>
          </div>
          
          <div className="activities-list">
            {loading ? (
              <div className="activity-item">
                <div className="activity-details">
                  <h4>Loading appointments...</h4>
                </div>
              </div>
            ) : recent.length === 0 ? (
              <div className="activity-item">
                <div className="activity-details">
                  <h4>No appointments yet</h4>
                </div>
              </div>
            ) : (
              recent.map(a => (
                <div className="activity-item" key={a._id}>
                  <div className="activity-icon-box">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="activity-details">
                    <h4>{a.patient?.name || 'Patient'} — {a.date} at {a.time}</h4>
                    <div className="activity-meta">
                      <span>{a.status}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="quick-actions-section">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn primary" onClick={onAppoinmentClick}>
              <Calendar size={18} />
              View Appointments
            </button>
            <button className="action-btn secondary" onClick={() => navigate('/doctor/today')}>
              <Clock size={18} />
              Today's Schedule
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
