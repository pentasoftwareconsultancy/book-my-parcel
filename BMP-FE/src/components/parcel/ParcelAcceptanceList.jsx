import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Chip,
  Rating,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { FiTruck, FiUser, FiClock, FiMapPin } from "react-icons/fi";
import ApiService from "../../core/services/api.service";
import { showSuccess, showError, showInfo } from "../../core/utils/toast.util";
import RoutePath from "../../core/constants/routes.constant";
import { getSocket } from "../../core/services/websocket.service";
import { safeToFixed } from "../../core/utils/number.util";

const ParcelAcceptanceList = ({ parcelId }) => {
  const navigate = useNavigate();
  const [acceptances, setAcceptances] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAcceptance, setSelectedAcceptance] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [sortBy, setSortBy] = useState("detour");
  const [parcelData, setParcelData] = useState(null);
  const [sortLoading, setSortLoading] = useState(false);
  const [animatingCards, setAnimatingCards] = useState(new Set());

  useEffect(() => {
    if (!parcelId) return;
    fetchAcceptances();

    // WebSocket: Join parcel room and listen for new acceptances
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('join-parcel', parcelId);
      
      const handleNewAcceptance = (data) => {
        console.log('New acceptance received:', data);
        
        // Show toast notification
        showInfo(`New traveller is interested! Check below.`);
        
        // Add animation to the new card
        if (data.traveller_id) {
          setAnimatingCards(prev => new Set([...prev, data.traveller_id]));
          
          // Remove animation after 2 seconds
          setTimeout(() => {
            setAnimatingCards(prev => {
              const newSet = new Set(prev);
              newSet.delete(data.traveller_id);
              return newSet;
            });
          }, 2000);
        }
        
        // Refresh the acceptance list
        fetchAcceptances();
      };

      socket.on('new_acceptance', handleNewAcceptance);

      // Cleanup
      return () => {
        socket.off('new_acceptance', handleNewAcceptance);
        socket.emit('leave-parcel', parcelId);
      };
    } else {
      console.log('WebSocket not available - real-time updates disabled');
    }
  }, [parcelId]);

  const fetchAcceptances = async (sort = sortBy) => {
    try {
      if (sort !== sortBy) {
        setSortLoading(true);
      } else {
        setLoading(true);
      }
      
      // Request both acceptances and pending requests
      const response = await ApiService.getParcelAcceptances(parcelId, sort, true);
      
      console.log('[ParcelAcceptanceList] API Response:', {
        acceptances: response?.data?.data?.acceptances,
        first_acceptance_route: response?.data?.data?.acceptances?.[0]?.route,
        first_acceptance_traveller: response?.data?.data?.acceptances?.[0]?.traveller
      });
      
      if (response?.data?.success) {
        const data = response.data.data;
        setAcceptances(data.acceptances || []);
        setPendingRequests(data.pending_requests || []);
        setParcelData(data);
      } else {
        setAcceptances([]);
        setPendingRequests([]);
      }
    } catch (error) {
      console.error("Error fetching acceptances:", error);
      showError("Failed to load traveller acceptances");
      setAcceptances([]);
      setPendingRequests([]);
    } finally {
      setLoading(false);
      setSortLoading(false);
    }
  };

  const handleSortChange = async (event, newSort) => {
    if (newSort && newSort !== sortBy) {
      setSortBy(newSort);
      await fetchAcceptances(newSort);
    }
  };

  const handleSelectClick = (acceptance) => {
    setSelectedAcceptance(acceptance);
    setConfirmDialogOpen(true);
  };

  const handleConfirmSelection = async () => {
    if (!selectedAcceptance) return;

    try {
      setSelecting(true);
      
      console.log('🎯 Selecting traveller from ParcelAcceptanceList:', {
        travellerId: selectedAcceptance.traveller.id,
        parcelId: parcelId,
        acceptancePrice: selectedAcceptance.acceptance_price
      });
      
      // Use the correct API endpoint that emits WebSocket events
      const response = await ApiService.apipost(
        `/parcel/${parcelId}/select-traveller`,
        {
          traveller_id: selectedAcceptance.traveller.id,
          acceptance_price: selectedAcceptance.acceptance_price
        }
      );

      console.log('🎯 Select traveller response from ParcelAcceptanceList:', response?.data);

      if (response?.data?.success) {
        showSuccess(`Traveller selected successfully!`);
        setConfirmDialogOpen(false);
        
        // Navigate to Step 3 for payment confirmation
        navigate(RoutePath.USER_REQUEST_FORM, {
          state: {
            parcelId: parcelId,
            step: 3
          },
        });
      } else {
        showError(response?.data?.message || "Failed to select traveller");
      }
    } catch (error) {
      console.error("Error selecting traveller:", error);
      showError(error.response?.data?.message || "Failed to select traveller");
    } finally {
      setSelecting(false);
    }
  };

  const renderTravellerCard = (item, isPending = false) => {
    const isAnimating = animatingCards.has(item.traveller.id);
    
    return (
      <Card
        key={isPending ? item.request_id : item.acceptance_id}
        id={`${isPending ? 'pending' : 'acceptance'}-card-${isPending ? item.request_id : item.acceptance_id}`}
        sx={{
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          transition: "all 0.2s",
          animation: isAnimating ? 'pulse 1s ease-in-out 2' : 'none',
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            cursor: "pointer",
          },
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
            '50%': { transform: 'scale(1.02)', boxShadow: '0 8px 20px rgba(34,197,94,0.3)' },
            '100%': { transform: 'scale(1)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
          }
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            {/* Traveller Info */}
            <Box display="flex" gap={2} flex={1}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: isPending ? "#9ca3af" : "#1976d2",
                }}
              >
                <FiUser size={28} />
              </Avatar>

              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {item.traveller.email || "Traveller"}
                  </Typography>
                  {isPending && (
                    <Chip
                      label="Request sent – waiting"
                      size="small"
                      sx={{ 
                        bgcolor: "#f3f4f6", 
                        color: "#6b7280",
                        fontSize: "0.75rem"
                      }}
                    />
                  )}
                  {!isPending && (
                    <Chip
                      label="Interested"
                      size="small"
                      color="success"
                      sx={{ fontSize: "0.75rem" }}
                    />
                  )}
                </Box>

                {/* Rating */}
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Rating
                    value={item.traveller.rating || 4.5}
                    precision={0.5}
                    size="small"
                    readOnly
                  />
                  <Typography variant="body2" color="text.secondary">
                    ({safeToFixed(item.traveller.rating, 1, "4.5")})
                  </Typography>
                </Box>

                {/* Detour Info & Drive Time */}
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Chip
                    label={`Detour: ${safeToFixed(item.detour_km, 1, "0")} km`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`${safeToFixed(item.detour_percentage, 1, "0")}% extra`}
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                  {item.drive_time_minutes && (
                    <Chip
                      icon={<FiClock size={14} />}
                      label={`${item.drive_time_minutes} mins away`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}
                  {item.match_score && (
                    <Chip
                      label={`Match: ${item.match_score}%`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Box>

                {/* Traveller Route Section */}
                {item.route && (
                  <Box display="flex" alignItems="flex-start" gap={1} mt={2} pt={2} borderTop="1px solid #e5e7eb">
                    <FiMapPin size={16} style={{ marginTop: 2, color: "#6366f1", flexShrink: 0 }} />
                    <Box flex={1}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: "#374151", display: "block" }}>
                        Current Route
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#059669", fontWeight: 500, mt: 0.5 }}>
                        {item.route.originAddress?.city || "—"}
                        {" → "}
                        {item.route.destAddress?.city || "—"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6b7280", display: "block", mt: 0.5 }}>
                        {item.route.originAddress?.address || "—"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6b7280", display: "block" }}>
                        {item.route.destAddress?.address || "—"}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Price & Action */}
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-end"
              gap={1}
              sx={{ minWidth: 120 }}
            >
              {!isPending && (
                <>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#2e7d32" }}
                  >
                    ₹{item.acceptance_price || 0}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectClick(item);
                    }}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      px: 3,
                    }}
                  >
                    Select
                  </Button>
                </>
              )}
              {isPending && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'center' }}
                >
                  Waiting for response...
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  const totalTravellers = acceptances.length + pendingRequests.length;

  if (totalTravellers === 0) {
    return (
      <Box
        sx={{
          bgcolor: "#f8f9fa",
          borderRadius: 2,
          p: 3,
          textAlign: "center",
          border: "1px dashed #dee2e6",
        }}
      >
        <FiTruck size={48} color="#adb5bd" style={{ margin: "0 auto 12px" }} />
        <Typography variant="body1" color="text.secondary">
          No travellers have been notified yet.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          We'll notify you when travellers receive and respond to your parcel request.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Travellers ({totalTravellers})
        </Typography>

        {/* Sort Controls - Only show for short distance parcels */}
        {parcelData?.parcel_distance_km <= 50 && acceptances.length > 0 && (
          <ToggleButtonGroup
            value={sortBy}
            exclusive
            onChange={handleSortChange}
            size="small"
            disabled={sortLoading}
          >
            <ToggleButton value="detour">
              <FiMapPin size={16} style={{ marginRight: 4 }} />
              Detour
            </ToggleButton>
            <ToggleButton value="nearby">
              <FiClock size={16} style={{ marginRight: 4 }} />
              {sortLoading ? <CircularProgress size={12} sx={{ ml: 0.5 }} /> : "Nearby"}
            </ToggleButton>
            <ToggleButton value="rating">
              Rating
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Box>

      {/* Accepted Travellers Section */}
      {acceptances.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "#2e7d32" }}>
            ✅ Accepted ({acceptances.length})
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {acceptances.map((acceptance) => renderTravellerCard(acceptance, false))}
          </Box>
        </Box>
      )}

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "#6b7280" }}>
            ⏳ Requests Sent ({pendingRequests.length})
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {pendingRequests.map((request) => renderTravellerCard(request, true))}
          </Box>
        </Box>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => !selecting && setConfirmDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Selection</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to select{" "}
            <strong>{selectedAcceptance?.traveller.email || "this traveller"}</strong> for this delivery?
          </Typography>
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "#f5f5f5",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Delivery Price
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#2e7d32" }}>
              ₹{selectedAcceptance?.acceptance_price || 0}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            disabled={selecting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSelection}
            variant="contained"
            color="primary"
            disabled={selecting}
          >
            {selecting ? <CircularProgress size={20} /> : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParcelAcceptanceList;
