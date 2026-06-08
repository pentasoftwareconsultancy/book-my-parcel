import React from "react";
import { motion } from "framer-motion";
import { privacyPolicyData } from "../../pages/datafiles/PrivacyPolicyData";

function PrivacyModel({
  open,
  onClose,
  onAgree,
  onDisagree,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white max-w-3xl w-full rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Privacy Policy</h2>

          <button
            onClick={onClose}
            className="text-white text-2xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto text-sm text-gray-700 space-y-5">
          <p className="font-semibold text-blue-600">
            {privacyPolicyData.intro}
          </p>

          {privacyPolicyData.sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
              }}
              className="space-y-2"
            >
              <h3 className="font-bold text-gray-900">
                {section.title}
              </h3>

              {section.list && (
                <ul className="list-disc ml-5 space-y-1">
                  {section.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}

              {section.text && (
                <p className="leading-relaxed">
                  {section.text}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={() => {
              if (onDisagree) onDisagree();
              onClose();
            }}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Disagree
          </button>

          <button
            onClick={() => {
              if (onAgree) onAgree();
              onClose();
            }}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Agree
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default PrivacyModel;