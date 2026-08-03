import { useEffect, useState } from 'react';
import axios from '../../../../utils/axios';
import { ToastContainer, toast } from 'react-toastify';
import { Users } from 'lucide-react';
import './patientHome.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  
  const getPatients = async () => {
    try {
      const response = await axios.get('/get/patients');
      setPatients(response.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to fetch patients');
    }
  };

  useEffect(() => {
    getPatients();
  }, []);

  return (
    <div className="admin-page-container">
      <ToastContainer />
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={28} style={{ color: 'var(--primary)' }} />
          <h2>Patients Directory</h2>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Address</th>
              <th>Emergency Contact</th>
            </tr>
          </thead>

          <tbody>
            {patients.map((item, index) => (
              <tr key={item._id}>
                <td>{index + 1}</td>
                <td><strong>{item.name}</strong></td>
                <td>{item.age} yrs</td>
                <td>{item.gender}</td>
                <td>{item.contactNumber}</td>
                <td>{item.email}</td>
                <td>{item.address}</td>
                <td>{item.emergencyContact}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {patients.length === 0 && (
          <div className="empty-state-message">
            No patients found in the directory.
          </div>
        )}
      </div>
    </div>
  );
};

export default Patients;
