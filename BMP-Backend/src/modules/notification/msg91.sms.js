import axios from "axios";
import { SMS_TEMPLATES } from "./msg91.templates.js";

export const sendMsg91SMS = async ({ phone, type_code, meta = {} }) => {
  console.log(`[MSG91 SMS] Starting SMS send: phone=${phone}, type_code=${type_code}`);
  
  const template = SMS_TEMPLATES[type_code];

  if (!template) {
    console.warn(`⚠️ [MSG91 SMS] No template for type_code: ${type_code}`);
    console.warn(`[MSG91 SMS] Available templates: ${Object.keys(SMS_TEMPLATES).join(", ")}`);
    return;
  }

  console.log(`[MSG91 SMS] Template found: templateId=${template.templateId}`);

  if (!phone) {
    console.warn(`⚠️ [MSG91 SMS] No phone provided for type_code: ${type_code}`);
    return;
  }

  // Validate phone format (should be 10 digits)
  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.length !== 10) {
    console.warn(`⚠️ [MSG91 SMS] Invalid phone format: ${phone} (expected 10 digits)`);
    return;
  }

  console.log(`[MSG91 SMS] Phone validation passed: ${phone}`);

  const payloadData = {
    template_id: template.templateId,
    recipients: [
      {
        mobiles: `91${cleanPhone}`,
        var1: meta.var1 || "",
        var2: meta.var2 || "",
        var3: meta.var3 || "",
      },
    ],
  };

  // Log exact payload being sent to MSG91
  console.log(`[MSG91 SMS] Payload being sent:`, JSON.stringify(payloadData, null, 2));
  console.log(`[MSG91 SMS] API Key: ${process.env.MSG91_API_KEY ? process.env.MSG91_API_KEY.substring(0, 5) + "***" : "NOT SET"}`);
  console.log(`[MSG91 SMS] Sender ID: ${process.env.MSG91_SENDER_ID || "NOT SET"}`);

  try {
    console.log(`[MSG91 SMS] Making API call to https://control.msg91.com/api/v5/flow`);
    
    const { data } = await axios.request({
      method: "POST",
      url: "https://control.msg91.com/api/v5/flow",
      headers: {
        accept:         "application/json",
        authkey:        process.env.MSG91_API_KEY,
        "content-type": "application/json",
      },
      data: payloadData,
      timeout: 10000,
    });

    console.log(`✅ [MSG91 SMS] Success — ${type_code} to ${phone}`);
    console.log(`[MSG91 SMS] Response:`, JSON.stringify(data, null, 2));
    
    // Log message ID for tracking
    if (data?.message) {
      console.log(`[MSG91 SMS] Message ID (for tracking): ${data.message}`);
    }
    
    return data;

  } catch (err) {
    console.error(`❌ [MSG91 SMS] API Call Failed — ${type_code}`);
    console.error(`[MSG91 SMS] Error Status:`, err.response?.status);
    console.error(`[MSG91 SMS] Error Data:`, JSON.stringify(err.response?.data, null, 2));
    console.error(`[MSG91 SMS] Error Message:`, err.message);
    
    // Log the full error for debugging
    if (err.response?.data?.type === "error") {
      console.error(`[MSG91 SMS] Error Type:`, err.response.data.type);
      console.error(`[MSG91 SMS] Error Description:`, err.response.data.description);
    }
  }
};

export const sendMsg91WhatsApp = async ({ phone, type_code, meta = {} }) => {
  console.log(`[MSG91 WhatsApp] Stubbed — ${type_code} to ${phone}`);
};
