import React, { useState, useEffect } from "react";
import {
  FiBox, FiStar, FiMapPin, FiSearch, FiDownload,
  FiMail, FiPhone, FiCalendar, FiTruck, FiArrowLeft, FiEdit, FiPhoneCall
} from "react-icons/fi";
import { BsCurrencyRupee } from "react-icons/bs";
import { useParams, useNavigate } from "react-router-dom";
import RoutePath from "../../core/constants/routes.constant";
import ApiService from "../../core/services/api.service";
import TravelerDetailsOverview from "./travelerdetails/TravelerDetailsOverview";
import TravelerDetailsBookings from "./travelerdetails/TravelerDetailsBookings";
import TravelerDetailsPayments from "./travelerdetails/TravelerDetailsPayments";
import TravelerDetailsActivity from "./travelerdetails/TravelerDetailsActivity";
import TravelerDetailsDocuments from "./travelerdetails/TravelerDetailsDocuments";

const exportTravelerPDF = (traveler, bookings, payments) => {
  const rows = bookings.map((b, i) =>
    `<tr><td>${b.booking_ref || `BMP-${String(i+1).padStart(2,'0')}`}</td><td>${b.booking_status||''}</td><td>${[b.pickup_city,b.pickup_state].filter(Boolean).join(', ')}</td><td>${[b.delivery_city,b.delivery_state].filter(Boolean).join(', ')}</td><td>\u20b9${b.amount||0}</td><td>${b.createdAt?new Date(b.createdAt).toLocaleDateString():''}</td></tr>`
  ).join('');
  const payRows = payments.map(p =>
    `<tr><td>${p.booking_ref||p.parcel_ref||''}</td><td>\u20b9${Number(p.amount||0).toLocaleString()}</td><td>${p.status||''}</td><td>${p.createdAt?new Date(p.createdAt).toLocaleDateString():''}</td></tr>`
  ).join('');
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Partner Report - ${traveler.name}</title>
  <style>body{font-family:Arial,sans-serif;padding:30px;color:#333}h1{color:#7c3aed}h2{color:#374151;border-bottom:2px solid #e5e7eb;padding-bottom:6px;margin-top:28px}table{width:100%;border-collapse:collapse;margin-top:10px}th{background:#7c3aed;color:#fff;padding:8px 10px;text-align:left;font-size:12px}td{padding:7px 10px;border-bottom:1px solid #e5e7eb;font-size:12px}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #7c3aed;padding-bottom:16px;margin-bottom:24px}.logo{font-size:22px;font-weight:bold;color:#7c3aed}.meta{font-size:11px;color:#6b7280}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px}.info-item label{font-size:11px;color:#6b7280;display:block}.info-item span{font-size:13px;font-weight:600}.footer{margin-top:40px;border-top:1px solid #e5e7eb;padding-top:12px;font-size:11px;color:#9ca3af;text-align:center}</style></head><body>
  <div class="header"><div class="logo">&#128230; Book My Parcel</div><div class="meta">Generated: ${new Date().toLocaleString()}<br>Admin Report</div></div>
  <h1>Partner Report: ${traveler.name||'—'}</h1>
  <div class="info-grid">
    <div class="info-item"><label>Partner ID</label><span>${String(traveler.id||'').slice(0,8).toUpperCase()}</span></div>
    <div class="info-item"><label>Email</label><span>${traveler.email||'—'}</span></div>
    <div class="info-item"><label>Phone</label><span>${traveler.phone_number||'—'}</span></div>
    <div class="info-item"><label>Location</label><span>${[traveler.city,traveler.state].filter(Boolean).join(', ')||'—'}</span></div>
    <div class="info-item"><label>Vehicle Type</label><span>${traveler.vehicle_type||'—'}</span></div>
    <div class="info-item"><label>Vehicle Number</label><span>${traveler.license_number||'—'}</span></div>
    <div class="info-item"><label>KYC Status</label><span>${traveler.kyc_status||'—'}</span></div>
    <div class="info-item"><label>Total Deliveries</label><span>${traveler.total_deliveries||0}</span></div>
    <div class="info-item"><label>Total Earnings</label><span>\u20b9${Number(traveler.total_earnings||0).toLocaleString()}</span></div>
    <div class="info-item"><label>Avg Rating</label><span>${Number(traveler.average_rating||0).toFixed(1)}/5</span></div>
  </div>
  <h2>Delivery History (${bookings.length})</h2>
  <table><thead><tr><th>Booking ID</th><th>Status</th><th>Pickup</th><th>Delivery</th><th>Amount</th><th>Date</th></tr></thead><tbody>${rows||'<tr><td colspan="6">No deliveries</td></tr>'}</tbody></table>
  <h2>Earnings History (${payments.length})</h2>
  <table><thead><tr><th>Reference</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>${payRows||'<tr><td colspan="4">No payments</td></tr>'}</tbody></table>
  <div class="footer">Book My Parcel &mdash; Confidential Admin Report &mdash; ${new Date().getFullYear()}</div>
  </body></html>`;
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.print();
};

const TravelerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [traveler, setTraveler] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH TRAVELER ---------------- */
  const getTravelerData = async () => {
    try {
      const response = await ApiService.getAdminTravelerDetails(id);
      if (response?.data?.success) {
        setTraveler(response.data.data.traveler);
        setBookings(response.data.data.bookings);
        setPayments(response.data.data.payments);
      }
    } catch (error) {
      console.error("Error fetching traveler:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getTravelerData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!traveler) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-gray-500">Traveler not found</p>
        </div>
      </div>
    );
  }

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "RV";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FiArrowLeft size={20} />
            </button>
            
            <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg w-[320px]">
              <FiSearch className="text-gray-400 mr-2" size={16} />
              <input
                type="text"
                placeholder="Search users, partners, bookings..."
                className="outline-none text-sm w-full bg-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Super Admin</span>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              SA
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        
        {/* PAGE TITLE */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Traveler Details</h1>
            <p className="text-gray-500 text-sm mt-1">
              Complete information about {traveler?.name || 'Rajesh Verma'}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => exportTravelerPDF(traveler, bookings, payments)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              <FiDownload size={16} />
              Export Data
            </button>
          </div>
        </div>

        {/* PROFILE HEADER */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-bold">
                {getInitials(traveler?.name)}
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-semibold">{traveler?.name || 'Rajesh Verma'}</h2>
                  
                  {traveler?.kyc_verified && (
                    <span className="bg-green-500 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      ✓ Verified
                    </span>
                  )}
                  
                  <span className="bg-blue-500 text-xs px-2 py-1 rounded-full">
                    ✓ Active
                  </span>
                </div>
                
                <div className="flex items-center gap-6 text-sm opacity-90">
                  <span className="flex items-center gap-2">
                    <FiMail size={14} />
                    {traveler?.email || 'rajesh.verma@email.com'}
                  </span>
                  <span className="flex items-center gap-2">
                    <FiPhone size={14} />
                    {traveler?.phone_number || '+91 98765 43210'}
                  </span>
                </div>
                
                <div className="flex items-center gap-6 text-sm opacity-90 mt-1">
                  <span className="flex items-center gap-2">
                    <FiMapPin size={14} />
                    {traveler?.city || 'Mumbai'}, {traveler?.state || 'Maharashtra'}
                  </span>
                  <span className="flex items-center gap-2">
                    <FiTruck size={14} />
                    {traveler?.license_number || 'MH-02-AX-1234 (bike)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30">
                <FiEdit size={18} />
              </button>
              <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30">
                <FiPhoneCall size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        {(() => {
          const total = Number(traveler?.total_deliveries) || 0;
          const completed = Number(traveler?.completed_deliveries) || 0;
          const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
          return (
            <div className="grid grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiBox className="text-blue-600" size={20} />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{total}</div>
                <div className="text-sm text-gray-500">Total Deliveries</div>
              </div>

              <div className="bg-white rounded-xl p-4 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{completed}</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>

              <div className="bg-white rounded-xl p-4 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BsCurrencyRupee className="text-green-600" size={20} />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  ₹{Number(traveler?.total_earnings || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Earnings</div>
              </div>

              <div className="bg-white rounded-xl p-4 text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiStar className="text-yellow-600" size={20} />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {Number(traveler?.average_rating || 0).toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">Rating</div>
              </div>

              <div className="bg-white rounded-xl p-4 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{successRate}%</div>
                <div className="text-sm text-gray-500">Success Rate</div>
              </div>
            </div>
          );
        })()}

        {/* TABS SECTION */}
        <div className="bg-white rounded-xl shadow-sm">
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Overview
              </button>

              <button
                onClick={() => setActiveTab("deliveries")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "deliveries"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Deliveries
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {bookings.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("earnings")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "earnings"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Earnings
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {payments.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("performance")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "performance"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Performance
              </button>

              <button
                onClick={() => setActiveTab("documents")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "documents"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Documents
              </button>

            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            
            {activeTab === "overview" && (
              <TravelerDetailsOverview traveler={traveler} />
            )}

            {activeTab === "deliveries" && (
              <TravelerDetailsBookings bookings={bookings} />
            )}

            {activeTab === "earnings" && (
              <TravelerDetailsPayments payments={payments} totalEarnings={traveler?.total_earnings} />
            )}

            {activeTab === "performance" && (
              <TravelerDetailsActivity traveler={traveler} />
            )}

            {activeTab === "documents" && (
              <TravelerDetailsDocuments traveler={traveler} />
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default TravelerDetails;