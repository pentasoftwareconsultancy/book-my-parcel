import { sendEmail } from "../../services/email.service.js";

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || process.env.SMTP_USER;

/**
 * POST /api/v1/contact
 * Body: { firstName, lastName, email, phone, message }
 *
 * Sends two emails:
 *  1. Notification to the support inbox with the enquiry details.
 *  2. Auto-reply to the sender confirming receipt.
 */
export async function submitContact(req, res) {
  const { firstName, lastName, email, phone, message } = req.body;

  // ── Basic validation ──────────────────────────────────────────────────────
  if (!firstName?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({
      success: false,
      message: "firstName, email, and message are required.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email address." });
  }

  const fullName = `${firstName.trim()} ${lastName?.trim() || ""}`.trim();

  // ── 1. Notify support inbox ───────────────────────────────────────────────
  const supportSubject = `New Contact Enquiry from ${fullName}`;
  const supportBody = `
    <h2>New Contact Form Submission</h2>
    <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px">
      <tr><td style="padding:8px;font-weight:bold;width:140px">Name</td><td style="padding:8px">${fullName}</td></tr>
      <tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px"><a href="mailto:${email}">${email}</a></td></tr>
      <tr><td style="padding:8px;font-weight:bold">Phone</td><td style="padding:8px">${phone?.trim() || "—"}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;vertical-align:top">Message</td><td style="padding:8px;white-space:pre-wrap">${message.trim()}</td></tr>
    </table>
  `.trim();

  try {
    await sendEmail(SUPPORT_EMAIL, supportSubject, supportBody);
  } catch (supportEmailErr) {
    // Log the failure but do NOT surface it to the user — their message was received
    console.error("[Contact] Failed to send support notification email:", supportEmailErr.message);
  }

  // ── 2. Auto-reply to sender ───────────────────────────────────────────────
  const replySubject = "We received your message — Book My Parcel";
  const replyBody = `
    <p>Hi ${firstName.trim()},</p>
    <p>Thanks for reaching out! We've received your message and will get back to you within 1–2 business days.</p>
    <p>Here's a copy of what you sent us:</p>
    <blockquote style="border-left:3px solid #ccc;margin:12px 0;padding:8px 16px;color:#555;font-style:italic">
      ${message.trim()}
    </blockquote>
    <p>— The Book My Parcel Team</p>
  `.trim();

  try {
    await sendEmail(email, replySubject, replyBody);
  } catch (replyEmailErr) {
    // Auto-reply failure is non-fatal — user already got a 200 confirmation
    console.error("[Contact] Failed to send auto-reply email:", replyEmailErr.message);
  }

  return res.status(200).json({ success: true, message: "Message sent successfully." });
}
