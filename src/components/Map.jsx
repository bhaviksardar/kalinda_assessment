import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapboxNearbyView() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(loc);

        // Generate random nearby places
        const randomPlaces = Array.from({ length: 10 }, (_, i) => {
          const offsetLat = (Math.random() - 0.5) * 0.01;
          const offsetLng = (Math.random() - 0.5) * 0.01;
          return {
            id: i + 1,
            name: `Restaurant ${i + 1}`,
            lat: loc.lat + offsetLat,
            lng: loc.lng + offsetLng,
            address: `${100 + i} Main St`,
            number: `510-555-010${i}`,
          };
        });
        setPlaces(randomPlaces);
      },
      (err) => {
        console.error("Geolocation error:", err);
        // fallback location
        const fallback = { lat: 37.7749, lng: -122.4194 };
        setUserLocation(fallback);
      }
    );
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!userLocation || mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [userLocation.lng, userLocation.lat],
      zoom: 14,
    });

    // User marker
    new mapboxgl.Marker({ color: "blue" })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(mapRef.current);
  }, [userLocation]);

  // Add place markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers
    mapRef.current.markers?.forEach((m) => m.remove());

    // Add new markers
    mapRef.current.markers = places.map((place) => {
      const marker = new mapboxgl.Marker()
        .setLngLat([place.lng, place.lat])
        .addTo(mapRef.current);

      marker.getElement().addEventListener("click", () => {
        setSelectedPlace(place);
        mapRef.current.flyTo({ center: [place.lng, place.lat], zoom: 16 });
      });

      return marker;
    });
  }, [places]);

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Map */}
      <div className="flex-1" ref={mapContainer}></div>

      {/* Side list */}
      <div className="w-80 bg-white overflow-auto">
        {places.map((place) => (
          <div
            key={place.id}
            className={`p-3 cursor-pointer text-black hover:bg-gray-100 ${
              selectedPlace?.id === place.id ? "bg-gray-200" : ""
            }`}
            onClick={() => {
              setSelectedPlace(place);
              mapRef.current.flyTo({ center: [place.lng, place.lat], zoom: 16 });
            }}
          >
            <h3 className="font-semibold">{place.name}</h3>
            {place.address && <p className="text-sm">{place.address}</p>}
            {place.number && <p className="text-sm">{place.number}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
