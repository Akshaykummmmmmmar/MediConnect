import { Outlet, NavLink } from 'react-router-dom';
import Logout from '../../LogoutBtn/logout';
import ThemeToggle from '../../ThemeToggle/themeToggle';
import {
  LayoutDashboard,
  Building2,
  Stethoscope,
  Users,
  CalendarCheck,
  Pill,
  Activity,
} from 'lucide-react';
import './admin.css';

const Admin = () => {
  const menu = [
    { to: '/admin', end: true, icon: LayoutDashboard, label: 'Dashboard' },
    { to: 'department/dash', end: true, icon: Building2, label: 'Departments' },
    { to: 'doctor/dash', end: true, icon: Stethoscope, label: 'Doctors' },
    { to: 'patient/dash', end: true, icon: Users, label: 'Patients' },
    { to: 'appointment/dash', end: true, icon: CalendarCheck, label: 'Appointments' },
    { to: 'medicines/dash', end: true, icon: Pill, label: 'Medicines' },
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
