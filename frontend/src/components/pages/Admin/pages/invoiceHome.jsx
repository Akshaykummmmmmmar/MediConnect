import { useEffect, useState } from 'react';
import notify from '../../../../utils/toast';
import axios from '../../../../utils/axios';
import { Receipt, User, Stethoscope, CreditCard } from 'lucide-react';
import Pagination from '../../../Pagination/pagination';
import './invoiceHome.css';

const InvoiceHome = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');

  const getInvoices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/invoices?page=${page}&limit=10&status=${statusFilter}`);
      setInvoices(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (e) {
      notify.error(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    getInvoices();
  }, [statusFilter]);

  useEffect(() => {
    getInvoices();
  }, [page]);

  const markPaid = async id => {
    try {
      await axios.patch(`/invoices/pay/${id}`, { paymentMethod: 'Cash' });
      notify.success('Invoice marked as paid');
      getInvoices();
    } catch (e) {
      notify.error(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="invoice-home-container">

      <div className="dashboard-header">
        <div>
          <h1>All Invoices</h1>
          <p>Track and manage billing across the hospital.</p>
        </div>
        <div className="header-badge">
          <Receipt size={16} />
          <span>{invoices.length} Shown</span>
        </div>
      </div>

      <div className="filter-row">
        {['All', 'Pending', 'Paid'].map(s => (
          <button
            key={s}
            className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state">Loading invoices...</div>
      ) : invoices.length > 0 ? (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv._id}>
                  <td><strong>{inv.invoiceNumber}</strong></td>
                  <td>
                    <span className="cell-with-icon"><User size={14} /> {inv.patient?.name || '—'}</span>
                  </td>
                  <td>
                    <span className="cell-with-icon"><Stethoscope size={14} /> {inv.doctor?.user?.name || '—'}</span>
                  </td>
                  <td>{inv.createdAt?.split('T')[0]}</td>
                  <td><strong>₹{inv.total}</strong></td>
                  <td>
                    <span className={`status-badge ${inv.status === 'Paid' ? 'status-completed' : 'status-pending'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td>
                    {inv.status === 'Pending' && (
                      <button className="mark-paid-btn" onClick={() => markPaid(inv._id)}>
                        <CreditCard size={15} /> Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      ) : (
        <div className="empty-invoices">
          <Receipt size={64} strokeWidth={1} />
          <h3>No invoices found</h3>
          <p>Invoices will appear here once billing starts.</p>
        </div>
      )}
    </div>
  );
};

export default InvoiceHome;
