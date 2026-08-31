import { useEffect, useState } from 'react';
import axios from '../../../../utils/axios';
import notify from '../../../../utils/toast';
import { 
  Calendar, 
  Clock, 
  User, 
  XCircle, 
  AlertTriangle,
  ChevronRight,
  Star,
  CalendarCheck
} from 'lucide-react';
import Pagination from '../../../Pagination/pagination';
import './myAppointments.css';

const statusClass = status => {
  switch (status) {
    case 'Completed':
      return 'status-completed';
    case 'Confirmed':
      return 'status-confirmed';
    case 'Cancelled':
      return 'status-cancelled';
    case 'No-show':
      return 'status-no-show';
    default:
      return 'status-pending';
  }
};

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [modal, openModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [ratingModal, setRatingModal] = useState(false);
  const [rateAppointment, setRateAppointment] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');

  const patientId = localStorage.getItem('userId');

  const canCancel = status => ['Pending', 'Confirmed', 'Booked'].includes(status);

  const onCancelAppointment = async id => {
    try {
      await axios.delete(`/cancel/${id}`);
      notify.success('Appointment cancelled successfully');
      setAppointments(appointments.filter(item => item._id !== id));
      openModal(false);
    } catch (e) {
      notify.error(e.response?.data?.message || e.message);
    }
  };

  const openRate = item => {
    setRateAppointment(item);
    setRating(0);
    setReview('');
    setRatingModal(true);
  };

  const submitRating = async () => {
    if (rating < 1) return notify.warning('Please select a rating');
    try {
      await axios.post('/ratings', {
        doctor: rateAppointment.doctor?._id,
        patient: patientId,
        appointment: rateAppointment._id,
        rating,
        review,
      });
      notify.success('Thank you for your feedback!');
      setRatingModal(false);
      setRateAppointment(null);
    } catch (e) {
      notify.error(e.response?.data?.message || e.message);
    }
  };

  const getAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/patient/${patientId}?page=${page}&limit=10`);
      setAppointments(res.data.items || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (e) {
      notify.error(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAppointments();
  }, [page]);

  return (
    <div className="myappointments-page-container">
      
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
          <>
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
                        <span className={`status-badge ${statusClass(item.status)}`}>
                          {item.status || 'Pending'}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="action-btns-group">
                          {item.status === 'Completed' && (
                            <button
                              className="rate-action-btn"
                              onClick={() => openRate(item)}
                              title="Rate this doctor"
                            >
                              <Star size={16} />
                              Rate
                            </button>
                          )}
                          {canCancel(item.status) && (
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
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="list-footer-row">
              <span className="list-total-text">{total} appointment(s)</span>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
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

      {/* Cancel Confirmation Modal */}
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

      {/* Rating Modal */}
      {ratingModal && rateAppointment && (
        <div className="modal-overlay">
          <div className="modern-modal">
            <div className="modal-header-visual">
              <div className="warning-icon-circle rating-circle">
                <Star size={32} />
              </div>
            </div>
            <div className="modal-body">
              <h2>Rate Your Visit</h2>
              <p>How was your consultation with Dr. {rateAppointment.doctor?.user?.name}?</p>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map(num => (
                  <Star
                    key={num}
                    size={30}
                    className={`rating-star ${(hover || rating) >= num ? 'filled' : ''}`}
                    onMouseEnter={() => setHover(num)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(num)}
                  />
                ))}
              </div>
              <textarea
                className="review-input"
                placeholder="Share your experience (optional)"
                value={review}
                onChange={e => setReview(e.target.value)}
                maxLength={500}
                rows={3}
              />
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setRatingModal(false)}>
                Cancel
              </button>
              <button className="danger-btn rating-submit-btn" onClick={submitRating}>
                Submit Rating <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
