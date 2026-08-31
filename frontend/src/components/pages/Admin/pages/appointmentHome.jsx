import { useEffect, useState } from 'react';
import notify from '../../../../utils/toast';
import axios from '../../../../utils/axios';
import { Calendar, CheckCircle2, UserX, XCircle, Download } from 'lucide-react';
import Pagination from '../../../Pagination/pagination';
import { exportCsv } from '../../../../utils/exportCsv';
import './appointmentHome.css';

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

const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');

  const getAppointments = async () => {
    try {
      const response = await axios.get(`/get/all/appointments?page=${page}&limit=10&status=${statusFilter}`);
      setAppointments(response.data.items || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (e) {
      notify.error(e.response?.data?.message || 'Failed to fetch appointments');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/appointment/${id}/status`, { status });
      notify.success(`Appointment marked as ${status}`);
      getAppointments();
    } catch (e) {
      notify.error(e.response?.data?.message || e.message);
    }
  };

  useEffect(() => {
    setPage(1);
    getAppointments();
  }, [statusFilter]);

  useEffect(() => {
    getAppointments();
  }, [page]);

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={28} style={{ color: 'var(--primary)' }} />
          <h2>All Appointments</h2>
        </div>
        <button
          className="admin-export-btn"
          onClick={() =>
            exportCsv('/export/appointments.csv', 'appointments.csv').catch(e =>
              notify.error(e.response?.data?.message || 'Export failed')
            )
          }
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="filter-row">
        {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled', 'No-show'].map(s => (
          <button
            key={s}
            className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </button>
        ))}
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
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(item => (
              <tr key={item._id}>
                <td><strong>{item.patient?.name}</strong></td>
                <td>{item.patient?.email}</td>
                <td><strong>Dr. {item.doctor?.user?.name}</strong></td>
                <td>{item.doctor?.user?.email}</td>
                <td>{item.date}</td>
                <td>{item.time}</td>
                <td>
                  <span className={`status-badge ${statusClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  {['Pending', 'Booked'].includes(item.status) && (
                    <button
                      type="button"
                      className="action-icon-btn confirm"
                      onClick={() => updateStatus(item._id, 'Confirmed')}
                      title="Confirm"
                      aria-label="Confirm appointment"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  )}
                  {['Confirmed'].includes(item.status) && (
                    <button
                      type="button"
                      className="action-icon-btn noshow"
                      onClick={() => updateStatus(item._id, 'No-show')}
                      title="No-show"
                      aria-label="Mark as no-show"
                    >
                      <UserX size={16} />
                    </button>
                  )}
                  {['Pending', 'Confirmed', 'Booked'].includes(item.status) && (
                    <button
                      type="button"
                      className="action-icon-btn cancel"
                      onClick={() => updateStatus(item._id, 'Cancelled')}
                      title="Cancel"
                      aria-label="Cancel appointment"
                    >
                      <XCircle size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {appointments.length === 0 && (
          <div className="empty-state-message">
            No appointments found.
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default Appointment;
