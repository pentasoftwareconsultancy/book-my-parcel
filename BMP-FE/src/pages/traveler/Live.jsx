import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, Typography, Paper, Button, TextField, Alert } from '@mui/material';
import { verifyPickupOTP, verifyDropOTP } from '../../store/slices/deliverySlice';
import ApiService from '../../core/services/api.service';
import { getSocket } from '../../core/services/websocket.service';

const TravelerLive = () => {
  const { id } = useParams(); // booking UUID from route
  const dispatch = useDispatch();
  const lastSentRef = useRef(0);

  const [pickupOtp, setPickupOtp] = useState('');
  const [dropOtp, setDropOtp] = useState('');
  const [locationStatus, setLocationStatus] = useState('Starting…');
  const [error, setError] = useState(null);

  // Auto-start live location tracking on mount
  useEffect(() => {
    if (!id) return;
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported on this device');
      return;
    }

    const socket = getSocket();

    const joinRoom = () => {
      socket.emit('join-booking', id);
      console.log('🏠 [Live] Joined booking room:', id);
    };
    if (socket.connected) joinRoom();
    else socket.once('connect', joinRoom);

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Real-time socket emit (fast path — no DB)
        socket.emit('traveller-location', { bookingId: id, lat, lng });
        setLocationStatus(`📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`);

        // Persist to DB every 5s (slow path)
        const now = Date.now();
        if (now - lastSentRef.current > 5000) {
          lastSentRef.current = now;
          try {
            await ApiService.updateLocation({ booking_id: id, lat, lng });
          } catch (err) {
            console.error('❌ Location API failed:', err);
          }
        }
      },
      (err) => {
        console.error('❌ Geolocation error:', err);
        setLocationStatus('Location access denied or unavailable');
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      socket.off('connect', joinRoom);
    };
  }, [id]);

  const handleVerifyPickup = () => {
    if (id && pickupOtp) dispatch(verifyPickupOTP({ deliveryId: id, otp: pickupOtp }));
  };

  const handleVerifyDrop = () => {
    if (id && dropOtp) dispatch(verifyDropOTP({ deliveryId: id, otp: dropOtp }));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Live Delivery
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Live location status */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
        <Typography variant="caption" color="text.secondary">Live Location</Typography>
        <Typography fontSize={13} fontWeight={500}>{locationStatus}</Typography>
      </Paper>

      {/* Pickup OTP */}
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" mb={1}>Pickup Verification</Typography>
        <TextField
          fullWidth
          label="Pickup OTP"
          value={pickupOtp}
          onChange={(e) => setPickupOtp(e.target.value)}
          margin="normal"
          inputProps={{ maxLength: 6 }}
        />
        <Button variant="contained" onClick={handleVerifyPickup} sx={{ mt: 1 }}>
          Verify Pickup
        </Button>
      </Paper>

      {/* Drop OTP */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={1}>Drop Verification</Typography>
        <TextField
          fullWidth
          label="Drop OTP"
          value={dropOtp}
          onChange={(e) => setDropOtp(e.target.value)}
          margin="normal"
          inputProps={{ maxLength: 6 }}
        />
        <Button variant="contained" color="success" onClick={handleVerifyDrop} sx={{ mt: 1 }}>
          Verify Drop
        </Button>
      </Paper>
    </Box>
  );
};

export default TravelerLive;
