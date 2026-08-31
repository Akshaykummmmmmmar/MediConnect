import { useEffect, useState } from 'react';
import notify from '../../../../utils/toast';
import axios from '../../../../utils/axios';
import { Clock3, CalendarDays, Save } from 'lucide-react';
import './doctorAvailability.css';

const DAY_OPTIONS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const DoctorAvailability = () => {
  const doctorId = localStorage.getItem('doctorId');
  const userId = localStorage.getItem('userId');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    workingDays: [1, 2, 3, 4, 5, 6],
    startTime: '09:00',
    endTime: '16:00',
    slotDuration: 60,
  });

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        let doctor = null;
        if (doctorId) {
          const res = await axios.get(`/doctors/get?page=1&limit=50`);
          doctor = (res.data.items || []).find(d => d._id === doctorId) || null;
        }
        if (!doctor && userId) {
          const res = await axios.get(`/doctor/byUser/${userId}`);
          doctor = res.data.doctor || res.data;
        }
        if (doctor?.availability) {
          setForm({
            workingDays: doctor.availability.workingDays || [1, 2, 3, 4, 5, 6],
            startTime: doctor.availability.startTime || '09:00',
            endTime: doctor.availability.endTime || '16:00',
            slotDuration: doctor.availability.slotDuration || 60,
          });
        }
      } catch (e) {
        notify.error(e.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, []);

  const toggleDay = day => {
    setForm(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const saveAvailability = async () => {
    if (form.workingDays.length === 0) {
      return notify.error('Select at least one working day');
    }
    if (form.endTime <= form.startTime) {
      return notify.error('End time must be after start time');
    }
    try {
      setSaving(true);
      const doctorIdToUpdate = doctorId;
      if (!doctorIdToUpdate) {
        const res = await axios.get(`/doctor/byUser/${userId}`);
        const id = res.data.doctor?._id || res.data._id;
        if (!id) return notify.error('Doctor not found');
        await axios.patch(`/doctor/update/${id}`, { availability: form });
      } else {
        await axios.patch(`/doctor/update/${doctorIdToUpdate}`, { availability: form });
      }
      notify.success('Availability updated successfully');
    } catch (e) {
      notify.error(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="doctor-availability-container">

      <div className="dashboard-header">
        <div>
          <h1>My Availability</h1>
          <p>Set your working days and consultation slot timing.</p>
        </div>
        <div className="header-badge">
          <Clock3 size={16} />
          <span>Weekly Schedule</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading availability...</div>
      ) : (
        <div className="availability-card">
          <div className="availability-section">
            <div className="availability-section-title">
              <CalendarDays size={18} />
              <h3>Working Days</h3>
            </div>
            <div className="day-checkboxes">
              {DAY_OPTIONS.map(day => (
                <label
                  key={day.value}
                  className={`day-chip ${form.workingDays.includes(day.value) ? 'active' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={form.workingDays.includes(day.value)}
                    onChange={() => toggleDay(day.value)}
                  />
                  {day.label}
                </label>
              ))}
            </div>
          </div>

          <div className="availability-section">
            <div className="availability-section-title">
              <Clock3 size={18} />
              <h3>Consultation Hours</h3>
            </div>
            <div className="time-inputs">
              <div className="time-field">
                <label>Start Time</label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={e => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div className="time-field">
                <label>End Time</label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={e => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
              <div className="time-field">
                <label>Slot Duration (minutes)</label>
                <select
                  value={form.slotDuration}
                  onChange={e => setForm({ ...form, slotDuration: Number(e.target.value) })}
                >
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>60 mins</option>
                  <option value={90}>90 mins</option>
                </select>
              </div>
            </div>
            <p className="availability-hint">
              Slots are generated automatically between start and end time based on the slot duration.
            </p>
          </div>

          <button
            className="save-availability-btn"
            onClick={saveAvailability}
            disabled={saving}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Availability'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorAvailability;
