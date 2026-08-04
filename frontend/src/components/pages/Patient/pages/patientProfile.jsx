import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from '../../../../utils/axios';
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
  IdCard,
  X,
} from 'lucide-react';
import './patientProfile.css';

const PatientProfile = () => {
  const name = localStorage.getItem('name');
  const email = localStorage.getItem('userEmail');
  const age = localStorage.getItem('age');
  const address = localStorage.getItem('address');
  const gender = localStorage.getItem('gender');
  const patientId = localStorage.getItem('userId')?.slice(-6).toUpperCase() || '1023';

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const openPasswordModal = () => {
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordModal(true);
  };

  const changePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      return toast.error('All fields are required');
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("New passwords don't match");
    }
    try {
      setChangingPassword(true);
      await axios.patch('/change-password', passwordForm);
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="profile-page-wrapper">
      <ToastContainer position="top-right" autoClose={3000} />
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
              <button className="password-update-btn" onClick={openPasswordModal}>Update</button>
            </div>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="change-password-overlay" onClick={() => !changingPassword && setShowPasswordModal(false)}>
          <div className="change-password-card" onClick={e => e.stopPropagation()}>
            <div className="change-password-header">
              <h3><Lock size={18} /> Change Password</h3>
              <button
                className="change-password-close"
                type="button"
                aria-label="Close change password"
                onClick={() => setShowPasswordModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="change-password-body">
              <label className="password-field">
                <span>Current Password</span>
                <input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  placeholder="Enter current password"
                />
              </label>
              <label className="password-field">
                <span>New Password</span>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Minimum 6 characters"
                />
              </label>
              <label className="password-field">
                <span>Confirm New Password</span>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                />
              </label>
            </div>
            <div className="change-password-actions">
              <button
                className="change-password-cancel"
                type="button"
                onClick={() => setShowPasswordModal(false)}
                disabled={changingPassword}
              >
                Cancel
              </button>
              <button
                className="change-password-submit"
                type="button"
                onClick={changePassword}
                disabled={changingPassword}
              >
                {changingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfile;
