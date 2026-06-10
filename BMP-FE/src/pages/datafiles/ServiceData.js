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


// export const howItWorksData = [
//   {
//     step: "1",
//     title: "Book Your Parcel",
//     desc: "Enter pickup and delivery details",
//   },
//   {
//     step: "2",
//     title: "Match with Traveler",
//     desc: "Get matched with verified travelers",
//   },
//   {
//     step: "3",
//     title: "Track Delivery",
//     desc: "Real-time tracking of your parcel",
//   },
//   {
//     step: "4",
//     title: "Receive Parcel",
//     desc: "Secure delivery with confirmation",
//   },
// ];