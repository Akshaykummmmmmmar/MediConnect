import { useEffect, useState } from 'react';
import axios from '../../../../utils/axios';
import { toast } from 'react-toastify';
import { 
  User, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Search,
  Star,
  IndianRupee
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
  const [bookedSlots, setBookedSlots] = useState({});
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [speciality, setSpeciality] = useState('');

  const patientId = localStorage.getItem('userId');

  const specialities = [...new Set(
    (doctorsList || []).map(d => d.specialization).filter(Boolean)
  )];

  const filteredDoctors = (doctorsList || []).filter(d => {
    const matchesSpeciality = !speciality || d.specialization === speciality;
    return matchesSpeciality;
  });

  const selectedDoctor = doctorsList.find(d => d._id === appointment.doctor);

  const onDoctorChange = e => {
    setAppointment({ doctor: e.target.value, date: '', slot: '' });
    setBookedSlots({});
    setAvailableTimes([]);
  };

  const onDateChange = e => {
    setAppointment({ ...appointment, date: e.target.value, slot: '' });
  };

  const selectSlot = time => {
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
      setAppointment({ doctor: '', date: '', slot: '' });
      setBookedSlots({});
      setAvailableTimes([]);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const getSlots = async () => {
    if (!appointment.doctor) {
      setAvailableDates([]);
      setAvailableTimes([]);
      setBookedSlots({});
      return;
    }
    try {
      setSlotsLoading(true);
      const res = await axios.get(
        `/book/appointment-slots?doctorId=${appointment.doctor}`
      );
      setAvailableDates(res.data.dates || []);
      setAvailableTimes(res.data.times || []);
      setBookedSlots(res.data.booked || {});
    } catch (e) {
      console.error('Error fetching slots:', e);
      toast.error(e.response?.data?.message || 'Could not load slots');
    } finally {
      setSlotsLoading(false);
    }
  };

  const getList = async (searchTerm = '') => {
    try {
      const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}&page=1&limit=50` : '?page=1&limit=50';
      const response = await axios.get(`/doctors/get${query}`);
      setDoctorList(response.data.items || response.data || []);
    } catch (e) {
      console.error('Error fetching doctors:', e);
    }
  };

  useEffect(() => {
    getList('');
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      getList(search.trim());
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [search]);

  useEffect(() => {
    if (appointment.doctor && !doctorsList.some(d => d._id === appointment.doctor)) {
      setAppointment({ doctor: '', date: '', slot: '' });
      setBookedSlots({});
      setAvailableTimes([]);
    }
  }, [doctorsList]);

  useEffect(() => {
    getSlots();
  }, [appointment.doctor]);

  const isDateDisabled = date => {
    const booked = bookedSlots[date] || [];
    return booked.length >= availableTimes.length && availableTimes.length > 0;
  };

  return (
    <div className="booking-page-container">
      
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
              <div className="booking-search-row">
                <div className="booking-search-input">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search by name or specialization..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className="booking-speciality-filter"
                  value={speciality}
                  onChange={e => setSpeciality(e.target.value)}
                >
                  <option value="">All Specializations</option>
                  {specialities.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <select value={appointment.doctor} onChange={onDoctorChange}>
                <option value="">Choose a doctor...</option>
                {filteredDoctors.map(item => (
                  <option key={item._id} value={item._id}>
                    Dr. {item.user?.name || 'Doctor'} - {item.specialization || 'General'}
                    {item.avgRating ? ` (${item.avgRating}★)` : ''}
                  </option>
                ))}
              </select>
              {filteredDoctors.length === 0 && doctorsList.length > 0 && (
                <p className="no-slots">No doctors match your search.</p>
              )}

              {selectedDoctor && (
                <div className="selected-doctor-card">
                  <div>
                    <strong>Dr. {selectedDoctor.user?.name}</strong>
                    <span>{selectedDoctor.specialization} · {selectedDoctor.department?.name}</span>
                  </div>
                  <div className="selected-doctor-meta">
                    <span><Star size={14} /> {selectedDoctor.avgRating || 'New'}</span>
                    <span><IndianRupee size={14} /> {selectedDoctor.consultationFee || '—'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Date */}
          <div className="booking-step">
            <div className="step-number">02</div>
            <div className="step-content">
              <label><CalendarIcon size={18} /> Preferred Date</label>
              {appointment.doctor ? (
                <select value={appointment.date} onChange={onDateChange}>
                  <option value="">Choose a date...</option>
                  {availableDates.map(d => (
                    <option
                      key={d}
                      value={d}
                      disabled={isDateDisabled(d)}
                    >
                      {new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      {isDateDisabled(d) ? ' (Fully booked)' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <select disabled>
                  <option>Select a doctor first</option>
                </select>
              )}
            </div>
          </div>

          {/* Step 3: Time Slot */}
          <div className="booking-step">
            <div className="step-number">03</div>
            <div className="step-content">
              <label><Clock size={18} /> Available Time Slots</label>
              {slotsLoading ? (
                <p className="no-slots">Loading slots...</p>
              ) : appointment.doctor && appointment.date ? (
                <div className="slots-grid">
                  {availableTimes.length > 0 ? (
                    availableTimes.map(t => {
                      const isBooked = (bookedSlots[appointment.date] || []).includes(t);
                      return (
                        <button 
                          key={t} 
                          className={`slot-chip ${appointment.slot === t ? 'active' : ''} ${isBooked ? 'disabled' : ''}`}
                          onClick={() => !isBooked && selectSlot(t)}
                          disabled={isBooked}
                        >
                          {t}
                          {isBooked && ' (Booked)'}
                          {appointment.slot === t && <CheckCircle size={14} className="slot-check" />}
                        </button>
                      );
                    })
                  ) : (
                    <p className="no-slots">No slots available for this day.</p>
                  )}
                </div>
              ) : (
                <p className="no-slots">Please select a doctor and date first.</p>
              )}
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
                {selectedDoctor?.user?.name ? `Dr. ${selectedDoctor.user.name}` : '--'}
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
            <div className="summary-item">
              <span className="summary-label">Consultation Fee</span>
              <span className="summary-value">
                {selectedDoctor?.consultationFee ? `₹${selectedDoctor.consultationFee}` : '--'}
              </span>
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
