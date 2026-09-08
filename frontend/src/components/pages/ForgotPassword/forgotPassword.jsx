import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import notify from '../../../utils/toast';
import { CircleArrowLeft, Stethoscope, ShieldCheck, MailWarning } from 'lucide-react';
import axios from '../../../utils/axios';
import { isEmail } from '../../../utils/validation';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!isEmail(email)) return notify.error('Enter a valid email address', { autoClose: 1200 });
    try {
      setLoading(true);
      const res = await axios.post('/forgot-password', { email });
      notify.success(res.data.message);
    } catch (e) {
      notify.error(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <CircleArrowLeft className="auth-back" onClick={() => navigate('/')} />

      <div className="auth-sidebar">
        <div className="auth-brand">
          <Stethoscope size={26} />
          MediConnect
        </div>
        <img src="Gemini_Generated_Image_1psbey1psbey1psb.png" alt="" className="auth-img" />
        <div className="auth-sidebar-copy">
          <h2>Reset Your Password</h2>
          <p>Enter your registered email to receive a password reset token.</p>
          <span className="auth-trust">
            <ShieldCheck size={16} />
            Secure recovery
          </span>
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <div className="otp-icon-circle">
            <MailWarning size={36} />
          </div>
          <h1>Forgot Password</h1>
          <p className="auth-subtitle">We'll generate a reset token for your account.</p>

          <div className="auth-field">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') onSubmit();
              }}
              placeholder="you@example.com"
            />
          </div>

          <button className="auth-btn" onClick={onSubmit} disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <p className="auth-switch">
            Remembered it? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
