import {
  ShieldCheck,
  User,
  AlertTriangle,
  Activity,
  UserX,
  Edit,
  Info,
  Lock,
} from "lucide-react";
export const privacyPolicyData = {
  intro:
    "By registering as a traveler, you agree to all privacy policies.",

  sections: [
    {
      icon: ShieldCheck,
      iconClass: "text-green-600",
      title: "1. Information We Collect",
      list: [
        "Personal info: Name, Phone, Email, Routes",
        "Delivery info: Parcel details and status",
        "Technical data: IP, device, usage data",
      ],
    },
    {
      icon: Activity,
      iconClass: "text-blue-600",
      title: "2. How We Use Information",
      list: [
        "Parcel matching",
        "Communication",
        "Payments",
        "Platform improvement",
        "Legal compliance",
      ],
    },
    {
      icon: Info,
      iconClass: "text-purple-600",
      title: "3. Information Sharing",
      text:
        "Shared only with users and authorized partners. We never sell traveler data.",
    },
    {
      icon: Lock,
      iconClass: "text-teal-600",
      title: "4. Data Security",
      text:
        "Reasonable safeguards are used but no system is 100% secure.",
    },
    {
      icon: User,
      iconClass: "text-orange-600",
      title: "5. Data Retention",
      text:
        "Data stored only as required by law. Travelers may request deletion.",
    },
    {
      icon: UserX,
      iconClass: "text-red-600",
      title: "6. Traveler Rights",
      list: [
        "Access personal data",
        "Correct data",
        "Request deletion",
        "Withdraw consent",
      ],
    },
    {
      icon: Activity,
      iconClass: "text-green-600",
      title: "7. Cookies & Tracking",
      text:
        "Used for login and analytics. Manage via browser settings.",
    },
    {
      icon: AlertTriangle,
      iconClass: "text-yellow-600",
      title: "8. Children's Privacy",
      text: "Travelers must be 18+ years old.",
    },
    {
      icon: Edit,
      iconClass: "text-gray-600",
      title: "9. Policy Updates",
      text: "Policy may be updated periodically.",
    },
    {
      icon: Info,
      iconClass: "text-blue-600",
      title: "10. Contact Us",
      text: "Contact official support for privacy concerns.",
    },
  ],
};

import {
  Shield,
  Database,
  Globe,
  Mail,
  FileText,
} from "lucide-react";

export const companyPrivacyPolicyData = {
  pageTitle: "Company Privacy Policy",
  intro:
    "This Privacy Policy explains how the Company collects, uses, stores, and protects personal and business information provided through our platform and services.",

  sections: [
    {
      title: "Information We Collect",
      icon: User,
      iconClass: "text-blue-600",
      text:
        "We may collect personal information such as name, email address, phone number, company details, business information, and any data voluntarily submitted through our platform.",
    },
    {
      title: "How We Use Information",
      icon: Database,
      iconClass: "text-green-600",
      text:
        "Collected information is used to provide services, improve user experience, communicate updates, manage accounts, process requests, and comply with legal obligations.",
    },
    {
      title: "Data Security",
      icon: Lock,
      iconClass: "text-red-600",
      text:
        "We implement reasonable technical and organizational measures to protect your information against unauthorized access, disclosure, alteration, or destruction.",
    },
    {
      title: "Information Sharing",
      icon: Globe,
      iconClass: "text-purple-600",
      text:
        "We do not sell personal information. Information may be shared with trusted service providers, legal authorities when required, or business partners necessary for service delivery.",
    },
    {
      title: "User Rights",
      icon: Shield,
      iconClass: "text-orange-600",
      list: [
        "Access your personal information",
        "Request correction of inaccurate data",
        "Request deletion of information where applicable",
        "Withdraw consent where permitted by law",
        "Request details regarding data processing",
      ],
    },
    {
      title: "Cookies and Tracking",
      icon: FileText,
      iconClass: "text-indigo-600",
      text:
        "Our platform may use cookies and similar technologies to improve functionality, analyze usage, and enhance user experience.",
    },
    {
      title: "Contact Information",
      icon: Mail,
      iconClass: "text-pink-600",
      text:
        "For questions regarding this Privacy Policy or data handling practices, please contact the Company through the official contact information provided on the website.",
    },
  ],
};