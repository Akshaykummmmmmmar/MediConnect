import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../../utils/axios';
import notify from '../../../../utils/toast';
import { Pill, Plus, Download, AlertTriangle, Trash2, PackagePlus } from 'lucide-react';
import Pagination from '../../../Pagination/pagination';
import { exportCsv } from '../../../../utils/exportCsv';
import { TableSkeleton, EmptyState } from '../../../ui/ui';
import './viewMedicine.css';

const stockClass = (qty, threshold) => {
  if (qty <= 0) return 'stock-out';
  if (qty <= threshold) return 'stock-low';
  return 'stock-ok';
};

const isExpired = expiryDate => expiryDate && new Date(expiryDate) < new Date();

const ViewMedicine = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [alerts, setAlerts] = useState({ lowStock: [], expiringSoon: [], expired: [] });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stockModal, setStockModal] = useState(null);
  const [stockQty, setStockQty] = useState('');
  const [saving, setSaving] = useState(false);

  const getMedicines = async () => {
    try {
      setLoading(true);
      const [listRes, alertRes] = await Promise.all([
        axios.get(`/get/medicines/?page=${page}&limit=10`),
        axios.get('/inventory/alerts'),
      ]);
      setMedicines(listRes.data.items || []);
      setTotalPages(listRes.data.totalPages || 1);
      setTotal(listRes.data.total || 0);
      setAlerts(alertRes.data || { lowStock: [], expiringSoon: [], expired: [] });
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMedicines();
  }, [page]);

  const openStockModal = med => {
    setStockModal(med);
    setStockQty(med.quantity ?? 0);
  };

  const saveStock = async () => {
    if (!stockModal) return;
    const qty = Number(stockQty);
    if (Number.isNaN(qty) || qty < 0) return notify.error('Enter a valid quantity');
    try {
      setSaving(true);
      await axios.patch(`/medicine/update/${stockModal._id}`, { quantity: qty });
      notify.success('Stock updated');
      setStockModal(null);
      getMedicines();
    } catch (e) {
      notify.error(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteMedicine = async med => {
    if (!window.confirm(`Delete "${med.name}" from inventory?`)) return;
    try {
      await axios.delete(`/medicine/delete/${med._id}`);
      notify.success('Medicine deleted');
      getMedicines();
    } catch (e) {
      notify.error(e.response?.data?.message || e.message);
    }
  };

  const lowStockCount = alerts.lowStock?.length || 0;
  const expiringCount = alerts.expiringSoon?.length || 0;
  const expiredCount = alerts.expired?.length || 0;

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div className="flex-row-center">
          <Pill size={28} className="icon-primary" />
          <h2>Pharmacy Inventory</h2>
        </div>
        <div className="flex-row">
          <button
            className="admin-export-btn"
            onClick={() =>
              exportCsv('/export/medicines.csv', 'medicines.csv').catch(e =>
                notify.error(e.response?.data?.message || 'Export failed')
              )
            }
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            className="admin-add-btn"
            onClick={() => navigate('/admin/medicines/add')}
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
        <div className={`med-summary-card ${lowStockCount > 0 ? 'summary-warn' : ''}`}>
          <h3>Low Stock</h3>
          <p>{lowStockCount}</p>
        </div>
        <div className={`med-summary-card ${expiringCount > 0 ? 'summary-warn' : ''}`}>
          <h3>Expiring Soon (30d)</h3>
          <p>{expiringCount}</p>
        </div>
        <div className={`med-summary-card ${expiredCount > 0 ? 'summary-danger' : ''}`}>
          <h3>Expired</h3>
          <p>{expiredCount}</p>
        </div>
      </div>

      {expiredCount > 0 && (
        <div className="inventory-alert-banner">
          <AlertTriangle size={18} />
          <span>
            {expiredCount} medicine(s) have expired. Remove them from the inventory.
          </span>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Manufacturer</th>
              <th>Expiry Date</th>
              <th>Price (₹)</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {medicines.map((med) => {
              const threshold = med.lowStockThreshold ?? 10;
              const qty = med.quantity ?? 0;
              return (
                <tr key={med._id || med.name}>
                  <td>
                    <strong>{med.name}</strong>
                    {med.description && (
                      <div className="text-muted-sm">
                        {med.description}
                      </div>
                    )}
                  </td>
                  <td>{med.manufacturer || '—'}</td>
                  <td className={isExpired(med.expiryDate) ? 'expiry-expired' : ''}>
                    {med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : 'N/A'}
                    {isExpired(med.expiryDate) && <span className="expiry-tag">Expired</span>}
                  </td>
                  <td>₹{med.price}</td>
                  <td><strong>{qty}</strong></td>
                  <td>
                    <span className={`stock-badge ${stockClass(qty, threshold)}`}>
                      {qty <= 0 ? 'Out of stock' : qty <= threshold ? 'Low stock' : 'In stock'}
                    </span>
                  </td>
                  <td>
                    <div className="flex-row" style={{ display: 'inline-flex' }}>
                      <button
                        className="inventory-action-btn"
                        title="Update stock"
                        onClick={() => openStockModal(med)}
                      >
                        <PackagePlus size={15} /> Stock
                      </button>
                      <button
                        className="inventory-action-btn danger"
                        title="Delete"
                        onClick={() => deleteMedicine(med)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {loading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : medicines.length === 0 ? (
          <EmptyState
            icon={<Pill size={28} />}
            title="No medicines found"
            subtitle="Add medicines to build your pharmacy inventory."
            action={
              <button className="admin-add-btn" onClick={() => navigate('/admin/medicines/add')}>
                <Plus size={16} /> Add Medicine
              </button>
            }
          />
        ) : null}

        {!loading && medicines.length > 0 && (
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>

      {stockModal && (
        <div className="modal-overlay">
          <div className="stock-modal-card">
            <h3>Update Stock — {stockModal.name}</h3>
            <p>Current quantity: <strong>{stockModal.quantity ?? 0}</strong></p>
            <input
              type="number"
              min="0"
              autoFocus
              value={stockQty}
              onChange={e => setStockQty(e.target.value)}
              placeholder="New quantity"
            />
            <div className="modal-actions-grid">
              <button className="modal-btn-cancel" onClick={() => setStockModal(null)}>
                Cancel
              </button>
              <button className="modal-btn-confirm" onClick={saveStock} disabled={saving}>
                {saving ? 'Saving...' : 'Save Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewMedicine;
