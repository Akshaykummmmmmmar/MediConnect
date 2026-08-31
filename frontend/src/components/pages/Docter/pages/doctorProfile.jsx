import { useEffect, useState } from 'react';
import notify from '../../../../utils/toast';
import axios from '../../../../utils/axios';
import { UserRound, Mail, Briefcase, IndianRupee, Star, Edit3, Save, X, Stethoscope, Lock } from 'lucide-react';
import './doctorProfile.css';

const DoctorProfile = () => {
  const userId = localStorage.getItem('userId');
  const doctorId = localStorage.getItem('doctorId');
  const [profile, setProfile] = useState(null);
  const [rating, setRating] = useState({ average: 0, count: 0 });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    about: '',
    qualifications: '',
    experience: '',
    consultationFee: '',
    specialization: '',
  });
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
      return notify.error('All fields are required');
    }
    if (passwordForm.newPassword.length < 6) {
      return notify.error('New password must be at least 6 characters');
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return notify.error("New passwords don't match");
    }
    try {
      setChangingPassword(true);
      await axios.patch('/change-password', passwordForm);
      notify.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      notify.error(e.response?.data?.message || e.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const fetchProfile = async () => {
    try {
      let doctor = null;
      if (doctorId) {
        const res = await axios.get(`/doctors/get?page=1&limit=50`);
        doctor = (res.data.items || []).find(d => d._id === doctorId) || null;
      }
      if (!doctor && userId) {
        const res = await axios.get(`/doctor/byUser/${userId}`);
        doctor = res.data.doctor || res.data;
      }
      if (doctor) {
        setProfile(doctor);
        setForm({
          about: doctor.about || '',
          qualifications: Array.isArray(doctor.qualifications) ? doctor.qualifications.join(', ') : doctor.qualifications || '',
          experience: doctor.experience || '',
          consultationFee: doctor.consultationFee || '',
          specialization: doctor.specialization || '',
        });
        try {
          const rateRes = await axios.get(`/ratings/doctor/${doctor._id}`);
          setRating({ average: rateRes.data.average, count: rateRes.data.count });
        } catch { /* ratings optional */ }
      }
    } catch (e) {
      notify.error(e.response?.data?.message || e.message);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const saveProfile = async () => {
    try {
      const id = profile?._id;
      if (!id) return notify.error('Doctor not found');
      await axios.patch(`/doctor/update/${id}`, {
        about: form.about,
        qualifications: form.qualifications.split(',').map(q => q.trim()).filter(Boolean),
        experience: Number(form.experience),
        consultationFee: Number(form.consultationFee),
        specialization: form.specialization,
      });
      notify.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (e) {
      notify.error(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="doctorProfile-page">

      {!profile ? (
        <div className="loading-state">Loading profile...</div>
      ) : (
        <div className="doctorProfile-card">
          <div className="doctorProfile-header">
            <div className="doctor-avatar">
              <UserRound size={48} />
            </div>

            <div className="doctor-basic">
              <h2>Dr. {localStorage.getItem('name')}</h2>
              <p>{profile.specialization} Specialist</p>
              <div className="rating-chip">
                <Star size={15} fill="currentColor" />
                <span>{rating.average ? rating.average.toFixed(1) : '—'}</span>
                <span className="rating-count">({rating.count} ratings)</span>
              </div>
            </div>

            {!editing && (
              <button className="edit-profile-btn" onClick={() => setEditing(true)}>
                <Edit3 size={15} /> Edit Profile
              </button>
            )}
          </div>

          {editing ? (
            <div className="edit-profile-form">
              <div className="profile-field">
                <span className="profile-field-label">Specialization</span>
                <input
                  value={form.specialization}
                  onChange={e => setForm({ ...form, specialization: e.target.value })}
                />
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Experience (years)</span>
                <input
                  type="number"
                  value={form.experience}
                  onChange={e => setForm({ ...form, experience: e.target.value })}
                />
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Consultation Fee (₹)</span>
                <input
                  type="number"
                  value={form.consultationFee}
                  onChange={e => setForm({ ...form, consultationFee: e.target.value })}
                />
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Qualifications (comma separated)</span>
                <input
                  value={form.qualifications}
                  onChange={e => setForm({ ...form, qualifications: e.target.value })}
                />
              </div>
              <div className="profile-field">
                <span className="profile-field-label">About</span>
                <textarea
                  rows="3"
                  value={form.about}
                  onChange={e => setForm({ ...form, about: e.target.value })}
                />
              </div>
              <div className="edit-actions">
                <button className="save-profile-btn" onClick={saveProfile}>
                  <Save size={15} /> Save Changes
                </button>
                <button className="cancel-edit-btn" onClick={() => setEditing(false)}>
                  <X size={15} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="doctor-details">
              <div className="profile-field">
                <span className="profile-field-label">Email Address</span>
                <span className="profile-field-value">
                  <Mail size={18} className="icon-muted" />
                  {localStorage.getItem('userEmail')}
                </span>
              </div>

              <div className="profile-field">
                <span className="profile-field-label">Experience</span>
                <span className="profile-field-value">
                  <Briefcase size={18} className="icon-muted" />
                  {profile.experience} Years
                </span>
              </div>

              <div className="profile-field">
                <span className="profile-field-label">Consultation Fee</span>
                <span className="profile-field-value">
                  <IndianRupee size={18} className="icon-muted" />
                  {profile.consultationFee}
                </span>
              </div>

              {profile.qualifications?.length > 0 && (
                <div className="profile-field">
                  <span className="profile-field-label">Qualifications</span>
                  <span className="profile-field-value">
                    <Stethoscope size={18} className="icon-muted" />
                    {profile.qualifications.join(', ')}
                  </span>
                </div>
              )}

              {profile.about && (
                <div className="profile-field">
                  <span className="profile-field-label">About</span>
                  <span className="profile-field-value about-text">{profile.about}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="doctorProfile-security">
          <div className="security-heading">
            <Lock size={18} />
            <div>
              <h4>Change Password</h4>
              <p>Update your account password regularly for better security.</p>
            </div>
            <button className="password-update-btn" onClick={openPasswordModal}>Update</button>
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

export default DoctorProfile;
