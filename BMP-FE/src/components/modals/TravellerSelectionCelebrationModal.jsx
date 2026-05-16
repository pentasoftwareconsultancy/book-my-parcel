import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Divider,
  Chip,
  Avatar,
} from '@mui/material';
import { FiPackage, FiMapPin, FiCalendar, FiDollarSign, FiCheckCircle, FiUser, FiStar, FiTruck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import RoutePath from '../../core/constants/routes.constant';
import Confetti from '../common/Confetti';

const TravellerSelectionCelebrationModal = ({ open, onClose, bookingData }) => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
    }
  }, [open]);

  const handleViewBooking = () => {
    onClose();
    navigate(RoutePath.TRAVELER_DELIVERIES);
  };

  const handleClose = () => {
    setShowConfetti(false);
    onClose();
  };

  if (!bookingData) return null;

  return (
    <>
      {showConfetti && <Confetti duration={4000} onComplete={() => setShowConfetti(false)} />}
      
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'visible',
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {/* Success Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              p: 4,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Animated circles background */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 150,
                height: 150,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)', opacity: 0.5 },
                  '50%': { transform: 'scale(1.1)', opacity: 0.3 },
                },
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                animation: 'pulse 2s ease-in-out infinite 0.5s',
              }}
            />

            {/* Success Icon */}
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                margin: '0 auto 16px',
                animation: 'bounce 1s ease-in-out',
                '@keyframes bounce': {
                  '0%, 100%': { transform: 'translateY(0)' },
                  '50%': { transform: 'translateY(-10px)' },
                },
              }}
            >
              <FiCheckCircle size={40} color="white" />
            </Avatar>

            <Typography
              variant="h4"
              sx={{
                color: 'white',
                fontWeight: 700,
                mb: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              🎉 Congratulations!
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.95)',
                fontWeight: 500,
              }}
            >
              {bookingData.isSelection 
                ? "You've been selected for delivery!" 
                : "Booking confirmed successfully!"
              }
            </Typography>
          </Box>

          {/* Booking Details */}
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                bgcolor: '#f8f9fa',
                borderRadius: 2,
                p: 2,
                mb: 3,
                border: '2px dashed #667eea',
              }}
            >
              {/* Show both IDs when booking is confirmed */}
              {!bookingData.isSelection && bookingData.booking_ref && bookingData.parcel_ref ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                    >
                      Booking ID
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50', fontSize: '0.9rem' }}>
                      {bookingData.booking_ref}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                    >
                      Parcel ID
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea', fontSize: '0.9rem' }}>
                      {bookingData.parcel_ref}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                /* Show single ID for selection or when only one ID is available */
                <>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                  >
                    {bookingData.isSelection ? "Parcel ID" : "Booking ID"}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>
                    {bookingData.isSelection 
                      ? (bookingData.parcel_ref || bookingData.parcel_id || 'BMP-001')
                      : (bookingData.booking_ref || bookingData.booking_id || 'IND091-001')
                    }
                  </Typography>
                </>
              )}
              
              {bookingData.isSelection && (
                <Typography
                  variant="caption"
                  sx={{ 
                    color: 'orange', 
                    display: 'block', 
                    mt: 1,
                    fontWeight: 600
                  }}
                >
                  ⏳ Waiting for payment confirmation...
                </Typography>
              )}
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
              Delivery Details
            </Typography>

            {/* Pickup Location */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: '#e8f5e9', width: 40, height: 40 }}>
                <FiMapPin size={20} color="#4caf50" />
              </Avatar>
              <Box flex={1}>
                <Typography variant="caption" color="text.secondary">
                  Pickup Location
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {bookingData.pickup_address?.city || 'Pickup Location'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {bookingData.pickup_address?.address_line1 || ''}
                </Typography>
              </Box>
            </Box>

            {/* Drop Location */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: '#ffebee', width: 40, height: 40 }}>
                <FiMapPin size={20} color="#f44336" />
              </Avatar>
              <Box flex={1}>
                <Typography variant="caption" color="text.secondary">
                  Drop Location
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {bookingData.drop_address?.city || 'Drop Location'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {bookingData.drop_address?.address_line1 || ''}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Assigned Traveller */}
            {bookingData.traveller && (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>
                  Assigned Traveller
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#f0fdf4', borderRadius: 2, p: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#047857', width: 44, height: 44, fontWeight: 700 }}>
                    {bookingData.traveller.name?.[0]?.toUpperCase() || <FiUser />}
                  </Avatar>
                  <Box flex={1}>
                    <Typography fontWeight={700} fontSize={15}>{bookingData.traveller.name}</Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 0.5 }}>
                      {bookingData.traveller.phone && (
                        <Typography variant="caption" color="text.secondary">
                          📞 {bookingData.traveller.phone}
                        </Typography>
                      )}
                      {bookingData.traveller.rating && (
                        <Typography variant="caption" color="text.secondary">
                          ⭐ {bookingData.traveller.rating}
                        </Typography>
                      )}
                      {bookingData.traveller.vehicle && (
                        <Typography variant="caption" color="text.secondary">
                          🚗 {bookingData.traveller.vehicle}{bookingData.traveller.vehicleNumber ? ` (${bookingData.traveller.vehicleNumber})` : ''}
                        </Typography>
                      )}
                      {bookingData.traveller.totalDeliveries > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          📦 {bookingData.traveller.totalDeliveries} deliveries
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
              </>
            )}

            {/* Additional Info */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FiPackage size={16} color="#666" />
                <Typography variant="body2" color="text.secondary">
                  {bookingData.parcel?.weight || 'N/A'} kg
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FiCalendar size={16} color="#666" />
                <Typography variant="body2" color="text.secondary">
                  {bookingData.pickup_date
                    ? new Date(bookingData.pickup_date).toLocaleDateString()
                    : 'TBD'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FiDollarSign size={16} color="#666" />
                <Typography variant="body2" fontWeight={700} color="success.main">
                  ₹{bookingData.final_price || bookingData.price || 0}
                </Typography>
              </Box>
            </Box>

            {/* Status Chip */}
            <Chip
              label={bookingData.isSelection ? "Selected - Awaiting Payment" : "Booking Confirmed"}
              color={bookingData.isSelection ? "warning" : "success"}
              sx={{
                width: '100%',
                fontWeight: 600,
                py: 2,
                fontSize: '0.875rem',
              }}
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleClose}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleViewBooking}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                  },
                }}
              >
                View My Deliveries
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TravellerSelectionCelebrationModal;
