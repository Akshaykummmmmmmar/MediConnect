import { useEffect, useState } from 'react';
import notify from '../../../../utils/toast';
import axios from '../../../../utils/axios';
import { Calendar, CheckCircle2, ClipboardPlus, FileQuestion, BookmarkPlus, Bookmark } from 'lucide-react';
import './appointmentToday.css';

const STORAGE_KEY = 'mediconnect_rx_templates';

const loadTemplates = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

const AppointmentToday = () => {
  const doctorId = localStorage.getItem('doctorId');
  const [openMain, setOpenMain] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [confrimModal, setConfirmModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [templates, setTemplates] = useState(loadTemplates());
  
  const [prescription, setPrescription] = useState({
    findings: '',
    diagnosis: '',
    medicineName: '',
    dosage: '',
    duration: '',
    advice: '',
    followUp: '',
  });

  const saveTemplates = list => {
    setTemplates(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  };

  const saveAsTemplate = () => {
    if (!prescription.diagnosis && !prescription.findings && !prescription.medicineName) {
      return notify.warning('Fill the prescription before saving a template');
    }
    const template = {
      id: Date.now(),
      name: prescription.diagnosis || 'Untitled Template',
      ...prescription,
    };
    saveTemplates([...templates, template]);
    notify.success('Prescription saved as template');
  };

  const applyTemplate = tpl => {
    setPrescription({
      findings: tpl.findings || '',
      diagnosis: tpl.diagnosis || '',
      medicineName: tpl.medicineName || '',
      dosage: tpl.dosage || '',
      duration: tpl.duration || '',
      advice: tpl.advice || '',
      followUp: '',
    });
  };

  const deleteTemplate = id => {
    saveTemplates(templates.filter(t => t.id !== id));
  };

  const onBtnClick = appointment => {
    setSelectedAppointment(appointment);
    setOpenModal(true);
    setOpenMain(false);
  };

  const closeModal = () => {
    setOpenModal(false);
    setOpenMain(true);
    setSelectedAppointment(null);
  };

  const getAppointments = async () => {
    if (!doctorId) return notify.error('Doctor not found');

    try {
      const response = await axios.get(`/doctor/${doctorId}?limit=200`);
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = (response.data.items || []).filter(
        item => item.date && item.date.split('T')[0] === today
      );
      setAppointments(todayAppointments);
    } catch (e) {
      notify.error(e.response?.data?.message || e.message);
    }
  };

  const confirmAppointment = async id => {
    try {
      await axios.patch(`/appointment/${id}/status`, { status: 'Confirmed' });
      notify.success('Appointment confirmed');
      getAppointments();
    } catch (e) {
      notify.error(e.response?.data?.message || e.message);
    }
  };

  const postPrescription = async () => {
    const appointmentId = selectedAppointment._id;
    
    try {
      const data = {
        patient: selectedAppointment.patient?._id,
        doctor: doctorId,
        appointment: appointmentId,
        findings: prescription.findings,
        diagnosis: prescription.diagnosis,
        medicines: [
          {
            name: prescription.medicineName,
            dosage: prescription.dosage,
            duration: prescription.duration,
          },
        ],
        advice: prescription.advice,
        followUp: prescription.followUp,
      };
      
      await axios.post('/post/prescriptions', data);
      await axios.patch(`/appointment/${appointmentId}`, {
        status: 'Completed',
      });
      
      notify.success('Prescription added and appointment completed');
      getAppointments();
    } catch (e) {
      notify.error(e.response?.data?.message || e.message);
    }
  };

  const onChange = (e, field) => {
    setPrescription({ ...prescription, [field]: e.target.value });
  };

  const completed = appointments.filter(a => a.status === 'Completed').length;
  const pending = appointments.filter(a => ['Pending', 'Booked'].includes(a.status)).length;

  const statusClass = status => {
    switch (status) {
      case 'Completed':
        return 'status-completed';
      case 'Confirmed':
        return 'status-confirmed';
      case 'Cancelled':
        return 'status-cancelled';
      case 'No-show':
        return 'status-no-show';
      default:
        return 'status-pending';
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  return (
    <div className="doctorDashboard-container">
      
      {openMain && (
        <>
          <div className="dashboard-header">
            <div>
              <h1>Today's Appointments</h1>
              <p>Manage your daily schedule and write prescriptions.</p>
            </div>
            <div className="header-badge">
              <Calendar size={16} />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <div className="summary-container">
            <div className="summary-card">
              <h3>Total Today</h3>
              <p>{appointments.length}</p>
            </div>
            <div className="summary-card">
              <h3>Completed</h3>
              <p>{completed}</p>
            </div>
            <div className="summary-card">
              <h3>Pending</h3>
              <p>{pending}</p>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Age</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Prescription</th>
                </tr>
              </thead>

              <tbody>
                {appointments.map(item => (
                  <tr key={item._id}>
                    <td><strong>{item.patient?.name}</strong></td>
                    <td>{item.age} yrs</td>
                    <td>{item.time}</td>
                    <td>
                      <span className={`status-badge ${statusClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex-row" style={{ display: 'inline-flex' }}>
                        {['Pending', 'Booked'].includes(item.status) && (
                          <button
                            className="confirm-slot-btn"
                            onClick={() => confirmAppointment(item._id)}
                            title="Confirm appointment"
                          >
                            <CheckCircle2 size={16} /> Confirm
                          </button>
                        )}
                        <button
                          className="prescription-btn"
                          onClick={() => onBtnClick(item)}
                          disabled={item.status === 'Completed'}
                        >
                          {item.status === 'Completed' ? (
                            <><CheckCircle2 size={16} /> Added</>
                          ) : (
                            <><ClipboardPlus size={16} /> Add Prescription</>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {appointments.length === 0 && (
              <div className="empty-state-placeholder">
                No appointments scheduled for today.
              </div>
            )}
          </div>
        </>
      )}

      {openModal && (
        <div className="delete-modal-overlay">
          <div className="prescription-modal-card">
            <div className="prescription-modal-header">
              <h2>Write Prescription</h2>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>

            {selectedAppointment && (
              <div className="patient-info-box">
                <p><strong>Patient:</strong> {selectedAppointment.patient?.name}</p>
                <p><strong>Age:</strong> {selectedAppointment.age} yrs | <strong>Date:</strong> {selectedAppointment.date}</p>
              </div>
            )}

            {templates.length > 0 && (
              <div className="template-block">
                <div className="template-header">
                  <span><Bookmark size={14} /> Quick Templates</span>
                  <small>{templates.length} saved</small>
                </div>
                <div className="template-chips">
                  {templates.map(tpl => (
                    <span key={tpl.id} className="template-chip">
                      <button type="button" className="template-chip-main" onClick={() => applyTemplate(tpl)}>
                        {tpl.name}
                      </button>
                      <button
                        type="button"
                        className="template-chip-del"
                        title="Delete template"
                        onClick={() => deleteTemplate(tpl.id)}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="template-save-row">
              <button type="button" className="template-save-btn" onClick={saveAsTemplate}>
                <BookmarkPlus size={15} /> Save as Template
              </button>
            </div>

            <h3>Symptoms / Findings</h3>
            <textarea
              placeholder="Enter symptoms / findings"
              onChange={e => onChange(e, 'findings')}
            ></textarea>

            <h3>Diagnosis</h3>
            <textarea
              placeholder="Enter diagnosis"
              onChange={e => onChange(e, 'diagnosis')}
            ></textarea>

            <h3>Medicines</h3>
            <div className="medicine-row">
              <input
                placeholder="Medicine name"
                onChange={e => onChange(e, 'medicineName')}
              />
              <input
                placeholder="Dosage (e.g. 1-0-1)"
                onChange={e => onChange(e, 'dosage')}
              />
              <input
                placeholder="Duration (e.g. 5 days)"
                onChange={e => onChange(e, 'duration')}
              />
            </div>

            <h3>Doctor's Advice</h3>
            <textarea
              placeholder="Any additional advice"
              onChange={e => onChange(e, 'advice')}
            ></textarea>

            <h3>Follow Up Date</h3>
            <input
              type="date"
              onChange={e => onChange(e, 'followUp')}
              style={{ width: 'auto' }}
            />

            <button
              className="save-btn"
              onClick={() => {
                setConfirmModal(true);
              }}
            >
              Review & Submit
            </button>
          </div>
        </div>
      )}

      {confrimModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-card">
            <FileQuestion className="modal-icon-warning" size={48} />
            <h3>Confirm Prescription</h3>
            <p>Are you sure you want to submit this prescription? The appointment will be marked as Completed.</p>

            <div className="modal-actions-grid">
              <button
                className="modal-btn-cancel"
                onClick={() => setConfirmModal(false)}
              >
                Go Back
              </button>
              <button
                className="modal-btn-confirm"
                onClick={() => {
                  setConfirmModal(false);
                  setOpenModal(false);
                  setOpenMain(true);
                  postPrescription();
                }}
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentToday;
