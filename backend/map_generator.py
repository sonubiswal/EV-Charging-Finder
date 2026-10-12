import csv
import folium
import requests
from geopy.geocoders import Nominatim
from geopy.distance import geodesic

filename = 'data/ev-charging-stations-india.csv'


def find_nearest_station(user_location, stations):
    """Return the closest station and its distance from user_location."""
    nearest_station = None
    min_distance = float('inf')
    for station in stations:
        try:
            station_location = (float(station['lattitude']), float(station['longitude']))
            distance = geodesic(user_location, station_location).kilometers
            if distance < min_distance:
                min_distance = distance
                nearest_station = station
        except (ValueError, KeyError):
            continue
    return nearest_station, min_distance


def get_coordinates_from_place(place_name):
    """Geocode a place name into (lat, lon) using Nominatim."""
    geolocator = Nominatim(user_agent="ev-charging-stations-locator")
    location = geolocator.geocode(place_name)
    if location:
        return location.latitude, location.longitude
    return None


def get_route(user_location, station_location):
    """Fetch a driving route between two points via the OSRM public API."""
    osrm_url = "http://router.project-osrm.org/route/v1/driving/"
    coordinates = f"{user_location[1]},{user_location[0]};{station_location[1]},{station_location[0]}"
    try:
        response = requests.get(
            f"{osrm_url}{coordinates}?overview=full&geometries=geojson",
            timeout=15,
        )
        if response.status_code == 200:
            route = response.json()['routes'][0]['geometry']['coordinates']
            return [(coord[1], coord[0]) for coord in route]
    except requests.RequestException:
        pass
    return None


def create_map_with_route(filename):
    place_name = input("Enter your location (city, road, or place name): ")
    user_coords = get_coordinates_from_place(place_name)
    if not user_coords:
        print("Location not found.")
        return

    user_lat, user_lon = user_coords

    with open(filename, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        stations = [
            row for row in reader
            if row.get('lattitude') and row.get('longitude')
        ]

    if not stations:
        print("No stations found.")
        return

    user_location = (user_lat, user_lon)
    nearest_station, distance = find_nearest_station(user_location, stations)

    if not nearest_station:
        print("No nearest station found.")
        return

    station_location = (float(nearest_station['lattitude']), float(nearest_station['longitude']))
    station_name = nearest_station.get('address', 'Unknown Address')
    route = get_route(user_location, station_location)

    # --- FIXED: use OpenTopoMap tiles to avoid OSM 403 blocking ---
    my_map = folium.Map(
        location=[user_lat, user_lon],
        zoom_start=6,
        tiles='OpenTopoMap',
        attr=(
            'Map data: &copy; '
            '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, '
            '<a href="http://viewfinderpanoramas.org">SRTM</a> | '
            'Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> '
            '(<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        ),
    )

    folium.Marker(
        location=user_location,
        popup=f"<b>You:</b> {place_name}",
        tooltip="Your location",
        icon=folium.Icon(color="blue", icon="person", prefix='fa'),
    ).add_to(my_map)

    folium.Marker(
        location=station_location,
        popup=f"<b>{station_name}</b><br/>Distance: {distance:.2f} km",
        tooltip="Nearest EV station",
        icon=folium.Icon(color="green", icon="bolt", prefix='fa'),
    ).add_to(my_map)

    if route:
        folium.PolyLine(
            route,
            color="blue",
            weight=4,
            opacity=0.8,
            tooltip=f"Driving route · {distance:.2f} km",
        ).add_to(my_map)

    # Fit the map to show both markers
    my_map.fit_bounds([user_location, station_location])

    output = "nearest_ev_charging_station_map_with_route.html"
    my_map.save(output)
    print(f"Map saved as '{output}'.")
    print(f"Nearest station: {station_name}")
    print(f"Distance: {distance:.2f} km")


if __name__ == "__main__":
    create_map_with_route(filename)