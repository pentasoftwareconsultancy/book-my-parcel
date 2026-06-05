import LocalShipping from '@mui/icons-material/LocalShipping';
import Person from '@mui/icons-material/Person';
import EmojiTransportation from '@mui/icons-material/EmojiTransportation';
import Security from '@mui/icons-material/Security';
import Speed from '@mui/icons-material/Speed';
import Public from '@mui/icons-material/Public';

export const services = [
  {
    icon: LocalShipping,
    title: 'Parcel Delivery',
    description: 'Send your parcels securely with our reliable delivery service. Track your package in real-time from pickup to delivery.',
    features: ['Real-time tracking', 'Insurance coverage', 'Signature confirmation']
  },
  {
    icon: Person,
    title: 'Traveler Network',
    description: "Connect with verified travelers who are heading in your parcel's direction. Earn money by delivering during your travels.",
    features: ['Verified travelers', 'Flexible scheduling', 'Earnings tracking']
  },
  {
    icon: EmojiTransportation,
    title: 'Multi-modal Transport',
    description: 'We support various transport modes including road, rail, and air to ensure your parcel reaches its destination efficiently.',
    features: ['Road transport', 'Rail transport', 'Air freight options']
  }
];

export const benefits = [
  {
    icon: Security,
    title: 'Secure & Insured',
    description: 'All parcels are insured and tracked throughout the delivery process.'
  },
  {
    icon: Speed,
    title: 'Fast Delivery',
    description: 'Quick and efficient delivery using existing travel routes.'
  },
  {
    icon: Public,
    title: 'Eco-friendly',
    description: 'Reduce carbon footprint by utilizing existing travel routes.'
  }
];

export default { services, benefits };

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