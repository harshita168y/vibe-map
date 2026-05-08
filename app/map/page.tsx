"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { VibeMap } from "@/components/map/VibeMap";
import { useVibes } from "@/lib/useVibes";
import { createVibe } from "@/lib/createVibe";
import { getDeviceId } from "@/lib/deviceId";
import type { PlaceWithVibes } from "@/types/vibe";
import { reportVibe } from "@/lib/reportVibe";

const vibeTags = [
  "All",
  "Chill",
  "Romantic",
  "Cozy",
  "Music",
  "Party",
  "Study",
  "Food",
  "Fun",
  "Less crowd",
  "JamPacked",
  "Empty",
];

const postTags = vibeTags.filter((tag) => tag !== "All");

type NearbyPlace = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceMeters?: number;
};

type SearchResult = NearbyPlace;

type UserLocation = {
  latitude: number;
  longitude: number;
};
type MapboxPlaceFeature = {
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    mapbox_id: string;
    name?: string;
    full_address?: string;
    place_formatted?: string;
  };
};
function getDistanceKm(
  from: UserLocation,
  to: { latitude: number; longitude: number }
) {
  const earthRadiusKm = 6371;
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLng = ((to.longitude - from.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.latitude * Math.PI) / 180) *
      Math.cos((to.latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatTimeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function MapPage() {
  const [reportingVibeId, setReportingVibeId] = useState<string | null>(null);
  const [selectedReportReason, setSelectedReportReason] = useState("");
  const { places } = useVibes();
  const [popupMessage, setPopupMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedPlace, setSelectedPlace] =
    useState<PlaceWithVibes | null>(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [city, setCity] = useState("Loading...");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

  const [isPostOpen, setIsPostOpen] = useState(false);
  const [postTag, setPostTag] = useState("Chill");
  const [customTag, setCustomTag] = useState("");
  const [vibeText, setVibeText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [mapCenter, setMapCenter] = useState<UserLocation | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [selectedNearbyPlace, setSelectedNearbyPlace] =
    useState<NearbyPlace | null>(null);
  const [isFindingPlaces, setIsFindingPlaces] = useState(false);
  const reportReasons = [
  "Spam",
  "Hate or harassment",
  "Sexual content",
  "Violence or threat",
  "False information",
  "Personal information",
  "Other",
];

  const [mapSearchTarget, setMapSearchTarget] = useState({
    query: "",
    searchId: 0,
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });
  const showPopup = (message: string) => {
  setPopupMessage(message);
};
  const filteredPlaces =
    selectedTag === "All"
      ? places
      : places
          .map((place) => ({
            ...place,
            vibes: place.vibes.filter(
              (vibe) => vibe.vibe_tag === selectedTag
            ),
          }))
          .filter((place) => place.vibes.length > 0);

  const placesNearMe = userLocation
  ? [...filteredPlaces]
      .filter((place) => getDistanceKm(userLocation, place) <= 5)
      .sort(
        (a, b) =>
          getDistanceKm(userLocation, a) - getDistanceKm(userLocation, b)
      )
  : [];

  // const totalVibes = placesNearMe.reduce(
  //   (sum, place) => sum + place.vibes.length,
  //   0
  // );

  const activeCountPlaces = mapCenter
  ? filteredPlaces.filter((place) => getDistanceKm(mapCenter, place) <= 5)
  : filteredPlaces;

const totalVibes = activeCountPlaces.reduce(
  (sum, place) => sum + place.vibes.length,
  0
);

  const selectedVibes =
    selectedPlace?.vibes
      .filter((vibe) =>
        selectedTag === "All" ? true : vibe.vibe_tag === selectedTag
      )
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      ) || [];

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;

    try {
      setIsSearchingPlaces(true);

      const proximity = userLocation
        ? `&proximity=${userLocation.longitude},${userLocation.latitude}`
        : "";

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?types=poi,place,postcode,address&limit=8${proximity}&access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        }`
      );

      const data = await response.json();

      const results: SearchResult[] = (data.features || []).map(
        (feature: {
          id: string;
          text: string;
          place_name: string;
          center: [number, number];
        }) => ({
          id: feature.id,
          name: feature.text,
          address: feature.place_name,
          longitude: feature.center[0],
          latitude: feature.center[1],
        })
      );

      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      showPopup("Could not search places.");
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  const handleSearchResultClick = (result: SearchResult) => {
    setSearchQuery(result.name);
    setSearchResults([]);


      setMapCenter({
        latitude: result.latitude,
        longitude: result.longitude,
      });

    setMapSearchTarget((prev) => ({
      query: result.name,
      latitude: result.latitude,
      longitude: result.longitude,
      searchId: prev.searchId + 1,
    }));
  };

  const useCurrentLocationAsPlace = () => {
    if (!navigator.geolocation) {
      showPopup("Location is not available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentPlace: NearbyPlace = {
          id: `manual-${position.coords.latitude}-${position.coords.longitude}`,
          name: "Current Location",
          address: "Posted from your current location",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setSelectedNearbyPlace(currentPlace);
      },
      () => {
        showPopup("Please allow location access.");
      }
    );
  };
  
 const findNearbyPlaces = async () => {
  if (!navigator.geolocation) {
    showPopup("Location is not available in this browser.");
    return;
  }

  setIsPostOpen(true);
  setIsFindingPlaces(true);
  setSelectedNearbyPlace(null);
  setNearbyPlaces([]);

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lng = position.coords.longitude;
      const lat = position.coords.latitude;

      try {
        const categories = [
            "restaurant",
            "cafe",
            "bar",
            "pub",
            "nightclub",
            "hotel",
            "hostel",
            "shopping_mall",
            "supermarket",
            "convenience_store",
            "clothing_store",
            "shoe_store",
            "jewelry_store",
            "beauty_salon",
            "spa",
            "gym",
            "park",
            "museum",
            "art_gallery",
            "movie_theater",
            "tourist_attraction",
            "library",
            "book_store",
            "university",
            "school",
            "hospital",
            "pharmacy",
            "doctor",
            "train_station",
            "bus_station",
            "subway_station",
            "airport",
            "parking",
            "gas_station",
            "bank",
            "atm",
            "bakery",
            "coffee",
            "beach",
            "stadium",
            "sports_complex",
          ];

                  const requests = await Promise.all(
            categories.map((category) =>
              fetch(
                `https://api.mapbox.com/search/searchbox/v1/category/${category}?proximity=${lng},${lat}&limit=10&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
              ).then((res) => res.json())
            )
          );

        const allFeatures: MapboxPlaceFeature[] = requests.flatMap(
          (data) => data.features || []
        );

        const uniqueFeatures = Array.from(
          new Map(
            allFeatures.map((feature) => [
              feature.properties.mapbox_id,
              feature,
            ])
          ).values()
        );

        const results: NearbyPlace[] = uniqueFeatures
          .map((feature) => {
            const [featureLng, featureLat] = feature.geometry.coordinates;

            const distanceMeters =
              Math.sqrt(
                Math.pow((featureLat - lat) * 111000, 2) +
                  Math.pow(
                    (featureLng - lng) *
                      111000 *
                      Math.cos((lat * Math.PI) / 180),
                    2
                  )
              );

           return {
              id: feature.properties.mapbox_id,
              name: feature.properties.name || "Nearby place",
              address:
                feature.properties.full_address ||
                feature.properties.place_formatted ||
                "Nearby place",
              longitude: featureLng,
              latitude: featureLat,
              distanceMeters,
            };
          })
          .filter((place) => place.distanceMeters <= 700)
          .sort(
            (a, b) =>
              (a.distanceMeters || 0) - (b.distanceMeters || 0)
          )
          .slice(0, 12);

        setNearbyPlaces(results);
      } catch (error) {
        console.error("Nearby places error:", error);
        showPopup("Could not find nearby places.");
      } finally {
        setIsFindingPlaces(false);
      }
    },
    () => {
      setIsFindingPlaces(false);
      showPopup("Please allow location access to post a vibe.");
    }
  );
};
  const handlePostVibe = async () => {
    if (!selectedNearbyPlace) {
      showPopup("Choose a nearby place or use your current location.");
      return;
    }

    const finalTag = customTag.trim() || postTag;

    if (!finalTag) {
      showPopup("Choose or type a vibe tag.");
      return;
    }

    try {
      setIsPosting(true);

      const deviceId = getDeviceId();

      await createVibe({
        placeName: selectedNearbyPlace.name,
        latitude: selectedNearbyPlace.latitude,
        longitude: selectedNearbyPlace.longitude,
        mapboxPlaceId: selectedNearbyPlace.id,
        vibeTag: finalTag,
        vibeText: vibeText.trim(),
        deviceId,
      });

      setVibeText("");
      setCustomTag("");
      setPostTag("Chill");
      setSelectedNearbyPlace(null);
      setNearbyPlaces([]);
      setIsPostOpen(false);
      setIsExpanded(true);
    } catch (error) {
      console.error("Post vibe error:", error);

      if (error instanceof Error) {
        showPopup(error.message);
      } else {
        showPopup("Could not post vibe. Please try again.");
      }
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <AppShell>
      <main
        className={`relative h-[100dvh] overflow-hidden transition-colors ${
          isDarkMode ? "bg-[#0F1117] text-white" : "bg-zinc-100 text-zinc-950"
        }`}
      >
        <div className="absolute inset-0">
          {/* <VibeMap
            places={filteredPlaces}
            isDarkMode={isDarkMode}
            onPlaceSelect={(place) => {
                if (selectedPlace?.id === place.id) {
                  setSelectedPlace(null);
                  setIsExpanded(false);
                  return;
                }

                setSelectedPlace(place);
                setIsExpanded(true);
              }}
            onCityChange={setCity}
            onUserLocationChange={setUserLocation}
            searchTarget={mapSearchTarget}
          /> */}
          <VibeMap
  places={filteredPlaces}
  isDarkMode={isDarkMode}
  selectedPlaceId={selectedPlace?.id || null}
  onPlaceSelect={(place) => {
    if (selectedPlace?.id === place.id) {
      setSelectedPlace(null);
      setIsExpanded(false);
      return;
    }

    setSelectedPlace(place);
    setIsExpanded(true);
  }}
  onCityChange={setCity}
  onUserLocationChange={(location) => {
  setUserLocation(location);
  setMapCenter(location);
}}
  searchTarget={mapSearchTarget}
/>
          <div
            className={`pointer-events-none absolute inset-0 ${
              isDarkMode
                ? "bg-gradient-to-b from-black/10 via-transparent to-black/20"
                : "bg-gradient-to-b from-pink-100/10 via-transparent to-white/10"
            }`}
          />
        </div>

        <div className="absolute left-4 right-4 top-4 z-20">
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-2 shadow-lg backdrop-blur-xl ${
              isDarkMode
                ? "border border-white/5 bg-[#1A1B22]/90"
                : "bg-white/95"
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-base shadow-[0_0_20px_rgba(255,77,166,0.25)]">
              🙂
            </div>

            <div className="min-w-0 flex-1">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={city || "Search place"}
                className={`w-full bg-transparent text-base font-black outline-none ${
                  isDarkMode
                    ? "text-white placeholder:text-zinc-500"
                    : "text-zinc-950 placeholder:text-zinc-400"
                }`}
              />

              <p
                className={`text-[10px] font-semibold leading-none ${
                  isDarkMode ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                Search city, Eircode, places...
              </p>
            </div>

            <button
              type="button"
              onClick={handleSearch}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full active:scale-95 ${
                isDarkMode
                  ? "bg-[#23252F] text-white"
                  : "bg-zinc-100 text-zinc-900"
              }`}
            >
              <Search size={18} />
            </button>

            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full active:scale-95 ${
                isDarkMode
                  ? "bg-[#23252F] text-white"
                  : "bg-zinc-100 text-zinc-900"
              }`}
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>

          {searchQuery.trim() &&
            (isSearchingPlaces || searchResults.length > 0) && (
              <div
                className={`mt-2 max-h-64 overflow-y-auto rounded-3xl p-2 shadow-xl backdrop-blur-xl ${
                  isDarkMode
                    ? "border border-white/5 bg-[#1A1B22]/95"
                    : "bg-white/95"
                }`}
              >
                {isSearchingPlaces ? (
                  <p
                    className={`p-3 text-sm font-semibold ${
                      isDarkMode ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    Searching places...
                  </p>
                ) : (
                  searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSearchResultClick(result)}
                      className={`w-full rounded-2xl p-3 text-left ${
                        isDarkMode ? "hover:bg-[#23252F]" : "hover:bg-pink-50"
                      }`}
                    >
                      <p
                        className={`text-sm font-black ${
                          isDarkMode ? "text-white" : "text-zinc-900"
                        }`}
                      >
                        {result.name}
                      </p>
                      <p className="line-clamp-1 text-xs font-medium text-zinc-500">
                        {result.address}
                      </p>
                    </button>
                  ))
                )}
              </div>
            )}
        </div>

        <motion.section
          animate={{ y: isExpanded ? 0 : 300 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 300 }}
          dragElastic={0.04}
          onDragEnd={(_, info) => {
            if (info.offset.y > 80) setIsExpanded(false);
            if (info.offset.y < -80) setIsExpanded(true);
          }}
          className={`absolute bottom-0 left-0 right-0 z-30 max-h-[58dvh]md: max-h-[62dvh] overflow-hidden rounded-t-[2.5rem] px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl backdrop-blur-xl ${
            isDarkMode
              ? "border-t border-white/5 bg-[#181A20]/90"
              : "bg-white/90"
          }`}
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`mx-auto mb-4 block h-1.5 w-14 rounded-full ${
              isDarkMode ? "bg-white/15" : "bg-zinc-200"
            }`}
          />

          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-blue-400 text-xl shadow-[0_0_30px_rgba(255,77,166,0.22)]">
              ✨
            </div>

            <div className="min-w-0 flex-1">
              <p
                className={`text-sm ${
                  isDarkMode ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                {selectedPlace ? "Selected place" : "Near me"}
              </p>

              <h2 className="truncate text-xl font-black">
                {selectedPlace?.name || "Active vibes nearby"}
              </h2>

              <p
                className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                  isDarkMode
                    ? "bg-[#2A2035] text-pink-300"
                    : "bg-pink-100 text-pink-700"
                }`}
              >
                {selectedTag === "All" ? "All vibes" : selectedTag}
              </p>
            </div>

            <div
              className={`rounded-2xl px-3 py-2 text-center ${
                isDarkMode
                  ? "bg-[#2A2035] text-pink-200"
                  : "bg-pink-100 text-zinc-950"
              }`}
            >
              <p className="text-xl font-black">
                {selectedPlace ? selectedVibes.length : totalVibes}
              </p>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                vibes
              </p>
            </div>
          </div>

          <h3 className="mt-5 text-lg font-black">
            {selectedPlace ? "What people say" : "Near me vibe feed"}
          </h3>

          <div
            className={`mt-2 max-h-28 space-y-2 overflow-y-auto rounded-3xl p-3 ${
              isDarkMode ? "bg-[#15171D]" : "bg-zinc-50"
            }`}
          >
            {selectedPlace ? (
              selectedVibes.length > 0 ? (
                selectedVibes.map((vibe) => (
                  <div
                    key={vibe.id}
                    className={`rounded-2xl p-3 shadow-sm ${
                      isDarkMode
                        ? "bg-[#23252F] text-white"
                        : "bg-white text-zinc-900"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-black text-pink-500">
                        {vibe.vibe_tag}
                      </p>
                      <p
                        className={`text-[10px] font-bold ${
                          isDarkMode ? "text-zinc-500" : "text-zinc-400"
                        }`}
                      >
                        {formatTimeAgo(vibe.created_at)}
                      </p>
                    </div>

                    <p
                      className={`mt-1 text-sm font-medium ${
                        isDarkMode ? "text-zinc-300" : "text-zinc-700"
                      }`}
                    >
                      {vibe.vibe_text || "No comment added"}
                    </p>

                    <button
                        onClick={() => {
                          setReportingVibeId(vibe.id);
                          setSelectedReportReason("");
                        }}
                        className={`mt-2 text-xs font-bold underline ${
                          isDarkMode ? "text-zinc-500" : "text-zinc-400"
                        }`}
                      >
                        Report
                      </button>
                  </div>
                ))
              ) : (
                <p
                  className={`p-2 text-sm font-medium ${
                    isDarkMode ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  No vibes for this filter here yet ✨
                </p>
              )
            ) : placesNearMe.length > 0 ? (
              placesNearMe.slice(0, 8).map((place) => (
                <button
                  key={place.id}
                  onClick={() => {
                    setSelectedPlace(place);
                    setIsExpanded(true);
                    setMapSearchTarget((prev) => ({
                      query: place.name,
                      latitude: place.latitude,
                      longitude: place.longitude,
                      searchId: prev.searchId + 1,
                    }));
                  }}
                  className={`w-full rounded-2xl px-3 py-2 text-left shadow-sm ${
                    isDarkMode
                      ? "bg-[#23252F] text-white"
                      : "bg-white text-zinc-900"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">
                        {place.name}
                      </p>
                      <p
                        className={`text-xs font-semibold ${
                          isDarkMode ? "text-zinc-400" : "text-zinc-500"
                        }`}
                      >
                        {place.vibes.length} active vibes
                        {userLocation
                          ? ` · ${getDistanceKm(userLocation, place).toFixed(
                              1
                            )} km`
                          : ""}
                      </p>
                    </div>

                    <p
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        isDarkMode
                          ? "bg-[#2A2035] text-pink-300"
                          : "bg-pink-100 text-pink-600"
                      }`}
                    >
                      {place.vibes[0]?.vibe_tag}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <p
                className={`p-2 text-sm font-medium ${
                  isDarkMode ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                No active vibes nearby yet. Be the first to post one ✨
              </p>
            )}
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {vibeTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTag(tag);
                  setSelectedPlace(null);
                }}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                  selectedTag === tag
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_20px_rgba(255,77,166,0.25)]"
                    : isDarkMode
                    ? "bg-[#2A2035] text-pink-300"
                    : "bg-pink-50 text-pink-600"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <button
            onClick={findNearbyPlaces}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-pink-500 to-purple-600 py-3 text-base font-black text-white shadow-[0_0_30px_rgba(255,77,166,0.25)] active:scale-[0.98]"
          >
            + Post a vibe
          </button>

        </motion.section>

        {isPostOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 backdrop-blur-sm">
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              className={`mx-auto w-full max-w-md rounded-t-[2.5rem] p-5 shadow-2xl ${
                isDarkMode
                  ? "border-t border-white/5 bg-[#181A20] text-white"
                  : "bg-white text-zinc-950"
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-400">
                    Choose where you are
                  </p>
                  <h2 className="text-xl font-black">Nearby places</h2>
                </div>

                <button
                  onClick={() => setIsPostOpen(false)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    isDarkMode ? "bg-[#23252F]" : "bg-zinc-100"
                  }`}
                >
                  <X size={20} />
                </button>
              </div>

              <div
                className={`mb-4 max-h-40 space-y-2 overflow-y-auto rounded-3xl p-2 ${
                  isDarkMode ? "bg-[#15171D]" : "bg-zinc-50"
                }`}
              >
                {isFindingPlaces ? (
                 <div className="flex items-center gap-3 p-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />

                      <p
                        className={`text-sm font-semibold ${
                          isDarkMode ? "text-zinc-400" : "text-zinc-500"
                        }`}
                      >
                        Finding nearby places...
                      </p>
                    </div>
                ) : nearbyPlaces.length > 0 ? (
                  <>
                    {nearbyPlaces.map((place) => (
                      <button
                        key={place.id}
                        onClick={() => setSelectedNearbyPlace(place)}
                        className={`w-full rounded-2xl p-3 text-left transition-all ${
                          selectedNearbyPlace?.id === place.id
                            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                            : isDarkMode
                            ? "bg-[#23252F] text-white"
                            : "bg-white text-zinc-800"
                        }`}
                      >
                        <p className="text-sm font-black">{place.name}</p>
                        <p
                          className={`line-clamp-1 text-xs ${
                            selectedNearbyPlace?.id === place.id
                              ? "text-white/75"
                              : isDarkMode
                              ? "text-zinc-400"
                              : "text-zinc-500"
                          }`}
                        >
                          {place.address}
                        </p>
                      </button>
                    ))}

                    <button
                      onClick={useCurrentLocationAsPlace}
                      className={`mt-2 w-full rounded-2xl px-4 py-3 text-left text-sm font-black ${
                        selectedNearbyPlace?.name === "Current Location"
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                          : isDarkMode
                          ? "bg-[#23252F] text-white"
                          : "bg-white text-zinc-900"
                      }`}
                    >
                      📍 Use my current location
                    </button>
                  </>
                ) : (
                  <>
                    <p className="p-3 text-sm font-semibold text-zinc-500">
                      No nearby places found.
                    </p>

                    <button
                      onClick={useCurrentLocationAsPlace}
                      className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-black ${
                        selectedNearbyPlace?.name === "Current Location"
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                          : isDarkMode
                          ? "bg-[#23252F] text-white"
                          : "bg-white text-zinc-900"
                      }`}
                    >
                      📍 Use my current location
                    </button>
                  </>
                )}
              </div>

              <p
                className={`text-sm font-black ${
                  isDarkMode ? "text-zinc-200" : "text-zinc-700"
                }`}
              >
                Choose a vibe tag
              </p>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                {postTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setPostTag(tag);
                      setCustomTag("");
                    }}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                      postTag === tag && !customTag
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                        : isDarkMode
                        ? "bg-[#2A2035] text-pink-300"
                        : "bg-pink-50 text-pink-600"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <input
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                maxLength={20}
                placeholder="Or type custom tag"
                className={`mt-3 w-full rounded-2xl px-4 py-3 text-sm font-semibold outline-none ${
                  isDarkMode
                    ? "bg-[#23252F] text-white placeholder:text-zinc-500"
                    : "bg-zinc-100 text-zinc-900"
                }`}
              />

              <textarea
                value={vibeText}
                onChange={(e) => setVibeText(e.target.value)}
                maxLength={120}
                placeholder="What’s happening here? Optional..."
                className={`mt-3 h-24 w-full resize-none rounded-3xl px-4 py-3 text-sm font-semibold outline-none ${
                  isDarkMode
                    ? "bg-[#23252F] text-white placeholder:text-zinc-500"
                    : "bg-zinc-100 text-zinc-900"
                }`}
              />

              <p className="mt-1 text-right text-xs font-medium text-zinc-400">
                {vibeText.length}/120
              </p>

              <button
                onClick={handlePostVibe}
                disabled={isPosting || isFindingPlaces}
                className="mt-4 w-full rounded-3xl bg-gradient-to-r from-pink-500 to-purple-600 py-3 text-base font-black text-white shadow-[0_0_30px_rgba(255,77,166,0.25)] disabled:opacity-60"
              >
                {isPosting ? "Posting..." : "Post vibe"}
              </button>
            </motion.div>
          </div>
        )}

        {popupMessage && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`w-full max-w-xs rounded-[2rem] p-5 text-center shadow-2xl ${
        isDarkMode
          ? "border border-white/10 bg-[#181A20] text-white"
          : "bg-white text-zinc-950"
      }`}
    >
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-xl">
        ✨
      </div>

      <p className="text-sm font-bold">{popupMessage}</p>

      <button
        onClick={() => setPopupMessage("")}
        className="mt-5 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 py-3 text-sm font-black text-white"
      >
        Okay
      </button>
    </motion.div>
  </div>
)}
{reportingVibeId && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`w-full max-w-xs rounded-[2rem] p-5 shadow-2xl ${
        isDarkMode
          ? "border border-white/10 bg-[#181A20] text-white"
          : "bg-white text-zinc-950"
      }`}
    >
      <h3 className="text-center text-lg font-black">Report vibe</h3>
      <p className="mt-1 text-center text-xs font-medium text-zinc-500">
        What’s the issue with this vibe?
      </p>

      <div className="mt-4 space-y-2">
        {reportReasons.map((reason) => (
          <button
            key={reason}
            onClick={() => setSelectedReportReason(reason)}
            className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-bold ${
              selectedReportReason === reason
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                : isDarkMode
                ? "bg-[#23252F] text-white"
                : "bg-zinc-100 text-zinc-900"
            }`}
          >
            {reason}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => {
            setReportingVibeId(null);
            setSelectedReportReason("");
          }}
          className={`flex-1 rounded-2xl py-3 text-sm font-black ${
            isDarkMode ? "bg-[#23252F] text-white" : "bg-zinc-100 text-zinc-800"
          }`}
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            if (!selectedReportReason) {
              showPopup("Please choose a reason.");
              return;
            }

           try {
              const result = await reportVibe(
                reportingVibeId,
                selectedReportReason,
                getDeviceId()
              );

              if (result.alreadyReported) {
                setReportingVibeId(null);
                setSelectedReportReason("");
                showPopup("You already reported this vibe.");
                return;
              }

              if (!result.ok) {
                showPopup(result.message || "Could not report this vibe.");
                return;
              }

              setReportingVibeId(null);
              setSelectedReportReason("");
              showPopup("Thanks. This vibe has been reported.");
            } catch {
              showPopup("Could not report this vibe.");
            }
                        }}
          className="flex-1 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 py-3 text-sm font-black text-white"
        >
          Submit
        </button>
      </div>
    </motion.div>
  </div>
)}
      </main>
    </AppShell>
  );
}