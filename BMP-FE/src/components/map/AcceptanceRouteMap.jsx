import { useState, useMemo, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { Box, Typography, Chip, Avatar } from '@mui/material';
import { FiUser, FiClock, FiMapPin } from 'react-icons/fi';
import ApiService from '../../core/services/api.service';
import axios from 'axios';

const ROUTE_COLORS = [
  '#FF5733', '#33FF57', '#3357FF', '#FF33F1', '#F1FF33', '#33FFF5',
  '#FF8C00', '#8A2BE2', '#00CED1', '#FF1493', '#32CD32', '#FF6347'
];

// ─── Inner map component — only rendered once mapsApiKey is available ─────────
// useLoadScript must NOT be called with an empty key, otherwise it injects
// the Maps script immediately with no key → ApiProjectMapError + duplicate load.
const MapRenderer = (props) => {
  const { mapsApiKey, ...rest } = props;
  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: mapsApiKey });
  return <MapContent isLoaded={isLoaded} loadError={loadError} {...rest} />;
};

const MapContent = ({
  isLoaded, loadError,
  acceptances, pickupLocation, dropLocation,
  onRouteClick, selectedAcceptanceId, parcelId, highlightedRouteId
}) => {
  const [map, setMap] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [infoWindowPosition, setInfoWindowPosition] = useState(null);
  const [routeGeometries, setRouteGeometries] = useState([]);
  const [loadingGeometry, setLoadingGeometry] = useState(false);
  const [animatingRoutes, setAnimatingRoutes] = useState(new Set());
  const [pulsingRoutes, setPulsingRoutes] = useState(new Set());

  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  const center = useMemo(() => {
    if (pickupLocation) {
      return {
        lat: parseFloat(pickupLocation.lat || pickupLocation.latitude),
        lng: parseFloat(pickupLocation.lng || pickupLocation.longitude)
      };
    }
    return { lat: 28.6139, lng: 77.2090 }; // Default to Delhi
  }, [pickupLocation]);

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
  };

  // Fetch route geometries when parcelId changes
  useEffect(() => {
    const fetchRouteGeometries = async () => {
      if (!parcelId || acceptances.length === 0) {
        setRouteGeometries([]);
        return;
      }

      try {
        setLoadingGeometry(true);
        console.log(`Fetching route geometries for parcel: ${parcelId}`);
        
        const response = await ApiService.getParcelRouteGeometry(parcelId);
        
        if (response?.data?.success) {
          const geometries = response.data.data.route_geometries || [];
          console.log(`Loaded ${geometries.length} route geometries`);
          setRouteGeometries(geometries);
        } else {
          console.log('Failed to fetch route geometries:', response?.data?.message);
          setRouteGeometries([]);
        }
      } catch (error) {
        console.error('Error fetching route geometries:', error);
        setRouteGeometries([]);
      } finally {
        setLoadingGeometry(false);
      }
    };

    fetchRouteGeometries();
  }, [parcelId, acceptances.length]);

  // Handle route highlighting when highlightedRouteId changes
  useEffect(() => {
    if (highlightedRouteId) {
      // Add to pulsing routes
      setPulsingRoutes(prev => new Set(prev).add(highlightedRouteId));
      
      // Auto-zoom to the highlighted route
      const highlightedAcceptance = acceptances.find(
        acc => acc.acceptance_id === highlightedRouteId
      );
      
      if (highlightedAcceptance && map) {
        const routeGeometry = routeGeometries.find(
          rg => rg.acceptance_id === highlightedRouteId
        );
        
        if (routeGeometry && routeGeometry.geometry && routeGeometry.geometry.coordinates) {
          const bounds = new window.google.maps.LatLngBounds();
          routeGeometry.geometry.coordinates.forEach(([lng, lat]) => {
            bounds.extend({ lat: parseFloat(lat), lng: parseFloat(lng) });
          });
          map.fitBounds(bounds);
        }
      }
      
      // Remove pulsing effect after 3 seconds
      const timer = setTimeout(() => {
        setPulsingRoutes(prev => {
          const newSet = new Set(prev);
          newSet.delete(highlightedRouteId);
          return newSet;
        });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [highlightedRouteId, acceptances, routeGeometries, map]);

  // Create traveller markers data
  const travellerMarkers = useMemo(() => {
    return acceptances.map((acceptance, index) => {
      const color = ROUTE_COLORS[index % ROUTE_COLORS.length];
      const isSelected = selectedAcceptanceId === acceptance.acceptance_id;
      
      // Find matching route geometry for route start/end points
      const routeGeometry = routeGeometries.find(
        rg => rg.acceptance_id === acceptance.acceptance_id
      );
      
      let routeStartPoint = null;
      let routeEndPoint = null;
      
      if (routeGeometry && routeGeometry.geometry && routeGeometry.geometry.coordinates) {
        const coords = routeGeometry.geometry.coordinates;
        if (coords.length > 0) {
          // Use API-provided start/end points if available, otherwise use first/last coordinates
          if (routeGeometry.start_point) {
            routeStartPoint = routeGeometry.start_point;
          } else {
            routeStartPoint = {
              lat: parseFloat(coords[0][1]),
              lng: parseFloat(coords[0][0])
            };
          }
          
          if (routeGeometry.end_point) {
            routeEndPoint = routeGeometry.end_point;
          } else {
            routeEndPoint = {
              lat: parseFloat(coords[coords.length - 1][1]),
              lng: parseFloat(coords[coords.length - 1][0])
            };
          }
        }
      }
      
      // Get traveller's current location
      let currentLocation = null;
      const travellerLocation = acceptance.traveller?.travellerProfile?.last_known_location;
      if (travellerLocation && travellerLocation.coordinates) {
        const [lng, lat] = travellerLocation.coordinates;
        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
          currentLocation = { 
            lat: parseFloat(lat), 
            lng: parseFloat(lng) 
          };
        }
      }

      return {
        id: acceptance.acceptance_id,
        acceptance,
        color,
        isSelected,
        currentLocation,
        routeStartPoint,
        routeEndPoint,
        hasRouteGeometry: !!routeGeometry
      };
    });
  }, [acceptances, selectedAcceptanceId, routeGeometries]);

  // Create route polylines showing only the segment between start and end points
  const routePolylines = useMemo(() => {
    return acceptances.map((acceptance, index) => {
      const color = ROUTE_COLORS[index % ROUTE_COLORS.length];
      const isSelected = selectedAcceptanceId === acceptance.acceptance_id;
      const isPulsing = pulsingRoutes.has(acceptance.acceptance_id);
      
      // Find matching route geometry
      const routeGeometry = routeGeometries.find(
        rg => rg.acceptance_id === acceptance.acceptance_id
      );
      
      let path = [];
      
      if (routeGeometry && routeGeometry.geometry && routeGeometry.geometry.coordinates) {
        // Use the exact route geometry from PostGIS
        path = routeGeometry.geometry.coordinates.map(([lng, lat]) => ({
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        }));
        console.log(`Using exact route geometry with ${path.length} points for acceptance ${acceptance.acceptance_id}`);
      }

      // Only create polyline if we have actual route geometry
      if (path.length > 1) {
        return {
          id: acceptance.acceptance_id,
          path,
          options: {
            strokeColor: color,
            strokeOpacity: isPulsing ? 1.0 : (isSelected ? 1.0 : 0.8),
            strokeWeight: isPulsing ? 6 : (isSelected ? 4 : 3),
            clickable: true,
            zIndex: isPulsing ? 1000 : (isSelected ? 100 : 1),
          },
          acceptance,
          color,
          hasRealGeometry: true,
          isPulsing
        };
      }
      
      return null;
    }).filter(Boolean); // Remove null entries
  }, [acceptances, selectedAcceptanceId, routeGeometries, pulsingRoutes]);

  const handleRouteClick = (routeData, event) => {
    setSelectedRoute(routeData.acceptance);
    setInfoWindowPosition({
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    });
    
    if (onRouteClick) {
      onRouteClick(routeData.acceptance);
    }
  };

  const handleMarkerClick = (markerData) => {
    setSelectedRoute(markerData.acceptance);
    
    // Set info window position to the clicked marker location
    let position = null;
    if (markerData.currentLocation) {
      position = markerData.currentLocation;
    } else if (markerData.routeStartPoint) {
      position = markerData.routeStartPoint;
    }
    
    if (position) {
      setInfoWindowPosition(position);
    }
    
    if (onRouteClick) {
      onRouteClick(markerData.acceptance);
    }
  };

  const closeInfoWindow = () => {
    setSelectedRoute(null);
    setInfoWindowPosition(null);
  };

  if (loadError) {
    return (
      <Box 
        sx={{ 
          height: 400, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: '#f5f5f5',
          borderRadius: 2
        }}
      >
        <Typography color="error">
          Error loading Google Maps
        </Typography>
      </Box>
    );
  }

  if (!isLoaded) {
    return (
      <Box 
        sx={{ 
          height: 400, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: '#f5f5f5',
          borderRadius: 2
        }}
      >
        <Typography color="text.secondary">
          Loading map...
        </Typography>
      </Box>
    );
  }

  if (!pickupLocation) {
    return (
      <Box 
        sx={{ 
          height: 400, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: '#f5f5f5',
          borderRadius: 2
        }}
      >
        <Typography color="text.secondary">
          Map unavailable - missing location data
        </Typography>
      </Box>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={12}
      options={mapOptions}
      onLoad={setMap}
    >
        {/* Parcel Pickup Marker */}
        <Marker
          position={center}
          icon={{
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="16" fill="#4CAF50" stroke="white" stroke-width="4"/>
                <text x="20" y="26" text-anchor="middle" fill="white" font-size="14" font-weight="bold">P</text>
              </svg>
            `),
            scaledSize: isLoaded && window.google?.maps?.Size ? new window.google.maps.Size(40, 40) : undefined,
          }}
          title="Parcel Pickup Location"
        />

        {/* Parcel Drop Marker */}
        {dropLocation && (
          <Marker
            position={{
              lat: parseFloat(dropLocation.lat || dropLocation.latitude),
              lng: parseFloat(dropLocation.lng || dropLocation.longitude)
            }}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="16" fill="#f44336" stroke="white" stroke-width="4"/>
                  <text x="20" y="26" text-anchor="middle" fill="white" font-size="14" font-weight="bold">D</text>
                </svg>
              `),
              scaledSize: isLoaded && window.google?.maps?.Size ? new window.google.maps.Size(40, 40) : undefined,
            }}
            title="Parcel Drop Location"
          />
        )}

        {/* Traveller Route Polylines - Exact paths between start and end points */}
        {routePolylines.map((routeData) => (
          <Polyline
            key={routeData.id}
            path={routeData.path}
            options={routeData.options}
            onClick={(event) => handleRouteClick(routeData, event)}
          />
        ))}

        {/* Traveller Markers */}
        {travellerMarkers.map((markerData, index) => (
          <div key={markerData.id}>
            {/* Traveller Current Location */}
            {markerData.currentLocation && (
              <Marker
                position={markerData.currentLocation}
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="18" cy="18" r="14" fill="${markerData.color}" stroke="white" stroke-width="3"/>
                      <circle cx="18" cy="18" r="6" fill="white"/>
                      <text x="18" y="22" text-anchor="middle" fill="${markerData.color}" font-size="10" font-weight="bold">T</text>
                    </svg>
                  `),
                  scaledSize: isLoaded && window.google?.maps?.Size ? new window.google.maps.Size(36, 36) : undefined,
                }}
                title={`Traveller ${index + 1} - Current Location`}
                onClick={() => handleMarkerClick(markerData)}
              />
            )}

            {/* Traveller Route Start Point */}
            {markerData.routeStartPoint && (
              <Marker
                position={markerData.routeStartPoint}
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="14" cy="14" r="10" fill="${markerData.color}" stroke="white" stroke-width="2" opacity="0.8"/>
                      <text x="14" y="18" text-anchor="middle" fill="white" font-size="10" font-weight="bold">S</text>
                    </svg>
                  `),
                  scaledSize: isLoaded && window.google?.maps?.Size ? new window.google.maps.Size(28, 28) : undefined,
                }}
                title={`Traveller ${index + 1} - Route Start`}
                onClick={() => handleMarkerClick(markerData)}
              />
            )}

            {/* Traveller Route End Point */}
            {markerData.routeEndPoint && (
              <Marker
                position={markerData.routeEndPoint}
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="14" cy="14" r="10" fill="${markerData.color}" stroke="white" stroke-width="2" opacity="0.8"/>
                      <text x="14" y="18" text-anchor="middle" fill="white" font-size="10" font-weight="bold">E</text>
                    </svg>
                  `),
                  scaledSize: isLoaded && window.google?.maps?.Size ? new window.google.maps.Size(28, 28) : undefined,
                }}
                title={`Traveller ${index + 1} - Route End`}
                onClick={() => handleMarkerClick(markerData)}
              />
            )}
          </div>
        ))}

        {/* Transit Stop Markers for Bus/Train Routes */}
        {acceptances.map((acceptance, index) => {
          // Check if route has stops (transit route)
          if (!acceptance.stops_passed || !Array.isArray(acceptance.stops_passed) || acceptance.stops_passed.length === 0) {
            return null;
          }

          return (
            <div key={`transit-stops-${acceptance.acceptance_id}`}>
              {acceptance.stops_passed.map((stop, stopIndex) => (
                <Marker
                  key={`stop-${acceptance.acceptance_id}-${stopIndex}`}
                  position={{
                    lat: parseFloat(stop.lat),
                    lng: parseFloat(stop.lng)
                  }}
                  icon={{
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="13" fill="#FFA500" stroke="white" stroke-width="2"/>
                        <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${acceptance.transport_mode === 'bus' ? '🚌' : '🚂'}</text>
                      </svg>
                    `),
                    scaledSize: isLoaded && window.google?.maps?.Size ? new window.google.maps.Size(32, 32) : undefined,
                  }}
                  title={`${stop.name || `${acceptance.transport_mode === 'bus' ? 'Bus' : 'Train'} Stop`} - ${stop.type || ''}`}
                />
              ))}
            </div>
          );
        })}

        {/* Info Window */}
        {selectedRoute && infoWindowPosition && (
          <InfoWindow
            position={infoWindowPosition}
            onCloseClick={closeInfoWindow}
          >
            <Box sx={{ p: 1, minWidth: 200 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                  <FiUser size={16} />
                </Avatar>
                <Typography variant="subtitle2" fontWeight={600}>
                  {selectedRoute.traveller.email || 'Traveller'}
                </Typography>
              </Box>
              
              <Box display="flex" flexDirection="column" gap={0.5}>
                {selectedRoute.transport_mode && selectedRoute.transport_mode !== 'private' ? (
                  // Transit Route Info
                  <>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {selectedRoute.transport_mode === 'bus' ? '🚌 Bus Route' : '🚂 Train Route'}
                    </Typography>
                    <Chip
                      icon={<FiMapPin size={12} />}
                      label={`Walking: ${selectedRoute.detour_km || 0} km`}
                      size="small"
                      variant="outlined"
                      color="warning"
                    />
                    {selectedRoute.stops_passed && selectedRoute.stops_passed.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        {selectedRoute.stops_passed.length} stops on route
                      </Typography>
                    )}
                  </>
                ) : (
                  // Private Vehicle Route Info
                  <Chip
                    icon={<FiMapPin size={12} />}
                    label={`Detour: ${selectedRoute.detour_km || 0} km`}
                    size="small"
                    variant="outlined"
                  />
                )}
                
                {selectedRoute.drive_time_minutes && (
                  <Chip
                    icon={<FiClock size={12} />}
                    label={`${selectedRoute.drive_time_minutes} mins away`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
                
                <Typography variant="h6" color="primary" fontWeight={700} mt={1}>
                  ₹{selectedRoute.acceptance_price || 0}
                </Typography>
              </Box>
            </Box>
          </InfoWindow>
        )}

        {/* Loading indicator for route geometries */}
        {loadingGeometry && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              p: 1,
              borderRadius: 1,
              boxShadow: 1
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Loading route paths...
            </Typography>
          </Box>
        )}

        {/* Map Legend */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            p: 1.5,
            borderRadius: 2,
            boxShadow: 2,
            minWidth: 180,
            fontSize: '0.75rem'
          }}
        >
          <Typography variant="caption" fontWeight={600} display="block" mb={1}>
            Map Legend
          </Typography>
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4CAF50' }} />
              <Typography variant="caption">Parcel Pickup (P)</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f44336' }} />
              <Typography variant="caption">Parcel Drop (D)</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                bgcolor: '#FF5733', 
                border: '2px solid white',
                boxSizing: 'border-box'
              }} />
              <Typography variant="caption">Traveller Current (T)</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ 
                width: 10, 
                height: 10, 
                borderRadius: '50%', 
                bgcolor: '#FF5733', 
                opacity: 0.8 
              }} />
              <Typography variant="caption">Route Start (S) / End (E)</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ 
                width: 20, 
                height: 3, 
                bgcolor: '#FF5733', 
                borderRadius: 1 
              }} />
              <Typography variant="caption">Exact Route Path</Typography>
            </Box>
          </Box>
        </Box>
      </GoogleMap>
  );
};

// ─── Outer component — fetches key from backend, then mounts MapRenderer ───────
const AcceptanceRouteMap = (props) => {
  const [mapsApiKey, setMapsApiKey] = useState(null);
  const [keyError, setKeyError] = useState(false);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    axios.get(`${apiUrl}/places/maps-key`)
      .then(res => setMapsApiKey(res.data.key))
      .catch(() => setKeyError(true));
  }, []);

  if (keyError)
    return <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}><Typography color="error">Failed to load Maps configuration</Typography></Box>;

  if (!mapsApiKey)
    return <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}><Typography color="text.secondary">Initializing map...</Typography></Box>;

  // Only mount MapRenderer (and thus call useLoadScript) once key is ready
  return <MapRenderer mapsApiKey={mapsApiKey} {...props} />;
};

export default AcceptanceRouteMap;