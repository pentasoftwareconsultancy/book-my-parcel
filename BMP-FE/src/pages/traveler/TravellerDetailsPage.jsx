import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Typography, Rating, Chip, Paper, Alert } from "@mui/material";
import { Star } from "lucide-react";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";
import RouteSection from "../../components/parceldetails/RouteSection";
import ContactSection from "../../components/parceldetails/ContactSection";
import PackageSection from "../../components/parceldetails/PackageSection";
import TravellerCard from "../../components/parceldetails/TravellerCard";
import { DELIVERY_STATUS } from "../../core/constants/app.constant";
import RoutePath from "../../core/constants/routes.constant";

const TravellerDetailsPage = () => {
  const { id: parcelId } = useParams();
  const navigate = useNavigate();
  
  const [parcelData, setParcelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    const fetchParcelDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!parcelId) {
          setError("No parcel ID provided");
          setLoading(false);
          return;
        }

        // Fetch parcel details from API
        const response = await ApiService.getParcelDetails(parcelId);
        
        if (response?.data?.success) {
          const data = response.data.data;
          
          // Transform data for traveller view
          const transformedData = {
            id: data.id,
            parcel_ref: data.parcel_ref,
            status: data.booking?.status || data.status,
            
            // Pickup info
            pickup: {
              name: data.pickupAddress?.name || "—",
              address: data.pickupAddress?.address || "—",
              city: data.pickupAddress?.city || "—",
              state: data.pickupAddress?.state || "—",
              pincode: data.pickupAddress?.pincode || "—",
              country: data.pickupAddress?.country || "India",
              phone: data.pickupAddress?.phone || "—",
              alt_phone: data.pickupAddress?.alt_phone || "—",
            },
            
            // Delivery info
            delivery: {
              name: data.deliveryAddress?.name || "—",
              address: data.deliveryAddress?.address || "—",
              city: data.deliveryAddress?.city || "—",
              state: data.deliveryAddress?.state || "—",
              pincode: data.deliveryAddress?.pincode || "—",
              country: data.deliveryAddress?.country || "India",
              phone: data.deliveryAddress?.phone || "—",
              alt_phone: data.deliveryAddress?.alt_phone || "—",
            },
            
            // Package info
            package: {
              size: data.package_size || "—",
              weight: data.weight ? `${data.weight} kg` : "—",
              value: data.value || "—",
              speed: data.delivery_speed || "Standard",
              est_delivery: "3-5 Days",
              description: data.description || "—",
              type: data.parcel_type || "—",
              length: data.length ? `${data.length} cm` : "—",
              width: data.width ? `${data.width} cm` : "—",
              height: data.height ? `${data.height} cm` : "—",
              notes: data.notes || "—",
              photos: data.photos || [],
            },
            
            // Traveller info (sender's perspective)
            traveller: data.booking?.traveller ? {
              name: data.booking.traveller.profile?.name || data.booking.traveller.email || "—",
              vehicle: data.booking.traveller.travellerProfile?.vehicle_type || "—",
              vehicleNumber: data.booking.traveller.travellerProfile?.vehicle_number || "—",
              rating: data.booking.traveller.travellerProfile?.rating || "N/A",
              totalDeliveries: data.booking.traveller.travellerProfile?.total_deliveries || 0,
              estimatedDelivery: "Today",
              route: `${data.pickupAddress?.city} → ${data.deliveryAddress?.city}`,
              price: data.price_quote || "—",
              avatar: data.booking.traveller.profile?.avatar || null,
            } : null,
            
            // Pricing info
            price: {
              actualPrice: data.price_quote || "—",  // Full parcel price
              basePrice: data.price_quote || "—",    // Full parcel price for display
              travellersEarnings: data.price_quote || "—",  // Traveller full earnings
              deliverySpeedCharge: 0,
              gst: 0,
              total: data.price_quote || "—",  // Total amount (matches agreed price)
            },
            
            // Additional traveller info
            paymentMethod: data.payment_method || "Cash on Delivery",
            bookingId: data.booking?.id,  // UUID of the booking
            bookingRef: data.booking?.booking_ref,  // Reference number like "IND091-001"
            trackingId: data.booking?.tracking_ref,  // undefined if not created
          };
          
          setParcelData(transformedData);
        } else {
          setError("Failed to fetch parcel details");
        }
      } catch (err) {
        console.error("Error fetching parcel details:", err);
        setError(err.message || "An error occurred while fetching parcel details");
      } finally {
        setLoading(false);
      }
    };

    fetchParcelDetails();
  }, [parcelId]);

  // Fetch feedback for the booking if status is DELIVERED
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        console.log("🔍 Checking feedback conditions:", {
          status: parcelData?.status,
          bookingId: parcelData?.bookingId,
          isDelivered: parcelData?.status === DELIVERY_STATUS.DELIVERED
        });

        if (parcelData?.status === DELIVERY_STATUS.DELIVERED && parcelData?.bookingId) {
          setFeedbackLoading(true);
          console.log(`📥 Fetching feedback for booking: ${parcelData.bookingId}`);
          
          const response = await ApiService.apiget(
            `${ServerUrl.API_FEEDBACK_BASE}/booking/${parcelData.bookingId}`
          );
          
          console.log("📦 Feedback response:", response);
          
          if (response?.data?.data) {
            setFeedback(response.data.data);
            console.log("✅ Feedback set:", response.data.data);
          } else if (response?.data === null) {
            console.log("ℹ️ No feedback yet for this booking");
            setFeedback(null);
          }
        }
      } catch (err) {
        console.error("❌ Error fetching feedback:", err);
        // Don't set error here, feedback is optional
      } finally {
        setFeedbackLoading(false);
      }
    };

    if (parcelData) {
      fetchFeedback();
    }
  }, [parcelData?.status, parcelData?.bookingId]);

  const handleDecline = () => {
    // Navigate back to traveller dashboard
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading parcel details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!parcelData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <p className="text-gray-600">No parcel data found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 break-words">
              {parcelData?.pickup?.name || "—"}
            </h1>
            <p className="text-sm sm:text-base text-gray-700 mt-1">
              Parcel Price: <span className="font-bold text-green-600">₹{parcelData?.price?.actualPrice || "—"}</span>
            </p>
          </div>

          {/* ID badges */}
          {(parcelData?.parcel_ref || parcelData?.bookingRef || parcelData?.trackingId) && (
            <div className="flex flex-wrap gap-2">
              {parcelData?.parcel_ref && (
                <div className="px-3 py-1.5 bg-blue-100 rounded-full border border-blue-300">
                  <p className="text-xs font-semibold text-blue-700">Parcel: {parcelData.parcel_ref}</p>
                </div>
              )}
              {parcelData?.bookingRef && (
                <div className="px-3 py-1.5 bg-green-100 rounded-full border border-green-300">
                  <p className="text-xs font-semibold text-green-700">Booking: {parcelData.bookingRef}</p>
                </div>
              )}
              {parcelData?.trackingId && (
                <div className="px-3 py-1.5 bg-purple-100 rounded-full border border-purple-300">
                  <p className="text-xs font-semibold text-purple-700">Tracking: {parcelData.trackingId}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* LEFT COLUMN — full width on mobile, 2/3 on desktop */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-5 shadow-lg">
            <RouteSection type="pickup" address={parcelData.pickup} />
            <ContactSection
              type="pickup"
              name={parcelData.pickup.name}
              phone={parcelData.pickup.phone}
              alt_phone={parcelData.pickup.alt_phone}
            />
            <PackageSection {...parcelData.package} />

            {/* Feedback Section */}
            {parcelData?.status === DELIVERY_STATUS.DELIVERED && (
              <div className="mt-6">
                {feedbackLoading ? (
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <p className="text-gray-600 text-center">Loading feedback...</p>
                  </div>
                ) : feedback ? (
                  <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Star size={24} style={{ color: "#ffc107", marginRight: "8px" }} />
                        <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                          Customer Feedback
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Rating value={feedback.rating} readOnly size="medium" sx={{ color: "#ffc107", mr: 2 }} />
                        <Typography variant="body2" color="textSecondary">{feedback.rating} out of 5</Typography>
                      </Box>
                      {feedback.tags?.length > 0 && (
                        <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {feedback.tags.map((tag, idx) => (
                            <Chip key={idx} label={tag} size="small" sx={{ backgroundColor: "#e8f5e9", color: "#2e7d32" }} />
                          ))}
                        </Box>
                      )}
                      {feedback.comment && (
                        <Paper elevation={0} sx={{ p: 2, backgroundColor: "#f9f9f9", borderLeft: "3px solid #1976d2", mb: 2 }}>
                          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{feedback.comment}</Typography>
                        </Paper>
                      )}
                      <Typography variant="caption" color="textSecondary">
                        Feedback received on {new Date(feedback.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                ) : (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>No feedback received yet for this delivery.</Alert>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — full width on mobile, 1/3 on desktop */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-4 sm:p-5 shadow-lg">
            <RouteSection type="delivery" address={parcelData.delivery} />
            <ContactSection
              type="delivery"
              name={parcelData.delivery.name}
              phone={parcelData.delivery.phone}
              alt_phone={parcelData.delivery.alt_phone}
            />

            {parcelData.traveller && <TravellerCard {...parcelData.traveller} />}

            {/* Earnings */}
            <div className="mb-4 mt-8">
              <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-2">Earnings Information</p>
              <div className="bg-green-50 rounded-lg p-4 space-y-3 border border-green-200">
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1 uppercase tracking-wide">Parcel Price</p>
                  <p className="text-sm font-semibold text-gray-900">₹{parcelData.price.actualPrice}</p>
                </div>
                <div className="border-t border-green-200 pt-3">
                  <p className="text-xs text-gray-600 font-medium mb-1 uppercase tracking-wide">Your Earnings (80%)</p>
                  <p className="text-2xl font-bold text-green-600">₹{parcelData.price.travellersEarnings}</p>
                </div>
                <div className="border-t border-green-200 pt-3">
                  <p className="text-xs text-gray-600 font-medium mb-1 uppercase tracking-wide">Payment Method</p>
                  <p className="text-xs font-semibold text-gray-900">{parcelData.paymentMethod}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decline Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleDecline}
            className="px-6 py-2 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition w-full sm:w-auto"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default TravellerDetailsPage;
