import { useNavigate } from 'react-router-dom';
import {
  CircleArrowLeft,
  Stethoscope,
  ShieldCheck,
  Mail,
  LockKeyhole,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import notify from '../../../utils/toast';
import axios from '../../../utils/axios';
import './login.css';

const Login = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    email: '',
    password: '',
  });

  const passwordRef = useRef();

  const onChange = (e, field) => {
    setUser({ ...user, [field]: e.target.value });
  };
  const onArrowClick = () => {
    navigate('/');
  };

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    }
  };

  const onLoginClick = async () => {
    if (!user.email || !user.password) {
      notify.error('Please fill all fields', { autoClose: 1000 });
      return;
    }
    try {
      const response = await axios.post('/login', user);
      if (response.data.needsOtp) {
        notify.info('Please verify your email first');
        navigate(`/verify-otp?email=${encodeURIComponent(response.data.email)}`);
        return;
      }
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data._id);
      localStorage.setItem('userEmail', response.data.email);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('name', response.data.name);

      const role = response.data.role;

      if (role === 'admin') navigate('/admin');
      else if (role === 'doctor') {
        const userId = response.data._id;
        const doctorRes = await axios.get(`/doctor/byUser/${userId}`);
        const doctorId = doctorRes.data._id;
        localStorage.setItem('doctorId', doctorId);
        navigate('/doctor');
        localStorage.setItem('age', response.data.doctor.age);
        localStorage.setItem('experience', response.data.doctor.experience);
        localStorage.setItem(
          'consultationFee',
          response.data.doctor.consultationFee
        );
        localStorage.setItem(
          'specialization',
          response.data.doctor.specialization
        );
      } else if (role === 'patient') {
        localStorage.setItem('age', response.data.patient.age);
        localStorage.setItem('address', response.data.patient.address);
        localStorage.setItem('gender', response.data.patient.gender);

        navigate('/patient');
      }
    } catch (e) {
      notify.error(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="login-page">
      <CircleArrowLeft className="auth-back" onClick={onArrowClick} />

      <div className="auth-sidebar">
        <div className="auth-brand">
          <Stethoscope size={26} />
          MediConnect
        </div>
        <img
          src="Gemini_Generated_Image_1psbey1psbey1psb.png"
          alt="MediConnect hospital management dashboard preview"
          className="auth-img"
        />
        <div className="auth-sidebar-copy">
          <h2>Hospital Management Made Easy</h2>
          <p>
            Manage patients, doctors, and appointments securely in one place.
          </p>
          <span className="auth-trust">
            <ShieldCheck size={16} />
            Trusted &amp; secure platform
          </span>
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <h1>Welcome Back</h1>
          <p className="auth-subtitle">Log in to your MediConnect account</p>
          <div className="auth-field">
            <label htmlFor="login-email">Email</label>
            <div className="auth-input-wrap">
              <Mail className="auth-input-icon" size={18} aria-hidden="true" />
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                autoFocus
                onKeyDown={e => handleKeyDown(e, passwordRef)}
                onChange={e => onChange(e, 'email')}
              />
            </div>
          </div>
          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <div className="auth-input-wrap">
              <LockKeyhole className="auth-input-icon" size={18} aria-hidden="true" />
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                ref={passwordRef}
                onKeyDown={e => {
                  if (e.key === 'Enter') onLoginClick();
                }}
                onChange={e => onChange(e, 'password')}
              />
            </div>
          </div>
          <button className="auth-btn" onClick={onLoginClick}>
            Login
          </button>
          <p className="auth-switch">
            Forgot password? <Link to="/forgot-password">Reset it</Link>
          </p>
          <p className="auth-switch">
            Don't have an account?
            <Link to="/signUp">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
