const Doctor = require('./database/models/docterSchema');
const Appointment = require('./database/models/appointmentSchema');

const getDoctorIdForUser = async (userId, { lean = true } = {}) => {
  if (!userId) return null;
  const doctor = await Doctor.findOne({ user: userId }).select('_id').lean(lean);
  return doctor ? doctor._id.toString() : null;
};

const hasDoctorPatientRelationship = async (doctorId, patientId) => {
  if (!doctorId || !patientId) return false;
  const count = await Appointment.countDocuments({
    doctor: doctorId,
    patient: patientId,
  });
  return count > 0;
};

const isAdmin = req => req.user?.role === 'admin';

const forbid = res =>
  res
    .status(403)
    .json({ message: 'You are not authorized to access this resource' });

module.exports = { getDoctorIdForUser, hasDoctorPatientRelationship, isAdmin, forbid };