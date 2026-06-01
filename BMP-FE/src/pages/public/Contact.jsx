import React, { useState } from "react";
import { MdEmail, MdLocationOn, MdPhone, MdSend } from "react-icons/md";
import { FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import leftImg from "../../assets/contact.png";
import rightImg from "../../assets/contact1.png";

const ContactUs = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setForm({ firstName: "", lastName: "", email: "", phone: "", message: "" });
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
        <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-700 tracking-tight">
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
              <InfoItem icon={<MdEmail size={20} />} text="contact@bmp.com" />
              <InfoItem icon={<MdPhone size={20} />} text="+91 98765 43210" />
              <InfoItem
                icon={<MdLocationOn size={20} />}
                text={
                  <>
                    123, MG Road, Pune
                    <br />
                    Maharashtra – 411001
                  </>
                }
              />
            </div>

            {/* Social */}
            <div>
              <p className="text-blue-200 text-xs uppercase tracking-widest mb-3">Follow Us</p>
              <div className="flex gap-4">
                <SocialLink href="https://twitter.com" icon={<FaTwitter />} label="Twitter" />
                <SocialLink href="https://instagram.com" icon={<FaInstagram />} label="Instagram" />
                <SocialLink href="https://linkedin.com" icon={<FaLinkedin />} label="LinkedIn" />
              </div>
            </div>

            {/* Decorative circle */}
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />
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
                  placeholder="john@example.com"
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
                  className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold rounded-xl shadow-md transition-all duration-200 text-sm sm:text-base"
                >
                  <MdSend size={18} />
                  Send Message
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
    className="bg-white/20 hover:bg-white/30 p-2.5 rounded-lg text-white transition hover:scale-110 text-lg"
  >
    {icon}
  </a>
);

export default ContactUs;
