import { useEffect, useState } from 'react';
import axios from '../../../../utils/axios';
import { ToastContainer, toast } from 'react-toastify';
import { 
  User, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import './patientsAppoinments.css';

const BookAppointments = () => {
  const [appointment, setAppointment] = useState({
    doctor: '',
    date: '',
    slot: '',
  });

  const [doctorsList, setDoctorList] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(false);

  const patientId = localStorage.getItem('userId');

  const onDoctorChange = (e) => {
    setAppointment({ ...appointment, doctor: e.target.value, slot: '' });
  };

  const onDateChange = (e) => {
    setAppointment({ ...appointment, date: e.target.value, slot: '' });
  };

  const selectSlot = (time) => {
    setAppointment({ ...appointment, slot: time });
  };

  const bookAppointment = async () => {
    if (!appointment.doctor || !appointment.date || !appointment.slot) {
      toast.warning('Please complete all selections');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/book/appointment', {
        doctorId: appointment.doctor,
        patientId: patientId,
        date: appointment.date,
        time: appointment.slot,
      });
      toast.success('Appointment booked successfully!');
      // Reset selection
      setAppointment({ doctor: '', date: '', slot: '' });
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const getSlots = async () => {
    try {
      const res = await axios.get('/book/appointment-slots');
      setAvailableDates(res.data.dates || []);
      setAvailableTimes(res.data.times || []);
    } catch (e) {
      console.error("Error fetching slots:", e);
    }
  };

  const getList = async () => {
    try {
      const response = await axios.get('/doctors/get');
      setDoctorList(response.data || []);
    } catch (e) {
      console.error("Error fetching doctors:", e);
    }
  };

  useEffect(() => {
    getList();
    getSlots();
  }, []);

  return (
    <div className="booking-page-container">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="booking-header">
        <h1>Book an Appointment</h1>
        <p>Follow the steps below to schedule your consultation.</p>
      </div>

      <div className="booking-layout">
        <div className="booking-steps-card">
          {/* Step 1: Doctor */}
          <div className="booking-step">
            <div className="step-number">01</div>
            <div className="step-content">
              <label><User size={18} /> Select Specialist</label>
              <select value={appointment.doctor} onChange={onDoctorChange}>
                <option value="">Choose a doctor...</option>
                {doctorsList.map(item => (
                  <option key={item._id} value={item._id}>
                    Dr. {item.user?.name || 'Doctor'} - {item.specialization || 'General'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 2: Date */}
          <div className="booking-step">
            <div className="step-number">02</div>
            <div className="step-content">
              <label><CalendarIcon size={18} /> Preferred Date</label>
              <select value={appointment.date} onChange={onDateChange}>
                <option value="">Choose a date...</option>
                {availableDates.map(d => {
                  const formattedDate = new Date(d).toISOString().split('T')[0];
                  return (
                    <option key={d} value={formattedDate}>
                      {new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Step 3: Time Slot */}
          <div className="booking-step">
            <div className="step-number">03</div>
            <div className="step-content">
              <label><Clock size={18} /> Available Time Slots</label>
              <div className="slots-grid">
                {availableTimes.length > 0 ? (
                  availableTimes.map(t => (
                    <button 
                      key={t} 
                      className={`slot-chip ${appointment.slot === t ? 'active' : ''}`}
                      onClick={() => selectSlot(t)}
                    >
                      {t}
                      {appointment.slot === t && <CheckCircle size={14} className="slot-check" />}
                    </button>
                  ))
                ) : (
                  <p className="no-slots">Please select a doctor and date first.</p>
                )}
              </div>
            </div>
          </div>

          <button 
            className="confirm-booking-btn" 
            onClick={bookAppointment}
            disabled={loading || !appointment.slot}
          >
            {loading ? 'Processing...' : 'Confirm Appointment'}
            {!loading && <ChevronRight size={20} />}
          </button>
        </div>

        <div className="booking-summary-card">
          <h3>Booking Summary</h3>
          <div className="summary-details">
            <div className="summary-item">
              <span className="summary-label">Doctor</span>
              <span className="summary-value">
                {doctorsList.find(d => d._id === appointment.doctor)?.user?.name ? `Dr. ${doctorsList.find(d => d._id === appointment.doctor).user.name}` : '--'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Date</span>
              <span className="summary-value">{appointment.date || '--'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Time</span>
              <span className="summary-value">{appointment.slot || '--'}</span>
            </div>
          </div>
          
          <div className="booking-info-box">
            <AlertCircle size={16} />
            <p>You can cancel or reschedule up to 24 hours before the appointment.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointments;
