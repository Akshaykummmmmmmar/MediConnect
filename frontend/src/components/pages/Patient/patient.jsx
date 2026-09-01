import { Outlet, NavLink } from 'react-router-dom';
import Logout from '../../LogoutBtn/logout';
import ThemeToggle from '../../ThemeToggle/themeToggle';
import NotificationBell from '../../NotificationBell/notificationBell';
import Breadcrumbs from '../../Breadcrumbs/breadcrumbs';
import CommandPalette from '../../CommandPalette/commandPalette';
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarCheck,
  FileText,
  UserCircle,
  FolderOpen,
  Receipt,
  Activity,
} from 'lucide-react';
import './patient.css';

const Patient = () => {
  const menu = [
    { to: '/patient', end: true, icon: LayoutDashboard, label: 'Dashboard' },
    { to: 'appointments', end: true, icon: CalendarPlus, label: 'Book Appointment' },
    { to: 'my-appointments', end: true, icon: CalendarCheck, label: 'My Appointments' },
    { to: 'prescriptions', end: true, icon: FileText, label: 'Prescriptions' },
    { to: 'records', end: true, icon: FolderOpen, label: 'Medical Records' },
    { to: 'invoices', end: true, icon: Receipt, label: 'Invoices' },
    { to: 'profile', end: true, icon: UserCircle, label: 'Profile' },
  ];

  return (
    <div className="admin-container">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <div className="admin-sidebar">
        <div>
          <div className="sidebar-brand">
            <span className="sidebar-logo">
              <Activity size={24} />
            </span>
            <div>
              <span className="sidebar-brand-name">MediConnect</span>
              <span className="sidebar-brand-tag">Patient Panel</span>
            </div>
          </div>

          <ul className="menu-list">
            {menu.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="sidebar-bottom">
          <NotificationBell />
          <ThemeToggle />
          <Logout />
        </div>
      </div>

      <div className="admin-main" id="main-content">
        <Breadcrumbs />
        <Outlet />
      </div>
      <CommandPalette />
    </div>
  );
};

export default Patient;
