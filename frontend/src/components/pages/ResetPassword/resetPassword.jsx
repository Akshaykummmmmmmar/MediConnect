import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { CircleArrowLeft, Stethoscope, ShieldCheck, KeyRound } from 'lucide-react';
import axios from '../../../utils/axios';
import { isStrongPassword } from '../../../utils/validation';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tokenParam = params.get('token') || '';
  const [token, setToken] = useState(tokenParam);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!token) return toast.error('Reset token is required', { autoClose: 1000 });
    if (!isStrongPassword(password))
      return toast.error('Password must be at least 6 characters', { autoClose: 1200 });
    if (password !== confirmPassword)
      return toast.error("Passwords don't match", { autoClose: 1200 });
    try {
      setLoading(true);
      await axios.post('/reset-password', { token, password, confirmPassword });
      toast.success('Password reset successfully. Please login.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <ToastContainer />
      <CircleArrowLeft className="auth-back" onClick={() => navigate('/')} />

      <div className="auth-sidebar">
        <div className="auth-brand">
          <Stethoscope size={26} />
          MediConnect
        </div>
        <img src="Gemini_Generated_Image_1psbey1psbey1psb.png" alt="" className="auth-img" />
        <div className="auth-sidebar-copy">
          <h2>Choose a New Password</h2>
          <p>Enter your reset token and set a new strong password for your account.</p>
          <span className="auth-trust">
            <ShieldCheck size={16} />
            Secure recovery
          </span>
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <div className="otp-icon-circle">
            <KeyRound size={36} />
          </div>
          <h1>Reset Password</h1>
          <p className="auth-subtitle">Set a new password for your account.</p>

          <div className="auth-field">
            <label htmlFor="token">Reset Token</label>
            <input
              type="text"
              id="token"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="Paste the reset token"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirm">Confirm New Password</label>
            <input
              type="password"
              id="confirm"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') onSubmit();
              }}
              placeholder="Re-enter new password"
            />
          </div>

          <button className="auth-btn" onClick={onSubmit} disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          <p className="auth-switch">
            Back to <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
