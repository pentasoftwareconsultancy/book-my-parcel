# Book My Parcel - Frontend

A modern React-based web application for the Book My Parcel logistics platform, connecting parcel senders with travelers for cost-effective delivery.

## 🚀 Features

### User Features
- **Parcel Request Management** - Multi-step form for creating parcel requests
- **Traveller Selection** - View and select from available travellers with route visualization
- **Real-time Tracking** - Live parcel tracking with map integration
- **Order Dashboard** - Comprehensive order management and history
- **Profile Management** - User profile with photo upload

### Traveller Features
- **Route Management** - Create and manage travel routes with map integration
- **Request Feed** - Real-time parcel requests matching your routes
- **Acceptance Management** - Accept/reject parcel requests
- **KYC Verification** - Complete KYC process with document upload
- **Delivery Management** - Track deliveries with OTP verification
- **Earnings Dashboard** - View earnings and delivery statistics

### Admin Features
- **User Management** - View and manage all users
- **KYC Approval** - Review and approve traveller KYC submissions
- **Booking Overview** - Monitor all bookings and transactions
- **Analytics Dashboard** - System-wide statistics and insights

### Real-time Features
- **WebSocket Integration** - Live updates for requests and acceptances
- **Push Notifications** - FCM-based notifications
- **Live Route Visualization** - Interactive maps with route geometry
- **Instant Status Updates** - Real-time booking status changes

## 🛠 Tech Stack

- **Framework:** React 18 with JSX
- **Build Tool:** Vite
- **State Management:** Redux Toolkit
- **Routing:** React Router v6
- **UI Library:** Material-UI (MUI)
- **Maps:** Leaflet with React-Leaflet
- **Real-time:** Socket.IO Client
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form
- **Validation:** Zod
- **Styling:** Tailwind CSS + MUI
- **Icons:** Lucide React, Material Icons

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see backend README)

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the frontend root directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api
VITE_BASE_URL=http://localhost:3000

# WebSocket URL (optional, defaults to VITE_BASE_URL)
VITE_WS_URL=http://localhost:3000

# Google Maps API Key (for map features)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Environment
VITE_NODE_ENV=development
```

### 3. Start Development Server

```bash
# Start Vite dev server
npm run dev
```

The application will start on `http://localhost:5173`

### 4. Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── common/      # Shared components (buttons, inputs, etc.)
│   │   ├── map/         # Map-related components
│   │   ├── modals/      # Modal dialogs
│   │   ├── parcel/      # Parcel-specific components
│   │   └── traveler/    # Traveller-specific components
│   ├── core/            # Core utilities and services
│   │   ├── common/      # Common utilities
│   │   ├── constants/   # App constants and configs
│   │   ├── hooks/       # Custom React hooks
│   │   ├── services/    # API and service layers
│   │   └── utils/       # Utility functions
│   ├── layouts/         # Page layouts
│   │   ├── PublicLayout.jsx
│   │   ├── UserLayout.jsx
│   │   ├── TravelerLayout.jsx
│   │   └── AdminLayout.jsx
│   ├── pages/           # Page components
│   │   ├── auth/        # Authentication pages
│   │   ├── user/        # User dashboard pages
│   │   ├── traveler/    # Traveller dashboard pages
│   │   ├── admin/       # Admin dashboard pages
│   │   └── public/      # Public pages (home, about, etc.)
│   ├── routes/          # Route configuration
│   │   └── AppRoutes.jsx
│   ├── store/           # Redux store
│   │   ├── slices/      # Redux slices
│   │   └── store.js     # Store configuration
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── .env                 # Environment variables
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Dependencies and scripts
```

## 🔑 Key Features Implementation

### Multi-step Parcel Request Form
- Step 1: Pickup details with address autocomplete
- Step 2: Delivery details with address autocomplete
- Step 3: Parcel details (weight, type, photos)
- Step 4: Partner selection from matched travellers
- Step 5: Review and submit

### Real-time Updates
```javascript
// WebSocket connection for live updates
import { socket } from './core/services/websocket.service';

// Listen for new requests
socket.on('new_request', (data) => {
  // Update UI with new request
});
```

### Map Integration
```javascript
// Interactive route visualization
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';

// Display route geometry
<MapContainer center={[lat, lng]} zoom={13}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <Polyline positions={routeCoordinates} />
</MapContainer>
```

### State Management
```javascript
// Redux Toolkit slices
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserOrders } from './store/slices/userSlice';

const orders = useSelector(state => state.user.orders);
const dispatch = useDispatch();
dispatch(fetchUserOrders());
```

## 🎨 Styling

The application uses a combination of:
- **Tailwind CSS** for utility-first styling
- **Material-UI** for component library
- **Custom CSS** for specific components

```jsx
// Example: Combining Tailwind with MUI
<Button 
  variant="contained" 
  className="bg-blue-600 hover:bg-blue-700 px-6 py-2"
>
  Submit
</Button>
```

## 🔐 Authentication Flow

1. User enters phone number
2. OTP sent to phone
3. User verifies OTP
4. JWT token stored in localStorage
5. Token included in all API requests via Axios interceptor

```javascript
// Axios interceptor for auth
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 🗺️ Routing Structure

```javascript
// Public routes
/                    - Home page
/login               - Login page
/signup              - Signup page
/about               - About page
/contact             - Contact page

// User routes (authenticated)
/user/dashboard      - User dashboard
/user/request        - Create parcel request
/user/orders         - Order history
/user/track/:id      - Track parcel

// Traveller routes (authenticated + KYC verified)
/traveler/dashboard  - Traveller dashboard
/traveler/routes     - Manage routes
/traveler/requests   - Available requests
/traveler/deliveries - Active deliveries

// Admin routes (authenticated + admin role)
/admin/dashboard     - Admin dashboard
/admin/users         - User management
/admin/kyc           - KYC approvals
/admin/bookings      - Booking management
```

## 🔄 Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Utilities
npm run clean        # Clean build artifacts
npm run format       # Format code with Prettier
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login and deploy
   vercel login
   vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel dashboard
   - Add environment variables from `.env`
   - Redeploy

3. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Netlify Deployment

1. **Build Settings**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   ```

2. **Environment Variables**
   - Add in Netlify dashboard under Site Settings > Environment Variables

### Manual Deployment

```bash
# Build the application
npm run build

# The dist/ folder contains the production build
# Upload dist/ contents to your web server
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5173
kill -9 <PID>
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### API Connection Issues
```bash
# Check backend is running
curl http://localhost:3000/

# Verify .env file exists and has correct API URL
cat .env | grep VITE_API_URL
```

### WebSocket Connection Issues
```bash
# Check WebSocket URL in .env
# Ensure backend WebSocket server is running
# Check browser console for connection errors
```

## 📊 Performance Optimization

- **Code Splitting** - Lazy loading for routes
- **Image Optimization** - Compressed images and lazy loading
- **Bundle Analysis** - Use `npm run build -- --analyze`
- **Caching** - Service worker for offline support
- **Memoization** - React.memo for expensive components

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Code Style

- Use functional components with hooks
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful component names
- Add PropTypes or TypeScript types
- Document complex logic with comments

## 🆘 Support

For issues and questions:
- Check existing GitHub issues
- Create a new issue with detailed description
- Include error messages and screenshots
- Provide steps to reproduce

## 📄 License

This project is licensed under the ISC License.

## 🔄 Version History

- **v1.0.0** - Initial release
  - User parcel request flow
  - Traveller route management
  - Real-time matching system
  - Admin dashboard
  - Map integration
  - WebSocket support
