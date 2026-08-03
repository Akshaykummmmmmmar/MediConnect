import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import html2pdf from 'html2pdf.js-forked';
import axios from '../../../../utils/axios';
import { 
  FileText, 
  Download, 
  ArrowLeft, 
  Stethoscope, 
  Calendar, 
  Pill, 
  ClipboardList,
  Activity,
  User,
  ExternalLink
} from 'lucide-react';
import './prescriptions.css';

const Prescriptions = () => {
  const patientId = localStorage.getItem('userId');
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const downloadPdf = () => {
    const element = document.getElementById('prescription-document');
    const options = {
      margin: 0,
      filename: `Prescription_${selectedPrescription?.doctor?.user?.name || 'MediConnect'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(options).from(element).save();
  };

  const getPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/get/prescriptions/patients/${patientId}`);
      setPrescriptions(response.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPrescriptions();
  }, []);

  const openPrescription = (item) => {
    setSelectedPrescription(item);
    setShowDetail(true);
  };

  const closeDetail = () => {
    setShowDetail(false);
    setSelectedPrescription(null);
  };

  return (
    <div className="prescriptions-page-container">
      <ToastContainer position="top-right" />
      
      {!showDetail ? (
        <div className="prescriptions-list-view">
          <div className="page-header">
            <div>
              <h1>My Prescriptions</h1>
              <p>View and download your digital medical records.</p>
            </div>
            <div className="header-badge">
              <ClipboardList size={20} />
              <span>{prescriptions.length} Records</span>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Fetching prescriptions...</div>
          ) : prescriptions.length > 0 ? (
            <div className="consultation-grid">
              {prescriptions.map(item => (
                <div key={item._id} className="modern-consultation-card" onClick={() => openPrescription(item)}>
                  <div className="card-tag">Consultation</div>
                  <div className="card-main-info">
                    <div className="doc-avatar">
                      <Stethoscope size={24} />
                    </div>
                    <div>
                      <h3>Dr. {item.doctor?.user?.name}</h3>
                      <p className="specialty-text">{item.doctor?.specialization || 'Specialist'}</p>
                    </div>
                  </div>
                  <div className="card-footer-info">
                    <span><Calendar size={14} /> {item.followUp?.split('T')[0]}</span>
                    <button className="view-btn">
                      View <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-prescriptions">
              <FileText size={64} strokeWidth={1} />
              <h3>No prescriptions found</h3>
              <p>Your digital prescriptions will appear here after your consultation.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="prescription-detail-view">
          <div className="detail-actions">
            <button className="back-action-btn" onClick={closeDetail}>
              <ArrowLeft size={18} /> Back to List
            </button>
            <button className="download-action-btn" onClick={() => setModal(true)}>
              <Download size={18} /> Download PDF
            </button>
          </div>

          <div className="prescription-document-container" id="prescription-document">
            {/* Professional Letterhead */}
            <div className="prescription-letterhead">
              <div className="brand-section">
                <div className="brand-logo">
                  <Activity size={32} />
                  <span>MediConnect</span>
                </div>
                <div className="clinic-info">
                  <p>123 Health Ave, Medical District</p>
                  <p>Phone: +1 (555) 000-1234</p>
                  <p>www.mediconnect.com</p>
                </div>
              </div>
              
              <div className="header-divider"></div>
              
              <div className="doc-pat-info-grid">
                <div className="info-block">
                  <label>Doctor Details</label>
                  <h4>Dr. {selectedPrescription.doctor?.user?.name}</h4>
                  <p>{selectedPrescription.doctor?.specialization || 'Consultant'}</p>
                </div>
                <div className="info-block text-right">
                  <label>Date of Consultation</label>
                  <h4>{selectedPrescription.followUp?.split('T')[0]}</h4>
                  <p>Ref: RX-{selectedPrescription._id.slice(-6).toUpperCase()}</p>
                </div>
              </div>
            </div>

            <div className="prescription-content">
              <div className="clinical-section">
                <h3 className="section-title"><ClipboardList size={18} /> Diagnosis & Clinical Notes</h3>
                <div className="diagnosis-box">
                  <p>{selectedPrescription.diagnosis || 'No clinical notes provided.'}</p>
                </div>
              </div>

              <div className="clinical-section">
                <h3 className="section-title"><Pill size={18} /> Medication / Prescription</h3>
                <table className="modern-med-table">
                  <thead>
                    <tr>
                      <th>Medicine Name</th>
                      <th>Dosage</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPrescription.medicines?.map((med, idx) => (
                      <tr key={idx}>
                        <td><strong>{med.name}</strong></td>
                        <td>{med.dosage}</td>
                        <td>{med.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="clinical-section">
                <h3 className="section-title"><Stethoscope size={18} /> Advice & Follow-up</h3>
                <div className="advice-box">
                  <p>{selectedPrescription.advice || 'Follow routine healthy lifestyle.'}</p>
                </div>
              </div>
            </div>

            <div className="prescription-footer">
              <div className="footer-left">
                <p>This is a digitally generated prescription.</p>
                <p>Signature not required.</p>
              </div>
              <div className="footer-right">
                <div className="digital-seal">
                  <Activity size={24} />
                  <span>VERIFIED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Download */}
      {modal && (
        <div className="modal-overlay">
          <div className="download-confirm-modal">
            <div className="modal-icon-header">
              <Download size={32} />
            </div>
            <h3>Download Prescription?</h3>
            <p>Do you want to save a high-quality PDF version of this prescription?</p>
            <div className="modal-actions-btns">
              <button className="cancel-btn" onClick={() => setModal(false)}>No, Cancel</button>
              <button className="confirm-btn" onClick={() => {
                downloadPdf();
                setModal(false);
              }}>Yes, Download</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
