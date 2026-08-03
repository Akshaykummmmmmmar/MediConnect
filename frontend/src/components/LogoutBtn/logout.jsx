import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import './logout.css';

const Logout = () => {
  const navigate = useNavigate();
  const onClick = () => {
    localStorage.removeItem('token');
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
