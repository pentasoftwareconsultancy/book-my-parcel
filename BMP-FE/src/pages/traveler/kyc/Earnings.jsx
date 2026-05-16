import { useState, useEffect } from "react";
import { Plus, Wallet, TrendingUp, Download, IndianRupee, AlertCircle, Loader, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RoutePath from "../../../core/constants/routes.constant";
import WithdrawalModal from "../../../components/modals/WithdrawalModal";
import paymentService from "../../../services/paymentService";

const Earnings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [kycStatus, setKycStatus] = useState(null);
  const [error, setError] = useState("");
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch wallet balance (Available Balance - only actual wallet money)
      const balanceData = await paymentService.getWalletBalance();
      setBalance(balanceData.balance || 0);

      // Fetch traveller stats for earnings data (includes all deliveries)
      try {
        console.log("📊 [Earnings] Fetching traveller stats...");
        const statsData = await paymentService.getTravellerStats();
        console.log("📊 [Earnings] Stats data:", statsData);
        
        if (statsData.data?.stats) {
          const stats = statsData.data.stats;
          // Use stats for total and today's earnings (all PAY_NOW, platform fee already deducted)
          setTotalEarnings(stats.totalEarnings || 0);
          setTodayEarnings(stats.todayEarnings || 0);
          console.log(`📊 [Earnings] Total: ₹${stats.totalEarnings}, Today: ₹${stats.todayEarnings}`);
        } else {
          throw new Error("Invalid stats response");
        }
      } catch (statsErr) {
        console.warn("⚠️ [Earnings] Could not fetch stats, falling back to transactions:", statsErr);
        // Fallback to wallet transactions if stats endpoint fails
        const transactionsData = await paymentService.getWalletTransactions(50, 0);
        if (transactionsData.data && transactionsData.data.transactions) {
          const total = transactionsData.data.transactions
            .filter(t => t.type === "CREDIT")
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
          setTotalEarnings(total);

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayTotal = transactionsData.data.transactions
            .filter(t => {
              const txDate = new Date(t.createdAt);
              txDate.setHours(0, 0, 0, 0);
              return t.type === "CREDIT" && txDate.getTime() === today.getTime();
            })
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
          setTodayEarnings(todayTotal);
        }
      }

      // Check KYC status for withdrawal
      const kycData = await paymentService.checkKYCBankStatus();
      setKycStatus(kycData.data);

      // Fetch wallet transactions for transaction history display
      try {
        const transactionsData = await paymentService.getWalletTransactions(50, 0);
        if (transactionsData.data && transactionsData.data.transactions) {
          setTransactions(transactionsData.data.transactions);
        }
      } catch (err) {
        console.warn("⚠️ [Earnings] Could not fetch transaction history:", err);
        setTransactions([]);
      }
    } catch (err) {
      console.error("Error fetching earnings data:", err);
      setError("Failed to load earnings data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawClick = () => {
    if (!kycStatus?.isComplete) {
      // Check which KYC step is missing
      if (kycStatus?.status !== 'APPROVED') {
        // PAN KYC not approved - redirect to PAN verification
        const confirmPAN = window.confirm(
          `⚠️ PAN KYC Required\n\n${kycStatus?.message || "Your PAN verification is pending."}\n\nClick OK to complete PAN verification now.`
        );
        if (confirmPAN) {
          navigate(RoutePath.KYC_PAN, { state: { from: RoutePath.TRAVELLER_EARNINGS } });
        }
      } else if (!kycStatus?.bank_verified) {
        // Bank not verified - redirect to Bank verification
        const confirmBank = window.confirm(
          `⚠️ Bank Verification Required\n\nYour bank account is not verified. You need to verify your bank account to withdraw funds.\n\nClick OK to complete bank verification now.`
        );
        if (confirmBank) {
          navigate(RoutePath.KYC_BANK, { state: { from: RoutePath.TRAVELLER_EARNINGS } });
        }
      }
      return;
    }
    setShowWithdrawalModal(true);
  };

  const handleWithdrawalSuccess = () => {
    setShowWithdrawalModal(false);
    // Refresh balance after withdrawal
    fetchEarningsData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading earnings data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="m-4 md:p-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Earnings</h1>
          <p className="text-gray-500 text-sm">
            Manage your earnings and withdrawals
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button 
            onClick={() => navigate(RoutePath.TRAVELLER_ROUTE)} 
            className="flex items-center gap-2 bg-[#1F2AFF] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition shadow-sm"
          >
            <Plus size={16} /> Add Route
          </button>
          <button 
            onClick={handleWithdrawClick}
            disabled={balance <= 0}
            className="flex items-center gap-2 bg-gradient-to-r from-[#00C950] to-[#009966] text-white px-4 py-2 rounded-lg text-sm hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Download size={18} /> Withdraw ₹{balance.toFixed(0)}
          </button>
          <button 
            onClick={fetchEarningsData}
            disabled={loading}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> 
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* KYC Status Alert */}
      {kycStatus && !kycStatus.isComplete && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-yellow-800">KYC Incomplete - Withdrawals Disabled</p>
            <p className="text-sm text-yellow-700 mb-2">{kycStatus.message}</p>
            
            {/* Show specific action buttons based on what's missing */}
            <div className="mt-3 flex gap-2 flex-wrap">
              {kycStatus.status !== 'APPROVED' && (
                <button
                  onClick={() => navigate(RoutePath.KYC_PAN, { state: { from: RoutePath.TRAVELLER_EARNINGS } })}
                  className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition"
                >
                  Complete PAN Verification →
                </button>
              )}
              
              {kycStatus.status === 'APPROVED' && !kycStatus.bank_verified && (
                <button
                  onClick={() => navigate(RoutePath.KYC_BANK, { state: { from: RoutePath.TRAVELLER_EARNINGS } })}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
                >
                  Complete Bank Verification →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Total Earnings */}
        <div className="bg-white border-l-4 border-green-500 p-5 rounded-lg shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Earnings</p>
            <IndianRupee size={20} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">₹{totalEarnings.toFixed(2)}</h2>
          <p className="text-xs text-gray-500 mt-2">Lifetime earnings (after platform fee)</p>
        </div>

        {/* Available Balance */}
        <div className="bg-white border-l-4 border-blue-500 p-5 rounded-lg shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Available Balance</p>
            <Wallet size={20} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">₹{balance.toFixed(2)}</h2>
          <p className="text-xs text-gray-500 mt-2">Ready to withdraw (after platform fee)</p>
        </div>

        {/* Today's Earnings */}
        <div className="bg-white border-l-4 border-purple-500 p-5 rounded-lg shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Today's Earnings</p>
            <TrendingUp size={20} className="text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">₹{todayEarnings.toFixed(2)}</h2>
          <p className="text-xs text-gray-500 mt-2">Today's deliveries</p>
        </div>

      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-bold text-lg">Transaction History</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {transactions.map((item, index) => {
              // Extract platform fee from reason if present
              const platformFeeMatch = item.reason?.match(/Platform fee: ₹(\d+)/);
              const amountMatch = item.reason?.match(/Amount: ₹(\d+)/);
              const platformFee = platformFeeMatch ? platformFeeMatch[1] : null;
              const originalAmount = amountMatch ? amountMatch[1] : null;
              
              return (
              <div
                key={index}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`p-2 rounded-lg ${
                      item.type === "CREDIT"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {item.type === "CREDIT" ? (
                      <IndianRupee size={18} />
                    ) : (
                      <Download size={18} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {item.reason || (item.type === "CREDIT" ? "Delivery Payment" : "Withdrawal")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()} at{" "}
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {platformFee && (
                      <p className="text-xs text-orange-600 mt-1">
                        {originalAmount ? `Original: ₹${originalAmount} | ` : ''}Platform fee: ₹{platformFee} deducted
                      </p>
                    )}
                  </div>
                </div>

                <p className={`text-right font-semibold ml-4 ${
                  item.type === "CREDIT" ? "text-green-600" : "text-red-600"
                }`}>
                  {item.type === "CREDIT" ? "+" : "-"}₹{parseFloat(item.amount).toFixed(2)}
                </p>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      <WithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        balance={balance}
        onSuccess={handleWithdrawalSuccess}
      />
    </div>
  );
};

export default Earnings;
