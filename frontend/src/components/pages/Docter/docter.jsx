import { Outlet, NavLink } from 'react-router-dom';
import Logout from '../../LogoutBtn/logout';
import ThemeToggle from '../../ThemeToggle/themeToggle';
import NotificationBell from '../../NotificationBell/notificationBell';
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarClock,
  UserCircle,
  Clock3,
  Activity,
} from 'lucide-react';
import './docter.css';

const Doctor = () => {
  const menu = [
    { to: '/doctor', end: true, icon: LayoutDashboard, label: 'Dashboard' },
    { to: 'doctor/appointments/', end: true, icon: CalendarCheck, label: 'Appointments' },
    { to: 'doctor/appointment/today', end: true, icon: CalendarClock, label: "Today's Appointments" },
    { to: 'doctor/availability/dash', end: true, icon: Clock3, label: 'My Availability' },
    { to: 'doctor/profile/dash', end: true, icon: UserCircle, label: 'Profile' },
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
              <span className="sidebar-brand-tag">Doctor Panel</span>
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

export default Doctor;
