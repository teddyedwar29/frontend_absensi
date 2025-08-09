// src/components/RoutingMachine.jsx

import { useEffect, useRef } from 'react'; // <-- 1. Impor useRef
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { useMap } from 'react-leaflet';

const RoutingMachine = ({ waypoints, color }) => {
  const map = useMap();
  const routingControlRef = useRef(null); // <-- 2. Buat ref untuk menyimpan instance

  useEffect(() => {
    if (!map) return;

    // Hapus rute lama sebelum membuat yang baru
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    if (waypoints.length < 2) return;

    // Buat instance baru dan simpan di dalam ref
    routingControlRef.current = L.Routing.control({
      waypoints: waypoints.map(wp => L.latLng(wp[0], wp[1])),
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
      createMarker: () => null,
      lineOptions: {
        styles: [{ color: color || '#3b82f6', opacity: 0.8, weight: 6 }]
      }
    }).addTo(map);

  }, [map, waypoints, color]); // <-- 3. Effect ini tetap berjalan saat data berubah

  return null;
};

export default RoutingMachine;