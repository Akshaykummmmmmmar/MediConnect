import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../../utils/axios';
import { ToastContainer, toast } from 'react-toastify';
import { Pill, Plus, Download } from 'lucide-react';
import Pagination from '../../../Pagination/pagination';
import { exportCsv } from '../../../../utils/exportCsv';
import './viewMedicine.css';

const ViewMedicine = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const getMedicines = async () => {
    try {
      const response = await axios.get(`/get/medicines/?page=${page}&limit=10`);
      setMedicines(response.data.items || []);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch medicines');
    }
  };

  useEffect(() => {
    getMedicines();
  }, [page]);

  return (
    <div className="admin-page-container">
      <ToastContainer />
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Pill size={28} style={{ color: 'var(--primary)' }} />
          <h2>Medicine Management</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="admin-export-btn"
            onClick={() =>
              exportCsv('/export/medicines.csv', 'medicines.csv').catch(e =>
                toast.error(e.response?.data?.message || 'Export failed')
              )
            }
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            className="admin-add-btn"
            onClick={() => navigate('/admin/addMedicine')}
          >
            <Plus size={18} />
            Add Medicine
          </button>
        </div>
      </div>

      <div className="medicine-summary-cards">
        <div className="med-summary-card">
          <h3>Total Medicines</h3>
          <p>{total}</p>
        </div>
        <div className="med-summary-card">
          <h3>Low Stock (Est.)</h3>
          <p>0</p>
        </div>
        <div className="med-summary-card">
          <h3>Expiring Soon</h3>
          <p>0</p>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Description</th>
              <th>Manufacturer</th>
              <th>Expiry Date</th>
              <th>Price (₹)</th>
            </tr>
          </thead>

          <tbody>
            {medicines.map((med) => (
              <tr key={med._id || med.name}>
                <td><strong>{med.name}</strong></td>
                <td>{med.description}</td>
                <td>{med.manufacturer}</td>
                <td>{med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : 'N/A'}</td>
                <td>₹{med.price}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {medicines.length === 0 && (
          <div className="empty-state-message">
            No medicines found in the inventory.
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default ViewMedicine;
