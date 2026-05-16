import React, { useState, useEffect } from 'react';
import { IoClose, IoLocationOutline } from 'react-icons/io5';
import { IoIosSend } from 'react-icons/io';
import { FaStar, FaArrowRightLong } from 'react-icons/fa6';
import { PiMotorcycleBold, PiTruck, PiVan, PiCar } from 'react-icons/pi';
import { FaBus } from 'react-icons/fa';
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
      ServerUrl.API_PARCEL_ACCEPTANCES(parcelId)
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
    switch (type) {
      case "Bike":
        return <PiMotorcycleBold className="text-xl text-blue-600" />;
      case "Truck":
        return <PiTruck className="text-xl text-blue-600" />;
      case "Mini Truck":
        return <PiVan className="text-xl text-blue-600" />;
      case "Bus":
        return <FaBus className="text-xl text-blue-600" />;
      default:
        return <PiCar className="text-xl text-blue-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Traveller</h2>
            <p className="text-sm text-gray-500">Choose from available travellers for your parcel</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Travellers List */}
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">Loading travellers...</div>
              </div>
            ) : travellers.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <p className="text-gray-500">No travellers available</p>
                  <p className="text-sm text-gray-400 mt-1">Please wait for travellers to accept your request</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Available Travellers ({travellers.length})
                </h3>
                {travellers.map((acceptance) => {
                  const traveller = acceptance.traveller;
                  const isSelected = selectedTravellerId === traveller.id;
                  
                  return (
                    <button
                      key={traveller.id}
                      onClick={() => setSelectedTravellerId(traveller.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                          {traveller.profile?.name?.charAt(0) || traveller.email?.charAt(0) || 'T'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {traveller.profile?.name || traveller.email}
                            </span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              VERIFIED
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <FaStar className="text-yellow-500" />
                            <span>{traveller.travellerProfile?.rating || 'N/A'}</span>
                            <span>•</span>
                            <span>{traveller.travellerProfile?.total_deliveries || 0} deliveries</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderVehicleIcon(traveller.travellerProfile?.vehicle_type)}
                            <span className="text-sm text-gray-600">
                              {traveller.travellerProfile?.vehicle_type || 'Vehicle'} 
                              {traveller.travellerProfile?.vehicle_number && 
                                ` (${traveller.travellerProfile.vehicle_number})`
                              }
                            </span>
                          </div>
                          {acceptance.acceptance_price && (
                            <div className="mt-2 text-right">
                              <span className="text-lg font-bold text-blue-600">
                                ₹{acceptance.acceptance_price}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSelectTraveller}
            disabled={!selectedTravellerId || loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Selecting...' : 'Select Traveller'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TravellerSelectionModal;