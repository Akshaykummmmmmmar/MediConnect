import { useEffect, useState } from 'react';
import notify from '../../../../utils/toast';
import axios from '../../../../utils/axios';
import { ListCollapse, CheckCircle2, UserX, CheckSquare } from 'lucide-react';
import Pagination from '../../../Pagination/pagination';
import './doctorAppointments.css';

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

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const doctorId = localStorage.getItem('doctorId');
  const [confirmModal, setConfirmModal] = useState(null);
  const [selected, setSelected] = useState([]);

  const getAppointments = async () => {
    if (!doctorId) return notify.error('Doctor not found');
    try {
      const response = await axios.get(`/doctor/${doctorId}?page=${page}&limit=10`);
      setAppointments(response.data.items || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (e) {
      notify.error(e.response?.data?.message || e.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/appointment/${id}/status`, { status });
      notify.success(`Appointment marked as ${status}`);
      setConfirmModal(null);
      getAppointments();
    } catch (e) {
      notify.error(e.response?.data?.message || e.message);
    }
  };

  const toggleSelect = id => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selected.length === appointments.length) {
      setSelected([]);
    } else {
      setSelected(appointments.map(a => a._id));
    }
  };

  const bulkUpdate = async (status, actionLabel) => {
    if (selected.length === 0) return notify.warning('Select at least one appointment');
    try {
      for (const id of selected) {
        await axios.patch(`/appointment/${id}/status`, { status });
      }
      notify.success(`${selected.length} appointment(s) marked as ${actionLabel}`);
      setSelected([]);
      getAppointments();
    } catch (e) {
      notify.error(e.response?.data?.message || e.message);
    }
  };

  useEffect(() => {
    setSelected([]);
    getAppointments();
  }, [page]);

  const pendingRows = appointments.filter(a => ['Pending', 'Booked'].includes(a.status));

  return (
    <div className="doctorDashboard-container">
      
      <div className="dashboard-header">
        <div>
          <h1>All Appointments History</h1>
          <p>A complete log of all your patient appointments.</p>
        </div>
        <div className="header-badge">
          <ListCollapse size={16} />
          <span>History Log</span>
        </div>
      </div>

      <div className="bulk-bar">
        <label className="bulk-select-all">
          <input
            type="checkbox"
            checked={selected.length > 0 && selected.length === appointments.length}
            onChange={toggleAll}
          />
          <span>Select all on page ({appointments.length})</span>
        </label>
        <span className="bulk-count">{selected.length} selected</span>
        <div className="bulk-actions">
          <button
            className="bulk-btn confirm"
            disabled={selected.length === 0 || pendingRows.length === 0}
            onClick={() => bulkUpdate('Confirmed', 'Confirmed')}
          >
            <CheckCircle2 size={15} /> Confirm Selected
          </button>
          <button
            className="bulk-btn noshow"
            disabled={selected.length === 0}
            onClick={() => bulkUpdate('No-show', 'No-show')}
          >
            <UserX size={15} /> No-show Selected
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <CheckSquare size={15} />
              </th>
              <th>Patient Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(item => (
              <tr key={item._id} className={selected.includes(item._id) ? 'row-selected' : ''}>
                <td className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={selected.includes(item._id)}
                    onChange={() => toggleSelect(item._id)}
                    aria-label={`Select ${item.patient?.name}`}
                  />
                </td>
                <td><strong>{item.patient?.name}</strong></td>
                <td>{item.date}</td>
                <td>{item.time}</td>
                <td>
                  <span className={`status-badge ${statusClass(item.status)}`}>
                    {item.status || 'Pending'}
                  </span>
                </td>
                <td>
                  {['Pending', 'Booked'].includes(item.status) && (
                    <button
                      className="confirm-slot-btn"
                      onClick={() => updateStatus(item._id, 'Confirmed')}
                      title="Confirm appointment"
                    >
                      <CheckCircle2 size={16} /> Confirm
                    </button>
                  )}
                  {['Confirmed'].includes(item.status) && (
                    <button
                      className="noshow-slot-btn"
                      onClick={() => setConfirmModal(item)}
                      title="Mark as no-show"
                    >
                      <UserX size={16} /> No-show
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {appointments.length === 0 && (
          <div className="empty-state-placeholder">
            No appointments found in your history.
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {confirmModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-card">
            <UserX className="modal-icon-warning" size={48} />
            <h3>Mark as No-show?</h3>
            <p>This appointment will be marked as No-show for {confirmModal.patient?.name}.</p>
            <div className="modal-actions-grid">
              <button className="modal-btn-cancel" onClick={() => setConfirmModal(null)}>
                Cancel
              </button>
              <button
                className="modal-btn-confirm"
                onClick={() => updateStatus(confirmModal._id, 'No-show')}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
