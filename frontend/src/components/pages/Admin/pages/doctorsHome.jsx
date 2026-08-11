import axios from '../../../../utils/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Plus, Trash2, AlertTriangle, Star, Download } from 'lucide-react';
import Pagination from '../../../Pagination/pagination';
import { exportCsv } from '../../../../utils/exportCsv';
import './doctorsHome.css';

const DoctorDash = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, openModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDoctors = async () => {
    try {
      const response = await axios.get(`/doctors/get?page=${page}&limit=10`);
      setDoctor(response.data.items || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  const deleteDoctor = async id => {
    try {
      await axios.delete(`/doctor/delete/${id}`);
      getDoctors();
      toast.success('Doctor deleted successfully');
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  useEffect(() => {
    getDoctors();
  }, [page]);

  return (
    <div className="admin-page-container">
      
      <div className="admin-page-header">
        <h2>Doctors Management</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="admin-export-btn"
            onClick={() =>
              exportCsv('/export/doctors.csv', 'doctors.csv').catch(e =>
                toast.error(e.response?.data?.message || 'Export failed')
              )
            }
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            className="admin-add-btn"
            onClick={() => navigate('/admin/doctors/add')}
          >
            <Plus size={18} />
            Add Doctor
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialization</th>
              <th>Experience</th>
              <th>Department</th>
              <th>Fee</th>
              <th>Working Days</th>
              <th>Rating</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {doctor.map(item => {
              const workingDays = (item.availability?.workingDays || [1, 2, 3, 4, 5, 6])
                .map(d => DAY_LABELS[d])
                .join(', ');

              return (
                <tr key={item._id}>
                  <td><strong>Dr. {item.user?.name}</strong></td>
                  <td>{item.specialization}</td>
                  <td>{item.experience} yrs</td>
                  <td>{item.department?.name || 'N/A'}</td>
                  <td>₹{item.consultationFee}</td>
                  <td>
                    <div>{workingDays}</div>
                    <small style={{ color: 'var(--text-muted)' }}>
                      {item.availability?.startTime} - {item.availability?.endTime}
                    </small>
                  </td>
                  <td>
                    <span className="rating-badge">
                      <Star size={13} fill="currentColor" />
                      {item.avgRating ? item.avgRating.toFixed(1) : '—'}
                      {item.totalRatings ? ` (${item.totalRatings})` : ''}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="action-icon-btn delete"
                      onClick={() => {
                         setSelectedDoctorId(item._id);
                         openModal(true);
                      }}
                      title="Delete Doctor"
                      aria-label="Delete Doctor"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {doctor.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No doctors found. Add a new doctor to see them here.
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {modal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-card">
            <AlertTriangle className="modal-icon-warning" size={48} />
            <h3>Delete Doctor?</h3>
            <p>Are you sure you want to remove this doctor? This action cannot be undone.</p>
            
            <div className="modal-actions-grid">
              <button 
                className="modal-btn-cancel" 
                onClick={() => openModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn-confirm"
                onClick={() => {
                  deleteDoctor(selectedDoctorId);
                  openModal(false);
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDash;
