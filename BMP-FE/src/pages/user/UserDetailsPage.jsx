// CI/CD Test - v2.0 (2026-04-08) - Complete Pipeline Testing
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ApiService from "../../core/services/api.service";
import RouteSection from "../../components/parceldetails/RouteSection";
import ContactSection from "../../components/parceldetails/ContactSection";
import PackageSection from "../../components/parceldetails/PackageSection";
import TravellerCard from "../../components/parceldetails/TravellerCard";
import PriceBreakdown from "../../components/parceldetails/PriceBreakdown";
import { DELIVERY_STATUS } from "../../core/constants/app.constant";

const UserDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [parcelData, setParcelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParcelDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get parcelId from navigation state
        const parcelId = location.state?.parcelId;
        
        if (!parcelId) {
          setError("No parcel ID provided");
          setLoading(false);
          return;
        }

        // Fetch parcel details from API
        const response = await ApiService.getParcelDetails(parcelId);
        
        if (response?.data?.success) {
          const data = response.data.data;
          
          // Transform data for display
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
            
            // Traveller info (if assigned)
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
              basePrice: data.price_quote || "—",
              deliverySpeedCharge: 0,
              gst: 0,
              total: data.price_quote || "—",
            },
            
            // Booking reference
            bookingRef: data.booking?.booking_ref,  // undefined if not created
            bookingId: data.booking?.id,  // undefined if no booking
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
  }, [location]);

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
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header with ID Display */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-blue-600">Details</h1>
          
          {/* ID Display Section */}
          {(parcelData?.parcel_ref || parcelData?.bookingId || parcelData?.trackingId) && (
            <div className="flex flex-wrap gap-2 justify-end">
              {parcelData?.parcel_ref && (
                <div className="px-3 py-1.5 bg-blue-100 rounded-full border border-blue-300">
                  <p className="text-xs font-semibold text-blue-700">Parcel ID: {parcelData.parcel_ref}</p>
                </div>
              )}
              {parcelData?.bookingRef && (
                <div className="px-3 py-1.5 bg-green-100 rounded-full border border-green-300">
                  <p className="text-xs font-semibold text-green-700">Booking ID: {parcelData.bookingRef}</p>
                </div>
              )}
              {parcelData?.trackingId && (
                <div className="px-3 py-1.5 bg-purple-100 rounded-full border border-purple-300">
                  <p className="text-xs font-semibold text-purple-700">Tracking ID: {parcelData.trackingId}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-3 gap-4">
          {/* LEFT COLUMN - 2/3 width */}
          <div className="col-span-2 bg-white rounded-2xl p-5 shadow-lg">
            <RouteSection 
              type="pickup" 
              address={parcelData.pickup} 
            />
            <ContactSection 
              type="pickup"
              name={parcelData.pickup.name}
              phone={parcelData.pickup.phone}
              alt_phone={parcelData.pickup.alt_phone}
            />
            <PackageSection 
              {...parcelData.package}
            />
          </div>

          {/* RIGHT COLUMN - 1/3 width */}
          <div className="col-span-1 bg-white rounded-2xl p-5 shadow-lg h-fit">
            <RouteSection 
              type="delivery" 
              address={parcelData.delivery} 
            />
            <ContactSection 
              type="delivery"
              name={parcelData.delivery.name}
              phone={parcelData.delivery.phone}
              alt_phone={parcelData.delivery.alt_phone}
            />
            
            {/* Show traveller card only if assigned (status >= PARTNER_SELECTED) */}
            {parcelData.traveller && (
              <TravellerCard 
                {...parcelData.traveller}
              />
            )}
            
            <PriceBreakdown 
              {...parcelData.price}
            />
          </div>
        </div>

        {/* Decline Button - Corner positioned */}
        {parcelData && (
          <div className="max-w-7xl mx-auto mt-4 flex justify-end">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition"
            >
              Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetailsPage;