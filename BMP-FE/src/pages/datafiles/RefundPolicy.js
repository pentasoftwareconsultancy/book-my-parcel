import {
  RefreshCw,
  ShieldOff,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  FileText,
  AlertTriangle,
  PhoneCall,
} from "lucide-react";

export const introText =
  "This policy outlines refund eligibility conditions for users of the Book My Parcel platform, created to comply with payment gateway requirements such as Razorpay.";


export const refundSections = [
  {
    icon: ShieldOff,
    iconColor: "text-indigo-600",
    title: "1. Nature of Service (No Physical Returns)",
    text: "Book My Parcel is a digital facilitation platform that connects parcel senders with independent travelers. The platform does not handle physical parcel transportation directly.",
    list: [
      "Physical parcel returns are not handled by Book My Parcel.",
      "Parcel return arrangements must be handled directly between sender and recipient.",
      "Book My Parcel is not responsible for reverse logistics operations.",
    ],
  },
  {
    icon: CheckCircle,
    iconColor: "text-green-600",
    title: "2. Refund Eligibility",
    text: "Refunds may be issued under the following conditions:",
    list: [
      "No Traveler Accepted the Request — Full platform fee may be refunded if no traveler confirms.",
      "Booking Cancelled Before Traveler Confirmation — Refund may be issued on early cancellation.",
      "Duplicate Payment — Refund issued for payments made twice due to a technical issue.",
      "Platform Technical Failure — Refund for verified platform-side technical errors.",
    ],
  },
  {
    icon: XCircle,
    iconColor: "text-red-600",
    title: "3. Non-Refundable Situations",
    text: "Refunds will not be issued under the following conditions:",
    list: [
      "Traveler Already Confirmed — Platform fee becomes non-refundable once a traveler accepts.",
      "Parcel Handed Over — No refund once the parcel has been handed to the traveler.",
      "Delivery Delays — Delays due to traffic, weather, or travel changes are not eligible.",
      "Loss or Damage — Book My Parcel is not liable for loss, theft, or damage to parcels.",
      "Incorrect Information — Wrong address, contact, or parcel details provided by the sender.",
      "Prohibited Items — No refund if prohibited items are shipped.",
    ],
  },
  {
    icon: RefreshCw,
    iconColor: "text-yellow-600",
    title: "4. Partial Refund Policy",
    text: "Partial refunds may be issued in limited cases. For example, if a booking is cancelled after traveler confirmation but before parcel handover, a partial refund may be issued after deducting applicable platform charges.",
  },
  {
    icon: Clock,
    iconColor: "text-teal-600",
    title: "6. Refund Processing Timeline",
    text: "If a refund is approved, it will be processed to the original payment method.",
    list: [
      "Estimated refund timeline: 5–10 business days.",
      "Actual timing may vary depending on bank and payment gateway processing.",
    ],
  },
  {
    icon: CreditCard,
    iconColor: "text-blue-600",
    title: "7. Payment Gateway Refund Handling",
    text: "All refunds will be processed through the original payment method used during booking.",
  },
  {
    icon: FileText,
    iconColor: "text-purple-600",
    title: "8. Refund Request Submission",
    text: "Users must submit refund requests with the following details.",
    list: [
      "Booking ID",
      "Payment reference number",
      "Reason for refund",
      "Supporting proof (if applicable)",
    ],
  },
  {
    icon: AlertTriangle,
    iconColor: "text-red-600",
    title: "9. Chargeback Policy",
    text: "Users are encouraged to contact platform support before initiating chargebacks with banks.",
    list: [
      "Temporary account suspension",
      "Permanent account termination in case of misuse",
    ],
  },
  {
    icon: ShieldOff,
    iconColor: "text-gray-600",
    title: "10. Platform Rights",
    text: "Book My Parcel reserves the right to:",
    list: [
      "Reject refund requests if policy conditions are not met.",
      "Deduct applicable processing or platform fees.",
      "Modify refund eligibility rules when necessary.",
      "Major policy changes will be communicated to users when published publicly.",
    ],
  },
  {
    icon: PhoneCall,
    iconColor: "text-green-600",
    title: "11. Contact Information",
    list: [
      "Support Email: support@bookmyparcel.com",
      "Legal Email: support@bookmyparcel.com",
      "Phone: +91 9545444591",
      "Support Hours: Monday to Saturday, 9:00 AM – 6:00 PM IST",
    ],
  },
];
 export default refundSections ;