const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10}$/;

export const isEmail = value => EMAIL_REGEX.test(value || '');
export const isPhone = value => PHONE_REGEX.test((value || '').replace(/\D/g, ''));
export const isStrongPassword = value => (value || '').length >= 6;

export const validateRegister = data => {
  const errors = [];
  if (!data.name || data.name.trim().length < 3)
    errors.push('Name must be at least 3 characters');
  if (!isEmail(data.email)) errors.push('Enter a valid email address');
  if (data.age && (Number(data.age) < 1 || Number(data.age) > 120))
    errors.push('Enter a valid age');
  if (!['Male', 'Female'].includes(data.gender))
    errors.push('Select a valid gender');
  if (data.contactNumber && !isPhone(data.contactNumber))
    errors.push('Enter a valid 10-digit contact number');
  if (data.emergencyContact && !isPhone(data.emergencyContact))
    errors.push('Enter a valid 10-digit emergency contact');
  if (!isStrongPassword(data.password))
    errors.push('Password must be at least 6 characters');
  if (data.password !== data.confirmPassword)
    errors.push("Passwords don't match");
  return errors;
};

export const validateDoctor = data => {
  const errors = [];
  if (!data.name || data.name.trim().length < 3)
    errors.push('Name must be at least 3 characters');
  if (!isEmail(data.email)) errors.push('Enter a valid email address');
  if (!isStrongPassword(data.password))
    errors.push('Password must be at least 6 characters');
  if (data.password !== data.confirmPassword)
    errors.push("Passwords don't match");
  if (data.age && (Number(data.age) < 20 || Number(data.age) > 90))
    errors.push('Enter a valid age');
  if (!data.specialization) errors.push('Specialization is required');
  if (data.licenseNumber && data.licenseNumber.length < 3)
    errors.push('Enter a valid license number');
  if (!data.department) errors.push('Department is required');
  if (
    data.consultationFee !== undefined &&
    data.consultationFee !== '' &&
    Number(data.consultationFee) <= 0
  )
    errors.push('Enter a valid consultation fee');
  return errors;
};

export const validateMedicine = data => {
  const errors = [];
  if (!data.name) errors.push('Medicine name is required');
  if (data.price !== undefined && data.price !== '' && Number(data.price) < 0)
    errors.push('Enter a valid price');
  return errors;
};
