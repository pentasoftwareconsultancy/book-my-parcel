import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hi! I’m your Book My Parcel assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simple bot logic
  const getBotReply = (msg) => {
    const text = msg.toLowerCase();

    if (text.includes("track")) {
      return "📦 Please enter your Tracking ID (e.g. BMP123456).";
    }
    if (text.includes("price") || text.includes("cost")) {
      return "💰 Pricing depends on distance, weight & delivery mode.";
    }
    if (text.includes("support") || text.includes("help")) {
      return "📞 Call: +91 1800 123 4567\n✉ support@bookmyparcel.com";
    }
    if (text.includes("hi") || text.includes("hello")) {
      return "Hello! 👋 How can I assist you?";
    }

    return "🤖 I didn’t understand that. Try asking about tracking, pricing or support.";
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: getBotReply(input) },
      ]);
    }, 700);
  };

  return (
    <>
      {/* FLOATING BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-1 z-50
                   w-14 h-14 rounded-full
                   bg-blue-600 text-white shadow-xl
                   flex items-center justify-center
                   hover:bg-blue-700 transition"
      >
        <MessageCircle size={26} />
      </button>

      {/* CHAT WINDOW */}
      {open && (
        <div
          className="
            fixed z-50 bg-white shadow-2xl rounded-2xl
            bottom-20 right-5
            w-[92vw] max-w-[380px]
            h-[70vh] max-h-[520px]
            flex flex-col overflow-hidden
          "
        >
          {/* HEADER */}
          <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
            <div>
              <p className="font-semibold text-sm">Book My Parcel Bot</p>
              <p className="text-xs opacity-80">Online • Replies instantly</p>
            </div>
            <button onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] text-sm p-3 rounded-xl whitespace-pre-line
                  ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white ml-auto"
                      : "bg-white shadow"
                  }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* INPUT */}
          <div className="border-t p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 text-sm px-3 py-2 border rounded-lg focus:outline-none"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-3 rounded-lg"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
