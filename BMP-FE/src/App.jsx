import { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { store } from './store/store';
import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from '@mui/material/styles';
import theme from './core/theme/theme';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { connectSocket, disconnectSocket } from './core/services/websocket.service';
import { useSessionTimeout } from './core/hooks/useSessionTimeout';

/**
 * AppContent — rendered inside <Provider> so it has access to the Redux store.
 *
 * Socket lifecycle:
 *   - Connect when the user becomes authenticated (login, page refresh with valid token).
 *   - Disconnect when the user logs out (isAuthenticated flips to false).
 *   - The effect re-runs whenever isAuthenticated changes, so a login that happens
 *     after the initial mount is handled correctly.
 *
 * Previously this logic lived in the outer <App> component which used
 * store.getState() once at mount time — meaning a login after mount never
 * triggered a socket connection.
 */
const AppContent = () => {
  useSessionTimeout();

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      try {
        connectSocket();
      } catch (error) {
        console.error('[WebSocket] Connection failed — real-time features unavailable:', error.message);
      }
    } else {
      // User logged out — clean up the socket so the next login gets a fresh
      // authenticated connection (new token in the auth header).
      disconnectSocket();
    }

    // No cleanup return here: disconnectSocket is called explicitly above when
    // isAuthenticated becomes false. Returning disconnectSocket from the effect
    // would disconnect on every re-render, not just on logout.
  }, [isAuthenticated]);

  return (
    <>
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
};

export default App;
