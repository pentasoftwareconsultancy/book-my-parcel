import {
  ShieldCheck,
  User,
  AlertTriangle,
  Truck,
  MapPin,
  Activity,
  CreditCard,
  XCircle,
  Lock,
  UserX,
  Edit,
  Info,
  
} from "lucide-react";


//  TravelerGuidelines Page Content

const guidelines = [
  {
    title: "1. Eligibility",
    points: [
      "Travelers must be 18 years or older.",
      "You must provide accurate personal and contact information.",
      "Only accept parcel requests that align with your travel route and schedule.",
    ],
  },
  {
    title: "2. Parcel Acceptance",
    points: [
      "Review parcel details carefully before accepting.",
      "Accept parcels only if you are comfortable carrying them.",
      "Do not accept prohibited or illegal items, including hazardous materials, weapons, drugs, or restricted goods.",
    ],
  },
  {
    title: "3. Parcel Handling",
    points: [
      "Handle parcels with care and responsibility.",
      "Do not open, tamper with, or alter the parcel under any circumstances.",
      "Ensure the parcel remains safe and intact during transit.",
    ],
  },
  {
    title: "4. Pickup & Delivery",
    points: [
      "Verify pickup and drop details before collecting the parcel.",
      "Coordinate clearly with the sender and receiver regarding timing and location.",
      "Deliver the parcel only to the intended recipient or authorized third person, as specified by the sender.",
    ],
  },
  {
    title: "5. Third-Party Handover",
    points: [
      "If your journey involves public transport or a third-party handover:",
      "Share only necessary delivery-related information.",
      "Ensure the parcel is handed over responsibly and securely.",
      "Any third-party involvement should be limited strictly to delivery purposes.",
    ],
  },
  {
    title: "6. Communication",
    points: [
      "Maintain clear, respectful, and timely communication with users.",
      "Use the platform’s communication features wherever possible.",
      "Inform the sender immediately of any delays or issues.",
    ],
  },
  {
    title: "7. Safety & Compliance",
    points: [
      "Follow all local laws and transport regulations.",
      "You are solely responsible for compliance during transit.",
      "Book My Parcel is not liable for violations caused by traveler actions.",
    ],
  },
  {
    title: "8. Independence & Responsibility",
    points: [
      "Travelers are independent individuals, not employees or agents of Book My Parcel.",
      "You are responsible for your actions, conduct, and delivery commitments.",
    ],
  },
  {
    title: "9. Cancellation & Issues",
    points: [
      "Avoid cancellations after accepting a parcel unless unavoidable.",
      "In case of emergencies, delays, or parcel damage, notify the user and platform support immediately.",
    ],
  },
  {
    title: "10. Trust & Conduct",
    points: [
      "Act honestly and professionally at all times.",
      "Any misuse of the platform, misconduct, or violation of guidelines may result in account suspension or removal.",
    ],
  },
];

export { guidelines };


// Terms and Conditions Content for Travelers

export const termsSections = [
  {
    icon: ShieldCheck,
    iconClass: "text-green-600",
     bgClass: "bg-green-100",
    title: "1. Platform Overview",
    text: "Book My Parcel is a technology platform that connects users who wish to send parcels with independent travelers who are already traveling along a similar route. Book My Parcel does not employ, hire, or manage travelers. Travelers participate voluntarily and independently. By creating an account or using our services, you confirm that you are at least 18 years of age and have the legal capacity to enter into this agreement.",
  },
  {
    icon: User,
    iconClass: "text-blue-600",
    title: "2. User Responsibilities",
    list: [
      "Provide accurate pickup address, drop location, parcel details, and contact information",
      "Ensure parcels are properly packed, sealed, and safe for transport",
      "Hand over parcels only to travelers confirmed through the platform",
      "Ensure the recipient is available to collect the parcel at the destination",
    ],
  },
  {
    icon: AlertTriangle,
    iconClass: "text-red-600",
    title: "3. Prohibited Items",
    list: [
      "Illegal, prohibited, or restricted items",
      "Drugs, weapons, or contraband",
      "Live animals or perishable food items",
      "Pornographic or obscene materials",
      "Hazardous, flammable, or explosive materials",
      "Valuable items such as cash, jewelry, or confidential documents",
      "Currency, precious stones, or jewelry without insurance",
    ],
  },
  {
    icon: Activity,
    iconClass: "text-purple-600",
    title: "4. Traveler Interaction & Selection",
    text: "Travelers listed on the platform are independent individuals and not employees of Book My Parcel. Users may receive multiple traveler requests and are solely responsible for selecting a traveler based on the information provided.",
  },
  {
    icon: Truck,
    iconClass: "text-orange-600",
    title: "5. Delivery & Third-Party Handover",
    text: "Depending on the traveler’s mode of transport (public or private), parcels may be handed over to a third person such as a co-traveler, transport staff, or recipient. Users acknowledge and accept this delivery method and its associated risks.",
  },
  {
    icon: MapPin,
    iconClass: "text-teal-600",
    title: "6. Tracking & Updates",
    text: "Parcel tracking and status updates are provided for informational purposes only and depend on traveler inputs. Delays may occur due to travel changes, traffic conditions, weather, or other unforeseen circumstances.",
  },
  {
    icon: UserX,
    iconClass: "text-red-600",
    title: "7. Liability Disclaimer",
    list: [
      "Book My Parcel is not responsible for loss, damage, delay, or theft of parcels",
      "Insurance is not provided unless explicitly stated",
      "The platform acts only as an intermediary facilitating communication",
      "Users agree to use the platform at their own risk",
      "Maximum liability per parcel is capped at ₹10,000 unless otherwise specified",
      "Users are advised to obtain insurance for high-value items",
      "We are not responsible for incorrect address or contact information provided by users",
    ],
  },
  {
    icon: CreditCard,
    iconClass: "text-yellow-600",
    title: "8. Payments & Charges",
    text: "Any charges displayed on the platform are facilitation or service charges only. Payments, where applicable, must be completed through the platform. Book My Parcel is not responsible for any offline transactions between users and travelers.",
  },
  {
    icon: XCircle,
    iconClass: "text-purple-600",
    title: "9. Cancellation & Disputes",
    text: "Users may cancel parcel requests before a traveler is confirmed. Book My Parcel does not mediate disputes between users and travelers but may assist by reviewing available platform records and data when appropriate.",
  },
  {
    icon: Lock,
    iconClass: "text-blue-600",
    title: "10. Privacy & Data Usage",
    list: [
      "User data is collected only to facilitate parcel delivery and improve services",
      "Personal information is shared with travelers only when necessary for delivery purposes",
      "GPS tracking data is used solely for delivery-related functionality",
      "Payment information is encrypted and processed through secure payment gateways",
      "Users may request deletion of their data by contacting support",
    ],
  },
  {
    icon: UserX,
    iconClass: "text-red-600",
    title: "11. Account Misuse",
    text: "Book My Parcel reserves the right to suspend or terminate accounts involved in fraud, misuse, unlawful activities, or violations of these Terms and Conditions. Access may be restricted without prior notice if platform safety or security is compromised.",
  },
  {
    icon: Edit,
    iconClass: "text-green-600",
    title: "12. Amendments",
    text: "Book My Parcel may update these Terms and Conditions at any time. Continued use of the platform following any updates constitutes acceptance of the revised terms.",
  },
  {
    icon: Info,
    iconClass: "text-blue-600",
    title: "13. Contact Information",
    list: [
      "Email: support@bookmyparcel.co.in",
      "Phone: +91 9545444591",
      "Support Hours: Monday to Saturday, 9:00 AM – 6:00 PM IST",
    ],
  },
  {
    icon: ShieldCheck,
    iconClass: "text-green-600",
    title: "14. Agreement Acknowledgment",
    text: "By using Book My Parcel, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must discontinue use of the platform immediately.",
  },
];

