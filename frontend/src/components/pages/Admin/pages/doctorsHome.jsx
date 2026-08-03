import axios from '../../../../utils/axios';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import './doctorsHome.css';

const DoctorDash = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState([]);
  const [modal, openModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  const getDoctors = async () => {
    try {
      const response = await axios.get('/doctors/get');
      setDoctor(response.data);
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
  }, []);

  return (
    <div className="admin-page-container">
      <ToastContainer />
      
      <div className="admin-page-header">
        <h2>Doctors Management</h2>
        <button
          className="admin-add-btn"
          onClick={() => navigate('/admin/add/doctor')}
        >
          <Plus size={18} />
          Add Doctor
        </button>
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
              <th>Next Available Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {doctor.map(item => {
              const availability = item.availability || {
                date: '2026-03-14',
                time: '09:00 - 12:00',
              };

              const status =
                availability.date === today ? 'Available' : 'Unavailable';

              return (
                <tr key={item._id}>
                  <td><strong>Dr. {item.user?.name}</strong></td>
                  <td>{item.specialization}</td>
                  <td>{item.experience} yrs</td>
                  <td>{item.department?.name || 'N/A'}</td>
                  <td>₹{item.consultationFee}</td>
                  <td>
                    <div>{availability.date}</div>
                    <small style={{ color: 'var(--text-muted)' }}>{availability.time}</small>
                  </td>
                  <td>
                    <span className={`status-badge ${status === 'Available' ? 'status-available' : 'status-unavailable'}`}>
                      {status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="action-icon-btn delete"
                      onClick={() => {
                         setSelectedDoctorId(item._id);
                         openModal(true);
                      }}
                      title="Delete Doctor"
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
