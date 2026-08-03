import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from '../../../../utils/axios';
import { ListCollapse } from 'lucide-react';
import './doctorAppointments.css';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const doctorId = localStorage.getItem('doctorId');
  
  const getAppointments = async () => {
    if (!doctorId) return toast.error('Doctor not found');
    try {
      const response = await axios.get(`/doctor/${doctorId}`);
      setAppointments(response.data);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  return (
    <div className="doctorDashboard-container">
      <ToastContainer />
      
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
            </tr>
          </thead>
          <tbody>
            {appointments.map(item => (
              <tr key={item._id}>
                <td><strong>{item.patient?.name}</strong></td>
                <td>{item.date}</td>
                <td>{item.time}</td>
                <td>
                  <span className={`status-badge ${item.status === 'Completed' ? 'status-completed' : 'status-pending'}`}>
                    {item.status}
                  </span>
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
      </div>
    </div>
  );
};

export default DoctorAppointments;
