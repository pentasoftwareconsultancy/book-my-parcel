import axios from "axios";
import { SMS_TEMPLATES } from "./msg91.templates.js";

export const sendMsg91SMS = async ({ phone, type_code, meta = {} }) => {
  const template = SMS_TEMPLATES[type_code];

  if (!template) {
    console.warn(`[MSG91] No template for type_code: ${type_code}`);
    return;
  }

  if (!phone) {
    console.warn(`[MSG91] No phone provided for type_code: ${type_code}`);
    return;
  }

  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.length !== 10) {
    console.warn(`[MSG91] Invalid phone format for type_code: ${type_code}`);
    return;
  }

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

  try {
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

    return data;

  } catch (err) {
    console.error(`[MSG91] SMS failed — type_code=${type_code}, status=${err.response?.status}, msg=${err.message}`);
  }
};

export const sendMsg91WhatsApp = async ({ phone, type_code, meta = {} }) => {
  // Stubbed — implement when MSG91 WhatsApp is activated
};
