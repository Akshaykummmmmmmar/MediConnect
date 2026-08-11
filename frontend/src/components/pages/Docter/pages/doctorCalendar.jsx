import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from '../../../../utils/axios';
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  UserX,
} from 'lucide-react';
import './doctorCalendar.css';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const toISODate = d => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

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

const DoctorCalendar = () => {
  const doctorId = localStorage.getItem('doctorId');
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return start;
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAppointments = async () => {
    if (!doctorId) return toast.error('Doctor not found');
    try {
      setLoading(true);
      const response = await axios.get(`/doctor/${doctorId}?limit=200`);
      setAppointments(response.data.items || []);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  const changeWeek = dir => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + dir * 7);
    setWeekStart(next);
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/appointment/${id}/status`, { status });
      toast.success(`Appointment marked as ${status}`);
      getAppointments();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const appointmentsByDate = {};
  appointments.forEach(a => {
    const key = a.date?.split('T')[0];
    if (!key) return;
    if (!appointmentsByDate[key]) appointmentsByDate[key] = [];
    appointmentsByDate[key].push(a);
  });

  const weekLabel = `${days[0].toLocaleDateString()} – ${days[6].toLocaleDateString()}`;

  return (
    <div className="doctorCalendar-page">

      <div className="calendar-header">
        <div>
          <h1><CalendarRange size={22} /> Weekly Schedule</h1>
          <p>{weekLabel}</p>
        </div>
        <div className="calendar-nav">
          <button onClick={() => changeWeek(-1)} aria-label="Previous week">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => setWeekStart(() => {
            const now = new Date();
            now.setDate(now.getDate() - now.getDay());
            now.setHours(0, 0, 0, 0);
            return now;
          })}>
            Today
          </button>
          <button onClick={() => changeWeek(1)} aria-label="Next week">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading calendar...</div>
      ) : (
        <div className="calendar-grid">
          {days.map((day, idx) => {
            const key = toISODate(day);
            const dayAppointments = (appointmentsByDate[key] || []).sort((a, b) =>
              a.time.localeCompare(b.time)
            );
            const isToday = key === toISODate(new Date());
            return (
              <div className={`calendar-day ${isToday ? 'today' : ''}`} key={key}>
                <div className="calendar-day-header">
                  <span className="calendar-day-name">{WEEK_DAYS[day.getDay()]}</span>
                  <span className="calendar-day-date">{day.getDate()}</span>
                </div>
                <div className="calendar-day-body">
                  {dayAppointments.length === 0 ? (
                    <span className="calendar-empty">No appointments</span>
                  ) : (
                    dayAppointments.map(appt => (
                      <div
                        className={`calendar-appt ${statusClass(appt.status)}`}
                        key={appt._id}
                        title={`${appt.time} — ${appt.patient?.name} (${appt.status})`}
                      >
                        <div className="calendar-appt-top">
                          <strong>{appt.time}</strong>
                          <span className={`status-badge ${statusClass(appt.status)}`}>
                            {appt.status}
                          </span>
                        </div>
                        <span className="calendar-appt-patient">{appt.patient?.name || 'Patient'}</span>
                        {['Pending', 'Booked'].includes(appt.status) && (
                          <button
                            className="calendar-appt-confirm"
                            onClick={() => updateStatus(appt._id, 'Confirmed')}
                            title="Confirm"
                          >
                            <CheckCircle2 size={13} /> Confirm
                          </button>
                        )}
                        {appt.status === 'Confirmed' && (
                          <button
                            className="calendar-appt-noshow"
                            onClick={() => updateStatus(appt._id, 'No-show')}
                            title="Mark as no-show"
                          >
                            <UserX size={13} /> No-show
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorCalendar;
