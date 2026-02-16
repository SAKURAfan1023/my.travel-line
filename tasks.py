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
                基于任务一的景点列表，考虑地理分布，生成一份 Markdown 格式的详细 {days} 天行程单。
                Use the `route_optimizer` tool to reorder the attractions for minimal travel distance.
                Ensure the itinerary is logical and efficient (no backtracking).
            """),
            expected_output="A detailed day-by-day itinerary in Markdown format with optimized routes.",
            agent=agent,
            context=context_tasks
        )
