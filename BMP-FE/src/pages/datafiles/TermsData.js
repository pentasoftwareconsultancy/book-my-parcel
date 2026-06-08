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

// Terms and Conditions Content for Travelers

    const content = `
TERMS & CONDITIONS FOR TRAVELERS

1. Platform Role
Book My Parcel is a technology platform connecting users with travelers.
Travelers are independent individuals, not employees, agents, or partners.
Book My Parcel does not provide courier or transportation services.

2. Eligibility
- Must be 18 years or older
- Provide accurate and updated profile information
- Must have valid travel plans for accepted routes

3. Acceptance of Parcels
- Travelers may accept or reject parcel requests
- Must review parcel details before acceptance
- Must not accept illegal, hazardous, or restricted items
- After acceptance, must complete delivery responsibly

4. Parcel Handling & Delivery
- Handle parcels with due care
- Do not open, inspect, tamper, or misuse parcels
- Deliver only to intended recipient or authorized third party
- Third-party involvement only for delivery purposes

5. Payments
- Travelers paid only after successful delivery
- Payments processed through the platform
- Platform/service fees may be deducted

6. Cancellations
- Avoid canceling after accepting parcels
- Frequent cancellations may impact ratings or account
- In emergencies, notify user and platform support immediately

7. Ratings & Performance
- Rated on punctuality, communication, and delivery success
- Poor ratings may lead to suspension or termination

8. Legal Compliance & Safety
- Must follow local laws and transport rules
- Traveler responsible for actions during transit
- Platform not liable for traveler violations

9. Prohibited Conduct
- Carrying illegal or undisclosed items
- Fraud, harassment, unsafe behavior
- Misuse of user data
- False delivery confirmations

10. Limitation of Liability
- Platform not responsible for loss, delay, damage, or disputes
- Travelers indemnify the platform against claims

11. Account Suspension or Termination
- Accounts may be suspended or terminated for policy violations

12. Governing Law
- Governed by laws of India
- Disputes subject to Indian courts
`;

export { content };

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


export const termsSections = [
  {
    icon: ShieldCheck,
    iconClass: "text-green-600",
    title: "1. Platform Role",
    text: "Book My Parcel is a technology platform connecting users with travelers. Travelers are independent individuals and the platform does not provide courier services.",
  },
  {
    icon: User,
    iconClass: "text-blue-600",
    title: "2. Eligibility",
    list: [
      "Must be 18 years or older",
      "Provide accurate and updated profile information",
      "Must have valid travel plans for accepted routes",
    ],
  },
  {
    icon: Truck,
    iconClass: "text-orange-600",
    title: "3. Acceptance of Parcels",
    list: [
      "Accept or reject parcel requests",
      "Review parcel details before accepting",
      "Do not accept illegal or hazardous items",
      "Must complete delivery after acceptance",
    ],
  },
  {
    icon: MapPin,
    iconClass: "text-teal-600",
    title: "4. Parcel Handling & Delivery",
    list: [
      "Handle parcels with care",
      "Do not open or tamper",
      "Deliver only to intended recipient",
      "Third party only for delivery",
    ],
  },
  {
    icon: CreditCard,
    iconClass: "text-yellow-600",
    title: "5. Payments",
    list: [
      "Payment after successful delivery",
      "Payments processed via platform",
      "Service fees may be deducted",
    ],
  },
  {
    icon: XCircle,
    iconClass: "text-purple-600",
    title: "6. Cancellations",
    text: "Avoid canceling after accepting parcels. Frequent cancellations may impact ratings or account suspension.",
  },
  {
    icon: Activity,
    iconClass: "text-green-600",
    title: "7. Ratings & Performance",
    text: "Travelers are rated on punctuality, communication, and delivery success. Poor ratings may lead to termination.",
  },
  {
    icon: AlertTriangle,
    iconClass: "text-red-600",
    title: "8. Legal Compliance & Safety",
    text: "Travelers must follow all local laws and are responsible for actions during transit.",
  },
  {
    icon: Info,
    iconClass: "text-red-600",
    title: "9. Prohibited Conduct",
    list: [
      "Carrying illegal items",
      "Fraud or harassment",
      "Misuse of user data",
      "False delivery confirmations",
    ],
  },
  {
    icon: UserX,
    iconClass: "text-red-600",
    title: "10. Limitation of Liability",
    text: "Platform is not responsible for loss, delay, or disputes. Travelers indemnify the platform.",
  },
  {
    icon: Lock,
    iconClass: "text-blue-600",
    title: "11. Account Suspension or Termination",
    text: "Accounts may be suspended or terminated for violations of policies.",
  },
  {
    icon: Edit,
    iconClass: "text-green-600",
    title: "12. Governing Law",
    text: "These terms are governed by the laws of India and disputes handled in Indian courts.",
  },
];