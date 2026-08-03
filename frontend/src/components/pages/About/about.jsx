import {
  CircleArrowLeft,
  Stethoscope,
  Users,
  Target,
  Eye,
  ListChecks,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './about.css';

const About = () => {
  const navigate = useNavigate();
  const onArrowClick = () => {
    navigate('/');
  };
  const onClick = () => {
    navigate('/signUp');
  };
  return (
    <div className="about-page">
      <div className="about-topbar">
        <CircleArrowLeft className="about-back" onClick={onArrowClick} />
        <div className="about-brand">
          <Stethoscope size={22} />
          MediConnect
        </div>
      </div>

      <div className="about-hero">
        <h1>
          About <span>MediConnect</span>
        </h1>
        <p>
          MediConnect is a modern hospital management system designed to
          simplify healthcare operations, improve efficiency, and enhance
          patient care through secure and smart digital solutions.
        </p>
      </div>

      <div className="about-grid">
        <div className="about-card">
          <div className="about-icon">
            <Users />
          </div>
          <h3>Who We Are</h3>
          <p>
            MediConnect is a healthcare technology platform built to streamline
            hospital operations. Our system connects patients, doctors, and
            administrators in one centralized digital environment.
          </p>
        </div>

        <div className="about-card">
          <div className="about-icon">
            <Target />
          </div>
          <h3>Our Mission</h3>
          <p>
            To modernize hospital management by providing a secure, reliable,
            and easy-to-use platform that empowers healthcare providers to focus
            more on patient care and less on administrative tasks.
          </p>
        </div>

        <div className="about-card">
          <div className="about-icon">
            <Eye />
          </div>
          <h3>Our Vision</h3>
          <p>
            We envision a future where healthcare institutions operate
            seamlessly through digital transformation, ensuring better patient
            outcomes and operational excellence.
          </p>
        </div>

        <div className="about-card about-wide">
          <div className="about-icon">
            <ListChecks />
          </div>
          <h3>What We Offer</h3>
          <ul>
            <li>Patient Record Management</li>
            <li>Doctor &amp; Staff Management</li>
            <li>Appointment Scheduling</li>
            <li>Billing &amp; Invoice Generation</li>
            <li>Secure Data Storage</li>
            <li>Reports &amp; Analytics Dashboard</li>
          </ul>
        </div>
      </div>

      <div className="about-cta">
        <h2>Join Us in Transforming Healthcare</h2>
        <p>
          Be part of the digital revolution in hospital management and improve
          healthcare efficiency today.
        </p>
        <button className="about-btn" onClick={onClick}>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default About;
