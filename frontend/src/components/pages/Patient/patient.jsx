import { Outlet, NavLink } from 'react-router-dom';
import Logout from '../../LogoutBtn/logout';
import ThemeToggle from '../../ThemeToggle/themeToggle';
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarCheck,
  FileText,
  UserCircle,
  Activity,
} from 'lucide-react';
import './patient.css';

const Patient = () => {
  const menu = [
    { to: '/patient', end: true, icon: LayoutDashboard, label: 'Dashboard' },
    { to: 'patient/appointments/dash', end: true, icon: CalendarPlus, label: 'Appointments' },
    { to: 'patient/myappointments/dash', end: true, icon: CalendarCheck, label: 'My Appointments' },
    { to: 'patient/prescriptions/dash', end: true, icon: FileText, label: 'Prescriptions' },
    { to: 'patient/profile/dash', end: true, icon: UserCircle, label: 'Profile' },
  ];

  return (
    <div className="admin-container">
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
          <ThemeToggle />
          <Logout />
        </div>
      </div>

      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
};

export default Patient;
