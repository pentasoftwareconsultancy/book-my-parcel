import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// One colour per route slot
const ROUTE_COLORS = ["#2563EB", "#D97706", "#059669"];

export default function RouteAlternativesMap({ alternatives, selectedIdx, onSelect, origin, destination }) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const polylinesRef = useRef([]);
  const markersRef   = useRef([]);

  // Build/rebuild the map whenever the container mounts or alternatives change
  useEffect(() => {
    if (!containerRef.current || !alternatives?.length) return;

    // Collect all decoded paths
    const paths = alternatives.map((a) => a.decodedPath || []);
    const hasGeometry = paths.some((p) => p.length > 0);
    if (!hasGeometry) return;

    // Create map once
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(mapRef.current);
    }
    const map = mapRef.current;

    // Clear previous overlays
    polylinesRef.current.forEach((p) => p.remove());
    markersRef.current.forEach((m) => m.remove());
    polylinesRef.current = [];
    markersRef.current   = [];

    // Draw polylines — non-selected routes first so selected renders on top
    const order = [...alternatives.map((_, i) => i)].sort((a, b) =>
      a === selectedIdx ? 1 : b === selectedIdx ? -1 : 0
    );

    const bounds = L.latLngBounds([]);

    order.forEach((idx) => {
      const path = paths[idx];
      if (!path.length) return;

      const isSelected = idx === selectedIdx;
      const line = L.polyline(path, {
        color:   ROUTE_COLORS[idx % ROUTE_COLORS.length],
        weight:  isSelected ? 6 : 3,
        opacity: isSelected ? 1 : 0.35,
      }).addTo(map);

      line.on("click", () => onSelect(idx));
      line.getElement()?.style && (line.getElement().style.cursor = "pointer");
      polylinesRef.current.push(line);
      path.forEach((pt) => bounds.extend(pt));
    });

    // A / B markers using CircleMarker to avoid Leaflet icon asset issues
    const addLabel = (latLng, label, color) => {
      const m = L.circleMarker(latLng, {
        radius: 10, color: "#fff", weight: 2, fillColor: color, fillOpacity: 1,
      }).addTo(map).bindTooltip(label, { permanent: true, direction: "center", className: "leaflet-label-marker" });
      markersRef.current.push(m);
    };

    const oLat = Number(origin?.originLatitude  || origin?.latitude);
    const oLng = Number(origin?.originLongitude || origin?.longitude);
    const dLat = Number(destination?.latitude);
    const dLng = Number(destination?.longitude);

    if (oLat && oLng) { addLabel([oLat, oLng], "A", "#16a34a"); bounds.extend([oLat, oLng]); }
    if (dLat && dLng) { addLabel([dLat, dLng], "B", "#dc2626"); bounds.extend([dLat, dLng]); }

    if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30] });

    return () => {
      // Cleanup only on unmount, not on every re-render
    };
  // Re-run when selectedIdx changes to redraw line weights/opacities
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alternatives, selectedIdx]);

  // Destroy map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  return (
    <>
      <style>{`.leaflet-label-marker { background: none; border: none; box-shadow: none; font-weight: 700; font-size: 11px; color: #fff; }`}</style>
      <div ref={containerRef} style={{ height: 280, width: "100%", borderRadius: 12, overflow: "hidden" }} />
    </>
  );
}
