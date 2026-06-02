# Book My Parcel — Frontend

> **Live:** [https://bookmyparcel.co.in](https://bookmyparcel.co.in)

A React 19 web application for the **Book My Parcel** logistics platform — connecting parcel senders with travellers for affordable, peer-to-peer delivery across India.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + JSX |
| Build Tool | Vite 7 |
| State Management | Redux Toolkit 2 |
| Routing | React Router v7 |
| UI Library | Material-UI (MUI) v6 |
| Maps | Google Maps JS API + Leaflet / React-Leaflet |
| Real-time | Socket.IO Client v4 |
| HTTP Client | Axios |
| Forms | React Hook Form + Yup |
| Charts | Chart.js, Recharts |
| Auth (Social) | Firebase v11 (Google OAuth) |
| Notifications | Firebase FCM |
| Animations | Framer Motion |
| PDF Export | jsPDF |
| Styling | Tailwind CSS v3 + MUI Emotion |
| Icons | Lucide React, React Icons, MUI Icons |
| Testing | Vitest + Testing Library |

---

## Features

### User (Sender)
- Multi-step parcel request form (pickup → delivery → parcel details → partner selection → review)
- Real-time traveller matching with route visualization
- Live parcel tracking with map
- Order dashboard (active, completed, cancelled)
- Booking cancellation and dispute filing
- Feedback and ratings
- Profile management with photo upload
- Push notifications (FCM) + in-app notifications

### Traveller
- Multi-step route creation wizard with Google Maps integration
- Real-time parcel request feed matching your route
- Accept / reject requests
- OTP-based pickup and drop verification
- KYC verification (PAN, Aadhaar, Bank)
- Earnings dashboard
- Dispute management
- My Routes management

### Admin
- Overview dashboard with analytics
- User and traveller management
- KYC approval workflow
- Bookings and payments monitoring
- Dispute resolution
- Platform settings
- Notifications management

### Platform-wide
- Google OAuth login via Firebase
- JWT-based session management with auto-timeout
- WebSocket real-time updates (requests, acceptances, status changes)
- Role-based access control (Individual / Traveller / Admin)
- Lazy-loaded routes with error boundaries
- Optimized production bundle with manual chunk splitting

---

## Prerequisites

- Node.js v18+
- npm or yarn
- Backend API running (see `BMP-Backend/`)

---

## Quick Start

```bash
# 1. Install dependencies
cd BMP-FE
npm install

# 2. Configure environment
cp .env.example .env   # then fill in values (see below)

# 3. Start dev server
npm run dev
# → http://localhost:5173
```

---

## Environment Variables

Create a `.env` file in `BMP-FE/`:

```env
# Backend
VITE_API_URL=http://localhost:3000/api
VITE_BASE_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_key
VITE_GOOGLE_MAPS_JAVASCRIPT_API=your_key
VITE_GOOGLE_PLACES_API=your_key
VITE_GOOGLE_GEOCODING_API=your_key
VITE_GOOGLE_ROUTES_API=your_key
VITE_GOOGLE_DIRECTION_API=your_key
VITE_GOOGLE_DISTANCE_MATRIX_API=your_key
VITE_GOOGLE_GEOLOCATION_KEY=your_key

# Firebase (Google OAuth + FCM)
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## Scripts

```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Production build → dist/
npm run preview      # Preview production build locally
npm run lint         # ESLint
npm test             # Vitest
npm run test:watch   # Vitest watch mode
npm run test:coverage # Coverage report
```

---

## Project Structure

```
BMP-FE/
├── public/                  # Static assets
└── src/
    ├── components/
    │   ├── common/          # Shared UI (buttons, inputs, error boundary, etc.)
    │   ├── map/             # Map components
    │   ├── modals/          # Modal dialogs
    │   ├── parcel/          # Parcel-specific components
    │   └── traveler/        # Traveller-specific components
    ├── core/
    │   ├── constants/       # Route paths, app constants, roles
    │   ├── hooks/           # Custom hooks (useSessionTimeout, etc.)
    │   ├── services/        # Axios instance, WebSocket service
    │   ├── theme/           # MUI theme
    │   └── utils/           # Utility functions
    ├── firebase/            # Firebase config and auth helpers
    ├── layouts/             # PublicLayout, UserLayout, TravelerLayout, AdminLayout
    ├── pages/
    │   ├── auth/            # Login, Register, ForgotPassword
    │   ├── public/          # Home, About, Services, Contact, Terms, Policy, etc.
    │   ├── user/            # User dashboard, request form, tracking, orders
    │   ├── traveler/        # Traveller dashboard, routes, deliveries, KYC, earnings
    │   └── admin/           # Admin overview, user mgmt, KYC approval, bookings
    ├── routes/
    │   ├── AppRoutes.jsx    # All route definitions (lazy-loaded)
    │   └── ProtectedRoute.jsx
    ├── store/
    │   ├── slices/          # Redux slices (auth, user, traveller, etc.)
    │   └── store.js
    ├── App.jsx              # Root component (Redux Provider, MUI Theme, Socket lifecycle)
    └── main.jsx             # Entry point
```

---

## Routing Structure

```
/                          Home
/about                     About
/services                  Services
/contact                   Contact
/traveler-home             Traveller landing
/traveler-guidelines       Traveller guidelines
/traveler-benefits         Traveller benefits
/terms                     Terms & Conditions
/policy                    Privacy Policy
/refund-policy             Refund Policy
/track                     Public parcel tracking
/login                     Login
/register                  Register
/forgot-password           Forgot Password

/user/*                    User dashboard (role: INDIVIDUAL)
  /user/                   Dashboard (all orders)
  /user/request            Create parcel request
  /user/track/:id          Track parcel
  /user/profile            Profile
  /user/notifications      Notifications

/traveler/*                Traveller dashboard (role: TRAVELLER)
  /traveler/               Dashboard
  /traveler/requests       Available requests
  /traveler/deliveries     Active deliveries
  /traveler/my-routes      My routes
  /traveler/earnings       Earnings
  /traveler/profile        Profile
  /traveler/notifications  Notifications

/admin/*                   Admin panel (role: ADMIN)
  /admin/                  Overview
  /admin/users             User management
  /admin/traveler          KYC approvals
  /admin/bookings          Bookings
  /admin/payments          Payments
  /admin/disputes          Disputes
  /admin/analytics         Analytics
  /admin/settings          Platform settings
```

---

## Authentication Flow

1. Phone/email + password login **or** Google OAuth (Firebase)
2. JWT token stored in `localStorage`
3. Axios interceptor attaches `Authorization: Bearer <token>` to every request
4. Session auto-timeout via `useSessionTimeout` hook
5. On logout: token blacklisted on backend, Redux state cleared, socket disconnected

---

## Real-time (WebSocket)

Socket connects on login and disconnects on logout. Key events:

```js
// Traveller receives new matching request
socket.on('new_request', handler);

// User receives acceptance update
socket.on('request_accepted', handler);

// Live status changes
socket.on('booking_status_update', handler);
```

---

## Production Build

The Vite config splits the bundle into named chunks for optimal caching:

| Chunk | Contents |
|---|---|
| `vendor-react` | react, react-dom, react-router-dom |
| `vendor-redux` | @reduxjs/toolkit, react-redux |
| `vendor-mui` | MUI, Emotion |
| `vendor-maps` | Google Maps, Leaflet |
| `vendor-charts` | Chart.js, Recharts |
| `vendor-socket` | socket.io-client |
| `vendor-pdf` | jsPDF |
| `vendor-animation` | Framer Motion |
| `vendor-utils` | axios, react-hook-form, yup, react-toastify |

---

## Deployment

### Vercel (live at [bookmyparcel.co.in](https://bookmyparcel.co.in))

```bash
npm install -g vercel
vercel login
vercel --prod
```

Build settings:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

Add all `VITE_*` environment variables in the Vercel dashboard.

### Netlify

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
```

### Manual

```bash
npm run build
# Upload dist/ to your web server / CDN
```

---

## Troubleshooting

**Port in use**
```bash
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Clear cache**
```bash
rm -rf node_modules/.vite
npm run dev
```

**API not connecting** — verify `VITE_API_URL` in `.env` and that the backend is running on port 3000.

**Google login fails** — ensure `FIREBASE_SERVICE_ACCOUNT_KEY` in the backend `.env` is a single-line JSON string (no line breaks inside the value).

---

## License

ISC
