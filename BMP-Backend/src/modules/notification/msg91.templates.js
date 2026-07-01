// Map every type_code to its MSG91 DLT-approved template ID
// vars[] order must match ##var1## ##var2## in your approved template text

export const SMS_TEMPLATES = {
  Parcel_Create_Template1: { templateId: "6a4243105bd82113a5072c62" },
  Traveller_Interested: { templateId: "6a424c936831c61e7904f053" },
  Parcel_Create_Template2: { templateId: "6a4255718f5cca5e4709f784" },
  Parcel_Delivered: { templateId: "6a4255cc758af6d6e90b4923" },
  Parcel_Cancelled: { templateId: "6a425619701958e241030c82" },
  new_parcel_Available: { templateId: "6a42567187232e2ee2047a42" },
  You_Have_Been_Selected: { templateId: "6a4256c4d66ce8768200f9a2" },
  Booking_Confirmed: { templateId: "6a4257a83d73dafd1201ee97" },
  Pickup_Verified: { templateId: "6a42584ef15b1eb8d0071204" },
  Delivery_Completed: { templateId: "6a42589c622279f14008bd42" },
  Parcel_Picked_Up: { templateId: "6a4259429dc027b882028b62" },
  Delivery_OTP_Generated: { templateId: "6a4259b34afb55cb270fd082" },
  Parcel_Delivered: { templateId: "6a425a08c6627b3bf40b3c62" },
  Parcel_Delivered: { templateId: "6a425a08c6627b3bf40b3c62" },
  Parcel_Create_Template3: { templateId: "6a425aa7be392abefd050d43" },
  Parcel_Create_Template4: { templateId: "6a425c59a461a1f1300a4162" },
  Parcel_Create_Template5: { templateId: "6a425cc08889a27a6a090082" },


};

// Stubbed — fill when MSG91 WhatsApp is activated
export const WHATSAPP_TEMPLATES = {};