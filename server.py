import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

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
    image: Optional[str] = None
    rating: float
    tags: List[str]
    daysRecommended: int

class SearchSuggestion(BaseModel):
    name: str
    district: str
    adcode: str

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

@app.get("/api/recommend-locations", response_model=List[TripLocation])
def recommend_locations(city: str, tags: Optional[str] = None):
    """
    Get recommended locations (POIs) based on city and tags.
    Calls AMap Place API.
    """
    api_key = os.getenv("AMAP_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AMAP_KEY not configured")

    # Map frontend tags to AMap POI types or keywords
    # 110000: Scenic Spot
    # 110100: Park
    # 140000: Culture/Museum
    # 190000: Place Name
    keywords = "景点"
    types = "110000|110100|140000"
    
    if tags:
        tag_list = tags.split(",")
        if "Nature" in tag_list:
            types += "|110100|110200" # Park, Botanical Garden
        if "Historical" in tag_list:
            types += "|140000" # Museum/Culture
        if "City Break" in tag_list:
             types += "|050000|060000" # Dining, Shopping
        if "Coastal" in tag_list:
            keywords += "|海滨|沙滩"

    url = "https://restapi.amap.com/v3/place/text"
    params = {
        "key": api_key,
        "keywords": keywords,
        "city": city,
        "types": types,
        "citylimit": "true",
        "extensions": "all",
        "offset": 20,
        "page": 1
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        recommendations = []
        if data["status"] == "1" and "pois" in data:
            for poi in data["pois"]:
                # Map AMap POI to TripLocation
                # Image: AMap POI photos are lists of objects.
                image_url = ""
                if poi.get("photos") and len(poi["photos"]) > 0:
                    image_url = poi["photos"][0].get("url", "")
                
                # If no image, use a placeholder or leave empty to let frontend handle
                if not image_url:
                    image_url = "https://via.placeholder.com/400x300?text=No+Image"

                # Rating: AMap returns string or list, handle safely
                rating = 4.5 # Default
                biz_ext = poi.get("biz_ext", {})
                if isinstance(biz_ext, dict):
                    r_str = biz_ext.get("rating")
                    if r_str and isinstance(r_str, str):
                        try:
                            rating = float(r_str)
                        except:
                            pass
                
                # Tags: Derive from type
                poi_type = poi.get("type", "")
                derived_tags = []
                if "风景" in poi_type or "景点" in poi_type: derived_tags.append("Sightseeing")
                if "公园" in poi_type: derived_tags.append("Nature")
                if "博物馆" in poi_type or "古迹" in poi_type: derived_tags.append("History")
                
                if not derived_tags:
                    derived_tags = ["General"]

                recommendations.append(TripLocation(
                    id=poi.get("id"),
                    name=poi.get("name"),
                    country="China", # AMap mostly China
                    image=image_url,
                    rating=rating,
                    tags=derived_tags,
                    daysRecommended=1 # Default
                ))
        return recommendations
    except Exception as e:
        print(f"Error fetching POIs: {e}")
        # Return empty list or mock data on error? For now empty.
        return []

from crewai import Crew, Process
from agents import TravelAgents
from tasks import TravelTasks
import json

class TripPreferences(BaseModel):
    city: str
    days: int
    selected_locations: List[TripLocation]
    budget: List[int] # [min, max]
    interests: List[str]
    transport: str
    dining_prefs: List[str]

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
            'budget': f"{prefs.budget[0]}-{prefs.budget[1]} CNY",
            'interests': ", ".join(prefs.interests),
            'transport': prefs.transport,
            'dining_prefs': ", ".join(prefs.dining_prefs),
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
    uvicorn.run(app, host="0.0.0.0", port=8000)
