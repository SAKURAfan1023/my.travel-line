from crewai import Task
from textwrap import dedent

class TravelTasks:
    def research_task(self, agent):
        return Task(
            description=dedent("""
                搜索并筛选出 {city} 适合 {days} 日游的 10 个核心景点，包含经纬度和推荐游玩时间。
            """),
            expected_output="A list of 10 key attractions with their coordinates (lat/lon) and recommended visit duration.",
            agent=agent
        )

    def planning_task(self, agent, context_tasks):
        return Task(
            description=dedent("""
                Based on the provided list of attractions and user preferences, generate a detailed {days}-day itinerary.
                
                **User Preferences:**
                - Budget: {budget}
                - Interests: {interests}
                - Transportation: {transport}
                - Dining Preferences: {dining_prefs}
                - Selected Locations: {selected_locations}

                **Instructions:**
                1. Use the `route_optimizer` tool to reorder the attractions for minimal travel distance.
                2. Ensure the itinerary is logical and efficient (no backtracking).
                3. Allocate time for lunch and dinner based on dining preferences.
                4. For each activity/stop, provide a brief description and an AI-generated strategy (e.g., "Best visited in the morning").

                **Output Format:**
                You MUST return a strictly valid JSON object (NO Markdown, NO code blocks) matching the following structure:
                {
                    "tripTitle": "3 Days in {city}",
                    "dateDisplay": "Oct 12 - Oct 14", 
                    "dayHeader": "Day 1",
                    "daySubHeader": "Theme of the day",
                    "dateShort": "OCT 12",
                    "mapPins": [
                        { "id": 1, "name": "Location Name", "lat": 39.9, "lon": 116.4, "active": false }
                    ],
                    "mapOverlay": {
                        "stopNumber": "Stop #1",
                        "title": "Highlight Location",
                        "duration": "2h",
                        "description": "Short description...",
                        "aiStrategy": "AI tip..."
                    },
                    "timeline": [
                        {
                            "time": "09:00 AM",
                            "title": "Activity Title",
                            "description": "Description...",
                            "tags": [{ "label": "Sightseeing", "color": "blue" }]
                        }
                    ]
                }
                *Note: For mapPins, calculate 'top' and 'left' percentage based on relative position if possible, otherwise just return lat/lon and frontend will handle it.*
            """),
            expected_output="A strictly valid JSON object containing the full itinerary details.",
            agent=agent,
            context=context_tasks
        )
