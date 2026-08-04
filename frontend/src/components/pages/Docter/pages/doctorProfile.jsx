import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from '../../../../utils/axios';
import { UserRound, Mail, Briefcase, IndianRupee, Star, Edit3, Save, X, Stethoscope } from 'lucide-react';
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
      toast.error(e.response?.data?.message || e.message);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const saveProfile = async () => {
    try {
      const id = profile?._id;
      if (!id) return toast.error('Doctor not found');
      await axios.patch(`/doctor/update/${id}`, {
        about: form.about,
        qualifications: form.qualifications.split(',').map(q => q.trim()).filter(Boolean),
        experience: Number(form.experience),
        consultationFee: Number(form.consultationFee),
        specialization: form.specialization,
      });
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="doctorProfile-page">
      <ToastContainer position="top-right" autoClose={3000} />

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
                  <Mail size={18} style={{ color: 'var(--text-muted)' }} />
                  {localStorage.getItem('userEmail')}
                </span>
              </div>

              <div className="profile-field">
                <span className="profile-field-label">Experience</span>
                <span className="profile-field-value">
                  <Briefcase size={18} style={{ color: 'var(--text-muted)' }} />
                  {profile.experience} Years
                </span>
              </div>

              <div className="profile-field">
                <span className="profile-field-label">Consultation Fee</span>
                <span className="profile-field-value">
                  <IndianRupee size={18} style={{ color: 'var(--text-muted)' }} />
                  {profile.consultationFee}
                </span>
              </div>

              {profile.qualifications?.length > 0 && (
                <div className="profile-field">
                  <span className="profile-field-label">Qualifications</span>
                  <span className="profile-field-value">
                    <Stethoscope size={18} style={{ color: 'var(--text-muted)' }} />
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
    </div>
  );
};

export default DoctorProfile;
