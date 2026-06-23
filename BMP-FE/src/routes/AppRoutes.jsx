import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import RoutePath from "../core/constants/routes.constant";
import ProtectedRoute from "./ProtectedRoute";
import { USER_ROLES } from "../core/constants/app.constant";
import ErrorBoundary from "../components/common/ErrorBoundary";
import TravellerSearchPage from "../pages/user/TravellerSearchPage";

// ─── Layouts ──────────────────────────────────────────────────────────────────
const PublicLayout   = lazy(() => import('../layouts/PublicLayout'));
const UserLayout     = lazy(() => import('../layouts/UserLayout'));
const TravelerLayout = lazy(() => import('../layouts/TravelerLayout'));
const AdminLayout    = lazy(() => import('../layouts/AdminLayout'));

// ─── Lazy loaded pages ────────────────────────────────────────────────────────

// Utility
const ScrollToTop = lazy(() => import("../pages/ScrollToTop"));

// Public pages
const Home               = lazy(() => import("../pages/public/Home"));
const About              = lazy(() => import("../pages/public/About"));
const Services           = lazy(() => import("../pages/public/Services"));
const Contact            = lazy(() => import("../pages/public/Contact"));
const TermsAndCondition  = lazy(() => import("../pages/public/TermsAndCondition"));
const TravelerBenefits   = lazy(() => import("../pages/public/TravelerBenefits"));
const TravelerHomes      = lazy(() => import("../pages/traveler/TravelerHome"));
const TravelerGuidelines = lazy(() => import("../pages/public/TravelerGuidelines"));
const Policy             = lazy(() => import("../pages/public/Policy"));
const RefundPolicy       = lazy(() => import("../pages/public/RefundPolicy"));
const CompanyPrivacy     = lazy(() => import("../pages/public/CompanyPrivacy"))

// Auth pages
const Login          = lazy(() => import("../pages/auth/Login"));
const Register       = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));

// Route wizard pages (multi-step form)
const TravelRoute  = lazy(() => import("../pages/traveler/route/TravelRoute"));
const TravelRoute2 = lazy(() => import("../pages/traveler/route/TravelRoute2"));
const TravelRoute3 = lazy(() => import("../pages/traveler/route/TravelRoute3"));

// User pages
const UserDashboard           = lazy(() => import("../pages/user/UserDashboard"));
const UserBookingConfirmation = lazy(() => import("../pages/user/UserBookingConfirmation"));
const BookingCancel           = lazy(() => import("../pages/user/BookingCancle"));   // filename kept, alias corrected
const DisputePage             = lazy(() => import("../pages/user/Disputepage"));
const UserProfile             = lazy(() => import("../pages/user/Profile"));
const UserNotification        = lazy(() => import("../pages/user/UserNotification"));
const Track                   = lazy(() => import("../pages/user/Track"));
const RequestFormPage         = lazy(() => import("../pages/user/requestform/RequestFormPage"));
const UserDetailsPage         = lazy(() => import("../pages/user/UserDetailsPage"));
const FeedbackPage            = lazy(() => import("../pages/user/Feedbackpage"));

// Traveler pages
const TravelerDashboard    = lazy(() => import("../pages/traveler/TravelerDashboard"));
const TravelerLive         = lazy(() => import("../pages/traveler/Live"));
const TravelerPickupOTP    = lazy(() => import("../pages/traveler/PickupOTP"));
const TravelerDropOTP      = lazy(() => import("../pages/traveler/DropOTP"));
const TravelerTrack        = lazy(() => import("../pages/traveler/Track"));
const TravelerProfile      = lazy(() => import("../pages/traveler/Profile"));
const TravelerKYCPending   = lazy(() => import("../pages/traveler/KYCPending"));
const KYCUpload            = lazy(() => import("../components/KYCUpload"));
const TravellerDetailsPage = lazy(() => import("../pages/traveler/TravellerDetailsPage"));
const MyRoutes             = lazy(() => import("../pages/traveler/MyRouts"));          // filename kept, alias corrected
const TravelerNotifications    = lazy(() => import("../pages/traveler/TravelerNotifications"));
const TravellerDisputepage     = lazy(() => import("../pages/traveler/TravellerDisputepage"));
const Earnings                 = lazy(() => import("../pages/traveler/kyc/Earnings"));
const RouteDetails             = lazy(() => import("../pages/traveler/route/RouteDetails"));

// Admin pages
const AdminOverview      = lazy(() => import("../pages/admin/AdminOverview"));
const UserManagement     = lazy(() => import("../pages/admin/UserManagement"));
const TravelerApproval   = lazy(() => import("../pages/admin/TravelerApproval"));
const Bookings           = lazy(() => import("../pages/admin/Bookings"));
const Payments           = lazy(() => import("../pages/admin/Payments"));
const AdminDisputes      = lazy(() => import("../pages/admin/Disputes"));
const AdminSettings      = lazy(() => import("../pages/admin/Settings"));
const AdminAnalytics     = lazy(() => import("../pages/admin/Analytics"));
const UserDetails        = lazy(() => import("../pages/admin/UserDetails"));
const TravelerDetails    = lazy(() => import("../pages/admin/TravelerDetails"));
const DetailsOverview    = lazy(() => import("../pages/admin/userdetails/DetailsOverview"));
const DetailsBookings    = lazy(() => import("../pages/admin/userdetails/DetailsBookings"));
const AdminProfile       = lazy(() => import("../pages/admin/Profile"));
const AdminNotifications = lazy(() => import("../pages/admin/AdminNotifications"));

// KYC
const KycPage = lazy(() => import("../pages/KycPage"));

// Other
const Unauthorized = lazy(() => import("../pages/Unauthorized"));

// ─── Loading Fallbacks ────────────────────────────────────────────────────────
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="text-center">
      <div className="inline-block w-12 h-12 mb-4 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin" />
      <p className="font-medium text-gray-600">Loading...</p>
    </div>
  </div>
);

const PageFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="inline-block w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin" />
  </div>
);

// ─── S: Suspense + ErrorBoundary per route ────────────────────────────────────
// Each lazy route is wrapped in both Suspense (loading state) and ErrorBoundary
// (runtime error isolation). A crash in one page no longer takes down the app.
const S = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<PageFallback />}>{children}</Suspense>
  </ErrorBoundary>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ScrollToTop />
      <Routes>
        <Route path={RoutePath.AUTH_LOGIN}          element={<S><Login /></S>} />
        <Route path={RoutePath.AUTH_REGISTER}        element={<S><Register /></S>} />
        <Route path={RoutePath.AUTH_FORGOT_PASSWORD} element={<S><ForgotPassword /></S>} />

        {/* ── Public routes ── */}
        <Route path={RoutePath.PUBLIC_HOME} element={<PublicLayout />}>
          <Route index                                      element={<S><Home /></S>} />
          <Route path={RoutePath.PUBLIC_TRAVELER_HOME}      element={<S><TravelerHomes /></S>} />
          <Route path={RoutePath.TravelerGuidelinese}       element={<S><TravelerGuidelines /></S>} />
          <Route path={RoutePath.PUBLIC_ABOUT}              element={<S><About /></S>} />
          <Route path={RoutePath.PUBLIC_SERVICES}           element={<S><Services /></S>} />
          <Route path={RoutePath.PUBLIC_CONTACT}            element={<S><Contact /></S>} />
          <Route path={RoutePath.PUBLIC_TRAVELERBENEFITS}   element={<S><TravelerBenefits /></S>} />
          <Route path={RoutePath.PUBLIC_TERMSANDCONDITION}  element={<S><TermsAndCondition /></S>} />
          <Route path={RoutePath.PUBLIC_POLICY}             element={<S><Policy /></S>} />
          <Route path={RoutePath.PUBLIC_COMPANY_PRIVACY}    element={<S><CompanyPrivacy /></S>} />

          <Route path={RoutePath.PUBLIC_REFUND_POLICY}      element={<S><RefundPolicy /></S>} />
          <Route path={RoutePath.KYC_REGISTRATION}          element={<S><KYCUpload /></S>} />
          <Route path={RoutePath.PUBLIC_TRACK}              element={<S><Track /></S>} />
        </Route>

        {/* ── User routes ── */}
        <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.INDIVIDUAL]} />}>
          <Route path={RoutePath.USER_BASE} element={<UserLayout />}>
            <Route index                                       element={<S><UserDashboard /></S>} />
            <Route path={RoutePath.USER_ALL_ORDERS}            element={<S><UserDashboard /></S>} />
            <Route path={RoutePath.USER_ACTIVE}                element={<S><UserDashboard /></S>} />
            <Route path={RoutePath.USER_COMPLETED}             element={<S><UserDashboard /></S>} />
            <Route path={RoutePath.USER_CANCELLED}             element={<S><UserDashboard /></S>} />
            <Route path={RoutePath.USER_TRACK_PARCEL}          element={<S><Track /></S>} />
            <Route path={RoutePath.USER_BOOKING_CONFIRMATION}  element={<S><UserBookingConfirmation /></S>} />
            <Route path={RoutePath.USER_PROFILE}               element={<S><UserProfile /></S>} />
            <Route path={RoutePath.USER_NOTIFICATIONS}         element={<S><UserNotification /></S>} />
            <Route path={RoutePath.USER_PARCEL_DETAILS}        element={<S><UserDetailsPage /></S>} />
            <Route path={RoutePath.USER_REQUEST_FORM}          element={<S><RequestFormPage /></S>} />
            <Route path={RoutePath.USER_BOOKING_CANCLE}        element={<S><BookingCancel /></S>} />
            <Route path={RoutePath.USER_DISPUTE}               element={<S><DisputePage /></S>} />
            <Route path={RoutePath.USER_FEEDBACK}              element={<S><FeedbackPage /></S>} />
            <Route path={RoutePath.USER_TRAVELLER_SEARCH}      element={<S><TravellerSearchPage /></S>} />
          </Route>
        </Route>

        {/* ── Traveller routes ── */}
        <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.TRAVELLER]} />}>
          <Route path={RoutePath.TRAVELLER_ROUTE_DETAILS} element={<S><RouteDetails /></S>} />
          <Route path={RoutePath.TRAVELER_PROFILE}        element={<S><TravelerProfile /></S>} />

          <Route path={RoutePath.TRAVELER_BASE} element={<TravelerLayout />}>
            <Route index                                          element={<S><TravelerDashboard /></S>} />
            <Route path={RoutePath.TRAVELER_DASHBOARD}            element={<S><TravelerDashboard /></S>} />
            <Route path={RoutePath.TRAVELER_AVAILABLE_REQUEST}    element={<S><TravelerDashboard /></S>} />
            <Route path={RoutePath.TRAVELER_LIVE}                 element={<S><TravelerLive /></S>} />
            <Route path={RoutePath.TRAVELER_PICKUP_OTP}           element={<S><TravelerPickupOTP /></S>} />
            <Route path={RoutePath.TRAVELER_DROP_OTP}             element={<S><TravelerDropOTP /></S>} />
            <Route path={RoutePath.TRAVELER_DELIVERIES}           element={<S><TravelerDashboard /></S>} />
            <Route path={RoutePath.TRAVELER_COMPLETED}            element={<S><TravelerDashboard /></S>} />
            <Route path={RoutePath.TRAVELER_TRACK}                element={<S><TravelerTrack /></S>} />
            <Route path={RoutePath.TRAVELER_KYC_PENDING}          element={<S><TravelerKYCPending /></S>} />
            <Route path={RoutePath.TRAVELER_CANCELLED}            element={<S><TravelerDashboard /></S>} />
            <Route path={RoutePath.TRAVELER_PARCEL_DETAILS}       element={<S><TravellerDetailsPage /></S>} />
            <Route path={RoutePath.TRAVELER_MYROUTES}             element={<S><MyRoutes /></S>} />
            <Route path={RoutePath.TRAVELLER_EARNINGS}            element={<S><Earnings /></S>} />
            <Route path={RoutePath.TRAVELLER_NOTIFICATIONS}       element={<S><TravelerNotifications /></S>} />
            <Route path={RoutePath.TRAVELLER_DISPUTE}             element={<S><DisputePage /></S>} />
          </Route>

          <Route path={RoutePath.TRAVELLER_ROUTE}  element={<S><TravelRoute /></S>} />
          <Route path={RoutePath.TRAVELLER_ROUTE2} element={<S><TravelRoute2 /></S>} />
          <Route path={RoutePath.TRAVELLER_ROUTE3} element={<S><TravelRoute3 /></S>} />
        </Route>

        {/* ── Admin routes ── */}
        <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} />}>
          <Route path={RoutePath.ADMIN_BASE} element={<AdminLayout />}>
            <Route index                                          element={<S><AdminOverview /></S>} />
            <Route path={RoutePath.ADMIN_OVERVIEW}                element={<S><AdminOverview /></S>} />
            <Route path={RoutePath.ADMIN_USERMANAGEMENT}          element={<S><UserManagement /></S>} />
            <Route path={RoutePath.ADMIN_TRAVELER}                element={<S><TravelerApproval /></S>} />
            <Route path={RoutePath.ADMIN_BOOKINGS}                element={<S><Bookings /></S>} />
            <Route path={RoutePath.ADMIN_PAYMENTS}                element={<S><Payments /></S>} />
            <Route path={RoutePath.ADMIN_DISPUTES}                element={<S><AdminDisputes /></S>} />
            <Route path={RoutePath.ADMIN_ANALYTICS}               element={<S><AdminAnalytics /></S>} />
            <Route path={RoutePath.ADMIN_USERDETAILS}             element={<S><UserDetails /></S>} />
            <Route path={RoutePath.ADMIN_TRAVELERDETAILS}         element={<S><TravelerDetails /></S>} />
            <Route path={RoutePath.ADMIN_BOOKING_DETAILS}         element={<S><DetailsBookings /></S>} />
            <Route path={RoutePath.ADMIN_USERDETAILS_OVERVIEW}    element={<S><DetailsOverview /></S>} />
            <Route path={RoutePath.ADMIN_SETTINGS}                element={<S><AdminSettings /></S>} />
            <Route path={RoutePath.ADMIN_PROFILE}                 element={<S><AdminProfile /></S>} />
            <Route path={RoutePath.ADMIN_NOTIFICATIONS}           element={<S><AdminNotifications /></S>} />
          </Route>
        </Route>

        {/* ── KYC routes ── */}
        <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.INDIVIDUAL, USER_ROLES.TRAVELLER]} />}>
          <Route path={RoutePath.KYC_PAN}     element={<S><KycPage /></S>} />
          <Route path={RoutePath.KYC_AADHAAR} element={<S><KycPage /></S>} />
          <Route path={RoutePath.KYC_BANK}    element={<S><KycPage /></S>} />
        </Route>

        <Route path={RoutePath.UNAUTHORIZED} element={<S><Unauthorized /></S>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
