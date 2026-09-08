import { useEffect, useState } from 'react';
import axios from '../../../../utils/axios';
import notify from '../../../../utils/toast';
import { Users, Download, Search, ChevronDown, Phone, Mail, MapPin, HeartPulse, CalendarCheck, Stethoscope } from 'lucide-react';
import Pagination from '../../../Pagination/pagination';
import { exportCsv } from '../../../../utils/exportCsv';
import './patientHome.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const getPatients = async () => {
    try {
      const query = new URLSearchParams({ page: String(page), limit: '10' });
      if (search.trim()) query.set('search', search.trim());
      const response = await axios.get(`/get/patients?${query.toString()}`);
      setPatients(response.data.items || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (e) {
      notify.error(e.response?.data?.message || 'Failed to fetch patients');
    }
  };

  useEffect(() => { getPatients(); }, [page, search]);

  const formatDate = date => date ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date)) : '—';

  return (
    <div className="admin-page-container patient-directory-page">
      <div className="patient-directory-header">
        <div className="patient-directory-title">
          <span className="patient-directory-title-icon"><Users size={22} /></span>
          <div><h2>Patient Directory</h2><p>Registered patient records and appointment activity</p></div>
        </div>
        <div className="patient-directory-actions">
          <label className="patient-search"><Search size={18} aria-hidden="true" /><input type="search" value={search} onChange={event => { setPage(1); setExpandedId(null); setSearch(event.target.value); }} placeholder="Search by name, email, or mobile number" aria-label="Search patients" /></label>
          <button className="admin-export-btn" onClick={() => exportCsv('/export/patients.csv', 'patients.csv').catch(e => notify.error(e.response?.data?.message || 'Export failed'))}>
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="patient-roster-container">
        <table className="patient-roster-table">
          <thead><tr><th>Patient</th><th>Demographics</th><th>Contact</th><th>Latest / Upcoming Booking</th><th>Visits</th><th><span className="sr-only">View details</span></th></tr></thead>
          <tbody>
            {patients.map(item => {
              const summary = item.bookingSummary || { total: 0, recent: [], upcoming: null };
              const booking = summary.upcoming || summary.recent?.[0];
              const isExpanded = expandedId === item._id;
              return (
                <PatientRow key={item._id} item={item} summary={summary} booking={booking} isExpanded={isExpanded} onToggle={() => setExpandedId(isExpanded ? null : item._id)} formatDate={formatDate} />
              );
            })}
          </tbody>
        </table>
        {patients.length === 0 && <div className="patient-directory-empty"><Users size={30} aria-hidden="true" /><h3>No patients found</h3><p>{search ? 'Try a different name, email, or mobile number.' : 'Newly registered patients will appear here.'}</p></div>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

const PatientRow = ({ item, summary, booking, isExpanded, onToggle, formatDate }) => (
  <>
    <tr className={isExpanded ? 'patient-roster-row is-expanded' : 'patient-roster-row'}>
      <td><div className="roster-patient"><span className="roster-avatar">{initials(item.name)}</span><div><strong>{item.name || 'Unnamed patient'}</strong><span>MC-{item._id?.slice(-6).toUpperCase()}</span></div></div></td>
      <td><span className="roster-main-text">{item.age ? `${item.age} yrs` : '—'}</span><span className="roster-sub-text">{item.gender || 'Not recorded'}</span></td>
      <td><span className="roster-main-text">{item.contactNumber || 'Not recorded'}</span><span className="roster-sub-text">{item.email || '—'}</span></td>
      <td>{booking ? <div className="roster-booking"><strong>Dr. {booking.doctorName}</strong><span>{formatDate(booking.date)} · {booking.time}</span><em className={`booking-status booking-status-${booking.status.toLowerCase()}`}>{booking.status}</em></div> : <span className="no-booking">No booking yet</span>}</td>
      <td><span className="visit-count">{summary.total}</span><span className="roster-sub-text">{summary.total === 1 ? 'visit' : 'visits'}</span></td>
      <td><button type="button" className="patient-details-toggle" onClick={onToggle} aria-expanded={isExpanded} aria-label={`${isExpanded ? 'Hide' : 'View'} details for ${item.name}`}><span>{isExpanded ? 'Hide' : 'Details'}</span><ChevronDown size={17} /></button></td>
    </tr>
    {isExpanded && <tr className="patient-details-row"><td colSpan="6"><PatientDetails item={item} summary={summary} formatDate={formatDate} /></td></tr>}
  </>
);

const PatientDetails = ({ item, summary, formatDate }) => (
  <div className="patient-detail-panel">
    <section className="patient-info-panel"><h3>Patient information</h3><div className="patient-info-grid"><Detail icon={Phone} label="Mobile number" value={item.contactNumber} /><Detail icon={Mail} label="Email address" value={item.email} /><Detail icon={HeartPulse} label="Emergency contact" value={item.emergencyContact} /><Detail icon={MapPin} label="Address" value={item.address} /></div></section>
    <section className="booking-info-panel"><div className="booking-panel-heading"><h3><CalendarCheck size={17} /> Appointment history</h3><span>{summary.total} {summary.total === 1 ? 'booking' : 'bookings'}</span></div>{summary.recent?.length ? <div className="booking-history-list">{summary.recent.map(booking => <div className="booking-history-item" key={booking._id}><Stethoscope size={16} aria-hidden="true" /><div><strong>Dr. {booking.doctorName}</strong><span>{booking.specialization ? `${booking.specialization} · ` : ''}{formatDate(booking.date)} · {booking.time}</span></div><em className={`booking-status booking-status-${booking.status.toLowerCase()}`}>{booking.status}</em></div>)}</div> : <p className="no-booking-history">No appointments have been booked for this patient.</p>}</section>
  </div>
);

const Detail = ({ icon, label, value }) => {
  const Icon = icon;
  return <div className="patient-info-detail"><Icon size={16} aria-hidden="true" /><div><span>{label}</span><strong>{value || 'Not recorded'}</strong></div></div>;
};
const initials = name => (name || 'Patient').split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
export default Patients;
