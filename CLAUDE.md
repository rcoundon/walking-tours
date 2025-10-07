# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a standalone Charles Dickens London Walking Tour application that creates an interactive map and route guide for a 22-stop walking tour through historic Dickens-related sites in London.

**Key Files:**
- `index.html` - Main application with split-screen map and directions panel
- `route.js` - All routing logic, map initialization, and marker management
- `route-info.html` - Static detailed route guide with historical context

## Architecture

### Single-Page Application Structure

The application uses HERE Maps JavaScript API v3.1 with a simple, monolithic architecture:

1. **Data Layer**: `tourStops` array in `route.js:6-29` contains all 22 waypoints with coordinates and labels
2. **Map Rendering**: HERE Maps Platform initialized in `route.js:36-55`
3. **Routing**: Multi-waypoint pedestrian route calculated via HERE Routing Service v8 (`route.js:402-424`)
4. **UI Components**:
   - Custom SVG markers for START/END/numbered stops (`route.js:129-178`)
   - Route polylines with automatic bounds calculation (`route.js:80-124`)
   - Maneuver dots for turn-by-turn navigation (`route.js:184-224`)
   - Side panel with summary, stops list, and directions (`route.js:229-396`)

### Key Technical Details

**API Key**: Hardcoded in `route.js:37` - `IH0DsEX3ls2FfQ69s6s94JJsE4-yCUVq6lbDoqP8kdc`

**Routing Parameters** (`route.js:414-421`):
- Mode: `pedestrian`
- Origin/Destination: First and last stops from `tourStops`
- Via waypoints: All intermediate stops (20 waypoints)
- Returns: Polyline, turn-by-turn actions, travel summary

**Marker System**:
- START: Green circle (36px) with "START" text
- END: Red circle (36px) with "END" text
- Stops 1-18: Blue circles (32px) with stop number labels
- Maneuvers: Small blue dots (18px) at turn points

**Panel Structure** (rendered in order):
1. Tour summary with distance/time/stop count (`addSummaryToPanel`)
2. Numbered list of all tour stops (`addTourStopsToPanel`)
3. Turn-by-turn directions with arrival points highlighted (`addManueversToPanel`)

### Route Calculation Flow

```
calculateDickensRoute()
  → HERE Routing Service API call
    → onSuccess()
      → addRouteShapeToMap() - draws blue polyline
      → addTourStopMarkers() - adds numbered markers
      → addManueversToMap() - adds turn indicators
      → addSummaryToPanel() - displays route info
      → addTourStopsToPanel() - lists all stops
      → addManueversToPanel() - lists directions
```

## Running the Application

**No build process required** - this is a static HTML/JS application.

Simply open `index.html` in a web browser. The application will:
1. Load HERE Maps libraries from CDN
2. Initialize map centered on London (51.510, -0.110)
3. Calculate route through all 22 stops
4. Render map + directions panel

For local development, use any static file server:
```bash
python -m http.server 8000
# or
npx serve .
```

## Modifying Tour Stops

To add/remove/reorder stops, edit the `tourStops` array in `route.js:6-29`. Each stop requires:
- `name`: Full descriptive name
- `label`: Short label for marker (e.g., "1", "1a", "START")
- `lat`: Latitude coordinate
- `lng`: Longitude coordinate

The routing automatically recalculates based on array order.

## Styling and Layout

**Responsive Design:**
- Desktop: Side-by-side map (60% flex) + panel (400px fixed)
- Mobile (<768px): Stacked layout with 400px map height
- Print: Map on page 1, full directions on subsequent pages

**Print Optimization** (`index.html:144-263`):
- Map prints at 700px height on first page
- Directions span multiple pages with page-break controls
- Arrival points styled to avoid breaks
- Buttons/links hidden in print view

## Historical Accuracy Note

The tour includes a correction about Warren's Blacking Factory locations:
- Villiers Street stop (labeled "1") has a Kipling plaque but NO Dickens connection
- Actual factory sites were at Hungerford Stairs (beneath Charing Cross) and 6 Chandos Place
- Both `route.js` and `route-info.html` document this for historical accuracy
