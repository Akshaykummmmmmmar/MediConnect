import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { disconnectSocket } from '../../utils/socket';
import ConfirmDialog from '../ui/ConfirmDialog';
import './logout.css';

const Logout = () => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    disconnectSocket();
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="logout">
      <button className="logout-btn" onClick={() => setShowConfirm(true)}>
        <LogOut size={18} />
        <span>Logout</span>
      </button>
      <ConfirmDialog
        open={showConfirm}
        title="Logout?"
        message="Are you sure you want to logout? You will need to sign in again."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default Logout;
