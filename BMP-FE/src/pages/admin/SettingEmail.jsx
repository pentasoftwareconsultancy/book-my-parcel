import React, { useState, useEffect } from "react";
import { FiMail, FiX } from "react-icons/fi";
import ApiService from "../../core/services/api.service";
import { showSuccess, showError } from "../../core/utils/toast.util";

const SettingEmail = () => {
  const [templates, setTemplates] = useState([]);
  const [editing, setEditing] = useState(null); // { id, name, subject, body_html }
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ApiService.getEmailTemplates()
      .then((res) => {
        const raw = res.data;
        const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        setTemplates(list);
      })
      .catch(() => showError("Failed to load email templates"));
  }, []);

  const openEdit = (tpl) =>
    setEditing({ id: tpl.id, name: tpl.name, subject: tpl.subject, body_html: tpl.body_html });

  const handleSave = async () => {
    setSaving(true);
    try {
      await ApiService.updateEmailTemplate(editing.id, {
        subject: editing.subject,
        body_html: editing.body_html,
      });
      setTemplates((prev) =>
        prev.map((t) => (t.id === editing.id ? { ...t, subject: editing.subject, body_html: editing.body_html } : t))
      );
      showSuccess("Email template updated");
      setEditing(null);
    } catch {
      showError("Failed to update email template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6">
      <h2 className="text-lg font-semibold mb-6">Email Templates</h2>

      <div className="space-y-4">
        {templates.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border border-gray-200 rounded-lg p-4 hover:shadow-sm transition"
          >
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-lg shrink-0">
                <FiMail />
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base">{item.name}</p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {item.subject} · Last edited {new Date(item.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => openEdit(item)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm sm:text-base transition duration-200"
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="font-semibold text-base">Edit: {editing.name}</h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Subject <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={editing.subject}
                  onChange={(e) => setEditing((p) => ({ ...p, subject: e.target.value }))}
                  className="w-full mt-1 border rounded-md px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Body HTML <span className="text-red-500">*</span></label>
                <textarea
                  value={editing.body_html}
                  onChange={(e) => setEditing((p) => ({ ...p, body_html: e.target.value }))}
                  rows={10}
                  className="w-full mt-1 border rounded-md px-4 py-2 text-sm font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-md text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white"
              >
                {saving ? "Saving..." : "Save Template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingEmail;
