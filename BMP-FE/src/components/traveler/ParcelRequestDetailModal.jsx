import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import { FiMapPin, FiPackage, FiUser, FiPhone } from "react-icons/fi";
import ApiService from "../../core/services/api.service";
import { showSuccess, showError } from "../../core/utils/toast.util";
import { safeToFixed } from "../../core/utils/number.util";

const ParcelRequestDetailModal = ({ open, onClose, request, onAcceptSuccess }) => {
  const [accepting, setAccepting] = useState(false);

  // Cleanup when modal closes
  useEffect(() => {
    if (!open) {
      setAccepting(false);
    }
  }, [open]);

  if (!request) return null;

  const handleAccept = async () => {
    try {
      setAccepting(true);
      const response = await ApiService.acceptParcelRequest(request.id);

      if (response?.data?.success) {
        showSuccess("Request accepted successfully!");
        
        // Call success callback first
        if (onAcceptSuccess) {
          onAcceptSuccess(request.id);
        }
        
        // Close modal after a short delay to allow state updates
        setTimeout(() => {
          onClose();
        }, 100);
      } else {
        showError(response?.data?.message || "Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      showError(error.response?.data?.message || "Failed to accept request");
    } finally {
      // Reset accepting state after a delay to prevent state update on unmounted component
      setTimeout(() => {
        setAccepting(false);
      }, 200);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
          <Typography variant="h6" fontWeight={700}>
            Parcel Request Details
          </Typography>
          <Chip
            label={request.parcel_ref || `#${request.id?.slice(0, 8).toUpperCase()}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Match Info */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            flexWrap: "wrap",
          }}
        >
          {request.match_score && (
            <Chip
              label={`Match Score: ${request.match_score}%`}
              color="success"
              variant="outlined"
            />
          )}
          {request.detour_km !== undefined && (
            <Chip
              label={`Detour: ${safeToFixed(request.detour_km)} km`}
              color="primary"
              variant="outlined"
            />
          )}
          {request.detour_percentage !== undefined && (
            <Chip
              label={`${safeToFixed(request.detour_percentage)}% extra distance`}
              color="info"
              variant="outlined"
            />
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Pickup Address */}
        <Box sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <FiMapPin color="#2e7d32" size={20} />
            <Typography variant="subtitle1" fontWeight={600}>
              Pickup Location
            </Typography>
          </Box>
          <Box sx={{ pl: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {request.pickup_address?.address || "N/A"}
            </Typography>
          </Box>
        </Box>

        {/* Drop Address */}
        <Box sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <FiMapPin color="#d32f2f" size={20} />
            <Typography variant="subtitle1" fontWeight={600}>
              Drop Location
            </Typography>
          </Box>
          <Box sx={{ pl: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {request.drop_address?.address || "N/A"}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Parcel Details */}
        <Box sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <FiPackage color="#1976d2" size={20} />
            <Typography variant="subtitle1" fontWeight={600}>
              Parcel Information
            </Typography>
          </Box>
          <Box
            sx={{
              pl: 4,
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Weight
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {request.weight} kg
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Type
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {request.parcel_type || "Standard"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Price
              </Typography>
              <Typography variant="body2" fontWeight={600} color="success.main">
                ₹{request.price_quote || 0}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Distance
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {safeToFixed(request.distance_km)} km
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Customer Details */}
        {request.customer_name && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <FiUser color="#1976d2" size={20} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Customer Details
                </Typography>
              </Box>
              <Box sx={{ pl: 4 }}>
                <Typography variant="body2" fontWeight={600}>
                  {request.customer_name}
                </Typography>
                {request.customer_phone && (
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <FiPhone size={14} />
                    <Typography variant="body2" color="text.secondary">
                      {request.customer_phone.replace(/(\d{2})(\d{4})/, "XX-XXXX-")}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={accepting}>
          Close
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleAccept}
          disabled={accepting}
          sx={{ minWidth: 120 }}
        >
          {accepting ? <CircularProgress size={20} /> : "Accept Request"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ParcelRequestDetailModal;
