import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../../utils/axios';
import { ToastContainer, toast } from 'react-toastify';
import { Pill, Plus } from 'lucide-react';
import './viewMedicine.css';

const ViewMedicine = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);

  const getMedicines = async () => {
    try {
      const response = await axios.get('/get/medicines/');
      setMedicines(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch medicines');
    }
  };

  useEffect(() => {
    getMedicines();
  }, []);

  return (
    <div className="admin-page-container">
      <ToastContainer />
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Pill size={28} style={{ color: 'var(--primary)' }} />
          <h2>Medicine Management</h2>
        </div>
        <button
          className="admin-add-btn"
          onClick={() => navigate('/admin/addMedicine')}
        >
          <Plus size={18} />
          Add Medicine
        </button>
      </div>

      <div className="medicine-summary-cards">
        <div className="med-summary-card">
          <h3>Total Medicines</h3>
          <p>{medicines.length}</p>
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
      </div>
    </div>
  );
};

export default ViewMedicine;
