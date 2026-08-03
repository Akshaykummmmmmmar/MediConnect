import { useState } from 'react';
import axios from '../../../../utils/axios';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pill } from 'lucide-react';
import './addMedicine.css';

const AddMedicine = () => {
  const navigate = useNavigate();
  const [medicineData, setMedicineData] = useState({
    name: '',
    description: '',
    manufacturer: '',
    expiryDate: '',
    price: ''
  });

  const onInputChange = (e, field) => {
    setMedicineData({ ...medicineData, [field]: e.target.value });
  };

  const onConfirmClick = async () => {
    if (
      !medicineData.name ||
      !medicineData.description ||
      !medicineData.manufacturer ||
      !medicineData.expiryDate ||
      !medicineData.price
    ) {
      toast.error('Please fill all fields', { autoClose: 1500 });
      return;
    }

    try {
      await axios.post('/add/medicine', medicineData);
      toast.success('Medicine added successfully');
      setMedicineData({
        name: '',
        description: '',
        manufacturer: '',
        expiryDate: '',
        price: ''
      });
      setTimeout(() => navigate('/admin/viewMedicine'), 1500);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="add-page-container">
      <ToastContainer />
      <div className="back-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h2>Add New Medicine</h2>
      </div>

      <div className="add-form-card">
        <div className="add-form-illustration">
          <Pill size={64} style={{ color: 'var(--primary)', marginBottom: '20px' }} />
          <h3>Inventory Management</h3>
          <p>Add new medicine details to update the hospital pharmacy inventory.</p>
        </div>
        
        <div className="add-form-grid">
          <div className="form-group full-width">
            <label htmlFor="name">Medicine Name</label>
            <input
              type="text"
              id="name"
              placeholder="e.g. Paracetamol 500mg"
              value={medicineData.name}
              onChange={e => onInputChange(e, 'name')}
              autoFocus
            />
          </div>
          
          <div className="form-group full-width">
            <label htmlFor="description">Description / Usage</label>
            <input
              type="text"
              id="description"
              placeholder="Pain reliever and fever reducer"
              value={medicineData.description}
              onChange={e => onInputChange(e, 'description')}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="manufacturer">Manufacturer</label>
            <input
              type="text"
              id="manufacturer"
              placeholder="HealthCorp Pharmaceuticals"
              value={medicineData.manufacturer}
              onChange={e => onInputChange(e, 'manufacturer')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="expiryDate">Expiry Date</label>
            <input
              type="date"
              id="expiryDate"
              value={medicineData.expiryDate}
              onChange={e => onInputChange(e, 'expiryDate')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price (₹)</label>
            <input
              type="number"
              id="price"
              placeholder="50"
              value={medicineData.price}
              onChange={e => onInputChange(e, 'price')}
            />
          </div>

          <button
            className="add-confirm-btn"
            onClick={onConfirmClick}
          >
            Add to Inventory
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMedicine;
