import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, LayoutDashboard } from 'lucide-react';
import './breadcrumbs.css';

const routeNames = {
  '/admin': 'Dashboard',
  '/admin/departments': 'Departments',
  '/admin/doctors': 'Doctors',
  '/admin/doctors/add': 'Add Doctor',
  '/admin/patients': 'Patients',
  '/admin/appointments': 'Appointments',
  '/admin/medicines': 'Medicines',
  '/admin/medicines/add': 'Add Medicine',
  '/admin/analytics': 'Analytics',
  '/admin/invoices': 'Invoices',
  '/admin/logs': 'Activity Logs',
  '/admin/inventory/alerts': 'Inventory Alerts',
  '/doctor': 'Dashboard',
  '/doctor/appointments': 'Appointments',
  '/doctor/calendar': 'Calendar',
  '/doctor/today': "Today's Appointments",
  '/doctor/availability': 'Availability',
  '/doctor/profile': 'Profile',
  '/patient': 'Dashboard',
  '/patient/appointments': 'Book Appointment',
  '/patient/my-appointments': 'My Appointments',
  '/patient/prescriptions': 'Prescriptions',
  '/patient/records': 'Medical Records',
  '/patient/invoices': 'Invoices',
  '/patient/profile': 'Profile',
};

const Breadcrumbs = () => {
  const location = useLocation();
  const path = location.pathname;

  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  let acc = '';
  const crumbs = [{ to: '/', label: null, key: 'root' }];

  segments.forEach((seg, idx) => {
    acc += `/${seg}`;
    const isLast = idx === segments.length - 1;
    const label = routeNames[acc] || decodeURIComponent(seg).replace(/-/g, ' ');

    if (acc === '/admin' || acc === '/doctor' || acc === '/patient') return;

    crumbs.push({ to: acc, label, isLast, key: acc });
  });

  if (crumbs.length === 1) return null;

  const root = segments[0];

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link className="breadcrumb-crumb breadcrumb-home" to={`/${root}`}>
        <LayoutDashboard size={14} /> Home
      </Link>
      {crumbs.slice(1).map((crumb) => (
        <span className="breadcrumb-segment" key={crumb.key}>
          <ChevronRight size={14} className="breadcrumb-chevron" />
          {crumb.isLast ? (
            <span className="breadcrumb-crumb current" aria-current="page">
              {crumb.label}
            </span>
          ) : (
            <Link className="breadcrumb-crumb" to={crumb.to}>
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
