import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Alert,
  TextField,
  Grid
} from '@mui/material';
import { 
  verifyPickupOTP, 
  verifyDropOTP, 
  updateLocation 
} from '../../store/slices/deliverySlice';
import trackingService from '../../services/trackingService';

const TravelerLive = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentDelivery, loading, error } = useSelector(state => state.deliveries);
  
  const [pickupOtp, setPickupOtp] = useState('');
  const [dropOtp, setDropOtp] = useState('');
  const [location, setLocation] = useState({ lat: '', lng: '' });
  
  const handleVerifyPickup = () => {
    if (id && pickupOtp) {
      dispatch(verifyPickupOTP({ deliveryId: id, otp: pickupOtp }));
    }
  };
  
  const handleVerifyDrop = () => {
    if (id && dropOtp) {
      dispatch(verifyDropOTP({ deliveryId: id, otp: dropOtp }));
    }
  };
  
  const handleUpdateLocation = () => {
    if (id && location.lat && location.lng) {
      // Send location update via WebSocket
      trackingService.sendLocationUpdate({
        deliveryId: id,
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng),
        timestamp: new Date()
      });
      
      // Also update location in backend
      dispatch(updateLocation({ 
        deliveryId: id, 
        lat: parseFloat(location.lat), 
        lng: parseFloat(location.lng) 
      }));
    }
  };
  
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString()
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };
  
  // Connect to tracking service when component mounts
  useEffect(() => {
    trackingService.connect();
    
    return () => {
      trackingService.disconnect();
    };
  }, []);
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Live Delivery Tracking
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {currentDelivery && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Delivery status: {currentDelivery.status}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Pickup Verification */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pickup Verification
            </Typography>
            <TextField
              fullWidth
              label="Pickup OTP"
              value={pickupOtp}
              onChange={(e) => setPickupOtp(e.target.value)}
              margin="normal"
            />
            <Button
              variant="contained"
              onClick={handleVerifyPickup}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              Verify Pickup
            </Button>
          </Paper>
        </Grid>
        
        {/* Drop Verification */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Drop Verification
            </Typography>
            <TextField
              fullWidth
              label="Drop OTP"
              value={dropOtp}
              onChange={(e) => setDropOtp(e.target.value)}
              margin="normal"
            />
            <Button
              variant="contained"
              onClick={handleVerifyDrop}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              Verify Drop
            </Button>
          </Paper>
        </Grid>
        
        {/* Location Update */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Location Update
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  label="Latitude"
                  value={location.lat}
                  onChange={(e) => setLocation(prev => ({ ...prev, lat: e.target.value }))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  label="Longitude"
                  value={location.lng}
                  onChange={(e) => setLocation(prev => ({ ...prev, lng: e.target.value }))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleGetCurrentLocation}
                  sx={{ height: 56, mb: 1 }}
                >
                  Current
                </Button>
              </Grid>
            </Grid>
            <Button
              variant="contained"
              onClick={handleUpdateLocation}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              Update Location
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TravelerLive;