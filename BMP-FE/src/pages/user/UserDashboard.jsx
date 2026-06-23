import { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Filter, Package, MapPin, CheckCircle,
  Truck, X, ChevronRight, Send, Star,
  MessageCircle, User, MessageSquare, XCircle
} from "lucide-react";
import { DELIVERY_STATUS } from "../../core/constants/app.constant";
import RoutePath from "../../core/constants/routes.constant";
import BookingCancel from "./BookingCancle";
import OrderCard from "../../components/user/OrderCard";
import { useOrdersData, PATH_STATUS_MAP } from "../../core/hooks/useOrdersData";

const TravellerSelectionModal = lazy(() => import("../../components/modals/TravellerSelectionModal"));
const FeedbackModal            = lazy(() => import("../../components/modals/FeedbackModal"));
const ContactModal             = lazy(() => import("../../components/modals/ContactModal"));

const UserOrdersPage = () => {
  const navigate = useNavigate();
  const { orders, loading, error, otpData, fetchOrders, currentPath } = useOrdersData();

  const [search, setSearch]                               = useState("");
  const [cancelOrderId, setCancelOrderId]                 = useState(null);
  const [selectedParcelForTraveller, setSelectedParcelForTraveller] = useState(null);
  const [selectedOrderForFeedback, setSelectedOrderForFeedback]     = useState(null);
  const [contactModal, setContactModal]                   = useState({ open: false, contact: null });

  const allowedStatuses = PATH_STATUS_MAP[currentPath] || [];

  const filteredOrders = orders
    .filter((o) => allowedStatuses.length === 0 || allowedStatuses.includes(o.status))
    .filter((o) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        o.trackingId?.toLowerCase().includes(q) ||
        o.bookingId?.toLowerCase().includes(q) ||
        o.pickup?.city?.toLowerCase().includes(q) ||
        o.delivery?.city?.toLowerCase().includes(q) ||
        o.traveler?.name?.toLowerCase().includes(q)
      );
    });

  const tabLabel =
    currentPath === RoutePath.USER_ACTIVE     ? "active"
    : currentPath === RoutePath.USER_COMPLETED  ? "completed"
    : currentPath === RoutePath.USER_CANCELLED  ? "cancelled"
    : "";

  const activeCount = orders.filter(
    (o) => o.status === DELIVERY_STATUS.IN_TRANSIT || o.status === DELIVERY_STATUS.CONFIRMED || o.status === DELIVERY_STATUS.PARTNER_SELECTED || o.status === DELIVERY_STATUS.PICKUP
  ).length;

  return (
    <div className="min-h-screen bg-[#f6f8fc] p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6">My Orders</h1>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Deliveries</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{orders.length}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Package className="text-blue-400" size={20} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Active Deliveries</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{activeCount}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Truck className="text-blue-400" size={20} />
          </div>
        </div>
        <button
          onClick={() => navigate(RoutePath.USER_REQUEST_FORM)}
          className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl shadow p-4 sm:p-5 flex items-center gap-4 text-white hover:opacity-90 transition sm:col-span-2 lg:col-span-1"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold flex-shrink-0">+</div>
          <div className="text-left">
            <p className="font-bold text-base sm:text-lg leading-tight">Send New Parcel</p>
            <p className="text-xs text-blue-200 mt-0.5">Book your next delivery now.</p>
          </div>
        </button>
      </div>

      {/* SEARCH */}
      {!loading && !error && (
        <div className="flex gap-3 mb-6">
          <div className="flex items-center bg-white rounded-xl shadow px-3 py-2 w-full min-h-[44px]">
            <Search className="text-gray-400 flex-shrink-0" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tracking number, location, traveler..."
              className="w-full px-3 py-1.5 text-sm outline-none bg-transparent"
              aria-label="Search orders"
            />
          </div>
          <button
            className="bg-white shadow rounded-xl px-4 sm:px-5 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition whitespace-nowrap border border-gray-200 min-h-[44px]"
            aria-label="Filter orders"
          >
            <Filter size={16} /> Filter
          </button>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="text-center py-16">
          <p className="text-lg text-gray-500">Loading orders...</p>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <p className="text-lg text-red-500">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg">
            Try Again
          </button>
        </div>
      )}

      {/* ORDERS LIST */}
      {!loading && !error && (
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow">
            <Package className="text-gray-300 text-5xl mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-500">No {tabLabel} orders found.</p>
              {search && <p className="text-sm text-gray-400 mt-1">Try clearing your search.</p>}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                navigate={navigate}
                onCancel={setCancelOrderId}
                onSelectTraveller={setSelectedParcelForTraveller}
                onFeedback={setSelectedOrderForFeedback}
                onContact={(contact) => setContactModal({ open: true, contact })}
                otpData={otpData[order.deliveryId]}
              />
            ))
          )}
        </div>
      )}

      {/* MODALS */}
      {cancelOrderId && (
        <BookingCancel parcelId={cancelOrderId} onClose={() => setCancelOrderId(null)} />
      )}

      {selectedParcelForTraveller && (
        <Suspense fallback={null}>
          <TravellerSelectionModal
            isOpen
            onClose={() => setSelectedParcelForTraveller(null)}
            parcelId={selectedParcelForTraveller}
            onTravellerSelected={() => { setSelectedParcelForTraveller(null); fetchOrders(); }}
          />
        </Suspense>
      )}

      {contactModal.open && (
        <Suspense fallback={null}>
          <ContactModal
            open
            onClose={() => setContactModal({ open: false, contact: null })}
            contact={contactModal.contact}
          />
        </Suspense>
      )}

      {selectedOrderForFeedback && (
        <Suspense fallback={null}>
          <FeedbackModal
            isOpen
            order={selectedOrderForFeedback}
            existingFeedback={selectedOrderForFeedback.existing_feedback}
            onClose={() => setSelectedOrderForFeedback(null)}
            onSubmitted={() => { setSelectedOrderForFeedback(null); fetchOrders(); }}
          />
        </Suspense>
      )}
    </div>
  );
};

export default UserOrdersPage;
