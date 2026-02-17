from crewai import Task
from textwrap import dedent

class TravelTasks:
    def research_task(self, agent):
        return Task(
            description=dedent("""
                基于用户已选择的景点清单，为每个景点补全必要细节，用于行程规划。

                **已选景点:**
                {selected_locations}

                **要求:**
                1. 仅使用已选景点，不新增景点。
                2. 为每个景点补全经纬度、建议停留时长（小时）与简要亮点描述。
                3. 如果信息不完整，给出合理估计并保持一致性。
            """),
            expected_output="A list of selected attractions with their coordinates (lat/lng), recommended visit duration (hours), and a brief highlight.",
            agent=agent
        )

    def planning_task(self, agent, context_tasks):
        return Task(
            description=dedent("""
                基于调研结果与用户偏好，生成 {days} 天游玩行程，仅包含用户已选择的景点。
                
                **用户偏好:**
                - Budget: {budget}
                - Interests: {interests}
                - Transportation: {transport}
                - Dining Preferences: {dining_prefs}
                - Accommodation Preferences: {accommodation_prefs}
                - Selected Locations: {selected_locations}
                - Start Date: {start_date}
                - End Date: {end_date}

                **指引:**
                1. 使用 `route_optimizer` 工具对景点顺序进行优化，减少移动距离。
                2. 行程需符合日期与天数限制，避免走回头路。
                3. 结合餐饮偏好安排午餐与晚餐，并体现交通方式。
                4. 每个活动/停留点提供简短描述与 AI 建议（例如“上午游览更舒适”）。
                5. 不新增未被选择的景点或活动。

                **输出格式:**
                必须返回严格有效的 JSON 对象（不能包含 Markdown 或代码块），结构如下:
                {
                    "tripTitle": "3 Days in {city}",
                    "dateDisplay": "Oct 12 - Oct 14", 
                    "dayHeader": "Day 1",
                    "daySubHeader": "Theme of the day",
                    "dateShort": "OCT 12",
                    "mapPins": [
                        { "id": 1, "name": "Location Name", "lat": 39.9, "lng": 116.4, "active": false }
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
                如有需要可为 mapPins 提供 top/left 百分比，否则仅返回经纬度。
            """),
            expected_output="A strictly valid JSON object containing the full itinerary details.",
            agent=agent,
            context=context_tasks
        )
