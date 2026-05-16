import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers, FiTruck, FiBox, FiDollarSign,
  FiArrowLeft, FiTrendingUp, FiTrendingDown,
} from "react-icons/fi";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement,
  LineElement, PointElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import ApiService from "../../core/services/api.service";
import RoutePath from "../../core/constants/routes.constant";
import BookingStatusBadge from "../../core/common/BookingStatusBadge";

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement,
  LineElement, PointElement
);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ individuals: 0, travellers: 0, activeBookings: 0, totalRevenue: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await ApiService.getDashboardOverview();
        const data = res.data?.data || {};
        setStats(data.stats || {});
        setRecentBookings(data.recentBookings || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Build monthly booking counts from recentBookings
  const monthlyCounts = Array(12).fill(0);
  const monthlyRevenue = Array(12).fill(0);
  recentBookings.forEach(b => {
    const m = new Date(b.createdAt).getMonth();
    if (!isNaN(m)) {
      monthlyCounts[m]++;
      monthlyRevenue[m] += Number(b.amount) || 0;
    }
  });

  // Status breakdown
  const statusCount = recentBookings.reduce((acc, b) => {
    const s = b.booking_status?.toUpperCase() || "UNKNOWN";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const barData = {
    labels: MONTHS,
    datasets: [
      {
        label: "Bookings",
        data: monthlyCounts,
        backgroundColor: "rgba(99,102,241,0.7)",
        borderRadius: 6,
      },
    ],
  };

  const lineData = {
    labels: MONTHS,
    datasets: [
      {
        label: "Revenue (₹)",
        data: monthlyRevenue,
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#10b981",
      },
    ],
  };

  const doughnutData = {
    labels: ["Users", "Partners"],
    datasets: [
      {
        data: [stats.individuals || 0, stats.travellers || 0],
        backgroundColor: ["#6366f1", "#f59e0b"],
        borderWidth: 0,
      },
    ],
  };

  const statusDoughnut = {
    labels: Object.keys(statusCount),
    datasets: [
      {
        data: Object.values(statusCount),
        backgroundColor: ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: "#f3f4f6" } } },
  };

  const doughnutOptions = {
    responsive: true,
    cutout: "70%",
    plugins: { legend: { position: "bottom", labels: { padding: 16, font: { size: 12 } } } },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-b-2 border-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(RoutePath.ADMIN_OVERVIEW)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500">Platform performance overview</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard icon={<FiUsers />}     label="Total Users"       value={stats.individuals}   color="bg-indigo-50 text-indigo-600"  trend="up" />
        <KpiCard icon={<FiTruck />}     label="Partners"          value={stats.travellers}    color="bg-amber-50 text-amber-600"    trend="up" />
        <KpiCard icon={<FiBox />}       label="Active Bookings"   value={stats.activeBookings} color="bg-orange-50 text-orange-600" trend="down" />
        <KpiCard icon={<FiDollarSign />} label="Total Revenue"   value={`₹${Number(stats.totalRevenue || 0).toLocaleString()}`} color="bg-emerald-50 text-emerald-600" trend="up" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Monthly Bookings Bar */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Monthly Bookings</h3>
            <span className="text-xs text-gray-400">This year</span>
          </div>
          <Bar data={barData} options={chartOptions} />
        </div>

        {/* User Distribution Doughnut */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">User Distribution</h3>
          </div>
          <Doughnut data={doughnutData} options={doughnutOptions} />
          <div className="mt-4 space-y-2">
            <LegendRow color="bg-indigo-500" label="Users"    value={stats.individuals || 0} />
            <LegendRow color="bg-amber-400"  label="Partners" value={stats.travellers || 0} />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Revenue Line */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Revenue Trend</h3>
            <span className="text-xs text-gray-400">This year</span>
          </div>
          <Line data={lineData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} />
        </div>

        {/* Booking Status Doughnut */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Booking Status</h3>
          </div>
          {Object.keys(statusCount).length > 0 ? (
            <>
              <Doughnut data={statusDoughnut} options={doughnutOptions} />
              <div className="mt-4 space-y-1.5">
                {Object.entries(statusCount).map(([s, c], i) => (
                  <div key={s} className="flex items-center justify-between text-xs text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: statusDoughnut.datasets[0].backgroundColor[i] }} />
                      {s.replace("_", " ")}
                    </span>
                    <span className="font-semibold">{c}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center mt-8">No booking data</p>
          )}
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Recent Bookings Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b text-xs uppercase">
                <th className="pb-3 font-medium">Booking ID</th>
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Partner</th>
                <th className="pb-3 font-medium">Route</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentBookings.slice(0, 8).map((b, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="py-3 font-medium text-indigo-600">{b.booking_ref || `BMP-${String(i+1).padStart(2,"0")}`}</td>
                  <td className="py-3 text-gray-700">{b.user_name || "—"}</td>
                  <td className="py-3 text-gray-500">{b.partner_name || "N/A"}</td>
                  <td className="py-3 text-gray-500">{b.pickup_city} → {b.delivery_city}</td>
                  <td className="py-3"><BookingStatusBadge status={b.booking_status} /></td>
                  <td className="py-3 font-semibold text-gray-800">₹{b.amount || 0}</td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">No data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

/* ── Small helpers ── */
const KpiCard = ({ icon, label, value, color, trend }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between">
    <div>
      <div className={`w-10 h-10 flex items-center justify-center rounded-lg mb-3 ${color}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trend === "up" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
      {trend === "up" ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
    </div>
  </div>
);

const LegendRow = ({ color, label, value }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-gray-600">{label}</span>
    </span>
    <span className="font-semibold text-gray-800">{value}</span>
  </div>
);

export default AdminAnalytics;
