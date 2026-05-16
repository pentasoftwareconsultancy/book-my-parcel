import { useState } from "react";
import ApiService from "../../core/services/api.service";
import {
  validateAccountNumber,
  validateIFSC,
  validateOnlyCharacters,
  validatePhone,
  ifscTypingPattern,
  accountNumberTypingPattern,
  nameTypingPattern,
  phoneTypingPattern,
} from "../../core/utils/validation";

const BankForm = ({ onSuccess, setLoading, setError }) => {
  const [step, setStep] = useState(1); // 1: Bank Verification, 2: Recipient Details
  const [verificationResult, setVerificationResult] = useState(null);
  
  const [form, setForm] = useState({
    accountNumber: "",
    ifsc: "",
    bankName: "",
  });
  
  const [recipientForm, setRecipientForm] = useState({
    recipientName: "",
    mobileNumber: "",
  });
  
  const [errors, setErrors] = useState({});
  const [recipientErrors, setRecipientErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "ifsc") {
      const upper = value.toUpperCase();
      if (upper && !ifscTypingPattern.test(upper)) return;
      setForm({ ...form, [name]: upper });
      if (errors[name]) setErrors({ ...errors, [name]: "" });
      return;
    }

    if (name === "accountNumber") {
      if (value && !accountNumberTypingPattern.test(value)) return;
    }

    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleRecipientChange = (e) => {
    const { name, value } = e.target;

    if (name === "recipientName") {
      if (value && !nameTypingPattern.test(value)) return;
    }

    if (name === "mobileNumber") {
      if (value && !phoneTypingPattern.test(value)) return;
    }

    setRecipientForm({ ...recipientForm, [name]: value });
    if (recipientErrors[name]) setRecipientErrors({ ...recipientErrors, [name]: "" });
  };

  const validateStep1 = () => {
    const newErrors = {};
    const accountErr = validateAccountNumber(form.accountNumber);
    if (accountErr) newErrors.accountNumber = accountErr;
    
    // IFSC is optional
    if (form.ifsc) {
      const ifscErr = validateIFSC(form.ifsc);
      if (ifscErr) newErrors.ifsc = ifscErr;
    }
    
    if (!form.bankName) newErrors.bankName = "Bank name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    const nameErr = validateOnlyCharacters(recipientForm.recipientName, "recipient_name");
    if (nameErr) newErrors.recipientName = nameErr;
    
    const phoneErr = validatePhone(recipientForm.mobileNumber);
    if (phoneErr) newErrors.mobileNumber = phoneErr;
    
    setRecipientErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!validateStep1() || isSubmitting) return;
    
    setIsSubmitting(true);
    setLoading(true);
    setError("");

    try {
      const res = await ApiService.verifyBankAccount(form);
      
      // Handle different response structures
      const data = res.data?.data || res.data;
      
      if (data) {
        setVerificationResult(data);
        setStep(2);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Bank verification failed");
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (!validateStep2() || isSubmitting) return;
    
    setIsSubmitting(true);
    setLoading(true);
    setError("");

    try {
      const res = await ApiService.addBankRecipient({
        ...form,
        ...recipientForm,
        verificationId: verificationResult?.id,
      });
      
      // Handle different response structures
      const data = res.data?.data || res.data;
      
      if (data) {
        onSuccess(data);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to add recipient details");
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // Step 1: Bank Verification Form
  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
          
          {/* Header with Icon */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Step 1: Bank Verification
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Verify your bank account details
              </p>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-green-800">
              <p className="font-medium">Verification Fee: ₹1</p>
              <p className="text-green-600 mt-1">A small fee of ₹1 will be charged to verify your bank account.</p>
            </div>
          </div>

          <form onSubmit={handleStep1Submit} className="space-y-5">

            {/* Bank Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Bank <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="bankName"
                  value={form.bankName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all appearance-none ${errors.bankName ? 'border-red-400' : 'border-gray-300'}`}
                >
                  <option value="">Select your bank</option>
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  <option value="Punjab National Bank">Punjab National Bank</option>
                  <option value="Bank of Baroda">Bank of Baroda</option>
                  <option value="Canara Bank">Canara Bank</option>
                  <option value="Union Bank of India">Union Bank of India</option>
                  <option value="IndusInd Bank">IndusInd Bank</option>
                  <option value="Yes Bank">Yes Bank</option>
                  <option value="IDFC First Bank">IDFC First Bank</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="accountNumber"
                  placeholder="Enter your account number"
                  value={form.accountNumber}
                  onChange={handleChange}
                  maxLength={18}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all ${errors.accountNumber ? 'border-red-400' : 'border-gray-300'}`}
                />
                <div className="absolute right-3 top-3 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              {errors.accountNumber
                ? <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>
                : <p className="text-xs text-gray-500 mt-1">9-18 digit account number</p>
              }
            </div>

            {/* IFSC Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                IFSC Code <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="ifsc"
                  placeholder="SBIN0001234"
                  value={form.ifsc}
                  onChange={handleChange}
                  maxLength={11}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all ${errors.ifsc ? 'border-red-400' : 'border-gray-300'}`}
                />
                <div className="absolute right-3 top-3 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              {errors.ifsc
                ? <p className="text-red-500 text-xs mt-1">{errors.ifsc}</p>
                : <p className="text-xs text-gray-500 mt-1">11-character IFSC code (e.g., SBIN0001234) &nbsp;{form.ifsc.length}/11</p>
              }
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verify Bank Account
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Your bank details are encrypted and secure</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Recipient Details Form
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Success Message - ₹1 Sent */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-green-800 mb-2">
              ₹1 Sent Successfully!
            </h3>
            <p className="text-green-700 text-sm mb-3">
              We have sent ₹1 to your bank account for verification. Please check your account to confirm the transaction.
            </p>
            <div className="flex items-center gap-2 text-xs text-green-600 bg-white/60 rounded-lg px-3 py-2 inline-flex">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>It may take 1-2 minutes to reflect in your account</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Verification Result Card */}
      {verificationResult && (
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Bank Verified Successfully</h3>
                <p className="text-green-200 text-xs">Account details confirmed</p>
              </div>
            </div>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Bank Name</p>
              <p className="text-sm font-semibold text-gray-800">{form.bankName}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Account Number</p>
              <p className="text-sm font-semibold text-gray-800">****{form.accountNumber.slice(-4)}</p>
            </div>
            {form.ifsc && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">IFSC Code</p>
                <p className="text-sm font-semibold text-gray-800">{form.ifsc}</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Verification Amount</p>
              <p className="text-sm font-semibold text-green-600">₹1 Credited</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 Form */}
      <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
        
        {/* Header with Icon */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Step 2: Add Recipient Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Provide recipient information for withdrawals
            </p>
          </div>
        </div>

        <form onSubmit={handleStep2Submit} className="space-y-5">

          {/* Recipient Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Recipient Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="recipientName"
                placeholder="Enter recipient name"
                value={recipientForm.recipientName}
                onChange={handleRecipientChange}
                maxLength={100}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all ${recipientErrors.recipientName ? 'border-red-400' : 'border-gray-300'}`}
              />
              <div className="absolute right-3 top-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            {recipientErrors.recipientName && <p className="text-red-500 text-xs mt-1">{recipientErrors.recipientName}</p>}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                name="mobileNumber"
                placeholder="Enter mobile number"
                value={recipientForm.mobileNumber}
                onChange={handleRecipientChange}
                maxLength={10}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all ${recipientErrors.mobileNumber ? 'border-red-400' : 'border-gray-300'}`}
              />
              <div className="absolute right-3 top-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>
            {recipientErrors.mobileNumber
              ? <p className="text-red-500 text-xs mt-1">{recipientErrors.mobileNumber}</p>
              : <p className="text-xs text-gray-500 mt-1">10-digit mobile number</p>
            }
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Complete Bank Verification
          </button>
        </form>

        {/* Security Note */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Your information is encrypted and secure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankForm;
