import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { disconnectSocket } from '../../utils/socket';
import './logout.css';

const Logout = () => {
  const navigate = useNavigate();
  const onClick = () => {
    disconnectSocket();
    localStorage.clear();
    navigate('/');
  };
  return (
    <div className="logout">
      <button className="logout-btn" onClick={onClick}>
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Logout;
