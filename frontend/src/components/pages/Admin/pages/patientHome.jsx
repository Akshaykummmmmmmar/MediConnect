import { useEffect, useState } from 'react';
import axios from '../../../../utils/axios';
import notify from '../../../../utils/toast';
import { Users, Download } from 'lucide-react';
import Pagination from '../../../Pagination/pagination';
import { exportCsv } from '../../../../utils/exportCsv';
import './patientHome.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const getPatients = async () => {
    try {
      const response = await axios.get(`/get/patients?page=${page}&limit=10`);
      setPatients(response.data.items || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (e) {
      notify.error(e.response?.data?.message || 'Failed to fetch patients');
    }
  };

  useEffect(() => {
    getPatients();
  }, [page]);

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={28} style={{ color: 'var(--primary)' }} />
          <h2>Patients Directory</h2>
        </div>
        <button
          className="admin-export-btn"
          onClick={() =>
            exportCsv('/export/patients.csv', 'patients.csv').catch(e =>
              notify.error(e.response?.data?.message || 'Export failed')
            )
          }
        >
          <Download size={18} />
          Export CSV
        </button>
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
                <td>{(page - 1) * 10 + index + 1}</td>
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

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default Patients;
