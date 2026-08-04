import { useEffect, useState } from 'react';
import axios from '../../../../utils/axios';
import { ToastContainer, toast } from 'react-toastify';
import {
  FolderOpen,
  Stethoscope,
  FileText,
  FlaskConical,
  Syringe,
  Scissors,
  Clock,
  Calendar,
  User,
} from 'lucide-react';
import './medicalRecords.css';

const typeConfig = {
  diagnosis: { icon: Stethoscope, label: 'Diagnosis' },
  report: { icon: FileText, label: 'Report' },
  test: { icon: FlaskConical, label: 'Test' },
  vaccination: { icon: Syringe, label: 'Vaccination' },
  surgery: { icon: Scissors, label: 'Surgery' },
  other: { icon: FileText, label: 'Other' },
};

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const patientId = localStorage.getItem('userId');

  const getRecords = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/medical-records/patient/${patientId}`);
      setRecords(res.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRecords();
  }, []);

  return (
    <div className="medical-records-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="page-header">
        <div>
          <h1>Medical Records</h1>
          <p>Your complete health history at MediConnect.</p>
        </div>
        <div className="header-badge">
          <FolderOpen size={18} />
          <span>{records.length} Records</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading your records...</div>
      ) : records.length > 0 ? (
        <div className="records-list">
          {records.map(record => {
            const conf = typeConfig[record.recordType] || typeConfig.other;
            const Icon = conf.icon;
            const isOpen = expanded === record._id;
            return (
              <div
                key={record._id}
                className={`record-card ${isOpen ? 'open' : ''}`}
                onClick={() => setExpanded(isOpen ? null : record._id)}
              >
                <div className="record-card-header">
                  <div className="record-type-icon">
                    <Icon size={20} />
                  </div>
                  <div className="record-main">
                    <h3>{record.title}</h3>
                    <div className="record-meta">
                      <span><User size={13} /> Dr. {record.doctor?.user?.name || 'Unknown'}</span>
                      <span><Calendar size={13} /> {record.createdAt?.split('T')[0]}</span>
                    </div>
                  </div>
                  <span className={`record-type-tag ${record.recordType}`}>{conf.label}</span>
                </div>
                {isOpen && record.description && (
                  <div className="record-description">
                    <p>{record.description}</p>
                    <span className="record-timestamp">
                      <Clock size={13} /> Added on {new Date(record.createdAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-records">
          <FolderOpen size={64} strokeWidth={1} />
          <h3>No medical records yet</h3>
          <p>Your medical history and reports will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
