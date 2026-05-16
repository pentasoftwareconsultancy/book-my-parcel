/**
 * Request OTP for a given phone number
 * @param {string} phone - The phone number to send OTP to
 * @returns {Promise} - Resolves with success message or rejects with error
 */
export const requestOTP = async (phone) => {
  try {
    // First check if user exists
    const checkResponse = await ApiService.checkUserExists({ phone });
    
    if (!checkResponse.data.exists) {
      throw new Error('User not registered. Please register first.');
    }
    
    // If user exists, proceed with OTP request
    const response = await ApiService.requestOTP(phone);
    return response.data;
  } catch (error) {
    console.error('Error requesting OTP:', error);
    throw error;
  }
};