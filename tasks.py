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
                1. 使用已选景点的基础上，如果有多余空闲时间，可以新增景点。
                2. 为每个景点补全经纬度、建议停留时长（小时）与简要亮点描述。
                3. 如果信息不完整，给出合理估计并保持一致性。
            """),
            expected_output="A list of selected attractions with their coordinates (lat/lng), recommended visit duration (hours), and a brief highlight.",
            agent=agent
        )

    def planning_task(self, agent, context_tasks):
        return Task(
            description=dedent("""
                基于调研结果与用户偏好，生成 {days} 天游玩行程，考虑用户已选择的景点与多余空闲时间。
                
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
                3. 若 Dining Preferences 或 Accommodation Preferences 包含限制或关键词，必须按限制输出对应餐食与住宿建议。
                4. 若未提供相关限制或为空，则提供交通便利的餐饮聚集区与住宿聚集区建议，并说明适宜位置与通达性。
                5. 结合餐饮偏好安排午餐与晚餐，并体现交通方式。
                6. 每个活动/停留点提供简短描述与 AI 建议（例如“上午游览更舒适”）。
                7. 可在多余空闲时间新增景点或活动，但必须显式标注为新增内容。
                8. 必须覆盖所有 Selected Locations：每个景点必须出现在某一天的 mapPins 中且只出现一次（除非用户明确重复），并标注 isExtra 为 false。
                9. 所有新增景点或活动必须标注 isExtra 为 true，并在 timeline 与 mapPins 中保持一致。
                10. mapPins 必须按实际游玩时间顺序排列，并为每个地点提供全局顺序号 `seq`（从 1 开始，跨天连续递增），用于地图标注数字。
                11. **预算规划**:
                    - 必须根据 `{budget}` (e.g. Low, Medium, High, or specific amount) 估算每项活动的费用。
                    - 考虑季节性（如旺季价格上浮）和周末（周五-周日）价格上浮因素。
                    - 若调用 `amap_poi_search` 获取到 `cost` 信息，请参考该价格；否则根据经验估算。
                    - 在输出中明确每一步的预计花费。
                12. **交通规划**:
                    - 必须使用 `{transport}` 作为主要交通方式（若为空或未指定，默认使用 'transit'）。
                    - 使用 `distance_calculator` 工具计算相邻活动/景点间的交通时间、距离与费用。
                    - 在 timeline 中显式添加交通事件（"type": "travel"），位于两个活动之间。
                    - 交通事件的 `description` 应包含具体的路线信息（如“地铁2号线 -> 5路公交”）。
                    - 确保行程安排的时间流包含交通耗时。
                13. **总花费计算**:
                    - 必须计算整个行程的 `totalEstimatedCost`，它是所有活动费用与交通费用的总和。
                    - 确保此数值包含在返回的 JSON 根对象中。

                **输出格式:**
                必须返回严格有效的 JSON 对象（不能包含 Markdown 或代码块），结构如下:
                {
                    "tripTitle": "3 Days in {city}",
                    "dateDisplay": "Oct 12 - Oct 14",
                    "budgetRange": { "min": 1000, "max": 3000, "currency": "¥" },
                    "totalEstimatedCost": 1250,
                    "days": [
                        {
                            "dayHeader": "Day 1",
                            "daySubHeader": "Theme of the day",
                            "dateShort": "OCT 12",
                            "mapPins": [
                                {
                                  "seq": 1,
                                  "id": 1,
                                  "name": "Location Name",
                                  "lat": 39.9,
                                  "lng": 116.4,
                                  "active": false,
                                  "isExtra": false,
                                  "stopNumber": "Stop #1",
                                  "title": "Location Name",
                                  "duration": "2h",
                                  "description": "Short description...",
                                  "aiStrategy": "AI tip...",
                                  "estimatedCost": 50,
                                  "costDescription": "Ticket: ¥50"
                                }
                            ],
                            "timeline": [
                                {
                                    "time": "09:00 AM",
                                    "title": "Activity Title",
                                    "description": "Description...",
                                    "isExtra": false,
                                    "tags": [{ "label": "Sightseeing", "color": "blue" }],
                                    "estimatedCost": 50,
                                    "type": "activity"
                                },
                                {
                                    "time": "11:00 AM",
                                    "title": "Travel to Next Location",
                                    "description": "Taxi / Subway Line 1...",
                                    "isExtra": false,
                                    "tags": [{ "label": "Travel", "color": "gray" }],
                                    "estimatedCost": 20,
                                    "type": "travel",
                                    "travelDetails": {
                                        "mode": "transit",
                                        "duration": "30 min",
                                        "distance": "5.2 km",
                                        "originId": 1,
                                        "destinationId": 2
                                    }
                                }
                            ]
                        }
                    ]
                }
                必须输出与 {days} 相同数量的 day 对象，按日期顺序排列。
                如有需要可为 mapPins 提供 top/left 百分比，否则仅返回经纬度。
            """),
            expected_output="A strictly valid JSON object containing the full multi-day itinerary details.",
            agent=agent,
            context=context_tasks
        )
