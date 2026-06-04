import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import ApiService from '../../core/services/api.service';
import { showSuccess, showError } from '../../core/utils/toast.util';
import { OTP_CONFIG, OTP_TYPE } from '../../core/constants/app.constant';

const OTPVerificationModal = ({ 
  isOpen, 
  onClose, 
  booking, 
  otpType, 
  onSuccess 
}) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState(OTP_CONFIG.MAX_ATTEMPTS);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '']);
      setError('');
      setAttemptsRemaining(OTP_CONFIG.MAX_ATTEMPTS);
      setResendTimer(0);
      // Focus first input when modal opens
      setTimeout(() => inputRefs[0].current?.focus(), 100);
    }
  }, [isOpen]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(['', '', '', '']).slice(0, 4);
    setOtp(newOtp);
    
    // Focus last filled input or first empty
    const nextIndex = Math.min(pastedData.length, 3);
    inputRefs[nextIndex].current?.focus();
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    
    console.log('🔐 Verifying OTP:', {
      bookingId: booking.id,
      otpType,
      otpValue,
      bookingRef: booking.booking_ref
    });
    
    if (otpValue.length !== 4) {
      setError('Please enter complete 4-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let response;

      const bookingId = booking.booking_id || booking.id;
      console.log('📤 Sending verify request:', { bookingId, otpValue, otpType, bookingKeys: Object.keys(booking) });

      if (otpType === OTP_TYPE.PICKUP) {
        response = await ApiService.verifyPickup(bookingId, otpValue);
      } else {
        response = await ApiService.verifyDelivery(bookingId, otpValue);
      }

      console.log('✅ OTP verification successful:', response.data);

      showSuccess(
        otpType === OTP_TYPE.PICKUP 
          ? 'Pickup verified successfully!' 
          : 'Delivery verified successfully!'
      );
      
      console.log('📤 Calling onSuccess with:', response);
      onSuccess(response);
      onClose();
    } catch (err) {
      console.error('❌ OTP verification failed:', {
        error: err,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorData = err.response?.data?.error;
      
      if (errorData) {
        setError(errorData.message || 'Invalid OTP');
        if (errorData.attempts_remaining !== undefined) {
          setAttemptsRemaining(errorData.attempts_remaining);
        }
      } else {
        setError(err.response?.data?.message || 'Failed to verify OTP');
      }
      
      // Clear OTP on error
      setOtp(['', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');

    try {
      if (otpType === OTP_TYPE.PICKUP) {
        await ApiService.startPickup(booking.id);
        showSuccess('Pickup OTP resent successfully!');
      } else {
        await ApiService.startDelivery(booking.id);
        showSuccess('Delivery OTP resent successfully!');
      }
      
      // Start 60 second countdown
      setResendTimer(60);
      setOtp(['', '', '', '']);
      inputRefs[0].current?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const getContactInfo = () => {
    if (!booking) return { name: '', phone: '' };
    
    if (otpType === OTP_TYPE.PICKUP) {
      return {
        name: booking.parcel?.pickup_address?.name || 'Sender',
        phone: booking.parcel?.pickup_address?.phone || '',
        label: 'Sender'
      };
    } else {
      return {
        name: booking.parcel?.delivery_address?.name || 'Recipient',
        phone: booking.parcel?.delivery_address?.phone || '',
        label: 'Recipient'
      };
    }
  };

  if (!isOpen) return null;

  const contactInfo = getContactInfo();
  const isPickup = otpType === OTP_TYPE.PICKUP;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isPickup ? 'bg-blue-100' : 'bg-green-100'}`}>
              <Lock className={`w-5 h-5 ${isPickup ? 'text-blue-600' : 'text-green-600'}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isPickup ? 'Verify Pickup' : 'Verify Delivery'}
              </h2>
              <p className="text-sm text-gray-500">
                Booking: {booking?.booking_ref}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Contact Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">{contactInfo.label} Information</p>
            <p className="font-medium text-gray-900">{contactInfo.name}</p>
            <p className="text-sm text-gray-600">{contactInfo.phone}</p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              {isPickup 
                ? `Ask the sender to share the 4-digit OTP sent to their phone (${contactInfo.phone})`
                : `Ask the recipient to share the 4-digit OTP sent to their phone (${contactInfo.phone})`
              }
            </p>
          </div>

          {/* OTP Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Enter OTP <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3 justify-center" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
                {attemptsRemaining > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    {attemptsRemaining} {attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• OTP is valid for {OTP_CONFIG.EXPIRY_MINUTES} minutes</p>
            <p>• Maximum {OTP_CONFIG.MAX_ATTEMPTS} attempts allowed</p>
            <p>• After max attempts, OTP will be locked for {OTP_CONFIG.LOCKOUT_MINUTES} minutes</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 space-y-3">
          {/* Resend OTP Button */}
          <div className="flex justify-center">
            <button
              onClick={handleResend}
              disabled={resending || resendTimer > 0 || loading}
              className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {resending ? (
                'Resending...'
              ) : resendTimer > 0 ? (
                `Resend OTP in ${resendTimer}s`
              ) : (
                'Resend OTP'
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={loading || resending}
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={loading || resending || otp.join('').length !== 4}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Verify OTP
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationModal;
