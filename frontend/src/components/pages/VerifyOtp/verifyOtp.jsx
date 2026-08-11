import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CircleArrowLeft, Stethoscope, ShieldCheck, KeyRound } from 'lucide-react';
import axios from '../../../utils/axios';
import './verifyOtp.css';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const emailParam = params.get('email') || '';
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const onVerify = async () => {
    if (!email) return toast.error('Email is required', { autoClose: 1000 });
    if (!otp || otp.length !== 6) return toast.error('Enter the 6-digit OTP', { autoClose: 1000 });
    try {
      setLoading(true);
      await axios.post('/verify-otp', { email, otp });
      toast.success('Email verified! You can now login.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (!email) return toast.error('Email is required', { autoClose: 1000 });
    try {
      const res = await axios.post('/resend-otp', { email });
      toast.success(`New OTP sent${res.data.otp ? `: ${res.data.otp}` : ''}`);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
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
          <h2>Verify Your Email</h2>
          <p>Enter the one-time password sent to your email to activate your account.</p>
          <span className="auth-trust">
            <ShieldCheck size={16} />
            Secure verification
          </span>
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <div className="otp-icon-circle">
            <KeyRound size={36} />
          </div>
          <h1>Email Verification</h1>
          <p className="auth-subtitle">Check your inbox for the 6-digit OTP.</p>

          <div className="auth-field">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="otp">One-Time Password</label>
            <input
              type="text"
              id="otp"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="6-digit code"
              onKeyDown={e => {
                if (e.key === 'Enter') onVerify();
              }}
            />
          </div>

          <button className="auth-btn" onClick={onVerify} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>

          <p className="otp-hint">
            Didn't receive the code?{' '}
            <button className="otp-link-btn" onClick={onResend}>
              Resend OTP
            </button>
          </p>
          <p className="auth-switch">
            Already verified? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
