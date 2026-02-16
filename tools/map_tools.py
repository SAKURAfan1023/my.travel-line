import os
import requests
from crewai.tools import tool
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

class MapTools:
    @staticmethod
    def _get_coordinates(address):
        """Helper to convert address to coordinates using Gaode Geocoding API"""
        api_key = os.getenv("AMAP_KEY")
        if not api_key:
            return None
        
        url = "https://restapi.amap.com/v3/geocode/geo"
        params = {
            "address": address,
            "key": api_key
        }
        try:
            response = requests.get(url, params=params)
            data = response.json()
            if data["status"] == "1" and data["geocodes"]:
                return data["geocodes"][0]["location"] # Returns "lon,lat"
            return None
        except:
            return None

    @tool("distance_calculator")
    def calculate_travel_time(origin: str, destination: str) -> str:
        """
        根据两个点的坐标，调用地图 API 计算真实的通勤时间。
        Args:
            origin (str): Starting point address.
            destination (str): End point address.
        Returns:
            str: Travel duration and distance.
        """
        api_key = os.getenv("AMAP_KEY")
        if not api_key:
            return "Error: AMAP_KEY not found in .env"

        # 1. Get Coordinates for Origin and Destination
        origin_coords = MapTools._get_coordinates(origin)
        dest_coords = MapTools._get_coordinates(destination)

        if not origin_coords or not dest_coords:
            return f"Error: Could not find coordinates for {origin} or {destination}."

        # 2. Call Direction API (Driving as default)
        base_url = "https://restapi.amap.com/v3/direction/driving"
        
        params = {
            "origin": origin_coords,
            "destination": dest_coords,
            "key": api_key,
            "extensions": "base"
        }
        
        try:
            response = requests.get(base_url, params=params)
            data = response.json()
            
            if data["status"] == "1" and data["route"]["paths"]:
                path = data["route"]["paths"][0]
                distance_meters = int(path["distance"])
                duration_seconds = int(path["duration"])
                
                distance_km = distance_meters / 1000
                duration_min = duration_seconds // 60
                
                return f"{origin} 到 {destination} 预计开车 {duration_min} 分钟 ({distance_km:.1f} km)"
            else:
                return f"No routes found between {origin} and {destination}. (API Info: {data.get('info')})"
        except Exception as e:
            return f"Error calculating travel time: {str(e)}"

    @tool("amap_poi_search")
    def search_places(query: str, city: str = "西安") -> str:
        """
        Search for places (attractions, restaurants, etc.) using Gaode Map (AMap) API.
        Args:
            query (str): Search keywords (e.g., "景点", "美食").
            city (str): City name to search in.
        Returns:
            str: A list of found places with their names, addresses, and coordinates.
        """
        api_key = os.getenv("AMAP_KEY")
        if not api_key:
            return "Error: AMAP_KEY not found in .env"

        url = "https://restapi.amap.com/v3/place/text"
        params = {
            "key": api_key,
            "keywords": query,
            "city": city,
            "citylimit": "true",
            "offset": 10,
            "page": 1,
            "extensions": "all"
        }
        
        try:
            response = requests.get(url, params=params)
            data = response.json()
            
            if data["status"] == "1" and data["pois"]:
                results = []
                for poi in data["pois"]:
                    name = poi.get("name")
                    address = poi.get("address")
                    location = poi.get("location")
                    biz_ext = poi.get("biz_ext", {})
                    rating = biz_ext.get("rating", "N/A")
                    results.append(f"- {name} (Rating: {rating}): {address} [Coords: {location}]")
                return "\n".join(results)
            else:
                return f"No places found for '{query}' in {city}."
        except Exception as e:
            return f"Error searching places: {str(e)}"

    @tool("route_optimizer")
    def optimize_route(origin: str, destinations: str) -> str:
        """
        Optimize the route visiting a list of destinations starting from an origin using TSP solver.
        Args:
            origin (str): The starting point (e.g., "Hotel").
            destinations (str): A comma-separated list of destination names (e.g., "Place A, Place B, Place C").
        Returns:
            str: The optimized sequence of visiting the destinations.
        """
        api_key = os.getenv("AMAP_KEY")
        if not api_key:
            return "Error: AMAP_KEY not found in .env"

        # 1. Parse destinations
        dest_list = [d.strip() for d in destinations.split(",") if d.strip()]
        if not dest_list:
            return "Error: No destinations provided."

        # 2. Get Coordinates for all points
        points = [origin] + dest_list
        coords = []
        valid_points = []
        
        for point in points:
            coord = MapTools._get_coordinates(point)
            if coord:
                coords.append(coord)
                valid_points.append(point)
            else:
                print(f"Warning: Could not find coordinates for {point}, skipping.")

        if len(coords) < 2:
            return "Error: Not enough valid coordinates found to optimize route."

        # 3. Build Distance Matrix using AMap Distance API
        # AMap Distance API supports calculating distance from one origin to multiple destinations.
        # We need an N x N matrix.
        # Since N is small (usually < 15 for a day trip), we can make N requests.
        
        n = len(coords)
        distance_matrix = [[0] * n for _ in range(n)]
        
        base_url = "https://restapi.amap.com/v3/distance"
        
        try:
            for i in range(n):
                # Origin: coords[i]
                # Destinations: all coords
                # Format: lon,lat|lon,lat|...
                dest_str = "|".join(coords)
                
                params = {
                    "origins": coords[i],
                    "destination": dest_str, # Wait, AMap distance API: origins supports multiple, destination supports ONE.
                    # Correct usage: origins=lon1,lat1|lon2,lat2... destination=lon,lat
                    # So to get row i (distances FROM i TO all others), we actually need to call it differently or reverse logic?
                    # "distance" API computes distance from origins to destination.
                    # To get distance FROM i TO all j:
                    # We can set origins = all_coords, destination = coords[i]. This gives distance FROM all j TO i.
                    # Assuming symmetric (mostly true for approximation), but for directed graph we want FROM i TO j.
                    # So we should loop over destinations j, setting them as single 'destination', and 'origins' as all points?
                    # No, that gives dist(all -> j). We want row i: dist(i -> all).
                    # AMap API: origins (multi), destination (single).
                    # Returns: distance from each origin to the destination.
                    # So one call with destination=j gives column j (dist(0->j), dist(1->j)...).
                    # We can loop j from 0 to n-1.
                    "key": api_key,
                    "type": "1" # 1: driving, 0: straight line
                }
                
                # Let's re-read AMap docs logic or assume standard Driving API.
                # Actually, standard Direction API is too heavy for Matrix.
                # Distance API is lightweight.
                # Let's use the loop: For each column j (destination), call API with all rows i (origins).
                pass

            # Correct Loop for AMap Distance API (One destination, multiple origins)
            # We want matrix[i][j] = distance(i -> j)
            # API call with destination=coords[j] and origins=all_coords returns [dist(0->j), dist(1->j), ...]
            
            for j in range(n):
                origins_str = "|".join(coords)
                params = {
                    "origins": origins_str,
                    "destination": coords[j],
                    "type": "1", # Driving
                    "key": api_key
                }
                response = requests.get(base_url, params=params)
                data = response.json()
                
                if data["status"] == "1" and "results" in data:
                    results = data["results"]
                    for i, res in enumerate(results):
                        distance_matrix[i][j] = int(res["distance"])
                else:
                    # Fallback to rough estimate if API fails? Or just return error.
                    # For robustness, maybe fallback to Manhattan distance on coords?
                    # Let's assume API works for now.
                    return f"Error fetching distance matrix: {data.get('info')}"
                    
        except Exception as e:
            return f"Error building distance matrix: {str(e)}"

        # 4. Solve TSP using OR-Tools
        def create_data_model():
            data = {}
            data['distance_matrix'] = distance_matrix
            data['num_vehicles'] = 1
            data['depot'] = 0 # Start at origin (index 0)
            return data

        data = create_data_model()
        manager = pywrapcp.RoutingIndexManager(len(data['distance_matrix']),
                                               data['num_vehicles'], data['depot'])
        routing = pywrapcp.RoutingModel(manager)

        def distance_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return data['distance_matrix'][from_node][to_node]

        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)

        solution = routing.SolveWithParameters(search_parameters)

        # 5. Format Output
        if solution:
            index = routing.Start(0)
            route = []
            route_distance = 0
            while not routing.IsEnd(index):
                node_index = manager.IndexToNode(index)
                route.append(valid_points[node_index])
                previous_index = index
                index = solution.Value(routing.NextVar(index))
                route_distance += routing.GetArcCostForVehicle(previous_index, index, 0)
            
            # Add return to depot if closed loop, but usually for itinerary we might just want the path.
            # TSP implies closed loop. If user wants open path, we need to change dummy depot.
            # Assuming closed loop for "Traveling Salesman".
            # If the user implies "start at hotel, go places, come back", it's a loop.
            # If "start at hotel, end at last attraction", that's different.
            # User prompt says "closed loop path" (闭环路径).
            
            node_index = manager.IndexToNode(index)
            route.append(valid_points[node_index]) # Should be origin again
            
            return f"Optimized Route: {' -> '.join(route)}\nTotal Distance: {route_distance} meters"
        else:
            return "No solution found."
