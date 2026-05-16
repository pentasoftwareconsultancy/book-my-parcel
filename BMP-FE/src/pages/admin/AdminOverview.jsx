import React, { useEffect, useState } from "react";
import {
  FiUsers, FiTruck, FiBox, FiDollarSign,
  FiFilter, FiDownload, FiBarChart2,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ApiService from "../../core/services/api.service";
import RoutePath from "../../core/constants/routes.constant";
import { BookingModal } from "./userdetails/DetailsBookings";
import BookingStatusBadge from "../../core/common/BookingStatusBadge";

const AdminOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ travellers: 0, individuals: 0, activeBookings: 0, totalRevenue: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentTravellers, setRecentTravellers] = useState([]);
  const [modalBooking, setModalBooking] = useState(null);

 const fetchDashboard = async () => {
  try {
    const response = await ApiService.getDashboardOverview();

    const data = response.data?.data || {};

    // ✅ Stats
    setStats(data.stats || {
      travellers: 0,
      individuals: 0,
      activeBookings: 0,
      totalRevenue: 0
    });

    // ✅ Users
    const formattedUsers = (data.recentUsers || []).map(u => ({
      full_name: u.full_name || u.name,
      email: u.email
    }));
    setRecentUsers(formattedUsers);

    // ✅ Travellers
    const formattedTravellers = (data.recentTravellers || []).map(t => ({
      name: t.name,
      status: t.status?.toLowerCase()
    }));
    setRecentTravellers(formattedTravellers);

    // ✅ Bookings
    const formattedBookings = (data.recentBookings || []).map((b, i) => ({
      bookingId: b.booking_ref || `BMP-${String(i + 1).padStart(2, "0")}`,
      user: b.user_name || "—",
      partner: b.partner_name || "N/A",
      route: `${b.pickup_city || "—"} → ${b.delivery_city || "—"}`,
      status: b.booking_status?.toLowerCase().replace("in_transit", "in-transit"),
      amount: b.amount || 0,
      // raw fields for modal
      _raw_status:   b.booking_status,
      _pickup_city:  b.pickup_city,
      _delivery_city: b.delivery_city,
      _user_name:    b.user_name,
      _partner_name: b.partner_name,
      _date:         b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—",
    }));

    setRecentBookings(formattedBookings);

  } catch (error) {
    console.error("Dashboard error:", error);
  }
};
  useEffect(() => {
    fetchDashboard();
  }, []);
  
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between mt-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500">Welcome back, Super Admin</p>
        </div>
        <button
          onClick={() => navigate(RoutePath.ADMIN_ANALYTICS)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
        >
          <FiBarChart2 size={16} />
          View Analytics
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<FiUsers />}
          value={stats.individuals}
          label="Total Users"
          growth="+12.5%"
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={<FiTruck />}
          value={stats.travellers}
          label="Delivery Partners"
          growth="+8.3%"
          color="bg-pink-100 text-pink-600"
        />
        <StatCard
          icon={<FiBox />}
          value={stats.activeBookings}
          label="Active Bookings"
          growth="-3.2%"
          negative
          color="bg-orange-100 text-orange-600"
        />
        <StatCard
          icon={<FiDollarSign />}
          value={stats.totalRevenue}
          label="Total Revenue"
          growth="+15.8%"
          color="bg-green-100 text-green-600"
        />
      </div>

      {/* Recent Bookings */}
      <div className="p-4 overflow-x-auto bg-white border rounded-lg sm:p-5">
        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:justify-between sm:items-center">
          <h3 className="font-semibold">Recent Bookings</h3>

          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-1 text-sm border px-3 py-1.5 rounded-md">
              <FiFilter size={14} />
              Filter
            </button>
            <button className="flex items-center gap-1 text-sm border px-3 py-1.5 rounded-md">
              <FiDownload size={14} />
              Export
            </button>
          </div>
        </div>

        {/* Table Scroll on Mobile */}
        <div className="min-w-[700px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2">Booking ID</th>
                <th>User</th>
                <th>Partner</th>
                <th>Route</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((row, i) => (
                <tr key={i} className="border-b last:border-none">
                  <td className="py-3">{row.bookingId}</td>
                  <td>{row.user}</td>
                  <td>{row.partner}</td>
                  <td>{row.route}</td>
                  <td><BookingStatusBadge status={row._raw_status} /></td>
                  <td>₹{row.amount}</td>
                  <td>
                    <button
                      onClick={() => setModalBooking({
                        id:        row.bookingId,
                        rawStatus: row._raw_status || "CREATED",
                        amount:    row.amount,
                        createdAt: row._date,
                        pickup:    { label: row._pickup_city || "—" },
                        drop:      { label: row._delivery_city || "—" },
                        sender:    { name: row._user_name || "—", email: "—", phone: "—" },
                        partner:   { name: row._partner_name || "Not Assigned", phone: "—" },
                        parcel:    { type: "—", weight: "—" },
                        payment:   { total: row.amount, platformFee: Math.round((row.amount||0)*0.1), partnerEarning: Math.round((row.amount||0)*0.9), paymentStatus: "Paid" },
                      })}
                      className="text-gray-400 hover:text-blue-600 transition"
                    >
                      👁️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentUsers users={recentUsers} />
        <RecentPartners partners={recentTravellers} />
      </div>

      {modalBooking && (
        <BookingModal booking={modalBooking} onClose={() => setModalBooking(null)} />
      )}
    </div>
  );
};

export default AdminOverview;

/* ----------------------- Components ----------------------- */

const StatCard = ({ icon, value, label, growth, color, negative }) => (
  <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
    <div>
      <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${color}`}>
        {icon}
      </div>
      <h2 className="mt-2 text-lg font-semibold sm:text-xl">{value}</h2>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
    <span
      className={`text-xs px-2 py-1 rounded-full ${
        negative ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
      }`}
    >
      {growth}
    </span>
  </div>
);

const RecentUsers = ({ users }) => {
  const navigate = useNavigate();
  return (
  <div className="p-4 bg-white border rounded-lg sm:p-5">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold">Recent Users</h3>
      <span onClick={() => navigate(RoutePath.ADMIN_USERMANAGEMENT)} className="text-sm text-blue-600 cursor-pointer hover:underline">View All</span>
    </div>
    {users.map((u, i) => (
      <UserRow key={i} full_name={u.full_name} email={u.email} status="active" />
    ))}
  </div>
  );
};

const RecentPartners = ({ partners }) => {
  const navigate = useNavigate();
  return (
  <div className="p-4 bg-white border rounded-lg sm:p-5">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold">Recent Partners</h3>
      <span onClick={() => navigate(RoutePath.ADMIN_TRAVELER)} className="text-sm text-blue-600 cursor-pointer hover:underline">View All</span>
    </div>
    {partners.map((p, i) => (
      <PartnerRow key={i} name={p.name} deliveries={0} status={p.status?.toLowerCase()} />
    ))}
  </div>
  );
};

const UserStatusBadge = ({ status }) => {
  const map = {
    active:    "bg-green-100 text-green-600",
    pending:   "bg-yellow-100 text-yellow-600",
    suspended: "bg-red-100 text-red-600",
    verified:  "bg-blue-100 text-blue-600",
    rejected:  "bg-red-100 text-red-600",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-500"}`}>
      {status || "active"}
    </span>
  );
};

const UserRow = ({ full_name, email, status }) => (
  <div className="flex items-center justify-between py-2">
    <div className="min-w-0">
      <p className="text-sm font-medium truncate">{full_name}</p>
      <p className="text-xs text-gray-500 truncate">{email}</p>
    </div>
    <UserStatusBadge status={status} />
  </div>
);

const PartnerRow = ({ name, deliveries, status }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="text-sm font-medium">{name}</p>
      <p className="text-xs text-gray-500">{deliveries} deliveries</p>
    </div>
    <UserStatusBadge status={status} />
  </div>
);