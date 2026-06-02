import React, { useState, useEffect } from "react";

import {
  FiBox,
  FiClock,
  FiMapPin,
  FiSearch,
  FiDownload,
  FiPhone,
  FiCalendar,
  FiMail
} from "react-icons/fi";

import { BsCurrencyRupee } from "react-icons/bs";
import { useParams } from "react-router-dom";
import RoutePath from "../../core/constants/routes.constant";
import ApiService from "../../core/services/api.service";
import DetailsOverview from "./userdetails/DetailsOverview";
import DetailsBookings from "./userdetails/DetailsBookings";
import DetailsPayment from "./userdetails/DetailsPayments";
import DetailsActivity from "./userdetails/DetailsActivity";
import DetailsDocuments from "../admin/userdetails/DetailsDocuments";

const exportUserPDF = (user, bookings, payments) => {
  const rows = bookings.map((b, i) =>
    `<tr><td>${b.booking_ref || `BMP-${String(i+1).padStart(2,'0')}`}</td><td>${b.booking_status || ''}</td><td>${[b.pickup_city,b.pickup_state].filter(Boolean).join(', ')}</td><td>${[b.delivery_city,b.delivery_state].filter(Boolean).join(', ')}</td><td>\u20b9${b.amount || 0}</td><td>${b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ''}</td></tr>`
  ).join('');
  const payRows = payments.map(p =>
    `<tr><td>${p.payment_id || ''}</td><td>\u20b9${p.amount || 0}</td><td>${p.payment_status || ''}</td><td>${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}</td></tr>`
  ).join('');
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>User Report - ${user.name}</title>
  <style>body{font-family:Arial,sans-serif;padding:30px;color:#333}h1{color:#1e40af}h2{color:#374151;border-bottom:2px solid #e5e7eb;padding-bottom:6px;margin-top:28px}table{width:100%;border-collapse:collapse;margin-top:10px}th{background:#1e40af;color:#fff;padding:8px 10px;text-align:left;font-size:12px}td{padding:7px 10px;border-bottom:1px solid #e5e7eb;font-size:12px}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1e40af;padding-bottom:16px;margin-bottom:24px}.logo{font-size:22px;font-weight:bold;color:#1e40af}.meta{font-size:11px;color:#6b7280}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px}.info-item label{font-size:11px;color:#6b7280;display:block}.info-item span{font-size:13px;font-weight:600}.footer{margin-top:40px;border-top:1px solid #e5e7eb;padding-top:12px;font-size:11px;color:#9ca3af;text-align:center}</style></head><body>
  <div class="header"><div class="logo">&#128230; Book My Parcel</div><div class="meta">Generated: ${new Date().toLocaleString()}<br>Admin Report</div></div>
  <h1>User Report: ${user.name || '—'}</h1>
  <div class="info-grid">
    <div class="info-item"><label>User ID</label><span>${user.id || '—'}</span></div>
    <div class="info-item"><label>Email</label><span>${user.email || '—'}</span></div>
    <div class="info-item"><label>Phone</label><span>${user.phone_number || '—'}</span></div>
    <div class="info-item"><label>Location</label><span>${[user.city,user.state].filter(Boolean).join(', ') || '—'}</span></div>
    <div class="info-item"><label>Joined</label><span>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span></div>
    <div class="info-item"><label>KYC Status</label><span>${user.kyc_status || 'NOT_STARTED'}</span></div>
    <div class="info-item"><label>Total Bookings</label><span>${user.total_bookings || 0}</span></div>
    <div class="info-item"><label>Total Spent</label><span>\u20b9${Number(user.total_spent||0).toLocaleString()}</span></div>
  </div>
  <h2>Booking History (${bookings.length})</h2>
  <table><thead><tr><th>Booking ID</th><th>Status</th><th>Pickup</th><th>Delivery</th><th>Amount</th><th>Date</th></tr></thead><tbody>${rows || '<tr><td colspan="6">No bookings</td></tr>'}</tbody></table>
  <h2>Payment History (${payments.length})</h2>
  <table><thead><tr><th>Payment ID</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>${payRows || '<tr><td colspan="4">No payments</td></tr>'}</tbody></table>
  <div class="footer">Book My Parcel &mdash; Confidential Admin Report &mdash; ${new Date().getFullYear()}</div>
  </body></html>`;
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.print();
};

const UserDetails = () => {

  const { id } = useParams();   // get id from url

  const [activeTab, setActiveTab] = useState(
    RoutePath.ADMIN_USERDETAILS_OVERVIEW
  );
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH USER ---------------- */
  const getUserData = async () => {
    try {
      const response = await ApiService.getAdminUserDetails(id);
      if (response?.data?.success) {
        setUser(response.data.data.user);
        setBookings(response.data.data.bookings);
        setPayments(response.data.data.payments);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getUserData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading user details...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        User not found
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center bg-white px-4 py-2 rounded-lg w-[420px] shadow-sm">
          <FiSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search users, partners, bookings..."
            className="outline-none text-sm w-full"
          />
        </div>

        {/* <div className="flex items-center gap-6">
          <FiBell className="text-gray-500 text-xl" />

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-400">{user?.name}</p>
              <p className="text-sm font-semibold">{user?.name}</p>
            </div>

            <div className="bg-blue-600 text-white w-9 h-9 flex items-center justify-center rounded-full font-semibold">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </div> */}

      </div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">User Details</h1>
          <p className="text-gray-500 text-sm">
            Complete information about
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => exportUserPDF(user, bookings, payments)}
            className="border px-4 py-2 rounded-md text-sm flex items-center justify-center gap-2 bg-white hover:bg-gray-50">
            <FiDownload /> Export Data
          </button>
        </div>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl mb-6 flex items-center justify-between">

  <div className="flex items-center gap-5">

    {/* USER INITIAL */}
    <div className="w-16 h-16 bg-white/20 flex items-center justify-center rounded-lg text-xl font-bold">
      {user?.name?.charAt(0)}
    </div>

    <div>

      {/* NAME + STATUS */}
      <h2 className="text-xl font-semibold flex items-center gap-3">
        {user?.name}

        <span className="bg-green-500 text-xs px-2 py-1 rounded-full flex items-center gap-1">
          {user?.is_active ? "Active" : "Inactive"}
        </span>
      </h2>

      {/* CONTACT INFO ROW */}
      <div className="flex flex-wrap items-center gap-6 text-sm mt-2">

        <span className="flex items-center gap-2">
          <FiMail className="text-white/80" />
          {user?.email}
        </span>

        <span className="flex items-center gap-2">
          <FiPhone className="text-white/80" />
          {user?.phone_number}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-6 text-sm mt-2">
        
        <span className="flex items-center gap-2">
          <FiMapPin className="text-white/80" />
          {user?.city}, {user?.state}
        </span>

        <span className="flex items-center gap-2">
          <FiCalendar className="text-white/80" />
          Joined{" "}
          {user?.createdAt
            ? new Date(user.createdAt).toLocaleDateString()
            : ""}
        </span>
      </div>

    </div>
  </div>

</div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="bg-blue-500 w-10 h-10 flex items-center justify-center rounded-lg mb-2">
            <FiBox className="text-white text-lg" />
          </div>

          <p className="text-xl font-semibold">{Number(user?.total_bookings) || 0}</p>
          <p className="text-gray-500 text-sm">Total Bookings</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="bg-green-500 w-10 h-10 flex items-center justify-center rounded-lg mb-2">
            <BsCurrencyRupee className="text-white text-lg" />
          </div>

          <p className="text-xl font-semibold">₹{Number(user?.total_spent || 0).toLocaleString()}</p>
          <p className="text-gray-500 text-sm">Total Spent</p>
        </div>

<div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="bg-pink-500 w-10 h-10 flex items-center justify-center rounded-lg mb-2">
            <FiClock className="text-white text-lg" />
          </div>

          <p className="text-xl font-semibold">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
          </p>
          <p className="text-gray-500 text-sm">Joined</p>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white rounded-xl shadow">

        <div className="flex gap-6 border-b px-6 pt-4 text-sm">

          <button
            onClick={() => setActiveTab(RoutePath.ADMIN_USERDETAILS_OVERVIEW)}
            className={activeTab === RoutePath.ADMIN_USERDETAILS_OVERVIEW ? "border-b-2 border-blue-600 pb-2 text-blue-600" : "text-gray-500"}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab(RoutePath.ADMIN_USERDETAILS_BOOKINGS)}
            className={activeTab === RoutePath.ADMIN_USERDETAILS_BOOKINGS ? "border-b-2 border-blue-600 pb-2 text-blue-600" : "text-gray-500"}
          >
            Bookings
          </button>

          <button
            onClick={() => setActiveTab(RoutePath.ADMIN_USERDETAILS_PAYMENT)}
            className={activeTab === RoutePath.ADMIN_USERDETAILS_PAYMENT ? "border-b-2 border-blue-600 pb-2 text-blue-600" : "text-gray-500"}
          >
            Payments
          </button>

          <button
            onClick={() => setActiveTab(RoutePath.ADMIN_USERDETAILS_ACTIVITY)}
            className={activeTab === RoutePath.ADMIN_USERDETAILS_ACTIVITY ? "border-b-2 border-blue-600 pb-2 text-blue-600" : "text-gray-500"}
          >
            Activity
          </button>

          <button
            onClick={() => setActiveTab(RoutePath.ADMIN_USERDETAILS_DOCUMENTS)}
            className={activeTab === RoutePath.ADMIN_USERDETAILS_DOCUMENTS ? "border-b-2 border-blue-600 pb-2 text-blue-600" : "text-gray-500"}
          >
            Documents
          </button>

        </div>

        <div className="p-6">

          {activeTab === RoutePath.ADMIN_USERDETAILS_OVERVIEW && (
            <DetailsOverview user={user} />
          )}

          {activeTab === RoutePath.ADMIN_USERDETAILS_BOOKINGS && (
            <DetailsBookings bookings={bookings} />
          )}

          {activeTab === RoutePath.ADMIN_USERDETAILS_PAYMENT && (
            <DetailsPayment payments={payments} totalSpent={user?.total_spent} />
          )}

          {activeTab === RoutePath.ADMIN_USERDETAILS_ACTIVITY && (
            <DetailsActivity user={user} bookings={bookings} />
          )}

          {activeTab === RoutePath.ADMIN_USERDETAILS_DOCUMENTS && (
            <DetailsDocuments user={user} />
          )}

        </div>
      </div>

    </div>
  );
};

export default UserDetails;