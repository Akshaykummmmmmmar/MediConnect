import { Outlet, NavLink } from 'react-router-dom';
import Logout from '../../LogoutBtn/logout';
import ThemeToggle from '../../ThemeToggle/themeToggle';
import NotificationBell from '../../NotificationBell/notificationBell';
import {
  LayoutDashboard,
  Building2,
  Stethoscope,
  Users,
  CalendarCheck,
  Pill,
  BarChart3,
  ScrollText,
  Receipt,
  Activity,
} from 'lucide-react';
import './admin.css';

const Admin = () => {
  const menu = [
    { to: '/admin', end: true, icon: LayoutDashboard, label: 'Dashboard' },
    { to: 'departments', end: true, icon: Building2, label: 'Departments' },
    { to: 'doctors', end: true, icon: Stethoscope, label: 'Doctors' },
    { to: 'patients', end: true, icon: Users, label: 'Patients' },
    { to: 'appointments', end: true, icon: CalendarCheck, label: 'Appointments' },
    { to: 'medicines', end: true, icon: Pill, label: 'Medicines' },
    { to: 'analytics', end: true, icon: BarChart3, label: 'Analytics' },
    { to: 'invoices', end: true, icon: Receipt, label: 'Invoices' },
    { to: 'logs', end: true, icon: ScrollText, label: 'Activity Logs' },
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
              <span className="sidebar-brand-tag">Admin Panel</span>
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
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
};
export default Admin;
