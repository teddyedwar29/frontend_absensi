// src/components/RoutingMachine.jsx

import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { useMap } from 'react-leaflet';

const RoutingMachine = ({ waypoints }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || waypoints.length < 2) return;

    // Membuat instance routing control
    const routingControl = L.Routing.control({
      waypoints: waypoints.map(wp => L.latLng(wp[0], wp[1])),
      routeWhileDragging: true,
      // Menonaktifkan tampilan instruksi belokan-demi-belokan
      show: false, 
      // Menyembunyikan ikon marker default dari plugin ini
      // karena kita sudah punya marker sendiri
      createMarker: () => null, 
      lineOptions: {
        styles: [{ color: 'blue', opacity: 0.8, weight: 6 }]
      }
    }).addTo(map);

    // Membersihkan layer routing saat komponen di-unmount
    return () => {
      map.removeControl(routingControl);
    };
  }, [map, waypoints]);

  return null; // Komponen ini tidak me-render UI, hanya menambahkan layer ke peta
};

export default RoutingMachine;