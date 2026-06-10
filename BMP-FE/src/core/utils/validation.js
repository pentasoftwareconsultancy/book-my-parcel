// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Enter valid email address";
  return "";
};

// Password validation
export const validatePassword = (password) => {
  if (!password) return "Password is required";

  if (password.length < 8)
    return "Password must be at least 8 characters long";

  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";

  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter";

  if (!/[0-9]/.test(password))
    return "Password must contain at least one number";

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    return "Password must contain at least one special character";

  return "";
};

// Confirm password validation
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return "Confirm password is required";

  if (password !== confirmPassword)
    return "Passwords do not match";

  return "";
};

// Indian phone validation
export const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phone) return "Mobile number is required";
  if (!phoneRegex.test(phone)) return "Enter valid 10 digit Indian mobile number";
  return "";
};

// Required field (generic)
export const validateRequired = (value, fieldName) => {
  const label = fieldName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  if (value === null || value === undefined) return `${label} is required`;

  if (typeof value === "string" && !value.trim()) return `${label} is required`;

  // if value is a file object, consider it valid (or check size if needed)
  return "";
};

// Only alphabets and spaces validation
export const validateOnlyCharacters = (value, fieldName) => {
  const nameRegex = /^[A-Za-z\s]+$/;
  const label = fieldName
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  if (!value || !value.trim()) return `${label} is required`;
  if (!nameRegex.test(value)) return `${label} must contain only letters`;
  if (value.trim().length < 2) return `${label} must be at least 2 characters`;
  return "";
};

export const validateMaxLength = (value, maxLength, fieldName) => {
  if (!value) return "";
  if (value.toString().trim().length > maxLength) return `${fieldName} cannot exceed ${maxLength} characters`;
  return "";
};

export const validatePositiveNumber = (value, fieldName = "Value", max = null) => {
  if (value === null || value === undefined || value === "") return `${fieldName} is required`;
  const num = Number(value);
  if (Number.isNaN(num) || num <= 0) return `${fieldName} must be a positive number`;
  if (max !== null && num > max) return `${fieldName} cannot exceed ${max}`;
  return "";
};

// Name typing pattern (for blocking invalid typing)
export const nameTypingPattern = /^[A-Za-z\s]*$/;

// PIN code typing pattern (for input)
export const pinTypingPattern = /^\d{0,6}$/;

// Phone typing pattern
export const phoneTypingPattern = /^\d{0,10}$/;
export const numberTypingPattern = /^\d{0,10}$/;

// Indian PIN code validation
export const validatePincode = (pincode) => {
  const pinRegex = /^[1-9]\d{5}$/;

  if (!pincode) return "PIN code is required";
  if (!pinRegex.test(pincode)) return "Enter a valid 6-digit Indian PIN code";
  return "";
};

// ---------------- AADHAAR ----------------
// Typing pattern: digits only, max 12
export const aadhaarTypingPattern = /^\d{0,12}$/;

// Full validation on blur/submit
export const validateAadhaar = (aadhaar) => {
  if (!aadhaar) return ""; // optional
  if (!/^\d{12}$/.test(aadhaar)) return "Enter valid 12-digit Aadhaar number";
  return "";
};

// ---------------- PAN ---------------------
export const panTypingPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
// Progressive PAN typing: enforces AAAAA9999A structure char by char
export const panTypingLivePattern = /^[A-Z]{0,5}$|^[A-Z]{5}[0-9]{0,4}$|^[A-Z]{5}[0-9]{4}[A-Z]{0,1}$/;

export const validatePAN = (pan) => {
  if (!pan) return "PAN number is required";
  if (pan.length !== 10) return "PAN must be exactly 10 characters";
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) return "Enter valid PAN (e.g., ABCDE1234F): 5 letters, 4 digits, 1 letter";
  return "";
};

// ---------------- DRIVING -----------------
export const drivingTypingPattern = /^(([A-Z]{2}[0-9]{2})( )|([A-Z]{2}-[0-9]{2}))((19|20)[0-9][0-9])[0-9]{7}$/;
export const drivingTypingLivePattern = /^[A-Z0-9\- ]{0,16}$/; // allow partial typing

export const validateDrivingLicense = (dl) => {
  if (!dl) return ""; // optional
  if (!/^(([A-Z]{2}[0-9]{2})( )|([A-Z]{2}-[0-9]{2}))((19|20)[0-9][0-9])[0-9]{7}$/.test(dl)) 
    return "Enter valid driving license number";
  return "";
};

// ---------------- IFSC ---------------------
export const ifscTypingPattern = /^[A-Z0-9]{0,11}$/;

export const validateIFSC = (ifsc) => {
  if (!ifsc) return "IFSC code is required";
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) return "Enter valid IFSC code (e.g., SBIN0001234)";
  return "";
};

// ---------------- ACCOUNT NUMBER ---------------------
export const accountNumberTypingPattern = /^\d{0,18}$/;

export const validateAccountNumber = (accountNumber) => {
  if (!accountNumber) return "Account number is required";
  if (!/^\d{9,18}$/.test(accountNumber)) return "Enter valid account number (9-18 digits)";
  return "";
};

// ---------------- DATE OF BIRTH ---------------------
export const validateDOB = (dob) => {
  if (!dob) return "Date of birth is required";

  const birthDate = new Date(dob);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (birthDate >= today) return "Date of birth cannot be today or in the future";

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;

  if (age < 18) return "You must be at least 18 years old";
  if (age > 100) return "Please enter a valid date of birth";

  return "";
};

// ---------------- GENDER ---------------------
export const validateGender = (gender) => {
  if (!gender) return "Gender is required";
  return "";
};

// ---------------- FILE UPLOAD ---------------------
export const validateFileUpload = (file, fieldName, isRequired = true) => {
  const label = fieldName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  
  if (!file) {
    return isRequired ? `${label} is required` : "";
  }
  
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  
  if (file.size > maxSize) return `${label} must be less than 5MB`;
  if (!allowedTypes.includes(file.type)) return `${label} must be JPG, PNG, or PDF`;
  
  return "";
};


// ---------------- ROUTE VALIDATION -----------------

// Vehicle number validation — handles all Indian formats:
// MH02AX1234, MH-02-AX-1234, DL01CAB1234, etc.
export const vehicleNumberTypingPattern = /^[A-Z0-9-]{0,13}$/;

export const validateVehicleNumber = (vehicleNumber) => {
  if (!vehicleNumber) return ""; // optional field
  const cleaned = vehicleNumber.replace(/[-\s]/g, "").toUpperCase();
  // State code (2 letters) + district (2 digits) + series (1-3 letters) + number (4 digits)
  if (!/^[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}$/.test(cleaned)) {
    return "Enter valid vehicle number (e.g., MH02AX1234 or DL01CAB1234)";
  }
  return "";
};

// Date validation
export const validateFutureDate = (date, fieldName = "Date") => {
  if (!date) return `${fieldName} is required`;
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    return `${fieldName} cannot be in the past`;
  }
  return "";
};

// Arrival date validation
export const validateArrivalDate = (departureDate, arrivalDate) => {
  if (!arrivalDate) return "Arrival date is required";
  if (!departureDate) return "";
  const departure = new Date(departureDate);
  const arrival = new Date(arrivalDate);
  if (arrival < departure) {
    return "Arrival date must be after departure date";
  }
  return "";
};

// Weight validation
export const validateWeight = (weight, fieldName = "Weight") => {
  if (!weight) return `${fieldName} is required`;
  const numWeight = Number(weight);
  if (isNaN(numWeight) || numWeight <= 0) {
    return `${fieldName} must be a positive number`;
  }
  if (numWeight > 1000) {
    return `${fieldName} cannot exceed 1000 kg`;
  }
  return "";
};

// Minimum earning validation
export const validateMinEarning = (earning) => {
  if (!earning) return ""; // optional
  const numEarning = Number(earning);
  if (isNaN(numEarning) || numEarning < 0) {
    return "Minimum earning must be a positive number";
  }
  if (numEarning > 100000) {
    return "Minimum earning seems too high";
  }
  return "";
};


// ---------------- TRAVEL ROUTE YUP SCHEMA -----------------
import * as yup from "yup";

const addressSchema = yup.object({
  place_id: yup.string().nullable(),
  name: yup.string().nullable(),
  address: yup.string().required("Street address is required"),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  pincode: yup.string().matches(/^[0-9]{6}$/, "Pincode must be 6 digits").required("Pincode is required"),
  country: yup.string().required("Country is required"),
  lat: yup.number().nullable(),
  lng: yup.number().nullable(),
});

export const travelRouteSchema = yup.object({
  origin: addressSchema,
  destination: addressSchema,
  isRecurring: yup.boolean(),
  departureDate: yup.string().when("isRecurring", {
    is: false,
    then: (s) => s.required("Departure date is required").test("future", "Must be today or later", (value) => {
      if (!value) return false;
      return value >= new Date().toLocaleDateString("en-CA");
    }),
    otherwise: (s) => s.nullable(),
  }),
  departureTime: yup.string().required("Departure time is required"),
  arrivalDate: yup.string().required("Arrival date is required").test("after-departure", "Arrival date must be after departure date", function (value) {
    const { departureDate, isRecurring } = this.parent;
    if (isRecurring || !departureDate || !value) return true;
    return new Date(value) >= new Date(departureDate);
  }),
  arrivalTime: yup.string().required("Arrival time is required"),
  recurringStartDate: yup.string().when("isRecurring", {
    is: true,
    then: (s) => s.required("Start date is required").test("future", "Must be today or later", (value) => {
      if (!value) return false;
      return value >= new Date().toLocaleDateString("en-CA");
    }),
    otherwise: (s) => s.nullable(),
  }),
  recurringEndDate: yup.string().nullable().test("after-start", "End date must be after start date", function (value) {
    const { recurringStartDate, isRecurring } = this.parent;
    if (!isRecurring || !recurringStartDate || !value) return true;
    return new Date(value) >= new Date(recurringStartDate);
  }),
  recurringDays: yup.array().when("isRecurring", {
    is: true,
    then: (s) => s.min(1, "Select at least one day"),
    otherwise: (s) => s.nullable(),
  }),
});


export const validateName = (name, fieldName = "Name") => {
  const label = fieldName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  if (!name || !name.trim()) return `${label} is required`;

  if (!/^[A-Za-z\s]+$/.test(name)) {
    return `${label} must contain only letters`;
  }

  if (name.trim().length < 2) {
    return `${label} must be at least 2 characters`;
  }

  if (name.trim().length > 50) {
    return `${label} is too long`;
  }

  return "";
};

