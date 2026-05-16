import { FaUser,FaMapMarkerAlt } from "react-icons/fa";
import { CiMail,CiLock } from "react-icons/ci";
  export const signupFields = [
  { name: "name", label: "Full Name",icon:FaUser,placeholder:"Enter name", required: true },
  { name: "phone_number", label: "phone_number",icon:FaUser,placeholder:"Enter phone number", required: true },
  { name: "email", label: "Email", type: "email",icon:CiMail,placeholder:"Enter your mail", required: true },
  { name: "city", label: "City",icon:FaMapMarkerAlt,placeholder:"Enter city", required: true },
  { name: "state", label: "State", icon:FaMapMarkerAlt,placeholder:"Enter state",required: true },
  { name: "password", label: "Create Password", type: "password",icon:CiLock,placeholder:"Create a password", required: true },
  { name: "confirmPassword", label: "Confirm Password", type: "password",icon:CiLock,placeholder:"Confirm your password", required: true },
  { name: "referral_code", label: "Referral Code (optional)", icon:FaUser, placeholder:"Enter referral code", required: false },
];

export const loginFields = [
  { name: "email", label: "Email", type: "email", icon: CiMail, placeholder: "Enter your mail", required: true },
  { name: "password", label: "Password", type: "password", placeholder: "Enter your password", required: true },
];
