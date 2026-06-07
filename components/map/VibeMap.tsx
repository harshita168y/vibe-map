"use client";

import mapboxgl from "mapbox-gl";
import type { PlaceWithVibes } from "@/types/vibe";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";

type SearchTarget = {
  query: string;
  searchId: number;
  longitude?: number;
  latitude?: number;
};

// type VibeMapProps = {
//   places: PlaceWithVibes[];
//   onPlaceSelect: (place: PlaceWithVibes) => void;
//   onCityChange: (city: string) => void;
//   onUserLocationChange: (location: {
//     latitude: number;
//     longitude: number;
//   }) => void;
//   searchTarget: SearchTarget;
//   isDarkMode: boolean;
// };

type VibeMapProps = {
  places: PlaceWithVibes[];
  selectedPlaceId: string | null;
  onPlaceSelect: (place: PlaceWithVibes) => void;
  onCityChange: (city: string) => void;
 onUserLocationChange: (location: {
    latitude: number;
    longitude: number;
  }) => void;
  onMapCenterChange?: (location: {
    latitude: number;
    longitude: number;
  }) => void;
  searchTarget: SearchTarget;
  isDarkMode: boolean;
};
type MapboxFeature = {
  place_type: string[];
  text: string;
};

export function VibeMap({
  places,
  selectedPlaceId,
  onPlaceSelect,
  onCityChange,
  onUserLocationChange,
  onMapCenterChange,
  searchTarget,
  isDarkMode,
}: VibeMapProps) {
  const [zoomLevel, setZoomLevel] = useState(12);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      onCityChange("Location off");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const lng = position.coords.longitude;
      const lat = position.coords.latitude;

      onUserLocationChange({
        latitude: lat,
        longitude: lng,
      });

      mapRef.current?.flyTo({
        center: [lng, lat],
        zoom: 14,
        essential: true,
      });

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
        );

        const data = await response.json();

        const cityFeature = data.features?.find((feature: MapboxFeature) =>
          feature.place_type.includes("place")
        );

        onCityChange(cityFeature?.text || "Nearby");
      } catch {
        onCityChange("Nearby");
      }
    });
  };

  const renderMarkers = () => {
    if (!mapRef.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    places.forEach((place) => {
      const topTag = place.vibes[0]?.vibe_tag || "Vibe";
      const vibeCount = place.vibes.length;

      const markerBg = isDarkMode
        ? "rgba(26,27,34,0.92)"
        : "rgba(255,255,255,0.96)";

      const markerText = isDarkMode ? "#ffffff" : "#18181b";
      const markerSubText = isDarkMode ? "#a1a1aa" : "#71717a";

      const glowColor = isDarkMode
        ? "rgba(155,92,255,0.35)"
        : "rgba(236,72,153,0.22)";

      const borderColor = isDarkMode
        ? "rgba(255,255,255,0.08)"
        : "rgba(255,255,255,0.5)";

      const markerEl = document.createElement("div");
      const isCompactMarker = zoomLevel < 13;
      markerEl.style.cursor = "pointer";

     markerEl.innerHTML = isCompactMarker
  ? `
    <div style="position: relative;">
      <div style="
        position:absolute;
        inset:0;
        width:28px;
        height:28px;
        background:${glowColor};
        border-radius:999px;
        animation:pulse 2s infinite;
        transform:translate(-6px,-6px);
      "></div>

      <div style="
        position:relative;
        width:22px;
        height:22px;
        border-radius:999px;
        background:linear-gradient(135deg,#ec4899,#8b5cf6);
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-size:11px;
        font-weight:900;
        box-shadow:0 8px 22px rgba(236,72,153,0.35);
        border:1px solid ${borderColor};
      ">
        ✦
      </div>
    </div>
  `
  : `
    <div style="position: relative;">
      <div style="
        position:absolute;
        inset:0;
        width:46px;
        height:46px;
        background:${glowColor};
        border-radius:999px;
        animation:pulse 2s infinite;
        transform:translate(-5px,-5px);
      "></div>

      <div style="
        position:relative;
        display:flex;
        align-items:center;
        gap:7px;
        background:${markerBg};
        color:${markerText};
        border:1px solid ${borderColor};
        backdrop-filter:blur(14px);
        border-radius:999px;
        padding:6px 10px;
        box-shadow:0 10px 25px rgba(0,0,0,0.22);
        font-size:11px;
        font-weight:800;
        white-space:nowrap;
      ">
        <div style="
          width:32px;
          height:32px;
          border-radius:999px;
          background:linear-gradient(135deg,#ec4899,#8b5cf6);
          display:flex;
          align-items:center;
          justify-content:center;
          color:white;
          font-size:13px;
        ">
          ${vibeCount}
        </div>

        <div>
          <div>${place.name}</div>
          <div style="font-size:9px;color:${markerSubText};margin-top:1px;">
            ${topTag} · ${vibeCount} vibes
          </div>
        </div>
      </div>
    </div>
  `;
      markerEl.addEventListener("click", () => {
        const isSamePlace = selectedPlaceId === place.id;

        onPlaceSelect(place);

        if (!isSamePlace) {
          mapRef.current?.flyTo({
            center: [place.longitude, place.latitude],
            zoom: 16,
            essential: true,
          });
        }
      });

      const marker = new mapboxgl.Marker({
        element: markerEl,
        anchor: "center",
      })
        .setLngLat([place.longitude, place.latitude])
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    mapboxgl.accessToken =
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: isDarkMode
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/streets-v12",
      center: [-6.2603, 53.3498],
      zoom: 12,
    });

    mapRef.current.on("load", () => {
      setMapLoaded(true);
      getUserLocation();
    });
    mapRef.current.on("zoomend", () => {
        const zoom = mapRef.current?.getZoom();

        if (zoom) {
          setZoomLevel(zoom);
        }
      });
      mapRef.current.on("moveend", () => {
  const center = mapRef.current?.getCenter();

  if (center) {
    onMapCenterChange?.({
      latitude: center.lat,
      longitude: center.lng,
    });
  }
});
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.setStyle(
      isDarkMode
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/streets-v12"
    );

    mapRef.current.once("styledata", () => {
      renderMarkers();
    });
  }, [isDarkMode]);

  useEffect(() => {
    if (!searchTarget.query.trim() || !mapRef.current) return;

    if (searchTarget.longitude && searchTarget.latitude) {
      mapRef.current.flyTo({
        center: [searchTarget.longitude, searchTarget.latitude],
        zoom: 15,
        essential: true,
      });

      onCityChange(searchTarget.query);
    }
  }, [
    searchTarget.searchId,
    searchTarget.query,
    searchTarget.longitude,
    searchTarget.latitude,
    onCityChange,
  ]);

useEffect(() => {
  if (!mapLoaded) return;
  renderMarkers();
}, [places, isDarkMode, selectedPlaceId, mapLoaded, zoomLevel]);

  return (
    <>
      <div ref={mapContainerRef} className="h-full w-full" />

      <button
        onClick={getUserLocation}
        className={`absolute right-4 top-24 z-20 flex h-11 w-11 items-center justify-center rounded-full shadow-lg backdrop-blur-xl ${
          isDarkMode
            ? "border border-white/5 bg-[#1A1B22]/90 text-white"
            : "bg-white/95 text-zinc-900"
        }`}
      >
        📍
      </button>
    </>
  );
}