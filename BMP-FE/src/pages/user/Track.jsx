import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getSocket } from "../../core/services/websocket.service";
import ApiService from "../../core/services/api.service";
import StorageService from "../../core/services/storage.service";
import { APPLICATION_CONSTANTS } from "../../core/constants/app.constant";
import { FiChevronDown, FiPackage, FiCheckCircle, FiShare2 } from "react-icons/fi";

const Track = () => {
  const { id: urlId } = useParams();
  const location = useLocation();

  // Is this the public route (/track/:id) or the authenticated user route (/user/track/:id)?
  const isPublicRoute = !location.pathname.startsWith("/user/");
  const isLoggedIn = !!StorageService.getData(APPLICATION_CONSTANTS.STORAGE.TOKEN);

  const [inputId, setInputId] = useState(urlId || "");
  const [trackingKey, setTrackingKey] = useState(urlId || "");
  const [isTracking, setIsTracking] = useState(!!urlId);
  const [eta, setEta] = useState(null);
  const [copied, setCopied] = useState(false);

  // Dropdown state for IN_TRANSIT parcels
  const [inTransitParcels, setInTransitParcels] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);

  const deliveryLocationRef = useRef(null);
  const directionsRendererRef = useRef(null);

  const animationRef = useRef(null);
  const currentPositionRef = useRef(null);
  const lastPosRef = useRef(null);
  const lastRouteUpdateRef = useRef(0);
  const mapReadyRef = useRef(false);

  const socketRef = useRef(getSocket());

  // ---------------- FETCH IN-TRANSIT PARCELS (for dropdown) ----------------
  useEffect(() => {
    if (!isLoggedIn) return;
    ApiService.getUserInTransitParcels()
      .then((res) => {
        const raw = res?.data?.data?.data || res?.data?.data || [];
        const parcels = raw
          .filter((o) => o.booking?.id && o.booking?.status === "IN_TRANSIT")
          .map((o) => ({
            // Display label shown to user
            label: `${o.parcel_ref} — ${o.pickupAddress?.city || "?"} → ${o.deliveryAddress?.city || "?"}`,
            // Formatted ref shown as sub-label (cosmetic only)
            trackingRef: o.booking.tracking_ref || o.booking.booking_ref,
            // Actual UUID used by the backend tracking endpoint — same as order.deliveryId
            bookingId: o.booking.id,
          }));
        setInTransitParcels(parcels);
      })
      .catch(() => {});
  }, [isLoggedIn]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ---------------- LOAD MAP ----------------
  const loadMapScript = async () => {
    if (window.google && window.google.maps) { return; }
    const existingScript = document.getElementById("google-map-script");
    if (existingScript) {
      return new Promise((resolve) => { existingScript.onload = resolve; });
    }
    const apiKey = await ApiService.getMapsKey();
    if (!apiKey) {
      console.error("❌ Could not retrieve Google Maps API key from backend");
      return;
    }
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.id = "google-map-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      document.body.appendChild(script);
    });
  };

  // ---------------- INIT MAP ----------------
  const initMap = async (lat, lng) => {
    await loadMapScript();
    if (!window.google || !window.google.maps) return;
    if (!mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 14,
        gestureHandling: "greedy",
      });
      markerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstance.current,
      });
      mapReadyRef.current = true;
    }
  };

  // ---------------- DRAW ROUTE ----------------
  const drawRoute = async (origin, destination) => {
    if (!mapInstance.current || !destination) return;

    try {
      const data = await ApiService.getDirections(origin, destination, "DRIVE");
      if (!data.success || !data.encodedPolyline) return;

      const path = window.google.maps.geometry.encoding.decodePath(data.encodedPolyline);

      // Remove old DirectionsRenderer if any (legacy cleanup)
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }

      if (!polylineRef.current) {
        polylineRef.current = new window.google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: "#4CAF50",
          strokeOpacity: 0.9,
          strokeWeight: 5,
        });
        polylineRef.current.setMap(mapInstance.current);
      } else {
        polylineRef.current.setPath(path);
      }
    } catch (err) {
      console.error("Route error:", err);
    }
  };

  const hasMovedEnough = (a, b) =>
    Math.abs(a.lat - b.lat) > 0.0005 || Math.abs(a.lng - b.lng) > 0.0005;

  // ---------------- SMOOTH MOVE ----------------
  const smoothMoveMarker = (newPos) => {
    if (!markerRef.current || !mapInstance.current || !mapReadyRef.current) {
      console.warn("⚠️ smoothMoveMarker: marker/map not ready, skipping move to", newPos);
      return;
    }
    const end = newPos;
    const duration = 1000;
    const startTime = performance.now();
    const start = currentPositionRef.current || newPos;
    console.log("🚀 Moving marker:", start, "→", end);
    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const lat = start.lat + (end.lat - start.lat) * progress;
      const lng = start.lng + (end.lng - start.lng) * progress;
      markerRef.current.setPosition({ lat, lng });
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        currentPositionRef.current = end;
        console.log("✅ Marker arrived at:", end);
      }
    };
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animate);
  };

  // ---------------- FETCH TRACKING ----------------
  const fetchTracking = async (key) => {
    try {
      // Use public endpoint if on public route OR not logged in
      const res = isPublicRoute || !isLoggedIn
        ? await ApiService.getPublicTracking(key)
        : await ApiService.getTracking(key);

      const tracking = res.data.tracking;
      if (!tracking) return;
      if (res.data.eta) setEta(res.data.eta);

      const travellerLat = Number(tracking.traveller_lat);
      const travellerLng = Number(tracking.traveller_lng);
      const pickupLat = Number(tracking.pickup_lat);
      const pickupLng = Number(tracking.pickup_lng);
      const deliveryLat = Number(tracking.delivery_lat);
      const deliveryLng = Number(tracking.delivery_lng);

      const pickup = { lat: pickupLat, lng: pickupLng };
      const delivery = { lat: deliveryLat, lng: deliveryLng };
      deliveryLocationRef.current = delivery;

      if (!travellerLat || !travellerLng) {
        await initMap(pickupLat, pickupLng);
        new window.google.maps.Marker({ position: pickup, map: mapInstance.current, icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" });
        new window.google.maps.Marker({ position: delivery, map: mapInstance.current, icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" });
        setTimeout(() => drawRoute(pickup, delivery), 500);
        currentPositionRef.current = pickup;
        return;
      }

      const traveller = { lat: travellerLat, lng: travellerLng };
      await initMap(travellerLat, travellerLng);
      if (markerRef.current) markerRef.current.setPosition(traveller);
      new window.google.maps.Marker({ position: delivery, map: mapInstance.current, icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" });
      drawRoute(traveller, delivery);
      currentPositionRef.current = traveller;
    } catch (err) {
      console.error(" Tracking error:", err);
    }
  };

  // ---------------- SOCKET ----------------
  useEffect(() => {
    if (!trackingKey) return;
    // trackingKey must always be the booking UUID — never a tracking_ref string
    const joinRoom = () => {
      socketRef.current.emit("join-booking", trackingKey);
      console.log("🏠 [Track] Joined booking room:", trackingKey);
    };
    if (socketRef.current.connected) joinRoom();
    else socketRef.current.once("connect", joinRoom);

    const handleLocation = (data) => {
      const lat = Number(data.lat ?? data.traveller_lat);
      const lng = Number(data.lng ?? data.traveller_lng);
      console.log("📡 Socket location-update:", { lat, lng, speed: data.speed, heading: data.heading });
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        console.warn("⚠️ Invalid coords received:", data);
        return;
      }
      if (lat < 6 || lat > 38 || lng < 68 || lng > 98) {
        console.warn("⚠️ Coords out of India bounds, ignoring:", { lat, lng });
        return;
      }
      if (data.eta) setEta(data.eta);
      const newPos = { lat, lng };
      const tryMove = () => {
        if (!mapReadyRef.current || !markerRef.current) {
          console.log("⏳ Map not ready yet, retrying marker move...");
          setTimeout(tryMove, 200);
          return;
        }
        smoothMoveMarker(newPos);
        const now = Date.now();
        if (deliveryLocationRef.current && lastPosRef.current && now - lastRouteUpdateRef.current > 8000 && hasMovedEnough(lastPosRef.current, newPos)) {
          console.log("🛣 Route update triggered (moved enough + 8s elapsed)");
          drawRoute(newPos, deliveryLocationRef.current);
          lastRouteUpdateRef.current = now;
        }
        lastPosRef.current = newPos;
      };
      tryMove();
    };

    socketRef.current.on("location-update", handleLocation);
    return () => {
      socketRef.current.off("location-update", handleLocation);
      socketRef.current.off("connect", joinRoom);
    };
  }, [trackingKey]);

  // ---------------- HANDLE TRACK ----------------
  const handleTrack = () => {
    if (!inputId.trim()) return;
    // Reset map state for new tracking session
    if (polylineRef.current) { polylineRef.current.setMap(null); polylineRef.current = null; }
    mapInstance.current = null;
    markerRef.current = null;
    directionsRendererRef.current = null;
    currentPositionRef.current = null;
    mapReadyRef.current = false;
    setEta(null);

    const trimmed = inputId.trim();
    // If the user typed a tracking_ref (e.g. UBG-001), resolve to the booking UUID
    const matched = inTransitParcels.find(
      (p) => p.trackingRef === trimmed || p.bookingId === trimmed
    );
    const bookingUUID = matched ? matched.bookingId : trimmed;

    setTrackingKey(bookingUUID);
    setIsTracking(true);
  };

  useEffect(() => {
    if (trackingKey && !currentPositionRef.current) {
      fetchTracking(trackingKey);
    }
  }, [trackingKey]);

  const shareUrl = `${window.location.origin}/track/${trackingKey}`;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* Search bar + dropdown */}
      <div className="bg-white rounded-2xl shadow-card p-4 space-y-3">
        <div className="flex gap-3">
          <input
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            placeholder="Enter Tracking ID"
            onKeyDown={(e) => e.key === "Enter" && handleTrack()}
          />
          <button
            onClick={handleTrack}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
          >
            Track
          </button>
        </div>

        {/* Dropdown — only shown to logged-in users with IN_TRANSIT parcels */}
        {isLoggedIn && inTransitParcels.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="w-full flex items-center justify-between gap-2 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              <span className="flex items-center gap-2">
                <FiPackage className="text-blue-500" />
                Select from your active deliveries
              </span>
              <FiChevronDown className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {inTransitParcels.map((p) => (
                  <button
                    key={p.trackingRef}
                    onClick={() => {
                      // Show formatted ref in input (cosmetic), but track using booking UUID
                      setInputId(p.trackingRef || p.bookingId);
                      setDropdownOpen(false);
                      // Reset map for new session
                      if (polylineRef.current) { polylineRef.current.setMap(null); polylineRef.current = null; }
                      mapInstance.current = null;
                      markerRef.current = null;
                      directionsRendererRef.current = null;
                      currentPositionRef.current = null;
                      mapReadyRef.current = false;
                      setEta(null);
                      setTrackingKey(p.bookingId);  // UUID — what backend expects
                      setIsTracking(true);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-0"
                  >
                    <p className="font-medium text-gray-800">{p.label}</p>
                    <p className="text-xs text-blue-600 mt-0.5">Tracking: {p.trackingRef}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isTracking && (
        <>
          {/* ETA + Share bar */}
          <div className="bg-white rounded-2xl shadow-card p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              {eta ? (
                <div>
                  <p className="text-xs text-gray-500">Estimated Arrival</p>
                  <p className="text-xl font-bold text-blue-600">
                    {eta.eta_minutes < 1 ? "Arriving now" : `~${eta.eta_minutes} min`}
                  </p>
                  {eta.remaining_km && (
                    <p className="text-xs text-gray-400">{eta.remaining_km} km remaining</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Waiting for traveller location…</p>
              )}
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                });
              }}
              className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              {copied ? (
                <><FiCheckCircle size={14} /> Copied!</>
              ) : (
                <><FiShare2 size={14} /> Share Tracking Link</>
              )}
            </button>
          </div>

          {/* Map */}
          <div
            ref={mapRef}
            style={{ height: "500px", borderRadius: "16px" }}
            className="shadow-card"
          />
        </>
      )}
    </div>
  );
};

export default Track;

