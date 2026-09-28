/**
 * Pakistan 11-digit mobile/phone validator required by backend
 * Must be 11 numeric characters, e.g. 03001234567
 */
export const isValidPhone = (phone) => {
  return /^[0-9]{11}$/.test(String(phone).trim());
};

/**
 * Standard email validator
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
};

/**
 * Positive numeric validator
 */
export const isNonNegativeNumber = (val) => {
  const num = Number(val);
  return !isNaN(num) && num >= 0;
};
