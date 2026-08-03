import { UserRound, Mail, Clock, Briefcase, IndianRupee } from 'lucide-react';
import './doctorProfile.css';

const DoctorProfile = () => {
  const name = localStorage.getItem('name');
  const email = localStorage.getItem('userEmail');
  const age = localStorage.getItem('age');
  const specialization = localStorage.getItem('specialization');
  const experience = localStorage.getItem('experience');
  const consultationFee = localStorage.getItem('consultationFee');

  return (
    <div className="doctorProfile-page">
      <div className="doctorProfile-card">
        <div className="doctorProfile-header">
          <div className="doctor-avatar">
            <UserRound size={48} />
          </div>

          <div className="doctor-basic">
            <h2>Dr. {name}</h2>
            <p>{specialization} Specialist</p>
          </div>
        </div>

        <div className="doctor-details">
          <div className="profile-field">
            <span className="profile-field-label">Email Address</span>
            <span className="profile-field-value">
              <Mail size={18} style={{ color: 'var(--text-muted)' }} />
              {email}
            </span>
          </div>
          
          <div className="profile-field">
            <span className="profile-field-label">Age</span>
            <span className="profile-field-value">
              {age} Years Old
            </span>
          </div>

          <div className="profile-field">
            <span className="profile-field-label">Experience</span>
            <span className="profile-field-value">
              <Briefcase size={18} style={{ color: 'var(--text-muted)' }} />
              {experience} Years
            </span>
          </div>

          <div className="profile-field">
            <span className="profile-field-label">Consultation Fee</span>
            <span className="profile-field-value">
              <IndianRupee size={18} style={{ color: 'var(--text-muted)' }} />
              {consultationFee}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
