import React, { useState, useEffect } from 'react';
import { IoClose, IoLocationOutline } from 'react-icons/io5';
import { IoIosSend } from 'react-icons/io';
import { FaStar, FaArrowRightLong } from 'react-icons/fa6';
import { PiMotorcycleBold, PiTruck, PiVan, PiCar } from 'react-icons/pi';
import { FaBus, FaTrain } from 'react-icons/fa';
import ApiService from '../../core/services/api.service';
import ServerUrl from '../../core/constants/serverUrl.constant';
import { showToast } from '../../core/utils/toast.util';

const TravellerSelectionModal = ({ 
  isOpen, 
  onClose, 
  parcelId, 
  onTravellerSelected 
}) => {
  const [travellers, setTravellers] = useState([]);
  const [selectedTravellerId, setSelectedTravellerId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableTravellers();
    }
  }, [isOpen, parcelId]);

  const fetchAvailableTravellers = async () => {
  try {
    setLoading(true);

    const response = await ApiService.apiget(
      `${ServerUrl.API_PARCEL_ACCEPTANCES(parcelId)}?_t=${Date.now()}`
    );

    console.log("API RESPONSE:", response?.data);

    if (response?.data?.success) {
      let list = [];

      const data = response.data.data;

      if (Array.isArray(data)) {
        list = data;
      }
      else if (Array.isArray(data?.acceptances)) {
        list = data.acceptances;
      }
      else if (Array.isArray(data?.travellers)) {
        list = data.travellers;
      }

      setTravellers(list);
    } else {
      setTravellers([]);
    }

  } catch (error) {
    console.error("Error fetching travellers:", error);
    showToast("Failed to load available travellers", "error");
    setTravellers([]);
  } finally {
    setLoading(false);
  }
};

  const handleSelectTraveller = async () => {
    if (!selectedTravellerId) return;

    try {
      setLoading(true);
      
      // Find the selected traveller to get acceptance_price
      const selectedTraveller = travellers.find(t => t.traveller.id === selectedTravellerId);
      
      console.log('🎯 Selecting traveller:', {
        travellerId: selectedTravellerId,
        parcelId: parcelId,
        acceptancePrice: selectedTraveller?.acceptance_price
      });
      
      // Call the correct API endpoint that emits WebSocket events
      const response = await ApiService.apipost(
        ServerUrl.API_PARCEL_SELECT_TRAVELLER(parcelId),
        {
          traveller_id: selectedTravellerId,
          acceptance_price: selectedTraveller?.acceptance_price
        }
      );

      console.log('🎯 Select traveller response:', response?.data);

      if (response?.data?.success) {
        showToast('Traveller selected successfully!', 'success');
        onTravellerSelected(selectedTravellerId);
        onClose();
      } else {
        showToast(response?.data?.message || 'Failed to select traveller', 'error');
      }
    } catch (error) {
      console.error('Error selecting traveller:', error);
      showToast('Failed to select traveller', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderVehicleIcon = (type) => {
    const normalizedType = type?.toLowerCase();
    switch (normalizedType) {
      case "bike":
        return <PiMotorcycleBold className="text-xl text-blue-600" />;
      case "truck":
      case "tempo":
        return <PiTruck className="text-xl text-blue-600" />;
      case "suv":
      case "van":
        return <PiVan className="text-xl text-blue-600" />;
      case "bus":
        return <FaBus className="text-xl text-blue-600" />;
      case "train":
        return <FaTrain className="text-xl text-blue-600" />;
      default:
        return <PiCar className="text-xl text-blue-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/*
        Mobile  → bottom sheet: slides up, full width, rounded top corners,
                  max 85vh so backdrop is still visible
        Desktop → centered dialog: max-w-2xl, all corners rounded
      */}
      <div className="
        relative bg-white w-full flex flex-col overflow-hidden
        rounded-t-2xl sm:rounded-2xl
        max-h-[85vh] sm:max-h-[90vh]
        sm:max-w-2xl sm:mx-4
      ">
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden" aria-hidden="true">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Select Traveller</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Choose from available travellers for your parcel
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0 ml-3"
            aria-label="Close"
          >
            <IoClose size={22} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500 text-sm">Loading travellers...</div>
            </div>
          ) : travellers.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-gray-500 text-sm">No travellers available</p>
                <p className="text-xs text-gray-400 mt-1">
                  Please wait for travellers to accept your request
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {travellers.length} traveller{travellers.length !== 1 ? 's' : ''} available
              </p>

              {travellers.map((acceptance) => {
                const traveller = acceptance.traveller;
                const isSelected = selectedTravellerId === traveller.id;

                return (
                  <button
                    key={traveller.id}
                    onClick={() => setSelectedTravellerId(traveller.id)}
                    className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar — smaller on mobile */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base flex-shrink-0">
                        {traveller.profile?.name?.charAt(0) || traveller.email?.charAt(0) || 'T'}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        {/* Name row — wraps naturally on narrow screens */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                          <span className="font-semibold text-gray-900 text-sm sm:text-base truncate max-w-[160px] sm:max-w-none">
                            {traveller.profile?.name || traveller.email}
                          </span>
                          <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex-shrink-0">
                            VERIFIED
                          </span>
                        </div>

                        {/* Rating + deliveries */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1.5">
                          <FaStar className="text-yellow-500 flex-shrink-0" size={11} />
                          <span>{traveller.travellerProfile?.rating || 'N/A'}</span>
                          <span className="text-gray-400">•</span>
                          <span>{traveller.travellerProfile?.total_deliveries || 0} deliveries</span>
                        </div>

                        {/* Vehicle + price row — flex with price pushed to the right */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="flex-shrink-0">
                              {renderVehicleIcon(traveller.travellerProfile?.vehicle_type)}
                            </span>
                            <span className="text-xs text-gray-600 truncate">
                              {traveller.travellerProfile?.vehicle_type || 'Vehicle'}
                              {traveller.travellerProfile?.vehicle_number &&
                                ` (${traveller.travellerProfile.vehicle_number})`
                              }
                            </span>
                          </div>

                          {acceptance.acceptance_price && (
                            <span className="text-base sm:text-lg font-bold text-blue-600 flex-shrink-0">
                              ₹{acceptance.acceptance_price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-gray-50 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition text-sm font-medium min-h-[44px]"
          >
            Cancel
          </button>
          <button
            onClick={handleSelectTraveller}
            disabled={!selectedTravellerId || loading}
            className="flex-1 px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium min-h-[44px]"
          >
            {loading ? 'Selecting...' : 'Select Traveller'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TravellerSelectionModal;