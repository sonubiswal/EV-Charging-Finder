document.addEventListener('DOMContentLoaded', function() {
    // Initialize map centered on a default location
    const map = L.map('map').setView([24.0470619,78.0748019], 5);
    
    // Add the OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© PlugIn@24*7'
    }).addTo(map);

    // Initialize markers and routing control
    let userMarker;
    let stationMarkers = [];
    let routingControl;
    let selectedStationId = null;
    
    // Create custom EV station icon
    const evStationIcon = L.divIcon({
        className: 'custom-ev-icon',
        html: `
            <div class="ev-station-marker">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4CAF50" width="24" height="24">
                    <path d="M7,2H17A2,2 0 0,1 19,4V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V4A2,2 0 0,1 7,2M7,4V20H17V4H7M8,6H16V10H8V6M8,12H10V14H8V12M12,12H16V14H12V12M8,16H10V18H8V16M12,16H16V18H12V16Z" />
                </svg>
                <div class="pulse"></div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });

    // Create custom user location icon
    const userIcon = L.divIcon({
        className: 'custom-user-icon',
        html: `
            <div class="user-location-marker">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2196F3" width="24" height="24">
                    <path d="M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z" />
                    <circle cx="12" cy="9" r="3" fill="white" />
                </svg>
                <div class="pulse-blue"></div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });

    // Function to get user's current location
    document.getElementById('get-location').addEventListener('click', function() {
        const loadingElement = document.getElementById('loading');
        const errorMessageElement = document.getElementById('error-message');
        
        // Show loading indicator
        loadingElement.style.display = 'block';
        errorMessageElement.style.display = 'none';
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    
                    // Update map view
                    map.setView([latitude, longitude], 13);
                    
                    // Add user marker
                    if (userMarker) {
                        map.removeLayer(userMarker);
                    }
                    userMarker = L.marker([latitude, longitude], {
                        icon: userIcon
                    }).addTo(map);
                    userMarker.bindPopup("You are here").openPopup();
                    
                    // Get nearby charging stations
                    findNearbyChargingStations(latitude, longitude);
                },
                function(error) {
                    // Hide loading indicator
                    loadingElement.style.display = 'none';
                    
                    // Show error message
                    errorMessageElement.style.display = 'block';
                    console.error("Error getting location:", error);
                }
            );
        } else {
            // Hide loading indicator
            loadingElement.style.display = 'none';
            
            // Show error message
            errorMessageElement.style.display = 'block';
            console.error("Geolocation is not supported by this browser.");
        }
    });

    // Search location by address
    document.getElementById('search-location').addEventListener('click', function() {
        const address = document.getElementById('address-input').value;
        if (address.trim() === '') {
            alert("Please enter an address to search");
            return;
        }
        
        geocodeAddress(address);
    });

    // Also trigger search on Enter key in the input field
    document.getElementById('address-input').addEventListener('keyup', function(event) {
        if (event.key === "Enter") {
            document.getElementById('search-location').click();
        }
    });

    // Function to geocode an address
    function geocodeAddress(address) {
        const loadingElement = document.getElementById('loading');
        const errorMessageElement = document.getElementById('error-message');
        
        // Show loading indicator
        loadingElement.style.display = 'block';
        errorMessageElement.style.display = 'none';
        
        // Using Nominatim for geocoding
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const latitude = parseFloat(data[0].lat);
                    const longitude = parseFloat(data[0].lon);
                    
                    // Update map view
                    map.setView([latitude, longitude], 13);
                    
                    // Add user marker
                    if (userMarker) {
                        map.removeLayer(userMarker);
                    }
                    userMarker = L.marker([latitude, longitude], {
                        icon: userIcon
                    }).addTo(map);
                    userMarker.bindPopup("Searched location").openPopup();
                    
                    // Get nearby charging stations
                    findNearbyChargingStations(latitude, longitude);
                } else {
                    // Hide loading indicator
                    loadingElement.style.display = 'none';
                    
                    // Show error message
                    alert("Location not found. Please try a different address.");
                }
            })
            .catch(error => {
                // Hide loading indicator
                loadingElement.style.display = 'none';
                
                // Show error message
                errorMessageElement.style.display = 'block';
                console.error("Error geocoding address:", error);
            });
    }

    // Function to find nearby charging stations
    function findNearbyChargingStations(latitude, longitude) {
        const loadingElement = document.getElementById('loading');
        const radius = document.getElementById('radius-selector').value;
        
        // Clear existing station markers
        stationMarkers.forEach(marker => {
            map.removeLayer(marker);
        });
        stationMarkers = [];
        
        // Clear routing if exists
        if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
        }
        
        // Using the Overpass API to find EV charging stations
        const query = `
            [out:json];
            (
              node["amenity"="charging_station"](around:${radius * 1000},${latitude},${longitude});
              way["amenity"="charging_station"](around:${radius * 1000},${latitude},${longitude});
              relation["amenity"="charging_station"](around:${radius * 1000},${latitude},${longitude});
            );
            out center;
        `;
        
        fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query
        })
        .then(response => response.json())
        .then(data => {
            // Hide loading indicator
            loadingElement.style.display = 'none';
            
            if (data && data.elements && data.elements.length > 0) {
                // Process and display the charging stations
                displayChargingStations(data.elements, {lat: latitude, lng: longitude});
            } else {
                document.getElementById('stations-container').innerHTML = 
                    '<p>No charging stations found in this area. Try increasing the search radius.</p>';
            }
        })
        .catch(error => {
            // Hide loading indicator
            loadingElement.style.display = 'none';
            
            // Show error in stations container
            document.getElementById('stations-container').innerHTML = 
                '<p>Error finding charging stations. Please try again later.</p>';
            console.error("Error finding charging stations:", error);
        });
    }

    // Function to display charging stations on map and in list
    function displayChargingStations(stations, userLocation) {
        const stationsContainer = document.getElementById('stations-container');
        stationsContainer.innerHTML = '';
        
        if (stations.length === 0) {
            stationsContainer.innerHTML = '<p>No charging stations found in this area.</p>';
            return;
        }
        
        // Calculate distances and sort by distance
        const stationsWithDistance = stations.map(station => {
            let stationLat, stationLon;
            
            if (station.type === 'node') {
                stationLat = station.lat;
                stationLon = station.lon;
            } else if (station.center) {
                stationLat = station.center.lat;
                stationLon = station.center.lon;
            }
            
            if (stationLat && stationLon) {
                const distance = calculateDistance(
                    userLocation.lat, userLocation.lng,
                    stationLat, stationLon
                );
                
                return {
                    ...station,
                    distance: distance,
                    lat: stationLat,
                    lon: stationLon
                };
            }
            return null;
        }).filter(station => station !== null);
        
        stationsWithDistance.sort((a, b) => a.distance - b.distance);
        
        // Display stations on map and in list
        stationsWithDistance.forEach((station, index) => {
            const stationId = `station-${index}`;
            const stationName = station.tags?.name || 'Unnamed Charging Station';
            const stationOperator = station.tags?.operator || 'Unknown Operator';
            const distanceFormatted = formatDistance(station.distance);
            
            // Add marker to map
            const marker = L.marker([station.lat, station.lon], {
                icon: evStationIcon
            }).addTo(map);
            
            marker.bindPopup(`
                <strong>${stationName}</strong><br>
                Operator: ${stationOperator}<br>
                Distance: ${distanceFormatted}<br>
                <button class="popup-directions-btn" data-station-id="${stationId}">Get Directions</button>
            `);
            
            marker.stationId = stationId;
            marker.stationData = station;
            stationMarkers.push(marker);
            
            // Listen for click on the marker
            marker.on('click', function() {
                if (selectedStationId === this.stationId) {
                    // If this station is already selected, just open the popup
                    this.openPopup();
                } else {
                    // Otherwise highlight the listing and open the popup
                    highlightStationInList(this.stationId);
                    this.openPopup();
                }
            });
            
            // Add to list
            const stationElement = document.createElement('div');
            stationElement.className = 'station-item';
            stationElement.id = stationId;
            stationElement.innerHTML = `
                <div class="station-info">
                    <h3>${stationName}</h3>
                    <p class="station-distance">${distanceFormatted}</p>
                    <p>Operator: ${stationOperator}</p>
                </div>
                <div class="station-actions">
                    <button class="get-directions-btn" data-station-id="${stationId}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <polyline points="15 6 21 12 15 18"></polyline>
                        </svg>
                        Get Directions
                    </button>
                </div>
            `;
            
            stationsContainer.appendChild(stationElement);
            
            // Store station data for later use
            stationElement.stationData = station;
        });
        
        // Add event listeners to the "Get Directions" buttons in the list
        document.querySelectorAll('.get-directions-btn').forEach(button => {
            button.addEventListener('click', function() {
                const stationId = this.getAttribute('data-station-id');
                const stationElement = document.getElementById(stationId);
                const stationData = stationElement.stationData;
                
                createRoute(userLocation, {lat: stationData.lat, lng: stationData.lon}, stationData);
                highlightStationInList(stationId);
            });
        });
        
        // Add event listeners to the popup buttons after they're created
        map.on('popupopen', function(e) {
            const popupDirectionsBtn = document.querySelector('.popup-directions-btn');
            if (popupDirectionsBtn) {
                popupDirectionsBtn.addEventListener('click', function() {
                    const stationId = this.getAttribute('data-station-id');
                    const marker = stationMarkers.find(m => m.stationId === stationId);
                    if (marker && marker.stationData) {
                        createRoute(
                            userLocation, 
                            {lat: marker.stationData.lat, lng: marker.stationData.lon}, 
                            marker.stationData
                        );
                        highlightStationInList(stationId);
                    }
                });
            }
        });
    }

    // Function to highlight a station in the list
    function highlightStationInList(stationId) {
        // Remove highlight from all stations
        document.querySelectorAll('.station-item').forEach(item => {
            item.style.backgroundColor = '';
        });
        
        // Add highlight to selected station
        const selectedStation = document.getElementById(stationId);
        if (selectedStation) {
            selectedStation.style.backgroundColor = '#f0f7ff';
            selectedStation.scrollIntoView({behavior: 'smooth', block: 'center'});
            selectedStationId = stationId;
        }
    }

    // Function to create a route between user location and a charging station
    function createRoute(from, to, stationData) {
        // Clear previous route if it exists
        if (routingControl) {
            map.removeControl(routingControl);
        }
        
        // Show loading state in directions panel
        const directionsPanel = document.getElementById('directions-panel');
        directionsPanel.innerHTML = `
            <div class="close-directions">×</div>
            <div class="directions-content">
                <div class="directions-loading">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#2196F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 6v6l4 2"></path>
                    </svg>
                    <p>Calculating best route...</p>
                </div>
            </div>
        `;
        directionsPanel.style.display = 'block';
        directionsPanel.classList.add('active');
        
        // Create new route with enhanced styling
        routingControl = L.Routing.control({
            waypoints: [
                L.latLng(from.lat, from.lng),
                L.latLng(to.lat, to.lng)
            ],
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1',
                profile: 'driving',
                useHints: false
            }),
            routeWhileDragging: false,
            showAlternatives: true,
            altLineOptions: {
                styles: [
                    {color: '#7986CB', weight: 4, opacity: 0.6},
                    {color: 'white', weight: 2, opacity: 0.3, dashArray: '5,5'}
                ]
            },
            fitSelectedRoutes: true,
            show: false, // Don't show the default routing panel
            lineOptions: {
                styles: [
                    {color: '#2196F3', weight: 6, opacity: 0.9},
                    {color: 'white', weight: 2, opacity: 0.7, dashArray: '10,10'}
                ],
                extendToWaypoints: true,
                missingRouteTolerance: 0
            },
            createMarker: function() {
                return null; // Don't create markers, we already have them
            },
            addWaypoints: false
        }).addTo(map);
        
        // Add event listener to close button
        document.querySelector('.close-directions').addEventListener('click', function() {
            directionsPanel.style.display = 'none';
            directionsPanel.classList.remove('active');
            if (routingControl) {
                map.removeControl(routingControl);
                routingControl = null;
            }
        });
        
        // When the route is found, display directions
        routingControl.on('routesfound', function(e) {
            const routes = e.routes;
            const directionsContent = document.querySelector('.directions-content');
            
            if (routes.length > 0) {
                const route = routes[0];
                const stationName = stationData.tags?.name || 'Unnamed Charging Station';
                const distance = formatDistance(route.summary.totalDistance / 1000);
                const duration = formatDuration(route.summary.totalTime);
                
                let directionsHTML = `
                    <div class="directions-header">
                        <h3>Directions to ${stationName}</h3>
                        <div class="directions-summary">
                            <span><strong>Distance:</strong> ${distance}</span>
                            <span><strong>Duration:</strong> ${duration}</span>
                        </div>
                    </div>
                    <div class="directions-instructions">
                `;
                
                route.instructions.forEach((instruction, idx) => {
                    const iconClass = getDirectionIcon(instruction.type);
                    const distance = instruction.distance > 0 ? `<div class="step-distance">${formatDistance(instruction.distance / 1000)}</div>` : '';
                    
                    directionsHTML += `
                        <div class="instruction-step">
                            <div class="step-icon">${iconClass}</div>
                            <div class="step-details">
                                <div class="step-text">${instruction.text}</div>
                                ${distance}
                            </div>
                        </div>
                    `;
                });
                
                directionsHTML += `
                    </div>
                    <div class="route-options">
                        <button id="toggle-directions-view" class="toggle-view-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="9" y1="3" x2="9" y2="21"></line>
                            </svg>
                            Toggle View
                        </button>
                    </div>
                `;
                directionsContent.innerHTML = directionsHTML;
                
                // Add toggle view functionality
                document.getElementById('toggle-directions-view').addEventListener('click', function() {
                    const mapContainer = document.querySelector('.map-container');
                    mapContainer.classList.toggle('directions-expanded');
                    
                    if (mapContainer.classList.contains('directions-expanded')) {
                        this.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="15" y1="3" x2="15" y2="21"></line>
                            </svg>
                            Map View
                        `;
                    } else {
                        this.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="9" y1="3" x2="9" y2="21"></line>
                            </svg>
                            Toggle View
                        `;
                    }
                    
                    // Trigger a resize event to update the map
                    window.dispatchEvent(new Event('resize'));
                });
                
                // Adjust map for mobile
                if (window.innerWidth <= 1024) {
                    // Wait a moment for the directions to render
                    setTimeout(() => {
                        window.scrollTo({
                            top: directionsPanel.offsetTop - 20,
                            behavior: 'smooth'
                        });
                    }, 300);
                }
            }
        });
    }

    // Helper function to get direction icon based on instruction type
    function getDirectionIcon(type) {
        switch (type) {
            case 'Straight':
                return '↑';
            case 'SlightRight':
                return '↗';
            case 'Right':
                return '→';
            case 'SharpRight':
                return '↘';
            case 'SharpLeft':
                return '↙';
            case 'Left':
                return '←';
            case 'SlightLeft':
                return '↖';
            case 'WaypointReached':
                return '🏁';
            case 'Roundabout':
                return '⟳';
            case 'DestinationReached':
                return '🏁';
            default:
                return '•';
        }
    }

    // Helper function to calculate distance between two points
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distance in km
    }

    // Helper function to format distance
    function formatDistance(distance) {
        if (distance < 1) {
            return `${Math.round(distance * 1000)} m`;
        } else {
            return `${distance.toFixed(1)} km`;
        }
    }

    // Helper function to format duration
    function formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours} hr ${minutes} min`;
        } else {
            return `${minutes} min`;
        }
    }

    // Handle responsive layout changes
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 1024) {
            // For mobile/tablet views
            const directionsPanel = document.getElementById('directions-panel');
            if (directionsPanel.style.display === 'block') {
                // Adjust map height to make room for directions panel
                document.getElementById('map').style.height = '350px';
            }
        } else {
            // For desktop views
            document.getElementById('map').style.height = '100%';
        }
    });
});
