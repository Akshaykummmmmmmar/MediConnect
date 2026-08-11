import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from '../../../../utils/axios';
import { ListCollapse, CheckCircle2, UserX } from 'lucide-react';
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

  const getAppointments = async () => {
    if (!doctorId) return toast.error('Doctor not found');
    try {
      const response = await axios.get(`/doctor/${doctorId}?page=${page}&limit=10`);
      setAppointments(response.data.items || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/appointment/${id}/status`, { status });
      toast.success(`Appointment marked as ${status}`);
      setConfirmModal(null);
      getAppointments();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  useEffect(() => {
    getAppointments();
  }, [page]);

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

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Patient Name</th>
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
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
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
