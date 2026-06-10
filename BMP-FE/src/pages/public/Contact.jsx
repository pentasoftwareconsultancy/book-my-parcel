import React, { useState } from "react";
import { MdEmail, MdLocationOn, MdPhone, MdSend } from "react-icons/md";
import { FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import leftImg from "../../assets/contact.png";
import rightImg from "../../assets/contact1.png";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const ContactUs = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        phone:     form.phone,
        message:   form.message,
      }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Failed to send message");

    setSubmitted(true);
    setForm({ firstName: "", lastName: "", email: "", phone: "", message: "" });
    setTimeout(() => setSubmitted(false), 3000);
  } catch (error) {
    console.error(error);
    alert(error.message || "Failed to send message");
  } finally {
    setLoading(false);
  }
};

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-[#eef2ff] via-[#efefef] to-[#dde8ff] flex flex-col items-center justify-center overflow-hidden py-16 px-4 sm:px-6">

      {/* Background watermark */}
      <span className="absolute top-6 left-1/2 -translate-x-1/2 text-[22vw] sm:text-[16vw] lg:text-[160px] font-extrabold text-blue-1000 opacity-[0.06] whitespace-nowrap select-none pointer-events-none z-0 leading-none">
        Contact Us
      </span>

      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-300 opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-300 opacity-20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Decorative images */}
      <img
        src={rightImg}
        alt=""
        aria-hidden="true"
        className="absolute top-0 right-[10px] md:right-10 lg:right-16 w-28 md:w-36 lg:w-44 z-10 hidden md:block drop-shadow-xl"
      />
      <img
        src={leftImg}
        alt=""
        aria-hidden="true"
        className="absolute bottom-4 left-0 w-28 md:w-36 lg:w-44 z-10 hidden md:block drop-shadow-xl opacity-90"
      />

      {/* Page title */}
      <div className="relative z-10 text-center mb-8 sm:mb-10">
         <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
    Get In Touch
  </h2>
        <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-md mx-auto">
          Have a question or need help? Fill out the form 
        </p>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-5xl bg-white/60 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden">

        <div className="grid lg:grid-cols-5">

          {/* Left info panel */}
          <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 sm:p-10 flex flex-col justify-between gap-10">
            <div>
              <h3 className="text-2xl font-bold mb-1">Contact Information</h3>
              <p className="text-blue-200 text-sm">We're here to help you anytime.</p>
            </div>

            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm p-4">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold mb-1.5">
                  Registered Legal Name
                </p>
                <p className="font-black text-white text-lg tracking-wide leading-tight">
                  BOOK MY PERCEL LLP
                </p>
                <p className="text-white/50 text-xs mt-1">Limited Liability Partnership · India</p>
              </div>
              <InfoItem icon={<MdEmail size={20} />} text="support@bookmyparcel.co.in" />
              <InfoItem icon={<MdPhone size={20} />} text="+91 9545444591" />
              <InfoItem
                icon={<MdLocationOn size={20} />}
                text={
  <span>
    Flat No. 303, Sai Enclave-B, Tushar Park,<br />
    Survey No. 17/1A, Dhanori,<br />
    Near Dhanori Police Station,<br />
    Pune City, Pune - 411015,<br />
    Maharashtra, India
  </span>
}
              />
            </div>

            {/* Social */}
            <div>
              <p className="text-blue-200 text-xs uppercase tracking-widest mb-3">Follow Us</p>
             <div className="flex items-center justify-center md:justify-start gap-3 md:gap-4">
  <SocialLink href="https://twitter.com" icon={<FaTwitter />} label="Twitter" />
  <SocialLink href="https://instagram.com" icon={<FaInstagram />} label="Instagram" />
  <SocialLink href="https://linkedin.com" icon={<FaLinkedin />} label="LinkedIn" />
</div>
            </div>

            {/* Decorative circle */}
            
          </div>

          {/* Right form panel */}
          <div className="lg:col-span-3 p-8 sm:p-10">
            {submitted && (
              <div className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
                <MdSend size={18} />
                Message sent! We'll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field
                  label="First Name"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  required
                />
                <Field
                  label="Last Name"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                  required
                />
                <Field
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white text-sm resize-none transition"
                />
              </div>

              <div className="flex justify-end pt-1">
              <button
  type="submit"
  disabled={loading}
  className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl shadow-md transition-all duration-200 text-sm sm:text-base"
>
  <MdSend size={18} />
  {loading ? "Sending..." : "Send Message"}
</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

const Field = ({ label, name, type = "text", value, onChange, placeholder, required }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white text-sm transition"
    />
  </div>
);

const InfoItem = ({ icon, text }) => (
  <div className="flex items-start gap-3 text-sm">
    <span className="mt-0.5 shrink-0 bg-white/20 p-2 rounded-lg">{icon}</span>
    <span className="leading-relaxed">{text}</span>
  </div>
);

const SocialLink = ({ href, icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="
      flex items-center justify-center
      w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12
      bg-white/20 hover:bg-white/30
      rounded-lg
      text-white
      transition-all duration-300
      hover:scale-110
      text-base sm:text-lg
    "
  >
    {icon}
  </a>
);

export default ContactUs;
