import { CircleArrowLeft, Stethoscope, ShieldCheck } from 'lucide-react';
import notify from '../../../utils/toast';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from '../../../utils/axios';
import { validateRegister } from '../../../utils/validation';
import './sign.css';

const Sign = () => {
  const navigate = useNavigate();
  const [newUser, setNewUser] = useState({
    name: '',
    age: '',
    gender: '',
    emergencyContact: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
  });

  const ageRef = useRef();
  const genderRef = useRef();
  const emergencyContactRef = useRef();
  const formRef = useRef();
  const emailref = useRef();
  const contactref = useRef();
  const passwordref = useRef();
  const confirmref = useRef();

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) nextRef.current.focus();
    }
  };

  const handleTab = e => {
    if (e.key !== 'Tab' || !formRef.current) return;
    const list = Array.from(
      formRef.current.querySelectorAll('input, select, button, a')
    ).filter(el => !el.disabled && el.tabIndex !== -1);
    if (list.length === 0) return;
    const index = list.indexOf(document.activeElement);
    if (e.shiftKey) {
      if (index <= 0) {
        e.preventDefault();
        list[list.length - 1].focus();
      }
    } else if (index === -1 || index === list.length - 1) {
      e.preventDefault();
      list[0].focus();
    }
  };
  const onArrowClick = () => navigate('/');

  const onChange = (e, field) => {
    setNewUser({ ...newUser, [field]: e.target.value });
  };
  const onSignUpClick = async () => {
    const {
      name,
      age,
      gender,
      emergencyContact,
      email,
      contactNumber,
      password,
      confirmPassword,
    } = newUser;
    if (
      !name ||
      !age ||
      !gender ||
      !emergencyContact ||
      !email ||
      !contactNumber ||
      !password ||
      !confirmPassword
    ) {
      notify.error('Please fill all fields', { autoClose: 1000 });
      return;
    }
    if (password !== confirmPassword) {
      notify.error("Passwords don't match", { autoClose: 1000 });
      return;
    }
    const errors = validateRegister(newUser);
    if (errors.length > 0) {
      notify.error(errors[0], { autoClose: 1500 });
      return;
    }
    try {
      const res = await axios.post('/signUp/register', newUser);
      notify.success(res.data.message || 'OTP sent to your email');
      setTimeout(
        () => navigate(`/verify-otp?email=${encodeURIComponent(res.data.email)}`),
        1200
      );
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
          src="Screenshot 2026-02-24 161808.png"
          alt="MediConnect secure healthcare platform"
          className="auth-img"
        />
        <div className="auth-sidebar-copy">
          <h2>Create Your Account</h2>
          <p>
            Join MediConnect to manage appointments, prescriptions, and records
            securely.
          </p>
          <span className="auth-trust">
            <ShieldCheck size={16} />
            Your data is always safe
          </span>
        </div>
      </div>

      <div className="auth-main">
        <div
          className="auth-card auth-card-signup"
          ref={formRef}
          onKeyDown={handleTab}
        >
          <h1>Create Account</h1>
          <p className="auth-subtitle">Register as a patient</p>

          <div className="auth-form-grid">
            <div className="auth-field">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                required
                autoFocus
                onKeyDown={e => handleKeyDown(e, emergencyContactRef)}
                onChange={e => onChange(e, 'name')}
              />
            </div>
            <div className="auth-field">
              <label htmlFor="emergency">Emergency Contact</label>
              <input
                type="text"
                id="emergency"
                required
                ref={emergencyContactRef}
                onKeyDown={e => handleKeyDown(e, ageRef)}
                onChange={e => onChange(e, 'emergencyContact')}
              />
            </div>
            <div className="auth-field">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                required
                ref={ageRef}
                onKeyDown={e => handleKeyDown(e, genderRef)}
                onChange={e => onChange(e, 'age')}
              />
            </div>
            <div className="auth-field">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                ref={genderRef}
                required
                onKeyDown={e => handleKeyDown(e, emailref)}
                onChange={e => onChange(e, 'gender')}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                required
                ref={emailref}
                onKeyDown={e => handleKeyDown(e, contactref)}
                onChange={e => onChange(e, 'email')}
              />
            </div>
            <div className="auth-field">
              <label htmlFor="contact-number">Contact Number</label>
              <input
                type="tel"
                id="contact-number"
                pattern="[0-9]{10}"
                ref={contactref}
                onKeyDown={e => handleKeyDown(e, passwordref)}
                onChange={e => onChange(e, 'contactNumber')}
              />
            </div>
            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                required
                ref={passwordref}
                onKeyDown={e => handleKeyDown(e, confirmref)}
                onChange={e => onChange(e, 'password')}
              />
            </div>
            <div className="auth-field">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                required
                ref={confirmref}
                onKeyDown={e => {
                  if (e.key === 'Enter') onSignUpClick();
                }}
                onChange={e => onChange(e, 'confirmPassword')}
              />
            </div>
          </div>

          <button onClick={onSignUpClick} className="auth-btn">
            Sign Up
          </button>
          <p className="auth-switch">
            Already have an account?
            <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sign;
