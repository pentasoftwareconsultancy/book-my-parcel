import React, { useMemo, useEffect, useState } from "react";
import {
  MdCheckCircle,
  MdPending,
  MdCancel,
  MdCreditCard,
  MdAccountBalanceWallet,
} from "react-icons/md";
import { RiBankLine } from "react-icons/ri";
import { FaMoneyCheckAlt } from "react-icons/fa";
import { FiX, FiDollarSign, FiUser } from "react-icons/fi";
import withMaterialTable from "../../core/common/withMaterialTable";
import ApiService from "../../core/services/api.service";

/* ---------------- PAYMENT MODAL ---------------- */
const statusBadge = {
  Completed: "bg-green-100 text-green-700 border border-green-200",
  Pending:   "bg-yellow-100 text-yellow-700 border border-yellow-200",
  Failed:    "bg-red-100 text-red-700 border border-red-200",
  Refunded:  "bg-orange-100 text-orange-700 border border-orange-200",
};

const PaymentModal = ({ payment, onClose }) => {
  const platformFee     = Math.round((payment.amountValue || 0) * 0.1);
  const partnerEarning  = (payment.amountValue || 0) - platformFee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

        {/* Green header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-xl p-2.5">
              <FiDollarSign size={22} className="text-white" />
            </div>
            <div>
              <p className="text-white text-lg font-bold">{payment.transactionId}</p>
              <p className="text-white/80 text-sm">Transaction Details</p>
            </div>
          </div>
          <button onClick={onClose} className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 transition">
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Amount + status */}
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900">₹{(payment.amountValue || 0).toLocaleString("en-IN")}</p>
            <span className={`inline-flex items-center gap-1.5 mt-2 px-4 py-1.5 rounded-full text-sm font-semibold ${statusBadge[payment.status] || "bg-gray-100 text-gray-600"}`}>
              {payment.status === "Completed" && <MdCheckCircle size={15} />}
              {payment.status}
            </span>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoBox label="Transaction Type" value={payment.type || "Booking"} />
            <InfoBox label="Payment Method"   value={payment.method || "UPI"} icon={<MdCreditCard size={14} className="text-gray-400" />} />
            <InfoBox label="Transaction Date" value={payment.date || "—"} />
            <InfoBox label="Completed Date"   value={payment.status === "Completed" ? payment.date : "—"} />
          </div>

          {/* Payment Breakdown */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="font-semibold text-gray-800 mb-3">Payment Breakdown</p>
            <BreakRow label="Total Amount"      value={`₹${(payment.amountValue || 0).toLocaleString("en-IN")}`} />
            <BreakRow label="Platform Fee (10%)" value={`₹${platformFee.toLocaleString("en-IN")}`} />
            <div className="border-t border-gray-200 pt-2 mt-1">
              <BreakRow label="Partner Earning" value={`₹${partnerEarning.toLocaleString("en-IN")}`} highlight />
            </div>
          </div>

          {/* Description */}
          {payment.description && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <p className="text-sm text-gray-500">{payment.description}</p>
            </div>
          )}

          {/* User / Partner */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">User</p>
              <p className="font-semibold text-gray-800 text-sm">{payment.user || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Partner</p>
              <p className="font-semibold text-gray-800 text-sm">{payment.partner || "—"}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const InfoBox = ({ label, value, icon }) => (
  <div className="bg-gray-50 rounded-xl p-3">
    <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">{icon}{label}</p>
    <p className="text-sm font-semibold text-gray-800">{value}</p>
  </div>
);

const BreakRow = ({ label, value, highlight }) => (
  <div className="flex items-center justify-between text-sm">
    <span className={highlight ? "font-semibold text-gray-800" : "text-gray-500"}>{label}</span>
    <span className={highlight ? "font-bold text-green-600" : "text-gray-700"}>{value}</span>
  </div>
);

/* ---------------- HELPERS ---------------- */
const formatStatus = (status) => {
  switch (status) {
    case "SUCCESS":   return "Completed";
    case "CREATED":   return "Pending";
    case "PENDING":   return "Pending";
    case "FAILED":    return "Failed";
    case "REFUNDED":  return "Refunded";
    default:          return status || "Unknown";
  }
};

const formatPayments = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((p) => {
    // Sequelize: Payment.belongsTo(Booking) with no alias → key is "booking" (model defined as "booking")
    const booking  = p.booking  || p.Booking  || {};
    // Booking.belongsTo(Parcel, { as: "parcel" }) → key is "parcel"
    const parcel   = booking.parcel || {};
    // Parcel.belongsTo(User) with no alias → key is "user" (model defined as "users" → Sequelize singularizes to "user")
    const sender   = parcel.user   || parcel.User   || {};
    // Booking.belongsTo(User, { as: "traveller" }) → key is "traveller"
    const traveller = booking.traveller || {};

    return {
      id: p.id,
      transactionId: p.razorpay_payment_id || p.razorpay_order_id || p.id?.slice(0, 8) || "—",
      referenceId:   booking.booking_ref   || p.booking_id?.slice(0, 8) || "—",
      type: "Booking",
      user:    sender.profile?.name    || sender.email    || sender.phone_number    || "—",
      partner: traveller.profile?.name || traveller.email || traveller.phone_number || "—",
      description: parcel.parcel_ref
        ? `Parcel ${parcel.parcel_ref}`
        : "Parcel booking payment",
      method:      booking.payment_mode || "UPI",
      amountValue: p.amount   || 0,
      currency:    p.currency || "INR",
      status: formatStatus(p.status),
      date: p.createdAt
        ? new Date(p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : "—",
    };
  });
};

/* ---------------- SUMMARY CARDS ---------------- */
const PaymentSummary = ({ data, onFilter, activeFilter }) => {
  const stats = useMemo(() => {
    const totalRevenue = data.reduce((a, b) => a + (b.amountValue || 0), 0);
    const count = data.reduce(
      (acc, d) => { acc[d.status] = (acc[d.status] || 0) + 1; return acc; },
      { Completed: 0, Pending: 0, Failed: 0, Refunded: 0 }
    );
    return { totalRevenue, ...count };
  }, [data]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <SummaryCard title="Total Revenue"     value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`} icon={<MdAccountBalanceWallet size={20} />} color="text-green-600"  bg="bg-green-50"  active={activeFilter === null}  onClick={() => onFilter(null)} />
        <SummaryCard title="Completed"         value={stats.Completed}  icon={<MdCheckCircle size={20} />} color="text-blue-600"   bg="bg-blue-50"   active={activeFilter === "Completed"} onClick={() => onFilter("Completed")} />
        <SummaryCard title="Pending"           value={stats.Pending}    icon={<MdPending size={20} />}     color="text-yellow-600" bg="bg-yellow-50" active={activeFilter === "Pending"}   onClick={() => onFilter("Pending")} />
        <SummaryCard title="Failed / Refunded" value={stats.Failed + stats.Refunded} icon={<MdCancel size={20} />} color="text-red-600" bg="bg-red-50" active={activeFilter === "Failed"} onClick={() => onFilter("Failed")} />
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <FilterPill label="All"       count={data.length}     active={activeFilter === null}          onClick={() => onFilter(null)} />
        <FilterPill label="Completed" count={stats.Completed} active={activeFilter === "Completed"}   onClick={() => onFilter("Completed")} />
        <FilterPill label="Pending"   count={stats.Pending}   active={activeFilter === "Pending"}     onClick={() => onFilter("Pending")} />
        <FilterPill label="Failed"    count={stats.Failed}    active={activeFilter === "Failed"}      onClick={() => onFilter("Failed")} />
        <FilterPill label="Refunded"  count={stats.Refunded}  active={activeFilter === "Refunded"}    onClick={() => onFilter("Refunded")} />
      </div>
    </>
  );
};

const SummaryCard = ({ title, value, icon, color, bg, active, onClick }) => (
  <div onClick={onClick} className={`border rounded-lg p-4 cursor-pointer transition ${bg} ${
    active ? "ring-2 ring-offset-1 ring-blue-400 shadow-md" : "hover:shadow-md hover:scale-[1.02]"
  }`}>
    <div className="flex items-center justify-between">
      <div className={`text-2xl font-semibold ${color}`}>{value}</div>
      <div className={`${color} ${bg} p-2 rounded-full`}>{icon}</div>
    </div>
    <p className="text-xs text-gray-500 mt-1">{title}</p>
  </div>
);

const FilterPill = ({ label, count, active, onClick }) => (
  <button onClick={onClick} className={`px-3 py-1 rounded-full text-xs font-medium transition ${
    active
      ? "bg-blue-600 text-white shadow"
      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
  }`}>
    {label} ({count})
  </button>
);

/* ---------------- TABLE CONFIG ---------------- */
const columns = [
  {
    accessorKey: "transactionId",
    header: "TRANSACTION ID",
    Cell: ({ row }) => (
      <div>
        <p className="text-blue-600 font-semibold text-sm">{row.original.transactionId}</p>
        <p className="text-[11px] text-gray-400">{row.original.referenceId}</p>
      </div>
    ),
  },
  {
    accessorKey: "user",
    header: "USER / PARTNER",
    Cell: ({ row }) => (
      <div>
        <p className="font-semibold text-sm">{row.original.user}</p>
        <p className="text-xs text-gray-400">Partner: {row.original.partner}</p>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "DESCRIPTION",
    Cell: ({ cell }) => <p className="text-xs text-gray-500">{cell.getValue()}</p>,
  },
  {
    accessorKey: "method",
    header: "METHOD",
    Cell: ({ cell }) => {
      const icons = { UPI: <FaMoneyCheckAlt />, Card: <MdCreditCard />, Wallet: <MdAccountBalanceWallet />, Netbanking: <RiBankLine /> };
      return (
        <div className="flex items-center gap-2 text-sm">
          <span className="p-1 bg-gray-100 rounded">{icons[cell.getValue()] || <MdCreditCard />}</span>
          {cell.getValue()}
        </div>
      );
    },
  },
  {
    accessorKey: "amountValue",
    header: "AMOUNT",
    Cell: ({ row }) => (
      <p className="font-semibold text-sm">₹{row.original.amountValue?.toLocaleString("en-IN")}</p>
    ),
  },
  {
    accessorKey: "status",
    header: "STATUS",
    Cell: ({ cell }) => {
      const map = {
        Completed: "bg-green-100 text-green-700",
        Pending:   "bg-yellow-100 text-yellow-700",
        Failed:    "bg-red-100 text-red-700",
        Refunded:  "bg-orange-100 text-orange-700",
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[cell.getValue()] || "bg-gray-100 text-gray-600"}`}>
          {cell.getValue()}
        </span>
      );
    },
  },
  {
    accessorKey: "date",
    header: "DATE",
    Cell: ({ cell }) => <p className="text-xs text-gray-500">{cell.getValue()}</p>,
  },
];

/* ---------------- PAGE ---------------- */
const Payments = () => {
  const [allData, setAllData]           = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [modalPayment, setModalPayment] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await ApiService.getAdminPayments();
        const formatted = formatPayments(res.data?.data || []);
        setAllData(formatted);
        setFiltered(formatted);
      } catch (err) {
        console.error("Failed to fetch payments:", err);
        setError("Failed to load payments. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const handleFilter = (status) => {
    setActiveFilter(status);
    setFiltered(status ? allData.filter(d => d.status === status) : allData);
  };

  const PaymentTable = useMemo(() => withMaterialTable(null, {
    title: "Payment Transactions",
    columns,
    // Hide secondary columns on mobile — transactionId, amount, status, actions stay visible
    mobileHiddenColumns: ["user", "description", "method", "date"],
    getData: async () => filtered,
    onView: (row) => setModalPayment(row),
  }), [filtered]);

  if (error) {
    return (
      <div className="p-4 text-center py-16">
        <p className="text-red-500">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <PaymentSummary data={allData} onFilter={handleFilter} activeFilter={activeFilter} />
      <PaymentTable />

      {modalPayment && (
        <PaymentModal
          payment={modalPayment}
          onClose={() => setModalPayment(null)}
        />
      )}
    </div>
  );
};

export default Payments;
