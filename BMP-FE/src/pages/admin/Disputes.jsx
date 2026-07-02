import React, { useMemo, useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiLayers,
  FiX,
  FiSend,
} from "react-icons/fi";
import { MdOutlinePending } from "react-icons/md";
import { BsChatSquareText } from "react-icons/bs";

import withMaterialTable from "../../core/common/withMaterialTable";
import ApiService from "../../core/services/api.service";
import useModalDismiss from "../../core/hooks/useModalDismiss";
import { showError } from "../../core/utils/toast.util";

/* ================== BADGE STYLES ================== */

const badge = {
  HIGH: "bg-red-100 text-red-600",
  URGENT: "bg-red-200 text-red-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-gray-100 text-gray-600",
};

const statusStyle = {
  Open: "bg-red-100 text-red-600",
  "In Progress": "bg-yellow-100 text-yellow-700",
  Resolved: "bg-green-100 text-green-700",
  Closed: "bg-gray-100 text-gray-600",
};

/* ================== FORMATTERS ================== */

const formatStatus = (status) => {
  switch (status) {
    case "OPEN":
      return "Open";
    case "IN_PROGRESS":
      return "In Progress";
    case "RESOLVED":
      return "Resolved";
    case "CLOSED":
      return "Closed";
    default:
      return status;
  }
};

const formatDisputes = (data) => {
  if (!Array.isArray(data)) return [];

  return data.map((d) => ({
    id: d.dispute_id || d.id || "-",
    user: d.raised_by_name || d.user_name || d.user?.name || "N/A",
    email: d.email || d.user_email || d.user?.email || "-",
    booking: d.booking_id || "-",
    category: d.dispute_type || d.category || "-",
    subject: d.description || d.subject || d.message || "-",
    priority: d.priority || "LOW",
    status: formatStatus(d.dispute_status || d.status),
    date: d.created_at
      ? new Date(d.created_at).toLocaleDateString()
      : "-",
    messages: `${d.message_count || 0} messages`,
    pickup_city: d.pickup_city || "-",
    delivery_city: d.delivery_city || "-",
    role: d.role || "-",
  }));
};
/* ================== DISPUTE MODAL ================== */

const priorityBadge = {
  HIGH:   "bg-orange-500 text-white",
  URGENT: "bg-red-600 text-white",
  MEDIUM: "bg-yellow-400 text-white",
  LOW:    "bg-gray-400 text-white",
};

const DisputeModal = ({ dispute, onClose, onStatusChange }) => {
  const [reply, setReply] = useState("");
  const [messages, setMessages] = useState([
    { sender: dispute.user, time: dispute.date + ", 10:30:00 AM", text: dispute.subject },
  ]);

  const { handleBackdropClick } = useModalDismiss(onClose);

  const handleSend = () => {
    if (!reply.trim()) return;
    setMessages(prev => [...prev, { sender: "Admin", time: new Date().toLocaleString(), text: reply }]);
    setReply("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header — pink/red gradient */}
        <div className="bg-gradient-to-r from-pink-500 to-red-500 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-xl p-2.5">
              <BsChatSquareText size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white text-lg font-bold">{dispute.id}</p>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${priorityBadge[dispute.priority] || "bg-gray-400 text-white"}`}>
                  {dispute.priority}
                </span>
              </div>
              <p className="text-white/80 text-sm mt-0.5 truncate max-w-xs">{dispute.subject}</p>
            </div>
          </div>
          <button onClick={onClose} className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 transition">
            <FiX size={18} />
          </button>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-3 gap-3 p-5 bg-white border-b border-gray-100">
          {/* User */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">User</p>
            <p className="font-semibold text-gray-800 text-sm">{dispute.user}</p>
            <p className="text-xs text-gray-400 mt-0.5">{dispute.email}</p>
          </div>
          {/* Booking */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">Booking ID</p>
            <p className="font-bold text-gray-800 text-sm">{dispute.booking}</p>
            <p className="text-xs text-gray-400 mt-0.5">Partner: {dispute.partner || "—"}</p>
          </div>
          {/* Category */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">Category</p>
            <p className="font-semibold text-gray-800 text-sm">{dispute.category}</p>
            <p className="text-xs text-gray-400 mt-0.5">Created {dispute.date}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-white">
          <p className="font-semibold text-gray-800 text-sm">Messages ({messages.length})</p>
          {messages.map((msg, i) => (
            <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-sm text-gray-800">{msg.sender}</span>
                <span className="text-xs text-gray-400">{msg.time}</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{msg.text}</p>
            </div>
          ))}
        </div>

        {/* Reply input */}
        <div className="px-5 py-3 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
            <input
              type="text"
              value={reply}
              onChange={e => setReply(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Type your response..."
              aria-label="Reply to dispute"
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition"
            >
              <FiSend size={14} /> Send
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-3 px-5 py-4 bg-white border-t border-gray-100">
          <button
            onClick={() => onStatusChange(dispute.id, "IN_PROGRESS")}
            className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 rounded-xl text-sm transition"
          >
            <MdOutlinePending size={16} /> Mark In Progress
          </button>
          <button
            onClick={() => onStatusChange(dispute.id, "RESOLVED")}
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl text-sm transition"
          >
            <FiCheckCircle size={16} /> Mark Resolved
          </button>
          <button
            onClick={() => onStatusChange(dispute.id, "CLOSED")}
            className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl text-sm transition"
          >
            <FiXCircle size={16} /> Close Dispute
          </button>
        </div>

      </div>
    </div>
  );
};



const DisputeSummary = ({ disputes, onFilter, activeFilter }) => {
  const stats = useMemo(() => {
    const total = disputes.length;
    const count = disputes.reduce(
      (acc, d) => { acc[d.status] = (acc[d.status] || 0) + 1; return acc; },
      { Open: 0, "In Progress": 0, Resolved: 0, Closed: 0 }
    );
    return { total, ...count };
  }, [disputes]);

  const Card = ({ title, value, status, color, icon }) => (
    <div onClick={() => onFilter(status)}
      className={`cursor-pointer rounded-lg border p-4 shadow-sm hover:shadow-md transition ${color} ${
        activeFilter === status ? "ring-2 ring-blue-400 shadow-md" : ""
      }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-xs text-gray-500">{title}</p>
        </div>
        <div className="w-10 h-10 flex items-center justify-center rounded-full text-lg bg-white">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      <Card
        title="Total Disputes"
        value={stats.total}
        status={null}
        color="bg-white border-blue-200"
        icon={<FiLayers />}
      />

      <Card
        title="Open"
        value={stats.Open}
        status="Open"
        color="bg-white border-red-200"
        icon={<FiAlertCircle />}
      />

      <Card
        title="In Progress"
        value={stats["In Progress"]}
        status="In Progress"
        color="bg-white border-yellow-200"
        icon={<FiClock />}
      />

      <Card
        title="Resolved"
        value={stats.Resolved}
        status="Resolved"
        color="bg-white border-green-200"
        icon={<FiCheckCircle />}
      />

      <Card
        title="Closed"
        value={stats.Closed}
        status="Closed"
        color="bg-white border-gray-200"
        icon={<FiXCircle />}
      />
    </div>
  );
};

/* ================== TABLE CONFIG ================== */

const disputeTableConfig = {
  title: "Dispute Management",

  columns: [
    { accessorKey: "id", header: "ID" },

    {
      accessorKey: "user",
      header: "USER",
      Cell: ({ row }) => (
        <div>
          <p className="font-semibold">{row.original.user}</p>
          <p className="text-xs text-gray-500">{row.original.email}</p>
        </div>
      ),
    },

    { accessorKey: "booking", header: "BOOKING" },
    { accessorKey: "category", header: "TYPE" },

    {
      accessorKey: "subject",
      header: "DESCRIPTION",
      Cell: ({ cell }) => (
        <p className="truncate max-w-[200px]">
          {cell.getValue() || "—"}
        </p>
      ),
    },

    {
      accessorKey: "pickup_city",
      header: "ROUTE",
      Cell: ({ row }) => (
        <span className="text-xs text-gray-600">
          {row.original.pickup_city} → {row.original.delivery_city}
        </span>
      ),
    },

    {
      accessorKey: "role",
      header: "RAISED BY",
      Cell: ({ cell }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          cell.getValue() === "TRAVELLER" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
        }`}>
          {cell.getValue()}
        </span>
      ),
    },

    {
      accessorKey: "status",
      header: "STATUS",
      Cell: ({ cell }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusStyle[cell.getValue()] || "bg-gray-100 text-gray-600"
          }`}
        >
          {cell.getValue()}
        </span>
      ),
    },

    {
      accessorKey: "date",
      header: "CREATED",
      Cell: ({ row }) => (
        <div className="text-xs text-gray-500">
          {row.original.date}
          <br />
          {row.original.messages}
        </div>
      ),
    },
  ],

  // no API here anymore
  getData: async () => [],
};

/* ================== PAGE ================== */

const DisputeManagement = () => {
  const [allDisputes, setAllDisputes]           = useState([]);
  const [filteredDisputes, setFilteredDisputes] = useState([]);
  const [activeFilter, setActiveFilter]         = useState(null);
  const [loading, setLoading]                   = useState(false);
  const [modalDispute, setModalDispute]         = useState(null);

  useEffect(() => { fetchDisputes(); }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getAdminDisputes();
      const rawData = res.data.data.disputes;
      const formatted = formatDisputes(rawData);
      setAllDisputes(formatted);
      setFilteredDisputes(formatted);
    } catch (err) {
      console.error("Error fetching disputes:", err);
      showError("Failed to load disputes. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (status) => {
    setActiveFilter(status);
    setFilteredDisputes(status ? allDisputes.filter(d => d.status === status) : allDisputes);
  };

  const handleStatusChange = async (disputeId, newStatus) => {
    try {
      await ApiService.updateDisputeStatus(disputeId, { status: newStatus });
      // Update local state
      const update = (list) =>
        list.map((d) => d.id === disputeId ? { ...d, status: formatStatus(newStatus) } : d);
      setAllDisputes(prev => update(prev));
      setFilteredDisputes(prev => update(prev));
      if (modalDispute?.id === disputeId) {
        setModalDispute(prev => ({ ...prev, status: formatStatus(newStatus) }));
      }
    } catch (err) {
      console.error("Failed to update dispute status:", err);
      showError("Failed to update dispute status. Please try again.");
    }
  };

  const DisputeTable = withMaterialTable(null, {
    ...disputeTableConfig,
    getData: async () => filteredDisputes,
    state: { isLoading: loading },
    onView: (row) => setModalDispute(row),
  });

  return (
    <div className="p-4">
      <DisputeSummary disputes={allDisputes} onFilter={handleFilter} activeFilter={activeFilter} />
      <DisputeTable />

      {modalDispute && (
        <DisputeModal
          dispute={modalDispute}
          onClose={() => setModalDispute(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default DisputeManagement;