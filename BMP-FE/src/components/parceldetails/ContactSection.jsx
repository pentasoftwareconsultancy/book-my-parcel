import React from "react";
import { Phone } from "lucide-react";

const ContactSection = ({ type = "pickup", phone = "—", alt_phone = "—", name = "—" }) => {
  const label = type === "pickup" ? "Pickup" : "Delivery";

  return (
    <div className="mb-4">
      <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-2">
        Contact Summary
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Phone */}
        <div>
          <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">
            Phone Number
          </p>
          <p className="text-sm font-medium text-gray-900">{phone || "—"}</p>
        </div>

        {/* Alternate Phone */}
        <div>
          <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">
            Alternate Phone Number
          </p>
          <p className="text-sm font-medium text-gray-900">{alt_phone || "—"}</p>
        </div>

        {/* Contact Name */}
        <div>
          <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">
            Contact Name
          </p>
          <p className="text-sm font-medium text-gray-900">{name || "—"}</p>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
