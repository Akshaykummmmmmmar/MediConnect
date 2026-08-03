import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  ShieldCheck,
  Edit,
  Lock,
  IdCard
} from 'lucide-react';
import './patientProfile.css';

const PatientProfile = () => {
  const name = localStorage.getItem('name');
  const email = localStorage.getItem('userEmail');
  const age = localStorage.getItem('age');
  const address = localStorage.getItem('address');
  const gender = localStorage.getItem('gender');
  const patientId = localStorage.getItem('userId')?.slice(-6).toUpperCase() || '1023';

  return (
    <div className="profile-page-wrapper">
      <div className="profile-header-card">
        <div className="profile-banner"></div>
        <div className="profile-main-info">
          <div className="profile-avatar-container">
            <div className="profile-avatar-circle">
              {name?.charAt(0).toUpperCase()}
            </div>
            <div className="verified-badge">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="profile-title-section">
            <h2>{name}</h2>
            <p><IdCard size={14} /> Patient ID: P-{patientId}</p>
          </div>
          <div className="profile-quick-actions">
            <button className="edit-profile-btn">
              <Edit size={16} /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="profile-content-grid">
        <div className="profile-info-section">
          <h3 className="section-title"><User size={18} /> Personal Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-icon"><User size={18} /></div>
              <div className="info-text">
                <label>Full Name</label>
                <p>{name}</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon"><Calendar size={18} /></div>
              <div className="info-text">
                <label>Age</label>
                <p>{age} Years</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon"><Users size={18} /></div>
              <div className="info-text">
                <label>Gender</label>
                <p>{gender || 'Not specified'}</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon"><ShieldCheck size={18} /></div>
              <div className="info-text">
                <label>Blood Group</label>
                <p>O+ Positive</p>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-info-section">
          <h3 className="section-title"><Phone size={18} /> Contact Details</h3>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-icon"><Mail size={18} /></div>
              <div className="info-text">
                <label>Email Address</label>
                <p>{email}</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon"><Phone size={18} /></div>
              <div className="info-text">
                <label>Phone Number</label>
                <p>+91 9876543210</p>
              </div>
            </div>
            <div className="info-item full-width">
              <div className="info-icon"><MapPin size={18} /></div>
              <div className="info-text">
                <label>Residential Address</label>
                <p>{address || 'No address provided.'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-info-section security-section">
          <h3 className="section-title"><Lock size={18} /> Security & Settings</h3>
          <div className="security-actions">
            <div className="security-item">
              <div>
                <h4>Change Password</h4>
                <p>Update your account password regularly for better security.</p>
              </div>
              <button className="password-update-btn">Update</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
