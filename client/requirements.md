## Packages
recharts | For analytics charts (Privacy Protection Rate, Efficiency)
leaflet | For the map view in Collector Dashboard
react-leaflet | React components for Leaflet maps
framer-motion | For smooth animations (page transitions, scanning effects)
clsx | Utility for conditional classes
tailwind-merge | Utility for merging tailwind classes

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  body: ["var(--font-body)"],
}
The app simulates privacy scanning. The privacy check endpoint returns simulated bounding boxes.
Auth is handled via Replit Auth (useAuth hook).
