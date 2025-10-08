/**
 * Charles Dickens London Walking Tour - Multi-Waypoint Route
 */

// Tour stops extracted from KML file with display labels
const tourStops = [
  { name: "START - Waterloo Station", label: "START", lat: 51.503538, lng: -0.113195 },
  { name: "1. Villiers Street - Kipling House", label: "1", lat: 51.507500, lng: -0.123889 },
  { name: "1a. Warren's Blacking Factory - First Site", label: "1a", lat: 51.507208, lng: -0.122474 },
  { name: "1b. Warren's Blacking Factory - Second Site", label: "1b", lat: 51.509722, lng: -0.126944 },
  { name: "2. Royal Society of Arts", label: "2", lat: 51.509167, lng: -0.122778 },
  { name: "3. Rules Restaurant", label: "3", lat: 51.510833, lng: -0.122500 },
  { name: "4. Bow Street", label: "4", lat: 51.512500, lng: -0.122222 },
  { name: "5. Dickens Magazine Offices", label: "5", lat: 51.512222, lng: -0.120278 },
  { name: "6. The Old Curiosity Shop", label: "6", lat: 51.514722, lng: -0.117222 },
  { name: "7. Sir John Soane's Museum", label: "7", lat: 51.517222, lng: -0.117778 },
  { name: "8a. Lincoln's Inn", label: "8a", lat: 51.516389, lng: -0.116111 },
  { name: "8b. Gray's Inn", label: "8b", lat: 51.519444, lng: -0.110833 },
  { name: "9. Royal Courts of Justice", label: "9", lat: 51.513889, lng: -0.112778 },
  { name: "10. St Dunstan-in-the-West", label: "10", lat: 51.514167, lng: -0.108889 },
  { name: "11. Ye Olde Cheshire Cheese", label: "11", lat: 51.514444, lng: -0.107222 },
  { name: "12. Dr Johnson's House", label: "12", lat: 51.515278, lng: -0.108333 },
  { name: "13. Took's Court", label: "13", lat: 51.515833, lng: -0.109722 },
  { name: "14. Staple Inn", label: "14", lat: 51.517500, lng: -0.111944 },
  { name: "15. Furnival's Inn Site", label: "15", lat: 51.517778, lng: -0.113889 },
  { name: "17. Marshalsea Prison Site", label: "17", lat: 51.500556, lng: -0.093333 },
  { name: "18. The George Inn", label: "18", lat: 51.504444, lng: -0.089722 },
  { name: "END - Borough Market", label: "END", lat: 51.505278, lng: -0.090556 }
];

// Set up containers for the map + panel
const mapContainer = document.getElementById("map"),
  routeInstructionsContainer = document.getElementById("panel");

// Step 1: initialize communication with the platform
const platform = new H.service.Platform({
  apikey: "HERE_MAPS_API_KEY",
});
const defaultLayers = platform.createDefaultLayers();

// Step 2: initialize a map - centered on London
const map = new H.Map(mapContainer, defaultLayers.vector.normal.map, {
  center: { lat: 51.510, lng: -0.110 },
  zoom: 13,
  pixelRatio: window.devicePixelRatio || 1,
});

// Add a resize listener to make sure that the map occupies the whole container
window.addEventListener("resize", () => map.getViewPort().resize());

// Step 3: make the map interactive
new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

// Create the default UI components
const ui = H.ui.UI.createDefault(map, defaultLayers);

// Hold a reference to any infobubble opened
let bubble;

// Hold a reference to the user's position marker
let userPositionMarker = null;

/**
 * Opens/Closes an infobubble
 * @param  {H.geo.Point} position     The location on the map.
 * @param  {String} text              The contents of the infobubble.
 */
function openBubble(position, text) {
  if (!bubble) {
    bubble = new H.ui.InfoBubble(position, { content: text });
    ui.addBubble(bubble);
  } else {
    bubble.setPosition(position);
    bubble.setContent(text);
    bubble.open();
  }
}

/**
 * Gets the user's current position and displays it on the map
 */
function showUserPosition() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;
      const accuracy = position.coords.accuracy;

      // Create a custom marker for user position (pulsing blue dot)
      const userIcon = new H.map.Icon(
        '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="12" cy="12" r="10" fill="#4285F4" stroke="white" stroke-width="3" opacity="0.9"/>' +
        '<circle cx="12" cy="12" r="4" fill="white"/>' +
        '</svg>',
        { anchor: { x: 12, y: 12 } }
      );

      // Remove old marker if it exists
      if (userPositionMarker) {
        map.removeObject(userPositionMarker);
      }

      // Add new marker
      userPositionMarker = new H.map.Marker(
        { lat: userLat, lng: userLng },
        { icon: userIcon }
      );

      userPositionMarker.setData(`Your Location<br>Accuracy: ${Math.round(accuracy)}m`);

      userPositionMarker.addEventListener('tap', (evt) => {
        openBubble(evt.target.getGeometry(), evt.target.getData());
      });

      map.addObject(userPositionMarker);

      // Center map on user position
      map.setCenter({ lat: userLat, lng: userLng });
      map.setZoom(16);
    },
    (error) => {
      let errorMessage = "Unable to get your location";
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location permission denied. Please enable location access in your browser.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information unavailable.";
          break;
        case error.TIMEOUT:
          errorMessage = "Location request timed out.";
          break;
      }
      alert(errorMessage);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

/**
 * Adds a "Show my position" button to the map
 */
function addLocateMeButton() {
  // Create button element
  const locateButton = document.createElement('button');
  locateButton.innerHTML = '📍 My position';
  locateButton.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 10px 16px;
    background: #4285F4;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    z-index: 1000;
    transition: all 0.2s;
    white-space: nowrap;
  `;

  locateButton.addEventListener('mouseenter', () => {
    locateButton.style.background = '#3367D6';
    locateButton.style.boxShadow = '0 3px 8px rgba(0,0,0,0.4)';
  });

  locateButton.addEventListener('mouseleave', () => {
    locateButton.style.background = '#4285F4';
    locateButton.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
  });

  locateButton.addEventListener('click', () => {
    locateButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
      locateButton.style.transform = 'scale(1)';
    }, 100);
    showUserPosition();
  });

  // Add button to map container
  mapContainer.style.position = 'relative';
  mapContainer.appendChild(locateButton);
}

/**
 * Creates a H.map.Polyline from the shape of the route and adds it to the map.
 * @param {Object} route A route as received from the H.service.RoutingService
 */
function addRouteShapeToMap(route) {
  const allCoordinates = [];
  
  route.sections.forEach((section) => {
    // Decode LineString from the flexible polyline
    const linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);

    // Create a polyline to display the route
    const polyline = new H.map.Polyline(linestring, {
      style: {
        lineWidth: 4,
        strokeColor: "rgba(0, 128, 255, 0.7)",
      },
    });

    // Add the polyline to the map
    map.addObject(polyline);
    
    // Collect coordinates for bounds calculation
    const coords = linestring.getLatLngAltArray();
    for (let i = 0; i < coords.length; i += 3) {
      allCoordinates.push({ lat: coords[i], lng: coords[i + 1] });
    }
  });
  
  // Add all tour stop coordinates to ensure they're in bounds
  tourStops.forEach(stop => {
    allCoordinates.push({ lat: stop.lat, lng: stop.lng });
  });
  
  // Calculate bounds that include all points
  if (allCoordinates.length > 0) {
    const bounds = new H.geo.Rect(
      Math.max(...allCoordinates.map(c => c.lat)),
      Math.min(...allCoordinates.map(c => c.lng)),
      Math.min(...allCoordinates.map(c => c.lat)),
      Math.max(...allCoordinates.map(c => c.lng))
    );
    
    // Zoom to show all points with some padding
    map.getViewModel().setLookAtData({
      bounds: bounds
    }, true);
  }
}

/**
 * Adds custom numbered markers for all tour stops
 */
function addTourStopMarkers() {
  tourStops.forEach((stop, index) => {
    let icon;
    
    if (index === 0) {
      // Start marker (green) - larger
      icon = new H.map.Icon(
        '<svg width="36" height="36" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="18" cy="18" r="16" fill="#10b981" stroke="white" stroke-width="3"/>' +
        '<text x="18" y="25" font-size="14" text-anchor="middle" fill="white" font-weight="bold">START</text>' +
        '</svg>',
        { anchor: { x: 18, y: 18 } }
      );
    } else if (index === tourStops.length - 1) {
      // End marker (red) - larger
      icon = new H.map.Icon(
        '<svg width="36" height="36" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="18" cy="18" r="16" fill="#ef4444" stroke="white" stroke-width="3"/>' +
        '<text x="18" y="25" font-size="14" text-anchor="middle" fill="white" font-weight="bold">END</text>' +
        '</svg>',
        { anchor: { x: 18, y: 18 } }
      );
    } else {
      // Numbered stop markers (blue) - larger with numbers
      const label = stop.label;
      const fontSize = label.length > 2 ? '11' : '13';
      
      icon = new H.map.Icon(
        '<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="16" cy="16" r="14" fill="#3b82f6" stroke="white" stroke-width="3"/>' +
        '<text x="16" y="22" font-size="' + fontSize + '" text-anchor="middle" fill="white" font-weight="bold">' + label + '</text>' +
        '</svg>',
        { anchor: { x: 16, y: 16 } }
      );
    }

    const marker = new H.map.Marker(
      { lat: stop.lat, lng: stop.lng },
      { icon: icon }
    );
    
    marker.setData(stop.name);
    
    marker.addEventListener('tap', (evt) => {
      openBubble(evt.target.getGeometry(), evt.target.getData());
    });

    map.addObject(marker);
  });
}

/**
 * Creates a series of H.map.Marker points for maneuvers and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addManueversToMap(route) {
  const svgMarkup =
      '<svg width="18" height="18" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="8" cy="8" r="8" fill="#1b468d" stroke="white" stroke-width="1"/>' +
      '</svg>',
    dotIcon = new H.map.Icon(svgMarkup, { anchor: { x: 8, y: 8 } }),
    group = new H.map.Group();

  route.sections.forEach((section) => {
    const poly = H.geo.LineString.fromFlexiblePolyline(
      section.polyline
    ).getLatLngAltArray();

    const actions = section.actions;
    // Add a marker for each maneuver
    for (let i = 0; i < actions.length; i += 1) {
      const action = actions[i];
      const marker = new H.map.Marker(
        {
          lat: poly[action.offset * 3],
          lng: poly[action.offset * 3 + 1],
        },
        { icon: dotIcon }
      );
      marker.instruction = action.instruction;
      group.addObject(marker);
    }
  });

  group.addEventListener(
    "tap",
    (evt) => {
      map.setCenter(evt.target.getGeometry());
      openBubble(evt.target.getGeometry(), evt.target.instruction);
    },
    false
  );

  // Add the maneuvers group to the map
  map.addObject(group);
}

/**
 * Adds tour stops list to the panel
 */
function addTourStopsToPanel() {
  const stopsDiv = document.createElement("div");
  stopsDiv.style.marginLeft = "5%";
  stopsDiv.style.marginRight = "5%";
  stopsDiv.style.marginBottom = "15px";
  stopsDiv.style.padding = "10px";
  stopsDiv.style.backgroundColor = "#f9fafb";
  stopsDiv.style.borderRadius = "5px";
  stopsDiv.style.border = "1px solid #e5e7eb";
  
  const title = document.createElement("h4");
  title.style.marginTop = "0";
  title.style.marginBottom = "10px";
  title.style.color = "#1f2937";
  title.textContent = "Tour Stops";
  stopsDiv.appendChild(title);
  
  const stopsList = document.createElement("ol");
  stopsList.style.margin = "0";
  stopsList.style.padding = "0 0 0 20px";
  stopsList.style.fontSize = "small";
  stopsList.style.listStyle = "none";
  
  tourStops.forEach((stop, index) => {
    const li = document.createElement("li");
    li.style.padding = "6px 0";
    li.style.borderBottom = "1px solid #e5e7eb";
    
    const label = document.createElement("span");
    label.style.display = "inline-block";
    label.style.minWidth = "35px";
    label.style.fontWeight = "bold";
    label.style.color = index === 0 ? "#10b981" : index === tourStops.length - 1 ? "#ef4444" : "#3b82f6";
    label.textContent = `${stop.label}.`;
    
    const name = document.createElement("span");
    name.textContent = ` ${stop.name.replace(/^\d+[ab]?\.\s*/, "").replace(/^(START|END)\s*-\s*/, "")}`;
    
    li.appendChild(label);
    li.appendChild(name);
    stopsList.appendChild(li);
  });
  
  const lastLi = stopsList.lastChild;
  if (lastLi) lastLi.style.borderBottom = "none";
  
  stopsDiv.appendChild(stopsList);
  routeInstructionsContainer.appendChild(stopsDiv);
}

/**
 * Adds route summary to the panel
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addSummaryToPanel(route) {
  let duration = 0,
    distance = 0;

  route.sections.forEach((section) => {
    distance += section.travelSummary.length;
    duration += section.travelSummary.duration;
  });

  const summaryDiv = document.createElement("div");
  summaryDiv.style.fontSize = "small";
  summaryDiv.style.marginLeft = "5%";
  summaryDiv.style.marginRight = "5%";
  summaryDiv.style.marginBottom = "15px";
  summaryDiv.style.padding = "10px";
  summaryDiv.style.backgroundColor = "#f0f0f0";
  summaryDiv.style.borderRadius = "5px";
  
  const distanceMiles = (distance * 0.000621371).toFixed(2);
  const durationMin = Math.floor(duration / 60);
  const durationSec = duration % 60;
  
  summaryDiv.innerHTML = `
    <h3 style="margin-top: 0;">Charles Dickens Walking Tour</h3>
    <b>Total distance:</b> ${distanceMiles} miles<br/>
    <b>Walking time:</b> ${durationMin} minutes ${durationSec} seconds<br/>
    <b>Number of stops:</b> ${tourStops.length}
    <br/><br/>
    <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; justify-content: center;">
      <button onclick="window.print()" style="flex: 0 1 auto; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; white-space: nowrap;">
        🖨️ Print Directions
      </button>
      <a href="route-info.html" style="flex: 0 1 auto; display: inline-block; padding: 8px 16px; background: #10b981; color: white; text-decoration: none; border-radius: 4px; font-size: 14px; white-space: nowrap;">
        📖 Detailed Guide
      </a>
    </div>
  `;

  routeInstructionsContainer.appendChild(summaryDiv);
}

/**
 * Adds maneuver instructions to the panel
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addManueversToPanel(route) {
  const headerDiv = document.createElement("div");
  headerDiv.style.marginLeft = "5%";
  headerDiv.style.marginRight = "5%";
  headerDiv.style.marginTop = "15px";
  headerDiv.style.marginBottom = "10px";
  
  const header = document.createElement("h4");
  header.style.margin = "0";
  header.style.color = "#1f2937";
  header.textContent = "Turn-by-Turn Directions";
  headerDiv.appendChild(header);
  
  routeInstructionsContainer.appendChild(headerDiv);
  
  const nodeOL = document.createElement("ol");
  nodeOL.style.fontSize = "small";
  nodeOL.style.marginLeft = "5%";
  nodeOL.style.marginRight = "5%";
  nodeOL.className = "directions";

  let waypointIndex = 1; // Start at 1 to skip the origin point
  let isFirstInstruction = true;

  route.sections.forEach((section) => {
    section.actions.forEach((action) => {
      const li = document.createElement("li");
      const spanArrow = document.createElement("span");
      const spanInstruction = document.createElement("span");

      spanArrow.className = `arrow ${action.direction || ""}${action.action}`;
      
      // Check if this is an arrival action
      if (action.action === "arrive") {
        li.className = "arrival-point";
        
        // Add the stop label and name (skip the START point)
        if (waypointIndex < tourStops.length) {
          const stop = tourStops[waypointIndex];
          const stopLabel = document.createElement("div");
          stopLabel.className = "stop-label";
          stopLabel.innerHTML = `<strong>${stop.label}. ${stop.name.replace(/^\d+[ab]?\.\s*/, "").replace(/^(START|END)\s*-\s*/, "")}</strong>`;
          spanInstruction.innerHTML = `${stopLabel.outerHTML}<br>${action.instruction}`;
          waypointIndex++;
        } else {
          spanInstruction.innerHTML = action.instruction;
        }
      } else {
        // For the very first instruction (depart), add START info
        if (isFirstInstruction && action.action === "depart") {
          const startInfo = document.createElement("div");
          startInfo.style.fontWeight = "bold";
          startInfo.style.color = "#10b981";
          startInfo.style.marginBottom = "4px";
          startInfo.innerHTML = `START: ${tourStops[0].name.replace(/^START\s*-\s*/, "")}`;
          spanInstruction.innerHTML = startInfo.outerHTML + action.instruction;
          isFirstInstruction = false;
        } else {
          spanInstruction.innerHTML = action.instruction;
        }
      }
      
      li.appendChild(spanArrow);
      li.appendChild(spanInstruction);

      nodeOL.appendChild(li);
    });
  });

  routeInstructionsContainer.appendChild(nodeOL);
}

/**
 * Calculates and displays a walking route through all Dickens tour stops
 * @param {H.service.Platform} platform A stub class to access HERE services
 */
function calculateDickensRoute(platform) {
  const router = platform.getRoutingService(null, 8);
  
  // Build the route request with origin, destination, and via waypoints
  const origin = `${tourStops[0].lat},${tourStops[0].lng}`;
  const destination = `${tourStops[tourStops.length - 1].lat},${tourStops[tourStops.length - 1].lng}`;
  
  // Create via parameter for intermediate stops
  const viaWaypoints = tourStops
    .slice(1, -1)  // Exclude first and last
    .map(stop => `${stop.lat},${stop.lng}`);

  const routeRequestParams = {
    routingMode: "fast",
    transportMode: "pedestrian",
    origin: origin,
    destination: destination,
    via: new H.service.Url.MultiValueQueryParameter(viaWaypoints),
    return: "polyline,turnByTurnActions,actions,instructions,travelSummary",
  };

  router.calculateRoute(routeRequestParams, onSuccess, onError);
}

/**
 * This function will be called once the Routing REST API provides a response
 * @param {Object} result A JSON object representing the calculated route
 */
function onSuccess(result) {
  const route = result.routes[0];

  addRouteShapeToMap(route);
  addTourStopMarkers();
  addManueversToMap(route);
  addSummaryToPanel(route);
  addTourStopsToPanel();
  addManueversToPanel(route);

  // Add the "Locate Me" button to the map
  addLocateMeButton();

  // Ensure map resizes properly after all content is loaded (especially important on mobile)
  setTimeout(() => {
    map.getViewPort().resize();
  }, 100);
}

/**
 * This function will be called if a communication error occurs
 * @param {Object} error The error message received
 */
function onError(error) {
  alert(`Route calculation failed: ${error.message}`);
  console.error(error);
}

// Initialize the route calculation
calculateDickensRoute(platform);