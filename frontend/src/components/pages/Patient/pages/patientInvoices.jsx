import { useEffect, useState } from 'react';
import axios from '../../../../utils/axios';
import { ToastContainer, toast } from 'react-toastify';
import { Receipt, Calendar, User, CreditCard, CheckCircle2, Download } from 'lucide-react';
import Pagination from '../../../Pagination/pagination';
import './patientInvoices.css';

const PatientInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payMethod, setPayMethod] = useState('Card');

  const patientId = localStorage.getItem('userId');

  const getInvoices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/invoices/patient/${patientId}?page=${page}&limit=10`);
      setInvoices(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInvoices();
  }, [page]);

  const payInvoice = async id => {
    try {
      await axios.patch(`/invoices/pay/${id}`, { paymentMethod: payMethod });
      toast.success('Payment successful!');
      setSelectedInvoice(null);
      getInvoices();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  const downloadInvoice = () => {
    if (!selectedInvoice) return;
    const content = document.getElementById('invoice-print-area');
    const blob = new Blob([content.innerText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedInvoice.invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="patient-invoices-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="page-header">
        <div>
          <h1>My Invoices</h1>
          <p>View and pay your bills securely.</p>
        </div>
        <div className="header-badge">
          <Receipt size={18} />
          <span>{invoices.length} Invoices</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading invoices...</div>
      ) : invoices.length > 0 ? (
        <>
          <div className="invoice-grid">
            {invoices.map(inv => (
              <div key={inv._id} className="invoice-card">
                <div className="invoice-card-top">
                  <span className="invoice-number">{inv.invoiceNumber}</span>
                  <span className={`status-badge ${inv.status === 'Paid' ? 'status-completed' : 'status-pending'}`}>
                    {inv.status}
                  </span>
                </div>
                <div className="invoice-card-body">
                  <div className="invoice-meta-row">
                    <span><User size={14} /> Dr. {inv.doctor?.user?.name || 'Hospital'}</span>
                  </div>
                  <div className="invoice-meta-row">
                    <span><Calendar size={14} /> {inv.createdAt?.split('T')[0]}</span>
                  </div>
                  <div className="invoice-amount">₹{inv.total}</div>
                </div>
                <div className="invoice-card-actions">
                  <button
                    className="invoice-view-btn"
                    onClick={() => setSelectedInvoice(inv)}
                  >
                    View / Pay
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="list-footer-row">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      ) : (
        <div className="empty-invoices">
          <Receipt size={64} strokeWidth={1} />
          <h3>No invoices yet</h3>
          <p>Your bills will appear here after consultations.</p>
        </div>
      )}

      {selectedInvoice && (
        <div className="modal-overlay">
          <div className="invoice-modal">
            <div className="invoice-modal-header">
              <h2>{selectedInvoice.invoiceNumber}</h2>
              <button className="invoice-close-btn" onClick={() => setSelectedInvoice(null)}>✕</button>
            </div>

            <div id="invoice-print-area" className="invoice-print-area">
              <div className="invoice-brand">MediConnect</div>
              <div className="invoice-meta-grid">
                <div>
                  <p><strong>Patient:</strong> Dr. {selectedInvoice.doctor?.user?.name || '—'}</p>
                  <p><strong>Date:</strong> {selectedInvoice.createdAt?.split('T')[0]}</p>
                </div>
                <div>
                  <p><strong>Status:</strong> {selectedInvoice.status}</p>
                  <p><strong>Payment:</strong> {selectedInvoice.paymentMethod || '—'}</p>
                </div>
              </div>
              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.description}</td>
                      <td>₹{item.amount}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr><td>Subtotal</td><td>₹{selectedInvoice.subtotal}</td></tr>
                  <tr><td>Tax ({selectedInvoice.tax}%)</td><td>₹{Math.round(selectedInvoice.subtotal * selectedInvoice.tax / 100)}</td></tr>
                  <tr className="invoice-total-row"><td>Total</td><td>₹{selectedInvoice.total}</td></tr>
                </tfoot>
              </table>
            </div>

            {selectedInvoice.status === 'Pending' ? (
              <div className="pay-box">
                <select value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Insurance">Insurance</option>
                </select>
                <button className="pay-btn" onClick={() => payInvoice(selectedInvoice._id)}>
                  <CreditCard size={16} /> Pay ₹{selectedInvoice.total}
                </button>
              </div>
            ) : (
              <div className="paid-banner">
                <CheckCircle2 size={18} /> Paid successfully
              </div>
            )}

            <button className="invoice-download-btn" onClick={downloadInvoice}>
              <Download size={15} /> Download (txt)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientInvoices;
