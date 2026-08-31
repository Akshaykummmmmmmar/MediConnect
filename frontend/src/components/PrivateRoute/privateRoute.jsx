import { Outlet, Navigate } from 'react-router-dom';

const roleRouteMap = {
  admin: '/admin',
  doctor: '/doctor',
  patient: '/patient',
};

const PrivateRoute = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const currentPath = window.location.pathname;
  const allowedPrefix = roleRouteMap[role];

  if (allowedPrefix && !currentPath.startsWith(allowedPrefix)) {
    return <Navigate to={allowedPrefix} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
