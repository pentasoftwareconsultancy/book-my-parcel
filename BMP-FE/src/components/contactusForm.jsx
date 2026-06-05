import React, { useRef } from "react";
import emailjs from "@emailjs/browser";

const SubscribeForm = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_rri7isl",
        "template_gwazvug",
        form.current,
        "p_3bCQ_ULuwRZ4zU7"
      )
      .then(
        () => {
          alert("Subscribed Successfully!");
          form.current.reset();
        },
        (error) => {
          console.log(error.text);
          alert("Failed to subscribe.");
        }
      );
  };

  return (
    <div
      className="p-7"
      style={{
        background: "rgba(255,255,255,0.15)",
        borderRadius: "14px",
      }}
    >
      <h4 className="text-base font-normal mb-5 opacity-90">
        Subscribe
      </h4>

      <form ref={form} onSubmit={sendEmail}>
        <div
          className="flex mb-5"
          style={{
            borderRadius: "8px",
            overflow: "hidden",
            height: "60px",
          }}
        >
          <input
            type="email"
            name="user_email"
            placeholder="Email address"
            required
            style={{
              flex: 1,
              minWidth: 0,
              padding: "0 16px",
              border: "none",
              outline: "none",
              fontSize: "14px",
              color: "#9ca3af",
              background: "rgba(255,255,255,0.92)",
            }}
          />

          <button
            type="submit"
            style={{
              width: "50px",
              background: "rgba(28, 85, 224, 0.89)",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            →
          </button>
        </div>
      </form>

      <p className="text-xs opacity-90 leading-relaxed m-0">
        We're always happy to help! Contact Book My Parcel for quick
        assistance, guidance, or support. Your delivery experience
        matters to us — let's get your parcel moving.
      </p>
    </div>
  );
};

export default SubscribeForm;