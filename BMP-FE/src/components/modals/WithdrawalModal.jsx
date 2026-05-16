import React, { useState } from "react";
import { X, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { requestWithdrawal } from "../../services/paymentService";

const WithdrawalModal = ({ isOpen, onClose, balance, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [withdrawalData, setWithdrawalData] = useState(null);

  const MINIMUM_WITHDRAWAL = 100;
  const MAXIMUM_WITHDRAWAL = balance || 0;

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    setError("");
  };

  const handleQuickAmount = (percent) => {
    const quickAmount = Math.floor((balance * percent) / 100);
    setAmount(quickAmount.toString());
    setError("");
  };

  const validateAmount = () => {
    const withdrawAmount = parseFloat(amount);

    if (!amount || withdrawAmount <= 0) {
      setError("Please enter a valid amount");
      return false;
    }

    if (withdrawAmount < MINIMUM_WITHDRAWAL) {
      setError(`Minimum withdrawal is ₹${MINIMUM_WITHDRAWAL}`);
      return false;
    }

    if (withdrawAmount > MAXIMUM_WITHDRAWAL) {
      setError(`Insufficient balance. Max: ₹${MAXIMUM_WITHDRAWAL}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAmount()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await requestWithdrawal(parseFloat(amount));

      if (result.success) {
        setSuccess(true);
        setWithdrawalData(result.data);
        setAmount("");

        // Call parent success callback
        if (onSuccess) {
          setTimeout(() => {
            onSuccess(result.data);
          }, 2000);
        }
      } else {
        setError(result.message || "Failed to process withdrawal");
      }
    } catch (err) {
      console.error("Withdrawal error:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    setError("");
    setSuccess(false);
    setWithdrawalData(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Request Withdrawal</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            // Success State
            <div className="text-center">
              <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-600 mb-2">
                Withdrawal Requested!
              </h3>
              <p className="text-gray-600 mb-4">
                ₹{parseFloat(withdrawalData?.amount || 0).toFixed(2)} withdrawal request has been
                created.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Bank:</strong> {withdrawalData?.bank_details?.bank_name}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Account:</strong> {withdrawalData?.bank_details?.account_ending}
                </p>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Money will reach your account in 1-2 business days.
              </p>
              <button
                onClick={handleClose}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Done
              </button>
            </div>
          ) : (
            // Form State
            <form onSubmit={handleSubmit}>
              {/* Balance Display */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{balance?.toFixed(2) || "0.00"}
                </p>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Withdrawal Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="Enter amount"
                    min="0"
                    step="1"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* Quick Selection */}
              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-2">Quick Select</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(50)}
                    className="py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium hover:border-blue-500 hover:text-blue-600 transition"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(75)}
                    className="py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium hover:border-blue-500 hover:text-blue-600 transition"
                  >
                    75%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(100)}
                    className="py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium hover:border-blue-500 hover:text-blue-600 transition"
                  >
                    All
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Info Box */}
              <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>Minimum:</strong> ₹{MINIMUM_WITHDRAWAL} |{" "}
                  <strong>Processing:</strong> 1-2 business days
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Request Withdrawal"
                )}
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full mt-2 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalModal;
