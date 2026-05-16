
import React, { useMemo, useEffect, useState } from "react";
import {
  MdPending,
  MdCheckCircle,
  MdLocalShipping,
  MdCancel,
} from "react-icons/md";
import { FiPackage, FiMapPin } from "react-icons/fi";
import { FiUsers } from "react-icons/fi";

import withMaterialTable from "../../core/common/withMaterialTable";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";
import RoutePath from "../../core/constants/routes.constant";
import { BookingModal } from "./userdetails/DetailsBookings";
import BookingStatusBadge from "../../core/common/BookingStatusBadge";

/* ---------------- SUMMARY BLOCK ---------------- */
const BookingSummary = ({ bookings, onFilter }) => {
  const stats = useMemo(() => {
    const total = bookings.length;

    const count = bookings.reduce(
      (acc, b) => {
        const s = (b.status || "").toUpperCase();
        if (s === "CREATED" || s === "MATCHING") acc.pending++;
        else if (s === "CONFIRMED" || s === "PARTNER_SELECTED") acc.accepted++;
        else if (s === "IN_TRANSIT" || s === "PICKUP") acc.transit++;
        else if (s === "DELIVERED") acc.delivered++;
        else if (s === "CANCELLED") acc.cancelled++;
        return acc;
      },
      { pending: 0, accepted: 0, transit: 0, delivered: 0, cancelled: 0 }
    );

    return { total, ...count };
  }, [bookings]);

  const Card = ({ title, value, status, color, icon }) => (
    <div
      onClick={() => onFilter(status)}
      className={`cursor-pointer rounded-lg border p-4 shadow-sm hover:shadow-md transition ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{title}</p>
        </div>
        {icon}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {/* TOTAL */}
      <Card
        title="Total Bookings"
        value={stats.total}
        status={null}
        color="bg-white border-blue-200"
        icon={
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
            <FiPackage />
          </div>
        }
      />

      {/* PENDING */}
      <Card
        title="Pending"
        value={stats.pending}
        status="pending"
        color="bg-white border-yellow-200"
        icon={
          <div className="w-10 h-10 rounded-full bg-yellow-500 text-white flex items-center justify-center">
            <MdPending />
          </div>
        }
      />

      {/* ACCEPTED */}
      <Card
        title="Accepted"
        value={stats.accepted}
        status="accepted"
        color="bg-white border-green-200"
        icon={
          <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">
            <MdCheckCircle />
          </div>
        }
      />

      {/* IN TRANSIT */}
      <Card
        title="In Transit"
        value={stats.transit}
        status="transit"
        color="bg-white border-indigo-200"
        icon={
          <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center">
            <MdLocalShipping />
          </div>
        }
      />

      {/* DELIVERED */}
      <Card
        title="Delivered"
        value={stats.delivered}
        status="delivered"
        color="bg-white border-emerald-200"
        icon={
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <MdCheckCircle />
          </div>
        }
      />

      {/* CANCELLED */}
      <Card
        title="Cancelled"
        value={stats.cancelled}
        status="cancelled"
        color="bg-white border-red-200"
        icon={
          <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center">
            <MdCancel />
          </div>
        }
      />
    </div>
  );
};

/* ---------------- TABLE CONFIG ---------------- */

const bookingTableConfig = {
  title: "Booking Management",

  columns: [
    { accessorKey: "booking_id", header: "BOOKING ID" },
    {
      accessorKey: "user",
      header: "USER",
      Cell: ({ row }) => (
        <div>
          <p className="font-semibold">{row.original.user}</p>
          <p className="text-xs text-gray-500">{row.original.user_phone}</p>
        </div>
      ),
    },
    {
      accessorKey: "partner",
      header: "PARTNER",
      Cell: ({ row }) => (
        <div>
          <p className="font-semibold">{row.original.partner}</p>
          <p className="text-xs text-gray-500">{row.original.partner_phone}</p>
        </div>
      ),
    },
    {
      accessorKey: "route",
      header: "ROUTE",
      Cell: ({ row }) => (
        <div className="text-xs">
          <p className="flex items-center gap-1"><FiMapPin size={10} className="text-blue-500" /> {row.original.from}</p>
          <p className="text-gray-400">→ {row.original.to}</p>
        </div>
      ),
    },
    {
      accessorKey: "parcel",
      header: "PARCEL",
      Cell: ({ row }) => (
        <div className="text-xs">
          <p className="font-medium">{row.original.parcel}</p>
          <p className="text-gray-400">{row.original.weight}</p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "STATUS",
      Cell: ({ cell }) => <BookingStatusBadge status={cell.getValue()} />,
    },
    {
      accessorKey: "amount",
      header: "AMOUNT",
      Cell: ({ cell }) => <span className="font-medium">₹ {cell.getValue()}</span>,
    },
    { accessorKey: "date", header: "DATE" },
  ],

  onView: (row, _navigate, setModalBooking) => {
    setModalBooking({
      id:        row.booking_id,
      rawStatus: row._raw_status || row.status?.toUpperCase().replace(/ /g, "_") || "CREATED",
      status:    row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : "—",
      amount:    row.amount || 0,
      createdAt: row.date || "—",
      pickup:    { label: row.from || "—", date: "" },
      drop:      { label: row.to   || "—", date: "" },
      distance:  "—",
      sender:    { name: row.user  || "—", email: row.user_email || "—", phone: row.user_phone || "—" },
      partner:   { name: row.partner || "Not Assigned", phone: row.partner_phone || "—" },
      parcel:    { type: row.parcel || "—", weight: row.weight || "—", dimensions: "—", distance: "—" },
      payment:   { total: row.amount || 0, platformFee: Math.round((row.amount || 0) * 0.1), partnerEarning: Math.round((row.amount || 0) * 0.9), paymentStatus: row.status === "cancelled" ? "Refunded" : "Paid" },
    });
  },

  getData: async () => {
    try {
      const response = await ApiService.apiget(ServerUrl.API_ADMIN_BOOKINGS);

      const list = response.data?.bookings || [];
      return list.map((item, index) => ({
        id: item.booking_id || index,

        booking_id: item.booking_ref || `BMP-${String(index + 1).padStart(2, "0")}`,
        _raw_status: item.booking_status,

        user: item.user_name || "—",
        user_phone: item.phone_number || "—",
        user_email: item.email || "—",

        partner: item.partner_name || "Not Assigned",
        partner_phone: item.partner_phone || "—",

        from: [item.pickup_city, item.pickup_state].filter(Boolean).join(", ") || "—",
        to: [item.delivery_city, item.delivery_state].filter(Boolean).join(", ") || "—",

        parcel: item.parcel_type || "—",
        weight: item.weight ? `${item.weight} kg` : "—",

        status: item.booking_status?.toLowerCase(),

        amount: item.amount || "—",

        date: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString()
          : "—"
      }));

    } catch (error) {
      console.error("Error fetching bookings:", error);
      return [];
    }
  },

};

/* ---------------- PAGE ---------------- */

const Bookings = () => {
  const [allBookings, setAllBookings]       = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [modalBooking, setModalBooking]     = useState(null);

  useEffect(() => {
    bookingTableConfig.getData().then((data) => {
      setAllBookings(data);
      setFilteredBookings(data);
    });
  }, []);

  const handleFilter = (status) => {
    if (!status) {
      setFilteredBookings(allBookings);
    } else {
      setFilteredBookings(allBookings.filter((b) => b.status === status));
    }
  };

  const BookingTable = withMaterialTable(null, {
    ...bookingTableConfig,

    getData: async () => filteredBookings,

    // Pass setModalBooking so onView can open the modal
    onView: (row) => bookingTableConfig.onView(row, null, setModalBooking),

    deleteData: async (id) => {
      setAllBookings((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        setFilteredBookings(updated);
        return updated;
      });
    },

    updateData: async (updatedRow) => {
      setAllBookings((prev) => {
        const updated = prev.map((item) =>
          item.id === updatedRow.id ? updatedRow : item
        );
        setFilteredBookings(updated);
        return updated;
      });
      return updatedRow;
    },
  });

  return (
    <div className="p-4">
      <BookingSummary bookings={allBookings} onFilter={handleFilter} />
      <BookingTable />

      {modalBooking && (
        <BookingModal
          booking={modalBooking}
          onClose={() => setModalBooking(null)}
        />
      )}
    </div>
  );
};

export default Bookings;