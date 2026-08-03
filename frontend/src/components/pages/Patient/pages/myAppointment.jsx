import { useEffect, useState } from 'react';
import axios from '../../../../utils/axios';
import { ToastContainer, toast } from 'react-toastify';
import { 
  Calendar, 
  Clock, 
  User, 
  XCircle, 
  AlertTriangle,
  ChevronRight,
  MoreVertical,
  CalendarCheck
} from 'lucide-react';
import './myAppointments.css';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [modal, openModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const patientId = localStorage.getItem('userId');

  const onCancelAppointment = async id => {
    try {
      await axios.delete(`/cancel/${id}`);
      toast.success('Appointment cancelled successfully');
      setAppointments(appointments.filter(item => item._id !== id));
      openModal(false);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  const getAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/patient/${patientId}`);
      setAppointments(res.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  return (
    <div className="myappointments-page-container">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="page-header">
        <div>
          <h1>My Appointments</h1>
          <p>Manage your upcoming and past consultations.</p>
        </div>
        <div className="header-icon">
          <CalendarCheck size={28} />
        </div>
      </div>

      <div className="appointments-card">
        {loading ? (
          <div className="loading-state">Loading your appointments...</div>
        ) : appointments.length > 0 ? (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Doctor Details</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(item => (
                  <tr key={item._id} className="table-row">
                    <td>
                      <div className="doctor-info-cell">
                        <div className="avatar-placeholder">
                          <User size={20} />
                        </div>
                        <div>
                          <span className="doctor-name">Dr. {item.doctor?.user?.name || 'Specialist'}</span>
                          <span className="doctor-specialty">{item.doctor?.specialization || 'Consultant'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="datetime-cell">
                        <span className="date-text"><Calendar size={14} /> {item.date}</span>
                        <span className="time-text"><Clock size={14} /> {item.time}</span>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge confirmed">Confirmed</span>
                    </td>
                    <td className="text-right">
                      <button
                        className="cancel-action-btn"
                        onClick={() => {
                          setSelectedId(item._id);
                          openModal(true);
                        }}
                      >
                        <XCircle size={16} />
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-appointments">
            <div className="empty-icon">
              <Calendar size={48} />
            </div>
            <h3>No appointments found</h3>
            <p>You haven't scheduled any consultations yet.</p>
          </div>
        )}
      </div>

      {/* Modern Confirmation Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modern-modal">
            <div className="modal-header-visual">
              <div className="warning-icon-circle">
                <AlertTriangle size={32} />
              </div>
            </div>
            <div className="modal-body">
              <h2>Cancel Appointment?</h2>
              <p>Are you sure you want to cancel this appointment? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => openModal(false)}>
                Keep Appointment
              </button>
              <button 
                className="danger-btn" 
                onClick={() => onCancelAppointment(selectedId)}
              >
                Yes, Cancel It
              </button>
            </div>
            <button className="modal-close-btn" onClick={() => openModal(false)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
