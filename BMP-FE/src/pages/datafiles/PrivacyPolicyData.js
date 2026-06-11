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
    "At Book My Parcel, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, share, and safeguard your data when you use our platform.",

  sections: [
    {
      icon: ShieldCheck,
      iconClass: "text-green-600",
      title: "1. Information We Collect",
      list: [
        "Personal Information: Name, Phone Number, Email Address, Pickup and Drop Addresses",
        "Parcel Information: Parcel Type, Description, Size or Weight (if applicable)",
        "Usage & Technical Data: Device Information, Browser Type, IP Address, Platform Usage Data",
      ],
    },
    {
      icon: Activity,
      iconClass: "text-blue-600",
      title: "2. How We Use Information",
      list: [
        "Facilitate parcel pickup and delivery",
        "Connect users with suitable travelers",
        "Enable communication between users and travelers",
        "Provide tracking updates",
        "Improve platform functionality and user experience",
        "Ensure safety, prevent misuse, and comply with legal requirements",
      ],
    },
    {
      icon: Info,
      iconClass: "text-purple-600",
      title: "3. Information Sharing",
      text:
        "We share user information only when necessary, including with selected travelers for pickup and delivery coordination, recipients for parcel handover, and service providers supporting platform operations. We do not sell or rent your personal data to third parties.",
    },
    {
      icon: User,
      iconClass: "text-orange-600",
      title: "4. Traveler & Third-Party Disclosure",
      text:
        "Travelers on Book My Parcel are independent individuals and not employees. Necessary delivery-related information may be shared with a third person involved in parcel handover, depending on the traveler’s mode of transport. Users acknowledge and consent to this limited data sharing for delivery purposes.",
    },
    {
      icon: Lock,
      iconClass: "text-teal-600",
      title: "5. Data Security",
      text:
        "We implement reasonable security measures to protect your data from unauthorized access, loss, or misuse. However, no online platform can guarantee 100% security, and users share information at their own risk.",
    },
    {
      icon: Activity,
      iconClass: "text-green-600",
      title: "6. Data Retention",
      text:
        "We retain personal data only as long as necessary to provide services or meet legal obligations. Users may request data deletion, subject to regulatory requirements.",
    },
    {
      icon: UserX,
      iconClass: "text-red-600",
      title: "7. User Rights",
      list: [
        "Access your personal data",
        "Request correction of inaccurate information",
        "Request deletion of your account and data",
        "Withdraw consent where applicable",
      ],
    },
    {
      icon: Activity,
      iconClass: "text-yellow-600",
      title: "8. Cookies & Tracking",
      text:
        "Book My Parcel may use cookies or similar technologies to enhance user experience, analyze platform performance, and improve usability. You can control cookie preferences through your browser settings.",
    },
    {
  icon: AlertTriangle,
  iconClass: "text-orange-600",
  title: "9. Children's Privacy",
  text:
    "Book My Parcel is intended only for individuals who are 18 years of age or older. We do not knowingly collect, store, or process personal information from children under 18. If we become aware that a minor has provided personal information through our platform, we will take appropriate steps to remove such information and terminate the associated account where necessary.",
},
{
  icon: Edit,
  iconClass: "text-gray-600",
  title: "10. Policy Updates",
  text:
    "Book My Parcel reserves the right to modify or update this Privacy Policy at any time to reflect changes in our services, legal requirements, or business practices. Any updates will be posted on the platform with a revised effective date. Continued use of the platform after such updates constitutes your acceptance of the revised Privacy Policy.",
},
{
  icon: Info,
  iconClass: "text-blue-600",
  title: "11. Contact Us",
  text:
    "If you have any questions, concerns, requests, or complaints regarding this Privacy Policy or the handling of your personal information, you may contact the Book My Parcel support team through our official communication channels. We will make reasonable efforts to respond to privacy-related inquiries in a timely manner.",
},
  ],
};


// import {
//   Shield,
//   Database,
//   Globe,
//   Mail,
//   FileText,
// } from "lucide-react";

// export const companyPrivacyPolicyData = {
//   pageTitle: "Company Privacy Policy",
//   intro:
//     "This Privacy Policy explains how the Company collects, uses, stores, and protects personal and business information provided through our platform and services.",

//   sections: [
//     {
//       title: "Information We Collect",
//       icon: User,
//       iconClass: "text-blue-600",
//       text:
//         "We may collect personal information such as name, email address, phone number, company details, business information, and any data voluntarily submitted through our platform.",
//     },
//     {
//       title: "How We Use Information",
//       icon: Database,
//       iconClass: "text-green-600",
//       text:
//         "Collected information is used to provide services, improve user experience, communicate updates, manage accounts, process requests, and comply with legal obligations.",
//     },
//     {
//       title: "Data Security",
//       icon: Lock,
//       iconClass: "text-red-600",
//       text:
//         "We implement reasonable technical and organizational measures to protect your information against unauthorized access, disclosure, alteration, or destruction.",
//     },
//     {
//       title: "Information Sharing",
//       icon: Globe,
//       iconClass: "text-purple-600",
//       text:
//         "We do not sell personal information. Information may be shared with trusted service providers, legal authorities when required, or business partners necessary for service delivery.",
//     },
//     {
//       title: "User Rights",
//       icon: Shield,
//       iconClass: "text-orange-600",
//       list: [
//         "Access your personal information",
//         "Request correction of inaccurate data",
//         "Request deletion of information where applicable",
//         "Withdraw consent where permitted by law",
//         "Request details regarding data processing",
//       ],
//     },
//     {
//       title: "Cookies and Tracking",
//       icon: FileText,
//       iconClass: "text-indigo-600",
//       text:
//         "Our platform may use cookies and similar technologies to improve functionality, analyze usage, and enhance user experience.",
//     },
//     {
//       title: "Contact Information",
//       icon: Mail,
//       iconClass: "text-pink-600",
//       text:
//         "For questions regarding this Privacy Policy or data handling practices, please contact the Company through the official contact information provided on the website.",
//     },
//   ],
// };


import {
  Shield,
  Database,
  Globe,
  Mail,
  FileText,
} from "lucide-react";

export const companyPrivacyPolicyData = {
  pageTitle: "Book My Parcel Privacy Policy",
  lastUpdated: "11/06/2026",

  intro:
    "This Privacy Policy explains how Book My Parcel ('the Company', 'we', 'our', or 'us') collects, uses, stores, shares, and protects personal and business information when you use our platform and services. By accessing or using our platform, you agree to the practices described in this Privacy Policy.",

  sections: [
    {
      icon: ShieldCheck,
      iconClass: "text-green-600",
      title: "1. Information We Collect",
      list: [
        "Personal Information such as name, email address, phone number, and contact details.",
        "Business information including company name, address, and authorized representative details where applicable.",
        "Account information such as login credentials and profile details.",
        "Technical information including IP address, browser type, device information, cookies, and usage analytics.",
        "Any additional information voluntarily submitted through forms, communications, or support requests.",
      ],
    },

    {
      icon: Database,
      iconClass: "text-blue-600",
      title: "2. How We Use Information",
      list: [
        "Provide and maintain our services.",
        "Create and manage user accounts.",
        "Process requests and respond to customer inquiries.",
        "Improve platform functionality and user experience.",
        "Send important notifications and service-related communications.",
        "Prevent fraud, misuse, and unauthorized access.",
        "Comply with applicable legal and regulatory obligations.",
      ],
    },

    {
      icon: Globe,
      iconClass: "text-purple-600",
      title: "3. Information Sharing",
      text:
        "We do not sell or rent your personal information. Information may be shared with trusted service providers, payment processors, business partners, or government authorities when required by law or when necessary to provide and improve our services.",
    },

    {
      icon: User,
      iconClass: "text-orange-600",
      title: "4. Third-Party Services",
      text:
        "Our platform may integrate with third-party tools or service providers for payments, analytics, communications, or other operational purposes. Such providers receive only the information necessary to perform their services and are expected to maintain appropriate privacy and security standards.",
    },

    {
      icon: Lock,
      iconClass: "text-teal-600",
      title: "5. Data Security",
      text:
        "We implement reasonable technical and organizational measures to safeguard personal and business information against unauthorized access, disclosure, alteration, or destruction. However, no method of electronic storage or transmission over the internet can be guaranteed to be completely secure.",
    },

    {
      icon: Activity,
      iconClass: "text-green-600",
      title: "6. Data Retention",
      text:
        "We retain personal and business information only for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. Once the information is no longer required, it is securely deleted or anonymized in accordance with applicable laws and our internal data retention policies.",
    },

    {
      icon: UserX,
      iconClass: "text-red-600",
      title: "7. User Rights",
      list: [
        "Access your personal information.",
        "Request correction of inaccurate or incomplete information.",
        "Request deletion of your personal information where permitted by law.",
        "Withdraw consent where processing is based on consent.",
        "Request information about how your personal data is processed.",
      ],
    },

    {
      icon: FileText,
      iconClass: "text-indigo-600",
      title: "8. Cookies and Tracking Technologies",
      text:
        "We may use cookies and similar technologies to improve website functionality, remember user preferences, analyze usage patterns, and enhance the overall user experience. You can control cookie preferences through your browser settings.",
    },

    {
      icon: AlertTriangle,
      iconClass: "text-orange-600",
      title: "9. Children's Privacy",
      text:
        "Book My Parcel services are intended only for individuals who are 18 years of age or older. We do not knowingly collect, store, or process personal information from anyone under the age of 18. If we become aware that such information has been provided, we will take appropriate steps to remove it and terminate the associated account where required.",
    },

    {
      icon: Edit,
      iconClass: "text-gray-600",
      title: "10. Policy Updates",
      text:
        "We reserve the right to modify or update this Privacy Policy at any time to reflect changes in our services, legal requirements, or business practices. Updated versions will be published with a revised 'Last Updated' date. Continued use of our platform after such updates constitutes acceptance of the revised policy.",
    },

    {
      icon: Shield,
      iconClass: "text-cyan-600",
      title: "11. Legal Compliance",
      text:
        "We may disclose personal information where required by applicable law, regulation, court order, or governmental authority, or where necessary to protect our legal rights, users, or the public.",
    },

    {
      icon: Info,
      iconClass: "text-yellow-600",
      title: "12. User Responsibility",
      text:
        "Users are responsible for providing accurate and up-to-date information. Book My Parcel shall not be responsible for any issues arising from incorrect, incomplete, or outdated information submitted by users.",
    },

    {
      icon: Mail,
      iconClass: "text-pink-600",
      title: "13. Contact Information",
text: `If you have any questions, concerns, requests, or complaints regarding this Privacy Policy, you may contact us through our official support channels.

Email: support@bookmyparcel.com

Phone: +91 9545444591

Address: Flat No. 303, Sai Enclave-B, Tushar Park, Survey No. 17/1A, Dhanori, Near Dhanori Police Station, Pune - 411015, Maharashtra, India`,
    },
  ],
};

