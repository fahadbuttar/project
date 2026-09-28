/**
 * Format currency amount with currency symbol
 * @param {number} amount
 * @param {string} currency - Default PKR
 * @returns {string}
 */
export const formatCurrency = (amount, currency = 'Rs.') => {
  const val = Number(amount) || 0;
  return `${currency} ${val.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format date string into human-readable date and time
 * @param {string | Date} dateStr
 * @param {boolean} includeTime
 * @returns {string}
 */
export const formatDate = (dateStr, includeTime = true) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Invalid Date';

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime
      ? { hour: '2-digit', minute: '2-digit', hour12: true }
      : {}),
  };

  return d.toLocaleDateString('en-PK', options);
};

/**
 * Format 11-digit phone number as 0300-1234567
 * @param {string} phone
 * @returns {string}
 */
export const formatPhone = (phone) => {
  if (!phone || phone.length !== 11) return phone || '';
  return `${phone.slice(0, 4)}-${phone.slice(4)}`;
};

/**
 * Capitalize first letter of string
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Clean error message extractor from backend error response
 * @param {any} error
 * @param {string} fallback
 * @returns {string}
 */
export const getErrorMessage = (error, fallback = 'An unexpected error occurred') => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.messege) return error.response.data.messege;
  if (error.response?.data && typeof error.response.data === 'string') return error.response.data;
  if (error.message) return error.message;
  return fallback;
};
