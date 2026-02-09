import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { type Task } from "@shared/routes";
import { useEffect } from "react";

// Fix Leaflet default icon issue
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerIcon2xPng from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = new Icon({
  iconUrl: markerIconPng,
  iconRetinaUrl: markerIcon2xPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom Icon for Priority Tasks
const PriorityIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to recenter map when tasks change
function RecenterMap({ lat, lng }: { lat: number, lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
}

interface MapComponentProps {
  tasks: Task[];
  center?: [number, number];
  zoom?: number;
}

export function MapComponent({ tasks, center = [40.7128, -74.0060], zoom = 12 }: MapComponentProps) {
  return (
    <div className="h-full w-full rounded-2xl overflow-hidden shadow-inner border border-border">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {tasks.map((task) => (
          <Marker 
            key={task.id} 
            position={[task.lat, task.lng]}
            icon={task.calculatedPriority && task.calculatedPriority > 0.7 ? PriorityIcon : DefaultIcon}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-sm mb-1">{task.location || "Waste Report"}</h3>
                <p className="text-xs text-muted-foreground mb-2">Priority Score: {task.calculatedPriority?.toFixed(2)}</p>
                <div className="relative aspect-video w-32 rounded-md overflow-hidden bg-muted">
                  <img src={task.imageUrl} alt="Waste" className="object-cover w-full h-full" />
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        <RecenterMap lat={center[0]} lng={center[1]} />
      </MapContainer>
    </div>
  );
}
