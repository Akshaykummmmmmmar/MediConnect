import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from '../../../../utils/axios';
import { Calendar } from 'lucide-react';
import './appointmentHome.css';

const Appointment = () => {
  const [appointment, setAppointment] = useState([]);

  const getAppointments = async () => {
    try {
      const response = await axios.get('/get/all/appointments');
      setAppointment(response.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to fetch appointments');
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  return (
    <div className="admin-page-container">
      <ToastContainer />
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={28} style={{ color: 'var(--primary)' }} />
          <h2>All Appointments</h2>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Patient Contact</th>
              <th>Doctor</th>
              <th>Doctor Contact</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointment.map(item => (
              <tr key={item._id}>
                <td><strong>{item.patient?.name}</strong></td>
                <td>{item.patient?.email}</td>
                <td><strong>Dr. {item.doctor?.user?.name}</strong></td>
                <td>{item.doctor?.user?.email}</td>
                <td>{item.date}</td>
                <td>{item.time}</td>
                <td>
                  <span className="status-badge status-upcoming">
                    Scheduled
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {appointment.length === 0 && (
          <div className="empty-state-message">
            No appointments have been booked yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointment;
