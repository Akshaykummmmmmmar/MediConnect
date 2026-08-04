import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../../utils/axios';
import {
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  Users,
  CalendarCheck,
  ClipboardList,
  LayoutDashboard,
  LockKeyhole,
  HeartPulse,
  Clock3,
  CheckCircle2,
  Bell,
} from 'lucide-react';
import './home.css';

const dashboardPathFor = role => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'doctor':
      return '/doctor';
    case 'patient':
      return '/patient';
    default:
      return '/login';
  }
};

const formatStat = value => (typeof value === 'number' ? value.toLocaleString() : value);

const Home = () => {
  const [stats, setStats] = useState({ doctors: 120, patients: '50K', appointments: 25 });
  const role = localStorage.getItem('role');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/doctors/count');
        setStats({
          doctors: res.data.doctors || 0,
          patients: res.data.patients || 0,
          appointments: res.data.appointments || 0,
        });
      } catch {
        /* keep defaults on error */
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="home-page">
      <nav className="home-navbar">
        <div className="home-logo">
          <Stethoscope className="home-logo-icon" />
          <span>MediConnect</span>
        </div>
        <div className="navbar-links">
          <Link to="/about" className="home-link">
            About
          </Link>
          <Link to="/services" className="home-link">
            Services
          </Link>
          {role ? (
            <Link to={dashboardPathFor(role)} className="home-link home-link-login">
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="home-link home-link-login">
                Login
              </Link>
              <Link to="/signUp" className="home-link home-link-signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="home-hero">
        <div className="home-hero-content">
          <div className="home-hero-badge">
            <ShieldCheck size={18} />
            Trusted healthcare management platform
          </div>
          <h1 className="home-hero-title">
            Hospital Management <span>Made Easy</span>
          </h1>
          <p className="home-hero-subtitle">
            Efficiently manage patients, doctors, appointments, and billing —
            all in one smart, secure platform. Save time, reduce errors, and
            provide better healthcare service.
          </p>
          <div className="home-hero-actions">
            <Link to="/signUp" className="home-cta-primary">
              Get Started <ArrowRight size={18} />
            </Link>
            <Link to="/services" className="home-cta-secondary">
              Explore Services
            </Link>
          </div>
          <div className="home-stats">
            <div className="home-stat">
              <h3>{formatStat(stats.doctors)}+</h3>
              <span>Doctors</span>
            </div>
            <div className="home-stat">
              <h3>{formatStat(stats.patients)}+</h3>
              <span>Patients</span>
            </div>
            <div className="home-stat">
              <h3>{formatStat(stats.appointments)}+</h3>
              <span>Appointments</span>
            </div>
          </div>
        </div>
        <div className="home-hero-image">
          <div className="home-platform-preview" aria-label="MediConnect dashboard preview">
            <div className="preview-topbar">
              <div className="preview-brand"><HeartPulse size={18} /> MediConnect</div>
              <Bell size={17} />
            </div>
            <div className="preview-content">
              <div className="preview-welcome"><span>Good morning</span><strong>Your care, at a glance.</strong></div>
              <div className="preview-metrics">
                <div><span>Today</span><strong>12</strong><small>Appointments</small></div>
                <div><span>Records</span><strong>48</strong><small>Updated securely</small></div>
              </div>
              <div className="preview-appointment">
                <div className="preview-avatar">DR</div>
                <div><strong>Dr. Priya Sharma</strong><span>Cardiology · 10:30 AM</span></div>
                <CheckCircle2 size={20} />
              </div>
              <div className="preview-bars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-trust-strip" aria-label="MediConnect benefits">
        <div><LockKeyhole size={20} /><span><strong>Secure by design</strong> Protected health information</span></div>
        <div><HeartPulse size={20} /><span><strong>Built for care teams</strong> One connected workspace</span></div>
        <div><Clock3 size={20} /><span><strong>Always in sync</strong> Faster, clearer coordination</span></div>
      </section>

      <section className="home-features">
        <div className="home-feature-card">
          <div className="home-feature-icon">
            <Users />
          </div>
          <h3>Smart Management</h3>
          <p>
            Manage patients, doctors, and staff from one unified, easy-to-use
            dashboard.
          </p>
        </div>
        <div className="home-feature-card">
          <div className="home-feature-icon">
            <CalendarCheck />
          </div>
          <h3>Easy Appointments</h3>
          <p>
            Book and track appointments in real time with automatic reminders.
          </p>
        </div>
        <div className="home-feature-card">
          <div className="home-feature-icon">
            <ClipboardList />
          </div>
          <h3>Digital Records</h3>
          <p>
            Secure, instant access to prescriptions and medical history.
          </p>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer-brand"><Stethoscope size={19} /> MediConnect</div>
        <p>Connected care, made simpler.</p>
        <div className="home-footer-links"><Link to="/about">About</Link><Link to="/services">Services</Link><Link to="/login">Sign in</Link></div>
      </footer>
    </div>
  );
};

export default Home;
