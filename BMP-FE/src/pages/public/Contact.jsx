// import React from "react";
// import { MdEmail, MdLocationOn } from "react-icons/md";
// import { FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
// import leftImg from "../../assets/contact.png";
// import rightImg from "../../assets/contact1.png";

// const ContactUs = () => {
//   return (
//     <section className="relative min-h-screen bg-[#efefef] flex items-center justify-center overflow-hidden py-28 px-4">
// <h1
//   className="absolute top-0 left-1/2 -translate-x-1/2 
//   text-[12vw] lg:text-[130px] font-bold text-[#0a2dc5] 
//   opacity-90 
//   z-0 select-none pointer-events-none"
// >
//   ContactUs
// </h1>
//       <div className="absolute right-24 bottom-24 w-56 h-56 
//       bg-blue-600 rounded-full blur-3xl opacity-50 z-10" />
//       <img
//         src={leftImg}
//         alt=""
//         className="hidden lg:block absolute left-10 bottom-10 w-48 z-30"
//       />
//       <img
//         src={rightImg}
//         alt=""
//         className="hidden lg:block absolute right-10 top-10 w-48 z-30"
//       />
//       <div className="relative z-10 w-full max-w-6xl 
//       bg-white/20 
//       backdrop-blur-2xl 
//       border border-white/30 
//       shadow-[0_8px_32px_rgba(31,38,135,0.25)] 
//       rounded-[30px] 
//       p-10 md:p-14">
//         <div className="absolute inset-0 rounded-[30px] 
//         bg-gradient-to-br from-white/20 to-transparent 
//         pointer-events-none"></div>
//         <div className="relative grid md:grid-cols-2 gap-12">
//           <div className="flex flex-col justify-between">
//             <div className="space-y-10">
//               <div className="flex items-center gap-3 text-blue-600 font-medium">
//                 <MdEmail size={22} />
//                 <span>contact@bmp.com</span>
//               </div>
//               <div className="flex gap-3 text-blue-600 font-medium max-w-xs">
//                 <MdLocationOn size={22} className="mt-1" />
//                 <p>
//                   08 Triveni Tower 3rd Floor, Central Avenue,
//                   Gandhiputla, Itwari, Nagpur 440002, India.
//                 </p>
//               </div>
//             </div>
//             <div className="flex gap-4 mt-12 text-2xl">
//               <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
//                 <FaTwitter className="text-sky-500 cursor-pointer" />
//               </a>

//               <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
//                 <FaInstagram className="text-pink-500 cursor-pointer" />
//               </a>

//               <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
//                 <FaLinkedin className="text-blue-700 cursor-pointer" />
//               </a>
//             </div>
//           </div>
          
//           <form className="space-y-6">
//             {/* Names */}
//             <div className="grid grid-cols-2 gap-6">
//               <Input label="First Name" />
//               <Input label="Last Name" />
//             </div>
//             <div className="grid grid-cols-2 gap-6">
//               <Input label="Email" />
//               <div>
//                 <label className="text-sm text-blue-600 font-medium">
//                   Phone Number
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="+91"
//                   className="w-full mt-1 px-4 py-2 rounded-lg 
//                   border border-white/40 
//                   bg-white/40 backdrop-blur-md
//                   focus:outline-none focus:ring-2 focus:ring-blue-400"
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="text-sm text-blue-600 font-medium">
//                 Message
//               </label>
//               <textarea
//                 rows="5"
//                 placeholder="Write your message.."
//                 className="w-full mt-1 px-4 py-2 rounded-lg 
//                 border border-white/40 
//                 bg-white/40 backdrop-blur-md
//                 focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//             </div>
//             <div className="flex justify-end pt-2">
//               <button className="bg-blue-600 text-white px-10 py-3 
//               rounded-xl shadow-lg 
//               hover:bg-blue-700 transition">
//                 Send message
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </section>
//   );
// };

// const Input = ({ label }) => (
//   <div>
//     <label className="text-sm text-blue-600 font-medium">
//       {label}
//     </label>
//     <input
//       type="text"
//       className="w-full mt-1 px-4 py-2 rounded-lg 
//       border border-white/40 
//       bg-white/40 backdrop-blur-md
//       focus:outline-none focus:ring-2 focus:ring-blue-400"
//     />
//   </div>
// );
// export default ContactUs;


import React from "react";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import leftImg from "../../assets/contact.png";
import rightImg from "../../assets/contact1.png";

const ContactUs = () => {
  return (
    <section className="relative min-h-screen bg-[#efefef] flex items-center justify-center overflow-hidden py-28 px-4">

      {/* Background Heading */}
      <h1
        className="absolute top-0 left-1/2 -translate-x-1/2
        text-[12vw] lg:text-[130px] font-bold text-[#0a2dc5]
        opacity-90 z-0 select-none pointer-events-none"
      >
        ContactUs
      </h1>

      {/* TOP IMAGE - Sitting on container */}
      <img
  src={rightImg}
  alt=""
  className="absolute z-30 hidden w-32  lg:block -top-0 right-20 xl:w-48"
/>

      {/* LEFT IMAGE - Behind container */}
      <img
        src={leftImg}
        alt=""
        className="absolute z-20 hidden w-40  lg:block -left-1 bottom-10 xl:w-48 opacity-90"
      />

      {/* MAIN CONTAINER */}
      <div
        className="relative z-10 w-full max-w-4xl
        bg-white/20
        backdrop-blur-2xl
        border border-white/30
        shadow-[0_8px_32px_rgba(31,38,135,0.25)]
        rounded-[30px]
        pt-24 pb-10 px-6 sm:px-10 md:px-14"
      >

        <div className="absolute inset-0 rounded-[30px]
        bg-gradient-to-br from-white/20 to-transparent
        pointer-events-none"></div>

        <div className="relative grid gap-10 md:grid-cols-2">

          {/* LEFT INFO */}
          <div className="flex flex-col justify-between">

            <div className="space-y-8">

              <div className="flex items-center gap-3 font-medium text-blue-600">
                <MdEmail size={22} />
                <span>contact@bmp.com</span>
              </div>

              <div className="flex max-w-xs gap-3 font-medium text-blue-600">
                <MdLocationOn size={22} className="mt-1" />
                <p>
                  08 Triveni Tower 3rd Floor, Central Avenue,
                  Gandhiputla, Itwari, Nagpur 440002, India.
                </p>
              </div>

            </div>

            {/* Social Icons */}
            <div className="flex gap-4 mt-10 text-2xl">
              <a href="https://twitter.com">
                <FaTwitter className="cursor-pointer text-sky-500" />
              </a>

              <a href="https://instagram.com">
                <FaInstagram className="text-pink-500 cursor-pointer" />
              </a>

              <a href="https://linkedin.com">
                <FaLinkedin className="text-blue-700 cursor-pointer" />
              </a>
            </div>

          </div>

          {/* CONTACT FORM */}
          <form className="space-y-6">

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input label="First Name" />
              <Input label="Last Name" />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input label="Email" />

              <div>
                <label className="text-sm font-medium text-blue-600">
                  Phone Number
                </label>

                <input
                  type="text"
                  placeholder="+91"
                  className="w-full px-4 py-2 mt-1 border rounded-lg border-white/40 bg-white/40 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

            </div>

            <div>
              <label className="text-sm font-medium text-blue-600">
                Message
              </label>

              <textarea
                rows="5"
                placeholder="Write your message.."
                className="w-full px-4 py-2 mt-1 border rounded-lg border-white/40 bg-white/40 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                className="px-8 py-3 text-white transition bg-blue-600 shadow-lg rounded-xl hover:bg-blue-700"
              >
                Send Message
              </button>
            </div>

          </form>

        </div>
      </div>
    </section>
  );
};

const Input = ({ label }) => (
  <div>
    <label className="text-sm font-medium text-blue-600">
      {label}
    </label>

    <input
      type="text"
      className="w-full px-4 py-2 mt-1 border rounded-lg border-white/40 bg-white/40 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  </div>
);

export default ContactUs;