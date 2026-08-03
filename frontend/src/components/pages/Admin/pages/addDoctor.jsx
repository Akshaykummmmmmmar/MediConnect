import axios from '../../../../utils/axios';
import { ToastContainer, toast } from 'react-toastify';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import './addDoctor.css';

const AddDoctor = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    specialization: '',
    experience: '',
    licenseNumber: '',
    department: '',
    consultationFee: '',
  });

  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const ageRef = useRef();
  const specializationRef = useRef();
  const expRef = useRef();
  const licenseRef = useRef();
  const deptRef = useRef();
  const feeRef = useRef();

  const onInputChange = (e, field) => {
    setNewDoctor({ ...newDoctor, [field]: e.target.value });
  };

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) nextRef.current.focus();
    }
  };

  const onConfrimClick = async () => {
    if (
      !newDoctor.name ||
      !newDoctor.email ||
      !newDoctor.password ||
      !newDoctor.confirmPassword ||
      !newDoctor.age ||
      !newDoctor.specialization ||
      !newDoctor.experience ||
      !newDoctor.licenseNumber ||
      !newDoctor.department ||
      !newDoctor.consultationFee
    ) {
      toast.error('Please fill all fields', { autoClose: 1500 });
      return;
    }
    
    if (newDoctor.password !== newDoctor.confirmPassword) {
      toast.error("Passwords don't match!", { autoClose: 1500 });
      return;
    }

    try {
      await axios.post('/adddoctor', newDoctor);
      toast.success('Doctor added successfully');
      setNewDoctor({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        age: '',
        specialization: '',
        experience: '',
        licenseNumber: '',
        department: '',
        consultationFee: '',
      });
      setTimeout(() => navigate('/admin/doctor/dash'), 1500);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  const getDepartments = async () => {
    try {
      const response = await axios.get('/department/get');
      setDepartments(response.data);
    } catch (e) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    getDepartments();
  }, []);

  return (
    <div className="add-page-container">
      <ToastContainer />
      <div className="back-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h2>Register New Doctor</h2>
      </div>

      <div className="add-form-card">
        <div className="add-form-illustration">
          <UserPlus size={64} style={{ color: 'var(--primary)', marginBottom: '20px' }} />
          <h3>Doctor Onboarding</h3>
          <p>Please enter the doctor's details to create their profile and grant them access to the portal.</p>
        </div>
        
        <div className="add-form-grid">
          <div className="form-group full-width">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              placeholder="Dr. John Doe"
              autoFocus
              value={newDoctor.name}
              onKeyDown={e => handleKeyDown(e, emailRef)}
              onChange={e => onInputChange(e, 'name')}
            />
          </div>
          
          <div className="form-group full-width">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="doctor@example.com"
              ref={emailRef}
              value={newDoctor.email}
              onKeyDown={e => handleKeyDown(e, passwordRef)}
              onChange={e => onInputChange(e, 'email')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              ref={passwordRef}
              value={newDoctor.password}
              onKeyDown={e => handleKeyDown(e, confirmPasswordRef)}
              onChange={e => onInputChange(e, 'password')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="••••••••"
              ref={confirmPasswordRef}
              value={newDoctor.confirmPassword}
              onKeyDown={e => handleKeyDown(e, ageRef)}
              onChange={e => onInputChange(e, 'confirmPassword')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              type="number"
              id="age"
              placeholder="35"
              ref={ageRef}
              value={newDoctor.age}
              onKeyDown={e => handleKeyDown(e, specializationRef)}
              onChange={e => onInputChange(e, 'age')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="specialization">Specialization</label>
            <input
              type="text"
              id="specialization"
              placeholder="Cardiology"
              ref={specializationRef}
              value={newDoctor.specialization}
              onKeyDown={e => handleKeyDown(e, expRef)}
              onChange={e => onInputChange(e, 'specialization')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="experiance">Experience (Years)</label>
            <input
              type="number"
              id="experiance"
              placeholder="10"
              ref={expRef}
              value={newDoctor.experience}
              onKeyDown={e => handleKeyDown(e, licenseRef)}
              onChange={e => onInputChange(e, 'experience')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="licenseNumber">License Number</label>
            <input
              type="text"
              id="licenseNumber"
              placeholder="MD-12345"
              ref={licenseRef}
              value={newDoctor.licenseNumber}
              onKeyDown={e => handleKeyDown(e, deptRef)}
              onChange={e => onInputChange(e, 'licenseNumber')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="department">Department</label>
            <select
              id="department"
              ref={deptRef}
              value={newDoctor.department}
              onKeyDown={e => handleKeyDown(e, feeRef)}
              onChange={e => onInputChange(e, 'department')}
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="consultationfee">Consultation Fee (₹)</label>
            <input
              type="number"
              id="consultationfee"
              placeholder="500"
              ref={feeRef}
              value={newDoctor.consultationFee}
              onKeyDown={e => {
                if (e.key === 'Enter') onConfrimClick();
              }}
              onChange={e => onInputChange(e, 'consultationFee')}
            />
          </div>

          <button
            className="add-confirm-btn"
            onClick={onConfrimClick}
          >
            Create Doctor Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDoctor;
