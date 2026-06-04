import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import ApiService from "../../core/services/api.service";

export default function SecurityTab() {
  const [password, setPassword] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (key, value) => {
    setPassword((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!password.oldPassword || !password.newPassword || !password.confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password.newPassword !== password.confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    if (password.newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      await ApiService.updatePassword({
        oldPassword: password.oldPassword,
        newPassword: password.newPassword,
      });
      alert("Password updated successfully!");
      setPassword({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error('Password update failed:', error);
      alert(error.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <div className="relative mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">Old Password <span className="text-red-500">*</span></label>
        <input
          type={showPassword.oldPassword ? "text" : "password"}
          placeholder="Old Password"
          value={password.oldPassword}
          className="border p-2 w-full rounded pr-10"
          onChange={(e) => handleChange("oldPassword", e.target.value)}
        />
        <button
          type="button"
          onClick={() => togglePasswordVisibility("oldPassword")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword.oldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <div className="relative mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">New Password <span className="text-red-500">*</span></label>
        <input
          type={showPassword.newPassword ? "text" : "password"}
          placeholder="New Password"
          value={password.newPassword}
          className="border p-2 w-full rounded pr-10"
          onChange={(e) => handleChange("newPassword", e.target.value)}
        />
        <button
          type="button"
          onClick={() => togglePasswordVisibility("newPassword")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword.newPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <div className="relative mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password <span className="text-red-500">*</span></label>
        <input
          type={showPassword.confirmPassword ? "text" : "password"}
          placeholder="Confirm New Password"
          value={password.confirmPassword}
          className="border p-2 w-full rounded pr-10"
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
        />
        <button
          type="button"
          onClick={() => togglePasswordVisibility("confirmPassword")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword.confirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Updating..." : "Change Password"}
      </button>
    </div>
  );
}