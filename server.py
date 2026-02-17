import os
import re
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

deepseek_key = os.getenv("DEEPSEEK_API_KEY")
deepseek_base = os.getenv("DEEPSEEK_API_BASE")

if deepseek_key:
    os.environ["OPENAI_API_KEY"] = deepseek_key

if not deepseek_base and deepseek_key:
    deepseek_base = "https://api.deepseek.com/v1"

if deepseek_base and not deepseek_base.endswith("/v1"):
    deepseek_base = f"{deepseek_base}/v1"

if deepseek_base:
    os.environ["OPENAI_API_BASE"] = deepseek_base
    os.environ["OPENAI_BASE_URL"] = deepseek_base

storage_dir = os.getenv("CREWAI_STORAGE_DIR", os.path.join("/tmp", "crewai_storage"))
os.makedirs(storage_dir, exist_ok=True)
os.environ["CREWAI_STORAGE_DIR"] = storage_dir
os.environ.setdefault("CREWAI_STORAGE_PATH", storage_dir)

app = FastAPI(title="TravelAI API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---

class TripLocation(BaseModel):
    id: str
    name: str
    country: str
    province: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    image: Optional[str] = None
    rating: float
    tags: List[str]
    daysRecommended: int

class SearchSuggestion(BaseModel):
    name: str
    district: str
    adcode: str

# --- Helper Functions ---

def resolve_adcode(api_key: str, query: str) -> Optional[str]:
    """
    Resolve a city name/query to an adcode using AMap InputTips.
    """
    url = "https://restapi.amap.com/v3/assistant/inputtips"
    params = {
        "key": api_key,
        "keywords": query,
        "datatype": "all"
    }
    try:
        response = requests.get(url, params=params)
        data = response.json()
        if data["status"] == "1" and "tips" in data:
            for tip in data["tips"]:
                 # Return the first adcode found
                 if tip.get("adcode"):
                     return tip.get("adcode")
    except Exception as e:
        print(f"Error resolving adcode: {e}")
    return None

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to TravelAI API"}

@app.get("/api/search-suggestions", response_model=List[SearchSuggestion])
def search_suggestions(query: str):
    """
    Get search suggestions using AMap InputTips API.
    """
    api_key = os.getenv("AMAP_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AMAP_KEY not configured")
    
    url = "https://restapi.amap.com/v3/assistant/inputtips"
    params = {
        "key": api_key,
        "keywords": query,
        "datatype": "all",  # Return all types of POIs
        "types": "110000|110100|110200|140000|140100|140200|190000" # Scenic, Park, Museum, Place Name
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        suggestions = []
        if data["status"] == "1" and "tips" in data:
            for tip in data["tips"]:
                # Filter out empty names or non-existent locations
                if not tip.get("id") or not tip.get("location"):
                    continue
                    
                suggestions.append(SearchSuggestion(
                    name=tip.get("name"),
                    district=tip.get("district", ""),
                    adcode=tip.get("adcode", "")
                ))
        return suggestions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/recommend-locations", response_model=dict)
def recommend_locations(city: str, tags: Optional[str] = None):
    """
    Get recommended locations (POIs) based on city and tags.
    Calls AMap Place API.
    Returns { "locations": [...], "tag_counts": { "Nature": 5, ... } }
    """
    api_key = os.getenv("AMAP_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AMAP_KEY not configured")

    # If city is not numeric (adcode), try to resolve it
    if not city.isdigit():
        resolved_adcode = resolve_adcode(api_key, city)
        if resolved_adcode:
            city = resolved_adcode

    # 1. First, fetch ALL relevant POIs for the city to calculate tag counts globally for this city
    # We'll use a broad search first
    base_keywords = "景点"
    base_types = "110000|110100|140000|060100|190000"
    
    url = "https://restapi.amap.com/v3/place/text"
    params = {
        "key": api_key,
        "keywords": base_keywords,
        "city": city,
        "types": base_types,
        "citylimit": "true",
        "extensions": "all",
        "offset": 50, # Fetch more for better counts
        "page": 1
    }

    all_locations = []
    tag_counts = {
        "Nature": 0,
        "Historical": 0,
        "City Break": 0,
        "Coastal": 0,
        "Sightseeing": 0
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        if data["status"] == "1" and "pois" in data:
            for poi in data["pois"]:
                name = poi.get("name", "")
                poi_type = poi.get("type", "")
                raw_image_url = ""
                if poi.get("photos") and len(poi["photos"]) > 0:
                    raw_image_url = poi["photos"][0].get("url", "")
                lower_name = name.strip()
                entrance_markers = ["入口", "出入口", "正门", "侧门", "大门", "东门", "西门", "南门", "北门", "停车场入口", "景区入口"]
                is_entrance_name = any(marker in lower_name for marker in entrance_markers)
                ends_with_gate = lower_name.endswith(("入口", "出入口", "正门", "侧门", "大门", "东门", "西门", "南门", "北门"))
                bracket_gate = bool(re.search(r"[（(].*(入口|出入口|正门|侧门|大门|[东南西北]门).*[)）]", lower_name))
                type_has_gate = "出入口" in poi_type or "门" in poi_type
                if (is_entrance_name or ends_with_gate or bracket_gate or type_has_gate) and not raw_image_url:
                    continue

                # Map AMap POI to TripLocation
                image_url = raw_image_url
                if not image_url:
                    image_url = "https://via.placeholder.com/400x300?text=No+Image"

                rating = 4.5
                biz_ext = poi.get("biz_ext", {})
                if isinstance(biz_ext, dict):
                    r_str = biz_ext.get("rating")
                    if r_str and isinstance(r_str, str):
                        try:
                            rating = float(r_str)
                        except:
                            pass
                
                # Derive tags
                derived_tags = []
                
                is_nature = "公园" in poi_type or "植物园" in poi_type or "山" in name
                is_history = "博物馆" in poi_type or "古迹" in poi_type or "寺" in name
                is_city = "步行街" in poi_type or "广场" in poi_type or "商场" in poi_type or "商业" in poi_type
                is_coastal = "海滨" in poi_type or "浴场" in poi_type or "岛" in name
                is_sightseeing = "风景" in poi_type or "景点" in poi_type

                if is_nature: derived_tags.append("Nature"); tag_counts["Nature"] += 1
                if is_history: derived_tags.append("Historical"); tag_counts["Historical"] += 1
                if is_city: derived_tags.append("City Break"); tag_counts["City Break"] += 1
                if is_coastal: derived_tags.append("Coastal"); tag_counts["Coastal"] += 1
                if is_sightseeing: derived_tags.append("Sightseeing"); tag_counts["Sightseeing"] += 1
                
                if not derived_tags:
                    derived_tags = ["General"]

                loc = TripLocation(
                    id=poi.get("id"),
                    name=poi.get("name"),
                    country="China",
                    province=poi.get("pname"),
                    city=poi.get("cityname"),
                    district=poi.get("adname"),
                    image=image_url,
                    rating=rating,
                    tags=derived_tags,
                    daysRecommended=1
                )
                all_locations.append(loc)

        # 2. Filter locations based on requested tags
        filtered_locations = []
        if tags and tags != "All":
            requested_tags = tags.split(",")
            for loc in all_locations:
                # Check if location has ANY of the requested tags
                if any(t in requested_tags for t in loc.tags):
                    filtered_locations.append(loc)
        else:
            filtered_locations = all_locations

        return {
            "locations": filtered_locations,
            "tag_counts": tag_counts
        }

    except Exception as e:
        print(f"Error fetching POIs: {e}")
        return {"locations": [], "tag_counts": {}}

@app.get("/api/static-map")
def static_map(center: str, zoom: int = 11, size: str = "1024*768", markers: Optional[str] = None):
    api_key = os.getenv("AMAP_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AMAP_KEY not configured")
    params = {
        "key": api_key,
        "center": center,
        "zoom": zoom,
        "size": size
    }
    if markers:
        params["markers"] = markers
    try:
        response = requests.get("https://restapi.amap.com/v3/staticmap", params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="AMAP static map error")
        content_type = response.headers.get("Content-Type", "image/png")
        return Response(content=response.content, media_type=content_type)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from crewai import Crew, Process
from agents import TravelAgents
from tasks import TravelTasks
import json

class TripPreferences(BaseModel):
    city: str
    days: int
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    selected_locations: List[TripLocation]
    budget: List[int]
    interests: List[str] = []
    transport: Optional[str] = None
    dining_prefs: List[str] = []
    accommodation_prefs: List[str] = []

@app.post("/api/generate-itinerary")
def generate_itinerary(prefs: TripPreferences):
    """
    Generate itinerary using CrewAI based on preferences.
    """
    try:
        # Instantiate Agents & Tasks
        agents = TravelAgents()
        tasks = TravelTasks()

        researcher = agents.destination_researcher()
        planner = agents.itinerary_planner()

        # Context inputs for Tasks
        # Convert selected locations to string for prompt
        loc_str = ", ".join([l.name for l in prefs.selected_locations])
        
        inputs = {
            'city': prefs.city,
            'days': prefs.days,
            'start_date': prefs.start_date or "",
            'end_date': prefs.end_date or "",
            'budget': f"{prefs.budget[0]}-{prefs.budget[1]} CNY",
            'interests': ", ".join(prefs.interests),
            'transport': prefs.transport or "",
            'dining_prefs': ", ".join(prefs.dining_prefs),
            'accommodation_prefs': ", ".join(prefs.accommodation_prefs),
            'selected_locations': loc_str
        }

        # Note: We might skip research_task if we already have selected locations?
        # But 'planning_task' expects context from 'research_task' in original design.
        # Let's keep it but maybe simplify research prompt if needed, 
        # or just let researcher find details about the SELECTED locations.
        
        # Original research task was: "Search 10 attractions..."
        # We should modify research task to: "Get details for these SPECIFIC selected locations"
        # For now, let's reuse existing structure but inject our selected locations into the prompt if possible.
        # Actually, let's just pass inputs to kickoff.

        research_task = tasks.research_task(researcher)
        planning_task = tasks.planning_task(planner, [research_task])

        crew = Crew(
            agents=[researcher, planner],
            tasks=[research_task, planning_task],
            process=Process.sequential,
            verbose=True
        )

        result = crew.kickoff(inputs=inputs)
        
        # Result is usually a string (TaskOutput).
        # We instructed Agent to output JSON.
        # Try to parse it.
        
        try:
            # Clean potential markdown fences
            raw_output = str(result)
            if "```json" in raw_output:
                raw_output = raw_output.split("```json")[1].split("```")[0]
            elif "```" in raw_output:
                raw_output = raw_output.split("```")[1].split("```")[0]
            
            json_output = json.loads(raw_output.strip())
            return json_output
        except Exception as e:
            print(f"JSON Parse Error: {e}")
            # Fallback or error
            raise HTTPException(status_code=500, detail="AI failed to generate valid JSON itinerary.")

    except Exception as e:
        print(f"Crew Execution Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Use reload=True for development
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
