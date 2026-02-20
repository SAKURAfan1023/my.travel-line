from crewai import Agent
from langchain_openai import ChatOpenAI
from tools.map_tools import MapTools
from crewai_tools import SerperDevTool
import os

class TravelAgents:
    def __init__(self):
        api_key = os.getenv("DEEPSEEK_API_KEY")
        base_url = os.getenv("DEEPSEEK_API_BASE")
        model = os.getenv("LLM_MODEL") or "deepseek-chat"
        
        if not base_url and api_key:
            base_url = "https://api.deepseek.com/v1"
        if base_url and not base_url.endswith("/v1"):
            base_url = f"{base_url}/v1"
            
        self.llm = ChatOpenAI(
            model=model,
            temperature=0.7,
            api_key=api_key,
            base_url=base_url
        )
        # Initialize SerperDevTool
        self.serper_tool = SerperDevTool()

    def destination_researcher(self):
        return Agent(
            role='资深旅游数据分析师',
            goal='针对用户输入的城市，挖掘出最具代表性且符合偏好的景点、美食及实时天气信息',
            backstory='你拥有超过10年的全球旅游规划经验，擅长从海量信息中提取精准的 POI 数据。',
            tools=[self.serper_tool, MapTools.search_places],
            verbose=True,
            llm=self.llm,
            allow_delegation=False
        )

    def itinerary_planner(self):
        return Agent(
            role='逻辑严密的行程架构师',
            goal='将调研员提供的景点串联成一条逻辑合理、不走回头路的每日行程',
            backstory='你是空间规划专家，擅长平衡交通时间、游览时长和用户体力。',
            tools=[MapTools.calculate_travel_time, MapTools.optimize_route, MapTools.search_places],
            verbose=True,
            llm=self.llm,
            allow_delegation=False
        )
