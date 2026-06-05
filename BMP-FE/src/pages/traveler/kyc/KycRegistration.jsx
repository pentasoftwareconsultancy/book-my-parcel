
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import RoutePath from "../../../core/constants/routes.constant";
import ApiService from "../../../core/services/api.service";
import {
  validateOnlyCharacters,
  validateAadhaar,
  validatePAN,
  validateDrivingLicense,
  validateIFSC,
  validateAccountNumber,
  validateDOB,
  validateGender,
  validateFileUpload,
  nameTypingPattern,
  aadhaarTypingPattern,
  panTypingLivePattern,
  drivingTypingLivePattern,
  ifscTypingPattern,
  accountNumberTypingPattern
} from "../../../core/utils/validation";

export default function KycRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    dob: "",
    gender: "",
    address: "",

    aadhar_number: "",
    pan_number: "",
    driving_number: "",

    aadharFront: null,
    aadharBack: null,
    panFront: null,
    panBack: null,
    drivingPhoto: null,
    selfie: null,

    account_number: "",
    account_holder: "",
    ifsc: "",
    bank_name: "",
    agree: false,
  });

const [errors, setErrors] = useState({});

  const updateStatus = async () => {
  try {
    const res = await ApiService.updateTravelerKYCStatus(1, {
      status: "approved",
    });

    console.log(res.data);
  } catch (error) {
    console.error(error);
  }
};
const fetchKYC = async () => {
  try {
    const res = await ApiService.getTravelerKYC();
    console.log(res.data);
  } catch (error) {
    console.error(error);
  }
};

// validation for  validateStep Function
const validateStep = (currentStep) => {
  const newErrors = {};

  if (currentStep === 1) {
    // Step 1: Personal Information
    const firstNameError = validateOnlyCharacters(formData.first_name, "first_name");
    if (firstNameError) newErrors.first_name = firstNameError;

    const lastNameError = validateOnlyCharacters(formData.last_name, "last_name");
    if (lastNameError) newErrors.last_name = lastNameError;

    const dobError = validateDOB(formData.dob);
    if (dobError) newErrors.dob = dobError;

    const genderError = validateGender(formData.gender);
    if (genderError) newErrors.gender = genderError;
  }

  if (currentStep === 2) {
    // Step 2: Documents
    const aadhaarError = validateAadhaar(formData.aadhar_number);
    if (aadhaarError) newErrors.aadhar_number = aadhaarError;

    const panError = validatePAN(formData.pan_number);
    if (panError) newErrors.pan_number = panError;

    const dlError = validateDrivingLicense(formData.driving_number);
    if (dlError) newErrors.driving_number = dlError;

    // File validations
    const aadharFrontError = validateFileUpload(formData.aadharFront, "aadhar_front", true);
    if (aadharFrontError) newErrors.aadharFront = aadharFrontError;

    const aadharBackError = validateFileUpload(formData.aadharBack, "aadhar_back", true);
    if (aadharBackError) newErrors.aadharBack = aadharBackError;

    const panFrontError = validateFileUpload(formData.panFront, "pan_front", true);
    if (panFrontError) newErrors.panFront = panFrontError;

    const panBackError = validateFileUpload(formData.panBack, "pan_back", true);
    if (panBackError) newErrors.panBack = panBackError;

    const selfieError = validateFileUpload(formData.selfie, "selfie", true);
    if (selfieError) newErrors.selfie = selfieError;

    const drivingPhotoError = validateFileUpload(formData.drivingPhoto, "driving_photo", false);
    if (drivingPhotoError) newErrors.drivingPhoto = drivingPhotoError;
  }

  if (currentStep === 3) {
    // Step 3: Bank Details
    const accountError = validateAccountNumber(formData.account_number);
    if (accountError) newErrors.account_number = accountError;

    const holderError = validateOnlyCharacters(formData.account_holder, "account_holder");
    if (holderError) newErrors.account_holder = holderError;

    const ifscError = validateIFSC(formData.ifsc);
    if (ifscError) newErrors.ifsc = ifscError;

    if (!formData.bank_name) newErrors.bank_name = "Bank name is required";
    if (!formData.agree) newErrors.agree = "You must agree to terms and conditions";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};



  const handleChange = (e) => {
  const { name, value, type, checked, files } = e.target;

  // Apply typing patterns
  if (name === "first_name" || name === "last_name" || name === "account_holder") {
    if (value && !nameTypingPattern.test(value)) return;
  }

  if (name === "aadhar_number") {
    if (value && !aadhaarTypingPattern.test(value)) return;
  }

  if (name === "pan_number") {
    const upperValue = value.toUpperCase();
    if (upperValue && !panTypingLivePattern.test(upperValue)) return;
    setFormData({ ...formData, [name]: upperValue });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
    return;
  }

  if (name === "driving_number") {
    const upperValue = value.toUpperCase();
    if (upperValue && !drivingTypingLivePattern.test(upperValue)) return;
    setFormData({ ...formData, [name]: upperValue });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
    return;
  }

  if (name === "ifsc") {
    const upperValue = value.toUpperCase();
    if (upperValue && !ifscTypingPattern.test(upperValue)) return;
    setFormData({ ...formData, [name]: upperValue });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
    return;
  }

  if (name === "account_number") {
    if (value && !accountNumberTypingPattern.test(value)) return;
  }

  // Update form data
  if (type === "checkbox") {
    setFormData({ ...formData, [name]: checked });
  } else if (files) {
    setFormData({ ...formData, [name]: files[0] });
  } else {
    setFormData({ ...formData, [name]: value });
  }

  // Clear error for this field
  if (errors[name]) {
    setErrors({ ...errors, [name]: "" });
  }
};

const prevStep = () => {
  if (step > 1) setStep(step - 1);
};

  const nextStep = () => {
    if (validateStep(step)) setStep(step + 1);
  };


const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate all steps before submission
  if (!validateStep(3)) {
    return;
  }

  try {
    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      const value = formData[key];
      if (key !== "agree" && value !== null) {
        data.append(key, value);
      }
    });

    const res = await ApiService.submitTravelerKYC(data);

    console.log("KYC submitted:", res.data);
    setSubmitted(true);

  } catch (err) {
    if (err.response?.status === 400) {
      alert(err.response.data.errors?.join("\n"));
    } else if (err.response?.status === 401) {
      alert("Session expired. Please login again.");
    } else {
      alert("Something went wrong");
    }
  }
};


  // SUCCESS SCREEN
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/40 p-6">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-xl text-center">
          <h2 className="text-2xl font-bold text-blue-600">KYC application submitted!</h2>
          <p className="text-gray-600 mt-2">
            We will reach out to you in few hours after the KYC verification is successfully completed.
          </p>
          <button
            onClick={() => navigate(RoutePath.TRAVELER_DASHBOARD)}
            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf8ef] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl p-10">
        <h2 className="text-3xl font-bold text-blue-600">KYC Registration</h2>

        {/* STEP BAR */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 mt-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${step >= s ? "bg-blue-600 text-white" : "border text-gray-400"
                  }`}
              >
                {step > s ? "✓" : s}
              </div>
              <span className="font-medium text-gray-700">
                {s === 1 && "Personal Information"}
                {s === 2 && "Documents"}
                {s === 3 && "Bank details"}
              </span>
              {s < 3 && (
              <>
                {/* Desktop */}
                <div className="hidden md:block w-16 h-[2px] bg-blue-600 mx-4" />

               
              </>
            )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-8">
         
          {step === 1 && (
  <div className="bg-[#fffdf7] p-8 rounded-xl border">
    <h3 className="text-lg font-semibold mb-6">Personal Information</h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label>First name <span className="text-red-500">*</span></label>
        <input 
          name="first_name" 
          onChange={handleChange} 
          value={formData.first_name} 
          placeholder="Enter first name" 
          maxLength={50}
          className={`w-full mt-2 p-3 border rounded-xl ${errors.first_name ? 'border-red-500' : ''}`}
        />
        {errors.first_name && <span className="text-red-500 text-sm">{errors.first_name}</span>}
      </div>

      <div>
        <label>Last name <span className="text-red-500">*</span></label>
        <input 
          name="last_name" 
          onChange={handleChange} 
          value={formData.last_name} 
          placeholder="Enter last name" 
          maxLength={50}
          className={`w-full mt-2 p-3 border rounded-xl ${errors.last_name ? 'border-red-500' : ''}`}
        />
        {errors.last_name && <span className="text-red-500 text-sm">{errors.last_name}</span>}
      </div>

      <div>
        <label>Date Of Birth <span className="text-red-500">*</span></label>
        <input 
          type="date" 
          name="dob" 
          onChange={handleChange} 
          value={formData.dob}
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
          min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split("T")[0]}
          className={`w-full mt-2 p-3 border rounded-xl ${errors.dob ? 'border-red-500' : ''}`}
        />
        {errors.dob && <span className="text-red-500 text-sm">{errors.dob}</span>}
      </div>

      <div>
        <label>Select Gender <span className="text-red-500">*</span></label>
        <select 
          name="gender" 
          onChange={handleChange} 
          value={formData.gender} 
          className={`w-full mt-2 p-3 border rounded-xl ${errors.gender ? 'border-red-500' : ''}`}
        >
          <option value="">Select gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
        {errors.gender && <span className="text-red-500 text-sm">{errors.gender}</span>}
      </div>

      <div className="md:col-span-2">
        <label>Address</label>
        <input 
          name="address" 
          onChange={handleChange} 
          value={formData.address} 
          placeholder="Enter address (optional)" 
          className="w-full mt-2 p-3 border rounded-xl"
        />
      </div>
    </div>
  </div>
)}


{step === 2 && (
  <div className="bg-[#fffdf7] p-8 rounded-xl border">
    <h3 className="text-lg font-semibold mb-6">Documents</h3>

    {/* Document Numbers */}
    <div className="grid md:grid-cols-2 gap-6 mb-6">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Aadhaar Number <span className="text-red-500">*</span></label>
        <input 
          name="aadhar_number" 
          placeholder="Aadhaar card number (12 digits)" 
          onChange={handleChange} 
          value={formData.aadhar_number} 
          maxLength={12}
          className={`p-3 border rounded-xl w-full ${errors.aadhar_number ? 'border-red-500' : ''}`}
          required 
        />
        {errors.aadhar_number && <span className="text-red-500 text-sm">{errors.aadhar_number}</span>}
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">PAN Number <span className="text-red-500">*</span></label>
        <input 
          name="pan_number" 
          placeholder="PAN number (e.g., ABCDE1234F)" 
          onChange={handleChange} 
          value={formData.pan_number} 
          maxLength={10}
          className={`p-3 border rounded-xl w-full ${errors.pan_number ? 'border-red-500' : ''}`}
          required 
        />
        {errors.pan_number && <span className="text-red-500 text-sm">{errors.pan_number}</span>}
        {formData.pan_number && formData.pan_number.length < 10 && (
          <span className="text-gray-400 text-xs">{formData.pan_number.length}/10 — format: AAAAA9999A</span>
        )}
      </div>
    </div>

    {/* File Upload Grid - AADHAAR & PAN */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Aadhaar Front */}
      <div>
      <p className="text-xs font-medium text-gray-700 mb-1">Aadhaar Front <span className="text-red-500">*</span></p>
      <label className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-gray-50 transition ${errors.aadharFront ? 'border-red-400' : 'border-gray-300'}`}>
        <input type="file" name="aadharFront" accept=".jpg,.jpeg,.png,.pdf" onChange={handleChange} className="hidden" />
        {formData.aadharFront ? (
          <span className="text-green-600 font-semibold text-sm text-center flex items-center gap-1"><FiCheckCircle size={14} /> {formData.aadharFront.name}</span>
        ) : (
          <>
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            <span className="text-gray-500 text-sm text-center">Aadhaar Front</span>
          </>
        )}
      </label>
      {errors.aadharFront && <p className="text-red-500 text-xs mt-1">{errors.aadharFront}</p>}
      </div>

      {/* Aadhaar Back */}
      <div>
      <p className="text-xs font-medium text-gray-700 mb-1">Aadhaar Back <span className="text-red-500">*</span></p>
      <label className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-gray-50 transition ${errors.aadharBack ? 'border-red-400' : 'border-gray-300'}`}>
        <input type="file" name="aadharBack" accept=".jpg,.jpeg,.png,.pdf" onChange={handleChange} className="hidden" />
        {formData.aadharBack ? (
          <span className="text-green-600 font-semibold text-sm text-center flex items-center gap-1"><FiCheckCircle size={14} /> {formData.aadharBack.name}</span>
        ) : (
          <>
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            <span className="text-gray-500 text-sm text-center">Aadhaar Back</span>
          </>
        )}
      </label>
      {errors.aadharBack && <p className="text-red-500 text-xs mt-1">{errors.aadharBack}</p>}
      </div>

      {/* PAN Front */}
      <div>
      <p className="text-xs font-medium text-gray-700 mb-1">PAN Front <span className="text-red-500">*</span></p>
      <label className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-gray-50 transition ${errors.panFront ? 'border-red-400' : 'border-gray-300'}`}>
        <input type="file" name="panFront" accept=".jpg,.jpeg,.png,.pdf" onChange={handleChange} className="hidden" />
        {formData.panFront ? (
          <span className="text-green-600 font-semibold text-sm text-center flex items-center gap-1"><FiCheckCircle size={14} /> {formData.panFront.name}</span>
        ) : (
          <>
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            <span className="text-gray-500 text-sm text-center">PAN Front</span>
          </>
        )}
      </label>
      {errors.panFront && <p className="text-red-500 text-xs mt-1">{errors.panFront}</p>}
      </div>

      {/* PAN Back */}
      <div>
      <p className="text-xs font-medium text-gray-700 mb-1">PAN Back <span className="text-red-500">*</span></p>
      <label className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-gray-50 transition ${errors.panBack ? 'border-red-400' : 'border-gray-300'}`}>
        <input type="file" name="panBack" accept=".jpg,.jpeg,.png,.pdf" onChange={handleChange} className="hidden" />
        {formData.panBack ? (
          <span className="text-green-600 font-semibold text-sm text-center flex items-center gap-1"><FiCheckCircle size={14} /> {formData.panBack.name}</span>
        ) : (
          <>
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            <span className="text-gray-500 text-sm text-center">PAN Back</span>
          </>
        )}
      </label>
      {errors.panBack && <p className="text-red-500 text-xs mt-1">{errors.panBack}</p>}
      </div>
    </div>

    {/* Driving License & Selfie */}
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <input 
          name="driving_number" 
          placeholder="Driving license number (optional)" 
          onChange={handleChange} 
          value={formData.driving_number} 
          className="p-3 border rounded-xl w-full mb-4"
        />
        <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-gray-50 transition">
          <input type="file" name="drivingPhoto" accept=".jpg,.jpeg,.png,.pdf" onChange={handleChange} className="hidden" />
          {formData.drivingPhoto ? (
            <span className="text-green-600 font-semibold text-sm flex items-center gap-1"><FiCheckCircle size={14} /> {formData.drivingPhoto.name}</span>
          ) : (
            <>
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              <span className="text-gray-500 text-sm">Upload Driving License (optional)</span>
            </>
          )}
        </label>
      </div>

      <div>
      <p className="text-xs font-medium text-gray-700 mb-1">Selfie <span className="text-red-500">*</span></p>
      <label className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-gray-50 transition ${errors.selfie ? 'border-red-400' : 'border-gray-300'}`}>
        <input type="file" name="selfie" accept="image/*" onChange={handleChange} className="hidden" />
        {formData.selfie ? (
          <span className="text-green-600 font-semibold text-sm flex items-center gap-1"><FiCheckCircle size={14} /> {formData.selfie.name}</span>
        ) : (
          <>
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="text-gray-500 text-sm">Take Selfie</span>
          </>
        )}
      </label>
      {errors.selfie && <p className="text-red-500 text-xs mt-1">{errors.selfie}</p>}
      </div>
    </div>
  </div>
)}



          {step === 3 && (
  <div className="bg-[#fffdf7] p-8 rounded-xl border">
    <h3 className="text-lg font-semibold mb-6">Bank details</h3>

    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Account Number <span className="text-red-500">*</span></label>
        <input 
          name="account_number" 
          placeholder="Account number" 
          onChange={handleChange} 
          value={formData.account_number} 
          className={`p-3 border rounded-xl w-full ${errors.account_number ? 'border-red-500' : ''}`}
        />
        {errors.account_number && <span className="text-red-500 text-sm">{errors.account_number}</span>}
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Account Holder Name <span className="text-red-500">*</span></label>
        <input 
          name="account_holder" 
          placeholder="Account holder name" 
          onChange={handleChange} 
          value={formData.account_holder} 
          className={`p-3 border rounded-xl w-full ${errors.account_holder ? 'border-red-500' : ''}`}
        />
        {errors.account_holder && <span className="text-red-500 text-sm">{errors.account_holder}</span>}
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">IFSC Code <span className="text-red-500">*</span></label>
        <input 
          name="ifsc" 
          placeholder="IFSC number" 
          onChange={handleChange} 
          value={formData.ifsc} 
          className={`p-3 border rounded-xl w-full ${errors.ifsc ? 'border-red-500' : ''}`}
        />
        {errors.ifsc && <span className="text-red-500 text-sm">{errors.ifsc}</span>}
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Bank Name <span className="text-red-500">*</span></label>
        <select 
          name="bank_name" 
          onChange={handleChange} 
          value={formData.bank_name} 
          className={`p-3 border rounded-xl w-full ${errors.bank_name ? 'border-red-500' : ''}`}
        >
          <option value="">Select bank name</option>
          <option>SBI</option>
          <option>HDFC</option>
          <option>ICICI</option>
          <option>Axis Bank</option>
        </select>
        {errors.bank_name && <span className="text-red-500 text-sm">{errors.bank_name}</span>}
      </div>
    </div>

    <div className="flex items-center gap-2 mt-4">
      <input type="checkbox" name="agree" onChange={handleChange} />
      <p className="text-sm">I agree to terms and condition and privacy policy.</p>
    </div>
    {errors.agree && <span className="text-red-500 text-sm">{errors.agree}</span>}
  </div>
)}


          {/* BUTTONS */}
          <div className="flex justify-between mt-8">
            <button type="button" onClick={prevStep} disabled={step === 1} className="border px-6 py-2 rounded-xl text-blue-600 font-semibold disabled:opacity-40">Previous</button>

            {step < 3 ? (
              <button type="button" onClick={nextStep} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold">Next</button>
            ) : (
              <button type="submit" disabled={!formData.agree} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold disabled:opacity-40">Submit KYC</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

