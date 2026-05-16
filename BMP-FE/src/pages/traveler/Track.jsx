import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { TextField, Button, Paper, Typography, Grid } from "@mui/material";
import { getSocket } from "../../core/services/websocket.service";
import ApiService from "../../core/services/api.service";

const Track = () => {
  const { id: urlId } = useParams();

  const [inputId, setInputId] = useState(urlId || "");
  const [trackingKey, setTrackingKey] = useState(urlId || "");
  const [isTracking, setIsTracking] = useState(!!urlId);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);

  const deliveryLocationRef = useRef(null);
  const directionsRendererRef = useRef(null);

  const lastPosRef = useRef(null);
  const lastRouteUpdateRef = useRef(0);

  const socket = getSocket();

  // ---------------- LOAD MAP ----------------
  const loadMapScript = async () => {
    if (window.google && window.google.maps) {
      console.log("✅ Google Maps already loaded");
      return;
    }

    // Reuse an in-flight load if one is already pending
    const existingScript = document.getElementById("google-map-script");
    if (existingScript) {
      return new Promise((resolve) => { existingScript.onload = resolve; });
    }

    console.log("📦 Fetching Maps key from backend...");
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
      script.onload = () => {
        console.log("✅ Google Maps loaded");
        resolve();
      };
      document.body.appendChild(script);
    });
  };

  // ---------------- INIT MAP ----------------
  const initMap = async (lat, lng) => {
    console.log("🗺 Init map:", lat, lng);

    await loadMapScript();

    if (!mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 14,
      });

      markerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstance.current,
      });

      console.log("✅ Map + Marker initialized");
    }
  };

  // ---------------- ROUTE ----------------
  const drawRoute = async (origin, destination) => {
    console.log("Drawing route:", origin, destination);
    if (!mapInstance.current || !destination) return;

    try {
      const data = await ApiService.getDirections(origin, destination, "DRIVE");
      if (!data.success || !data.encodedPolyline) {
        console.warn("⚠️ No route returned from backend");
        return;
      }

      // Decode the encoded polyline and draw it on the map
      const path = window.google.maps.geometry.encoding.decodePath(data.encodedPolyline);

      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }

      if (!polylineRef.current) {
        polylineRef.current = new window.google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: "#4285F4",
          strokeOpacity: 0.9,
          strokeWeight: 5,
        });
        polylineRef.current.setMap(mapInstance.current);
      } else {
        polylineRef.current.setPath(path);
      }
    } catch (err) {
      console.error("❌ Route error:", err);
    }
  };

  // ---------------- FETCH TRACKING ----------------
  const fetchTracking = async (key) => {
    try {
      console.log("📡 Fetch tracking:", key);

      const res = await ApiService.getTracking(key);
      const t = res.data.tracking;

      console.log("📦 API response:", t);

      const travellerLat = Number(t.traveller_lat);
      const travellerLng = Number(t.traveller_lng);

      const pickup = {
        lat: Number(t.pickup_lat),
        lng: Number(t.pickup_lng),
      };

      const delivery = {
        lat: Number(t.delivery_lat),
        lng: Number(t.delivery_lng),
      };

      deliveryLocationRef.current = delivery;

      if (isNaN(travellerLat) || isNaN(travellerLng)) {
        console.log("📍 No traveller yet, using pickup");

        await initMap(pickup.lat, pickup.lng);
        drawRoute(pickup, delivery);
        return;
      }

      const traveller = { lat: travellerLat, lng: travellerLng };

      await initMap(traveller.lat, traveller.lng);

      markerRef.current.setPosition(traveller);
      console.log("🚀 Initial marker set:", traveller);

      drawRoute(traveller, delivery);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
  };

  // ---------------- SOCKET ----------------
  useEffect(() => {
    if (!trackingKey) return;

    console.log("🔌 Joining booking room:", trackingKey);

    const joinRoom = () => {
      socket.emit("join-booking", trackingKey);
      console.log("✅ join-booking emitted");
    };

    socket.connected ? joinRoom() : socket.once("connect", joinRoom);

    const handleLocation = (data) => {
      console.log("📡 Socket data:", data);

      const lat = Number(data.lat);
      const lng = Number(data.lng);

      console.log("📍 Parsed:", lat, lng);

      if (isNaN(lat) || isNaN(lng)) {
        console.warn("⚠️ Invalid coords");
        return;
      }

      const newPos = { lat, lng };

      console.log("🚀 Moving marker to:", newPos);
      console.log("🧭 MarkerRef:", markerRef.current);

      if (markerRef.current && mapInstance.current) {
        markerRef.current.setPosition(newPos);
        mapInstance.current.panTo(newPos);
        console.log("✅ Marker moved");
      } else {
        console.error("❌ Marker not ready");
      }

      // distance debug
      if (lastPosRef.current) {
        const dist = Math.sqrt(
          Math.pow(lat - lastPosRef.current.lat, 2) +
          Math.pow(lng - lastPosRef.current.lng, 2)
        );
        console.log("📏 Distance:", dist);
      }

      lastPosRef.current = newPos;

      // route update every 5 sec
      const now = Date.now();
      if (
        deliveryLocationRef.current &&
        now - lastRouteUpdateRef.current > 5000
      ) {
        console.log("🛣 Updating route...");
        drawRoute(newPos, deliveryLocationRef.current);
        lastRouteUpdateRef.current = now;
      }
    };

    socket.on("location-update", handleLocation);

    return () => {
      socket.off("location-update", handleLocation);
      socket.off("connect", joinRoom);
    };
  }, [trackingKey]);

  // ---------------- TRACK BUTTON ----------------
  const handleTrack = () => {
    if (!inputId.trim()) return;

    console.log("🎯 Track clicked:", inputId);

    setTrackingKey(inputId);
    setIsTracking(true);
    fetchTracking(inputId);
  };

  useEffect(() => {
    if (trackingKey) fetchTracking(trackingKey);
  }, [trackingKey]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Track Parcel</Typography>

        <Grid container spacing={2}>
          <Grid item xs={8}>
            <TextField
              fullWidth
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder="Enter Tracking ID"
            />
          </Grid>

          <Grid item xs={4}>
            <Button fullWidth variant="contained" onClick={handleTrack}>
              Track
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {isTracking && (
        <div
          ref={mapRef}
          style={{ height: "500px", borderRadius: "10px" }}
        />
      )}
    </div>
  );
};

export default Track;