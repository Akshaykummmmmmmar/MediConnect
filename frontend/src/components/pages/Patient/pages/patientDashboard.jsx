import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../../utils/axios';
import { 
  Calendar, 
  FileText, 
  User, 
  Clock, 
  ArrowRight,
  Activity,
  CheckCircle2
} from 'lucide-react';
import './patientDashboard.css';

const PatientsDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ appointments: 0, prescriptions: 0 });
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  const name = localStorage.getItem('name');
  const patientId = localStorage.getItem('userId');

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch appointments to get count and upcoming
      const apptRes = await axios.get(`/patient/${patientId}`);
      const appointments = apptRes.data || [];
      
      // Fetch prescriptions to get count
      const prescRes = await axios.get(`/get/prescriptions/patients/${patientId}`);
      const prescriptions = prescRes.data || [];

      setStats({
        appointments: appointments.length,
        prescriptions: prescriptions.length
      });

      // Filter upcoming appointments (simulated logic: first 3)
      setUpcoming(appointments.slice(0, 3));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="patientsDashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {name}!</h1>
          <p>Monitor your health and upcoming consultations.</p>
        </div>
        <div className="header-badge">
          <Activity size={16} />
          <span>Patient Portal</span>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card" onClick={() => navigate('/patient/myappointments/dash')}>
          <div className="stat-icon appointment-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.appointments}</h3>
            <p>Total Appointments</p>
          </div>
          <ArrowRight className="card-arrow" size={18} />
        </div>

        <div className="stat-card" onClick={() => navigate('/patient/prescriptions/dash')}>
          <div className="stat-icon prescription-icon">
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.prescriptions}</h3>
            <p>My Prescriptions</p>
          </div>
          <ArrowRight className="card-arrow" size={18} />
        </div>

        <div className="stat-card" onClick={() => navigate('/patient/profile/dash')}>
          <div className="stat-icon profile-icon">
            <User size={24} />
          </div>
          <div className="stat-info">
            <h3>Profile</h3>
            <p>View Details</p>
          </div>
          <ArrowRight className="card-arrow" size={18} />
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="upcoming-appointments-section">
          <div className="section-header">
            <h2>Upcoming Appointments</h2>
            <button onClick={() => navigate('/patient/myappointments/dash')}>View All</button>
          </div>
          
          <div className="appointments-list">
            {loading ? (
              <p className="loading-text">Loading appointments...</p>
            ) : upcoming.length > 0 ? (
              upcoming.map((appt) => (
                <div key={appt._id} className="appointment-item">
                  <div className="appt-date-box">
                    <span className="appt-day">{appt.date.split('-')[2]}</span>
                    <span className="appt-month">{new Date(appt.date).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div className="appt-details">
                    <h4>Dr. {appt.doctor?.user?.name || 'Doctor'}</h4>
                    <div className="appt-meta">
                      <span><Clock size={14} /> {appt.time}</span>
                      <span className="status-badge upcoming">Confirmed</span>
                    </div>
                  </div>
                  <CheckCircle2 className="appt-check" size={20} />
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No upcoming appointments found.</p>
                <button onClick={() => navigate('/patient/patient/appointments/dash')}>Book Now</button>
              </div>
            )}
          </div>
        </div>

        <div className="quick-actions-section">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn primary" onClick={() => navigate('/patient/patient/appointments/dash')}>
              <Calendar size={18} />
              Book Appointment
            </button>
            <button className="action-btn secondary" onClick={() => navigate('/patient/prescriptions/dash')}>
              <FileText size={18} />
              Recent Prescription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientsDashboard;
