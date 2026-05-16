/**
 * Safely formats a number to a fixed decimal places
 * @param {any} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} - Formatted number or fallback value
 */
export const safeToFixed = (value, decimals = 1, fallback = "N/A") => {
  if (value === null || value === undefined) {
    return fallback;
  }
  
  if (typeof value === 'number') {
    return value.toFixed(decimals);
  }
  
  const parsed = parseFloat(value);
  if (!isNaN(parsed)) {
    return parsed.toFixed(decimals);
  }
  
  return fallback;
};

/**
 * Safely converts a value to a number
 * @param {any} value - The value to convert
 * @returns {number|null} - Converted number or null
 */
export const safeToNumber = (value) => {
  if (value === null || value === undefined) {
    return null;
  }
  
  if (typeof value === 'number') {
    return value;
  }
  
  const parsed = parseFloat(value);
  return !isNaN(parsed) ? parsed : null;
};